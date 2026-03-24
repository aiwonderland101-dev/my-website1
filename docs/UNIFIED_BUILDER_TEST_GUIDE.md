# Unified Builder - Comprehensive Test Guide

## Pre-Test Checklist

Before running tests, verify:

- [ ] Development server running: `pnpm dev`
- [ ] Port 3000 is accessible: `http://localhost:3000`
- [ ] Browser developer tools open (console, network tab)
- [ ] Fresh browser window (incognito/private preferred)
- [ ] localStorage cleared (in dev tools)

---

## Test Suite 1: Component Loading

### Test 1.1: Editor Page Loads
**Steps:**
1. Navigate to `http://localhost:3000/builder/puck-unified`
2. Wait 2 seconds for page to load

**Expected:**
- [ ] Page loads without errors
- [ ] Split pane visible (Puck canvas left, AI sidebar right)
- [ ] Top header shows "Puck Unified Builder"
- [ ] Mode selector visible (Suggest | Chat | Build)
- [ ] Console has no errors (only warnings OK)

**Debug if failing:**
```bash
# Check if files exist
ls -la /workspaces/my-website1/apps/web/components/UnifiedPuckAIBuilder.tsx
ls -la /workspaces/my-website1/apps/web/components/puck.config.ts

# Check imports in UnifiedPuckAIBuilder
grep -n "puck.config" /workspaces/my-website1/apps/web/components/UnifiedPuckAIBuilder.tsx
```

---

### Test 1.2: All 12 Blocks Render
**Steps:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Paste:
```javascript
fetch('/api/wonder-build/ai/unified-suggestions/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'show all blocks' })
}).then(r => r.json()).then(data => console.log(data))
```

**Expected:**
- [ ] API responds with suggestions array
- [ ] Array contains suggestions for: hero, contact, grid, pricing, testimonial, cta, faq, navbar, footer, gallery, testimonialCarousel, aiChat
- [ ] Each has: id, name, reason, icon, shadonComponents, score
- [ ] No errors in response

---

## Test Suite 2: UI Interactions

### Test 2.1: Mode Selector Works
**Steps:**
1. Click dropdown at top-right (should show "Suggest")
2. Select "Chat"
3. Observe sidebar

**Expected:**
- [ ] Sidebar shows chat interface with message input
- [ ] "Suggest" mode: shows AI input + suggestions button
- [ ] "Chat" mode: shows conversation interface
- [ ] "Build" mode: shows full-page generation interface

---

### Test 2.2: Suggest Mode - Enter Prompt
**Steps:**
1. Ensure you're in "Suggest" mode
2. Type in input: "I need a contact form"
3. Press Enter or click "Get Suggestions"
4. Wait 1-2 seconds

**Expected:**
- [ ] Suggestions appear in sidebar below input
- [ ] At least 3 suggestions visible
- [ ] "contact" block should be first (highest score ~95)
- [ ] Each suggestion shows: name, icon, reason
- [ ] Suggestions have `+` button or are draggable

---

### Test 2.3: Add Block via Suggestion
**Steps:**
1. From Test 2.2, click `+` on "Contact Form" suggestion
2. Wait 1 second
3. Observe Puck canvas

**Expected:**
- [ ] New block appears in canvas (left side)
- [ ] Block is labeled "Contact Form"
- [ ] Block shows form fields: name, email, message inputs
- [ ] Block has "Send Message" button

**Debug if block doesn't appear:**
```bash
# Check puck.config has contact block
grep -n "contact:" /workspaces/my-website1/apps/web/components/puck.config.ts

# Check render function exists
grep -n "const ContactBlock" /workspaces/my-website1/apps/web/components/puck.config.ts
```

---

### Test 2.4: Edit Block Properties
**Steps:**
1. Click on the contact form block in canvas
2. Right panel should show editable fields
3. Change "Form Title" from "Get In Touch" to "Contact Us"
4. Change button text from "Send Message" to "Submit"

**Expected:**
- [ ] Right panel shows form fields
- [ ] Changes apply immediately in canvas
- [ ] Block preview updates in real-time

---

### Test 2.5: Add Multiple Blocks
**Steps:**
1. Type new prompt: "Add a hero section and pricing"
2. Get suggestions
3. Click `+` on hero block
4. Wait, then click `+` on pricing block

