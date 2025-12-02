/**
 * ResuMate Progress Tracker
 * Tracks user's journey through the 5-step resume optimization process
 * Provides visual progress indicators and completion state management
 * Version: 1.0.0
 */

class ProgressTracker {
  constructor() {
    this.STORAGE_KEY = 'resumate_progress';

    // Define the 5-step journey
    this.steps = [
      {
        id: 'resume_uploaded',
        label: 'Resume Uploaded',
        description: 'Upload or paste your resume',
        icon: '📄',
        page: 'index.html',
        weight: 20
      },
      {
        id: 'job_added',
        label: 'Job Added',
        description: 'Add job description for tailoring',
        icon: '💼',
        page: 'index.html',
        weight: 20
      },
      {
        id: 'analysis_complete',
        label: 'Analysis Complete',
        description: 'AI analysis and ATS scanning done',
        icon: '🔍',
        page: 'test-ats-scanner.html',
        weight: 20
      },
      {
        id: 'resume_tailored',
        label: 'Resume Tailored',
        description: 'Resume optimized for job posting',
        icon: '🎯',
        page: 'test-job-tailor.html',
        weight: 20
      },
      {
        id: 'documents_generated',
        label: 'Documents Generated',
        description: 'All application documents ready',
        icon: '📦',
        page: 'test-export.html',
        weight: 20
      }
    ];

    // Initialize state
    this.state = this.loadState();
  }

  /**
   * Load progress state from localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        // Ensure all steps exist in state
        this.steps.forEach(step => {
          if (!(step.id in state.completed)) {
            state.completed[step.id] = false;
          }
          if (!(step.id in state.timestamps)) {
            state.timestamps[step.id] = null;
          }
        });
        return state;
      }
    } catch (error) {
      console.error('[ProgressTracker] Failed to load state:', error);
    }

    // Default state
    return {
      completed: this.steps.reduce((acc, step) => {
        acc[step.id] = false;
        return acc;
      }, {}),
      timestamps: this.steps.reduce((acc, step) => {
        acc[step.id] = null;
        return acc;
      }, {}),
      currentStep: null,
      lastActivity: null,
      metadata: {
        resumeName: null,
        jobTitle: null,
        jobCompany: null
      }
    };
  }

  /**
   * Save progress state to localStorage
   */
  saveState() {
    try {
      this.state.lastActivity = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this.emit('stateChanged', this.state);
      return true;
    } catch (error) {
      console.error('[ProgressTracker] Failed to save state:', error);
      return false;
    }
  }

  /**
   * Get overall progress percentage (0-100)
   */
  getProgress() {
    const completedSteps = this.steps.filter(step => this.state.completed[step.id]);
    const totalWeight = this.steps.reduce((sum, step) => sum + step.weight, 0);
    const completedWeight = completedSteps.reduce((sum, step) => sum + step.weight, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  }

  /**
   * Get progress as fraction (for display like "3/5")
   */
  getProgressFraction() {
    const completed = this.steps.filter(step => this.state.completed[step.id]).length;
    const total = this.steps.length;
    return { completed, total };
  }

  /**
   * Mark a step as complete
   */
  markComplete(stepId, metadata = {}) {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      console.warn('[ProgressTracker] Unknown step:', stepId);
      return false;
    }

    const wasCompleted = this.state.completed[stepId];
    this.state.completed[stepId] = true;
    this.state.timestamps[stepId] = new Date().toISOString();
    this.state.currentStep = stepId;

    // Update metadata
    if (metadata) {
      this.state.metadata = { ...this.state.metadata, ...metadata };
    }

    this.saveState();

    // Emit event
    if (!wasCompleted) {
      this.emit('stepCompleted', { step, metadata });
    }

    return true;
  }

  /**
   * Mark a step as incomplete (for editing/restarting)
   */
  markIncomplete(stepId) {
    if (this.state.completed[stepId]) {
      this.state.completed[stepId] = false;
      this.state.timestamps[stepId] = null;
      this.saveState();
      this.emit('stepIncomplete', { stepId });
      return true;
    }
    return false;
  }

  /**
   * Check if a step is complete
   */
  isComplete(stepId) {
    return this.state.completed[stepId] === true;
  }

  /**
   * Get next incomplete step
   */
  getNextStep() {
    const incomplete = this.steps.find(step => !this.state.completed[step.id]);
    return incomplete || null;
  }

  /**
   * Get current step (last completed or first incomplete)
   */
  getCurrentStep() {
    const nextStep = this.getNextStep();
    if (nextStep) {
      // If we have incomplete steps, return the first one
      return nextStep;
    }

    // All complete - return the last step
    return this.steps[this.steps.length - 1];
  }

  /**
   * Get recommended action for user
   */
  getRecommendedAction() {
    const progress = this.getProgress();

    if (progress === 0) {
      return {
        title: 'Get Started',
        description: 'Upload your resume to begin optimization',
        action: 'Upload Resume',
        page: 'index.html',
        icon: '🚀'
      };
    }

    if (progress === 100) {
      return {
        title: 'All Set!',
        description: 'Your application package is ready to submit',
        action: 'Download Package',
        page: 'dashboard.html',
        icon: '🎉'
      };
    }

    const nextStep = this.getNextStep();
    if (nextStep) {
      return {
        title: 'Continue Your Journey',
        description: nextStep.description,
        action: nextStep.label,
        page: nextStep.page,
        icon: nextStep.icon
      };
    }

    return null;
  }

  /**
   * Get all steps with their completion status
   */
  getAllSteps() {
    return this.steps.map(step => ({
      ...step,
      completed: this.state.completed[step.id],
      timestamp: this.state.timestamps[step.id]
    }));
  }

