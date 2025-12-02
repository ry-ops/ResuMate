// AI Proofreading Engine
// Comprehensive grammar, spelling, and style checking for resume content

/**
 * Proofreading Engine Class
 * Detects grammar errors, spelling mistakes, passive voice, weak verbs, clichés,
 * and provides readability scoring
 */
class ProofreadEngine {
    constructor() {
        this.generator = typeof aiGenerator !== 'undefined' ? aiGenerator : null;

        // Cliché database - common resume buzzwords to avoid
        this.clicheDatabase = [
            { phrase: 'team player', alternatives: ['collaborative team member', 'cross-functional contributor', 'collaborative professional'] },
            { phrase: 'go-getter', alternatives: ['proactive professional', 'self-motivated achiever', 'results-driven contributor'] },
            { phrase: 'results-oriented', alternatives: ['outcome-focused', 'achievement-driven', 'performance-focused'] },
            { phrase: 'hard worker', alternatives: ['dedicated professional', 'committed achiever', 'diligent contributor'] },
            { phrase: 'think outside the box', alternatives: ['innovative thinker', 'creative problem solver', 'strategic innovator'] },
            { phrase: 'detail-oriented', alternatives: ['meticulous', 'thorough', 'precision-focused'] },
            { phrase: 'self-starter', alternatives: ['self-motivated', 'proactive initiator', 'independent contributor'] },
            { phrase: 'best of breed', alternatives: ['industry-leading', 'top-tier', 'premier'] },
            { phrase: 'synergy', alternatives: ['collaboration', 'integrated approach', 'unified effort'] },
            { phrase: 'leverage', alternatives: ['utilize', 'apply', 'deploy'] },
            { phrase: 'low-hanging fruit', alternatives: ['immediate opportunities', 'quick wins', 'accessible goals'] },
            { phrase: 'move the needle', alternatives: ['drive improvement', 'create impact', 'advance goals'] },
            { phrase: 'game changer', alternatives: ['transformative innovation', 'significant advancement', 'breakthrough solution'] },
            { phrase: 'touch base', alternatives: ['connect', 'meet', 'discuss'] },
            { phrase: 'circle back', alternatives: ['follow up', 'revisit', 'return to'] },
            { phrase: 'rock star', alternatives: ['exceptional performer', 'top contributor', 'outstanding professional'] },
            { phrase: 'guru', alternatives: ['expert', 'specialist', 'authority'] },
            { phrase: 'ninja', alternatives: ['expert', 'specialist', 'skilled professional'] },
            { phrase: 'unicorn', alternatives: ['rare specialist', 'versatile expert', 'multi-skilled professional'] }
        ];

        // Common weak verbs to flag
        this.weakVerbs = [
            'helped', 'assisted', 'worked', 'did', 'made', 'got', 'was', 'were',
            'responsible for', 'duties included', 'tasked with', 'involved in',
            'participated in', 'contributed to', 'dealt with', 'handled'
        ];

        // Passive voice indicators
        this.passiveIndicators = [
            'was', 'were', 'been', 'being', 'be', 'is', 'are', 'am',
            'was given', 'were asked', 'was tasked', 'were assigned',
            'was responsible', 'were required', 'was selected', 'were chosen'
        ];
    }

    /**
     * Comprehensive proofread of resume content
     * @param {string} content - Content to proofread
     * @param {Object} options - Proofreading options
     * @returns {Promise<Object>} - Detailed proofreading results
     */
    async proofread(content, options = {}) {
        if (!content || content.trim().length === 0) {
            throw new Error('Content is required for proofreading');
        }

        const results = {
            content: content,
            timestamp: new Date().toISOString(),
            issues: [],
            statistics: {
                wordCount: this._countWords(content),
                sentenceCount: this._countSentences(content),
                avgSentenceLength: 0,
                readabilityScore: 0
            },
            scores: {
                grammar: 100,
                style: 100,
                readability: 100,
                overall: 100
            }
        };

        try {
            // Calculate statistics
            results.statistics.avgSentenceLength = this._calculateAvgSentenceLength(content);
            results.statistics.readabilityScore = this._calculateReadabilityScore(content);

            // Run all checks in parallel
            const [
                clicheIssues,
                weakVerbIssues,
                passiveVoiceIssues,
                sentenceLengthIssues,
                aiIssues
            ] = await Promise.all([
                this._detectCliches(content),
                this._detectWeakVerbs(content),
                this._detectPassiveVoice(content),
                this._analyzeSentenceLength(content),
                this._runAIProofreading(content)
            ]);

            // Combine all issues
            results.issues = [
                ...clicheIssues,
                ...weakVerbIssues,
                ...passiveVoiceIssues,
                ...sentenceLengthIssues,
                ...aiIssues
            ];

            // Calculate scores based on issues
            results.scores = this._calculateScores(results.issues, results.statistics);

            return results;
        } catch (error) {
            console.error('Proofreading error:', error);
            throw new Error(`Proofreading failed: ${error.message}`);
        }
    }

