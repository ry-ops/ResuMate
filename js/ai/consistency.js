// Consistency Checker
// Checks for tense, date format, formatting, and punctuation consistency

/**
 * Consistency Checker Class
 * Ensures consistent tense, dates, formatting, and punctuation throughout resume
 */
class ConsistencyChecker {
    constructor() {
        // Date format patterns
        this.datePatterns = [
            { name: 'MM/YYYY', regex: /\b(0[1-9]|1[0-2])\/\d{4}\b/g, example: '01/2023' },
            { name: 'YYYY-MM', regex: /\b\d{4}-(0[1-9]|1[0-2])\b/g, example: '2023-01' },
            { name: 'Month YYYY', regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi, example: 'January 2023' },
            { name: 'Mon YYYY', regex: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}\b/gi, example: 'Jan 2023' },
            { name: 'MM/DD/YYYY', regex: /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\b/g, example: '01/15/2023' }
        ];

        // Bullet point styles
        this.bulletStyles = [
            { name: 'dash', regex: /^[\s]*-[\s]+/gm },
            { name: 'asterisk', regex: /^[\s]*\*[\s]+/gm },
            { name: 'bullet', regex: /^[\s]*•[\s]+/gm },
            { name: 'number', regex: /^[\s]*\d+\.[\s]+/gm }
        ];

