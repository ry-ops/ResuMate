/**
 * Document Factory Module
 * Unified interface for generating all career documents
 * Handles resume, cover letter, executive bio, brand statement, and status inquiry
 *
 * Features:
 * - Smart caching to avoid regeneration
 * - Parallel generation support
 * - Progress tracking
 * - Error handling with retries
 * - Data validation
 *
 * @class DocumentFactory
 * @version 1.0.0
 */

class DocumentFactory {
    constructor(workflowState = null) {
        /**
         * Workflow state containing user data, job data, and analysis
         * @private
         */
        this.workflowState = workflowState || this._getDefaultState();

        /**
         * Cache for generated documents
         * @private
         */
        this.cache = {
            resume: { data: null, hash: null },
            coverLetter: { data: null, hash: null },
            executiveBio: { data: null, hash: null },
            brandStatement: { data: null, hash: null },
            statusInquiry: { data: null, hash: null }
        };

        /**
         * Generation status tracking
         * @private
         */
        this.status = {
            resume: 'pending',
            coverLetter: 'pending',
            executiveBio: 'pending',
            brandStatement: 'pending',
            statusInquiry: 'pending'
        };

        /**
         * Error tracking
         * @private
         */
        this.errors = {};

        /**
         * Progress callbacks
         * @private
         */
        this.progressCallbacks = [];

        console.log('[DocumentFactory] Initialized with workflow state');
    }

    /**
     * Generate all documents
     * @param {Function} progressCallback - Optional progress callback (progress) => void
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} - Generated documents with metadata
     */
    async generateAll(progressCallback = null, options = {}) {
        const {
            forceRegenerate = false,
            parallel = true,
            documents = {
                resume: true,
                coverLetter: true,
                executiveBio: true,
                brandStatement: true,
                statusInquiry: true
            }
        } = options;

        if (progressCallback) {
            this.progressCallbacks.push(progressCallback);
        }

        try {
            console.log('[DocumentFactory] Starting batch generation...', {
                parallel,
                forceRegenerate,
                documentsToGenerate: Object.keys(documents).filter(k => documents[k])
            });

            const documentTypes = Object.entries(documents)
                .filter(([_, enabled]) => enabled)
                .map(([type]) => type);

            const totalDocs = documentTypes.length;
            let completedDocs = 0;

            const results = {};

            if (parallel) {
                // Generate all documents in parallel
                const promises = documentTypes.map(async (type) => {
                    try {
                        const result = await this._generateDocument(type, forceRegenerate);
                        completedDocs++;
                        this._notifyProgress({
                            current: completedDocs,
                            total: totalDocs,
                            documentType: type,
                            status: 'completed'
                        });
                        return { type, result, success: true };
                    } catch (error) {
                        completedDocs++;
                        this._notifyProgress({
                            current: completedDocs,
                            total: totalDocs,
                            documentType: type,
                            status: 'failed',
                            error: error.message
                        });
                        return { type, error: error.message, success: false };
                    }
                });

                const allResults = await Promise.all(promises);

                // Organize results
                allResults.forEach(({ type, result, error, success }) => {
                    if (success) {
                        results[type] = result;
                    } else {
                        results[type] = { error, success: false };
                    }
                });
            } else {
                // Generate documents sequentially
                for (const type of documentTypes) {
                    try {
                        this._notifyProgress({
                            current: completedDocs,
                            total: totalDocs,
                            documentType: type,
                            status: 'in_progress'
                        });

                        results[type] = await this._generateDocument(type, forceRegenerate);
                        completedDocs++;

                        this._notifyProgress({
                            current: completedDocs,
                            total: totalDocs,
                            documentType: type,
                            status: 'completed'
                        });
                    } catch (error) {
                        results[type] = { error: error.message, success: false };
                        completedDocs++;

                        this._notifyProgress({
                            current: completedDocs,
                            total: totalDocs,
                            documentType: type,
                            status: 'failed',
                            error: error.message
                        });
                    }
                }
            }

            const successCount = Object.values(results).filter(r => r.success !== false).length;
            const failCount = totalDocs - successCount;

            console.log('[DocumentFactory] Batch generation completed', {
                total: totalDocs,
                success: successCount,
                failed: failCount
            });

            return {
                success: failCount === 0,
                results,
                metadata: {
                    totalDocuments: totalDocs,
                    successCount,
                    failCount,
                    timestamp: new Date().toISOString(),
                    parallel
                }
            };
        } catch (error) {
            console.error('[DocumentFactory] Batch generation failed:', error);
            return {
                success: false,
                error: error.message,
                results: {}
            };
        }
    }

    /**
     * Generate resume
     * @param {boolean} forceRegenerate - Force regeneration even if cached
     * @returns {Promise<Object>} - Generated resume
     */
    async generateResume(forceRegenerate = false) {
        return this._generateDocument('resume', forceRegenerate);
    }

