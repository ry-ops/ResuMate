/**
 * Version Manager
 * Manages resume version CRUD operations and version tree
 */

class VersionManager {
    constructor() {
        this.storage = new VersionStorage();
        this.listeners = {};
        this.statusOptions = [
            'draft',
            'applied',
            'interviewing',
            'rejected',
            'offer',
            'accepted'
        ];
    }

    /**
     * Create a new base resume version
     * @param {Object} data - Version data
     * @returns {Object} Created version
     */
    createBaseVersion(data) {
        const version = {
            id: this.generateId(),
            type: 'base',
            name: data.name || 'Base Resume',
            baseResumeId: null,

            // Resume data
            resumeData: data.resumeData || {},
            templateId: data.templateId || 'modern',
            customization: data.customization || {},

            // Job context (empty for base)
            targetCompany: null,
            targetRole: null,
            jobDescription: null,
            jobUrl: null,

            // Tracking
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appliedAt: null,

            // Changes
            tailoringChanges: [],
            notes: data.notes || '',

            // Associated documents
            coverLetterId: null,

            // Metadata
            tags: data.tags || [],
            favorite: false,
            archived: false
        };

        const saved = this.storage.saveVersion(version);
        this.emit('versionCreated', saved);
        return saved;
    }

    /**
     * Create a tailored version from base resume
     * @param {string} baseResumeId - Base resume ID
     * @param {Object} data - Tailoring data
     * @returns {Object} Created tailored version
     */
    createTailoredVersion(baseResumeId, data) {
        const baseVersion = this.storage.getVersion(baseResumeId);

        if (!baseVersion) {
            throw new Error(`Base resume not found: ${baseResumeId}`);
        }

        const version = {
            id: this.generateId(),
            type: 'tailored',
            name: data.name || `${data.targetCompany} - ${data.targetRole}`,
            baseResumeId: baseResumeId,

            // Copy resume data from base (will be modified)
            resumeData: JSON.parse(JSON.stringify(baseVersion.resumeData)),
            templateId: data.templateId || baseVersion.templateId,
            customization: data.customization || JSON.parse(JSON.stringify(baseVersion.customization)),

            // Job context
            targetCompany: data.targetCompany || '',
            targetRole: data.targetRole || '',
            jobDescription: data.jobDescription || '',
            jobUrl: data.jobUrl || '',

            // Tracking
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appliedAt: null,

            // Changes (will be populated during tailoring)
            tailoringChanges: data.tailoringChanges || [],
            notes: data.notes || '',

            // Associated documents
            coverLetterId: data.coverLetterId || null,

            // Metadata
            tags: data.tags || [],
            favorite: false,
            archived: false
        };

        const saved = this.storage.saveVersion(version);
        this.emit('versionCreated', saved);
        return saved;
    }