        // Punctuation patterns
        this.punctuationPatterns = {
            period: /[.!?]$/,
            noPunctuation: /[^.!?]$/,
            spacing: /\s{2,}/g,
            doubleSpaceAfterPeriod: /\.\s{2}/g,
            singleSpaceAfterPeriod: /\.\s{1}[A-Z]/g
        };
    }

    /**
     * Check consistency across all dimensions
     * @param {string} content - Content to check
     * @param {Object} options - Checking options
     * @returns {Promise<Object>} - Consistency check results
     */
    async checkConsistency(content, options = {}) {
        if (!content || content.trim().length === 0) {
            throw new Error('Content is required for consistency checking');
        }

        const results = {
            content: content,
            timestamp: new Date().toISOString(),
            issues: [],
            recommendations: [],
            scores: {
                tense: 100,
                dates: 100,
                formatting: 100,
                punctuation: 100,
                overall: 100
            },
            patterns: {
                dates: [],
                bullets: [],
                punctuation: null
            }
        };

        try {
            // Run all consistency checks
            const [
                tenseIssues,
                dateIssues,
                bulletIssues,
                punctuationIssues,
                formattingIssues
            ] = await Promise.all([
                this._checkTenseConsistency(content),
                this._checkDateConsistency(content),
                this._checkBulletConsistency(content),
                this._checkPunctuationConsistency(content),
                this._checkFormattingConsistency(content)
            ]);

            // Combine all issues
            results.issues = [
                ...tenseIssues.issues,
                ...dateIssues.issues,
                ...bulletIssues.issues,
                ...punctuationIssues.issues,
                ...formattingIssues.issues
            ];

            // Store detected patterns
            results.patterns.dates = dateIssues.patterns;
            results.patterns.bullets = bulletIssues.patterns;
            results.patterns.punctuation = punctuationIssues.pattern;

            // Calculate scores
            results.scores = this._calculateConsistencyScores(results.issues);

            // Generate recommendations
            results.recommendations = this._generateRecommendations(results);

            return results;
        } catch (error) {
            console.error('Consistency check error:', error);
            throw new Error(`Consistency check failed: ${error.message}`);
        }
    }

    /**
     * Check tense consistency (past vs present)
     * @param {string} content - Content to check
     * @returns {Promise<Object>} - Tense issues
     * @private
     */
    async _checkTenseConsistency(content) {
        const issues = [];
        const sections = this._extractSections(content);

        // Common past tense patterns
        const pastTenseRegex = /\b(led|managed|developed|created|built|implemented|delivered|achieved|improved|reduced|increased|designed|executed|launched|established|coordinated)\b/gi;

        // Common present tense patterns
        const presentTenseRegex = /\b(lead|manage|develop|create|build|implement|deliver|achieve|improve|reduce|increase|design|execute|launch|establish|coordinate|leads|manages|develops|creates|builds)\b/gi;

        for (const section of sections) {
            const pastMatches = section.content.match(pastTenseRegex) || [];
            const presentMatches = section.content.match(presentTenseRegex) || [];

            // Check if mixing tenses in same section
            if (pastMatches.length > 0 && presentMatches.length > 0) {
                const pastRatio = pastMatches.length / (pastMatches.length + presentMatches.length);

                // If section has mixed tenses (not clearly past or present)
                if (pastRatio > 0.2 && pastRatio < 0.8) {
                    issues.push({
                        type: 'tense_inconsistency',
                        severity: 'high',
                        location: section.header || 'Section',
                        text: section.content.substring(0, 60) + '...',
                        message: `Mixed tenses detected (${pastMatches.length} past, ${presentMatches.length} present)`,
                        suggestion: section.isCurrent
                            ? 'Use present tense for current positions'
                            : 'Use past tense for previous positions',
                        pastVerbs: pastMatches.slice(0, 3),
                        presentVerbs: presentMatches.slice(0, 3),
                        source: 'builtin'
                    });
                }
            }
        }

        return { issues };
    }

    /**
     * Check date format consistency
     * @param {string} content - Content to check
     * @returns {Promise<Object>} - Date issues and patterns
     * @private
     */
    async _checkDateConsistency(content) {
        const issues = [];
        const foundPatterns = [];

        // Find all date formats used
        for (const pattern of this.datePatterns) {
            const matches = content.match(pattern.regex);
            if (matches && matches.length > 0) {
                foundPatterns.push({
                    format: pattern.name,
                    count: matches.length,
                    example: matches[0]
                });
            }
        }

        // Check if multiple formats are used
        if (foundPatterns.length > 1) {
            const sortedPatterns = foundPatterns.sort((a, b) => b.count - a.count);
            const primaryFormat = sortedPatterns[0];
            const otherFormats = sortedPatterns.slice(1);

            for (const format of otherFormats) {
                issues.push({
                    type: 'date_format_inconsistency',
                    severity: 'medium',
                    location: `Found ${format.count} instances`,
                    text: format.example,
                    message: `Inconsistent date format: "${format.format}" (${format.count} times) differs from primary format "${primaryFormat.format}" (${primaryFormat.count} times)`,
                    suggestion: `Use consistent date format throughout. Recommend: ${primaryFormat.format}`,
                    primaryFormat: primaryFormat.format,
                    inconsistentFormat: format.format,
                    source: 'builtin'
                });
            }
        }

        return {
            issues,
            patterns: foundPatterns
        };
    }

    /**
     * Check bullet point consistency
     * @param {string} content - Content to check
     * @returns {Promise<Object>} - Bullet issues and patterns
     * @private
     */
    async _checkBulletConsistency(content) {
        const issues = [];
        const foundPatterns = [];

        // Find all bullet styles used
        for (const style of this.bulletStyles) {
            const matches = content.match(style.regex);
            if (matches && matches.length > 0) {
                foundPatterns.push({
                    style: style.name,
                    count: matches.length
                });
            }
        }

        // Check if multiple bullet styles are used
        if (foundPatterns.length > 1) {
            const sortedPatterns = foundPatterns.sort((a, b) => b.count - a.count);
            const primaryStyle = sortedPatterns[0];
            const otherStyles = sortedPatterns.slice(1);

            for (const style of otherStyles) {
                issues.push({
                    type: 'bullet_style_inconsistency',
                    severity: 'low',
                    location: `Found ${style.count} instances`,
                    text: `${style.style} bullets`,
                    message: `Inconsistent bullet style: "${style.style}" (${style.count} times) differs from primary "${primaryStyle.style}" (${primaryStyle.count} times)`,
                    suggestion: `Use consistent bullet style throughout. Recommend: ${primaryStyle.style}`,
                    primaryStyle: primaryStyle.style,
                    inconsistentStyle: style.style,
                    source: 'builtin'
                });
            }
        }

        return {
            issues,
            patterns: foundPatterns
        };
    }

    /**
     * Check punctuation consistency
     * @param {string} content - Content to check
     * @returns {Promise<Object>} - Punctuation issues
     * @private
     */
    async _checkPunctuationConsistency(content) {
        const issues = [];
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const bulletLines = lines.filter(line => /^[\s]*[-•*][\s]+/.test(line));

        if (bulletLines.length === 0) {
            return { issues, pattern: null };
        }

        // Check if bullets end with periods
        let withPeriod = 0;
        let withoutPeriod = 0;

        for (const line of bulletLines) {
            const trimmed = line.trim();
            if (this.punctuationPatterns.period.test(trimmed)) {
                withPeriod++;
            } else if (this.punctuationPatterns.noPunctuation.test(trimmed)) {
                withoutPeriod++;
            }
        }

        // Determine predominant pattern
        const pattern = withPeriod > withoutPeriod ? 'with-period' : 'without-period';
        const minority = withPeriod > withoutPeriod ? withoutPeriod : withPeriod;

        // If there's inconsistency (more than 20% minority)
        if (minority > 0 && minority / bulletLines.length > 0.2) {
            issues.push({
                type: 'punctuation_inconsistency',
                severity: 'low',
                location: `${minority} of ${bulletLines.length} bullets`,
                text: `Bullet punctuation`,
                message: `Inconsistent bullet punctuation: ${withPeriod} bullets end with periods, ${withoutPeriod} do not`,
                suggestion: pattern === 'with-period'
                    ? 'Add periods to all bullet points for consistency'
                    : 'Remove periods from all bullet points for consistency',
                pattern: pattern,
                source: 'builtin'
            });
        }

        // Check for excessive spacing
        const spacingIssues = content.match(this.punctuationPatterns.spacing);
        if (spacingIssues && spacingIssues.length > 3) {
            issues.push({
                type: 'spacing_inconsistency',
                severity: 'low',
                location: `${spacingIssues.length} locations`,
                text: 'Multiple spaces',
                message: `Found ${spacingIssues.length} instances of multiple consecutive spaces`,
                suggestion: 'Replace multiple spaces with single spaces',
                source: 'builtin'
            });
        }

        return {
            issues,
            pattern: {
                bulletPunctuation: pattern,
                withPeriod,
                withoutPeriod
            }
        };
    }

    /**
     * Check general formatting consistency
     * @param {string} content - Content to check
     * @returns {Promise<Object>} - Formatting issues
     * @private
     */
    async _checkFormattingConsistency(content) {
        const issues = [];

        // Check for inconsistent capitalization in section headers
        const headerPattern = /^[A-Z\s]{4,}$/gm;
        const headers = content.match(headerPattern) || [];

        if (headers.length > 1) {
            const allCaps = headers.filter(h => h === h.toUpperCase());
            const titleCase = headers.filter(h => h !== h.toUpperCase());

            if (allCaps.length > 0 && titleCase.length > 0) {
                issues.push({
                    type: 'header_capitalization_inconsistency',
                    severity: 'medium',
                    location: `${headers.length} headers`,
                    text: headers.slice(0, 2).join(', '),
                    message: 'Inconsistent header capitalization (mix of ALL CAPS and Title Case)',
                    suggestion: 'Use consistent capitalization for all section headers',
                    source: 'builtin'
                });
            }
        }

        // Check for inconsistent indentation
        const lines = content.split('\n');
        const indentPatterns = new Set();

        for (const line of lines) {
            if (line.trim().length > 0 && line.startsWith(' ')) {
                const leadingSpaces = line.match(/^[\s]*/)[0].length;
                indentPatterns.add(leadingSpaces);
            }
        }

        if (indentPatterns.size > 3) {
            issues.push({
                type: 'indentation_inconsistency',
                severity: 'low',
                location: 'Throughout document',
                text: `${indentPatterns.size} different indent levels`,
                message: `Found ${indentPatterns.size} different indentation levels`,
                suggestion: 'Use consistent indentation (recommend 2 or 4 spaces)',
                source: 'builtin'
            });
        }

        return { issues };
    }

    /**
     * Extract sections from content
     * @param {string} content - Content to parse
     * @returns {Array} - Array of sections
     * @private
     */
    _extractSections(content) {
        const sections = [];
        const lines = content.split('\n');

        let currentSection = null;
        const headerPattern = /^[A-Z\s]{3,}$|^#{1,3}\s+[A-Z]/;
        const currentIndicators = ['present', 'current', 'ongoing', 'now'];

        for (const line of lines) {
            const trimmed = line.trim();

            // Check if line is a header
            if (headerPattern.test(trimmed) && trimmed.length < 50) {
                // Save previous section
                if (currentSection) {
                    sections.push(currentSection);
                }

                // Start new section
                currentSection = {
                    header: trimmed,
                    content: '',
                    isCurrent: currentIndicators.some(ind =>
                        trimmed.toLowerCase().includes(ind)
                    )
                };
            } else if (currentSection) {
                currentSection.content += line + '\n';
            }
        }

        // Add last section
        if (currentSection) {
            sections.push(currentSection);
        }

        return sections;
    }

    /**
     * Calculate consistency scores
     * @param {Array} issues - Array of issues
     * @returns {Object} - Score breakdown
     * @private
     */
    _calculateConsistencyScores(issues) {
        const scores = {
            tense: 100,
            dates: 100,
            formatting: 100,
            punctuation: 100,
            overall: 100
        };

        const severityWeights = { high: 10, medium: 5, low: 2 };

        for (const issue of issues) {
            const deduction = severityWeights[issue.severity] || 3;

            if (issue.type.includes('tense')) {
                scores.tense -= deduction;
            } else if (issue.type.includes('date')) {
                scores.dates -= deduction;
            } else if (issue.type.includes('punctuation') || issue.type.includes('spacing')) {
                scores.punctuation -= deduction;
            } else {
                scores.formatting -= deduction;
            }
        }

        // Clamp scores between 0-100
        scores.tense = Math.max(0, Math.min(100, scores.tense));
        scores.dates = Math.max(0, Math.min(100, scores.dates));
        scores.formatting = Math.max(0, Math.min(100, scores.formatting));
        scores.punctuation = Math.max(0, Math.min(100, scores.punctuation));

        // Calculate overall score (weighted average)
        scores.overall = Math.round(
            (scores.tense * 0.35) +
            (scores.dates * 0.25) +
            (scores.formatting * 0.25) +
            (scores.punctuation * 0.15)
        );

        return scores;
    }

    /**
     * Generate recommendations based on results
     * @param {Object} results - Consistency check results
     * @returns {Array} - Array of recommendations
     * @private
     */
    _generateRecommendations(results) {
        const recommendations = [];

        // Date format recommendation
        if (results.patterns.dates.length > 1) {
            const primaryFormat = results.patterns.dates.sort((a, b) => b.count - a.count)[0];
            recommendations.push({
                type: 'date_format',
                priority: 'medium',
                message: `Standardize all dates to ${primaryFormat.format} format`,
                action: 'Convert all dates to consistent format',
                example: primaryFormat.example
            });
        }

        // Bullet style recommendation
        if (results.patterns.bullets.length > 1) {
            const primaryStyle = results.patterns.bullets.sort((a, b) => b.count - a.count)[0];
            recommendations.push({
                type: 'bullet_style',
                priority: 'low',
                message: `Standardize all bullets to ${primaryStyle.style} style`,
                action: 'Convert all bullets to consistent style'
            });
        }

        // Punctuation recommendation
        if (results.patterns.punctuation && results.patterns.punctuation.bulletPunctuation) {
            const pattern = results.patterns.punctuation.bulletPunctuation;
            recommendations.push({
                type: 'punctuation',
                priority: 'low',
                message: pattern === 'with-period'
                    ? 'Add periods to all bullet points'
                    : 'Remove periods from all bullet points',
                action: 'Standardize bullet punctuation'
            });
        }

        // Tense recommendation
        const tenseIssues = results.issues.filter(i => i.type === 'tense_inconsistency');
        if (tenseIssues.length > 0) {
            recommendations.push({
                type: 'tense',
                priority: 'high',
                message: 'Use past tense for previous positions, present tense for current role',
                action: 'Review and correct verb tenses in each section'
            });
        }

        return recommendations;
    }

    /**
     * Get quick summary of consistency results
     * @param {Object} results - Full consistency results
     * @returns {Object} - Summary
     */
    getSummary(results) {
        const issuesByType = {};

        for (const issue of results.issues) {
            issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
        }

        return {
            totalIssues: results.issues.length,
            scores: results.scores,
            issuesByType,
            recommendations: results.recommendations,
            patterns: results.patterns,
            grade: this._getLetterGrade(results.scores.overall)
        };
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
const consistencyChecker = new ConsistencyChecker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConsistencyChecker, consistencyChecker };
}
