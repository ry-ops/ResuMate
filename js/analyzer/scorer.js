/**
 * ResuMate - Advanced 5-Category Weighted Scorer
 * Comprehensive scoring system with letter grades and historical tracking
 */

class ATSScorer {
    constructor() {
        // 5-category weighted scoring system
        this.categories = {
            atsCompatibility: {
                weight: 25,
                factors: ['formatting', 'structure', 'parseability'],
                description: 'How easily ATS systems can parse your resume'
            },
            keywordMatch: {
                weight: 25,
                factors: ['hard-skills', 'soft-skills', 'tools', 'certifications'],
                description: 'Relevance of keywords to target roles'
            },
            contentQuality: {
                weight: 20,
                factors: ['action-verbs', 'quantification', 'specificity', 'relevance'],
                description: 'Quality and effectiveness of content'
            },
            formatting: {
                weight: 15,
                factors: ['consistency', 'readability', 'length', 'whitespace'],
                description: 'Visual appeal and professional presentation'
            },
            completeness: {
                weight: 15,
                factors: ['sections-present', 'contact-info', 'dates', 'details'],
                description: 'Thoroughness and completeness of information'
            }
        };

        this.gradeScale = [
            { grade: 'A+', min: 97, max: 100, description: 'Exceptional - Top 1%' },
            { grade: 'A',  min: 93, max: 96,  description: 'Excellent - Highly competitive' },
            { grade: 'A-', min: 90, max: 92,  description: 'Very Good - Strong candidate' },
            { grade: 'B+', min: 87, max: 89,  description: 'Good - Above average' },
            { grade: 'B',  min: 83, max: 86,  description: 'Good - Competitive' },
            { grade: 'B-', min: 80, max: 82,  description: 'Acceptable - Some improvements needed' },
            { grade: 'C+', min: 77, max: 79,  description: 'Fair - Several improvements needed' },
            { grade: 'C',  min: 73, max: 76,  description: 'Fair - Significant work needed' },
            { grade: 'C-', min: 70, max: 72,  description: 'Below Average - Major revisions needed' },
            { grade: 'D',  min: 60, max: 69,  description: 'Poor - Extensive revisions required' },
            { grade: 'F',  min: 0,  max: 59,  description: 'Fail - Complete rewrite recommended' }
        ];
    }

    /**
     * Calculate comprehensive score from all check results
     * @param {Object} checkResults - Results from all 30+ checks
     * @param {Object} options - Scoring options
     * @returns {Object} Complete scoring analysis
     */
    calculateScore(checkResults, options = {}) {
        // Organize results by category
        const categorizedResults = this._categorizeResults(checkResults);

        // Calculate category scores
        const categoryScores = this._calculateCategoryScores(categorizedResults);

        // Calculate weighted overall score
        const overallScore = this._calculateWeightedScore(categoryScores);

        // Assign letter grade
        const grade = this._assignGrade(overallScore);

        // Calculate percentile
        const percentile = this._calculatePercentile(overallScore);

        // Generate score breakdown
        const breakdown = this._generateBreakdown(categoryScores, checkResults);

        // Identify strengths and weaknesses
        const analysis = this._analyzeScores(categoryScores, categorizedResults);

        return {
            overallScore: Math.round(overallScore),
            grade: grade.grade,
            gradeDescription: grade.description,
            percentile,
            categoryScores,
            breakdown,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            timestamp: new Date().toISOString(),
            totalChecks: checkResults.length,
            passedChecks: checkResults.filter(r => r.passed).length,
            failedChecks: checkResults.filter(r => !r.passed).length
        };
    }

    /**
     * Categorize check results into 5 main categories
     */
    _categorizeResults(checkResults) {
        const categorized = {
            atsCompatibility: [],
            keywordMatch: [],
            contentQuality: [],
            formatting: [],
            completeness: []
        };

        checkResults.forEach(result => {
            const mapping = this._mapCheckToCategory(result.checkName, result.category);
            if (categorized[mapping]) {
                categorized[mapping].push(result);
            }
        });

        return categorized;
    }