**Expected:**
- [ ] Both blocks added to canvas in order
- [ ] Hero appears first (or where you added it)
- [ ] Pricing appears below
- [ ] Canvas shows all blocks

---

### Test 2.6: Reorder Blocks
**Steps:**
1. With 2+ blocks on canvas
2. Drag pricing block above hero block

**Expected:**
- [ ] Dragging is smooth
- [ ] Block reorders in canvas
- [ ] Block order updates in real-time

**Note:** If this fails, drag-and-drop between blocks may need implementation work.

---

## Test Suite 3: History & Persistence

### Test 3.1: Auto-Save to localStorage
**Steps:**
1. Open dev tools (F12)
2. Go to Application > localStorage
3. Search for key starting with "puck_"
4. Add a block to canvas (hero)
5. Wait 31 seconds (auto-save interval)
6. Refresh localStorage view

**Expected:**
- [ ] localStorage key "puck_current_page" exists
- [ ] Value is JSON with blocks array
- [ ] After adding block and waiting 30s, JSON updated
- [ ] JSON contains block data for hero

**Debug:**
```js
// In browser console:
localStorage.getItem('puck_current_page')
```

---

### Test 3.2: Undo/Redo
**Steps:**
1. Add a block (hero)
2. Add another block (contact)
3. Press Ctrl+Z (or Cmd+Z on Mac)
4. Canvas should remove last block
5. Press Ctrl+Shift+Z to redo

**Expected:**
- [ ] After Ctrl+Z: contact block removed, hero remains
- [ ] After Ctrl+Shift+Z: contact block restored
- [ ] Can undo/redo multiple times

---

### Test 3.3: Persist Across Browser Refresh
**Steps:**
1. Add hero + contact block
2. Press F5 to refresh page
3. Wait 2 seconds

**Expected:**
- [ ] Page reloads
- [ ] Hero + contact blocks are still there
- [ ] Content restored from localStorage

---

## Test Suite 4: AI Suggestions Accuracy

### Test 4.1: Exact Keyword Match
**Prompt:** "contact form"
**Expected:** contact block score 95+ (first suggestion)
**Test Command:**
```javascript
fetch('/api/wonder-build/ai/unified-suggestions/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'contact form',
    currentBlocks: [] 
  })
}).then(r => r.json()).then(data => {
  console.log(data.suggestions[0]);
  console.assert(data.suggestions[0].id === 'contact', 'Contact should be first');
})
```

### Test 4.2: Partial Keyword Match
**Prompt:** "collect customer information"
**Expected:** contact block appears in suggestions (should be high)
**Test Command:**
```javascript
fetch('/api/wonder-build/ai/unified-suggestions/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'collect customer information',
    currentBlocks: [] 
  })
}).then(r => r.json()).then(data => {
  const hasContact = data.suggestions.some(s => s.id === 'contact');
  console.assert(hasContact, 'Contact should be suggested');
})
```

### Test 4.3: Deduplication
**Steps:**
1. Add hero block to canvas
2. Type prompt: "add a hero section"
3. Get suggestions

**Expected:**
- [ ] Hero block NOT in suggestions
- [ ] Other blocks suggested instead
- [ ] Avoids duplicate suggestions

---

### Test 4.4: Intent-Based Suggestions
**Prompt:** "landing page for SaaS"
**Expected:** navbar + hero + grid (features) + pricing + testimonial + cta + footer suggested
**Test:**
```javascript
fetch('/api/wonder-build/ai/unified-suggestions/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'landing page for SaaS',
    currentBlocks: [] 
  })
}).then(r => r.json()).then(data => {
  console.log('Suggestions:', data.suggestions.map(s => s.id));
  // Should include navbar, hero, grid, pricing
})
```

---

## Test Suite 5: Export/Import

### Test 5.1: Export as JSON
**Steps:**
1. Add hero + contact blocks
2. Click "Export" button (bottom toolbar)
3. JSON file should download

**Expected:**
- [ ] File downloads (check Downloads folder)
- [ ] File opens in text editor
- [ ] Contains valid JSON
- [ ] JSON has "blocks" array with 2 items
- [ ] Each block has "type" matching "hero" or "contact"

**Verify JSON:**
```bash
# Check file is valid JSON
cat ~/Downloads/page-export-*.json | python -m json.tool
```

---

