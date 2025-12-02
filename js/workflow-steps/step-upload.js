/**
 * Workflow Step 1: Upload & Input
 * Handles resume/job upload, text extraction, LinkedIn fetching, and validation
 */

class StepUpload {
    constructor(workflowEngine) {
        this.workflowEngine = workflowEngine;
        this.state = {
            resumeText: '',
            jobText: '',
            resumeFile: null,
            jobFile: null,
            linkedinUrl: '',
            isValidated: false,
            errors: []
        };

        console.log('[StepUpload] Initialized');
    }

    /**
     * Initialize the upload step
     * Load existing data from DataBridge if available
     */
    async initialize() {
        console.log('[StepUpload] Initializing...');

        // Load data from DataBridge if available
        if (window.dataBridge) {
            const userData = window.dataBridge.getUserData();

            // Load resume text
            if (userData.resume?.text) {
                this.state.resumeText = userData.resume.text;
                console.log('[StepUpload] Loaded resume from DataBridge');
            }

            // Load job description
            if (userData.job?.description) {
                this.state.jobText = userData.job.description;
                console.log('[StepUpload] Loaded job description from DataBridge');
            }

            // Validate if we have both
            if (this.state.resumeText && this.state.jobText) {
                this.validate();
            }
        }

        return {
            success: true,
            hasResume: !!this.state.resumeText,
            hasJob: !!this.state.jobText,
            isValidated: this.state.isValidated
        };
    }

