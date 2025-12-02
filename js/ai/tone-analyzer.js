// Tone Analyzer
// Analyzes tone, consistency, and industry appropriateness of resume content

/**
 * Tone Analyzer Class
 * Assesses overall tone, detects inconsistencies, and provides industry-specific recommendations
 */
class ToneAnalyzer {
    constructor() {
        this.generator = typeof aiGenerator !== 'undefined' ? aiGenerator : null;

        // Tone indicators for different professional contexts
        this.toneIndicators = {
            professional: {
                keywords: ['achieved', 'managed', 'led', 'delivered', 'developed', 'implemented'],
                style: 'formal, achievement-focused',
                characteristics: ['objective', 'quantifiable', 'action-oriented']
            },
            creative: {
                keywords: ['designed', 'conceptualized', 'crafted', 'envisioned', 'innovated', 'created'],
                style: 'expressive, portfolio-focused',
                characteristics: ['descriptive', 'visual', 'innovative']
            },
            technical: {
                keywords: ['engineered', 'architected', 'optimized', 'debugged', 'deployed', 'integrated'],
                style: 'precise, technical',
                characteristics: ['specific', 'technical', 'results-driven']
            }
        };

        // Industry-specific tone guidelines
        this.industryGuidelines = {
            'technology': {
                preferredTone: 'technical',
                keywords: ['agile', 'scalable', 'architecture', 'optimization', 'automation'],
                avoid: ['synergy', 'leverage', 'rock star']
            },
            'finance': {
                preferredTone: 'professional',
                keywords: ['compliance', 'regulatory', 'risk management', 'analysis', 'portfolio'],
                avoid: ['disrupt', 'game changer', 'think outside the box']
            },
            'marketing': {
                preferredTone: 'creative',
                keywords: ['campaign', 'engagement', 'brand', 'growth', 'conversion'],
                avoid: ['responsible for', 'helped', 'worked on']
            },
            'healthcare': {
                preferredTone: 'professional',
                keywords: ['patient care', 'compliance', 'clinical', 'protocol', 'quality'],
                avoid: ['ninja', 'guru', 'rock star']
            },
            'education': {
                preferredTone: 'professional',
                keywords: ['curriculum', 'assessment', 'pedagogy', 'learning outcomes', 'student success'],
                avoid: ['disrupt', 'game changer', 'crushing it']
            }
        };
    }

    /**
     * Analyze tone of resume content
     * @param {string} content - Content to analyze
     * @param {Object} context - Context (industry, role)
     * @returns {Promise<Object>} - Tone analysis results
     */
    async analyzeTone(content, context = {}) {
        if (!content || content.trim().length === 0) {
            throw new Error('Content is required for tone analysis');
        }

        const results = {
            content: content,
            context: context,
            timestamp: new Date().toISOString(),
            detectedTone: null,
            toneConsistency: 0,
            industryAppropriate: false,
            issues: [],
            recommendations: [],
            scores: {
                consistency: 0,
                appropriateness: 0,
                professionalism: 0,
                overall: 0
            }
        };

        try {
            // Detect overall tone
            results.detectedTone = this._detectTone(content);

            // Check tone consistency
            const consistencyResults = await this._checkToneConsistency(content);
            results.toneConsistency = consistencyResults.score;
            results.issues.push(...consistencyResults.issues);

            // Check industry appropriateness
            if (context.industry) {
                const appropriatenessResults = this._checkIndustryAppropriateness(
                    content,
                    context.industry
                );
                results.industryAppropriate = appropriatenessResults.appropriate;
                results.issues.push(...appropriatenessResults.issues);
                results.recommendations.push(...appropriatenessResults.recommendations);
            }

            // Run AI tone analysis
            const aiResults = await this._runAIToneAnalysis(content, context);
            if (aiResults) {
                results.aiInsights = aiResults;
                if (aiResults.issues) {
                    results.issues.push(...aiResults.issues);
                }
                if (aiResults.recommendations) {
                    results.recommendations.push(...aiResults.recommendations);
                }
            }

            // Calculate scores
            results.scores = this._calculateToneScores(results);

            return results;
        } catch (error) {
            console.error('Tone analysis error:', error);
            throw new Error(`Tone analysis failed: ${error.message}`);
        }
    }

