# Unified Page Builder Architecture

## Overview

The Unified Page Builder merges **Puck** (page builder), **Shadon** (UI components), **Drag-and-Drop** capabilities, and **AI assistant** into a cohesive no-code editor. Users can visually compose pages, get contextual block suggestions, and leverage AI to accelerate design decisions.

**Access Point:** `/builder/puck-unified`

## Core Components

### 1. UnifiedPuckAIBuilder Component

**Location:** `/apps/web/components/UnifiedPuckAIBuilder.tsx`

**Purpose:** Main visual editor combining Puck canvas with AI sidebar.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Puck Unified Builder | Mode Selector   │
├──────────────────┬───────────────────────────────┤
│                  │                               │
│  Puck Canvas     │    AI Sidebar                 │
│  (left ~70%)     │    (right ~30%)               │
│                  │                               │
│  - Blocks        │ Mode: Suggest/Chat/Build     │
│  - Preview       │ - Input                       │
│  - Properties    │ - Suggestions                 │
│                  │ - History                     │
├──────────────────┴───────────────────────────────┤
│ Footer: Save | Export | Download | Clear         │
└─────────────────────────────────────────────────┘
```

**Key Props:**
```typescript
interface UnifiedPuckAIBuilderProps {
  initialContent?: PuckContent;
  onSave?: (content: PuckContent) => void;
  onExport?: (json: string) => void;
  autoSaveInterval?: number; // defaults to 30,000ms
}
```

**Key Methods:**
- `getAISuggestions(prompt)` - Fetch contextual block suggestions from API
- `handleAIPrompt(prompt)` - Process user intent in Chat/Build modes
- `handleInsertBlock(blockId)` - Add suggested block to canvas
- `handleDragStartFromSidebar(blockId)` - Enable drag-from-sidebar
- `handleSave()` - Persist page to database
- `handleExport()` - Generate JSON download

**State Management:**
```typescript
{
  mode: 'suggest' | 'chat' | 'build';
  content: PuckContent;
  selectedBlockId?: string;
  aiInput: string;
  aiSuggestions: BlockSuggestion[];
  buildHistory: HistoryEntry[];
  isSaving: boolean;
  autoSaveEnabled: boolean;
}
```

### 2. useUnifiedBuilder Hook

**Location:** `/apps/web/lib/hooks/useUnifiedBuilder.ts`

**Purpose:** Centralized state management for unified builder.

**Exports:**
```typescript
interface UseUnifiedBuilderReturn {
  // State
  content: PuckContent;
  aiSuggestions: BlockSuggestion[];
  buildHistory: HistoryEntry[];
  selectedBlockId?: string;

  // Content operations
  updateContent(content: PuckContent): void;
  addBlock(blockType: string, props?: object): void;
  removeBlock(blockId: string): void;
  updateBlock(blockId: string, props: object): void;
  reorderBlocks(blockIds: string[]): void;

  // AI operations
  getAISuggestions(prompt: string): Promise<BlockSuggestion[]>;
  scoreBlockRelevance(blockKey: string, prompt: string): number;
  analyzeUserIntent(prompt: string): PageIntent;

  // History
  addToHistory(step: HistoryEntry): void;
  undo(): void;
  redo(): void;
  clearHistory(): void;

  // Export/Import
  exportAsJSON(): string;
  importFromJSON(json: string): void;
  exportAsHTML(): string;

