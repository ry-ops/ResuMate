// Proofreading Suite UI Controller
// Manages UI interactions, displays results, and handles user actions

/**
 * Proofreading UI Controller
 * Coordinates proofreading, tone analysis, and consistency checking with UI
 */
class ProofreadUI {
    constructor() {
        this.proofreadEngine = typeof proofreadEngine !== 'undefined' ? proofreadEngine : null;
        this.toneAnalyzer = typeof toneAnalyzer !== 'undefined' ? toneAnalyzer : null;
        this.consistencyChecker = typeof consistencyChecker !== 'undefined' ? consistencyChecker : null;

        this.currentResults = null;
        this.currentToneResults = null;
        this.currentConsistencyResults = null;
        this.activeFilters = new Set(['all']);
        this.ignoredIssues = new Set();

        this.init();
    }

    /**
     * Initialize UI controller
     */
    init() {
        console.log('ProofreadUI initialized');
    }

    /**
     * Run comprehensive proofreading on content
     * @param {string} content - Content to proofread
     * @param {Object} context - Context (industry, role)
     * @returns {Promise<Object>} - Combined results
     */
    async runFullAnalysis(content, context = {}) {
        if (!content || content.trim().length === 0) {
            throw new Error('Content is required for proofreading');
        }

        // Show progress
        this._showProgress(0);

        try {
            const results = {
                timestamp: new Date().toISOString(),
                content: content,
                context: context,
                proofread: null,
                tone: null,
                consistency: null,
                polishScore: 0,
                overallGrade: 'N/A'
            };

            // Run proofreading (33%)
            this._showProgress(10);
            if (this.proofreadEngine) {
                results.proofread = await this.proofreadEngine.proofread(content);
                this._showProgress(33);
            }

            // Run tone analysis (66%)
            if (this.toneAnalyzer) {
                results.tone = await this.toneAnalyzer.analyzeTone(content, context);
                this._showProgress(66);
            }

            // Run consistency check (100%)
            if (this.consistencyChecker) {
                results.consistency = await this.consistencyChecker.checkConsistency(content);
                this._showProgress(100);
            }

            // Calculate overall polish score
            results.polishScore = this._calculatePolishScore(results);
            results.overallGrade = this._getLetterGrade(results.polishScore);

            // Store results
            this.currentResults = results.proofread;
            this.currentToneResults = results.tone;
            this.currentConsistencyResults = results.consistency;

            // Hide progress
            setTimeout(() => this._hideProgress(), 500);

            return results;
        } catch (error) {
            this._hideProgress();
            console.error('Full analysis error:', error);
            throw error;
        }
    }

    /**
     * Calculate overall polish score
     * @param {Object} results - All analysis results
     * @returns {number} - Polish score (0-100)
     * @private
     */
    _calculatePolishScore(results) {
        const scores = [];

        if (results.proofread && results.proofread.scores) {
            scores.push(results.proofread.scores.overall * 0.4); // 40% weight
        }

        if (results.tone && results.tone.scores) {
            scores.push(results.tone.scores.overall * 0.3); // 30% weight
        }

        if (results.consistency && results.consistency.scores) {
            scores.push(results.consistency.scores.overall * 0.3); // 30% weight
        }

        const total = scores.reduce((sum, score) => sum + score, 0);
        return Math.round(total);
    }

    /**
     * Display proofreading results in UI
     * @param {string} containerId - Container element ID
     * @param {Object} results - Full analysis results
     */
    displayResults(containerId, results) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const html = this._generateResultsHTML(results);
        container.innerHTML = html;

