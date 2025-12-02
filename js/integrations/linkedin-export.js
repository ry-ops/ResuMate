// LinkedIn Export Utilities
// Export resume data in LinkedIn-friendly formats and copy sections to clipboard

/**
 * LinkedIn Export Class
 * Handles exporting resume data for LinkedIn and clipboard operations
 */
class LinkedInExport {
    constructor() {
        this.maxHeadlineLength = 120;
        this.maxSummaryLength = 2000;
        this.maxExperienceDescLength = 2000;
    }

    /**
     * Export resume to LinkedIn-friendly format
     * @param {Object} resumeData - Resume data
     * @returns {Object} - LinkedIn-formatted data
     */
    exportToLinkedInFormat(resumeData) {
        return {
            headline: this._formatHeadline(resumeData),
            summary: this._formatSummary(resumeData),
            experience: this._formatExperience(resumeData.experience || []),
            education: this._formatEducation(resumeData.education || []),
            skills: this._formatSkills(resumeData.skills || {}),
            certifications: this._formatCertifications(resumeData.certifications || []),
            projects: this._formatProjects(resumeData.projects || []),
            publications: this._formatPublications(resumeData.publications || []),
            languages: this._formatLanguages(resumeData.languages || [])
        };
    }

    /**
     * Format headline from resume data
     * @param {Object} resumeData - Resume data
     * @returns {string} - Formatted headline (max 120 chars)
     * @private
     */
    _formatHeadline(resumeData) {
        const personalInfo = resumeData.personalInfo || {};
        const experience = resumeData.experience || [];
        const skills = resumeData.skills || {};

        // Get current/most recent title
        const currentTitle = experience[0]?.title || 'Professional';

        // Get top skills
        const allSkills = [
            ...(skills.technical || []),
            ...(skills.soft || []),
            ...(skills.tools || [])
        ];
        const topSkills = allSkills.slice(0, 3).join(' | ');

        // Build headline
        let headline = currentTitle;
        if (topSkills) {
            headline += ` | ${topSkills}`;
        }

        // Truncate if too long
        if (headline.length > this.maxHeadlineLength) {
            headline = headline.substring(0, this.maxHeadlineLength - 3) + '...';
        }

        return headline;
    }

    /**
     * Format summary from resume data
     * @param {Object} resumeData - Resume data
     * @returns {string} - Formatted summary (max 2000 chars)
     * @private
     */
    _formatSummary(resumeData) {
        const summary = resumeData.summary || '';
        const experience = resumeData.experience || [];

        // If we have a summary, use it (convert to first-person if needed)
        if (summary) {
            const firstPersonSummary = this._convertToFirstPerson(summary);
            return firstPersonSummary.substring(0, this.maxSummaryLength);
        }

        // Generate basic summary from experience
        if (experience.length > 0) {
            const yearsExp = this._calculateYearsExperience(experience);
            const currentRole = experience[0].title;
            const company = experience[0].company;

            let generated = `I'm a ${currentRole}`;
            if (company) {
                generated += ` at ${company}`;
            }
            generated += ` with ${yearsExp} years of professional experience.\n\n`;

            // Add brief description from first job
            if (experience[0].description) {
                generated += experience[0].description.substring(0, 500);
            }

            return generated.substring(0, this.maxSummaryLength);
        }

        return '';
    }

    /**
     * Format experience entries for LinkedIn
     * @param {Array} experience - Experience array
     * @returns {Array} - Formatted experience entries
     * @private
     */
    _formatExperience(experience) {
        return experience.map(exp => {
            // Format bullets into description
            let description = exp.description || '';

            if (exp.bullets && exp.bullets.length > 0) {
                description = exp.bullets.map(b => `• ${b}`).join('\n');
            }

            // Truncate if too long
            if (description.length > this.maxExperienceDescLength) {
                description = description.substring(0, this.maxExperienceDescLength - 3) + '...';
            }

            return {
                title: exp.title,
                company: exp.company,
                location: exp.location || '',
                startDate: this._formatDate(exp.startDate),
                endDate: exp.current ? 'Present' : this._formatDate(exp.endDate),
                description,
                employmentType: exp.employmentType || 'Full-time'
            };
        });
    }

