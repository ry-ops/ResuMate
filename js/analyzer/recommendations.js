/**
 * ATSFlow - Recommendations Engine
 * Generates prioritized, actionable recommendations based on ATS analysis
 */

class RecommendationsEngine {
    constructor() {
        this.impactLevels = {
            critical: { score: 100, label: 'Critical Impact', color: '#ef4444' },
            high: { score: 75, label: 'High Impact', color: '#f97316' },
            medium: { score: 50, label: 'Medium Impact', color: '#eab308' },
            low: { score: 25, label: 'Low Impact', color: '#3b82f6' }
        };

        this.effortLevels = {
            low: { score: 25, label: 'Quick Fix (< 15 min)', time: 15 },
            medium: { score: 50, label: 'Moderate (15-60 min)', time: 45 },
            high: { score: 75, label: 'Significant (1-2 hours)', time: 90 },
            extensive: { score: 100, label: 'Extensive (2+ hours)', time: 180 }
        };
    }

    /**
     * Generate prioritized recommendations from ATS check results
     * @param {Array} checkResults - Results from all ATS checks
     * @param {Object} scoreResult - Overall score and breakdown
     * @param {Object} options - Generation options
     * @returns {Object} Prioritized recommendations
     */
    generate(checkResults, scoreResult, options = {}) {
        // Extract failed checks
        const failedChecks = checkResults.filter(r => !r.passed);

        // Generate individual recommendations
        const recommendations = this._generateRecommendations(failedChecks);

        // Calculate priority scores
        const prioritized = this._prioritizeRecommendations(recommendations);

        // Categorize by type
        const categorized = this._categorizeRecommendations(prioritized);

        // Generate quick wins
        const quickWins = this._identifyQuickWins(prioritized);

        // Generate major improvements
        const majorImprovements = this._identifyMajorImprovements(prioritized);

        // Calculate estimated time to improve
        const timeEstimate = this._estimateTotalTime(prioritized);

        // Generate industry-specific tips
        const industryTips = this._generateIndustryTips(checkResults, options.industry);

        return {
            summary: {
                totalRecommendations: recommendations.length,
                criticalCount: recommendations.filter(r => r.impact === 'critical').length,
                highCount: recommendations.filter(r => r.impact === 'high').length,
                mediumCount: recommendations.filter(r => r.impact === 'medium').length,
                lowCount: recommendations.filter(r => r.impact === 'low').length,
                estimatedTime: timeEstimate
            },
            quickWins,
            majorImprovements,
            allRecommendations: prioritized,
            categorized,
            industryTips,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Generate recommendations from failed checks
     */
    _generateRecommendations(failedChecks) {
        const recommendations = [];

        failedChecks.forEach(check => {
            if (!check.recommendation) return;

            const rec = {
                id: this._generateId(),
                checkName: check.checkName,
                category: check.category,
                issue: check.message,
                recommendation: check.recommendation,
                impact: check.impact || 'medium',
                severity: check.severity,
                effort: this._estimateEffort(check),
                details: check.details || {},
                score: check.score || 0,
                examples: this._generateExamples(check),
                steps: this._generateSteps(check)
            };

            recommendations.push(rec);
        });

        return recommendations;
    }

    /**
     * Prioritize recommendations using impact vs. effort matrix
     */
    _prioritizeRecommendations(recommendations) {
        return recommendations.map(rec => {
            // Calculate priority score (higher impact, lower effort = higher priority)
            const impactScore = this.impactLevels[rec.impact]?.score || 50;
            const effortScore = this.effortLevels[rec.effort]?.score || 50;

            // Priority = Impact / Effort (normalized to 0-100)
            const priorityScore = (impactScore / effortScore) * 100;

            return {
                ...rec,
                priorityScore: Math.round(priorityScore),
                priorityLabel: this._getPriorityLabel(priorityScore)
            };
        }).sort((a, b) => b.priorityScore - a.priorityScore);
    }

    /**
     * Categorize recommendations
     */
    _categorizeRecommendations(recommendations) {
        const categories = {
            atsCompatibility: [],
            content: [],
            formatting: [],
            keywords: [],
            structure: []
        };

        recommendations.forEach(rec => {
            const category = this._mapToMainCategory(rec.category, rec.checkName);
            if (categories[category]) {
                categories[category].push(rec);
            }
        });

        return categories;
    }

    /**
     * Identify quick wins (high impact, low effort)
     */
    _identifyQuickWins(recommendations) {
        return recommendations
            .filter(rec =>
                (rec.impact === 'critical' || rec.impact === 'high') &&
                (rec.effort === 'low' || rec.effort === 'medium')
            )
            .slice(0, 5)
            .map((rec, idx) => ({
                rank: idx + 1,
                ...rec,
                reason: 'High impact with minimal time investment'
            }));
    }

    /**
     * Identify major improvements (high impact, any effort)
     */
    _identifyMajorImprovements(recommendations) {
        return recommendations
            .filter(rec => rec.impact === 'critical' || rec.impact === 'high')
            .slice(0, 8)
            .map((rec, idx) => ({
                rank: idx + 1,
                ...rec,
                reason: rec.effort === 'high' || rec.effort === 'extensive'
                    ? 'Significant effort required but critical for ATS success'
                    : 'Important improvement that will significantly boost your score'
            }));
    }

    /**
     * Estimate total time to implement all recommendations
     */
    _estimateTotalTime(recommendations) {
        const totalMinutes = recommendations.reduce((sum, rec) => {
            const effort = this.effortLevels[rec.effort];
            return sum + (effort ? effort.time : 30);
        }, 0);

        return {
            minutes: totalMinutes,
            hours: Math.round(totalMinutes / 60 * 10) / 10,
            formatted: this._formatTime(totalMinutes)
        };
    }

    /**
     * Generate industry-specific tips
     */
    _generateIndustryTips(checkResults, industry = 'general') {
        const tips = {
            software: [
                {
                    tip: 'Include specific programming languages and frameworks',
                    reason: 'Tech recruiters search for exact technology names',
                    example: 'Instead of "web development" use "React.js, Node.js, TypeScript"'
                },
                {
                    tip: 'Quantify your code contributions',
                    reason: 'Numbers show impact better than adjectives',
                    example: '"Reduced API response time by 40%" vs "Improved API performance"'
                },
                {
                    tip: 'List both frontend and backend skills separately',
                    reason: 'ATS searches for specific skill categories',
                    example: 'Frontend: React, Vue | Backend: Node.js, Python, PostgreSQL'
                }
            ],
            marketing: [
                {
                    tip: 'Include metrics for every campaign',
                    reason: 'Marketing is results-driven; numbers prove success',
                    example: '"Increased engagement by 45%" or "Generated $2M in revenue"'
                },
                {
                    tip: 'List marketing tools and platforms',
                    reason: 'Employers search for specific tool experience',
                    example: 'Google Analytics, HubSpot, Salesforce, SEMrush'
                },
                {
                    tip: 'Mention channel expertise',
                    reason: 'Specialized channel experience is highly valued',
                    example: 'SEO, SEM, Social Media, Email Marketing, Content Marketing'
                }
            ],
            finance: [
                {
                    tip: 'Include certifications prominently',
                    reason: 'CPA, CFA, etc. are often required keywords',
                    example: 'List in dedicated section: "Certifications: CPA, CFA Level II"'
                },
                {
                    tip: 'Quantify financial impacts',
                    reason: 'Finance roles are measured by dollars and percentages',
                    example: '"Managed $50M portfolio" or "Reduced costs by 15%"'
                },
                {
                    tip: 'Mention regulatory compliance',
                    reason: 'Compliance knowledge is critical and searchable',
                    example: 'SOX, GAAP, SEC reporting, Internal Controls'
                }
            ],
            general: [
                {
                    tip: 'Use industry-standard job titles',
                    reason: 'Recruiters search for specific titles',
                    example: '"Project Manager" not "Project Ninja" or "PM Extraordinaire"'
                },
                {
                    tip: 'Include soft skills with examples',
                    reason: 'ATS searches for soft skills too',
                    example: '"Leadership: Managed cross-functional team of 12"'
                },
                {
                    tip: 'Mirror job description language',
                    reason: 'ATS matches your resume to the job posting',
                    example: 'If JD says "stakeholder management", use that exact phrase'
                }
            ]
        };

        return tips[industry] || tips.general;
    }

    /**
     * Estimate effort level for a check
     */
    _estimateEffort(check) {
        // Map checks to effort levels based on typical fix time
        const effortMapping = {
            // Low effort (< 15 min)
            'noPersonalPronouns': 'low',
            'properNounCapitalization': 'low',
            'noUnicodeBullets': 'low',
            'consistentDates': 'low',
            'noBackgroundColors': 'low',
            'webSafeFonts': 'low',

            // Medium effort (15-60 min)
            'standardSectionHeaders': 'medium',
            'chronologicalOrder': 'medium',
            'properSectionOrdering': 'medium',
            'clearJobTitles': 'medium',
            'dedicatedSkillsSection': 'medium',
            'noExcessiveJargon': 'medium',

            // High effort (1-2 hours)
            'quantifiedAchievements': 'high',
            'actionVerbBullets': 'high',
            'keywordDensity': 'high',
            'industryKeywords': 'high',
            'parseableContactInfo': 'high',

            // Extensive effort (2+ hours)
            'noTables': 'extensive',
            'noMultiColumn': 'extensive',
            'appropriateLength': 'extensive',
            'noTyposOrGrammar': 'high'
        };

        return effortMapping[check.checkName] || 'medium';
    }

    /**
     * Generate examples for a recommendation
     */
    _generateExamples(check) {
        const examples = {
            'quantifiedAchievements': [
                { before: 'Managed sales team', after: 'Managed team of 8 sales reps, increasing quarterly revenue by 35%' },
                { before: 'Improved customer satisfaction', after: 'Improved customer satisfaction scores from 3.2 to 4.7/5.0 (47% increase)' }
            ],
            'actionVerbBullets': [
                { before: 'Responsible for project delivery', after: 'Delivered 12 projects on-time and under budget, averaging 95% client satisfaction' },
                { before: 'Was involved in system design', after: 'Designed scalable microservices architecture supporting 1M+ daily users' }
            ],
            'noPersonalPronouns': [
                { before: 'I led a team of developers', after: 'Led cross-functional team of 10 developers' },
                { before: 'My responsibilities included...', after: 'Key responsibilities included...' }
            ],
            'standardSectionHeaders': [
                { before: 'My Journey', after: 'Professional Experience' },
                { before: 'What I Bring to the Table', after: 'Core Competencies' }
            ],
            'keywordDensity': [
                { before: 'Good at programming', after: 'Proficient in JavaScript, Python, React, Node.js, and SQL' },
                { before: 'Marketing experience', after: 'Digital Marketing: SEO, SEM, Google Analytics, Content Strategy' }
            ]
        };

        return examples[check.checkName] || [];
    }

    /**
     * Generate step-by-step instructions
     */
    _generateSteps(check) {
        const steps = {
            'noTables': [
                '1. Identify all table-based layouts in your resume',
                '2. Convert each table to simple text sections',
                '3. Use headings and bullet points instead of cells',
                '4. Verify content flows naturally top-to-bottom'
            ],
            'quantifiedAchievements': [
                '1. Review each bullet point in your experience section',
                '2. Ask: What was the measurable result of this work?',
                '3. Add numbers, percentages, dollar amounts where applicable',
                '4. Use formulas: X% increase, $Y saved, Z people managed',
                '5. Verify all metrics are accurate and verifiable'
            ],
            'dedicatedSkillsSection': [
                '1. Create a new "Skills" or "Technical Skills" section',
                '2. List 8-15 relevant skills for your target role',
                '3. Organize by category (Technical, Tools, Languages, etc.)',
                '4. Use exact keyword matches from job descriptions',
                '5. Place section after Summary or after Experience'
            ],
            'actionVerbBullets': [
                '1. Review all bullet points in experience section',
                '2. Identify bullets that don\'t start with action verbs',
                '3. Replace weak starts ("Responsible for") with strong verbs',
                '4. Use past tense for previous roles, present for current',
                '5. Vary your verb choices for better readability'
            ],
            'standardSectionHeaders': [
                '1. List all current section headers',
                '2. Compare to standard ATS-friendly headers',
                '3. Replace creative headers with standard ones',
                '4. Common standards: Summary, Experience, Education, Skills',
                '5. Test: Would a recruiter instantly recognize this section?'
            ]
        };

        return steps[check.checkName] || [
            '1. Review the specific issue identified',
            '2. Refer to the recommendation provided',
            '3. Make the suggested changes',
            '4. Verify the improvement'
        ];
    }

    /**
     * Get priority label from score
     */
    _getPriorityLabel(score) {
        if (score >= 150) return 'Urgent';
        if (score >= 100) return 'High Priority';
        if (score >= 50) return 'Medium Priority';
        return 'Low Priority';
    }

    /**
     * Map check category to main recommendation category
     */
    _mapToMainCategory(category, checkName) {
        if (category === 'formatting') return 'formatting';
        if (category === 'structure') return 'structure';
        if (category === 'content') {
            if (checkName.includes('keyword') || checkName.includes('skills')) {
                return 'keywords';
            }
            return 'content';
        }
        return 'atsCompatibility';
    }

    /**
     * Format time in human-readable form
     */
    _formatTime(minutes) {
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours}h ${mins}m`;
    }

    /**
     * Generate unique ID
     */
    _generateId() {
        return 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate impact vs. effort matrix visualization data
     */
    generateMatrix(recommendations) {
        const matrix = {
            highImpactLowEffort: [],   // Quick wins
            highImpactHighEffort: [],  // Major projects
            lowImpactLowEffort: [],    // Fill-ins
            lowImpactHighEffort: []    // Avoid
        };

        recommendations.forEach(rec => {
            const isHighImpact = rec.impact === 'critical' || rec.impact === 'high';
            const isLowEffort = rec.effort === 'low' || rec.effort === 'medium';

            if (isHighImpact && isLowEffort) {
                matrix.highImpactLowEffort.push(rec);
            } else if (isHighImpact && !isLowEffort) {
                matrix.highImpactHighEffort.push(rec);
            } else if (!isHighImpact && isLowEffort) {
                matrix.lowImpactLowEffort.push(rec);
            } else {
                matrix.lowImpactHighEffort.push(rec);
            }
        });

        return matrix;
    }

    /**
     * Export recommendations as action plan
     */
    exportActionPlan(recommendations, format = 'markdown') {
        if (format === 'markdown') {
            return this._exportMarkdown(recommendations);
        } else if (format === 'checklist') {
            return this._exportChecklist(recommendations);
        }
        return this._exportJSON(recommendations);
    }

    _exportMarkdown(recs) {
        let md = '# Resume Improvement Action Plan\n\n';
        md += `Generated: ${new Date().toLocaleDateString()}\n\n`;

        if (recs.quickWins.length > 0) {
            md += '## Quick Wins (Start Here!)\n\n';
            recs.quickWins.forEach((rec, idx) => {
                md += `### ${idx + 1}. ${rec.issue}\n`;
                md += `**Impact:** ${rec.impact} | **Effort:** ${rec.effort}\n\n`;
                md += `**Action:** ${rec.recommendation}\n\n`;
                if (rec.steps.length > 0) {
                    md += '**Steps:**\n';
                    rec.steps.forEach(step => md += `${step}\n`);
                    md += '\n';
                }
            });
        }

        if (recs.majorImprovements.length > 0) {
            md += '## Major Improvements\n\n';
            recs.majorImprovements.forEach((rec, idx) => {
                md += `### ${idx + 1}. ${rec.issue}\n`;
                md += `**Impact:** ${rec.impact} | **Effort:** ${rec.effort}\n\n`;
                md += `**Action:** ${rec.recommendation}\n\n`;
            });
        }

        return md;
    }

    _exportChecklist(recs) {
        let checklist = 'Resume Improvement Checklist\n';
        checklist += '═'.repeat(50) + '\n\n';

        const all = recs.allRecommendations.slice(0, 20);
        all.forEach((rec, idx) => {
            checklist += `☐ ${idx + 1}. [${rec.impact.toUpperCase()}] ${rec.issue}\n`;
            checklist += `   ${rec.recommendation}\n\n`;
        });

        return checklist;
    }

    _exportJSON(recs) {
        return JSON.stringify(recs, null, 2);
    }
}

// Create singleton instance
const recommendationsEngine = new RecommendationsEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = recommendationsEngine;
}