### Test 5.2: Export as HTML
**Steps:**
1. Click "Download" button
2. HTML file should download

**Expected:**
- [ ] File downloads
- [ ] File is .html
- [ ] Opens in browser
- [ ] Shows rendered page with blocks

---

### Test 5.3: Copy JSON
**Steps:**
1. Click "Copy JSON" button

**Expected:**
- [ ] JSON copied to clipboard
- [ ] Can paste into editor
- [ ] Valid JSON paste succeeds

---

## Test Suite 6: Shadon Component Integration

### Test 6.1: Button Component Renders
**Steps:**
1. Add hero block
2. Check if hero has a button

**Expected:**
- [ ] Button renders with Shadon Button component
- [ ] Button is clickable
- [ ] Button text is customizable

---

### Test 6.2: Card Component Renders
**Steps:**
1. Add grid or testimonial block
2. Check card rendering

**Expected:**
- [ ] Card from Shadon renders
- [ ] Has proper styling
- [ ] CardTitle and CardDescription visible

---

### Test 6.3: Badge Component Renders
**Steps:**
1. Add testimonial or pricing block
2. Check for badges

**Expected:**
- [ ] Badge component visible
- [ ] Properly styled with Shadon theme

---

### Test 6.4: Alert Component Renders
**Steps:**
1. Add FAQ block
2. Check for alert components

**Expected:**
- [ ] Alert renders
- [ ] Shows title and description
- [ ] Styled consistently

---

## Test Suite 7: Performance

### Test 7.1: Initial Load Time
**Steps:**
1. Visit `/builder/puck-unified` in fresh browser window
2. Open dev tools Network tab
3. Reload page
4. Check "DOMContentLoaded" time

**Expected:**
- [ ] Page loads in < 2 seconds
- [ ] Total resources < 2MB
- [ ] No slow network requests

---

### Test 7.2: Block Render Performance
**Steps:**
1. Add 12 blocks (one of each type)
2. Open dev tools Performance tab
3. Record while re-rendering via edit
4. Check frame rate

**Expected:**
- [ ] 60 FPS or close to it
- [ ] No jank when dragging
- [ ] Smooth scrolling

---

### Test 7.3: AI Suggestion Latency
**Steps:**
1. Open dev tools Network tab
2. Type prompt and submit
3. Check request time

**Expected:**
- [ ] API responds in < 500ms
- [ ] Suggestions appear within 1 second

---

## Test Suite 8: Error Handling

### Test 8.1: Invalid API Response
**Steps:**
1. Modify API response (inject error)
2. Try to get suggestions

**Expected:**
- [ ] Error message displayed to user
- [ ] No crash or blank sidebar
- [ ] Can retry

---

### Test 8.2: Network Failure
**Steps:**
1. Open dev tools
2. Go to Throttling: set to "Offline"
3. Try to get suggestions

**Expected:**
- [ ] Friendly error message appears
- [ ] Suggestion sidebar shows retry button
- [ ] No console errors

---

### Test 8.3: localStorage Full
**Steps:**
1. Fill localStorage to limit (dev tools can simulate)
2. Try to auto-save

**Expected:**
- [ ] App doesn't crash
- [ ] Warning message if applicable
- [ ] Can still continue building

---

## Test Suite 9: Mobile/Responsive

### Test 9.1: Mobile View
**Steps:**
1. Open dev tools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Set to iPhone 12
4. Navigate to `/builder/puck-unified`

**Expected:**
- [ ] Layout adapts to mobile
- [ ] Sidebar accessible (stack or drawer)
- [ ] Canvas visible and usable
- [ ] No horizontal scroll

---

### Test 9.2: Tablet View
**Steps:**
1. Set device to iPad
2. Check layout

**Expected:**
- [ ] Split pane visible
- [ ] All controls accessible
- [ ] Reasonable zoom level

---

## Test Suite 10: All 12 Blocks

### Render Each Block
For each block, verify it:
1. Renders on canvas ✓
2. Shows in suggestions when prompted ✓
3. Has editable properties ✓
4. Exports correctly in JSON ✓

**Test:** [Use AI suggestions to render each]

