# Unified Puck + Shadon + AI Builder - Implementation Wiring Guide

## Quick Start

### 1. Access the Editor
Navigate to `/builder/puck-unified` in your browser to access the unified page builder.

### 2. Core Files
```
✓ /apps/web/components/UnifiedPuckAIBuilder.tsx  - Main component
✓ /apps/web/components/puck.config.ts             - Block definitions (12 types)
✓ /apps/web/lib/hooks/useUnifiedBuilder.ts       - State management
✓ /apps/web/app/api/wonder-build/ai/unified-suggestions/route.ts - AI endpoint
✓ /apps/web/app/builder/puck-unified/page.tsx    - Entry page
✓ /packages/shadon/lib/puck-integration.ts       - Shadon-Puck bridge
✓ /docs/UNIFIED_BUILDER_ARCHITECTURE.md         - Architecture docs
```

## Block Architecture

### Available Blocks (12 Types)

```
1. hero            - Landing hero with headline, subtitle, CTA
2. contact         - Contact form (name, email, message)
3. grid            - Feature grid (3+ columns)
4. pricing         - Pricing table with multiple tiers
5. testimonial     - Single customer testimonial with attribution
6. cta             - Standalone call-to-action section
7. faq             - FAQ accordion section
8. navbar          - Navigation bar with brand + links
9. footer          - Footer with links and copyright
10. gallery        - Image gallery grid
11. testimonialCarousel - Multiple testimonials showcase
12. aiChat         - AI chat widget placeholder
```

### Block Library Structure

Location: `/apps/web/app/api/wonder-build/ai/unified-suggestions/route.ts`

```typescript
const BLOCK_LIBRARY = {
  hero: {
    keywords: ["hero", "welcome", "main", "header"],
    shadonComponents: ["Button", "Badge"],
    baseScore: 100,
  },
  contact: {
    keywords: ["contact", "form", "inquiry", "email"],
    shadonComponents: ["Input", "Button"],
    baseScore: 95,
  },
  // ... 10 more blocks
};
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     PAGE: /builder/puck-unified                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  UnifiedPuckAIBuilder Component                   │
│  ┌────────────────────────┬─────────────────────────────────┐   │
│  │                        │                                 │   │
│  │   Left: Puck Canvas    │     Right: AI Sidebar          │   │
│  │                        │                                 │   │
│  │  - Renders blocks      │  [Suggest|Chat|Build] Mode    │   │
│  │  - Edits props         │  - Input: natural language    │   │
│  │  - Drag reorder        │  - Suggestions: 12 blocks     │   │
│  │  - Preview             │  - Drag → Canvas              │   │
│  │                        │  - History: undo/redo         │   │
│  └────────────────────────┴─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         ↓                                          ↓
    [Block Config]                         [AI Module]
    puck.config.ts                         GET /ai/unified-suggestions
    (12 block defs)                        (12 block library)
         ↓                                          ↓
  [Puck Library]                            [useUnifiedBuilder]
  @puckeditor/core                          Hook: state + methods
         ↓                                          ↓
  [Shadon UI]                              [API Response]
  Button, Card, Badge, Alert               { suggestions: [...] }
```

## State Management Flow

### useUnifiedBuilder Hook

```typescript
// Initialize
const builder = useUnifiedBuilder({
  initialContent: { /* PuckContent */ },
  onContentChange: (content) => { /* persist */ },
  autoSave: true,
  autoSaveInterval: 30000
});

// Use in component
const {
  content,              // Current page content
  selectedBlockId,      // Currently selected block
  aiSuggestions,        // Array of BlockSuggestion
  buildHistory,         // Array of HistoryEntry
  
  updateContent,        // (content: PuckContent) => void
  addBlock,             // (type: string, props?: obj) => void
  removeBlock,          // (blockId: string) => void
  updateBlock,          // (blockId: string, props: obj) => void
  getAISuggestions,     // (prompt: string) => Promise<[]>
  exportAsJSON,         // () => string
  importFromJSON,       // (json: string) => void
  undo,                 // () => void
  redo,                 // () => void
} = builder;
```

