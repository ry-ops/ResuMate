/**
 * Getting Started Modal
 * Welcome modal that tracks onboarding progress
 * Resets on hard refresh but keeps API key persistent
 */

class GettingStartedModal {
  constructor() {
    this.modal = null;
    this.progressSteps = {
      resumeAdded: { label: 'Resume Added', icon: '📄', complete: false },
      jobDescAdded: { label: 'Job Description', icon: '💼', complete: false },
      apiKeySet: { label: 'API Key', icon: '🔑', complete: false }
    };

    // Use sessionStorage for temporary progress (resets on browser restart)
    // Use localStorage only for API key
    this.storageKey = 'resumate_onboarding_progress';
  }

  /**
   * Initialize modal
   */
  initialize() {
    this.createModal();
    this.loadProgress();
    this.attachListeners();

    // Show modal on page load if not all steps complete
    if (!this.isComplete()) {
      setTimeout(() => this.show(), 500);
    }

    console.log('[GettingStartedModal] Initialized');
  }

  /**
   * Create modal DOM
   */
  createModal() {
    // Remove existing modal
    const existing = document.getElementById('getting-started-modal');
    if (existing) existing.remove();

    this.modal = document.createElement('div');
    this.modal.id = 'getting-started-modal';
    this.modal.className = 'getting-started-modal';
    this.modal.innerHTML = `
      <div class="getting-started-backdrop"></div>
      <div class="getting-started-content">
        <button class="getting-started-close" aria-label="Close">&times;</button>

        <div class="getting-started-header">
          <div class="getting-started-icon">🚀</div>
          <h2>Welcome to ResuMate!</h2>
          <p>Get started in 3 easy steps</p>
        </div>

        <div class="getting-started-steps">
          ${Object.entries(this.progressSteps).map(([key, step]) => `
            <div class="step-item ${step.complete ? 'complete' : ''}" data-step="${key}">
              <div class="step-icon-wrapper">
                <div class="step-icon">${step.icon}</div>
                <div class="step-check">✓</div>
              </div>
              <div class="step-content">
                <h3>${step.label}</h3>
                <div class="step-status">
                  <span class="status-pending">Pending</span>
                  <span class="status-complete">Complete</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="getting-started-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <p class="progress-text">0 of 3 steps complete</p>
        </div>

        <div class="getting-started-actions">
          <button class="btn-getting-started btn-primary" id="getting-started-close-btn">
            Get Started
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Add styles
    this.addStyles();

    // Attach close handlers
    this.modal.querySelector('.getting-started-close').addEventListener('click', () => this.hide());
    this.modal.querySelector('.getting-started-backdrop').addEventListener('click', () => this.hide());
    this.modal.querySelector('#getting-started-close-btn').addEventListener('click', () => this.hide());
  }

