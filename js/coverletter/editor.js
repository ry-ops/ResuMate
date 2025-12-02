// Cover Letter Editor UI Controller
// Manages the user interface for cover letter generation and editing

/**
 * Cover Letter Editor Class
 * Controls the UI for generating, editing, and previewing cover letters
 */
class CoverLetterEditor {
    constructor() {
        this.currentLetter = '';
        this.currentStructure = {};
        this.currentMode = 'from_scratch'; // from_scratch, rewrite, tailor, template
        this.isGenerating = false;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;

        // UI element references
        this.elements = {};

        // State
        this.state = {
            jobTitle: '',
            companyName: '',
            jobDescription: '',
            resumeSummary: '',
            tone: 'professional',
            length: 250,
            focus: 'experience',
            openingStyle: 'traditional',
            howFound: '',
            contactName: ''
        };
    }

    /**
     * Initialize the editor
     * @param {Object} elementIds - Map of element IDs
     */
    initialize(elementIds = {}) {
        // Store element references
        this.elements = {
            // Mode selection
            modeSelector: document.getElementById(elementIds.modeSelector || 'mode-selector'),

            // Input fields
            jobTitle: document.getElementById(elementIds.jobTitle || 'job-title'),
            companyName: document.getElementById(elementIds.companyName || 'company-name'),
            jobDescription: document.getElementById(elementIds.jobDescription || 'job-description'),
            resumeSummary: document.getElementById(elementIds.resumeSummary || 'resume-summary'),

            // Customization options
            toneSelect: document.getElementById(elementIds.toneSelect || 'tone-select'),
            lengthSelect: document.getElementById(elementIds.lengthSelect || 'length-select'),
            focusSelect: document.getElementById(elementIds.focusSelect || 'focus-select'),
            openingStyleSelect: document.getElementById(elementIds.openingStyleSelect || 'opening-style-select'),
            howFound: document.getElementById(elementIds.howFound || 'how-found'),
            contactName: document.getElementById(elementIds.contactName || 'contact-name'),

            // Rewrite mode inputs
            currentLetter: document.getElementById(elementIds.currentLetter || 'current-letter'),
            improvements: document.getElementById(elementIds.improvements || 'improvements'),

            // Tailor mode inputs
            originalLetter: document.getElementById(elementIds.originalLetter || 'original-letter'),
            oldJobTitle: document.getElementById(elementIds.oldJobTitle || 'old-job-title'),
            oldCompanyName: document.getElementById(elementIds.oldCompanyName || 'old-company-name'),

            // Template mode inputs
            templateType: document.getElementById(elementIds.templateType || 'template-type'),

            // Editor and preview
            editor: document.getElementById(elementIds.editor || 'letter-editor'),
            preview: document.getElementById(elementIds.preview || 'letter-preview'),
            structuredView: document.getElementById(elementIds.structuredView || 'structured-view'),

            // Buttons
            generateBtn: document.getElementById(elementIds.generateBtn || 'generate-btn'),
            rewriteBtn: document.getElementById(elementIds.rewriteBtn || 'rewrite-btn'),
            tailorBtn: document.getElementById(elementIds.tailorBtn || 'tailor-btn'),
            analyzeBtn: document.getElementById(elementIds.analyzeBtn || 'analyze-btn'),
            clearBtn: document.getElementById(elementIds.clearBtn || 'clear-btn'),
            exportTxtBtn: document.getElementById(elementIds.exportTxtBtn || 'export-txt-btn'),
            exportPdfBtn: document.getElementById(elementIds.exportPdfBtn || 'export-pdf-btn'),
            exportDocxBtn: document.getElementById(elementIds.exportDocxBtn || 'export-docx-btn'),

            // Status and feedback
            statusMessage: document.getElementById(elementIds.statusMessage || 'status-message'),
            wordCount: document.getElementById(elementIds.wordCount || 'word-count'),
            analysisResults: document.getElementById(elementIds.analysisResults || 'analysis-results'),

            // Panels
            optionsPanel: document.getElementById(elementIds.optionsPanel || 'options-panel'),
            editorPanel: document.getElementById(elementIds.editorPanel || 'editor-panel'),
            previewPanel: document.getElementById(elementIds.previewPanel || 'preview-panel')
        };

        // Bind event listeners
        this._bindEvents();

        // Load saved state
        this._loadState();

        // Setup auto-save
        if (this.autoSaveEnabled) {
            this._setupAutoSave();
        }
    }

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Mode selection
        if (this.elements.modeSelector) {
            this.elements.modeSelector.addEventListener('change', (e) => {
                this.currentMode = e.target.value;
                this._updateUIForMode();
            });
        }

