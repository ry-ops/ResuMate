/**
 * WorkflowState - Unified state management for ATSFlow workflow
 *
 * Manages the complete application state for the 5-step workflow:
 * 1. Upload (resume + job posting)
 * 2. Analyze (AI analysis of match)
 * 3. Tailor (apply suggestions to resume)
 * 4. Optimize (ATS scanning + styling)
 * 5. Export (all 5 documents)
 *
 * Features:
 * - Immutable state updates
 * - Change listeners/observers
 * - State persistence (localStorage)
 * - State hydration/dehydration
 * - State validation
 *
 * @class WorkflowState
 * @version 1.0.0
 */

class WorkflowState {
    constructor() {
        /**
         * Storage key for workflow state (session data)
         * @private
         */
        this.SESSION_KEY = 'resumate_session_state';

        /**
         * Storage key for persistent data (API key only)
         * @private
         */
        this.PERSISTENT_KEY = 'resumate_persistent_data';

        /**
         * Current state version for migrations
         * @private
         */
        this.STATE_VERSION = 1;

        /**
         * Change listeners
         * @private
         */
        this.listeners = new Map();

        /**
         * Current state object
         * @private
         */
        this.state = this.getDefaultState();

        /**
         * Previous state for change detection
         * @private
         */
        this.previousState = null;

        // Load persisted state
        this.hydrate();

        console.log('[WorkflowState] Initialized - Version', this.STATE_VERSION);
    }

    /**
     * Get default empty state structure
     * @private
     * @returns {Object} Default state
     */
    getDefaultState() {
        return {
            // State metadata
            metadata: {
                version: this.STATE_VERSION,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                sessionId: this.generateSessionId()
            },

            // Current workflow step (1-5)
            currentStep: 1,

            // Step completion tracking
            steps: {
                1: { // Upload
                    completed: false,
                    timestamp: null,
                    data: {
                        resumeUploaded: false,
                        jobUploaded: false
                    }
                },
                2: { // Analyze
                    completed: false,
                    timestamp: null,
                    data: {
                        analysisComplete: false,
                        score: null
                    }
                },
                3: { // Tailor
                    completed: false,
                    timestamp: null,
                    data: {
                        tailoringSuggestions: [],
                        appliedSuggestions: []
                    }
                },
                4: { // Optimize
                    completed: false,
                    timestamp: null,
                    data: {
                        atsScore: null,
                        stylingComplete: false
                    }
                },
                5: { // Export
                    completed: false,
                    timestamp: null,
                    data: {
                        documentsGenerated: []
                    }
                }
            },

            // User inputs
            inputs: {
                resume: {
                    text: '',
                    fileName: null,
                    format: 'text',
                    uploadedAt: null
                },
                job: {
                    description: '',
                    title: '',
                    company: '',
                    url: '',
                    uploadedAt: null
                },
                preferences: {
                    apiKey: '',
                    theme: 'light',
                    autoSave: true
                }
            },

            // Analysis results
            analysis: {
                score: null,
                matchData: null,
                suggestions: [],
                tailoringSuggestions: [],
                keywords: [],
                gaps: [],
                strengths: [],
                timestamp: null
            },

            // ATS optimization
            ats: {
                score: null,
                issues: [],
                recommendations: [],
                keywords: [],
                formatting: {
                    valid: true,
                    issues: []
                },
                timestamp: null
            },

            // Generated documents
            documents: {
                resume: null,
                coverLetter: null,
                executiveBio: null,
                brandStatement: null,
                statusInquiry: null
            },

            // Validation errors
            validation: {
                errors: [],
                warnings: []
            },

            // UI state
            ui: {
                loading: false,
                activePanel: null,
                modals: {
                    export: false,
                    settings: false
                }
            }
        };
    }

    /**
     * Generate unique session ID
     * @private
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current complete state (immutable copy)
     * @returns {Object} Current state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Get specific state path value
     * @param {string} path - Dot notation path (e.g., 'inputs.resume.text')
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Value at path
     */
    get(path, defaultValue = null) {
        try {
            const parts = path.split('.');
            let value = this.state;

            for (const part of parts) {
                if (value === null || value === undefined) {
                    return defaultValue;
                }
                value = value[part];
            }

            return value !== undefined ? value : defaultValue;
        } catch (error) {
            console.error(`[WorkflowState] Error getting path ${path}:`, error);
            return defaultValue;
        }
    }

    /**
     * Set specific state path value (immutable update)
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     * @returns {boolean} Success status
     */
    set(path, value) {
        try {
            // Clone current state for immutable update
            const newState = JSON.parse(JSON.stringify(this.state));
            const parts = path.split('.');
            let current = newState;

            // Navigate to parent
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            // Set value
            current[parts[parts.length - 1]] = value;

            // Update metadata
            newState.metadata.lastModified = new Date().toISOString();

            // Update state and notify
            this.previousState = this.state;
            this.state = newState;

            this.persist();
            this.notifyListeners('change', { path, value, state: this.getState() });

            console.log(`[WorkflowState] Updated: ${path}`);
            return true;
        } catch (error) {
            console.error(`[WorkflowState] Error setting path ${path}:`, error);
            return false;
        }
    }

