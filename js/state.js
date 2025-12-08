/**
 * ATSFlow State Management
 * Centralized state store for the resume builder application
 */

class ResumeState {
    constructor() {
        this.state = {
            // Resume sections array
            sections: [],

            // Active section being edited
            activeSection: null,

            // Editor mode: 'edit', 'preview', 'split'
            editorMode: 'edit',

            // Current template
            template: 'modern',

            // Template customization
            customization: {
                primaryColor: '#2563eb',
                secondaryColor: '#64748b',
                accentColor: '#0ea5e9',
                headingFont: 'Inter',
                bodyFont: 'Inter',
                spacing: 'normal'
            },

            // Resume metadata
            metadata: {
                title: 'My Resume',
                lastModified: null,
                version: 1
            },

            // UI state
            ui: {
                sidebarOpen: true,
                previewVisible: true,
                isDragging: false,
                draggedSectionId: null,
                saveStatus: 'saved' // 'saved', 'saving', 'unsaved'
            }
        };

        // Event listeners for state changes
        this.listeners = {};

        // Initialize from localStorage if available
        this.loadFromStorage();
    }

    /**
     * Get the entire state
     */
    getState() {
        return this.state;
    }

    /**
     * Get sections array
     */
    getSections() {
        return this.state.sections;
    }

    /**
     * Get section by ID
     */
    getSection(sectionId) {
        return this.state.sections.find(s => s.id === sectionId);
    }

    /**
     * Get active section
     */
    getActiveSection() {
        return this.state.activeSection;
    }

    /**
     * Set active section
     */
    setActiveSection(sectionId) {
        this.state.activeSection = sectionId;
        this.emit('activeSectionChanged', sectionId);
    }

    /**
     * Add a new section
     */
    addSection(section) {
        if (!section.id) {
            section.id = this.generateId();
        }

        this.state.sections.push(section);
        this.markModified();
        this.emit('sectionAdded', section);
        return section;
    }

    /**
     * Remove a section
     */
    removeSection(sectionId) {
        const index = this.state.sections.findIndex(s => s.id === sectionId);
        if (index !== -1) {
            const removed = this.state.sections.splice(index, 1)[0];
            this.markModified();
            this.emit('sectionRemoved', removed);
            return removed;
        }
        return null;
    }

    /**
     * Update section content
     */
    updateSection(sectionId, updates) {
        const section = this.getSection(sectionId);
        if (section) {
            Object.assign(section, updates);
            this.markModified();
            this.emit('sectionUpdated', section);
            return section;
        }
        return null;
    }

    /**
     * Update section content field
     */
    updateSectionContent(sectionId, contentUpdates) {
        const section = this.getSection(sectionId);
        if (section) {
            section.content = { ...section.content, ...contentUpdates };
            this.markModified();
            this.emit('sectionContentUpdated', section);
            return section;
        }
        return null;
    }

    /**
     * Reorder sections
     */
    reorderSections(fromIndex, toIndex) {
        const sections = this.state.sections;
        const [removed] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, removed);
        this.markModified();
        this.emit('sectionsReordered', { fromIndex, toIndex });
    }

    /**
     * Move section to new position
     */
    moveSection(sectionId, newIndex) {
        const currentIndex = this.state.sections.findIndex(s => s.id === sectionId);
        if (currentIndex !== -1) {
            this.reorderSections(currentIndex, newIndex);
        }
    }

    /**
     * Get editor mode
     */
    getEditorMode() {
        return this.state.editorMode;
    }

    /**
     * Set editor mode
     */
    setEditorMode(mode) {
        this.state.editorMode = mode;
        this.emit('editorModeChanged', mode);
    }

    /**
     * Get template
     */
    getTemplate() {
        return this.state.template;
    }

    /**
     * Set template
     */
    setTemplate(template) {
        this.state.template = template;
        this.emit('templateChanged', template);
    }

    /**
     * Get customization
     */
    getCustomization() {
        return this.state.customization;
    }

    /**
     * Update customization
     */
    updateCustomization(updates) {
        this.state.customization = { ...this.state.customization, ...updates };
        this.emit('customizationChanged', this.state.customization);
    }

    /**
     * Get UI state
     */
    getUIState() {
        return this.state.ui;
    }

    /**
     * Update UI state
     */
    updateUIState(updates) {
        this.state.ui = { ...this.state.ui, ...updates };
        this.emit('uiStateChanged', this.state.ui);
    }

    /**
     * Set save status
     */
    setSaveStatus(status) {
        this.state.ui.saveStatus = status;
        this.emit('saveStatusChanged', status);
    }

    /**
     * Mark as modified
     */
    markModified() {
        this.state.metadata.lastModified = new Date().toISOString();
        this.state.ui.saveStatus = 'unsaved';
        this.emit('stateModified');
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'section-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Subscribe to state changes
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from state changes
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    if (typeof logger !== 'undefined') {
                        logger.error(`Error in listener for ${event}:`, error);
                    }
                }
            });
        }
    }

    /**
     * Load state from localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('resumate_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                if (typeof logger !== 'undefined') {
                    logger.info('State loaded from localStorage');
                }
            }
        } catch (error) {
            if (typeof logger !== 'undefined') {
                logger.error('Failed to load state from localStorage:', error);
            }
        }
    }

    /**
     * Save state to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('resumate_state', JSON.stringify(this.state));
            this.state.ui.saveStatus = 'saved';
            this.emit('saveStatusChanged', 'saved');
            if (typeof logger !== 'undefined') {
                logger.info('State saved to localStorage');
            }
            return true;
        } catch (error) {
            if (typeof logger !== 'undefined') {
                logger.error('Failed to save state to localStorage:', error);
            }
            return false;
        }
    }

    /**
     * Export state as JSON
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state from JSON
     */
    importState(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.state = { ...this.state, ...imported };
            this.emit('stateImported');
            return true;
        } catch (error) {
            if (typeof logger !== 'undefined') {
                logger.error('Failed to import state:', error);
            }
            return false;
        }
    }

    /**
     * Reset state to default
     */
    reset() {
        this.state = {
            sections: [],
            activeSection: null,
            editorMode: 'edit',
            template: 'modern',
            customization: {
                primaryColor: '#2563eb',
                secondaryColor: '#64748b',
                accentColor: '#0ea5e9',
                headingFont: 'Inter',
                bodyFont: 'Inter',
                spacing: 'normal'
            },
            metadata: {
                title: 'My Resume',
                lastModified: null,
                version: 1
            },
            ui: {
                sidebarOpen: true,
                previewVisible: true,
                isDragging: false,
                draggedSectionId: null,
                saveStatus: 'saved'
            }
        };
        this.emit('stateReset');
    }
}

// Create singleton instance
const resumeState = new ResumeState();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = resumeState;
}
