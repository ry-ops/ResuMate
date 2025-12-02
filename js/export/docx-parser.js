// DOCX Parser Module
// Uses mammoth.js to extract text from DOCX files

const mammoth = require('mammoth');

/**
 * Extract text from DOCX buffer
 * @param {Buffer} docxBuffer - The DOCX file buffer
 * @returns {Promise<Object>} - Extracted text and metadata
 */
async function parseDOCX(docxBuffer) {
    try {
        // Extract raw text
        const textResult = await mammoth.extractRawText({
            buffer: docxBuffer
        });

        // Extract HTML (preserves some formatting)
        const htmlResult = await mammoth.convertToHtml({
            buffer: docxBuffer
        });

        // Extract messages (warnings/info)
        const messages = textResult.messages || [];
        const warnings = messages.filter(msg => msg.type === 'warning');
        const errors = messages.filter(msg => msg.type === 'error');

        return {
            success: true,
            text: textResult.value,
            html: htmlResult.value,
            warnings: warnings.map(w => w.message),
            errors: errors.map(e => e.message),
            hasIssues: warnings.length > 0 || errors.length > 0
        };

    } catch (error) {
        console.error('DOCX parsing error:', error);
        return {
            success: false,
            error: error.message,
            text: null
        };
    }
}

/**
 * Extract structured data from DOCX
 * Attempts to identify sections based on formatting
 * @param {Buffer} docxBuffer - The DOCX file buffer
 * @returns {Promise<Object>} - Structured resume data
 */
async function extractStructuredDOCX(docxBuffer) {
    const result = await parseDOCX(docxBuffer);

    if (!result.success) {
        return result;
    }

    // Identify potential sections
    const sections = identifySections(result.text, result.html);

    return {
        success: true,
        text: result.text,
        html: result.html,
        sections: sections,
        warnings: result.warnings,
        errors: result.errors
    };
}

/**
 * Identify resume sections from text and HTML
 * @param {string} text - The extracted text
 * @param {string} html - The extracted HTML
 * @returns {Array} - Identified sections
 */
function identifySections(text, html) {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common section headers
    const sectionHeaders = [
        'summary', 'objective', 'profile', 'professional summary',
        'experience', 'work experience', 'employment', 'work history', 'professional experience',
        'education', 'academic background', 'educational background',
        'skills', 'technical skills', 'core competencies', 'key skills', 'areas of expertise',
        'certifications', 'certificates', 'licenses',
        'projects', 'portfolio', 'key projects',
        'achievements', 'accomplishments', 'key achievements',
        'awards', 'honors', 'recognition',
        'publications', 'papers',
        'references',
        'languages', 'language skills',
        'volunteering', 'volunteer experience', 'community service',
        'interests', 'hobbies', 'personal interests'
    ];

    let currentSection = null;
    let currentContent = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        const lowerLine = trimmed.toLowerCase();

        // Skip empty lines
        if (!trimmed) return;

        // Check if this line is a section header
        const matchedHeader = sectionHeaders.find(header => {
            return lowerLine === header ||
                   lowerLine === header + ':' ||
                   lowerLine === header.toUpperCase() ||
                   lowerLine === header.toUpperCase() + ':' ||
                   (lowerLine.length < 50 && lowerLine.includes(header) && trimmed.length < 50);
        });

        const isHeader = matchedHeader && trimmed.length < 50;

        if (isHeader) {
            // Save previous section
            if (currentSection) {
                sections.push({
                    title: currentSection,
                    content: currentContent.join('\n').trim()
                });
            }

            // Start new section
            currentSection = trimmed.replace(/[:]/g, '').trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(trimmed);
        } else {
            // Before any section (likely header/contact info)
            if (sections.length === 0 || sections[0].title !== 'Header') {
                if (sections.length === 0) {
                    sections.push({
                        title: 'Header',
                        content: trimmed
                    });
                } else {
                    sections[0].content += '\n' + trimmed;
                }
            }
        }
    });

    // Add last section
    if (currentSection && currentContent.length > 0) {
        sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
        });
    }

    return sections;
}

/**
 * Extract contact information from text
 * @param {string} text - The extracted text
 * @returns {Object} - Contact information
 */
function extractContactInfo(text) {
    const contact = {
        email: null,
        phone: null,
        linkedin: null,
        github: null,
        website: null
    };

    // Email regex
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
        contact.email = emailMatch[0];
    }

    // Phone regex (various formats)
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
        contact.phone = phoneMatch[0];
    }

    // LinkedIn URL
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
        contact.linkedin = linkedinMatch[0];
    }

    // GitHub URL
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) {
        contact.github = githubMatch[0];
    }

    // Website URL (excluding LinkedIn/GitHub)
    const websiteMatch = text.match(/https?:\/\/(?!linkedin|github)[\w\.-]+\.\w+/i);
    if (websiteMatch) {
        contact.website = websiteMatch[0];
    }

    return contact;
}

module.exports = {
    parseDOCX,
    extractStructuredDOCX,
    extractContactInfo
};
