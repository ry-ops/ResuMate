# ATSFlow Workflow Architecture

## Overview

ATSFlow's workflow system provides a single-page, step-based navigation experience for the 5-step resume optimization process. The architecture is built on two core modules that work together to manage state and orchestrate navigation.

## Architecture Components

### 1. WorkflowState (`js/core/workflow-state.js`)

The **WorkflowState** class manages all application state using an immutable, event-driven architecture.

#### Responsibilities
- Centralized state storage
- Immutable state updates
- State persistence (localStorage)
- State validation
- Change notification system
- State hydration/dehydration

#### Key Features
- **Immutable Updates**: All state changes create new state objects
- **Event System**: Observers can subscribe to state changes
- **Persistence**: Automatic save to localStorage
- **Validation**: Built-in validation for each workflow step
- **Path-based Access**: Get/set state using dot notation (e.g., `inputs.resume.text`)

#### State Structure

```javascript
{
  metadata: {
    version: 1,
    created: "2025-12-02T...",
    lastModified: "2025-12-02T...",
    sessionId: "session_..."
  },
  currentStep: 1,  // Current workflow step (1-5)
  steps: {
    1: { completed: false, timestamp: null, data: {...} },
    2: { completed: false, timestamp: null, data: {...} },
    3: { completed: false, timestamp: null, data: {...} },
    4: { completed: false, timestamp: null, data: {...} },
    5: { completed: false, timestamp: null, data: {...} }
  },
  inputs: {
    resume: { text: '', fileName: null, format: 'text', uploadedAt: null },
    job: { description: '', title: '', company: '', url: '', uploadedAt: null },
    preferences: { apiKey: '', theme: 'light', autoSave: true }
  },
  analysis: {
    score: null,
    matchData: null,
    suggestions: [],
    tailoringSuggestions: [],
    keywords: [],
    gaps: [],
    strengths: [],
    timestamp: null
  },
  ats: {
    score: null,
    issues: [],
    recommendations: [],
    keywords: [],
    formatting: { valid: true, issues: [] },
    timestamp: null
  },
  documents: {
    resume: null,
    coverLetter: null,
    executiveBio: null,
    brandStatement: null,
    statusInquiry: null
  },
  validation: {
    errors: [],
    warnings: []
  },
  ui: {
    loading: false,
    activePanel: null,
    modals: { export: false, settings: false }
  }
}
```

### 2. WorkflowEngine (`js/core/workflow-engine.js`)

The **WorkflowEngine** class orchestrates workflow navigation and enforces step progression rules.

