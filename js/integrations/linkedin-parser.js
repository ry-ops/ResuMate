// LinkedIn Profile Parser
// Parses LinkedIn PDF exports and maps to resume format

/**
 * LinkedIn Profile Parser Class
 * Handles parsing of LinkedIn PDF exports
 */
class LinkedInParser {
    constructor() {
        this.sectionPatterns = {
            headline: /^(.+?)$/m,
            summary: /(?:About|Summary)\s*\n([\s\S]+?)(?=\n(?:Experience|Education|Skills)|$)/i,
            experience: /Experience\s*\n([\s\S]+?)(?=\n(?:Education|Skills|Certifications)|$)/i,
            education: /Education\s*\n([\s\S]+?)(?=\n(?:Skills|Certifications|Projects)|$)/i,
            skills: /Skills?\s*\n([\s\S]+?)(?=\n(?:Certifications|Projects|Publications)|$)/i,
            certifications: /(?:Certifications?|Licenses?)\s*\n([\s\S]+?)(?=\n(?:Projects|Publications|Languages)|$)/i,
            projects: /Projects?\s*\n([\s\S]+?)(?=\n(?:Publications|Languages|Volunteer)|$)/i,
            publications: /Publications?\s*\n([\s\S]+?)(?=\n(?:Languages|Volunteer|Accomplishments)|$)/i,
            languages: /Languages?\s*\n([\s\S]+?)(?=\n(?:Volunteer|Accomplishments)|$)/i
        };
    }

    /**
     * Parse LinkedIn PDF export
     * @param {string} pdfText - Extracted text from LinkedIn PDF
     * @returns {Object} - Parsed LinkedIn profile data
     */
    parseLinkedInPDF(pdfText) {
        try {
            const profile = {
                headline: this._extractHeadline(pdfText),
                summary: this._extractSummary(pdfText),
                experience: this._extractExperience(pdfText),
                education: this._extractEducation(pdfText),
                skills: this._extractSkills(pdfText),
                certifications: this._extractCertifications(pdfText),
                projects: this._extractProjects(pdfText),
                publications: this._extractPublications(pdfText),
                languages: this._extractLanguages(pdfText)
            };

            return {
                success: true,
                profile
            };
        } catch (error) {
            console.error('LinkedIn PDF parsing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract headline from LinkedIn PDF
     * @param {string} text - PDF text
     * @returns {string} - Headline
     * @private
     */
    _extractHeadline(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        // Look for headline after name (usually first 5 lines)
        for (let i = 1; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            // Headline is typically 50-120 chars, contains job-related keywords
            if (line.length >= 20 && line.length <= 150 &&
                !line.includes('@') && !line.includes('http')) {
                return line;
            }
        }

        return '';
    }

    /**
     * Extract summary/about section
     * @param {string} text - PDF text
     * @returns {string} - Summary text
     * @private
     */
    _extractSummary(text) {
        const match = text.match(this.sectionPatterns.summary);
        if (match && match[1]) {
            return this._cleanText(match[1]);
        }
        return '';
    }

    /**
     * Extract experience section
     * @param {string} text - PDF text
     * @returns {Array} - Experience entries
     * @private
     */
    _extractExperience(text) {
        const match = text.match(this.sectionPatterns.experience);
        if (!match || !match[1]) return [];

        const experienceText = match[1];
        const entries = [];

        // Split by common patterns (company name + job title)
        const jobBlocks = this._splitIntoBlocks(experienceText);

        for (const block of jobBlocks) {
            const experience = this._parseExperienceBlock(block);
            if (experience) {
                entries.push(experience);
            }
        }

        return entries;
    }

    /**
     * Parse individual experience block
     * @param {string} block - Text block for one job
     * @returns {Object|null} - Parsed experience entry
     * @private
     */
    _parseExperienceBlock(block) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return null;

        const entry = {
            title: '',
            company: '',
            location: '',
            dates: { start: '', end: '' },
            description: ''
        };

        // First line is usually job title
        entry.title = lines[0];

        // Second line is usually company name
        if (lines[1]) {
            entry.company = lines[1].replace(/^at\s+/i, '');
        }

        // Look for date pattern (e.g., "Jan 2020 - Present", "2019 - 2021")
        const datePattern = /(\w+\s+\d{4}|(\d{4}))\s*[-–—]\s*(\w+\s+\d{4}|Present|\d{4})/i;
        const dateMatch = block.match(datePattern);
        if (dateMatch) {
            entry.dates.start = dateMatch[1];
            entry.dates.end = dateMatch[3];
        }

        // Look for location
        const locationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s*,\s*[A-Z][a-z]+)?)/;
        const locationMatch = block.match(locationPattern);
        if (locationMatch) {
            entry.location = locationMatch[1];
        }

        // Extract description (everything after dates/location)
        const descLines = lines.slice(2).filter(line => {
            return !datePattern.test(line) &&
                   !locationPattern.test(line) &&
                   line.length > 20;
        });
        entry.description = descLines.join('\n');

        return entry;
    }