    /**
     * Update multiple state paths atomically
     * @param {Object} updates - Object with path: value pairs
     * @returns {boolean} Success status
     */
    update(updates) {
        try {
            const newState = JSON.parse(JSON.stringify(this.state));

            // Apply all updates
            for (const [path, value] of Object.entries(updates)) {
                const parts = path.split('.');
                let current = newState;

                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }

                current[parts[parts.length - 1]] = value;
            }

            // Update metadata
            newState.metadata.lastModified = new Date().toISOString();

            // Update state and notify
            this.previousState = this.state;
            this.state = newState;

            this.persist();
            this.notifyListeners('change', { updates, state: this.getState() });

            console.log(`[WorkflowState] Batch updated ${Object.keys(updates).length} paths`);
            return true;
        } catch (error) {
            console.error('[WorkflowState] Error in batch update:', error);
            return false;
        }
    }

    /**
     * Merge object at path (shallow merge)
     * @param {string} path - Dot notation path
     * @param {Object} data - Data to merge
     * @returns {boolean} Success status
     */
    merge(path, data) {
        const current = this.get(path, {});
        const merged = { ...current, ...data };
        return this.set(path, merged);
    }

    /**
     * Mark step as complete
     * @param {number} stepNumber - Step number (1-5)
     * @param {Object} data - Step data
     * @returns {boolean} Success status
     */
    completeStep(stepNumber, data = {}) {
        if (stepNumber < 1 || stepNumber > 5) {
            console.error('[WorkflowState] Invalid step number:', stepNumber);
            return false;
        }

        return this.update({
            [`steps.${stepNumber}.completed`]: true,
            [`steps.${stepNumber}.timestamp`]: new Date().toISOString(),
            [`steps.${stepNumber}.data`]: { ...this.get(`steps.${stepNumber}.data`, {}), ...data }
        });
    }

    /**
     * Mark step as incomplete
     * @param {number} stepNumber - Step number (1-5)
     * @returns {boolean} Success status
     */
    uncompleteStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > 5) {
            console.error('[WorkflowState] Invalid step number:', stepNumber);
            return false;
        }

        return this.update({
            [`steps.${stepNumber}.completed`]: false,
            [`steps.${stepNumber}.timestamp`]: null
        });
    }

    /**
     * Check if step is complete
     * @param {number} stepNumber - Step number (1-5)
     * @returns {boolean} Completion status
     */
    isStepComplete(stepNumber) {
        return this.get(`steps.${stepNumber}.completed`, false);
    }

    /**
     * Get completion progress (0-100)
     * @returns {number} Progress percentage
     */
    getProgress() {
        let completed = 0;
        for (let i = 1; i <= 5; i++) {
            if (this.isStepComplete(i)) {
                completed++;
            }
        }
        return Math.round((completed / 5) * 100);
    }

    /**
     * Validate current state
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];
        const warnings = [];

        // Step 1 validation: Upload
        if (this.state.currentStep >= 1) {
            if (!this.get('inputs.resume.text')) {
                errors.push({ step: 1, field: 'resume', message: 'Resume is required' });
            }
            if (!this.get('inputs.job.description')) {
                errors.push({ step: 1, field: 'job', message: 'Job description is required' });
            }
        }

        // Step 2 validation: Analyze
        if (this.state.currentStep >= 2 && this.isStepComplete(1)) {
            if (!this.get('analysis.score')) {
                warnings.push({ step: 2, message: 'Analysis not yet complete' });
            }
        }

        // Step 3 validation: Tailor
        if (this.state.currentStep >= 3 && this.isStepComplete(2)) {
            const suggestions = this.get('analysis.tailoringSuggestions', []);
            if (suggestions.length === 0) {
                warnings.push({ step: 3, message: 'No tailoring suggestions available' });
            }
        }

        // Step 4 validation: Optimize
        if (this.state.currentStep >= 4 && this.isStepComplete(3)) {
            if (!this.get('ats.score')) {
                warnings.push({ step: 4, message: 'ATS optimization not complete' });
            }
        }

        // Step 5 validation: Export
        if (this.state.currentStep === 5 && this.isStepComplete(4)) {
            const docs = this.get('documents', {});
            const generated = Object.values(docs).filter(d => d !== null).length;
            if (generated === 0) {
                warnings.push({ step: 5, message: 'No documents generated yet' });
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Persist state to sessionStorage and localStorage
     * Session data (resume, job, analysis) goes to sessionStorage
     * Persistent data (API key) goes to localStorage
     * @private
     * @returns {boolean} Success status
     */
    persist() {
        try {
            // Save session data (resume, job, analysis) to sessionStorage
            const sessionData = {
                metadata: this.state.metadata,
                currentStep: this.state.currentStep,
                steps: this.state.steps,
                inputs: {
                    resume: this.state.inputs.resume,
                    job: this.state.inputs.job
                },
                analysis: this.state.analysis,
                ats: this.state.ats,
                documents: this.state.documents,
                validation: this.state.validation,
                ui: this.state.ui
            };
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

            // Save persistent data (API key only) to localStorage
            const persistentData = {
                apiKey: this.state.inputs.preferences.apiKey,
                theme: this.state.inputs.preferences.theme,
                autoSave: this.state.inputs.preferences.autoSave
            };
            localStorage.setItem(this.PERSISTENT_KEY, JSON.stringify(persistentData));

            return true;
        } catch (error) {
            console.error('[WorkflowState] Failed to persist state:', error);
            return false;
        }
    }

    /**
     * Hydrate state from sessionStorage and localStorage
     * Session data comes from sessionStorage (cleared on browser restart)
     * Persistent data comes from localStorage (survives browser restart)
     * @private
     * @returns {boolean} Success status
     */
    hydrate() {
        try {
            // Load session data from sessionStorage
            const sessionSerialized = sessionStorage.getItem(this.SESSION_KEY);

            // Load persistent data from localStorage
            const persistentSerialized = localStorage.getItem(this.PERSISTENT_KEY);

            if (sessionSerialized) {
                const sessionData = JSON.parse(sessionSerialized);

                // Merge session data into state
                this.state = {
                    ...this.state,
                    ...sessionData
                };

                console.log('[WorkflowState] Hydrated session state from sessionStorage');
            } else {
                console.log('[WorkflowState] No session state found (fresh browser session)');
            }

            if (persistentSerialized) {
                const persistentData = JSON.parse(persistentSerialized);

                // Merge persistent data (API key) into state
                this.state.inputs.preferences = {
                    ...this.state.inputs.preferences,
                    ...persistentData
                };

                console.log('[WorkflowState] Hydrated persistent data from localStorage');
            }

            return true;
        } catch (error) {
            console.error('[WorkflowState] Failed to hydrate state:', error);
            return false;
        }
    }

    /**
     * Reset state to defaults
     * Clears session data but preserves API key in localStorage
     * @param {boolean} keepApiKey - Whether to keep API key (default: true)
     * @returns {boolean} Success status
     */
    reset(keepApiKey = true) {
        this.previousState = this.state;

        // Save API key if needed
        const apiKey = keepApiKey ? this.state.inputs.preferences.apiKey : '';

        // Reset to defaults
        this.state = this.getDefaultState();

        // Restore API key
        if (keepApiKey && apiKey) {
            this.state.inputs.preferences.apiKey = apiKey;
        }

        // Clear session storage
        sessionStorage.removeItem(this.SESSION_KEY);

        // Persist (will save API key to localStorage if kept)
        this.persist();

        this.notifyListeners('reset', { state: this.getState() });
        console.log('[WorkflowState] State reset to defaults (keepApiKey:', keepApiKey, ')');
        return true;
    }

    /**
     * Clear session data only (keeps API key)
     * This is called on browser restart
     * @returns {boolean} Success status
     */
    clearSession() {
        sessionStorage.removeItem(this.SESSION_KEY);
        console.log('[WorkflowState] Cleared session data');
        return true;
    }

    /**
     * Export state as JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state from JSON
     * @param {string} jsonString - JSON state
     * @returns {boolean} Success status
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.previousState = this.state;
            this.state = imported;
            this.persist();
            this.notifyListeners('import', { state: this.getState() });
            console.log('[WorkflowState] Imported state from JSON');
            return true;
        } catch (error) {
            console.error('[WorkflowState] Failed to import state:', error);
            return false;
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} event - Event type ('change', 'reset', 'import')
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from state changes
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Notify all listeners for an event
     * @private
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[WorkflowState] Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Get state summary for debugging
     * @returns {Object} State summary
     */
    getSummary() {
        return {
            currentStep: this.state.currentStep,
            progress: this.getProgress(),
            stepsCompleted: Object.keys(this.state.steps).filter(k =>
                this.state.steps[k].completed
            ).length,
            hasResume: !!this.get('inputs.resume.text'),
            hasJob: !!this.get('inputs.job.description'),
            hasAnalysis: !!this.get('analysis.score'),
            hasAtsScore: !!this.get('ats.score'),
            documentsCount: Object.values(this.get('documents', {})).filter(d => d !== null).length,
            validation: this.validate()
        };
    }
}

// Create singleton instance
const workflowState = new WorkflowState();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowState;
}

// Add to window for global access
if (typeof window !== 'undefined') {
    window.WorkflowState = WorkflowState;
    window.workflowState = workflowState;
}

console.log('[WorkflowState] Singleton created and ready');
console.log('[WorkflowState] Current summary:', workflowState.getSummary());
