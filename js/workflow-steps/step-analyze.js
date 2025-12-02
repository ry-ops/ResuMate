/**
 * Workflow Step 2: Analyze
 * Calls Claude API for resume analysis, parses 7-section response, calculates match score
 */

class StepAnalyze {
    constructor(workflowEngine) {
        this.workflowEngine = workflowEngine;
        this.state = {
            analyzing: false,
            analysisComplete: false,
            analysisText: '',
            sections: [],
            matchScore: null,
            error: null
        };

        // Section icons mapping
        this.sectionIcons = {
            'OVERALL MATCH SCORE': '📊',
            'KEY STRENGTHS': '💪',
            'GAPS AND CONCERNS': '⚠️',
            'RECOMMENDATIONS': '✨',
            'ATS COMPATIBILITY': '🤖',
            'KEYWORD ANALYSIS': '🔑',
            'FORMATTING SUGGESTIONS': '📐',
            'default': '📋'
        };

        console.log('[StepAnalyze] Initialized');
    }

    /**
     * Initialize the analyze step
     */
    async initialize() {
        console.log('[StepAnalyze] Initializing...');

        // Check if we have resume and job from previous step
        const uploadState = this.workflowEngine.getState('upload');

        if (!uploadState || !uploadState.resumeText || !uploadState.jobText) {
            console.warn('[StepAnalyze] Missing resume or job data from upload step');
            return {
                success: false,
                error: 'Resume and job description required from upload step'
            };
        }

        // Load existing analysis from DataBridge if available
        if (window.dataBridge) {
            const userData = window.dataBridge.getUserData();
            if (userData.analysis?.analysisText) {
                this.state.analysisText = userData.analysis.analysisText;
                this.state.sections = this.parseAnalysis(userData.analysis.analysisText);
                this.state.analysisComplete = true;
                this.state.matchScore = this.extractMatchScore(userData.analysis.analysisText);

                console.log('[StepAnalyze] Loaded existing analysis from DataBridge');
            }
        }

        return {
            success: true,
            hasExistingAnalysis: this.state.analysisComplete,
            sections: this.state.sections.length
        };
    }

    /**
     * Perform analysis using Claude API
     */
    async analyze() {
        console.log('[StepAnalyze] Starting analysis...');

        // Get resume and job from workflow state
        const uploadState = this.workflowEngine.getState('upload');

        if (!uploadState?.resumeText || !uploadState?.jobText) {
            const error = 'Resume and job description are required';
            this.state.error = error;
            return {
                success: false,
                error: error
            };
        }

        // Check for API key
        const apiKey = window.dataBridge?.getField('preferences.apiKey', '') ||
                       localStorage.getItem('claude_api_key') || '';

        // Check if server has API key
        let serverHasApiKey = false;
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            serverHasApiKey = config.hasServerApiKey;
        } catch (e) {
            console.warn('[StepAnalyze] Could not check server API key');
        }

        if (!apiKey && !serverHasApiKey) {
            const error = 'Claude API key is required. Please configure in settings.';
            this.state.error = error;
            return {
                success: false,
                error: error
            };
        }

