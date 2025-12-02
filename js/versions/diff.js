/**
 * Version Diff Engine
 * Compares resume versions and generates diffs
 */

class VersionDiff {
    constructor() {
        this.diffTypes = {
            ADDED: 'added',
            REMOVED: 'removed',
            MODIFIED: 'modified',
            UNCHANGED: 'unchanged'
        };
    }

    /**
     * Compare two versions
     * @param {Object} versionA - First version
     * @param {Object} versionB - Second version
     * @returns {Object} Comparison result
     */
    compareVersions(versionA, versionB) {
        return {
            metadata: this.compareMetadata(versionA, versionB),
            resumeData: this.compareResumeData(versionA.resumeData, versionB.resumeData),
            summary: this.generateSummary(versionA, versionB),
            statistics: this.calculateStatistics(versionA.resumeData, versionB.resumeData)
        };
    }

    /**
     * Compare version metadata
     * @param {Object} versionA - First version
     * @param {Object} versionB - Second version
     * @returns {Object} Metadata differences
     */
    compareMetadata(versionA, versionB) {
        return {
            name: {
                old: versionA.name,
                new: versionB.name,
                changed: versionA.name !== versionB.name
            },
            type: {
                old: versionA.type,
                new: versionB.type,
                changed: versionA.type !== versionB.type
            },
            status: {
                old: versionA.status,
                new: versionB.status,
                changed: versionA.status !== versionB.status
            },
            company: {
                old: versionA.targetCompany,
                new: versionB.targetCompany,
                changed: versionA.targetCompany !== versionB.targetCompany
            },
            role: {
                old: versionA.targetRole,
                new: versionB.targetRole,
                changed: versionA.targetRole !== versionB.targetRole
            },
            template: {
                old: versionA.templateId,
                new: versionB.templateId,
                changed: versionA.templateId !== versionB.templateId
            }
        };
    }

    /**
     * Compare resume data
     * @param {Object} dataA - First resume data
     * @param {Object} dataB - Second resume data
     * @returns {Object} Resume data differences
     */
    compareResumeData(dataA, dataB) {
        const sections = this.getAllSections(dataA, dataB);
        const diffs = {};

        sections.forEach(sectionType => {
            diffs[sectionType] = this.compareSections(
                dataA[sectionType],
                dataB[sectionType],
                sectionType
            );
        });

        return diffs;
    }

    /**
     * Get all unique section types from both data objects
     * @param {Object} dataA - First data
     * @param {Object} dataB - Second data
     * @returns {Array} Array of section types
     */
    getAllSections(dataA, dataB) {
        const sections = new Set();

        if (dataA) {
            Object.keys(dataA).forEach(key => sections.add(key));
        }

        if (dataB) {
            Object.keys(dataB).forEach(key => sections.add(key));
        }

        return Array.from(sections);
    }

    /**
     * Compare sections
     * @param {*} sectionA - First section
     * @param {*} sectionB - Second section
     * @param {string} sectionType - Section type
     * @returns {Object} Section differences
     */
    compareSections(sectionA, sectionB, sectionType) {
        // Handle missing sections
        if (!sectionA && !sectionB) {
            return { type: this.diffTypes.UNCHANGED, changes: [] };
        }

        if (!sectionA) {
            return {
                type: this.diffTypes.ADDED,
                old: null,
                new: sectionB,
                changes: ['Entire section added']
            };
        }

        if (!sectionB) {
            return {
                type: this.diffTypes.REMOVED,
                old: sectionA,
                new: null,
                changes: ['Entire section removed']
            };
        }

        // Compare based on section structure
        if (Array.isArray(sectionA) && Array.isArray(sectionB)) {
            return this.compareArraySections(sectionA, sectionB, sectionType);
        } else if (typeof sectionA === 'object' && typeof sectionB === 'object') {
            return this.compareObjectSections(sectionA, sectionB);
        } else {
            return this.comparePrimitives(sectionA, sectionB);
        }
    }