#### Responsibilities
- Step navigation and routing
- Step validation before progression
- URL hash routing (#step-1, #analyze, etc.)
- Forward/backward navigation control
- Event emission for step changes
- Progress tracking

#### Key Features
- **State Machine**: Enforces linear workflow progression
- **Hash Routing**: Browser back/forward support via URL hash
- **Validation**: Each step validates before allowing progression
- **Resume/Restart**: Handles page refresh without losing state
- **Event-Driven**: Emits events for navigation, validation, completion

#### Workflow Steps

| Step | ID | Name | Hash | Description |
|------|----|----|------|-------------|
| 1 | `upload` | Upload Documents | `#step-1` | Upload resume and job description |
| 2 | `analyze` | AI Analysis | `#step-2` | Analyze resume-job match with AI |
| 3 | `tailor` | Tailor Resume | `#step-3` | Apply AI suggestions to optimize resume |
| 4 | `optimize` | ATS Optimization | `#step-4` | Optimize for ATS scanning and styling |
| 5 | `export` | Export Documents | `#step-5` | Download all application documents |

## Data Flow

```
User Action
    ↓
WorkflowEngine (navigation)
    ↓
Validation
    ↓
WorkflowState (state update)
    ↓
localStorage (persistence)
    ↓
Event Emission
    ↓
UI Update (listeners)
```

## State Flow Diagrams

### Step Progression Flow

```
┌─────────────┐
│   Step 1    │  Upload Resume & Job
│   Upload    │
└──────┬──────┘
       │ validate()
       ↓
┌─────────────┐
│   Step 2    │  AI Analysis
│   Analyze   │
└──────┬──────┘
       │ validate()
       ↓
┌─────────────┐
│   Step 3    │  Apply Suggestions
│   Tailor    │
└──────┬──────┘
       │ validate()
       ↓
┌─────────────┐
│   Step 4    │  ATS Scan & Style
│   Optimize  │
└──────┬──────┘
       │ validate()
       ↓
┌─────────────┐
│   Step 5    │  Export Documents
│   Export    │
└─────────────┘
```

### Navigation Rules

```
Current Step → Target Step → Allowed?

Step 1 → Step 1 ✅ (Current step)
Step 1 → Step 2 ✅ (If step 1 complete)
Step 1 → Step 3 ❌ (Cannot skip steps)

Step 3 → Step 2 ✅ (Backward always allowed)
Step 3 → Step 4 ✅ (If step 3 complete)
Step 3 → Step 5 ❌ (Cannot skip steps)
```

## API Reference

### WorkflowState API

#### State Access

```javascript
// Get entire state
const state = workflowState.getState();

// Get specific path
const resumeText = workflowState.get('inputs.resume.text');
const score = workflowState.get('analysis.score', 0); // with default

// Set value
workflowState.set('inputs.resume.text', 'My resume...');

// Update multiple paths
workflowState.update({
  'inputs.resume.text': 'My resume...',
  'inputs.resume.uploadedAt': new Date().toISOString()
});

// Merge object at path
workflowState.merge('inputs.job', {
  title: 'Software Engineer',
  company: 'Acme Inc'
});
```

#### Step Management

```javascript
// Mark step complete
workflowState.completeStep(1, { resumeUploaded: true });

// Mark step incomplete
workflowState.uncompleteStep(2);

// Check completion
const isComplete = workflowState.isStepComplete(1);

// Get progress
const progress = workflowState.getProgress(); // 0-100
```

#### Validation

```javascript
// Validate current state
const validation = workflowState.validate();
// {
//   valid: true,
//   errors: [],
//   warnings: []
// }
```

#### Persistence

```javascript
// Save state (automatic on updates)
workflowState.persist();

// Load state (automatic on init)
workflowState.hydrate();

// Reset to defaults
workflowState.reset();

// Export/import
const json = workflowState.export();
workflowState.import(json);
```

#### Event Listeners

```javascript
// Subscribe to changes
const unsubscribe = workflowState.on('change', (data) => {
  console.log('State changed:', data.path, data.value);
});

// Unsubscribe
unsubscribe();

// Other events: 'reset', 'import'
```

### WorkflowEngine API

#### Initialization

```javascript
// Create engine
const engine = new WorkflowEngine(workflowState);

// Initialize (sets up routing, restores state)
engine.init();
```

#### Navigation

```javascript
// Get current step
const currentStep = engine.getCurrentStep();
// { id: 1, name: 'upload', title: 'Upload Documents', ... }

// Navigate to step
engine.goToStep(2); // Go to step 2

// Advance to next step (with validation)
engine.advanceStep();

// Go to previous step
engine.previousStep();

// Navigate by name
const step = engine.getStepByName('analyze');
engine.goToStep(step.id);
```

#### Validation

```javascript
// Validate step
const validation = engine.validateStep(1);
// { valid: true, errors: [], warnings: [] }

// Check navigation permission
const canNavigate = engine.canNavigateToStep(3);
// { allowed: false, reason: 'Cannot skip steps' }
```

#### Progress Tracking

```javascript
// Get progress summary
const progress = engine.getProgress();
// {
//   currentStep: 2,
//   currentStepName: 'analyze',
//   totalSteps: 5,
//   completedSteps: 1,
//   percentage: 20,
//   isComplete: false,
//   canAdvance: true
// }

// Get all steps with status
const steps = engine.getAllSteps();
// [
//   { id: 1, name: 'upload', completed: true, current: false, ... },
//   { id: 2, name: 'analyze', completed: false, current: true, ... },
//   ...
// ]
```

#### State Management

```javascript
// Save state
engine.saveState();

// Load state
engine.loadState();

// Reset workflow
engine.reset(); // Shows confirmation
engine.reset(false); // No confirmation
```

#### Event Listeners

```javascript
// Subscribe to workflow events
const unsubscribe = engine.on('stepChange', (data) => {
  console.log('Navigated from', data.from.name, 'to', data.to.name);
});

// Unsubscribe
unsubscribe();

// Available events:
// - 'initialized'
// - 'stepChange'
// - 'navigationBlocked'
// - 'validationFailed'
// - 'workflowComplete'
// - 'reset'
```

## Integration Guide

### Step 1: Include Scripts

Add these scripts to your HTML (after existing core scripts):

```html
<!-- Core Data Management -->
<script src="js/core/data-bridge.js"></script>

<!-- Workflow System -->
<script src="js/core/workflow-state.js"></script>
<script src="js/core/workflow-engine.js"></script>

<!-- Your app code -->
<script src="app.js"></script>
```

### Step 2: Initialize Workflow

```javascript
// In your app initialization
document.addEventListener('DOMContentLoaded', () => {
  // WorkflowState and WorkflowEngine are auto-created as singletons
  // and available as window.workflowState and window.workflowEngine

  // Initialize the engine
  workflowEngine.init();

  // Listen for step changes
  workflowEngine.on('stepChange', (data) => {
    updateUI(data.to);
  });

  // Listen for validation failures
  workflowEngine.on('validationFailed', (validation) => {
    showErrors(validation.errors);
  });
});
```

### Step 3: Migrate Existing Data

```javascript
// Migrate from DataBridge to WorkflowState
function migrateExistingData() {
  if (window.dataBridge) {
    const userData = dataBridge.getUserData();

    // Migrate resume
    if (userData.resume?.text) {
      workflowState.set('inputs.resume.text', userData.resume.text);
    }

    // Migrate job
    if (userData.job?.description) {
      workflowState.update({
        'inputs.job.description': userData.job.description,
        'inputs.job.title': userData.job.title,
        'inputs.job.company': userData.job.company
      });
    }

    // Migrate analysis
    if (userData.analysis?.score) {
      workflowState.set('analysis', userData.analysis);
    }

    // Mark completed steps
    if (userData.resume?.text && userData.job?.description) {
      workflowState.completeStep(1);
    }
  }
}
```

### Step 4: Update UI Components

```javascript
// Step navigation buttons
function setupNavigation() {
  document.getElementById('next-btn').addEventListener('click', () => {
    workflowEngine.advanceStep();
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    workflowEngine.previousStep();
  });

  // Step indicator clicks
  document.querySelectorAll('.step-indicator').forEach((el, index) => {
    el.addEventListener('click', () => {
      workflowEngine.goToStep(index + 1);
    });
  });
}

// Update UI on step change
function updateUI(step) {
  // Hide all step panels
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.style.display = 'none';
  });

  // Show current step panel
  const panel = document.getElementById(`step-${step.id}-panel`);
  if (panel) {
    panel.style.display = 'block';
  }

  // Update progress indicators
  updateProgressBar();
  updateStepIndicators();
}

// Progress bar
function updateProgressBar() {
  const progress = workflowEngine.getProgress();
  const bar = document.getElementById('progress-bar');
  bar.style.width = `${progress.percentage}%`;
  bar.textContent = `${progress.completedSteps}/${progress.totalSteps}`;
}

// Step indicators
function updateStepIndicators() {
  const steps = workflowEngine.getAllSteps();
  steps.forEach(step => {
    const indicator = document.querySelector(`[data-step="${step.id}"]`);
    indicator.classList.toggle('completed', step.completed);
    indicator.classList.toggle('current', step.current);
  });
}
```

### Step 5: Implement Step Logic

```javascript
// Step 1: Upload
async function handleResumeUpload(file) {
  const text = await parseFile(file);

  workflowState.update({
    'inputs.resume.text': text,
    'inputs.resume.fileName': file.name,
    'inputs.resume.uploadedAt': new Date().toISOString()
  });

  checkUploadComplete();
}

function checkUploadComplete() {
  const hasResume = !!workflowState.get('inputs.resume.text');
  const hasJob = !!workflowState.get('inputs.job.description');

  if (hasResume && hasJob) {
    workflowState.completeStep(1);
    // Enable "Next" button
    document.getElementById('next-btn').disabled = false;
  }
}

// Step 2: Analyze
async function analyzeResume() {
  const resume = workflowState.get('inputs.resume.text');
  const job = workflowState.get('inputs.job.description');

  const analysis = await callAI(resume, job);

  workflowState.update({
    'analysis.score': analysis.score,
    'analysis.suggestions': analysis.suggestions,
    'analysis.timestamp': new Date().toISOString()
  });

  workflowState.completeStep(2);
  workflowEngine.advanceStep();
}

// Step 3: Tailor
function applySuggestion(suggestion) {
  const applied = workflowState.get('steps.3.data.appliedSuggestions', []);
  applied.push(suggestion.id);

  workflowState.set('steps.3.data.appliedSuggestions', applied);
}

function finishTailoring() {
  workflowState.completeStep(3);
  workflowEngine.advanceStep();
}

// Step 4: Optimize
async function runATSCheck() {
  const resume = workflowState.get('inputs.resume.text');
  const atsResult = await atsScanner.scan(resume);

  workflowState.update({
    'ats.score': atsResult.score,
    'ats.issues': atsResult.issues,
    'ats.timestamp': new Date().toISOString()
  });

  workflowState.completeStep(4);
  workflowEngine.advanceStep();
}

// Step 5: Export
async function generateDocuments() {
  const documents = await documentGenerator.generateAll();

  workflowState.set('documents', documents);
  workflowState.completeStep(5);
}
```

## URL Hash Routing

The workflow engine supports URL hash-based routing for browser navigation:

### Hash Formats

```
#step-1      → Step 1 (Upload)
#step-2      → Step 2 (Analyze)
#step-3      → Step 3 (Tailor)
#step-4      → Step 4 (Optimize)
#step-5      → Step 5 (Export)

#upload      → Step 1 (alias)
#analyze     → Step 2 (alias)
#tailor      → Step 3 (alias)
#optimize    → Step 4 (alias)
#export      → Step 5 (alias)
```

### Browser Back/Forward

The engine automatically:
- Updates URL hash on navigation
- Listens for hashchange events
- Restores step from hash on page load
- Validates navigation permissions

## State Persistence

### Automatic Persistence

State is automatically saved to localStorage on every update:

```javascript
// These automatically persist:
workflowState.set('inputs.resume.text', 'My resume');
workflowState.completeStep(1);
workflowEngine.goToStep(2);
```

### Manual Persistence

```javascript
// Force save (usually not needed)
workflowState.persist();

// Force load (usually not needed)
workflowState.hydrate();
```

### Storage Keys

```
resumate_workflow_state     → WorkflowState data
resumate_user_data          → DataBridge data (legacy)
resumate_progress           → ProgressTracker data (legacy)
```

## Page Refresh Handling

The workflow system handles page refresh without losing state:

1. **On Page Load**:
   - WorkflowState automatically hydrates from localStorage
   - WorkflowEngine reads URL hash
   - If hash exists, navigates to that step
   - Otherwise, navigates to saved current step

2. **State Restoration**:
   ```javascript
   // This happens automatically in init()
   workflowEngine.init();
   ```

## Validation System

Each step has validation rules that must pass before advancing:

### Step 1: Upload
- Resume text required (min 100 chars)
- Job description required (min 50 chars)

### Step 2: Analyze
- Analysis score must exist
- Suggestions array must be populated

### Step 3: Tailor
- Tailoring suggestions available (warning only)
- At least one suggestion applied (warning only)

### Step 4: Optimize
- ATS score must exist
- ATS score should be 60+ (warning if lower)

### Step 5: Export
- At least one document generated (warning only)

### Custom Validation

```javascript
// Add custom validation
workflowEngine.on('stepChange', (data) => {
  if (data.to.id === 3) {
    // Custom validation for step 3
    const validation = customValidate();
    if (!validation.valid) {
      showErrors(validation.errors);
    }
  }
});
```

## Event System

Both WorkflowState and WorkflowEngine emit events:

### WorkflowState Events

```javascript
workflowState.on('change', data => {
  // Fired on any state change
  // data: { path, value, state }
});

workflowState.on('reset', data => {
  // Fired when state is reset
  // data: { state }
});

workflowState.on('import', data => {
  // Fired when state is imported
  // data: { state }
});
```

### WorkflowEngine Events

```javascript
workflowEngine.on('initialized', data => {
  // Fired when engine initializes
  // data: { currentStep }
});

workflowEngine.on('stepChange', data => {
  // Fired on step navigation
  // data: { from, to, stepId }
});

workflowEngine.on('navigationBlocked', data => {
  // Fired when navigation is blocked
  // data: { stepId, reason }
});

workflowEngine.on('validationFailed', data => {
  // Fired when validation fails
  // data: { valid, errors, warnings }
});

workflowEngine.on('workflowComplete', data => {
  // Fired when all steps complete
  // data: { completedAll }
});

workflowEngine.on('reset', data => {
  // Fired when workflow resets
  // data: { resetAt }
});
```

## Best Practices

### 1. State Management

```javascript
// ✅ Good: Use immutable updates
workflowState.set('inputs.resume.text', newValue);

// ❌ Bad: Direct mutation
const state = workflowState.getState();
state.inputs.resume.text = newValue; // Won't persist!
```

### 2. Navigation

```javascript
// ✅ Good: Use engine for navigation
workflowEngine.goToStep(2);

// ❌ Bad: Direct state manipulation
workflowState.set('currentStep', 2); // Bypasses validation!
```

### 3. Event Listeners

```javascript
// ✅ Good: Unsubscribe when done
const unsubscribe = engine.on('stepChange', handler);
// Later...
unsubscribe();

// ❌ Bad: Memory leak
engine.on('stepChange', handler); // Never unsubscribed
```

### 4. Validation

```javascript
// ✅ Good: Validate before advancing
const validation = engine.validateStep(currentStep);
if (validation.valid) {
  engine.advanceStep();
}

// ❌ Bad: Skip validation
engine.advanceStep({ skipValidation: true }); // Only for special cases!
```

## Migration from Legacy Systems

### From DataBridge

```javascript
// Old DataBridge code
dataBridge.saveResume(resumeText);

// New WorkflowState code
workflowState.set('inputs.resume.text', resumeText);
```

### From ProgressTracker

```javascript
// Old ProgressTracker code
progressTracker.markComplete('resume_uploaded');

// New WorkflowState + WorkflowEngine code
workflowState.completeStep(1);
```

## Troubleshooting

### Issue: State not persisting

```javascript
// Check if state is saving
console.log('Persist result:', workflowState.persist());

// Check localStorage
console.log(localStorage.getItem('resumate_workflow_state'));
```

### Issue: Navigation not working

```javascript
// Check current step
console.log('Current:', workflowEngine.getCurrentStep());

// Check navigation permission
console.log('Can go to 3:', workflowEngine.canNavigateToStep(3));

// Check validation
console.log('Valid:', workflowEngine.validateStep(1));
```

### Issue: Events not firing

```javascript
// Verify listener is attached
workflowEngine.on('stepChange', data => {
  console.log('Step changed!', data);
});

// Test navigation
workflowEngine.goToStep(2);
```

## Performance Considerations

- **State Updates**: Immutable updates create new objects, but this is fast for reasonable data sizes
- **Persistence**: localStorage writes are synchronous but fast for JSON sizes <1MB
- **Event Listeners**: Clean up listeners to prevent memory leaks
- **Validation**: Validation runs on every advance, keep validators lightweight

## Future Enhancements

Potential future additions:
- Step-specific sub-states
- Conditional step skipping
- Parallel workflow branches
- Undo/redo functionality
- State snapshots/checkpoints
- Cloud state sync

## Support

For questions or issues:
- Check console logs: `[WorkflowState]` and `[WorkflowEngine]` prefixes
- View state: `workflowState.getSummary()`
- View progress: `workflowEngine.getProgress()`

## Version History

- **v1.0.0** (2025-12-02): Initial release
  - WorkflowState class
  - WorkflowEngine class
  - 5-step workflow
  - Hash routing
  - State persistence
