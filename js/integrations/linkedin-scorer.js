// LinkedIn Profile Scorer
// Analyzes profile completeness and provides recommendations

/**
 * LinkedIn Profile Scorer Class
 * Calculates profile completeness score and provides recommendations
 */
class LinkedInScorer {
    constructor() {
        this.weights = {
            headline: 10,
            summary: 15,
            profilePhoto: 5,
            backgroundPhoto: 3,
            experience: 25,
            education: 15,
            skills: 12,
            certifications: 5,
            projects: 3,
            publications: 2,
            languages: 2,
            volunteering: 2,
            recommendations: 1
        };

        this.optimalCounts = {
            skills: { min: 10, optimal: 30, max: 50 },
            experience: { min: 2, optimal: 4 },
            education: { min: 1, optimal: 2 },
            certifications: { min: 1, optimal: 3 },
            projects: { min: 2, optimal: 4 },
            publications: { min: 1, optimal: 3 }
        };
    }

    /**
     * Calculate comprehensive profile score
     * @param {Object} profile - LinkedIn profile data
     * @returns {Object} - Score breakdown and recommendations
     */
    calculateScore(profile) {
        const scores = {
            headline: this._scoreHeadline(profile.headline),
            summary: this._scoreSummary(profile.summary),
            experience: this._scoreExperience(profile.experience),
            education: this._scoreEducation(profile.education),
            skills: this._scoreSkills(profile.skills),
            certifications: this._scoreCertifications(profile.certifications),
            projects: this._scoreProjects(profile.projects),
            publications: this._scorePublications(profile.publications),
            languages: this._scoreLanguages(profile.languages)
        };

        // Calculate weighted total
        let totalScore = 0;
        let maxPossibleScore = 0;

        for (const [section, score] of Object.entries(scores)) {
            const weight = this.weights[section] || 0;
            totalScore += score.score * weight;
            maxPossibleScore += weight;
        }

        const finalScore = Math.round((totalScore / maxPossibleScore) * 100);

        return {
            overallScore: finalScore,
            grade: this._getGrade(finalScore),
            sectionScores: scores,
            recommendations: this._generateRecommendations(scores, profile),
            strengths: this._identifyStrengths(scores),
            weaknesses: this._identifyWeaknesses(scores),
            keywordCoverage: this._analyzeKeywordCoverage(profile),
            completenessLevel: this._getCompletenessLevel(finalScore)
        };
    }

