/**
 * DOCX Export Module
 * Editable Word document generation using docx.js
 * Preserves formatting and ensures ATS compatibility
 */

class DOCXExporter {
    constructor() {
        this.defaultStyles = {
            paragraphStyles: [
                {
                    id: 'Normal',
                    name: 'Normal',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        font: 'Calibri',
                        size: 22 // 11pt (size is in half-points)
                    },
                    paragraph: {
                        spacing: {
                            after: 120,
                            line: 276
                        }
                    }
                },
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        font: 'Calibri',
                        size: 32, // 16pt
                        bold: true,
                        color: '2C3E50'
                    },
                    paragraph: {
                        spacing: {
                            before: 240,
                            after: 120
                        }
                    }
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        font: 'Calibri',
                        size: 26, // 13pt
                        bold: true,
                        color: '34495E'
                    },
                    paragraph: {
                        spacing: {
                            before: 120,
                            after: 60
                        },
                        border: {
                            bottom: {
                                color: 'CCCCCC',
                                space: 1,
                                value: 'single',
                                size: 6
                            }
                        }
                    }
                }
            ]
        };
    }

    /**
     * Export resume to DOCX
     * @param {Object} resumeState - Resume state object
     * @param {Object} options - Export options
     * @returns {Promise<Blob>}
     */
    async exportToDOCX(resumeState, options = {}) {
        try {
            // Check if docx is loaded (client-side will use CDN version)
            if (typeof docx === 'undefined') {
                throw new Error('docx library not loaded. Please include docx.js in your HTML.');
            }

            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } = docx;

            console.log('[DOCXExporter] Generating DOCX document...');

            // Build document sections
            const sections = this.buildDocumentSections(resumeState, docx);

            // Create document
            const doc = new Document({
                styles: this.defaultStyles,
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 720,    // 0.5 inch
                                right: 720,
                                bottom: 720,
                                left: 720
                            }
                        }
                    },
                    children: sections
                }]
            });

            // Generate blob
            const blob = await Packer.toBlob(doc);

            console.log('[DOCXExporter] DOCX generated successfully');

            return blob;
        } catch (error) {
            console.error('[DOCXExporter] Export failed:', error);
            throw new Error(`DOCX export failed: ${error.message}`);
        }
    }

    /**
     * Build document sections from resume state
     * @param {Object} resumeState - Resume state object
     * @param {Object} docx - docx library object
     * @returns {Array} Array of Paragraph objects
     */
    buildDocumentSections(resumeState, docx) {
        const { Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } = docx;
        const children = [];

        if (!resumeState || !resumeState.sections) {
            return [new Paragraph({ text: 'No content available' })];
        }

        // Process each section
        resumeState.sections.forEach(section => {
            const sectionContent = this.renderSection(section, docx);
            children.push(...sectionContent);
        });

        return children;
    }

    /**
     * Render a section based on type
     * @param {Object} section - Section data
     * @param {Object} docx - docx library object
     * @returns {Array} Array of Paragraph objects
     */
    renderSection(section, docx) {
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
            volunteering: this.renderVolunteering.bind(this)
        };

        const renderer = renderers[section.type] || this.renderGeneric.bind(this);
        return renderer(section, docx);
    }

    /**
     * Render header section
     */
    renderHeader(section, docx) {
        const { Paragraph, TextRun, AlignmentType } = docx;
        const content = section.content || {};
        const paragraphs = [];

        // Name
        if (content.name) {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: content.name,
                        bold: true,
                        size: 36, // 18pt
                        color: '2C3E50'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 }
            }));
        }

        // Title
        if (content.title) {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: content.title,
                        size: 24, // 12pt
                        color: '7F8C8D'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 }
            }));
        }

        // Contact info
        const contactParts = [];
        if (content.email) contactParts.push(content.email);
        if (content.phone) contactParts.push(content.phone);
        if (content.location) contactParts.push(content.location);
        if (content.linkedin) contactParts.push(content.linkedin);
        if (content.website) contactParts.push(content.website);

        if (contactParts.length > 0) {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: contactParts.join(' | '),
                        size: 20 // 10pt
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 240 }
            }));
        }

        return paragraphs;
    }

    /**
     * Render summary section
     */
    renderSummary(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Professional Summary', docx));

        if (content.text) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: content.text })],
                spacing: { after: 240 }
            }));
        }

        return paragraphs;
    }

    /**
     * Render experience section
     */
    renderExperience(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Work Experience', docx));

        const experiences = content.items || [];
        experiences.forEach((exp, index) => {
            // Job title and date
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: exp.title || '',
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: exp.date ? `\t${exp.date}` : '',
                        size: 22
                    })
                ],
                spacing: { before: index > 0 ? 180 : 0, after: 60 }
            }));

            // Company and location
            if (exp.company || exp.location) {
                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: `${exp.company || ''}${exp.location ? ' - ' + exp.location : ''}`,
                            italics: true,
                            size: 22
                        })
                    ],
                    spacing: { after: 120 }
                }));
            }

            // Bullets
            if (exp.bullets && exp.bullets.length > 0) {
                exp.bullets.forEach(bullet => {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: bullet })],
                        bullet: { level: 0 },
                        spacing: { after: 60 }
                    }));
                });
            }
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render education section
     */
    renderEducation(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Education', docx));

        const educations = content.items || [];
        educations.forEach((edu, index) => {
            // Degree and date
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: edu.degree || '',
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: edu.date ? `\t${edu.date}` : '',
                        size: 22
                    })
                ],
                spacing: { before: index > 0 ? 180 : 0, after: 60 }
            }));

            // Institution and location
            if (edu.institution || edu.location) {
                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: `${edu.institution || ''}${edu.location ? ' - ' + edu.location : ''}`,
                            italics: true,
                            size: 22
                        })
                    ],
                    spacing: { after: 60 }
                }));
            }

            // GPA and honors
            if (edu.gpa || edu.honors) {
                const details = [];
                if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
                if (edu.honors) details.push(edu.honors);

                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: details.join(' - '),
                            size: 22
                        })
                    ],
                    spacing: { after: 120 }
                }));
            }
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render skills section
     */
    renderSkills(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Skills', docx));

        const skills = content.items || [];
        if (skills.length > 0) {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: skills.join(' • '),
                        size: 22
                    })
                ],
                spacing: { after: 240 }
            }));
        }

        return paragraphs;
    }

    /**
     * Render certifications section
     */
    renderCertifications(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Certifications', docx));

        const certifications = content.items || [];
        certifications.forEach(cert => {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: cert.name || '',
                        bold: true,
                        size: 22
                    }),
                    new TextRun({
                        text: cert.date ? ` (${cert.date})` : '',
                        size: 22
                    }),
                    new TextRun({
                        text: cert.issuer ? ` - ${cert.issuer}` : '',
                        italics: true,
                        size: 22
                    })
                ],
                spacing: { after: 60 }
            }));
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render projects section
     */
    renderProjects(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Projects', docx));

        const projects = content.items || [];
        projects.forEach((proj, index) => {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: proj.name || '',
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: proj.date ? `\t${proj.date}` : '',
                        size: 22
                    })
                ],
                spacing: { before: index > 0 ? 180 : 0, after: 60 }
            }));

            if (proj.description) {
                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: proj.description,
                            italics: true,
                            size: 22
                        })
                    ],
                    spacing: { after: 60 }
                }));
            }

            if (proj.bullets && proj.bullets.length > 0) {
                proj.bullets.forEach(bullet => {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: bullet })],
                        bullet: { level: 0 },
                        spacing: { after: 60 }
                    }));
                });
            }
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render achievements section
     */
    renderAchievements(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Achievements', docx));

        const achievements = content.items || [];
        achievements.forEach(achievement => {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: achievement })],
                bullet: { level: 0 },
                spacing: { after: 60 }
            }));
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render languages section
     */
    renderLanguages(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Languages', docx));

        const languages = content.items || [];
        languages.forEach(lang => {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: `${lang.name || ''}: ${lang.proficiency || ''}`,
                        size: 22
                    })
                ],
                spacing: { after: 60 }
            }));
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render volunteering section
     */
    renderVolunteering(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Volunteering', docx));

        const volunteering = content.items || [];
        volunteering.forEach((vol, index) => {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({
                        text: vol.role || '',
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: vol.date ? `\t${vol.date}` : '',
                        size: 22
                    })
                ],
                spacing: { before: index > 0 ? 180 : 0, after: 60 }
            }));

            if (vol.organization) {
                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: vol.organization,
                            italics: true,
                            size: 22
                        })
                    ],
                    spacing: { after: 120 }
                }));
            }

            if (vol.bullets && vol.bullets.length > 0) {
                vol.bullets.forEach(bullet => {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: bullet })],
                        bullet: { level: 0 },
                        spacing: { after: 60 }
                    }));
                });
            }
        });

        paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        return paragraphs;
    }

    /**
     * Render generic section
     */
    renderGeneric(section, docx) {
        const { Paragraph, TextRun } = docx;
        const content = section.content || {};
        const paragraphs = [];

        paragraphs.push(this.createSectionHeader(section.name || 'Section', docx));

        const text = content.text || JSON.stringify(content, null, 2);
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text })],
            spacing: { after: 240 }
        }));

        return paragraphs;
    }

    /**
     * Create section header
     */
    createSectionHeader(text, docx) {
        const { Paragraph, TextRun } = docx;
        return new Paragraph({
            children: [
                new TextRun({
                    text: text.toUpperCase(),
                    bold: true,
                    size: 26,
                    color: '2C3E50'
                })
            ],
            spacing: { before: 240, after: 120 },
            border: {
                bottom: {
                    color: '95A5A6',
                    space: 1,
                    value: 'single',
                    size: 6
                }
            }
        });
    }

    /**
     * Download DOCX file
     * @param {Blob} blob - DOCX blob
     * @param {string} filename - Filename
     */
    downloadDOCX(blob, filename = 'resume.docx') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOCXExporter;
}
