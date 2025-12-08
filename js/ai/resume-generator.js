/**
 * Resume Generator Module
 * Full resume generation from scratch using AI and user profile data
 * Supports three modes: generate from scratch, update/modernize existing, optimize for job
 */

class ResumeGenerator {
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
            maxTokens = 3072,
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
     * MODE 1: Generate complete resume from user profile
     * @param {Object} profileData - User profile data
     * @returns {Promise<Object>} - Generated resume structure
     */
    async generateResume(profileData) {
        const {
            name,
            title,
            email,
            phone,
            location,
            linkedin,
            website,
            experience = [],
            education = [],
            skills = [],
            certifications = [],
            projects = [],
            achievements = [],
            languages = [],
            volunteering = [],
            targetRole = '',
            targetIndustry = '',
            template = 'modern'
        } = profileData;

        // Validate required fields
        if (!name || !title) {
            throw new Error('Name and professional title are required to generate a resume');
        }

        if (!experience || experience.length === 0) {
            throw new Error('At least one work experience entry is required');
        }

        try {
            if (typeof logger !== 'undefined') logger.info('[ResumeGenerator] Generating resume from profile...');

            // Build prompt for complete resume generation
            const prompt = this._buildGenerateResumePrompt(profileData);

            // Make API request
            const content = await this._makeRequest(prompt, {
                maxTokens: 4096,
                temperature: 0.7
            });

            // Parse JSON response containing structured resume data
            const resumeData = this._parseJSON(content);

            // Convert to ATSFlow state format
            const resumeState = this._convertToResumeState(resumeData, profileData, template);

            // Record generation
            const generation = {
                id: this._generateId(),
                mode: 'generate_from_scratch',
                timestamp: new Date().toISOString(),
                params: {
                    name,
                    title,
                    targetRole,
                    targetIndustry,
                    template
                },
                result: resumeState
            };

            this.generationHistory.push(generation);
            this._saveHistory();

            if (typeof logger !== 'undefined') logger.info('[ResumeGenerator] Resume generated successfully');

            return {
                success: true,
                resumeState,
                metadata: {
                    generatedAt: generation.timestamp,
                    generationId: generation.id,
                    mode: 'generate_from_scratch',
                    sectionsGenerated: resumeState.sections.length
                }
            };
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Generation failed:', error);
            return {
                success: false,
                error: error.message,
                resumeState: null
            };
        }
    }

    /**
     * MODE 2: Update/modernize existing resume
     * @param {Object} existingResume - Existing resume state or text
     * @param {Object} options - Update options
     * @returns {Promise<Object>} - Updated resume structure
     */
    async updateResume(existingResume, options = {}) {
        const {
            modernize = true,
            improveLanguage = true,
            addMetrics = true,
            targetRole = '',
            targetIndustry = ''
        } = options;

        try {
            if (typeof logger !== 'undefined') logger.info('[ResumeGenerator] Updating existing resume...');

            // Extract text from resume state or use provided text
            const resumeText = this._extractResumeText(existingResume);

            // Build prompt for resume update
            const prompt = this._buildUpdateResumePrompt(resumeText, options);

            // Make API request
            const content = await this._makeRequest(prompt, {
                maxTokens: 4096,
                temperature: 0.7
            });

            // Parse JSON response
            const resumeData = this._parseJSON(content);

            // Convert to ATSFlow state format
            const resumeState = this._convertToResumeState(resumeData, {}, existingResume.template || 'modern');

            // Record generation
            const generation = {
                id: this._generateId(),
                mode: 'update_existing',
                timestamp: new Date().toISOString(),
                params: {
                    modernize,
                    improveLanguage,
                    addMetrics,
                    targetRole,
                    targetIndustry
                },
                result: resumeState
            };

            this.generationHistory.push(generation);
            this._saveHistory();

            if (typeof logger !== 'undefined') logger.info('[ResumeGenerator] Resume updated successfully');

            return {
                success: true,
                resumeState,
                metadata: {
                    generatedAt: generation.timestamp,
                    generationId: generation.id,
                    mode: 'update_existing',
                    improvements: Object.entries(options).filter(([k, v]) => v === true).map(([k]) => k)
                }
            };
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Update failed:', error);
            return {
                success: false,
                error: error.message,
                resumeState: existingResume
            };
        }
    }

    /**
     * MODE 3: Modernize resume for current standards
     * @param {Object} oldResume - Old resume state or text
     * @returns {Promise<Object>} - Modernized resume structure
     */
    async modernizeResume(oldResume) {
        return this.updateResume(oldResume, {
            modernize: true,
            improveLanguage: true,
            addMetrics: true
        });
    }