    /**
     * Run AI-powered proofreading via Claude
     * @param {string} content - Content to proofread
     * @returns {Promise<Array>} - Array of issues detected by AI
     * @private
     */
    async _runAIProofreading(content) {
        if (!this.generator || typeof AIPrompts === 'undefined') {
            console.warn('AI proofreading unavailable - generator or prompts not loaded');
            return [];
        }

        try {
            const prompt = AIPrompts.proofreadContent({ content });
            const response = await this.generator._makeRequest(prompt, {
                maxTokens: 2048,
                temperature: 0.3
            });

            // Parse JSON response
            const aiResults = JSON.parse(response);

            // Convert to standard issue format
            return (aiResults.issues || []).map(issue => ({
                type: issue.type || 'grammar',
                severity: issue.severity || 'medium',
                text: issue.text || '',
                location: issue.location || '',
                message: issue.message || issue.explanation || '',
                suggestion: issue.suggestion || issue.fix || '',
                source: 'ai'
            }));
        } catch (error) {
            console.error('AI proofreading error:', error);
            return [];
        }
    }

    /**
     * Detect clichés and buzzwords
     * @param {string} content - Content to analyze
     * @returns {Promise<Array>} - Array of cliché issues
     * @private
     */
    async _detectCliches(content) {
        const issues = [];
        const lowerContent = content.toLowerCase();

        for (const cliche of this.clicheDatabase) {
            const regex = new RegExp(`\\b${cliche.phrase}\\b`, 'gi');
            let match;

            while ((match = regex.exec(content)) !== null) {
                issues.push({
                    type: 'cliche',
                    severity: 'medium',
                    text: match[0],
                    location: this._getContextSnippet(content, match.index),
                    message: `"${cliche.phrase}" is an overused phrase. Consider more specific language.`,
                    suggestion: `Try: ${cliche.alternatives.join(', ')}`,
                    alternatives: cliche.alternatives,
                    position: match.index,
                    source: 'builtin'
                });
            }
        }

        return issues;
    }

    /**
     * Detect weak verbs
     * @param {string} content - Content to analyze
     * @returns {Promise<Array>} - Array of weak verb issues
     * @private
     */
    async _detectWeakVerbs(content) {
        const issues = [];
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());

        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase().trim();