    /**
     * Score headline section
     * @param {string} headline - LinkedIn headline
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreHeadline(headline) {
        if (!headline || headline.trim().length === 0) {
            return {
                score: 0,
                feedback: 'No headline present',
                recommendation: 'Add a compelling headline with your role and value proposition'
            };
        }

        const length = headline.length;
        let score = 0;
        const feedback = [];

        // Length scoring (0-120 chars)
        if (length >= 80 && length <= 120) {
            score += 0.4;
            feedback.push('Good length');
        } else if (length >= 50) {
            score += 0.3;
            feedback.push('Could be longer for better SEO');
        } else {
            score += 0.1;
            feedback.push('Too short - aim for 80-120 characters');
        }

        // Check for role/title
        const hasRole = /\b(engineer|developer|manager|director|designer|analyst|consultant|specialist)\b/i.test(headline);
        if (hasRole) {
            score += 0.3;
            feedback.push('Includes role/title');
        } else {
            feedback.push('Should include your role or title');
        }

        // Check for skills/expertise
        const hasSkills = /\b(expert|specialist|proficient|experienced|skilled)\b/i.test(headline) ||
                          headline.split('|').length > 1;
        if (hasSkills) {
            score += 0.2;
            feedback.push('Highlights skills or expertise');
        } else {
            feedback.push('Add key skills or areas of expertise');
        }

        // Check for value proposition
        const hasValue = /\b(helping|building|creating|leading|driving|transforming|improving)\b/i.test(headline);
        if (hasValue) {
            score += 0.1;
            feedback.push('Includes value proposition');
        } else {
            feedback.push('Consider adding what value you provide');
        }

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            feedback: feedback.join('; '),
            recommendation: score < 0.7 ? 'Optimize headline to include role, skills, and value proposition' : 'Headline looks good'
        };
    }

    /**
     * Score summary/about section
     * @param {string} summary - LinkedIn summary
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreSummary(summary) {
        if (!summary || summary.trim().length === 0) {
            return {
                score: 0,
                feedback: 'No summary/about section',
                recommendation: 'Add a compelling summary (aim for 1200-2000 characters)'
            };
        }

        const length = summary.length;
        const wordCount = summary.split(/\s+/).length;
        const paragraphs = summary.split(/\n\s*\n/).filter(p => p.trim()).length;
        let score = 0;
        const feedback = [];

        // Length scoring
        if (length >= 1200 && length <= 2000) {
            score += 0.4;
            feedback.push('Optimal length');
        } else if (length >= 500) {
            score += 0.3;
            feedback.push('Good length, could be expanded');
        } else if (length >= 200) {
            score += 0.2;
            feedback.push('Too short - add more detail');
        } else {
            score += 0.1;
            feedback.push('Much too short');
        }

        // Paragraph structure
        if (paragraphs >= 3 && paragraphs <= 5) {
            score += 0.2;
            feedback.push('Good paragraph structure');
        } else if (paragraphs >= 2) {
            score += 0.1;
            feedback.push('Add more paragraphs for better readability');
        } else {
            feedback.push('Break into multiple paragraphs');
        }

        // First-person voice check
        const hasFirstPerson = /\b(I|I'm|my|me)\b/i.test(summary);
        if (hasFirstPerson) {
            score += 0.1;
            feedback.push('Uses first-person voice (good for LinkedIn)');
        } else {
            feedback.push('Consider using first-person voice');
        }

        // Metrics/numbers check
        const hasMetrics = /\b\d+[%+]|\$\d+|[\d,]+\s+(users|customers|clients|projects|teams)\b/i.test(summary);
        if (hasMetrics) {
            score += 0.15;
            feedback.push('Includes metrics and numbers');
        } else {
            feedback.push('Add metrics and achievements');
        }

        // Call to action check
        const hasCTA = /\b(reach out|connect|contact|discuss|collaborate|let's talk)\b/i.test(summary);
        if (hasCTA) {
            score += 0.15;
            feedback.push('Includes call to action');
        } else {
            feedback.push('Add a call to action at the end');
        }

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            length,
            wordCount,
            paragraphs,
            feedback: feedback.join('; '),
            recommendation: score < 0.7 ? 'Expand summary with achievements, metrics, and call to action' : 'Summary is strong'
        };
    }

    /**
     * Score experience section
     * @param {Array} experience - Experience entries
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreExperience(experience = []) {
        if (!experience || experience.length === 0) {
            return {
                score: 0,
                feedback: 'No experience listed',
                recommendation: 'Add your work experience'
            };
        }

        let score = 0;
        const feedback = [];

        // Count scoring
        const count = experience.length;
        if (count >= this.optimalCounts.experience.optimal) {
            score += 0.3;
            feedback.push(`Good number of positions (${count})`);
        } else if (count >= this.optimalCounts.experience.min) {
            score += 0.2;
            feedback.push(`${count} positions listed`);
        } else {
            score += 0.1;
            feedback.push('Add more work experience');
        }

        // Check descriptions
        let descriptionsCount = 0;
        let descriptionTotalLength = 0;
        let hasMetrics = 0;

        for (const exp of experience) {
            if (exp.description && exp.description.length > 50) {
                descriptionsCount++;
                descriptionTotalLength += exp.description.length;

                // Check for metrics
                if (/\b\d+[%+]|\$\d+|[\d,]+\s+(users|customers|clients)\b/i.test(exp.description)) {
                    hasMetrics++;
                }
            }
        }

        // Description completeness
        const descriptionRate = descriptionsCount / count;
        if (descriptionRate >= 0.8) {
            score += 0.3;
            feedback.push('Most positions have descriptions');
        } else if (descriptionRate >= 0.5) {
            score += 0.2;
            feedback.push('Some positions need descriptions');
        } else {
            score += 0.1;
            feedback.push('Add descriptions to all positions');
        }

        // Metrics in descriptions
        const metricsRate = hasMetrics / count;
        if (metricsRate >= 0.5) {
            score += 0.2;
            feedback.push('Good use of metrics');
        } else if (metricsRate > 0) {
            score += 0.1;
            feedback.push('Add more metrics to descriptions');
        } else {
            feedback.push('Include metrics and achievements');
        }

        // Average description length
        const avgDescLength = descriptionsCount > 0 ? descriptionTotalLength / descriptionsCount : 0;
        if (avgDescLength >= 300) {
            score += 0.2;
            feedback.push('Detailed descriptions');
        } else if (avgDescLength >= 150) {
            score += 0.1;
            feedback.push('Descriptions could be more detailed');
        } else if (descriptionsCount > 0) {
            feedback.push('Expand descriptions with more detail');
        }

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            count,
            withDescriptions: descriptionsCount,
            withMetrics: hasMetrics,
            feedback: feedback.join('; '),
            recommendation: score < 0.7 ? 'Add detailed descriptions with metrics to all positions' : 'Experience section is strong'
        };
    }

    /**
     * Score education section
     * @param {Array} education - Education entries
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreEducation(education = []) {
        if (!education || education.length === 0) {
            return {
                score: 0,
                feedback: 'No education listed',
                recommendation: 'Add your education history'
            };
        }

        let score = 0.5; // Base score for having education
        const feedback = [];

        const count = education.length;
        if (count >= 2) {
            score += 0.3;
            feedback.push(`${count} degrees listed`);
        } else {
            feedback.push('At least one degree listed');
        }

        // Check for degree details
        let hasDetails = 0;
        for (const edu of education) {
            if (edu.degree && edu.field) {
                hasDetails++;
            }
        }

        if (hasDetails === count) {
            score += 0.2;
            feedback.push('All degrees have details');
        } else if (hasDetails > 0) {
            score += 0.1;
            feedback.push('Some degrees missing details');
        } else {
            feedback.push('Add degree type and field of study');
        }

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            count,
            withDetails: hasDetails,
            feedback: feedback.join('; '),
            recommendation: score < 0.8 ? 'Ensure all education entries have complete details' : 'Education section looks good'
        };
    }

    /**
     * Score skills section
     * @param {Array} skills - Skills list
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreSkills(skills = []) {
        if (!skills || skills.length === 0) {
            return {
                score: 0,
                feedback: 'No skills listed',
                recommendation: 'Add at least 10 relevant skills'
            };
        }

        const count = skills.length;
        let score = 0;
        const feedback = [];

        const { min, optimal, max } = this.optimalCounts.skills;

        if (count >= optimal && count <= max) {
            score = 1.0;
            feedback.push(`Optimal number of skills (${count})`);
        } else if (count >= min && count < optimal) {
            score = 0.6 + ((count - min) / (optimal - min)) * 0.4;
            feedback.push(`Good skill count, add ${optimal - count} more to reach optimal`);
        } else if (count > max) {
            score = 0.8;
            feedback.push(`Too many skills (${count}), consider removing less relevant ones`);
        } else {
            score = count / min * 0.6;
            feedback.push(`Add more skills (${min - count} more to minimum)`);
        }

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            count,
            optimal: optimal,
            feedback: feedback.join('; '),
            recommendation: count < optimal ? `Add ${optimal - count} more relevant skills` : 'Skill count is optimal'
        };
    }

    /**
     * Score certifications section
     * @param {Array} certifications - Certifications list
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreCertifications(certifications = []) {
        const count = certifications.length;

        if (count === 0) {
            return {
                score: 0,
                count: 0,
                feedback: 'No certifications',
                recommendation: 'Add relevant certifications to boost credibility'
            };
        }

        const { min, optimal } = this.optimalCounts.certifications;
        let score = 0;

        if (count >= optimal) {
            score = 1.0;
        } else if (count >= min) {
            score = 0.6 + ((count - min) / (optimal - min)) * 0.4;
        } else {
            score = count / min * 0.6;
        }

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            count,
            feedback: `${count} certification(s) listed`,
            recommendation: count < optimal ? 'Consider adding more relevant certifications' : 'Good certification count'
        };
    }

    /**
     * Score projects section
     * @param {Array} projects - Projects list
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreProjects(projects = []) {
        const count = projects.length;

        if (count === 0) {
            return {
                score: 0,
                count: 0,
                feedback: 'No projects listed',
                recommendation: 'Add 2-4 key projects to showcase your work'
            };
        }

        const { min, optimal } = this.optimalCounts.projects;
        let score = count >= optimal ? 1.0 : (count / optimal);

        return {
            score: Math.min(1, score),
            percentage: Math.round(Math.min(1, score) * 100),
            count,
            feedback: `${count} project(s) listed`,
            recommendation: count < optimal ? `Add ${optimal - count} more projects` : 'Good project showcase'
        };
    }

    /**
     * Score publications section
     * @param {Array} publications - Publications list
     * @returns {Object} - Score and feedback
     * @private
     */
    _scorePublications(publications = []) {
        const count = publications.length;

        if (count === 0) {
            return {
                score: 0.5, // Neutral - not everyone has publications
                count: 0,
                feedback: 'No publications',
                recommendation: 'Add publications if applicable to your field'
            };
        }

        return {
            score: 1.0,
            percentage: 100,
            count,
            feedback: `${count} publication(s) listed`,
            recommendation: 'Publications strengthen your profile'
        };
    }

