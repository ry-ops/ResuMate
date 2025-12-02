/**
 * ResuMate Preview Controller
 * Manages live preview with debounced updates and view modes
 */

class PreviewController {
    constructor(renderer) {
        this.renderer = renderer || new ResumeRenderer();
        this.previewContainer = null;
        this.updateIndicator = null;
        this.debounceTimer = null;
        this.debounceDelay = 300; // 300ms debounce for <500ms total latency
        this.viewMode = 'split'; // 'split', 'overlay', 'hidden'
        this.printPreview = false;
        this.pageSize = 'a4';

        // Performance tracking
        this.lastUpdateTime = 0;
        this.updateCount = 0;

        // State listener
        this.stateListener = null;
    }

    /**
     * Initialize the preview system
     * @param {string} containerId - ID of preview container element
     */
    initialize(containerId) {
        this.previewContainer = document.getElementById(containerId);

        if (!this.previewContainer) {
            console.error(`Preview container '${containerId}' not found`);
            return false;
        }

        // Create update indicator
        this.createUpdateIndicator();

        // Set up resize handling
        this.setupResizer();

        // Set up toolbar event listeners
        this.setupToolbar();

        // Initial render
        this.render(this.getResumeState());

        console.log('[Preview] Initialized successfully');
        return true;
    }

    /**
     * Create visual update indicator
     */
    createUpdateIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'preview-updating';
        indicator.textContent = 'Updating...';
        this.updateIndicator = indicator;