        // Generate button
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', () => this.generateFromScratch());
        }

        // Rewrite button
        if (this.elements.rewriteBtn) {
            this.elements.rewriteBtn.addEventListener('click', () => this.rewriteExisting());
        }

        // Tailor button
        if (this.elements.tailorBtn) {
            this.elements.tailorBtn.addEventListener('click', () => this.tailorForJob());
        }

        // Analyze button
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.addEventListener('click', () => this.analyzeLetter());
        }

        // Clear button
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.clear());
        }

        // Export buttons
        if (this.elements.exportTxtBtn) {
            this.elements.exportTxtBtn.addEventListener('click', () => this.export('txt'));
        }
        if (this.elements.exportPdfBtn) {
            this.elements.exportPdfBtn.addEventListener('click', () => this.export('pdf'));
        }
        if (this.elements.exportDocxBtn) {
            this.elements.exportDocxBtn.addEventListener('click', () => this.export('docx'));
        }

        // Editor content changes
        if (this.elements.editor) {
            this.elements.editor.addEventListener('input', () => {
                this.currentLetter = this.elements.editor.value;
                this._updateWordCount();
                this._updatePreview();
            });
        }

        // Customization option changes
        const optionInputs = [
            'toneSelect', 'lengthSelect', 'focusSelect', 'openingStyleSelect',
            'jobTitle', 'companyName', 'howFound', 'contactName'
        ];

        optionInputs.forEach(key => {
            if (this.elements[key]) {
                this.elements[key].addEventListener('change', () => this._saveState());
            }
        });
    }

    /**
     * Update UI based on selected mode
     * @private
     */
    _updateUIForMode() {
        // Hide all mode-specific sections
        const allSections = document.querySelectorAll('[data-mode-section]');
        allSections.forEach(section => {
            section.style.display = 'none';
        });

        // Show sections for current mode
        const modeSections = document.querySelectorAll(`[data-mode-section="${this.currentMode}"]`);
        modeSections.forEach(section => {
            section.style.display = 'block';
        });

        // Update button visibility
        if (this.elements.generateBtn) {
            this.elements.generateBtn.style.display = this.currentMode === 'from_scratch' || this.currentMode === 'template' ? 'inline-block' : 'none';
        }
        if (this.elements.rewriteBtn) {
            this.elements.rewriteBtn.style.display = this.currentMode === 'rewrite' ? 'inline-block' : 'none';
        }
        if (this.elements.tailorBtn) {
            this.elements.tailorBtn.style.display = this.currentMode === 'tailor' ? 'inline-block' : 'none';
        }
    }

    /**
     * Generate cover letter from scratch
     */
    async generateFromScratch() {
        if (this.isGenerating) return;

        try {
            this.isGenerating = true;
            this._setStatus('Generating cover letter...', 'info');
            this._disableButtons();

            // Get values from UI
            const params = {
                jobTitle: this.elements.jobTitle?.value || '',
                companyName: this.elements.companyName?.value || '',
                jobDescription: this.elements.jobDescription?.value || '',
                resumeSummary: this.elements.resumeSummary?.value || '',
                tone: this.elements.toneSelect?.value || 'professional',
                length: parseInt(this.elements.lengthSelect?.value || '250'),
                focus: this.elements.focusSelect?.value || 'experience',
                openingStyle: this.elements.openingStyleSelect?.value || 'traditional',
                howFound: this.elements.howFound?.value || '',
                contactName: this.elements.contactName?.value || ''
            };

            // Validate
            if (!params.jobTitle || !params.companyName || !params.jobDescription) {
                throw new Error('Please fill in job title, company name, and job description');
            }

            if (!params.resumeSummary) {
                throw new Error('Please provide a resume summary');
            }

            // Generate
            if (typeof coverLetterGenerator === 'undefined') {
                throw new Error('Cover letter generator not loaded');
            }

            const result = await coverLetterGenerator.generateFromScratch(params);

            if (result.success) {
                this.currentLetter = result.content;
                this.currentStructure = result.structure;

                // Update UI
                if (this.elements.editor) {
                    this.elements.editor.value = result.content;
                }

                this._updatePreview();
                this._updateWordCount();
                this._setStatus(`Generated successfully! (${result.metadata.wordCount} words)`, 'success');
            } else {
                throw new Error(result.error || 'Generation failed');
            }
        } catch (error) {
            this._setStatus(`Error: ${error.message}`, 'error');
            console.error('Generation error:', error);
        } finally {
            this.isGenerating = false;
            this._enableButtons();
        }
    }

    /**
     * Rewrite existing cover letter
     */
    async rewriteExisting() {
        if (this.isGenerating) return;

        try {
            this.isGenerating = true;
            this._setStatus('Rewriting cover letter...', 'info');
            this._disableButtons();

            const params = {
                currentLetter: this.elements.currentLetter?.value || '',
                jobDescription: this.elements.jobDescription?.value || '',
                jobTitle: this.elements.jobTitle?.value || '',
                companyName: this.elements.companyName?.value || '',
                tone: this.elements.toneSelect?.value || 'professional',
                length: parseInt(this.elements.lengthSelect?.value || '250'),
                improvements: this.elements.improvements?.value
                    ? this.elements.improvements.value.split('\n').filter(i => i.trim())
                    : []
            };

            if (!params.currentLetter) {
                throw new Error('Please provide the current cover letter text');
            }

            if (!params.jobDescription) {
                throw new Error('Please provide the job description');
            }

            if (typeof coverLetterGenerator === 'undefined') {
                throw new Error('Cover letter generator not loaded');
            }

            const result = await coverLetterGenerator.rewriteExisting(params);

            if (result.success) {
                this.currentLetter = result.content;
                this.currentStructure = result.structure;

                if (this.elements.editor) {
                    this.elements.editor.value = result.content;
                }

                this._updatePreview();
                this._updateWordCount();
                this._setStatus(`Rewritten successfully! (${result.metadata.wordCount} words)`, 'success');
            } else {
                throw new Error(result.error || 'Rewrite failed');
            }
        } catch (error) {
            this._setStatus(`Error: ${error.message}`, 'error');
            console.error('Rewrite error:', error);
        } finally {
            this.isGenerating = false;
            this._enableButtons();
        }
    }

    /**
     * Tailor cover letter for different job
     */
    async tailorForJob() {
        if (this.isGenerating) return;

        try {
            this.isGenerating = true;
            this._setStatus('Tailoring cover letter...', 'info');
            this._disableButtons();

            const params = {
                originalLetter: this.elements.originalLetter?.value || '',
                newJobDescription: this.elements.jobDescription?.value || '',
                newJobTitle: this.elements.jobTitle?.value || '',
                newCompanyName: this.elements.companyName?.value || '',
                oldJobTitle: this.elements.oldJobTitle?.value || '',
                oldCompanyName: this.elements.oldCompanyName?.value || ''
            };

            if (!params.originalLetter) {
                throw new Error('Please provide the original cover letter text');
            }

            if (!params.newJobTitle || !params.newCompanyName || !params.newJobDescription) {
                throw new Error('Please provide new job title, company name, and job description');
            }

            if (typeof coverLetterGenerator === 'undefined') {
                throw new Error('Cover letter generator not loaded');
            }

            const result = await coverLetterGenerator.tailorForJob(params);

            if (result.success) {
                this.currentLetter = result.content;
                this.currentStructure = result.structure;

                if (this.elements.editor) {
                    this.elements.editor.value = result.content;
                }

                this._updatePreview();
                this._updateWordCount();
                this._setStatus(`Tailored successfully! (${result.metadata.wordCount} words)`, 'success');
            } else {
                throw new Error(result.error || 'Tailoring failed');
            }
        } catch (error) {
            this._setStatus(`Error: ${error.message}`, 'error');
            console.error('Tailoring error:', error);
        } finally {
            this.isGenerating = false;
            this._enableButtons();
        }
    }

    /**
     * Analyze current cover letter
     */
    async analyzeLetter() {
        if (this.isGenerating) return;

        try {
            this.isGenerating = true;
            this._setStatus('Analyzing cover letter...', 'info');
            this._disableButtons();

            const coverLetter = this.elements.editor?.value || this.currentLetter;
            const jobDescription = this.elements.jobDescription?.value || '';

            if (!coverLetter) {
                throw new Error('No cover letter to analyze');
            }

            if (typeof coverLetterGenerator === 'undefined') {
                throw new Error('Cover letter generator not loaded');
            }

            const result = await coverLetterGenerator.analyzeCoverLetter({
                coverLetter,
                jobDescription
            });

            if (result.success) {
                this._displayAnalysis(result.analysis);
                this._setStatus('Analysis complete', 'success');
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            this._setStatus(`Error: ${error.message}`, 'error');
            console.error('Analysis error:', error);
        } finally {
            this.isGenerating = false;
            this._enableButtons();
        }
    }

    /**
     * Display analysis results
     * @param {Object} analysis - Analysis results
     * @private
     */
    _displayAnalysis(analysis) {
        if (!this.elements.analysisResults) return;

        let html = `
            <div class="analysis-summary">
                <h3>Overall Score: ${analysis.overallScore}/100</h3>
                <p>Word Count: ${analysis.wordCount}</p>
            </div>

            <div class="analysis-scores">
                <h4>Section Scores:</h4>
                <ul>
                    <li>Opening: ${analysis.scores.opening}/100</li>
                    <li>Specificity: ${analysis.scores.specificity}/100</li>
                    <li>Relevance: ${analysis.scores.relevance}/100</li>
                    <li>Impact: ${analysis.scores.impact}/100</li>
                    <li>Closing: ${analysis.scores.closing}/100</li>
                    <li>Tone: ${analysis.scores.tone}/100</li>
                    <li>Grammar: ${analysis.scores.grammar}/100</li>
                </ul>
            </div>
        `;

        if (analysis.strengths && analysis.strengths.length > 0) {
            html += `
                <div class="analysis-strengths">
                    <h4>Strengths:</h4>
                    <ul>
                        ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (analysis.weaknesses && analysis.weaknesses.length > 0) {
            html += `
                <div class="analysis-weaknesses">
                    <h4>Areas for Improvement:</h4>
                    <ul>
                        ${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (analysis.issues && analysis.issues.length > 0) {
            html += `
                <div class="analysis-issues">
                    <h4>Issues Found:</h4>
                    <ul>
                        ${analysis.issues.map(issue => `
                            <li class="issue-${issue.severity}">
                                <strong>${issue.type}:</strong> ${issue.message}
                                ${issue.suggestion ? `<br><em>Suggestion: ${issue.suggestion}</em>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (analysis.suggestions && analysis.suggestions.length > 0) {
            html += `
                <div class="analysis-suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                        ${analysis.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        this.elements.analysisResults.innerHTML = html;
        this.elements.analysisResults.style.display = 'block';
    }

    /**
     * Clear all fields and reset editor
     */
    clear() {
        if (confirm('Are you sure you want to clear all fields?')) {
            this.currentLetter = '';
            this.currentStructure = {};

            if (this.elements.editor) this.elements.editor.value = '';
            if (this.elements.preview) this.elements.preview.innerHTML = '';
            if (this.elements.analysisResults) this.elements.analysisResults.innerHTML = '';

            this._updateWordCount();
            this._setStatus('Cleared', 'info');
        }
    }

    /**
     * Export cover letter
     * @param {string} format - Export format (txt, pdf, docx)
     */
    async export(format) {
        try {
            const content = this.elements.editor?.value || this.currentLetter;

            if (!content) {
                throw new Error('No cover letter to export');
            }

            if (typeof coverLetterGenerator === 'undefined') {
                throw new Error('Cover letter generator not loaded');
            }

            await coverLetterGenerator.export(content, format);
            this._setStatus(`Exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            this._setStatus(`Export failed: ${error.message}`, 'error');
            console.error('Export error:', error);
        }
    }

    /**
     * Update preview pane
     * @private
     */
    _updatePreview() {
        if (!this.elements.preview) return;

        const content = this.elements.editor?.value || this.currentLetter;

        // Convert line breaks to paragraphs
        const html = content
            .split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');

        this.elements.preview.innerHTML = html;

        // Update structured view if available
        if (this.elements.structuredView && typeof coverLetterStructure !== 'undefined') {
            const structure = coverLetterStructure.parseLetterIntoSections(content);
            this.elements.structuredView.innerHTML = coverLetterStructure.formatWithSectionMarkers(structure);
        }
    }

    /**
     * Update word count display
     * @private
     */
    _updateWordCount() {
        if (!this.elements.wordCount) return;

        const content = this.elements.editor?.value || this.currentLetter;
        const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;

        this.elements.wordCount.textContent = `${words} words`;
    }

    /**
     * Set status message
     * @param {string} message - Status message
     * @param {string} type - Message type (info, success, error)
     * @private
     */
    _setStatus(message, type = 'info') {
        if (!this.elements.statusMessage) return;

        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-message status-${type}`;
        this.elements.statusMessage.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (this.elements.statusMessage) {
                this.elements.statusMessage.style.display = 'none';
            }
        }, 5000);
    }

    /**
     * Disable action buttons during generation
     * @private
     */
    _disableButtons() {
        const buttons = [
            this.elements.generateBtn,
            this.elements.rewriteBtn,
            this.elements.tailorBtn,
            this.elements.analyzeBtn
        ];

        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.classList.add('disabled');
            }
        });
    }

    /**
     * Enable action buttons after generation
     * @private
     */
    _enableButtons() {
        const buttons = [
            this.elements.generateBtn,
            this.elements.rewriteBtn,
            this.elements.tailorBtn,
            this.elements.analyzeBtn
        ];

        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('disabled');
            }
        });
    }

    /**
     * Save current state to localStorage
     * @private
     */
    _saveState() {
        try {
            const state = {
                mode: this.currentMode,
                letter: this.currentLetter,
                jobTitle: this.elements.jobTitle?.value || '',
                companyName: this.elements.companyName?.value || '',
                tone: this.elements.toneSelect?.value || 'professional',
                length: this.elements.lengthSelect?.value || '250',
                focus: this.elements.focusSelect?.value || 'experience',
                openingStyle: this.elements.openingStyleSelect?.value || 'traditional'
            };

            localStorage.setItem('coverletter_editor_state', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Load saved state from localStorage
     * @private
     */
    _loadState() {
        try {
            const saved = localStorage.getItem('coverletter_editor_state');
            if (!saved) return;

            const state = JSON.parse(saved);

            this.currentMode = state.mode || 'from_scratch';
            this.currentLetter = state.letter || '';

            if (this.elements.modeSelector) this.elements.modeSelector.value = this.currentMode;
            if (this.elements.jobTitle) this.elements.jobTitle.value = state.jobTitle || '';
            if (this.elements.companyName) this.elements.companyName.value = state.companyName || '';
            if (this.elements.toneSelect) this.elements.toneSelect.value = state.tone || 'professional';
            if (this.elements.lengthSelect) this.elements.lengthSelect.value = state.length || '250';
            if (this.elements.focusSelect) this.elements.focusSelect.value = state.focus || 'experience';
            if (this.elements.openingStyleSelect) this.elements.openingStyleSelect.value = state.openingStyle || 'traditional';

            this._updateUIForMode();
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    /**
     * Setup auto-save functionality
     * @private
     */
    _setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.currentLetter && this.currentLetter.length > 0) {
                this._saveState();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    /**
     * Cleanup and destroy editor
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this._saveState();
    }
}

// Create global instance
const coverLetterEditor = new CoverLetterEditor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CoverLetterEditor, coverLetterEditor };
}
