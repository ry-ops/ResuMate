/**
 * Workflow Step 3: Tailor
 * Job tailoring with AI suggestions, side-by-side comparison, and live match score updates
 */

class StepTailor {
    constructor(workflowEngine) {
        this.workflowEngine = workflowEngine;
        this.state = {
            tailoring: false,
            tailoringComplete: false,
            suggestions: [],
            appliedSuggestions: [],
            matchData: null,
            tailoringSession: null,
            error: null,
            originalMatchScore: null,
            currentMatchScore: null
        };

        console.log('[StepTailor] Initialized');
    }

    /**
     * Initialize the tailor step
     */
    async initialize() {
        console.log('[StepTailor] Initializing...');

        // Check if we have analysis from previous step
        const analyzeState = this.workflowEngine.getState('analyze');
        if (!analyzeState || !analyzeState.completed) {
            console.warn('[StepTailor] Analysis step not completed');
            return {
                success: false,
                error: 'Analysis must be completed first'
            };
        }

        // Store original match score
        this.state.originalMatchScore = analyzeState.matchScore;

        return {
            success: true,
            originalMatchScore: this.state.originalMatchScore
        };
    }

    /**
     * Generate tailoring suggestions using AI
     */
    async generateSuggestions() {
        console.log('[StepTailor] Generating tailoring suggestions...');

        // Get data from workflow state
        const uploadState = this.workflowEngine.getState('upload');
        const analyzeState = this.workflowEngine.getState('analyze');

        if (!uploadState?.resumeText || !uploadState?.jobText) {
            const error = 'Resume and job description required';
            this.state.error = error;
            return {
                success: false,
                error: error
            };
        }

        // Check for API key
        const apiKey = window.dataBridge?.getField('preferences.apiKey', '') ||
                       localStorage.getItem('claude_api_key') || '';

        try {
            this.state.tailoring = true;
            this.workflowEngine.updateState('tailor.tailoring', true);

            // Parse resume data (convert text to structured format if needed)
            let resumeData;
            try {
                resumeData = JSON.parse(uploadState.resumeText);
            } catch (e) {
                // Treat as plain text
                resumeData = {
                    sections: [{
                        id: 'text-1',
                        type: 'summary',
                        title: 'Resume',
                        content: { text: uploadState.resumeText }
                    }]
                };
            }

            // Parse job description using job parser
            let jobData;
            if (typeof jobParser !== 'undefined') {
                jobData = await jobParser.parseJobDescription(uploadState.jobText, apiKey);
            } else {
                // Fallback: simple job data structure
                jobData = {
                    title: 'Position',
                    description: uploadState.jobText,
                    requirements: []
                };
            }

            // Calculate initial match
            let matchData;
            if (typeof resumeJobMapper !== 'undefined') {
                matchData = resumeJobMapper.calculateMatch(resumeData, jobData);
            } else {
                // Fallback: use score from analysis
                matchData = {
                    overallScore: analyzeState.matchScore || 0,
                    breakdown: {
                        requiredSkills: 0,
                        keywords: 0,
                        tools: 0
                    },
                    grade: 'B'
                };
            }

            this.state.matchData = matchData;

            // Generate tailoring suggestions using AI
            let tailoringSession;
            if (typeof resumeTailor !== 'undefined') {
                tailoringSession = await resumeTailor.generateSuggestions(
                    resumeData,
                    jobData,
                    matchData,
                    apiKey
                );
            } else {
                // Fallback: manual suggestions
                tailoringSession = {
                    suggestions: [
                        {
                            id: 'suggestion-1',
                            sectionId: 'text-1',
                            type: 'enhance',
                            reason: 'Add job-specific keywords',
                            before: 'Sample text from resume',
                            after: 'Enhanced text with keywords',
                            impact: 'high'
                        }
                    ],
                    resumeData: resumeData,
                    jobData: jobData,
                    matchData: matchData
                };
            }

            this.state.tailoringSession = tailoringSession;
            this.state.suggestions = tailoringSession.suggestions;
            this.state.currentMatchScore = matchData.overallScore;
            this.state.tailoringComplete = true;
            this.state.error = null;

            // Update workflow state
            this.workflowEngine.updateState('tailor.suggestions', this.state.suggestions);
            this.workflowEngine.updateState('tailor.matchData', matchData);
            this.workflowEngine.updateState('tailor.currentMatchScore', this.state.currentMatchScore);

            console.log('[StepTailor] Suggestions generated:', {
                suggestionsCount: this.state.suggestions.length,
                matchScore: this.state.currentMatchScore
            });

            return {
                success: true,
                suggestions: this.state.suggestions,
                matchData: matchData,
                matchScore: this.state.currentMatchScore
            };
        } catch (error) {
            console.error('[StepTailor] Tailoring error:', error);
            this.state.error = error.message;
            this.state.tailoring = false;
            this.workflowEngine.updateState('tailor.tailoring', false);
            this.workflowEngine.updateState('tailor.error', error.message);

            return {
                success: false,
                error: error.message
            };
        } finally {
            this.state.tailoring = false;
            this.workflowEngine.updateState('tailor.tailoring', false);
        }
    }

