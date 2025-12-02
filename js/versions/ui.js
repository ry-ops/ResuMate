/**
 * Version Management UI Controller
 * Handles UI interactions for version management
 */

class VersionUI {
    constructor() {
        this.versionManager = new VersionManager();
        this.versionDiff = new VersionDiff();
        this.versionMerger = new VersionMerger(this.versionManager, this.versionDiff);

        this.currentView = 'tree'; // tree, comparison, merge
        this.selectedVersions = [];
        this.filters = {
            type: null,
            status: null,
            favorite: null,
            archived: false,
            searchQuery: ''
        };

        this.initialized = false;
    }

    /**
     * Initialize UI
     * @param {string} containerId - Container element ID
     */
    initialize(containerId) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('Version UI container not found:', containerId);
            return;
        }

        this.render();
        this.attachEventListeners();
        this.initialized = true;

        console.log('[VersionUI] Initialized');
    }

    /**
     * Render UI
     */
    render() {
        this.container.innerHTML = `
            <div class="version-container">
                ${this.renderToolbar()}
                ${this.renderStats()}
                ${this.renderContent()}
            </div>
        `;
    }

    /**
     * Render toolbar
     */
    renderToolbar() {
        return `
            <div class="version-toolbar">
                <div class="version-toolbar-left">
                    <div class="version-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            id="version-search"
                            placeholder="Search versions..."
                            value="${this.filters.searchQuery}"
                        >
                    </div>
                    <div class="version-filter">
                        <button class="version-filter-btn" id="filter-btn">
                            <span>⚙️</span>
                            Filters
                            <span>▼</span>
                        </button>
                        <div class="version-filter-dropdown" id="filter-dropdown">
                            ${this.renderFilters()}
                        </div>
                    </div>
                </div>
                <div class="version-toolbar-right">
                    <button class="version-btn version-btn-secondary" id="import-btn">
                        <span>📥</span>
                        Import
                    </button>
                    <button class="version-btn version-btn-secondary" id="export-btn">
                        <span>📤</span>
                        Export
                    </button>
                    <button class="version-btn version-btn-primary" id="create-base-btn">
                        <span>➕</span>
                        New Base Resume
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render filters
     */
    renderFilters() {
        return `
            <div class="version-filter-group">
                <label class="version-filter-label">Type</label>
                <div class="version-filter-options">
                    <label class="version-filter-option">
                        <input type="radio" name="type-filter" value="" ${!this.filters.type ? 'checked' : ''}>
                        All Types
                    </label>
                    <label class="version-filter-option">
                        <input type="radio" name="type-filter" value="base" ${this.filters.type === 'base' ? 'checked' : ''}>
                        Base Only
                    </label>
                    <label class="version-filter-option">
                        <input type="radio" name="type-filter" value="tailored" ${this.filters.type === 'tailored' ? 'checked' : ''}>
                        Tailored Only
                    </label>
                </div>
            </div>
            <div class="version-filter-group">
                <label class="version-filter-label">Status</label>
                <div class="version-filter-options">
                    <label class="version-filter-option">
                        <input type="radio" name="status-filter" value="" ${!this.filters.status ? 'checked' : ''}>
                        All Status
                    </label>
                    <label class="version-filter-option">
                        <input type="radio" name="status-filter" value="draft" ${this.filters.status === 'draft' ? 'checked' : ''}>
                        Draft
                    </label>
                    <label class="version-filter-option">
                        <input type="radio" name="status-filter" value="applied" ${this.filters.status === 'applied' ? 'checked' : ''}>
                        Applied
                    </label>
                    <label class="version-filter-option">
                        <input type="radio" name="status-filter" value="interviewing" ${this.filters.status === 'interviewing' ? 'checked' : ''}>
                        Interviewing
                    </label>
                </div>
            </div>
            <div class="version-filter-group">
                <label class="version-filter-label">Other</label>
                <div class="version-filter-options">
                    <label class="version-filter-option">
                        <input type="checkbox" id="favorite-filter" ${this.filters.favorite ? 'checked' : ''}>
                        Favorites Only
                    </label>
                    <label class="version-filter-option">
                        <input type="checkbox" id="archived-filter" ${this.filters.archived ? 'checked' : ''}>
                        Show Archived
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Render statistics
     */
    renderStats() {
        const stats = this.versionManager.getStatistics();

        return `
            <div class="version-stats-grid">
                <div class="version-stat-card">
                    <div class="version-stat-number">${stats.total}</div>
                    <div class="version-stat-label">Total Versions</div>
                </div>
                <div class="version-stat-card">
                    <div class="version-stat-number">${stats.base}</div>
                    <div class="version-stat-label">Base Resumes</div>
                </div>
                <div class="version-stat-card">
                    <div class="version-stat-number">${stats.tailored}</div>
                    <div class="version-stat-label">Tailored Versions</div>
                </div>
                <div class="version-stat-card">
                    <div class="version-stat-number">${stats.byStatus.applied || 0}</div>
                    <div class="version-stat-label">Applied</div>
                </div>
            </div>
        `;
    }

    /**
     * Render content based on current view
     */
    renderContent() {
        switch (this.currentView) {
            case 'comparison':
                return this.renderComparison();
            case 'merge':
                return this.renderMerge();
            default:
                return this.renderVersionTree();
        }
    }

    /**
     * Render version tree
     */
    renderVersionTree() {
        const tree = this.getFilteredVersionTree();

        if (tree.length === 0) {
            return `
                <div class="version-tree">
                    <div class="version-tree-empty">
                        <h3>No versions found</h3>
                        <p>Create your first base resume to get started</p>
                        <button class="version-btn version-btn-primary" onclick="versionUI.showCreateBaseModal()">
                            Create Base Resume
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="version-tree">
                ${tree.map(base => this.renderBaseGroup(base)).join('')}
            </div>
        `;
    }

    /**
     * Get filtered version tree
     */
    getFilteredVersionTree() {
        let tree = this.versionManager.getVersionTree();

        // Apply filters
        if (this.filters.type === 'base') {
            tree = tree.map(base => ({ ...base, children: [] }));
        }

        if (this.filters.type === 'tailored') {
            tree = tree.filter(base => base.children && base.children.length > 0);
        }

        if (this.filters.status) {
            tree = tree.map(base => ({
                ...base,
                children: base.children.filter(v => v.status === this.filters.status)
            })).filter(base => base.status === this.filters.status || base.children.length > 0);
        }

        if (this.filters.favorite) {
            tree = tree.filter(base => base.favorite || (base.children && base.children.some(v => v.favorite)));
        }

        if (!this.filters.archived) {
            tree = tree.filter(base => !base.archived);
            tree = tree.map(base => ({
                ...base,
                children: base.children.filter(v => !v.archived)
            }));
        }

        if (this.filters.searchQuery) {
            const query = this.filters.searchQuery.toLowerCase();
            tree = tree.filter(base =>
                this.matchesSearch(base, query) ||
                (base.children && base.children.some(v => this.matchesSearch(v, query)))
            );
        }

        return tree;
    }

    /**
     * Check if version matches search query
     */
    matchesSearch(version, query) {
        return (
            (version.name && version.name.toLowerCase().includes(query)) ||
            (version.targetCompany && version.targetCompany.toLowerCase().includes(query)) ||
            (version.targetRole && version.targetRole.toLowerCase().includes(query)) ||
            (version.notes && version.notes.toLowerCase().includes(query))
        );
    }

    /**
     * Render base version group
     */
    renderBaseGroup(base) {
        return `
            <div class="version-base-group">
                ${this.renderVersionCard(base)}
                ${base.children && base.children.length > 0 ? `
                    <div class="version-tailored-list">
                        ${base.children.map(tailored => this.renderVersionCard(tailored)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render version card
     */
    renderVersionCard(version) {
        const isFavorite = version.favorite ? 'favorite' : '';
        const isArchived = version.archived ? 'archived' : '';

        return `
            <div class="version-card ${version.type} ${isFavorite} ${isArchived}" data-version-id="${version.id}">
                <div class="version-card-header">
                    <div class="version-card-title">
                        <h3>${this.escapeHtml(version.name)}</h3>
                        <span class="version-type-badge ${version.type}">${version.type}</span>
                        ${version.favorite ? '<span>⭐</span>' : ''}
                        ${version.archived ? '<span>📦</span>' : ''}
                    </div>
                    <span class="version-status-badge ${version.status}">${version.status}</span>
                </div>

                <div class="version-card-body">
                    <div class="version-card-info">
                        ${version.targetCompany ? `
                            <div class="version-info-item">
                                <span class="version-info-label">Company:</span>
                                <span>${this.escapeHtml(version.targetCompany)}</span>
                            </div>
                        ` : ''}
                        ${version.targetRole ? `
                            <div class="version-info-item">
                                <span class="version-info-label">Role:</span>
                                <span>${this.escapeHtml(version.targetRole)}</span>
                            </div>
                        ` : ''}
                        <div class="version-info-item">
                            <span class="version-info-label">Updated:</span>
                            <span>${this.formatDate(version.updatedAt)}</span>
                        </div>
                        ${version.appliedAt ? `
                            <div class="version-info-item">
                                <span class="version-info-label">Applied:</span>
                                <span>${this.formatDate(version.appliedAt)}</span>
                            </div>
                        ` : ''}
                    </div>

                    ${version.tags && version.tags.length > 0 ? `
                        <div class="version-card-tags">
                            ${version.tags.map(tag => `<span class="version-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="version-card-actions">
                    ${version.type === 'base' ? `
                        <button class="version-action-btn" onclick="versionUI.createTailoredFromBase('${version.id}')">
                            <span>✨</span> Tailor
                        </button>
                    ` : ''}
                    <button class="version-action-btn" onclick="versionUI.cloneVersion('${version.id}')">
                        <span>📋</span> Clone
                    </button>
                    <button class="version-action-btn" onclick="versionUI.editVersion('${version.id}')">
                        <span>✏️</span> Edit
                    </button>
                    ${version.type === 'tailored' ? `
                        <button class="version-action-btn" onclick="versionUI.compareWithBase('${version.id}')">
                            <span>🔍</span> Compare
                        </button>
                        <button class="version-action-btn" onclick="versionUI.mergeToBase('${version.id}')">
                            <span>🔄</span> Merge
                        </button>
                    ` : ''}
                    <button class="version-action-btn" onclick="versionUI.toggleFavorite('${version.id}')">
                        <span>${version.favorite ? '⭐' : '☆'}</span>
                    </button>
                    <button class="version-action-btn" onclick="versionUI.deleteVersion('${version.id}')">
                        <span>🗑️</span> Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render comparison view
     */
    renderComparison() {
        if (this.selectedVersions.length !== 2) {
            return '<div class="version-tree-empty">Select two versions to compare</div>';
        }

        const [versionA, versionB] = this.selectedVersions.map(id =>
            this.versionManager.getVersion(id)
        );

        const comparison = this.versionDiff.compareVersions(versionA, versionB);

        return `
            <div class="version-comparison">
                ${this.versionDiff.generateDiffHTML(comparison)}
            </div>
        `;
    }

    /**
     * Render merge view
     */
    renderMerge() {
        // Placeholder for merge UI
        return '<div class="merge-preview">Merge preview coming soon...</div>';
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search
        const searchInput = document.getElementById('version-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.searchQuery = e.target.value;
                this.refreshContent();
            });
        }

        // Filter dropdown toggle
        const filterBtn = document.getElementById('filter-btn');
        const filterDropdown = document.getElementById('filter-dropdown');
        if (filterBtn && filterDropdown) {
            filterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                filterDropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                filterDropdown.classList.remove('active');
            });

            filterDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Filter changes
        document.querySelectorAll('input[name="type-filter"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.type = e.target.value || null;
                this.refreshContent();
            });
        });

        document.querySelectorAll('input[name="status-filter"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.status = e.target.value || null;
                this.refreshContent();
            });
        });

        const favoriteFilter = document.getElementById('favorite-filter');
        if (favoriteFilter) {
            favoriteFilter.addEventListener('change', (e) => {
                this.filters.favorite = e.target.checked;
                this.refreshContent();
            });
        }

        const archivedFilter = document.getElementById('archived-filter');
        if (archivedFilter) {
            archivedFilter.addEventListener('change', (e) => {
                this.filters.archived = e.target.checked;
                this.refreshContent();
            });
        }

        // Action buttons
        const createBaseBtn = document.getElementById('create-base-btn');
        if (createBaseBtn) {
            createBaseBtn.addEventListener('click', () => this.showCreateBaseModal());
        }

        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importVersions());
        }

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportVersions());
        }
    }

    /**
     * Refresh content area
     */
    refreshContent() {
        const contentArea = this.container.querySelector('.version-tree, .version-comparison, .merge-preview');
        if (contentArea) {
            contentArea.outerHTML = this.renderContent();
        }

        // Update stats
        const statsArea = this.container.querySelector('.version-stats-grid');
        if (statsArea) {
            statsArea.outerHTML = this.renderStats();
        }
    }

    /**
     * Show create base modal
     */
    showCreateBaseModal() {
        const modal = this.createModal('Create Base Resume', `
            <div class="version-form-group">
                <label class="version-form-label">Resume Name</label>
                <input type="text" class="version-form-input" id="base-name" placeholder="e.g., Software Engineer Resume">
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Template</label>
                <select class="version-form-select" id="base-template">
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                    <option value="creative">Creative</option>
                </select>
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Notes (Optional)</label>
                <textarea class="version-form-textarea" id="base-notes" placeholder="Add notes..."></textarea>
            </div>
        `, [
            { text: 'Cancel', class: 'version-btn-secondary', handler: () => this.closeModal() },
            { text: 'Create', class: 'version-btn-primary', handler: () => this.createBase() }
        ]);

        this.showModal(modal);
    }

    /**
     * Create base resume
     */
    createBase() {
        const name = document.getElementById('base-name').value.trim();
        const templateId = document.getElementById('base-template').value;
        const notes = document.getElementById('base-notes').value.trim();

        if (!name) {
            alert('Please enter a resume name');
            return;
        }

        try {
            const version = this.versionManager.createBaseVersion({
                name,
                templateId,
                notes,
                resumeData: {} // Empty for now
            });

            console.log('Created base version:', version);
            this.closeModal();
            this.render();
        } catch (error) {
            console.error('Failed to create base version:', error);
            alert('Failed to create base resume: ' + error.message);
        }
    }

    /**
     * Create tailored version from base
     */
    createTailoredFromBase(baseId) {
        const modal = this.createModal('Create Tailored Version', `
            <div class="version-form-group">
                <label class="version-form-label">Company Name</label>
                <input type="text" class="version-form-input" id="tailored-company" placeholder="e.g., Anthropic">
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Role Title</label>
                <input type="text" class="version-form-input" id="tailored-role" placeholder="e.g., Senior Software Engineer">
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Job Description (Optional)</label>
                <textarea class="version-form-textarea" id="tailored-description" placeholder="Paste job description..."></textarea>
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Job URL (Optional)</label>
                <input type="text" class="version-form-input" id="tailored-url" placeholder="https://...">
            </div>
        `, [
            { text: 'Cancel', class: 'version-btn-secondary', handler: () => this.closeModal() },
            { text: 'Create', class: 'version-btn-primary', handler: () => this.createTailored(baseId) }
        ]);

        this.showModal(modal);
    }

    /**
     * Create tailored version
     */
    createTailored(baseId) {
        const company = document.getElementById('tailored-company').value.trim();
        const role = document.getElementById('tailored-role').value.trim();
        const jobDescription = document.getElementById('tailored-description').value.trim();
        const jobUrl = document.getElementById('tailored-url').value.trim();

        if (!company || !role) {
            alert('Please enter company and role');
            return;
        }

        try {
            const version = this.versionManager.createTailoredVersion(baseId, {
                targetCompany: company,
                targetRole: role,
                jobDescription,
                jobUrl
            });

            console.log('Created tailored version:', version);
            this.closeModal();
            this.render();
        } catch (error) {
            console.error('Failed to create tailored version:', error);
            alert('Failed to create tailored version: ' + error.message);
        }
    }

    /**
     * Clone version
     */
    cloneVersion(versionId) {
        try {
            const cloned = this.versionManager.cloneVersion(versionId);
            console.log('Cloned version:', cloned);
            this.render();
        } catch (error) {
            console.error('Failed to clone version:', error);
            alert('Failed to clone version: ' + error.message);
        }
    }

    /**
     * Edit version
     */
    editVersion(versionId) {
        const version = this.versionManager.getVersion(versionId);

        const modal = this.createModal('Edit Version', `
            <div class="version-form-group">
                <label class="version-form-label">Name</label>
                <input type="text" class="version-form-input" id="edit-name" value="${this.escapeHtml(version.name)}">
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Status</label>
                <select class="version-form-select" id="edit-status">
                    <option value="draft" ${version.status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="applied" ${version.status === 'applied' ? 'selected' : ''}>Applied</option>
                    <option value="interviewing" ${version.status === 'interviewing' ? 'selected' : ''}>Interviewing</option>
                    <option value="rejected" ${version.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="offer" ${version.status === 'offer' ? 'selected' : ''}>Offer</option>
                    <option value="accepted" ${version.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                </select>
            </div>
            <div class="version-form-group">
                <label class="version-form-label">Notes</label>
                <textarea class="version-form-textarea" id="edit-notes">${this.escapeHtml(version.notes || '')}</textarea>
            </div>
        `, [
            { text: 'Cancel', class: 'version-btn-secondary', handler: () => this.closeModal() },
            { text: 'Save', class: 'version-btn-primary', handler: () => this.saveEdit(versionId) }
        ]);

        this.showModal(modal);
    }

    /**
     * Save version edits
     */
    saveEdit(versionId) {
        const name = document.getElementById('edit-name').value.trim();
        const status = document.getElementById('edit-status').value;
        const notes = document.getElementById('edit-notes').value.trim();

        try {
            this.versionManager.updateVersion(versionId, { name, status, notes });
            this.closeModal();
            this.render();
        } catch (error) {
            console.error('Failed to update version:', error);
            alert('Failed to update version: ' + error.message);
        }
    }

    /**
     * Compare with base
     */
    compareWithBase(tailoredId) {
        const tailored = this.versionManager.getVersion(tailoredId);
        const base = this.versionManager.getVersion(tailored.baseResumeId);

        this.selectedVersions = [base.id, tailored.id];
        this.currentView = 'comparison';
        this.render();
    }

    /**
     * Merge to base
     */
    mergeToBase(tailoredId) {
        const validation = this.versionMerger.validateMerge(tailoredId);

        if (!validation.valid) {
            alert('Cannot merge: ' + validation.error);
            return;
        }

        if (validation.hasRisks) {
            const confirmed = confirm(`Warning: ${validation.recommendation}\n\nProceed with merge?`);
            if (!confirmed) return;
        }

        try {
            const result = this.versionMerger.mergeTailoredToBase(tailoredId);
            console.log('Merge result:', result);
            alert(`Merge successful! Applied ${result.appliedChanges.length} changes.`);
            this.render();
        } catch (error) {
            console.error('Failed to merge:', error);
            alert('Failed to merge: ' + error.message);
        }
    }

    /**
     * Toggle favorite
     */
    toggleFavorite(versionId) {
        try {
            this.versionManager.toggleFavorite(versionId);
            this.render();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }

    /**
     * Delete version
     */
    deleteVersion(versionId) {
        const version = this.versionManager.getVersion(versionId);
        const confirmed = confirm(`Delete "${version.name}"?${version.type === 'base' ? ' This will also delete all tailored versions.' : ''}`);

        if (!confirmed) return;

        try {
            if (version.type === 'base') {
                this.versionManager.deleteBaseAndTailored(versionId);
            } else {
                this.versionManager.deleteVersion(versionId);
            }
            this.render();
        } catch (error) {
            console.error('Failed to delete version:', error);
            alert('Failed to delete version: ' + error.message);
        }
    }

    /**
     * Export versions
     */
    exportVersions() {
        try {
            const json = this.versionManager.exportVersions();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resumate-versions-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export versions:', error);
            alert('Failed to export versions: ' + error.message);
        }
    }

    /**
     * Import versions
     */
    importVersions() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const success = this.versionManager.importVersions(event.target.result, true);
                    if (success) {
                        alert('Versions imported successfully!');
                        this.render();
                    } else {
                        alert('Failed to import versions');
                    }
                } catch (error) {
                    console.error('Failed to import versions:', error);
                    alert('Failed to import versions: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    /**
     * Create modal
     */
    createModal(title, content, buttons) {
        return `
            <div class="version-modal active" id="version-modal">
                <div class="version-modal-content">
                    <div class="version-modal-header">
                        <h2 class="version-modal-title">${title}</h2>
                        <button class="version-modal-close" onclick="versionUI.closeModal()">×</button>
                    </div>
                    <div class="version-modal-body">
                        ${content}
                    </div>
                    <div class="version-modal-footer">
                        ${buttons.map(btn => `
                            <button class="version-btn ${btn.class}" onclick="(${btn.handler.toString()})()">${btn.text}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show modal
     */
    showModal(modalHtml) {
        const existingModal = document.getElementById('version-modal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('version-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 200);
        }
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

        return date.toLocaleDateString();
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionUI;
}
