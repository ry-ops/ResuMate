/**
 * Template Registry - Catalog of available resume templates with metadata
 * Manages template discovery, categorization, and metadata
 */

class TemplateRegistry {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }

    /**
     * Initialize the template catalog
     */
    initializeTemplates() {
        // Classic Template - Traditional, ATS-optimized single-column layout
        this.registerTemplate({
            id: 'classic',
            name: 'Classic Professional',
            category: 'classic',
            description: 'Traditional single-column layout with conservative styling. Maximum ATS compatibility.',
            atsScore: 100,
            layout: {
                type: 'single-column',
                columns: 1,
                sections: ['header', 'summary', 'experience', 'education', 'skills']
            },
            colorScheme: {
                primary: '#000000',
                secondary: '#333333',
                accent: '#666666',
                text: '#000000',
                background: '#ffffff',
                border: '#cccccc'
            },
            typography: {
                headingFont: 'Georgia, serif',
                bodyFont: 'Times New Roman, serif',
                baseSize: 11,
                headingSizes: {
                    h1: 18,
                    h2: 14,
                    h3: 12
                },
                lineHeight: 1.4
            },
            spacing: {
                sectionSpacing: 16,
                itemSpacing: 8,
                margins: {
                    top: 25,
                    right: 25,
                    bottom: 25,
                    left: 25
                }
            },
            pageSize: ['a4', 'letter'],
            features: {
                colorSupport: false,
                icons: false,
                graphics: false,
                multiColumn: false,
                atsOptimized: true
            },
            bestFor: ['Corporate', 'Finance', 'Legal', 'Healthcare', 'Government'],
            preview: '/assets/previews/classic-preview.png',
            thumbnail: '/assets/thumbnails/classic-thumb.png'
        });

        // Modern Template - Clean, contemporary design with subtle color accents
        this.registerTemplate({
            id: 'modern',
            name: 'Modern Professional',
            category: 'modern',
            description: 'Clean lines with subtle color accents. Professional yet contemporary design.',
            atsScore: 95,
            layout: {
                type: 'single-column',
                columns: 1,
                sections: ['header', 'summary', 'experience', 'skills', 'education', 'certifications']
            },
            colorScheme: {
                primary: '#2c3e50',
                secondary: '#3498db',
                accent: '#1abc9c',
                text: '#2c3e50',
                background: '#ffffff',
                border: '#ecf0f1'
            },
            typography: {
                headingFont: 'Helvetica Neue, Arial, sans-serif',
                bodyFont: 'Helvetica Neue, Arial, sans-serif',
                baseSize: 11,
                headingSizes: {
                    h1: 22,
                    h2: 16,
                    h3: 13
                },
                lineHeight: 1.5
            },
            spacing: {
                sectionSpacing: 20,
                itemSpacing: 10,
                margins: {
                    top: 30,
                    right: 30,
                    bottom: 30,
                    left: 30
                }
            },
            pageSize: ['a4', 'letter'],
            features: {
                colorSupport: true,
                icons: true,
                graphics: false,
                multiColumn: false,
                atsOptimized: true
            },
            bestFor: ['Technology', 'Marketing', 'Design', 'Startups', 'Creative'],
            preview: '/assets/previews/modern-preview.png',
            thumbnail: '/assets/thumbnails/modern-thumb.png'
        });

        // Creative Template - Two-column layout with sidebar
        this.registerTemplate({
            id: 'creative',
            name: 'Creative Professional',
            category: 'creative',
            description: 'Two-column layout with visual hierarchy. Ideal for creative industries.',
            atsScore: 85,
            layout: {
                type: 'two-column',
                columns: 2,
                mainColumn: 0.65,
                sidebarColumn: 0.35,
                sections: {
                    main: ['header', 'summary', 'experience', 'education'],
                    sidebar: ['contact', 'skills', 'languages', 'certifications']
                }
            },
            colorScheme: {
                primary: '#34495e',
                secondary: '#e74c3c',
                accent: '#f39c12',
                text: '#2c3e50',
                background: '#ffffff',
                border: '#bdc3c7',
                sidebar: '#ecf0f1'
            },
            typography: {
                headingFont: 'Montserrat, Arial, sans-serif',
                bodyFont: 'Open Sans, Arial, sans-serif',
                baseSize: 10.5,
                headingSizes: {
                    h1: 24,
                    h2: 16,
                    h3: 13
                },
                lineHeight: 1.5
            },
            spacing: {
                sectionSpacing: 18,
                itemSpacing: 9,
                margins: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },
            pageSize: ['a4', 'letter'],
            features: {
                colorSupport: true,
                icons: true,
                graphics: true,
                multiColumn: true,
                atsOptimized: true
            },
            bestFor: ['Design', 'Marketing', 'Media', 'Creative', 'Arts'],
            preview: '/assets/previews/creative-preview.png',
            thumbnail: '/assets/thumbnails/creative-thumb.png'
        });

        // Executive Template - Premium elegance for senior leadership
        this.registerTemplate({
            id: 'executive',
            name: 'Executive Professional',
            category: 'executive',
            description: 'Premium, understated elegance with serif typography. Perfect for C-suite, VP, and Director roles.',
            atsScore: 93,
            layout: {
                type: 'single-column',
                columns: 1,
                sections: ['header', 'summary', 'experience', 'education', 'skills', 'certifications']
            },
            colorScheme: {
                primary: '#1a2332',
                secondary: '#2c3e50',
                accent: '#b8860b',
                text: '#1a2332',
                background: '#ffffff',
                border: '#d4d4d4'
            },
            typography: {
                headingFont: 'Garamond, Georgia, serif',
                bodyFont: 'Georgia, serif',
                baseSize: 11,
                headingSizes: {
                    h1: 24,
                    h2: 15,
                    h3: 13
                },
                lineHeight: 1.6
            },
            spacing: {
                sectionSpacing: 24,
                itemSpacing: 12,
                margins: {
                    top: 35,
                    right: 35,
                    bottom: 35,
                    left: 35
                }
            },
            pageSize: ['a4', 'letter'],
            features: {
                colorSupport: false,
                icons: false,
                graphics: false,
                multiColumn: false,
                atsOptimized: true
            },
            bestFor: ['Executive', 'C-Suite', 'VP', 'Director', 'Senior Leadership', 'Board'],
            preview: '/assets/previews/executive-preview.png',
            thumbnail: '/assets/thumbnails/executive-thumb.png'
        });

        // Technical Template - Code-inspired design for tech professionals
        this.registerTemplate({
            id: 'technical',
            name: 'Technical Professional',
            category: 'technical',
            description: 'Code-inspired design with monospace accents and syntax highlighting colors. Ideal for engineers and developers.',
            atsScore: 88,
            layout: {
                type: 'single-column',
                columns: 1,
                sections: ['header', 'summary', 'experience', 'skills', 'projects', 'education', 'certifications']
            },
            colorScheme: {
                primary: '#282c34',
                secondary: '#61dafb',
                accent: '#98c379',
                text: '#282c34',
                background: '#ffffff',
                border: '#e1e4e8',
                codeBackground: '#f6f8fa'
            },
            typography: {
                headingFont: 'Helvetica Neue, Arial, sans-serif',
                bodyFont: '-apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif',
                baseSize: 10.5,
                headingSizes: {
                    h1: 20,
                    h2: 14,
                    h3: 12
                },
                lineHeight: 1.5
            },
            spacing: {
                sectionSpacing: 18,
                itemSpacing: 10,
                margins: {
                    top: 28,
                    right: 28,
                    bottom: 28,
                    left: 28
                }
            },
            pageSize: ['a4', 'letter'],
            features: {
                colorSupport: true,
                icons: false,
                graphics: false,
                multiColumn: false,
                atsOptimized: true
            },
            bestFor: ['Software Engineer', 'DevOps', 'Data Scientist', 'Developer', 'SRE', 'Technical'],
            preview: '/assets/previews/technical-preview.png',
            thumbnail: '/assets/thumbnails/technical-thumb.png'
        });

        // Minimal Template - Typography-focused ultra-clean design
        this.registerTemplate({
            id: 'minimal',
            name: 'Minimal Professional',
            category: 'minimal',
            description: 'Typography-focused with generous whitespace and subtle dividers. Perfect for designers, writers, and consultants.',
            atsScore: 98,
            layout: {
                type: 'single-column',
                columns: 1,
                sections: ['header', 'summary', 'experience', 'skills', 'education', 'certifications']
            },
            colorScheme: {
                primary: '#1a1a1a',
                secondary: '#4a4a4a',
                accent: '#6a6a6a',
                text: '#2a2a2a',
                background: '#ffffff',
                border: '#e8e8e8'
            },
            typography: {
                headingFont: 'Lato, Open Sans, -apple-system, sans-serif',
                bodyFont: 'Open Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                baseSize: 11,
                headingSizes: {
                    h1: 28,
                    h2: 13,
                    h3: 12
                },
                lineHeight: 1.7
            },
            spacing: {
                sectionSpacing: 28,
                itemSpacing: 14,
                margins: {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40
                }
            },
            pageSize: ['a4', 'letter'],
            features: {
                colorSupport: false,
                icons: false,
                graphics: false,
                multiColumn: false,
                atsOptimized: true
            },
            bestFor: ['Designer', 'Writer', 'Consultant', 'Creative', 'Minimalist', 'Modern'],
            preview: '/assets/previews/minimal-preview.png',
            thumbnail: '/assets/thumbnails/minimal-thumb.png'
        });
    }

    /**
     * Register a new template
     * @param {Object} template - Template metadata
     */
    registerTemplate(template) {
        if (!template.id) {
            throw new Error('Template must have an id');
        }

        // Validate required fields
        const required = ['name', 'category', 'description', 'atsScore', 'layout', 'colorScheme', 'typography'];
        for (const field of required) {
            if (!template[field]) {
                throw new Error(`Template missing required field: ${field}`);
            }
        }

        this.templates.set(template.id, template);
        console.log(`Template '${template.id}' registered`);
    }

    /**
     * Get a template by ID
     * @param {string} templateId - Template identifier
     * @returns {Object|null} Template metadata or null
     */
    getTemplate(templateId) {
        return this.templates.get(templateId) || null;
    }

    /**
     * Get all templates
     * @returns {Array} Array of all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Get templates by category
     * @param {string} category - Category name
     * @returns {Array} Filtered templates
     */
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(t => t.category === category);
    }

    /**
     * Get templates by ATS score threshold
     * @param {number} minScore - Minimum ATS score
     * @returns {Array} Filtered templates
     */
    getTemplatesByAtsScore(minScore) {
        return this.getAllTemplates().filter(t => t.atsScore >= minScore);
    }

    /**
     * Search templates
     * @param {string} query - Search query
     * @returns {Array} Matching templates
     */
    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllTemplates().filter(template => {
            return (
                template.name.toLowerCase().includes(lowerQuery) ||
                template.description.toLowerCase().includes(lowerQuery) ||
                template.category.toLowerCase().includes(lowerQuery) ||
                template.bestFor.some(industry => industry.toLowerCase().includes(lowerQuery))
            );
        });
    }

    /**
     * Get recommended templates for an industry
     * @param {string} industry - Industry name
     * @returns {Array} Recommended templates
     */
    getRecommendedTemplates(industry) {
        return this.getAllTemplates()
            .filter(template => template.bestFor.some(bf =>
                bf.toLowerCase().includes(industry.toLowerCase())
            ))
            .sort((a, b) => b.atsScore - a.atsScore);
    }

    /**
     * Get template categories
     * @returns {Array} Unique categories
     */
    getCategories() {
        const categories = new Set();
        this.getAllTemplates().forEach(template => {
            categories.add(template.category);
        });
        return Array.from(categories);
    }

    /**
     * Get template statistics
     * @returns {Object} Template statistics
     */
    getStats() {
        const templates = this.getAllTemplates();
        return {
            total: templates.length,
            byCategory: this.getCategories().reduce((acc, cat) => {
                acc[cat] = this.getTemplatesByCategory(cat).length;
                return acc;
            }, {}),
            avgAtsScore: templates.reduce((sum, t) => sum + t.atsScore, 0) / templates.length,
            withColorSupport: templates.filter(t => t.features.colorSupport).length,
            multiColumn: templates.filter(t => t.features.multiColumn).length
        };
    }

    /**
     * Validate template compatibility with resume data
     * @param {string} templateId - Template to validate
     * @param {Object} resumeData - Resume data object
     * @returns {Object} Compatibility report
     */
    validateCompatibility(templateId, resumeData) {
        const template = this.getTemplate(templateId);
        if (!template) {
            return { compatible: false, reason: 'Template not found' };
        }

        const issues = [];
        const warnings = [];

        // Check if resume has sections that match template layout
        if (template.layout.sections) {
            const requiredSections = Array.isArray(template.layout.sections)
                ? template.layout.sections
                : [...template.layout.sections.main, ...template.layout.sections.sidebar];

            const missingRecommended = requiredSections.filter(section =>
                !resumeData.sections?.some(s => s.type === section)
            );

            if (missingRecommended.length > 0) {
                warnings.push(`Recommended sections missing: ${missingRecommended.join(', ')}`);
            }
        }

        // Check content length for template constraints
        if (resumeData.sections) {
            const totalContent = resumeData.sections.reduce((acc, section) => {
                return acc + JSON.stringify(section.content).length;
            }, 0);

            if (totalContent > 4000 && template.spacing.margins.top < 25) {
                warnings.push('Content may overflow with current template margins');
            }
        }

        return {
            compatible: issues.length === 0,
            issues,
            warnings,
            atsScore: template.atsScore,
            recommendation: warnings.length === 0 ? 'Excellent fit' : 'Good fit with minor adjustments'
        };
    }

    /**
     * Export template metadata
     * @param {string} templateId - Template to export
     * @returns {Object|null} Template metadata or null
     */
    exportTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return null;

        return {
            ...template,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Compare two templates
     * @param {string} templateId1 - First template ID
     * @param {string} templateId2 - Second template ID
     * @returns {Object} Comparison result
     */
    compareTemplates(templateId1, templateId2) {
        const t1 = this.getTemplate(templateId1);
        const t2 = this.getTemplate(templateId2);

        if (!t1 || !t2) {
            return { error: 'One or both templates not found' };
        }

        return {
            templates: [t1.name, t2.name],
            comparison: {
                atsScore: {
                    [t1.name]: t1.atsScore,
                    [t2.name]: t2.atsScore,
                    winner: t1.atsScore > t2.atsScore ? t1.name : t2.name
                },
                layout: {
                    [t1.name]: t1.layout.type,
                    [t2.name]: t2.layout.type
                },
                colorSupport: {
                    [t1.name]: t1.features.colorSupport,
                    [t2.name]: t2.features.colorSupport
                },
                multiColumn: {
                    [t1.name]: t1.features.multiColumn,
                    [t2.name]: t2.features.multiColumn
                }
            }
        };
    }
}

// Create global instance
window.TemplateRegistry = new TemplateRegistry();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateRegistry;
}