    /**
     * Compare array sections (e.g., experience, education)
     * @param {Array} arrayA - First array
     * @param {Array} arrayB - Second array
     * @param {string} sectionType - Section type
     * @returns {Object} Array differences
     */
    compareArraySections(arrayA, arrayB, sectionType) {
        const changes = [];
        const items = [];

        // Track items by ID or position
        const maxLength = Math.max(arrayA.length, arrayB.length);

        for (let i = 0; i < maxLength; i++) {
            const itemA = arrayA[i];
            const itemB = arrayB[i];

            if (!itemA && itemB) {
                changes.push(`Item ${i + 1} added`);
                items.push({
                    index: i,
                    type: this.diffTypes.ADDED,
                    old: null,
                    new: itemB,
                    details: this.compareObjectSections({}, itemB)
                });
            } else if (itemA && !itemB) {
                changes.push(`Item ${i + 1} removed`);
                items.push({
                    index: i,
                    type: this.diffTypes.REMOVED,
                    old: itemA,
                    new: null,
                    details: null
                });
            } else if (itemA && itemB) {
                const itemDiff = this.compareObjectSections(itemA, itemB);

                if (itemDiff.changes.length > 0) {
                    changes.push(`Item ${i + 1} modified`);
                    items.push({
                        index: i,
                        type: this.diffTypes.MODIFIED,
                        old: itemA,
                        new: itemB,
                        details: itemDiff
                    });
                } else {
                    items.push({
                        index: i,
                        type: this.diffTypes.UNCHANGED,
                        old: itemA,
                        new: itemB,
                        details: null
                    });
                }
            }
        }

        return {
            type: changes.length > 0 ? this.diffTypes.MODIFIED : this.diffTypes.UNCHANGED,
            old: arrayA,
            new: arrayB,
            changes: changes,
            items: items
        };
    }

    /**
     * Compare object sections
     * @param {Object} objA - First object
     * @param {Object} objB - Second object
     * @returns {Object} Object differences
     */
    compareObjectSections(objA, objB) {
        const allKeys = new Set([...Object.keys(objA || {}), ...Object.keys(objB || {})]);
        const changes = [];
        const fields = {};

        allKeys.forEach(key => {
            const valueA = objA[key];
            const valueB = objB[key];

            if (valueA === undefined && valueB !== undefined) {
                changes.push(`${key} added`);
                fields[key] = {
                    type: this.diffTypes.ADDED,
                    old: null,
                    new: valueB
                };
            } else if (valueA !== undefined && valueB === undefined) {
                changes.push(`${key} removed`);
                fields[key] = {
                    type: this.diffTypes.REMOVED,
                    old: valueA,
                    new: null
                };
            } else if (this.deepEqual(valueA, valueB)) {
                fields[key] = {
                    type: this.diffTypes.UNCHANGED,
                    old: valueA,
                    new: valueB
                };
            } else {
                changes.push(`${key} modified`);
                fields[key] = {
                    type: this.diffTypes.MODIFIED,
                    old: valueA,
                    new: valueB,
                    textDiff: typeof valueA === 'string' && typeof valueB === 'string'
                        ? this.getTextDiff(valueA, valueB)
                        : null
                };
            }
        });

        return {
            type: changes.length > 0 ? this.diffTypes.MODIFIED : this.diffTypes.UNCHANGED,
            old: objA,
            new: objB,
            changes: changes,
            fields: fields
        };
    }

    /**
     * Compare primitive values
     * @param {*} valueA - First value
     * @param {*} valueB - Second value
     * @returns {Object} Primitive difference
     */
    comparePrimitives(valueA, valueB) {
        if (valueA === valueB) {
            return {
                type: this.diffTypes.UNCHANGED,
                old: valueA,
                new: valueB,
                changes: []
            };
        }

        return {
            type: this.diffTypes.MODIFIED,
            old: valueA,
            new: valueB,
            changes: ['Value changed']
        };
    }

