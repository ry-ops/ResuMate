/**
 * ResuMate Auto-Save Manager
 * Implements automatic saving to localStorage every 30 seconds
 */

class AutoSaveManager {
    constructor(state, options = {}) {
        this.state = state;
        this.interval = options.interval || 30000; // 30 seconds default
        this.minInterval = options.minInterval || 5000; // Minimum 5 seconds
        this.enabled = options.enabled !== false; // Enabled by default
        this.timer = null;
        this.lastSaveTime = null;
        this.pendingChanges = false;
        this.listeners = {};

        // Visual indicator settings
        this.showIndicator = options.showIndicator !== false;
        this.indicatorElement = null;

        this.initialize();
    }

    /**
     * Initialize auto-save
     */
    initialize() {
        // Create save indicator
        if (this.showIndicator) {
            this.createSaveIndicator();
        }

        // Load last save time
        this.loadLastSaveTime();

        // Set up state listeners
        this.setupStateListeners();

        // Start auto-save if enabled
        if (this.enabled) {
            this.start();
        }

        console.log('Auto-save manager initialized. Interval:', this.interval, 'ms');
    }

    /**
     * Create visual save indicator
     */
    createSaveIndicator() {
        this.indicatorElement = document.createElement('div');
        this.indicatorElement.className = 'autosave-indicator';
        this.indicatorElement.innerHTML = `
            <span class="autosave-icon">💾</span>
            <span class="autosave-text">Saved</span>
        `;

        // Add to document
        document.body.appendChild(this.indicatorElement);

        console.log('Auto-save indicator created');
    }

    /**
     * Set up state change listeners
     */
    setupStateListeners() {
        // Mark as pending when state changes
        this.state.on('stateModified', () => {
            this.pendingChanges = true;
            this.updateIndicator('unsaved');
        });

        // Update indicator when saved
        this.state.on('saveStatusChanged', (status) => {
            this.updateIndicator(status);
        });
    }

    /**
     * Start auto-save
     */
    start() {
        if (this.timer) {
            return; // Already running
        }

        this.enabled = true;
        this.timer = setInterval(() => {
            this.performSave();
        }, this.interval);

        console.log('Auto-save started. Interval:', this.interval, 'ms');
        this.emit('autoSaveStarted');
    }

    /**
     * Stop auto-save
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.enabled = false;
        console.log('Auto-save stopped');
        this.emit('autoSaveStopped');
    }

    /**
     * Perform save operation
     */
    performSave() {
        if (!this.pendingChanges) {
            console.log('Auto-save skipped: No pending changes');
            return;
        }

        this.updateIndicator('saving');
        console.log('Auto-save: Saving state...');

        try {
            // Save state
            const success = this.state.saveToStorage();

            if (success) {
                this.lastSaveTime = Date.now();
                this.pendingChanges = false;
                this.persistLastSaveTime();

                this.updateIndicator('saved');
                this.emit('autoSaveCompleted', {
                    timestamp: this.lastSaveTime
                });

                console.log('Auto-save completed successfully at', new Date(this.lastSaveTime).toLocaleTimeString());
            } else {
                this.updateIndicator('error');
                this.emit('autoSaveFailed', {
                    error: 'Save operation returned false'
                });

                console.error('Auto-save failed');
            }
        } catch (error) {
            this.updateIndicator('error');
            this.emit('autoSaveFailed', {
                error: error.message
            });

            console.error('Auto-save error:', error);
        }
    }

    /**
     * Force immediate save
     */
    forceSave() {
        console.log('Force save triggered');
        this.performSave();
    }

