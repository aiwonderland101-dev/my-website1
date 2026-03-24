import { describe, it, expect, beforeEach } from 'vitest'
import { CollaborationEngine } from '../../apps/web/lib/collaboration/realtime'

describe('Collaboration', () => {
  it('syncs cursor positions', async () => {
    const user1 = new CollaborationEngine('project-1', 'user-1')
    const user2 = new CollaborationEngine('project-1', 'user-2')
    
    await user1.connect()
    await user2.connect()
    
    let receivedCursor: any = null
    user2.onCursorMove = (cursor) => { receivedCursor = cursor }
    
    user1.sendCursor(10, 5)
    
    await new Promise(r => setTimeout(r, 100))
    
    expect(receivedCursor).toEqual({ userId: 'user-1', line: 10, column: 5 })
  })
})
