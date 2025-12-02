/**
 * ResuMate Renderer
 * Converts resume state to HTML/CSS for live preview
 */

class ResumeRenderer {
    constructor() {
        this.pageSize = 'a4'; // 'a4' or 'letter'
        this.templateStyles = null;
    }

    /**
     * Render complete resume from state
     * @param {Object} resumeState - The resume state object
     * @returns {string} HTML string
     */
    render(resumeState) {
        if (!resumeState || !resumeState.sections) {
            return this.renderEmpty();
        }

        const sections = resumeState.sections || [];
        const sectionsHtml = sections
            .map(section => this.renderSection(section))
            .join('\n');

        return `
            <div class="resume-document ${this.pageSize}">
                <div class="resume-page">
                    ${sectionsHtml}
                    <div class="page-number">Page 1</div>
                </div>
            </div>
        `;
    }

    /**
     * Render empty state
     * @returns {string} HTML string
     */
    renderEmpty() {
        return `
            <div class="resume-document ${this.pageSize}">
                <div class="resume-page">
                    <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <h2>Your Resume Preview</h2>
                        <p>Start adding sections to see your resume come to life</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render a single section based on type
     * @param {Object} section - Section object with type and content
     * @returns {string} HTML string
     */
    renderSection(section) {
        if (!section || !section.type) {
            return '';
        }

        const renderers = {
            header: this.renderHeader.bind(this),
            summary: this.renderSummary.bind(this),
            experience: this.renderExperience.bind(this),
            education: this.renderEducation.bind(this),
            skills: this.renderSkills.bind(this),
            certifications: this.renderCertifications.bind(this),
            projects: this.renderProjects.bind(this),
            achievements: this.renderAchievements.bind(this),
            languages: this.renderLanguages.bind(this),
            volunteering: this.renderVolunteering.bind(this),
            publications: this.renderPublications.bind(this),
            awards: this.renderAwards.bind(this),
            references: this.renderReferences.bind(this),
            dayInLife: this.renderDayInLife.bind(this),
            philosophy: this.renderPhilosophy.bind(this),
            strengths: this.renderStrengths.bind(this),
            passions: this.renderPassions.bind(this)
        };

        const renderer = renderers[section.type] || this.renderGeneric.bind(this);
        return renderer(section);
    }

    /**
     * Render header section
     */
    renderHeader(section) {
        const content = section.content || {};
        const { name = '', title = '', email = '', phone = '', location = '', linkedin = '', website = '' } = content;

        const contactItems = [
            email && `<span>${this.escapeHtml(email)}</span>`,
            phone && `<span>${this.escapeHtml(phone)}</span>`,
            location && `<span>${this.escapeHtml(location)}</span>`,
            linkedin && `<span>${this.escapeHtml(linkedin)}</span>`,
            website && `<span>${this.escapeHtml(website)}</span>`
        ].filter(Boolean).join('');

        return `
            <div class="resume-header">
                <h1>${this.escapeHtml(name)}</h1>
                ${title ? `<div style="font-size: 1.125rem; color: var(--text-muted); margin-bottom: 0.5rem;">${this.escapeHtml(title)}</div>` : ''}
                <div class="contact-info">
                    ${contactItems}
                </div>
            </div>
        `;
    }

    /**
     * Render summary section
     */
    renderSummary(section) {
        const content = section.content || {};
        const text = content.text || '';

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Professional Summary')}</h2>
                <div class="resume-section-content">
                    <p>${this.escapeHtml(text)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render experience section
     */
    renderExperience(section) {
        const content = section.content || {};
        const experiences = content.items || [];

        const itemsHtml = experiences.map(exp => {
            const bullets = (exp.bullets || [])
                .map(bullet => `<li>${this.escapeHtml(bullet)}</li>`)
                .join('');

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div class="resume-item-title">${this.escapeHtml(exp.title || '')}</div>
                        <div class="resume-item-date">${this.escapeHtml(exp.date || '')}</div>
                    </div>
                    <div class="resume-item-subtitle">${this.escapeHtml(exp.company || '')}${exp.location ? ` - ${this.escapeHtml(exp.location)}` : ''}</div>
                    ${bullets ? `<div class="resume-item-description"><ul>${bullets}</ul></div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Work Experience')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render education section
     */
    renderEducation(section) {
        const content = section.content || {};
        const educations = content.items || [];

        const itemsHtml = educations.map(edu => {
            const details = [
                edu.gpa && `GPA: ${this.escapeHtml(edu.gpa)}`,
                edu.honors && this.escapeHtml(edu.honors)
            ].filter(Boolean).join(' - ');

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div class="resume-item-title">${this.escapeHtml(edu.degree || '')}</div>
                        <div class="resume-item-date">${this.escapeHtml(edu.date || '')}</div>
                    </div>
                    <div class="resume-item-subtitle">${this.escapeHtml(edu.institution || '')}${edu.location ? ` - ${this.escapeHtml(edu.location)}` : ''}</div>
                    ${details ? `<div class="resume-item-description">${details}</div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Education')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render skills section
     */
    renderSkills(section) {
        const content = section.content || {};
        const skills = content.items || [];

        const skillsHtml = skills
            .map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`)
            .join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Skills')}</h2>
                <div class="resume-section-content">
                    <div class="skills-list">
                        ${skillsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render certifications section
     */
    renderCertifications(section) {
        const content = section.content || {};
        const certifications = content.items || [];

        const itemsHtml = certifications.map(cert => `
            <div class="resume-item">
                <div class="resume-item-header">
                    <div class="resume-item-title">${this.escapeHtml(cert.name || '')}</div>
                    <div class="resume-item-date">${this.escapeHtml(cert.date || '')}</div>
                </div>
                ${cert.issuer ? `<div class="resume-item-subtitle">${this.escapeHtml(cert.issuer)}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Certifications')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render projects section
     */
    renderProjects(section) {
        const content = section.content || {};
        const projects = content.items || [];

        const itemsHtml = projects.map(proj => {
            const bullets = (proj.bullets || [])
                .map(bullet => `<li>${this.escapeHtml(bullet)}</li>`)
                .join('');

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div class="resume-item-title">${this.escapeHtml(proj.name || '')}</div>
                        <div class="resume-item-date">${this.escapeHtml(proj.date || '')}</div>
                    </div>
                    ${proj.description ? `<div class="resume-item-subtitle">${this.escapeHtml(proj.description)}</div>` : ''}
                    ${bullets ? `<div class="resume-item-description"><ul>${bullets}</ul></div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Projects')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render achievements section
     */
    renderAchievements(section) {
        const content = section.content || {};
        const achievements = content.items || [];

        const itemsHtml = achievements
            .map(achievement => `<li>${this.escapeHtml(achievement)}</li>`)
            .join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Achievements')}</h2>
                <div class="resume-section-content">
                    <ul>
                        ${itemsHtml}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Render languages section
     */
    renderLanguages(section) {
        const content = section.content || {};
        const languages = content.items || [];

        const itemsHtml = languages.map(lang => `
            <div class="resume-item">
                <div class="resume-item-header">
                    <div class="resume-item-title">${this.escapeHtml(lang.name || '')}</div>
                    <div class="resume-item-date">${this.escapeHtml(lang.proficiency || '')}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Languages')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render volunteering section
     */
    renderVolunteering(section) {
        const content = section.content || {};
        const volunteering = content.items || [];

        const itemsHtml = volunteering.map(vol => {
            const bullets = (vol.bullets || [])
                .map(bullet => `<li>${this.escapeHtml(bullet)}</li>`)
                .join('');

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div class="resume-item-title">${this.escapeHtml(vol.role || '')}</div>
                        <div class="resume-item-date">${this.escapeHtml(vol.date || '')}</div>
                    </div>
                    <div class="resume-item-subtitle">${this.escapeHtml(vol.organization || '')}</div>
                    ${bullets ? `<div class="resume-item-description"><ul>${bullets}</ul></div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Volunteering')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render publications section
     */
    renderPublications(section) {
        const content = section.content || {};
        const publications = content.items || [];

        const itemsHtml = publications.map(pub => `
            <div class="resume-item">
                <div class="resume-item-header">
                    <div class="resume-item-title">${this.escapeHtml(pub.title || '')}</div>
                    <div class="resume-item-date">${this.escapeHtml(pub.date || '')}</div>
                </div>
                ${pub.publisher ? `<div class="resume-item-subtitle">${this.escapeHtml(pub.publisher)}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Publications')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render awards section
     */
    renderAwards(section) {
        const content = section.content || {};
        const awards = content.items || [];

        const itemsHtml = awards.map(award => `
            <div class="resume-item">
                <div class="resume-item-header">
                    <div class="resume-item-title">${this.escapeHtml(award.name || '')}</div>
                    <div class="resume-item-date">${this.escapeHtml(award.date || '')}</div>
                </div>
                ${award.issuer ? `<div class="resume-item-subtitle">${this.escapeHtml(award.issuer)}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Awards')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render references section
     */
    renderReferences(section) {
        const content = section.content || {};
        const references = content.items || [];

        if (references.length === 0) {
            return `
                <div class="resume-section">
                    <h2>${this.escapeHtml(section.name || 'References')}</h2>
                    <div class="resume-section-content">
                        <p>Available upon request</p>
                    </div>
                </div>
            `;
        }

        const itemsHtml = references.map(ref => `
            <div class="resume-item">
                <div class="resume-item-title">${this.escapeHtml(ref.name || '')}</div>
                <div class="resume-item-subtitle">${this.escapeHtml(ref.title || '')}${ref.company ? ` - ${this.escapeHtml(ref.company)}` : ''}</div>
                ${ref.email ? `<div>${this.escapeHtml(ref.email)}</div>` : ''}
                ${ref.phone ? `<div>${this.escapeHtml(ref.phone)}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'References')}</h2>
                <div class="resume-section-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render day in life section
     */
    renderDayInLife(section) {
        const content = section.content || {};
        const text = content.text || '';

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'A Day in My Life')}</h2>
                <div class="resume-section-content">
                    <p>${this.escapeHtml(text)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render philosophy section
     */
    renderPhilosophy(section) {
        const content = section.content || {};
        const text = content.text || '';

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'My Philosophy')}</h2>
                <div class="resume-section-content">
                    <p>${this.escapeHtml(text)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render strengths section
     */
    renderStrengths(section) {
        const content = section.content || {};
        const strengths = content.items || [];

        const itemsHtml = strengths
            .map(strength => `<li>${this.escapeHtml(strength)}</li>`)
            .join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Key Strengths')}</h2>
                <div class="resume-section-content">
                    <ul>
                        ${itemsHtml}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Render passions section
     */
    renderPassions(section) {
        const content = section.content || {};
        const passions = content.items || [];

        const itemsHtml = passions
            .map(passion => `<span class="skill-tag">${this.escapeHtml(passion)}</span>`)
            .join('');

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Passions & Interests')}</h2>
                <div class="resume-section-content">
                    <div class="skills-list">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render generic section (fallback)
     */
    renderGeneric(section) {
        const content = section.content || {};
        const text = content.text || JSON.stringify(content, null, 2);

        return `
            <div class="resume-section">
                <h2>${this.escapeHtml(section.name || 'Section')}</h2>
                <div class="resume-section-content">
                    <p>${this.escapeHtml(text)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
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
     * Set page size for rendering
     * @param {string} size - 'a4' or 'letter'
     */
    setPageSize(size) {
        this.pageSize = size;
    }

    /**
     * Apply template styles
     * @param {string} templateCss - CSS string for template
     */
    applyTemplate(templateCss) {
        this.templateStyles = templateCss;
    }

    /**
     * Calculate page breaks based on content height
     * @param {HTMLElement} container - Container element
     * @returns {Array} Array of page break positions
     */
    calculatePageBreaks(container) {
        const pageHeight = this.pageSize === 'a4' ? 1122 : 1056; // pixels at 96 DPI
        const sections = container.querySelectorAll('.resume-section');
        const breaks = [];
        let currentHeight = 0;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            if (currentHeight + sectionHeight > pageHeight) {
                breaks.push(currentHeight);
                currentHeight = sectionHeight;
            } else {
                currentHeight += sectionHeight;
            }
        });

        return breaks;
    }

    /**
     * Insert page breaks into rendered HTML
     * @param {string} html - HTML string
     * @returns {string} HTML with page breaks
     */
    insertPageBreaks(html) {
        // This is a placeholder - actual implementation would need DOM manipulation
        return html;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeRenderer;
}