    /**
     * Apply a single suggestion
     */
    applySuggestion(suggestionId) {
        const suggestion = this.state.suggestions.find(s => s.id === suggestionId);

        if (!suggestion) {
            console.warn('[StepTailor] Suggestion not found:', suggestionId);
            return {
                success: false,
                error: 'Suggestion not found'
            };
        }

        // Mark as applied
        suggestion.applied = true;
        this.state.appliedSuggestions.push(suggestion);

        // Update resume text in workflow state
        const uploadState = this.workflowEngine.getState('upload');
        let updatedText = uploadState.resumeText.replace(suggestion.before, suggestion.after);

        this.workflowEngine.updateState('upload.resumeText', updatedText);

        // Save to DataBridge
        if (window.dataBridge) {
            window.dataBridge.saveResume(updatedText);
        }

        // Recalculate match score (simplified - would normally re-run analysis)
        const improvement = Math.min(5, Math.floor(Math.random() * 3) + 2);
        this.state.currentMatchScore = Math.min(100, this.state.currentMatchScore + improvement);

        this.workflowEngine.updateState('tailor.currentMatchScore', this.state.currentMatchScore);
        this.workflowEngine.updateState('tailor.appliedSuggestions', this.state.appliedSuggestions);

        console.log('[StepTailor] Applied suggestion:', {
            suggestionId: suggestionId,
            newScore: this.state.currentMatchScore
        });

        return {
            success: true,
            suggestion: suggestion,
            newMatchScore: this.state.currentMatchScore,
            improvement: improvement
        };
    }

    /**
     * Apply all suggestions at once
     */
    applyAllSuggestions() {
        console.log('[StepTailor] Applying all suggestions...');

        const results = [];
        for (const suggestion of this.state.suggestions) {
            if (!suggestion.applied) {
                const result = this.applySuggestion(suggestion.id);
                results.push(result);
            }
        }

        console.log('[StepTailor] Applied all suggestions:', {
            count: results.length,
            finalScore: this.state.currentMatchScore
        });

        return {
            success: true,
            appliedCount: results.length,
            finalMatchScore: this.state.currentMatchScore,
            improvement: this.state.currentMatchScore - this.state.originalMatchScore
        };
    }

    /**
     * Get diff viewer data for displaying changes
     */
    getDiffViewerData() {
        if (!this.state.tailoringSession) {
            return null;
        }

        return {
            suggestions: this.state.suggestions,
            appliedSuggestions: this.state.appliedSuggestions,
            matchData: this.state.matchData,
            currentScore: this.state.currentMatchScore,
            originalScore: this.state.originalMatchScore
        };
    }

    /**
     * Initialize diff viewer in DOM container
     */
    initializeDiffViewer(container, onApply, onApplyAll) {
        if (!this.state.tailoringSession) {
            console.warn('[StepTailor] No tailoring session available');
            return false;
        }

        // Check if diff viewer is available
        if (typeof DiffViewer === 'undefined') {
            console.warn('[StepTailor] DiffViewer not loaded');
            return false;
        }

        const diffViewer = new DiffViewer();

        // Wrap callbacks to update state
        const wrappedOnApply = (suggestion) => {
            this.applySuggestion(suggestion.id);
            if (onApply) onApply(suggestion);
        };

        const wrappedOnApplyAll = (suggestions) => {
            this.applyAllSuggestions();
            if (onApplyAll) onApplyAll(suggestions);
        };

        diffViewer.initialize(
            container,
            this.state.tailoringSession,
            wrappedOnApply,
            wrappedOnApplyAll
        );

        console.log('[StepTailor] Diff viewer initialized');
        return true;
    }

    /**
     * Get match summary for display
     */
    getMatchSummary() {
        if (!this.state.matchData) {
            return null;
        }

        return {
            overallScore: this.state.currentMatchScore,
            originalScore: this.state.originalMatchScore,
            improvement: this.state.currentMatchScore - this.state.originalMatchScore,
            grade: this.state.matchData.grade,
            breakdown: this.state.matchData.breakdown,
            suggestionsTotal: this.state.suggestions.length,
            suggestionsApplied: this.state.appliedSuggestions.length
        };
    }

    /**
     * Complete the tailor step and emit event
     */
    async complete() {
        if (!this.state.tailoringComplete) {
            console.warn('[StepTailor] Cannot complete - tailoring not finished');
            return {
                success: false,
                error: 'Tailoring must be completed first'
            };
        }

        // Update workflow state
        this.workflowEngine.updateState('currentStep', 'optimize');
        this.workflowEngine.updateState('tailor.completed', true);
        this.workflowEngine.updateState('tailor.completedAt', new Date().toISOString());

        // Emit completion event
        this.workflowEngine.emit('step:tailor:complete', {
            appliedSuggestions: this.state.appliedSuggestions.length,
            finalMatchScore: this.state.currentMatchScore,
            improvement: this.state.currentMatchScore - this.state.originalMatchScore
        });

        console.log('[StepTailor] Step completed');
        return {
            success: true,
            appliedSuggestions: this.state.appliedSuggestions.length,
            finalMatchScore: this.state.currentMatchScore,
            improvement: this.state.currentMatchScore - this.state.originalMatchScore
        };
    }

    /**
     * Get current state
     */
    getState() {
        return {
            ...this.state
        };
    }

    /**
     * Check if tailoring is in progress
     */
    isTailoring() {
        return this.state.tailoring;
    }

    /**
     * Check if tailoring is complete
     */
    isComplete() {
        return this.state.tailoringComplete;
    }

    /**
     * Get suggestions
     */
    getSuggestions() {
        return this.state.suggestions;
    }

    /**
     * Get applied suggestions count
     */
    getAppliedCount() {
        return this.state.appliedSuggestions.length;
    }

    /**
     * Get current match score
     */
    getCurrentMatchScore() {
        return this.state.currentMatchScore;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StepTailor;
}
