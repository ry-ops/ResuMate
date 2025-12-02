// AI Prompt Templates for Resume Content Generation
// Handles various resume writing scenarios with Claude AI

/**
 * Prompt Templates for Resume Content Generation
 */
const AIPrompts = {
    /**
     * Generate a professional summary for a resume
     * @param {Object} params - Parameters for summary generation
     * @param {string} params.jobTitle - Current or target job title
     * @param {number} params.yearsExp - Years of experience
     * @param {string[]} params.skills - Key skills to highlight
     * @param {string} params.targetRole - Target role/position
     * @param {string} params.industry - Target industry
     * @returns {string} - Claude API prompt
     */
    generateSummary: ({ jobTitle, yearsExp, skills, targetRole, industry = '' }) => {
        const skillsList = Array.isArray(skills) ? skills.join(', ') : skills;
        const industryContext = industry ? ` in the ${industry} industry` : '';

        return `You are an expert resume writer specializing in professional summaries.

Create a compelling professional summary for a resume with the following details:
- Current/Previous Role: ${jobTitle}
- Years of Experience: ${yearsExp}
- Key Skills: ${skillsList}
- Target Position: ${targetRole}${industryContext}

Requirements:
1. Write in third-person perspective (no "I" statements)
2. Be concise (3-4 sentences, 50-80 words)
3. Lead with strongest qualifications
4. Include measurable achievements when possible
5. Use industry-relevant keywords
6. Emphasize value proposition for the target role
7. Use powerful action-oriented language

Provide ONLY the professional summary text, without any preamble or explanation.`;
    },

    /**
     * Expand a brief bullet point into a full achievement statement
     * @param {Object} params - Parameters for bullet expansion
     * @param {string} params.userInput - Brief bullet point text
     * @param {string} params.jobTitle - Job title context
     * @param {string} params.industry - Industry context
     * @returns {string} - Claude API prompt
     */
    expandBullet: ({ userInput, jobTitle = '', industry = '' }) => {
        const contextInfo = [];
        if (jobTitle) contextInfo.push(`Job Title: ${jobTitle}`);
        if (industry) contextInfo.push(`Industry: ${industry}`);
        const context = contextInfo.length > 0 ? `\nContext:\n${contextInfo.join('\n')}` : '';

        return `You are an expert resume writer specializing in achievement-based bullet points.

Expand the following brief bullet point into a powerful, achievement-focused statement:

"${userInput}"${context}

Requirements:
1. Use the STAR method (Situation, Task, Action, Result) where applicable
2. Start with a strong action verb
3. Include quantifiable metrics or specific outcomes
4. Be specific and concrete (avoid vague terms)
5. Keep it to 1-2 lines (25-35 words maximum)
6. Focus on impact and results
7. Use past tense for previous roles

Provide 2-3 alternative versions, each on a new line, starting with a dash (-).
Do not include any preamble or explanation.`;
    },

    /**
     * Suggest strong action verbs based on context
     * @param {Object} params - Parameters for action verb suggestions
     * @param {string} params.context - Context or partial sentence
     * @param {string} params.industry - Industry context
     * @param {string} params.jobFunction - Job function (engineering, marketing, sales, etc.)
     * @returns {string} - Claude API prompt
     */
    suggestActionVerbs: ({ context, industry = '', jobFunction = '' }) => {
        const industryInfo = industry ? `\nIndustry: ${industry}` : '';
        const functionInfo = jobFunction ? `\nJob Function: ${jobFunction}` : '';

        return `You are an expert resume writer with deep knowledge of impactful action verbs.

Suggest powerful action verbs for the following context:

"${context}"${industryInfo}${functionInfo}

Requirements:
1. Provide 8-10 strong, specific action verbs
2. Avoid overused weak verbs (like "responsible for", "helped", "worked on")
3. Choose verbs that convey leadership, initiative, and impact
4. Ensure verbs are appropriate for the industry and job function
5. Rank from most to least impactful

Format: Return ONLY a comma-separated list of verbs in past tense.
Example: Spearheaded, Architected, Optimized, Transformed, Orchestrated, Streamlined, Pioneered, Accelerated

Provide your answer without any preamble or explanation.`;
    },

    /**
     * Add quantification to an achievement statement
     * @param {Object} params - Parameters for quantification
     * @param {string} params.achievement - Achievement statement
     * @param {string} params.role - Job role
     * @returns {string} - Claude API prompt
     */
    quantifyAchievement: ({ achievement, role = '' }) => {
        const roleContext = role ? `\nRole: ${role}` : '';

        return `You are an expert resume writer specializing in quantifiable achievements.

Analyze this achievement statement and suggest ways to add specific metrics:

"${achievement}"${roleContext}

Requirements:
1. Identify what could be measured or quantified
2. Suggest realistic metrics based on the role and achievement
3. Include percentages, dollar amounts, time savings, or other specific numbers
4. Provide 3-4 alternative versions with different quantification approaches
5. Use brackets [X%] or [X units] to indicate where specific numbers should go
6. Keep the same core achievement but enhance with metrics

Format: Provide 3-4 rewritten versions, each on a new line starting with a dash (-).
Do not include preamble or explanation.

Example:
- Improved team efficiency by [40%] through implementation of automated testing
- Reduced deployment time from [6 hours] to [30 minutes] by streamlining CI/CD pipeline
- Increased code coverage from [60%] to [95%] across [15] microservices`;
    },

    /**
     * Rewrite content for a specific industry
     * @param {Object} params - Parameters for industry rewrite
     * @param {string} params.content - Original content
     * @param {string} params.targetIndustry - Target industry
     * @param {string} params.currentIndustry - Current/source industry
     * @returns {string} - Claude API prompt
     */
    rewriteForIndustry: ({ content, targetIndustry, currentIndustry = '' }) => {
        const transitionNote = currentIndustry
            ? `\nThis is a career transition from ${currentIndustry} to ${targetIndustry}.`
            : '';

        return `You are an expert resume writer specializing in industry transitions.

Rewrite the following resume content to be more relevant for the ${targetIndustry} industry:

"${content}"${transitionNote}

Requirements:
1. Adapt terminology to ${targetIndustry} industry standards
2. Emphasize transferable skills valued in ${targetIndustry}
3. Add industry-specific keywords and phrases
4. Maintain truthfulness - only adapt presentation, not facts
5. Use metrics and achievements relevant to ${targetIndustry}
6. Adjust tone to match ${targetIndustry} culture
7. Keep the same general length

Provide ONLY the rewritten content without any preamble or explanation.`;
    },

    /**
     * Improve weak or passive language in resume content
     * @param {Object} params - Parameters for language improvement
     * @param {string} params.content - Content to improve
     * @returns {string} - Claude API prompt
     */
    strengthenLanguage: ({ content }) => {
        return `You are an expert resume writer focused on powerful, active language.

Rewrite this resume content to be more impactful and achievement-focused:

"${content}"

Requirements:
1. Replace weak/passive verbs with strong action verbs
2. Remove filler words and unnecessary phrases
3. Make statements more concrete and specific
4. Emphasize results and impact
5. Use active voice throughout
6. Eliminate phrases like "responsible for", "duties included", "helped with"
7. Keep the same core information but make it punchy and powerful

Provide 2 alternative versions:
Version 1: More conservative/traditional style
Version 2: More bold/dynamic style

Format each version on a separate line starting with "1:" and "2:".
Do not include preamble or explanation.`;
    },

    /**
     * Generate skill-based keywords for ATS optimization
     * @param {Object} params - Parameters for keyword generation
     * @param {string} params.jobDescription - Target job description
     * @param {string[]} params.currentSkills - Current skills in resume
     * @returns {string} - Claude API prompt
     */
    generateKeywords: ({ jobDescription, currentSkills = [] }) => {
        const skillsList = Array.isArray(currentSkills) ? currentSkills.join(', ') : currentSkills;
        const currentSkillsNote = skillsList ? `\n\nCurrent skills in resume: ${skillsList}` : '';

        return `You are an expert in ATS (Applicant Tracking System) optimization.

Analyze this job description and identify critical keywords that should be in the resume:

${jobDescription}${currentSkillsNote}

Requirements:
1. Extract technical skills, tools, and technologies mentioned
2. Identify soft skills and competencies
3. Find industry-specific terminology
4. Note certifications or qualifications mentioned
5. Identify role-specific keywords
6. Highlight missing keywords that are in job description but not in current skills

Format your response as:
TECHNICAL SKILLS: [comma-separated list]
SOFT SKILLS: [comma-separated list]
TOOLS & TECHNOLOGIES: [comma-separated list]
MISSING KEYWORDS: [comma-separated list of important keywords not in current skills]

Provide only these four sections without any preamble or explanation.`;
    },

    /**
     * Generate bullet points from job responsibilities
     * @param {Object} params - Parameters for bullet generation
     * @param {string} params.responsibilities - Job responsibilities description
     * @param {string} params.jobTitle - Job title
     * @param {string} params.company - Company name
     * @returns {string} - Claude API prompt
     */
    generateBullets: ({ responsibilities, jobTitle, company = '' }) => {
        const companyContext = company ? ` at ${company}` : '';

        return `You are an expert resume writer specializing in achievement-based bullet points.

Convert these job responsibilities into 4-6 powerful resume bullet points:

Role: ${jobTitle}${companyContext}
Responsibilities:
${responsibilities}

Requirements:
1. Start each bullet with a strong action verb (past tense)
2. Focus on achievements and impact, not just duties
3. Include quantifiable results where possible (use [X%] for placeholders)
4. Each bullet should be 1-2 lines (20-35 words)
5. Prioritize most impressive/relevant achievements first
6. Use specific, concrete language
7. Demonstrate leadership, initiative, and results

Provide 4-6 bullet points, each on a new line starting with a dash (-).
Do not include any preamble or explanation.`;
    },

    /**
     * Optimize bullet points for ATS scanning
     * @param {Object} params - Parameters for ATS optimization
     * @param {string} params.bulletPoint - Original bullet point
     * @param {string[]} params.keywords - Keywords to incorporate
     * @returns {string} - Claude API prompt
     */
    optimizeForATS: ({ bulletPoint, keywords = [] }) => {
        const keywordList = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        const keywordNote = keywordList
            ? `\n\nKeywords to incorporate (if relevant): ${keywordList}`
            : '';

        return `You are an expert in ATS (Applicant Tracking System) optimization.

Optimize this bullet point to improve ATS scanning while maintaining readability:

"${bulletPoint}"${keywordNote}

Requirements:
1. Maintain the core achievement and impact
2. Naturally incorporate relevant keywords from the list
3. Use standard industry terminology (avoid jargon or abbreviations)
4. Ensure proper formatting for ATS parsing
5. Keep action verb at the start
6. Maintain professional, clear language
7. Do not keyword-stuff or sacrifice readability

Provide 2 optimized versions:
Version 1: Balanced (good keyword density, natural flow)
Version 2: Keyword-focused (maximum relevant keywords while staying readable)

Format each on a separate line starting with "1:" and "2:".
Do not include preamble or explanation.`;
    },

    /**
     * Comprehensive proofreading of resume content
     * @param {Object} params - Parameters for proofreading
     * @param {string} params.content - Content to proofread
     * @returns {string} - Claude API prompt
     */
    proofreadContent: ({ content }) => {
        return `You are an expert resume editor and proofreader.

Proofread this resume content and identify all issues:

"${content}"

Analyze for:
1. Grammar and spelling errors
2. Passive voice usage (e.g., "was responsible for", "were tasked with")
3. Weak or overused verbs (e.g., "helped", "worked on", "assisted")
4. Clichés and buzzwords (e.g., "team player", "go-getter", "results-oriented")
5. Sentence length issues (bullets should be 20-35 words)
6. Punctuation errors or inconsistencies
7. Consistency issues (tense, formatting, style)

For each issue found, provide:
- type: The category of issue (grammar, spelling, passive_voice, weak_verb, cliche, punctuation, consistency)
- severity: high, medium, or low
- text: The problematic text
- location: Where it appears (provide context)
- message: Clear explanation of the issue
- suggestion: Specific fix or improvement

Return ONLY valid JSON in this exact format:
{
  "issues": [
    {
      "type": "weak_verb",
      "severity": "high",
      "text": "helped with",
      "location": "...helped with the development...",
      "message": "Weak verb that dilutes impact",
      "suggestion": "Use: Led, Spearheaded, Drove, Orchestrated"
    }
  ]
}

Be thorough but focus on the most impactful improvements. Do not include any text outside the JSON structure.`;
    },

    /**
     * Analyze tone of resume content
     * @param {Object} params - Parameters for tone analysis
     * @param {string} params.content - Content to analyze
     * @param {string} params.industry - Target industry
     * @param {string} params.role - Target role
     * @returns {string} - Claude API prompt
     */
    analyzeTone: ({ content, industry = '', role = '' }) => {
        const industryContext = industry ? `\nTarget Industry: ${industry}` : '';
        const roleContext = role ? `\nTarget Role: ${role}` : '';

        return `You are an expert in professional communication and resume writing.

Analyze the tone of this resume content:

"${content}"${industryContext}${roleContext}

Provide comprehensive tone analysis:

1. Overall Tone Assessment
   - Primary tone (professional, creative, technical, academic)
   - Confidence level in assessment (0-100)
   - Supporting characteristics

2. Tone Consistency
   - Score (0-100) indicating how consistent the tone is throughout
   - Identify sections where tone shifts
   - Note any jarring transitions

3. Industry Appropriateness
   - Is the tone appropriate for ${industry || 'the target industry'}?
   - Specific phrases that help or hurt
   - Cultural fit assessment

4. Professionalism Score
   - Rate formality and professionalism (0-100)
   - Flag any overly casual or inappropriate language
   - Note any jargon that may not translate well

5. Specific Issues and Recommendations
   - Phrases that affect tone negatively
   - Suggestions for improvement
   - Industry-specific terminology to add or avoid

Return ONLY valid JSON in this exact format:
{
  "overallTone": "professional",
  "confidence": 85,
  "characteristics": ["objective", "achievement-focused", "formal"],
  "consistencyScore": 90,
  "professionalismScore": 88,
  "industryAppropriate": true,
  "issues": [
    {
      "type": "tone_inconsistency",
      "text": "crushing it",
      "location": "...we were crushing it in Q4...",
      "message": "Too casual for professional resume",
      "suggestion": "Use: exceeded targets, delivered exceptional results"
    }
  ],
  "recommendations": [
    {
      "type": "terminology",
      "priority": "high",
      "message": "Add more technical terminology for tech industry",
      "suggestions": ["scalable", "architecture", "optimization"]
    }
  ]
}

Do not include any text outside the JSON structure.`;
    },

    /**
     * Extract job requirements from job description
     * @param {Object} params - Parameters for job parsing
     * @param {string} params.jobDescription - Job description text
     * @returns {string} - Claude API prompt
     */
    extractJobRequirements: ({ jobDescription }) => {
        return `Analyze this job description and extract key information. Return ONLY valid JSON without any markdown formatting or code blocks.

Job Description:
${jobDescription}

Extract the following information and return as JSON:
1. Required hard skills (MUST have)
2. Preferred hard skills (nice to have)
3. Required experience level
4. Soft skills mentioned or implied
5. Key responsibilities
6. Company culture indicators
7. Technical tools/frameworks mentioned
8. Certifications mentioned

Return as structured JSON:
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
  "companyCulture": ["value1", "value2"],
  "salaryRange": "if mentioned",
  "location": "if mentioned",
  "workType": "remote/hybrid/onsite"
}

Important: Return ONLY the JSON object, no other text or formatting.`;
    },

    /**
     * Tailor resume to specific job description
     * @param {Object} params - Parameters for tailoring
     * @param {string} params.resumeContent - Current resume content
     * @param {string} params.jobDescription - Target job description
     * @param {Object} params.jobData - Parsed job data (optional)
     * @returns {string} - Claude API prompt
     */
    tailorResume: ({ resumeContent, jobDescription, jobData = null }) => {
        const jobDataSection = jobData ? `

PARSED JOB REQUIREMENTS:
Title: ${jobData.jobTitle || 'N/A'}
Required Skills: ${(jobData.requiredSkills || []).join(', ')}
Preferred Skills: ${(jobData.preferredSkills || []).join(', ')}
Tools: ${(jobData.tools || []).join(', ')}
Keywords: ${(jobData.keywords || []).join(', ')}` : '';

        return `Analyze the resume against this job description and provide specific changes. Return ONLY valid JSON without any markdown formatting or code blocks.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}${jobDataSection}

Provide specific, actionable suggestions to improve this resume for the target job. For each suggestion, provide:
1. Keywords to add/emphasize (with suggested locations)
2. Specific bullet points to rewrite (provide rewrites)
3. Skills to highlight or add
4. Sections to reorder (with reasoning)
5. Content to de-emphasize or remove
6. New bullet points to add based on job requirements

Return as structured JSON with before/after for each suggestion:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "rewrite_bullet|add_keyword|add_skill|modify_summary",
      "section": "experience|skills|summary",
      "sectionId": "section-id-if-available",
      "itemIndex": 0,
      "bulletIndex": 0,
      "before": "current text",
      "after": "improved text with relevant keywords",
      "reason": "Incorporates required skills X and Y",
      "impact": "high|medium|low",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "overallRecommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}

Focus on:
- Incorporating missing required skills naturally
- Rewriting bullet points to include relevant keywords
- Emphasizing experiences that match job requirements
- Adding achievements aligned with job responsibilities
- Optimizing summary for this specific role

Provide 5-10 high-impact suggestions. Return ONLY the JSON object.`;
    },

    /**
     * Generate LinkedIn headline
     * @param {Object} params - Parameters for headline generation
     * @param {string} params.currentRole - Current job title
     * @param {string} params.skills - Key skills (comma-separated)
     * @param {string} params.industry - Target industry
     * @param {number} params.yearsExp - Years of experience
     * @param {string} params.valueProposition - Unique value proposition
     * @returns {string} - Claude API prompt
     */
    generateLinkedInHeadline: ({ currentRole, skills, industry, yearsExp, valueProposition = '' }) => {
        return `Generate a LinkedIn headline based on:

Current Role: ${currentRole}
Key Skills: ${skills}
Target Industry: ${industry}
Years of Experience: ${yearsExp}
${valueProposition ? `Value Proposition: ${valueProposition}` : ''}

Requirements:
- Maximum 120 characters
- Include role + key skill + value proposition
- Professional but engaging
- SEO-optimized for LinkedIn search
- No buzzwords or clichés

Examples:
- "Senior Software Engineer | Full-Stack Development | Building Scalable Cloud Solutions"
- "Marketing Director | Digital Strategy | Driving 300%+ Revenue Growth"
- "Data Scientist | Machine Learning & AI | Transforming Data into Business Insights"
- "Product Manager | SaaS & Enterprise Software | Launching Products Users Love"
- "UX Designer | User Research & Interaction Design | Crafting Intuitive Digital Experiences"

Generate 5-7 headline options, each on a new line starting with a dash (-).
Vary the style and focus across options (some skill-focused, some value-focused, some achievement-focused).
Do not include any preamble or explanation.`;
    },

    /**
     * Optimize LinkedIn summary/about section
     * @param {Object} params - Parameters for summary optimization
     * @param {string} params.currentSummary - Current LinkedIn summary
     * @param {string} params.resumeSummary - Resume summary
     * @param {string} params.keywords - Keywords to include (comma-separated)
     * @param {string} params.targetRole - Target role
     * @param {string} params.industry - Target industry
     * @returns {string} - Claude API prompt
     */
    optimizeLinkedInSummary: ({ currentSummary = '', resumeSummary = '', keywords, targetRole = '', industry = '' }) => {
        return `Optimize this LinkedIn About section:

${currentSummary ? `Current Summary:\n${currentSummary}\n` : ''}
${resumeSummary ? `Resume Summary:\n${resumeSummary}\n` : ''}
${targetRole ? `Target Role: ${targetRole}\n` : ''}
${industry ? `Industry: ${industry}\n` : ''}

Requirements:
- 3-5 short paragraphs
- First-person voice (use "I", "my", "me")
- Lead with impact/value proposition
- Include key achievements with metrics
- End with call to action (e.g., "Let's connect" or "Reach out to discuss")
- Maximum 2,000 characters
- Include relevant keywords: ${keywords}
- Professional yet personable tone
- Tell a compelling story

Structure:
1. Opening: Who you are and what you do (value proposition)
2. Middle paragraphs: Key experience, achievements, and expertise
3. Closing: What you're looking for, call to action

Provide ONLY the optimized summary text without any preamble or explanation.`;
    },

    /**
     * Analyze alignment between LinkedIn profile and resume
     * @param {Object} params - Parameters for alignment analysis
     * @param {string} params.linkedInData - LinkedIn profile data (JSON string)
     * @param {string} params.resumeData - Resume data (JSON string)
     * @returns {string} - Claude API prompt
     */
    alignLinkedInWithResume: ({ linkedInData, resumeData }) => {
        return `Analyze alignment between LinkedIn profile and resume:

LinkedIn Profile:
${linkedInData}

Resume:
${resumeData}

Provide:
1. Keywords missing from LinkedIn (present in resume)
2. Skills to add to LinkedIn
3. Experience descriptions to enhance on LinkedIn
4. Headline suggestions based on resume
5. Summary improvements based on resume achievements
6. Overall consistency score (0-100)

Return as valid JSON:
{
  "consistencyScore": 85,
  "missingKeywords": ["keyword1", "keyword2"],
  "skillsToAdd": ["skill1", "skill2"],
  "experienceEnhancements": [
    {
      "position": "Job Title at Company",
      "currentDescription": "current text",
      "suggestedDescription": "enhanced text with keywords",
      "reason": "Add metrics from resume"
    }
  ],
  "headlineSuggestions": [
    "Headline option 1",
    "Headline option 2",
    "Headline option 3"
  ],
  "summaryImprovements": [
    "Add achievement X from resume",
    "Incorporate metric Y for more impact",
    "Mention certification Z"
  ],
  "gaps": [
    {
      "type": "experience|skill|certification|education",
      "description": "What's in resume but not LinkedIn",
      "priority": "high|medium|low"
    }
  ],
  "recommendations": [
    "Overall recommendation 1",
    "Overall recommendation 2"
  ]
}

Return ONLY valid JSON without markdown formatting.`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPrompts;
}
