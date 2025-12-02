/**
 * Workflow Step 5: Export
 * Unified export for all 5 career documents with preview and ZIP download
 */

class StepExport {
    constructor(workflowEngine) {
        this.workflowEngine = workflowEngine;
        this.state = {
            exporting: false,
            exportComplete: false,
            selectedDocuments: {
                resume: true,
                coverLetter: true,
                executiveBio: false,
                brandStatement: false,
                statusInquiry: false
            },
            selectedFormats: ['pdf', 'docx'],
            exportResults: null,
            previewData: {},
            error: null
        };

        console.log('[StepExport] Initialized');
    }

    /**
     * Initialize the export step
     */
    async initialize() {
        console.log('[StepExport] Initializing...');

        // Check if we have optimized resume from previous step
        const optimizeState = this.workflowEngine.getState('optimize');
        if (!optimizeState || !optimizeState.completed) {
            console.warn('[StepExport] Optimize step not completed');
            return {
                success: false,
                error: 'Optimization must be completed first'
            };
        }

        // Prepare preview data for all documents
        await this.preparePreviewData();

        return {
            success: true,
            documentsAvailable: Object.keys(this.state.previewData).length
        };
    }

    /**
     * Prepare preview data for all documents
     */
    async preparePreviewData() {
        console.log('[StepExport] Preparing preview data...');

        const uploadState = this.workflowEngine.getState('upload');
        const analyzeState = this.workflowEngine.getState('analyze');
        const tailorState = this.workflowEngine.getState('tailor');

        // Resume preview
        if (uploadState?.resumeText) {
            this.state.previewData.resume = {
                title: 'Updated Resume',
                content: uploadState.resumeText,
                length: uploadState.resumeText.length,
                available: true
            };
        }

        // Cover letter preview (generate if not exists)
        if (window.dataBridge) {
            const coverLetter = window.dataBridge.getDocument('coverLetter');
            if (coverLetter) {
                this.state.previewData.coverLetter = {
                    title: 'Cover Letter',
                    content: coverLetter.content || coverLetter.text,
                    length: (coverLetter.content || coverLetter.text || '').length,
                    available: true
                };
            } else {
                // Generate placeholder
                this.state.previewData.coverLetter = {
                    title: 'Cover Letter',
                    content: this.generateCoverLetterPlaceholder(uploadState, analyzeState),
                    length: 500,
                    available: false,
                    needsGeneration: true
                };
            }
        }

        // Executive bio preview
        const executiveBio = window.dataBridge?.getDocument('executiveBio');
        if (executiveBio) {
            this.state.previewData.executiveBio = {
                title: 'Executive Bio',
                content: executiveBio.content || executiveBio.text,
                length: (executiveBio.content || executiveBio.text || '').length,
                available: true
            };
        } else {
            this.state.previewData.executiveBio = {
                title: 'Executive Bio',
                content: 'Executive bio will be generated during export...',
                available: false,
                needsGeneration: true
            };
        }

        // Brand statement preview
        const brandStatement = window.dataBridge?.getDocument('brandStatement');
        if (brandStatement) {
            this.state.previewData.brandStatement = {
                title: 'Brand Statement',
                content: brandStatement.content || brandStatement.text,
                length: (brandStatement.content || brandStatement.text || '').length,
                available: true
            };
        } else {
            this.state.previewData.brandStatement = {
                title: 'Brand Statement',
                content: 'Brand statement will be generated during export...',
                available: false,
                needsGeneration: true
            };
        }

        // Status inquiry preview
        const statusInquiry = window.dataBridge?.getDocument('statusInquiry');
        if (statusInquiry) {
            this.state.previewData.statusInquiry = {
                title: 'Status Inquiry Letter',
                content: statusInquiry.content || statusInquiry.text,
                length: (statusInquiry.content || statusInquiry.text || '').length,
                available: true
            };
        } else {
            this.state.previewData.statusInquiry = {
                title: 'Status Inquiry Letter',
                content: 'Status inquiry letter will be generated during export...',
                available: false,
                needsGeneration: true
            };
        }

        console.log('[StepExport] Preview data prepared:', {
            available: Object.values(this.state.previewData).filter(d => d.available).length,
            needsGeneration: Object.values(this.state.previewData).filter(d => d.needsGeneration).length
        });
    }

