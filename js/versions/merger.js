/**
 * Version Merger
 * Handles merging changes from tailored versions back to base
 */

class VersionMerger {
    constructor(versionManager, versionDiff) {
        this.versionManager = versionManager;
        this.versionDiff = versionDiff || new VersionDiff();
    }

    /**
     * Merge tailored version changes back to base
     * @param {string} tailoredVersionId - Tailored version ID
     * @param {Object} options - Merge options
     * @returns {Object} Merge result
     */
    mergeTailoredToBase(tailoredVersionId, options = {}) {
        const tailored = this.versionManager.getVersion(tailoredVersionId);

        if (!tailored) {
            throw new Error(`Tailored version not found: ${tailoredVersionId}`);
        }

        if (tailored.type !== 'tailored') {
            throw new Error('Version is not a tailored version');
        }

        const base = this.versionManager.getVersion(tailored.baseResumeId);

        if (!base) {
            throw new Error(`Base version not found: ${tailored.baseResumeId}`);
        }

        // Generate diff
        const comparison = this.versionDiff.compareVersions(base, tailored);

        // Prepare merge plan
        const mergePlan = this.createMergePlan(comparison, options);

        // Execute merge (if not preview mode)
        if (!options.preview) {
            return this.executeMerge(base, tailored, mergePlan);
        }

        return {
            preview: true,
            mergePlan: mergePlan,
            comparison: comparison
        };
    }

    /**
     * Create merge plan from comparison
     * @param {Object} comparison - Version comparison
     * @param {Object} options - Merge options
     * @returns {Object} Merge plan
     */
    createMergePlan(comparison, options = {}) {
        const plan = {
            sections: {},
            conflicts: [],
            strategy: options.strategy || 'selective',
            autoResolve: options.autoResolve !== false
        };

        // Analyze each section
        Object.keys(comparison.resumeData).forEach(sectionName => {
            const sectionDiff = comparison.resumeData[sectionName];

            if (sectionDiff.type !== this.versionDiff.diffTypes.UNCHANGED) {
                plan.sections[sectionName] = this.createSectionMergePlan(
                    sectionName,
                    sectionDiff,
                    options
                );
            }
        });

        return plan;
    }

    /**
     * Create merge plan for a section
     * @param {string} sectionName - Section name
     * @param {Object} sectionDiff - Section diff
     * @param {Object} options - Merge options
     * @returns {Object} Section merge plan
     */
    createSectionMergePlan(sectionName, sectionDiff, options) {
        const plan = {
            action: this.determineAction(sectionDiff, options),
            changes: sectionDiff.changes,
            conflicts: [],
            items: []
        };

        // Handle array sections (e.g., experience, education)
        if (sectionDiff.items) {
            plan.items = sectionDiff.items.map((item, index) => {
                return {
                    index: index,
                    type: item.type,
                    action: this.determineItemAction(item, options),
                    hasConflict: false
                };
            });
        }

        // Handle object sections
        if (sectionDiff.fields) {
            plan.fields = {};

            Object.keys(sectionDiff.fields).forEach(fieldName => {
                const field = sectionDiff.fields[fieldName];
                plan.fields[fieldName] = {
                    type: field.type,
                    action: this.determineFieldAction(field, options),
                    hasConflict: false
                };
            });
        }

        return plan;
    }

    /**
     * Determine merge action based on diff type
     * @param {Object} diff - Diff object
     * @param {Object} options - Merge options
     * @returns {string} Action to take
     */
    determineAction(diff, options) {
        const strategy = options.strategy || 'selective';

        if (strategy === 'replace-all') {
            return 'replace';
        }

        if (strategy === 'merge-all') {
            return 'merge';
        }

        // Selective strategy (default)
        switch (diff.type) {
            case this.versionDiff.diffTypes.ADDED:
                return options.includeAdditions !== false ? 'add' : 'skip';

            case this.versionDiff.diffTypes.REMOVED:
                return options.includeRemovals !== false ? 'remove' : 'skip';

            case this.versionDiff.diffTypes.MODIFIED:
                return options.includeModifications !== false ? 'merge' : 'skip';

            default:
                return 'skip';
        }
    }

    /**
     * Determine action for array item
     * @param {Object} item - Array item diff
     * @param {Object} options - Merge options
     * @returns {string} Action to take
     */
    determineItemAction(item, options) {
        switch (item.type) {
            case this.versionDiff.diffTypes.ADDED:
                return options.includeAdditions !== false ? 'add' : 'skip';

            case this.versionDiff.diffTypes.REMOVED:
                return options.includeRemovals !== false ? 'remove' : 'skip';

            case this.versionDiff.diffTypes.MODIFIED:
                return options.includeModifications !== false ? 'update' : 'skip';

            default:
                return 'skip';
        }
    }

