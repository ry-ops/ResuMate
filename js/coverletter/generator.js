// Cover Letter Generator
// Handles AI-powered cover letter generation with multiple modes

/**
 * Cover Letter Generator Class
 * Manages AI generation of cover letters with different modes
 */
class CoverLetterGenerator {
    constructor() {
        this.apiEndpoint = '/api/generate';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.generationHistory = [];
    }

    /**
     * Get API key from localStorage
     * @returns {string} - API key
     * @private
     */
    _getApiKey() {
        const apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
            throw new Error('API key not found. Please set your Claude API key in settings.');
        }
        return apiKey;
    }

    /**
     * Make API request with retry logic
     * @param {string} prompt - Prompt to send to Claude
     * @param {Object} options - Additional options
     * @returns {Promise<string>} - Generated content
     * @private
     */
    async _makeRequest(prompt, options = {}) {
        const {
            maxTokens = 2048,
            temperature = 0.7,
            retryCount = 0
        } = options;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    apiKey: this._getApiKey(),
                    maxTokens,
                    temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return data.content;
        } catch (error) {
            // Retry logic for network errors
            if (retryCount < this.maxRetries && this._isRetryableError(error)) {
                await this._delay(this.retryDelay * (retryCount + 1));
                return this._makeRequest(prompt, {
                    ...options,
                    retryCount: retryCount + 1
                });
            }
            throw error;
        }
    }

    /**
     * Check if error is retryable
     * @param {Error} error - Error object
     * @returns {boolean}
     * @private
     */
    _isRetryableError(error) {
        const retryableMessages = [
            'network',
            'timeout',
            'rate limit',
            'overloaded'
        ];
        const message = error.message.toLowerCase();
        return retryableMessages.some(msg => message.includes(msg));
    }

    /**
     * Delay helper for retries
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * MODE 1: Generate cover letter from scratch
     * @param {Object} params - Generation parameters
     * @returns {Promise<Object>} - Generated cover letter with metadata
     */
    async generateFromScratch(params) {
        if (typeof CoverLetterPrompts === 'undefined') {
            throw new Error('CoverLetterPrompts module not loaded');
        }

        const {
            jobTitle,
            companyName,
            jobDescription,
            resumeSummary,
            tone = 'professional',
            length = 250,
            focus = 'experience',
            openingStyle = 'traditional',
            howFound = '',
            contactName = ''
        } = params;

        // Validate required fields
        if (!jobTitle || !companyName || !jobDescription) {
            throw new Error('Job title, company name, and job description are required');
        }

        if (!resumeSummary || resumeSummary.trim().length === 0) {
            throw new Error('Resume summary is required to generate a cover letter');
        }

        try {
            // Generate the prompt
            const prompt = CoverLetterPrompts.generateCoverLetter({
                jobTitle,
                companyName,
                jobDescription,
                resumeSummary,
                tone,
                length,
                focus,
                openingStyle,
                howFound,
                contactName
            });

            // Make API request
            const maxTokens = Math.max(1024, Math.floor(length * 6)); // Approximate token count
            const content = await this._makeRequest(prompt, {
                maxTokens,
                temperature: 0.7
            });

            // Parse into structured format
            const structure = typeof coverLetterStructure !== 'undefined'
                ? coverLetterStructure.parseLetterIntoSections(content)
                : { fullText: content };

            // Record generation
            const generation = {
                id: this._generateId(),
                mode: 'from_scratch',
                timestamp: new Date().toISOString(),
                params: {
                    jobTitle,
                    companyName,
                    tone,
                    length,
                    focus,
                    openingStyle
                },
                result: {
                    fullText: content,
                    structure,
                    wordCount: this._countWords(content)
                }
            };

            this.generationHistory.push(generation);
            this._saveHistory();

            return {
                success: true,
                content,
                structure,
                metadata: {
                    wordCount: this._countWords(content),
                    generatedAt: generation.timestamp,
                    generationId: generation.id,
                    mode: 'from_scratch',
                    params: generation.params
                }
            };
        } catch (error) {
            console.error('Generation from scratch failed:', error);
            return {
                success: false,
                error: error.message,
                content: '',
                structure: {}
            };
        }
    }

    /**
     * MODE 2: Rewrite existing cover letter
     * @param {Object} params - Rewrite parameters
     * @returns {Promise<Object>} - Rewritten cover letter with metadata
     */
    async rewriteExisting(params) {
        if (typeof CoverLetterPrompts === 'undefined') {
            throw new Error('CoverLetterPrompts module not loaded');
        }

        const {
            currentLetter,
            jobDescription,
            jobTitle = '',
            companyName = '',
            tone = 'professional',
            length = 250,
            improvements = []
        } = params;

        // Validate required fields
        if (!currentLetter || currentLetter.trim().length === 0) {
            throw new Error('Current cover letter text is required');
        }

        if (!jobDescription || jobDescription.trim().length === 0) {
            throw new Error('Job description is required to rewrite the cover letter');
        }

        try {
            // Generate the prompt
            const prompt = CoverLetterPrompts.rewriteCoverLetter({
                currentLetter,
                jobDescription,
                jobTitle,
                companyName,
                tone,
                length,
                improvements
            });

            // Make API request
            const maxTokens = Math.max(1024, Math.floor(length * 6));
            const content = await this._makeRequest(prompt, {
                maxTokens,
                temperature: 0.7
            });

            // Parse into structured format
            const structure = typeof coverLetterStructure !== 'undefined'
                ? coverLetterStructure.parseLetterIntoSections(content)
                : { fullText: content };

            // Record generation
            const generation = {
                id: this._generateId(),
                mode: 'rewrite',
                timestamp: new Date().toISOString(),
                params: {
                    jobTitle,
                    companyName,
                    tone,
                    length,
                    improvements
                },
                result: {
                    fullText: content,
                    structure,
                    wordCount: this._countWords(content),
                    originalWordCount: this._countWords(currentLetter)
                }
            };

            this.generationHistory.push(generation);
            this._saveHistory();

            return {
                success: true,
                content,
                structure,
                metadata: {
                    wordCount: this._countWords(content),
                    originalWordCount: this._countWords(currentLetter),
                    generatedAt: generation.timestamp,
                    generationId: generation.id,
                    mode: 'rewrite',
                    params: generation.params
                }
            };
        } catch (error) {
            console.error('Rewrite failed:', error);
            return {
                success: false,
                error: error.message,
                content: currentLetter, // Return original on error
                structure: {}
            };
        }
    }

    /**
     * MODE 3: Tailor existing cover letter for different job
     * @param {Object} params - Tailoring parameters
     * @returns {Promise<Object>} - Tailored cover letter with metadata
     */
    async tailorForJob(params) {
        if (typeof CoverLetterPrompts === 'undefined') {
            throw new Error('CoverLetterPrompts module not loaded');
        }

        const {
            originalLetter,
            newJobDescription,
            newJobTitle,
            newCompanyName,
            oldJobTitle = '',
            oldCompanyName = ''
        } = params;

        // Validate required fields
        if (!originalLetter || originalLetter.trim().length === 0) {
            throw new Error('Original cover letter text is required');
        }

        if (!newJobTitle || !newCompanyName || !newJobDescription) {
            throw new Error('New job title, company name, and job description are required');
        }

        try {
            // Generate the prompt
            const prompt = CoverLetterPrompts.tailorCoverLetter({
                originalLetter,
                newJobDescription,
                newJobTitle,
                newCompanyName,
                oldJobTitle,
                oldCompanyName
            });

            // Make API request
            const originalLength = this._countWords(originalLetter);
            const maxTokens = Math.max(1024, Math.floor(originalLength * 6));
            const content = await this._makeRequest(prompt, {
                maxTokens,
                temperature: 0.7
            });

            // Parse into structured format
            const structure = typeof coverLetterStructure !== 'undefined'
                ? coverLetterStructure.parseLetterIntoSections(content)
                : { fullText: content };

            // Record generation
            const generation = {
                id: this._generateId(),
                mode: 'tailor',
                timestamp: new Date().toISOString(),
                params: {
                    newJobTitle,
                    newCompanyName,
                    oldJobTitle,
                    oldCompanyName
                },
                result: {
                    fullText: content,
                    structure,
                    wordCount: this._countWords(content),
                    originalWordCount: originalLength
                }
            };

            this.generationHistory.push(generation);
            this._saveHistory();

            return {
                success: true,
                content,
                structure,
                metadata: {
                    wordCount: this._countWords(content),
                    originalWordCount: originalLength,
                    generatedAt: generation.timestamp,
                    generationId: generation.id,
                    mode: 'tailor',
                    params: generation.params
                }
            };
        } catch (error) {
            console.error('Tailoring failed:', error);
            return {
                success: false,
                error: error.message,
                content: originalLetter, // Return original on error
                structure: {}
            };
        }
    }

    /**
     * Generate using a template
     * @param {Object} params - Template parameters
     * @returns {Object} - Template-based cover letter
     */
    generateFromTemplate(params) {
        if (typeof coverLetterStructure === 'undefined') {
            throw new Error('CoverLetterStructure module not loaded');
        }

        const {
            templateType = 'traditional',
            variables = {}
        } = params;

        try {
            // Get template structure
            const structure = coverLetterStructure.getTemplateStructure(templateType);

            // Replace variables in template
            let processedStructure = {};
            for (const [section, content] of Object.entries(structure)) {
                processedStructure[section] = this._replaceVariables(content, variables);
            }

            // Assemble full letter
            const fullText = coverLetterStructure.assembleLetter(processedStructure, {
                includeGreeting: true,
                includeClosing: true,
                contactName: variables.contactName || '',
                candidateName: variables.candidateName || '',
                candidateEmail: variables.candidateEmail || '',
                candidatePhone: variables.candidatePhone || ''
            });

            return {
                success: true,
                content: fullText,
                structure: processedStructure,
                metadata: {
                    wordCount: this._countWords(fullText),
                    templateType,
                    mode: 'template'
                }
            };
        } catch (error) {
            console.error('Template generation failed:', error);
            return {
                success: false,
                error: error.message,
                content: '',
                structure: {}
            };
        }
    }

    /**
     * Analyze existing cover letter
     * @param {Object} params - Analysis parameters
     * @returns {Promise<Object>} - Analysis results
     */
    async analyzeCoverLetter(params) {
        if (typeof CoverLetterPrompts === 'undefined') {
            throw new Error('CoverLetterPrompts module not loaded');
        }

        const { coverLetter, jobDescription = '' } = params;

        if (!coverLetter || coverLetter.trim().length === 0) {
            throw new Error('Cover letter text is required');
        }

        try {
            const prompt = CoverLetterPrompts.analyzeCoverLetter({
                coverLetter,
                jobDescription
            });

            const content = await this._makeRequest(prompt, {
                maxTokens: 2048,
                temperature: 0.5
            });

            // Parse JSON response
            let analysis;
            try {
                // Remove markdown code blocks if present
                const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                analysis = JSON.parse(cleanedContent);
            } catch (parseError) {
                console.error('Failed to parse analysis JSON:', parseError);
                throw new Error('Failed to parse analysis results');
            }

            return {
                success: true,
                analysis,
                metadata: {
                    analyzedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Analysis failed:', error);
            return {
                success: false,
                error: error.message,
                analysis: null
            };
        }
    }

    /**
     * Replace variables in template text
     * @param {string} text - Template text with [Variable] placeholders
     * @param {Object} variables - Variable values
     * @returns {string} - Text with variables replaced
     * @private
     */
    _replaceVariables(text, variables) {
        let result = text;

        for (const [key, value] of Object.entries(variables)) {
            // Replace [key] and [Key] patterns
            const pattern1 = new RegExp(`\\[${key}\\]`, 'gi');
            const pattern2 = new RegExp(`\\[${key.charAt(0).toUpperCase() + key.slice(1)}\\]`, 'g');
            result = result.replace(pattern1, value);
            result = result.replace(pattern2, value);
        }

        return result;
    }

    /**
     * Count words in text
     * @param {string} text - Text to count
     * @returns {number} - Word count
     * @private
     */
    _countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    /**
     * Generate unique ID
     * @returns {string} - Unique ID
     * @private
     */
    _generateId() {
        return 'cl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save generation history to localStorage
     * @private
     */
    _saveHistory() {
        try {
            // Keep only last 20 generations
            const recentHistory = this.generationHistory.slice(-20);
            localStorage.setItem('coverletter_history', JSON.stringify(recentHistory));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    /**
     * Load generation history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('coverletter_history');
            if (saved) {
                this.generationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.generationHistory = [];
        }
    }

    /**
     * Get generation history
     * @returns {Array} - Generation history
     */
    getHistory() {
        return this.generationHistory;
    }

    /**
     * Clear generation history
     */
    clearHistory() {
        this.generationHistory = [];
        localStorage.removeItem('coverletter_history');
    }

    /**
     * Export cover letter to different formats
     * @param {string} content - Cover letter content
     * @param {string} format - Export format (txt, pdf, docx)
     * @returns {Promise<void>}
     */
    async export(content, format = 'txt') {
        // This will reuse the export functionality from Wave 2
        if (typeof exportManager !== 'undefined') {
            const data = {
                content,
                type: 'cover_letter',
                format
            };

            switch (format) {
                case 'txt':
                    return exportManager.exportToTxt(content, 'cover_letter');
                case 'pdf':
                    return exportManager.exportCoverLetterToPdf(content);
                case 'docx':
                    return exportManager.exportCoverLetterToDocx(content);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } else {
            throw new Error('Export manager not available');
        }
    }
}

// Create global instance
const coverLetterGenerator = new CoverLetterGenerator();

// Load history on initialization
if (typeof window !== 'undefined') {
    coverLetterGenerator.loadHistory();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CoverLetterGenerator, coverLetterGenerator };
}
