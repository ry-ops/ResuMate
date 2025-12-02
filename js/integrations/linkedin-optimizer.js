// LinkedIn Profile Optimizer
// AI-powered headline and summary optimization

/**
 * LinkedIn Profile Optimizer Class
 * Handles AI-powered optimization of LinkedIn profiles
 */
class LinkedInOptimizer {
    constructor() {
        this.apiEndpoint = '/api/generate';
        this.maxHeadlineLength = 120;
        this.maxSummaryLength = 2000;
    }

    /**
     * Get API key from localStorage
     * @returns {string} - API key
     * @private
     */
    _getApiKey() {
        const apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
            throw new Error('API key not found. Please set your Claude API key.');
        }
        return apiKey;
    }

    /**
     * Make API request
     * @param {string} prompt - Prompt to send
     * @param {Object} options - Request options
     * @returns {Promise<string>} - API response
     * @private
     */
    async _makeRequest(prompt, options = {}) {
        const {
            maxTokens = 1024,
            temperature = 0.7
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
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Generate optimized LinkedIn headlines
     * @param {Object} params - Headline parameters
     * @param {string} params.currentRole - Current job title
     * @param {Array} params.skills - Key skills
     * @param {string} params.industry - Target industry
     * @param {number} params.yearsExp - Years of experience
     * @param {string} params.valueProposition - Unique value proposition
     * @returns {Promise<Array>} - Array of headline options (5+)
     */
    async generateHeadlines(params) {
        const {
            currentRole,
            skills = [],
            industry = '',
            yearsExp = 0,
            valueProposition = ''
        } = params;

        if (typeof AIPrompts === 'undefined') {
            throw new Error('AIPrompts module not loaded');
        }

        const prompt = AIPrompts.generateLinkedInHeadline({
            currentRole,
            skills: Array.isArray(skills) ? skills.join(', ') : skills,
            industry,
            yearsExp,
            valueProposition
        });

        const content = await this._makeRequest(prompt, {
            maxTokens: 512,
            temperature: 0.8
        });

        // Parse headlines from response
        const headlines = this._parseHeadlines(content);

        // Validate and truncate if needed
        return headlines.map(h => ({
            text: h.substring(0, this.maxHeadlineLength),
            length: Math.min(h.length, this.maxHeadlineLength),
            isValid: h.length <= this.maxHeadlineLength
        }));
    }

    /**
     * Optimize LinkedIn summary/about section
     * @param {Object} params - Summary parameters
     * @param {string} params.currentSummary - Current LinkedIn summary
     * @param {string} params.resumeSummary - Resume summary
     * @param {Array} params.keywords - Keywords to include
     * @param {string} params.targetRole - Target role
     * @param {string} params.industry - Target industry
     * @returns {Promise<Object>} - Optimized summary with metadata
     */
    async optimizeSummary(params) {
        const {
            currentSummary = '',
            resumeSummary = '',
            keywords = [],
            targetRole = '',
            industry = ''
        } = params;

        if (typeof AIPrompts === 'undefined') {
            throw new Error('AIPrompts module not loaded');
        }

        const prompt = AIPrompts.optimizeLinkedInSummary({
            currentSummary,
            resumeSummary,
            keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
            targetRole,
            industry
        });

        const content = await this._makeRequest(prompt, {
            maxTokens: 1500,
            temperature: 0.7
        });

        // Truncate if too long
        const optimizedSummary = content.substring(0, this.maxSummaryLength);

        return {
            summary: optimizedSummary,
            length: optimizedSummary.length,
            maxLength: this.maxSummaryLength,
            isValid: optimizedSummary.length <= this.maxSummaryLength,
            wordCount: optimizedSummary.split(/\s+/).length,
            paragraphs: optimizedSummary.split(/\n\s*\n/).length,
            keywordsIncluded: this._countKeywordsIncluded(optimizedSummary, keywords)
        };
    }

    /**
     * Analyze alignment between LinkedIn and resume
     * @param {Object} params - Alignment parameters
     * @param {Object} params.linkedInData - LinkedIn profile data
     * @param {Object} params.resumeData - Resume data
     * @returns {Promise<Object>} - Alignment analysis
     */
    async analyzeAlignment(params) {
        const {
            linkedInData,
            resumeData
        } = params;

        if (typeof AIPrompts === 'undefined') {
            throw new Error('AIPrompts module not loaded');
        }

        const prompt = AIPrompts.alignLinkedInWithResume({
            linkedInData: JSON.stringify(linkedInData, null, 2),
            resumeData: JSON.stringify(resumeData, null, 2)
        });

        const content = await this._makeRequest(prompt, {
            maxTokens: 2048,
            temperature: 0.6
        });

        try {
            // Parse JSON response
            const analysis = JSON.parse(content);
            return {
                success: true,
                ...analysis
            };
        } catch (error) {
            console.error('Failed to parse alignment analysis:', error);
            return {
                success: false,
                error: 'Failed to parse AI response',
                rawResponse: content
            };
        }
    }

    /**
     * Generate skill recommendations based on profile and industry
     * @param {Object} params - Skill recommendation parameters
     * @param {Array} params.currentSkills - Current skills
     * @param {string} params.targetRole - Target role
     * @param {string} params.industry - Target industry
     * @param {Object} params.resumeData - Resume data for context
     * @returns {Promise<Object>} - Skill recommendations
     */
    async recommendSkills(params) {
        const {
            currentSkills = [],
            targetRole,
            industry,
            resumeData = {}
        } = params;

        const prompt = `Analyze this professional profile and recommend LinkedIn skills to add.

Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}
Industry: ${industry}
Experience Summary: ${resumeData.summary || 'Not provided'}

Provide skill recommendations in the following categories:
1. Critical missing skills (must-have for the role)
2. Trending skills in the industry
3. Complementary skills to enhance current skillset
4. Technical skills to highlight
5. Soft skills to add

Return as JSON:
{
  "criticalSkills": ["skill1", "skill2"],
  "trendingSkills": ["skill1", "skill2"],
  "complementarySkills": ["skill1", "skill2"],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "skillsToRemove": ["outdated1", "outdated2"],
  "reasoning": "Brief explanation of recommendations"
}

Return ONLY valid JSON without markdown formatting.`;

        try {
            const content = await this._makeRequest(prompt, {
                maxTokens: 1024,
                temperature: 0.7
            });

            const recommendations = JSON.parse(content);
            return {
                success: true,
                ...recommendations
            };
        } catch (error) {
            console.error('Failed to get skill recommendations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Optimize experience descriptions for LinkedIn
     * @param {Array} experiences - Experience entries
     * @param {Array} keywords - Keywords to incorporate
     * @returns {Promise<Array>} - Optimized experience entries
     */
    async optimizeExperience(experiences, keywords = []) {
        const optimized = [];

        for (const exp of experiences) {
            const prompt = `Optimize this LinkedIn experience description for better visibility and impact:

Job Title: ${exp.title}
Company: ${exp.company}
Current Description:
${exp.description}

Requirements:
- Maximum 2000 characters
- Include keywords: ${keywords.join(', ')}
- Start with impact/value delivered
- Use bullet points for achievements
- Include metrics where possible
- Professional but engaging tone
- Optimize for LinkedIn search

Return ONLY the optimized description without any preamble.`;

            try {
                const optimizedDesc = await this._makeRequest(prompt, {
                    maxTokens: 1024,
                    temperature: 0.7
                });

                optimized.push({
                    ...exp,
                    originalDescription: exp.description,
                    optimizedDescription: optimizedDesc.substring(0, 2000),
                    length: optimizedDesc.length,
                    keywordsAdded: this._identifyAddedKeywords(exp.description, optimizedDesc, keywords)
                });
            } catch (error) {
                console.error(`Failed to optimize experience: ${exp.title}`, error);
                optimized.push({
                    ...exp,
                    error: error.message
                });
            }
        }

        return optimized;
    }

    /**
     * Generate LinkedIn-friendly bullet points from description
     * @param {string} description - Job description
     * @param {string} jobTitle - Job title
     * @returns {Promise<Array>} - Formatted bullet points
     */
    async generateLinkedInBullets(description, jobTitle) {
        const prompt = `Convert this job description into 4-6 LinkedIn-optimized bullet points:

Job Title: ${jobTitle}
Description:
${description}

Requirements:
- Each bullet 1-2 lines (150 chars max)
- Start with strong action verbs
- Include metrics/results
- Professional yet engaging
- Optimized for LinkedIn visibility
- No generic statements

Return bullet points only, one per line, starting with •`;

        try {
            const content = await this._makeRequest(prompt, {
                maxTokens: 768,
                temperature: 0.7
            });

            return this._parseBulletPoints(content);
        } catch (error) {
            console.error('Failed to generate LinkedIn bullets:', error);
            throw error;
        }
    }

    /**
     * Parse headlines from AI response
     * @param {string} content - AI response content
     * @returns {Array} - Parsed headlines
     * @private
     */
    _parseHeadlines(content) {
        const headlines = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            // Match lines with bullets, numbers, or standalone text
            if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+[\.)]\s+/)) {
                const headline = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+[\.)]\s+/, '');
                if (headline.length >= 20) {
                    headlines.push(headline);
                }
            } else if (trimmed.length >= 20 && trimmed.length <= 150 && !trimmed.includes(':')) {
                headlines.push(trimmed);
            }
        }

        // If no structured headlines found, split by periods or newlines
        if (headlines.length === 0) {
            const sentences = content.split(/[.\n]/).map(s => s.trim()).filter(s => s.length >= 20);
            return sentences.slice(0, 5);
        }

        return headlines;
    }

    /**
     * Parse bullet points from response
     * @param {string} content - Content to parse
     * @returns {Array} - Bullet points
     * @private
     */
    _parseBulletPoints(content) {
        const bullets = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.match(/^[•\-*]\s+/)) {
                const bullet = trimmed.replace(/^[•\-*]\s+/, '');
                if (bullet.length > 10) {
                    bullets.push(bullet);
                }
            }
        }

        return bullets;
    }

    /**
     * Count how many keywords are included in text
     * @param {string} text - Text to check
     * @param {Array} keywords - Keywords to look for
     * @returns {number} - Count of keywords found
     * @private
     */
    _countKeywordsIncluded(text, keywords) {
        const lowerText = text.toLowerCase();
        return keywords.filter(keyword =>
            lowerText.includes(keyword.toLowerCase())
        ).length;
    }

    /**
     * Identify which keywords were added
     * @param {string} original - Original text
     * @param {string} optimized - Optimized text
     * @param {Array} keywords - Keywords to check
     * @returns {Array} - Keywords that were added
     * @private
     */
    _identifyAddedKeywords(original, optimized, keywords) {
        const originalLower = original.toLowerCase();
        const optimizedLower = optimized.toLowerCase();

        return keywords.filter(keyword => {
            const keywordLower = keyword.toLowerCase();
            return !originalLower.includes(keywordLower) &&
                   optimizedLower.includes(keywordLower);
        });
    }
}

// Create global instance
const linkedInOptimizer = new LinkedInOptimizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LinkedInOptimizer, linkedInOptimizer };
}
