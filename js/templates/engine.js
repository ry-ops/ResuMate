/**
 * Template Engine - Load and apply resume templates
 * Handles template switching, CSS injection, and metadata management
 */

class TemplateEngine {
    constructor() {
        this.currentTemplate = null;
        this.templateStyleElement = null;
        this.listeners = [];
    }

    /**
     * Initialize the template engine
     */
    init() {
        // Create style element for dynamic template CSS
        this.templateStyleElement = document.createElement('style');
        this.templateStyleElement.id = 'template-styles';
        document.head.appendChild(this.templateStyleElement);

        // Load last used template from localStorage
        const savedTemplate = localStorage.getItem('resumate_current_template');
        if (savedTemplate) {
            this.loadTemplate(savedTemplate);
        } else {
            // Default to classic template
            this.loadTemplate('classic');
        }
    }

    /**
     * Load a template by ID
     * @param {string} templateId - The template identifier
     * @returns {Promise<boolean>} Success status
     */
    async loadTemplate(templateId) {
        try {
            // Get template metadata from registry
            const template = window.TemplateRegistry?.getTemplate(templateId);
            if (!template) {
                throw new Error(`Template '${templateId}' not found`);
            }

            // Load template CSS file
            const cssPath = `/css/templates/${templateId}.css`;
            const response = await fetch(cssPath);

            if (!response.ok) {
                throw new Error(`Failed to load template CSS: ${response.statusText}`);
            }

            const css = await response.text();

            // Apply template CSS
            this.applyTemplateCSS(css);

            // Update current template
            this.currentTemplate = template;

            // Save to localStorage
            localStorage.setItem('resumate_current_template', templateId);

            // Notify listeners
            this.notifyListeners('templateChanged', template);

            console.log(`Template '${templateId}' loaded successfully`);
            return true;
        } catch (error) {
            console.error('Failed to load template:', error);
            return false;
        }
    }

    /**
     * Apply template CSS to the document
     * @param {string} css - The CSS content to apply
     */
    applyTemplateCSS(css) {
        if (this.templateStyleElement) {
            this.templateStyleElement.textContent = css;
        }
    }

    /**
     * Get the currently active template
     * @returns {Object|null} Current template metadata
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }

    /**
     * Switch to a different template
     * @param {string} templateId - The template to switch to
     * @returns {Promise<boolean>} Success status
     */
    async switchTemplate(templateId) {
        if (this.currentTemplate && this.currentTemplate.id === templateId) {
            console.log('Template already active');
            return true;
        }

        const success = await this.loadTemplate(templateId);

        if (success) {
            this.notifyListeners('templateSwitched', {
                from: this.currentTemplate?.id,
                to: templateId
            });
        }

        return success;
    }

    /**
     * Apply custom styles to the current template
     * @param {Object} customizations - Custom style properties
     */
    applyCustomStyles(customizations) {
        const customCSS = this.generateCustomCSS(customizations);

        // Get or create custom style element
        let customStyleElement = document.getElementById('template-custom-styles');
        if (!customStyleElement) {
            customStyleElement = document.createElement('style');
            customStyleElement.id = 'template-custom-styles';
            document.head.appendChild(customStyleElement);
        }

        customStyleElement.textContent = customCSS;

        // Save customizations
        localStorage.setItem('resumate_template_customizations', JSON.stringify(customizations));

        this.notifyListeners('stylesCustomized', customizations);
    }

    /**
     * Generate CSS from customization object
     * @param {Object} customizations - Customization properties
     * @returns {string} Generated CSS
     */
    generateCustomCSS(customizations) {
        const cssRules = [];

        // Color customizations
        if (customizations.colors) {
            const { primary, secondary, accent, text, background } = customizations.colors;

            cssRules.push(':root {');
            if (primary) cssRules.push(`  --template-primary-color: ${primary};`);
            if (secondary) cssRules.push(`  --template-secondary-color: ${secondary};`);
            if (accent) cssRules.push(`  --template-accent-color: ${accent};`);
            if (text) cssRules.push(`  --template-text-color: ${text};`);
            if (background) cssRules.push(`  --template-background-color: ${background};`);
            cssRules.push('}');
        }

        // Typography customizations
        if (customizations.typography) {
            const { headingFont, bodyFont, fontSize } = customizations.typography;

            cssRules.push('.resume-preview {');
            if (headingFont) cssRules.push(`  --template-heading-font: ${headingFont};`);
            if (bodyFont) cssRules.push(`  --template-body-font: ${bodyFont};`);
            if (fontSize) cssRules.push(`  --template-base-font-size: ${fontSize}px;`);
            cssRules.push('}');
        }

        // Spacing customizations
        if (customizations.spacing) {
            const { sectionSpacing, itemSpacing, margins } = customizations.spacing;

            cssRules.push('.resume-preview {');
            if (sectionSpacing) cssRules.push(`  --template-section-spacing: ${sectionSpacing}px;`);
            if (itemSpacing) cssRules.push(`  --template-item-spacing: ${itemSpacing}px;`);
            if (margins) cssRules.push(`  --template-margins: ${margins}px;`);
            cssRules.push('}');
        }

        // Page size customization
        if (customizations.pageSize) {
            const sizes = {
                'a4': { width: '210mm', height: '297mm' },
                'letter': { width: '8.5in', height: '11in' }
            };

            const size = sizes[customizations.pageSize];
            if (size) {
                cssRules.push(`@media print, screen {`);
                cssRules.push(`  .resume-page {`);
                cssRules.push(`    width: ${size.width};`);
                cssRules.push(`    height: ${size.height};`);
                cssRules.push(`  }`);
                cssRules.push(`}`);
            }
        }

        return cssRules.join('\n');
    }

    /**
     * Reset template customizations to defaults
     */
    resetCustomizations() {
        const customStyleElement = document.getElementById('template-custom-styles');
        if (customStyleElement) {
            customStyleElement.remove();
        }

        localStorage.removeItem('resumate_template_customizations');
        this.notifyListeners('customizationsReset', null);
    }

    /**
     * Load saved customizations
     * @returns {Object|null} Saved customizations or null
     */
    loadSavedCustomizations() {
        const saved = localStorage.getItem('resumate_template_customizations');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Failed to parse saved customizations:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Register an event listener
     * @param {Function} callback - Callback function
     */
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove an event listener
     * @param {Function} callback - Callback function to remove
     */
    removeEventListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of an event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in template engine listener:', error);
            }
        });
    }

    /**
     * Get template compatibility info
     * @param {string} templateId - Template to check
     * @returns {Object} Compatibility information
     */
    getTemplateCompatibility(templateId) {
        const template = window.TemplateRegistry?.getTemplate(templateId);
        if (!template) {
            return { compatible: false, reason: 'Template not found' };
        }

        return {
            compatible: true,
            atsScore: template.atsScore,
            pageSize: template.pageSize || ['a4', 'letter'],
            printReady: true,
            colorPrint: template.category !== 'classic'
        };
    }

    /**
     * Export current template configuration
     * @returns {Object} Template configuration
     */
    exportConfiguration() {
        return {
            templateId: this.currentTemplate?.id,
            customizations: this.loadSavedCustomizations(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import template configuration
     * @param {Object} config - Configuration to import
     * @returns {Promise<boolean>} Success status
     */
    async importConfiguration(config) {
        try {
            if (config.templateId) {
                await this.loadTemplate(config.templateId);
            }

            if (config.customizations) {
                this.applyCustomStyles(config.customizations);
            }

            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
}

// Create global instance
window.TemplateEngine = new TemplateEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateEngine;
}