    /**
     * Map individual checks to scoring categories
     */
    _mapCheckToCategory(checkName, originalCategory) {
        // Mapping of checks to scoring categories
        const mapping = {
            // ATS Compatibility
            'noTables': 'atsCompatibility',
            'noMultiColumn': 'atsCompatibility',
            'noHeadersFooters': 'atsCompatibility',
            'noImages': 'atsCompatibility',
            'noTextBoxes': 'atsCompatibility',
            'supportedFileFormat': 'atsCompatibility',
            'parseableContactInfo': 'atsCompatibility',
            'standardSectionHeaders': 'atsCompatibility',
            'clearSectionBoundaries': 'atsCompatibility',
            'noComplexTables': 'atsCompatibility',

            // Keyword Match
            'keywordDensity': 'keywordMatch',
            'dedicatedSkillsSection': 'keywordMatch',
            'industryKeywords': 'keywordMatch',
            'acronymsSpelledOut': 'keywordMatch',
            'clearJobTitles': 'keywordMatch',

            // Content Quality
            'quantifiedAchievements': 'contentQuality',
            'actionVerbBullets': 'contentQuality',
            'noPersonalPronouns': 'contentQuality',
            'noTyposOrGrammar': 'contentQuality',
            'noExcessiveJargon': 'contentQuality',

            // Formatting
            'webSafeFonts': 'formatting',
            'noUnicodeBullets': 'formatting',
            'consistentDates': 'formatting',
            'noBackgroundColors': 'formatting',
            'consistentHeadingHierarchy': 'formatting',
            'properSectionOrdering': 'formatting',

            // Completeness
            'chronologicalOrder': 'completeness',
            'noOrphanedContent': 'completeness',
            'appropriateLength': 'completeness',
            'properNounCapitalization': 'completeness'
        };

        return mapping[checkName] || 'atsCompatibility';
    }

    /**
     * Calculate scores for each category
     */
    _calculateCategoryScores(categorizedResults) {
        const scores = {};

        Object.keys(this.categories).forEach(category => {
            const results = categorizedResults[category] || [];

            if (results.length === 0) {
                scores[category] = {
                    score: 100,
                    weight: this.categories[category].weight,
                    weightedScore: 100 * (this.categories[category].weight / 100),
                    checksCount: 0,
                    passedCount: 0,
                    failedCount: 0
                };
                return;
            }

            // Calculate average score for category
            const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
            const avgScore = totalScore / results.length;

            const passedCount = results.filter(r => r.passed).length;
            const failedCount = results.length - passedCount;

            scores[category] = {
                score: Math.round(avgScore),
                weight: this.categories[category].weight,
                weightedScore: avgScore * (this.categories[category].weight / 100),
                checksCount: results.length,
                passedCount,
                failedCount,
                description: this.categories[category].description
            };
        });

        return scores;
    }

    /**
     * Calculate weighted overall score
     */
    _calculateWeightedScore(categoryScores) {
        let totalWeightedScore = 0;

        Object.values(categoryScores).forEach(category => {
            totalWeightedScore += category.weightedScore;
        });

        return totalWeightedScore;
    }

    /**
     * Assign letter grade based on score
     */
    _assignGrade(score) {
        for (const gradeInfo of this.gradeScale) {
            if (score >= gradeInfo.min && score <= gradeInfo.max) {
                return gradeInfo;
            }
        }
        return this.gradeScale[this.gradeScale.length - 1]; // F
    }

    /**
     * Calculate percentile (estimated based on score)
     */
    _calculatePercentile(score) {
        // Rough percentile mapping
        if (score >= 95) return 99;
        if (score >= 90) return 95;
        if (score >= 85) return 90;
        if (score >= 80) return 80;
        if (score >= 75) return 70;
        if (score >= 70) return 60;
        if (score >= 65) return 50;
        if (score >= 60) return 40;
        return Math.max(1, Math.round(score / 2));
    }