    /**
     * MODE 4: Optimize resume for specific job
     * @param {Object} resume - Resume state
     * @param {string} jobDescription - Job description
     * @param {Object} options - Optimization options
     * @returns {Promise<Object>} - Optimized resume structure
     */
    async optimizeForJob(resume, jobDescription, options = {}) {
        const {
            jobTitle = '',
            companyName = '',
            emphasizeSkills = [],
            preserveStructure = true
        } = options;

        if (!jobDescription || jobDescription.trim().length === 0) {
            throw new Error('Job description is required to optimize resume');
        }

        try {
            if (typeof logger !== 'undefined') logger.info('[ResumeGenerator] Optimizing resume for job...');

            // Extract resume text
            const resumeText = this._extractResumeText(resume);

            // Build prompt for job optimization
            const prompt = this._buildOptimizeForJobPrompt(resumeText, jobDescription, options);

            // Make API request
            const content = await this._makeRequest(prompt, {
                maxTokens: 4096,
                temperature: 0.6
            });

            // Parse JSON response
            const resumeData = this._parseJSON(content);

            // Convert to ATSFlow state format
            const resumeState = this._convertToResumeState(resumeData, {}, resume.template || 'modern');

            // Record generation
            const generation = {
                id: this._generateId(),
                mode: 'optimize_for_job',
                timestamp: new Date().toISOString(),
                params: {
                    jobTitle,
                    companyName,
                    emphasizeSkills,
                    preserveStructure
                },
                result: resumeState
            };

            this.generationHistory.push(generation);
            this._saveHistory();

            if (typeof logger !== 'undefined') logger.info('[ResumeGenerator] Resume optimized successfully');

            return {
                success: true,
                resumeState,
                metadata: {
                    generatedAt: generation.timestamp,
                    generationId: generation.id,
                    mode: 'optimize_for_job',
                    jobTitle,
                    companyName
                }
            };
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Optimization failed:', error);
            return {
                success: false,
                error: error.message,
                resumeState: resume
            };
        }
    }