    /**
     * Generate cover letter
     * @param {boolean} forceRegenerate - Force regeneration even if cached
     * @returns {Promise<Object>} - Generated cover letter
     */
    async generateCoverLetter(forceRegenerate = false) {
        return this._generateDocument('coverLetter', forceRegenerate);
    }

    /**
     * Generate executive bio
     * @param {boolean} forceRegenerate - Force regeneration even if cached
     * @returns {Promise<Object>} - Generated executive bio
     */
    async generateExecutiveBio(forceRegenerate = false) {
        return this._generateDocument('executiveBio', forceRegenerate);
    }

    /**
     * Generate brand statement
     * @param {boolean} forceRegenerate - Force regeneration even if cached
     * @returns {Promise<Object>} - Generated brand statement
     */
    async generateBrandStatement(forceRegenerate = false) {
        return this._generateDocument('brandStatement', forceRegenerate);
    }

    /**
     * Generate status inquiry email
     * @param {boolean} forceRegenerate - Force regeneration even if cached
     * @returns {Promise<Object>} - Generated status inquiry
     */
    async generateStatusInquiry(forceRegenerate = false) {
        return this._generateDocument('statusInquiry', forceRegenerate);
    }

    /**
     * Internal document generation with caching
     * @param {string} type - Document type
     * @param {boolean} forceRegenerate - Force regeneration
     * @returns {Promise<Object>} - Generated document
     * @private
     */
    async _generateDocument(type, forceRegenerate = false) {
        try {
            console.log(`[DocumentFactory] Generating ${type}...`, { forceRegenerate });

            // Update status
            this.status[type] = 'generating';

            // Check cache
            if (!forceRegenerate && this._isCached(type)) {
                console.log(`[DocumentFactory] Using cached ${type}`);
                this.status[type] = 'completed';
                return this.cache[type].data;
            }

            // Validate required data
            this._validateData(type);

            // Generate based on type
            let result;
            switch (type) {
                case 'resume':
                    result = await this._generateResumeInternal();
                    break;
                case 'coverLetter':
                    result = await this._generateCoverLetterInternal();
                    break;
                case 'executiveBio':
                    result = await this._generateExecutiveBioInternal();
                    break;
                case 'brandStatement':
                    result = await this._generateBrandStatementInternal();
                    break;
                case 'statusInquiry':
                    result = await this._generateStatusInquiryInternal();
                    break;
                default:
                    throw new Error(`Unknown document type: ${type}`);
            }

            // Cache result
            this._cacheDocument(type, result);

            // Update status
            this.status[type] = 'completed';
            delete this.errors[type];

            console.log(`[DocumentFactory] ${type} generated successfully`);

            return result;
        } catch (error) {
            console.error(`[DocumentFactory] Failed to generate ${type}:`, error);
            this.status[type] = 'failed';
            this.errors[type] = error.message;
            throw error;
        }
    }