        if (this.previewContainer) {
            this.previewContainer.appendChild(indicator);
        }
    }

    /**
     * Show update indicator
     */
    showUpdateIndicator() {
        if (this.updateIndicator) {
            this.updateIndicator.classList.add('visible');
        }
    }

    /**
     * Hide update indicator
     */
    hideUpdateIndicator() {
        if (this.updateIndicator) {
            this.updateIndicator.classList.remove('visible');
        }
    }

    /**
     * Set up resizable panel functionality
     */
    setupResizer() {
        const resizer = document.querySelector('.preview-resizer');
        if (!resizer) return;

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            const editorPanel = document.querySelector('.editor-panel');
            if (editorPanel) {
                startWidth = editorPanel.offsetWidth;
            }
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const editorPanel = document.querySelector('.editor-panel');
            if (editorPanel) {
                const deltaX = e.clientX - startX;
                const newWidth = startWidth + deltaX;
                const minWidth = 300;
                const maxWidth = window.innerWidth - 500;

                if (newWidth >= minWidth && newWidth <= maxWidth) {
                    editorPanel.style.flex = 'none';
                    editorPanel.style.width = `${newWidth}px`;
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = '';
            }
        });
    }

    /**
     * Set up toolbar controls
     */
    setupToolbar() {
        // View mode toggle
        const splitViewBtn = document.getElementById('toggle-split-view');
        if (splitViewBtn) {
            splitViewBtn.addEventListener('click', () => this.toggleViewMode('split'));
        }

        const overlayBtn = document.getElementById('toggle-overlay');
        if (overlayBtn) {
            overlayBtn.addEventListener('click', () => this.toggleViewMode('overlay'));
        }

        const hidePreviewBtn = document.getElementById('hide-preview');
        if (hidePreviewBtn) {
            hidePreviewBtn.addEventListener('click', () => this.toggleViewMode('hidden'));
        }

        // Print preview toggle
        const printPreviewBtn = document.getElementById('toggle-print-preview');
        if (printPreviewBtn) {
            printPreviewBtn.addEventListener('click', () => this.togglePrintPreview());
        }

        // Page size toggle
        const a4Btn = document.getElementById('page-size-a4');
        if (a4Btn) {
            a4Btn.addEventListener('click', () => this.setPageSize('a4'));
        }

        const letterBtn = document.getElementById('page-size-letter');
        if (letterBtn) {
            letterBtn.addEventListener('click', () => this.setPageSize('letter'));
        }
    }

    /**
     * Toggle view mode
     * @param {string} mode - 'split', 'overlay', or 'hidden'
     */
    toggleViewMode(mode) {
        this.viewMode = mode;
        const layout = document.querySelector('.preview-layout');

        if (layout) {
            layout.classList.remove('split-view', 'overlay-mode', 'hide-preview');

            switch (mode) {
                case 'split':
                    layout.classList.add('split-view');
                    break;
                case 'overlay':
                    layout.classList.add('overlay-mode');
                    break;
                case 'hidden':
                    layout.classList.add('hide-preview');
                    break;
            }
        }

        // Update button states
        document.querySelectorAll('[id^="toggle-"]').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(`toggle-${mode === 'split' ? 'split-view' : mode}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        console.log(`[Preview] View mode changed to: ${mode}`);
    }

    /**
     * Toggle print preview mode
     */
    togglePrintPreview() {
        this.printPreview = !this.printPreview;
        const previewPanel = document.querySelector('.preview-panel');
        const btn = document.getElementById('toggle-print-preview');

        if (previewPanel) {
            previewPanel.classList.toggle('print-preview', this.printPreview);
        }

        if (btn) {
            btn.classList.toggle('active', this.printPreview);
        }

        // Use PrintManager if available
        if (window.exportManager && window.exportManager.printManager) {
            window.exportManager.printManager.togglePrintPreview();
        }

        console.log(`[Preview] Print preview: ${this.printPreview}`);
    }

    /**
     * Set page size
     * @param {string} size - 'a4' or 'letter'
     */
    setPageSize(size) {
        this.pageSize = size;
        this.renderer.setPageSize(size);

        // Update button states
        document.querySelectorAll('[id^="page-size-"]').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(`page-size-${size}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Re-render with new page size
        this.render(this.getResumeState());

        console.log(`[Preview] Page size changed to: ${size}`);
    }

    /**
     * Listen for state changes
     * @param {Function} callback - Callback function when state changes
     */
    onStateChange(callback) {
        this.stateListener = callback;
    }

    /**
     * Update preview with debouncing
     * @param {Object} resumeState - Updated resume state
     */
    update(resumeState) {
        // Clear existing debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Show updating indicator
        this.showUpdateIndicator();

        // Debounce the actual update
        this.debounceTimer = setTimeout(() => {
            this.render(resumeState);
            this.hideUpdateIndicator();
        }, this.debounceDelay);
    }

    /**
     * Render preview immediately (no debounce)
     * @param {Object} resumeState - Resume state to render
     */
    render(resumeState) {
        const startTime = performance.now();

        if (!this.previewContainer) {
            console.error('[Preview] Container not initialized');
            return;
        }

        try {
            // Generate HTML
            const html = this.renderer.render(resumeState);

            // Find or create document container
            let documentContainer = this.previewContainer.querySelector('.resume-document');

            if (documentContainer) {
                // Update existing content
                documentContainer.outerHTML = html;
            } else {
                // Create new content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                this.previewContainer.appendChild(tempDiv.firstElementChild);
            }

            // Update page count
            this.updatePageCount();

            // Performance tracking
            const renderTime = performance.now() - startTime;
            this.lastUpdateTime = renderTime;
            this.updateCount++;

            console.log(`[Preview] Rendered in ${renderTime.toFixed(2)}ms (Update #${this.updateCount})`);

            // Warn if render time exceeds target
            if (renderTime > 500) {
                console.warn(`[Preview] Render time exceeded 500ms target: ${renderTime.toFixed(2)}ms`);
            }

        } catch (error) {
            console.error('[Preview] Render error:', error);
            this.showError('Failed to render preview');
        }
    }

    /**
     * Update page count display
     */
    updatePageCount() {
        const pages = this.previewContainer.querySelectorAll('.resume-page');
        const pageInfo = document.getElementById('page-count');

        if (pageInfo) {
            pageInfo.textContent = `${pages.length} page${pages.length !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Show error message in preview
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.previewContainer) {
            this.previewContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--danger-color);">
                    <h3>Preview Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Get current resume state
     * This should be connected to the state management system
     * @returns {Object} Resume state
     */
    getResumeState() {
        // Check if global state manager exists
        if (typeof window.ResumeState !== 'undefined' && window.ResumeState) {
            return window.ResumeState.get();
        }

        // Check localStorage fallback
        const savedState = localStorage.getItem('resumate-state');
        if (savedState) {
            try {
                return JSON.parse(savedState);
            } catch (e) {
                console.error('[Preview] Failed to parse saved state:', e);
            }
        }

        // Return empty state
        return {
            sections: []
        };
    }

    /**
     * Export preview as HTML
     * @returns {string} Complete HTML document
     */
    exportHTML() {
        const resumeState = this.getResumeState();
        const html = this.renderer.render(resumeState);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        ${this.getExportStyles()}
    </style>
</head>
<body>
    ${html}
</body>
</html>
        `;
    }

    /**
     * Get styles for export
     * @returns {string} CSS styles
     */
    getExportStyles() {
        // Load preview.css content for export
        // This is a simplified version - actual implementation would fetch the CSS
        return `
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .resume-document { max-width: 816px; margin: 0 auto; background: white; }
            .resume-page { padding: 1in; }
            /* Add more styles as needed */
        `;
    }

    /**
     * Print current preview
     */
    print() {
        window.print();
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        return {
            lastUpdateTime: this.lastUpdateTime,
            updateCount: this.updateCount,
            averageUpdateTime: this.updateCount > 0 ?
                (this.lastUpdateTime / this.updateCount) : 0
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        if (this.updateIndicator && this.updateIndicator.parentNode) {
            this.updateIndicator.parentNode.removeChild(this.updateIndicator);
        }

        this.stateListener = null;

        console.log('[Preview] Destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreviewController;
}
