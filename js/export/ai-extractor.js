// AI-Powered Resume Extraction Module
// Uses Claude API to intelligently extract and structure resume data

/**
 * Extract structured resume data using Claude AI
 * @param {string} text - The resume text
 * @param {string} apiKey - Claude API key
 * @returns {Promise<Object>} - Structured resume data
 */
async function extractResumeData(text, apiKey) {
    if (!text || !apiKey) {
        return {
            success: false,
            error: 'Missing required parameters: text or apiKey'
        };
    }

    const prompt = `You are an expert resume parser. Analyze the following resume text and extract structured data.

RESUME TEXT:
${text}

Extract and return ONLY a valid JSON object with the following structure (no other text):

{
  "personalInfo": {
    "name": "Full name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL",
    "website": "personal website",
    "portfolio": "portfolio URL"
  },
  "summary": "Professional summary or objective",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "City, State",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": "Job description",
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "field": "Field of study",
      "school": "School name",
      "location": "City, State",
      "graduationDate": "YYYY-MM",
      "gpa": "GPA if mentioned",
      "honors": "Honors if mentioned"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "languages": ["language1", "language2"],
    "frameworks": ["framework1", "framework2"],
    "tools": ["tool1", "tool2"],
    "soft": ["soft skill1", "soft skill2"]
  },
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "YYYY-MM",
      "expirationDate": "YYYY-MM or null",
      "credentialId": "ID if provided"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "url": "Project URL if provided",
      "date": "YYYY-MM"
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2"],
  "awards": ["Award 1", "Award 2"],
  "publications": ["Publication 1", "Publication 2"],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Native/Fluent/Professional/Conversational/Basic"
    }
  ],
  "volunteering": [
    {
      "role": "Volunteer role",
      "organization": "Organization name",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": "Description"
    }
  ],
  "interests": ["Interest 1", "Interest 2"]
}

IMPORTANT INSTRUCTIONS:
1. Return ONLY valid JSON, no markdown formatting, no code blocks
2. Use null for any fields that are not found
3. Use empty arrays [] for list fields that have no data
4. Normalize all dates to YYYY-MM format
5. Use "Present" for current positions
6. Extract ALL information found in the resume
7. Categorize skills appropriately (technical, languages, frameworks, tools, soft skills)
8. Preserve all achievements and bullet points from work experience
9. If information is ambiguous, make your best interpretation
10. Do not add any information that is not in the resume`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 8192,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Claude API Error:', error);
            return {
                success: false,
                error: error.error?.message || 'API request failed'
            };
        }

        const data = await response.json();
        const extractedText = data.content[0].text;

        // Parse the JSON response
        let resumeData;
        try {
            // Remove any markdown code block formatting if present
            let cleanText = extractedText.trim();
            if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
            }
            resumeData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.error('Extracted text:', extractedText);
            return {
                success: false,
                error: 'Failed to parse AI response as JSON',
                rawResponse: extractedText
            };
        }

        return {
            success: true,
            data: resumeData
        };

    } catch (error) {
        console.error('AI extraction error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Enhance extracted sections with AI analysis
 * @param {Array} sections - Basic sections extracted from parsing
 * @param {string} apiKey - Claude API key
 * @returns {Promise<Object>} - Enhanced sections
 */
async function enhanceSections(sections, apiKey) {
    if (!sections || !apiKey) {
        return {
            success: false,
            error: 'Missing required parameters'
        };
    }

    const sectionsText = sections.map(s => `${s.title}:\n${s.content}`).join('\n\n');

    const prompt = `Analyze these resume sections and categorize them properly. Return ONLY a JSON array.

SECTIONS:
${sectionsText}

Return a JSON array with this structure:
[
  {
    "originalTitle": "original section title",
    "standardType": "header|summary|experience|education|skills|certifications|projects|achievements|awards|publications|languages|volunteering|interests|references",
    "content": "section content",
    "confidence": 0.0-1.0
  }
]

IMPORTANT: Return ONLY valid JSON array, no markdown, no explanations.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            return {
                success: false,
                error: 'API request failed',
                sections: sections // Return original sections
            };
        }

        const data = await response.json();
        const extractedText = data.content[0].text;

        let enhancedSections;
        try {
            let cleanText = extractedText.trim();
            if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
            }
            enhancedSections = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return {
                success: false,
                error: 'Failed to parse AI response',
                sections: sections
            };
        }

        return {
            success: true,
            sections: enhancedSections
        };

    } catch (error) {
        console.error('Section enhancement error:', error);
        return {
            success: false,
            error: error.message,
            sections: sections
        };
    }
}

/**
 * Extract and normalize dates from text
 * @param {string} text - Text containing dates
 * @returns {Object} - Normalized dates
 */
function extractDates(text) {
    const dates = [];

    // Common date patterns
    const patterns = [
        /(\d{4})\s*-\s*(\d{4})/g,           // 2020 - 2022
        /(\d{4})\s*-\s*(Present|Current)/gi, // 2020 - Present
        /(\w+)\s+(\d{4})/g,                  // January 2020
        /(\d{1,2})\/(\d{4})/g,              // 01/2020
        /(\d{4})-(\d{2})/g                   // 2020-01
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            dates.push(match[0]);
        }
    });

    return dates;
}

/**
 * Categorize and normalize skills
 * @param {Array} skills - Array of skill strings
 * @returns {Object} - Categorized skills
 */
function categorizeSkills(skills) {
    const categories = {
        technical: [],
        languages: [],
        frameworks: [],
        tools: [],
        soft: []
    };

    // Common programming languages
    const programmingLanguages = [
        'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
        'php', 'swift', 'kotlin', 'typescript', 'sql', 'r', 'scala', 'perl'
    ];

    // Common frameworks
    const frameworks = [
        'react', 'vue', 'angular', 'django', 'flask', 'spring', 'express',
        'rails', 'laravel', 'nextjs', 'nuxt', 'svelte', 'node.js', 'nodejs'
    ];

    // Common tools
    const tools = [
        'git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp',
        'jira', 'figma', 'photoshop', 'illustrator', 'tableau', 'power bi'
    ];

    // Soft skills
    const softSkills = [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'critical thinking', 'time management', 'adaptability', 'creativity'
    ];

    skills.forEach(skill => {
        const lowerSkill = skill.toLowerCase();

        if (programmingLanguages.some(lang => lowerSkill.includes(lang))) {
            categories.languages.push(skill);
        } else if (frameworks.some(fw => lowerSkill.includes(fw))) {
            categories.frameworks.push(skill);
        } else if (tools.some(tool => lowerSkill.includes(tool))) {
            categories.tools.push(skill);
        } else if (softSkills.some(soft => lowerSkill.includes(soft))) {
            categories.soft.push(skill);
        } else {
            categories.technical.push(skill);
        }
    });

    return categories;
}

module.exports = {
    extractResumeData,
    enhanceSections,
    extractDates,
    categorizeSkills
};