    /**
     * Generate a specific section of the resume
     * @param {string} sectionType - Type of section (summary, experience, education, skills, etc.)
     * @param {Object} data - Data for the section
     * @returns {Promise<Object>} - Generated section content
     */
    async generateSection(sectionType, data) {
        try {
            if (typeof logger !== 'undefined') logger.info(`[ResumeGenerator] Generating ${sectionType} section...`);

            const prompt = this._buildSectionPrompt(sectionType, data);

            const content = await this._makeRequest(prompt, {
                maxTokens: 1024,
                temperature: 0.7
            });

            // Parse section content
            const sectionContent = this._parseSectionContent(sectionType, content);

            return {
                success: true,
                content: sectionContent,
                metadata: {
                    sectionType,
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error(`[ResumeGenerator] Section generation failed:`, error);
            return {
                success: false,
                error: error.message,
                content: null
            };
        }
    }

    /**
     * Build prompt for complete resume generation
     * @param {Object} profileData - Profile data
     * @returns {string} - Prompt text
     * @private
     */
    _buildGenerateResumePrompt(profileData) {
        const {
            name, title, email, phone, location, linkedin, website,
            experience, education, skills, certifications, projects,
            achievements, languages, volunteering, targetRole, targetIndustry
        } = profileData;

        return `You are an expert resume writer. Generate a professional, ATS-friendly resume based on the following profile data.

USER PROFILE:
Name: ${name}
Current Title: ${title}
${targetRole ? `Target Role: ${targetRole}` : ''}
${targetIndustry ? `Target Industry: ${targetIndustry}` : ''}

CONTACT INFORMATION:
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}
Location: ${location || 'Not provided'}
LinkedIn: ${linkedin || 'Not provided'}
Website: ${website || 'Not provided'}

WORK EXPERIENCE:
${this._formatExperience(experience)}

EDUCATION:
${this._formatEducation(education)}

SKILLS:
${skills.join(', ') || 'Not provided'}

${certifications.length > 0 ? `CERTIFICATIONS:\n${this._formatCertifications(certifications)}` : ''}

${projects.length > 0 ? `PROJECTS:\n${this._formatProjects(projects)}` : ''}

${achievements.length > 0 ? `ACHIEVEMENTS:\n${achievements.join('\n')}` : ''}

${languages.length > 0 ? `LANGUAGES:\n${this._formatLanguages(languages)}` : ''}

${volunteering.length > 0 ? `VOLUNTEERING:\n${this._formatVolunteering(volunteering)}` : ''}

INSTRUCTIONS:
1. Create a compelling professional summary (3-4 lines) that highlights key strengths and career focus
2. Transform all work experience into achievement-focused bullet points with quantified results
3. Use strong action verbs and industry-appropriate keywords
4. Ensure ATS compatibility with clear section headers and standard formatting
5. Optimize for ${targetRole || title} role${targetIndustry ? ` in ${targetIndustry} industry` : ''}
6. Make the resume compelling and results-oriented

Return the response as a JSON object with this structure:
{
  "header": {
    "name": "Full Name",
    "title": "Professional Title",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state",
    "linkedin": "linkedin url",
    "website": "website url"
  },
  "summary": "Professional summary text...",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "date": "Month Year - Present/Month Year",
      "bullets": ["Achievement bullet 1", "Achievement bullet 2", ...]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "location": "City, State",
      "date": "Graduation Year",
      "gpa": "GPA (if provided)",
      "honors": "Honors (if provided)"
    }
  ],
  "skills": ["skill1", "skill2", ...],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Month Year"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "date": "Month Year",
      "description": "Brief description",
      "bullets": ["Detail 1", "Detail 2", ...]
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2", ...],
  "languages": [
    {
      "name": "Language",
      "proficiency": "Proficiency Level"
    }
  ],
  "volunteering": [
    {
      "role": "Role",
      "organization": "Organization Name",
      "date": "Month Year - Month Year",
      "bullets": ["Activity 1", "Activity 2", ...]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.`;
    }

    /**
     * Build prompt for resume update
     * @param {string} resumeText - Existing resume text
     * @param {Object} options - Update options
     * @returns {string} - Prompt text
     * @private
     */
    _buildUpdateResumePrompt(resumeText, options) {
        const {
            modernize, improveLanguage, addMetrics, targetRole, targetIndustry
        } = options;

        return `You are an expert resume writer. Update and improve this existing resume based on modern best practices.

EXISTING RESUME:
${resumeText}

UPDATE REQUIREMENTS:
${modernize ? '- Modernize the format and language for current standards' : ''}
${improveLanguage ? '- Strengthen language with powerful action verbs and industry keywords' : ''}
${addMetrics ? '- Add or enhance quantified metrics and measurable achievements' : ''}
${targetRole ? `- Optimize for ${targetRole} role` : ''}
${targetIndustry ? `- Tailor for ${targetIndustry} industry` : ''}

INSTRUCTIONS:
1. Maintain the core content and truthfulness
2. Enhance achievement-focused bullet points with quantified results
3. Use strong, modern action verbs
4. Ensure ATS compatibility
5. Remove outdated phrases or formatting
6. Focus on impact and results

Return the updated resume in the same JSON structure format as the original generation, preserving all sections.

IMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.`;
    }

    /**
     * Build prompt for job optimization
     * @param {string} resumeText - Resume text
     * @param {string} jobDescription - Job description
     * @param {Object} options - Optimization options
     * @returns {string} - Prompt text
     * @private
     */
    _buildOptimizeForJobPrompt(resumeText, jobDescription, options) {
        const { jobTitle, companyName, emphasizeSkills, preserveStructure } = options;

        return `You are an expert resume writer. Optimize this resume for a specific job opening.

CURRENT RESUME:
${resumeText}

JOB POSTING:
${jobTitle ? `Job Title: ${jobTitle}` : ''}
${companyName ? `Company: ${companyName}` : ''}

Job Description:
${jobDescription}

${emphasizeSkills.length > 0 ? `SKILLS TO EMPHASIZE:\n${emphasizeSkills.join(', ')}` : ''}

OPTIMIZATION INSTRUCTIONS:
1. Tailor the professional summary to match the job requirements
2. Reorder and emphasize relevant experience and skills
3. Incorporate keywords from the job description naturally
4. Highlight achievements that align with job responsibilities
5. ${preserveStructure ? 'Maintain the overall structure and truthfulness' : 'Reorganize sections for maximum impact'}
6. Ensure strong ATS compatibility with job-specific keywords

Return the optimized resume in the same JSON structure format.

IMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.`;
    }

    /**
     * Build prompt for section generation
     * @param {string} sectionType - Section type
     * @param {Object} data - Section data
     * @returns {string} - Prompt text
     * @private
     */
    _buildSectionPrompt(sectionType, data) {
        const prompts = {
            summary: `Generate a compelling professional summary (3-4 sentences) for:
Title: ${data.title || 'Professional'}
Experience: ${data.yearsExperience || 'Multiple'} years
Key Skills: ${data.skills?.join(', ') || 'Various skills'}
Career Focus: ${data.careerFocus || 'Career advancement'}

Make it achievement-focused and industry-appropriate. Return only the summary text.`,

            experience: `Generate 3-5 achievement-focused bullet points for this work experience:
Job Title: ${data.title}
Company: ${data.company}
Responsibilities: ${data.responsibilities || data.description}

Use strong action verbs, quantify results where possible, and focus on impact. Return only the bullet points, one per line, starting with "- ".`,

            skills: `Organize these skills into categories (Technical Skills, Soft Skills, Tools & Technologies):
${data.skills?.join(', ')}

Return as JSON: { "technical": [], "soft": [], "tools": [] }`
        };

        return prompts[sectionType] || `Generate content for ${sectionType} section with provided data: ${JSON.stringify(data)}`;
    }

    /**
     * Parse section content based on type
     * @param {string} sectionType - Section type
     * @param {string} content - Generated content
     * @returns {Object} - Parsed section content
     * @private
     */
    _parseSectionContent(sectionType, content) {
        if (sectionType === 'summary') {
            return { text: content.trim() };
        }

        if (sectionType === 'experience') {
            return {
                bullets: content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('-'))
                    .map(line => line.substring(1).trim())
            };
        }

        if (sectionType === 'skills') {
            try {
                return this._parseJSON(content);
            } catch {
                return { items: content.split(',').map(s => s.trim()) };
            }
        }

        return { text: content };
    }

    /**
     * Convert API response to ATSFlow state format
     * @param {Object} resumeData - Parsed resume data from API
     * @param {Object} profileData - Original profile data
     * @param {string} template - Template name
     * @returns {Object} - Resume state
     * @private
     */
    _convertToResumeState(resumeData, profileData = {}, template = 'modern') {
        const sections = [];

        // Header section
        if (resumeData.header) {
            sections.push({
                id: this._generateId(),
                type: 'header',
                name: 'Header',
                content: resumeData.header
            });
        }

        // Summary section
        if (resumeData.summary) {
            sections.push({
                id: this._generateId(),
                type: 'summary',
                name: 'Professional Summary',
                content: { text: resumeData.summary }
            });
        }

        // Experience section
        if (resumeData.experience && resumeData.experience.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'experience',
                name: 'Work Experience',
                content: { items: resumeData.experience }
            });
        }

