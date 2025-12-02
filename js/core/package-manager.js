/**
 * PackageManager - Unified data model for complete application package
 *
 * Manages the entire job application package including all generated documents
 * and provides export functionality to create a single ZIP file.
 *
 * @class PackageManager
 * @version 1.0.0
 * @requires JSZip (loaded via CDN)
 */

class PackageManager {
    constructor() {
        /**
         * Reference to DataBridge for data access
         * @private
         */
        this.dataBridge = window.dataBridge;

        /**
         * Package status
         * @private
         */
        this.status = {
            resume: false,
            coverLetter: false,
            executiveBio: false,
            brandStatement: false,
            statusInquiry: false
        };

        console.log('[PackageManager] Initialized');
    }

    /**
     * Create a new application package
     * @param {Object} userInfo - User information
     * @param {Object} jobInfo - Job information
     * @returns {Object} Package structure
     */
    createPackage(userInfo = {}, jobInfo = {}) {
        const packageData = {
            user: {
                name: userInfo.name || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                linkedin: userInfo.linkedin || '',
                location: userInfo.location || ''
            },
            job: {
                title: jobInfo.title || '',
                company: jobInfo.company || '',
                description: jobInfo.description || '',
                url: jobInfo.url || ''
            },
            documents: {
                resume: null,
                coverLetter: null,
                executiveBio: null,
                brandStatement: null,
                statusInquiry: null
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                completionStatus: this.calculateCompletionStatus()
            }
        };

        console.log('[PackageManager] Created new package:', {
            user: packageData.user.name || 'Anonymous',
            job: packageData.job.title || 'Untitled'
        });

        return packageData;
    }

    /**
     * Add or update a document in the package
     * @param {string} type - Document type (resume, coverLetter, etc.)
     * @param {Object} documentData - Document data
     * @returns {boolean} Success status
     */
    addDocument(type, documentData) {
        try {
            const validTypes = ['resume', 'coverLetter', 'executiveBio', 'brandStatement', 'statusInquiry'];

            if (!validTypes.includes(type)) {
                console.error(`[PackageManager] Invalid document type: ${type}`);
                return false;
            }

            // Create document object with metadata
            const document = {
                content: documentData.content || '',
                format: documentData.format || 'html',
                version: documentData.version || 1,
                timestamp: new Date().toISOString(),
                metadata: {
                    wordCount: this.countWords(documentData.content || ''),
                    characterCount: (documentData.content || '').length,
                    ...documentData.metadata
                }
            };

            // Save to DataBridge
            if (this.dataBridge) {
                this.dataBridge.saveDocument(type, document);
            }

            // Update status
            this.status[type] = true;

            console.log(`[PackageManager] Added document: ${type}`, {
                format: document.format,
                wordCount: document.metadata.wordCount,
                timestamp: document.timestamp
            });

            return true;
        } catch (error) {
            console.error(`[PackageManager] Error adding document ${type}:`, error);
            return false;
        }
    }

    /**
     * Get a document from the package
     * @param {string} type - Document type
     * @returns {Object|null} Document data
     */
    getDocument(type) {
        if (this.dataBridge) {
            return this.dataBridge.getDocument(type);
        }
        return null;
    }

    /**
     * Get all documents in the package
     * @returns {Object} All documents
     */
    getAllDocuments() {
        if (this.dataBridge) {
            const userData = this.dataBridge.getUserData();
            return userData.documents || {};
        }
        return {};
    }

    /**
     * Get package status (which documents are ready)
     * @returns {Object} Status object
     */
    getPackageStatus() {
        const documents = this.getAllDocuments();
        const status = {
            resume: !!documents.resume?.content,
            coverLetter: !!documents.coverLetter?.content,
            executiveBio: !!documents.executiveBio?.content,
            brandStatement: !!documents.brandStatement?.content,
            statusInquiry: !!documents.statusInquiry?.content,
            completionPercentage: 0,
            readyForExport: false
        };

        // Calculate completion percentage
        const total = 5;
        const completed = Object.values(status).filter(v => v === true).length;
        status.completionPercentage = Math.round((completed / total) * 100);
        status.readyForExport = completed > 0;

        console.log('[PackageManager] Package status:', {
            completion: `${status.completionPercentage}%`,
            ready: status.readyForExport,
            documents: completed
        });

        return status;
    }

    /**
     * Calculate completion status
     * @private
     * @returns {string} Status string
     */
    calculateCompletionStatus() {
        const status = this.getPackageStatus();
        if (status.completionPercentage === 100) return 'complete';
        if (status.completionPercentage >= 60) return 'mostly_complete';
        if (status.completionPercentage >= 20) return 'in_progress';
        return 'not_started';
    }