    /**
     * Determine action for object field
     * @param {Object} field - Field diff
     * @param {Object} options - Merge options
     * @returns {string} Action to take
     */
    determineFieldAction(field, options) {
        switch (field.type) {
            case this.versionDiff.diffTypes.ADDED:
                return options.includeAdditions !== false ? 'add' : 'skip';

            case this.versionDiff.diffTypes.REMOVED:
                return options.includeRemovals !== false ? 'remove' : 'skip';

            case this.versionDiff.diffTypes.MODIFIED:
                return options.includeModifications !== false ? 'update' : 'skip';

            default:
                return 'skip';
        }
    }

    /**
     * Execute merge plan
     * @param {Object} base - Base version
     * @param {Object} tailored - Tailored version
     * @param {Object} mergePlan - Merge plan
     * @returns {Object} Merge result
     */
    executeMerge(base, tailored, mergePlan) {
        const mergedData = JSON.parse(JSON.stringify(base.resumeData));
        const appliedChanges = [];
        const skippedChanges = [];

        // Apply section merges
        Object.keys(mergePlan.sections).forEach(sectionName => {
            const sectionPlan = mergePlan.sections[sectionName];

            try {
                const result = this.mergeSectionData(
                    mergedData[sectionName],
                    tailored.resumeData[sectionName],
                    sectionPlan
                );

                mergedData[sectionName] = result.data;
                appliedChanges.push(...result.applied);
                skippedChanges.push(...result.skipped);
            } catch (error) {
                console.error(`Error merging section ${sectionName}:`, error);
                skippedChanges.push({
                    section: sectionName,
                    reason: error.message
                });
            }
        });

        // Update base version with merged data
        const updatedBase = this.versionManager.updateResumeData(base.id, mergedData);

        // Add merge metadata to base version
        updatedBase.notes = (updatedBase.notes || '') +
            `\n\nMerged changes from "${tailored.name}" on ${new Date().toISOString()}`;

        this.versionManager.updateVersion(base.id, updatedBase);

        return {
            success: true,
            baseVersion: updatedBase,
            appliedChanges: appliedChanges,
            skippedChanges: skippedChanges,
            summary: {
                total: appliedChanges.length + skippedChanges.length,
                applied: appliedChanges.length,
                skipped: skippedChanges.length
            }
        };
    }

    /**
     * Merge section data
     * @param {*} baseData - Base section data
     * @param {*} tailoredData - Tailored section data
     * @param {Object} sectionPlan - Section merge plan
     * @returns {Object} Merged data and change log
     */
    mergeSectionData(baseData, tailoredData, sectionPlan) {
        const applied = [];
        const skipped = [];

        let mergedData;

        if (sectionPlan.action === 'replace') {
            // Replace entire section
            mergedData = JSON.parse(JSON.stringify(tailoredData));
            applied.push({ action: 'replace', section: sectionPlan });
        } else if (sectionPlan.action === 'skip') {
            // Keep base data
            mergedData = baseData;
            skipped.push({ action: 'skip', section: sectionPlan });
        } else if (Array.isArray(baseData) && Array.isArray(tailoredData)) {
            // Merge array sections
            const result = this.mergeArrayData(baseData, tailoredData, sectionPlan);
            mergedData = result.data;
            applied.push(...result.applied);
            skipped.push(...result.skipped);
        } else if (typeof baseData === 'object' && typeof tailoredData === 'object') {
            // Merge object sections
            const result = this.mergeObjectData(baseData, tailoredData, sectionPlan);
            mergedData = result.data;
            applied.push(...result.applied);
            skipped.push(...result.skipped);
        } else {
            // Replace primitive value
            mergedData = tailoredData;
            applied.push({ action: 'replace', value: tailoredData });
        }

        return { data: mergedData, applied, skipped };
    }

    /**
     * Merge array data
     * @param {Array} baseArray - Base array
     * @param {Array} tailoredArray - Tailored array
     * @param {Object} sectionPlan - Section plan
     * @returns {Object} Merged array and change log
     */
    mergeArrayData(baseArray, tailoredArray, sectionPlan) {
        const merged = JSON.parse(JSON.stringify(baseArray));
        const applied = [];
        const skipped = [];

        if (!sectionPlan.items) {
            return { data: merged, applied, skipped };
        }

        // Process items according to plan
        sectionPlan.items.forEach(itemPlan => {
            const index = itemPlan.index;

            if (itemPlan.action === 'add') {
                merged.push(JSON.parse(JSON.stringify(tailoredArray[index])));
                applied.push({ action: 'add', index, item: tailoredArray[index] });
            } else if (itemPlan.action === 'remove') {
                if (merged[index]) {
                    merged.splice(index, 1);
                    applied.push({ action: 'remove', index });
                }
            } else if (itemPlan.action === 'update') {
                if (merged[index]) {
                    merged[index] = JSON.parse(JSON.stringify(tailoredArray[index]));
                    applied.push({ action: 'update', index, item: tailoredArray[index] });
                }
            } else {
                skipped.push({ action: 'skip', index });
            }
        });

        return { data: merged, applied, skipped };
    }

