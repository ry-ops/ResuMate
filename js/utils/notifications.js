/**
 * ATSFlow Notification System
 * Toast notifications, alerts, and user feedback utilities
 *
 * Features:
 * - Toast notifications with auto-dismiss
 * - Success, error, warning, and info variants
 * - Progress indicators
 * - Custom actions
 * - Accessibility support (ARIA attributes, keyboard navigation)
 * - Mobile responsive
 *
 * @version 1.0.0
 */

class NotificationManager {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'top-right', // top-right, top-left, top-center, bottom-right, bottom-left, bottom-center
      duration: options.duration || 5000,
      maxNotifications: options.maxNotifications || 5,
      pauseOnHover: options.pauseOnHover !== false,
      showProgress: options.showProgress !== false,
      ...options
    };

    this.notifications = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize notification container
   */
  init() {
    // Create container if it doesn't exist
    this.container = document.querySelector('.notification-container');

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `notification-container ${this.options.position}`;
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notifications');
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a notification
   * @param {Object} options - Notification options
   * @returns {string} Notification ID
   */
  show(options) {
    const notification = {
      id: this.generateId(),
      type: options.type || 'info', // success, error, warning, info
      title: options.title || '',
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : this.options.duration,
      showProgress: options.showProgress !== undefined ? options.showProgress : this.options.showProgress,
      actions: options.actions || [],
      onClose: options.onClose,
      pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : this.options.pauseOnHover
    };

    // Remove oldest notification if max reached
    if (this.notifications.length >= this.options.maxNotifications) {
      this.remove(this.notifications[0].id);
    }

    this.notifications.push(notification);
    this.render(notification);

    return notification.id;
  }

  /**
   * Show success notification
   */
  success(message, title = 'Success', options = {}) {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  /**
   * Show error notification
   */
  error(message, title = 'Error', options = {}) {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 7000, // Longer duration for errors
      ...options
    });
  }

  /**
   * Show warning notification
   */
  warning(message, title = 'Warning', options = {}) {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  /**
   * Show info notification
   */
  info(message, title = 'Info', options = {}) {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  /**
   * Show loading notification
   */
  loading(message, title = 'Loading...') {
    return this.show({
      type: 'info',
      title,
      message,
      duration: 0, // Don't auto-dismiss
      showProgress: false
    });
  }

  /**
   * Render notification element
   */
  render(notification) {
    const toast = document.createElement('div');
    toast.className = `notification-toast ${notification.type}`;
    toast.id = `notification-${notification.id}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    // Icon mapping
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    // Build HTML
    let html = `
      <div class="notification-icon" aria-hidden="true">
        ${icons[notification.type] || 'ℹ'}
      </div>
      <div class="notification-content">
        ${notification.title ? `<h4 class="notification-title">${this.escapeHtml(notification.title)}</h4>` : ''}
        ${notification.message ? `<p class="notification-message">${this.escapeHtml(notification.message)}</p>` : ''}
        ${notification.actions.length > 0 ? this.renderActions(notification.actions, notification.id) : ''}
      </div>
      <button class="notification-close" onclick="window.notificationManager.remove('${notification.id}')" aria-label="Close notification">
        ✕
      </button>
    `;

    // Add progress bar if enabled
    if (notification.showProgress && notification.duration > 0) {
      html += `
        <div class="notification-progress">
          <div class="notification-progress-bar" style="width: 100%; transition: width ${notification.duration}ms linear;"></div>
        </div>
      `;
    }

    toast.innerHTML = html;

    // Insert at the beginning for top positions, at the end for bottom positions
    if (this.options.position.includes('top')) {
      this.container.insertBefore(toast, this.container.firstChild);
    } else {
      this.container.appendChild(toast);
    }

    // Start progress animation
    if (notification.showProgress && notification.duration > 0) {
      setTimeout(() => {
        const progressBar = toast.querySelector('.notification-progress-bar');
        if (progressBar) {
          progressBar.style.width = '0%';
        }
      }, 10);
    }

    // Auto-dismiss
    if (notification.duration > 0) {
      notification.timeout = setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    // Pause on hover
    if (notification.pauseOnHover && notification.duration > 0) {
      toast.addEventListener('mouseenter', () => {
        if (notification.timeout) {
          clearTimeout(notification.timeout);
          const progressBar = toast.querySelector('.notification-progress-bar');
          if (progressBar) {
            const currentWidth = progressBar.style.width;
            progressBar.style.transition = 'none';
            progressBar.style.width = currentWidth;
          }
        }
      });

      toast.addEventListener('mouseleave', () => {
        const progressBar = toast.querySelector('.notification-progress-bar');
        if (progressBar) {
          const currentWidth = parseFloat(progressBar.style.width) || 0;
          const remainingTime = (currentWidth / 100) * notification.duration;

          progressBar.style.transition = `width ${remainingTime}ms linear`;
          progressBar.style.width = '0%';

          notification.timeout = setTimeout(() => {
            this.remove(notification.id);
          }, remainingTime);
        }
      });
    }

    // Focus management for accessibility
    if (notification.type === 'error') {
      toast.focus();
    }
  }

  /**
   * Render action buttons
   */
  renderActions(actions, notificationId) {
    const actionsHtml = actions.map((action, index) => `
      <button
        class="notification-action-btn ${action.primary ? 'primary' : ''}"
        onclick="${action.onClick ? `(${action.onClick.toString()})()` : ''}"
        data-notification-id="${notificationId}"
        data-action-index="${index}"
      >
        ${this.escapeHtml(action.label)}
      </button>
    `).join('');

    return `<div class="notification-actions">${actionsHtml}</div>`;
  }

  /**
   * Remove notification
   */
  remove(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;

    const toast = document.getElementById(`notification-${id}`);
    if (toast) {
      toast.classList.add('removing');

      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }

        // Remove from notifications array
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }

        // Call onClose callback
        if (notification.onClose) {
          notification.onClose();
        }
      }, 300); // Match animation duration
    }

    // Clear timeout
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }
  }

  /**
   * Update existing notification
   */
  update(id, options) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;

    // Update notification object
    Object.assign(notification, options);

    // Remove old element
    const oldToast = document.getElementById(`notification-${id}`);
    if (oldToast) {
      oldToast.remove();
    }

    // Re-render
    this.render(notification);
  }

  /**
   * Remove all notifications
   */
  removeAll() {
    this.notifications.forEach(n => this.remove(n.id));
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Alert Banner Component
 */
class AlertBanner {
  static show(options) {
    const alert = document.createElement('div');
    alert.className = `alert-banner ${options.type || 'info'}`;
    alert.setAttribute('role', 'alert');

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    alert.innerHTML = `
      <div class="alert-icon" aria-hidden="true">${icons[options.type] || 'ℹ'}</div>
      <div class="alert-content">
        ${options.title ? `<h4 class="alert-title">${options.title}</h4>` : ''}
        ${options.message ? `<p class="alert-message">${options.message}</p>` : ''}
      </div>
      ${options.dismissible !== false ? '<button class="alert-close" aria-label="Close alert">✕</button>' : ''}
    `;

    // Insert into target or body
    const target = options.target ? document.querySelector(options.target) : document.body;
    if (options.prepend) {
      target.insertBefore(alert, target.firstChild);
    } else {
      target.appendChild(alert);
    }

    // Add close functionality
    if (options.dismissible !== false) {
      const closeBtn = alert.querySelector('.alert-close');
      closeBtn.addEventListener('click', () => {
        alert.remove();
        if (options.onClose) options.onClose();
      });
    }

    return alert;
  }
}

/**
 * Loading Overlay
 */
class LoadingOverlay {
  static show(message = 'Loading...') {
    // Remove existing overlay
    LoadingOverlay.hide();

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Loading');
    overlay.setAttribute('aria-busy', 'true');

    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner lg"></div>
        <p class="loading-text">${message}</p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    return overlay;
  }

  static hide() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }

  static update(message) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      const text = overlay.querySelector('.loading-text');
      if (text) {
        text.textContent = message;
      }
    }
  }
}

/**
 * Progress Bar
 */
class ProgressBar {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      type: options.type || 'default', // default, success, warning, danger
      showPercentage: options.showPercentage !== false,
      ...options
    };
    this.value = 0;
    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'progress-bar';
    this.element.setAttribute('role', 'progressbar');
    this.element.setAttribute('aria-valuemin', '0');
    this.element.setAttribute('aria-valuemax', '100');
    this.element.setAttribute('aria-valuenow', this.value);

    this.fill = document.createElement('div');
    this.fill.className = `progress-bar-fill ${this.options.type}`;
    this.fill.style.width = `${this.value}%`;

    this.element.appendChild(this.fill);
    this.container.appendChild(this.element);
  }

  update(value) {
    this.value = Math.min(100, Math.max(0, value));
    this.fill.style.width = `${this.value}%`;
    this.element.setAttribute('aria-valuenow', this.value);
  }

  complete() {
    this.update(100);
  }

  reset() {
    this.update(0);
  }

  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Initialize global notification manager
if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
  window.AlertBanner = AlertBanner;
  window.LoadingOverlay = LoadingOverlay;
  window.ProgressBar = ProgressBar;

  // Create default instance
  window.notificationManager = new NotificationManager();

  // Add convenience methods to window
  window.notify = {
    success: (message, title, options) => window.notificationManager.success(message, title, options),
    error: (message, title, options) => window.notificationManager.error(message, title, options),
    warning: (message, title, options) => window.notificationManager.warning(message, title, options),
    info: (message, title, options) => window.notificationManager.info(message, title, options),
    loading: (message, title) => window.notificationManager.loading(message, title)
  };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NotificationManager,
    AlertBanner,
    LoadingOverlay,
    ProgressBar
  };
}
