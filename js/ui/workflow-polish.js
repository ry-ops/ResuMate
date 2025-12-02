/**
 * ResuMate Workflow Polish Module
 * Smooth scrolling, auto-focus, keyboard shortcuts, tooltips, and onboarding
 * Enhances user experience with professional polish
 */

class WorkflowPolish {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 0;
    this.keyboardShortcutsEnabled = true;
    this.tooltipsEnabled = true;
    this.firstTimeUser = this.checkFirstTimeUser();
    this.scrollBehavior = 'smooth';

    this.init();
  }

  /**
   * Initialize the workflow polish system
   */
  init() {
    this.detectSteps();
    this.initSmoothScroll();
    this.initKeyboardShortcuts();
    this.initFocusManagement();
    this.initTooltips();
    this.initOnboarding();
    this.initProgressTracking();
    this.attachEventListeners();
  }

  /**
   * Detect total workflow steps on the page
   */
  detectSteps() {
    const steps = document.querySelectorAll('[data-workflow-step]');
    this.totalSteps = steps.length;

    // Determine current step from active element
    const activeStep = document.querySelector('[data-workflow-step].active');
    if (activeStep) {
      this.currentStep = parseInt(activeStep.dataset.workflowStep) || 0;
    }
  }

  /**
   * Initialize smooth scroll behavior
   */
  initSmoothScroll() {
    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.scrollBehavior = 'auto';
    }
  }

  /**
   * Smooth scroll to an element
   */
  smoothScrollTo(element, offset = 80) {
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: this.scrollBehavior
    });
  }

  /**
   * Auto-scroll to next step with animation
   */
  scrollToNextStep() {
    const nextStep = document.querySelector(`[data-workflow-step="${this.currentStep + 1}"]`);

    if (nextStep) {
      // Add entering animation
      nextStep.classList.add('workflow-step-slide-next');

      // Scroll to the step
      this.smoothScrollTo(nextStep);

      // Update current step
      this.currentStep++;

      // Remove animation class after animation completes
      setTimeout(() => {
        nextStep.classList.remove('workflow-step-slide-next');
      }, 500);

      // Track step navigation
      this.trackStepNavigation('next', this.currentStep);
    }
  }

  /**
   * Scroll to previous step
   */
  scrollToPreviousStep() {
    const prevStep = document.querySelector(`[data-workflow-step="${this.currentStep - 1}"]`);

    if (prevStep && this.currentStep > 0) {
      // Add entering animation
      prevStep.classList.add('workflow-step-slide-prev');

      // Scroll to the step
      this.smoothScrollTo(prevStep);

      // Update current step
      this.currentStep--;

      // Remove animation class after animation completes
      setTimeout(() => {
        prevStep.classList.remove('workflow-step-slide-prev');
      }, 500);

      // Track step navigation
      this.trackStepNavigation('previous', this.currentStep);
    }
  }

  /**
   * Initialize keyboard shortcuts
   */
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!this.keyboardShortcutsEnabled) return;

      // Don't trigger shortcuts when user is typing
      if (e.target.matches('input, textarea, select')) return;

      switch (e.key) {
        case 'Enter':
          // Continue to next step
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleContinueAction();
          }
          break;

        case 'ArrowRight':
          // Next step (Ctrl/Cmd + Arrow)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.scrollToNextStep();
          }
          break;

        case 'ArrowLeft':
          // Previous step (Ctrl/Cmd + Arrow)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.scrollToPreviousStep();
          }
          break;

        case 's':
          // Save (Ctrl/Cmd + S)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleSaveAction();
          }
          break;

        case 'e':
          // Export (Ctrl/Cmd + E)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleExportAction();
          }
          break;

        case '?':
          // Show keyboard shortcuts help
          if (e.shiftKey) {
            e.preventDefault();
            this.showKeyboardShortcutsHelp();
          }
          break;

        case 'Escape':
          // Close modals or cancel actions
          this.handleEscapeAction();
          break;
      }
    });

    // Add keyboard shortcuts indicator
    this.addKeyboardShortcutsIndicator();
  }

  /**
   * Add keyboard shortcuts help indicator
   */
  addKeyboardShortcutsIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'keyboard-shortcuts-indicator';
    indicator.innerHTML = `
      <button
        class="shortcuts-help-btn"
        aria-label="View keyboard shortcuts"
        title="Press ? to view keyboard shortcuts"
      >
        <span>⌨️</span>
      </button>
    `;

    indicator.querySelector('button').addEventListener('click', () => {
      this.showKeyboardShortcutsHelp();
    });

    document.body.appendChild(indicator);
  }

  /**
   * Show keyboard shortcuts help modal
   */
  showKeyboardShortcutsHelp() {
    const shortcuts = [
      { keys: 'Ctrl/Cmd + Enter', action: 'Continue to next step' },
      { keys: 'Ctrl/Cmd + →', action: 'Navigate to next step' },
      { keys: 'Ctrl/Cmd + ←', action: 'Navigate to previous step' },
      { keys: 'Ctrl/Cmd + S', action: 'Save current work' },
      { keys: 'Ctrl/Cmd + E', action: 'Export documents' },
      { keys: 'Shift + ?', action: 'Show this help' },
      { keys: 'Escape', action: 'Close modals/cancel' }
    ];

    const modal = document.createElement('div');
    modal.className = 'keyboard-shortcuts-modal';
    modal.innerHTML = `
      <div class="shortcuts-modal-overlay"></div>
      <div class="shortcuts-modal-content" role="dialog" aria-labelledby="shortcuts-title">
        <button class="shortcuts-close-btn" aria-label="Close shortcuts help">&times;</button>
        <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
        <div class="shortcuts-list">
          ${shortcuts.map(s => `
            <div class="shortcut-item">
              <kbd>${s.keys}</kbd>
              <span>${s.action}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus on close button for accessibility
    const closeBtn = modal.querySelector('.shortcuts-close-btn');
    closeBtn.focus();

    // Close modal handlers
    const closeModal = () => {
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.querySelector('.shortcuts-modal-overlay').addEventListener('click', closeModal);

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  /**
   * Initialize focus management for accessibility
   */
  initFocusManagement() {
    // Focus first interactive element when step becomes active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;

          if (target.classList.contains('active') && target.hasAttribute('data-workflow-step')) {
            this.focusFirstInteractiveElement(target);
          }
        }
      });
    });

    const steps = document.querySelectorAll('[data-workflow-step]');
    steps.forEach(step => {
      observer.observe(step, { attributes: true });
    });

    // Focus management for modals
    this.initModalFocusTrap();
  }

  /**
   * Focus first interactive element in a container
   */
  focusFirstInteractiveElement(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length > 0) {
      // Small delay to ensure element is ready
      setTimeout(() => {
        focusable[0].focus();
      }, 100);
    }
  }

  /**
   * Initialize modal focus trap for accessibility
   */
  initModalFocusTrap() {
    document.addEventListener('focusin', (e) => {
      const modal = document.querySelector('.modal.active, [role="dialog"]');

      if (modal && !modal.contains(e.target)) {
        // Prevent focus from leaving modal
        const focusable = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    });
  }

  /**
   * Initialize tooltips system
   */
  initTooltips() {
    if (!this.tooltipsEnabled) return;

    // Find all elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
      this.addTooltip(element);
    });
  }

  /**
   * Add tooltip to an element
   */
  addTooltip(element) {
    const tooltipText = element.dataset.tooltip;
    const tooltipPosition = element.dataset.tooltipPosition || 'top';

    let tooltip = null;
    let showTimeout = null;
    let hideTimeout = null;

    const showTooltip = () => {
      clearTimeout(hideTimeout);

      showTimeout = setTimeout(() => {
        tooltip = document.createElement('div');
        tooltip.className = `workflow-tooltip workflow-tooltip-${tooltipPosition}`;
        tooltip.textContent = tooltipText;
        tooltip.setAttribute('role', 'tooltip');

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (tooltipPosition) {
          case 'top':
            top = rect.top - tooltipRect.height - 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.left - tooltipRect.width - 8;
            break;
          case 'right':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.right + 8;
            break;
        }

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;

        // Show tooltip with animation
        requestAnimationFrame(() => {
          tooltip.classList.add('show');
        });
      }, 300); // Delay to avoid showing on quick hover
    };

    const hideTooltip = () => {
      clearTimeout(showTimeout);

      if (tooltip) {
        tooltip.classList.remove('show');
        hideTimeout = setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.remove();
          }
          tooltip = null;
        }, 200);
      }
    };

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', showTooltip);
    element.addEventListener('blur', hideTooltip);
  }

  /**
   * Check if user is first-time user
   */
  checkFirstTimeUser() {
    const hasVisited = localStorage.getItem('resumate_has_visited');

    if (!hasVisited) {
      localStorage.setItem('resumate_has_visited', 'true');
      return true;
    }

    return false;
  }

  /**
   * Initialize onboarding for first-time users
   */
  initOnboarding() {
    if (!this.firstTimeUser) return;

    // Show welcome message
    this.showWelcomeMessage();

    // Highlight key features with hints
    setTimeout(() => {
      this.showOnboardingHints();
    }, 2000);
  }

  /**
   * Show welcome message for first-time users
   */
  showWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.className = 'workflow-welcome-message workflow-notification';
    welcome.innerHTML = `
      <div class="welcome-content">
        <h3>Welcome to ResuMate! 👋</h3>
        <p>Let's optimize your resume and generate professional career documents.</p>
        <div class="welcome-actions">
          <button class="welcome-start-btn" aria-label="Start tutorial">Start Tour</button>
          <button class="welcome-skip-btn" aria-label="Skip tutorial">Skip</button>
        </div>
      </div>
    `;

    document.body.appendChild(welcome);

    // Start tour or skip
    welcome.querySelector('.welcome-start-btn').addEventListener('click', () => {
      welcome.remove();
      this.startOnboardingTour();
    });

    welcome.querySelector('.welcome-skip-btn').addEventListener('click', () => {
      welcome.classList.add('exit');
      setTimeout(() => welcome.remove(), 300);
    });
  }

  /**
   * Start onboarding tour
   */
  startOnboardingTour() {
    const steps = [
      {
        element: '[data-feature="upload"]',
        title: 'Upload Resume',
        description: 'Start by uploading your resume or pasting the text.'
      },
      {
        element: '[data-feature="analyze"]',
        title: 'Analyze & Score',
        description: 'Get ATS compatibility scores and optimization suggestions.'
      },
      {
        element: '[data-feature="tailor"]',
        title: 'Job Tailoring',
        description: 'Tailor your resume to specific job descriptions.'
      },
      {
        element: '[data-feature="generate"]',
        title: 'Generate Documents',
        description: 'Create cover letters, bios, and other career documents.'
      },
      {
        element: '[data-feature="export"]',
        title: 'Export Package',
        description: 'Download your complete application package.'
      }
    ];

    this.showTourStep(steps, 0);
  }

  /**
   * Show individual tour step
   */
  showTourStep(steps, index) {
    if (index >= steps.length) {
      this.completeTour();
      return;
    }

    const step = steps[index];
    const element = document.querySelector(step.element);

    if (!element) {
      // Skip if element not found
      this.showTourStep(steps, index + 1);
      return;
    }

    // Scroll to element
    this.smoothScrollTo(element, 100);

    // Create hint overlay
    const hint = document.createElement('div');
    hint.className = 'onboarding-hint';
    hint.innerHTML = `
      <div class="hint-content">
        <h4>${step.title}</h4>
        <p>${step.description}</p>
        <div class="hint-actions">
          <span class="hint-progress">${index + 1} of ${steps.length}</span>
          <button class="hint-next-btn">Next</button>
        </div>
      </div>
    `;

    // Position hint near element
    const rect = element.getBoundingClientRect();
    hint.style.position = 'fixed';
    hint.style.top = `${rect.bottom + 10}px`;
    hint.style.left = `${rect.left}px`;

    document.body.appendChild(hint);

    // Highlight element
    element.classList.add('onboarding-highlight');

    // Next step handler
    hint.querySelector('.hint-next-btn').addEventListener('click', () => {
      element.classList.remove('onboarding-highlight');
      hint.remove();
      this.showTourStep(steps, index + 1);
    });
  }

  /**
   * Show onboarding hints
   */
  showOnboardingHints() {
    const hints = [
      { selector: '#api-key', message: 'Add your Claude API key to get started' },
      { selector: '[data-feature="keyboard-shortcuts"]', message: 'Press Shift+? for keyboard shortcuts' }
    ];

    hints.forEach((hint, index) => {
      const element = document.querySelector(hint.selector);
      if (element) {
        setTimeout(() => {
          this.showHint(element, hint.message);
        }, index * 1000);
      }
    });
  }

  /**
   * Show a hint near an element
   */
  showHint(element, message) {
    const hint = document.createElement('div');
    hint.className = 'workflow-hint';
    hint.textContent = message;

    const rect = element.getBoundingClientRect();
    hint.style.position = 'fixed';
    hint.style.top = `${rect.bottom + 8}px`;
    hint.style.left = `${rect.left}px`;

    document.body.appendChild(hint);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hint.classList.add('fade-out');
      setTimeout(() => hint.remove(), 300);
    }, 5000);
  }

  /**
   * Complete onboarding tour
   */
  completeTour() {
    const completion = document.createElement('div');
    completion.className = 'tour-completion workflow-notification';
    completion.innerHTML = `
      <div class="completion-content">
        <div class="workflow-success-check">
          <svg viewBox="0 0 50 50">
            <path d="M5 30 L 20 45 L 45 5" fill="none"/>
          </svg>
        </div>
        <h3>You're All Set! 🎉</h3>
        <p>You're ready to optimize your resume and create amazing career documents.</p>
        <button class="completion-btn">Get Started</button>
      </div>
    `;

    document.body.appendChild(completion);

    completion.querySelector('.completion-btn').addEventListener('click', () => {
      completion.classList.add('exit');
      setTimeout(() => completion.remove(), 300);
    });
  }

  /**
   * Initialize progress tracking
   */
  initProgressTracking() {
    // Update progress bar as user completes steps
    this.updateProgressBar();

    // Listen for step completion events
    document.addEventListener('workflow:step-completed', () => {
      this.updateProgressBar();
    });
  }

  /**
   * Update progress bar
   */
  updateProgressBar() {
    const progressBar = document.querySelector('.workflow-progress-fill');
    const progressText = document.querySelector('.workflow-progress-text');

    if (progressBar && this.totalSteps > 0) {
      const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
      progressBar.style.width = `${progress}%`;

      if (progressText) {
        progressText.textContent = `${Math.round(progress)}% Complete`;
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Continue buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-workflow-continue]')) {
        this.handleContinueAction();
      }

      if (e.target.matches('[data-workflow-back]')) {
        this.scrollToPreviousStep();
      }
    });

    // Form validation on step completion
    document.addEventListener('submit', (e) => {
      if (e.target.matches('[data-workflow-form]')) {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      }
    });
  }

  /**
   * Handle continue action
   */
  handleContinueAction() {
    // Validate current step before continuing
    const currentStepEl = document.querySelector(`[data-workflow-step="${this.currentStep}"]`);

    if (currentStepEl) {
      const isValid = this.validateStep(currentStepEl);

      if (isValid) {
        this.scrollToNextStep();

        // Dispatch event
        document.dispatchEvent(new CustomEvent('workflow:step-completed', {
          detail: { step: this.currentStep }
        }));
      } else {
        this.showValidationError(currentStepEl);
      }
    }
  }

  /**
   * Validate workflow step
   */
  validateStep(stepElement) {
    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value || field.value.trim() === '') {
        isValid = false;
        field.classList.add('workflow-error-shake');
        field.setAttribute('aria-invalid', 'true');

        setTimeout(() => {
          field.classList.remove('workflow-error-shake');
        }, 400);
      } else {
        field.classList.remove('workflow-error-shake');
        field.removeAttribute('aria-invalid');
      }
    });

    return isValid;
  }

  /**
   * Show validation error
   */
  showValidationError(stepElement) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'workflow-validation-error';
    errorMsg.textContent = 'Please complete all required fields before continuing.';
    errorMsg.setAttribute('role', 'alert');

    stepElement.insertBefore(errorMsg, stepElement.firstChild);

    setTimeout(() => {
      errorMsg.remove();
    }, 5000);
  }

  /**
   * Handle form submit
   */
  handleFormSubmit(form) {
    const formData = new FormData(form);

    // Add loading state
    form.classList.add('workflow-loading');

    // Dispatch submit event
    document.dispatchEvent(new CustomEvent('workflow:form-submit', {
      detail: { formData }
    }));
  }

  /**
   * Handle save action
   */
  handleSaveAction() {
    // Save current state
    const event = new CustomEvent('workflow:save-requested');
    document.dispatchEvent(event);

    // Show save confirmation
    this.showNotification('Progress saved successfully', 'success');
  }

  /**
   * Handle export action
   */
  handleExportAction() {
    // Trigger export
    const event = new CustomEvent('workflow:export-requested');
    document.dispatchEvent(event);
  }

  /**
   * Handle escape action
   */
  handleEscapeAction() {
    // Close any open modals
    const modals = document.querySelectorAll('.modal.active, [role="dialog"]');
    modals.forEach(modal => {
      const closeBtn = modal.querySelector('[data-dismiss], .close, .modal-close');
      if (closeBtn) {
        closeBtn.click();
      }
    });
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `workflow-notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('exit');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Track step navigation for analytics
   */
  trackStepNavigation(direction, step) {
    if (window.WorkflowAnalytics) {
      window.WorkflowAnalytics.trackStepNavigation(direction, step);
    }
  }

  /**
   * Enable/disable keyboard shortcuts
   */
  toggleKeyboardShortcuts(enabled) {
    this.keyboardShortcutsEnabled = enabled;
  }

  /**
   * Enable/disable tooltips
   */
  toggleTooltips(enabled) {
    this.tooltipsEnabled = enabled;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.workflowPolish = new WorkflowPolish();
  });
} else {
  window.workflowPolish = new WorkflowPolish();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowPolish;
}
