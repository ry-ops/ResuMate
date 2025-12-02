/**
 * Template Customizer - Controls for customizing template appearance
 * Handles color, typography, and spacing adjustments
 */

class TemplateCustomizer {
    constructor() {
        this.currentCustomizations = {
            colors: {},
            typography: {},
            spacing: {},
            pageSize: 'letter'
        };
        this.presets = {};
        this.initializePresets();
    }

    /**
     * Initialize customization presets
     */
    initializePresets() {
        // Color presets
        this.presets.colors = {
            professional: {
                name: 'Professional Blue',
                primary: '#2c3e50',
                secondary: '#3498db',
                accent: '#1abc9c'
            },
            executive: {
                name: 'Executive Navy',
                primary: '#1a2332',
                secondary: '#2c5282',
                accent: '#4299e1'
            },
            creative: {
                name: 'Creative Purple',
                primary: '#5a4a8c',
                secondary: '#8e44ad',
                accent: '#e74c3c'
            },
            modern: {
                name: 'Modern Green',
                primary: '#27ae60',
                secondary: '#2ecc71',
                accent: '#f39c12'
            },
            minimal: {
                name: 'Minimal Gray',
                primary: '#2c3e50',
                secondary: '#7f8c8d',
                accent: '#95a5a6'
            },
            warm: {
                name: 'Warm Orange',
                primary: '#d35400',
                secondary: '#e67e22',
                accent: '#f39c12'
            }
        };

        // Typography presets
        this.presets.typography = {
            classic: {
                name: 'Classic Serif',
                headingFont: 'Georgia, serif',
                bodyFont: 'Times New Roman, serif',
                fontSize: 11
            },
            modern: {
                name: 'Modern Sans',
                headingFont: 'Helvetica Neue, Arial, sans-serif',
                bodyFont: 'Helvetica Neue, Arial, sans-serif',
                fontSize: 11
            },
            professional: {
                name: 'Professional',
                headingFont: 'Arial, sans-serif',
                bodyFont: 'Calibri, sans-serif',
                fontSize: 11
            },
            creative: {
                name: 'Creative Mix',
                headingFont: 'Montserrat, sans-serif',
                bodyFont: 'Open Sans, sans-serif',
                fontSize: 10.5
            },
            technical: {
                name: 'Technical',
                headingFont: 'Roboto, sans-serif',
                bodyFont: 'Source Sans Pro, sans-serif',
                fontSize: 10.5
            }
        };

        // Spacing presets
        this.presets.spacing = {
            compact: {
                name: 'Compact',
                sectionSpacing: 12,
                itemSpacing: 6,
                margins: 20
            },
            normal: {
                name: 'Normal',
                sectionSpacing: 16,
                itemSpacing: 8,
                margins: 25
            },
            spacious: {
                name: 'Spacious',
                sectionSpacing: 20,
                itemSpacing: 10,
                margins: 30
            }
        };
    }

    /**
     * Set color customization
     * @param {Object} colors - Color values
     */
    setColors(colors) {
        this.currentCustomizations.colors = {
            ...this.currentCustomizations.colors,
            ...colors
        };
        this.applyCustomizations();
    }

    /**
     * Apply a color preset
     * @param {string} presetName - Name of the color preset
     * @returns {boolean} Success status
     */
    applyColorPreset(presetName) {
        const preset = this.presets.colors[presetName];
        if (!preset) {
            console.error(`Color preset '${presetName}' not found`);
            return false;
        }

        this.setColors(preset);
        return true;
    }

    /**
     * Set typography customization
     * @param {Object} typography - Typography values
     */
    setTypography(typography) {
        this.currentCustomizations.typography = {
            ...this.currentCustomizations.typography,
            ...typography
        };
        this.applyCustomizations();
    }

    /**
     * Apply a typography preset
     * @param {string} presetName - Name of the typography preset
     * @returns {boolean} Success status
     */
    applyTypographyPreset(presetName) {
        const preset = this.presets.typography[presetName];
        if (!preset) {
            console.error(`Typography preset '${presetName}' not found`);
            return false;
        }

        this.setTypography(preset);
        return true;
    }

    /**
     * Set spacing customization
     * @param {Object} spacing - Spacing values
     */
    setSpacing(spacing) {
        this.currentCustomizations.spacing = {
            ...this.currentCustomizations.spacing,
            ...spacing
        };
        this.applyCustomizations();
    }

    /**
     * Apply a spacing preset
     * @param {string} presetName - Name of the spacing preset
     * @returns {boolean} Success status
     */
    applySpacingPreset(presetName) {
        const preset = this.presets.spacing[presetName];
        if (!preset) {
            console.error(`Spacing preset '${presetName}' not found`);
            return false;
        }

        this.setSpacing(preset);
        return true;
    }

    /**
     * Set page size
     * @param {string} size - Page size ('a4' or 'letter')
     */
    setPageSize(size) {
        if (!['a4', 'letter'].includes(size)) {
            console.error('Invalid page size. Use "a4" or "letter"');
            return false;
        }

        this.currentCustomizations.pageSize = size;
        this.applyCustomizations();
        return true;
    }

    /**
     * Apply all current customizations
     */
    applyCustomizations() {
        if (window.TemplateEngine) {
            window.TemplateEngine.applyCustomStyles(this.currentCustomizations);
        }
    }

    /**
     * Reset all customizations
     */
    reset() {
        this.currentCustomizations = {
            colors: {},
            typography: {},
            spacing: {},
            pageSize: 'letter'
        };

        if (window.TemplateEngine) {
            window.TemplateEngine.resetCustomizations();
        }
    }