        // Education section
        if (resumeData.education && resumeData.education.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'education',
                name: 'Education',
                content: { items: resumeData.education }
            });
        }

        // Skills section
        if (resumeData.skills && resumeData.skills.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'skills',
                name: 'Skills',
                content: { items: resumeData.skills }
            });
        }

        // Certifications section
        if (resumeData.certifications && resumeData.certifications.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'certifications',
                name: 'Certifications',
                content: { items: resumeData.certifications }
            });
        }

        // Projects section
        if (resumeData.projects && resumeData.projects.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'projects',
                name: 'Projects',
                content: { items: resumeData.projects }
            });
        }

        // Achievements section
        if (resumeData.achievements && resumeData.achievements.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'achievements',
                name: 'Achievements',
                content: { items: resumeData.achievements }
            });
        }

        // Languages section
        if (resumeData.languages && resumeData.languages.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'languages',
                name: 'Languages',
                content: { items: resumeData.languages }
            });
        }

        // Volunteering section
        if (resumeData.volunteering && resumeData.volunteering.length > 0) {
            sections.push({
                id: this._generateId(),
                type: 'volunteering',
                name: 'Volunteering',
                content: { items: resumeData.volunteering }
            });
        }

        return {
            sections,
            template,
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                generatedBy: 'ATSFlow AI'
            }
        };
    }

    /**
     * Extract resume text from state or raw text
     * @param {Object|string} resume - Resume state or text
     * @returns {string} - Resume text
     * @private
     */
    _extractResumeText(resume) {
        if (typeof resume === 'string') {
            return resume;
        }

        if (resume.sections) {
            return resume.sections.map(section => {
                let text = `${section.name}\n`;
                const content = section.content || {};

                if (content.text) {
                    text += content.text + '\n';
                }

                if (content.items) {
                    content.items.forEach(item => {
                        if (typeof item === 'string') {
                            text += `- ${item}\n`;
                        } else {
                            text += JSON.stringify(item, null, 2) + '\n';
                        }
                    });
                }

                return text;
            }).join('\n\n');
        }

        return JSON.stringify(resume, null, 2);
    }

    /**
     * Format experience for prompt
     * @param {Array} experience - Experience array
     * @returns {string} - Formatted text
     * @private
     */
    _formatExperience(experience) {
        if (!experience || experience.length === 0) return 'No experience provided';

        return experience.map(exp => {
            let text = `${exp.title || 'Position'} at ${exp.company || 'Company'}\n`;
            text += `${exp.location || ''} | ${exp.date || exp.startDate + ' - ' + (exp.endDate || 'Present')}\n`;
            if (exp.description) text += `${exp.description}\n`;
            if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
                text += exp.responsibilities.map(r => `- ${r}`).join('\n') + '\n';
            }
            return text;
        }).join('\n');
    }

    /**
     * Format education for prompt
     * @param {Array} education - Education array
     * @returns {string} - Formatted text
     * @private
     */
    _formatEducation(education) {
        if (!education || education.length === 0) return 'No education provided';

        return education.map(edu => {
            return `${edu.degree || 'Degree'} in ${edu.field || edu.major || 'Field'}\n` +
                   `${edu.school || edu.institution || 'Institution'}, ${edu.location || ''}\n` +
                   `${edu.graduationYear || edu.date || ''}\n` +
                   `${edu.gpa ? `GPA: ${edu.gpa}` : ''}${edu.honors ? ` | ${edu.honors}` : ''}`;
        }).join('\n\n');
    }

    /**
     * Format certifications for prompt
     * @param {Array} certifications - Certifications array
     * @returns {string} - Formatted text
     * @private
     */
    _formatCertifications(certifications) {
        return certifications.map(cert => {
            return `${cert.name || cert.title} - ${cert.issuer || cert.organization || ''} (${cert.date || cert.year || ''})`;
        }).join('\n');
    }

    /**
     * Format projects for prompt
     * @param {Array} projects - Projects array
     * @returns {string} - Formatted text
     * @private
     */
    _formatProjects(projects) {
        return projects.map(proj => {
            let text = `${proj.name || proj.title}\n`;
            if (proj.description) text += `${proj.description}\n`;
            if (proj.technologies) text += `Technologies: ${proj.technologies.join(', ')}\n`;
            return text;
        }).join('\n');
    }

    /**
     * Format languages for prompt
     * @param {Array} languages - Languages array
     * @returns {string} - Formatted text
     * @private
     */
    _formatLanguages(languages) {
        return languages.map(lang => {
            if (typeof lang === 'string') return lang;
            return `${lang.name || lang.language}: ${lang.proficiency || lang.level || 'Proficient'}`;
        }).join('\n');
    }

    /**
     * Format volunteering for prompt
     * @param {Array} volunteering - Volunteering array
     * @returns {string} - Formatted text
     * @private
     */
    _formatVolunteering(volunteering) {
        return volunteering.map(vol => {
            return `${vol.role || vol.position} at ${vol.organization}\n${vol.date || ''}\n${vol.description || ''}`;
        }).join('\n\n');
    }

    /**
     * Parse JSON from AI response
     * @param {string} content - Content to parse
     * @returns {Object} - Parsed JSON
     * @private
     */
    _parseJSON(content) {
        try {
            // Remove markdown code blocks if present
            let cleaned = content.trim();
            cleaned = cleaned.replace(/```json\s*/g, '');
            cleaned = cleaned.replace(/```\s*/g, '');
            cleaned = cleaned.trim();

            // Remove any leading/trailing text before first { and after last }
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }

            return JSON.parse(cleaned);
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Failed to parse JSON:', error);
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Content:', content);
            throw new Error('Failed to parse AI response as JSON: ' + error.message);
        }
    }

    /**
     * Generate unique ID
     * @returns {string} - Unique ID
     * @private
     */
    _generateId() {
        return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save generation history to localStorage
     * @private
     */
    _saveHistory() {
        try {
            // Keep only last 10 generations
            const recentHistory = this.generationHistory.slice(-10);
            localStorage.setItem('resume_generation_history', JSON.stringify(recentHistory));
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Failed to save history:', error);
        }
    }

    /**
     * Load generation history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('resume_generation_history');
            if (saved) {
                this.generationHistory = JSON.parse(saved);
            }
        } catch (error) {
            if (typeof logger !== 'undefined') logger.error('[ResumeGenerator] Failed to load history:', error);
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
        localStorage.removeItem('resume_generation_history');
    }
}

// Create global instance
const resumeGenerator = new ResumeGenerator();

// Load history on initialization
if (typeof window !== 'undefined') {
    resumeGenerator.loadHistory();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResumeGenerator, resumeGenerator };
}
