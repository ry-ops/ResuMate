// AI Content Rewriter
// High-level functions for improving and rewriting resume content

/**
 * Content Rewriter Class
 * Provides convenient methods for common resume content improvements
 */
class ContentRewriter {
    constructor() {
        this.generator = typeof aiGenerator !== 'undefined' ? aiGenerator : null;
        if (!this.generator) {
            console.warn('AIGenerator not found. Make sure generator.js is loaded first.');
        }
    }

    /**
     * Ensure generator is available
     * @private
     */
    _ensureGenerator() {
        if (!this.generator) {
            throw new Error('AIGenerator not initialized. Please load generator.js first.');
        }
    }

    /**
     * Improve a single bullet point
     * Combines expansion and strengthening for best results
     * @param {string} bulletText - Original bullet point text
     * @param {Object} context - Additional context (jobTitle, industry)
     * @returns {Promise<Object>} - Improved versions with metadata
     */
    async improveBullet(bulletText, context = {}) {
        this._ensureGenerator();

        try {
            // Expand the bullet point
            const expanded = await this.generator.expandBullet({
                userInput: bulletText,
                ...context
            });

            return {
                original: bulletText,
                suggestions: expanded,
                count: expanded.length
            };
        } catch (error) {
            console.error('Error improving bullet:', error);
            throw new Error(`Failed to improve bullet point: ${error.message}`);
        }
    }

    /**
     * Make content more impactful
     * @param {string} content - Content to strengthen
     * @returns {Promise<Object>} - Conservative and bold versions
     */
    async makeMoreImpactful(content) {
        this._ensureGenerator();

        try {
            const result = await this.generator.strengthenLanguage({ content });

            return {
                original: content,
                conservative: result.conservative,
                bold: result.bold
            };
        } catch (error) {
            console.error('Error strengthening content:', error);
            throw new Error(`Failed to strengthen content: ${error.message}`);
        }
    }

    /**
     * Add quantification to achievement
     * @param {string} achievement - Achievement text
     * @param {string} role - Job role for context
     * @returns {Promise<Object>} - Quantified versions
     */
    async addMetrics(achievement, role = '') {
        this._ensureGenerator();

        try {
            const quantified = await this.generator.quantifyAchievement({
                achievement,
                role
            });

            return {
                original: achievement,
                suggestions: quantified,
                count: quantified.length
            };
        } catch (error) {
            console.error('Error adding metrics:', error);
            throw new Error(`Failed to add metrics: ${error.message}`);
        }
    }

    /**
     * Adapt content for different industry
     * @param {string} content - Original content
     * @param {string} targetIndustry - Target industry
     * @param {string} currentIndustry - Current industry (optional)
     * @returns {Promise<Object>} - Industry-adapted content
     */
    async adaptForIndustry(content, targetIndustry, currentIndustry = '') {
        this._ensureGenerator();

        try {
            const adapted = await this.generator.rewriteForIndustry({
                content,
                targetIndustry,
                currentIndustry
            });

            return {
                original: content,
                adapted,
                targetIndustry,
                currentIndustry
            };
        } catch (error) {
            console.error('Error adapting for industry:', error);
            throw new Error(`Failed to adapt for industry: ${error.message}`);
        }
    }

    /**
     * Get better action verbs for context
     * @param {string} context - Context or partial sentence
     * @param {Object} options - Additional options (industry, jobFunction)
     * @returns {Promise<Object>} - Suggested action verbs
     */
    async getBetterVerbs(context, options = {}) {
        this._ensureGenerator();

        try {
            const verbs = await this.generator.suggestActionVerbs({
                context,
                ...options
            });

            return {
                context,
                verbs,
                count: verbs.length
            };
        } catch (error) {
            console.error('Error getting action verbs:', error);
            throw new Error(`Failed to get action verbs: ${error.message}`);
        }
    }

    /**
     * Optimize content for ATS (Applicant Tracking Systems)
     * @param {string} bulletPoint - Bullet point to optimize
     * @param {string[]} keywords - Keywords to incorporate
     * @returns {Promise<Object>} - ATS-optimized versions
     */
    async optimizeForATS(bulletPoint, keywords = []) {
        this._ensureGenerator();

        try {
            const optimized = await this.generator.optimizeForATS({
                bulletPoint,
                keywords
            });

            return {
                original: bulletPoint,
                balanced: optimized.balanced,
                keywordFocused: optimized.keywordFocused,
                keywords
            };
        } catch (error) {
            console.error('Error optimizing for ATS:', error);
            throw new Error(`Failed to optimize for ATS: ${error.message}`);
        }
    }