  /**
   * Get completion summary
   */
  getSummary() {
    const progress = this.getProgress();
    const { completed, total } = this.getProgressFraction();
    const nextStep = this.getNextStep();
    const allComplete = progress === 100;

    return {
      progress,
      completed,
      total,
      nextStep,
      allComplete,
      metadata: this.state.metadata,
      lastActivity: this.state.lastActivity
    };
  }

  /**
   * Create a visual progress bar component
   */
  renderProgressBar(container, options = {}) {
    const defaults = {
      showPercentage: true,
      showSteps: true,
      size: 'medium', // 'small', 'medium', 'large'
      style: 'default' // 'default', 'minimal', 'detailed'
    };
    const config = { ...defaults, ...options };

    const progress = this.getProgress();
    const { completed, total } = this.getProgressFraction();

    const progressBar = document.createElement('div');
    progressBar.className = `progress-tracker progress-tracker--${config.size} progress-tracker--${config.style}`;
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-label', `Progress: ${progress}% complete`);

    // Progress bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'progress-bar-container';

    // Progress bar fill
    const barFill = document.createElement('div');
    barFill.className = 'progress-bar-fill';
    barFill.style.width = `${progress}%`;

    // Add completion state classes
    if (progress === 100) {
      barFill.classList.add('progress-complete');
    } else if (progress >= 60) {
      barFill.classList.add('progress-high');
    } else if (progress >= 30) {
      barFill.classList.add('progress-medium');
    } else {
      barFill.classList.add('progress-low');
    }

    barContainer.appendChild(barFill);

    // Info section
    const info = document.createElement('div');
    info.className = 'progress-info';

    if (config.showPercentage) {
      const percentage = document.createElement('span');
      percentage.className = 'progress-percentage';
      percentage.textContent = `${progress}%`;
      info.appendChild(percentage);
    }

    if (config.showSteps) {
      const steps = document.createElement('span');
      steps.className = 'progress-steps';
      steps.textContent = `${completed} of ${total} steps`;
      info.appendChild(steps);
    }

    progressBar.appendChild(info);
    progressBar.appendChild(barContainer);

    // Clear and append
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(progressBar);
    }

    return progressBar;
  }

  /**
   * Render step checklist
   */
  renderStepChecklist(container, options = {}) {
    const defaults = {
      showTimestamps: false,
      interactive: true,
      compact: false
    };
    const config = { ...defaults, ...options };

    const checklist = document.createElement('div');
    checklist.className = `step-checklist ${config.compact ? 'step-checklist--compact' : ''}`;

    this.steps.forEach((step, index) => {
      const isComplete = this.state.completed[step.id];
      const timestamp = this.state.timestamps[step.id];

      const item = document.createElement('div');
      item.className = `step-item ${isComplete ? 'step-item--complete' : 'step-item--incomplete'}`;
      item.setAttribute('data-step-id', step.id);

      // Step number/icon
      const indicator = document.createElement('div');
      indicator.className = 'step-indicator';
      if (isComplete) {
        indicator.innerHTML = '<span class="step-check">✓</span>';
      } else {
        indicator.innerHTML = `<span class="step-number">${index + 1}</span>`;
      }

      // Step content
      const content = document.createElement('div');
      content.className = 'step-content';

      const title = document.createElement('div');
      title.className = 'step-title';
      title.innerHTML = `<span class="step-icon">${step.icon}</span> ${step.label}`;

      const description = document.createElement('div');
      description.className = 'step-description';
      description.textContent = step.description;

      content.appendChild(title);
      content.appendChild(description);

      if (config.showTimestamps && timestamp) {
        const time = document.createElement('div');
        time.className = 'step-timestamp';
        time.textContent = `Completed ${this.formatTimestamp(timestamp)}`;
        content.appendChild(time);
      }

      // Action button
      if (config.interactive) {
        const action = document.createElement('button');
        action.className = 'step-action btn-secondary';
        action.textContent = isComplete ? 'Review' : 'Start';
        action.onclick = () => {
          window.location.href = step.page;
        };
        content.appendChild(action);
      }

      item.appendChild(indicator);
      item.appendChild(content);
      checklist.appendChild(item);
    });

    // Clear and append
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(checklist);
    }

    return checklist;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
  }

  /**
   * Reset all progress (with confirmation)
   */
  reset() {
    this.state = this.loadState();
    Object.keys(this.state.completed).forEach(key => {
      this.state.completed[key] = false;
      this.state.timestamps[key] = null;
    });
    this.state.currentStep = null;
    this.state.metadata = {
      resumeName: null,
      jobTitle: null,
      jobCompany: null
    };
    this.saveState();
    this.emit('progressReset');
    return true;
  }

  /**
   * Event emitter system
   */
  on(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners || !this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners || !this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[ProgressTracker] Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Export progress data
   */
  exportData() {
    return {
      ...this.state,
      steps: this.getAllSteps(),
      progress: this.getProgress(),
      summary: this.getSummary()
    };
  }

  /**
   * Import progress data
   */
  importData(data) {
    try {
      this.state = {
        completed: data.completed || {},
        timestamps: data.timestamps || {},
        currentStep: data.currentStep || null,
        lastActivity: data.lastActivity || null,
        metadata: data.metadata || {}
      };
      this.saveState();
      return true;
    } catch (error) {
      console.error('[ProgressTracker] Failed to import data:', error);
      return false;
    }
  }
}

// Create singleton instance
const progressTracker = new ProgressTracker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = progressTracker;
}

// Add to window for global access
if (typeof window !== 'undefined') {
  window.ProgressTracker = ProgressTracker;
  window.progressTracker = progressTracker;
}
