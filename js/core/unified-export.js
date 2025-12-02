/**
 * Unified Export Module
 * Single export point for all career documents
 * Creates professional application packages with proper naming and formats
 */

class UnifiedExport {
    constructor() {
        this.supportedFormats = ['pdf', 'docx', 'txt'];
        this.exportHistory = [];

        // Check for JSZip library
        this.zipAvailable = typeof JSZip !== 'undefined';
        if (!this.zipAvailable) {
            console.warn('[UnifiedExport] JSZip not loaded. ZIP export will not be available.');
        }

        // Reference to DocumentFactory for generation
        this.documentFactory = null;

        // Progress callbacks for export operations
        this.progressCallbacks = [];
    }

    /**
     * Set DocumentFactory reference for workflow integration
     * @param {DocumentFactory} factory - DocumentFactory instance
     */
    setDocumentFactory(factory) {
        this.documentFactory = factory;
        console.log('[UnifiedExport] DocumentFactory reference set');
    }

    /**
     * Add progress callback
     * @param {Function} callback - Progress callback function
     */
    addProgressCallback(callback) {
        this.progressCallbacks.push(callback);
    }

    /**
     * Notify progress
     * @param {Object} progress - Progress information
     * @private
     */
    _notifyProgress(progress) {
        this.progressCallbacks.forEach(callback => {
            try {
                callback(progress);
            } catch (error) {
                console.error('[UnifiedExport] Progress callback error:', error);
            }
        });
    }

