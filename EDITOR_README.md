# ResuMate Editor Infrastructure

## Overview

The ResuMate Editor Infrastructure provides a complete drag-and-drop resume builder with state management, undo/redo history, and auto-save functionality.

## Components

### 1. State Management (`js/state.js`)

Centralized state store for the entire application.

**Features:**
- Resume sections array management
- Active section tracking
- Editor mode (edit/preview/split)
- Template and customization settings
- Event-driven architecture
- localStorage persistence

**Usage:**
```javascript
// Get singleton instance
const state = resumeState;

// Add section
state.addSection(section);

// Update section
state.updateSection(sectionId, updates);

// Reorder sections
state.reorderSections(fromIndex, toIndex);

// Listen to changes
state.on('sectionAdded', (section) => {
    console.log('Section added:', section);
});
```

### 2. Section Definitions (`js/editor/sections.js`)

20+ resume section types with schemas and templates.

**Section Types:**
- Header (required)
- Professional Summary
- Work Experience
- Education
- Skills
- Certifications
- Projects
- Achievements
- Languages
- Volunteering
- Publications
- Awards
- References
- Day in My Life
- Work Philosophy
- Key Strengths
- Passions
- Interests
- Conferences & Events
- Patents
- Professional Memberships
- Testimonials
- Custom Section

**Usage:**
```javascript
// Create a new section
const section = SectionManager.createSection(SectionTypes.EXPERIENCE);

// Get template
const template = SectionManager.getTemplate(SectionTypes.SKILLS);

// Validate section
const validation = SectionManager.validateSection(section);
if (validation.valid) {
    // Section is valid
}
```

### 3. Drag and Drop (`js/editor/dragdrop.js`)

HTML5 drag-and-drop implementation with visual feedback.

**Features:**
- Section reordering via drag-and-drop
- Visual drop indicators
- Touch support for mobile devices
- Smooth animations
- Integration with history for undo/redo

**Usage:**
```javascript
const dragDrop = new DragDropManager(state, history);

// Enable dragging for container
dragDrop.enableDragging(container);

// Refresh after DOM changes
dragDrop.refresh(container);
```

### 4. History Manager (`js/editor/history.js`)

Undo/redo functionality with 50+ state stack.

**Features:**
- 50-state undo/redo stack
- Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
- Debounced state saving
- localStorage persistence
- Timeline view
- State comparison

**Usage:**
```javascript
const history = new HistoryManager(state, {
    maxStates: 50,
    saveDebounceMs: 500
});

// Undo/Redo
history.undo();
history.redo();

// Check availability
if (history.canUndo()) {
    // Undo is available
}

// Get stats
const stats = history.getStats();
console.log('Undo count:', stats.undoCount);
```

**Keyboard Shortcuts:**
- `Cmd+Z` / `Ctrl+Z` - Undo
- `Cmd+Shift+Z` / `Ctrl+Shift+Z` - Redo
- `Cmd+Y` / `Ctrl+Y` - Redo (alternative)

### 5. Auto-Save (`js/editor/autosave.js`)

Automatic saving to localStorage every 30 seconds.

**Features:**
- Configurable save interval (default: 30s)
- Visual save indicator
- Save status tracking
- beforeunload handler
- Visibility change handler
- Force save capability

**Usage:**
```javascript
const autoSave = new AutoSaveManager(state, {
    interval: 30000,
    showIndicator: true
});

// Start/Stop
autoSave.start();
autoSave.stop();

// Force save
autoSave.forceSave();

// Get stats
const stats = autoSave.getStats();
console.log('Last saved:', stats.lastSaveText);
```

### 6. Builder Controller (`js/editor/builder.js`)

Main orchestrator that brings all components together.

**Features:**
- Complete UI setup
- Component coordination
- Section management
- Toolbar actions
- Event handling
- Import/Export

**Usage:**
```javascript
const builder = new ResumeBuilder(containerElement, {
    autoSaveInterval: 30000,
    maxHistoryStates: 50,
    enableDragDrop: true,
    enableAutoSave: true
});

// Add section
builder.addSection(SectionTypes.EXPERIENCE);

// Remove section
builder.removeSection(sectionId);

// Save/Export
builder.saveResume();
builder.exportResume();

// Get components
const state = builder.getState();
const history = builder.getHistory();
const autoSave = builder.getAutoSave();
```

## File Structure

```
ResuMate/
├── js/
│   ├── state.js                  # Centralized state management
│   └── editor/
│       ├── builder.js            # Main editor controller
│       ├── sections.js           # Section type definitions
│       ├── dragdrop.js           # HTML5 drag-and-drop
│       ├── history.js            # Undo/redo manager
│       └── autosave.js           # Auto-save system
├── css/
│   └── builder.css               # Builder UI styles
├── builder.html                  # Example integration
└── EDITOR_README.md              # This file
```