    /**
     * Extract education section
     * @param {string} text - PDF text
     * @returns {Array} - Education entries
     * @private
     */
    _extractEducation(text) {
        const match = text.match(this.sectionPatterns.education);
        if (!match || !match[1]) return [];

        const educationText = match[1];
        const entries = [];
        const blocks = this._splitIntoBlocks(educationText);

        for (const block of blocks) {
            const education = this._parseEducationBlock(block);
            if (education) {
                entries.push(education);
            }
        }

        return entries;
    }

    /**
     * Parse individual education block
     * @param {string} block - Text block for one education entry
     * @returns {Object|null} - Parsed education entry
     * @private
     */
    _parseEducationBlock(block) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 1) return null;

        const entry = {
            school: '',
            degree: '',
            field: '',
            dates: { start: '', end: '' },
            gpa: ''
        };

        // First line is usually school name
        entry.school = lines[0];

        // Look for degree
        const degreePattern = /(Bachelor|Master|PhD|Associate|B\.S\.|M\.S\.|MBA|Ph\.D\.)[^,\n]*/i;
        const degreeMatch = block.match(degreePattern);
        if (degreeMatch) {
            entry.degree = degreeMatch[0].trim();
        }

        // Look for field of study
        const fieldPattern = /(?:in|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
        const fieldMatch = block.match(fieldPattern);
        if (fieldMatch) {
            entry.field = fieldMatch[1];
        }

        // Look for dates
        const datePattern = /(\d{4})\s*[-–—]\s*(\d{4}|Present)/i;
        const dateMatch = block.match(datePattern);
        if (dateMatch) {
            entry.dates.start = dateMatch[1];
            entry.dates.end = dateMatch[2];
        }

        // Look for GPA
        const gpaPattern = /GPA[:\s]+(\d+\.\d+)/i;
        const gpaMatch = block.match(gpaPattern);
        if (gpaMatch) {
            entry.gpa = gpaMatch[1];
        }

        return entry;
    }

    /**
     * Extract skills section
     * @param {string} text - PDF text
     * @returns {Array} - Skills list
     * @private
     */
    _extractSkills(text) {
        const match = text.match(this.sectionPatterns.skills);
        if (!match || !match[1]) return [];

        const skillsText = this._cleanText(match[1]);

        // Skills are often separated by bullets, newlines, or commas
        const skills = skillsText
            .split(/[•\n,]/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.length < 50);

        return skills;
    }

    /**
     * Extract certifications section
     * @param {string} text - PDF text
     * @returns {Array} - Certifications list
     * @private
     */
    _extractCertifications(text) {
        const match = text.match(this.sectionPatterns.certifications);
        if (!match || !match[1]) return [];

        const certText = match[1];
        const certs = [];
        const blocks = this._splitIntoBlocks(certText);

        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length > 0) {
                const cert = {
                    name: lines[0],
                    issuer: '',
                    date: '',
                    credentialId: ''
                };

                // Look for issuer
                const issuerPattern = /(?:Issued by|from)\s+([A-Z][^\n]+)/i;
                const issuerMatch = block.match(issuerPattern);
                if (issuerMatch) {
                    cert.issuer = issuerMatch[1].trim();
                }

                // Look for date
                const datePattern = /(?:Issued|Earned)\s+(\w+\s+\d{4})/i;
                const dateMatch = block.match(datePattern);
                if (dateMatch) {
                    cert.date = dateMatch[1];
                }

                // Look for credential ID
                const credPattern = /(?:Credential ID|ID)[:\s]+([A-Z0-9-]+)/i;
                const credMatch = block.match(credPattern);
                if (credMatch) {
                    cert.credentialId = credMatch[1];
                }

                certs.push(cert);
            }
        }

        return certs;
    }

    /**
     * Extract projects section
     * @param {string} text - PDF text
     * @returns {Array} - Projects list
     * @private
     */
    _extractProjects(text) {
        const match = text.match(this.sectionPatterns.projects);
        if (!match || !match[1]) return [];

        const projectsText = match[1];
        const projects = [];
        const blocks = this._splitIntoBlocks(projectsText);

        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length > 0) {
                projects.push({
                    name: lines[0],
                    description: lines.slice(1).join('\n'),
                    date: this._extractDateFromText(block)
                });
            }
        }

        return projects;
    }

    /**
     * Extract publications section
     * @param {string} text - PDF text
     * @returns {Array} - Publications list
     * @private
     */
    _extractPublications(text) {
        const match = text.match(this.sectionPatterns.publications);
        if (!match || !match[1]) return [];

        const pubText = match[1];
        const publications = [];
        const blocks = this._splitIntoBlocks(pubText);

        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length > 0) {
                publications.push({
                    title: lines[0],
                    publisher: '',
                    date: this._extractDateFromText(block),
                    description: lines.slice(1).join('\n')
                });
            }
        }

        return publications;
    }

    /**
     * Extract languages section
     * @param {string} text - PDF text
     * @returns {Array} - Languages list
     * @private
     */
    _extractLanguages(text) {
        const match = text.match(this.sectionPatterns.languages);
        if (!match || !match[1]) return [];

        const langText = this._cleanText(match[1]);
        const languages = [];

        // Languages often include proficiency level
        const langPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:[-–—]\s*)?([A-Z][a-z]+(?:\s+[a-z]+)?)?/g;
        let match2;
        while ((match2 = langPattern.exec(langText)) !== null) {
            languages.push({
                language: match2[1].trim(),
                proficiency: match2[2] ? match2[2].trim() : 'Not specified'
            });
        }

        return languages;
    }

    /**
     * Map LinkedIn profile to resume format
     * @param {Object} linkedInProfile - Parsed LinkedIn profile
     * @returns {Object} - Resume-formatted data
     */
    mapToResumeFormat(linkedInProfile) {
        return {
            personalInfo: {
                name: '', // Not typically in PDF export
                email: '',
                phone: '',
                location: '',
                linkedin: ''
            },
            summary: linkedInProfile.summary || '',
            experience: linkedInProfile.experience.map(exp => ({
                title: exp.title,
                company: exp.company,
                location: exp.location,
                startDate: exp.dates.start,
                endDate: exp.dates.end,
                description: exp.description,
                bullets: this._convertToBullets(exp.description)
            })),
            education: linkedInProfile.education.map(edu => ({
                school: edu.school,
                degree: edu.degree,
                field: edu.field,
                startDate: edu.dates.start,
                endDate: edu.dates.end,
                gpa: edu.gpa,
                achievements: []
            })),
            skills: {
                technical: linkedInProfile.skills,
                soft: []
            },
            certifications: linkedInProfile.certifications.map(cert => ({
                name: cert.name,
                issuer: cert.issuer,
                date: cert.date,
                credentialId: cert.credentialId
            })),
            projects: linkedInProfile.projects.map(proj => ({
                name: proj.name,
                description: proj.description,
                date: proj.date,
                technologies: []
            })),
            publications: linkedInProfile.publications,
            languages: linkedInProfile.languages
        };
    }

    /**
     * Split text into blocks (entries)
     * @param {string} text - Text to split
     * @returns {Array} - Text blocks
     * @private
     */
    _splitIntoBlocks(text) {
        // Split by double newlines or common separators
        const blocks = text.split(/\n\s*\n/).filter(b => b.trim().length > 0);
        return blocks.length > 0 ? blocks : [text];
    }

    /**
     * Clean text (remove extra whitespace, etc.)
     * @param {string} text - Text to clean
     * @returns {string} - Cleaned text
     * @private
     */
    _cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .trim();
    }

    /**
     * Extract date from text
     * @param {string} text - Text containing date
     * @returns {string} - Extracted date
     * @private
     */
    _extractDateFromText(text) {
        const datePattern = /(\w+\s+\d{4}|\d{4})/;
        const match = text.match(datePattern);
        return match ? match[1] : '';
    }

    /**
     * Convert description to bullet points
     * @param {string} description - Description text
     * @returns {Array} - Bullet points
     * @private
     */
    _convertToBullets(description) {
        if (!description) return [];

        // Split by newlines or bullet markers
        const bullets = description
            .split(/\n|[•◦▪]/)
            .map(b => b.trim())
            .filter(b => b.length > 10);

        return bullets;
    }
}

// Create global instance
const linkedInParser = new LinkedInParser();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LinkedInParser, linkedInParser };
}
