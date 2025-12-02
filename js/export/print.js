/**
 * Print Optimization Module
 * Handles print preview, page breaks, and print-ready formatting
 */

class PrintManager {
    constructor() {
        this.printPreviewMode = false;
        this.originalStyles = null;
        this.pageSize = 'a4'; // 'a4' or 'letter'
        this.printStylesheet = null;
    }

    /**
     * Initialize print manager
     */
    initialize() {
        this.injectPrintStyles();
        this.setupPrintListeners();
        console.log('[PrintManager] Initialized');
    }

    /**
     * Inject print-specific styles
     */
    injectPrintStyles() {
        if (this.printStylesheet) {
            return; // Already injected
        }

        const style = document.createElement('style');
        style.id = 'resumate-print-styles';
        style.textContent = this.getPrintCSS();
        document.head.appendChild(style);
        this.printStylesheet = style;
    }

    /**
     * Get print CSS
     * @returns {string} Print CSS
     */
    getPrintCSS() {
        return `
            /* Print Optimization Styles */
            @media print {
                /* Reset page margins */
                @page {
                    margin: 0.5in;
                    size: ${this.pageSize === 'letter' ? 'letter' : 'A4'};
                }

                /* Hide non-printable elements */
                header,
                footer,
                nav,
                .no-print,
                .preview-toolbar,
                .preview-controls,
                .editor-panel,
                .preview-resizer,
                button,
                input,
                textarea,
                select {
                    display: none !important;
                }

                /* Show only preview content */
                body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                }

                .preview-panel,
                .resume-document {
                    width: 100%;
                    max-width: none;
                    margin: 0;
                    padding: 0;
                    box-shadow: none;
                    border: none;
                }

                /* Page break control */
                .resume-section {
                    page-break-inside: avoid;
                    orphans: 3;
                    widows: 3;
                }

                .resume-item {
                    page-break-inside: avoid;
                }

                h1, h2, h3 {
                    page-break-after: avoid;
                    orphans: 3;
                    widows: 3;
                }

                .page-break-before {
                    page-break-before: always;
                }

                .page-break-after {
                    page-break-after: always;
                }

                .page-break-avoid {
                    page-break-inside: avoid;
                }

                /* Remove page numbers from preview */
                .page-number {
                    display: none;
                }

                /* Ensure proper colors for print */
                * {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    color-adjust: exact;
                }

                /* Links */
                a {
                    text-decoration: underline;
                    color: #000;
                }

                a[href]:after {
                    content: none; /* Don't show URLs */
                }

                /* Ensure black text for ATS compatibility */
                body,
                p,
                li,
                div,
                span {
                    color: #000 !important;
                }

                /* Maintain backgrounds for design elements */
                .skill-tag,
                .resume-header {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }

            /* Print Preview Mode Styles */
            .print-preview-mode {
                background: #f5f5f5;
            }

            .print-preview-mode .resume-document {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                margin: 2rem auto;
                background: #fff;
            }

            .print-preview-mode .preview-toolbar {
                background: #333;
                color: #fff;
                padding: 0.5rem 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .print-preview-mode .preview-toolbar button {
                background: #fff;
                color: #333;
                border: none;
                padding: 0.5rem 1rem;
                cursor: pointer;
                border-radius: 4px;
                font-size: 0.9rem;
            }

            .print-preview-mode .preview-toolbar button:hover {
                background: #f0f0f0;
            }
        `;
    }