    /**
     * Generate cover letter placeholder
     */
    generateCoverLetterPlaceholder(uploadState, analyzeState) {
        const jobData = uploadState?.jobText || '';
        const companyMatch = jobData.match(/company[:\s]+([^\n]+)/i);
        const positionMatch = jobData.match(/position[:\s]+([^\n]+)/i) || jobData.match(/^([^\n]+)/);

        const company = companyMatch ? companyMatch[1].trim() : 'Your Company';
        const position = positionMatch ? positionMatch[1].trim() : 'the position';

        return `Dear Hiring Manager,

I am writing to express my strong interest in ${position} at ${company}. Based on the analysis of my qualifications, I am an excellent match for this role with a ${analyzeState?.matchScore || 75}% compatibility score.

[Your cover letter will be generated with personalized content matching the job requirements]

Best regards,
[Your Name]`;
    }

    /**
     * Toggle document selection
     */
    toggleDocument(documentType) {
        if (!this.state.selectedDocuments.hasOwnProperty(documentType)) {
            console.warn('[StepExport] Invalid document type:', documentType);
            return {
                success: false,
                error: 'Invalid document type'
            };
        }

        this.state.selectedDocuments[documentType] = !this.state.selectedDocuments[documentType];

        // Update workflow state
        this.workflowEngine.updateState('export.selectedDocuments', this.state.selectedDocuments);

        console.log('[StepExport] Toggled document:', documentType, this.state.selectedDocuments[documentType]);
        return {
            success: true,
            documentType: documentType,
            selected: this.state.selectedDocuments[documentType]
        };
    }

    /**
     * Set selected formats
     */
    setFormats(formats) {
        if (!Array.isArray(formats) || formats.length === 0) {
            console.warn('[StepExport] Invalid formats:', formats);
            return {
                success: false,
                error: 'At least one format must be selected'
            };
        }

        this.state.selectedFormats = formats;

        // Update workflow state
        this.workflowEngine.updateState('export.selectedFormats', formats);

        console.log('[StepExport] Formats set:', formats);
        return {
            success: true,
            formats: formats
        };
    }

    /**
     * Export selected documents as ZIP package
     */
    async exportPackage() {
        console.log('[StepExport] Exporting package...');

        // Validate selections
        const selectedDocs = Object.entries(this.state.selectedDocuments)
            .filter(([_, selected]) => selected);

        if (selectedDocs.length === 0) {
            const error = 'Please select at least one document to export';
            this.state.error = error;
            return {
                success: false,
                error: error
            };
        }

        try {
            this.state.exporting = true;
            this.workflowEngine.updateState('export.exporting', true);

            // Get job and candidate information
            const uploadState = this.workflowEngine.getState('upload');
            const jobData = this.extractJobInfo(uploadState?.jobText || '');
            const candidateName = this.extractCandidateName(uploadState?.resumeText || '');

            // Check if unified export is available
            if (typeof unifiedExport !== 'undefined') {
                const result = await unifiedExport.exportApplicationPackage({
                    jobTitle: jobData.title,
                    companyName: jobData.company,
                    candidateName: candidateName,
                    documents: this.state.selectedDocuments,
                    formats: this.state.selectedFormats,
                    includeReadme: true,
                    includeMetadata: true,
                    namingConvention: 'standard'
                });

                if (result.success) {
                    this.state.exportResults = result;
                    this.state.exportComplete = true;

                    // Trigger download
                    const link = document.createElement('a');
                    link.href = result.downloadUrl;
                    link.download = result.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Update workflow state
                    this.workflowEngine.updateState('export.exportComplete', true);

                    console.log('[StepExport] Package exported successfully:', {
                        filename: result.filename,
                        fileSize: result.metadata.fileSize,
                        totalFiles: result.metadata.totalFiles
                    });

                    return result;
                } else {
                    throw new Error(result.error || 'Export failed');
                }
            } else {
                // Fallback: simple export
                return await this.exportSimple(selectedDocs);
            }
        } catch (error) {
            console.error('[StepExport] Export error:', error);
            this.state.error = error.message;
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.state.exporting = false;
            this.workflowEngine.updateState('export.exporting', false);
        }
    }