## Integration Guide

### Basic Setup

1. **Include CSS:**
```html
<link rel="stylesheet" href="css/builder.css">
```

2. **Include JavaScript modules:**
```html
<script src="js/state.js"></script>
<script src="js/editor/sections.js"></script>
<script src="js/editor/history.js"></script>
<script src="js/editor/autosave.js"></script>
<script src="js/editor/dragdrop.js"></script>
<script src="js/editor/builder.js"></script>
```

3. **Initialize builder:**
```javascript
const container = document.getElementById('builder-root');
const builder = new ResumeBuilder(container);
```

### Advanced Configuration

```javascript
const builder = new ResumeBuilder(container, {
    // Auto-save configuration
    autoSaveInterval: 30000,        // 30 seconds
    enableAutoSave: true,

    // History configuration
    maxHistoryStates: 50,           // 50 undo states

    // Feature toggles
    enableDragDrop: true,

    // Custom event handlers
    onSectionAdded: (section) => {},
    onSectionRemoved: (section) => {},
    onSave: () => {},
    onExport: () => {}
});
```

## Testing

### Manual Testing

Open `builder.html` in a browser and test:

1. **Section Management:**
   - Click "Add Section" to add sections
   - Click edit icon to edit sections
   - Click delete icon to remove sections

2. **Drag and Drop:**
   - Drag sections by the handle (⋮⋮)
   - Reorder sections
   - Verify visual feedback

3. **Undo/Redo:**
   - Add/remove/reorder sections
   - Press `Cmd+Z` to undo
   - Press `Cmd+Shift+Z` to redo
   - Verify state restoration

4. **Auto-Save:**
   - Make changes
   - Wait 30 seconds
   - Verify save indicator shows "Saved"
   - Refresh page
   - Verify data persisted

5. **State Persistence:**
   - Make changes
   - Refresh page
   - Verify data restored

### Console Testing

```javascript
// Check state
resumeBuilder.getState().getSections();

// Check history
resumeBuilder.getHistory().getStats();

// Check auto-save
resumeBuilder.getAutoSave().getStats();

// Manual operations
resumeBuilder.addSection(SectionTypes.EXPERIENCE);
resumeBuilder.saveResume();
resumeBuilder.exportResume();
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**
- HTML5 Drag and Drop API
- localStorage
- ES6 Classes
- JSON.parse/stringify

## Performance

- **State Management:** O(1) for most operations
- **History:** O(1) for undo/redo, limited to 50 states
- **Auto-Save:** Debounced to prevent excessive saves
- **Drag and Drop:** Hardware-accelerated transforms

## localStorage Usage

**Keys:**
- `resumate_state` - Current resume state (~50-100KB)
- `resumate_history` - Undo/redo history (~500KB-1MB)
- `resumate_last_save` - Last save timestamp

**Total:** ~1-2MB (well within 5-10MB limit)

## Events

### State Events
- `sectionAdded` - Section added
- `sectionRemoved` - Section removed
- `sectionUpdated` - Section updated
- `sectionsReordered` - Sections reordered
- `stateModified` - Any state change
- `stateRestored` - State restored from history
- `saveStatusChanged` - Save status changed

### History Events
- `historySaved` - State saved to history
- `undoPerformed` - Undo performed
- `redoPerformed` - Redo performed
- `historyCleared` - History cleared

### Auto-Save Events
- `autoSaveStarted` - Auto-save started
- `autoSaveStopped` - Auto-save stopped
- `autoSaveCompleted` - Save completed
- `autoSaveFailed` - Save failed

## Security

- All data stored in localStorage (client-side only)
- No server communication for core functionality
- XSS protection via content sanitization (to be added by Worker 5)
- API key encryption (to be added by Worker 5)

## Future Enhancements

These will be added by other Wave 1 workers:

- **Worker 2:** Real-time preview rendering
- **Worker 3:** Template system and customization
- **Worker 4:** AI-powered content generation
- **Worker 5:** Security audit and encryption
- **Worker 6:** PDF/DOCX import parsing

## Troubleshooting

### Auto-save not working
- Check browser console for errors
- Verify localStorage is enabled
- Check available storage space

### Drag and drop not working
- Verify `enableDragDrop: true` in options
- Check for JavaScript errors
- Ensure sections have `data-section-id` attribute

### Undo/redo not working
- Check keyboard shortcuts are not blocked
- Verify history manager is initialized
- Check console for errors

### State not persisting
- Verify localStorage is enabled
- Check for QuotaExceededError
- Clear old data if needed

## API Reference

See inline JSDoc comments in each file for detailed API documentation.

## License

Part of the ResuMate project.

## Support

For issues or questions, check the main ResuMate README or project documentation.