    /**
     * Detect the predominant tone of content
     * @param {string} content - Content to analyze
     * @returns {Object} - Detected tone with confidence
     * @private
     */
    _detectTone(content) {
        const lowerContent = content.toLowerCase();
        const toneScores = {};

        // Count keywords for each tone
        for (const [toneName, toneData] of Object.entries(this.toneIndicators)) {
            let score = 0;
            for (const keyword of toneData.keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = content.match(regex);
                if (matches) {
                    score += matches.length;
                }
            }
            toneScores[toneName] = score;
        }

        // Find dominant tone
        const sortedTones = Object.entries(toneScores)
            .sort((a, b) => b[1] - a[1]);

        const dominantTone = sortedTones[0][0];
        const totalScore = Object.values(toneScores).reduce((sum, score) => sum + score, 0);
        const confidence = totalScore > 0 ? (sortedTones[0][1] / totalScore) * 100 : 0;

        return {
            primary: dominantTone,
            confidence: Math.round(confidence),
            breakdown: toneScores,
            style: this.toneIndicators[dominantTone].style
        };
    }

    /**
     * Check tone consistency throughout content
     * @param {string} content - Content to analyze
     * @returns {Promise<Object>} - Consistency results
     * @private
     */
    async _checkToneConsistency(content) {
        const sections = this._splitIntoSections(content);
        const sectionTones = [];

        // Analyze tone of each section
        for (const section of sections) {
            if (section.trim().length > 20) {
                const tone = this._detectTone(section);
                sectionTones.push({
                    content: section.substring(0, 50) + '...',
                    tone: tone.primary,
                    confidence: tone.confidence
                });
            }
        }

        // Calculate consistency
        if (sectionTones.length === 0) {
            return { score: 100, issues: [] };
        }

        const primaryTone = sectionTones[0].tone;
        const consistentSections = sectionTones.filter(s => s.tone === primaryTone).length;
        const consistencyScore = Math.round((consistentSections / sectionTones.length) * 100);

        const issues = [];
        if (consistencyScore < 80) {
            // Find inconsistent sections
            const inconsistentSections = sectionTones.filter(s => s.tone !== primaryTone);
            for (const section of inconsistentSections) {
                issues.push({
                    type: 'tone_inconsistency',
                    severity: 'medium',
                    location: section.content,
                    message: `Tone shifts from ${primaryTone} to ${section.tone}`,
                    suggestion: `Maintain consistent ${primaryTone} tone throughout resume`,
                    source: 'builtin'
                });
            }
        }

        return {
            score: consistencyScore,
            issues,
            sectionTones
        };
    }

    /**
     * Check if tone is appropriate for industry
     * @param {string} content - Content to analyze
     * @param {string} industry - Target industry
     * @returns {Object} - Appropriateness results
     * @private
     */
    _checkIndustryAppropriateness(content, industry) {
        const lowerIndustry = industry.toLowerCase();
        const guidelines = this.industryGuidelines[lowerIndustry] || null;

        if (!guidelines) {
            return {
                appropriate: true,
                issues: [],
                recommendations: []
            };
        }

        const issues = [];
        const recommendations = [];
        const lowerContent = content.toLowerCase();

        // Check for words/phrases to avoid
        for (const avoidPhrase of guidelines.avoid) {
            const regex = new RegExp(`\\b${avoidPhrase}\\b`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                issues.push({
                    type: 'inappropriate_language',
                    severity: 'medium',
                    text: avoidPhrase,
                    location: this._findPhraseContext(content, avoidPhrase),
                    message: `"${avoidPhrase}" may not be appropriate for ${industry} industry`,
                    suggestion: `Use more professional language suited to ${industry}`,
                    source: 'builtin'
                });
            }
        }

        // Check for recommended keywords
        const foundKeywords = guidelines.keywords.filter(keyword =>
            lowerContent.includes(keyword.toLowerCase())
        );
        const missingKeywords = guidelines.keywords.filter(keyword =>
            !lowerContent.includes(keyword.toLowerCase())
        );

        if (missingKeywords.length > 0) {
            recommendations.push({
                type: 'keyword_suggestion',
                priority: 'medium',
                message: `Consider incorporating ${industry}-specific terminology`,
                keywords: missingKeywords.slice(0, 5),
                reason: `These keywords are valued in ${industry} industry`
            });
        }

        // Check if detected tone matches preferred tone
        const detectedTone = this._detectTone(content);
        if (detectedTone.primary !== guidelines.preferredTone && detectedTone.confidence > 50) {
            recommendations.push({
                type: 'tone_adjustment',
                priority: 'high',
                message: `Consider adjusting tone to be more ${guidelines.preferredTone}`,
                currentTone: detectedTone.primary,
                recommendedTone: guidelines.preferredTone,
                reason: `${industry} industry typically prefers ${guidelines.preferredTone} tone`
            });
        }

        return {
            appropriate: issues.length === 0,
            issues,
            recommendations,
            foundKeywords,
            missingKeywords
        };
    }

