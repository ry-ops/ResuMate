/**
 * Document Preview Component
 * Provides preview, comparison, and editing capabilities for generated documents
 *
 * Features:
 * - Preview all 5 document types
 * - Side-by-side comparison (before/after)
 * - Markdown rendering
 * - Copy-to-clipboard
 * - Edit-in-place functionality
 * - Export individual documents
 *
 * @class DocumentPreview
 * @version 1.0.0
 */

class DocumentPreview {
    constructor(containerId) {
        /**
         * Container element ID
         * @private
         */
        this.containerId = containerId;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            throw new Error(`Container element #${containerId} not found`);
        }

        /**
         * Currently active document type
         * @private
         */
        this.activeDocument = null;

        /**
         * Document data cache
         * @private
         */
        this.documents = {
            resume: null,
            coverLetter: null,
            executiveBio: null,
            brandStatement: null,
            statusInquiry: null
        };

        /**
         * Comparison mode (null, 'before-after', 'side-by-side')
         * @private
         */
        this.comparisonMode = null;

        /**
         * Edit mode flag
         * @private
         */
        this.editMode = false;

        /**
         * Event listeners
         * @private
         */
        this.listeners = {};

        console.log('[DocumentPreview] Initialized');
    }

    /**
     * Initialize the preview UI
     */
    initialize() {
        this.render();
        this._attachEventListeners();
        console.log('[DocumentPreview] UI initialized');
    }

    /**
     * Render the preview container
     */
    render() {
        this.container.innerHTML = `
            <div class="document-preview-wrapper">
                <!-- Document Tabs -->
                <div class="document-tabs">
                    <button class="tab-btn" data-document="resume">
                        <i class="fas fa-file-alt"></i> Resume
                        <span class="status-indicator" data-status="resume"></span>
                    </button>
                    <button class="tab-btn" data-document="coverLetter">
                        <i class="fas fa-envelope"></i> Cover Letter
                        <span class="status-indicator" data-status="coverLetter"></span>
                    </button>
                    <button class="tab-btn" data-document="executiveBio">
                        <i class="fas fa-user-tie"></i> Executive Bio
                        <span class="status-indicator" data-status="executiveBio"></span>
                    </button>
                    <button class="tab-btn" data-document="brandStatement">
                        <i class="fas fa-lightbulb"></i> Brand Statement
                        <span class="status-indicator" data-status="brandStatement"></span>
                    </button>
                    <button class="tab-btn" data-document="statusInquiry">
                        <i class="fas fa-question-circle"></i> Status Inquiry
                        <span class="status-indicator" data-status="statusInquiry"></span>
                    </button>
                </div>

                <!-- Toolbar -->
                <div class="preview-toolbar">
                    <div class="toolbar-left">
                        <button class="toolbar-btn" id="refresh-btn" title="Regenerate">
                            <i class="fas fa-sync-alt"></i> Regenerate
                        </button>
                        <button class="toolbar-btn" id="edit-btn" title="Edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="toolbar-btn" id="copy-btn" title="Copy to Clipboard">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div class="toolbar-right">
                        <select id="comparison-mode" class="toolbar-select">
                            <option value="">Single View</option>
                            <option value="side-by-side">Side by Side</option>
                        </select>
                        <button class="toolbar-btn" id="export-btn" title="Export">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <!-- Preview Area -->
                <div class="preview-area">
                    <div class="preview-pane" id="preview-main">
                        <div class="preview-empty">
                            <i class="fas fa-file-alt fa-3x"></i>
                            <p>Select a document type to preview</p>
                        </div>
                    </div>
                    <div class="preview-pane comparison-pane" id="preview-comparison" style="display: none;">
                        <div class="preview-empty">
                            <i class="fas fa-columns fa-3x"></i>
                            <p>Comparison view</p>
                        </div>
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="preview-status-bar">
                    <div class="status-info">
                        <span id="word-count">0 words</span>
                        <span class="separator">|</span>
                        <span id="char-count">0 characters</span>
                        <span class="separator">|</span>
                        <span id="last-updated">Never</span>
                    </div>
                    <div class="status-actions">
                        <span id="preview-status">Ready</span>
                    </div>
                </div>
            </div>
        `;

        this._addStyles();
    }

    /**
     * Load document for preview
     * @param {string} type - Document type
     * @param {Object} data - Document data
     */
    loadDocument(type, data) {
        if (!this._isValidDocumentType(type)) {
            console.error(`[DocumentPreview] Invalid document type: ${type}`);
            return;
        }

        this.documents[type] = data;
        this._updateStatusIndicator(type, 'completed');

        console.log(`[DocumentPreview] Loaded ${type}`);

        // If this is the active document, refresh preview
        if (this.activeDocument === type) {
            this.showDocument(type);
        }
    }

    /**
     * Show document in preview
     * @param {string} type - Document type
     */
    showDocument(type) {
        if (!this._isValidDocumentType(type)) {
            console.error(`[DocumentPreview] Invalid document type: ${type}`);
            return;
        }

        this.activeDocument = type;
        this._updateActiveTab(type);

        const data = this.documents[type];

        if (!data) {
            this._showEmptyState(`No ${this._getDocumentName(type)} generated yet`);
            return;
        }

        // Render document content
        this._renderDocument(data, type);

        // Update status bar
        this._updateStatusBar(data);

        // Emit event
        this._emit('documentShown', { type, data });
    }

    /**
     * Enable comparison mode
     * @param {string} mode - Comparison mode ('side-by-side')
     * @param {Object} beforeData - Before document data
     * @param {Object} afterData - After document data
     */
    enableComparison(mode, beforeData, afterData) {
        this.comparisonMode = mode;

        const comparisonPane = document.getElementById('preview-comparison');
        comparisonPane.style.display = 'block';

        const mainPane = document.getElementById('preview-main');
        mainPane.classList.add('split-view');

        // Render both documents
        this._renderDocument(beforeData, this.activeDocument, 'preview-comparison');
        this._renderDocument(afterData, this.activeDocument, 'preview-main');

        console.log(`[DocumentPreview] Enabled comparison mode: ${mode}`);
    }

    /**
     * Disable comparison mode
     */
    disableComparison() {
        this.comparisonMode = null;

        const comparisonPane = document.getElementById('preview-comparison');
        comparisonPane.style.display = 'none';

        const mainPane = document.getElementById('preview-main');
        mainPane.classList.remove('split-view');

        // Refresh main preview
        if (this.activeDocument) {
            this.showDocument(this.activeDocument);
        }

        console.log('[DocumentPreview] Disabled comparison mode');
    }

    /**
     * Enable edit mode
     */
    enableEditMode() {
        if (!this.activeDocument || !this.documents[this.activeDocument]) {
            alert('No document to edit');
            return;
        }

        this.editMode = true;
        const mainPane = document.getElementById('preview-main');
        mainPane.classList.add('edit-mode');

        // Make content editable
        const contentArea = mainPane.querySelector('.document-content');
        if (contentArea) {
            contentArea.setAttribute('contenteditable', 'true');
            contentArea.focus();
        }

        // Update toolbar
        const editBtn = document.getElementById('edit-btn');
        editBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        editBtn.classList.add('active');

        console.log('[DocumentPreview] Edit mode enabled');
    }

    /**
     * Disable edit mode and save changes
     */
    disableEditMode() {
        if (!this.editMode) return;

        this.editMode = false;
        const mainPane = document.getElementById('preview-main');
        mainPane.classList.remove('edit-mode');

        // Get edited content
        const contentArea = mainPane.querySelector('.document-content');
        if (contentArea) {
            const editedContent = contentArea.innerHTML;
            contentArea.setAttribute('contenteditable', 'false');

            // Update document data
            if (this.documents[this.activeDocument]) {
                this.documents[this.activeDocument].content = editedContent;
                this._emit('documentEdited', {
                    type: this.activeDocument,
                    content: editedContent
                });
            }
        }

        // Update toolbar
        const editBtn = document.getElementById('edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.classList.remove('active');

        console.log('[DocumentPreview] Edit mode disabled, changes saved');
    }

    /**
     * Copy document content to clipboard
     */
    async copyToClipboard() {
        if (!this.activeDocument || !this.documents[this.activeDocument]) {
            alert('No document to copy');
            return;
        }

        try {
            const content = this._extractTextContent(this.documents[this.activeDocument]);
            await navigator.clipboard.writeText(content);

            // Show success feedback
            this._showToast('Copied to clipboard!', 'success');
            console.log('[DocumentPreview] Content copied to clipboard');
        } catch (error) {
            console.error('[DocumentPreview] Failed to copy:', error);
            this._showToast('Failed to copy to clipboard', 'error');
        }
    }

    /**
     * Export current document
     * @param {string} format - Export format ('pdf', 'docx', 'txt')
     */
    async exportDocument(format = 'pdf') {
        if (!this.activeDocument || !this.documents[this.activeDocument]) {
            alert('No document to export');
            return;
        }

        try {
            if (typeof unifiedExport === 'undefined') {
                throw new Error('UnifiedExport not loaded');
            }

            const result = await unifiedExport.exportSingleDocument(
                this.activeDocument,
                this.documents[this.activeDocument],
                format
            );

            if (result.success) {
                this._showToast(`Exported as ${format.toUpperCase()}`, 'success');
                console.log(`[DocumentPreview] Exported ${this.activeDocument} as ${format}`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('[DocumentPreview] Export failed:', error);
            this._showToast('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Regenerate current document
     */
    async regenerateDocument() {
        if (!this.activeDocument) {
            alert('No document selected');
            return;
        }

        try {
            if (typeof documentFactory === 'undefined') {
                throw new Error('DocumentFactory not loaded');
            }

            this._updateStatusIndicator(this.activeDocument, 'generating');
            this._setStatus('Regenerating...');

            const methodName = `generate${this.activeDocument.charAt(0).toUpperCase() + this.activeDocument.slice(1)}`;
            const result = await documentFactory[methodName](true); // Force regenerate

            this.loadDocument(this.activeDocument, result);
            this.showDocument(this.activeDocument);

            this._showToast('Document regenerated successfully', 'success');
            this._setStatus('Ready');
        } catch (error) {
            console.error('[DocumentPreview] Regeneration failed:', error);
            this._updateStatusIndicator(this.activeDocument, 'failed');
            this._showToast('Regeneration failed: ' + error.message, 'error');
            this._setStatus('Error');
        }
    }

    /**
     * Render document content
     * @param {Object} data - Document data
     * @param {string} type - Document type
     * @param {string} targetId - Target element ID
     * @private
     */
    _renderDocument(data, type, targetId = 'preview-main') {
        const target = document.getElementById(targetId);
        if (!target) return;

        let html = '';

        if (data.content) {
            if (typeof data.content === 'string') {
                html = this._formatContent(data.content, type);
            } else if (data.content.sections) {
                // Resume format
                html = this._renderResume(data.content);
            } else {
                html = this._formatContent(JSON.stringify(data.content, null, 2), type);
            }
        } else {
            html = '<div class="preview-empty"><p>No content available</p></div>';
        }

        target.innerHTML = `
            <div class="document-header">
                <h2>${this._getDocumentName(type)}</h2>
                ${data.metadata ? `<div class="metadata">Generated: ${new Date(data.timestamp || data.metadata.generatedAt).toLocaleString()}</div>` : ''}
            </div>
            <div class="document-content">
                ${html}
            </div>
        `;
    }

    /**
     * Render resume content
     * @param {Object} resumeState - Resume state
     * @returns {string} - HTML string
     * @private
     */
    _renderResume(resumeState) {
        if (!resumeState.sections) return '<p>Invalid resume format</p>';

        let html = '<div class="resume-preview">';

        resumeState.sections.forEach(section => {
            html += `<div class="resume-section">`;
            html += `<h3>${section.name || 'Untitled Section'}</h3>`;

            if (section.content) {
                if (section.content.text) {
                    html += `<p>${section.content.text}</p>`;
                }
                if (section.content.items && Array.isArray(section.content.items)) {
                    html += '<ul>';
                    section.content.items.forEach(item => {
                        if (typeof item === 'string') {
                            html += `<li>${item}</li>`;
                        } else if (item.title) {
                            html += `<li><strong>${item.title}</strong>`;
                            if (item.company) html += ` - ${item.company}`;
                            if (item.date) html += ` <em>(${item.date})</em>`;
                            if (item.bullets) {
                                html += '<ul>';
                                item.bullets.forEach(bullet => {
                                    html += `<li>${bullet}</li>`;
                                });
                                html += '</ul>';
                            }
                            html += '</li>';
                        }
                    });
                    html += '</ul>';
                }
            }

            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    /**
     * Format content based on type
     * @param {string} content - Raw content
     * @param {string} type - Document type
     * @returns {string} - Formatted HTML
     * @private
     */
    _formatContent(content, type) {
        // Convert markdown-like formatting
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        return `<p>${formatted}</p>`;
    }

    /**
     * Extract text content from document data
     * @param {Object} data - Document data
     * @returns {string} - Plain text content
     * @private
     */
    _extractTextContent(data) {
        if (!data || !data.content) return '';

        if (typeof data.content === 'string') {
            return data.content;
        }

        if (data.content.sections) {
            // Resume format
            return data.content.sections.map(section => {
                let text = `${section.name}\n\n`;
                if (section.content) {
                    if (section.content.text) text += section.content.text + '\n\n';
                    if (section.content.items) {
                        section.content.items.forEach(item => {
                            if (typeof item === 'string') {
                                text += `- ${item}\n`;
                            } else {
                                text += JSON.stringify(item) + '\n';
                            }
                        });
                    }
                }
                return text;
            }).join('\n\n');
        }

        return JSON.stringify(data.content, null, 2);
    }

    /**
     * Update status bar
     * @param {Object} data - Document data
     * @private
     */
    _updateStatusBar(data) {
        const content = this._extractTextContent(data);
        const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = content.length;

        document.getElementById('word-count').textContent = `${words} words`;
        document.getElementById('char-count').textContent = `${chars} characters`;

        if (data.timestamp) {
            const date = new Date(data.timestamp);
            document.getElementById('last-updated').textContent = `Updated: ${date.toLocaleString()}`;
        }
    }

    /**
     * Update status indicator
     * @param {string} type - Document type
     * @param {string} status - Status ('pending', 'generating', 'completed', 'failed')
     * @private
     */
    _updateStatusIndicator(type, status) {
        const indicator = document.querySelector(`.status-indicator[data-status="${type}"]`);
        if (indicator) {
            indicator.className = 'status-indicator';
            indicator.classList.add(`status-${status}`);
        }
    }

    /**
     * Update active tab
     * @param {string} type - Document type
     * @private
     */
    _updateActiveTab(type) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.tab-btn[data-document="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    /**
     * Set status message
     * @param {string} message - Status message
     * @private
     */
    _setStatus(message) {
        const statusEl = document.getElementById('preview-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    /**
     * Show empty state
     * @param {string} message - Empty state message
     * @private
     */
    _showEmptyState(message) {
        const mainPane = document.getElementById('preview-main');
        mainPane.innerHTML = `
            <div class="preview-empty">
                <i class="fas fa-file-alt fa-3x"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type ('success', 'error', 'info')
     * @private
     */
    _showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Attach event listeners
     * @private
     */
    _attachEventListeners() {
        // Tab clicks
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = btn.dataset.document;
                this.showDocument(type);
            });
        });

        // Toolbar actions
        document.getElementById('refresh-btn')?.addEventListener('click', () => {
            this.regenerateDocument();
        });

        document.getElementById('edit-btn')?.addEventListener('click', () => {
            if (this.editMode) {
                this.disableEditMode();
            } else {
                this.enableEditMode();
            }
        });

        document.getElementById('copy-btn')?.addEventListener('click', () => {
            this.copyToClipboard();
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportDocument('pdf');
        });

        // Comparison mode
        document.getElementById('comparison-mode')?.addEventListener('change', (e) => {
            if (e.target.value) {
                // Enable comparison (requires before/after data)
                console.log('Comparison mode selected:', e.target.value);
            } else {
                this.disableComparison();
            }
        });
    }

    /**
     * Add component styles
     * @private
     */
    _addStyles() {
        if (document.getElementById('document-preview-styles')) return;

        const style = document.createElement('style');
        style.id = 'document-preview-styles';
        style.textContent = `
            .document-preview-wrapper {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
            }

            .document-tabs {
                display: flex;
                gap: 4px;
                padding: 12px;
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
            }

            .tab-btn {
                padding: 10px 16px;
                border: none;
                background: transparent;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #495057;
                transition: all 0.2s;
            }

            .tab-btn:hover {
                background: #e9ecef;
            }

            .tab-btn.active {
                background: #fff;
                color: #2563eb;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #dee2e6;
            }

            .status-indicator.status-generating {
                background: #ffc107;
                animation: pulse 1.5s infinite;
            }

            .status-indicator.status-completed {
                background: #28a745;
            }

            .status-indicator.status-failed {
                background: #dc3545;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .preview-toolbar {
                display: flex;
                justify-content: space-between;
                padding: 12px;
                background: #fff;
                border-bottom: 1px solid #dee2e6;
            }

            .toolbar-left, .toolbar-right {
                display: flex;
                gap: 8px;
            }

            .toolbar-btn {
                padding: 8px 16px;
                border: 1px solid #dee2e6;
                background: #fff;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                color: #495057;
                transition: all 0.2s;
            }

            .toolbar-btn:hover {
                background: #f8f9fa;
                border-color: #adb5bd;
            }

            .toolbar-btn.active {
                background: #2563eb;
                color: #fff;
                border-color: #2563eb;
            }

            .toolbar-select {
                padding: 8px 12px;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                font-size: 14px;
                background: #fff;
            }

            .preview-area {
                flex: 1;
                display: flex;
                overflow: hidden;
            }

            .preview-pane {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }

            .preview-pane.split-view {
                border-right: 2px solid #dee2e6;
            }

            .comparison-pane {
                flex: 1;
                border-left: 2px solid #dee2e6;
            }

            .preview-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #adb5bd;
            }

            .preview-empty i {
                margin-bottom: 16px;
            }

            .document-header {
                margin-bottom: 24px;
            }

            .document-header h2 {
                margin: 0 0 8px 0;
                color: #212529;
            }

            .metadata {
                font-size: 14px;
                color: #6c757d;
            }

            .document-content {
                line-height: 1.6;
                color: #212529;
            }

            .document-content[contenteditable="true"] {
                border: 2px dashed #2563eb;
                padding: 16px;
                border-radius: 6px;
                outline: none;
            }

            .resume-section {
                margin-bottom: 32px;
            }

            .resume-section h3 {
                margin: 0 0 16px 0;
                padding-bottom: 8px;
                border-bottom: 2px solid #2563eb;
                color: #2563eb;
            }

            .resume-section ul {
                list-style: none;
                padding: 0;
            }

            .resume-section li {
                margin-bottom: 12px;
                padding-left: 20px;
                position: relative;
            }

            .resume-section li:before {
                content: "•";
                position: absolute;
                left: 0;
                color: #2563eb;
                font-weight: bold;
            }

            .preview-status-bar {
                display: flex;
                justify-content: space-between;
                padding: 12px 24px;
                background: #f8f9fa;
                border-top: 1px solid #dee2e6;
                font-size: 14px;
                color: #6c757d;
            }

            .status-info {
                display: flex;
                gap: 12px;
            }

            .separator {
                color: #dee2e6;
            }

            .toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 16px 24px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s;
                z-index: 10000;
            }

            .toast.show {
                transform: translateY(0);
                opacity: 1;
            }

            .toast.toast-success {
                border-left: 4px solid #28a745;
            }

            .toast.toast-error {
                border-left: 4px solid #dc3545;
            }

            .toast.toast-info {
                border-left: 4px solid #17a2b8;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Check if document type is valid
     * @param {string} type - Document type
     * @returns {boolean}
     * @private
     */
    _isValidDocumentType(type) {
        return ['resume', 'coverLetter', 'executiveBio', 'brandStatement', 'statusInquiry'].includes(type);
    }

    /**
     * Get human-readable document name
     * @param {string} type - Document type
     * @returns {string}
     * @private
     */
    _getDocumentName(type) {
        const names = {
            resume: 'Resume',
            coverLetter: 'Cover Letter',
            executiveBio: 'Executive Bio',
            brandStatement: 'Brand Statement',
            statusInquiry: 'Status Inquiry Email'
        };
        return names[type] || type;
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @private
     */
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[DocumentPreview] Event callback error (${event}):`, error);
                }
            });
        }
    }

    /**
     * Destroy the preview component
     */
    destroy() {
        this.container.innerHTML = '';
        this.listeners = {};
        console.log('[DocumentPreview] Destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentPreview;
}
