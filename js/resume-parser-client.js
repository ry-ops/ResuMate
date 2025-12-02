// Client-side Resume Parser Integration
// Handles file uploads and communicates with parser API

class ResumeParserClient {
    constructor(apiBaseUrl = '') {
        this.apiBaseUrl = apiBaseUrl;
        this.supportedFormats = ['pdf', 'docx', 'doc', 'txt'];
    }

    /**
     * Parse a resume file
     * @param {File} file - The file to parse
     * @param {string} apiKey - Claude API key (optional, for AI extraction)
     * @param {boolean} useAI - Whether to use AI extraction
     * @returns {Promise<Object>} - Parse result
     */
    async parseResume(file, apiKey = null, useAI = false) {
        if (!this.isFileSupported(file)) {
            return {
                success: false,
                error: `Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`
            };
        }

        const formData = new FormData();
        formData.append('resume', file);

        if (apiKey) {
            formData.append('apiKey', apiKey);
        }

        if (useAI) {
            formData.append('useAI', 'true');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/parse`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Failed to parse resume'
                };
            }

            const result = await response.json();
            return result;

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    /**
     * Extract structured data from resume using AI
     * @param {File} file - The file to extract
     * @param {string} apiKey - Claude API key (required)
     * @returns {Promise<Object>} - Extraction result
     */
    async extractResumeData(file, apiKey) {
        if (!apiKey) {
            return {
                success: false,
                error: 'API key is required for AI extraction'
            };
        }

        if (!this.isFileSupported(file)) {
            return {
                success: false,
                error: `Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`
            };
        }

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('apiKey', apiKey);

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/extract`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Failed to extract resume data'
                };
            }

            const result = await response.json();
            return result;

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    /**
     * Parse multiple resume files
     * @param {FileList|Array<File>} files - The files to parse
     * @param {string} apiKey - Claude API key (optional)
     * @param {boolean} useAI - Whether to use AI extraction
     * @returns {Promise<Object>} - Batch parse result
     */
    async parseMultiple(files, apiKey = null, useAI = false) {
        const fileArray = Array.from(files);

        // Validate all files
        const unsupported = fileArray.filter(file => !this.isFileSupported(file));
        if (unsupported.length > 0) {
            return {
                success: false,
                error: `${unsupported.length} file(s) have unsupported formats`
            };
        }

        if (fileArray.length > 10) {
            return {
                success: false,
                error: 'Maximum 10 files can be processed at once'
            };
        }

        const formData = new FormData();
        fileArray.forEach(file => {
            formData.append('resumes', file);
        });

        if (apiKey) {
            formData.append('apiKey', apiKey);
        }

        if (useAI) {
            formData.append('useAI', 'true');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/parse-batch`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Failed to parse resumes'
                };
            }

            const result = await response.json();
            return result;

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    }

    /**
     * Check if file format is supported
     * @param {File} file - The file to check
     * @returns {boolean} - Whether the file is supported
     */
    isFileSupported(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return this.supportedFormats.includes(extension);
    }

    /**
     * Get file size in readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} - Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    /**
     * Validate file before upload
     * @param {File} file - The file to validate
     * @returns {Object} - Validation result
     */
    validateFile(file) {
        const errors = [];
        const warnings = [];

        // Check if file exists
        if (!file) {
            errors.push('No file provided');
            return { valid: false, errors, warnings };
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum (10 MB)`);
        }

        // Check file format
        if (!this.isFileSupported(file)) {
            errors.push(`Unsupported file format. Supported: ${this.supportedFormats.join(', ')}`);
        }

        // Check file name
        if (file.name.length > 255) {
            warnings.push('File name is very long');
        }