    /**
     * Run AI-powered tone analysis via Claude
     * @param {string} content - Content to analyze
     * @param {Object} context - Analysis context
     * @returns {Promise<Object>} - AI analysis results
     * @private
     */
    async _runAIToneAnalysis(content, context) {
        if (!this.generator || typeof AIPrompts === 'undefined') {
            console.warn('AI tone analysis unavailable - generator or prompts not loaded');
            return null;
        }

        try {
            const prompt = AIPrompts.analyzeTone({
                content,
                industry: context.industry || '',
                role: context.role || ''
            });

            const response = await this.generator._makeRequest(prompt, {
                maxTokens: 1536,
                temperature: 0.3
            });

            // Parse JSON response
            return JSON.parse(response);
        } catch (error) {
            console.error('AI tone analysis error:', error);
            return null;
        }
    }

    /**
     * Calculate tone scores
     * @param {Object} results - Analysis results
     * @returns {Object} - Score breakdown
     * @private
     */
    _calculateToneScores(results) {
        const scores = {
            consistency: results.toneConsistency,
            appropriateness: 100,
            professionalism: 100,
            overall: 0
        };

        // Deduct points for issues
        const inappropriateIssues = results.issues.filter(i =>
            i.type === 'inappropriate_language' || i.type === 'tone_inconsistency'
        );

        scores.appropriateness -= inappropriateIssues.length * 5;
        scores.appropriateness = Math.max(0, Math.min(100, scores.appropriateness));

        // Calculate professionalism score based on detected tone
        if (results.detectedTone) {
            scores.professionalism = results.detectedTone.confidence;
        }

        // Calculate overall score (weighted average)
        scores.overall = Math.round(
            (scores.consistency * 0.4) +
            (scores.appropriateness * 0.4) +
            (scores.professionalism * 0.2)
        );

        return scores;
    }

    /**
     * Split content into logical sections
     * @param {string} content - Content to split
     * @returns {Array} - Array of sections
     * @private
     */
    _splitIntoSections(content) {
        // Split by double newlines or section headers
        return content
            .split(/\n\s*\n/)
            .filter(section => section.trim().length > 0);
    }

    /**
     * Find context around a phrase
     * @param {string} content - Full content
     * @param {string} phrase - Phrase to find
     * @returns {string} - Context snippet
     * @private
     */
    _findPhraseContext(content, phrase) {
        const regex = new RegExp(`\\b${phrase}\\b`, 'i');
        const match = regex.exec(content);

        if (!match) return '';

        const start = Math.max(0, match.index - 30);
        const end = Math.min(content.length, match.index + phrase.length + 30);
        const snippet = content.substring(start, end);

        return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
    }

    /**
     * Get quick summary of tone analysis
     * @param {Object} results - Full tone analysis results
     * @returns {Object} - Summary
     */
    getSummary(results) {
        return {
            detectedTone: results.detectedTone,
            toneConsistency: results.toneConsistency,
            industryAppropriate: results.industryAppropriate,
            totalIssues: results.issues.length,
            totalRecommendations: results.recommendations.length,
            scores: results.scores,
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

    /**
     * Get tone recommendations for specific industry
     * @param {string} industry - Target industry
     * @returns {Object} - Industry-specific recommendations
     */
    getIndustryRecommendations(industry) {
        const lowerIndustry = industry.toLowerCase();
        const guidelines = this.industryGuidelines[lowerIndustry];

        if (!guidelines) {
            return {
                available: false,
                message: `No specific guidelines available for ${industry}`
            };
        }

        return {
            available: true,
            industry: industry,
            preferredTone: guidelines.preferredTone,
            recommendedKeywords: guidelines.keywords,
            phrasesToAvoid: guidelines.avoid,
            style: this.toneIndicators[guidelines.preferredTone].style,
            characteristics: this.toneIndicators[guidelines.preferredTone].characteristics
        };
    }
}

// Create global instance
const toneAnalyzer = new ToneAnalyzer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToneAnalyzer, toneAnalyzer };
}