    /**
     * Get current customizations
     * @returns {Object} Current customization values
     */
    getCurrentCustomizations() {
        return { ...this.currentCustomizations };
    }

    /**
     * Get available color presets
     * @returns {Object} Color presets
     */
    getColorPresets() {
        return this.presets.colors;
    }

    /**
     * Get available typography presets
     * @returns {Object} Typography presets
     */
    getTypographyPresets() {
        return this.presets.typography;
    }

    /**
     * Get available spacing presets
     * @returns {Object} Spacing presets
     */
    getSpacingPresets() {
        return this.presets.spacing;
    }

    /**
     * Create a custom preset
     * @param {string} type - Preset type ('colors', 'typography', 'spacing')
     * @param {string} name - Preset name
     * @param {Object} values - Preset values
     * @returns {boolean} Success status
     */
    createCustomPreset(type, name, values) {
        if (!this.presets[type]) {
            console.error(`Invalid preset type: ${type}`);
            return false;
        }

        this.presets[type][name] = values;
        this.saveCustomPresets();
        return true;
    }

    /**
     * Delete a custom preset
     * @param {string} type - Preset type
     * @param {string} name - Preset name
     * @returns {boolean} Success status
     */
    deleteCustomPreset(type, name) {
        if (!this.presets[type] || !this.presets[type][name]) {
            console.error(`Preset not found: ${type}.${name}`);
            return false;
        }

        delete this.presets[type][name];
        this.saveCustomPresets();
        return true;
    }

    /**
     * Save custom presets to localStorage
     */
    saveCustomPresets() {
        const customPresets = {
            colors: {},
            typography: {},
            spacing: {}
        };

        // Extract custom (non-default) presets
        Object.keys(this.presets).forEach(type => {
            Object.keys(this.presets[type]).forEach(name => {
                if (!this.isDefaultPreset(type, name)) {
                    customPresets[type][name] = this.presets[type][name];
                }
            });
        });

        localStorage.setItem('resumate_custom_presets', JSON.stringify(customPresets));
    }

    /**
     * Load custom presets from localStorage
     */
    loadCustomPresets() {
        const saved = localStorage.getItem('resumate_custom_presets');
        if (!saved) return;

        try {
            const customPresets = JSON.parse(saved);

            Object.keys(customPresets).forEach(type => {
                if (this.presets[type]) {
                    Object.assign(this.presets[type], customPresets[type]);
                }
            });
        } catch (error) {
            console.error('Failed to load custom presets:', error);
        }
    }

    /**
     * Check if a preset is a default preset
     * @param {string} type - Preset type
     * @param {string} name - Preset name
     * @returns {boolean} True if default preset
     */
    isDefaultPreset(type, name) {
        const defaults = {
            colors: ['professional', 'executive', 'creative', 'modern', 'minimal', 'warm'],
            typography: ['classic', 'modern', 'professional', 'creative', 'technical'],
            spacing: ['compact', 'normal', 'spacious']
        };

        return defaults[type]?.includes(name) || false;
    }

    /**
     * Export current customization as preset
     * @param {string} name - Preset name
     * @returns {Object} Exported preset
     */
    exportAsPreset(name) {
        return {
            name,
            customizations: this.getCurrentCustomizations(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import preset configuration
     * @param {Object} preset - Preset configuration
     * @returns {boolean} Success status
     */
    importPreset(preset) {
        if (!preset.customizations) {
            console.error('Invalid preset format');
            return false;
        }

        this.currentCustomizations = preset.customizations;
        this.applyCustomizations();
        return true;
    }

    /**
     * Get customization suggestions based on template and industry
     * @param {string} templateId - Template ID
     * @param {string} industry - Industry type
     * @returns {Object} Suggested customizations
     */
    getSuggestions(templateId, industry) {
        const suggestions = {
            colors: null,
            typography: null,
            spacing: null
        };

        // Industry-based color suggestions
        const industryColors = {
            technology: 'professional',
            finance: 'executive',
            creative: 'creative',
            healthcare: 'minimal',
            education: 'modern',
            legal: 'executive'
        };

        suggestions.colors = industryColors[industry.toLowerCase()] || 'professional';

        // Template-based typography suggestions
        const templateTypography = {
            classic: 'classic',
            modern: 'modern',
            creative: 'creative'
        };

        suggestions.typography = templateTypography[templateId] || 'professional';

        // Default spacing suggestion
        suggestions.spacing = 'normal';

        return suggestions;
    }

    /**
     * Validate color contrast for accessibility
     * @param {string} foreground - Foreground color
     * @param {string} background - Background color
     * @returns {Object} Contrast validation result
     */
    validateContrast(foreground, background) {
        // Simple luminance calculation
        const getLuminance = (color) => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;

            const [rs, gs, bs] = [r, g, b].map(c => {
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        return {
            ratio: ratio.toFixed(2),
            passAA: ratio >= 4.5,
            passAAA: ratio >= 7,
            recommendation: ratio >= 4.5 ? 'Good contrast' : 'Increase contrast for better readability'
        };
    }

    /**
     * Generate preview URL for current customizations
     * @returns {string} Preview data URL
     */
    generatePreview() {
        // This would generate a preview image or HTML
        // For now, return configuration as JSON
        return `data:application/json,${encodeURIComponent(JSON.stringify(this.currentCustomizations))}`;
    }
}

// Create global instance
window.TemplateCustomizer = new TemplateCustomizer();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.TemplateCustomizer.loadCustomPresets();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateCustomizer;
}