    /**
     * Update visual indicator
     */
    updateIndicator(status) {
        if (!this.indicatorElement) {
            return;
        }

        const iconEl = this.indicatorElement.querySelector('.autosave-icon');
        const textEl = this.indicatorElement.querySelector('.autosave-text');

        // Remove all status classes
        this.indicatorElement.classList.remove('saving', 'saved', 'unsaved', 'error');

        switch (status) {
            case 'saving':
                this.indicatorElement.classList.add('saving');
                iconEl.textContent = '⏳';
                textEl.textContent = 'Saving...';
                break;

            case 'saved':
                this.indicatorElement.classList.add('saved');
                iconEl.textContent = '✓';
                textEl.textContent = this.getLastSaveText();

                // Hide after 3 seconds
                setTimeout(() => {
                    if (this.indicatorElement.classList.contains('saved')) {
                        this.indicatorElement.classList.add('fade-out');
                    }
                }, 3000);
                break;

            case 'unsaved':
                this.indicatorElement.classList.remove('fade-out');
                this.indicatorElement.classList.add('unsaved');
                iconEl.textContent = '•';
                textEl.textContent = 'Unsaved changes';
                break;

            case 'error':
                this.indicatorElement.classList.add('error');
                iconEl.textContent = '⚠';
                textEl.textContent = 'Save failed';
                break;
        }
    }

    /**
     * Get last save time text
     */
    getLastSaveText() {
        if (!this.lastSaveTime) {
            return 'Saved';
        }

        const now = Date.now();
        const diff = now - this.lastSaveTime;

        if (diff < 60000) {
            // Less than 1 minute
            return 'Saved just now';
        } else if (diff < 3600000) {
            // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `Saved ${minutes}m ago`;
        } else {
            // Show time
            const time = new Date(this.lastSaveTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            return `Saved at ${time}`;
        }
    }

    /**
     * Update save interval
     */
    setInterval(milliseconds) {
        if (milliseconds < this.minInterval) {
            console.warn('Interval too short, using minimum:', this.minInterval);
            milliseconds = this.minInterval;
        }

        this.interval = milliseconds;

        // Restart if running
        if (this.timer) {
            this.stop();
            this.start();
        }

        console.log('Auto-save interval updated to:', milliseconds, 'ms');
        this.emit('intervalChanged', milliseconds);
    }

    /**
     * Get current interval
     */
    getInterval() {
        return this.interval;
    }

    /**
     * Check if auto-save is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Check if there are pending changes
     */
    hasPendingChanges() {
        return this.pendingChanges;
    }

    /**
     * Get last save time
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * Get time since last save
     */
    getTimeSinceLastSave() {
        if (!this.lastSaveTime) {
            return null;
        }
        return Date.now() - this.lastSaveTime;
    }

    /**
     * Persist last save time to localStorage
     */
    persistLastSaveTime() {
        try {
            localStorage.setItem('resumate_last_save', this.lastSaveTime.toString());
        } catch (error) {
            console.error('Failed to persist last save time:', error);
        }
    }

    /**
     * Load last save time from localStorage
     */
    loadLastSaveTime() {
        try {
            const saved = localStorage.getItem('resumate_last_save');
            if (saved) {
                this.lastSaveTime = parseInt(saved, 10);
                console.log('Last save time loaded:', new Date(this.lastSaveTime).toLocaleString());
            }
        } catch (error) {
            console.error('Failed to load last save time:', error);
        }
    }

    /**
     * Get auto-save stats
     */
    getStats() {
        return {
            enabled: this.enabled,
            interval: this.interval,
            lastSaveTime: this.lastSaveTime,
            timeSinceLastSave: this.getTimeSinceLastSave(),
            pendingChanges: this.pendingChanges,
            lastSaveText: this.getLastSaveText()
        };
    }

    /**
     * Subscribe to auto-save events
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from auto-save events
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in auto-save listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Set up beforeunload handler to save before leaving
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (this.pendingChanges) {
                // Save immediately
                this.performSave();

                // Show warning
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        console.log('beforeunload handler set up');
    }

    /**
     * Set up page visibility handling (save when tab becomes hidden)
     */
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.pendingChanges) {
                console.log('Tab hidden, performing auto-save...');
                this.performSave();
            }
        });

        console.log('Visibility change handler set up');
    }

    /**
     * Enable all safety features
     */
    enableSafetyFeatures() {
        this.setupBeforeUnload();
        this.setupVisibilityHandler();
        console.log('Auto-save safety features enabled');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.stop();

        if (this.indicatorElement && this.indicatorElement.parentNode) {
            this.indicatorElement.parentNode.removeChild(this.indicatorElement);
        }

        this.listeners = {};
        console.log('Auto-save manager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoSaveManager;
}
