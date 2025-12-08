# ATSFlow UI Components - Quick Reference

## Component Overview

### 1. Getting Started Modal
**Purpose:** Welcome users and track onboarding progress

**Initialization:**
```javascript
const modal = new GettingStartedModal();
modal.initialize();
```

**API Methods:**
```javascript
modal.show()                    // Show modal
modal.hide()                    // Hide modal
modal.completeStep('stepKey')   // Mark step complete
modal.isComplete()              // Check if all steps done
modal.reset()                   // Reset all progress
```

**Events:**
```javascript
// Automatically listens to:
// - #resume-text (input)
// - #resume-file (change)
// - #job-text (input)
// - #job-url (input)
// - #api-key (input)
```

**Storage:**
- Progress: `sessionStorage` (resets on browser close)
- API Key: `localStorage` (persistent)

---

### 2. Job Indicator
**Purpose:** Real-time visual feedback for job description status

**Initialization:**
```javascript
const indicator = new JobIndicator();
indicator.initialize();
```

**API Methods:**
```javascript
indicator.setHasJob(true)   // Update status manually
indicator.getStatus()       // Returns true/false
indicator.checkJobStatus()  // Check and update from inputs
```

**Events Dispatched:**
```javascript
window.addEventListener('jobStatusChanged', (e) => {
  console.log(e.detail.hasJob); // true or false
});
```

**Styling:**
```css
.job-indicator              // Container
.job-indicator.has-job      // Active state
.job-indicator-icon         // Icon wrapper
.job-indicator-text         // Text wrapper
```

---

### 3. Resume Preview
**Purpose:** Smart preview with markdown-like formatting and editing

**Initialization:**
```javascript
const preview = new ResumePreview('container-id');
preview.initialize();
```

**API Methods:**
```javascript
preview.updatePreview(text)    // Update with new content
preview.toggleEditMode()       // Toggle edit/view mode
preview.getContent()           // Get current content
preview.clear()                // Clear preview
preview.showEmptyState()       // Show empty state
```

**Events Dispatched:**
```javascript
window.addEventListener('resumePreviewUpdated', (e) => {
  console.log(e.detail.content); // Resume text
});
```

**Markdown Support:**
```markdown
# Header 1               -> <h1>
## Header 2              -> <h2>
ALL CAPS TEXT           -> <h2>
**bold** or __bold__    -> <strong>
*italic* or _italic_    -> <em>
[text](url)             -> <a href>
email@example.com       -> <a href="mailto:">
- Bullet item           -> <li>
```

---

## Workflow UI Enhancements

### Button States

**Loading State:**
```javascript
btn.innerHTML = '<span class="btn-spinner"></span> Loading...';
btn.disabled = true;
```

**Success State:**
```javascript
btn.innerHTML = '<span class="btn-check">✓</span> Success!';
btn.classList.add('btn-success');
```

**Normal State:**
```javascript
btn.innerHTML = 'Continue <span class="btn-icon">→</span>';
btn.disabled = false;
btn.classList.remove('btn-success');
```

### Step Navigation

**Navigate to Step:**
```javascript
workflowUI.goToStep(2);  // Go to step 2
```

**Next/Previous:**
```javascript
workflowUI.goToNextStep();
workflowUI.goToPreviousStep();
```

**Update Progress:**
```javascript
workflowUI.updateProgress(stepNumber);
```

**Events:**
```javascript
window.addEventListener('stepChanged', (e) => {
  console.log('Now on step:', e.detail.step);
});
```

---

## CSS Classes Reference

### Getting Started Modal
```css
.getting-started-modal          // Root container
.getting-started-modal.visible  // Visible state
.getting-started-content        // Modal content
.step-item                      // Step item
.step-item.complete             // Completed step
.progress-fill                  // Progress bar fill
```

### Job Indicator
```css
.job-indicator                  // Root container
.job-indicator.has-job          // Active state
.job-indicator-icon             // Icon wrapper
.icon-empty                     // Empty icon
.icon-filled                    // Filled icon
.job-indicator-text             // Text wrapper
.text-empty                     // Empty text
.text-filled                    // Filled text
```

### Resume Preview
```css
.resume-preview-wrapper                 // Root container
.resume-preview-wrapper.edit-mode       // Edit mode active
.resume-preview-toolbar                 // Toolbar
.resume-preview-content                 // Content area
.resume-content                         // Formatted content
.preview-empty-state                    // Empty state
```

### Workflow Buttons
```css
.btn-continue                   // Continue button
.btn-continue:disabled          // Disabled state
.btn-back                       // Back button
.btn-spinner                    // Loading spinner
.btn-check                      // Success checkmark
.btn-success                    // Success state
.btn-icon                       // Button icon
```

### Workflow Steps
```css
.workflow-step                  // Step container
.workflow-step.active           // Active step
.workflow-step.locked           // Locked step
.workflow-step.exiting          // Exiting animation
.progress-dot                   // Progress indicator dot
.progress-dot.active            // Active dot
.progress-dot.completed         // Completed dot
.progress-dot.locked            // Locked dot
```

---

## Animation Classes

