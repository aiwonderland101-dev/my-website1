/**
 * PlayCanvas Bridge Script
 * 
 * This script should be injected into the PlayCanvas editor iframe
 * It handles:
 * 1. Real-time entity change detection
 * 2. Posting changes to parent window (code editor)
 * 3. Receiving commands from parent (asset injection, etc)
 * 4. Scene snapshot generation
 * 
 * Usage: Add this as a global script in PlayCanvas project settings
 */

(function initPlayCanvasBridge() {
  if (window.playcanasBridgeInitialized) return
  window.playcanasBridgeInitialized = true

  let syncConfig = {
    syncAttributes: [
      'localPosition',
      'localRotation',
      'localScale',
      'name',
    ],
    debounceMs: 100,
  }

  let debounceTimers = new Map()
  let app = null

  // Wait for PlayCanvas app to initialize
  function getApp() {
    if (window.pc && window.pc.app) {
      return window.pc.app
    }
    if (app) {
      return app
    }
    // Try to find app in common locations
    const scripts = document.querySelectorAll('script')
    for (const script of scripts) {
      if (script.textContent && script.textContent.includes('new pc.Application')) {
        // App will be set globally
        break
      }
    }
    return null
  }

  /**
   * Attach listeners to entity and all children
   */
  function attachEntityListeners(entity) {
    if (!entity) return

    // Create debounced sender for this entity
    const sendChange = (attribute, value) => {
      const key = `${entity.guid}-${attribute}`

      // Clear existing timer
      if (debounceTimers.has(key)) {
        clearTimeout(debounceTimers.get(key))
      }

      // Set new timer
      const timer = setTimeout(() => {
        window.parent.postMessage(
          {
            type: 'SYNC_TO_CODE',
            id: entity.guid,
            name: entity.name,
            data: {
              [attribute]: value,
            },
          },
          '*'
        )
        debounceTimers.delete(key)
      }, syncConfig.debounceMs)

      debounceTimers.set(key, timer)
    }

    // Listen for attribute changes
    for (const attr of syncConfig.syncAttributes) {
      if (entity[attr] !== undefined) {
        // Initial value
        const initialValue = entity[attr]

        // Create getter/setter
        Object.defineProperty(entity, `_${attr}`, {
          writable: true,
          value: initialValue,
        })

        Object.defineProperty(entity, attr, {
          get() {
            return this[`_${attr}`]
          },
          set(value) {
            const oldValue = this[`_${attr}`]
            if (oldValue !== value) {
              this[`_${attr}`] = value
              sendChange(attr, value)
            }
          },
        })
      }
    }

    // Recursively attach to children
    if (entity.children) {
      for (const child of entity.children) {
        attachEntityListeners(child)
      }
    }
  }

  /**
   * Send current scene snapshot
   */
  function sendSceneSnapshot() {
    const app = getApp()
    if (!app || !app.root) return

    const entities = []

    function traverseEntity(entity, parent = null) {
      entities.push({
        id: entity.guid,
        name: entity.name,
        parentId: parent?.guid,
        position: entity.localPosition?.clone() || { x: 0, y: 0, z: 0 },
        rotation: entity.localRotation?.clone() || { x: 0, y: 0, z: 0 },
        scale: entity.localScale?.clone() || { x: 1, y: 1, z: 1 },
        visible: entity.enabled,
      })

      if (entity.children) {
        for (const child of entity.children) {
          traverseEntity(child, entity)
        }
      }
    }

    traverseEntity(app.root)

    window.parent.postMessage(
      {
        type: 'SCENE_SNAPSHOT',
        scene: { entities },
      },
      '*'
    )
  }

  /**
   * Refresh assets panel when new assets are injected
   */
  function refreshAssetsPanel() {
    // Force re-render of assets panel if using PlayCanvas Cloud Editor
    if (window.pc && window.pc.Assets) {
      // Trigger asset panel refresh
      console.log('[PlayCanvas Bridge] Assets panel refresh triggered')
    }
  }

  /**
   * Listen for messages from parent window (code editor)
   */
  window.addEventListener('message', (event) => {
    if (!event.data.type) return

    switch (event.data.type) {
      case 'SETUP_SYNC_LISTENER': {
        // Configure sync settings
        syncConfig = { ...syncConfig, ...event.data.config }

        // Attach listeners to all entities
        const app = getApp()
        if (app && app.root) {
          attachEntityListeners(app.root)
          sendSceneSnapshot()
          console.log(
            '[PlayCanvas Bridge] Sync listeners attached to',
            syncConfig.syncAttributes
          )
        } else {
          // Retry after app initialization
          setTimeout(() => {
            const retryApp = getApp()
            if (retryApp && retryApp.root) {
              attachEntityListeners(retryApp.root)
              sendSceneSnapshot()
            }
          }, 1000)
        }
        break
      }

      case 'REFRESH_ASSETS': {
        refreshAssetsPanel()
        break
      }

      case 'INJECT_ASSET': {
        // Create asset in scene
        const { name, type, url } = event.data
        console.log('[PlayCanvas Bridge] Injecting asset:', name)

        // This would depend on PlayCanvas SDK
        // Example for GLB import:
        if (type === 'model' && url) {
          const app = getApp()
          if (app) {
            // Use PlayCanvas loader
            console.log('[PlayCanvas Bridge] Asset load initiated:', url)
          }
        }
        break
      }

      case 'SET_ENTITY_PROPERTY': {
        // Remote property setting from code editor
        const { entityId, property, value } = event.data
        const app = getApp()

        if (app) {
          const entity = app.root.findByGuid(entityId)
          if (entity && entity[property] !== undefined) {
            entity[property] = value
            console.log(
              '[PlayCanvas Bridge] Entity property updated:',
              entityId,
              property,
              value
            )
          }
        }
        break
      }

      case 'REQUEST_SCENE_SNAPSHOT': {
        sendSceneSnapshot()
        break
      }
    }
  })

  // Send scene snapshot on app start
  const checkAppInterval = setInterval(() => {
    const app = getApp()
    if (app && app.root) {
      clearInterval(checkAppInterval)
      attachEntityListeners(app.root)
      sendSceneSnapshot()
      console.log('[PlayCanvas Bridge] Initialized')
    }
  }, 300)

  // Periodic snapshot updates (every 5 seconds)
  setInterval(() => {
    sendSceneSnapshot()
  }, 5000)
})()