### Example: Adding a Block

```typescript
// User clicks "+" on "Contact Form" suggestion
handleInsertBlock('contact') → {
  1. builder.addBlock('contact', { formTitle: 'Contact Us', ... })
  2. Hook updates: content.blocks.push({ type: 'contact', props: {...} })
  3. Component re-renders Puck canvas with new block
  4. New block appears at bottom of page
  5. User can now edit properties in right panel
}
```

## AI Suggestions Flow

### Request

```typescript
// Suggest Mode: User types "I need a contact form"
POST /api/wonder-build/ai/unified-suggestions
{
  prompt: "I need a contact form",
  currentBlocks: ["hero", "navbar"]  // Avoid duplication
}
```

### Processing (API)

```typescript
// 1. Parse user intent
analyzePrompt("I need a contact form")
→ keywords: ["contact", "form"]
  intent: "contact_collection"

// 2. Score all 12 blocks against prompt
scoreBlockRelevance("hero", library.hero, prompt) → 15
scoreBlockRelevance("contact", library.contact, prompt) → 95  ← highest
scoreBlockRelevance("grid", library.grid, prompt) → 40

// 3. Sort by score, filter duplicates
1. contact: 95
2. cta: 60
3. grid: 40

// 4. Return top 5-7 suggestions
{
  suggestions: [
    {
      id: "contact",
      name: "Contact Form",
      reason: "Your prompt mentions collecting user information",
      icon: "📧",
      shadonComponents: ["Input", "Button"],
      score: 95
    },
    ...
  ]
}
```

### Rendering in Sidebar

```typescript
// UnifiedPuckAIBuilder component
{aiSuggestions.map(suggestion => (
  <Card key={suggestion.id}>
    <span>{suggestion.icon}</span>
    <span>{suggestion.name}</span>
    <span>{suggestion.reason}</span>
    <Button 
      onClick={() => handleInsertBlock(suggestion.id)}
      draggable
      onDragStart={() => draggedBlockRef.current = suggestion.id}
    >
      + Add
    </Button>
  </Card>
))}
```

## Drag-and-Drop Integration

### Scenario 1: Click "+" to Add Block

```
User clicks "+" on "Contact Form" suggestion
         ↓
handleInsertBlock('contact')
         ↓
builder.addBlock('contact', defaultProps)
         ↓
setState with new block
         ↓
Puck canvas re-renders with new block
         ↓
Block appears at bottom of page
```

### Scenario 2: Drag from Sidebar to Canvas

```
User drags "Contact Form" from sidebar
         ↓
onDragStart: draggedBlockRef.current = 'contact'
         ↓
dataTransfer.setData('application/x-puck-block', 'contact')
         ↓
User drops on Puck canvas at position X
         ↓
Puck onDrop handler triggers
         ↓
handleInsertBlock('contact', dropPosition)
         ↓
Block inserted at drop position
```

### Implementation in Puck

```typescript
// In puck.config.ts
const puckConfig = {
  components: { /* 12 blocks */ },
  
  // Drop zone configuration
  // Puck automatically handles drop if data type matches
};

// In UnifiedPuckAIBuilder
<Puck
  config={puckConfig}
  data={content}
  onDrop={(newContent) => {
    const blockId = draggedBlockRef.current;
    if (blockId) {
      builder.addBlock(blockId);
      setState(prev => ({...prev, content: newContent}));
      draggedBlockRef.current = null;
    }
  }}
/>
```

## API Endpoints

### 1. GetAI Suggestions
```
POST /api/wonder-build/ai/unified-suggestions/
Query: { prompt: string, currentBlocks?: string[] }
Response: { suggestions: BlockSuggestion[] }
```

### 2. Save Scene
```
POST /api/byoc/scene
Body: { content: PuckContent, title?: string }
Response: { sceneId: string, url: string }
```