        // Attach event listeners
        this._attachEventListeners(container);
    }

    /**
     * Generate HTML for results display
     * @param {Object} results - Full analysis results
     * @returns {string} - HTML string
     * @private
     */
    _generateResultsHTML(results) {
        const sections = [];

        // Polish Score Section
        sections.push(this._generatePolishScoreHTML(results));

        // Statistics Section
        sections.push(this._generateStatisticsHTML(results));

        // Combined Issues Section
        sections.push(this._generateIssuesHTML(results));

        // Recommendations Section
        sections.push(this._generateRecommendationsHTML(results));

        return `
            <div class="proofread-panel">
                <div class="proofread-header">
                    <h2 class="proofread-title">Resume Polish Report</h2>
                    <div class="proofread-actions">
                        <button class="proofread-btn proofread-btn-secondary" onclick="proofreadUI.exportReport()">
                            Export Report
                        </button>
                        <button class="proofread-btn proofread-btn-primary" onclick="proofreadUI.runFullAnalysis()">
                            Re-analyze
                        </button>
                    </div>
                </div>
                ${sections.join('\n')}
            </div>
        `;
    }

    /**
     * Generate polish score HTML
     * @param {Object} results - Full analysis results
     * @returns {string} - HTML string
     * @private
     */
    _generatePolishScoreHTML(results) {
        const breakdown = [];

        if (results.proofread && results.proofread.scores) {
            breakdown.push({
                name: 'Grammar',
                score: results.proofread.scores.grammar
            });
            breakdown.push({
                name: 'Style',
                score: results.proofread.scores.style
            });
            breakdown.push({
                name: 'Readability',
                score: results.proofread.scores.readability
            });
        }

        if (results.tone && results.tone.scores) {
            breakdown.push({
                name: 'Tone',
                score: results.tone.scores.overall
            });
        }

        if (results.consistency && results.consistency.scores) {
            breakdown.push({
                name: 'Consistency',
                score: results.consistency.scores.overall
            });
        }

        const breakdownHTML = breakdown.map(item => `
            <div class="polish-score-category">
                <div class="polish-score-category-name">${item.name}</div>
                <div class="polish-score-category-value">${item.score}/100</div>
            </div>
        `).join('');

        return `
            <div class="polish-score-container">
                <div class="polish-score-main">
                    <div class="polish-score-value">
                        <div class="polish-score-number">${results.polishScore}</div>
                        <div class="polish-score-label">Polish Score</div>
                    </div>
                    <div class="polish-score-grade">${results.overallGrade}</div>
                </div>
                <div class="polish-score-breakdown">
                    ${breakdownHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generate statistics HTML
     * @param {Object} results - Full analysis results
     * @returns {string} - HTML string
     * @private
     */
    _generateStatisticsHTML(results) {
        const stats = [];

        if (results.proofread && results.proofread.statistics) {
            const s = results.proofread.statistics;
            stats.push({
                value: s.wordCount,
                label: 'Words',
                sublabel: `${s.sentenceCount} sentences`
            });
            stats.push({
                value: s.avgSentenceLength,
                label: 'Avg Sentence',
                sublabel: 'words'
            });
            stats.push({
                value: s.readabilityScore,
                label: 'Readability',
                sublabel: 'Flesch-Kincaid'
            });
        }

        // Count total issues
        let totalIssues = 0;
        if (results.proofread) totalIssues += results.proofread.issues.length;
        if (results.tone) totalIssues += results.tone.issues.length;
        if (results.consistency) totalIssues += results.consistency.issues.length;

        stats.push({
            value: totalIssues,
            label: 'Issues Found',
            sublabel: 'total'
        });

        const statsHTML = stats.map(stat => `
            <div class="statistic-card">
                <div class="statistic-value">${stat.value}</div>
                <div class="statistic-label">${stat.label}</div>
                ${stat.sublabel ? `<div class="statistic-sublabel">${stat.sublabel}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="statistics-container">
                ${statsHTML}
            </div>
        `;
    }

    /**
     * Generate issues HTML
     * @param {Object} results - Full analysis results
     * @returns {string} - HTML string
     * @private
     */
    _generateIssuesHTML(results) {
        // Combine all issues
        const allIssues = [];

        if (results.proofread) {
            allIssues.push(...results.proofread.issues.map(i => ({ ...i, category: 'proofread' })));
        }

        if (results.tone) {
            allIssues.push(...results.tone.issues.map(i => ({ ...i, category: 'tone' })));
        }

        if (results.consistency) {
            allIssues.push(...results.consistency.issues.map(i => ({ ...i, category: 'consistency' })));
        }

        // Sort by severity
        const severityOrder = { high: 0, medium: 1, low: 2 };
        allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        // Filter out ignored issues
        const filteredIssues = allIssues.filter(issue =>
            !this.ignoredIssues.has(this._getIssueId(issue))
        );

        if (filteredIssues.length === 0) {
            return `
                <div class="proofread-empty">
                    <div class="proofread-empty-icon">✓</div>
                    <h3 class="proofread-empty-title">Excellent Work!</h3>
                    <p class="proofread-empty-text">No issues found. Your resume is polished and ready.</p>
                </div>
            `;
        }

        const issuesHTML = filteredIssues.map((issue, index) =>
            this._generateIssueCardHTML(issue, index)
        ).join('');

        return `
            <div class="issues-container">
                <div class="issues-summary">
                    <div class="issues-count">${filteredIssues.length} Issues Found</div>
                    <div class="issues-filter">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="high">High</button>
                        <button class="filter-btn" data-filter="medium">Medium</button>
                        <button class="filter-btn" data-filter="low">Low</button>
                    </div>
                </div>
                <div class="issues-list">
                    ${issuesHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generate issue card HTML
     * @param {Object} issue - Issue object
     * @param {number} index - Issue index
     * @returns {string} - HTML string
     * @private
     */
    _generateIssueCardHTML(issue, index) {
        const issueId = this._getIssueId(issue);

        return `
            <div class="issue-card severity-${issue.severity}" data-issue-id="${issueId}" data-severity="${issue.severity}">
                <div class="issue-header">
                    <div class="issue-type">
                        <span class="issue-type-badge ${issue.type}">${issue.type.replace(/_/g, ' ')}</span>
                    </div>
                    <span class="issue-severity ${issue.severity}">${issue.severity}</span>
                </div>
                <div class="issue-content">
                    ${issue.text ? `<div class="issue-text">${this._escapeHtml(issue.text)}</div>` : ''}
                    ${issue.location ? `<div class="issue-location">${this._escapeHtml(issue.location)}</div>` : ''}
                    <div class="issue-message">${this._escapeHtml(issue.message)}</div>
                    ${issue.suggestion ? `
                        <div class="issue-suggestion">
                            <span class="issue-suggestion-label">Suggestion:</span>
                            ${this._escapeHtml(issue.suggestion)}
                        </div>
                    ` : ''}
                </div>
                <div class="issue-actions">
                    ${issue.suggestion ? `
                        <button class="issue-action-btn fix" onclick="proofreadUI.applyFix('${issueId}')">
                            Apply Fix
                        </button>
                    ` : ''}
                    <button class="issue-action-btn ignore" onclick="proofreadUI.ignoreIssue('${issueId}')">
                        Ignore
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generate recommendations HTML
     * @param {Object} results - Full analysis results
     * @returns {string} - HTML string
     * @private
     */
    _generateRecommendationsHTML(results) {
        const recommendations = [];

        if (results.tone && results.tone.recommendations) {
            recommendations.push(...results.tone.recommendations);
        }

        if (results.consistency && results.consistency.recommendations) {
            recommendations.push(...results.consistency.recommendations);
        }

        if (recommendations.length === 0) {
            return '';
        }

        const recsHTML = recommendations.map(rec => `
            <div class="issue-card severity-low">
                <div class="issue-header">
                    <div class="issue-type">
                        <span class="issue-type-badge consistency">Recommendation</span>
                    </div>
                    <span class="issue-severity low">${rec.priority || 'low'}</span>
                </div>
                <div class="issue-content">
                    <div class="issue-message">${this._escapeHtml(rec.message)}</div>
                    ${rec.action ? `
                        <div class="issue-suggestion">
                            <span class="issue-suggestion-label">Action:</span>
                            ${this._escapeHtml(rec.action)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        return `
            <div class="issues-container">
                <h3 style="margin: 20px 0 16px 0; color: #1f2937;">Recommendations</h3>
                <div class="issues-list">
                    ${recsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to UI elements
     * @param {HTMLElement} container - Container element
     * @private
     */
    _attachEventListeners(container) {
        // Filter buttons
        const filterBtns = container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this._applyFilter(filter, container);

                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    /**
     * Apply filter to issues
     * @param {string} filter - Filter type
     * @param {HTMLElement} container - Container element
     * @private
     */
    _applyFilter(filter, container) {
        const issueCards = container.querySelectorAll('.issue-card');

        issueCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const severity = card.dataset.severity;
                card.style.display = severity === filter ? 'block' : 'none';
            }
        });
    }

    /**
     * Apply a suggested fix
     * @param {string} issueId - Issue ID
     */
    applyFix(issueId) {
        console.log('Apply fix:', issueId);
        // Implementation would integrate with editor to apply the fix
        alert('Fix applied! (Integration with editor required)');

        // Remove issue from display
        const issueCard = document.querySelector(`[data-issue-id="${issueId}"]`);
        if (issueCard) {
            issueCard.style.opacity = '0.5';
            setTimeout(() => issueCard.remove(), 300);
        }
    }

    /**
     * Ignore an issue
     * @param {string} issueId - Issue ID
     */
    ignoreIssue(issueId) {
        this.ignoredIssues.add(issueId);

        // Remove from display
        const issueCard = document.querySelector(`[data-issue-id="${issueId}"]`);
        if (issueCard) {
            issueCard.style.opacity = '0';
            setTimeout(() => issueCard.remove(), 300);
        }
    }

    /**
     * Export proofreading report
     */
    exportReport() {
        if (!this.currentResults) {
            alert('No results to export');
            return;
        }

        const report = {
            timestamp: new Date().toISOString(),
            polishScore: this._calculatePolishScore({
                proofread: this.currentResults,
                tone: this.currentToneResults,
                consistency: this.currentConsistencyResults
            }),
            proofread: this.currentResults,
            tone: this.currentToneResults,
            consistency: this.currentConsistencyResults
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-polish-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Show progress bar
     * @param {number} percent - Progress percentage
     * @private
     */
    _showProgress(percent) {
        let progressBar = document.getElementById('proofread-progress');

        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'proofread-progress';
            progressBar.className = 'proofread-progress';
            progressBar.innerHTML = '<div class="proofread-progress-bar"></div>';
            document.body.appendChild(progressBar);
        }

        const bar = progressBar.querySelector('.proofread-progress-bar');
        bar.style.width = `${percent}%`;
    }

    /**
     * Hide progress bar
     * @private
     */
    _hideProgress() {
        const progressBar = document.getElementById('proofread-progress');
        if (progressBar) {
            progressBar.remove();
        }
    }

    /**
     * Get unique issue ID
     * @param {Object} issue - Issue object
     * @returns {string} - Issue ID
     * @private
     */
    _getIssueId(issue) {
        return `${issue.type}-${issue.text}-${issue.location}`.replace(/[^a-zA-Z0-9-]/g, '');
    }

    /**
     * Escape HTML
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     * @private
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get letter grade from score
     * @param {number} score - Numeric score (0-100)
     * @returns {string} - Letter grade
     * @private
     */
    _getLetterGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
}

// Create global instance
const proofreadUI = new ProofreadUI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProofreadUI, proofreadUI };
}
