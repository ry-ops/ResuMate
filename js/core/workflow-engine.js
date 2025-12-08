/**
 * WorkflowEngine - State machine for ATSFlow's 5-step workflow
 *
 * Orchestrates the single-page workflow navigation:
 * 1. Upload (resume + job posting)
 * 2. Analyze (AI analysis of match)
 * 3. Tailor (apply suggestions to resume)
 * 4. Optimize (ATS scanning + styling)
 * 5. Export (all 5 documents)
 *
 * Features:
 * - Step validation and progression logic
 * - URL hash routing (#step-1, #analyze, etc.)
 * - Resume/restart capability
 * - Event system for step changes
 * - Forward/backward navigation
 * - Page refresh without losing state
 *
 * @class WorkflowEngine
 * @version 1.0.0
 */

class WorkflowEngine {
    constructor(workflowState) {
        if (!workflowState) {
            throw new Error('[WorkflowEngine] WorkflowState instance required');
        }

        /**
         * WorkflowState instance
         * @private
         */
        this.state = workflowState;

        /**
         * Step definitions
         * @private
         */
        this.steps = [
            {
                id: 1,
                name: 'upload',
                title: 'Upload Documents',
                description: 'Upload your resume and job description',
                icon: '📤',
                hash: 'step-1',
                aliases: ['upload', 'start'],
                validation: this.validateUploadStep.bind(this),
                canSkip: false
            },
            {
                id: 2,
                name: 'analyze',
                title: 'AI Analysis',
                description: 'Analyze resume-job match with AI',
                icon: '🔍',
                hash: 'step-2',
                aliases: ['analyze', 'analysis'],
                validation: this.validateAnalyzeStep.bind(this),
                canSkip: false
            },
            {
                id: 3,
                name: 'tailor',
                title: 'Tailor Resume',
                description: 'Apply AI suggestions to optimize resume',
                icon: '🎯',
                hash: 'step-3',
                aliases: ['tailor', 'customize'],
                validation: this.validateTailorStep.bind(this),
                canSkip: false
            },
            {
                id: 4,
                name: 'optimize',
                title: 'ATS Optimization',
                description: 'Optimize for ATS scanning and styling',
                icon: '⚡',
                hash: 'step-4',
                aliases: ['optimize', 'ats'],
                validation: this.validateOptimizeStep.bind(this),
                canSkip: false
            },
            {
                id: 5,
                name: 'export',
                title: 'Export Documents',
                description: 'Download all application documents',
                icon: '📥',
                hash: 'step-5',
                aliases: ['export', 'download'],
                validation: this.validateExportStep.bind(this),
                canSkip: false
            }
        ];

        /**
         * Event listeners
         * @private
         */
        this.listeners = new Map();

        /**
         * Initialization flag
         * @private
         */
        this.initialized = false;

        console.log('[WorkflowEngine] Created with', this.steps.length, 'steps');
    }

    /**
     * Initialize the workflow engine
     * Sets up hash routing, restores state, and navigates to current step
     * @returns {boolean} Success status
     */
    init() {
        if (this.initialized) {
            console.warn('[WorkflowEngine] Already initialized');
            return false;
        }

        try {
            // Set up hash routing
            this.setupHashRouting();

            // Restore state from URL hash or saved state
            const currentStep = this.state.get('currentStep', 1);
            const hash = window.location.hash.slice(1); // Remove #

            if (hash) {
                // Navigate to hash step if valid
                const step = this.resolveStepFromHash(hash);
                if (step) {
                    this.goToStep(step.id, { skipValidation: true });
                } else {
                    this.goToStep(currentStep);
                }
            } else {
                // Navigate to saved step
                this.goToStep(currentStep);
            }

            this.initialized = true;
            this.emit('initialized', { currentStep: this.getCurrentStep() });

            console.log('[WorkflowEngine] Initialized on step', this.getCurrentStep().id);
            return true;
        } catch (error) {
            console.error('[WorkflowEngine] Initialization failed:', error);
            return false;
        }
    }

    /**
     * Set up hash routing for navigation
     * @private
     */
    setupHashRouting() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (!hash) return;