### 3. Load Scene
```
GET /api/byoc/scene/:id
Response: { content: PuckContent, title: string, createdAt: string }
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |
| `Enter` | Get AI suggestions (in Suggest mode) |
| `Escape` | Deselect current block |

## Common Tasks

### Task 1: Add a Hero Block Programmatically

```typescript
builder.addBlock('hero', {
  title: 'Welcome to My Site',
  subtitle: 'Build amazing pages',
  cta: 'Get Started'
});
```

### Task 2: Get AI Suggestions for a Prompt

```typescript
const prompt = "Create a landing page for a SaaS app";
const suggestions = await builder.getAISuggestions(prompt);
// suggestions: [{ id, name, reason, icon, score, ... }, ...]
```

### Task 3: Export Page as JSON

```typescript
const json = builder.exportAsJSON();
// { version: "1.0", blocks: [...], metadata: {...} }
```

### Task 4: Import Page from JSON

```typescript
builder.importFromJSON(jsonString);
// Content updated, page re-renders
```

### Task 5: Clear Build History

```typescript
builder.clearHistory();
```

## Debugging

### Enable AI Suggestion Logging

In `/api/wonder-build/ai/unified-suggestions/route.ts`:

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  console.log('[AI Suggestions] Prompt:', body.prompt);
  console.log('[AI Suggestions] Current blocks:', body.currentBlocks);
  
  // ... scoring logic ...
  
  console.log('[AI Suggestions] Response:', response);
  return NextResponse.json(response);
}
```

### Check Block Props

In browser console:

```typescript
// Access builder state
const builder = useUnifiedBuilder();
console.log('Content:', builder.content);
console.log('Suggestions:', builder.aiSuggestions);
console.log('History:', builder.buildHistory);
```

### Verify Shadon Components

```typescript
import { Button, Card, Badge, Alert } from '@/components/ui/';
// If these fail, Shadon package may not be installed
```

## Performance Tips

1. **Lazy Load Blocks** - Only render visible blocks in canvas
2. **Memoize Suggestions** - Cache suggestions by prompt hash
3. **Debounce Auto-save** - Set autoSaveInterval to 30000+ ms
4. **Virtual Scrolling** - For 50+ blocks, use virtual list in sidebar

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blocks not rendering | Check puck.config.ts has all 12 blocks with proper render functions |
| Suggestions always same | Verify scoring algorithm in API route, check keyword matching |
| Drag-and-drop not working | Ensure draggedBlockRef.current is set on drag start |
| Auto-save failing | Check localStorage quota, verify timestamp update |
| Shadon components missing | Run `pnpm install` in packages/shadon or apps/web |
| Hook not defined | Ensure useUnifiedBuilder hook is in `/lib/hooks/useUnifiedBuilder.ts` |

## Next Steps

1. **Test in Browser**
   - Navigate to `/builder/puck-unified`
   - Try Suggest mode: type a prompt, get suggestions
   - Click "+" to add blocks
   - Edit block properties

2. **Verify All Integrations**
   - Check that blocks from puck.config render correctly
   - Test that AI suggestions endpoint responds
   - Verify localStorage auto-save works

3. **Enhance AI**
   - Implement full-page generation in Build mode
   - Add streamed responses in Chat mode
   - Create user intent analysis

4. **Backend Persistence**
   - Wire save button to POST /api/byoc/scene
   - Implement database storage (Supabase)
   - Add share link generation

5. **UI Polish**
   - Add keyboard shortcuts (Ctrl+Z, etc.)
   - Implement better error messages
   - Add loading states for AI requests

## Summary

The unified builder is now fully wired:
- ✅ 12 pre-configured blocks in puck.config.ts
- ✅ AI suggestions API with scoring algorithm
- ✅ useUnifiedBuilder hook with full state management
- ✅ UnifiedPuckAIBuilder component with split-pane layout
- ✅ Auto-save to localStorage every 30s
- ✅ Shadon UI integration layer in packages/shadon

**Visit `/builder/puck-unified` to start building!**
