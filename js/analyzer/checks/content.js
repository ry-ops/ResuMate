/**
 * ResuMate - ATS Content Checks
 * 10 comprehensive content checks for ATS optimization
 */

class ContentChecks {
    constructor() {
        this.checks = [
            'keywordDensity',
            'dedicatedSkillsSection',
            'quantifiedAchievements',
            'noPersonalPronouns',
            'actionVerbBullets',
            'appropriateLength',
            'noTyposOrGrammar',
            'industryKeywords',
            'properNounCapitalization',
            'noExcessiveJargon'
        ];

        this.actionVerbs = [
            'achieved', 'implemented', 'developed', 'managed', 'led', 'created',
            'designed', 'built', 'launched', 'optimized', 'increased', 'decreased',
            'improved', 'reduced', 'streamlined', 'automated', 'coordinated',
            'established', 'executed', 'generated', 'spearheaded', 'delivered'
        ];

        this.personalPronouns = ['i', 'me', 'my', 'mine', 'myself', 'we', 'us', 'our', 'ours'];

        this.commonTypos = {
            'teh': 'the',
            'recieve': 'receive',
            'occured': 'occurred',
            'seperate': 'separate',
            'acheive': 'achieve',
            'managment': 'management',
            'experiance': 'experience',
            'responsable': 'responsible'
        };
    }

