/**
 * WorkflowIntegration - Backend API integration for workflow.html
 * Connects all 5 workflow steps to existing backend endpoints
 * Version: 1.0.0
 */

class WorkflowIntegration {
    constructor(workflowUI) {
        this.workflowUI = workflowUI;
        this.dataBridge = window.dataBridge || null;
        this.apiKey = null;
        this.serverHasKey = false;

        // State management
        this.state = {
            resumeText: null,
            resumeParsed: null,
            jobDescription: null,
            jobParsed: null,
            analysisResults: null,
            tailoringSuggestions: null,
            atsScore: null,
            documents: {}
        };

        console.log('[WorkflowIntegration] Initialized');
    }

    /**
     * Initialize integration - check API key status
     */
    async initialize() {
        console.log('[WorkflowIntegration] Initializing...');

        // Check if server has API key configured
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            this.serverHasKey = config.hasServerApiKey;
            console.log('[WorkflowIntegration] Server has API key:', this.serverHasKey);
        } catch (error) {
            console.error('[WorkflowIntegration] Failed to check server API key:', error);
        }

        // Load API key from DataBridge or localStorage
        if (this.dataBridge) {
            this.apiKey = this.dataBridge.getField('preferences.apiKey', '');
        } else {
            this.apiKey = localStorage.getItem('claude_api_key') || '';
        }

