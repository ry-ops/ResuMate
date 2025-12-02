/**
 * Version Storage Manager
 * Handles localStorage persistence for resume versions
 */

class VersionStorage {
    constructor() {
        this.storageKey = 'resumate_versions';
        this.metadataKey = 'resumate_versions_metadata';
    }

    /**
     * Get all versions from localStorage
     * @returns {Array} Array of version objects
     */
    getAllVersions() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load versions:', error);
            return [];
        }
    }

    /**
     * Get version by ID
     * @param {string} versionId - Version ID
     * @returns {Object|null} Version object or null
     */
    getVersion(versionId) {
        const versions = this.getAllVersions();
        return versions.find(v => v.id === versionId) || null;
    }

    /**
     * Get versions by type
     * @param {string} type - Version type ('base' or 'tailored')
     * @returns {Array} Array of versions
     */
    getVersionsByType(type) {
        const versions = this.getAllVersions();
        return versions.filter(v => v.type === type);
    }

    /**
     * Get base versions (all base resumes)
     * @returns {Array} Array of base version objects
     */
    getBaseVersions() {
        return this.getVersionsByType('base');
    }

    /**
     * Get tailored versions for a base resume
     * @param {string} baseResumeId - Base resume ID
     * @returns {Array} Array of tailored versions
     */
    getTailoredVersions(baseResumeId) {
        const versions = this.getAllVersions();
        return versions.filter(v => v.type === 'tailored' && v.baseResumeId === baseResumeId);
    }

    /**
     * Get versions by status
     * @param {string} status - Status filter
     * @returns {Array} Array of versions
     */
    getVersionsByStatus(status) {
        const versions = this.getAllVersions();
        return versions.filter(v => v.status === status);
    }

    /**
     * Get versions by company
     * @param {string} company - Company name
     * @returns {Array} Array of versions
     */
    getVersionsByCompany(company) {
        const versions = this.getAllVersions();
        return versions.filter(v =>
            v.targetCompany && v.targetCompany.toLowerCase().includes(company.toLowerCase())
        );
    }

    /**
     * Get favorite versions
     * @returns {Array} Array of favorite versions
     */
    getFavoriteVersions() {
        const versions = this.getAllVersions();
        return versions.filter(v => v.favorite === true);
    }

    /**
     * Get non-archived versions
     * @returns {Array} Array of active versions
     */
    getActiveVersions() {
        const versions = this.getAllVersions();
        return versions.filter(v => !v.archived);
    }

    /**
     * Get archived versions
     * @returns {Array} Array of archived versions
     */
    getArchivedVersions() {
        const versions = this.getAllVersions();
        return versions.filter(v => v.archived === true);
    }

    /**
     * Save version to localStorage
     * @param {Object} version - Version object
     * @returns {Object} Saved version
     */
    saveVersion(version) {
        try {
            const versions = this.getAllVersions();
            const existingIndex = versions.findIndex(v => v.id === version.id);

            // Update timestamp
            version.updatedAt = new Date().toISOString();

            if (existingIndex !== -1) {
                // Update existing version
                versions[existingIndex] = version;
            } else {
                // Add new version
                if (!version.createdAt) {
                    version.createdAt = new Date().toISOString();
                }
                versions.push(version);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(versions));
            this.updateMetadata();

            return version;
        } catch (error) {
            console.error('Failed to save version:', error);
            throw error;
        }
    }

    /**
     * Delete version from localStorage
     * @param {string} versionId - Version ID
     * @returns {boolean} Success status
     */
    deleteVersion(versionId) {
        try {
            const versions = this.getAllVersions();
            const filtered = versions.filter(v => v.id !== versionId);

            if (filtered.length === versions.length) {
                return false; // Version not found
            }

            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            this.updateMetadata();

            return true;
        } catch (error) {
            console.error('Failed to delete version:', error);
            return false;
        }
    }

    /**
     * Delete all tailored versions for a base resume
     * @param {string} baseResumeId - Base resume ID
     * @returns {number} Number of versions deleted
     */
    deleteTailoredVersions(baseResumeId) {
        try {
            const versions = this.getAllVersions();
            const beforeCount = versions.length;
            const filtered = versions.filter(v =>
                !(v.type === 'tailored' && v.baseResumeId === baseResumeId)
            );

            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            this.updateMetadata();

            return beforeCount - filtered.length;
        } catch (error) {
            console.error('Failed to delete tailored versions:', error);
            return 0;
        }
    }

    /**
     * Search versions by query
     * @param {string} query - Search query
     * @returns {Array} Array of matching versions
     */
    searchVersions(query) {
        const versions = this.getAllVersions();
        const lowerQuery = query.toLowerCase();

        return versions.filter(v => {
            return (
                (v.name && v.name.toLowerCase().includes(lowerQuery)) ||
                (v.targetCompany && v.targetCompany.toLowerCase().includes(lowerQuery)) ||
                (v.targetRole && v.targetRole.toLowerCase().includes(lowerQuery)) ||
                (v.notes && v.notes.toLowerCase().includes(lowerQuery)) ||
                (v.tags && v.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
            );
        });
    }

    /**
     * Filter versions by criteria
     * @param {Object} criteria - Filter criteria
     * @returns {Array} Array of matching versions
     */
    filterVersions(criteria) {
        let versions = this.getAllVersions();

        if (criteria.type) {
            versions = versions.filter(v => v.type === criteria.type);
        }

        if (criteria.status) {
            versions = versions.filter(v => v.status === criteria.status);
        }

        if (criteria.baseResumeId) {
            versions = versions.filter(v => v.baseResumeId === criteria.baseResumeId);
        }

        if (criteria.favorite !== undefined) {
            versions = versions.filter(v => v.favorite === criteria.favorite);
        }

        if (criteria.archived !== undefined) {
            versions = versions.filter(v => v.archived === criteria.archived);
        }

        if (criteria.tags && criteria.tags.length > 0) {
            versions = versions.filter(v =>
                v.tags && criteria.tags.some(tag => v.tags.includes(tag))
            );
        }

        if (criteria.dateFrom) {
            const fromDate = new Date(criteria.dateFrom);
            versions = versions.filter(v => new Date(v.createdAt) >= fromDate);
        }

        if (criteria.dateTo) {
            const toDate = new Date(criteria.dateTo);
            versions = versions.filter(v => new Date(v.createdAt) <= toDate);
        }

        return versions;
    }

    /**
     * Sort versions by field
     * @param {Array} versions - Versions to sort
     * @param {string} field - Field to sort by
     * @param {string} order - Sort order ('asc' or 'desc')
     * @returns {Array} Sorted versions
     */
    sortVersions(versions, field = 'updatedAt', order = 'desc') {
        return [...versions].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            // Handle date fields
            if (field === 'createdAt' || field === 'updatedAt' || field === 'appliedAt') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            // Handle string fields
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal ? bVal.toLowerCase() : '';
            }

            // Compare
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Update metadata
     */
    updateMetadata() {
        const versions = this.getAllVersions();
        const metadata = {
            totalVersions: versions.length,
            baseVersions: versions.filter(v => v.type === 'base').length,
            tailoredVersions: versions.filter(v => v.type === 'tailored').length,
            lastUpdated: new Date().toISOString()
        };

        try {
            localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
        } catch (error) {
            console.error('Failed to update metadata:', error);
        }
    }

    /**
     * Get metadata
     * @returns {Object} Metadata object
     */
    getMetadata() {
        try {
            const data = localStorage.getItem(this.metadataKey);
            return data ? JSON.parse(data) : { totalVersions: 0, baseVersions: 0, tailoredVersions: 0 };
        } catch (error) {
            console.error('Failed to load metadata:', error);
            return { totalVersions: 0, baseVersions: 0, tailoredVersions: 0 };
        }
    }

    /**
     * Export all versions as JSON
     * @returns {string} JSON string
     */
    exportVersions() {
        const versions = this.getAllVersions();
        return JSON.stringify(versions, null, 2);
    }

    /**
     * Import versions from JSON
     * @param {string} jsonString - JSON string
     * @param {boolean} merge - Merge with existing versions
     * @returns {boolean} Success status
     */
    importVersions(jsonString, merge = false) {
        try {
            const imported = JSON.parse(jsonString);

            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected array of versions');
            }

            let versions = merge ? this.getAllVersions() : [];

            imported.forEach(version => {
                // Ensure required fields exist
                if (!version.id) {
                    version.id = this.generateId();
                }

                const existingIndex = versions.findIndex(v => v.id === version.id);
                if (existingIndex !== -1 && merge) {
                    versions[existingIndex] = version;
                } else if (existingIndex === -1) {
                    versions.push(version);
                }
            });

            localStorage.setItem(this.storageKey, JSON.stringify(versions));
            this.updateMetadata();

            return true;
        } catch (error) {
            console.error('Failed to import versions:', error);
            return false;
        }
    }

    /**
     * Clear all versions
     * @returns {boolean} Success status
     */
    clearAllVersions() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.metadataKey);
            return true;
        } catch (error) {
            console.error('Failed to clear versions:', error);
            return false;
        }
    }

    /**
     * Get storage usage
     * @returns {Object} Storage usage info
     */
    getStorageUsage() {
        try {
            const versions = this.getAllVersions();
            const dataString = JSON.stringify(versions);
            const bytes = new Blob([dataString]).size;
            const kb = (bytes / 1024).toFixed(2);
            const mb = (bytes / (1024 * 1024)).toFixed(2);

            return {
                versions: versions.length,
                bytes: bytes,
                kilobytes: kb,
                megabytes: mb,
                percentage: ((bytes / (5 * 1024 * 1024)) * 100).toFixed(2) // Assuming 5MB localStorage limit
            };
        } catch (error) {
            console.error('Failed to calculate storage usage:', error);
            return { versions: 0, bytes: 0, kilobytes: 0, megabytes: 0, percentage: 0 };
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
    module.exports = VersionStorage;
}
