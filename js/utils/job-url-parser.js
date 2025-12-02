// Job URL Parser
// Extracts job posting content from popular job sites

/**
 * Job URL Parser Class
 * Handles fetching and parsing job postings from various job boards
 */
class JobURLParser {
    constructor() {
        this.apiEndpoint = '/api/fetch-job';
        this.generateEndpoint = '/api/generate';
        this.supportedSites = {
            linkedin: {
                name: 'LinkedIn',
                patterns: [
                    /linkedin\.com\/jobs\/view/,
                    /linkedin\.com\/jobs\/collections/,
                    /linkedin\.com\/job\//
                ],
                icon: 'https://cdn-icons-png.flaticon.com/24/174/174857.png'
            },
            indeed: {
                name: 'Indeed',
                patterns: [
                    /indeed\.com\/viewjob/,
                    /indeed\.com\/jobs/,
                    /indeed\.com\/job\//
                ],
                icon: 'https://cdn-icons-png.flaticon.com/24/5969/5969158.png'
            },
            glassdoor: {
                name: 'Glassdoor',
                patterns: [
                    /glassdoor\.com\/job-listing/,
                    /glassdoor\.com\/Job\//
                ],
                icon: 'https://cdn-icons-png.flaticon.com/24/5969/5969107.png'
            },
            ziprecruiter: {
                name: 'ZipRecruiter',
                patterns: [
                    /ziprecruiter\.com\/jobs/,
                    /ziprecruiter\.com\/c\//
                ],
                icon: null
            },
            monster: {
                name: 'Monster',
                patterns: [
                    /monster\.com\/job-openings/,
                    /monster\.com\/jobs/
                ],
                icon: null
            },
            dice: {
                name: 'Dice',
                patterns: [
                    /dice\.com\/job-detail/,
                    /dice\.com\/jobs/
                ],
                icon: null
            },
            simplyhired: {
                name: 'SimplyHired',
                patterns: [
                    /simplyhired\.com\/job/,
                    /simplyhired\.com\/search/
                ],
                icon: null
            },
            careerbuilder: {
                name: 'CareerBuilder',
                patterns: [
                    /careerbuilder\.com\/job/
                ],
                icon: null
            },
            greenhouse: {
                name: 'Greenhouse',
                patterns: [
                    /greenhouse\.io\/.*\/jobs/,
                    /boards\.greenhouse\.io/
                ],
                icon: null
            },
            lever: {
                name: 'Lever',
                patterns: [
                    /lever\.co\/.*\//,
                    /jobs\.lever\.co/
                ],
                icon: null
            },
            workday: {
                name: 'Workday',
                patterns: [
                    /myworkdayjobs\.com/,
                    /wd\d+\.myworkdayjobs\.com/
                ],
                icon: null
            },
            builtin: {
                name: 'Built In',
                patterns: [
                    /builtin\.com\/job/
                ],
                icon: null
            }
        };

        this.cachedJobs = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Get API key from localStorage (server has fallback if null)
     * @returns {string|null} - API key or null (server will use its own)
     * @private
     */
    _getApiKey() {
        // Return local key if available, otherwise null (server will use its fallback)
        return localStorage.getItem('claude_api_key') || null;
    }

    /**
     * Validate and identify job URL source
     * @param {string} url - Job posting URL
     * @returns {Object|null} - Site info or null if not supported
     */
    identifySite(url) {
        try {
            const urlObj = new URL(url);
            for (const [key, site] of Object.entries(this.supportedSites)) {
                if (site.patterns.some(pattern => pattern.test(url))) {
                    return { id: key, ...site };
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Check if URL is a supported job posting
     * @param {string} url - URL to check
     * @returns {boolean}
     */
    isSupported(url) {
        return this.identifySite(url) !== null;
    }

    /**
     * Get list of supported sites
     * @returns {Array} - List of supported site names
     */
    getSupportedSites() {
        return Object.values(this.supportedSites).map(s => s.name);
    }

    /**
     * Fetch job posting content from URL
     * @param {string} url - Job posting URL
     * @returns {Promise<Object>} - Fetched job content
     */
    async fetchJobPosting(url) {
        // Check cache first
        const cached = this.cachedJobs.get(url);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const site = this.identifySite(url);
        if (!site) {
            throw new Error(`Unsupported job site. Supported sites: ${this.getSupportedSites().join(', ')}`);
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, site: site.id })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Failed to fetch job posting (${response.status})`);
            }

            const data = await response.json();

            // Cache the result
            this.cachedJobs.set(url, {
                timestamp: Date.now(),
                data: data
            });

            return data;
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('Job fetch failed:', error);
            throw error;
        }
    }

    /**
     * Parse job content using AI
     * @param {string} jobContent - Raw job posting content
     * @returns {Promise<Object>} - Parsed job data
     */
    async parseJobContent(jobContent) {
        const prompt = `Analyze this job posting and extract key information. Return ONLY valid JSON without any markdown formatting or code blocks.

Job Posting:
${jobContent}

Extract the following and return as JSON:
{
  "jobTitle": "extracted job title",
  "company": "company name",
  "location": "job location",
  "workType": "remote/hybrid/onsite",
  "salaryRange": "salary if mentioned",
  "experienceLevel": "entry/mid/senior/executive",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "qualifications": ["qualification1", "qualification2"],
  "benefits": ["benefit1", "benefit2"],
  "keywords": ["important keyword1", "keyword2"],
  "industry": "industry sector",
  "department": "department if mentioned",
  "reportingTo": "manager title if mentioned",
  "teamSize": "team size if mentioned",
  "travelRequired": "travel requirements if mentioned",
  "deadline": "application deadline if mentioned",
  "summary": "2-3 sentence summary of the role"
}

Important: Return ONLY the JSON object, no other text or formatting.`;

        try {
            const response = await fetch(this.generateEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    apiKey: this._getApiKey(),
                    maxTokens: 2048,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to parse job content');
            }

            const data = await response.json();

            // Parse the JSON response
            try {
                const jsonMatch = data.content.match(/\{[\s\S]*\}/);
                const jsonText = jsonMatch ? jsonMatch[0] : data.content;
                return JSON.parse(jsonText);
            } catch (parseError) {
                if (typeof logger !== 'undefined') logger.error('JSON parse error:', parseError);
                throw new Error('Failed to parse job data from AI response');
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('Job parsing failed:', error);
            throw error;
        }
    }

    /**
     * Full pipeline: fetch URL and parse content
     * @param {string} url - Job posting URL
     * @returns {Promise<Object>} - Complete parsed job data
     */
    async fetchAndParse(url) {
        const site = this.identifySite(url);
        if (!site) {
            throw new Error(`Unsupported job site. Please paste the job description text instead.`);
        }

        try {
            // First, try to fetch the job posting
            const fetchResult = await this.fetchJobPosting(url);

            if (!fetchResult.content || fetchResult.content.trim().length < 100) {
                throw new Error('Could not extract job content from URL. Please paste the job description text instead.');
            }

            // Parse the content with AI
            const parsedJob = await this.parseJobContent(fetchResult.content);

            return {
                success: true,
                source: {
                    url,
                    site: site.name,
                    fetchedAt: new Date().toISOString()
                },
                raw: fetchResult.content,
                parsed: parsedJob
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                source: {
                    url,
                    site: site ? site.name : 'Unknown'
                }
            };
        }
    }

    /**
     * Parse job description text directly (without URL)
     * @param {string} jobDescription - Job description text
     * @returns {Promise<Object>} - Parsed job data
     */
    async parseText(jobDescription) {
        if (!jobDescription || jobDescription.trim().length < 50) {
            throw new Error('Job description is too short. Please provide more details.');
        }

        try {
            const parsedJob = await this.parseJobContent(jobDescription);

            return {
                success: true,
                source: {
                    type: 'text',
                    parsedAt: new Date().toISOString()
                },
                raw: jobDescription,
                parsed: parsedJob
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Clear cached job postings
     */
    clearCache() {
        this.cachedJobs.clear();
    }

    /**
     * Format parsed job data for display
     * @param {Object} jobData - Parsed job data
     * @returns {string} - Formatted display string
     */
    formatForDisplay(jobData) {
        if (!jobData || !jobData.parsed) return '';

        const p = jobData.parsed;
        let display = '';

        if (p.jobTitle) display += `**Position:** ${p.jobTitle}\n`;
        if (p.company) display += `**Company:** ${p.company}\n`;
        if (p.location) display += `**Location:** ${p.location}`;
        if (p.workType) display += ` (${p.workType})`;
        display += '\n';
        if (p.salaryRange) display += `**Salary:** ${p.salaryRange}\n`;
        if (p.experienceLevel) display += `**Level:** ${p.experienceLevel}\n`;

        if (p.summary) {
            display += `\n**Summary:**\n${p.summary}\n`;
        }

        if (p.requiredSkills && p.requiredSkills.length > 0) {
            display += `\n**Required Skills:**\n${p.requiredSkills.map(s => `• ${s}`).join('\n')}\n`;
        }

        if (p.preferredSkills && p.preferredSkills.length > 0) {
            display += `\n**Preferred Skills:**\n${p.preferredSkills.map(s => `• ${s}`).join('\n')}\n`;
        }

        if (p.keywords && p.keywords.length > 0) {
            display += `\n**Key Keywords:** ${p.keywords.join(', ')}\n`;
        }

        return display;
    }
}

// Create global instance
const jobURLParser = new JobURLParser();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JobURLParser, jobURLParser };
}
