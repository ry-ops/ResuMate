/**
 * ResuMate History Manager
 * Implements undo/redo functionality with 50+ state stack
 */

class HistoryManager {
    constructor(state, options = {}) {
        this.state = state;
        this.maxStates = options.maxStates || 50;
        this.undoStack = [];
        this.redoStack = [];
        this.isUndoing = false;
        this.isRedoing = false;
        this.listeners = {};

        // Debounce settings for auto-save on change
        this.saveDebounceMs = options.saveDebounceMs || 500;
        this.saveDebounceTimer = null;

        this.initialize();
    }

    /**
     * Initialize history manager
     */
    initialize() {
        // Load history from localStorage
        this.loadHistory();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Listen to state changes
        this.setupStateListeners();

        console.log('History manager initialized');
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd+Z or Ctrl+Z for undo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
                return;
            }

            // Cmd+Shift+Z or Ctrl+Shift+Z for redo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.redo();
                return;
            }

            // Cmd+Y or Ctrl+Y for redo (alternative)
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
                return;
            }
        });

        console.log('Keyboard shortcuts registered: Cmd+Z (undo), Cmd+Shift+Z (redo)');
    }

    /**
     * Set up state change listeners
     */
    setupStateListeners() {
        // Save state when modified (debounced)
        this.state.on('stateModified', () => {
            if (!this.isUndoing && !this.isRedoing) {
                this.debouncedSaveState();
            }
        });
    }

    /**
     * Debounced save state
     */
    debouncedSaveState() {
        clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = setTimeout(() => {
            this.saveState();
        }, this.saveDebounceMs);
    }

    /**
     * Save current state to history
     */
    saveState() {
        if (this.isUndoing || this.isRedoing) {
            return;
        }

        const currentState = this.captureState();

        // Don't save if identical to last state
        if (this.undoStack.length > 0) {
            const lastState = this.undoStack[this.undoStack.length - 1];
            if (this.statesEqual(currentState, lastState)) {
                return;
            }
        }

        // Add to undo stack
        this.undoStack.push(currentState);

        // Limit stack size
        if (this.undoStack.length > this.maxStates) {
            this.undoStack.shift();
        }

        // Clear redo stack when new action performed
        this.redoStack = [];

        // Persist to localStorage
        this.persistHistory();

        // Emit event
        this.emit('historySaved', {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length
        });

        console.log('State saved to history. Stack size:', this.undoStack.length);
    }

    /**
     * Capture current state
     */
    captureState() {
        return {
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(this.state.getState()))
        };
    }

    /**
     * Compare two states for equality
     */
    statesEqual(state1, state2) {
        return JSON.stringify(state1.state) === JSON.stringify(state2.state);
    }

    /**
     * Undo last action
     */
    undo() {
        if (!this.canUndo()) {
            console.log('Nothing to undo');
            return false;
        }

        this.isUndoing = true;

        // Save current state to redo stack
        const currentState = this.captureState();
        this.redoStack.push(currentState);

        // Get previous state
        const previousState = this.undoStack.pop();

        // Restore state
        this.restoreState(previousState);

        this.isUndoing = false;

        // Persist to localStorage
        this.persistHistory();

        // Emit event
        this.emit('undoPerformed', {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length
        });

        console.log('Undo performed. Undo stack:', this.undoStack.length, 'Redo stack:', this.redoStack.length);
        return true;
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (!this.canRedo()) {
            console.log('Nothing to redo');
            return false;
        }

        this.isRedoing = true;

        // Save current state to undo stack
        const currentState = this.captureState();
        this.undoStack.push(currentState);

        // Get next state
        const nextState = this.redoStack.pop();

        // Restore state
        this.restoreState(nextState);

        this.isRedoing = false;

        // Persist to localStorage
        this.persistHistory();

        // Emit event
        this.emit('redoPerformed', {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length
        });

        console.log('Redo performed. Undo stack:', this.undoStack.length, 'Redo stack:', this.redoStack.length);
        return true;
    }

    /**
     * Restore state
     */
    restoreState(historyState) {
        // Deep clone the state to avoid reference issues
        const restoredState = JSON.parse(JSON.stringify(historyState.state));

        // Update state without triggering listeners
        Object.keys(restoredState).forEach(key => {
            this.state.state[key] = restoredState[key];
        });

        // Emit restoration event
        this.state.emit('stateRestored', restoredState);

        console.log('State restored from history');
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Get undo stack size
     */
    getUndoCount() {
        return this.undoStack.length;
    }

    /**
     * Get redo stack size
     */
    getRedoCount() {
        return this.redoStack.length;
    }

    /**
     * Get history stats
     */
    getStats() {
        return {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length,
            maxStates: this.maxStates,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }

    /**
     * Clear history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.persistHistory();
        this.emit('historyCleared');
        console.log('History cleared');
    }

    /**
     * Persist history to localStorage
     */
    persistHistory() {
        try {
            const historyData = {
                undoStack: this.undoStack,
                redoStack: this.redoStack,
                timestamp: Date.now()
            };

            localStorage.setItem('resumate_history', JSON.stringify(historyData));
        } catch (error) {
            console.error('Failed to persist history:', error);

            // If storage is full, clear old states
            if (error.name === 'QuotaExceededError') {
                this.clearOldStates();
                this.persistHistory(); // Try again
            }
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('resumate_history');
            if (saved) {
                const historyData = JSON.parse(saved);
                this.undoStack = historyData.undoStack || [];
                this.redoStack = historyData.redoStack || [];

                console.log('History loaded from localStorage. Undo:', this.undoStack.length, 'Redo:', this.redoStack.length);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.undoStack = [];
            this.redoStack = [];
        }
    }

    /**
     * Clear old states to free up space
     */
    clearOldStates() {
        // Keep only the most recent 25 states
        const keepCount = Math.floor(this.maxStates / 2);

        if (this.undoStack.length > keepCount) {
            this.undoStack = this.undoStack.slice(-keepCount);
        }

        this.redoStack = [];
        console.log('Old states cleared. Keeping', keepCount, 'most recent states');
    }

    /**
     * Subscribe to history events
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from history events
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
                    console.error(`Error in history listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Export history as JSON
     */
    exportHistory() {
        return JSON.stringify({
            undoStack: this.undoStack,
            redoStack: this.redoStack,
            maxStates: this.maxStates
        }, null, 2);
    }

    /**
     * Import history from JSON
     */
    importHistory(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.undoStack = imported.undoStack || [];
            this.redoStack = imported.redoStack || [];
            this.maxStates = imported.maxStates || 50;

            this.persistHistory();
            this.emit('historyImported');

            console.log('History imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import history:', error);
            return false;
        }
    }

    /**
     * Get timeline of changes
     */
    getTimeline() {
        return this.undoStack.map((state, index) => ({
            index,
            timestamp: state.timestamp,
            date: new Date(state.timestamp).toLocaleString(),
            sectionsCount: state.state.sections ? state.state.sections.length : 0
        }));
    }

    /**
     * Jump to specific state in timeline
     */
    jumpToState(index) {
        if (index < 0 || index >= this.undoStack.length) {
            console.error('Invalid state index:', index);
            return false;
        }

        // Calculate how many undos/redos needed
        const currentIndex = this.undoStack.length - 1;
        const diff = currentIndex - index;

        if (diff > 0) {
            // Undo multiple times
            for (let i = 0; i < diff; i++) {
                this.undo();
            }
        } else if (diff < 0) {
            // Redo multiple times
            for (let i = 0; i < Math.abs(diff); i++) {
                this.redo();
            }
        }

        return true;
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        clearTimeout(this.saveDebounceTimer);
        this.listeners = {};
        console.log('History manager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}
