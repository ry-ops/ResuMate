// Main Resume Parser Controller
// Routes files to appropriate parser and combines results

const pdfParser = require('./pdf-parser');
const docxParser = require('./docx-parser');
const aiExtractor = require('./ai-extractor');

/**
 * Parse resume file and extract structured data
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} filename - The original filename
 * @param {string} apiKey - Claude API key (optional, for AI extraction)
 * @param {Object} options - Parsing options
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResume(fileBuffer, filename, apiKey, options = {}) {
    const {
        useAI = true,           // Use AI for enhanced extraction
        extractSections = true,  // Extract basic sections
        structureData = true     // Structure the data
    } = options;

    try {
        // Determine file type from filename
        const fileType = getFileType(filename);

        if (!fileType) {
            return {
                success: false,
                error: `Unsupported file type: ${filename}`,
                supportedTypes: ['PDF', 'DOCX', 'TXT']
            };
        }

        console.log(`Parsing ${fileType} file: ${filename}`);

        // Route to appropriate parser
        let parseResult;

        switch (fileType) {
            case 'pdf':
                parseResult = extractSections
                    ? await pdfParser.extractStructuredPDF(fileBuffer)
                    : await pdfParser.parsePDF(fileBuffer);
                break;

            case 'docx':
                parseResult = extractSections
                    ? await docxParser.extractStructuredDOCX(fileBuffer)
                    : await docxParser.parseDOCX(fileBuffer);
                break;

            case 'txt':
                parseResult = {
                    success: true,
                    text: fileBuffer.toString('utf-8'),
                    sections: extractSections ? extractTextSections(fileBuffer.toString('utf-8')) : []
                };
                break;

            default:
                return {
                    success: false,
                    error: `Unsupported file type: ${fileType}`
                };
        }

        if (!parseResult.success) {
            return parseResult;
        }

        // Basic result without AI
        const result = {
            success: true,
            fileType: fileType,
            filename: filename,
            text: parseResult.text,
            sections: parseResult.sections || [],
            metadata: parseResult.metadata || {}
        };

        // If AI extraction is requested and API key is provided
        if (useAI && apiKey && parseResult.text) {
            console.log('Using AI to extract structured data...');

            // Extract structured data using AI
            const aiResult = await aiExtractor.extractResumeData(parseResult.text, apiKey);

            if (aiResult.success) {
                result.structuredData = aiResult.data;
                result.aiExtracted = true;
            } else {
                console.warn('AI extraction failed:', aiResult.error);
                result.aiError = aiResult.error;
                result.aiExtracted = false;
            }

            // Enhance sections with AI if we have basic sections
            if (parseResult.sections && parseResult.sections.length > 0) {
                const enhancedResult = await aiExtractor.enhanceSections(parseResult.sections, apiKey);
                if (enhancedResult.success) {
                    result.enhancedSections = enhancedResult.sections;
                }
            }
        }

        // Add parsing statistics
        result.stats = {
            textLength: parseResult.text?.length || 0,
            wordCount: parseResult.text ? parseResult.text.split(/\s+/).length : 0,
            sectionCount: result.sections?.length || 0,
            hasStructuredData: !!result.structuredData,
            parsingMethod: useAI ? 'AI-enhanced' : 'basic'
        };

        return result;

    } catch (error) {
        console.error('Resume parsing error:', error);
        return {
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
    }
}

/**
 * Determine file type from filename
 * @param {string} filename - The filename
 * @returns {string|null} - File type (pdf, docx, txt) or null
 */
function getFileType(filename) {
    const extension = filename.toLowerCase().split('.').pop();

    const typeMap = {
        'pdf': 'pdf',
        'docx': 'docx',
        'doc': 'docx', // Treat .doc as .docx (mammoth supports both)
        'txt': 'txt',
        'text': 'txt'
    };

    return typeMap[extension] || null;
}

/**
 * Extract basic sections from plain text
 * @param {string} text - The text content
 * @returns {Array} - Extracted sections
 */
