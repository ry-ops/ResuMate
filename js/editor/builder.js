/**
 * ResuMate Resume Builder
 * Main editor controller that orchestrates all components
 */

class ResumeBuilder {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            autoSaveInterval: options.autoSaveInterval || 30000,
            maxHistoryStates: options.maxHistoryStates || 50,
            enableDragDrop: options.enableDragDrop !== false,
            enableAutoSave: options.enableAutoSave !== false,
            ...options
        };

        // Component references
        this.state = null;
        this.history = null;
        this.autoSave = null;
        this.dragDrop = null;

        // UI elements
        this.sectionsContainer = null;
        this.toolbar = null;
        this.sectionPalette = null;

        this.initialize();
    }

    /**
     * Initialize the builder
     */
    initialize() {
        console.log('Initializing Resume Builder...');

        // Initialize state management
        this.state = resumeState; // Use singleton from state.js

        // Initialize history manager
        this.history = new HistoryManager(this.state, {
            maxStates: this.options.maxHistoryStates
        });

        // Initialize auto-save
        if (this.options.enableAutoSave) {
            this.autoSave = new AutoSaveManager(this.state, {
                interval: this.options.autoSaveInterval
            });
            this.autoSave.enableSafetyFeatures();
        }

        // Initialize drag and drop
        if (this.options.enableDragDrop) {
            this.dragDrop = new DragDropManager(this.state, this.history);
        }

        // Set up UI
        this.setupUI();

        // Set up event listeners
        this.setupEventListeners();

        // Load initial data or create default resume
        this.loadOrCreateResume();

        console.log('Resume Builder initialized successfully');
    }

    /**
     * Set up user interface
     */
    setupUI() {
        // Create main layout
        this.container.innerHTML = `
            <div class="resume-builder">
                <div class="builder-toolbar">
                    <div class="toolbar-left">
                        <button class="btn-icon" id="add-section-btn" title="Add Section">
                            <span>➕</span> Add Section
                        </button>
                        <button class="btn-icon" id="undo-btn" title="Undo (Cmd+Z)" disabled>
                            <span>↶</span> Undo
                        </button>
                        <button class="btn-icon" id="redo-btn" title="Redo (Cmd+Shift+Z)" disabled>
                            <span>↷</span> Redo
                        </button>
                    </div>
                    <div class="toolbar-center">
                        <h2 class="resume-title" contenteditable="true">My Resume</h2>
                    </div>
                    <div class="toolbar-right">
                        <button class="btn-icon" id="save-btn" title="Save">
                            <span>💾</span> Save
                        </button>
                        <button class="btn-icon" id="export-btn" title="Export">
                            <span>📥</span> Export
                        </button>
                        <button class="btn-icon" id="preview-btn" title="Preview">
                            <span>👁️</span> Preview
                        </button>
                    </div>
                </div>

                <div class="builder-main">
                    <div class="builder-sidebar">
                        <div class="section-palette">
                            <h3>Add Sections</h3>
                            <div id="section-palette-list"></div>
                        </div>
                    </div>

                    <div class="builder-content">
                        <div class="sections-container" id="sections-container">
                            <div class="empty-state" id="empty-state">
                                <div class="empty-state-icon">📝</div>
                                <h3>Start Building Your Resume</h3>
                                <p>Add sections from the left panel to get started</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Get element references
        this.toolbar = this.container.querySelector('.builder-toolbar');
        this.sectionsContainer = this.container.querySelector('#sections-container');
        this.sectionPalette = this.container.querySelector('#section-palette-list');

        // Populate section palette
        this.populateSectionPalette();

        console.log('UI setup complete');
    }

    /**
     * Populate section palette with available sections
     */
    populateSectionPalette() {
        const availableSections = SectionManager.getAvailableSections();

        this.sectionPalette.innerHTML = availableSections.map(template => `
            <button class="section-palette-item" data-section-type="${template.type}">
                <span class="section-icon">${template.icon}</span>
                <div class="section-info">
                    <div class="section-name">${template.name}</div>
                    <div class="section-description">${template.description}</div>
                </div>
            </button>
        `).join('');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toolbar buttons
        this.container.querySelector('#add-section-btn').addEventListener('click', () => {
            this.showSectionPalette();
        });

        this.container.querySelector('#undo-btn').addEventListener('click', () => {
            this.history.undo();
        });

        this.container.querySelector('#redo-btn').addEventListener('click', () => {
            this.history.redo();
        });

        this.container.querySelector('#save-btn').addEventListener('click', () => {
            this.saveResume();
        });

        this.container.querySelector('#export-btn').addEventListener('click', () => {
            this.exportResume();
        });

        this.container.querySelector('#preview-btn').addEventListener('click', () => {
            this.togglePreview();
        });

        // Section palette items
        this.sectionPalette.addEventListener('click', (e) => {
            const item = e.target.closest('.section-palette-item');
            if (item) {
                const sectionType = item.dataset.sectionType;
                this.addSection(sectionType);
            }
        });

        // State change listeners
        this.state.on('sectionAdded', () => {
            this.renderSections();
        });

        this.state.on('sectionRemoved', () => {
            this.renderSections();
        });

        this.state.on('sectionUpdated', () => {
            this.renderSections();
        });

        this.state.on('sectionsReordered', () => {
            this.renderSections();
        });

        this.state.on('stateRestored', () => {
            this.renderSections();
        });

        // History listeners
        this.history.on('undoPerformed', (stats) => {
            this.updateHistoryButtons(stats);
        });

        this.history.on('redoPerformed', (stats) => {
            this.updateHistoryButtons(stats);
        });

        this.history.on('historySaved', (stats) => {
            this.updateHistoryButtons(stats);
        });

        console.log('Event listeners attached');
    }

    /**
     * Update history buttons state
     */
    updateHistoryButtons(stats) {
        const undoBtn = this.container.querySelector('#undo-btn');
        const redoBtn = this.container.querySelector('#redo-btn');

        undoBtn.disabled = stats.undoCount === 0;
        redoBtn.disabled = stats.redoCount === 0;

        // Update tooltips
        undoBtn.title = stats.undoCount > 0 ?
            `Undo (Cmd+Z) - ${stats.undoCount} available` :
            'Undo (Cmd+Z)';

        redoBtn.title = stats.redoCount > 0 ?
            `Redo (Cmd+Shift+Z) - ${stats.redoCount} available` :
            'Redo (Cmd+Shift+Z)';
    }

    /**
     * Load existing resume or create default
     */
    loadOrCreateResume() {
        const sections = this.state.getSections();

        if (sections.length === 0) {
            // Create default header section
            this.addSection(SectionTypes.HEADER);
        }

        this.renderSections();
    }

    /**
     * Add a new section
     */
    addSection(sectionType) {
        try {
            const section = SectionManager.createSection(sectionType);
            this.state.addSection(section);

            console.log('Section added:', sectionType);

            // Save to history
            this.history.saveState();

            return section;
        } catch (error) {
            console.error('Failed to add section:', error);
            alert('Failed to add section: ' + error.message);
            return null;
        }
    }

    /**
     * Remove a section
     */
    removeSection(sectionId) {
        const section = this.state.getSection(sectionId);

        if (section && section.locked) {
            alert('This section is required and cannot be removed.');
            return;
        }

        if (confirm('Are you sure you want to remove this section?')) {
            this.state.removeSection(sectionId);
            this.history.saveState();
            console.log('Section removed:', sectionId);
        }
    }

    /**
     * Render all sections
     */
    renderSections() {
        const sections = this.state.getSections();
        const emptyState = this.container.querySelector('#empty-state');

        if (sections.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Clear existing sections
        const existingSections = this.sectionsContainer.querySelectorAll('.resume-section');
        existingSections.forEach(el => el.remove());

        // Render each section
        sections.forEach((section, index) => {
            const sectionElement = this.createSectionElement(section, index);
            this.sectionsContainer.appendChild(sectionElement);
        });

        // Enable drag and drop
        if (this.dragDrop) {
            this.dragDrop.refresh(this.sectionsContainer);
        }

        console.log('Sections rendered:', sections.length);
    }

    /**
     * Create section DOM element
     */
    createSectionElement(section, index) {
        const div = document.createElement('div');
        div.className = 'resume-section';
        div.dataset.sectionId = section.id;

        div.innerHTML = `
            <div class="section-header">
                <div class="section-drag-handle">
                    <span class="drag-icon">⋮⋮</span>
                </div>
                <div class="section-title">
                    <span class="section-icon">${section.icon}</span>
                    <h3>${section.name}</h3>
                </div>
                <div class="section-actions">
                    <button class="btn-icon-small section-edit-btn" title="Edit">
                        <span>✏️</span>
                    </button>
                    ${!section.locked ? `
                        <button class="btn-icon-small section-delete-btn" title="Delete">
                            <span>🗑️</span>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="section-content">
                ${this.renderSectionContent(section)}
            </div>
        `;

        // Attach event listeners
        const deleteBtn = div.querySelector('.section-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.removeSection(section.id);
            });
        }

        const editBtn = div.querySelector('.section-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editSection(section.id);
            });
        }

        return div;
    }

    /**
     * Render section content based on type
     */
    renderSectionContent(section) {
        const template = SectionManager.getTemplate(section.type);

        if (!template) {
            return '<p>Unknown section type</p>';
        }

        // Simple text content preview
        if (section.content.text) {
            return `<p class="section-preview">${section.content.text || 'Click edit to add content'}</p>`;
        }

        // Items-based content preview
        if (section.content.items && Array.isArray(section.content.items)) {
            if (section.content.items.length === 0) {
                return '<p class="section-preview empty">No items added yet. Click edit to add content.</p>';
            }

            return `<p class="section-preview">${section.content.items.length} item(s)</p>`;
        }

        // Categories-based content preview
        if (section.content.categories && Array.isArray(section.content.categories)) {
            if (section.content.categories.length === 0) {
                return '<p class="section-preview empty">No categories added yet. Click edit to add content.</p>';
            }

            return `<p class="section-preview">${section.content.categories.length} categor(ies)</p>`;
        }

        // Header section preview
        if (section.type === SectionTypes.HEADER) {
            return `
                <div class="header-preview">
                    <h2>${section.content.fullName || 'Your Name'}</h2>
                    ${section.content.title ? `<p class="subtitle">${section.content.title}</p>` : ''}
                    ${section.content.email ? `<p>${section.content.email}</p>` : ''}
                </div>
            `;
        }

        return '<p class="section-preview">Click edit to add content</p>';
    }

    /**
     * Edit section (placeholder for modal/form)
     */
    editSection(sectionId) {
        const section = this.state.getSection(sectionId);
        if (!section) {
            return;
        }

        // This would open a modal/form to edit the section
        // For now, just log
        console.log('Edit section:', sectionId, section);
        alert('Section editing UI will be implemented by Worker 2 (Preview Engine)');
    }

    /**
     * Show section palette
     */
    showSectionPalette() {
        const sidebar = this.container.querySelector('.builder-sidebar');
        sidebar.classList.toggle('visible');
    }

    /**
     * Save resume
     */
    saveResume() {
        const success = this.state.saveToStorage();

        if (success) {
            alert('Resume saved successfully!');
            console.log('Resume saved');
        } else {
            alert('Failed to save resume. Please try again.');
            console.error('Resume save failed');
        }
    }

    /**
     * Export resume
     */
    exportResume() {
        const json = this.state.exportState();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume-' + Date.now() + '.json';
        a.click();

        URL.revokeObjectURL(url);

        console.log('Resume exported');
    }

    /**
     * Toggle preview mode
     */
    togglePreview() {
        const currentMode = this.state.getEditorMode();
        const newMode = currentMode === 'edit' ? 'preview' : 'edit';

        this.state.setEditorMode(newMode);

        console.log('Preview mode toggled:', newMode);
        alert('Preview mode will be implemented by Worker 2 (Preview Engine)');
    }

    /**
     * Get current state
     */
    getState() {
        return this.state;
    }

    /**
     * Get history manager
     */
    getHistory() {
        return this.history;
    }

    /**
     * Get auto-save manager
     */
    getAutoSave() {
        return this.autoSave;
    }

    /**
     * Get drag-drop manager
     */
    getDragDrop() {
        return this.dragDrop;
    }

    /**
     * Import resume from JSON
     */
    importResume(json) {
        try {
            const success = this.state.importState(json);

            if (success) {
                this.renderSections();
                this.history.saveState();
                console.log('Resume imported successfully');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to import resume:', error);
            return false;
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        if (this.autoSave) {
            this.autoSave.destroy();
        }

        if (this.dragDrop) {
            this.dragDrop.destroy();
        }

        if (this.history) {
            this.history.destroy();
        }

        this.container.innerHTML = '';

        console.log('Resume Builder destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeBuilder;
}