    /**
     * Get text-level diff
     * @param {string} textA - First text
     * @param {string} textB - Second text
     * @returns {Array} Array of diff segments
     */
    getTextDiff(textA, textB) {
        const wordsA = textA.split(/\s+/);
        const wordsB = textB.split(/\s+/);
        const diff = [];

        const maxLength = Math.max(wordsA.length, wordsB.length);

        for (let i = 0; i < maxLength; i++) {
            const wordA = wordsA[i];
            const wordB = wordsB[i];

            if (wordA === wordB) {
                diff.push({ type: this.diffTypes.UNCHANGED, value: wordA });
            } else if (!wordA) {
                diff.push({ type: this.diffTypes.ADDED, value: wordB });
            } else if (!wordB) {
                diff.push({ type: this.diffTypes.REMOVED, value: wordA });
            } else {
                diff.push({ type: this.diffTypes.REMOVED, value: wordA });
                diff.push({ type: this.diffTypes.ADDED, value: wordB });
            }
        }

        return diff;
    }

    /**
     * Generate summary of changes
     * @param {Object} versionA - First version
     * @param {Object} versionB - Second version
     * @returns {Object} Change summary
     */
    generateSummary(versionA, versionB) {
        const resumeDiff = this.compareResumeData(versionA.resumeData, versionB.resumeData);
        const sections = Object.keys(resumeDiff);

        const summary = {
            sectionsChanged: 0,
            sectionsAdded: 0,
            sectionsRemoved: 0,
            sectionsUnchanged: 0,
            details: []
        };

        sections.forEach(section => {
            const sectionDiff = resumeDiff[section];

            if (sectionDiff.type === this.diffTypes.ADDED) {
                summary.sectionsAdded++;
                summary.details.push(`Section "${section}" was added`);
            } else if (sectionDiff.type === this.diffTypes.REMOVED) {
                summary.sectionsRemoved++;
                summary.details.push(`Section "${section}" was removed`);
            } else if (sectionDiff.type === this.diffTypes.MODIFIED) {
                summary.sectionsChanged++;
                summary.details.push(`Section "${section}" was modified`);
            } else {
                summary.sectionsUnchanged++;
            }
        });

        return summary;
    }

    /**
     * Calculate change statistics
     * @param {Object} dataA - First resume data
     * @param {Object} dataB - Second resume data
     * @returns {Object} Statistics
     */
    calculateStatistics(dataA, dataB) {
        const textA = this.extractAllText(dataA);
        const textB = this.extractAllText(dataB);

        const wordsA = textA.split(/\s+/).filter(w => w.length > 0);
        const wordsB = textB.split(/\s+/).filter(w => w.length > 0);

        const charsA = textA.length;
        const charsB = textB.length;

        return {
            words: {
                old: wordsA.length,
                new: wordsB.length,
                change: wordsB.length - wordsA.length,
                percentChange: wordsA.length > 0
                    ? ((wordsB.length - wordsA.length) / wordsA.length * 100).toFixed(1)
                    : 0
            },
            characters: {
                old: charsA,
                new: charsB,
                change: charsB - charsA,
                percentChange: charsA > 0
                    ? ((charsB - charsA) / charsA * 100).toFixed(1)
                    : 0
            },
            similarity: this.calculateSimilarity(textA, textB)
        };
    }

    /**
     * Extract all text from resume data
     * @param {Object} data - Resume data
     * @returns {string} All text concatenated
     */
    extractAllText(data) {
        let text = '';

        const traverse = (obj) => {
            if (typeof obj === 'string') {
                text += obj + ' ';
            } else if (Array.isArray(obj)) {
                obj.forEach(item => traverse(item));
            } else if (obj && typeof obj === 'object') {
                Object.values(obj).forEach(value => traverse(value));
            }
        };

        traverse(data);
        return text.trim();
    }

    /**
     * Calculate similarity score between two texts
     * @param {string} textA - First text
     * @param {string} textB - Second text
     * @returns {number} Similarity score (0-100)
     */
    calculateSimilarity(textA, textB) {
        const wordsA = new Set(textA.toLowerCase().split(/\s+/));
        const wordsB = new Set(textB.toLowerCase().split(/\s+/));

        const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
        const union = new Set([...wordsA, ...wordsB]);

        if (union.size === 0) return 100;

        const similarity = (intersection.size / union.size) * 100;
        return Math.round(similarity);
    }