    /**
     * Format education entries for LinkedIn
     * @param {Array} education - Education array
     * @returns {Array} - Formatted education entries
     * @private
     */
    _formatEducation(education) {
        return education.map(edu => ({
            school: edu.school,
            degree: edu.degree,
            fieldOfStudy: edu.field || edu.major || '',
            startDate: this._formatDate(edu.startDate),
            endDate: this._formatDate(edu.endDate),
            grade: edu.gpa || '',
            activities: edu.achievements ? edu.achievements.join(', ') : '',
            description: edu.description || ''
        }));
    }

    /**
     * Format skills for LinkedIn
     * @param {Object} skills - Skills object
     * @returns {Array} - Flat array of skills
     * @private
     */
    _formatSkills(skills) {
        const allSkills = [
            ...(skills.technical || []),
            ...(skills.soft || []),
            ...(skills.tools || []),
            ...(skills.languages || []),
            ...(skills.frameworks || [])
        ];

        // Remove duplicates
        return [...new Set(allSkills)];
    }

    /**
     * Format certifications for LinkedIn
     * @param {Array} certifications - Certifications array
     * @returns {Array} - Formatted certifications
     * @private
     */
    _formatCertifications(certifications) {
        return certifications.map(cert => ({
            name: cert.name,
            issuingOrganization: cert.issuer || cert.organization || '',
            issueDate: this._formatDate(cert.date || cert.issueDate),
            expirationDate: cert.expirationDate ? this._formatDate(cert.expirationDate) : '',
            credentialId: cert.credentialId || '',
            credentialUrl: cert.url || ''
        }));
    }

    /**
     * Format projects for LinkedIn
     * @param {Array} projects - Projects array
     * @returns {Array} - Formatted projects
     * @private
     */
    _formatProjects(projects) {
        return projects.map(proj => ({
            name: proj.name,
            description: proj.description || '',
            startDate: this._formatDate(proj.startDate || proj.date),
            endDate: proj.endDate ? this._formatDate(proj.endDate) : '',
            projectUrl: proj.url || proj.link || '',
            associatedWith: proj.company || ''
        }));
    }

    /**
     * Format publications for LinkedIn
     * @param {Array} publications - Publications array
     * @returns {Array} - Formatted publications
     * @private
     */
    _formatPublications(publications) {
        return publications.map(pub => ({
            title: pub.title,
            publisher: pub.publisher || pub.journal || '',
            publicationDate: this._formatDate(pub.date),
            description: pub.description || pub.abstract || '',
            publicationUrl: pub.url || pub.doi || ''
        }));
    }

    /**
     * Format languages for LinkedIn
     * @param {Array} languages - Languages array
     * @returns {Array} - Formatted languages
     * @private
     */
    _formatLanguages(languages) {
        return languages.map(lang => ({
            language: typeof lang === 'string' ? lang : lang.language,
            proficiency: lang.proficiency || 'Professional Working Proficiency'
        }));
    }

    /**
     * Copy section to clipboard
     * @param {string} sectionType - Type of section to copy
     * @param {*} sectionData - Section data
     * @returns {Promise<boolean>} - Success status
     */
    async copyToClipboard(sectionType, sectionData) {
        try {
            let text = '';

            switch (sectionType) {
                case 'headline':
                    text = sectionData;
                    break;

                case 'summary':
                    text = sectionData;
                    break;

                case 'experience':
                    text = this._formatExperienceForClipboard(sectionData);
                    break;

                case 'skills':
                    text = Array.isArray(sectionData) ? sectionData.join(', ') : sectionData;
                    break;

                case 'education':
                    text = this._formatEducationForClipboard(sectionData);
                    break;

                default:
                    text = JSON.stringify(sectionData, null, 2);
            }

            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback method
            return this._fallbackCopyToClipboard(text);
        }
    }

    /**
     * Format experience for clipboard
     * @param {Object} experience - Experience entry
     * @returns {string} - Formatted text
     * @private
     */
    _formatExperienceForClipboard(experience) {
        let text = `${experience.title}\n`;
        text += `${experience.company}`;
        if (experience.location) {
            text += ` • ${experience.location}`;
        }
        text += '\n';
        text += `${experience.startDate} - ${experience.endDate || 'Present'}\n\n`;
        text += experience.description || '';

        return text;
    }

    /**
     * Format education for clipboard
     * @param {Object} education - Education entry
     * @returns {string} - Formatted text
     * @private
     */
    _formatEducationForClipboard(education) {
        let text = `${education.school}\n`;
        text += `${education.degree}`;
        if (education.fieldOfStudy) {
            text += ` - ${education.fieldOfStudy}`;
        }
        text += '\n';
        if (education.startDate && education.endDate) {
            text += `${education.startDate} - ${education.endDate}\n`;
        }
        if (education.grade) {
            text += `GPA: ${education.grade}\n`;
        }

        return text;
    }