        try {
            this.state.analyzing = true;
            this.workflowEngine.updateState('analyze.analyzing', true);

            // Call Claude API via backend proxy
            const analysisText = await this.callClaudeAPI(
                uploadState.resumeText,
                uploadState.jobText,
                apiKey
            );

            // Parse the analysis into sections
            this.state.analysisText = analysisText;
            this.state.sections = this.parseAnalysis(analysisText);
            this.state.matchScore = this.extractMatchScore(analysisText);
            this.state.analysisComplete = true;
            this.state.error = null;

            // Save to DataBridge
            if (window.dataBridge) {
                window.dataBridge.saveAnalysis({
                    analysisText: analysisText,
                    score: this.state.matchScore,
                    timestamp: new Date().toISOString()
                });
            }

            // Update workflow state
            this.workflowEngine.updateState('analyze.analysisText', analysisText);
            this.workflowEngine.updateState('analyze.sections', this.state.sections);
            this.workflowEngine.updateState('analyze.matchScore', this.state.matchScore);
            this.workflowEngine.updateState('analyze.completed', true);

            console.log('[StepAnalyze] Analysis completed successfully', {
                sections: this.state.sections.length,
                matchScore: this.state.matchScore
            });

            return {
                success: true,
                analysisText: analysisText,
                sections: this.state.sections,
                matchScore: this.state.matchScore
            };
        } catch (error) {
            console.error('[StepAnalyze] Analysis error:', error);
            this.state.error = error.message;
            this.state.analyzing = false;
            this.workflowEngine.updateState('analyze.analyzing', false);
            this.workflowEngine.updateState('analyze.error', error.message);

            return {
                success: false,
                error: error.message
            };
        } finally {
            this.state.analyzing = false;
            this.workflowEngine.updateState('analyze.analyzing', false);
        }
    }

    /**
     * Call Claude API via backend proxy
     */
    async callClaudeAPI(resumeText, jobText, apiKey) {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: resumeText,
                jobText: jobText,
                apiKey: apiKey || null  // Server uses fallback if null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();
        return data.analysis;
    }

    /**
     * Parse analysis text into structured sections
     */
    parseAnalysis(text) {
        const sections = [];
        const lines = text.split('\n');
        let currentSection = null;
        let currentContent = [];

        lines.forEach(line => {
            const trimmed = line.trim();

            // Check if this is a section header
            const isHeader = /^\d+\.\s+[A-Z\s]+:?/.test(trimmed) ||
                            /^[A-Z\s]+:$/.test(trimmed);

            if (isHeader) {
                // Save previous section
                if (currentSection) {
                    sections.push({
                        title: currentSection,
                        icon: this.sectionIcons[currentSection.toUpperCase()] || this.sectionIcons['default'],
                        content: this.formatContent(currentContent.join('\n'))
                    });
                }

                // Start new section
                currentSection = trimmed.replace(/^\d+\.\s+/, '').replace(/:$/, '').trim();
                currentContent = [];
            } else if (trimmed && currentSection) {
                currentContent.push(trimmed);
            }
        });

        // Add last section
        if (currentSection && currentContent.length > 0) {
            sections.push({
                title: currentSection,
                icon: this.sectionIcons[currentSection.toUpperCase()] || this.sectionIcons['default'],
                content: this.formatContent(currentContent.join('\n'))
            });
        }

        // If no sections were parsed, return the whole text as one section
        if (sections.length === 0) {
            sections.push({
                title: 'Analysis Results',
                icon: '📋',
                content: this.formatContent(text)
            });
        }

        return sections;
    }

    /**
     * Format content with better HTML structure
     */
    formatContent(content) {
        // Convert markdown-style lists to HTML
        content = content.replace(/^- (.+)$/gm, '<li>$1</li>');
        content = content.replace(/^\* (.+)$/gm, '<li>$1</li>');

        // Wrap lists
        content = content.replace(/(<li>.*<\/li>)/s, '<ul class="recommendation-list">$1</ul>');

        // Add score badges
        content = content.replace(/(\d+)\/100/g, '<span class="score-badge score-medium">$1/100</span>');
        content = content.replace(/Score:\s*(\d+)/gi, 'Score: <span class="score-badge score-medium">$1</span>');

        // Bold important terms
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Convert line breaks to paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        content = paragraphs.map(p => `<p>${p}</p>`).join('');

        return content;
    }

    /**
     * Extract match score from analysis text
     */
    extractMatchScore(text) {
        // Try to find score in format: "75/100", "Score: 75", etc.
        const scoreMatch = text.match(/(\d+)\/100|Score:\s*(\d+)/i);
        if (scoreMatch) {
            return parseInt(scoreMatch[1] || scoreMatch[2]);
        }

        // Look for percentage
        const percentMatch = text.match(/(\d+)%/);
        if (percentMatch) {
            return parseInt(percentMatch[1]);
        }

        return null;
    }

    /**
     * Get analysis results display HTML
     */
    getResultsHTML() {
        if (!this.state.analysisComplete || this.state.sections.length === 0) {
            return '<p>No analysis results available</p>';
        }

        let html = '';

        this.state.sections.forEach(section => {
            html += `
                <div class="analysis-section">
                    <h3>${section.icon} ${section.title}</h3>
                    <div class="analysis-content">
                        ${section.content}
                    </div>
                </div>
            `;
        });

        return html;
    }

    /**
     * Complete the analyze step and emit event
     */
    async complete() {
        if (!this.state.analysisComplete) {
            console.warn('[StepAnalyze] Cannot complete - analysis not finished');
            return {
                success: false,
                error: 'Analysis must be completed first'
            };
        }

        // Update workflow state
        this.workflowEngine.updateState('currentStep', 'tailor');
        this.workflowEngine.updateState('analyze.reviewedAt', new Date().toISOString());

        // Emit completion event
        this.workflowEngine.emit('step:analyze:complete', {
            sections: this.state.sections,
            matchScore: this.state.matchScore,
            analysisText: this.state.analysisText
        });

        console.log('[StepAnalyze] Step completed');
        return {
            success: true,
            sections: this.state.sections.length,
            matchScore: this.state.matchScore
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
     * Check if analysis is in progress
     */
    isAnalyzing() {
        return this.state.analyzing;
    }

    /**
     * Check if analysis is complete
     */
    isComplete() {
        return this.state.analysisComplete;
    }

    /**
     * Get sections
     */
    getSections() {
        return this.state.sections;
    }

    /**
     * Get match score
     */
    getMatchScore() {
        return this.state.matchScore;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StepAnalyze;
}