```css
/* Available animations */
slideInUp       /* Slide in from bottom */
slideOutDown    /* Slide out to top */
fadeIn          /* Fade in */
fadeOut         /* Fade out */
spin            /* Continuous rotation */
pulse-ring      /* Pulsing ring effect */
bounce          /* Bounce effect */
scaleIn         /* Scale from 0 to 1 */
successPulse    /* Success pulse effect */
```

---

## Common Patterns

### Show Loading on Button Click
```javascript
btn.addEventListener('click', async () => {
  // Show loading
  btn.innerHTML = '<span class="btn-spinner"></span> Processing...';
  btn.disabled = true;

  try {
    // Do async work
    await someAsyncFunction();

    // Show success
    btn.innerHTML = '<span class="btn-check">✓</span> Done!';
    btn.classList.add('btn-success');

    // Navigate after delay
    setTimeout(() => {
      workflowUI.goToNextStep();
    }, 1000);
  } catch (error) {
    // Show error
    btn.innerHTML = 'Error - Try Again';
    btn.disabled = false;
  }
});
```

### Listen for Resume Updates
```javascript
window.addEventListener('resumePreviewUpdated', (e) => {
  const resumeText = e.detail.content;
  // Do something with updated resume
  updateAnalysis(resumeText);
});
```

### Check Onboarding Progress
```javascript
if (gettingStartedModal.isComplete()) {
  // All onboarding steps done
  enableAdvancedFeatures();
} else {
  // Show modal to complete remaining steps
  gettingStartedModal.show();
}
```

### Monitor Job Status
```javascript
window.addEventListener('jobStatusChanged', (e) => {
  if (e.detail.hasJob) {
    // Job description added
    enableTailoringButton();
  } else {
    // No job description
    disableTailoringButton();
  }
});
```

---

## Debugging

### Check Component Status
```javascript
// Getting Started Modal
console.log(gettingStartedModal.progressSteps);
console.log(gettingStartedModal.isComplete());

// Job Indicator
console.log(jobIndicator.hasJob);
console.log(jobIndicator.getStatus());

// Resume Preview
console.log(resumePreview.resumeData);
console.log(resumePreview.isEditable);

// Workflow UI
console.log(workflowUI.currentStep);
console.log(workflowUI.stepData);
```

### Console Logging
All components log initialization:
```
[GettingStartedModal] Initialized
[JobIndicator] Initialized
[JobIndicator] Status updated: Has job
[ResumePreview] Initialized
[WorkflowUI] UI initialized
[WorkflowUI] Navigating from step 1 to 2
```

### Common Issues

**Modal doesn't show:**
```javascript
// Force show
gettingStartedModal.show();

// Reset and show
gettingStartedModal.reset();
```

**Indicator stuck:**
```javascript
// Force update
jobIndicator.checkJobStatus();

// Manual override
jobIndicator.setHasJob(true);
```

**Preview blank:**
```javascript
// Force update
const resumeText = document.getElementById('resume-text').value;
resumePreview.updatePreview(resumeText);

// Check data
console.log(resumePreview.resumeData);
```

---

## Browser DevTools

### sessionStorage
```javascript
// View onboarding progress
sessionStorage.getItem('resumate_onboarding_progress')

// Clear progress
sessionStorage.removeItem('resumate_onboarding_progress')

// Reset everything
sessionStorage.clear()
```

### localStorage
```javascript
// View API key
localStorage.getItem('api-key')

// View old progress (if exists)
localStorage.getItem('resumate_progress')

// Clear API key
localStorage.removeItem('api-key')
```

### Custom Events
```javascript
// Listen to all custom events
['stepChanged', 'jobStatusChanged', 'resumePreviewUpdated'].forEach(event => {
  window.addEventListener(event, (e) => {
    console.log(`Event: ${event}`, e.detail);
  });
});
```

---

## Performance Tips

1. **Lazy Load Components**
   ```javascript
   // Only create when needed
   let preview = null;
   function getPreview() {
     if (!preview) {
       preview = new ResumePreview('preview');
       preview.initialize();
     }
     return preview;
   }
   ```

2. **Debounce Input Handlers**
   ```javascript
   let timeout;
   input.addEventListener('input', () => {
     clearTimeout(timeout);
     timeout = setTimeout(() => {
       preview.updatePreview(input.value);
     }, 300);
   });
   ```

3. **Use CSS Transforms**
   ```css
   /* Good - GPU accelerated */
   transform: translateX(10px);

   /* Avoid - causes reflow */
   left: 10px;
   ```

---

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate buttons
- Escape to close modals

### Screen Readers
- All buttons have aria-labels
- Steps have aria-current
- Hidden elements have aria-hidden
- Live regions for dynamic updates

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  /* Increased borders and outlines */
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Minimal or no animations */
}
```

---

## Best Practices

1. **Always initialize in DOMContentLoaded**
2. **Check if component exists before using**
3. **Handle errors gracefully**
4. **Provide user feedback for all actions**
5. **Test in both light and dark themes**
6. **Verify accessibility with screen readers**
7. **Test on mobile devices**
8. **Monitor console for warnings**

---

**Quick Reference Version:** 1.0.0
**Last Updated:** 2025-12-02
