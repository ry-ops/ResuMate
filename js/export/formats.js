/**
 * Additional Export Formats
 * Handles TXT, JSON, and HTML export formats
 */

class FormatExporter {
    constructor() {
        this.exporters = {
            txt: this.exportToTXT.bind(this),
            json: this.exportToJSON.bind(this),
            html: this.exportToHTML.bind(this)
        };
    }

    /**
     * Export resume to TXT (plain text)
     * @param {Object} resumeState - Resume state object
     * @param {Object} options - Export options
     * @returns {string} Plain text resume
     */
    exportToTXT(resumeState, options = {}) {
        if (!resumeState || !resumeState.sections) {
            return 'No resume content available.';
        }

        let text = '';
        const separator = options.separator || '\n';
        const sectionSeparator = options.sectionSeparator || '\n\n' + '='.repeat(80) + '\n\n';

        // Process each section
        resumeState.sections.forEach((section, index) => {
            if (index > 0) {
                text += sectionSeparator;
            }

            const sectionText = this.renderSectionToTXT(section);
            text += sectionText;
        });

        return text;
    }

    /**
     * Render a single section to TXT
     * @param {Object} section - Section object
     * @returns {string} Section as plain text
     */
    renderSectionToTXT(section) {
        const renderers = {
            header: this.renderHeaderTXT.bind(this),
            summary: this.renderSummaryTXT.bind(this),
            experience: this.renderExperienceTXT.bind(this),
            education: this.renderEducationTXT.bind(this),
            skills: this.renderSkillsTXT.bind(this),
            certifications: this.renderCertificationsTXT.bind(this),
            projects: this.renderProjectsTXT.bind(this),
            achievements: this.renderAchievementsTXT.bind(this),
            languages: this.renderLanguagesTXT.bind(this),
            volunteering: this.renderVolunteeringTXT.bind(this)
        };

        const renderer = renderers[section.type] || this.renderGenericTXT.bind(this);
        return renderer(section);
    }

    renderHeaderTXT(section) {
        const content = section.content || {};
        let text = '';

        if (content.name) {
            text += content.name.toUpperCase() + '\n';
            text += '='.repeat(content.name.length) + '\n\n';
        }

        if (content.title) {
            text += content.title + '\n\n';
        }

        const contactParts = [];
        if (content.email) contactParts.push('Email: ' + content.email);
        if (content.phone) contactParts.push('Phone: ' + content.phone);
        if (content.location) contactParts.push('Location: ' + content.location);
        if (content.linkedin) contactParts.push('LinkedIn: ' + content.linkedin);
        if (content.website) contactParts.push('Website: ' + content.website);

        if (contactParts.length > 0) {
            text += contactParts.join(' | ') + '\n';
        }

        return text;
    }

    renderSummaryTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'PROFESSIONAL SUMMARY').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';
        text += (content.text || '') + '\n';
        return text;
    }

    renderExperienceTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'WORK EXPERIENCE').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const experiences = content.items || [];
        experiences.forEach((exp, index) => {
            if (index > 0) text += '\n';

            text += `${exp.title || ''}\n`;
            if (exp.company || exp.location || exp.date) {
                const details = [];
                if (exp.company) details.push(exp.company);
                if (exp.location) details.push(exp.location);
                if (exp.date) details.push(exp.date);
                text += details.join(' | ') + '\n';
            }

            if (exp.bullets && exp.bullets.length > 0) {
                text += '\n';
                exp.bullets.forEach(bullet => {
                    text += `  • ${bullet}\n`;
                });
            }
            text += '\n';
        });

        return text;
    }

    renderEducationTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'EDUCATION').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const educations = content.items || [];
        educations.forEach((edu, index) => {
            if (index > 0) text += '\n';

            text += `${edu.degree || ''}\n`;
            if (edu.institution || edu.location || edu.date) {
                const details = [];
                if (edu.institution) details.push(edu.institution);
                if (edu.location) details.push(edu.location);
                if (edu.date) details.push(edu.date);
                text += details.join(' | ') + '\n';
            }

            if (edu.gpa || edu.honors) {
                const achievements = [];
                if (edu.gpa) achievements.push(`GPA: ${edu.gpa}`);
                if (edu.honors) achievements.push(edu.honors);
                text += achievements.join(' | ') + '\n';
            }
            text += '\n';
        });

        return text;
    }

    renderSkillsTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'SKILLS').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const skills = content.items || [];
        text += skills.join(', ') + '\n';

        return text;
    }

    renderCertificationsTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'CERTIFICATIONS').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const certifications = content.items || [];
        certifications.forEach(cert => {
            text += `  • ${cert.name || ''}`;
            if (cert.issuer) text += ` - ${cert.issuer}`;
            if (cert.date) text += ` (${cert.date})`;
            text += '\n';
        });

        return text;
    }

    renderProjectsTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'PROJECTS').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const projects = content.items || [];
        projects.forEach((proj, index) => {
            if (index > 0) text += '\n';

            text += `${proj.name || ''}\n`;
            if (proj.description) text += `${proj.description}\n`;
            if (proj.date) text += `Date: ${proj.date}\n`;

            if (proj.bullets && proj.bullets.length > 0) {
                text += '\n';
                proj.bullets.forEach(bullet => {
                    text += `  • ${bullet}\n`;
                });
            }
            text += '\n';
        });

        return text;
    }

    renderAchievementsTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'ACHIEVEMENTS').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const achievements = content.items || [];
        achievements.forEach(achievement => {
            text += `  • ${achievement}\n`;
        });

        return text;
    }

    renderLanguagesTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'LANGUAGES').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const languages = content.items || [];
        languages.forEach(lang => {
            text += `  • ${lang.name || ''}: ${lang.proficiency || ''}\n`;
        });

        return text;
    }

    renderVolunteeringTXT(section) {
        const content = section.content || {};
        let text = (section.name || 'VOLUNTEERING').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const volunteering = content.items || [];
        volunteering.forEach((vol, index) => {
            if (index > 0) text += '\n';

            text += `${vol.role || ''}\n`;
            if (vol.organization || vol.date) {
                const details = [];
                if (vol.organization) details.push(vol.organization);
                if (vol.date) details.push(vol.date);
                text += details.join(' | ') + '\n';
            }

            if (vol.bullets && vol.bullets.length > 0) {
                text += '\n';
                vol.bullets.forEach(bullet => {
                    text += `  • ${bullet}\n`;
                });
            }
            text += '\n';
        });

        return text;
    }

    renderGenericTXT(section) {
        let text = (section.name || 'SECTION').toUpperCase() + '\n';
        text += '-'.repeat(50) + '\n';

        const content = section.content || {};
        text += (content.text || JSON.stringify(content, null, 2)) + '\n';

        return text;
    }

    /**
     * Export resume to JSON
     * @param {Object} resumeState - Resume state object
     * @param {Object} options - Export options
     * @returns {string} JSON string
     */
    exportToJSON(resumeState, options = {}) {
        const indent = options.pretty !== false ? 2 : 0;

        const exportData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            resume: resumeState,
            metadata: {
                format: 'ATSFlow JSON Export',
                generator: 'ATSFlow v0.1.0',
                ...options.metadata
            }
        };

        return JSON.stringify(exportData, null, indent);
    }

    /**
     * Export resume to HTML (self-contained)
     * @param {Object} resumeState - Resume state object
     * @param {Object} options - Export options
     * @returns {string} Complete HTML document
     */
    exportToHTML(resumeState, options = {}) {
        const template = options.template || 'modern';
        const title = options.title || 'Resume';

        // Get CSS for the template
        const css = this.getTemplateCSS(template);

        // Render resume HTML
        const resumeHTML = this.renderResumeHTML(resumeState);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #ffffff;
            padding: 2rem;
        }

        .resume-document {
            max-width: 8.5in;
            margin: 0 auto;
            background: #fff;
            padding: 0.5in;
        }

        .resume-header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #333;
        }

        .resume-header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }

        .contact-info {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.9rem;
            color: #666;
        }

        .contact-info span::after {
            content: "|";
            margin-left: 1rem;
            color: #ccc;
        }

        .contact-info span:last-child::after {
            content: "";
        }

        .resume-section {
            margin-bottom: 1.5rem;
        }

        .resume-section h2 {
            font-size: 1.25rem;
            color: #2c3e50;
            margin-bottom: 0.75rem;
            padding-bottom: 0.25rem;
            border-bottom: 1px solid #ccc;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .resume-item {
            margin-bottom: 1rem;
        }

        .resume-item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.25rem;
        }

        .resume-item-title {
            font-weight: bold;
            font-size: 1.05rem;
        }

        .resume-item-date {
            font-style: italic;
            color: #666;
            font-size: 0.9rem;
        }

        .resume-item-subtitle {
            font-style: italic;
            color: #555;
            margin-bottom: 0.5rem;
        }

        .resume-item-description ul {
            margin-left: 1.5rem;
            margin-top: 0.5rem;
        }

        .resume-item-description li {
            margin-bottom: 0.25rem;
        }

        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill-tag {
            background: #f0f0f0;
            padding: 0.25rem 0.75rem;
            border-radius: 3px;
            font-size: 0.9rem;
            color: #333;
        }

        /* Print styles */
        @media print {
            body {
                padding: 0;
            }

            .resume-document {
                padding: 0;
            }
        }

        ${css}
    </style>