- [ ] Hero - "I need a hero section"
- [ ] Contact - "I need a contact form"
- [ ] Grid - "I need a feature grid"
- [ ] Pricing - "I need a pricing table"
- [ ] Testimonial - "I need a testimonial"
- [ ] CTA - "I need a call to action"
- [ ] FAQ - "I need a FAQ section"
- [ ] Navbar - "I need navigation"
- [ ] Footer - "I need a footer"
- [ ] Gallery - "I need a gallery"
- [ ] Testimonial Carousel - "I need multiple testimonials"
- [ ] AI Chat - "I need a chat widget"

---

## Test Suite 11: Complete Workflow

### Build a Landing Page
**Steps:**
1. Open `/builder/puck-unified`
2. Type: "Build a landing page for a cloud storage app"
3. Add suggested blocks
4. Edit each block's content
5. Reorder if desired
6. Export as JSON
7. Refresh page
8. Verify content restored

**Expected:**
- [ ] All steps complete without error
- [ ] Final page looks professional
- [ ] Can be exported and shared

---

## Manual Testing Report Template

```markdown
# Test Report - Unified Builder

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [DEV/STAGING/PROD]

## Test Results

### Suite 1: Component Loading
- [ ] 1.1: ✅ PASS / ❌ FAIL / ⚠️  SKIP
- [ ] 1.2: ✅ PASS / ❌ FAIL / ⚠️  SKIP

### Suite 2: UI Interactions
- [ ] 2.1: ✅ PASS / ❌ FAIL / ⚠️  SKIP
... etc

## Issues Found
1. [Issue 1]
2. [Issue 2]

## Recommendations
1. [Suggestion 1]

## Sign-off
✅ Ready for deployment / ❌ Needs fixes / ⚠️  On hold
```

---

## Automated Test Examples

### Test with Cypress (Optional)

```javascript
// cypress/e2e/unified-builder.cy.js
describe('Unified Builder', () => {
  beforeEach(() => {
    cy.visit('/builder/puck-unified');
  });

  it('should load editor', () => {
    cy.contains('Puck Unified Builder').should('exist');
    cy.get('[data-testid="puck-canvas"]').should('exist');
    cy.get('[data-testid="ai-sidebar"]').should('exist');
  });

  it('should add block via suggestion', () => {
    cy.get('[data-testid="ai-input"]').type('contact form');
    cy.get('[data-testid="get-suggestions"]').click();
    cy.get('[data-testid="suggestion-contact"]').click();
    cy.get('[data-testid="block-contact"]').should('exist');
  });
});
```

---

## Success Criteria

### All Tests Must Pass ✅
- [x] Component loads without errors
- [x] All 12 blocks render
- [x] AI suggestions work
- [x] Add/remove/reorder blocks works
- [x] Undo/redo works
- [x] Auto-save to localStorage works
- [x] Content persists across refresh
- [x] Export works
- [x] Shadon components integrated
- [x] No console errors
- [x] Performance acceptable
- [x] Mobile responsive

### Deployment Readiness
✅ **READY FOR TESTING** if all tests pass

---

## Quick Test Shortcut

**Run this in browser console to test core functionality:**

```javascript
// Quick test of AI suggestions
async function quickTest() {
  const tests = [];
  
  // Test 1: API responds
  const res = await fetch('/api/wonder-build/ai/unified-suggestions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', currentBlocks: [] })
  });
  const data = await res.json();
  tests.push({ name: 'API responds', pass: data.suggestions && data.suggestions.length > 0 });
  
  // Test 2: Blocks have required fields
  const hasRequiredFields = data.suggestions.every(s => 
    s.id && s.name && s.reason && s.icon && s.score
  );
  tests.push({ name: 'Suggestions have required fields', pass: hasRequiredFields });
  
  // Test 3: Contact scores high for "contact form"
  const res2 = await fetch('/api/wonder-build/ai/unified-suggestions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'contact form', currentBlocks: [] })
  });
  const data2 = await res2.json();
  tests.push({ 
    name: 'Contact scores high for "contact form"', 
    pass: data2.suggestions[0].id === 'contact' && data2.suggestions[0].score > 90 
  });
  
  console.table(tests);
  return tests.every(t => t.pass);
}

quickTest();
```

---

## Reporting Issues

If tests fail, please provide:
1. **Error message** (from console)
2. **Steps to reproduce**
3. **Expected vs actual** behavior
4. **Browser & OS** used
5. **Screenshot** if applicable

---

**Happy Testing! 🧪**