    /**
     * Export single document
     */
    async exportSingleDocument(documentType, format = 'pdf') {
        console.log('[StepExport] Exporting single document:', documentType, format);

        if (!this.state.previewData[documentType]) {
            const error = `Document ${documentType} not available`;
            return {
                success: false,
                error: error
            };
        }

        try {
            const uploadState = this.workflowEngine.getState('upload');
            const jobData = this.extractJobInfo(uploadState?.jobText || '');
            const candidateName = this.extractCandidateName(uploadState?.resumeText || '');

            // Prepare document data
            const documentData = this.state.previewData[documentType];

            // Check if unified export is available
            if (typeof unifiedExport !== 'undefined') {
                const result = await unifiedExport.exportSingleDocument(
                    documentType,
                    { content: documentData.content },
                    format,
                    {
                        jobTitle: jobData.title,
                        companyName: jobData.company,
                        candidateName: candidateName,
                        autoDownload: true
                    }
                );

                console.log('[StepExport] Single document exported:', result);
                return result;
            } else {
                // Fallback: download as text
                return this.downloadAsText(documentType, documentData.content, candidateName);
            }
        } catch (error) {
            console.error('[StepExport] Single export error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simple fallback export
     */
    async exportSimple(selectedDocs) {
        console.log('[StepExport] Using simple export fallback');

        // Create text bundle
        let bundle = '='.repeat(80) + '\n';
        bundle += 'RESUMATE APPLICATION PACKAGE\n';
        bundle += '='.repeat(80) + '\n\n';

        for (const [docType, _] of selectedDocs) {
            const preview = this.state.previewData[docType];
            if (preview) {
                bundle += `\n${'='.repeat(80)}\n`;
                bundle += `${preview.title.toUpperCase()}\n`;
                bundle += `${'='.repeat(80)}\n\n`;
                bundle += preview.content + '\n\n';
            }
        }

        // Download as text file
        const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ResuMate_Application_Package.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.state.exportComplete = true;

        return {
            success: true,
            filename: 'ResuMate_Application_Package.txt',
            documentsIncluded: selectedDocs.length
        };
    }

    /**
     * Download content as text file
     */
    downloadAsText(documentType, content, candidateName) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${candidateName}_${documentType}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
            success: true,
            filename: `${candidateName}_${documentType}.txt`
        };
    }

    /**
     * Extract job information from job text
     */
    extractJobInfo(jobText) {
        const titleMatch = jobText.match(/(?:position|title|role)[:\s]+([^\n]+)/i) ||
                          jobText.match(/^([^\n]+)/);
        const companyMatch = jobText.match(/(?:company|organization)[:\s]+([^\n]+)/i);

        return {
            title: titleMatch ? titleMatch[1].trim() : 'Position',
            company: companyMatch ? companyMatch[1].trim() : 'Company'
        };
    }

    /**
     * Extract candidate name from resume text
     */
    extractCandidateName(resumeText) {
        // Look for name in first few lines
        const lines = resumeText.split('\n').slice(0, 5);
        for (const line of lines) {
            // Simple heuristic: first line that looks like a name (2-4 words, capitalized)
            const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
            if (nameMatch) {
                return nameMatch[1];
            }
        }
        return 'Candidate';
    }

    /**
     * Get preview for a document
     */
    getPreview(documentType) {
        return this.state.previewData[documentType] || null;
    }

    /**
     * Get all previews
     */
    getAllPreviews() {
        return this.state.previewData;
    }

    /**
     * Complete the export step and emit event
     */
    async complete() {
        if (!this.state.exportComplete) {
            console.warn('[StepExport] Cannot complete - export not finished');
            return {
                success: false,
                error: 'Export must be completed first'
            };
        }

        // Update workflow state
        this.workflowEngine.updateState('export.completed', true);
        this.workflowEngine.updateState('export.completedAt', new Date().toISOString());
        this.workflowEngine.updateState('workflowComplete', true);

        // Emit completion event
        this.workflowEngine.emit('step:export:complete', {
            exportResults: this.state.exportResults
        });

        // Emit workflow completion event
        this.workflowEngine.emit('workflow:complete', {
            completedAt: new Date().toISOString(),
            steps: ['upload', 'analyze', 'tailor', 'optimize', 'export']
        });

        console.log('[StepExport] Step completed - Workflow finished!');
        return {
            success: true,
            exportResults: this.state.exportResults
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
     * Check if exporting
     */
    isExporting() {
        return this.state.exporting;
    }

    /**
     * Check if export is complete
     */
    isComplete() {
        return this.state.exportComplete;
    }

    /**
     * Get selected documents
     */
    getSelectedDocuments() {
        return this.state.selectedDocuments;
    }

    /**
     * Get selected formats
     */
    getSelectedFormats() {
        return this.state.selectedFormats;
    }

    /**
     * Get export results
     */
    getExportResults() {
        return this.state.exportResults;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StepExport;
}
