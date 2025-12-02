/**
 * Export Manager
 * Main orchestrator for all export operations
 * Coordinates PDF, DOCX, TXT, JSON, and HTML exports
 */

class ExportManager {
    constructor() {
        this.pdfExporter = null;
        this.docxExporter = null;
        this.formatExporter = null;
        this.printManager = null;
        this.modal = null;
        this.selectedFormat = 'pdf';
        this.options = {
            filename: 'resume',
            quality: 'standard',
            pageSize: 'a4',
            preserveTemplate: true
        };
    }

    /**
     * Initialize export manager
     */
    async initialize() {
        try {
            // Initialize exporters
            this.pdfExporter = new PDFExporter();
            this.docxExporter = new DOCXExporter();
            this.formatExporter = new FormatExporter();
            this.printManager = new PrintManager();

            // Initialize print manager
            this.printManager.initialize();

            // Create export modal
            this.createExportModal();

            // Setup event listeners
            this.setupEventListeners();

            console.log('[ExportManager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[ExportManager] Initialization failed:', error);
            return false;
        }
    }

    /**
     * Create export modal UI
     */
    createExportModal() {
        const modalHTML = `
            <div id="export-modal-overlay" class="export-modal-overlay" style="display: none;">
                <div class="export-modal">
                    <div class="export-modal-header">
                        <h2>Export Resume</h2>
                        <button class="export-modal-close" id="export-modal-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="export-modal-body">
                        <!-- Messages -->
                        <div id="export-message" class="export-message"></div>

                        <!-- Format Selection -->
                        <div class="export-section">
                            <h3 style="margin-bottom: 1rem; color: #2c3e50; font-size: 1rem;">Select Export Format</h3>
                            <div class="export-formats">
                                <div class="export-format-card selected" data-format="pdf">
                                    <div class="export-format-icon">📄</div>
                                    <div class="export-format-name">PDF</div>
                                    <div class="export-format-description">High-quality, ATS-optimized</div>
                                </div>
                                <div class="export-format-card" data-format="docx">
                                    <div class="export-format-icon">📝</div>
                                    <div class="export-format-name">DOCX</div>
                                    <div class="export-format-description">Editable Word format</div>
                                </div>
                                <div class="export-format-card" data-format="txt">
                                    <div class="export-format-icon">📋</div>
                                    <div class="export-format-name">TXT</div>
                                    <div class="export-format-description">Plain text copy/paste</div>
                                </div>
                                <div class="export-format-card" data-format="html">
                                    <div class="export-format-icon">🌐</div>
                                    <div class="export-format-name">HTML</div>
                                    <div class="export-format-description">Self-contained webpage</div>
                                </div>
                                <div class="export-format-card" data-format="json">
                                    <div class="export-format-icon">💾</div>
                                    <div class="export-format-name">JSON</div>
                                    <div class="export-format-description">Full data backup</div>
                                </div>
                            </div>
                        </div>

                        <!-- Export Options -->
                        <div class="export-options">
                            <!-- Filename -->
                            <div class="export-option">
                                <label for="export-filename">Filename</label>
                                <input type="text" id="export-filename" value="resume" placeholder="Enter filename">
                            </div>

                            <!-- Quality (PDF/DOCX only) -->
                            <div class="export-option" id="quality-option">
                                <label>Quality</label>
                                <div class="quality-options">
                                    <div class="quality-option" data-quality="standard">
                                        <input type="radio" name="quality" value="standard" id="quality-standard" checked>
                                        <label for="quality-standard">
                                            <span class="quality-label">Standard</span>
                                            <span class="quality-description">Good for most uses</span>
                                        </label>
                                    </div>
                                    <div class="quality-option selected" data-quality="high">
                                        <input type="radio" name="quality" value="high" id="quality-high">
                                        <label for="quality-high">
                                            <span class="quality-label">High</span>
                                            <span class="quality-description">Maximum quality</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Page Size -->
                            <div class="export-option" id="page-size-option">
                                <label>Page Size</label>
                                <div class="export-radio-group">
                                    <label class="export-radio-label">
                                        <input type="radio" name="page-size" value="a4" id="page-size-a4" checked>
                                        A4 (International)
                                    </label>
                                    <label class="export-radio-label">
                                        <input type="radio" name="page-size" value="letter" id="page-size-letter">
                                        Letter (US)
                                    </label>
                                </div>
                            </div>

                            <!-- Preserve Template -->
                            <div class="export-option" id="preserve-template-option">
                                <label class="export-option-group">
                                    <input type="checkbox" id="preserve-template" checked>
                                    Preserve template styling
                                </label>
                            </div>
                        </div>

                        <!-- Progress -->
                        <div class="export-progress" id="export-progress">
                            <div class="export-progress-bar">
                                <div class="export-progress-fill" id="export-progress-fill"></div>
                            </div>
                            <div class="export-progress-text" id="export-progress-text">Preparing export...</div>
                        </div>

                        <!-- File Size Estimate -->
                        <div class="file-size-estimate" id="file-size-estimate" style="display: none;">
                            Estimated file size: <span id="file-size-value">--</span>
                        </div>
                    </div>
                    <div class="export-modal-footer">
                        <button class="export-cancel-btn" id="export-cancel-btn">Cancel</button>
                        <button class="export-submit-btn" id="export-submit-btn">
                            <span id="export-submit-text">Export</span>
                            <span class="export-spinner" id="export-spinner" style="display: none;"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('export-modal-overlay');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Format selection
        const formatCards = document.querySelectorAll('.export-format-card');
        formatCards.forEach(card => {
            card.addEventListener('click', () => {
                formatCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedFormat = card.dataset.format;
                this.updateOptionsVisibility();
            });
        });

        // Quality options
        const qualityOptions = document.querySelectorAll('.quality-option');
        qualityOptions.forEach(option => {
            option.addEventListener('click', () => {
                qualityOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                this.options.quality = option.dataset.quality;
            });
        });

        // Filename input
        const filenameInput = document.getElementById('export-filename');
        if (filenameInput) {
            filenameInput.addEventListener('input', (e) => {
                this.options.filename = e.target.value || 'resume';
            });
        }

        // Page size
        const pageSizeInputs = document.querySelectorAll('input[name="page-size"]');
        pageSizeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.options.pageSize = e.target.value;
            });
        });

        // Preserve template
        const preserveTemplateCheckbox = document.getElementById('preserve-template');
        if (preserveTemplateCheckbox) {
            preserveTemplateCheckbox.addEventListener('change', (e) => {
                this.options.preserveTemplate = e.target.checked;
            });
        }

        // Modal controls
        const closeBtn = document.getElementById('export-modal-close');
        const cancelBtn = document.getElementById('export-cancel-btn');
        const submitBtn = document.getElementById('export-submit-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (submitBtn) submitBtn.addEventListener('click', () => this.handleExport());

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    /**
     * Update options visibility based on selected format
     */
    updateOptionsVisibility() {
        const qualityOption = document.getElementById('quality-option');
        const pageSizeOption = document.getElementById('page-size-option');
        const preserveTemplateOption = document.getElementById('preserve-template-option');

        // Quality is only for PDF and DOCX
        const showQuality = this.selectedFormat === 'pdf' || this.selectedFormat === 'docx';
        if (qualityOption) {
            qualityOption.style.display = showQuality ? 'block' : 'none';
        }

        // Page size is only for PDF and print
        const showPageSize = this.selectedFormat === 'pdf';
        if (pageSizeOption) {
            pageSizeOption.style.display = showPageSize ? 'block' : 'none';
        }

        // Preserve template for PDF, DOCX, HTML
        const showPreserve = ['pdf', 'docx', 'html'].includes(this.selectedFormat);
        if (preserveTemplateOption) {
            preserveTemplateOption.style.display = showPreserve ? 'block' : 'none';
        }
    }

    /**
     * Open export modal
     */
    openModal() {
        if (!this.modal) {
            console.error('[ExportManager] Modal not initialized');
            return;
        }

        this.modal.style.display = 'flex';
        this.resetModal();
        this.updateOptionsVisibility();
    }

    /**
     * Close export modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    /**
     * Reset modal state
     */
    resetModal() {
        // Hide progress
        const progress = document.getElementById('export-progress');
        if (progress) progress.classList.remove('active');

        // Hide messages
        const message = document.getElementById('export-message');
        if (message) message.classList.remove('active');

        // Reset button
        const submitBtn = document.getElementById('export-submit-btn');
        const submitText = document.getElementById('export-submit-text');
        const spinner = document.getElementById('export-spinner');
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Export';
        if (spinner) spinner.style.display = 'none';
    }

    /**
     * Show message in modal
     */
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('export-message');
        if (!messageEl) return;

        messageEl.className = `export-message active ${type}`;
        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
        messageEl.innerHTML = `<span class="export-message-icon">${icon}</span>${message}`;
    }

    /**
     * Update progress
     */
    updateProgress(percent, message) {
        const progress = document.getElementById('export-progress');
        const fill = document.getElementById('export-progress-fill');
        const text = document.getElementById('export-progress-text');

        if (progress) progress.classList.add('active');
        if (fill) fill.style.width = `${percent}%`;
        if (text) text.textContent = message;
    }

    /**
     * Handle export
     */
    async handleExport() {
        try {
            // Show progress
            this.updateProgress(0, 'Preparing export...');

            // Disable button
            const submitBtn = document.getElementById('export-submit-btn');
            const submitText = document.getElementById('export-submit-text');
            const spinner = document.getElementById('export-spinner');
            if (submitBtn) submitBtn.disabled = true;
            if (submitText) submitText.textContent = 'Exporting...';
            if (spinner) spinner.style.display = 'inline-block';

            // Get resume data
            const resumeData = this.getResumeData();
            if (!resumeData) {
                throw new Error('No resume data available');
            }

            this.updateProgress(25, `Generating ${this.selectedFormat.toUpperCase()}...`);

            // Export based on format
            let result;
            switch (this.selectedFormat) {
                case 'pdf':
                    result = await this.exportPDF(resumeData);
                    break;
                case 'docx':
                    result = await this.exportDOCX(resumeData);
                    break;
                case 'txt':
                    result = await this.exportTXT(resumeData);
                    break;
                case 'json':
                    result = await this.exportJSON(resumeData);
                    break;
                case 'html':
                    result = await this.exportHTML(resumeData);
                    break;
                default:
                    throw new Error(`Unsupported format: ${this.selectedFormat}`);
            }

            this.updateProgress(100, 'Export complete!');

            // Show success message
            this.showMessage('Export completed successfully!', 'success');

            // Close modal after delay
            setTimeout(() => {
                this.closeModal();
            }, 2000);

        } catch (error) {
            console.error('[ExportManager] Export failed:', error);
            this.showMessage(`Export failed: ${error.message}`, 'error');

            // Re-enable button
            const submitBtn = document.getElementById('export-submit-btn');
            const submitText = document.getElementById('export-submit-text');
            const spinner = document.getElementById('export-spinner');
            if (submitBtn) submitBtn.disabled = false;
            if (submitText) submitText.textContent = 'Export';
            if (spinner) spinner.style.display = 'none';
        }
    }

    /**
     * Export to PDF
     */
    async exportPDF(resumeData) {
        const container = document.querySelector('.resume-document');
        if (!container) {
            throw new Error('Resume container not found');
        }

        await this.pdfExporter.exportToPDF(container, {
            filename: this.options.filename,
            quality: this.options.quality,
            pageSize: this.options.pageSize
        });
    }

    /**
     * Export to DOCX
     */
    async exportDOCX(resumeData) {
        const blob = await this.docxExporter.exportToDOCX(resumeData, this.options);
        this.docxExporter.downloadDOCX(blob, this.options.filename);
    }

    /**
     * Export to TXT
     */
    async exportTXT(resumeData) {
        const content = this.formatExporter.exportToTXT(resumeData, this.options);
        this.formatExporter.downloadTXT(content, this.options.filename);
    }

    /**
     * Export to JSON
     */
    async exportJSON(resumeData) {
        const content = this.formatExporter.exportToJSON(resumeData, this.options);
        this.formatExporter.downloadJSON(content, this.options.filename);
    }

    /**
     * Export to HTML
     */
    async exportHTML(resumeData) {
        const content = this.formatExporter.exportToHTML(resumeData, this.options);
        this.formatExporter.downloadHTML(content, this.options.filename);
    }

    /**
     * Get resume data
     */
    getResumeData() {
        // Try to get from global state
        if (typeof window.resumeState !== 'undefined') {
            return window.resumeState;
        }

        // Try to get from state manager
        if (typeof StateManager !== 'undefined' && window.stateManager) {
            return window.stateManager.getState();
        }

        return null;
    }

    /**
     * Quick export (skip modal)
     */
    async quickExport(format = 'pdf', filename = 'resume') {
        this.selectedFormat = format;
        this.options.filename = filename;

        const resumeData = this.getResumeData();
        if (!resumeData) {
            console.error('[ExportManager] No resume data available');
            return;
        }

        try {
            switch (format) {
                case 'pdf':
                    await this.exportPDF(resumeData);
                    break;
                case 'docx':
                    await this.exportDOCX(resumeData);
                    break;
                case 'txt':
                    await this.exportTXT(resumeData);
                    break;
                case 'json':
                    await this.exportJSON(resumeData);
                    break;
                case 'html':
                    await this.exportHTML(resumeData);
                    break;
            }
            console.log(`[ExportManager] Quick export to ${format} completed`);
        } catch (error) {
            console.error('[ExportManager] Quick export failed:', error);
            throw error;
        }
    }

    /**
     * Export cover letter to TXT
     * @param {string} content - Cover letter text content
     * @param {string} filename - Output filename (without extension)
     */
    exportToTxt(content, filename = 'cover_letter') {
        try {
            // Create blob
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.txt`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);

