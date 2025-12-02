/**
 * ResuMate Smart Navigation
 * Intelligent routing and navigation based on user progress
 * Provides context-aware navigation and "continue where you left off" features
 * Version: 1.0.0
 */

class SmartNavigation {
  constructor(progressTracker) {
    this.progressTracker = progressTracker || window.progressTracker;
    this.currentPage = this.getCurrentPage();
    this.history = this.loadHistory();

    // Page metadata for smart routing
    this.pages = {
      'index.html': {
        id: 'home',
        title: 'Home',
        category: 'start',
        requiredSteps: [],
        completesSteps: ['resume_uploaded', 'job_added']
      },
      'dashboard.html': {
        id: 'dashboard',
        title: 'Dashboard',
        category: 'overview',
        requiredSteps: [],
        completesSteps: []
      },
      'builder.html': {
        id: 'builder',
        title: 'Resume Builder',
        category: 'build',
        requiredSteps: ['resume_uploaded'],
        completesSteps: []
      },
      'test-ats-scanner.html': {
        id: 'ats_scanner',
        title: 'ATS Scanner',
        category: 'optimize',
        requiredSteps: ['resume_uploaded'],
        completesSteps: ['analysis_complete']
      },
      'test-job-tailor.html': {
        id: 'job_tailor',
        title: 'Job Tailoring',
        category: 'optimize',
        requiredSteps: ['resume_uploaded', 'job_added'],
        completesSteps: ['resume_tailored']
      },
      'test-export.html': {
        id: 'export',
        title: 'Export Resume',
        category: 'export',
        requiredSteps: ['resume_uploaded'],
        completesSteps: ['documents_generated']
      },
      'test-coverletter.html': {
        id: 'cover_letter',
        title: 'Cover Letter',
        category: 'export',
        requiredSteps: ['resume_uploaded', 'job_added'],
        completesSteps: ['documents_generated']
      },
      'test-careerdocs.html': {
        id: 'career_docs',
        title: 'Career Documents',
        category: 'export',
        requiredSteps: ['resume_uploaded'],
        completesSteps: ['documents_generated']
      },
      'test-tracker.html': {
        id: 'job_tracker',
        title: 'Job Tracker',
        category: 'track',
        requiredSteps: [],
        completesSteps: []
      },
      'analytics-dashboard.html': {
        id: 'analytics',
        title: 'Analytics',
        category: 'analyze',
        requiredSteps: ['resume_uploaded'],
        completesSteps: []
      }
    };

    this.init();
  }

  /**
   * Initialize smart navigation
   */
  init() {
    this.trackPageView();
    this.updateBreadcrumbs();

    // Listen for progress changes
    if (this.progressTracker) {
      this.progressTracker.on('stepCompleted', () => {
        this.updateBreadcrumbs();
      });
    }
  }

  /**
   * Get current page filename
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename === '' ? 'index.html' : filename;
  }

  /**
   * Get next recommended page based on progress
   */
  getNextPage() {
    if (!this.progressTracker) {
      return { page: 'index.html', reason: 'start' };
    }

    const progress = this.progressTracker.getProgress();
    const nextStep = this.progressTracker.getNextStep();

    // If nothing started, go to home
    if (progress === 0) {
      return {
        page: 'index.html',
        reason: 'Get started by uploading your resume',
        step: nextStep
      };
    }

    // If everything complete, go to dashboard
    if (progress === 100) {
      return {
        page: 'dashboard.html',
        reason: 'View your complete application package',
        step: null
      };
    }

    // Route based on next incomplete step
    if (nextStep) {
      return {
        page: nextStep.page,
        reason: `Continue with: ${nextStep.label}`,
        step: nextStep
      };
    }

    // Fallback to dashboard
    return {
      page: 'dashboard.html',
      reason: 'View your progress',
      step: null
    };
  }

  /**
   * Check if user can access a page (has required steps completed)
   */
  canAccessPage(page) {
    const pageInfo = this.pages[page];
    if (!pageInfo) return true; // Unknown pages are accessible

    // No requirements means always accessible
    if (!pageInfo.requiredSteps || pageInfo.requiredSteps.length === 0) {
      return { allowed: true, reason: null };
    }

    if (!this.progressTracker) {
      return { allowed: true, reason: null }; // Allow if no tracker
    }

    // Check all required steps
    const missingSteps = pageInfo.requiredSteps.filter(
      stepId => !this.progressTracker.isComplete(stepId)
    );

    if (missingSteps.length > 0) {
      const stepNames = missingSteps
        .map(id => this.progressTracker.steps.find(s => s.id === id)?.label)
        .filter(Boolean)
        .join(', ');

      return {
        allowed: false,
        reason: `Please complete: ${stepNames}`,
        missingSteps
      };
    }

    return { allowed: true, reason: null };
  }