    /**
     * Deep equality check
     * @param {*} a - First value
     * @param {*} b - Second value
     * @returns {boolean} Whether values are equal
     */
    deepEqual(a, b) {
        if (a === b) return true;

        if (a == null || b == null) return false;

        if (typeof a !== 'object' || typeof b !== 'object') return false;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        for (let key of keysA) {
            if (!keysB.includes(key)) return false;
            if (!this.deepEqual(a[key], b[key])) return false;
        }

        return true;
    }

    /**
     * Generate HTML diff view
     * @param {Object} comparison - Comparison result
     * @returns {string} HTML string
     */
    generateDiffHTML(comparison) {
        let html = '<div class="version-diff-view">';

        // Metadata changes
        html += '<div class="diff-section">';
        html += '<h3>Metadata Changes</h3>';
        html += this.generateMetadataDiffHTML(comparison.metadata);
        html += '</div>';

        // Resume data changes
        html += '<div class="diff-section">';
        html += '<h3>Resume Changes</h3>';
        html += this.generateResumeDataDiffHTML(comparison.resumeData);
        html += '</div>';

        // Statistics
        html += '<div class="diff-section">';
        html += '<h3>Statistics</h3>';
        html += this.generateStatisticsHTML(comparison.statistics);
        html += '</div>';

        html += '</div>';
        return html;
    }

    /**
     * Generate metadata diff HTML
     * @param {Object} metadata - Metadata comparison
     * @returns {string} HTML string
     */
    generateMetadataDiffHTML(metadata) {
        let html = '<table class="diff-table">';

        Object.keys(metadata).forEach(key => {
            const item = metadata[key];
            if (item.changed) {
                html += '<tr>';
                html += `<td class="diff-label">${key}</td>`;
                html += `<td class="diff-old">${this.escapeHtml(item.old || '')}</td>`;
                html += `<td class="diff-arrow">&rarr;</td>`;
                html += `<td class="diff-new">${this.escapeHtml(item.new || '')}</td>`;
                html += '</tr>';
            }
        });

        html += '</table>';
        return html;
    }

    /**
     * Generate resume data diff HTML
     * @param {Object} resumeData - Resume data comparison
     * @returns {string} HTML string
     */
    generateResumeDataDiffHTML(resumeData) {
        let html = '';

        Object.keys(resumeData).forEach(section => {
            const sectionDiff = resumeData[section];

            if (sectionDiff.type !== this.diffTypes.UNCHANGED) {
                html += `<div class="diff-subsection">`;
                html += `<h4>${this.formatSectionName(section)}</h4>`;
                html += `<div class="diff-changes">`;

                sectionDiff.changes.forEach(change => {
                    html += `<p class="diff-change">${this.escapeHtml(change)}</p>`;
                });

                html += '</div></div>';
            }
        });

        return html || '<p>No changes</p>';
    }

    /**
     * Generate statistics HTML
     * @param {Object} stats - Statistics object
     * @returns {string} HTML string
     */
    generateStatisticsHTML(stats) {
        return `
            <div class="diff-stats">
                <div class="stat-item">
                    <span class="stat-label">Word Count:</span>
                    <span class="stat-value">${stats.words.old} &rarr; ${stats.words.new}</span>
                    <span class="stat-change ${stats.words.change >= 0 ? 'positive' : 'negative'}">
                        (${stats.words.change > 0 ? '+' : ''}${stats.words.change})
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Character Count:</span>
                    <span class="stat-value">${stats.characters.old} &rarr; ${stats.characters.new}</span>
                    <span class="stat-change ${stats.characters.change >= 0 ? 'positive' : 'negative'}">
                        (${stats.characters.change > 0 ? '+' : ''}${stats.characters.change})
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Similarity:</span>
                    <span class="stat-value">${stats.similarity}%</span>
                </div>
            </div>
        `;
    }

    /**
     * Format section name for display
     * @param {string} section - Section name
     * @returns {string} Formatted name
     */
    formatSectionName(section) {
        return section
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Escape HTML
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionDiff;
}