    /**
     * Export package as ZIP file
     * @param {string} filename - Base filename (without extension)
     * @returns {Promise<boolean>} Success status
     */
    async exportPackage(filename = 'job-application-package') {
        try {
            // Check if JSZip is available
            if (typeof JSZip === 'undefined') {
                console.error('[PackageManager] JSZip library not loaded');
                alert('Export library not loaded. Please refresh the page.');
                return false;
            }

            console.log('[PackageManager] Starting package export...');

            const zip = new JSZip();
            const userData = this.dataBridge ? this.dataBridge.getUserData() : null;
            const documents = this.getAllDocuments();

            // Create folder structure
            const docsFolder = zip.folder('documents');
            const metaFolder = zip.folder('metadata');

            let exportedCount = 0;

            // Add resume
            if (documents.resume?.content) {
                const resumeContent = this.prepareDocumentForExport(documents.resume);
                docsFolder.file('resume.html', resumeContent.html);
                if (resumeContent.text) {
                    docsFolder.file('resume.txt', resumeContent.text);
                }
                exportedCount++;
                console.log('[PackageManager] Added resume to package');
            }

            // Add cover letter
            if (documents.coverLetter?.content) {
                const clContent = this.prepareDocumentForExport(documents.coverLetter);
                docsFolder.file('cover-letter.html', clContent.html);
                if (clContent.text) {
                    docsFolder.file('cover-letter.txt', clContent.text);
                }
                exportedCount++;
                console.log('[PackageManager] Added cover letter to package');
            }

            // Add executive bio
            if (documents.executiveBio?.content) {
                const bioContent = this.prepareDocumentForExport(documents.executiveBio);
                docsFolder.file('executive-bio.html', bioContent.html);
                if (bioContent.text) {
                    docsFolder.file('executive-bio.txt', bioContent.text);
                }
                exportedCount++;
                console.log('[PackageManager] Added executive bio to package');
            }

            // Add brand statement
            if (documents.brandStatement?.content) {
                const brandContent = this.prepareDocumentForExport(documents.brandStatement);
                docsFolder.file('brand-statement.html', brandContent.html);
                if (brandContent.text) {
                    docsFolder.file('brand-statement.txt', brandContent.text);
                }
                exportedCount++;
                console.log('[PackageManager] Added brand statement to package');
            }

            // Add status inquiry email
            if (documents.statusInquiry?.content) {
                const siContent = this.prepareDocumentForExport(documents.statusInquiry);
                docsFolder.file('status-inquiry.html', siContent.html);
                if (siContent.text) {
                    docsFolder.file('status-inquiry.txt', siContent.text);
                }
                exportedCount++;
                console.log('[PackageManager] Added status inquiry to package');
            }

            // Add metadata
            const packageMetadata = {
                exportDate: new Date().toISOString(),
                user: userData?.user || {},
                job: userData?.job || {},
                documentsIncluded: exportedCount,
                analysis: userData?.analysis || {},
                generatedBy: 'ResuMate v1.0'
            };
            metaFolder.file('package-info.json', JSON.stringify(packageMetadata, null, 2));

            // Add README
            const readme = this.generateReadme(packageMetadata);
            zip.file('README.txt', readme);

            // Check if we have any documents
            if (exportedCount === 0) {
                alert('No documents to export. Please generate at least one document first.');
                return false;
            }

            // Generate ZIP blob
            console.log('[PackageManager] Generating ZIP file...');
            const blob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            // Download ZIP file
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}-${new Date().toISOString().split('T')[0]}.zip`;
            link.click();

            // Clean up
            URL.revokeObjectURL(url);

            console.log('[PackageManager] Package exported successfully:', {
                documents: exportedCount,
                filename: link.download
            });

            return true;
        } catch (error) {
            console.error('[PackageManager] Error exporting package:', error);
            alert('Error exporting package: ' + error.message);
            return false;
        }
    }

    /**
     * Prepare document for export (convert to HTML and text)
     * @private
     * @param {Object} document - Document object
     * @returns {Object} Prepared content
     */
    prepareDocumentForExport(document) {
        const content = document.content || '';
        const format = document.format || 'html';

        let html = '';
        let text = '';

        if (format === 'html') {
            html = this.wrapInHTMLTemplate(content, document.metadata);
            text = this.stripHTML(content);
        } else {
            text = content;
            html = this.wrapInHTMLTemplate(`<pre>${this.escapeHTML(content)}</pre>`, document.metadata);
        }

        return { html, text };
    }

    /**
     * Wrap content in HTML template
     * @private
     * @param {string} content - Document content
     * @param {Object} metadata - Document metadata
     * @returns {string} HTML string
     */
    wrapInHTMLTemplate(content, metadata = {}) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document - Generated by ResuMate</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    ${content}
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        Generated by ResuMate on ${new Date().toLocaleDateString()}
    </footer>
</body>
</html>`;
    }