        console.log('[WorkflowIntegration] Client API key loaded:', !!this.apiKey);
    }

    /**
     * Get effective API key (client or server)
     */
    getApiKey() {
        if (this.apiKey && this.apiKey.trim()) {
            return this.apiKey.trim();
        }
        if (this.serverHasKey) {
            return ''; // Empty string signals server to use its key
        }
        return null;
    }

    /**
     * STEP 1: Handle resume file upload
     * Connects to /api/parse endpoint
     */
    async handleResumeUpload(file) {
        console.log('[WorkflowIntegration] Uploading resume file:', file.name);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('resume', file);

            const apiKey = this.getApiKey();
            if (apiKey !== null) {
                formData.append('apiKey', apiKey);
            }
            formData.append('useAI', 'true');

            // Show loading state
            this.showStepLoading(1, 'Parsing resume...');

            // Call parse API
            const response = await fetch('/api/parse', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to parse resume');
            }

            const result = await response.json();
            console.log('[WorkflowIntegration] Resume parsed:', result);

            if (result.success) {
                // Store parsed resume
                this.state.resumeText = result.text;
                this.state.resumeParsed = result;

                // Update resume text area so user can see the parsed content
                const resumeTextArea = document.getElementById('resume-text');
                if (resumeTextArea) {
                    resumeTextArea.value = result.text;
                }

                // Save to DataBridge
                if (this.dataBridge) {
                    this.dataBridge.saveResume(result.text, result);
                }

                // Update UI
                this.hideStepLoading(1);
                this.showResumePreview(result.text);
                this.workflowUI.enableContinueButton(1);

                return result;
            } else {
                throw new Error(result.error || 'Failed to parse resume');
            }

        } catch (error) {
            console.error('[WorkflowIntegration] Resume upload error:', error);
            this.hideStepLoading(1);
            this.showStepError(1, error.message);
            throw error;
        }
    }

    /**
     * STEP 1: Handle resume text paste
     */
    handleResumeTextPaste(text) {
        console.log('[WorkflowIntegration] Resume text pasted:', text.length, 'characters');

        if (text && text.trim().length > 50) {
            this.state.resumeText = text.trim();

            // Save to DataBridge
            if (this.dataBridge) {
                this.dataBridge.saveResume(text.trim());
            }

            this.showResumePreview(text.trim());
            this.workflowUI.enableContinueButton(1);
            return true;
        }

        this.workflowUI.disableContinueButton(1);
        return false;
    }

    /**
     * STEP 2: Analyze resume against job description
     * Connects to /api/analyze endpoint
     */
    async analyzeResume() {
        console.log('[WorkflowIntegration] Starting analysis...');

        try {
            const resumeText = this.state.resumeText;
            const jobText = this.state.jobDescription || 'General resume analysis';

            if (!resumeText) {
                throw new Error('No resume text available');
            }

            // Show loading state
            this.showStepLoading(2, 'Analyzing with Claude AI...');
            this.workflowUI.showLoading('analyze-loading');
            this.workflowUI.hideElement('analyze-results');

            const apiKey = this.getApiKey();
            if (apiKey === null && !this.serverHasKey) {
                throw new Error('No API key available. Please configure an API key.');
            }

            // Call analyze API
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resumeText: resumeText,
                    jobText: jobText,
                    apiKey: apiKey || undefined
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Analysis failed');
            }

            const result = await response.json();
            console.log('[WorkflowIntegration] Analysis complete:', result);

            // Parse the analysis response
            const parsed = this.parseAnalysisResponse(result.analysis);
            this.state.analysisResults = parsed;

            // Save to DataBridge
            if (this.dataBridge) {
                this.dataBridge.saveAnalysis({
                    score: parsed.overallScore,
                    matchData: parsed,
                    timestamp: new Date().toISOString()
                });
            }

            // Update UI
            this.hideStepLoading(2);
            this.workflowUI.hideLoading('analyze-loading');
            this.displayAnalysisResults(parsed);
            this.workflowUI.enableContinueButton(2);

            return parsed;

        } catch (error) {
            console.error('[WorkflowIntegration] Analysis error:', error);
            this.hideStepLoading(2);
            this.workflowUI.hideLoading('analyze-loading');
            this.showStepError(2, error.message);
            throw error;
        }
    }

    /**
     * STEP 3: Fetch job from URL
     * Connects to /api/fetch-job endpoint
     */
    async fetchJobFromURL(url) {
        console.log('[WorkflowIntegration] Fetching job from URL:', url);

        const statusEl = document.getElementById('job-url-status');
        const importBtn = document.getElementById('import-job-btn');

        try {
            // Show loading status in Step 1
            if (statusEl) {
                statusEl.textContent = '⏳ Fetching job description...';
                statusEl.style.color = 'var(--color-primary)';
            }
            if (importBtn) {
                importBtn.disabled = true;
                importBtn.textContent = 'Importing...';
            }

            const response = await fetch('/api/fetch-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch job');
            }

            const result = await response.json();
            console.log('[WorkflowIntegration] Job fetched:', result);

            if (result.success && result.content) {
                this.state.jobDescription = result.content;

                // Update job text area
                const jobTextArea = document.getElementById('job-text');
                if (jobTextArea) {
                    jobTextArea.value = result.content;
                }

                // Save to DataBridge
                if (this.dataBridge) {
                    this.dataBridge.saveJob(result.content, {
                        url: url,
                        site: result.site
                    });
                }

                // Show success status
                if (statusEl) {
                    statusEl.textContent = '✓ Job description imported successfully!';
                    statusEl.style.color = 'var(--color-success)';
                }

                return result.content;
            } else {
                throw new Error(result.error || 'Failed to fetch job');
            }

        } catch (error) {
            console.error('[WorkflowIntegration] Job fetch error:', error);

            // Show error status
            if (statusEl) {
                statusEl.textContent = '✗ ' + (error.message || 'Failed to fetch job description');
                statusEl.style.color = 'var(--color-danger)';
            }

            throw error;
        } finally {
            // Re-enable import button
            if (importBtn) {
                importBtn.disabled = false;
                importBtn.textContent = 'Import';
            }
        }
    }

    /**
     * STEP 3: Handle job text paste
     */
    handleJobTextPaste(text) {
        console.log('[WorkflowIntegration] Job text pasted:', text.length, 'characters');

        if (text && text.trim().length > 50) {
            this.state.jobDescription = text.trim();

            // Save to DataBridge
            if (this.dataBridge) {
                this.dataBridge.saveJob(text.trim());
            }

            this.workflowUI.enableContinueButton(3);
            return true;
        }

        this.workflowUI.disableContinueButton(3);
        return false;
    }

    /**
     * STEP 3: Tailor resume to job
     * Connects to /api/tailor endpoint
     */
    async tailorResume() {
        console.log('[WorkflowIntegration] Starting tailoring...');

        try {
            const resumeText = this.state.resumeText;
            const jobDescription = this.state.jobDescription;

            if (!resumeText || !jobDescription) {
                throw new Error('Resume and job description required');
            }

            this.showStepLoading(3, 'Tailoring resume...');

            const apiKey = this.getApiKey();

            // Call tailor API
            const response = await fetch('/api/tailor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resumeData: { text: resumeText },
                    jobDescription: jobDescription,
                    apiKey: apiKey || undefined
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Tailoring failed');
            }

            const result = await response.json();
            console.log('[WorkflowIntegration] Tailoring complete:', result);

            this.state.jobParsed = result.jobData;
            this.state.tailoringSuggestions = result.suggestions || [];

            // Save to DataBridge
            if (this.dataBridge) {
                this.dataBridge.updateField('job.parsed', result.jobData);
                this.dataBridge.updateField('analysis.tailoringSuggestions', result.suggestions || []);
            }

            this.hideStepLoading(3);
            return result;

        } catch (error) {
            console.error('[WorkflowIntegration] Tailoring error:', error);
            this.hideStepLoading(3);
            this.showStepError(3, error.message);
            throw error;
        }
    }

    /**
     * STEP 5: Export document
     * Connects to document generation
     */
    async exportDocument(format) {
        console.log('[WorkflowIntegration] Exporting as:', format);

        try {
            const resumeText = this.state.resumeText;
            if (!resumeText) {
                throw new Error('No resume content to export');
            }

            this.showStepLoading(5, `Generating ${format.toUpperCase()}...`);

            // Use existing export functionality
            if (window.exportManager) {
                let result;
                switch (format) {
                    case 'pdf':
                        result = await window.exportManager.exportPDF();
                        break;
                    case 'docx':
                        result = await window.exportManager.exportDOCX();
                        break;
                    case 'txt':
                        result = await window.exportManager.exportTXT();
                        break;
                    default:
                        throw new Error(`Unsupported format: ${format}`);
                }

                this.hideStepLoading(5);
                this.showExportSuccess(format);
                return result;
            } else {
                throw new Error('Export manager not initialized');
            }

        } catch (error) {
            console.error('[WorkflowIntegration] Export error:', error);
            this.hideStepLoading(5);
            this.showStepError(5, error.message);
            throw error;
        }
    }

    /**
     * Parse Claude analysis response into structured format
     */
    parseAnalysisResponse(analysisText) {
        console.log('[WorkflowIntegration] Parsing analysis response...');

        const sections = {
            overallScore: 0,
            keyStrengths: [],
            gapsAndConcerns: [],
            recommendations: [],
            atsCompatibility: 0,
            atsDetails: [],
            missingKeywords: [],
            formattingSuggestions: []
        };

        // Extract overall score
        const scoreMatch = analysisText.match(/(?:Score|Overall Match Score):\s*(\d+)/i);
        if (scoreMatch) {
            sections.overallScore = parseInt(scoreMatch[1]);
        }

        // Extract ATS score
        const atsMatch = analysisText.match(/ATS\s+(?:Compatibility|Score):\s*(?:Score:\s*)?(\d+)/i);
        if (atsMatch) {
            sections.atsCompatibility = parseInt(atsMatch[1]);
        }

        // Extract sections using regex
        const extractBullets = (sectionName) => {
            const regex = new RegExp(`${sectionName}[:\\s]+([\\s\\S]*?)(?=\\d+\\.|$)`, 'i');
            const match = analysisText.match(regex);
            if (match) {
                return match[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                    .map(line => line.replace(/^[-•]\s*/, '').trim())
                    .filter(line => line.length > 0);
            }
            return [];
        };

        sections.keyStrengths = extractBullets('KEY STRENGTHS');
        sections.gapsAndConcerns = extractBullets('GAPS AND CONCERNS');
        sections.recommendations = extractBullets('RECOMMENDATIONS');
        sections.atsDetails = extractBullets('ATS COMPATIBILITY');
        sections.missingKeywords = extractBullets('(?:Missing Keywords|KEYWORD ANALYSIS)');
        sections.formattingSuggestions = extractBullets('FORMATTING SUGGESTIONS');

        console.log('[WorkflowIntegration] Parsed analysis:', sections);
        return sections;
    }

    /**
     * Display analysis results in UI
     */
    displayAnalysisResults(results) {
        const container = document.getElementById('analyze-results');
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <h3>Match Score: <span class="score-badge ${this.getScoreClass(results.overallScore)}">${results.overallScore}/100</span></h3>
                <p>Your resume match score for this position.</p>
            </div>

            ${results.keyStrengths.length > 0 ? `
            <div class="card">
                <h3>Key Strengths</h3>
                <ul>
                    ${results.keyStrengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${results.gapsAndConcerns.length > 0 ? `
            <div class="card">
                <h3>Areas for Improvement</h3>
                <ul>
                    ${results.gapsAndConcerns.map(g => `<li>${g}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${results.recommendations.length > 0 ? `
            <div class="card">
                <h3>Recommendations</h3>
                <ul>
                    ${results.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="card">
                <h3>ATS Compatibility: <span class="score-badge ${this.getScoreClass(results.atsCompatibility)}">${results.atsCompatibility}/100</span></h3>
                ${results.atsDetails.length > 0 ? `
                <ul>
                    ${results.atsDetails.map(d => `<li>${d}</li>`).join('')}
                </ul>
                ` : ''}
            </div>

            ${results.missingKeywords.length > 0 ? `
            <div class="card">
                <h3>Missing Keywords</h3>
                <ul>
                    ${results.missingKeywords.map(k => `<li>${k}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        `;

        this.workflowUI.showElement('analyze-results');
    }

    /**
     * Get score badge class
     */
    getScoreClass(score) {
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    }

    /**
     * Show resume preview
     */
    showResumePreview(text) {
        // Could add a preview area in step 1
        console.log('[WorkflowIntegration] Resume preview:', text.substring(0, 100) + '...');
    }

    /**
     * Show step loading state
     */
    showStepLoading(stepNumber, message) {
        const loadingId = `step-${stepNumber}-loading`;
        let loadingEl = document.getElementById(loadingId);

        if (!loadingEl) {
            // Create loading element if it doesn't exist
            const stepEl = document.getElementById(this.workflowUI.steps[stepNumber - 1].id);
            if (stepEl) {
                const contentEl = stepEl.querySelector('.step-content');
                if (contentEl) {
                    loadingEl = document.createElement('div');
                    loadingEl.id = loadingId;
                    loadingEl.className = 'loading-state';
                    loadingEl.innerHTML = `
                        <div class="spinner"></div>
                        <p>${message}</p>
                    `;
                    contentEl.insertBefore(loadingEl, contentEl.firstChild);
                }
            }
        } else {
            loadingEl.querySelector('p').textContent = message;
            loadingEl.style.display = 'block';
        }
    }

    /**
     * Hide step loading state
     */
    hideStepLoading(stepNumber) {
        const loadingId = `step-${stepNumber}-loading`;
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    /**
     * Show step error
     */
    showStepError(stepNumber, message) {
        const errorId = `step-${stepNumber}-error`;
        let errorEl = document.getElementById(errorId);

        if (!errorEl) {
            const stepEl = document.getElementById(this.workflowUI.steps[stepNumber - 1].id);
            if (stepEl) {
                const contentEl = stepEl.querySelector('.step-content');
                if (contentEl) {
                    errorEl = document.createElement('div');
                    errorEl.id = errorId;
                    errorEl.className = 'error-message';
                    errorEl.style.cssText = 'padding: 1rem; background: #fee; color: #c00; border-radius: 8px; margin: 1rem 0;';
                    contentEl.insertBefore(errorEl, contentEl.firstChild);
                }
            }
        }

        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * Show export success
     */
    showExportSuccess(format) {
        const successEl = document.getElementById('export-success');
        if (successEl) {
            successEl.querySelector('h2').textContent = `${format.toUpperCase()} Downloaded!`;
            successEl.querySelector('p').textContent = `Your ${format.toUpperCase()} resume has been downloaded successfully.`;
            successEl.style.display = 'block';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowIntegration;
}