            console.log(`[ExportManager] Cover letter exported to TXT: ${filename}.txt`);
        } catch (error) {
            console.error('[ExportManager] TXT export failed:', error);
            throw error;
        }
    }

    /**
     * Export cover letter to PDF
     * @param {string} content - Cover letter text content
     * @param {Object} options - Export options
     */
    async exportCoverLetterToPdf(content, options = {}) {
        try {
            const {
                filename = 'cover_letter',
                quality = 'standard',
                pageSize = 'a4'
            } = options;

            // Create a temporary container with proper cover letter formatting
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                font-family: Georgia, serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #000;
                max-width: 650px;
                margin: 0 auto;
                padding: 1in;
            `;

            // Format content with proper paragraph spacing
            const paragraphs = content.split('\n\n');
            paragraphs.forEach(para => {
                const p = document.createElement('p');
                p.style.cssText = 'margin: 0 0 1em 0; text-align: left;';
                p.textContent = para.replace(/\n/g, ' ');
                tempContainer.appendChild(p);
            });

            // Temporarily add to document for rendering
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);

            // Use PDF exporter
            await this.pdfExporter.exportToPDF(tempContainer, {
                filename,
                quality,
                pageSize
            });

            // Clean up
            document.body.removeChild(tempContainer);

            console.log(`[ExportManager] Cover letter exported to PDF: ${filename}.pdf`);
        } catch (error) {
            console.error('[ExportManager] PDF export failed:', error);
            throw error;
        }
    }

    /**
     * Export cover letter to DOCX
     * @param {string} content - Cover letter text content
     * @param {Object} options - Export options
     */
    async exportCoverLetterToDocx(content, options = {}) {
        try {
            const {
                filename = 'cover_letter'
            } = options;

            // Convert cover letter content to resume data format for DOCX exporter
            const coverLetterData = {
                sections: {
                    coverLetter: {
                        content: content,
                        type: 'text'
                    }
                }
            };

            // Use DOCX exporter
            const blob = await this.docxExporter.exportToDOCX(coverLetterData, {
                ...options,
                isCoverLetter: true
            });

            // Download
            this.docxExporter.downloadDOCX(blob, filename);

            console.log(`[ExportManager] Cover letter exported to DOCX: ${filename}.docx`);
        } catch (error) {
            console.error('[ExportManager] DOCX export failed:', error);
            throw error;
        }
    }
}

// Create global instance
window.ExportManager = ExportManager;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
}