    /**
     * Handle resume file upload
     * Supports PDF, DOCX, DOC, and plain text files
     */
    async handleResumeUpload(file) {
        console.log('[StepUpload] Processing resume file:', file.name);

        try {
            this.state.resumeFile = file;
            const fileName = file.name.toLowerCase();

            // Check if file needs server-side parsing (PDF or DOCX)
            if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                this.state.resumeText = await this.parseFileOnServer(file);
            } else {
                // Plain text file - read directly
                this.state.resumeText = await this.readFileAsText(file);
            }

            // Save to DataBridge
            if (window.dataBridge) {
                window.dataBridge.saveResume(this.state.resumeText);
            }

            // Update workflow state
            this.workflowEngine.updateState('upload.resumeText', this.state.resumeText);
            this.workflowEngine.updateState('upload.resumeFile', file.name);

            // Validate
            this.validate();

            console.log('[StepUpload] Resume uploaded successfully');
            return {
                success: true,
                text: this.state.resumeText,
                length: this.state.resumeText.length
            };
        } catch (error) {
            console.error('[StepUpload] Resume upload error:', error);
            this.state.errors.push(`Resume upload failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Handle job description file upload
     */
    async handleJobUpload(file) {
        console.log('[StepUpload] Processing job file:', file.name);

        try {
            this.state.jobFile = file;
            const fileName = file.name.toLowerCase();

            // Check if file needs server-side parsing
            if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                this.state.jobText = await this.parseFileOnServer(file);
            } else {
                this.state.jobText = await this.readFileAsText(file);
            }

            // Save to DataBridge
            if (window.dataBridge) {
                window.dataBridge.saveJob(this.state.jobText);
            }

            // Update workflow state
            this.workflowEngine.updateState('upload.jobText', this.state.jobText);
            this.workflowEngine.updateState('upload.jobFile', file.name);

            // Validate
            this.validate();

            console.log('[StepUpload] Job description uploaded successfully');
            return {
                success: true,
                text: this.state.jobText,
                length: this.state.jobText.length
            };
        } catch (error) {
            console.error('[StepUpload] Job upload error:', error);
            this.state.errors.push(`Job upload failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Handle resume text input
     */
    handleResumeTextInput(text) {
        this.state.resumeText = text;

        // Save to DataBridge
        if (window.dataBridge) {
            window.dataBridge.saveResume(text);
        }

        // Update workflow state
        this.workflowEngine.updateState('upload.resumeText', text);

        // Validate
        this.validate();

        return {
            success: true,
            length: text.length
        };
    }

    /**
     * Handle job description text input
     */
    handleJobTextInput(text) {
        this.state.jobText = text;

        // Save to DataBridge
        if (window.dataBridge) {
            window.dataBridge.saveJob(text);
        }

        // Update workflow state
        this.workflowEngine.updateState('upload.jobText', text);

        // Validate
        this.validate();

        return {
            success: true,
            length: text.length
        };
    }

    /**
     * Fetch job description from LinkedIn URL
     */
    async fetchLinkedInJob(url) {
        console.log('[StepUpload] Fetching LinkedIn job from URL:', url);

        try {
            // Validate URL format
            try {
                new URL(url);
            } catch (e) {
                throw new Error('Please enter a valid URL');
            }

            // Call server endpoint to fetch job content
            const response = await fetch('/api/fetch-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch job posting');
            }

            // Store the job description
            this.state.jobText = data.content;
            this.state.linkedinUrl = url;

            // Save to DataBridge
            if (window.dataBridge) {
                window.dataBridge.saveJob(data.content, { url: url });
            }

            // Update workflow state
            this.workflowEngine.updateState('upload.jobText', this.state.jobText);
            this.workflowEngine.updateState('upload.linkedinUrl', url);

            // Validate
            this.validate();

            console.log('[StepUpload] LinkedIn job fetched successfully');
            return {
                success: true,
                text: this.state.jobText,
                url: url
            };
        } catch (error) {
            console.error('[StepUpload] LinkedIn fetch error:', error);
            this.state.errors.push(`LinkedIn fetch failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch job description from any URL
     */
    async fetchJobFromURL(url) {
        return await this.fetchLinkedInJob(url); // Same logic for now
    }

    /**
     * Validate that both resume and job description are present
     */
    validate() {
        this.state.errors = [];

        // Check resume
        if (!this.state.resumeText || this.state.resumeText.trim().length === 0) {
            this.state.errors.push('Resume is required');
        } else if (this.state.resumeText.trim().length < 50) {
            this.state.errors.push('Resume text is too short');
        }

        // Check job description
        if (!this.state.jobText || this.state.jobText.trim().length === 0) {
            this.state.errors.push('Job description is required');
        } else if (this.state.jobText.trim().length < 50) {
            this.state.errors.push('Job description is too short');
        }

        // Set validation state
        this.state.isValidated = this.state.errors.length === 0;

        // Update workflow state
        this.workflowEngine.updateState('upload.isValidated', this.state.isValidated);
        this.workflowEngine.updateState('upload.errors', this.state.errors);

        console.log('[StepUpload] Validation result:', {
            isValidated: this.state.isValidated,
            errors: this.state.errors
        });

        return {
            isValidated: this.state.isValidated,
            errors: this.state.errors
        };
    }

    /**
     * Complete the upload step and emit event
     */
    async complete() {
        const validation = this.validate();

        if (!validation.isValidated) {
            console.warn('[StepUpload] Cannot complete - validation failed');
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Update workflow state
        this.workflowEngine.updateState('currentStep', 'analyze');
        this.workflowEngine.updateState('upload.completed', true);
        this.workflowEngine.updateState('upload.completedAt', new Date().toISOString());

        // Emit completion event
        this.workflowEngine.emit('step:upload:complete', {
            resumeText: this.state.resumeText,
            jobText: this.state.jobText,
            resumeLength: this.state.resumeText.length,
            jobLength: this.state.jobText.length
        });

        console.log('[StepUpload] Step completed');
        return {
            success: true,
            resumeLength: this.state.resumeText.length,
            jobLength: this.state.jobText.length
        };
    }

    /**
     * Read file as plain text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Parse PDF/DOCX file on server
     */
    async parseFileOnServer(file) {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch('/api/parse', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to parse file');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to parse file');
        }

        return result.text || '';
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
     * Get validation status
     */
    getValidationStatus() {
        return {
            isValidated: this.state.isValidated,
            errors: this.state.errors,
            hasResume: !!this.state.resumeText,
            hasJob: !!this.state.jobText
        };
    }

    /**
     * Clear all data
     */
    clear() {
        this.state = {
            resumeText: '',
            jobText: '',
            resumeFile: null,
            jobFile: null,
            linkedinUrl: '',
            isValidated: false,
            errors: []
        };

        // Clear workflow state
        this.workflowEngine.updateState('upload', {
            resumeText: '',
            jobText: '',
            isValidated: false,
            completed: false
        });

        console.log('[StepUpload] Cleared all data');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StepUpload;
}