    /**
     * Export complete application package with workflow integration
     * @param {Object} options - Export options
     * @returns {Promise<Object>} - Export result with download link
     */
    async exportApplicationPackage(options = {}) {
        const {
            jobTitle = 'Position',
            companyName = 'Company',
            candidateName = 'Candidate',
            documents = {
                resume: true,
                coverLetter: true,
                executiveBio: false,
                brandStatement: false,
                statusInquiry: false
            },
            formats = ['pdf', 'docx'],
            includeReadme = true,
            includeMetadata = true,
            namingConvention = 'standard', // 'standard' or 'simple'
            generateMissing = true, // Auto-generate missing documents
            workflowState = null // Workflow state for generation
        } = options;

        try {
            if (typeof logger !== 'undefined') logger.info('[UnifiedExport] Starting application package export...');

            this._notifyProgress({ stage: 'validation', message: 'Validating export options...' });

            if (!this.zipAvailable) {
                throw new Error('JSZip library not loaded. Cannot create ZIP file.');
            }

            // Validate at least one document is selected
            const selectedDocs = Object.entries(documents).filter(([_, selected]) => selected);
            if (selectedDocs.length === 0) {
                throw new Error('At least one document must be selected for export');
            }

            this._notifyProgress({ stage: 'collection', message: 'Collecting documents...', total: selectedDocs.length });

            // Generate missing documents if requested
            if (generateMissing && this.documentFactory) {
                await this._generateMissingDocuments(documents, workflowState);
            }

            // Create ZIP file
            const zip = new JSZip();
            const packageFolder = zip.folder('Application_Package');

            // Collect all documents
            const documentData = await this._collectDocuments(documents);

            // Export each document in requested formats
            let exportedCount = 0;
            const totalExports = Object.keys(documentData).filter(k => documentData[k]).length * formats.length;

            for (const [docType, data] of Object.entries(documentData)) {
                if (!data) continue;

                for (const format of formats) {
                    this._notifyProgress({
                        stage: 'export',
                        message: `Exporting ${docType} as ${format}...`,
                        current: exportedCount,
                        total: totalExports
                    });

                    const filename = this._generateFilename(docType, {
                        jobTitle,
                        companyName,
                        candidateName,
                        format,
                        namingConvention
                    });

                    const blob = await this._exportDocument(docType, data, format);
                    if (blob) {
                        packageFolder.file(filename, blob);
                        if (typeof logger !== 'undefined') logger.info(`[UnifiedExport] Added ${filename}`);
                        exportedCount++;
                    }
                }
            }

            // Add README.txt if requested
            if (includeReadme) {
                const readme = this._generateReadme({
                    jobTitle,
                    companyName,
                    candidateName,
                    documents: selectedDocs.map(([type]) => type),
                    formats,
                    generatedAt: new Date().toISOString()
                });
                packageFolder.file('README.txt', readme);
            }

            // Add metadata JSON if requested
            if (includeMetadata) {
                const metadata = this._generateMetadata({
                    jobTitle,
                    companyName,
                    candidateName,
                    documents: selectedDocs.map(([type]) => type),
                    formats,
                    generatedAt: new Date().toISOString(),
                    documentData
                });
                packageFolder.file('metadata.json', JSON.stringify(metadata, null, 2));
            }

            this._notifyProgress({ stage: 'zip', message: 'Creating ZIP file...' });

            // Generate ZIP blob
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            // Create download link
            const downloadUrl = URL.createObjectURL(zipBlob);
            const zipFilename = this._generateZipFilename(jobTitle, companyName, candidateName);

            // Record export
            this._recordExport({
                jobTitle,
                companyName,
                candidateName,
                documents: selectedDocs.map(([type]) => type),
                formats,
                zipFilename,
                timestamp: new Date().toISOString()
            });

            this._notifyProgress({ stage: 'complete', message: 'Export complete!' });

            if (typeof logger !== 'undefined') logger.info('[UnifiedExport] Application package created successfully');

            return {
                success: true,
                downloadUrl,
                filename: zipFilename,
                blob: zipBlob,
                metadata: {
                    documentsIncluded: selectedDocs.length,
                    formatsPerDocument: formats.length,
                    totalFiles: selectedDocs.length * formats.length + (includeReadme ? 1 : 0) + (includeMetadata ? 1 : 0),
                    fileSize: this._formatFileSize(zipBlob.size),
                    generatedDocuments: generateMissing ? selectedDocs.map(([type]) => type) : []
                }
            };
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[UnifiedExport] Package export failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export single document in specified format
     * @param {string} documentType - Type of document (resume, coverLetter, etc.)
     * @param {Object} data - Document data
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} - Document blob
     */
    async exportSingleDocument(documentType, data, format = 'pdf', options = {}) {
        try {
            if (typeof logger !== 'undefined') logger.info(`[UnifiedExport] Exporting ${documentType} as ${format}...`);

            const blob = await this._exportDocument(documentType, data, format, options);

            if (!blob) {
                throw new Error(`Failed to generate ${format} for ${documentType}`);
            }

            const filename = this._generateFilename(documentType, {
                ...options,
                format
            });

            // Auto-download if requested
            if (options.autoDownload !== false) {
                this._downloadBlob(blob, filename);
            }

            return {
                success: true,
                blob,
                filename,
                fileSize: this._formatFileSize(blob.size)
            };
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error(`[UnifiedExport] Single export failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get supported export formats for a document type
     * @param {string} documentType - Type of document
     * @returns {Array<string>} - Supported formats
     */
    getExportFormats(documentType) {
        const formatsByType = {
            resume: ['pdf', 'docx'],
            coverLetter: ['pdf', 'docx', 'txt'],
            executiveBio: ['pdf', 'txt'],
            brandStatement: ['pdf', 'txt'],
            statusInquiry: ['pdf', 'txt']
        };

        return formatsByType[documentType] || ['pdf', 'txt'];
    }

    /**
     * Generate missing documents using DocumentFactory
     * @param {Object} documentSelection - Selected documents
     * @param {Object} workflowState - Workflow state
     * @returns {Promise<void>}
     * @private
     */
    async _generateMissingDocuments(documentSelection, workflowState) {
        if (!this.documentFactory) {
            console.warn('[UnifiedExport] DocumentFactory not available, skipping generation');
            return;
        }

        try {
            console.log('[UnifiedExport] Checking for missing documents...');

            // Update factory with workflow state
            if (workflowState) {
                this.documentFactory.updateWorkflowState(workflowState);
            }

            const documentsToGenerate = [];

            for (const [type, selected] of Object.entries(documentSelection)) {
                if (selected && !this.documentFactory.getCached(type)) {
                    documentsToGenerate.push(type);
                }
            }

            if (documentsToGenerate.length === 0) {
                console.log('[UnifiedExport] All selected documents already generated');
                return;
            }

            console.log('[UnifiedExport] Generating missing documents:', documentsToGenerate);

            // Generate only the missing documents
            const generateOptions = Object.keys(documentSelection).reduce((acc, key) => {
                acc[key] = documentsToGenerate.includes(key);
                return acc;
            }, {});

            this._notifyProgress({
                stage: 'generation',
                message: `Generating ${documentsToGenerate.length} missing document(s)...`,
                total: documentsToGenerate.length
            });

            const result = await this.documentFactory.generateAll(
                (progress) => {
                    this._notifyProgress({
                        stage: 'generation',
                        message: `Generating ${progress.documentType}...`,
                        current: progress.current,
                        total: progress.total
                    });
                },
                {
                    documents: generateOptions,
                    forceRegenerate: false,
                    parallel: true
                }
            );

            if (!result.success) {
                console.warn('[UnifiedExport] Some documents failed to generate:', result.metadata);
            } else {
                console.log('[UnifiedExport] All missing documents generated successfully');
            }
        } catch (error) {
            console.error('[UnifiedExport] Failed to generate missing documents:', error);
            throw new Error(`Document generation failed: ${error.message}`);
        }
    }

    /**
     * Collect all document data from application state
     * @param {Object} documentSelection - Selected documents
     * @returns {Promise<Object>} - Document data
     * @private
     */
    async _collectDocuments(documentSelection) {
        const documentData = {};

        // Resume
        if (documentSelection.resume) {
            documentData.resume = this._getResumeData();
        }

        // Cover Letter
        if (documentSelection.coverLetter) {
            documentData.coverLetter = this._getCoverLetterData();
        }

        // Executive Bio
        if (documentSelection.executiveBio) {
            documentData.executiveBio = this._getExecutiveBioData();
        }

        // Brand Statement
        if (documentSelection.brandStatement) {
            documentData.brandStatement = this._getBrandStatementData();
        }

        // Status Inquiry
        if (documentSelection.statusInquiry) {
            documentData.statusInquiry = this._getStatusInquiryData();
        }

        return documentData;
    }

    /**
     * Get resume data from state or DocumentFactory
     * @returns {Object|null} - Resume data
     * @private
     */
    _getResumeData() {
        // Try DocumentFactory first
        if (this.documentFactory) {
            const cached = this.documentFactory.getCached('resume');
            if (cached) return cached;
        }

        // Try to get from resumeState or localStorage
        if (typeof resumeState !== 'undefined' && resumeState) {
            return resumeState;
        }

        try {
            const saved = localStorage.getItem('resume_state');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.warn('[UnifiedExport] Could not load resume data');
        }

        return null;
    }

    /**
     * Get cover letter data from state or DocumentFactory
     * @returns {Object|null} - Cover letter data
     * @private
     */
    _getCoverLetterData() {
        // Try DocumentFactory first
        if (this.documentFactory) {
            const cached = this.documentFactory.getCached('coverLetter');
            if (cached) return cached;
        }

        try {
            const saved = localStorage.getItem('current_cover_letter');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.warn('[UnifiedExport] Could not load cover letter data');
        }

        return null;
    }

    /**
     * Get executive bio data from state or DocumentFactory
     * @returns {Object|null} - Executive bio data
     * @private
     */
    _getExecutiveBioData() {
        // Try DocumentFactory first
        if (this.documentFactory) {
            const cached = this.documentFactory.getCached('executiveBio');
            if (cached) return cached;
        }

        try {
            const saved = localStorage.getItem('executive_bio');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.warn('[UnifiedExport] Could not load executive bio data');
        }

        return null;
    }

    /**
     * Get brand statement data from state or DocumentFactory
     * @returns {Object|null} - Brand statement data
     * @private
     */
    _getBrandStatementData() {
        // Try DocumentFactory first
        if (this.documentFactory) {
            const cached = this.documentFactory.getCached('brandStatement');
            if (cached) return cached;
        }

        try {
            const saved = localStorage.getItem('brand_statement');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.warn('[UnifiedExport] Could not load brand statement data');
        }

        return null;
    }

    /**
     * Get status inquiry data from state or DocumentFactory
     * @returns {Object|null} - Status inquiry data
     * @private
     */
    _getStatusInquiryData() {
        // Try DocumentFactory first
        if (this.documentFactory) {
            const cached = this.documentFactory.getCached('statusInquiry');
            if (cached) return cached;
        }

        try {
            const saved = localStorage.getItem('status_inquiry');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.warn('[UnifiedExport] Could not load status inquiry data');
        }

        return null;
    }

    /**
     * Export document to specified format
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} - Document blob
     * @private
     */
    async _exportDocument(documentType, data, format, options = {}) {
        if (!data) {
            if (typeof logger !== 'undefined') logger.warn(`[UnifiedExport] No data for ${documentType}`);
            return null;
        }

        try {
            // Route to appropriate exporter based on document type and format
            if (format === 'pdf') {
                return await this._exportToPDF(documentType, data, options);
            } else if (format === 'docx') {
                return await this._exportToDOCX(documentType, data, options);
            } else if (format === 'txt') {
                return this._exportToTXT(documentType, data, options);
            }

            throw new Error(`Unsupported format: ${format}`);
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error(`[UnifiedExport] Export to ${format} failed:`, error);
            return null;
        }
    }

    /**
     * Export document to PDF
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} - PDF blob
     * @private
     */
    async _exportToPDF(documentType, data, options) {
        // Check if PDF exporter is available
        if (typeof PDFExporter === 'undefined' || typeof pdfExporter === 'undefined') {
            throw new Error('PDF exporter not loaded');
        }

        // Create DOM element from data
        const element = this._createDOMElement(documentType, data);

        // Generate PDF blob
        const blob = await pdfExporter.generatePDFBlob(element, {
            filename: 'temp.pdf',
            pageSize: options.pageSize || 'a4',
            quality: options.quality || 'high'
        });

        // Cleanup
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }

        return blob;
    }

    /**
     * Export document to DOCX
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} - DOCX blob
     * @private
     */
    async _exportToDOCX(documentType, data, options) {
        // Check if DOCX exporter is available
        if (typeof DOCXExporter === 'undefined' || typeof docxExporter === 'undefined') {
            throw new Error('DOCX exporter not loaded');
        }

        // For resume, use existing DOCX export
        if (documentType === 'resume') {
            const docxExporter = new DOCXExporter();
            return await docxExporter.exportToDOCX(data, options);
        }

        // For other documents, create simplified DOCX
        return await this._createSimpleDOCX(documentType, data, options);
    }

    /**
     * Export document to TXT
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @param {Object} options - Export options
     * @returns {Blob} - TXT blob
     * @private
     */
    _exportToTXT(documentType, data, options) {
        const text = this._extractText(documentType, data);
        return new Blob([text], { type: 'text/plain;charset=utf-8' });
    }

    /**
     * Create DOM element from document data
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @returns {HTMLElement} - DOM element
     * @private
     */
    _createDOMElement(documentType, data) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '800px';
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '40px';
        container.style.fontFamily = 'Arial, sans-serif';

        // Generate HTML based on document type
        if (documentType === 'resume') {
            container.innerHTML = this._generateResumeHTML(data);
        } else if (documentType === 'coverLetter') {
            container.innerHTML = this._generateCoverLetterHTML(data);
        } else {
            container.innerHTML = this._generateGenericDocumentHTML(documentType, data);
        }

        document.body.appendChild(container);
        return container;
    }

    /**
     * Generate resume HTML
     * @param {Object} data - Resume data
     * @returns {string} - HTML string
     * @private
     */
    _generateResumeHTML(data) {
        // Use template engine if available
        if (typeof templateEngine !== 'undefined') {
            return templateEngine.render(data.template || 'modern', data);
        }

        // Fallback: simple HTML generation
        return `<div>${JSON.stringify(data, null, 2)}</div>`;
    }

    /**
     * Generate cover letter HTML
     * @param {Object} data - Cover letter data
     * @returns {string} - HTML string
     * @private
     */
    _generateCoverLetterHTML(data) {
        return `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                ${data.content || data.text || JSON.stringify(data)}
            </div>
        `;
    }

    /**
     * Generate generic document HTML
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @returns {string} - HTML string
     * @private
     */
    _generateGenericDocumentHTML(documentType, data) {
        const title = documentType.replace(/([A-Z])/g, ' $1').trim();
        return `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1>${title}</h1>
                <div>${data.content || data.text || JSON.stringify(data, null, 2)}</div>
            </div>
        `;
    }

    /**
     * Create simple DOCX for non-resume documents
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} - DOCX blob
     * @private
     */
    async _createSimpleDOCX(documentType, data, options) {
        if (typeof docx === 'undefined') {
            throw new Error('docx library not loaded');
        }

        const { Document, Packer, Paragraph, TextRun } = docx;

        const text = this._extractText(documentType, data);
        const lines = text.split('\n');

        const paragraphs = lines.map(line =>
            new Paragraph({
                children: [new TextRun(line)]
            })
        );

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });

        return await Packer.toBlob(doc);
    }

    /**
     * Extract text from document data
     * @param {string} documentType - Document type
     * @param {Object} data - Document data
     * @returns {string} - Extracted text
     * @private
     */
    _extractText(documentType, data) {
        if (typeof data === 'string') return data;
        if (data.content) return data.content;
        if (data.text) return data.text;

        // Extract from sections
        if (data.sections && Array.isArray(data.sections)) {
            return data.sections.map(section => {
                let text = `${section.name || ''}\n`;
                if (section.content) {
                    if (typeof section.content === 'string') {
                        text += section.content;
                    } else if (section.content.text) {
                        text += section.content.text;
                    } else {
                        text += JSON.stringify(section.content, null, 2);
                    }
                }
                return text;
            }).join('\n\n');
        }

        return JSON.stringify(data, null, 2);
    }

    /**
     * Generate filename based on naming convention
     * @param {string} documentType - Document type
     * @param {Object} options - Naming options
     * @returns {string} - Filename
     * @private
     */
    _generateFilename(documentType, options) {
        const {
            jobTitle = 'Position',
            companyName = 'Company',
            candidateName = 'Candidate',
            format = 'pdf',
            namingConvention = 'standard'
        } = options;

        // Sanitize strings for filenames
        const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');

        const docTypeMap = {
            resume: 'Resume',
            coverLetter: 'CoverLetter',
            executiveBio: 'ExecutiveBio',
            brandStatement: 'BrandStatement',
            statusInquiry: 'StatusInquiry'
        };

        const docName = docTypeMap[documentType] || documentType;

        if (namingConvention === 'simple') {
            return `${sanitize(candidateName)}_${docName}.${format}`;
        }

        // Standard: [JobTitle]_[Company]_[DocumentType]_[YourName].format
        return `${sanitize(jobTitle)}_${sanitize(companyName)}_${docName}_${sanitize(candidateName)}.${format}`;
    }

    /**
     * Generate ZIP filename
     * @param {string} jobTitle - Job title
     * @param {string} companyName - Company name
     * @param {string} candidateName - Candidate name
     * @returns {string} - ZIP filename
     * @private
     */
    _generateZipFilename(jobTitle, companyName, candidateName) {
        const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
        const date = new Date().toISOString().split('T')[0];
        return `${sanitize(jobTitle)}_${sanitize(companyName)}_ApplicationPackage_${sanitize(candidateName)}_${date}.zip`;
    }

    /**
     * Generate README.txt content
     * @param {Object} info - Package information
     * @returns {string} - README content
     * @private
     */
    _generateReadme(info) {
        const { jobTitle, companyName, candidateName, documents, formats, generatedAt } = info;

        return `APPLICATION PACKAGE README
${'='.repeat(80)}

Candidate: ${candidateName}
Position: ${jobTitle}
Company: ${companyName}
Generated: ${new Date(generatedAt).toLocaleString()}

CONTENTS
--------
This package contains the following documents:

${documents.map(doc => {
    const docName = doc.replace(/([A-Z])/g, ' $1').trim();
    const fileFormats = formats.join(', ').toUpperCase();
    return `- ${docName} (${fileFormats})`;
}).join('\n')}

DOCUMENT DESCRIPTIONS
--------------------
- Resume: Complete professional resume highlighting relevant experience and skills
- Cover Letter: Customized cover letter for this specific position
- Executive Bio: Professional biography suitable for company websites and materials
- Brand Statement: Personal brand statement and professional identity
- Status Inquiry: Follow-up letter template for application status

FILE NAMING CONVENTION
----------------------
Files are named using the format:
[JobTitle]_[Company]_[DocumentType]_[YourName].[format]

This ensures easy organization and identification of application materials.

METADATA
--------
A metadata.json file is included with complete application information
and document generation details for your records.

${'='.repeat(80)}
Generated by ResuMate - Professional Career Documents Platform
https://github.com/yourusername/ResuMate
`;
    }

    /**
     * Generate metadata JSON
     * @param {Object} info - Package information
     * @returns {Object} - Metadata object
     * @private
     */
    _generateMetadata(info) {
        return {
            packageInfo: {
                candidateName: info.candidateName,
                jobTitle: info.jobTitle,
                companyName: info.companyName,
                generatedAt: info.generatedAt,
                generatedBy: 'ResuMate v1.0'
            },
            documents: info.documents.map(doc => ({
                type: doc,
                formats: info.formats,
                status: 'included'
            })),
            exportSettings: {
                formats: info.formats,
                includeReadme: true,
                includeMetadata: true
            },
            systemInfo: {
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Download blob as file
     * @param {Blob} blob - File blob
     * @param {string} filename - Filename
     * @private
     */
    _downloadBlob(blob, filename) {
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
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} - Formatted size
     * @private
     */
    _formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Record export to history
     * @param {Object} exportInfo - Export information
     * @private
     */
    _recordExport(exportInfo) {
        this.exportHistory.push({
            ...exportInfo,
            id: 'export_' + Date.now()
        });

        // Keep only last 20 exports
        if (this.exportHistory.length > 20) {
            this.exportHistory = this.exportHistory.slice(-20);
        }

        try {
            localStorage.setItem('export_history', JSON.stringify(this.exportHistory));
        } catch (error) {
            if (typeof logger !== 'undefined') logger.warn('[UnifiedExport] Could not save export history');
        }
    }

    /**
     * Get export history
     * @returns {Array} - Export history
     */
    getExportHistory() {
        return this.exportHistory;
    }

    /**
     * Clear export history
     */
    clearExportHistory() {
        this.exportHistory = [];
        localStorage.removeItem('export_history');
    }
}

// Create global instance
const unifiedExport = new UnifiedExport();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnifiedExport, unifiedExport };
}