function extractTextSections(text) {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common section headers
    const sectionHeaders = [
        'summary', 'objective', 'profile',
        'experience', 'work experience', 'employment',
        'education', 'academic background',
        'skills', 'technical skills', 'core competencies',
        'certifications', 'certificates',
        'projects', 'portfolio',
        'achievements', 'accomplishments',
        'awards', 'honors',
        'publications',
        'references',
        'languages',
        'volunteering', 'volunteer experience',
        'interests', 'hobbies'
    ];

    let currentSection = null;
    let currentContent = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        const lowerLine = trimmed.toLowerCase();

        // Check if this line is a section header
        const isHeader = sectionHeaders.some(header => {
            return lowerLine === header ||
                   lowerLine === header + ':' ||
                   lowerLine === header.toUpperCase() ||
                   lowerLine === header.toUpperCase() + ':';
        });

        if (isHeader && trimmed.length < 50) {
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
            if (sections.length === 0) {
                sections.push({
                    title: 'Header',
                    content: trimmed
                });
            } else if (sections[0].title === 'Header') {
                sections[0].content += '\n' + trimmed;
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
 * Parse multiple resume files
 * @param {Array} files - Array of {buffer, filename} objects
 * @param {string} apiKey - Claude API key
 * @param {Object} options - Parsing options
 * @returns {Promise<Array>} - Array of parse results
 */
async function parseMultipleResumes(files, apiKey, options = {}) {
    const results = [];

    for (const file of files) {
        const result = await parseResume(file.buffer, file.filename, apiKey, options);
        results.push({
            filename: file.filename,
            ...result
        });
    }

    return results;
}

/**
 * Validate parsed resume data
 * @param {Object} parsedData - The parsed resume data
 * @returns {Object} - Validation result
 */
function validateResumeData(parsedData) {
    const errors = [];
    const warnings = [];

    if (!parsedData.success) {
        errors.push('Parsing failed');
        return { valid: false, errors, warnings };
    }

    // Check for essential data
    if (!parsedData.text || parsedData.text.length < 50) {
        errors.push('Resume text is too short or empty');
    }

    if (parsedData.structuredData) {
        const data = parsedData.structuredData;

        // Check personal info
        if (!data.personalInfo?.name) {
            warnings.push('No name found in resume');
        }
        if (!data.personalInfo?.email && !data.personalInfo?.phone) {
            warnings.push('No contact information found');
        }

        // Check work experience
        if (!data.experience || data.experience.length === 0) {
            warnings.push('No work experience found');
        }

        // Check education
        if (!data.education || data.education.length === 0) {
            warnings.push('No education found');
        }

        // Check skills
        if (!data.skills || Object.keys(data.skills).length === 0) {
            warnings.push('No skills found');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        score: calculateCompletenessScore(parsedData)
    };
}

/**
 * Calculate completeness score for parsed resume
 * @param {Object} parsedData - The parsed resume data
 * @returns {number} - Score from 0-100
 */
function calculateCompletenessScore(parsedData) {
    if (!parsedData.success || !parsedData.structuredData) {
        return 0;
    }

    const data = parsedData.structuredData;
    let score = 0;
    const weights = {
        personalInfo: 20,
        summary: 10,
        experience: 25,
        education: 20,
        skills: 15,
        certifications: 5,
        projects: 5
    };

    // Personal info (20 points)
    if (data.personalInfo?.name) score += 10;
    if (data.personalInfo?.email || data.personalInfo?.phone) score += 5;
    if (data.personalInfo?.location) score += 5;

    // Summary (10 points)
    if (data.summary && data.summary.length > 50) score += 10;

    // Experience (25 points)
    if (data.experience && data.experience.length > 0) {
        score += Math.min(25, data.experience.length * 8);
    }

    // Education (20 points)
    if (data.education && data.education.length > 0) {
        score += Math.min(20, data.education.length * 10);
    }

    // Skills (15 points)
    if (data.skills) {
        const totalSkills = Object.values(data.skills).flat().length;
        score += Math.min(15, totalSkills * 1);
    }

    // Certifications (5 points)
    if (data.certifications && data.certifications.length > 0) {
        score += 5;
    }

    // Projects (5 points)
    if (data.projects && data.projects.length > 0) {
        score += 5;
    }

    return Math.min(100, Math.round(score));
}

module.exports = {
    parseResume,
    parseMultipleResumes,
    validateResumeData,
    calculateCompletenessScore,
    getFileType
};