    /**
     * Generate detailed score breakdown
     */
    _generateBreakdown(categoryScores, allResults) {
        const breakdown = {
            categories: [],
            criticalIssues: [],
            highPriorityIssues: [],
            mediumPriorityIssues: [],
            lowPriorityIssues: []
        };

        // Add category breakdowns
        Object.entries(categoryScores).forEach(([category, data]) => {
            breakdown.categories.push({
                name: category,
                displayName: this._formatCategoryName(category),
                score: data.score,
                weight: data.weight,
                weightedScore: Math.round(data.weightedScore),
                checksCount: data.checksCount,
                passedCount: data.passedCount,
                failedCount: data.failedCount,
                description: data.description,
                status: this._getCategoryStatus(data.score)
            });
        });

        // Categorize issues by severity
        allResults.forEach(result => {
            if (!result.passed) {
                const issue = {
                    check: result.checkName,
                    category: result.category,
                    message: result.message,
                    recommendation: result.recommendation,
                    impact: result.impact
                };

                switch (result.severity) {
                    case 'critical':
                        breakdown.criticalIssues.push(issue);
                        break;
                    case 'high':
                        breakdown.highPriorityIssues.push(issue);
                        break;
                    case 'medium':
                        breakdown.mediumPriorityIssues.push(issue);
                        break;
                    case 'low':
                        breakdown.lowPriorityIssues.push(issue);
                        break;
                }
            }
        });

        return breakdown;
    }

    /**
     * Analyze scores to identify strengths and weaknesses
     */
    _analyzeScores(categoryScores, categorizedResults) {
        const strengths = [];
        const weaknesses = [];

        Object.entries(categoryScores).forEach(([category, data]) => {
            const displayName = this._formatCategoryName(category);

            if (data.score >= 90) {
                strengths.push({
                    category: displayName,
                    score: data.score,
                    message: `Excellent ${displayName.toLowerCase()} (${data.score}/100)`
                });
            } else if (data.score < 70) {
                weaknesses.push({
                    category: displayName,
                    score: data.score,
                    message: `${displayName} needs improvement (${data.score}/100)`,
                    failedChecks: data.failedCount
                });
            }
        });

        // Sort by score
        strengths.sort((a, b) => b.score - a.score);
        weaknesses.sort((a, b) => a.score - b.score);

        return { strengths, weaknesses };
    }

    /**
     * Get category status based on score
     */
    _getCategoryStatus(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        if (score >= 60) return 'poor';
        return 'critical';
    }

    /**
     * Format category name for display
     */
    _formatCategoryName(category) {
        const mapping = {
            'atsCompatibility': 'ATS Compatibility',
            'keywordMatch': 'Keyword Optimization',
            'contentQuality': 'Content Quality',
            'formatting': 'Formatting & Style',
            'completeness': 'Completeness'
        };
        return mapping[category] || category;
    }