  /**
   * Add modal styles
   */
  addStyles() {
    if (document.getElementById('getting-started-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'getting-started-styles';
    styles.textContent = `
      .getting-started-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }

      .getting-started-modal.visible {
        opacity: 1;
        visibility: visible;
      }

      .getting-started-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
      }

      .getting-started-content {
        position: relative;
        background: white;
        border-radius: 20px;
        padding: 40px 50px;
        max-width: 900px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }

      .getting-started-modal.visible .getting-started-content {
        transform: scale(1);
      }

      .getting-started-close {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 36px;
        height: 36px;
        border: none;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 24px;
        color: #666;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .getting-started-close:hover {
        background: #e0e0e0;
        color: #333;
        transform: rotate(90deg);
      }

      .getting-started-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .getting-started-icon {
        font-size: 64px;
        margin-bottom: 15px;
        animation: bounce 1s ease-out;
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .getting-started-header h2 {
        margin: 0 0 10px;
        font-size: 28px;
        color: #2c3e50;
      }

      .getting-started-header p {
        margin: 0;
        color: #666;
        font-size: 16px;
      }

      .getting-started-steps {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }

      @media (max-width: 768px) {
        .getting-started-steps {
          grid-template-columns: 1fr;
        }
      }

      .step-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
        padding: 20px 15px;
        background: #f8f9fa;
        border-radius: 12px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }

      .step-item:hover {
        background: #f0f1f3;
      }

      .step-item.complete {
        background: #f0fdf4;
        border-color: #10b981;
      }

      .step-icon-wrapper {
        position: relative;
        width: 50px;
        height: 50px;
        flex-shrink: 0;
      }

      .step-icon {
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        transition: all 0.3s ease;
      }

      .step-check {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 24px;
        height: 24px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        opacity: 0;
        transform: scale(0);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .step-item.complete .step-check {
        opacity: 1;
        transform: scale(1);
      }

      .step-item.complete .step-icon {
        opacity: 0.7;
        transform: scale(0.9);
      }

      .step-content {
        flex: 1;
      }

      .step-content h3 {
        margin: 0 0 5px;
        font-size: 16px;
        color: #2c3e50;
      }

      .step-status {
        font-size: 14px;
      }

      .status-pending,
      .status-complete {
        display: inline-block;
      }

      .step-item .status-complete {
        display: none;
        color: #10b981;
        font-weight: 600;
      }

      .step-item.complete .status-pending {
        display: none;
      }

      .step-item.complete .status-complete {
        display: inline-block;
      }

      .status-pending {
        color: #999;
      }

      .getting-started-progress {
        margin-bottom: 25px;
      }

      .progress-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 10px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #2563eb, #3b82f6);
        border-radius: 999px;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .progress-text {
        margin: 0;
        text-align: center;
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }

      .getting-started-actions {
        display: flex;
        justify-content: center;
      }

      .btn-getting-started {
        padding: 14px 32px;
        font-size: 16px;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-getting-started.btn-primary {
        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .btn-getting-started.btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      }

      /* Dark theme support */
      [data-theme="dark"] .getting-started-content {
        background: #1e272e;
        color: #ecf0f1;
      }

      [data-theme="dark"] .getting-started-header h2 {
        color: #ecf0f1;
      }

      [data-theme="dark"] .getting-started-header p {
        color: #b2bec3;
      }

      [data-theme="dark"] .step-item {
        background: #2d3436;
      }

      [data-theme="dark"] .step-item:hover {
        background: #34495e;
      }

      [data-theme="dark"] .step-content h3 {
        color: #ecf0f1;
      }

      [data-theme="dark"] .progress-text {
        color: #b2bec3;
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Load progress from sessionStorage (temporary)
   */
  loadProgress() {
    const saved = sessionStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this.progressSteps, parsed);
        this.updateUI();
      } catch (e) {
        console.error('[GettingStartedModal] Failed to load progress:', e);
      }
    }

    // Also check for API key in localStorage (persistent)
    const apiKey = localStorage.getItem('api-key');
    if (apiKey && apiKey.length > 10) {
      this.completeStep('apiKeySet');
    }
  }

  /**
   * Save progress to sessionStorage (temporary)
   */
  saveProgress() {
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.progressSteps));
  }

  /**
   * Complete a step
   */
  completeStep(stepKey) {
    if (this.progressSteps[stepKey]) {
      this.progressSteps[stepKey].complete = true;
      this.saveProgress();
      this.updateUI();

      // Add success animation
      const stepEl = this.modal?.querySelector(`[data-step="${stepKey}"]`);
      if (stepEl) {
        stepEl.style.animation = 'none';
        setTimeout(() => {
          stepEl.style.animation = 'bounce 0.5s ease-out';
        }, 10);
      }
    }
  }

  /**
   * Update UI with current progress
   */
  updateUI() {
    if (!this.modal) return;

    const steps = Object.entries(this.progressSteps);
    const completedCount = steps.filter(([, s]) => s.complete).length;
    const percentage = Math.round((completedCount / steps.length) * 100);

    // Update progress bar
    const progressFill = this.modal.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    // Update progress text
    const progressText = this.modal.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = `${completedCount} of ${steps.length} steps complete`;
    }

    // Update step items
    steps.forEach(([key, step]) => {
      const stepEl = this.modal.querySelector(`[data-step="${key}"]`);
      if (stepEl) {
        if (step.complete) {
          stepEl.classList.add('complete');
        } else {
          stepEl.classList.remove('complete');
        }
      }
    });

    // Auto-hide when complete
    if (this.isComplete()) {
      setTimeout(() => this.hide(), 1500);
    }
  }

  /**
   * Check if all steps are complete
   */
  isComplete() {
    return Object.values(this.progressSteps).every(step => step.complete);
  }

  /**
   * Show modal
   */
  show() {
    if (this.modal) {
      this.modal.classList.add('visible');
    }
  }

  /**
   * Hide modal
   */
  hide() {
    if (this.modal) {
      this.modal.classList.remove('visible');
    }
  }

  /**
   * Attach progress listeners
   */
  attachListeners() {
    // Resume upload
    const resumeText = document.getElementById('resume-text');
    const resumeFile = document.getElementById('resume-file');

    if (resumeText) {
      resumeText.addEventListener('input', () => {
        if (resumeText.value.length > 50) {
          this.completeStep('resumeAdded');
        }
      });
    }

    if (resumeFile) {
      resumeFile.addEventListener('change', () => {
        this.completeStep('resumeAdded');
      });
    }

    // Job description
    const jobText = document.getElementById('job-text');
    const jobUrl = document.getElementById('job-url');

    if (jobText) {
      jobText.addEventListener('input', () => {
        if (jobText.value.length > 50) {
          this.completeStep('jobDescAdded');
        }
      });
    }

    if (jobUrl) {
      jobUrl.addEventListener('input', () => {
        if (jobUrl.value.length > 10) {
          this.completeStep('jobDescAdded');
        }
      });
    }

    // API key
    const apiKey = document.getElementById('api-key');
    if (apiKey) {
      apiKey.addEventListener('input', () => {
        if (apiKey.value.length > 10) {
          this.completeStep('apiKeySet');
        }
      });
    }

    // Check server API key
    this.checkServerApiKey();
  }

  /**
   * Check if server has API key
   */
  async checkServerApiKey() {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();

      if (config.hasServerApiKey) {
        this.completeStep('apiKeySet');
      }
    } catch (error) {
      console.error('[GettingStartedModal] Failed to check server API key:', error);
    }
  }

  /**
   * Reset progress (for testing)
   */
  reset() {
    Object.keys(this.progressSteps).forEach(key => {
      this.progressSteps[key].complete = false;
    });
    sessionStorage.removeItem(this.storageKey);
    this.updateUI();
    this.show();
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.GettingStartedModal = GettingStartedModal;
}