    /**
     * Fallback clipboard copy method
     * @param {string} text - Text to copy
     * @returns {boolean} - Success status
     * @private
     */
    _fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (error) {
            console.error('Fallback copy failed:', error);
            document.body.removeChild(textarea);
            return false;
        }
    }

    /**
     * Convert third-person text to first-person
     * @param {string} text - Text to convert
     * @returns {string} - Converted text
     * @private
     */
    _convertToFirstPerson(text) {
        // Simple conversion - replace common third-person patterns
        let converted = text;

        // Replace he/she with I
        converted = converted.replace(/\bHe\s+/g, 'I ');
        converted = converted.replace(/\bShe\s+/g, 'I ');

        // Replace his/her with my
        converted = converted.replace(/\bhis\s+/g, 'my ');
        converted = converted.replace(/\bher\s+/g, 'my ');

        // Replace him/her with me
        converted = converted.replace(/\bhim\b/g, 'me');
        converted = converted.replace(/\bher\b/g, 'me');

        // Replace [Name] has/is with I have/am
        converted = converted.replace(/\b\w+\s+has\s+/g, 'I have ');
        converted = converted.replace(/\b\w+\s+is\s+/g, 'I am ');

        return converted;
    }

    /**
     * Format date for LinkedIn (Month Year format)
     * @param {string} date - Date string
     * @returns {string} - Formatted date
     * @private
     */
    _formatDate(date) {
        if (!date) return '';

        // If already in correct format, return as is
        if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i.test(date)) {
            return date;
        }

        // Try to parse and format
        try {
            const dateObj = new Date(date);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        } catch (error) {
            return date; // Return original if parsing fails
        }
    }

    /**
     * Calculate years of experience from experience array
     * @param {Array} experience - Experience entries
     * @returns {number} - Years of experience
     * @private
     */
    _calculateYearsExperience(experience) {
        let totalMonths = 0;

        for (const exp of experience) {
            const start = new Date(exp.startDate);
            const end = exp.current || exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);

            if (!isNaN(start) && !isNaN(end)) {
                const months = (end.getFullYear() - start.getFullYear()) * 12 +
                              (end.getMonth() - start.getMonth());
                totalMonths += months;
            }
        }

        return Math.floor(totalMonths / 12);
    }

    /**
     * Generate downloadable text file
     * @param {string} filename - Filename
     * @param {string} content - File content
     */
    downloadAsText(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export full LinkedIn profile as text file
     * @param {Object} linkedInData - LinkedIn formatted data
     * @param {string} filename - Output filename
     */
    exportAsTextFile(linkedInData, filename = 'linkedin-profile.txt') {
        let content = '';

        // Headline
        if (linkedInData.headline) {
            content += '=== HEADLINE ===\n';
            content += linkedInData.headline + '\n\n';
        }

        // Summary
        if (linkedInData.summary) {
            content += '=== SUMMARY ===\n';
            content += linkedInData.summary + '\n\n';
        }

        // Experience
        if (linkedInData.experience && linkedInData.experience.length > 0) {
            content += '=== EXPERIENCE ===\n\n';
            for (const exp of linkedInData.experience) {
                content += this._formatExperienceForClipboard(exp) + '\n\n';
            }
        }

        // Education
        if (linkedInData.education && linkedInData.education.length > 0) {
            content += '=== EDUCATION ===\n\n';
            for (const edu of linkedInData.education) {
                content += this._formatEducationForClipboard(edu) + '\n\n';
            }
        }

        // Skills
        if (linkedInData.skills && linkedInData.skills.length > 0) {
            content += '=== SKILLS ===\n';
            content += linkedInData.skills.join(' • ') + '\n\n';
        }

        // Certifications
        if (linkedInData.certifications && linkedInData.certifications.length > 0) {
            content += '=== CERTIFICATIONS ===\n\n';
            for (const cert of linkedInData.certifications) {
                content += `${cert.name}\n`;
                content += `${cert.issuingOrganization}`;
                if (cert.issueDate) {
                    content += ` • Issued ${cert.issueDate}`;
                }
                content += '\n\n';
            }
        }

        this.downloadAsText(filename, content);
    }
}

// Create global instance
const linkedInExport = new LinkedInExport();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LinkedInExport, linkedInExport };
}
