/**
 * ATSFlow Workflow Analytics Module
 * Tracks performance metrics, user behavior, and identifies drop-off points
 * All data is logged to console (no external services)
 */

class WorkflowAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.events = [];
    this.stepTimings = {};
    this.currentStep = null;
    this.stepStartTime = null;
    this.errors = [];
    this.performanceMetrics = {
      pageLoadTime: 0,
      timeToFirstInteraction: 0,
      totalWorkflowTime: 0,
      stepCompletionTimes: [],
      apiResponseTimes: []
    };

    this.init();
  }

  /**
   * Initialize analytics tracking
   */
  init() {
    this.trackPageLoad();
    this.trackUserInteractions();
    this.trackPerformance();
    this.trackErrors();
    this.trackStepProgress();
    this.setupBeforeUnload();

    console.log('[Analytics] Session started:', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      const firstPaint = timing.responseEnd - timing.fetchStart;

      this.performanceMetrics.pageLoadTime = loadTime;

      this.logEvent('page_load', {
        loadTime,
        domReady,
        firstPaint,
        timing: {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          domProcessing: timing.domComplete - timing.domLoading
        }
      });

      console.log('[Analytics] Page Load Metrics:', {
        loadTime: `${loadTime}ms`,
        domReady: `${domReady}ms`,
        firstPaint: `${firstPaint}ms`
      });
    }

    // Track First Contentful Paint (FCP)
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              console.log('[Analytics] First Contentful Paint:', `${entry.startTime}ms`);
              this.logEvent('fcp', { time: entry.startTime });
            }
          }
        });

        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
  }

  /**
   * Track user interactions
   */
  trackUserInteractions() {
    // Track first user interaction
    const interactionEvents = ['click', 'keydown', 'touchstart'];
    let firstInteraction = false;

    const handleFirstInteraction = (e) => {
      if (!firstInteraction) {
        firstInteraction = true;
        const timeToInteraction = Date.now() - this.sessionStartTime;
        this.performanceMetrics.timeToFirstInteraction = timeToInteraction;

        this.logEvent('first_interaction', {
          type: e.type,
          time: timeToInteraction,
          target: e.target.tagName
        });

        console.log('[Analytics] First User Interaction:', {
          type: e.type,
          time: `${timeToInteraction}ms`
        });

        interactionEvents.forEach(event => {
          document.removeEventListener(event, handleFirstInteraction);
        });
      }
    };

    interactionEvents.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, [role="button"], a')) {
        const buttonText = e.target.textContent.trim();
        const buttonId = e.target.id;

        this.logEvent('button_click', {
          text: buttonText,
          id: buttonId,
          step: this.currentStep
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const formId = e.target.id;
      const formData = new FormData(e.target);
      const fieldCount = Array.from(formData.keys()).length;

      this.logEvent('form_submit', {
        formId,
        fieldCount,
        step: this.currentStep
      });
    });

    // Track input changes (debounced)
    let inputTimeout;
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
          this.logEvent('input_change', {
            field: e.target.id || e.target.name,
            type: e.target.type,
            hasValue: !!e.target.value,
            step: this.currentStep
          });
        }, 1000);
      }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance() {
    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.performanceMetrics.apiResponseTimes.push({
          url,
          duration,
          status: response.status,
          timestamp: Date.now()
        });

        this.logEvent('api_call', {
          url,
          duration: Math.round(duration),
          status: response.status,
          success: response.ok
        });

        console.log('[Analytics] API Call:', {
          url,
          duration: `${Math.round(duration)}ms`,
          status: response.status
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.logEvent('api_error', {
          url,
          duration: Math.round(duration),
          error: error.message
        });

        console.error('[Analytics] API Error:', {
          url,
          duration: `${Math.round(duration)}ms`,
          error: error.message
        });

        throw error;
      }
    };

    // Track long tasks (tasks taking > 50ms)
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('[Analytics] Long Task Detected:', {
                duration: `${Math.round(entry.duration)}ms`,
                startTime: `${Math.round(entry.startTime)}ms`
              });

              this.logEvent('long_task', {
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime)
              });
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }
    }

    // Track memory usage (if available)
    if (performance.memory) {
      setInterval(() => {
        const memory = {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };

        this.logEvent('memory_usage', memory);
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Track errors
   */
  trackErrors() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      const error = {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      };

      this.errors.push(error);
      this.logEvent('error', error);

      console.error('[Analytics] JavaScript Error:', error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        reason: event.reason?.message || event.reason,
        promise: event.promise,
        timestamp: Date.now()
      };

      this.errors.push(error);
      this.logEvent('unhandled_rejection', error);

      console.error('[Analytics] Unhandled Rejection:', error);
    });

    // Track console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.logEvent('console_error', {
        message: args.join(' '),
        timestamp: Date.now()
      });

      originalError.apply(console, args);
    };
  }

  /**
   * Track step progress through workflow
   */
  trackStepProgress() {
    // Listen for step change events
    document.addEventListener('workflow:step-changed', (e) => {
      const { step, direction } = e.detail || {};
      this.trackStepChange(step, direction);
    });

    // Observe DOM for step visibility changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target;

          if (element.hasAttribute('data-workflow-step')) {
            const step = parseInt(element.dataset.workflowStep);

            if (element.classList.contains('active')) {
              this.startStep(step);
            }
          }
        }
      });
    });

    const steps = document.querySelectorAll('[data-workflow-step]');
    steps.forEach(step => {
      observer.observe(step, { attributes: true });
    });
  }

  /**
   * Start tracking a workflow step
   */
  startStep(stepNumber) {
    // Complete previous step if any
    if (this.currentStep !== null) {
      this.completeStep(this.currentStep);
    }

    this.currentStep = stepNumber;
    this.stepStartTime = Date.now();

    this.logEvent('step_started', {
      step: stepNumber,
      timestamp: this.stepStartTime
    });

    console.log(`[Analytics] Step ${stepNumber} Started`);
  }

  /**
   * Complete a workflow step
   */
  completeStep(stepNumber) {
    if (this.stepStartTime) {
      const completionTime = Date.now() - this.stepStartTime;
      const stepName = this.getStepName(stepNumber);

      this.stepTimings[stepNumber] = completionTime;
      this.performanceMetrics.stepCompletionTimes.push({
        step: stepNumber,
        name: stepName,
        time: completionTime
      });

      this.logEvent('step_completed', {
        step: stepNumber,
        name: stepName,
        duration: completionTime
      });

      console.log(`[Analytics] Step ${stepNumber} (${stepName}) Completed:`, {
        duration: `${(completionTime / 1000).toFixed(2)}s`
      });
    }
  }

  /**
   * Track step navigation
   */
  trackStepNavigation(direction, toStep) {
    this.logEvent('step_navigation', {
      direction,
      fromStep: this.currentStep,
      toStep
    });

    console.log(`[Analytics] Navigation: ${direction} to Step ${toStep}`);
  }

  /**
   * Get human-readable step name
   */
  getStepName(stepNumber) {
    const stepNames = {
      0: 'Upload',
      1: 'Analyze',
      2: 'Tailor',
      3: 'Generate',
      4: 'Export'
    };

    return stepNames[stepNumber] || `Step ${stepNumber}`;
  }

  /**
   * Identify drop-off points
   */
  identifyDropOffPoints() {
    const dropOffData = [];
    const totalSteps = Object.keys(this.stepTimings).length;

    for (let i = 0; i < 5; i++) {
      const stepCompleted = this.stepTimings.hasOwnProperty(i);
      const completionRate = totalSteps > 0 ? ((i + 1) / totalSteps) * 100 : 0;

      if (!stepCompleted && i <= this.currentStep) {
        dropOffData.push({
          step: i,
          name: this.getStepName(i),
          dropped: true,
          completionRate: `${completionRate.toFixed(1)}%`
        });
      }
    }

    if (dropOffData.length > 0) {
      console.warn('[Analytics] Drop-off Points Identified:', dropOffData);
    }

    return dropOffData;
  }

  /**
   * Log analytics event
   */
  logEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      step: this.currentStep,
      url: window.location.href,
      ...data
    };

    this.events.push(event);

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    const sessionDuration = Date.now() - this.sessionStartTime;

    const summary = {
      sessionId: this.sessionId,
      duration: sessionDuration,
      durationFormatted: this.formatDuration(sessionDuration),
      currentStep: this.currentStep,
      stepsCompleted: Object.keys(this.stepTimings).length,
      totalEvents: this.events.length,
      totalErrors: this.errors.length,
      stepTimings: this.stepTimings,
      performanceMetrics: this.performanceMetrics,
      averageStepTime: this.calculateAverageStepTime(),
      dropOffPoints: this.identifyDropOffPoints()
    };

    return summary;
  }

  /**
   * Calculate average step completion time
   */
  calculateAverageStepTime() {
    const times = Object.values(this.stepTimings);

    if (times.length === 0) return 0;

    const sum = times.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / times.length);
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Export analytics data
   */
  exportData() {
    const data = {
      summary: this.getSessionSummary(),
      events: this.events,
      errors: this.errors
    };

    console.log('[Analytics] Session Data Export:', data);

    return data;
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    const summary = this.getSessionSummary();

    const report = {
      overview: {
        sessionDuration: summary.durationFormatted,
        stepsCompleted: `${summary.stepsCompleted}/5`,
        completionRate: `${(summary.stepsCompleted / 5 * 100).toFixed(1)}%`,
        totalEvents: summary.totalEvents,
        totalErrors: summary.totalErrors
      },
      performance: {
        pageLoadTime: `${this.performanceMetrics.pageLoadTime}ms`,
        timeToFirstInteraction: `${this.performanceMetrics.timeToFirstInteraction}ms`,
        averageStepTime: this.formatDuration(summary.averageStepTime),
        averageApiResponseTime: this.calculateAverageApiTime()
      },
      stepTimings: Object.entries(this.stepTimings).map(([step, time]) => ({
        step: parseInt(step),
        name: this.getStepName(parseInt(step)),
        duration: this.formatDuration(time)
      })),
      dropOffPoints: summary.dropOffPoints,
      errors: this.errors.map(err => ({
        message: err.message,
        source: err.source,
        timestamp: new Date(err.timestamp).toISOString()
      }))
    };

    console.log('[Analytics] Performance Report:', report);

    return report;
  }

  /**
   * Calculate average API response time
   */
  calculateAverageApiTime() {
    if (this.performanceMetrics.apiResponseTimes.length === 0) {
      return 'N/A';
    }

    const sum = this.performanceMetrics.apiResponseTimes.reduce(
      (acc, item) => acc + item.duration,
      0
    );
    const avg = sum / this.performanceMetrics.apiResponseTimes.length;

    return `${Math.round(avg)}ms`;
  }

  /**
   * Setup before unload handler
   */
  setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      // Log final session data
      const summary = this.getSessionSummary();

      console.log('[Analytics] Session Ending:', summary);

      // Save to localStorage for later retrieval
      try {
        const previousSessions = JSON.parse(
          localStorage.getItem('resumate_analytics_sessions') || '[]'
        );

        previousSessions.push({
          sessionId: this.sessionId,
          summary: summary,
          timestamp: Date.now()
        });

        // Keep only last 10 sessions
        if (previousSessions.length > 10) {
          previousSessions.shift();
        }

        localStorage.setItem(
          'resumate_analytics_sessions',
          JSON.stringify(previousSessions)
        );
      } catch (e) {
        console.error('[Analytics] Failed to save session data:', e);
      }
    });
  }

  /**
   * Get previous sessions from localStorage
   */
  getPreviousSessions() {
    try {
      const sessions = JSON.parse(
        localStorage.getItem('resumate_analytics_sessions') || '[]'
      );

      return sessions;
    } catch (e) {
      console.error('[Analytics] Failed to retrieve previous sessions:', e);
      return [];
    }
  }

  /**
   * Clear all analytics data
   */
  clearData() {
    this.events = [];
    this.errors = [];
    this.stepTimings = {};

    try {
      localStorage.removeItem('resumate_analytics_sessions');
    } catch (e) {
      console.error('[Analytics] Failed to clear data:', e);
    }

    console.log('[Analytics] All data cleared');
  }

  /**
   * Display analytics dashboard in console
   */
  showDashboard() {
    console.group('📊 ATSFlow Workflow Analytics Dashboard');

    const report = this.generatePerformanceReport();

    console.group('📈 Overview');
    console.table(report.overview);
    console.groupEnd();

    console.group('⚡ Performance');
    console.table(report.performance);
    console.groupEnd();

    if (report.stepTimings.length > 0) {
      console.group('📝 Step Timings');
      console.table(report.stepTimings);
      console.groupEnd();
    }

    if (report.dropOffPoints.length > 0) {
      console.group('⚠️ Drop-off Points');
      console.table(report.dropOffPoints);
      console.groupEnd();
    }

    if (report.errors.length > 0) {
      console.group('❌ Errors');
      console.table(report.errors);
      console.groupEnd();
    }

    console.groupEnd();
  }
}

// Initialize analytics on load
let workflowAnalytics;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    workflowAnalytics = new WorkflowAnalytics();
    window.WorkflowAnalytics = workflowAnalytics;
  });
} else {
  workflowAnalytics = new WorkflowAnalytics();
  window.WorkflowAnalytics = workflowAnalytics;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowAnalytics;
}

// Add global console command for easy access
if (typeof window !== 'undefined') {
  window.showAnalytics = () => {
    if (window.WorkflowAnalytics) {
      window.WorkflowAnalytics.showDashboard();
    } else {
      console.log('Analytics not initialized yet');
    }
  };

  console.log('💡 Tip: Type "showAnalytics()" in console to view workflow analytics');
}
