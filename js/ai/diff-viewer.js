/**
 * Diff Viewer Component
 * Displays before/after comparison with toggle controls for applying changes
 */

class DiffViewer {
    constructor() {
        this.container = null;
        this.tailoringSession = null;
        this.onApplyCallback = null;
        this.onApplyAllCallback = null;
    }

    /**
     * Initialize diff viewer
     * @param {HTMLElement} container - Container element
     * @param {Object} tailoringSession - Tailoring session data
     * @param {Function} onApplyCallback - Callback when suggestion is applied
     * @param {Function} onApplyAllCallback - Callback when all applied
     */
    initialize(container, tailoringSession, onApplyCallback, onApplyAllCallback) {
        this.container = container;
        this.tailoringSession = tailoringSession;
        this.onApplyCallback = onApplyCallback;
        this.onApplyAllCallback = onApplyAllCallback;

        this.render();
    }

    /**
     * Render the diff viewer UI
     */
    render() {
        if (!this.container || !this.tailoringSession) {
            console.error('[DiffViewer] Missing container or session data');
            return;
        }

        const { suggestions, matchScore, jobTitle, company } = this.tailoringSession;

        // Build HTML
        const html = `
            <div class="diff-viewer">
                <!-- Header -->
                <div class="diff-header">
                    <div class="diff-header-info">
                        <h2>Resume Tailoring Suggestions</h2>
                        <p class="diff-job-info">
                            <strong>${jobTitle || 'Position'}</strong>
                            ${company ? ` at ${company}` : ''}
                        </p>
                        <div class="diff-match-score">
                            <span class="match-label">Current Match:</span>
                            <span class="match-score ${this.getScoreClass(matchScore)}">${matchScore}%</span>
                        </div>
                    </div>
                    <div class="diff-header-actions">
                        <button class="btn btn-primary" id="applyAllBtn">
                            Apply All Suggestions
                        </button>
                        <button class="btn btn-secondary" id="closeViewerBtn">
                            Close
                        </button>
                    </div>
                </div>

                <!-- Suggestions List -->
                <div class="diff-suggestions">
                    ${suggestions.length === 0
                        ? '<p class="no-suggestions">No suggestions available</p>'
                        : suggestions.map((suggestion, index) => this.renderSuggestion(suggestion, index)).join('')
                    }
                </div>

                <!-- Footer Stats -->
                <div class="diff-footer">
                    <div class="diff-stats">
                        <span class="stat">
                            <strong>${suggestions.length}</strong> Suggestions
                        </span>
                        <span class="stat">
                            <strong>${suggestions.filter(s => s.impact === 'high').length}</strong> High Impact
                        </span>
                        <span class="stat">
                            <strong>${suggestions.filter(s => s.applied).length}</strong> Applied
                        </span>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    /**
     * Render a single suggestion
     * @param {Object} suggestion - Suggestion object
     * @param {number} index - Index in list
     * @returns {string} HTML for suggestion
     */
    renderSuggestion(suggestion, index) {
        const impactClass = `impact-${suggestion.impact}`;
        const appliedClass = suggestion.applied ? 'applied' : '';

        return `
            <div class="diff-suggestion ${impactClass} ${appliedClass}" data-suggestion-id="${suggestion.id}">
                <div class="suggestion-header">
                    <div class="suggestion-info">
                        <span class="suggestion-number">#${index + 1}</span>
                        <span class="suggestion-type">${this.formatType(suggestion.type)}</span>
                        <span class="suggestion-section">${suggestion.section}</span>
                        <span class="suggestion-impact ${impactClass}">${suggestion.impact} impact</span>
                    </div>
                    <div class="suggestion-actions">
                        ${!suggestion.applied
                            ? `<button class="btn btn-sm btn-apply" data-suggestion-id="${suggestion.id}">
                                Apply Change
                               </button>`
                            : `<span class="applied-badge">✓ Applied</span>`
                        }
                    </div>
                </div>

                <div class="suggestion-reason">
                    <strong>Why:</strong> ${suggestion.reason}
                </div>

                ${suggestion.keywords && suggestion.keywords.length > 0
                    ? `<div class="suggestion-keywords">
                        <strong>Keywords:</strong>
                        ${suggestion.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
                       </div>`
                    : ''
                }

                <div class="suggestion-diff">
                    <div class="diff-before">
                        <div class="diff-label">Before:</div>
                        <div class="diff-content">${this.escapeHtml(suggestion.before)}</div>
                    </div>
                    <div class="diff-arrow">→</div>
                    <div class="diff-after">
                        <div class="diff-label">After:</div>
                        <div class="diff-content">${this.highlightChanges(suggestion.before, suggestion.after)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Highlight changes between before and after text
     * @param {string} before - Original text
     * @param {string} after - Updated text
     * @returns {string} HTML with highlighted changes
     */
    highlightChanges(before, after) {
        // Simple word-level diff highlighting
        const beforeWords = before.split(/\s+/);
        const afterWords = after.split(/\s+/);

        const beforeSet = new Set(beforeWords.map(w => w.toLowerCase()));
        const afterSet = new Set(afterWords.map(w => w.toLowerCase()));

        // Highlight new words
        const highlighted = afterWords.map(word => {
            const wordLower = word.toLowerCase();
            if (!beforeSet.has(wordLower)) {
                return `<mark class="added">${this.escapeHtml(word)}</mark>`;
            }
            return this.escapeHtml(word);
        });

        return highlighted.join(' ');
    }

    /**
     * Attach event listeners to buttons
     */
    attachEventListeners() {
        // Apply individual suggestion
        const applyButtons = this.container.querySelectorAll('.btn-apply');
        applyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestionId = e.target.dataset.suggestionId;
                this.applySuggestion(suggestionId);
            });
        });

        // Apply all suggestions
        const applyAllBtn = this.container.querySelector('#applyAllBtn');
        if (applyAllBtn) {
            applyAllBtn.addEventListener('click', () => {
                this.applyAllSuggestions();
            });
        }

        // Close viewer
        const closeBtn = this.container.querySelector('#closeViewerBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }
    }

    /**
     * Apply a single suggestion
     * @param {string} suggestionId - Suggestion ID
     */
    applySuggestion(suggestionId) {
        const suggestion = this.tailoringSession.suggestions.find(s => s.id === suggestionId);

        if (!suggestion) {
            console.error('[DiffViewer] Suggestion not found:', suggestionId);
            return;
        }

        if (suggestion.applied) {
            console.log('[DiffViewer] Suggestion already applied');
            return;
        }

        // Mark as applied
        suggestion.applied = true;
        suggestion.appliedAt = new Date().toISOString();
        this.tailoringSession.appliedSuggestions.push(suggestionId);

        // Callback to parent
        if (this.onApplyCallback) {
            this.onApplyCallback(suggestion);
        }

        // Re-render to show applied state
        this.render();

        console.log('[DiffViewer] Applied suggestion:', suggestionId);
    }

    /**
     * Apply all suggestions
     */
    applyAllSuggestions() {
        const unapplied = this.tailoringSession.suggestions.filter(s => !s.applied);

        if (unapplied.length === 0) {
            console.log('[DiffViewer] All suggestions already applied');
            return;
        }

        // Confirm with user
        if (!confirm(`Apply all ${unapplied.length} remaining suggestions?`)) {
            return;
        }

        // Mark all as applied
        unapplied.forEach(suggestion => {
            suggestion.applied = true;
            suggestion.appliedAt = new Date().toISOString();
            this.tailoringSession.appliedSuggestions.push(suggestion.id);
        });

        // Callback to parent
        if (this.onApplyAllCallback) {
            this.onApplyAllCallback(unapplied);
        }

        // Re-render
        this.render();

        console.log(`[DiffViewer] Applied ${unapplied.length} suggestions`);
    }

    /**
     * Close the viewer
     */
    close() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }

    /**
     * Update with new session data
     * @param {Object} tailoringSession - New session data
     */
    update(tailoringSession) {
        this.tailoringSession = tailoringSession;
        this.render();
    }

    /**
     * Get CSS class for match score
     * @param {number} score - Match score
     * @returns {string} CSS class
     */
    getScoreClass(score) {
        if (score >= 80) return 'score-excellent';
        if (score >= 60) return 'score-good';
        if (score >= 40) return 'score-fair';
        return 'score-poor';
    }

    /**
     * Format suggestion type for display
     * @param {string} type - Suggestion type
     * @returns {string} Formatted type
     */
    formatType(type) {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Export current state for persistence
     * @returns {Object} Current state
     */
    exportState() {
        return {
            session: this.tailoringSession,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import previous state
     * @param {Object} state - State to import
     */
    importState(state) {
        if (state && state.session) {
            this.tailoringSession = state.session;
            this.render();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiffViewer;
}