    /**
     * Clone an existing version
     * @param {string} versionId - Version ID to clone
     * @param {Object} updates - Optional updates for cloned version
     * @returns {Object} Cloned version
     */
    cloneVersion(versionId, updates = {}) {
        const original = this.storage.getVersion(versionId);

        if (!original) {
            throw new Error(`Version not found: ${versionId}`);
        }

        const cloned = {
            ...JSON.parse(JSON.stringify(original)),
            id: this.generateId(),
            name: updates.name || `${original.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            appliedAt: null,
            ...updates
        };

        const saved = this.storage.saveVersion(cloned);
        this.emit('versionCloned', { original, cloned: saved });
        return saved;
    }

    /**
     * Get version by ID
     * @param {string} versionId - Version ID
     * @returns {Object|null} Version object
     */
    getVersion(versionId) {
        return this.storage.getVersion(versionId);
    }

    /**
     * Get all versions
     * @returns {Array} Array of versions
     */
    getAllVersions() {
        return this.storage.getAllVersions();
    }

    /**
     * Get version tree (base versions with their tailored versions)
     * @returns {Array} Array of base versions with children
     */
    getVersionTree() {
        const baseVersions = this.storage.getBaseVersions();

        return baseVersions.map(base => ({
            ...base,
            children: this.storage.getTailoredVersions(base.id)
        }));
    }

    /**
     * Get versions grouped by base
     * @returns {Object} Object with base IDs as keys
     */
    getVersionsGroupedByBase() {
        const tree = this.getVersionTree();
        const grouped = {};

        tree.forEach(base => {
            grouped[base.id] = {
                base: base,
                tailored: base.children || []
            };
        });

        return grouped;
    }

    /**
     * Update version
     * @param {string} versionId - Version ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} Updated version
     */
    updateVersion(versionId, updates) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        const updated = {
            ...version,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const saved = this.storage.saveVersion(updated);
        this.emit('versionUpdated', saved);
        return saved;
    }

    /**
     * Update version resume data
     * @param {string} versionId - Version ID
     * @param {Object} resumeData - Resume data updates
     * @returns {Object} Updated version
     */
    updateResumeData(versionId, resumeData) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        version.resumeData = { ...version.resumeData, ...resumeData };
        version.updatedAt = new Date().toISOString();

        const saved = this.storage.saveVersion(version);
        this.emit('resumeDataUpdated', saved);
        return saved;
    }

    /**
     * Update version status
     * @param {string} versionId - Version ID
     * @param {string} status - New status
     * @returns {Object} Updated version
     */
    updateStatus(versionId, status) {
        if (!this.statusOptions.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }

        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        version.status = status;
        version.updatedAt = new Date().toISOString();

        // Set appliedAt timestamp when status changes to applied
        if (status === 'applied' && !version.appliedAt) {
            version.appliedAt = new Date().toISOString();
        }

        const saved = this.storage.saveVersion(version);
        this.emit('statusUpdated', saved);
        return saved;
    }

    /**
     * Toggle favorite status
     * @param {string} versionId - Version ID
     * @returns {Object} Updated version
     */
    toggleFavorite(versionId) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        version.favorite = !version.favorite;
        version.updatedAt = new Date().toISOString();

        const saved = this.storage.saveVersion(version);
        this.emit('favoriteToggled', saved);
        return saved;
    }

    /**
     * Archive version
     * @param {string} versionId - Version ID
     * @returns {Object} Updated version
     */
    archiveVersion(versionId) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        version.archived = true;
        version.updatedAt = new Date().toISOString();

        const saved = this.storage.saveVersion(version);
        this.emit('versionArchived', saved);
        return saved;
    }

    /**
     * Unarchive version
     * @param {string} versionId - Version ID
     * @returns {Object} Updated version
     */
    unarchiveVersion(versionId) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        version.archived = false;
        version.updatedAt = new Date().toISOString();

        const saved = this.storage.saveVersion(version);
        this.emit('versionUnarchived', saved);
        return saved;
    }

    /**
     * Add tag to version
     * @param {string} versionId - Version ID
     * @param {string} tag - Tag to add
     * @returns {Object} Updated version
     */
    addTag(versionId, tag) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        if (!version.tags) {
            version.tags = [];
        }

        if (!version.tags.includes(tag)) {
            version.tags.push(tag);
            version.updatedAt = new Date().toISOString();

            const saved = this.storage.saveVersion(version);
            this.emit('tagAdded', { version: saved, tag });
            return saved;
        }

        return version;
    }

    /**
     * Remove tag from version
     * @param {string} versionId - Version ID
     * @param {string} tag - Tag to remove
     * @returns {Object} Updated version
     */
    removeTag(versionId, tag) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        if (version.tags) {
            version.tags = version.tags.filter(t => t !== tag);
            version.updatedAt = new Date().toISOString();

            const saved = this.storage.saveVersion(version);
            this.emit('tagRemoved', { version: saved, tag });
            return saved;
        }

        return version;
    }

    /**
     * Add note to version
     * @param {string} versionId - Version ID
     * @param {string} note - Note to add
     * @returns {Object} Updated version
     */
    addNote(versionId, note) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        version.notes = note;
        version.updatedAt = new Date().toISOString();

        const saved = this.storage.saveVersion(version);
        this.emit('noteAdded', saved);
        return saved;
    }

    /**
     * Delete version
     * @param {string} versionId - Version ID
     * @returns {boolean} Success status
     */
    deleteVersion(versionId) {
        const version = this.storage.getVersion(versionId);

        if (!version) {
            return false;
        }

        const success = this.storage.deleteVersion(versionId);

        if (success) {
            this.emit('versionDeleted', version);
        }

        return success;
    }

    /**
     * Delete base version and all its tailored versions
     * @param {string} baseResumeId - Base resume ID
     * @returns {Object} Deletion summary
     */
    deleteBaseAndTailored(baseResumeId) {
        const tailoredCount = this.storage.deleteTailoredVersions(baseResumeId);
        const baseDeleted = this.storage.deleteVersion(baseResumeId);

        const summary = {
            baseDeleted: baseDeleted,
            tailoredDeleted: tailoredCount,
            totalDeleted: baseDeleted ? tailoredCount + 1 : tailoredCount
        };

        this.emit('baseAndTailoredDeleted', summary);
        return summary;
    }

    /**
     * Search versions
     * @param {string} query - Search query
     * @returns {Array} Array of matching versions
     */
    searchVersions(query) {
        return this.storage.searchVersions(query);
    }

    /**
     * Filter versions
     * @param {Object} criteria - Filter criteria
     * @returns {Array} Array of matching versions
     */
    filterVersions(criteria) {
        return this.storage.filterVersions(criteria);
    }

    /**
     * Sort versions
     * @param {Array} versions - Versions to sort
     * @param {string} field - Field to sort by
     * @param {string} order - Sort order
     * @returns {Array} Sorted versions
     */
    sortVersions(versions, field, order) {
        return this.storage.sortVersions(versions, field, order);
    }

    /**
     * Get statistics
     * @returns {Object} Version statistics
     */
    getStatistics() {
        const versions = this.storage.getAllVersions();

        const stats = {
            total: versions.length,
            base: versions.filter(v => v.type === 'base').length,
            tailored: versions.filter(v => v.type === 'tailored').length,
            byStatus: {},
            favorites: versions.filter(v => v.favorite).length,
            archived: versions.filter(v => v.archived).length,
            active: versions.filter(v => !v.archived).length
        };

        // Count by status
        this.statusOptions.forEach(status => {
            stats.byStatus[status] = versions.filter(v => v.status === status).length;
        });

        // Recent activity
        const sortedByDate = this.storage.sortVersions(versions, 'updatedAt', 'desc');
        stats.recentlyUpdated = sortedByDate.slice(0, 5);

        return stats;
    }

    /**
     * Get all unique tags
     * @returns {Array} Array of unique tags
     */
    getAllTags() {
        const versions = this.storage.getAllVersions();
        const tagsSet = new Set();

        versions.forEach(version => {
            if (version.tags) {
                version.tags.forEach(tag => tagsSet.add(tag));
            }
        });

        return Array.from(tagsSet).sort();
    }

    /**
     * Export versions
     * @returns {string} JSON string
     */
    exportVersions() {
        return this.storage.exportVersions();
    }

    /**
     * Import versions
     * @param {string} jsonString - JSON string
     * @param {boolean} merge - Merge with existing
     * @returns {boolean} Success status
     */
    importVersions(jsonString, merge = false) {
        const success = this.storage.importVersions(jsonString, merge);

        if (success) {
            this.emit('versionsImported', { merge });
        }

        return success;
    }

    /**
     * Clear all versions
     * @returns {boolean} Success status
     */
    clearAllVersions() {
        const success = this.storage.clearAllVersions();

        if (success) {
            this.emit('versionsCleared');
        }

        return success;
    }

    /**
     * Subscribe to events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'version-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionManager;
}