    /**
     * Strip HTML tags from content
     * @private
     * @param {string} html - HTML content
     * @returns {string} Plain text
     */
    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Escape HTML special characters
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Count words in text
     * @private
     * @param {string} text - Text content
     * @returns {number} Word count
     */
    countWords(text) {
        const stripped = this.stripHTML(text);
        return stripped.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Generate README file content
     * @private
     * @param {Object} metadata - Package metadata
     * @returns {string} README content
     */
    generateReadme(metadata) {
        return `JOB APPLICATION PACKAGE
Generated by ResuMate
Export Date: ${new Date(metadata.exportDate).toLocaleString()}

================================================================================

APPLICANT INFORMATION:
---------------------
Name: ${metadata.user.name || 'N/A'}
Email: ${metadata.user.email || 'N/A'}
Phone: ${metadata.user.phone || 'N/A'}

JOB INFORMATION:
---------------
Position: ${metadata.job.title || 'N/A'}
Company: ${metadata.job.company || 'N/A'}

PACKAGE CONTENTS:
----------------
This package contains ${metadata.documentsIncluded} document(s) in multiple formats:

- documents/
  - resume.html & resume.txt
  - cover-letter.html & cover-letter.txt
  - executive-bio.html & executive-bio.txt
  - brand-statement.html & brand-statement.txt
  - status-inquiry.html & status-inquiry.txt

- metadata/
  - package-info.json (detailed metadata)

FILE FORMATS:
------------
- HTML files: Formatted documents ready for viewing in a web browser
- TXT files: Plain text versions suitable for copying and pasting
- JSON files: Structured data for programmatic access

USAGE TIPS:
----------
1. HTML files can be opened in any web browser
2. HTML files can be printed or saved as PDF from the browser
3. TXT files can be copied and pasted into application forms
4. Review all documents before submission to ensure accuracy

================================================================================

Generated with ResuMate - AI-Powered Resume Optimization
https://github.com/ry-ops/ResuMate

For questions or issues, please refer to the documentation.
`;
    }

    /**
     * Get package summary for display
     * @returns {Object} Package summary
     */
    getPackageSummary() {
        const userData = this.dataBridge ? this.dataBridge.getUserData() : null;
        const status = this.getPackageStatus();
        const documents = this.getAllDocuments();

        return {
            user: userData?.user || {},
            job: userData?.job || {},
            status: status,
            documents: {
                resume: documents.resume ? {
                    hasContent: true,
                    wordCount: documents.resume.metadata?.wordCount || 0,
                    lastUpdated: documents.resume.timestamp
                } : null,
                coverLetter: documents.coverLetter ? {
                    hasContent: true,
                    wordCount: documents.coverLetter.metadata?.wordCount || 0,
                    lastUpdated: documents.coverLetter.timestamp
                } : null,
                executiveBio: documents.executiveBio ? {
                    hasContent: true,
                    wordCount: documents.executiveBio.metadata?.wordCount || 0,
                    lastUpdated: documents.executiveBio.timestamp
                } : null,
                brandStatement: documents.brandStatement ? {
                    hasContent: true,
                    wordCount: documents.brandStatement.metadata?.wordCount || 0,
                    lastUpdated: documents.brandStatement.timestamp
                } : null,
                statusInquiry: documents.statusInquiry ? {
                    hasContent: true,
                    wordCount: documents.statusInquiry.metadata?.wordCount || 0,
                    lastUpdated: documents.statusInquiry.timestamp
                } : null
            }
        };
    }

    /**
     * Clear all documents in the package
     * @returns {boolean} Success status
     */
    clearPackage() {
        try {
            if (this.dataBridge) {
                const userData = this.dataBridge.getUserData();
                userData.documents = {
                    resume: null,
                    coverLetter: null,
                    executiveBio: null,
                    brandStatement: null,
                    statusInquiry: null
                };
                this.dataBridge.saveUserData(userData);
            }

            this.status = {
                resume: false,
                coverLetter: false,
                executiveBio: false,
                brandStatement: false,
                statusInquiry: false
            };

            console.log('[PackageManager] Cleared all documents');
            return true;
        } catch (error) {
            console.error('[PackageManager] Error clearing package:', error);
            return false;
        }
    }
}

// Create singleton instance (will be initialized when DataBridge is ready)
let packageManager = null;

// Initialize after DOM is ready and DataBridge is available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.dataBridge) {
            packageManager = new PackageManager();
            window.packageManager = packageManager;
            console.log('[PackageManager] Singleton created and attached to window');
        }
    });
} else {
    if (window.dataBridge) {
        packageManager = new PackageManager();
        window.packageManager = packageManager;
        console.log('[PackageManager] Singleton created and attached to window');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PackageManager;
}