</head>
<body>
    <div class="resume-document">
        ${resumeHTML}
    </div>
    <script>
        // Optional: Auto-print on load
        if (window.location.hash === '#print') {
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        }
    </script>
</body>
</html>`;
    }

    /**
     * Render resume sections to HTML
     * @param {Object} resumeState - Resume state object
     * @returns {string} HTML content
     */
    renderResumeHTML(resumeState) {
        if (!resumeState || !resumeState.sections) {
            return '<p>No resume content available.</p>';
        }

        // Use the existing ResumeRenderer if available
        if (typeof ResumeRenderer !== 'undefined') {
            const renderer = new ResumeRenderer();
            return renderer.render(resumeState);
        }

        // Fallback to basic rendering
        return resumeState.sections.map(section => {
            return this.renderSectionHTML(section);
        }).join('\n');
    }

    /**
     * Render a section to HTML
     * @param {Object} section - Section object
     * @returns {string} HTML content
     */
    renderSectionHTML(section) {
        // Basic rendering - in production, use ResumeRenderer
        return `<div class="resume-section">
            <h2>${this.escapeHtml(section.name || 'Section')}</h2>
            <div class="resume-section-content">
                <pre>${this.escapeHtml(JSON.stringify(section.content, null, 2))}</pre>
            </div>
        </div>`;
    }

    /**
     * Get template CSS
     * @param {string} template - Template name
     * @returns {string} CSS string
     */
    getTemplateCSS(template) {
        // In production, this would load the actual template CSS
        return '/* Template-specific styles would be injected here */';
    }

    /**
     * Download file
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Download TXT file
     * @param {string} content - TXT content
     * @param {string} filename - Filename
     */
    downloadTXT(content, filename = 'resume.txt') {
        this.downloadFile(content, filename, 'text/plain;charset=utf-8');
    }

    /**
     * Download JSON file
     * @param {string} content - JSON content
     * @param {string} filename - Filename
     */
    downloadJSON(content, filename = 'resume.json') {
        this.downloadFile(content, filename, 'application/json;charset=utf-8');
    }

    /**
     * Download HTML file
     * @param {string} content - HTML content
     * @param {string} filename - Filename
     */
    downloadHTML(content, filename = 'resume.html') {
        this.downloadFile(content, filename, 'text/html;charset=utf-8');
    }

    /**
     * Escape HTML
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Export to specific format
     * @param {string} format - Format (txt, json, html)
     * @param {Object} resumeState - Resume state object
     * @param {Object} options - Export options
     * @returns {string} Exported content
     */
    export(format, resumeState, options = {}) {
        const exporter = this.exporters[format.toLowerCase()];
        if (!exporter) {
            throw new Error(`Unsupported format: ${format}`);
        }
        return exporter(resumeState, options);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormatExporter;
}