    /**
     * Generate resume using ResumeGenerator
     * @returns {Promise<Object>} - Generated resume
     * @private
     */
    async _generateResumeInternal() {
        // Check if ResumeGenerator is available
        if (typeof resumeGenerator === 'undefined') {
            throw new Error('ResumeGenerator not loaded');
        }

        const profileData = this._extractProfileData();
        const result = await resumeGenerator.generateResume(profileData);

        if (!result.success) {
            throw new Error(result.error || 'Resume generation failed');
        }

        return {
            success: true,
            content: result.resumeState,
            metadata: result.metadata,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate cover letter using CoverLetterGenerator
     * @returns {Promise<Object>} - Generated cover letter
     * @private
     */
    async _generateCoverLetterInternal() {
        // Check if cover letter generator is available
        if (typeof CoverLetterGenerator === 'undefined') {
            throw new Error('CoverLetterGenerator not loaded');
        }

        const generator = new CoverLetterGenerator();
        const jobData = this.workflowState.job || {};
        const userData = this.workflowState.user || {};
        const analysis = this.workflowState.analysis || {};

        const params = {
            jobTitle: jobData.title || '',
            companyName: jobData.company || '',
            jobDescription: jobData.description || '',
            hiringManager: jobData.hiringManager || '',
            userName: userData.name || '',
            userTitle: userData.currentTitle || '',
            userExperience: analysis.yearsExperience || 0,
            keySkills: analysis.topSkills || [],
            achievements: analysis.topAchievements || [],
            tone: 'professional'
        };

        const result = await generator.generate(params);

        if (!result.success) {
            throw new Error(result.error || 'Cover letter generation failed');
        }

        return {
            success: true,
            content: result.content,
            metadata: result.metadata,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate executive bio using ExecutiveBioGenerator
     * @returns {Promise<Object>} - Generated executive bio
     * @private
     */
    async _generateExecutiveBioInternal() {
        // Check if ExecutiveBioGenerator is available
        if (typeof ExecutiveBioGenerator === 'undefined') {
            throw new Error('ExecutiveBioGenerator not loaded');
        }

        const generator = new ExecutiveBioGenerator();
        const userData = this.workflowState.user || {};
        const analysis = this.workflowState.analysis || {};

        const params = {
            name: userData.name || '',
            currentTitle: userData.currentTitle || '',
            company: userData.currentCompany || '',
            yearsExperience: analysis.yearsExperience || 0,
            achievements: analysis.topAchievements || [],
            expertise: analysis.topSkills || [],
            education: userData.education?.[0]?.degree || '',
            style: 'executive',
            length: 150,
            perspective: 'third'
        };

        const result = await generator.generate(params);

        if (!result.success) {
            throw new Error(result.error || 'Executive bio generation failed');
        }

        return {
            success: true,
            content: result.content,
            metadata: result.metadata,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate brand statement using BrandStatementGenerator
     * @returns {Promise<Object>} - Generated brand statement
     * @private
     */
    async _generateBrandStatementInternal() {
        // Check if BrandStatementGenerator is available
        if (typeof BrandStatementGenerator === 'undefined') {
            throw new Error('BrandStatementGenerator not loaded');
        }

        const generator = new BrandStatementGenerator();
        const userData = this.workflowState.user || {};
        const analysis = this.workflowState.analysis || {};

        const params = {
            name: userData.name || '',
            currentTitle: userData.currentTitle || '',
            targetRole: this.workflowState.job?.title || '',
            strengths: analysis.topSkills?.slice(0, 3) || [],
            values: [],
            differentiators: analysis.uniqueValue || [],
            style: 'professional'
        };

        const result = await generator.generate(params);

        if (!result.success) {
            throw new Error(result.error || 'Brand statement generation failed');
        }

        return {
            success: true,
            content: result.content,
            metadata: result.metadata,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate status inquiry email using StatusInquiryGenerator
     * @returns {Promise<Object>} - Generated status inquiry
     * @private
     */
    async _generateStatusInquiryInternal() {
        // Check if StatusInquiryGenerator is available
        if (typeof StatusInquiryGenerator === 'undefined') {
            throw new Error('StatusInquiryGenerator not loaded');
        }

        const generator = new StatusInquiryGenerator();
        const jobData = this.workflowState.job || {};
        const userData = this.workflowState.user || {};

        const params = {
            jobTitle: jobData.title || '',
            companyName: jobData.company || '',
            hiringManager: jobData.hiringManager || 'Hiring Manager',
            userName: userData.name || '',
            applicationDate: this.workflowState.metadata?.applicationDate || new Date().toISOString(),
            weeksSinceApplication: this._calculateWeeksSince(this.workflowState.metadata?.applicationDate),
            tone: 'polite'
        };

        const result = await generator.generate(params);

        if (!result.success) {
            throw new Error(result.error || 'Status inquiry generation failed');
        }

        return {
            success: true,
            content: result.content,
            metadata: result.metadata,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Extract profile data from workflow state
     * @returns {Object} - Profile data for resume generation
     * @private
     */
    _extractProfileData() {
        const user = this.workflowState.user || {};
        const job = this.workflowState.job || {};
        const analysis = this.workflowState.analysis || {};

        return {
            name: user.name || '',
            title: user.currentTitle || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            linkedin: user.linkedin || '',
            website: user.website || '',
            experience: user.experience || [],
            education: user.education || [],
            skills: analysis.topSkills || user.skills || [],
            certifications: user.certifications || [],
            projects: user.projects || [],
            achievements: analysis.topAchievements || [],
            languages: user.languages || [],
            volunteering: user.volunteering || [],
            targetRole: job.title || '',
            targetIndustry: job.industry || '',
            template: 'modern'
        };
    }

    /**
     * Validate required data for document generation
     * @param {string} type - Document type
     * @throws {Error} - If required data is missing
     * @private
     */
    _validateData(type) {
        const user = this.workflowState.user || {};
        const job = this.workflowState.job || {};

        const validations = {
            resume: () => {
                if (!user.name) throw new Error('User name is required for resume generation');
                if (!user.currentTitle) throw new Error('Current title is required for resume generation');
                if (!user.experience || user.experience.length === 0) {
                    throw new Error('At least one work experience entry is required for resume generation');
                }
            },
            coverLetter: () => {
                if (!user.name) throw new Error('User name is required for cover letter generation');
                if (!job.title) throw new Error('Job title is required for cover letter generation');
                if (!job.company) throw new Error('Company name is required for cover letter generation');
            },
            executiveBio: () => {
                if (!user.name) throw new Error('User name is required for executive bio generation');
                if (!user.currentTitle) throw new Error('Current title is required for executive bio generation');
            },
            brandStatement: () => {
                if (!user.name) throw new Error('User name is required for brand statement generation');
                if (!user.currentTitle) throw new Error('Current title is required for brand statement generation');
            },
            statusInquiry: () => {
                if (!user.name) throw new Error('User name is required for status inquiry generation');
                if (!job.title) throw new Error('Job title is required for status inquiry generation');
                if (!job.company) throw new Error('Company name is required for status inquiry generation');
            }
        };

        if (validations[type]) {
            validations[type]();
        }
    }

    /**
     * Check if document is cached and valid
     * @param {string} type - Document type
     * @returns {boolean} - True if cached and valid
     * @private
     */
    _isCached(type) {
        const cached = this.cache[type];
        if (!cached.data || !cached.hash) {
            return false;
        }

        // Calculate current hash
        const currentHash = this._calculateHash(type);

        // Compare hashes
        return cached.hash === currentHash;
    }

    /**
     * Cache generated document
     * @param {string} type - Document type
     * @param {Object} data - Document data
     * @private
     */
    _cacheDocument(type, data) {
        const hash = this._calculateHash(type);
        this.cache[type] = { data, hash };
        console.log(`[DocumentFactory] Cached ${type} (hash: ${hash.substring(0, 8)}...)`);
    }

    /**
     * Calculate hash of input data for caching
     * @param {string} type - Document type
     * @returns {string} - Hash string
     * @private
     */
    _calculateHash(type) {
        // Simple hash based on relevant workflow state
        const relevantData = {
            user: this.workflowState.user,
            job: this.workflowState.job,
            analysis: this.workflowState.analysis,
            type
        };

        return this._simpleHash(JSON.stringify(relevantData));
    }

    /**
     * Simple hash function
     * @param {string} str - String to hash
     * @returns {string} - Hash string
     * @private
     */
    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * Calculate weeks since a date
     * @param {string} dateString - ISO date string
     * @returns {number} - Weeks since date
     * @private
     */
    _calculateWeeksSince(dateString) {
        if (!dateString) return 1;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    }

    /**
     * Notify progress callbacks
     * @param {Object} progress - Progress information
     * @private
     */
    _notifyProgress(progress) {
        this.progressCallbacks.forEach(callback => {
            try {
                callback(progress);
            } catch (error) {
                console.error('[DocumentFactory] Progress callback error:', error);
            }
        });
    }

    /**
     * Get default workflow state
     * @returns {Object} - Default state
     * @private
     */
    _getDefaultState() {
        return {
            user: {},
            job: {},
            analysis: {},
            metadata: {}
        };
    }

    /**
     * Update workflow state
     * @param {Object} newState - New workflow state
     */
    updateWorkflowState(newState) {
        this.workflowState = { ...this.workflowState, ...newState };
        console.log('[DocumentFactory] Workflow state updated');
    }

    /**
     * Get generation status for all documents
     * @returns {Object} - Status object
     */
    getStatus() {
        return {
            ...this.status,
            errors: this.errors
        };
    }

    /**
     * Get cached document
     * @param {string} type - Document type
     * @returns {Object|null} - Cached document or null
     */
    getCached(type) {
        return this.cache[type]?.data || null;
    }

    /**
     * Clear cache for specific document or all documents
     * @param {string} type - Document type (optional, clears all if not provided)
     */
    clearCache(type = null) {
        if (type) {
            this.cache[type] = { data: null, hash: null };
            this.status[type] = 'pending';
            delete this.errors[type];
            console.log(`[DocumentFactory] Cleared cache for ${type}`);
        } else {
            Object.keys(this.cache).forEach(key => {
                this.cache[key] = { data: null, hash: null };
                this.status[key] = 'pending';
            });
            this.errors = {};
            console.log('[DocumentFactory] Cleared all cache');
        }
    }

    /**
     * Check if all documents are generated
     * @returns {boolean} - True if all documents are generated
     */
    isComplete() {
        return Object.values(this.status).every(status => status === 'completed');
    }

    /**
     * Get completion percentage
     * @returns {number} - Completion percentage (0-100)
     */
    getCompletionPercentage() {
        const total = Object.keys(this.status).length;
        const completed = Object.values(this.status).filter(s => s === 'completed').length;
        return Math.round((completed / total) * 100);
    }
}

// Create global instance (will be initialized when needed)
let documentFactory = null;

/**
 * Initialize DocumentFactory with workflow state
 * @param {Object} workflowState - Workflow state
 * @returns {DocumentFactory} - Initialized factory
 */
function initializeDocumentFactory(workflowState) {
    documentFactory = new DocumentFactory(workflowState);
    window.documentFactory = documentFactory;
    console.log('[DocumentFactory] Global instance initialized');
    return documentFactory;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DocumentFactory, initializeDocumentFactory };
}