    /**
     * Score languages section
     * @param {Array} languages - Languages list
     * @returns {Object} - Score and feedback
     * @private
     */
    _scoreLanguages(languages = []) {
        const count = languages.length;

        if (count === 0) {
            return {
                score: 0.5, // Neutral - not critical
                count: 0,
                feedback: 'No languages listed',
                recommendation: 'Add languages you speak (improves searchability)'
            };
        }

        const score = count >= 2 ? 1.0 : 0.7;

        return {
            score,
            percentage: Math.round(score * 100),
            count,
            feedback: `${count} language(s) listed`,
            recommendation: count < 2 ? 'Add more languages if applicable' : 'Good language diversity'
        };
    }

    /**
     * Generate comprehensive recommendations
     * @param {Object} scores - Section scores
     * @param {Object} profile - Full profile data
     * @returns {Array} - Prioritized recommendations
     * @private
     */
    _generateRecommendations(scores, profile) {
        const recommendations = [];

        // Sort by score (lowest first) and weight
        const sortedSections = Object.entries(scores).sort((a, b) => {
            const scoreA = a[1].score * (this.weights[a[0]] || 1);
            const scoreB = b[1].score * (this.weights[b[0]] || 1);
            return scoreA - scoreB;
        });

        for (const [section, data] of sortedSections) {
            if (data.score < 0.7) {
                recommendations.push({
                    section,
                    priority: data.score < 0.3 ? 'high' : data.score < 0.6 ? 'medium' : 'low',
                    currentScore: Math.round(data.score * 100),
                    recommendation: data.recommendation,
                    impact: this.weights[section] || 1
                });
            }
        }

        return recommendations;
    }

