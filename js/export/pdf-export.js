/**
 * PDF Export Module
 * High-quality PDF generation using html2pdf.js
 * Preserves template styling and ensures ATS compatibility
 */

class PDFExporter {
    constructor() {
        this.defaultOptions = {
            margin: [10, 10, 10, 10], // top, right, bottom, left in mm
            filename: 'resume.pdf',
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.page-break-before',
                after: '.page-break-after',
                avoid: ['h2', '.resume-section-header', '.resume-item-header']
            }
        };
    }

    /**
     * Export resume to PDF
     * @param {HTMLElement} element - DOM element to export
     * @param {Object} options - Export options
     * @returns {Promise<void>}
     */
    async exportToPDF(element, options = {}) {
        try {
            // Check if html2pdf is loaded
            if (typeof html2pdf === 'undefined') {
                throw new Error('html2pdf library not loaded. Please include html2pdf.js in your HTML.');
            }

            // Merge options with defaults
            const pdfOptions = this.mergeOptions(options);

            // Clone element to avoid modifying the original
            const clonedElement = this.prepareElementForPDF(element);

            // Generate PDF
            console.log('[PDFExporter] Generating PDF...', pdfOptions);

            await html2pdf()
                .set(pdfOptions)
                .from(clonedElement)
                .save();

            console.log('[PDFExporter] PDF generated successfully');

            // Cleanup
            if (clonedElement.parentNode) {
                clonedElement.parentNode.removeChild(clonedElement);
            }

            return { success: true, message: 'PDF exported successfully' };
        } catch (error) {
            console.error('[PDFExporter] Export failed:', error);
            throw new Error(`PDF export failed: ${error.message}`);
        }
    }

    /**
     * Generate PDF blob without downloading
     * @param {HTMLElement} element - DOM element to export
     * @param {Object} options - Export options
     * @returns {Promise<Blob>}
     */
    async generatePDFBlob(element, options = {}) {
        try {
            if (typeof html2pdf === 'undefined') {
                throw new Error('html2pdf library not loaded');
            }

            const pdfOptions = this.mergeOptions(options);
            const clonedElement = this.prepareElementForPDF(element);

            const pdfBlob = await html2pdf()
                .set(pdfOptions)
                .from(clonedElement)
                .outputPdf('blob');

            // Cleanup
            if (clonedElement.parentNode) {
                clonedElement.parentNode.removeChild(clonedElement);
            }

            return pdfBlob;
        } catch (error) {
            console.error('[PDFExporter] Blob generation failed:', error);
            throw error;
        }
    }

    /**
     * Prepare element for PDF export
     * @param {HTMLElement} element - Original element
     * @returns {HTMLElement} Cloned and prepared element
     */
    prepareElementForPDF(element) {
        // Clone the element
        const clone = element.cloneNode(true);

        // Add print-ready class
        clone.classList.add('pdf-export');

        // Remove interactive elements
        const interactiveElements = clone.querySelectorAll('button, input, textarea, select, [contenteditable]');
        interactiveElements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const value = el.value;
                const span = document.createElement('span');
                span.textContent = value;
                el.replaceWith(span);
            } else {
                el.remove();
            }
        });

        // Ensure all images are loaded
        const images = clone.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                console.warn('[PDFExporter] Image not fully loaded:', img.src);
            }
        });

        // Apply inline styles for better PDF rendering
        this.applyInlineStyles(clone);

        // Add clone to document temporarily (needed for rendering)
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        document.body.appendChild(clone);

        return clone;
    }

    /**
     * Apply inline styles for PDF rendering
     * @param {HTMLElement} element - Element to style
     */
    applyInlineStyles(element) {
        // Force white background
        element.style.backgroundColor = '#ffffff';

        // Ensure text is black for ATS compatibility
        const textElements = element.querySelectorAll('p, span, li, div, h1, h2, h3, h4, h5, h6');
        textElements.forEach(el => {
            const computedColor = window.getComputedStyle(el).color;
            if (computedColor && this.isLightColor(computedColor)) {
                el.style.color = '#000000';
            }
        });

        // Ensure links are visible
        const links = element.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = '#0066cc';
            link.style.textDecoration = 'underline';
        });
    }

    /**
     * Check if color is too light for PDF
     * @param {string} color - CSS color string
     * @returns {boolean}
     */
    isLightColor(color) {
        // Simple lightness check
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return false;

        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        return brightness > 200;
    }

    /**
     * Merge user options with defaults
     * @param {Object} options - User options
     * @returns {Object} Merged options
     */
    mergeOptions(options) {
        const merged = {
            ...this.defaultOptions,
            ...options
        };

        // Handle page size
        if (options.pageSize) {
            merged.jsPDF.format = options.pageSize === 'letter' ? 'letter' : 'a4';
        }

        // Handle filename
        if (options.filename) {
            merged.filename = options.filename.endsWith('.pdf')
                ? options.filename
                : `${options.filename}.pdf`;
        }

        // Handle quality settings
        if (options.quality === 'high') {
            merged.html2canvas.scale = 3;
            merged.image.quality = 1.0;
        } else if (options.quality === 'standard') {
            merged.html2canvas.scale = 2;
            merged.image.quality = 0.95;
        }

        // Handle margins
        if (options.margins) {
            merged.margin = [
                options.margins.top || 10,
                options.margins.right || 10,
                options.margins.bottom || 10,
                options.margins.left || 10
            ];
        }

        return merged;
    }

    /**
     * Get PDF export options for preview
     * @param {string} pageSize - 'a4' or 'letter'
     * @param {string} quality - 'standard' or 'high'
     * @returns {Object} Preview options
     */
    getPreviewOptions(pageSize = 'a4', quality = 'standard') {
        return {
            pageSize,
            quality,
            filename: 'resume-preview.pdf'
        };
    }

    /**
     * Estimate PDF file size
     * @param {HTMLElement} element - Element to export
     * @returns {Promise<number>} Estimated size in bytes
     */
    async estimateFileSize(element) {
        try {
            const blob = await this.generatePDFBlob(element, {
                quality: 'standard'
            });
            return blob.size;
        } catch (error) {
            console.error('[PDFExporter] Size estimation failed:', error);
            return 0;
        }
    }

    /**
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Validate element for PDF export
     * @param {HTMLElement} element - Element to validate
     * @returns {Object} Validation result
     */
    validateElement(element) {
        const issues = [];
        const warnings = [];

        if (!element) {
            issues.push('No element provided');
            return { valid: false, issues, warnings };
        }

        // Check if element has content
        if (!element.textContent || element.textContent.trim().length === 0) {
            issues.push('Element has no text content');
        }

        // Check for very long content
        const textLength = element.textContent.length;
        if (textLength > 10000) {
            warnings.push('Document is very long, may result in large PDF file');
        }

        // Check for images
        const images = element.querySelectorAll('img');
        if (images.length > 0) {
            warnings.push(`Document contains ${images.length} image(s), which may increase file size`);
        }

        // Check for complex layouts
        const multiColumnElements = element.querySelectorAll('[style*="column"], .columns, .grid');
        if (multiColumnElements.length > 0) {
            warnings.push('Multi-column layouts detected, verify PDF output');
        }

        return {
            valid: issues.length === 0,
            issues,
            warnings,
            estimatedPages: Math.ceil(textLength / 2500)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFExporter;
}
