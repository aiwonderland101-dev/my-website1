# AI Wonderland

AI Wonderland is a monorepo for a production-oriented SaaS platform focused on AI-assisted building workflows.

# engines & more
- Puck (Wonder-build)
- Theia Eclipse AI (WonderSpace)
- Play canvas (unreal-wonder-build)
- WebGLStudio.js
- Next.js
- Supabase
- Vercel
- Docker

## Project Structure

```
.
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── DEPLOYMENT.md
├── FAQ.md
├── LICENSE
├── README.md
├── SECURITY.md
├── STRUCTURE.txt
├── Wonder-build
│   └── puckAiBlueprint.ts
├── WonderSpace
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── ide
│   │   └── docker-compose.yml
│   ├── install.sh
│   ├── scripts
│   │   └── supabase_mount.mjs
│   ├── theia-app
│   │   ├── gen-webpack.config.js
│   │   ├── gen-webpack.node.config.js
│   │   ├── lib
│   │   │   ├── backend
│   │   │   └── frontend
│   │   ├── package.json
│   │   ├── plugins
│   │   ├── src
│   │   │   ├── browser
│   │   │   ├── common
│   │   │   └── node
│   │   ├── src-gen
│   │   │   ├── backend
│   │   │   └── frontend
│   │   ├── tsconfig.json
│   │   └── webpack.config.js
│   ├── verify_logic.js
│   └── workspace
├── apps
│   └── web
│       ├── BUILD_DEPLOYMENT_GUIDE.md
│       ├── ai-modules
│       │   ├── EgyptianModule.tsx
│       │   ├── EgyptianVoiceModule.tsx
│       │   ├── components
│       │   ├── lib
│       │   ├── page.tsx
│       │   ├── scene
│       │   ├── types.ts
│       │   └── utils.ts
│       ├── app
│       │   ├── (builder)
│       │   ├── (code-tools)
│       │   ├── (preview)
│       │   ├── (public)
│       │   ├── (published)
│       │   ├── (workspace)
│       │   ├── TriEngineShell.tsx
│       │   ├── ai-modules
│       │   ├── api
│       │   ├── api-reference
│       │   ├── auth
│       │   ├── builder
│       │   ├── builder-ai
│       │   ├── checkout
│       │   ├── community
│       │   ├── components
│       │   ├── connect-storage
│       │   ├── cookies
│       │   ├── docs
│       │   ├── editor-playcanvas-trust-layer.test.tsx
│       │   ├── globals.css
│       │   ├── homepage
│       │   ├── homepage-links.test.ts
│       │   ├── layout.tsx
│       │   ├── marketing-migration-checklist.md
│       │   ├── marketplace
│       │   ├── page.tsx
│       │   ├── play
│       │   ├── playcanvas-timeout-fallback.test.tsx
│       │   ├── public-pages
│       │   ├── settings
│       │   ├── status
│       │   ├── subscription
│       │   ├── support
│       │   ├── test-editor
│       │   ├── test-page
│       │   ├── tutorials
│       │   ├── utils
│       │   └── wonderspace
│       ├── components
│       │   ├── AccessibilityOracle.tsx
│       │   ├── AuthForm.tsx
│       │   ├── BYOC
│       │   ├── ClientAccessibilityWrapper.tsx
│       │   ├── Cloud3DViewer.tsx
│       │   ├── DirectPlayCanvasHost.tsx
│       │   ├── GlobalNavigation.tsx
│       │   ├── IframePlayCanvasHost.tsx
│       │   ├── LibraryGrid.tsx
│       │   ├── NpcPanel.tsx
│       │   ├── PlayCanvasBridge.tsx
│       │   ├── PlayCanvasEditorHost.test.tsx
│       │   ├── PlayCanvasEditorHost.tsx
│       │   ├── PlayCanvasPublisher.tsx
│       │   ├── QuadEngineShell.tsx
│       │   ├── Toast.tsx
│       │   ├── UnifiedPuckAIBuilder.tsx
│       │   ├── UnifiedWebGLStudioPlayCanvasEditor.tsx
│       │   ├── VisualTranscript.tsx
│       │   ├── WebGLStudioViewer.tsx
│       │   ├── blocks
│       │   ├── engines
│       │   ├── index.ts
│       │   ├── navigation
│       │   ├── puck.config.ts
│       │   └── ui
│       ├── components.json
│       ├── data
│       │   ├── ai
│       │   ├── cloud-connections.json
│       │   ├── templates
│       │   └── wonderspace-projects.json
│       ├── declarations.d.ts
│       ├── env.d.ts
│       ├── eslint.config.js
│       ├── lib
│       │   ├── accessibility-context.tsx
│       │   ├── ai
│       │   ├── aiNpcProvider.ts
│       │   ├── auth-context.tsx
│       │   ├── blockRegistry.ts
│       │   ├── byocSdk.ts
│       │   ├── collaboration
│       │   ├── crypto
│       │   ├── engines
│       │   ├── env.ts
│       │   ├── hooks
│       │   ├── logStreamer.ts
│       │   ├── logger.ts
│       │   ├── navigation.ts
│       │   ├── playcanvas.test.ts
│       │   ├── playcanvas.ts
│       │   ├── playcanvasBootstrap.test.ts
│       │   ├── playcanvasBootstrap.ts
│       │   ├── playcanvasBridgeProtocol.ts
│       │   ├── projects
│       │   ├── runners
│       │   ├── scene
│       │   ├── screen-reader.ts
│       │   ├── services
│       │   ├── smokeAuth.ts
│       │   ├── storage
│       │   ├── storage.ts
│       │   ├── supabase
│       │   ├── supabase-service.ts
│       │   ├── supabaseClient.ts
│       │   ├── supabaseServer.ts
│       │   ├── templates.ts
│       │   ├── theatreBridgeSetup.test.ts
│       │   ├── theatreBridgeSetup.ts
│       │   ├── utils.ts
│       │   ├── webcontainer.ts
│       │   ├── webhooks
│       │   ├── wonder-build
│       │   └── wonderspace
│       ├── logger.ts
│       ├── next-env.d.ts
│       ├── next.config.js
│       ├── package.json
│       ├── packages
│       │   └── ui
│       ├── postcss.config.js
│       ├── public
│       │   ├── Wonder-build
│       │   ├── images
│       │   ├── playcanvas
│       │   └── webglstudio
│       ├── scripts
│       │   ├── dev-port.mjs
│       │   └── run-dev.mjs
│       ├── services
│       │   └── storage
│       ├── styles
│       │   ├── tie-dye-neon.css
│       │   └── wonderland-core.css
│       ├── tailwind.config.ts
│       ├── tsconfig.builder.json
│       ├── tsconfig.builder.tsbuildinfo
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       └── types
│           ├── ai-confession.ts
│           ├── db.ts
│           └── playground.ts
├── attached_assets
│   ├── glb_bd1d3e59-047b-4a0a-a109-0ff0c38ad0c9_1774208056668.zip
│   ├── glb_bd1d3e59-047b-4a0a-a109-0ff0c38ad0c9_1774208108281.zip
│   └── glb_fbe51ae8-a91e-460f-b9b7-524d91d1e0be_1774208085494.zip
├── components.json
├── config
│   ├── README.md
│   └── ai
│       ├── CONSTITUTION.md
│       ├── README.md
│       ├── policy.json
│       └── wonderland-system-prompt.md
├── docs
│   ├── FREEDOM_CONTRACT.md
│   ├── UNIFIED_BUILDER_ARCHITECTURE.md
│   ├── UNIFIED_BUILDER_DOCUMENTATION_INDEX.md
│   ├── UNIFIED_BUILDER_IMPLEMENTATION_SUMMARY.md
│   ├── UNIFIED_BUILDER_QUICKSTART.md
│   ├── UNIFIED_BUILDER_TEST_GUIDE.md
│   ├── UNIFIED_BUILDER_WIRING.md
│   ├── WEBGLSTUDIO_PLAYCANVAS_INTEGRATION.md
│   ├── api
│   │   ├── assets
│   │   │   ├── hierarchy.js
│   │   │   ├── highlight.css
│   │   │   ├── icons.js
│   │   │   ├── icons.svg
│   │   │   ├── main.js
│   │   │   ├── navigation.js
│   │   │   ├── search.js
│   │   │   └── style.css
│   │   ├── classes
│   │   │   ├── engine_core_ide_applyArtifact.ArtifactManager.html
│   │   │   ├── engine_core_ide_codeScanner.CodeScanner.html
│   │   │   ├── engine_core_ide_filesystem.FileSystemManager.html
│   │   │   ├── engine_core_ide_persistence.PersistenceManager.html
│   │   │   ├── engine_core_playground_usage.UsageTracker.html
│   │   │   ├── engine_core_plugins_extensionManager.ExtensionManager.html
│   │   │   ├── engine_core_resources_throttling.ResourceMonitor.html
│   │   │   ├── engine_core_security_Sanitizer.SecurityCore.html
│   │   │   ├── infra_lib_agents.SpiritManager.html
│   │   │   ├── infra_lib_collaboration_inMemoryRealtime.InMemoryRealtimeChannel.html
│   │   │   ├── infra_lib_collaboration_inMemoryRealtime.InMemorySupabaseClient.html
│   │   │   ├── infra_lib_collaboration_realtime.CollaborationEngine.html
│   │   │   ├── infra_lib_marketplace-agent.MarketplaceAgent.html
│   │   │   ├── infra_lib_teams.TeamManager.html
│   │   │   ├── infra_lib_wonder-build_errors.AuthError.html
│   │   │   ├── infra_lib_wonder-build_errors.PaywallError.html
│   │   │   ├── infra_lib_wonder-build_errors.ServerError.html
│   │   │   ├── infra_services_integrations_github.GithubSync.html
│   │   │   ├── infra_services_marketplace_MarketplaceAgent.MarketplaceAgent.html
│   │   │   ├── infra_services_storage_CloudProvider.CloudStorage.html
│   │   │   └── infra_services_storage_MegaProvider.MegaProvider.html
│   │   ├── functions
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_ai_AIPanel.AIPanel.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_AndroidCanvas.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_IOSCanvas.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_MultiCanvas.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_WebCanvas.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_components_ComponentPalette.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_components_DraggableItem.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_context_BuilderContext.useBuilder.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_LayoutTree.createNode.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_LayoutTree.createRootNode.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_Canvas.Canvas.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_PanelLeft.PanelLeft.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_PanelRight.PanelRight.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_TemplateShowcase.TemplateShowcase.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_Topbar.Topbar.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useAutosave.useAutosave.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.randomId.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useDragDrop.useDragDrop.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_usePublish.usePublish.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_page.default.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.applyTheme.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.getGlow.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.getLuminance.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.hexToRgba.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.pickTextColor.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.sanitizeTheme.html
│   │   │   ├── apps_web_app_(preview)_preview__projectId__page.default.html
│   │   │   ├── apps_web_app_(published)_published__projectId___publishId___...path__route.GET.html
│   │   │   ├── apps_web_app_(tools)_playground_layout.default.html
│   │   │   ├── apps_web_app_(tools)_playground_page.default.html
│   │   │   ├── apps_web_app_(tools)_playground_ui_ModelExplorer.default.html
│   │   │   ├── apps_web_app_(workspace)_dashboard_components_APIKeyManager.default.html
│   │   │   ├── apps_web_app_(workspace)_dashboard_components_SSHKeyManager.default.html
│   │   │   ├── apps_web_app_(workspace)_dashboard_page.default.html
│   │   │   ├── apps_web_app_(workspace)_wonderspace_WonderSpace.default.html
│   │   │   ├── apps_web_app_(workspace)_wonderspace__projectId__page.default.html
│   │   │   ├── apps_web_app_(workspace)_wonderspace_page.default.html
│   │   │   ├── apps_web_app_about_page.default.html
│   │   │   ├── apps_web_app_ai-modules_page.default.html
│   │   │   ├── apps_web_app_api-reference_page.default.html
│   │   │   ├── apps_web_app_api_agent_route.POST.html
│   │   │   ├── apps_web_app_api_ai_auth.requirePaidAIUser.html
│   │   │   ├── apps_web_app_api_ai_chat_route.POST.html
│   │   │   ├── apps_web_app_api_ai_modules_route.GET.html
│   │   │   ├── apps_web_app_api_ai_verification_route.GET.html
│   │   │   ├── apps_web_app_api_ai_verification_route.POST.html
│   │   │   ├── apps_web_app_api_analytics_billing-usage_route.GET.html
│   │   │   ├── apps_web_app_api_analytics_performance_route.GET.html
│   │   │   ├── apps_web_app_api_analytics_track_route.POST.html
│   │   │   ├── apps_web_app_api_auth_logout_route.POST.html
│   │   │   ├── apps_web_app_api_auth_refresh_route.POST.html
│   │   │   ├── apps_web_app_api_auth_register_route.POST.html
│   │   │   ├── apps_web_app_api_auth_reset-password_route.POST.html
│   │   │   ├── apps_web_app_api_auth_reset-password_route.PUT.html
│   │   │   ├── apps_web_app_api_auth_session_route.GET.html
│   │   │   ├── apps_web_app_api_auth_verify-email_route.GET.html
│   │   │   ├── apps_web_app_api_auth_verify-email_route.POST.html
│   │   │   ├── apps_web_app_api_checkout_entitle_route.POST.html
│   │   │   ├── apps_web_app_api_collaboration_route.GET.html
│   │   │   ├── apps_web_app_api_collaboration_route.POST.html
│   │   │   ├── apps_web_app_api_domains_resolve_route.GET.html
│   │   │   ├── apps_web_app_api_extensions_route.DELETE.html
│   │   │   ├── apps_web_app_api_extensions_route.POST.html
│   │   │   ├── apps_web_app_api_extensions_validate_route.POST.html
│   │   │   ├── apps_web_app_api_github_route.POST.html
│   │   │   ├── apps_web_app_api_github_webhook_route.POST.html
│   │   │   ├── apps_web_app_api_health_ai_route.GET.html
│   │   │   ├── apps_web_app_api_health_auth_route.GET.html
│   │   │   ├── apps_web_app_api_health_db_route.GET.html
│   │   │   ├── apps_web_app_api_health_route.GET.html
│   │   │   ├── apps_web_app_api_health_storage_route.GET.html
│   │   │   ├── apps_web_app_api_ide_apply_route.POST.html
│   │   │   ├── apps_web_app_api_keys_api_route.DELETE.html
│   │   │   ├── apps_web_app_api_keys_api_route.GET.html
│   │   │   ├── apps_web_app_api_keys_api_route.POST.html
│   │   │   ├── apps_web_app_api_keys_ssh_route.DELETE.html
│   │   │   ├── apps_web_app_api_keys_ssh_route.GET.html
│   │   │   ├── apps_web_app_api_keys_ssh_route.POST.html
│   │   │   ├── apps_web_app_api_logs_stream_route.GET.html
│   │   │   ├── apps_web_app_api_marketplace_install_route.POST.html
│   │   │   ├── apps_web_app_api_notifications_route.POST.html
│   │   │   ├── apps_web_app_api_playground_run_route.POST.html
│   │   │   ├── apps_web_app_api_projects__projectId__assets__assetId__route.GET.html
│   │   │   ├── apps_web_app_api_projects__projectId__assets_route.GET.html
│   │   │   ├── apps_web_app_api_projects__projectId__assets_route.POST.html
│   │   │   ├── apps_web_app_api_projects__projectId__domain_route.GET.html
│   │   │   ├── apps_web_app_api_projects__projectId__domain_route.POST.html
│   │   │   ├── apps_web_app_api_projects__projectId__export_route.GET.html
│   │   │   ├── apps_web_app_api_projects__projectId__files_route.DELETE.html
│   │   │   ├── apps_web_app_api_projects__projectId__files_route.GET.html
│   │   │   ├── apps_web_app_api_projects__projectId__files_route.POST.html
│   │   │   ├── apps_web_app_api_projects__projectId__publish_route.POST.html
│   │   │   ├── apps_web_app_api_projects__projectId__snapshots_restore_route.POST.html
│   │   │   ├── apps_web_app_api_projects__projectId__snapshots_route.GET.html
│   │   │   ├── apps_web_app_api_projects__projectId__snapshots_route.POST.html
│   │   │   ├── apps_web_app_api_projects_import_route.POST.html
│   │   │   ├── apps_web_app_api_projects_route.GET.html
│   │   │   ├── apps_web_app_api_projects_route.POST.html
│   │   │   ├── apps_web_app_api_ssh_exec_route.POST.html
│   │   │   ├── apps_web_app_api_ssh_keys_route.POST.html
│   │   │   ├── apps_web_app_api_storage_recovery_route.GET.html
│   │   │   ├── apps_web_app_api_subscription_subscribe_route.POST.html
│   │   │   ├── apps_web_app_api_support_comments_route.POST.html
│   │   │   ├── apps_web_app_api_support_tickets__id__route.GET.html
│   │   │   ├── apps_web_app_api_support_tickets__id__route.PATCH.html
│   │   │   ├── apps_web_app_api_support_tickets_route.GET.html
│   │   │   ├── apps_web_app_api_support_tickets_route.POST.html
│   │   │   ├── apps_web_app_api_terminal_exec_route.POST.html
│   │   │   ├── apps_web_app_api_test_login_route.POST.html
│   │   │   ├── apps_web_app_api_wonder-build_ai-router.runAI.html
│   │   │   ├── apps_web_app_api_wonder-build_ai-style_route.POST.html
│   │   │   ├── apps_web_app_api_wonder-build_code-convert_route.POST.html
│   │   │   ├── apps_web_app_api_wonder-build_generate_route.POST.html
│   │   │   ├── apps_web_app_api_wonder-build_image-to-code_route.POST.html
│   │   │   ├── apps_web_app_api_wonder-build_video-to-code_route.POST.html
│   │   │   ├── apps_web_app_api_wonderspace_ai_route.POST.html
│   │   │   ├── apps_web_app_api_wonderspace_projects_route.GET.html
│   │   │   ├── apps_web_app_api_wonderspace_run_route.POST.html
│   │   │   ├── apps_web_app_api_wonderspace_terminal_route.POST.html
│   │   │   ├── apps_web_app_auth_login_route.GET.html
│   │   │   ├── apps_web_app_auth_login_route.POST.html
│   │   │   ├── apps_web_app_blog_page.default.html
│   │   │   ├── apps_web_app_careers_page.default.html
│   │   │   ├── apps_web_app_checkout_page.default.html
│   │   │   ├── apps_web_app_community_page.default.html
│   │   │   ├── apps_web_app_contact_page.default.html
│   │   │   ├── apps_web_app_cookies_page.default.html
│   │   │   ├── apps_web_app_dashboard_agents_page.default.html
│   │   │   ├── apps_web_app_dashboard_analytics_page.default.html
│   │   │   ├── apps_web_app_dashboard_dashboard_page.default.html
│   │   │   ├── apps_web_app_dashboard_layout.default.html
│   │   │   ├── apps_web_app_dashboard_projects_page.default.html
│   │   │   ├── apps_web_app_dashboard_subscription_page.default.html
│   │   │   ├── apps_web_app_dashboard_support_page.default.html
│   │   │   ├── apps_web_app_dashboard_teams_page.default.html
│   │   │   ├── apps_web_app_faq_page.default.html
│   │   │   ├── apps_web_app_features_page.default.html
│   │   │   ├── apps_web_app_layout.default.html
│   │   │   ├── apps_web_app_marketplace_page.default.html
│   │   │   ├── apps_web_app_page.default.html
│   │   │   ├── apps_web_app_privacy_page.default.html
│   │   │   ├── apps_web_app_public-pages_auth_LoginForm.default.html
│   │   │   ├── apps_web_app_public-pages_auth_page.default.html
│   │   │   ├── apps_web_app_public-pages_page.default.html
│   │   │   ├── apps_web_app_settings_accessibility_page.default.html
│   │   │   ├── apps_web_app_settings_account_page.default.html
│   │   │   ├── apps_web_app_settings_billing_page.default.html
│   │   │   ├── apps_web_app_settings_layout.default.html
│   │   │   ├── apps_web_app_settings_notifications_page.default.html
│   │   │   ├── apps_web_app_settings_page.default.html
│   │   │   ├── apps_web_app_settings_security_page.default.html
│   │   │   ├── apps_web_app_settings_subscriptions_page.default.html
│   │   │   ├── apps_web_app_status_page.default.html
│   │   │   ├── apps_web_app_subscription_page.default.html
│   │   │   ├── apps_web_app_support_page.default.html
│   │   │   ├── apps_web_app_terms_page.default.html
│   │   │   ├── apps_web_app_tutorials_page.default.html
│   │   │   ├── apps_web_app_utils_supabase_server.createClient.html
│   │   │   ├── apps_web_app_utils_supabase_server.getUser.html
│   │   │   ├── engine_core_ai_constitutional-prompt.wrapWithConstitutional.html
│   │   │   ├── engine_core_ai_extensions_confessions.processConfessions.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createCorrectionConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createLimitationConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createLocalizedConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createRejectedActionConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createRiskFlagConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.createUncertaintyConfession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_serializers.toConfessionEvent.html
│   │   │   ├── engine_core_ai_index.ts_constitutional_evaluator.evaluateAgainstConstitution.html
│   │   │   ├── engine_core_ai_index.ts_language_egyptian.detectEgyptian.html
│   │   │   ├── engine_core_ai_index.ts_language_egyptian.normalizeEgyptian.html
│   │   │   ├── engine_core_ai_index.ts_language_egyptian.toEgyptian.html
│   │   │   ├── engine_core_ai_index.ts_language_egyptian.translateToEgyptianIfNeeded.html
│   │   │   ├── engine_core_ai_index.ts_language_translator.detectHumanLanguage.html
│   │   │   ├── engine_core_ai_index.ts_language_translator.normalizeText.html
│   │   │   ├── engine_core_ai_index.ts_language_translator.processLanguage.html
│   │   │   ├── engine_core_ai_index.ts_language_translator.translateInput.html
│   │   │   ├── engine_core_ai_index.ts_language_translator.translateOutput.html
│   │   │   ├── engine_core_ai_index.ts_language_voices.getVoiceAndText.html
│   │   │   ├── engine_core_ai_index.ts_language_voices.getVoiceForLanguage.html
│   │   │   ├── engine_core_ai_index.ts_language_voices.prepareTextForVoice.html
│   │   │   ├── engine_core_ai_index.ts_runModel.runModel.html
│   │   │   ├── engine_core_ai_index.ts_runtime_engine.handleAIRequest.html
│   │   │   ├── engine_core_ai_index.ts_runtime_pipeline.runAIPipeline.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.emitConfession.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.emitEnd.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.emitProcessStep.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.emitSummary.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.subscribe.html
│   │   │   ├── engine_core_ai_index.ts_safety_detectors.detectSafetyIssues.html
│   │   │   ├── engine_core_ai_index.ts_safety_personalInfoScanner.scanPersonalInfo.html
│   │   │   ├── engine_core_ai_index.ts_safety_secretScanner.scanSecrets.html
│   │   │   ├── engine_core_ai_orchestrator.generateAndSaveProject.html
│   │   │   ├── engine_core_ai_promptBuilder.buildCodeGenPrompt.html
│   │   │   ├── engine_core_ai_promptBuilder.buildCodeTransformPrompt.html
│   │   │   ├── engine_core_ai_promptBuilder.buildImageEditPrompt.html
│   │   │   ├── engine_core_ai_promptBuilder.buildImageToCodePrompt.html
│   │   │   ├── engine_core_ai_providers_google.runGoogle.html
│   │   │   ├── engine_core_ai_runModel.runModel.html
│   │   │   ├── engine_core_extensions_route.DELETE.html
│   │   │   ├── engine_core_extensions_route.POST.html
│   │   │   ├── engine_core_playground_artifacts.extractArtifacts.html
│   │   │   ├── engine_core_playground_artifacts.formatArtifact.html
│   │   │   ├── engine_core_playground_runner.runPlaygroundModule.html
│   │   │   ├── engine_core_playground_session.appendMessageToSession.html
│   │   │   ├── engine_core_playground_session.clearSession.html
│   │   │   ├── engine_core_playground_session.getOrCreateSession.html
│   │   │   ├── engine_core_playground_usage.getUsage.html
│   │   │   ├── engine_core_playground_usage.hasUsageRemaining.html
│   │   │   ├── engine_core_playground_usage.trackUsage.html
│   │   │   ├── engine_core_projects_storage.createProject.html
│   │   │   ├── engine_core_projects_storage.createSnapshot.html
│   │   │   ├── engine_core_projects_storage.deleteFile.html
│   │   │   ├── engine_core_projects_storage.ensureDefaultProject.html
│   │   │   ├── engine_core_projects_storage.getProjectMetadata.html
│   │   │   ├── engine_core_projects_storage.listFiles.html
│   │   │   ├── engine_core_projects_storage.listProjects.html
│   │   │   ├── engine_core_projects_storage.listSnapshots.html
│   │   │   ├── engine_core_projects_storage.readFile.html
│   │   │   ├── engine_core_projects_storage.restoreSnapshot.html
│   │   │   ├── engine_core_projects_storage.updateProjectMetadata.html
│   │   │   ├── engine_core_projects_storage.writeFile.html
│   │   │   ├── engine_core_projects_storage.writeFiles.html
│   │   │   ├── engine_core_runners_vm2Runner.runExtension.html
│   │   │   ├── engine_core_terminal_commands.exec.html
│   │   │   ├── infra_lib_env.requireEnv.html
│   │   │   ├── infra_lib_logStreamer.emitLog.html
│   │   │   ├── infra_lib_logStreamer.subscribeLogs.html
│   │   │   ├── infra_lib_rateLimit_rateLimiter.checkRateLimit.html
│   │   │   ├── infra_lib_rateLimit_rateLimiter.getUserStats.html
│   │   │   ├── infra_lib_rateLimit_rateLimiter.trackRequest.html
│   │   │   ├── infra_lib_smokeAuth.getSmokeUserIdFromRequest.html
│   │   │   ├── infra_lib_smokeAuth.isSmokeEnabled.html
│   │   │   ├── infra_lib_smokeAuth.issueSmokeToken.html
│   │   │   ├── infra_lib_supabase_auth-context.AuthProvider.html
│   │   │   ├── infra_lib_supabase_auth-context.useAuth.html
│   │   │   ├── infra_lib_supabase_auth-context.useSupabase.html
│   │   │   ├── infra_lib_supabase_client.createClient.html
│   │   │   ├── infra_lib_supabase_client.getSupabaseClient.html
│   │   │   ├── infra_lib_supabase_server-client.createSupabaseServerClient.html
│   │   │   ├── infra_lib_utils_transpiler.typeAncient.html
│   │   │   ├── infra_lib_wonder-build_projects.createProject.html
│   │   │   ├── infra_lib_wonder-build_projects.listProjects.html
│   │   │   ├── infra_lib_wonder-build_projects.loadWonderBuildState.html
│   │   │   ├── infra_lib_wonder-build_projects.saveWonderBuildState.html
│   │   │   ├── infra_lib_wonder-build_projects.writeGeneratedFiles.html
│   │   │   ├── ui_components_AiChat.default.html
│   │   │   ├── ui_components_ChatBox.default.html
│   │   │   ├── ui_components_LayoutShell.default.html
│   │   │   ├── ui_components_MonacoEditor.default.html
│   │   │   ├── ui_components_NavOverlay.default.html
│   │   │   ├── ui_components_Navbar.default.html
│   │   │   ├── ui_components_Playground_UsageBadge.default.html
│   │   │   ├── ui_components_ResourcePlaceholder.default.html
│   │   │   ├── ui_components_SpiritGuide.default.html
│   │   │   ├── ui_components_WonderlandGallery.default.html
│   │   │   ├── ui_components_features_MarketplaceGallery.default.html
│   │   │   ├── ui_components_features_MarketplacePanel.MarketplacePanel.html
│   │   │   ├── ui_components_features_actions_purchaseExtension.purchaseExtension.html
│   │   │   ├── ui_components_features_hooks_useMarketplace.useMarketplace.html
│   │   │   ├── ui_components_homepage_HeroSection.default.html
│   │   │   ├── ui_components_homepage_Navigation.default.html
│   │   │   ├── ui_components_marketplace_PurchaseModal.default.html
│   │   │   ├── ui_components_notifications_NotificationCenter.NotificationCenter.html
│   │   │   ├── ui_components_pagesDropdown.default.html
│   │   │   ├── ui_components_recovery_RecoveryPanel.default.html
│   │   │   ├── ui_components_recovery_SnapshotItem.default.html
│   │   │   ├── ui_components_tenant_TenantProvider.default.html
│   │   │   ├── ui_components_tenant_TenantProvider.useTenant.html
│   │   │   ├── ui_components_ui_AIChatDrawer.default.html
│   │   │   ├── ui_components_ui_ActivityBar.default.html
│   │   │   ├── ui_components_ui_Input.default.html
│   │   │   ├── ui_components_ui_MenuBar.default.html
│   │   │   └── ui_components_ui_TheiaTopBar.default.html
│   │   ├── hierarchy.html
│   │   ├── index.html
│   │   ├── interfaces
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.Block.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.BuilderDocument.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.ConfessionFactoryOptions.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.LocalizedConfessionFactoryOptions.html
│   │   │   ├── engine_core_ai_index.ts_confessions_serializers.ConfessionEvent.html
│   │   │   ├── engine_core_ai_index.ts_confessions_serializers.ConfessionEventFactoryOptions.html
│   │   │   ├── engine_core_ai_index.ts_confessions_types.Confession.html
│   │   │   ├── engine_core_ai_index.ts_confessions_types.LocalizedConfession.html
│   │   │   ├── engine_core_ai_index.ts_language_voices.VoiceProfile.html
│   │   │   ├── engine_core_ai_index.ts_runtime_pipeline.PipelineResult.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.EndEvent.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.ProcessStepEvent.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.SummaryEvent.html
│   │   │   ├── engine_core_ai_index.ts_safety_detectors.SafetyViolation.html
│   │   │   ├── engine_core_ai_index.ts_safety_personalInfoScanner.PersonalInfoViolation.html
│   │   │   ├── engine_core_ai_index.ts_safety_secretScanner.SecretViolation.html
│   │   │   ├── engine_core_ide_codeScanner.ScanFinding.html
│   │   │   ├── engine_core_plugins_extensionManager.Extension.html
│   │   │   ├── types_playground.ModelConfig.html
│   │   │   ├── types_playground.PlaygroundHistory.html
│   │   │   ├── types_playground.PlaygroundMessage.html
│   │   │   ├── types_playground.PlaygroundModule.html
│   │   │   ├── types_playground.PlaygroundModuleContext.html
│   │   │   ├── types_playground.PlaygroundModuleInput.html
│   │   │   ├── types_playground.PlaygroundModuleResult.html
│   │   │   ├── types_playground.PlaygroundParameters.html
│   │   │   ├── types_playground.PlaygroundPreset.html
│   │   │   └── types_playground.PlaygroundSession.html
│   │   ├── modules
│   │   │   ├── apps_web_app_(builder)_wonder-build_WonderBuildShell.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_ai_AIPanel.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_AndroidCanvas.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_IOSCanvas.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_MultiCanvas.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_canvas_WebCanvas.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_components_ComponentPalette.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_components_DraggableItem.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_context_BuilderContext.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_DragEngine.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_GrapesEditor.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_LayoutTree.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_layout_WonderBuildShell.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_Canvas.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_PanelLeft.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_PanelRight.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_TemplateShowcase.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_components_Topbar.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useAutosave.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useDragDrop.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_usePublish.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_page.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_templateCatalog.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_themePresets.html
│   │   │   ├── apps_web_app_(preview)_preview__projectId__page.html
│   │   │   ├── apps_web_app_(published)_published__projectId___publishId___...path__route.html
│   │   │   ├── apps_web_app_(tools)_playground_layout.html
│   │   │   ├── apps_web_app_(tools)_playground_page.html
│   │   │   ├── apps_web_app_(tools)_playground_ui_ModelExplorer.html
│   │   │   ├── apps_web_app_(workspace)_dashboard_components_APIKeyManager.html
│   │   │   ├── apps_web_app_(workspace)_dashboard_components_SSHKeyManager.html
│   │   │   ├── apps_web_app_(workspace)_dashboard_page.html
│   │   │   ├── apps_web_app_(workspace)_wonderspace_WonderSpace.html
│   │   │   ├── apps_web_app_(workspace)_wonderspace__projectId__page.html
│   │   │   ├── apps_web_app_(workspace)_wonderspace_page.html
│   │   │   ├── apps_web_app_about_page.html
│   │   │   ├── apps_web_app_ai-modules_page.html
│   │   │   ├── apps_web_app_api-reference_page.html
│   │   │   ├── apps_web_app_api_agent_route.html
│   │   │   ├── apps_web_app_api_ai_auth.html
│   │   │   ├── apps_web_app_api_ai_chat_route.html
│   │   │   ├── apps_web_app_api_ai_modules_route.html
│   │   │   ├── apps_web_app_api_ai_verification_route.html
│   │   │   ├── apps_web_app_api_analytics_billing-usage_route.html
│   │   │   ├── apps_web_app_api_analytics_performance_route.html
│   │   │   ├── apps_web_app_api_analytics_track_route.html
│   │   │   ├── apps_web_app_api_auth_logout_route.html
│   │   │   ├── apps_web_app_api_auth_refresh_route.html
│   │   │   ├── apps_web_app_api_auth_register_route.html
│   │   │   ├── apps_web_app_api_auth_reset-password_route.html
│   │   │   ├── apps_web_app_api_auth_session_route.html
│   │   │   ├── apps_web_app_api_auth_verify-email_route.html
│   │   │   ├── apps_web_app_api_checkout_entitle_route.html
│   │   │   ├── apps_web_app_api_collaboration_route.html
│   │   │   ├── apps_web_app_api_domains_resolve_route.html
│   │   │   ├── apps_web_app_api_extensions_route.html
│   │   │   ├── apps_web_app_api_extensions_validate_route.html
│   │   │   ├── apps_web_app_api_github_route.html
│   │   │   ├── apps_web_app_api_github_webhook_route.html
│   │   │   ├── apps_web_app_api_health_ai_route.html
│   │   │   ├── apps_web_app_api_health_auth_route.html
│   │   │   ├── apps_web_app_api_health_db_route.html
│   │   │   ├── apps_web_app_api_health_route.html
│   │   │   ├── apps_web_app_api_health_storage_route.html
│   │   │   ├── apps_web_app_api_ide_apply_route.html
│   │   │   ├── apps_web_app_api_keys_api_route.html
│   │   │   ├── apps_web_app_api_keys_ssh_route.html
│   │   │   ├── apps_web_app_api_logs_stream_route.html
│   │   │   ├── apps_web_app_api_marketplace_install_route.html
│   │   │   ├── apps_web_app_api_notifications_route.html
│   │   │   ├── apps_web_app_api_playground_run_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__assets__assetId__route.html
│   │   │   ├── apps_web_app_api_projects__projectId__assets_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__domain_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__export_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__files_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__publish_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__snapshots_restore_route.html
│   │   │   ├── apps_web_app_api_projects__projectId__snapshots_route.html
│   │   │   ├── apps_web_app_api_projects_import_route.html
│   │   │   ├── apps_web_app_api_projects_route.html
│   │   │   ├── apps_web_app_api_ssh_exec_route.html
│   │   │   ├── apps_web_app_api_ssh_keys_route.html
│   │   │   ├── apps_web_app_api_storage_recovery_route.html
│   │   │   ├── apps_web_app_api_subscription_subscribe_route.html
│   │   │   ├── apps_web_app_api_support_comments_route.html
│   │   │   ├── apps_web_app_api_support_tickets__id__route.html
│   │   │   ├── apps_web_app_api_support_tickets_route.html
│   │   │   ├── apps_web_app_api_terminal_exec_route.html
│   │   │   ├── apps_web_app_api_test_login_route.html
│   │   │   ├── apps_web_app_api_wonder-build_ai-router.html
│   │   │   ├── apps_web_app_api_wonder-build_ai-style_route.html
│   │   │   ├── apps_web_app_api_wonder-build_code-convert_route.html
│   │   │   ├── apps_web_app_api_wonder-build_generate_route.html
│   │   │   ├── apps_web_app_api_wonder-build_image-to-code_route.html
│   │   │   ├── apps_web_app_api_wonder-build_video-to-code_route.html
│   │   │   ├── apps_web_app_api_wonderspace_ai_route.html
│   │   │   ├── apps_web_app_api_wonderspace_projects_route.html
│   │   │   ├── apps_web_app_api_wonderspace_run_route.html
│   │   │   ├── apps_web_app_api_wonderspace_terminal_route.html
│   │   │   ├── apps_web_app_auth_login_route.html
│   │   │   ├── apps_web_app_blog_page.html
│   │   │   ├── apps_web_app_careers_page.html
│   │   │   ├── apps_web_app_checkout_page.html
│   │   │   ├── apps_web_app_community_page.html
│   │   │   ├── apps_web_app_contact_page.html
│   │   │   ├── apps_web_app_cookies_page.html
│   │   │   ├── apps_web_app_dashboard_agents_page.html
│   │   │   ├── apps_web_app_dashboard_analytics_page.html
│   │   │   ├── apps_web_app_dashboard_dashboard_page.html
│   │   │   ├── apps_web_app_dashboard_layout.html
│   │   │   ├── apps_web_app_dashboard_projects_page.html
│   │   │   ├── apps_web_app_dashboard_subscription_page.html
│   │   │   ├── apps_web_app_dashboard_support_page.html
│   │   │   ├── apps_web_app_dashboard_teams_page.html
│   │   │   ├── apps_web_app_faq_page.html
│   │   │   ├── apps_web_app_features_page.html
│   │   │   ├── apps_web_app_layout.html
│   │   │   ├── apps_web_app_marketplace_page.html
│   │   │   ├── apps_web_app_page.html
│   │   │   ├── apps_web_app_privacy_page.html
│   │   │   ├── apps_web_app_public-pages_auth_LoginForm.html
│   │   │   ├── apps_web_app_public-pages_auth_page.html
│   │   │   ├── apps_web_app_public-pages_page.html
│   │   │   ├── apps_web_app_settings_accessibility_page.html
│   │   │   ├── apps_web_app_settings_account_page.html
│   │   │   ├── apps_web_app_settings_billing_page.html
│   │   │   ├── apps_web_app_settings_layout.html
│   │   │   ├── apps_web_app_settings_notifications_page.html
│   │   │   ├── apps_web_app_settings_page.html
│   │   │   ├── apps_web_app_settings_security_page.html
│   │   │   ├── apps_web_app_settings_subscriptions_page.html
│   │   │   ├── apps_web_app_status_page.html
│   │   │   ├── apps_web_app_subscription_page.html
│   │   │   ├── apps_web_app_support_page.html
│   │   │   ├── apps_web_app_terms_page.html
│   │   │   ├── apps_web_app_tutorials_page.html
│   │   │   ├── apps_web_app_utils_supabase_server.html
│   │   │   ├── engine_core_ai_constitutional-prompt.html
│   │   │   ├── engine_core_ai_extensions_confessions.html
│   │   │   ├── engine_core_ai_index.ts_confessions_engine.html
│   │   │   ├── engine_core_ai_index.ts_confessions_serializers.html
│   │   │   ├── engine_core_ai_index.ts_confessions_types.html
│   │   │   ├── engine_core_ai_index.ts_constitutional_evaluator.html
│   │   │   ├── engine_core_ai_index.ts_constitutional_prompt.html
│   │   │   ├── engine_core_ai_index.ts_constitutional_rules.html
│   │   │   ├── engine_core_ai_index.ts_language_egyptian.html
│   │   │   ├── engine_core_ai_index.ts_language_translator.html
│   │   │   ├── engine_core_ai_index.ts_language_voices.html
│   │   │   ├── engine_core_ai_index.ts_runModel.html
│   │   │   ├── engine_core_ai_index.ts_runtime_engine.html
│   │   │   ├── engine_core_ai_index.ts_runtime_pipeline.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.html
│   │   │   ├── engine_core_ai_index.ts_safety_detectors.html
│   │   │   ├── engine_core_ai_index.ts_safety_personalInfoScanner.html
│   │   │   ├── engine_core_ai_index.ts_safety_secretScanner.html
│   │   │   ├── engine_core_ai_modules_registry.html
│   │   │   ├── engine_core_ai_orchestrator.html
│   │   │   ├── engine_core_ai_promptBuilder.html
│   │   │   ├── engine_core_ai_providers.html
│   │   │   ├── engine_core_ai_providers_google.html
│   │   │   ├── engine_core_ai_providers_openrouter.html
│   │   │   ├── engine_core_ai_runModel.html
│   │   │   ├── engine_core_ai_types.html
│   │   │   ├── engine_core_extensions_route.html
│   │   │   ├── engine_core_ide_applyArtifact.html
│   │   │   ├── engine_core_ide_codeScanner.html
│   │   │   ├── engine_core_ide_filesystem.html
│   │   │   ├── engine_core_ide_persistence.html
│   │   │   ├── engine_core_playground_artifacts.html
│   │   │   ├── engine_core_playground_moduleCatalog.html
│   │   │   ├── engine_core_playground_modules.html
│   │   │   ├── engine_core_playground_runner.html
│   │   │   ├── engine_core_playground_session.html
│   │   │   ├── engine_core_playground_usage.html
│   │   │   ├── engine_core_plugins_extensionManager.html
│   │   │   ├── engine_core_projects_storage.html
│   │   │   ├── engine_core_resources_throttling.html
│   │   │   ├── engine_core_runners_vm2Runner.html
│   │   │   ├── engine_core_security_Sanitizer.html
│   │   │   ├── engine_core_terminal_commands.html
│   │   │   ├── infra_lib_agents.html
│   │   │   ├── infra_lib_collaboration_inMemoryRealtime.html
│   │   │   ├── infra_lib_collaboration_realtime.html
│   │   │   ├── infra_lib_env.html
│   │   │   ├── infra_lib_env.server.html
│   │   │   ├── infra_lib_logStreamer.html
│   │   │   ├── infra_lib_logger.html
│   │   │   ├── infra_lib_marketplace-agent.html
│   │   │   ├── infra_lib_rateLimit_rateLimiter.html
│   │   │   ├── infra_lib_smokeAuth.html
│   │   │   ├── infra_lib_supabase_auth-context.html
│   │   │   ├── infra_lib_supabase_client.html
│   │   │   ├── infra_lib_supabase_server-client.html
│   │   │   ├── infra_lib_teams.html
│   │   │   ├── infra_lib_theme_wonderlandTheme.html
│   │   │   ├── infra_lib_utils_transpiler.html
│   │   │   ├── infra_lib_wonder-build_client.html
│   │   │   ├── infra_lib_wonder-build_errors.html
│   │   │   ├── infra_lib_wonder-build_projects.html
│   │   │   ├── infra_services_integrations_github.html
│   │   │   ├── infra_services_marketplace_MarketplaceAgent.html
│   │   │   ├── infra_services_storage_CloudProvider.html
│   │   │   ├── infra_services_storage_MegaProvider.html
│   │   │   ├── infra_services_storage_SupabaseProvider.html
│   │   │   ├── infra_services_stripe_payments.html
│   │   │   ├── types_playground.html
│   │   │   ├── ui_components_AiChat.html
│   │   │   ├── ui_components_ChatBox.html
│   │   │   ├── ui_components_LayoutShell.html
│   │   │   ├── ui_components_MonacoEditor.html
│   │   │   ├── ui_components_NavOverlay.html
│   │   │   ├── ui_components_Navbar.html
│   │   │   ├── ui_components_Playground_UsageBadge.html
│   │   │   ├── ui_components_ResourcePlaceholder.html
│   │   │   ├── ui_components_SpiritGuide.html
│   │   │   ├── ui_components_WonderlandGallery.html
│   │   │   ├── ui_components_features_MarketplaceGallery.html
│   │   │   ├── ui_components_features_MarketplacePanel.html
│   │   │   ├── ui_components_features_actions_purchaseExtension.html
│   │   │   ├── ui_components_features_hooks_useMarketplace.html
│   │   │   ├── ui_components_features_types.html
│   │   │   ├── ui_components_homepage_HeroSection.html
│   │   │   ├── ui_components_homepage_Navigation.html
│   │   │   ├── ui_components_marketplace_PurchaseModal.html
│   │   │   ├── ui_components_notifications_NotificationCenter.html
│   │   │   ├── ui_components_pagesDropdown.html
│   │   │   ├── ui_components_recovery_RecoveryPanel.html
│   │   │   ├── ui_components_recovery_SnapshotItem.html
│   │   │   ├── ui_components_tenant_TenantProvider.html
│   │   │   ├── ui_components_ui_AIChatDrawer.html
│   │   │   ├── ui_components_ui_ActivityBar.html
│   │   │   ├── ui_components_ui_Input.html
│   │   │   ├── ui_components_ui_MenuBar.html
│   │   │   ├── ui_components_ui_Modal.html
│   │   │   ├── ui_components_ui_TheiaTopBar.html
│   │   │   ├── ui_components_ui_button.html
│   │   │   └── ui_components_ui_toast.html
│   │   ├── modules.html
│   │   ├── types
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_context_BuilderContext.BuilderState.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_context_BuilderContext.Platform.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_context_BuilderContext.SelectionState.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_DragEngine.DropTarget.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_GrapesEditor.GrapesEditorHandle.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_LayoutTree.LayoutNode.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_builder_engine_LayoutTree.Platform.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.BlockType.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.Breakpoint.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_templateCatalog.BlockPreset.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_templateCatalog.TemplateAudience.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_templateCatalog.TemplatePreview.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_templateCatalog.UIkit.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_templateCatalog.WonderBuildTemplate.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.ChromeMode.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_theme.WonderBuildTheme.html
│   │   │   ├── apps_web_app_(builder)_wonder-build_themePresets.ThemePreset.html
│   │   │   ├── apps_web_app_api_ai_auth.PaidAIUser.html
│   │   │   ├── engine_core_ai_index.ts_confessions_types.ConfessionType.html
│   │   │   ├── engine_core_ai_index.ts_confessions_types.ImpactLevel.html
│   │   │   ├── engine_core_ai_index.ts_runtime_statusStream.StatusEvent.html
│   │   │   ├── engine_core_ai_modules_registry.PublicAiModule.html
│   │   │   ├── engine_core_ai_types.AIModel.html
│   │   │   ├── engine_core_ai_types.AIRunInput.html
│   │   │   ├── engine_core_ai_types.AIRunOutput.html
│   │   │   ├── engine_core_ai_types.Artifact.html
│   │   │   ├── engine_core_playground_moduleCatalog.PlaygroundModuleSummary.html
│   │   │   ├── engine_core_projects_storage.ProjectMetadata.html
│   │   │   ├── engine_core_projects_storage.Snapshot.html
│   │   │   ├── infra_lib_agents.Platform.html
│   │   │   ├── infra_lib_collaboration_inMemoryRealtime.RealtimeChannelLike.html
│   │   │   ├── infra_lib_env.Env.html
│   │   │   ├── infra_lib_wonder-build_client.GenerateResponse.html
│   │   │   ├── infra_lib_wonder-build_projects.Project.html
│   │   │   ├── infra_lib_wonder-build_projects.WonderBuildState.html
│   │   │   ├── infra_services_storage_MegaProvider.MegaCacheRecord.html
│   │   │   ├── types_playground.PlaygroundModuleId.html
│   │   │   ├── types_playground.PlaygroundModuleKind.html
│   │   │   ├── types_playground.PlaygroundProviderId.html
│   │   │   ├── ui_components_features_actions_purchaseExtension.InstallResult.html
│   │   │   ├── ui_components_features_types.Extension.html
│   │   │   ├── ui_components_features_types.MarketplaceListResponse.html
│   │   │   ├── ui_components_features_types.PurchaseResult.html
│   │   │   └── ui_components_ui_toast.ToastKind.html
│   │   └── variables
│   │       ├── apps_web_app_(builder)_wonder-build_WonderBuildShell.default.html
│   │       ├── apps_web_app_(builder)_wonder-build_builder_context_BuilderContext.BuilderProvider.html
│   │       ├── apps_web_app_(builder)_wonder-build_builder_engine_DragEngine.DragEngine.html
│   │       ├── apps_web_app_(builder)_wonder-build_builder_engine_LayoutTree.LayoutTree.html
│   │       ├── apps_web_app_(builder)_wonder-build_hooks_useBuilderState.useBuilderState.html
│   │       ├── apps_web_app_(builder)_wonder-build_templateCatalog.wonderBuildTemplateSchema.html
│   │       ├── apps_web_app_(builder)_wonder-build_templateCatalog.wonderBuildTemplates.html
│   │       ├── apps_web_app_(builder)_wonder-build_theme.defaultTheme.html
│   │       ├── apps_web_app_(builder)_wonder-build_themePresets.themePresets.html
│   │       ├── apps_web_app_(preview)_preview__projectId__page.runtime.html
│   │       ├── apps_web_app_(published)_published__projectId___publishId___...path__route.runtime.html
│   │       ├── apps_web_app_(tools)_playground_layout.metadata.html
│   │       ├── apps_web_app_api_ai_chat_route.runtime.html
│   │       ├── apps_web_app_api_ai_modules_route.runtime.html
│   │       ├── apps_web_app_api_ai_verification_route.runtime.html
│   │       ├── apps_web_app_api_analytics_billing-usage_route.runtime.html
│   │       ├── apps_web_app_api_analytics_performance_route.runtime.html
│   │       ├── apps_web_app_api_auth_logout_route.runtime.html
│   │       ├── apps_web_app_api_auth_refresh_route.runtime.html
│   │       ├── apps_web_app_api_auth_register_route.runtime.html
│   │       ├── apps_web_app_api_auth_reset-password_route.runtime.html
│   │       ├── apps_web_app_api_auth_session_route.runtime.html
│   │       ├── apps_web_app_api_auth_verify-email_route.runtime.html
│   │       ├── apps_web_app_api_checkout_entitle_route.runtime.html
│   │       ├── apps_web_app_api_collaboration_route.runtime.html
│   │       ├── apps_web_app_api_domains_resolve_route.runtime.html
│   │       ├── apps_web_app_api_github_route.runtime.html
│   │       ├── apps_web_app_api_health_ai_route.runtime.html
│   │       ├── apps_web_app_api_health_auth_route.runtime.html
│   │       ├── apps_web_app_api_health_db_route.runtime.html
│   │       ├── apps_web_app_api_health_storage_route.runtime.html
│   │       ├── apps_web_app_api_notifications_route.runtime.html
│   │       ├── apps_web_app_api_playground_run_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__assets__assetId__route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__assets_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__domain_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__export_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__files_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__publish_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__snapshots_restore_route.runtime.html
│   │       ├── apps_web_app_api_projects__projectId__snapshots_route.runtime.html
│   │       ├── apps_web_app_api_projects_import_route.runtime.html
│   │       ├── apps_web_app_api_projects_route.runtime.html
│   │       ├── apps_web_app_api_ssh_exec_route.runtime.html
│   │       ├── apps_web_app_api_ssh_keys_route.runtime.html
│   │       ├── apps_web_app_api_support_comments_route.runtime.html
│   │       ├── apps_web_app_api_support_tickets__id__route.runtime.html
│   │       ├── apps_web_app_api_support_tickets_route.runtime.html
│   │       ├── apps_web_app_api_terminal_exec_route.runtime.html
│   │       ├── apps_web_app_api_test_login_route.runtime.html
│   │       ├── apps_web_app_api_wonderspace_ai_route.runtime.html
│   │       ├── apps_web_app_api_wonderspace_projects_route.runtime.html
│   │       ├── apps_web_app_layout.metadata.html
│   │       ├── apps_web_app_page.dynamic.html
│   │       ├── engine_core_ai_constitutional-prompt.CONSTITUTIONAL_PROMPT.html
│   │       ├── engine_core_ai_index.ts_constitutional_prompt.CONSTITUTIONAL_SYSTEM_PROMPT.html
│   │       ├── engine_core_ai_index.ts_language_egyptian.EGYPTIAN_LANGUAGE_CODE.html
│   │       ├── engine_core_ai_modules_registry.publicAiModules.html
│   │       ├── engine_core_ai_providers.Providers.html
│   │       ├── engine_core_ai_providers_openrouter.openrouterProvider.html
│   │       ├── engine_core_ide_applyArtifact.applyArtifact.html
│   │       ├── engine_core_ide_filesystem.PLATFORM_MAP.html
│   │       ├── engine_core_playground_moduleCatalog.playgroundModuleCatalog.html
│   │       ├── engine_core_playground_modules.playgroundModules.html
│   │       ├── engine_core_plugins_extensionManager.extensionManager.html
│   │       ├── engine_core_resources_throttling.resourceMonitor.html
│   │       ├── engine_core_terminal_commands.commands.html
│   │       ├── infra_lib_env.env.html
│   │       ├── infra_lib_env.server.serverEnv.html
│   │       ├── infra_lib_logger.logger.html
│   │       ├── infra_lib_theme_wonderlandTheme.wonderlandTheme.html
│   │       ├── infra_lib_wonder-build_client.wonderBuildClient.html
│   │       ├── infra_services_stripe_payments.stripe.html
│   │       ├── infra_services_stripe_payments.stripeService.html
│   │       ├── types_playground.PLAYGROUND_PRESETS.html
│   │       ├── ui_components_ui_Modal.Modal.html
│   │       ├── ui_components_ui_button.Button.html
│   │       ├── ui_components_ui_toast.Toaster.html
│   │       └── ui_components_ui_toast.default.html
│   ├── assets
│   │   ├── hierarchy.js
│   │   ├── highlight.css
│   │   ├── icons.js
│   │   ├── icons.svg
│   │   ├── main.js
│   │   ├── navigation.js
│   │   ├── search.js
│   │   └── style.css
│   ├── blueprints
│   │   ├── master-schema.json
│   │   ├── swarm-plan.md
│   │   └── worker-tasks.json
│   ├── guides
│   │   ├── architecture.md
│   │   ├── byoc-theia-deployment.md
│   │   ├── contributing.md
│   │   ├── deployment.md
│   │   ├── engine-tool-contract.md
│   │   ├── issue-task-proposals.md
│   │   └── panel-right-tabs.md
│   ├── hierarchy.html
│   ├── index.html
│   ├── modules.html
│   ├── openapi.html
│   ├── openapi.yaml
│   ├── recommendations
│   │   └── builder-access-and-storage.md
│   ├── release-gates.md
│   └── tree-directories.md
├── engine
│   └── core
│       ├── ai
│       │   ├── bridge.ts
│       │   ├── constitutional-prompt.ts
│       │   ├── extensions
│       │   ├── index.ts
│       │   ├── manifest-builder.ts
│       │   ├── modules
│       │   ├── narrator.ts
│       │   ├── orchestrator.ts
│       │   ├── promptBuilder.ts
│       │   ├── providers
│       │   ├── runModel.ts
│       │   ├── syncGuard.ts
│       │   └── types.ts
│       ├── assets
│       │   └── ancient-scripts.json
│       ├── extensions
│       │   └── route.ts
│       ├── ide
│       │   ├── applyArtifact.ts
│       │   ├── codeScanner.ts
│       │   ├── filesystem.ts
│       │   ├── persistence.ts
│       │   └── registry.ts
│       ├── playground
│       │   ├── artifacts.ts
│       │   ├── moduleCatalog.ts
│       │   ├── modules.ts
│       │   ├── runner.ts
│       │   ├── session.ts
│       │   └── usage.ts
│       ├── plugins
│       │   └── extensionManager.ts
│       ├── resources
│       │   └── throttling.ts
│       ├── runners
│       │   └── vm2Runner.ts
│       ├── security
│       │   └── Sanitizer.ts
│       └── terminal
│           └── commands.ts
├── hooks
│   └── useAIEventStream.ts
├── infra
│   ├── lib
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── supabase
│   │       └── server-client.ts
│   └── services
│       ├── integrations
│       │   └── github.ts
│       ├── jobs
│       │   ├── orchestrateScenePipeline.ts
│       │   ├── sceneJob.ts
│       │   └── sceneRunnerHarness.ts
│       ├── marketplace
│       │   └── MarketplaceAgent.ts
│       ├── storage
│       │   ├── README.md
│       │   ├── SupabaseProvider.ts
│       │   ├── __tests__
│       │   ├── generateSceneJson.ts
│       │   ├── promoteTempScene.ts
│       │   ├── provider.ts
│       │   ├── sceneSchema.ts
│       │   ├── types.ts
│       │   ├── uploadSceneToTemp.ts
│       │   └── validateScene.ts
│       ├── stripe
│       │   └── payments.ts
│       └── workspace
│           └── saveSceneRecord.ts
├── openapi.yaml
├── package.json
├── packages
│   ├── puck-editor
│   │   └── package.json
│   ├── puckeditor-core
│   │   ├── index.d.ts
│   │   ├── index.js
│   │   ├── package.json
│   │   └── puck.css
│   ├── shadon
│   │   ├── components
│   │   │   ├── Alert.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── index.ts
│   │   ├── lib
│   │   │   └── puck-integration.ts
│   │   └── package.json
│   ├── theia-ide
│   │   ├── index.ts
│   │   └── package.json
│   ├── theia-standard
│   │   ├── gen-webpack.config.js
│   │   ├── gen-webpack.node.config.js
│   │   ├── lib
│   │   │   └── frontend
│   │   ├── package.json
│   │   ├── src-gen
│   │   │   ├── backend
│   │   │   └── frontend
│   │   └── webpack.config.js
│   ├── unreal-bridge
│   │   └── package.json
│   ├── unreal-engine-bridge
│   │   └── package.json
│   ├── unreal-wonder-build
│   │   ├── PlayCanvasEngine.tsx
│   │   ├── components
│   │   │   ├── PlayCanvasEngine.tsx
│   │   │   ├── _archive
│   │   │   └── engineBridge.ts
│   │   ├── index.ts
│   │   ├── package.json
│   │   ├── scripts
│   │   │   ├── 1-docker-login.sh
│   │   │   ├── 2-docker-build.sh
│   │   │   └── verify_logic.js
│   │   ├── src
│   │   │   ├── UnrealWonderBuildPage.tsx
│   │   │   ├── playcanvas
│   │   │   └── puckAiBlueprint.ts
│   │   └── tsconfig.json
│   └── wonderplay
│       └── src
│           └── loadScene.ts
├── playcanvas-webgpu
│   ├── index.html
│   ├── package.json
│   ├── src
│   │   └── main.ts
│   ├── style.css
│   ├── tsconfig.json
│   └── vite.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── project-structure.txt
├── public
│   ├── ai-wonderland-intro.mp4
│   ├── images
│   │   ├── ai-wonderland-logo.png
│   │   ├── screenshots
│   │   │   ├── playcanvas-builder.svg
│   │   │   ├── puck-builder.svg
│   │   │   ├── theia-builder.svg
│   │   │   └── webgl-builder.svg
│   │   ├── wonderland-bg.png
│   │   └── wonderspace-logo.svg
│   └── litefilesystem.js-master
│       ├── INSTALL.md
│       ├── LICENSE
│       ├── README.md
│       ├── github.css
│       ├── index.html
│       ├── src
│       │   ├── backup.php
│       │   ├── css
│       │   ├── fonts
│       │   ├── include
│       │   ├── index.html
│       │   ├── install.php
│       │   ├── js
│       │   ├── litefileserver.js
│       │   └── server.php
│       └── style.css
├── registry.json
├── replit.md
├── runners
│   ├── aiWorker.ts
│   ├── authWorker.ts
│   ├── data-processing.worker.ts
│   ├── fileworkers.ts
│   └── registry.worker.ts
├── scripts
│   ├── build-linux.sh
│   ├── devtool.sh
│   ├── fix-imports.sh
│   ├── generate-tree-directories.sh
│   ├── no-placeholders.sh
│   ├── registry
│   │   └── sync-assets.mjs
│   ├── release-gates-check.sh
│   ├── smoke.sh
│   ├── swarm
│   │   ├── run-phase-workers.mjs
│   │   └── run-unreal-stack.mjs
│   ├── sync-guides.sh
│   └── update-readme.sh
├── supabase
│   ├── functions
│   │   └── signup-rate-limiter
│   │       └── index.ts
│   └── migrations
│       ├── 20250108_signup_rate_limiter_migration.sql
│       ├── 20250214_wonder_build_builder_tables.sql
│       ├── 20260318162150_new-migration.sql
│       └── 20260318_byoc_cloud_connections.sql
├── supabase-webgl-studio-integration.md
├── templates
│   ├── 3d
│   │   ├── basic-environment.json
│   │   ├── character-rig.json
│   │   └── empty-scene.json
│   ├── mobile
│   │   ├── mobile-home.json
│   │   ├── mobile-list.json
│   │   └── mobile-profile.json
│   └── web
│       ├── dashboard-shell.json
│       ├── hero-split.json
│       └── pricing-3-tier.json
├── tests
│   ├── apps-web-compat-exports.test.ts
│   ├── apps-web-tailwind-css-contract.test.ts
│   ├── blueprint-swarm-contract.test.ts
│   ├── builder-access-dock.test.ts
│   ├── byoc-environments-route.test.ts
│   ├── byoc-sdk.test.ts
│   ├── byoc-theia-infra.test.ts
│   ├── collaboration-route.test.ts
│   ├── components-json-registry.test.ts
│   ├── dashboard-agents-options.test.ts
│   ├── engine-tool-contract.test.ts
│   ├── homepage-link-routing.test.ts
│   ├── homepage-playcanvas-showcase.test.ts
│   ├── homepage-visual-effects-contract.test.ts
│   ├── integration
│   │   └── collaboration.test.ts
│   ├── marketing-builder-entrypoints.test.ts
│   ├── marketing-home-intent-routing.test.ts
│   ├── marketing-home-sign-map.test.tsx
│   ├── marketing-page-syntax-guard.test.ts
│   ├── navigation-settings-links.test.ts
│   ├── playcanvas-bridge-routing.test.ts
│   ├── playcanvas-wonderplay-unreal-linkage.test.ts
│   ├── public-pages-links.test.ts
│   ├── readme-accuracy.test.ts
│   ├── registry-sync-system.test.ts
│   ├── repo-hygiene.test.ts
│   ├── root-layout-contract.test.ts
│   ├── sync-guard-contract.test.ts
│   ├── theatre-bridge-script-contract.test.ts
│   ├── topnav-variant-contract.test.ts
│   ├── tsconfig-alias-contract.test.ts
│   ├── unit
│   │   └── playcanvasBridgeProtocol.test.ts
│   ├── unreal-engine-route-alias.test.ts
│   ├── unreal-wonder-build-playcanvas-engine.test.ts
│   ├── unreal-wonder-build-puck-ai-blueprint.test.ts
│   ├── web-dev-port-script.test.ts
│   ├── web-dev-port-selection.test.ts
│   ├── wonder-build-activation-schema.test.ts
│   ├── wonder-build-engine-unification.test.ts
│   ├── wonder-build-puck-ai-endpoint-contract.test.ts
│   ├── wonder-build-puck-layout-wrapper.test.ts
│   ├── wonder-build-puck-navigation.test.ts
│   ├── wonder-build-puck-richtext-config.test.ts
│   ├── wonder-build-puck-server-client-contract.test.ts
│   ├── wonder-build-puck.test.ts
│   ├── wonder-build-wonderplay-route.test.ts
│   ├── wonder-build.test.ts
│   ├── wonderspace-artifacts-routes.test.ts
│   ├── wonderspace-artifacts-schema.test.ts
│   ├── wonderspace-projects-route.test.ts
│   ├── wonderspace-theia-app.test.ts
│   ├── workspace-drift.test.ts
│   └── workspace-toggle-sync-guard.test.ts
├── tsconfig.base.json
├── tsconfig.docs.json
├── tsconfig.test.json
├── typedoc.json
├── types
│   └── playground.ts
├── ui
│   └── components
│       ├── AiChat.tsx
│       ├── ChatBox.tsx
│       ├── LayoutShell.tsx
│       ├── MonacoEditor.tsx
│       ├── NavOverlay.tsx
│       ├── Navbar.tsx
│       ├── Playground
│       │   └── UsageBadge.tsx
│       ├── QuadEngineShell.tsx
│       ├── ResourcePlaceholder.tsx
│       ├── SpiritGuide.tsx
│       ├── WonderlandGallery.tsx
│       ├── docs
│       │   └── Sidebar.tsx
│       ├── features
│       │   ├── MarketplaceGallery.tsx
│       │   ├── MarketplacePanel.tsx
│       │   ├── actions
│       │   ├── hooks
│       │   └── types.ts
│       ├── homepage
│       │   ├── HeroSection.tsx
│       │   ├── Navigation.tsx
│       │   └── WonderlandLanding.tsx
│       ├── marketplace
│       │   └── PurchaseModal.tsx
│       ├── notifications
│       │   └── NotificationCenter.tsx
│       ├── pagesDropdown.tsx
│       ├── recovery
│       │   ├── RecoveryPanel.tsx
│       │   └── SnapshotItem.tsx
│       ├── tenant
│       │   └── TenantProvider.tsx
│       └── ui
│           ├── AIChatDrawer.tsx
│           ├── ActivityBar.tsx
│           ├── Input.tsx
│           ├── MenuBar.tsx
│           ├── Modal.tsx
│           ├── TheiaTopBar.tsx
│           ├── button.tsx
│           └── toast.tsx
├── vercel.json
├── verify_logic.js
├── vitest.config.ts
├── webgl-studio-react-integration.md
└── wonderplay
    ├── index.html
    ├── main.js
    └── package.json

200 directories, 1085 files
```