            const step = this.resolveStepFromHash(hash);
            if (step) {
                this.goToStep(step.id, { fromHashChange: true });
            }
        });

        console.log('[WorkflowEngine] Hash routing enabled');
    }

    /**
     * Resolve step from URL hash
     * @private
     * @param {string} hash - URL hash (without #)
     * @returns {Object|null} Step definition
     */
    resolveStepFromHash(hash) {
        return this.steps.find(step =>
            step.hash === hash || step.aliases.includes(hash)
        ) || null;
    }

    /**
     * Get current step
     * @returns {Object} Current step definition
     */
    getCurrentStep() {
        const stepId = this.state.get('currentStep', 1);
        return this.steps.find(s => s.id === stepId) || this.steps[0];
    }

    /**
     * Get step by ID
     * @param {number} stepId - Step ID (1-5)
     * @returns {Object|null} Step definition
     */
    getStep(stepId) {
        return this.steps.find(s => s.id === stepId) || null;
    }

    /**
     * Get step by name or alias
     * @param {string} name - Step name or alias
     * @returns {Object|null} Step definition
     */
    getStepByName(name) {
        return this.steps.find(s =>
            s.name === name || s.aliases.includes(name)
        ) || null;
    }

    /**
     * Check if step is complete
     * @param {number} stepId - Step ID (1-5)
     * @returns {boolean} Completion status
     */
    isStepComplete(stepId) {
        return this.state.isStepComplete(stepId);
    }

    /**
     * Check if can navigate to step
     * @param {number} stepId - Step ID (1-5)
     * @returns {Object} Navigation result
     */
    canNavigateToStep(stepId) {
        const step = this.getStep(stepId);
        if (!step) {
            return { allowed: false, reason: 'Invalid step' };
        }

        const currentStep = this.getCurrentStep();

        // Can always go back to completed steps
        if (stepId < currentStep.id) {
            return { allowed: true, reason: 'Backward navigation' };
        }

        // Can always stay on current step
        if (stepId === currentStep.id) {
            return { allowed: true, reason: 'Current step' };
        }

        // Can only go forward one step at a time
        if (stepId > currentStep.id + 1) {
            return { allowed: false, reason: 'Cannot skip steps' };
        }

        // Must complete current step before advancing
        if (!this.isStepComplete(currentStep.id)) {
            return { allowed: false, reason: 'Current step not complete' };
        }

        return { allowed: true, reason: 'Forward navigation' };
    }

    /**
     * Navigate to specific step
     * @param {number} stepId - Step ID (1-5)
     * @param {Object} options - Navigation options
     * @returns {boolean} Success status
     */
    goToStep(stepId, options = {}) {
        const {
            skipValidation = false,
            fromHashChange = false,
            force = false
        } = options;

        const step = this.getStep(stepId);
        if (!step) {
            console.error('[WorkflowEngine] Invalid step:', stepId);
            return false;
        }

        // Check navigation permissions
        if (!force && !skipValidation) {
            const navCheck = this.canNavigateToStep(stepId);
            if (!navCheck.allowed) {
                console.warn('[WorkflowEngine] Navigation blocked:', navCheck.reason);
                this.emit('navigationBlocked', { stepId, reason: navCheck.reason });
                return false;
            }
        }

        // Get previous step
        const previousStep = this.getCurrentStep();

        // Update state
        this.state.set('currentStep', stepId);

        // Update URL hash (if not from hash change)
        if (!fromHashChange) {
            window.location.hash = step.hash;
        }

        // Emit events
        this.emit('stepChange', {
            from: previousStep,
            to: step,
            stepId
        });

        console.log('[WorkflowEngine] Navigated to step', stepId, '-', step.title);
        return true;
    }

    /**
     * Advance to next step
     * @param {Object} options - Options
     * @returns {boolean} Success status
     */
    advanceStep(options = {}) {
        const currentStep = this.getCurrentStep();

        // Validate current step first
        if (!options.skipValidation) {
            const validation = this.validateStep(currentStep.id);
            if (!validation.valid) {
                console.warn('[WorkflowEngine] Cannot advance: validation failed');
                this.emit('validationFailed', validation);
                return false;
            }
        }

        // Mark current step complete
        if (!this.isStepComplete(currentStep.id)) {
            this.state.completeStep(currentStep.id);
        }

        // Advance to next step
        const nextStepId = currentStep.id + 1;
        if (nextStepId > this.steps.length) {
            console.log('[WorkflowEngine] Already on final step');
            this.emit('workflowComplete', { completedAll: true });
            return false;
        }

        return this.goToStep(nextStepId, options);
    }

    /**
     * Go back to previous step
     * @returns {boolean} Success status
     */
    previousStep() {
        const currentStep = this.getCurrentStep();
        const previousStepId = currentStep.id - 1;

        if (previousStepId < 1) {
            console.log('[WorkflowEngine] Already on first step');
            return false;
        }

        return this.goToStep(previousStepId, { skipValidation: true });
    }

    /**
     * Validate specific step
     * @param {number} stepId - Step ID (1-5)
     * @returns {Object} Validation result
     */
    validateStep(stepId) {
        const step = this.getStep(stepId);
        if (!step) {
            return { valid: false, errors: ['Invalid step'], warnings: [] };
        }

        if (step.validation) {
            return step.validation();
        }

        return { valid: true, errors: [], warnings: [] };
    }

    /**
     * Validate upload step (Step 1)
     * @private
     * @returns {Object} Validation result
     */
    validateUploadStep() {
        const errors = [];
        const warnings = [];

        const resumeText = this.state.get('inputs.resume.text', '');
        const jobDescription = this.state.get('inputs.job.description', '');

        if (!resumeText || resumeText.trim().length === 0) {
            errors.push('Resume is required');
        } else if (resumeText.length < 100) {
            warnings.push('Resume seems very short');
        }

        if (!jobDescription || jobDescription.trim().length === 0) {
            errors.push('Job description is required');
        } else if (jobDescription.length < 50) {
            warnings.push('Job description seems very short');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate analyze step (Step 2)
     * @private
     * @returns {Object} Validation result
     */
    validateAnalyzeStep() {
        const errors = [];
        const warnings = [];

        const analysisScore = this.state.get('analysis.score');
        const suggestions = this.state.get('analysis.suggestions', []);

        if (!analysisScore) {
            errors.push('Analysis must be completed');
        }

        if (suggestions.length === 0) {
            warnings.push('No suggestions generated');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate tailor step (Step 3)
     * @private
     * @returns {Object} Validation result
     */
    validateTailorStep() {
        const errors = [];
        const warnings = [];

        const tailoringSuggestions = this.state.get('analysis.tailoringSuggestions', []);
        const appliedSuggestions = this.state.get('steps.3.data.appliedSuggestions', []);

        if (tailoringSuggestions.length === 0) {
            warnings.push('No tailoring suggestions available');
        }

        if (appliedSuggestions.length === 0) {
            warnings.push('No suggestions applied yet');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate optimize step (Step 4)
     * @private
     * @returns {Object} Validation result
     */
    validateOptimizeStep() {
        const errors = [];
        const warnings = [];

        const atsScore = this.state.get('ats.score');

        if (!atsScore) {
            errors.push('ATS optimization must be completed');
        } else if (atsScore < 60) {
            warnings.push('ATS score is below recommended threshold (60+)');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate export step (Step 5)
     * @private
     * @returns {Object} Validation result
     */
    validateExportStep() {
        const errors = [];
        const warnings = [];

        const documents = this.state.get('documents', {});
        const generatedCount = Object.values(documents).filter(d => d !== null).length;

        if (generatedCount === 0) {
            warnings.push('No documents generated yet');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Save current state
     * @returns {boolean} Success status
     */
    saveState() {
        return this.state.persist();
    }

    /**
     * Load saved state
     * @returns {boolean} Success status
     */
    loadState() {
        return this.state.hydrate();
    }

    /**
     * Reset workflow to initial state
     * @param {boolean} confirm - Require confirmation
     * @returns {boolean} Success status
     */
    reset(confirm = true) {
        if (confirm) {
            const confirmed = window.confirm(
                'Are you sure you want to reset the workflow? All progress will be lost.'
            );
            if (!confirmed) {
                return false;
            }
        }

        this.state.reset();
        this.goToStep(1, { force: true, skipValidation: true });
        this.emit('reset', { resetAt: new Date().toISOString() });

        console.log('[WorkflowEngine] Workflow reset');
        return true;
    }

    /**
     * Get workflow progress summary
     * @returns {Object} Progress summary
     */
    getProgress() {
        const completedSteps = this.steps.filter(s => this.isStepComplete(s.id));
        const currentStep = this.getCurrentStep();

        return {
            currentStep: currentStep.id,
            currentStepName: currentStep.name,
            totalSteps: this.steps.length,
            completedSteps: completedSteps.length,
            percentage: this.state.getProgress(),
            isComplete: completedSteps.length === this.steps.length,
            canAdvance: this.canNavigateToStep(currentStep.id + 1).allowed
        };
    }

    /**
     * Get all steps with status
     * @returns {Array} Steps with status
     */
    getAllSteps() {
        return this.steps.map(step => ({
            ...step,
            completed: this.isStepComplete(step.id),
            current: step.id === this.state.get('currentStep'),
            canNavigate: this.canNavigateToStep(step.id).allowed
        }));
    }

    /**
     * Subscribe to workflow events
     * @param {string} event - Event type
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
     * Unsubscribe from workflow events
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
     * Emit workflow event
     * @private
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[WorkflowEngine] Error in ${event} listener:`, error);
                }
            });
        }

        // Also emit to state for centralized event handling
        if (this.state && this.state.emit) {
            this.state.emit(`workflow:${event}`, data);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowEngine;
}

// Add to window for global access
if (typeof window !== 'undefined') {
    window.WorkflowEngine = WorkflowEngine;

    // Auto-initialize if workflowState is available
    if (window.workflowState) {
        window.workflowEngine = new WorkflowEngine(window.workflowState);
        console.log('[WorkflowEngine] Singleton created with workflowState');
    }
}
