/**
 * ResuMate - Enhanced ATS Scanner v2
 * Comprehensive ATS analysis with 30+ checks, advanced scoring, and recommendations
 */

// Import check modules (assuming they're loaded in the HTML)
// const FormattingChecks = require('./checks/formatting');
// const StructureChecks = require('./checks/structure');
// const ContentChecks = require('./checks/content');
// const atsScorer = require('./scorer');
// const recommendationsEngine = require('./recommendations');

class ATSScanner {
    constructor() {
        this.version = '2.0.0';
        this.totalChecks = 30;

        // Initialize check modules
        this.formattingChecks = typeof FormattingChecks !== 'undefined'
            ? new FormattingChecks()
            : null;
        this.structureChecks = typeof StructureChecks !== 'undefined'
            ? new StructureChecks()
            : null;
        this.contentChecks = typeof ContentChecks !== 'undefined'
            ? new ContentChecks()
            : null;

        // Track scan history
        this.scanHistory = [];
    }

    /**
     * Run comprehensive ATS scan
     * @param {Object} resumeData - Resume data to analyze
     * @param {Object} options - Scan options
     * @returns {Object} Complete analysis results
     */
    async scan(resumeData, options = {}) {
        const startTime = Date.now();

        console.log('🔍 Starting ATS Scanner v2 - Comprehensive Analysis...');

        try {
            // Validate input
            if (!resumeData) {
                throw new Error('Resume data is required');
            }

            // Run all check categories
            const checkResults = await this._runAllChecks(resumeData, options);

            console.log(`✅ Completed ${checkResults.length} checks`);

            // Calculate scores
            const scoreResult = this._calculateScores(checkResults, options);

            console.log(`📊 Overall Score: ${scoreResult.overallScore}/100 (${scoreResult.grade})`);

            // Generate recommendations
            const recommendations = this._generateRecommendations(checkResults, scoreResult, options);

            console.log(`💡 Generated ${recommendations.summary.totalRecommendations} recommendations`);

            // Compile final results
            const analysisResult = {
                version: this.version,
                timestamp: new Date().toISOString(),
                executionTime: Date.now() - startTime,

                // Scores
                score: scoreResult,

                // All check results
                checks: {
                    total: checkResults.length,
                    passed: checkResults.filter(r => r.passed).length,
                    failed: checkResults.filter(r => !r.passed).length,
                    results: checkResults
                },

                // Categorized summaries
                summaries: {
                    formatting: this.formattingChecks ? this.formattingChecks.getSummary(
                        checkResults.filter(r => r.category === 'formatting')
                    ) : null,
                    structure: this.structureChecks ? this.structureChecks.getSummary(
                        checkResults.filter(r => r.category === 'structure')
                    ) : null,
                    content: this.contentChecks ? this.contentChecks.getSummary(
                        checkResults.filter(r => r.category === 'content')
                    ) : null
                },

                // Recommendations
                recommendations,

                // Metadata
                metadata: {
                    resumeWordCount: this._countWords(resumeData),
                    resumeSections: resumeData.sections ? resumeData.sections.length : 0,
                    fileFormat: options.fileFormat || 'unknown',
                    targetIndustry: options.industry || 'general'
                }
            };

            // Save to history
            this._saveToHistory(analysisResult);

            // Save score to history (using scorer)
            if (typeof atsScorer !== 'undefined') {
                atsScorer.saveToHistory(scoreResult);
            }

            console.log(`✨ Analysis complete in ${analysisResult.executionTime}ms`);

            return analysisResult;

        } catch (error) {
            console.error('❌ ATS Scanner error:', error);
            return {
                error: true,
                message: error.message,
                timestamp: new Date().toISOString(),
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * Run all 30+ checks across all categories
     */
    async _runAllChecks(resumeData, options) {
        const allResults = [];

        // Run formatting checks (10 checks)
        if (this.formattingChecks) {
            console.log('Running formatting checks...');
            const formattingResults = this.formattingChecks.runAll(resumeData, options);
            allResults.push(...formattingResults);
        }

        // Run structure checks (10 checks)
        if (this.structureChecks) {
            console.log('Running structure checks...');
            const structureResults = this.structureChecks.runAll(resumeData, options);
            allResults.push(...structureResults);
        }

        // Run content checks (10 checks)
        if (this.contentChecks) {
            console.log('Running content checks...');
            const contentResults = this.contentChecks.runAll(resumeData, options);
            allResults.push(...contentResults);
        }

        return allResults;
    }

    /**
     * Calculate comprehensive scores
     */
    _calculateScores(checkResults, options) {
        if (typeof atsScorer !== 'undefined') {
            return atsScorer.calculateScore(checkResults, options);
        }

        // Fallback basic scoring if scorer not loaded
        const passed = checkResults.filter(r => r.passed).length;
        const total = checkResults.length;
        const score = Math.round((passed / total) * 100);

        return {
            overallScore: score,
            grade: this._simpleGrade(score),
            gradeDescription: 'Basic score calculation',
            categoryScores: {},
            breakdown: {},
            strengths: [],
            weaknesses: []
        };
    }

    /**
     * Generate recommendations
     */
    _generateRecommendations(checkResults, scoreResult, options) {
        if (typeof recommendationsEngine !== 'undefined') {
            return recommendationsEngine.generate(checkResults, scoreResult, options);
        }

        // Fallback simple recommendations
        const failed = checkResults.filter(r => !r.passed);
        return {
            summary: {
                totalRecommendations: failed.length,
                criticalCount: 0,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0
            },
            quickWins: [],
            majorImprovements: [],
            allRecommendations: failed.map(r => ({
                issue: r.message,
                recommendation: r.recommendation
            }))
        };
    }

    /**
     * Quick scan (run subset of critical checks only)
     */
    async quickScan(resumeData, options = {}) {
        console.log('⚡ Running Quick Scan (critical checks only)...');

        const criticalChecks = [
            'noTables',
            'noMultiColumn',
            'parseableContactInfo',
            'standardSectionHeaders',
            'dedicatedSkillsSection',
            'quantifiedAchievements',
            'noTyposOrGrammar',
            'supportedFileFormat'
        ];

        // Run only critical checks
        const checkResults = await this._runAllChecks(resumeData, options);
        const criticalResults = checkResults.filter(r =>
            criticalChecks.includes(r.checkName)
        );

        const passed = criticalResults.filter(r => r.passed).length;
        const score = Math.round((passed / criticalResults.length) * 100);

        return {
            type: 'quick-scan',
            score,
            grade: this._simpleGrade(score),
            checksRun: criticalResults.length,
            passed,
            failed: criticalResults.length - passed,
            results: criticalResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Compare two resumes
     */
    async compareResumes(resume1, resume2, options = {}) {
        console.log('📊 Comparing two resumes...');

        const [result1, result2] = await Promise.all([
            this.scan(resume1, { ...options, label: 'Resume A' }),
            this.scan(resume2, { ...options, label: 'Resume B' })
        ]);

        return {
            resumeA: {
                score: result1.score.overallScore,
                grade: result1.score.grade,
                passed: result1.checks.passed
            },
            resumeB: {
                score: result2.score.overallScore,
                grade: result2.score.grade,
                passed: result2.checks.passed
            },
            difference: {
                score: result2.score.overallScore - result1.score.overallScore,
                passed: result2.checks.passed - result1.checks.passed,
                better: result2.score.overallScore > result1.score.overallScore ? 'Resume B' : 'Resume A'
            },
            details: {
                resumeA: result1,
                resumeB: result2
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get improvement suggestions for specific score target
     */
    getPathToScore(currentResult, targetScore) {
        if (currentResult.score.overallScore >= targetScore) {
            return {
                achieved: true,
                message: `You've already reached ${targetScore}! Current score: ${currentResult.score.overallScore}`
            };
        }

        const gap = targetScore - currentResult.score.overallScore;
        const recommendations = currentResult.recommendations.allRecommendations;

        // Calculate how many recommendations need to be addressed
        const needed = [];
        let estimatedGain = 0;

        for (const rec of recommendations) {
            if (estimatedGain >= gap) break;

            needed.push(rec);
            // Estimate each fix adds 2-5 points depending on impact
            const gain = rec.impact === 'critical' ? 5 :
                         rec.impact === 'high' ? 4 :
                         rec.impact === 'medium' ? 3 : 2;
            estimatedGain += gain;
        }

        return {
            achieved: false,
            currentScore: currentResult.score.overallScore,
            targetScore,
            gap,
            recommendationsNeeded: needed.length,
            estimatedGain,
            recommendations: needed,
            message: `To reach ${targetScore}, focus on these ${needed.length} improvements`
        };
    }

    /**
     * Export results in various formats
     */
    exportResults(results, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(results, null, 2);

            case 'summary':
                return this._exportSummary(results);

            case 'csv':
                return this._exportCSV(results);

            case 'html':
                return this._exportHTML(results);

            default:
                return JSON.stringify(results);
        }
    }

    _exportSummary(results) {
        let summary = '='.repeat(60) + '\n';
        summary += 'RESUMATE ATS SCANNER - ANALYSIS SUMMARY\n';
        summary += '='.repeat(60) + '\n\n';

        summary += `Overall Score: ${results.score.overallScore}/100 (${results.score.grade})\n`;
        summary += `Checks Passed: ${results.checks.passed}/${results.checks.total}\n`;
        summary += `Analysis Date: ${new Date(results.timestamp).toLocaleDateString()}\n\n`;

        summary += 'CATEGORY BREAKDOWN:\n';
        summary += '-'.repeat(60) + '\n';
        results.score.breakdown.categories.forEach(cat => {
            summary += `${cat.displayName}: ${cat.score}/100 (${cat.status})\n`;
        });

        summary += '\n' + 'TOP RECOMMENDATIONS:\n';
        summary += '-'.repeat(60) + '\n';
        results.recommendations.quickWins.slice(0, 5).forEach((rec, idx) => {
            summary += `${idx + 1}. ${rec.issue}\n`;
            summary += `   → ${rec.recommendation}\n\n`;
        });

        return summary;
    }

    _exportCSV(results) {
        let csv = 'Check Name,Category,Status,Score,Severity,Message\n';

        results.checks.results.forEach(check => {
            csv += `"${check.checkName}",`;
            csv += `"${check.category}",`;
            csv += `"${check.passed ? 'PASS' : 'FAIL'}",`;
            csv += `${check.score},`;
            csv += `"${check.severity}",`;
            csv += `"${check.message.replace(/"/g, '""')}"\n`;
        });

        return csv;
    }

    _exportHTML(results) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>ATS Analysis Results</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .score { font-size: 72px; font-weight: bold; color: #2563eb; }
        .grade { font-size: 48px; color: #64748b; }
        .category { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
        .check { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #e2e8f0; }
        .check.passed { border-color: #10b981; }
        .check.failed { border-color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ATS Analysis Results</h1>
        <div class="score">${results.score.overallScore}</div>
        <div class="grade">Grade: ${results.score.grade}</div>
        <p>${results.score.gradeDescription}</p>
    </div>

    <h2>Check Results</h2>
    ${results.checks.results.map(check => `
        <div class="check ${check.passed ? 'passed' : 'failed'}">
            <strong>${check.checkName}</strong> - ${check.passed ? '✅ PASS' : '❌ FAIL'}
            <br>${check.message}
        </div>
    `).join('')}
</body>
</html>
        `;
    }

    /**
     * Save scan to history
     */
    _saveToHistory(results) {
        try {
            const history = this.getHistory();

            const entry = {
                id: Date.now().toString(),
                timestamp: results.timestamp,
                score: results.score.overallScore,
                grade: results.score.grade,
                passed: results.checks.passed,
                total: results.checks.total
            };

            history.push(entry);

            // Keep last 20 scans
            const trimmed = history.slice(-20);

            localStorage.setItem('resumate_scan_history', JSON.stringify(trimmed));
        } catch (error) {
            console.error('Failed to save scan history:', error);
        }
    }

    /**
     * Get scan history
     */
    getHistory() {
        try {
            const history = localStorage.getItem('resumate_scan_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load scan history:', error);
            return [];
        }
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const history = this.getHistory();

        if (history.length === 0) {
            return {
                totalScans: 0,
                averageScore: 0,
                improvement: 0
            };
        }

        const scores = history.map(h => h.score);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

        // Calculate improvement (compare first vs last)
        const improvement = history.length > 1
            ? history[history.length - 1].score - history[0].score
            : 0;

        return {
            totalScans: history.length,
            averageScore: avgScore,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            improvement,
            recentScores: scores.slice(-5)
        };
    }

    /**
     * Helper: Count words in resume
     */
    _countWords(resumeData) {
        const text = JSON.stringify(resumeData);
        return text.split(/\s+/).length;
    }

    /**
     * Helper: Simple grade assignment
     */
    _simpleGrade(score) {
        if (score >= 97) return 'A+';
        if (score >= 93) return 'A';
        if (score >= 90) return 'A-';
        if (score >= 87) return 'B+';
        if (score >= 83) return 'B';
        if (score >= 80) return 'B-';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Get scanner info
     */
    getInfo() {
        return {
            version: this.version,
            totalChecks: this.totalChecks,
            categories: ['formatting', 'structure', 'content'],
            features: [
                '30+ comprehensive ATS checks',
                '5-category weighted scoring',
                'Letter grade assignment (A-F)',
                'Prioritized recommendations',
                'Historical tracking',
                'Quick scan mode',
                'Resume comparison',
                'Multiple export formats'
            ]
        };
    }
}

// Create singleton instance
const atsScanner = new ATSScanner();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = atsScanner;
}

// Log initialization
console.log('✨ ATS Scanner v2 initialized');
console.log(`📋 ${atsScanner.totalChecks} checks available`);