  /**
   * Redirect to next page if current page shouldn't be accessible
   */
  redirectIfNeeded() {
    const access = this.canAccessPage(this.currentPage);

    if (!access.allowed) {
      const next = this.getNextPage();
      console.log('[SmartNavigation] Redirecting:', {
        from: this.currentPage,
        to: next.page,
        reason: access.reason
      });

      // Show notification
      this.showNotification('warning', access.reason);

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = next.page;
      }, 2000);

      return true;
    }

    return false;
  }

  /**
   * Generate breadcrumb trail
   */
  getBreadcrumbs() {
    const breadcrumbs = [
      { label: 'Home', page: 'index.html', icon: '🏠' }
    ];

    const currentPageInfo = this.pages[this.currentPage];
    if (!currentPageInfo || this.currentPage === 'index.html') {
      return breadcrumbs;
    }

    // Add category breadcrumb if not home
    const categoryPages = {
      build: { label: 'Build', page: 'builder.html', icon: '📝' },
      optimize: { label: 'Optimize', page: 'test-ats-scanner.html', icon: '📊' },
      export: { label: 'Export', page: 'test-export.html', icon: '📤' },
      track: { label: 'Track', page: 'test-tracker.html', icon: '📈' },
      analyze: { label: 'Analytics', page: 'analytics-dashboard.html', icon: '📊' },
      overview: { label: 'Dashboard', page: 'dashboard.html', icon: '🎯' }
    };

    const category = categoryPages[currentPageInfo.category];
    if (category && category.page !== this.currentPage) {
      breadcrumbs.push(category);
    }

    // Add current page
    breadcrumbs.push({
      label: currentPageInfo.title,
      page: this.currentPage,
      icon: this.getPageIcon(currentPageInfo.category),
      current: true
    });

    return breadcrumbs;
  }

  /**
   * Get icon for page category
   */
  getPageIcon(category) {
    const icons = {
      start: '🚀',
      build: '📝',
      optimize: '🎯',
      export: '📤',
      track: '📈',
      analyze: '📊',
      overview: '🎯'
    };
    return icons[category] || '📄';
  }

  /**
   * Render breadcrumbs to container
   */
  renderBreadcrumbs(container) {
    const breadcrumbs = this.getBreadcrumbs();

    const nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb navigation');

    const list = document.createElement('ol');
    list.className = 'breadcrumb-list';

    breadcrumbs.forEach((crumb, index) => {
      const item = document.createElement('li');
      item.className = 'breadcrumb-item';

      if (crumb.current) {
        const current = document.createElement('span');
        current.className = 'breadcrumb-current';
        current.setAttribute('aria-current', 'page');
        current.innerHTML = `<span aria-hidden="true">${crumb.icon}</span> ${crumb.label}`;
        item.appendChild(current);
      } else {
        const link = document.createElement('a');
        link.href = crumb.page;
        link.className = 'breadcrumb-link';
        link.innerHTML = `<span aria-hidden="true">${crumb.icon}</span> ${crumb.label}`;
        item.appendChild(link);
      }

      list.appendChild(item);

      // Add separator if not last item
      if (index < breadcrumbs.length - 1) {
        const separator = document.createElement('li');
        separator.className = 'breadcrumb-separator';
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = '/';
        list.appendChild(separator);
      }
    });

    nav.appendChild(list);

    // Clear and append
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(nav);
    }

    return nav;
  }

  /**
   * Update breadcrumbs in page (if container exists)
   */
  updateBreadcrumbs() {
    const container = document.querySelector('[data-breadcrumbs]');
    if (container) {
      this.renderBreadcrumbs(container);
    }
  }

  /**
   * Render "Next Step" button
   */
  renderNextStepButton(container, options = {}) {
    const defaults = {
      style: 'primary', // 'primary', 'secondary', 'ghost'
      size: 'medium', // 'small', 'medium', 'large'
      showIcon: true
    };
    const config = { ...defaults, ...options };

    const next = this.getNextPage();

    const button = document.createElement('a');
    button.href = next.page;
    button.className = `btn btn-${config.style} btn-${config.size} next-step-button`;
    button.setAttribute('role', 'button');

    if (config.showIcon && next.step) {
      button.innerHTML = `
        <span class="next-step-icon" aria-hidden="true">${next.step.icon}</span>
        <span class="next-step-content">
          <span class="next-step-label">Next Step</span>
          <span class="next-step-title">${next.step.label}</span>
        </span>
      `;
    } else {
      button.innerHTML = `
        <span class="next-step-content">
          <span class="next-step-label">Continue</span>
          <span class="next-step-title">${next.reason}</span>
        </span>
      `;
    }

    // Clear and append
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(button);
    }

    return button;
  }

  /**
   * Get "Continue Where You Left Off" information
   */
  getContinueInfo() {
    if (!this.progressTracker) {
      return null;
    }

    const summary = this.progressTracker.getSummary();
    const next = this.getNextPage();

    return {
      progress: summary.progress,
      lastActivity: summary.lastActivity,
      nextPage: next.page,
      nextReason: next.reason,
      nextStep: next.step,
      canContinue: summary.progress > 0 && summary.progress < 100
    };
  }

  /**
   * Render "Continue Where You Left Off" card
   */
  renderContinueCard(container) {
    const info = this.getContinueInfo();

    if (!info || !info.canContinue) {
      return null;
    }

    const card = document.createElement('div');
    card.className = 'continue-card';

    const lastActivity = info.lastActivity
      ? this.progressTracker.formatTimestamp(info.lastActivity)
      : 'recently';

    card.innerHTML = `
      <div class="continue-card-header">
        <div class="continue-card-icon">💡</div>
        <div class="continue-card-title">Continue Where You Left Off</div>
      </div>
      <div class="continue-card-body">
        <div class="continue-card-progress">
          <div class="continue-progress-bar">
            <div class="continue-progress-fill" style="width: ${info.progress}%"></div>
          </div>
          <div class="continue-progress-text">${info.progress}% complete</div>
        </div>
        <div class="continue-card-description">
          Last activity: ${lastActivity}
        </div>
      </div>
      <div class="continue-card-footer">
        <a href="${info.nextPage}" class="btn btn-primary">
          ${info.nextStep ? info.nextStep.icon : '→'} ${info.nextReason}
        </a>
      </div>
    `;

    // Clear and append
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = '';
      container.appendChild(card);
    }

    return card;
  }

  /**
   * Track page view in history
   */
  trackPageView() {
    const pageInfo = this.pages[this.currentPage];

    const view = {
      page: this.currentPage,
      title: pageInfo?.title || this.currentPage,
      timestamp: new Date().toISOString(),
      referrer: document.referrer
    };

    this.history.push(view);

    // Keep last 50 views
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }

    this.saveHistory();
  }

  /**
   * Get navigation history
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit).reverse();
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('resumate_nav_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('[SmartNavigation] Failed to load history:', error);
      return [];
    }
  }

  /**
   * Save history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem('resumate_nav_history', JSON.stringify(this.history));
    } catch (error) {
      console.error('[SmartNavigation] Failed to save history:', error);
    }
  }

  /**
   * Show notification message
   */
  showNotification(type, message) {
    // Check if notification system exists
    if (typeof window.showNotification === 'function') {
      window.showNotification(type, message);
      return;
    }

    // Fallback: Simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: var(--color-${type === 'warning' ? 'warning' : 'info'}-bg);
      border: 1px solid var(--color-${type === 'warning' ? 'warning' : 'info'});
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-index-notification);
      animation: slideIn var(--transition-base);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Get suggested pages based on current progress
   */
  getSuggestedPages(limit = 3) {
    if (!this.progressTracker) {
      return [];
    }

    const suggestions = [];

    // Get all pages that are accessible
    Object.entries(this.pages).forEach(([page, info]) => {
      if (page === this.currentPage) return; // Skip current page

      const access = this.canAccessPage(page);
      if (access.allowed) {
        suggestions.push({
          page,
          title: info.title,
          category: info.category,
          icon: this.getPageIcon(info.category),
          relevance: this.calculateRelevance(info)
        });
      }
    });

    // Sort by relevance and return top suggestions
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Calculate page relevance based on current progress
   */
  calculateRelevance(pageInfo) {
    let score = 0;

    // Pages that complete steps are more relevant
    score += pageInfo.completesSteps.length * 10;

    // Incomplete steps that this page completes are highly relevant
    if (this.progressTracker) {
      pageInfo.completesSteps.forEach(stepId => {
        if (!this.progressTracker.isComplete(stepId)) {
          score += 20;
        }
      });
    }

    return score;
  }
}

// Create singleton instance (requires progressTracker to be loaded first)
let smartNavigation = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.progressTracker) {
      smartNavigation = new SmartNavigation(window.progressTracker);
      window.smartNavigation = smartNavigation;
    }
  });
} else {
  if (window.progressTracker) {
    smartNavigation = new SmartNavigation(window.progressTracker);
    window.smartNavigation = smartNavigation;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartNavigation;
}

// Add to window for global access
if (typeof window !== 'undefined') {
  window.SmartNavigation = SmartNavigation;
}
