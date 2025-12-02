/**
 * Navigation Loader - Standalone Script (No ES Modules)
 * Simple navigation component loader for ResuMate
 * Include this file with a regular <script> tag
 */
(function() {
  'use strict';

  // Configuration
  const COMPONENT_PATH = '/components/navigation.html';

  /**
   * Load and inject the navigation component
   */
  async function loadNavigation() {
    try {
      // Check if navigation already exists
      if (document.querySelector('.resumate-navbar')) {
        console.log('Navigation already loaded');
        return;
      }

      // Fetch navigation HTML
      const response = await fetch(COMPONENT_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load navigation: ${response.status}`);
      }

      const html = await response.text();

      // Create temporary container to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Get navigation and shortcuts elements
      const nav = temp.querySelector('.resumate-navbar');
      const shortcuts = temp.querySelector('.feature-shortcuts');
      const overlay = temp.querySelector('.navbar-overlay');

      // Insert navigation at the beginning of body
      if (nav) {
        document.body.insertBefore(nav, document.body.firstChild);
      }

      // Insert overlay after nav
      if (overlay) {
        nav.insertAdjacentElement('afterend', overlay);
      }

      // Append shortcuts at the end
      if (shortcuts) {
        document.body.appendChild(shortcuts);
      }

      // Initialize navigation features
      initNavigation();

      console.log('Navigation loaded successfully');

    } catch (error) {
      console.error('Failed to load navigation:', error);
    }
  }

  /**
   * Initialize all navigation features
   */
  function initNavigation() {
    initActivePageDetection();
    initDropdowns();
    initMobileMenu();
    initShortcutsMenu();
    initKeyboardNav();
    initProgressIndicator();
  }

  /**
   * Mark the current page as active in navigation
   */
  function initActivePageDetection() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('.resumate-navbar a[href]').forEach(link => {
      const href = link.getAttribute('href');

      if (href === currentPage ||
          href === `/${currentPage}` ||
          href === currentPath ||
          (currentPage === 'index.html' && (href === '/' || href === ''))) {

        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        // Mark parent dropdown as active
        const parentDropdown = link.closest('.nav-dropdown');
        if (parentDropdown) {
          const toggle = parentDropdown.querySelector('.nav-dropdown-toggle');
          if (toggle) {
            toggle.classList.add('active');
          }
        }
      }
    });
  }

  /**
   * Initialize dropdown menus
   */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      const menu = dropdown.querySelector('.nav-dropdown-menu');

      if (!toggle || !menu) return;

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        // Close all dropdowns first
        closeAllDropdowns();

        if (!isExpanded) {
          dropdown.classList.add('active');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      // Close when clicking links inside
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeAllDropdowns());
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        closeAllDropdowns();
      }
    });
  }

  /**
   * Close all open dropdowns
   */
  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
      dropdown.classList.remove('active');
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Initialize mobile menu
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-nav');
    const closeBtn = document.querySelector('.nav-close-btn');
    const overlay = document.querySelector('.navbar-overlay');

    if (!toggle || !menu) {
      console.warn('Mobile menu initialization failed - missing elements:', {
        toggle: !!toggle,
        menu: !!menu
      });
      return;
    }

    console.log('Mobile menu initialized successfully');

    function openMenu() {
      menu.classList.add('mobile-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (overlay) overlay.classList.add('active');

      // Announce to screen readers
      announce('Navigation menu opened');
    }

    function closeMenu() {
      menu.classList.remove('mobile-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (overlay) overlay.classList.remove('active');

      // Announce to screen readers
      announce('Navigation menu closed');
    }

    // Toggle button
    toggle.addEventListener('click', (e) => {
      console.log('Mobile menu toggle clicked');
      const isOpen = menu.classList.contains('mobile-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    // Overlay click
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('mobile-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && menu.classList.contains('mobile-open')) {
        closeMenu();
      }
    });
  }

  /**
   * Initialize shortcuts menu (floating quick access)
   */
  function initShortcutsMenu() {
    const toggle = document.querySelector('.shortcuts-toggle');
    const menu = document.querySelector('.shortcuts-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = menu.classList.contains('active');

      if (isActive) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        menu.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.feature-shortcuts')) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /**
   * Initialize keyboard navigation
   */
  function initKeyboardNav() {
    const nav = document.querySelector('.resumate-navbar');
    if (!nav) return;

    nav.addEventListener('keydown', (e) => {
      const target = e.target;

      switch (e.key) {
        case 'Escape':
          closeAllDropdowns();
          break;

        case 'ArrowDown':
          if (target.classList.contains('nav-dropdown-toggle')) {
            e.preventDefault();
            const dropdown = target.closest('.nav-dropdown');
            if (dropdown) {
              dropdown.classList.add('active');
              target.setAttribute('aria-expanded', 'true');
              const firstLink = dropdown.querySelector('.nav-dropdown-menu a');
              if (firstLink) firstLink.focus();
            }
          } else if (target.closest('.nav-dropdown-menu')) {
            e.preventDefault();
            const links = Array.from(target.closest('.nav-dropdown-menu').querySelectorAll('a'));
            const idx = links.indexOf(target);
            if (idx < links.length - 1) {
              links[idx + 1].focus();
            }
          }
          break;

        case 'ArrowUp':
          if (target.closest('.nav-dropdown-menu')) {
            e.preventDefault();
            const links = Array.from(target.closest('.nav-dropdown-menu').querySelectorAll('a'));
            const idx = links.indexOf(target);
            if (idx > 0) {
              links[idx - 1].focus();
            } else {
              // Go back to toggle
              const toggle = target.closest('.nav-dropdown').querySelector('.nav-dropdown-toggle');
              if (toggle) toggle.focus();
            }
          }
          break;

        case 'ArrowRight':
          if (target.classList.contains('nav-link') || target.classList.contains('nav-dropdown-toggle')) {
            e.preventDefault();
            const items = Array.from(nav.querySelectorAll('.navbar-nav > .nav-item > a, .navbar-nav > .nav-item > button'));
            const idx = items.indexOf(target);
            if (idx < items.length - 1) {
              items[idx + 1].focus();
            }
          }
          break;

        case 'ArrowLeft':
          if (target.classList.contains('nav-link') || target.classList.contains('nav-dropdown-toggle')) {
            e.preventDefault();
            const items = Array.from(nav.querySelectorAll('.navbar-nav > .nav-item > a, .navbar-nav > .nav-item > button'));
            const idx = items.indexOf(target);
            if (idx > 0) {
              items[idx - 1].focus();
            }
          }
          break;
      }
    });
  }

  /**
   * Initialize progress indicator in navigation
   */
  function initProgressIndicator() {
    // Wait for progressTracker to be available
    if (typeof window.progressTracker === 'undefined') {
      console.log('[Navigation] ProgressTracker not yet available, will retry');
      setTimeout(initProgressIndicator, 500);
      return;
    }

    const tracker = window.progressTracker;
    const navbar = document.querySelector('.resumate-navbar');

    if (!navbar) {
      console.warn('[Navigation] Navbar not found');
      return;
    }

    // Create progress indicator container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'nav-progress-indicator';
    progressContainer.setAttribute('aria-live', 'polite');

    // Insert before navbar-actions or at end of navbar-container
    const navbarContainer = navbar.querySelector('.navbar-container');
    const navbarActions = navbar.querySelector('.navbar-actions');

    if (navbarActions) {
      navbarActions.insertAdjacentElement('beforebegin', progressContainer);
    } else if (navbarContainer) {
      navbarContainer.appendChild(progressContainer);
    }

    // Function to update progress display
    function updateProgressDisplay() {
      const summary = tracker.getSummary();
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      // Show different displays based on page
      if (currentPage === 'dashboard.html') {
        // Don't show on dashboard page
        progressContainer.style.display = 'none';
        return;
      }

      progressContainer.style.display = 'flex';

      // Build progress HTML
      let html = '';

      if (summary.progress === 100) {
        // All complete
        html = `
          <div class="nav-progress-complete">
            <span class="nav-progress-icon">🎉</span>
            <span class="nav-progress-text">Complete!</span>
          </div>
        `;
      } else if (summary.progress > 0) {
        // In progress
        const nextStep = summary.nextStep;
        html = `
          <div class="nav-progress-active">
            <span class="nav-progress-label">Step ${summary.completed + 1} of ${summary.total}</span>
            <div class="nav-progress-bar">
              <div class="nav-progress-fill" style="width: ${summary.progress}%"></div>
            </div>
            ${nextStep ? `<span class="nav-progress-next">${nextStep.icon} ${nextStep.label}</span>` : ''}
          </div>
        `;
      } else {
        // Not started
        html = `
          <a href="index.html" class="nav-progress-start">
            <span class="nav-progress-icon">🚀</span>
            <span class="nav-progress-text">Get Started</span>
          </a>
        `;
      }

      progressContainer.innerHTML = html;
    }

    // Initial render
    updateProgressDisplay();

    // Listen for progress changes
    tracker.on('stepCompleted', updateProgressDisplay);
    tracker.on('progressReset', updateProgressDisplay);

    console.log('[Navigation] Progress indicator initialized');
  }

  /**
   * Announce message to screen readers
   */
  function announce(message) {
    let announcer = document.getElementById('nav-announcements');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'nav-announcements';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavigation);
  } else {
    loadNavigation();
  }

  // Expose to window for manual control
  window.ResuMateNav = {
    load: loadNavigation,
    closeAllDropdowns: closeAllDropdowns
  };

})();