    /**
     * Setup print event listeners
     */
    setupPrintListeners() {
        // Before print event
        window.addEventListener('beforeprint', () => {
            console.log('[PrintManager] Preparing for print...');
            this.beforePrint();
        });

        // After print event
        window.addEventListener('afterprint', () => {
            console.log('[PrintManager] Print completed');
            this.afterPrint();
        });

        // Keyboard shortcut for print (Ctrl+P / Cmd+P is handled by browser)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.print();
            }
        });
    }

    /**
     * Before print handler
     */
    beforePrint() {
        // Store original page title
        this.originalTitle = document.title;

        // Set print-friendly title
        const resumeData = this.getResumeData();
        if (resumeData && resumeData.sections) {
            const headerSection = resumeData.sections.find(s => s.type === 'header');
            if (headerSection && headerSection.content.name) {
                document.title = `${headerSection.content.name} - Resume`;
            }
        }

        // Apply page size
        this.applyPageSize();

        // Optimize page breaks
        this.optimizePageBreaks();
    }

    /**
     * After print handler
     */
    afterPrint() {
        // Restore original title
        if (this.originalTitle) {
            document.title = this.originalTitle;
        }
    }

    /**
     * Apply page size settings
     */
    applyPageSize() {
        // Update @page size in stylesheet
        if (this.printStylesheet) {
            const newCSS = this.getPrintCSS();
            this.printStylesheet.textContent = newCSS;
        }
    }

    /**
     * Optimize page breaks
     */
    optimizePageBreaks() {
        const container = document.querySelector('.resume-document');
        if (!container) return;

        const pageHeight = this.getPageHeight();
        let currentHeight = 0;

        // Find sections that might cause bad breaks
        const sections = container.querySelectorAll('.resume-section');
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;

            // If section would overflow page, add page break before
            if (currentHeight > 0 && currentHeight + sectionHeight > pageHeight) {
                section.classList.add('page-break-before');
                currentHeight = sectionHeight;
            } else {
                section.classList.remove('page-break-before');
                currentHeight += sectionHeight;
            }

            // Reset at page boundaries
            if (currentHeight >= pageHeight) {
                currentHeight = currentHeight - pageHeight;
            }
        });
    }

    /**
     * Get page height in pixels
     * @returns {number} Page height
     */
    getPageHeight() {
        // Approximate heights at 96 DPI
        const heights = {
            a4: 1122,      // 11.69 inches
            letter: 1056   // 11 inches
        };

        return heights[this.pageSize] || heights.a4;
    }

    /**
     * Set page size
     * @param {string} size - 'a4' or 'letter'
     */
    setPageSize(size) {
        if (size !== 'a4' && size !== 'letter') {
            console.warn('[PrintManager] Invalid page size:', size);
            return;
        }

        this.pageSize = size;
        this.applyPageSize();
        console.log('[PrintManager] Page size set to:', size);
    }

    /**
     * Enable print preview mode
     */
    enablePrintPreview() {
        if (this.printPreviewMode) return;

        this.printPreviewMode = true;
        document.body.classList.add('print-preview-mode');

        // Hide editor, show only preview
        const editorPanel = document.querySelector('.editor-panel');
        const previewPanel = document.querySelector('.preview-panel');

        if (editorPanel) {
            this.originalStyles = {
                editorDisplay: editorPanel.style.display,
                previewWidth: previewPanel ? previewPanel.style.width : null
            };
            editorPanel.style.display = 'none';
        }

        if (previewPanel) {
            previewPanel.style.width = '100%';
        }

        // Optimize page breaks
        this.optimizePageBreaks();

        console.log('[PrintManager] Print preview enabled');
    }

    /**
     * Disable print preview mode
     */
    disablePrintPreview() {
        if (!this.printPreviewMode) return;

        this.printPreviewMode = false;
        document.body.classList.remove('print-preview-mode');

        // Restore original layout
        const editorPanel = document.querySelector('.editor-panel');
        const previewPanel = document.querySelector('.preview-panel');

        if (editorPanel && this.originalStyles) {
            editorPanel.style.display = this.originalStyles.editorDisplay || '';
        }

        if (previewPanel && this.originalStyles) {
            previewPanel.style.width = this.originalStyles.previewWidth || '';
        }

        this.originalStyles = null;

        console.log('[PrintManager] Print preview disabled');
    }

    /**
     * Toggle print preview mode
     */
    togglePrintPreview() {
        if (this.printPreviewMode) {
            this.disablePrintPreview();
        } else {
            this.enablePrintPreview();
        }
    }

    /**
     * Trigger print dialog
     */
    print() {
        // Optimize before printing
        this.beforePrint();

        // Trigger browser print dialog
        window.print();
    }

    /**
     * Get resume data from state
     * @returns {Object|null} Resume state
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
     * Calculate page count
     * @param {HTMLElement} container - Container element
     * @returns {number} Number of pages
     */
    calculatePageCount(container) {
        if (!container) {
            container = document.querySelector('.resume-document');
        }

        if (!container) return 0;

        const pageHeight = this.getPageHeight();
        const contentHeight = container.scrollHeight;

        return Math.ceil(contentHeight / pageHeight);
    }

    /**
     * Get print statistics
     * @returns {Object} Print statistics
     */
    getStats() {
        const container = document.querySelector('.resume-document');
        const pageCount = this.calculatePageCount(container);

        return {
            pageCount,
            pageSize: this.pageSize,
            previewMode: this.printPreviewMode,
            contentHeight: container ? container.scrollHeight : 0,
            pageHeight: this.getPageHeight()
        };
    }

    /**
     * Validate print readiness
     * @returns {Object} Validation result
     */
    validatePrintReady() {
        const issues = [];
        const warnings = [];

        const container = document.querySelector('.resume-document');
        if (!container) {
            issues.push('No resume content found');
            return { ready: false, issues, warnings };
        }

        // Check page count
        const pageCount = this.calculatePageCount(container);
        if (pageCount === 0) {
            issues.push('Resume appears to be empty');
        } else if (pageCount > 3) {
            warnings.push(`Resume is ${pageCount} pages long - consider condensing`);
        }

        // Check for images
        const images = container.querySelectorAll('img');
        if (images.length > 0) {
            warnings.push('Resume contains images - verify they print correctly');
        }

        // Check for complex layouts
        const multiCol = container.querySelectorAll('[style*="column"]');
        if (multiCol.length > 0) {
            warnings.push('Multi-column layouts may not print correctly in all browsers');
        }

        return {
            ready: issues.length === 0,
            issues,
            warnings,
            pageCount
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrintManager;
}
