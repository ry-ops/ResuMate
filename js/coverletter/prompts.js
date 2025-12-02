// Cover Letter AI Prompt Templates
// Handles AI-powered cover letter generation with Claude API

/**
 * Prompt Templates for Cover Letter Generation
 */
const CoverLetterPrompts = {
    /**
     * Generate a cover letter from scratch
     * @param {Object} params - Parameters for cover letter generation
     * @param {string} params.jobTitle - Target job title
     * @param {string} params.companyName - Company name
     * @param {string} params.jobDescription - Full job description
     * @param {string} params.resumeSummary - Summary of resume/experience
     * @param {string} params.tone - professional/conversational/enthusiastic
     * @param {number} params.length - Target word count (150/250/400)
     * @param {string} params.focus - skills/experience/culture-fit/story
     * @param {string} params.openingStyle - traditional/hook/achievement
     * @param {string} params.howFound - How they found the job (optional)
     * @param {string} params.contactName - Hiring manager name (optional)
     * @returns {string} - Claude API prompt
     */
    generateCoverLetter: ({
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
    }) => {
        const toneInstructions = {
            professional: 'formal, polished, and highly professional',
            conversational: 'warm and personable while remaining professional',
            enthusiastic: 'energetic and passionate while maintaining professionalism'
        };

        const focusInstructions = {
            skills: 'Emphasize technical skills and core competencies that match the job requirements',
            experience: 'Highlight relevant work experience and proven track record',
            'culture-fit': 'Focus on alignment with company values and cultural fit',
            story: 'Tell a compelling personal story that connects to the role'
        };

        const openingInstructions = {
            traditional: 'Start with a traditional greeting and statement of interest',
            hook: 'Open with a compelling hook that immediately grabs attention',
            achievement: 'Lead with a key achievement or credential that establishes credibility'
        };

        const contactGreeting = contactName
            ? `Address the letter to ${contactName}.`
            : 'Use "Dear Hiring Manager" if no specific contact name is provided.';

        const sourceNote = howFound
            ? `\nMention that you found this position through: ${howFound}`
            : '';

        return `You are an expert career coach specializing in compelling cover letters.

Generate a professional cover letter for the following job application:

JOB DETAILS:
- Position: ${jobTitle}
- Company: ${companyName}
- Job Description: ${jobDescription}

CANDIDATE BACKGROUND:
${resumeSummary}

CUSTOMIZATION REQUIREMENTS:
- Tone: ${toneInstructions[tone]}
- Target Length: Approximately ${length} words
- Primary Focus: ${focusInstructions[focus]}
- Opening Style: ${openingInstructions[openingStyle]}
- Greeting: ${contactGreeting}${sourceNote}

STRUCTURE (5 paragraphs):
1. OPENING (2-3 sentences):
   - Greeting and position title
   - Brief hook that grabs attention
   - How you found the position (if applicable)
   - Clear statement of interest

2. RELEVANT EXPERIENCE (3-4 sentences):
   - Most relevant experience that matches job requirements
   - Specific examples demonstrating capabilities
   - Connect past work to job responsibilities
   - Use concrete details, not generalities

3. KEY SKILLS & ACHIEVEMENTS (3-4 sentences):
   - Highlight 2-3 key skills from job description
   - Include quantifiable achievements when possible
   - Show impact and results
   - Demonstrate value you'll bring

4. COMPANY INTEREST & FIT (2-3 sentences):
   - Explain why THIS company specifically
   - Show knowledge of company's mission/values/products
   - Demonstrate cultural alignment
   - Express genuine enthusiasm

5. CLOSING (2-3 sentences):
   - Thank them for consideration
   - Express eagerness to discuss further
   - Call to action (looking forward to interview)
   - Professional sign-off

CRITICAL REQUIREMENTS:
- Be SPECIFIC to this job and company (no generic statements)
- Include concrete examples and details
- Avoid clichés and overused phrases like "team player", "hard worker", "passionate professional"
- Show, don't tell (use examples to demonstrate qualities)
- Maintain authentic voice throughout
- Every paragraph should add new value
- Make it personal and memorable
- Proofread carefully for errors

WHAT TO AVOID:
- Repeating what's already in the resume
- Generic statements that could apply to any job
- Overused buzzwords
- Exaggeration or false claims
- Negative language or excuses
- Overly formal or stiff language
- Being too casual or familiar

Return ONLY the complete cover letter text, properly formatted with paragraph breaks. Do not include any preamble, explanation, or meta-commentary.`;
    },

    /**
     * Rewrite and improve an existing cover letter
     * @param {Object} params - Parameters for rewriting
     * @param {string} params.currentLetter - Current cover letter text
     * @param {string} params.jobDescription - Target job description
     * @param {string} params.jobTitle - Job title
     * @param {string} params.companyName - Company name
     * @param {string} params.tone - Desired tone
     * @param {number} params.length - Target word count
     * @param {Array<string>} params.improvements - Specific areas to improve
     * @returns {string} - Claude API prompt
     */
    rewriteCoverLetter: ({
        currentLetter,
        jobDescription,
        jobTitle = '',
        companyName = '',
        tone = 'professional',
        length = 250,
        improvements = []
    }) => {
        const toneMap = {
            professional: 'formal and polished',
            conversational: 'warm and personable',
            enthusiastic: 'energetic and passionate'
        };

        const improvementAreas = improvements.length > 0
            ? `\n\nSPECIFIC IMPROVEMENTS REQUESTED:\n${improvements.map(i => `- ${i}`).join('\n')}`
            : '';

        const jobContext = jobTitle && companyName
            ? `\n\nTARGET JOB:\nPosition: ${jobTitle}\nCompany: ${companyName}`
            : '';

        return `You are an expert career coach specializing in cover letter improvement.

Rewrite and significantly improve this cover letter for the target job:

CURRENT COVER LETTER:
${currentLetter}

JOB DESCRIPTION:
${jobDescription}${jobContext}${improvementAreas}

IMPROVEMENT REQUIREMENTS:
- Tone: ${toneMap[tone]}
- Target Length: Approximately ${length} words
- Make it MORE SPECIFIC to this exact role and company
- Replace generic statements with concrete examples
- Add quantifiable achievements where missing
- Strengthen weak opening if needed
- Improve closing call-to-action if needed
- Remove clichés and buzzwords
- Ensure every sentence adds value

SPECIFIC ISSUES TO ADDRESS:
1. Generic Statements: Replace phrases that could apply to any job with specific details
2. Weak Verbs: Change passive or weak verbs to strong action verbs
3. Missing Impact: Add metrics, outcomes, and results where they're missing
4. Poor Opening: If the opening doesn't grab attention, rewrite it compellingly
5. Vague Closing: Ensure closing has clear call-to-action and enthusiasm
6. Resume Repetition: If it just repeats resume, add new context or angles
7. Company Knowledge: Show deeper understanding of the company's mission/challenges
8. Keyword Optimization: Naturally incorporate keywords from job description

MAINTAIN:
- The core facts and truthfulness
- The candidate's authentic voice
- Professional tone throughout

STRUCTURE GUIDELINES:
- Opening: Immediately engaging, states position and interest clearly
- Body Paragraphs: Each focused on a different aspect (experience, skills, fit)
- Closing: Strong call-to-action with clear next steps

Return ONLY the improved cover letter text, properly formatted with paragraph breaks. Do not include any preamble, commentary, or explanations about what you changed.`;
    },

    /**
     * Tailor an existing cover letter for a different job
     * @param {Object} params - Parameters for tailoring
     * @param {string} params.originalLetter - Original cover letter text
     * @param {string} params.newJobDescription - New target job description
     * @param {string} params.newJobTitle - New job title
     * @param {string} params.newCompanyName - New company name
     * @param {string} params.oldJobTitle - Original job title (optional)
     * @param {string} params.oldCompanyName - Original company name (optional)
     * @returns {string} - Claude API prompt
     */
    tailorCoverLetter: ({
        originalLetter,
        newJobDescription,
        newJobTitle,
        newCompanyName,
        oldJobTitle = '',
        oldCompanyName = ''
    }) => {
        const transitionNote = oldJobTitle && oldCompanyName
            ? `\nNOTE: This letter was originally written for ${oldJobTitle} at ${oldCompanyName}. Update it for the new position.`
            : '';

        return `You are an expert career coach specializing in tailoring cover letters for specific opportunities.

Adapt this cover letter for a different job opportunity:

ORIGINAL COVER LETTER:
${originalLetter}

NEW TARGET JOB:
- Position: ${newJobTitle}
- Company: ${newCompanyName}
- Job Description: ${newJobDescription}${transitionNote}

TAILORING REQUIREMENTS:
1. Update all company-specific references to ${newCompanyName}
2. Update position title references to ${newJobTitle}
3. Modify examples to emphasize skills/experience relevant to NEW job requirements
4. Adjust skills emphasis based on new job description
5. Research and incorporate ${newCompanyName}'s mission, values, or recent news if mentioned in job description
6. Rewrite company interest paragraph specifically for ${newCompanyName}
7. Ensure all examples and achievements align with new role's requirements
8. Maintain the same overall structure and tone
9. Keep length similar to original

WHAT TO PRESERVE:
- The candidate's authentic voice and writing style
- The overall professional quality
- Strong opening and closing (adjust content, not style)
- Core achievements (reframe for new context)

WHAT TO CHANGE:
- All mentions of previous company → ${newCompanyName}
- All mentions of previous role → ${newJobTitle}
- Examples that don't match new requirements → more relevant examples
- Skills emphasis → align with new job's priorities
- Company interest section → completely rewrite for ${newCompanyName}

CRITICAL: This should NOT feel like a generic cover letter. It must read as if it was written specifically for ${newJobTitle} at ${newCompanyName} from the start.

Return ONLY the tailored cover letter text, properly formatted with paragraph breaks. Do not include any preamble, explanation, or notes about what you changed.`;
    },

    /**
     * Generate template-based cover letter with fill-in-the-blanks
     * @param {Object} params - Parameters for template generation
     * @param {string} params.templateType - Template type (traditional/modern/career-changer/etc)
     * @param {Object} params.variables - Variables to fill in the template
     * @returns {string} - Claude API prompt (for dynamic template generation)
     */
    generateTemplateContent: ({ templateType, variables = {} }) => {
        const {
            jobTitle = '[Job Title]',
            companyName = '[Company Name]',
            candidateName = '[Your Name]',
            yearsExperience = '[X years]',
            keySkill1 = '[Key Skill 1]',
            keySkill2 = '[Key Skill 2]',
            achievement1 = '[Achievement 1]',
            achievement2 = '[Achievement 2]',
            whyCompany = '[Why this company]'
        } = variables;

        const templateInstructions = {
            traditional: 'formal, conservative structure suitable for corporate roles',
            modern: 'conversational yet professional, suitable for startups and tech companies',
            'career-changer': 'emphasizes transferable skills and explains career transition',
            'entry-level': 'focuses on education, internships, and potential rather than extensive experience',
            executive: 'emphasizes leadership, strategic vision, and high-level impact',
            creative: 'showcases personality and unique approach for creative industries',
            technical: 'emphasizes technical expertise and problem-solving capabilities',
            referral: 'leverages a personal connection or referral'
        };

        return `Generate a ${templateType} cover letter template with the following structure:

TEMPLATE TYPE: ${templateInstructions[templateType] || 'professional'}

VARIABLES TO INCORPORATE:
- Job Title: ${jobTitle}
- Company: ${companyName}
- Candidate Name: ${candidateName}
- Experience: ${yearsExperience}
- Key Skill 1: ${keySkill1}
- Key Skill 2: ${keySkill2}
- Achievement 1: ${achievement1}
- Achievement 2: ${achievement2}
- Why This Company: ${whyCompany}

Create a complete, professional cover letter using these variables. Make it specific and compelling, not generic.

Return ONLY the complete cover letter text with the variables filled in appropriately.`;
    },

    /**
     * Analyze cover letter quality and provide feedback
     * @param {Object} params - Parameters for analysis
     * @param {string} params.coverLetter - Cover letter text to analyze
     * @param {string} params.jobDescription - Target job description
     * @returns {string} - Claude API prompt
     */
    analyzeCoverLetter: ({ coverLetter, jobDescription = '' }) => {
        const jobContext = jobDescription
            ? `\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`
            : '';

        return `You are an expert career coach and cover letter reviewer.

Analyze this cover letter and provide detailed feedback:

COVER LETTER:
${coverLetter}${jobContext}

Evaluate the following aspects and return as JSON:

{
  "overallScore": 0-100,
  "wordCount": number,
  "strengths": [
    "List specific strengths"
  ],
  "weaknesses": [
    "List specific weaknesses"
  ],
  "scores": {
    "opening": 0-100,
    "specificity": 0-100,
    "relevance": 0-100,
    "impact": 0-100,
    "closing": 0-100,
    "tone": 0-100,
    "grammar": 0-100
  },
  "issues": [
    {
      "type": "generic|cliche|weak_verb|repetitive|error",
      "severity": "high|medium|low",
      "text": "problematic text",
      "message": "explanation",
      "suggestion": "how to fix"
    }
  ],
  "suggestions": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ],
  "keywordAlignment": {
    "present": ["keywords found in letter"],
    "missing": ["important keywords from job description not in letter"]
  }
}

Be thorough and constructive. Focus on actionable feedback.

Return ONLY valid JSON without any markdown formatting or code blocks.`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoverLetterPrompts;
}