        // Warn about small files
        if (file.size < 1024) {
            warnings.push('File is very small, may not contain enough data');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeParserClient;
}

// UI Helper Functions
const ResumeParserUI = {
    /**
     * Create a file upload handler with progress
     * @param {HTMLInputElement} fileInput - The file input element
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @param {Function} onProgress - Progress callback
     */
    setupFileUpload(fileInput, onSuccess, onError, onProgress) {
        const parser = new ResumeParserClient();

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file
            const validation = parser.validateFile(file);
            if (!validation.valid) {
                onError(validation.errors.join(', '));
                return;
            }

            // Show warnings if any
            if (validation.warnings.length > 0 && onProgress) {
                onProgress({ stage: 'warning', message: validation.warnings.join(', ') });
            }

            // Get API key from localStorage or input
            const apiKey = localStorage.getItem('claude_api_key') || null;
            const useAI = !!apiKey;

            if (onProgress) {
                onProgress({ stage: 'uploading', message: 'Uploading resume...' });
            }

            try {
                // Parse the resume
                const result = useAI
                    ? await parser.extractResumeData(file, apiKey)
                    : await parser.parseResume(file, null, false);

                if (result.success) {
                    onSuccess(result);
                } else {
                    onError(result.error);
                }
            } catch (error) {
                onError(error.message);
            }
        });
    },

    /**
     * Display parsed resume data
     * @param {Object} parsedData - The parsed resume data
     * @param {HTMLElement} container - Container element
     */
    displayParsedResume(parsedData, container) {
        if (!parsedData.success) {
            container.innerHTML = `<div class="error">Failed to parse resume: ${parsedData.error}</div>`;
            return;
        }

        let html = '<div class="parsed-resume">';

        // Display statistics
        html += '<div class="parse-stats">';
        html += `<h3>Parse Results</h3>`;
        html += `<p><strong>File:</strong> ${parsedData.filename}</p>`;
        html += `<p><strong>Type:</strong> ${parsedData.fileType.toUpperCase()}</p>`;
        html += `<p><strong>Words:</strong> ${parsedData.stats.wordCount}</p>`;
        html += `<p><strong>Sections:</strong> ${parsedData.stats.sectionCount}</p>`;

        if (parsedData.validation) {
            html += `<p><strong>Completeness:</strong> ${parsedData.validation.score}/100</p>`;
        }

        html += '</div>';

        // Display structured data if available
        if (parsedData.structuredData) {
            const data = parsedData.structuredData;

            // Personal info
            if (data.personalInfo) {
                html += '<div class="section"><h4>Personal Information</h4>';
                html += `<p><strong>Name:</strong> ${data.personalInfo.name || 'N/A'}</p>`;
                html += `<p><strong>Email:</strong> ${data.personalInfo.email || 'N/A'}</p>`;
                html += `<p><strong>Phone:</strong> ${data.personalInfo.phone || 'N/A'}</p>`;
                html += `<p><strong>Location:</strong> ${data.personalInfo.location || 'N/A'}</p>`;
                html += '</div>';
            }

            // Summary
            if (data.summary) {
                html += `<div class="section"><h4>Summary</h4><p>${data.summary}</p></div>`;
            }

            // Experience
            if (data.experience && data.experience.length > 0) {
                html += '<div class="section"><h4>Experience</h4>';
                data.experience.forEach(exp => {
                    html += `<div class="experience-item">`;
                    html += `<p><strong>${exp.title}</strong> at ${exp.company}</p>`;
                    html += `<p>${exp.startDate} - ${exp.endDate}</p>`;
                    html += '</div>';
                });
                html += '</div>';
            }

            // Skills
            if (data.skills) {
                html += '<div class="section"><h4>Skills</h4>';
                Object.entries(data.skills).forEach(([category, skills]) => {
                    if (skills && skills.length > 0) {
                        html += `<p><strong>${category}:</strong> ${skills.join(', ')}</p>`;
                    }
                });
                html += '</div>';
            }
        }

        // Display sections
        if (parsedData.sections && parsedData.sections.length > 0) {
            html += '<div class="sections"><h4>Detected Sections</h4>';
            parsedData.sections.forEach(section => {
                html += `<div class="section-preview">`;
                html += `<strong>${section.title}</strong>`;
                html += `<p>${section.content.substring(0, 100)}...</p>`;
                html += '</div>';
            });
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Show loading state
     * @param {HTMLElement} container - Container element
     * @param {string} message - Loading message
     */
    showLoading(container, message = 'Processing resume...') {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Show error state
     * @param {HTMLElement} container - Container element
     * @param {string} error - Error message
     */
    showError(container, error) {
        container.innerHTML = `
            <div class="error-state">
                <p>Error: ${error}</p>
            </div>
        `;
    }
};

// Export UI helpers
if (typeof module !== 'undefined' && module.exports) {
    module.exports.ResumeParserUI = ResumeParserUI;
}