    /**
     * Generate professional summary
     * @param {Object} profile - Profile information
     * @returns {Promise<string>} - Generated summary
     */
    async createSummary(profile) {
        this._ensureGenerator();

        const { jobTitle, yearsExp, skills, targetRole, industry } = profile;

        if (!jobTitle || !yearsExp || !skills || !targetRole) {
            throw new Error('Missing required profile information for summary generation');
        }

        try {
            const summary = await this.generator.generateSummary({
                jobTitle,
                yearsExp,
                skills,
                targetRole,
                industry
            });

            return summary;
        } catch (error) {
            console.error('Error generating summary:', error);
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }

    /**
     * Extract and suggest keywords from job description
     * @param {string} jobDescription - Job description text
     * @param {string[]} currentSkills - Current skills in resume
     * @returns {Promise<Object>} - Categorized keywords
     */
    async analyzeJobKeywords(jobDescription, currentSkills = []) {
        this._ensureGenerator();

        if (!jobDescription || jobDescription.trim().length === 0) {
            throw new Error('Job description is required');
        }

        try {
            const keywords = await this.generator.generateKeywords({
                jobDescription,
                currentSkills
            });

            return keywords;
        } catch (error) {
            console.error('Error analyzing job keywords:', error);
            throw new Error(`Failed to analyze job keywords: ${error.message}`);
        }
    }

    /**
     * Convert job responsibilities into achievement bullets
     * @param {string} responsibilities - Job responsibilities text
     * @param {string} jobTitle - Job title
     * @param {string} company - Company name (optional)
     * @returns {Promise<Object>} - Generated bullet points
     */
    async convertToBullets(responsibilities, jobTitle, company = '') {
        this._ensureGenerator();

        if (!responsibilities || !jobTitle) {
            throw new Error('Responsibilities and job title are required');
        }

        try {
            const bullets = await this.generator.generateBullets({
                responsibilities,
                jobTitle,
                company
            });

            return {
                bullets,
                count: bullets.length,
                jobTitle,
                company
            };
        } catch (error) {
            console.error('Error converting to bullets:', error);
            throw new Error(`Failed to convert to bullets: ${error.message}`);
        }
    }

    /**
     * Batch improve multiple bullet points
     * @param {string[]} bullets - Array of bullet points
     * @param {Object} context - Shared context for all bullets
     * @param {Function} progressCallback - Called after each bullet (optional)
     * @returns {Promise<Array>} - Array of improvement results
     */
    async improveBulletsBatch(bullets, context = {}, progressCallback = null) {
        this._ensureGenerator();

        if (!Array.isArray(bullets) || bullets.length === 0) {
            throw new Error('Bullets array is required and must not be empty');
        }

        const results = [];

        for (let i = 0; i < bullets.length; i++) {
            try {
                const result = await this.improveBullet(bullets[i], context);
                results.push({
                    index: i,
                    success: true,
                    ...result
                });

                if (progressCallback) {
                    progressCallback(i + 1, bullets.length, result);
                }
            } catch (error) {
                results.push({
                    index: i,
                    success: false,
                    original: bullets[i],
                    error: error.message
                });

                if (progressCallback) {
                    progressCallback(i + 1, bullets.length, null, error);
                }
            }
        }

        return results;
    }

    /**
     * Get suggestions for improving entire resume section
     * @param {Object} section - Resume section data
     * @param {string} section.type - Section type (experience, education, etc.)
     * @param {string} section.content - Section content
     * @param {Object} targetJob - Target job information
     * @returns {Promise<Object>} - Improvement suggestions
     */
    async improveSectionContent(section, targetJob = {}) {
        this._ensureGenerator();

        const improvements = {
            sectionType: section.type,
            suggestions: []
        };

        try {
            // For experience sections, analyze bullets
            if (section.type === 'experience' && section.bullets) {
                const bulletResults = await this.improveBulletsBatch(
                    section.bullets,
                    {
                        jobTitle: section.jobTitle,
                        industry: targetJob.industry
                    }
                );
                improvements.suggestions = bulletResults;
            }

            // For summary sections, generate new summary
            else if (section.type === 'summary' && targetJob.jobDescription) {
                const keywords = await this.analyzeJobKeywords(
                    targetJob.jobDescription,
                    section.skills || []
                );
                improvements.keywords = keywords;

                if (section.profile) {
                    const summary = await this.createSummary(section.profile);
                    improvements.generatedSummary = summary;
                }
            }

            return improvements;
        } catch (error) {
            console.error('Error improving section:', error);
            throw new Error(`Failed to improve section: ${error.message}`);
        }
    }

    /**
     * Quick fix: Replace weak verbs in text
     * @param {string} text - Text to fix
     * @param {Object} context - Context for verb suggestions
     * @returns {Promise<Object>} - Text with verb suggestions
     */
    async quickFixWeakVerbs(text, context = {}) {
        this._ensureGenerator();

        // Common weak verbs to flag
        const weakVerbs = [
            'responsible for',
            'helped',
            'worked on',
            'assisted',
            'participated',
            'involved in',
            'duties included'
        ];

        const hasWeakVerbs = weakVerbs.some(weak =>
            text.toLowerCase().includes(weak)
        );

        if (!hasWeakVerbs) {
            return {
                needsImprovement: false,
                original: text
            };
        }

        try {
            const verbs = await this.generator.suggestActionVerbs({
                context: text,
                ...context
            });

            return {
                needsImprovement: true,
                original: text,
                weakVerbs: weakVerbs.filter(v => text.toLowerCase().includes(v)),
                suggestedVerbs: verbs
            };
        } catch (error) {
            console.error('Error fixing weak verbs:', error);
            throw new Error(`Failed to fix weak verbs: ${error.message}`);
        }
    }
}

// Create global instance
const contentRewriter = new ContentRewriter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContentRewriter, contentRewriter };
}
