/**
 * WorkflowUI - Step-based workflow UI controller
 * Manages step visibility, progress tracking, and navigation
 * Version: 1.0.0
 */

class WorkflowUI {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.stepData = {};
    this.animationDuration = 500; // ms

    // Step configuration
    this.steps = [
      {
        id: 'step-upload',
        number: 1,
        name: 'Upload',
        continueBtn: 'step-1-continue'
      },
      {
        id: 'step-analyze',
        number: 2,
        name: 'Analyze',
        continueBtn: 'step-2-continue'
      },
      {
        id: 'step-tailor',
        number: 3,
        name: 'Tailor',
        continueBtn: 'step-3-continue',
        skipBtn: 'step-3-skip'
      },
      {
        id: 'step-edit',
        number: 4,
        name: 'Edit',
        continueBtn: 'step-4-continue'
      },
      {
        id: 'step-export',
        number: 5,
        name: 'Export',
        finishBtn: 'step-5-finish'
      }
    ];
  }

  /**
   * Initialize the workflow UI
   */
  initialize() {
    console.log('[WorkflowUI] Initializing...');

    // Setup event listeners
    this.setupProgressDots();
    this.setupNavigationButtons();
    this.setupFileUploads();
    this.setupTextInputs();
    this.setupExportButtons();

    // Set initial state
    this.showStep(1);
    this.updateProgress(1);

    console.log('[WorkflowUI] Initialized successfully');
  }

  /**
   * Setup progress dot click handlers
   */
  setupProgressDots() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const stepNumber = parseInt(dot.dataset.step);
        if (!dot.classList.contains('locked') && stepNumber !== this.currentStep) {
          this.goToStep(stepNumber);
        }
      });
    });
  }

  /**
   * Setup navigation button handlers (Continue/Back)
   */
  setupNavigationButtons() {
    // Continue buttons
    this.steps.forEach(step => {
      if (step.continueBtn) {
        const btn = document.getElementById(step.continueBtn);
        if (btn) {
          btn.addEventListener('click', () => {
            this.handleContinue(step.number);
          });
        }
      }

      if (step.skipBtn) {
        const btn = document.getElementById(step.skipBtn);
        if (btn) {
          btn.addEventListener('click', () => {
            this.goToStep(step.number + 1);
          });
        }
      }

      if (step.finishBtn) {
        const btn = document.getElementById(step.finishBtn);
        if (btn) {
          btn.addEventListener('click', () => {
            this.resetWorkflow();
          });
        }
      }
    });

    // Back buttons
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToPreviousStep();
      });
    });
  }

  /**
   * Setup file upload handlers
   */
  setupFileUploads() {
    const resumeFile = document.getElementById('resume-file');
    if (resumeFile) {
      resumeFile.addEventListener('change', (e) => {
        this.handleResumeFileUpload(e.target.files[0]);
      });
    }

    const jobFile = document.getElementById('job-file');
    if (jobFile) {
      jobFile.addEventListener('change', (e) => {
        this.handleJobFileUpload(e.target.files[0]);
      });
    }
  }

  /**
   * Setup text input handlers
   */
  setupTextInputs() {
    const resumeText = document.getElementById('resume-text');
    if (resumeText) {
      resumeText.addEventListener('input', (e) => {
        this.handleResumeTextInput(e.target.value);
      });
    }

    const jobText = document.getElementById('job-text');
    if (jobText) {
      jobText.addEventListener('input', (e) => {
        this.handleJobTextInput(e.target.value);
      });
    }
  }

  /**
   * Setup export button handlers
   */
  setupExportButtons() {
    const exportButtons = document.querySelectorAll('.btn-export');
    exportButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = btn.dataset.format;
        this.handleExport(format);
      });
    });
  }

  /**
   * Navigate to a specific step
   * @param {number} stepNumber - Step number (1-5)
   */
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) {
      console.warn(`[WorkflowUI] Invalid step number: ${stepNumber}`);
      return;
    }

    // Don't navigate to locked steps
    const targetDot = document.querySelector(`.progress-dot[data-step="${stepNumber}"]`);
    if (targetDot && targetDot.classList.contains('locked')) {
      console.warn(`[WorkflowUI] Step ${stepNumber} is locked`);
      return;
    }

    console.log(`[WorkflowUI] Navigating from step ${this.currentStep} to ${stepNumber}`);

    const currentStepEl = document.getElementById(this.steps[this.currentStep - 1].id);
    const nextStepEl = document.getElementById(this.steps[stepNumber - 1].id);

    // Add exiting animation to current step
    if (currentStepEl) {
      currentStepEl.classList.add('exiting');
      currentStepEl.classList.remove('active');
    }

    // Wait for exit animation, then show next step
    setTimeout(() => {
      if (currentStepEl) {
        currentStepEl.classList.remove('exiting');
        currentStepEl.setAttribute('aria-hidden', 'true');
      }

      if (nextStepEl) {
        nextStepEl.classList.add('active');
        nextStepEl.classList.remove('locked');
        nextStepEl.setAttribute('aria-hidden', 'false');

        // Scroll to top of new step
        this.scrollToTop();
      }

      this.currentStep = stepNumber;
      this.updateProgress(stepNumber);
    }, 300);
  }

  /**
   * Show a specific step (without animation)
   * @param {number} stepNumber - Step number (1-5)
   */
  showStep(stepNumber) {
    this.steps.forEach((step, index) => {
      const stepEl = document.getElementById(step.id);
      if (stepEl) {
        if (index + 1 === stepNumber) {
          stepEl.classList.add('active');
          stepEl.classList.remove('locked');
          stepEl.setAttribute('aria-hidden', 'false');
        } else {
          stepEl.classList.remove('active');
          if (index + 1 > stepNumber) {
            stepEl.classList.add('locked');
          }
          stepEl.setAttribute('aria-hidden', 'true');
        }
      }
    });

    this.currentStep = stepNumber;
  }

  /**
   * Update progress indicator
   * @param {number} currentStep - Current step number
   */
  updateProgress(currentStep) {
    const dots = document.querySelectorAll('.progress-dot');
    const connectors = document.querySelectorAll('.progress-connector');

    dots.forEach((dot, index) => {
      const stepNum = index + 1;

      // Remove all state classes
      dot.classList.remove('active', 'completed', 'locked');

      // Update aria attributes
      if (stepNum === currentStep) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'step');
        dot.disabled = true;
      } else if (stepNum < currentStep) {
        dot.classList.add('completed');
        dot.removeAttribute('aria-current');
        dot.disabled = false;
      } else {
        dot.classList.add('locked');
        dot.removeAttribute('aria-current');
        dot.disabled = true;
      }

      // Update label for screen readers
      const label = this.steps[index].name;
      if (stepNum === currentStep) {
        dot.setAttribute('aria-label', `Step ${stepNum}: ${label} (current)`);
      } else if (stepNum < currentStep) {
        dot.setAttribute('aria-label', `Step ${stepNum}: ${label} (completed)`);
      } else {
        dot.setAttribute('aria-label', `Step ${stepNum}: ${label} (locked)`);
      }
    });

    // Update connector states
    connectors.forEach((connector, index) => {
      connector.classList.remove('completed', 'active');

      if (index + 1 < currentStep) {
        connector.classList.add('completed');
      } else if (index + 1 === currentStep - 1) {
        connector.classList.add('active');
      }
    });
  }

  /**
   * Go to previous step
   */
  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  /**
   * Go to next step
   */
  goToNextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  /**
   * Handle continue button click for a specific step
   * @param {number} stepNumber - Step number
   */
  handleContinue(stepNumber) {
    console.log(`[WorkflowUI] Continue from step ${stepNumber}`);

    switch (stepNumber) {
      case 1: // Upload -> Analyze
        this.startAnalysis();
        break;
      case 2: // Analyze -> Tailor
        this.goToNextStep();
        break;
      case 3: // Tailor -> Edit
        this.startTailoring();
        break;
      case 4: // Edit -> Export
        this.goToNextStep();
        break;
      default:
        this.goToNextStep();
    }
  }

  /**
   * Handle resume file upload
   * @param {File} file - Uploaded file
   */
  handleResumeFileUpload(file) {
    if (!file) return;

    console.log(`[WorkflowUI] Resume file uploaded: ${file.name}`);

    // Store file data
    this.stepData.resumeFile = file;

    // Enable continue button
    this.enableContinueButton(1);

    // Show file name feedback
    this.showUploadFeedback('resume-file', file.name);
  }

  /**
   * Handle resume text input
   * @param {string} text - Resume text
   */
  handleResumeTextInput(text) {
    if (text && text.trim().length > 50) {
      this.stepData.resumeText = text;
      this.enableContinueButton(1);
    } else {
      this.disableContinueButton(1);
    }
  }

  /**
   * Handle job file upload
   * @param {File} file - Uploaded file
   */
  handleJobFileUpload(file) {
    if (!file) return;

    console.log(`[WorkflowUI] Job file uploaded: ${file.name}`);
    this.stepData.jobFile = file;
    this.enableContinueButton(3);
  }

  /**
   * Handle job text input
   * @param {string} text - Job description text
   */
  handleJobTextInput(text) {
    if (text && text.trim().length > 50) {
      this.stepData.jobText = text;
      this.enableContinueButton(3);
    } else {
      this.disableContinueButton(3);
    }
  }

  /**
   * Start resume analysis
   */
  startAnalysis() {
    console.log('[WorkflowUI] Starting analysis...');

    // Navigate to analysis step
    this.goToNextStep();

    // Show loading state
    this.showLoading('analyze-loading');
    this.hideElement('analyze-results');

    // Simulate analysis (replace with actual API call)
    setTimeout(() => {
      this.showAnalysisResults();
    }, 2000);
  }

  /**
   * Show analysis results
   */
  showAnalysisResults() {
    console.log('[WorkflowUI] Showing analysis results');

    this.hideLoading('analyze-loading');
    this.showElement('analyze-results');

    // Enable continue button
    this.enableContinueButton(2);

    // Populate results (example)
    const resultsContainer = document.getElementById('analyze-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="card">
          <h3>ATS Score: <span class="score-badge score-high">85/100</span></h3>
          <p>Your resume is well-optimized for Applicant Tracking Systems.</p>
        </div>
        <div class="card">
          <h3>Key Strengths</h3>
          <ul>
            <li>Clear work experience section</li>
            <li>Relevant technical skills highlighted</li>
            <li>Quantified achievements included</li>
          </ul>
        </div>
        <div class="card">
          <h3>Improvement Opportunities</h3>
          <ul>
            <li>Add more industry-specific keywords</li>
            <li>Include metrics in project descriptions</li>
            <li>Standardize date formatting</li>
          </ul>
        </div>
      `;
    }
  }

  /**
   * Start job tailoring
   */
  startTailoring() {
    console.log('[WorkflowUI] Starting tailoring...');

    // Show loading state on button
    const btn = document.getElementById('step-3-continue');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px;"></span> Tailoring...';
      btn.disabled = true;

      // Simulate tailoring (replace with actual API call)
      setTimeout(() => {
        btn.innerHTML = originalText;
        this.goToNextStep();
      }, 2000);
    }
  }

  /**
   * Handle export
   * @param {string} format - Export format (pdf, docx, txt)
   */
  handleExport(format) {
    console.log(`[WorkflowUI] Exporting as ${format.toUpperCase()}`);

    // Show loading state
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Exporting...';
    btn.disabled = true;

    // Simulate export (replace with actual export logic)
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;

      // Show success message
      this.showExportSuccess();
    }, 1500);
  }

  /**
   * Show export success message
   */
  showExportSuccess() {
    const successEl = document.getElementById('export-success');
    if (successEl) {
      successEl.style.display = 'block';

      // Hide export options
      const optionsEl = document.querySelector('.export-options');
      if (optionsEl) {
        optionsEl.style.display = 'none';
      }
    }
  }

  /**
   * Reset workflow to initial state
   */
  resetWorkflow() {
    console.log('[WorkflowUI] Resetting workflow...');

    // Clear step data
    this.stepData = {};

    // Reset to step 1
    this.goToStep(1);

    // Clear form inputs
    const resumeText = document.getElementById('resume-text');
    if (resumeText) resumeText.value = '';

    const jobText = document.getElementById('job-text');
    if (jobText) jobText.value = '';

    // Reset continue buttons
    for (let i = 1; i <= this.totalSteps; i++) {
      this.disableContinueButton(i);
    }

    // Hide success message
    const successEl = document.getElementById('export-success');
    if (successEl) {
      successEl.style.display = 'none';
    }

    // Show export options again
    const optionsEl = document.querySelector('.export-options');
    if (optionsEl) {
      optionsEl.style.display = 'grid';
    }

    // Scroll to top
    this.scrollToTop();
  }

  /**
   * Enable continue button for a step
   * @param {number} stepNumber - Step number
   */
  enableContinueButton(stepNumber) {
    const step = this.steps[stepNumber - 1];
    if (step && step.continueBtn) {
      const btn = document.getElementById(step.continueBtn);
      if (btn) {
        btn.disabled = false;
      }
    }
  }

  /**
   * Disable continue button for a step
   * @param {number} stepNumber - Step number
   */
  disableContinueButton(stepNumber) {
    const step = this.steps[stepNumber - 1];
    if (step && step.continueBtn) {
      const btn = document.getElementById(step.continueBtn);
      if (btn) {
        btn.disabled = true;
      }
    }
  }

  /**
   * Show loading state
   * @param {string} elementId - Element ID
   */
  showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.style.display = 'block';
    }
  }

  /**
   * Hide loading state
   * @param {string} elementId - Element ID
   */
  hideLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.style.display = 'none';
    }
  }

  /**
   * Show element
   * @param {string} elementId - Element ID
   */
  showElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.style.display = 'block';
    }
  }

  /**
   * Hide element
   * @param {string} elementId - Element ID
   */
  hideElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.style.display = 'none';
    }
  }

  /**
   * Show upload feedback
   * @param {string} inputId - Input element ID
   * @param {string} fileName - Uploaded file name
   */
  showUploadFeedback(inputId, fileName) {
    const input = document.getElementById(inputId);
    if (input) {
      const label = input.parentElement;
      if (label) {
        const originalHTML = label.innerHTML;
        label.innerHTML = `
          <span class="upload-icon">✅</span>
          ${fileName}
        `;

        // Store original HTML for reset
        label.dataset.originalHtml = originalHTML;
      }
    }
  }

  /**
   * Scroll to top of workflow container
   */
  scrollToTop() {
    const container = document.querySelector('.workflow-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Get current step number
   * @returns {number} Current step number
   */
  getCurrentStep() {
    return this.currentStep;
  }

  /**
   * Get step data
   * @returns {Object} Step data object
   */
  getStepData() {
    return this.stepData;
  }

  /**
   * Set step data
   * @param {string} key - Data key
   * @param {any} value - Data value
   */
  setStepData(key, value) {
    this.stepData[key] = value;
    console.log(`[WorkflowUI] Step data updated: ${key}`);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowUI;
}