    /**
     * Identify profile strengths
     * @param {Object} scores - Section scores
     * @returns {Array} - Strength areas
     * @private
     */
    _identifyStrengths(scores) {
        return Object.entries(scores)
            .filter(([section, data]) => data.score >= 0.8)
            .map(([section, data]) => ({
                section,
                score: Math.round(data.score * 100),
                feedback: data.feedback
            }))
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Identify profile weaknesses
     * @param {Object} scores - Section scores
     * @returns {Array} - Weakness areas
     * @private
     */
    _identifyWeaknesses(scores) {
        return Object.entries(scores)
            .filter(([section, data]) => data.score < 0.5)
            .map(([section, data]) => ({
                section,
                score: Math.round(data.score * 100),
                feedback: data.feedback
            }))
            .sort((a, b) => a.score - b.score);
    }

    /**
     * Analyze keyword coverage
     * @param {Object} profile - Profile data
     * @returns {Object} - Keyword analysis
     * @private
     */
    _analyzeKeywordCoverage(profile) {
        const allText = [
            profile.headline || '',
            profile.summary || '',
            ...profile.experience.map(e => e.description || ''),
            ...profile.skills
        ].join(' ').toLowerCase();

        const wordCount = allText.split(/\s+/).length;
        const uniqueWords = new Set(allText.split(/\s+/).filter(w => w.length > 3)).size;

        return {
            totalWords: wordCount,
            uniqueWords,
            diversity: wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0,
            recommendation: uniqueWords < 100 ? 'Expand vocabulary and add industry-specific keywords' : 'Good keyword diversity'
        };
    }

    /**
     * Get grade based on score
     * @param {number} score - Overall score (0-100)
     * @returns {string} - Letter grade
     * @private
     */
    _getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Get completeness level description
     * @param {number} score - Overall score (0-100)
     * @returns {string} - Completeness level
     * @private
     */
    _getCompletenessLevel(score) {
        if (score >= 90) return 'All-Star (Top 1%)';
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Strong';
        if (score >= 60) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Needs Improvement';
    }
}

// Create global instance
const linkedInScorer = new LinkedInScorer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LinkedInScorer, linkedInScorer };
}