    /**
     * Merge object data
     * @param {Object} baseObj - Base object
     * @param {Object} tailoredObj - Tailored object
     * @param {Object} sectionPlan - Section plan
     * @returns {Object} Merged object and change log
     */
    mergeObjectData(baseObj, tailoredObj, sectionPlan) {
        const merged = JSON.parse(JSON.stringify(baseObj));
        const applied = [];
        const skipped = [];

        if (!sectionPlan.fields) {
            return { data: merged, applied, skipped };
        }

        // Process fields according to plan
        Object.keys(sectionPlan.fields).forEach(fieldName => {
            const fieldPlan = sectionPlan.fields[fieldName];

            if (fieldPlan.action === 'add' || fieldPlan.action === 'update') {
                merged[fieldName] = JSON.parse(JSON.stringify(tailoredObj[fieldName]));
                applied.push({ action: fieldPlan.action, field: fieldName, value: tailoredObj[fieldName] });
            } else if (fieldPlan.action === 'remove') {
                delete merged[fieldName];
                applied.push({ action: 'remove', field: fieldName });
            } else {
                skipped.push({ action: 'skip', field: fieldName });
            }
        });

        return { data: merged, applied, skipped };
    }

    /**
     * Selective merge with user choices
     * @param {string} tailoredVersionId - Tailored version ID
     * @param {Object} selections - User selections
     * @returns {Object} Merge result
     */
    selectiveMerge(tailoredVersionId, selections) {
        const tailored = this.versionManager.getVersion(tailoredVersionId);
        const base = this.versionManager.getVersion(tailored.baseResumeId);

        const mergedData = JSON.parse(JSON.stringify(base.resumeData));
        const appliedChanges = [];

        // Apply selected changes
        Object.keys(selections).forEach(sectionName => {
            const sectionSelections = selections[sectionName];

            if (sectionSelections.mergeAll) {
                mergedData[sectionName] = JSON.parse(JSON.stringify(tailored.resumeData[sectionName]));
                appliedChanges.push({
                    section: sectionName,
                    action: 'replace-all'
                });
            } else if (sectionSelections.fields) {
                // Merge selected fields
                Object.keys(sectionSelections.fields).forEach(fieldName => {
                    if (sectionSelections.fields[fieldName]) {
                        if (!mergedData[sectionName]) {
                            mergedData[sectionName] = {};
                        }
                        mergedData[sectionName][fieldName] = tailored.resumeData[sectionName][fieldName];
                        appliedChanges.push({
                            section: sectionName,
                            field: fieldName,
                            action: 'update'
                        });
                    }
                });
            }
        });

        // Update base version
        const updatedBase = this.versionManager.updateResumeData(base.id, mergedData);

        return {
            success: true,
            baseVersion: updatedBase,
            appliedChanges: appliedChanges
        };
    }

    /**
     * Create backup before merge
     * @param {string} baseVersionId - Base version ID
     * @returns {Object} Backup version
     */
    createBackup(baseVersionId) {
        const backup = this.versionManager.cloneVersion(baseVersionId, {
            name: `Backup - ${new Date().toISOString()}`,
            tags: ['backup']
        });

        return backup;
    }

    /**
     * Validate merge safety
     * @param {string} tailoredVersionId - Tailored version ID
     * @returns {Object} Validation result
     */
    validateMerge(tailoredVersionId) {
        const tailored = this.versionManager.getVersion(tailoredVersionId);

        if (!tailored) {
            return { valid: false, error: 'Tailored version not found' };
        }

        if (tailored.type !== 'tailored') {
            return { valid: false, error: 'Version is not a tailored version' };
        }

        const base = this.versionManager.getVersion(tailored.baseResumeId);

        if (!base) {
            return { valid: false, error: 'Base version not found' };
        }

        // Check for potential data loss
        const comparison = this.versionDiff.compareVersions(base, tailored);
        const risks = [];

        Object.keys(comparison.resumeData).forEach(sectionName => {
            const sectionDiff = comparison.resumeData[sectionName];

            if (sectionDiff.type === this.versionDiff.diffTypes.REMOVED) {
                risks.push({
                    type: 'data-loss',
                    section: sectionName,
                    message: `Section "${sectionName}" will be removed`
                });
            }
        });

        return {
            valid: true,
            risks: risks,
            hasRisks: risks.length > 0,
            recommendation: risks.length > 0
                ? 'Create a backup before merging'
                : 'Safe to merge'
        };
    }

    /**
     * Get merge preview
     * @param {string} tailoredVersionId - Tailored version ID
     * @param {Object} options - Merge options
     * @returns {Object} Preview result
     */
    getMergePreview(tailoredVersionId, options = {}) {
        return this.mergeTailoredToBase(tailoredVersionId, {
            ...options,
            preview: true
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionMerger;
}