    /**
     * Run all content checks
     */
    runAll(resumeData, options = {}) {
        const results = [];

        for (const checkName of this.checks) {
            try {
                const result = this[checkName](resumeData, options);
                results.push({
                    category: 'content',
                    checkName,
                    ...result
                });
            } catch (error) {
                console.error(`Error running check ${checkName}:`, error);
                results.push({
                    category: 'content',
                    checkName,
                    passed: false,
                    score: 0,
                    severity: 'error',
                    message: 'Check failed to execute',
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Check 1: Keyword density analysis
     */
    keywordDensity(resumeData, options) {
        const text = this._extractAllText(resumeData);
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const totalWords = words.length;

        // Identify potential keywords (words that appear multiple times)
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        // Get keywords (words appearing 2+ times)
        const keywords = Object.entries(wordFreq)
            .filter(([word, freq]) => freq >= 2 && !this._isStopWord(word))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        const keywordDensity = (keywords.length / totalWords) * 100;
        const passed = keywordDensity >= 2 && keywordDensity <= 8;
        const score = this._calculateDensityScore(keywordDensity);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? `Keyword density is optimal at ${keywordDensity.toFixed(2)}%.`
                : `Keyword density is ${keywordDensity.toFixed(2)}%. Target: 2-8%.`,
            recommendation: keywordDensity < 2
                ? 'Include more relevant keywords naturally throughout your resume.'
                : keywordDensity > 8
                    ? 'Reduce keyword stuffing. Focus on natural language and variety.'
                    : null,
            impact: 'medium',
            details: {
                keywordDensity: keywordDensity.toFixed(2) + '%',
                topKeywords: keywords.slice(0, 10).map(([word, freq]) => ({
                    word,
                    frequency: freq,
                    density: ((freq / totalWords) * 100).toFixed(2) + '%'
                })),
                totalWords
            }
        };
    }

    /**
     * Check 2: Dedicated skills section exists
     */
    dedicatedSkillsSection(resumeData, options) {
        if (!resumeData.sections) {
            return this._failedCheck('No sections found');
        }

        const skillsSection = resumeData.sections.find(s =>
            ['skills', 'technical-skills', 'core-competencies'].includes(s.type) ||
            (s.title && s.title.toLowerCase().includes('skill'))
        );

        const hasSkillsSection = !!skillsSection;
        const hasContent = skillsSection && !this._isEmptyContent(skillsSection.content);

        let skillCount = 0;
        if (hasContent && skillsSection.content.items) {
            skillCount = skillsSection.content.items.length;
        }

        const passed = hasSkillsSection && hasContent && skillCount >= 5;
        const score = passed ? 100 : (hasSkillsSection ? 50 : 0);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'high',
            message: passed
                ? `Skills section found with ${skillCount} skills listed.`
                : hasSkillsSection
                    ? `Skills section found but needs more content (${skillCount} skills).`
                    : 'No dedicated skills section found.',
            recommendation: !passed
                ? 'Add a dedicated "Skills" or "Technical Skills" section with 5-15 relevant skills.'
                : null,
            impact: 'high',
            details: {
                hasSkillsSection,
                skillCount,
                minimumRecommended: 5,
                maximumRecommended: 15
            }
        };
    }

    /**
     * Check 3: Quantified achievements present
     */
    quantifiedAchievements(resumeData, options) {
        const bullets = this._extractBulletPoints(resumeData);
        const quantified = [];
        const unquantified = [];

        const numberPatterns = [
            /\d+%/,                           // 25%
            /\$[\d,]+/,                       // $50,000
            /\d+[kKmMbB]/,                    // 5k, 2M, 1B
            /\d+x/,                           // 3x
            /\d+\+/,                          // 50+
            /\d+\s*(million|billion|thousand)/i,
            /\b\d+\b/                         // Any number
        ];

        bullets.forEach(bullet => {
            const hasNumber = numberPatterns.some(pattern => pattern.test(bullet));
            if (hasNumber) {
                quantified.push(bullet);
            } else {
                unquantified.push(bullet);
            }
        });

        const quantificationRate = bullets.length > 0
            ? (quantified.length / bullets.length) * 100
            : 0;

        const passed = quantificationRate >= 40;
        const score = Math.min(100, quantificationRate * 2);

        return {
            passed,
            score: Math.round(score),
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? `${quantificationRate.toFixed(0)}% of bullet points include quantifiable metrics.`
                : `Only ${quantificationRate.toFixed(0)}% of bullets are quantified. Target: 40%+.`,
            recommendation: !passed
                ? 'Add numbers, percentages, and metrics to achievements. Examples: "Increased sales by 25%", "Managed team of 10".'
                : null,
            impact: 'medium',
            details: {
                totalBullets: bullets.length,
                quantified: quantified.length,
                unquantified: unquantified.length,
                quantificationRate: quantificationRate.toFixed(1) + '%',
                examples: quantified.slice(0, 3),
                needsWork: unquantified.slice(0, 3)
            }
        };
    }

    /**
     * Check 4: No personal pronouns
     */
    noPersonalPronouns(resumeData, options) {
        const text = this._extractAllText(resumeData);
        const words = text.toLowerCase().split(/\b/);

        const pronounsFound = [];
        this.personalPronouns.forEach(pronoun => {
            const count = words.filter(w => w === pronoun).length;
            if (count > 0) {
                pronounsFound.push({ pronoun, count });
            }
        });

        const totalPronouns = pronounsFound.reduce((sum, p) => sum + p.count, 0);
        const passed = totalPronouns === 0;
        const score = Math.max(0, 100 - totalPronouns * 10);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? 'No personal pronouns detected. Content is professional and objective.'
                : `${totalPronouns} personal pronouns found. Resumes should be written in third person.`,
            recommendation: !passed
                ? 'Remove "I", "me", "my". Start bullets with action verbs: "Developed..." not "I developed..."'
                : null,
            impact: 'medium',
            details: {
                pronounsFound,
                totalCount: totalPronouns,
                examples: [
                    'Bad: "I managed a team"',
                    'Good: "Managed team of 10 engineers"'
                ]
            }
        };
    }

    /**
     * Check 5: Bullet points start with action verbs
     */
    actionVerbBullets(resumeData, options) {
        const bullets = this._extractBulletPoints(resumeData);
        const withActionVerbs = [];
        const withoutActionVerbs = [];

        bullets.forEach(bullet => {
            const firstWord = bullet.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
            const hasActionVerb = this.actionVerbs.includes(firstWord) ||
                this._isPastTenseVerb(firstWord);

            if (hasActionVerb) {
                withActionVerbs.push(bullet);
            } else {
                withoutActionVerbs.push(bullet);
            }
        });

        const actionVerbRate = bullets.length > 0
            ? (withActionVerbs.length / bullets.length) * 100
            : 100;

        const passed = actionVerbRate >= 80;
        const score = Math.min(100, actionVerbRate);

        return {
            passed,
            score: Math.round(score),
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? `${actionVerbRate.toFixed(0)}% of bullet points start with strong action verbs.`
                : `Only ${actionVerbRate.toFixed(0)}% of bullets start with action verbs. Target: 80%+.`,
            recommendation: !passed
                ? `Start bullets with action verbs like: ${this.actionVerbs.slice(0, 10).join(', ')}.`
                : null,
            impact: 'medium',
            details: {
                totalBullets: bullets.length,
                withActionVerbs: withActionVerbs.length,
                withoutActionVerbs: withoutActionVerbs.length,
                rate: actionVerbRate.toFixed(1) + '%',
                goodExamples: withActionVerbs.slice(0, 3),
                needsImprovement: withoutActionVerbs.slice(0, 3),
                suggestedVerbs: this.actionVerbs.slice(0, 15)
            }
        };
    }

    /**
     * Check 6: Appropriate length (1-2 pages)
     */
    appropriateLength(resumeData, options) {
        const text = this._extractAllText(resumeData);
        const wordCount = text.split(/\s+/).length;
        const sectionCount = resumeData.sections ? resumeData.sections.length : 0;

        // Estimate page count (rough: 500-700 words per page)
        const estimatedPages = wordCount / 600;

        // Ideal: 400-1400 words (roughly 1-2 pages)
        const isIdeal = wordCount >= 400 && wordCount <= 1400;
        const isTooShort = wordCount < 400;
        const isTooLong = wordCount > 1400;

        let score = 100;
        if (isTooShort) {
            score = Math.max(50, (wordCount / 400) * 100);
        } else if (isTooLong) {
            const excess = wordCount - 1400;
            score = Math.max(50, 100 - (excess / 10));
        }

        return {
            passed: isIdeal,
            score: Math.round(score),
            severity: isIdeal ? 'pass' : 'low',
            message: isIdeal
                ? `Resume length is appropriate at ${wordCount} words (~${estimatedPages.toFixed(1)} pages).`
                : isTooShort
                    ? `Resume is too short at ${wordCount} words. Add more detail to experiences.`
                    : `Resume is too long at ${wordCount} words (~${estimatedPages.toFixed(1)} pages). Consider trimming.`,
            recommendation: isTooShort
                ? 'Add more detail to your experiences, skills, and achievements. Target: 400-1400 words.'
                : isTooLong
                    ? 'Remove less relevant experiences or condense descriptions. Keep to 1-2 pages.'
                    : null,
            impact: 'low',
            details: {
                wordCount,
                estimatedPages: estimatedPages.toFixed(1),
                sectionCount,
                idealRange: '400-1400 words (1-2 pages)',
                status: isTooShort ? 'Too Short' : isTooLong ? 'Too Long' : 'Ideal'
            }
        };
    }

    /**
     * Check 7: No typos or grammar errors
     */
    noTyposOrGrammar(resumeData, options) {
        const text = this._extractAllText(resumeData);
        const foundTypos = [];

        // Check for common typos
        Object.entries(this.commonTypos).forEach(([typo, correct]) => {
            const pattern = new RegExp(`\\b${typo}\\b`, 'gi');
            const matches = text.match(pattern);
            if (matches) {
                foundTypos.push({
                    typo,
                    correct,
                    count: matches.length
                });
            }
        });

        // Check for grammar issues
        const grammarIssues = this._detectGrammarIssues(text);

        const totalIssues = foundTypos.length + grammarIssues.length;
        const passed = totalIssues === 0;
        const score = Math.max(50, 100 - totalIssues * 10);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'high',
            message: passed
                ? 'No obvious typos or grammar errors detected.'
                : `${totalIssues} potential typos or grammar issues detected.`,
            recommendation: !passed
                ? 'Proofread carefully. Use spell-check and grammar tools. Have someone else review.'
                : null,
            impact: 'high',
            details: {
                typos: foundTypos,
                grammarIssues: grammarIssues,
                totalIssues,
                note: 'This is a basic check. Use professional proofreading tools for comprehensive review.'
            }
        };
    }

    /**
     * Check 8: Industry-specific keywords present
     */
    industryKeywords(resumeData, options) {
        const text = this._extractAllText(resumeData).toLowerCase();
        const industry = options.industry || this._detectIndustry(text);

        const industryKeywords = this._getIndustryKeywords(industry);
        const foundKeywords = [];
        const missingKeywords = [];

        industryKeywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                foundKeywords.push(keyword);
            } else {
                missingKeywords.push(keyword);
            }
        });

        const matchRate = industryKeywords.length > 0
            ? (foundKeywords.length / industryKeywords.length) * 100
            : 100;

        const passed = matchRate >= 40;
        const score = Math.min(100, matchRate * 2);

        return {
            passed,
            score: Math.round(score),
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? `${matchRate.toFixed(0)}% of key ${industry} keywords found.`
                : `Only ${matchRate.toFixed(0)}% of ${industry} keywords present. Add industry-specific terms.`,
            recommendation: !passed
                ? `Include relevant ${industry} keywords: ${missingKeywords.slice(0, 5).join(', ')}.`
                : null,
            impact: 'medium',
            details: {
                detectedIndustry: industry,
                totalKeywords: industryKeywords.length,
                foundKeywords: foundKeywords.slice(0, 10),
                missingKeywords: missingKeywords.slice(0, 10),
                matchRate: matchRate.toFixed(1) + '%'
            }
        };
    }

    /**
     * Check 9: Proper noun capitalization
     */
    properNounCapitalization(resumeData, options) {
        const text = this._extractAllText(resumeData);
        const issues = [];

        // Check for common proper nouns that should be capitalized
        const properNouns = [
            'javascript', 'python', 'java', 'react', 'angular', 'vue',
            'aws', 'azure', 'google cloud', 'docker', 'kubernetes',
            'github', 'sql', 'mongodb', 'postgresql'
        ];

        const correctCapitalization = {
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'react': 'React',
            'angular': 'Angular',
            'vue': 'Vue',
            'aws': 'AWS',
            'azure': 'Azure',
            'google cloud': 'Google Cloud',
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'github': 'GitHub',
            'sql': 'SQL',
            'mongodb': 'MongoDB',
            'postgresql': 'PostgreSQL'
        };

        properNouns.forEach(noun => {
            const pattern = new RegExp(`\\b${noun}\\b`, 'g');
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                // Check if it's properly capitalized
                const correctForm = correctCapitalization[noun];
                if (!text.includes(correctForm)) {
                    issues.push({
                        found: noun,
                        shouldBe: correctForm,
                        count: matches.length
                    });
                }
            }
        });

        const passed = issues.length === 0;
        const score = Math.max(70, 100 - issues.length * 5);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'low',
            message: passed
                ? 'Proper nouns and technical terms are correctly capitalized.'
                : `${issues.length} capitalization issues found in technical terms.`,
            recommendation: !passed
                ? 'Capitalize proper nouns correctly (e.g., JavaScript not javascript, AWS not aws).'
                : null,
            impact: 'low',
            details: {
                issues,
                note: 'Correct capitalization shows attention to detail.'
            }
        };
    }

    /**
     * Check 10: No excessive jargon
     */
    noExcessiveJargon(resumeData, options) {
        const text = this._extractAllText(resumeData);
        const jargonPhrases = [
            'synergy', 'leverage', 'paradigm', 'disrupt', 'innovate',
            'think outside the box', 'game changer', 'best of breed',
            'circle back', 'touch base', 'low-hanging fruit', 'move the needle',
            'drill down', 'bandwidth', 'scalable', 'robust solution'
        ];

        const foundJargon = [];
        jargonPhrases.forEach(phrase => {
            const pattern = new RegExp(phrase, 'gi');
            const matches = text.match(pattern);
            if (matches) {
                foundJargon.push({
                    phrase,
                    count: matches.length
                });
            }
        });

        const totalJargon = foundJargon.reduce((sum, j) => sum + j.count, 0);
        const wordCount = text.split(/\s+/).length;
        const jargonRate = (totalJargon / wordCount) * 100;

        const passed = jargonRate < 2;
        const score = Math.max(50, 100 - totalJargon * 10);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'low',
            message: passed
                ? 'Minimal jargon detected. Content is clear and professional.'
                : `${totalJargon} instances of business jargon detected. Use specific, concrete language.`,
            recommendation: !passed
                ? 'Replace jargon with specific, measurable achievements. Be concrete, not vague.'
                : null,
            impact: 'low',
            details: {
                foundJargon,
                totalInstances: totalJargon,
                jargonRate: jargonRate.toFixed(2) + '%',
                examples: [
                    'Instead of "leveraged synergies" → "coordinated with 3 teams"',
                    'Instead of "thought leader" → "published 5 industry articles"'
                ]
            }
        };
    }

    // Helper methods

    _failedCheck(message) {
        return {
            passed: false,
            score: 0,
            severity: 'error',
            message,
            recommendation: 'Ensure resume data is properly formatted.',
            impact: 'critical',
            details: {}
        };
    }

    _extractAllText(resumeData) {
        if (!resumeData.sections) return '';

        let text = '';
        resumeData.sections.forEach(section => {
            if (section.title) text += section.title + ' ';
            if (section.content) {
                text += JSON.stringify(section.content) + ' ';
            }
        });

        return text;
    }

    _extractBulletPoints(resumeData) {
        const bullets = [];

        if (!resumeData.sections) return bullets;

        resumeData.sections.forEach(section => {
            if (section.content && section.content.items) {
                section.content.items.forEach(item => {
                    if (item.description) {
                        bullets.push(item.description);
                    }
                    if (item.text) {
                        bullets.push(item.text);
                    }
                    if (item.bullets) {
                        bullets.push(...item.bullets);
                    }
                    if (Array.isArray(item)) {
                        bullets.push(item.join(' '));
                    }
                });
            }
        });

        return bullets;
    }

    _isStopWord(word) {
        const stopWords = [
            'the', 'and', 'for', 'with', 'from', 'this', 'that',
            'have', 'has', 'been', 'were', 'was', 'are', 'will'
        ];
        return stopWords.includes(word);
    }

    _calculateDensityScore(density) {
        if (density >= 2 && density <= 8) return 100;
        if (density < 2) return Math.max(50, density * 50);
        if (density > 8) return Math.max(50, 100 - (density - 8) * 10);
        return 50;
    }

    _isEmptyContent(content) {
        if (!content) return true;
        if (typeof content === 'string' && content.trim() === '') return true;
        if (typeof content === 'object') {
            const keys = Object.keys(content);
            if (keys.length === 0) return true;
            return keys.every(key => !content[key] || content[key].length === 0);
        }
        return false;
    }

    _isPastTenseVerb(word) {
        // Simple check for past tense (ends in 'ed')
        return word.endsWith('ed') && word.length > 3;
    }

    _detectGrammarIssues(text) {
        const issues = [];

        // Check for double spaces
        if (/\s{2,}/.test(text)) {
            issues.push({ type: 'spacing', message: 'Multiple consecutive spaces found' });
        }

        // Check for missing spaces after periods
        if (/\.[A-Z]/.test(text)) {
            issues.push({ type: 'spacing', message: 'Missing space after period' });
        }

        // Check for inconsistent capitalization after periods
        const sentences = text.split(/[.!?]\s+/);
        sentences.forEach(sentence => {
            if (sentence.length > 0 && /^[a-z]/.test(sentence)) {
                issues.push({ type: 'capitalization', message: 'Sentence should start with capital letter' });
            }
        });

        return issues.slice(0, 5); // Return max 5 issues
    }

    _detectIndustry(text) {
        const industries = {
            'software': ['software', 'developer', 'engineer', 'code', 'programming', 'javascript', 'python'],
            'marketing': ['marketing', 'campaign', 'brand', 'seo', 'content', 'social media'],
            'finance': ['finance', 'accounting', 'investment', 'trading', 'financial', 'banking'],
            'healthcare': ['healthcare', 'medical', 'patient', 'clinical', 'hospital', 'nurse'],
            'sales': ['sales', 'revenue', 'client', 'customer', 'quota', 'pipeline'],
            'data': ['data', 'analytics', 'machine learning', 'statistics', 'sql', 'tableau']
        };

        let maxMatches = 0;
        let detectedIndustry = 'general';

        Object.entries(industries).forEach(([industry, keywords]) => {
            const matches = keywords.filter(keyword => text.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedIndustry = industry;
            }
        });

        return detectedIndustry;
    }

    _getIndustryKeywords(industry) {
        const keywordSets = {
            'software': [
                'agile', 'scrum', 'git', 'api', 'rest', 'microservices',
                'testing', 'ci/cd', 'cloud', 'database', 'frontend', 'backend'
            ],
            'marketing': [
                'seo', 'sem', 'analytics', 'conversion', 'engagement',
                'roi', 'campaign', 'content strategy', 'social media', 'branding'
            ],
            'finance': [
                'financial analysis', 'forecasting', 'budgeting', 'compliance',
                'risk management', 'portfolio', 'gaap', 'financial modeling'
            ],
            'healthcare': [
                'patient care', 'hipaa', 'ehr', 'clinical', 'diagnosis',
                'treatment', 'medical records', 'healthcare compliance'
            ],
            'sales': [
                'b2b', 'b2c', 'crm', 'pipeline', 'quota', 'negotiation',
                'prospecting', 'client relations', 'revenue growth', 'forecasting'
            ],
            'data': [
                'python', 'sql', 'machine learning', 'data visualization',
                'statistics', 'etl', 'data warehouse', 'analytics', 'reporting'
            ],
            'general': [
                'management', 'leadership', 'communication', 'teamwork',
                'project management', 'problem solving', 'collaboration'
            ]
        };

        return keywordSets[industry] || keywordSets['general'];
    }

    /**
     * Get summary of all content checks
     */
    getSummary(results) {
        const total = results.length;
        const passed = results.filter(r => r.passed).length;
        const failed = total - passed;

        const critical = results.filter(r => r.severity === 'critical' && !r.passed);
        const high = results.filter(r => r.severity === 'high' && !r.passed);
        const medium = results.filter(r => r.severity === 'medium' && !r.passed);
        const low = results.filter(r => r.severity === 'low' && !r.passed);

        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / total;

        return {
            category: 'content',
            total,
            passed,
            failed,
            averageScore: Math.round(avgScore),
            severity: {
                critical: critical.length,
                high: high.length,
                medium: medium.length,
                low: low.length
            },
            issues: {
                critical: critical.map(r => r.message),
                high: high.map(r => r.message),
                medium: medium.map(r => r.message),
                low: low.map(r => r.message)
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentChecks;
}