  // UI state
  selectBlock(blockId: string): void;
}
```

**Key Methods:**

#### addBlock(blockType, props)
Inserts a new block into the content at the end or after selectedBlockId.

```typescript
addBlock('hero', {
  title: 'Welcome',
  subtitle: 'Get started with our platform',
  cta: 'Learn More'
});
```

#### getAISuggestions(prompt)
Fetches AI suggestions from `/api/wonder-build/ai/unified-suggestions/`.

Query Parameters:
- `prompt` - User's natural language request
- `currentBlocks` - Stringified array of current block keys (for dedup)

Response:
```typescript
{
  suggestions: [
    {
      id: 'contact',
      name: 'Contact Form',
      reason: 'Matches your intent to collect user information',
      icon: '📧',
      shadonComponents: ['Select', 'Input', 'Button'],
      score: 95
    },
    ...
  ]
}
```

#### exportAsJSON()
Exports page as JSON suitable for storage:

```typescript
{
  version: '1.0',
  blocks: [
    { id: 'hero-1', type: 'hero', props: {...} },
    { id: 'contact-1', type: 'contact', props: {...} },
    ...
  ],
  metadata: {
    title: 'My Page',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z'
  }
}
```

### 3. AI Suggestions API

**Location:** `/apps/web/app/api/wonder-build/ai/unified-suggestions/route.ts`

**Endpoint:** `POST /api/wonder-build/ai/unified-suggestions/`

**Block Library (12 Types):**

| Block | Purpose | Keywords | Shadon Deps |
|-------|---------|----------|------------|
| hero | Landing hero section | hero, welcome, main | Button, Badge |
| contact | Contact form | contact, form, inquiry | Input, Button |
| grid | Feature grid | features, showcase, grid | Card, Badge |
| pricing | Pricing table | pricing, plans, cost | Card, Button, Badge |
| testimonial | Single testimonial | review, feedback, quote | Card, Badge |
| cta | Call-to-action | cta, action, engagement | Button |
| faq | FAQ section | faq, qa, questions | Alert, Badge |
| navbar | Navigation bar | nav, header, menu | Button |
| footer | Footer section | footer, links, social | Button, Badge |
| gallery | Image gallery | gallery, portfolio, images | Card, Badge |
| testimonialCarousel | Multiple testimonials | reviews, carousel, feedback | Card |
| aiChat | AI chat widget | chat, assistant, help | Button |

**Scoring Algorithm:**

```typescript
function scoreBlockRelevance(blockKey, blockData, userPrompt) {
  let score = 0;

  // 1. Exact keyword match (+100)
  const keywords = blockData.keywords || [];
  if (keywords.some(k => userPrompt.toLowerCase() === k.toLowerCase())) {
    score += 100;
  }

  // 2. Partial keyword match (+50)
  if (keywords.some(k => userPrompt.toLowerCase().includes(k.toLowerCase()))) {
    score += 50;
  }

  // 3. Semantic patterns (+75)
  const patterns = {
    'contact|form|email|inquiry': 'contact',
    'collect|information|data': 'contact',
    'feature|showcase|grid': 'grid',
    'price|cost|plan': 'pricing',
    'review|feedback|quote': 'testimonial',
    'question|faq|qa': 'faq',
    'call-to-action|engagement|button': 'cta',
  };

  for (const [pattern, targetBlock] of Object.entries(patterns)) {
    if (new RegExp(pattern, 'i').test(userPrompt) && blockKey === targetBlock) {
      score += 75;
    }
  }

  return score;
}
```

**Request/Response:**

```typescript
// Request
{
  prompt: "I need a form to collect customer feedback",
  currentBlocks: ["hero", "navbar"] // avoid duplication
}

// Response
{
  suggestions: [
    {
      id: 'contact',
      name: 'Contact Form',
      reason: 'Matches your intent to collect information',
      icon: '📧',
      shadonComponents: ['Input', 'Select', 'Button'],
      score: 95
    },
    {
      id: 'testimonial',
      name: 'Testimonial',
      reason: 'Related to feedback collection',
      icon: '⭐',
      shadonComponents: ['Card', 'Badge'],
      score: 60
    }
  ]
}
```

## Shadon Integration

### Block Templates

**Location:** `/packages/shadon/lib/puck-integration.ts`

Shadon provides pre-configured block templates compatible with Puck:

```typescript
const SHADON_BLOCK_TEMPLATES = {
  buttonPrimary: {
    component: Button,
    label: 'Primary Button',
    keywords: ['button', 'primary', 'action', 'cta'],
    fields: {
      text: { type: 'text' },
      variant: { type: 'select', options: ['default', 'destructive', ...] },
      size: { type: 'select', options: ['default', 'sm', 'lg'] },
      disabled: { type: 'boolean' }
    }
  },
  // ... more templates
};
```

### Using Shadon Components

Import and use in Puck block definitions:

```typescript
import { Button, Card, Badge, Alert } from '@shadon/ui';

const config = {
  blocks: {
    hero: {
      fields: {
        title: { type: 'text' },
        cta: { type: 'text' }
      },
      render: ({ title, cta }) => (
        <Card>
          <h1>{title}</h1>
          <Button>{cta}</Button>
        </Card>
      )
    }
  }
};
```

## Drag-and-Drop

### From Sidebar to Canvas

When user drags a suggestion from the AI sidebar to Puck canvas:

1. **Drag Start:** `handleDragStartFromSidebar(blockId)` sets drag data
   ```typescript
   event.dataTransfer?.setData('application/x-puck-block', blockId);
   ```

2. **Drop:** Puck's `onDrop` handler receives block ID
   ```typescript
   onDrop={(content) => {
     const blockId = getDragData();
     addBlock(blockId);
     updateContent(content);
   }}
   ```

3. **Visual Feedback:** Block appears in canvas; can edit properties

### Using dnd-kit

For more advanced drag-and-drop within canvas:

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';

<DndContext collisionDetection={closestCenter}>
  {content.blocks.map((block) => (
    <DraggableBlock key={block.id} id={block.id} />
  ))}
</DndContext>
```

## AI Modes

### 1. Suggest Mode
Show contextual block suggestions without inserting.

**Flow:**
1. User types: "I need a contact form"
2. Click "Get Suggestions"
3. API returns: [contact, cta, grid]
4. User clicks `+` on contact
5. Block inserted into canvas

### 2. Chat Mode
Conversational builder with multi-turn dialogue.

**Flow:**
1. User: "Add a navigation bar"
2. Assistant: "✓ Navigation added. What sections should it include?"
3. User: "Home, About, Contact"
4. Assistant: Updates navbar with sections

