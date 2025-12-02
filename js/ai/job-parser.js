/**
 * Job Description Parser
 * Extracts requirements, skills, keywords, and other critical information from job descriptions
 */

class JobParser {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Parse job description and extract structured data
     * @param {string} jobDescription - Raw job description text
     * @param {string} apiKey - Claude API key
     * @returns {Promise<Object>} Parsed job data
     */
    async parseJobDescription(jobDescription, apiKey) {
        // Check cache first
        const cacheKey = this.getCacheKey(jobDescription);
        if (this.cache.has(cacheKey)) {
            console.log('[JobParser] Using cached job data');
            return this.cache.get(cacheKey);
        }

        console.log('[JobParser] Parsing job description...');

        const prompt = `Analyze this job description and extract key information. Return ONLY valid JSON without any markdown formatting or code blocks.

Job Description:
${jobDescription}

Extract the following information and return as JSON:
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "requiredExperience": "X years or entry/mid/senior level",
  "softSkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "tools": ["tool1", "tool2"],
  "certifications": ["cert1", "cert2"],
  "education": "required education level",
  "keywords": ["keyword1", "keyword2"],
  "companyculture": ["value1", "value2"],
  "salaryRange": "if mentioned",
  "location": "if mentioned",
  "workType": "remote/hybrid/onsite"
}

Important: Return ONLY the JSON object, no other text or formatting.`;

        try {
            const response = await this.callClaudeAPI(apiKey, prompt);

            // Parse JSON from response
            let parsed;
            try {
                // Try to extract JSON from response if it's wrapped in markdown
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                const jsonText = jsonMatch ? jsonMatch[0] : response;
                parsed = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('[JobParser] Failed to parse JSON response:', parseError);
                // Return a basic structure
                parsed = this.createFallbackParsedData(jobDescription);
            }

            // Enhance with metadata
            const result = {
                ...parsed,
                rawText: jobDescription,
                parsedAt: new Date().toISOString(),
                wordCount: jobDescription.split(/\s+/).length
            };

            // Cache the result
            this.cache.set(cacheKey, result);

            console.log('[JobParser] Job description parsed successfully');
            return result;

        } catch (error) {
            console.error('[JobParser] Error parsing job description:', error);
            throw new Error('Failed to parse job description: ' + error.message);
        }
    }

    /**
     * Extract keywords from job description (basic fallback)
     * @param {string} jobDescription - Job description text
     * @returns {Array<string>} Extracted keywords
     */
    extractKeywordsBasic(jobDescription) {
        // Common technical and professional keywords pattern
        const text = jobDescription.toLowerCase();
        const keywords = new Set();

        // Extract capitalized words (likely technologies/tools)
        const capitalizedWords = jobDescription.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        capitalizedWords.forEach(word => {
            if (word.length > 3) keywords.add(word);
        });

        // Extract common tech terms
        const techTerms = [
            'javascript', 'python', 'java', 'react', 'node', 'aws', 'docker',
            'kubernetes', 'sql', 'api', 'rest', 'graphql', 'git', 'agile',
            'scrum', 'ci/cd', 'microservices', 'cloud', 'database', 'frontend',
            'backend', 'fullstack', 'devops', 'ml', 'ai', 'data', 'analytics'
        ];

        techTerms.forEach(term => {
            if (text.includes(term)) {
                keywords.add(term);
            }
        });

        return Array.from(keywords);
    }

    /**
     * Create fallback parsed data structure
     * @param {string} jobDescription - Job description text
     * @returns {Object} Basic parsed structure
     */
    createFallbackParsedData(jobDescription) {
        const keywords = this.extractKeywordsBasic(jobDescription);

        return {
            jobTitle: 'Unknown',
            company: '',
            requiredSkills: keywords.slice(0, 10),
            preferredSkills: [],
            requiredExperience: '',
            softSkills: ['communication', 'teamwork', 'problem-solving'],
            responsibilities: [],
            tools: keywords.filter(k => k.toLowerCase().match(/^[a-z]+$/)),
            certifications: [],
            education: '',
            keywords: keywords,
            companyculture: [],
            salaryRange: '',
            location: '',
            workType: ''
        };
    }

    /**
     * Call Claude API
     * @param {string} apiKey - Claude API key
     * @param {string} prompt - Prompt text
     * @returns {Promise<string>} API response
     */
    async callClaudeAPI(apiKey, prompt) {
        const response = await fetch('http://localhost:3101/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey: apiKey,
                prompt: prompt,
                maxTokens: 2048,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();
        return data.content;
    }

    /**
     * Generate cache key for job description
     * @param {string} jobDescription - Job description text
     * @returns {string} Cache key
     */
    getCacheKey(jobDescription) {
        // Simple hash function for cache key
        let hash = 0;
        for (let i = 0; i < jobDescription.length; i++) {
            const char = jobDescription.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'job_' + hash;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('[JobParser] Cache cleared');
    }
}

// Create singleton instance
const jobParser = new JobParser();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = jobParser;
}
