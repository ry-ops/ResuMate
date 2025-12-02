/**
 * DataBridge - Centralized localStorage manager for ResuMate
 *
 * Eliminates data re-entry by managing all user data in a single location
 * with automatic cross-page synchronization via storage events.
 *
 * @class DataBridge
 * @version 1.0.0
 */

class DataBridge {
    constructor() {
        /**
         * Storage key for all user data
         * @private
         */
        this.STORAGE_KEY = 'resumate_user_data';

        /**
         * Storage key for data version tracking
         * @private
         */
        this.VERSION_KEY = 'resumate_data_version';

        /**
         * Current data version
         * @private
         */
        this.currentVersion = 1;

        /**
         * Event listeners for data changes
         * @private
         */
        this.listeners = new Map();

        /**
         * Initialize storage event listener
         */
        this.initStorageListener();

        console.log('[DataBridge] Initialized - Version', this.currentVersion);
    }

    /**
     * Initialize storage event listener for cross-page sync
     * @private
     */
    initStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key === this.STORAGE_KEY) {
                console.log('[DataBridge] Storage event detected - syncing data');
                this.notifyListeners('sync', this.getUserData());
            }
        });
    }

    /**
     * Get complete user data object
     * @returns {Object} User data with all fields
     */
    getUserData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                return this.getDefaultData();
            }

            const parsed = JSON.parse(data);
            console.log('[DataBridge] Retrieved user data:', {
                hasResume: !!parsed.resume?.text,
                hasJob: !!parsed.job?.description,
                hasAnalysis: !!parsed.analysis,
                documentsCount: Object.keys(parsed.documents || {}).length
            });

            return parsed;
        } catch (error) {
            console.error('[DataBridge] Error reading user data:', error);
            return this.getDefaultData();
        }
    }

    /**
     * Get default empty data structure
     * @private
     * @returns {Object} Default data structure
     */
    getDefaultData() {
        return {
            user: {
                name: '',
                email: '',
                phone: '',
                linkedin: '',
                location: ''
            },
            resume: {
                text: '',
                parsed: null,
                sections: [],
                format: 'text',
                lastModified: null
            },
            job: {
                title: '',
                company: '',
                description: '',
                url: '',
                parsed: null,
                lastModified: null
            },
            analysis: {
                score: null,
                matchData: null,
                suggestions: [],
                tailoringSuggestions: [],
                atsScore: null,
                atsDetails: null,
                timestamp: null
            },
            documents: {
                resume: null,
                coverLetter: null,
                executiveBio: null,
                brandStatement: null,
                statusInquiry: null
            },
            preferences: {
                apiKey: '',
                theme: 'light',
                autoSave: true
            },
            metadata: {
                version: this.currentVersion,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        };
    }

    /**
     * Save complete user data
     * @param {Object} data - User data object
     * @returns {boolean} Success status
     */
    saveUserData(data) {
        try {
            // Update metadata
            data.metadata = data.metadata || {};
            data.metadata.lastModified = new Date().toISOString();
            data.metadata.version = this.currentVersion;

            // Save to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            localStorage.setItem(this.VERSION_KEY, this.currentVersion.toString());

            console.log('[DataBridge] Saved user data:', {
                hasResume: !!data.resume?.text,
                hasJob: !!data.job?.description,
                timestamp: data.metadata.lastModified
            });

            // Notify listeners
            this.notifyListeners('save', data);

            return true;
        } catch (error) {
            console.error('[DataBridge] Error saving user data:', error);
            return false;
        }
    }

    /**
     * Update specific field in user data
     * @param {string} path - Dot notation path (e.g., 'resume.text')
     * @param {*} value - Value to set
     * @returns {boolean} Success status
     */
    updateField(path, value) {
        try {
            const data = this.getUserData();
            const parts = path.split('.');
            let current = data;

            // Navigate to parent object
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            // Set value
            current[parts[parts.length - 1]] = value;

            // Update timestamp
            if (parts[0] === 'resume') {
                data.resume.lastModified = new Date().toISOString();
            } else if (parts[0] === 'job') {
                data.job.lastModified = new Date().toISOString();
            }

            console.log(`[DataBridge] Updated field: ${path}`);
            return this.saveUserData(data);
        } catch (error) {
            console.error(`[DataBridge] Error updating field ${path}:`, error);
            return false;
        }
    }

    /**
     * Get specific field from user data
     * @param {string} path - Dot notation path (e.g., 'resume.text')
     * @param {*} defaultValue - Default value if field doesn't exist
     * @returns {*} Field value
     */
    getField(path, defaultValue = null) {
        try {
            const data = this.getUserData();
            const parts = path.split('.');
            let current = data;

            for (const part of parts) {
                if (current[part] === undefined) {
                    return defaultValue;
                }
                current = current[part];
            }

            return current;
        } catch (error) {
            console.error(`[DataBridge] Error getting field ${path}:`, error);
            return defaultValue;
        }
    }

    /**
     * Save resume data
     * @param {string} text - Resume text
     * @param {Object} parsed - Parsed resume data (optional)
     * @returns {boolean} Success status
     */
    saveResume(text, parsed = null) {
        const data = this.getUserData();
        data.resume.text = text;
        data.resume.parsed = parsed;
        data.resume.lastModified = new Date().toISOString();

        console.log('[DataBridge] Saved resume:', {
            length: text.length,
            hasParsed: !!parsed
        });

        return this.saveUserData(data);
    }

    /**
     * Save job description data
     * @param {string} description - Job description text
     * @param {Object} details - Job details (title, company, url, parsed)
     * @returns {boolean} Success status
     */
    saveJob(description, details = {}) {
        const data = this.getUserData();
        data.job.description = description;
        data.job.title = details.title || '';
        data.job.company = details.company || '';
        data.job.url = details.url || '';
        data.job.parsed = details.parsed || null;
        data.job.lastModified = new Date().toISOString();

        console.log('[DataBridge] Saved job:', {
            length: description.length,
            title: data.job.title,
            company: data.job.company
        });

        return this.saveUserData(data);
    }

    /**
     * Save analysis results
     * @param {Object} analysisData - Analysis results
     * @returns {boolean} Success status
     */
    saveAnalysis(analysisData) {
        const data = this.getUserData();
        data.analysis = {
            ...data.analysis,
            ...analysisData,
            timestamp: new Date().toISOString()
        };

        console.log('[DataBridge] Saved analysis:', {
            hasScore: !!analysisData.score,
            hasMatchData: !!analysisData.matchData,
            suggestionsCount: analysisData.suggestions?.length || 0
        });

        return this.saveUserData(data);
    }

    /**
     * Save generated document
     * @param {string} type - Document type (resume, coverLetter, etc.)
     * @param {Object} document - Document data
     * @returns {boolean} Success status
     */
    saveDocument(type, document) {
        const data = this.getUserData();
        data.documents[type] = {
            ...document,
            timestamp: new Date().toISOString()
        };

        console.log(`[DataBridge] Saved document: ${type}`, {
            hasContent: !!document.content,
            format: document.format
        });

        return this.saveUserData(data);
    }

    /**
     * Get document by type
     * @param {string} type - Document type
     * @returns {Object|null} Document data
     */
    getDocument(type) {
        return this.getField(`documents.${type}`, null);
    }

    /**
     * Clear all user data
     * @returns {boolean} Success status
     */
    clearUserData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.VERSION_KEY);

            console.log('[DataBridge] Cleared all user data');
            this.notifyListeners('clear', null);

            return true;
        } catch (error) {
            console.error('[DataBridge] Error clearing user data:', error);
            return false;
        }
    }

    /**
     * Sync data across all open pages
     * This triggers storage events in other tabs/windows
     */
    syncAcrossPages() {
        const data = this.getUserData();
        this.saveUserData(data);
        console.log('[DataBridge] Triggered cross-page sync');
    }

    /**
     * Subscribe to data changes
     * @param {string} event - Event type ('save', 'sync', 'clear')
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        console.log(`[DataBridge] Added listener for: ${event}`);
    }

    /**
     * Unsubscribe from data changes
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                console.log(`[DataBridge] Removed listener for: ${event}`);
            }
        }
    }

    /**
     * Notify all listeners for an event
     * @private
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[DataBridge] Error in listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Export all data as JSON
     * @returns {string} JSON string
     */
    exportData() {
        const data = this.getUserData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON
     * @param {string} jsonString - JSON data
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return this.saveUserData(data);
        } catch (error) {
            console.error('[DataBridge] Error importing data:', error);
            return false;
        }
    }

    /**
     * Get data summary for debugging
     * @returns {Object} Data summary
     */
    getSummary() {
        const data = this.getUserData();
        return {
            hasResume: !!data.resume?.text,
            resumeLength: data.resume?.text?.length || 0,
            hasJob: !!data.job?.description,
            jobLength: data.job?.description?.length || 0,
            hasAnalysis: !!data.analysis?.score,
            documentsGenerated: Object.entries(data.documents || {})
                .filter(([_, doc]) => doc !== null)
                .map(([type, _]) => type),
            lastModified: data.metadata?.lastModified,
            version: data.metadata?.version
        };
    }
}

// Create singleton instance
const dataBridge = new DataBridge();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataBridge;
}

// Log initialization
console.log('[DataBridge] Singleton created - ready for use');
console.log('[DataBridge] Current data summary:', dataBridge.getSummary());