### 3. Build Mode
Full-page generation from description.

**Flow:**
1. User: "Create a landing page for a SaaS product"
2. Assistant: Generates entire page with hero, features, pricing, cta, footer
3. User reviews and refines
4. Save page

## Auto-Save

**Interval:** 30 seconds (configurable)

**Behavior:**
1. Content hashed to detect actual changes
2. Only saves when content differs from last save
3. Saves to localStorage as backup
4. Exports to database on explicit save

**localStorage Key:** `puck_unified_page_{hash}`

**Format:**
```typescript
{
  content: PuckContent;
  timestamp: number;
  hash: string;
}
```

## API Endpoints

### GET /api/wonder-build/ai/unified-suggestions

Fetch AI suggestions.

**Query Params:**
- `prompt` - User request (required)
- `currentBlocks` - Stringified array of current block keys

**Response:**
```typescript
{
  suggestions: BlockSuggestion[];
  generatedAt: string;
}
```

### POST /api/byoc/scene

Create new page scene.

**Body:**
```typescript
{
  content: PuckContent;
  title?: string;
}
```

**Response:**
```typescript
{
  sceneId: string;
  createdAt: string;
  url: string;
}
```

### PUT /api/byoc/scene/:id

Update page scene.

**Body:**
```typescript
{
  content: PuckContent;
  title?: string;
}
```

### GET /api/byoc/scene/:id

Retrieve page scene.

**Response:**
```typescript
{
  sceneId: string;
  content: PuckContent;
  title: string;
  createdAt: string;
  updatedAt: string;
}
```

## Data Models

### PuckContent
```typescript
{
  blocks: Array<{
    id: string;
    type: string;
    props: Record<string, any>;
  }>;
  root?: {
    props: Record<string, any>;
  };
}
```

### BlockSuggestion
```typescript
{
  id: string;
  name: string;
  reason: string;
  icon: string;
  shadonComponents: string[];
  score: number;
}
```

### HistoryEntry
```typescript
{
  id: string;
  timestamp: number;
  action: 'add_block' | 'remove_block' | 'update_block' | 'reorder';
  blockId?: string;
  prevState: PuckContent;
  nextState: PuckContent;
}
```

### PageIntent
```typescript
{
  type: 'landing_page' | 'product_page' | 'blog' | 'portfolio' | 'other';
  includeNav: boolean;
  includeFooter: boolean;
  keywords: string[];
}
```

## Workflow Example

**Building a SaaS Landing Page:**

```typescript
1. User opens /builder/puck-unified
2. Sees: Empty canvas + AI sidebar in "Suggest" mode
3. User types: "I'm building a SaaS product with AI features"
4. AI suggests: [hero, grid (features), pricing, testimonial, cta, navbar, footer]
5. User clicks + on hero → hero block added with default props
6. User edits hero props in right panel
7. User clicks + on grid → features grid added
8. Switching to Build mode, user: "Generate a complete page for an AI analytics tool"
9. AI adds: navbar, hero, grid (3 features), pricing (3 tiers), testimonial, cta, footer
10. User reviews, tweaks pricing descriptions
11. User clicks "Save Page"
12. Page saved to database, gets sharable URL
```

## Development Checklist

- [x] Core component structure (split pane)
- [x] AI suggestions API with scoring
- [x] Shadon integration layer
- [x] useUnifiedBuilder hook
- [x] Auto-save mechanism
- [ ] Drag-and-drop wiring to Puck
- [ ] Chat mode backend integration
- [ ] Build mode full-page generation
- [ ] Database persistence (Supabase)
- [ ] Share link generation
- [ ] Analytics tracking

## Troubleshooting

### Issue: Blocks not appearing in canvas
**Solution:** Verify Puck's `onDrop` handler is properly connected. Check browser console for errors in block component rendering.

### Issue: AI suggestions always return same blocks
**Solution:** Verify scoring algorithm is receiving prompt correctly. Check API logs for request format.

### Issue: Auto-save not working
**Solution:** Check browser localStorage quota. Verify timestamp is being updated correctly. Check for console errors in auto-save interval.

### Issue: Shadon components not rendering
**Solution:** Ensure Shadon package is installed. Check that component imports are correct. Verify CSS is loaded.

## Performance Optimization

**Current:**
- Puck renders in real-time (React reconciliation)
- AI suggestions fetched on-demand (~200ms)
- Auto-save batches changes every 30s

**Future:**
- Lazy-load block components
- Memoize suggestion rendering
- Implement virtual scrolling for large block lists
- Cache commonly suggested block combinations

## Security Considerations

- **Input Sanitization:** All user prompts validated before API call
- **XSS Prevention:** Block HTML sanitized on render
- **CSRF Protection:** API endpoints use standard CSRF tokens
- **Rate Limiting:** Suggestion API limited to 10 requests/minute per user
- **Data Privacy:** Pages stored encrypted in database
