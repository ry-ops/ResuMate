/**
 * Unified Export Modal
 * UI component for exporting complete application packages
 * Provides one-click export of all documents with customization options
 */

class UnifiedExportModal {
    constructor() {
        this.modal = null;
        this.onExport = null;
    }

    /**
     * Show the unified export modal
     * @param {Function} callback - Callback when export is complete
     */
    show(callback) {
        this.onExport = callback;
        this.render();
    }

    /**
     * Hide the modal
     */
    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    /**
     * Render the modal
     * @private
     */
    async render() {
        // Remove existing modal if present
        this.hide();

        // Get available documents
        const availableDocs = await this._getAvailableDocuments();

        // Create modal HTML
        const modalHTML = this._getModalHTML(availableDocs);

        // Create and append modal
        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        this.modal = div.firstElementChild;
        document.body.appendChild(this.modal);

        // Attach event listeners
        this._attachEventListeners();
    }

    /**
     * Get modal HTML
     * @private
     * @param {Object} availableDocs - Available documents
     * @returns {string} - Modal HTML
     */
    _getModalHTML(availableDocs) {
        return `
            <div class="unified-export-modal-overlay" id="unifiedExportModal">
                <div class="unified-export-modal">
                    <div class="unified-export-modal-header">
                        <h2>Export Application Package</h2>
                        <button class="close-btn" onclick="this.closest('.unified-export-modal-overlay').remove()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="unified-export-modal-body">
                        <form id="exportPackageForm" class="export-form">
                            <div class="form-section">
                                <h3>Package Information</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="exportJobTitle">Job Title *</label>
                                        <input type="text" id="exportJobTitle" required placeholder="Senior Software Engineer">
                                    </div>
                                    <div class="form-group">
                                        <label for="exportCompany">Company Name *</label>
                                        <input type="text" id="exportCompany" required placeholder="Tech Corp Inc">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="exportCandidateName">Your Name *</label>
                                    <input type="text" id="exportCandidateName" required placeholder="John Doe">
                                    <small>Used for file naming</small>
                                </div>
                            </div>

                            <div class="form-section">
                                <h3>Documents to Include</h3>
                                <div class="document-checklist">
                                    ${this._getDocumentCheckboxes(availableDocs)}
                                </div>
                            </div>

                            <div class="form-section">
                                <h3>Export Formats</h3>
                                <div class="format-checklist">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="format" value="pdf" checked>
                                        <span>PDF (recommended for submissions)</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="format" value="docx" checked>
                                        <span>DOCX (editable Word documents)</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="format" value="txt">
                                        <span>TXT (plain text versions)</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-section">
                                <h3>File Naming</h3>
                                <div class="form-group">
                                    <label>Naming Convention</label>
                                    <select id="namingConvention">
                                        <option value="standard">Standard: JobTitle_Company_DocumentType_YourName</option>
                                        <option value="simple">Simple: YourName_DocumentType</option>
                                    </select>
                                </div>
                                <div class="naming-preview">
                                    <strong>Preview:</strong>
                                    <code id="namingPreview">SeniorSoftwareEngineer_TechCorp_Resume_JohnDoe.pdf</code>
                                </div>
                            </div>

                            <div class="form-section">
                                <h3>Additional Options</h3>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="includeReadme" checked>
                                    <span>Include README.txt with package details</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="includeMetadata" checked>
                                    <span>Include metadata.json for backup</span>
                                </label>
                            </div>

                            <div class="export-summary">
                                <h4>Export Summary</h4>
                                <div class="summary-content" id="exportSummary">
                                    <div class="summary-item">
                                        <span>Documents:</span>
                                        <strong id="summaryDocs">0</strong>
                                    </div>
                                    <div class="summary-item">
                                        <span>Formats per document:</span>
                                        <strong id="summaryFormats">0</strong>
                                    </div>
                                    <div class="summary-item">
                                        <span>Total files:</span>
                                        <strong id="summaryTotal">0</strong>
                                    </div>
                                    <div class="summary-item">
                                        <span>Package name:</span>
                                        <strong id="summaryPackageName">--</strong>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="unified-export-modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.unified-export-modal-overlay').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" id="exportPackageBtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download Application Package
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get document checkboxes HTML
     * @private
     * @param {Object} availableDocs - Available documents
     * @returns {string} - Checkboxes HTML
     */
    _getDocumentCheckboxes(availableDocs) {
        const docs = [
            { type: 'resume', name: 'Resume', icon: '📄' },
            { type: 'coverLetter', name: 'Cover Letter', icon: '✉️' },
            { type: 'executiveBio', name: 'Executive Bio', icon: '👤' },
            { type: 'brandStatement', name: 'Brand Statement', icon: '💡' },
            { type: 'statusInquiry', name: 'Status Inquiry Letter', icon: '📧' }
        ];

        return docs.map(doc => {
            const available = availableDocs[doc.type] || false;
            const disabled = !available ? 'disabled' : '';
            const checked = available ? 'checked' : '';
            const tooltip = !available ? 'title="Document not yet created"' : '';

            return `
                <label class="checkbox-label document-checkbox ${disabled}" ${tooltip}>
                    <input type="checkbox" name="document" value="${doc.type}" ${checked} ${disabled}>
                    <span class="doc-icon">${doc.icon}</span>
                    <span class="doc-name">${doc.name}</span>
                    <span class="doc-status ${available ? 'available' : 'unavailable'}">
                        ${available ? '✓ Available' : '✗ Not created'}
                    </span>
                </label>
            `;
        }).join('');
    }

    /**
     * Attach event listeners
     * @private
     */
    _attachEventListeners() {
        // Export button
        const exportBtn = this.modal.querySelector('#exportPackageBtn');
        exportBtn.addEventListener('click', () => this._handleExport());

        // Form inputs for live preview
        const inputs = this.modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => this._updatePreview());
            input.addEventListener('input', () => this._updatePreview());
        });

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('unified-export-modal-overlay')) {
                this.hide();
            }
        });

        // Initial preview update
        this._updatePreview();
    }

    /**
     * Update naming preview and summary
     * @private
     */
    _updatePreview() {
        const form = this.modal.querySelector('#exportPackageForm');
        const jobTitle = form.querySelector('#exportJobTitle').value || 'Position';
        const company = form.querySelector('#exportCompany').value || 'Company';
        const candidateName = form.querySelector('#exportCandidateName').value || 'Candidate';
        const namingConvention = form.querySelector('#namingConvention').value;

        // Update naming preview
        const preview = this.modal.querySelector('#namingPreview');
        if (namingConvention === 'standard') {
            preview.textContent = `${this._sanitize(jobTitle)}_${this._sanitize(company)}_Resume_${this._sanitize(candidateName)}.pdf`;
        } else {
            preview.textContent = `${this._sanitize(candidateName)}_Resume.pdf`;
        }

        // Update summary
        const selectedDocs = form.querySelectorAll('input[name="document"]:checked').length;
        const selectedFormats = form.querySelectorAll('input[name="format"]:checked').length;
        const includeReadme = form.querySelector('#includeReadme').checked;
        const includeMetadata = form.querySelector('#includeMetadata').checked;

        const totalFiles = (selectedDocs * selectedFormats) +
                          (includeReadme ? 1 : 0) +
                          (includeMetadata ? 1 : 0);

        this.modal.querySelector('#summaryDocs').textContent = selectedDocs;
        this.modal.querySelector('#summaryFormats').textContent = selectedFormats;
        this.modal.querySelector('#summaryTotal').textContent = totalFiles;
        this.modal.querySelector('#summaryPackageName').textContent =
            `${this._sanitize(jobTitle)}_${this._sanitize(company)}_ApplicationPackage_${this._sanitize(candidateName)}_${new Date().toISOString().split('T')[0]}.zip`;
    }

    /**
     * Handle export button click
     * @private
     */
    async _handleExport() {
        const exportBtn = this.modal.querySelector('#exportPackageBtn');
        const originalText = exportBtn.innerHTML;

        try {
            // Validate form
            const formData = this._collectFormData();
            if (!this._validateFormData(formData)) {
                return;
            }

            // Show loading state
            exportBtn.disabled = true;
            exportBtn.innerHTML = `
                <div class="spinner"></div>
                Creating package...
            `;

            // Add progress indicator
            this._showProgress('Preparing documents...', 0);

            // Initialize unified exporter
            if (typeof unifiedExport === 'undefined') {
                throw new Error('Unified export module not loaded');
            }

            // Update progress
            this._showProgress('Generating files...', 33);

            // Create export package
            const result = await unifiedExport.exportApplicationPackage(formData);

            if (result.success) {
                // Update progress
                this._showProgress('Compressing package...', 66);

                // Download the package
                this._downloadPackage(result.blob, result.filename);

                // Update progress
                this._showProgress('Complete!', 100);

                // Call callback
                if (this.onExport) {
                    this.onExport(result);
                }

                // Show success message
                this._showSuccessMessage(result.metadata);

                // Close modal after delay
                setTimeout(() => this.hide(), 2000);
            } else {
                throw new Error(result.error || 'Export failed');
            }
        } catch (error) {
            console.error('[UnifiedExportModal] Export failed:', error);
            alert(`Export failed: ${error.message}`);

            // Restore button
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalText;

            // Hide progress
            this._hideProgress();
        }
    }

    /**
     * Collect form data
     * @private
     * @returns {Object} - Form data
     */
    _collectFormData() {
        const form = this.modal.querySelector('#exportPackageForm');

        // Get selected documents
        const documents = {};
        form.querySelectorAll('input[name="document"]').forEach(checkbox => {
            documents[checkbox.value] = checkbox.checked;
        });

        // Get selected formats
        const formats = [];
        form.querySelectorAll('input[name="format"]:checked').forEach(checkbox => {
            formats.push(checkbox.value);
        });

        return {
            jobTitle: form.querySelector('#exportJobTitle').value,
            companyName: form.querySelector('#exportCompany').value,
            candidateName: form.querySelector('#exportCandidateName').value,
            documents,
            formats,
            namingConvention: form.querySelector('#namingConvention').value,
            includeReadme: form.querySelector('#includeReadme').checked,
            includeMetadata: form.querySelector('#includeMetadata').checked
        };
    }

    /**
     * Validate form data
     * @private
     * @param {Object} formData - Form data
     * @returns {boolean} - Valid
     */
    _validateFormData(formData) {
        // Check required fields
        if (!formData.jobTitle || !formData.companyName || !formData.candidateName) {
            alert('Please fill in all required fields (Job Title, Company, Your Name)');
            return false;
        }

        // Check at least one document selected
        const hasSelectedDoc = Object.values(formData.documents).some(v => v === true);
        if (!hasSelectedDoc) {
            alert('Please select at least one document to export');
            return false;
        }

        // Check at least one format selected
        if (formData.formats.length === 0) {
            alert('Please select at least one export format');
            return false;
        }

        return true;
    }

    /**
     * Get available documents
     * @private
     * @returns {Promise<Object>} - Available documents
     */
    async _getAvailableDocuments() {
        const docs = {
            resume: false,
            coverLetter: false,
            executiveBio: false,
            brandStatement: false,
            statusInquiry: false
        };

        // Check localStorage for each document
        try {
            docs.resume = !!localStorage.getItem('resume_state');
            docs.coverLetter = !!localStorage.getItem('current_cover_letter');
            docs.executiveBio = !!localStorage.getItem('executive_bio');
            docs.brandStatement = !!localStorage.getItem('brand_statement');
            docs.statusInquiry = !!localStorage.getItem('status_inquiry');
        } catch (error) {
            console.warn('[UnifiedExportModal] Could not check available documents');
        }

        return docs;
    }

    /**
     * Show progress indicator
     * @private
     * @param {string} message - Progress message
     * @param {number} percent - Progress percentage
     */
    _showProgress(message, percent) {
        let progressBar = this.modal.querySelector('.export-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'export-progress';
            progressBar.innerHTML = `
                <div class="progress-message"></div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-percent"></div>
            `;
            const footer = this.modal.querySelector('.unified-export-modal-footer');
            footer.insertBefore(progressBar, footer.firstChild);
        }

        progressBar.querySelector('.progress-message').textContent = message;
        progressBar.querySelector('.progress-fill').style.width = `${percent}%`;
        progressBar.querySelector('.progress-percent').textContent = `${percent}%`;
    }

    /**
     * Hide progress indicator
     * @private
     */
    _hideProgress() {
        const progressBar = this.modal.querySelector('.export-progress');
        if (progressBar) {
            progressBar.remove();
        }
    }

    /**
     * Show success message
     * @private
     * @param {Object} metadata - Export metadata
     */
    _showSuccessMessage(metadata) {
        const footer = this.modal.querySelector('.unified-export-modal-footer');
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <div>
                <strong>Package created successfully!</strong>
                <small>${metadata.totalFiles} files (${metadata.fileSize})</small>
            </div>
        `;
        footer.insertBefore(message, footer.firstChild);
    }

    /**
     * Download package
     * @private
     * @param {Blob} blob - Package blob
     * @param {string} filename - Filename
     */
    _downloadPackage(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Sanitize string for filename
     * @private
     * @param {string} str - String to sanitize
     * @returns {string} - Sanitized string
     */
    _sanitize(str) {
        return str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    }
}

// Create global instance
const unifiedExportModal = new UnifiedExportModal();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnifiedExportModal, unifiedExportModal };
}