    /**
     * Compare two scores to show improvement
     */
    compareScores(currentScore, previousScore) {
        const change = currentScore.overallScore - previousScore.overallScore;
        const percentChange = ((change / previousScore.overallScore) * 100).toFixed(1);

        const categoryChanges = {};
        Object.keys(currentScore.categoryScores).forEach(category => {
            const current = currentScore.categoryScores[category].score;
            const previous = previousScore.categoryScores[category]?.score || 0;
            categoryChanges[category] = {
                current,
                previous,
                change: current - previous
            };
        });

        return {
            overallChange: change,
            percentChange: percentChange + '%',
            improved: change > 0,
            gradeChange: {
                from: previousScore.grade,
                to: currentScore.grade
            },
            categoryChanges,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get historical score trend
     */
    getScoreTrend(scoreHistory) {
        if (!scoreHistory || scoreHistory.length < 2) {
            return {
                trend: 'insufficient-data',
                message: 'Need at least 2 scores to show trend'
            };
        }

        const scores = scoreHistory.map(h => h.overallScore);
        const recent = scores.slice(-5); // Last 5 scores

        const avgChange = recent.reduce((sum, score, idx) => {
            if (idx === 0) return 0;
            return sum + (score - recent[idx - 1]);
        }, 0) / (recent.length - 1);

        let trend = 'stable';
        if (avgChange > 2) trend = 'improving';
        if (avgChange < -2) trend = 'declining';

        return {
            trend,
            averageChange: avgChange.toFixed(1),
            currentScore: scores[scores.length - 1],
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            totalScans: scores.length,
            recentScores: recent
        };
    }

    /**
     * Generate improvement roadmap
     */
    generateRoadmap(scoreResult) {
        const roadmap = {
            quickWins: [],
            shortTerm: [],
            longTerm: []
        };

        // Quick wins: Critical and high priority issues
        scoreResult.breakdown.criticalIssues.forEach(issue => {
            roadmap.quickWins.push({
                priority: 'critical',
                action: issue.recommendation,
                impact: 'high',
                effort: 'low',
                category: issue.category
            });
        });

        scoreResult.breakdown.highPriorityIssues.forEach(issue => {
            roadmap.quickWins.push({
                priority: 'high',
                action: issue.recommendation,
                impact: 'high',
                effort: 'medium',
                category: issue.category
            });
        });

        // Short term: Medium priority issues
        scoreResult.breakdown.mediumPriorityIssues.forEach(issue => {
            roadmap.shortTerm.push({
                priority: 'medium',
                action: issue.recommendation,
                impact: 'medium',
                effort: 'medium',
                category: issue.category
            });
        });

        // Long term: Low priority but valuable improvements
        scoreResult.breakdown.lowPriorityIssues.forEach(issue => {
            roadmap.longTerm.push({
                priority: 'low',
                action: issue.recommendation,
                impact: 'low',
                effort: 'low',
                category: issue.category
            });
        });

        // Limit each category
        roadmap.quickWins = roadmap.quickWins.slice(0, 5);
        roadmap.shortTerm = roadmap.shortTerm.slice(0, 5);
        roadmap.longTerm = roadmap.longTerm.slice(0, 5);

        return roadmap;
    }

    /**
     * Save score to history
     */
    saveToHistory(scoreResult) {
        try {
            const history = this.getHistory();
            const entry = {
                id: Date.now().toString(),
                timestamp: scoreResult.timestamp,
                overallScore: scoreResult.overallScore,
                grade: scoreResult.grade,
                categoryScores: scoreResult.categoryScores,
                totalChecks: scoreResult.totalChecks,
                passedChecks: scoreResult.passedChecks,
                failedChecks: scoreResult.failedChecks
            };

            history.push(entry);

            // Keep only last 50 entries
            const trimmedHistory = history.slice(-50);

            localStorage.setItem('resumate_score_history', JSON.stringify(trimmedHistory));
            return true;
        } catch (error) {
            console.error('Failed to save score to history:', error);
            return false;
        }
    }

    /**
     * Get score history
     */
    getHistory() {
        try {
            const history = localStorage.getItem('resumate_score_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load score history:', error);
            return [];
        }
    }

    /**
     * Clear score history
     */
    clearHistory() {
        try {
            localStorage.removeItem('resumate_score_history');
            return true;
        } catch (error) {
            console.error('Failed to clear score history:', error);
            return false;
        }
    }

    /**
     * Get statistics from history
     */
    getStatistics() {
        const history = this.getHistory();

        if (history.length === 0) {
            return {
                totalScans: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                mostCommonGrade: 'N/A'
            };
        }

        const scores = history.map(h => h.overallScore);
        const grades = history.map(h => h.grade);

        // Calculate mode (most common grade)
        const gradeFrequency = {};
        grades.forEach(grade => {
            gradeFrequency[grade] = (gradeFrequency[grade] || 0) + 1;
        });
        const mostCommonGrade = Object.entries(gradeFrequency)
            .sort((a, b) => b[1] - a[1])[0][0];

        return {
            totalScans: history.length,
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            mostCommonGrade,
            firstScan: history[0].timestamp,
            lastScan: history[history.length - 1].timestamp
        };
    }
}

// Create singleton instance
const atsScorer = new ATSScorer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = atsScorer;
}