            for (const weakVerb of this.weakVerbs) {
                if (lowerSentence.includes(weakVerb)) {
                    // Check if it's at the beginning (after bullet point)
                    const afterBullet = lowerSentence.replace(/^[•\-*]\s*/, '');

                    if (afterBullet.startsWith(weakVerb)) {
                        issues.push({
                            type: 'weak_verb',
                            severity: 'high',
                            text: weakVerb,
                            location: sentence.trim().substring(0, 50) + '...',
                            message: `"${weakVerb}" is a weak verb that dilutes impact.`,
                            suggestion: 'Use strong action verbs like: Led, Architected, Spearheaded, Optimized, Transformed, Delivered',
                            source: 'builtin'
                        });
                    }
                }
            }
        }

        return issues;
    }

    /**
     * Detect passive voice
     * @param {string} content - Content to analyze
     * @returns {Promise<Array>} - Array of passive voice issues
     * @private
     */
    async _detectPassiveVoice(content) {
        const issues = [];
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());

        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();

            // Check for passive voice patterns
            const passivePattern = /\b(was|were|been|being|is|are)\s+(\w+ed|given|asked|tasked|assigned|required|selected|chosen)\b/gi;
            let match;

            while ((match = passivePattern.exec(sentence)) !== null) {
                issues.push({
                    type: 'passive_voice',
                    severity: 'medium',
                    text: match[0],
                    location: sentence.trim().substring(0, 60) + '...',
                    message: 'Passive voice weakens your statements.',
                    suggestion: 'Rewrite in active voice. Example: "Was responsible for managing" → "Managed"',
                    source: 'builtin'
                });
            }
        }

        return issues;
    }

    /**
     * Analyze sentence length
     * @param {string} content - Content to analyze
     * @returns {Promise<Array>} - Array of sentence length issues
     * @private
     */
    async _analyzeSentenceLength(content) {
        const issues = [];
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());

        for (const sentence of sentences) {
            const wordCount = this._countWords(sentence);

            if (wordCount > 35) {
                issues.push({
                    type: 'sentence_length',
                    severity: 'low',
                    text: sentence.trim().substring(0, 60) + '...',
                    location: `${wordCount} words`,
                    message: `Sentence is too long (${wordCount} words). Resumes should use concise bullet points.`,
                    suggestion: 'Break into multiple bullets or reduce to 20-35 words.',
                    source: 'builtin'
                });
            } else if (wordCount < 10 && wordCount > 0) {
                issues.push({
                    type: 'sentence_length',
                    severity: 'low',
                    text: sentence.trim(),
                    location: `${wordCount} words`,
                    message: `Sentence is very short (${wordCount} words). May lack detail.`,
                    suggestion: 'Add context, metrics, or impact to make it more substantial.',
                    source: 'builtin'
                });
            }
        }

        return issues;
    }

    /**
     * Calculate readability score (Flesch-Kincaid)
     * @param {string} content - Content to analyze
     * @returns {number} - Readability score (0-100, higher is better)
     * @private
     */
    _calculateReadabilityScore(content) {
        const words = this._countWords(content);
        const sentences = this._countSentences(content);
        const syllables = this._countSyllables(content);

        if (sentences === 0 || words === 0) return 0;

        // Flesch Reading Ease formula
        const avgWordsPerSentence = words / sentences;
        const avgSyllablesPerWord = syllables / words;

        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

        // Clamp between 0-100
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Count words in text
     * @param {string} text - Text to count
     * @returns {number} - Word count
     * @private
     */
    _countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Count sentences in text
     * @param {string} text - Text to count
     * @returns {number} - Sentence count
     * @private
     */
    _countSentences(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return Math.max(1, sentences.length);
    }

    /**
     * Count syllables (approximation)
     * @param {string} text - Text to analyze
     * @returns {number} - Syllable count
     * @private
     */
    _countSyllables(text) {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        let syllables = 0;

        for (const word of words) {
            // Simple syllable counting algorithm
            const vowelGroups = word.match(/[aeiouy]+/g);
            let count = vowelGroups ? vowelGroups.length : 0;

            // Adjust for silent e
            if (word.endsWith('e')) count--;

            // Ensure at least 1 syllable
            syllables += Math.max(1, count);
        }

        return syllables;
    }

    /**
     * Calculate average sentence length
     * @param {string} content - Content to analyze
     * @returns {number} - Average words per sentence
     * @private
     */
    _calculateAvgSentenceLength(content) {
        const words = this._countWords(content);
        const sentences = this._countSentences(content);
        return sentences > 0 ? Math.round(words / sentences) : 0;
    }

    /**
     * Calculate polish scores based on issues
     * @param {Array} issues - Array of detected issues
     * @param {Object} statistics - Content statistics
     * @returns {Object} - Score breakdown
     * @private
     */
    _calculateScores(issues, statistics) {
        const scores = {
            grammar: 100,
            style: 100,
            readability: 100,
            overall: 100
        };

        // Deduct points based on issue type and severity
        const severityWeights = { high: 5, medium: 3, low: 1 };

        for (const issue of issues) {
            const deduction = severityWeights[issue.severity] || 2;

            switch (issue.type) {
                case 'grammar':
                case 'spelling':
                case 'punctuation':
                    scores.grammar -= deduction;
                    break;
                case 'cliche':
                case 'weak_verb':
                case 'passive_voice':
                    scores.style -= deduction;
                    break;
                case 'sentence_length':
                    scores.readability -= deduction;
                    break;
            }
        }

        // Apply readability score
        scores.readability = Math.min(scores.readability, statistics.readabilityScore);

        // Clamp scores between 0-100
        scores.grammar = Math.max(0, Math.min(100, scores.grammar));
        scores.style = Math.max(0, Math.min(100, scores.style));
        scores.readability = Math.max(0, Math.min(100, scores.readability));

        // Calculate overall score (weighted average)
        scores.overall = Math.round(
            (scores.grammar * 0.4) +
            (scores.style * 0.4) +
            (scores.readability * 0.2)
        );

        return scores;
    }

    /**
     * Get context snippet around a position
     * @param {string} content - Full content
     * @param {number} position - Character position
     * @returns {string} - Context snippet
     * @private
     */
    _getContextSnippet(content, position) {
        const start = Math.max(0, position - 30);
        const end = Math.min(content.length, position + 30);
        const snippet = content.substring(start, end);
        return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
    }

    /**
     * Get quick summary of proofreading results
     * @param {Object} results - Full proofreading results
     * @returns {Object} - Summary statistics
     */
    getSummary(results) {
        const issuesByType = {};
        const issuesBySeverity = { high: 0, medium: 0, low: 0 };

        for (const issue of results.issues) {
            issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
            issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
        }

        return {
            totalIssues: results.issues.length,
            scores: results.scores,
            issuesByType,
            issuesBySeverity,
            statistics: results.statistics,
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
const proofreadEngine = new ProofreadEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProofreadEngine, proofreadEngine };
}
