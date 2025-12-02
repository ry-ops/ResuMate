/**
 * Resume-to-Job Mapper
 * Maps resume content to job requirements and calculates match percentages
 */

class ResumeJobMapper {
    constructor() {
        this.weights = {
            requiredSkills: 0.35,
            preferredSkills: 0.15,
            keywords: 0.25,
            tools: 0.15,
            experience: 0.10
        };
    }

    /**
     * Calculate match percentage between resume and job
     * @param {Object} resumeData - Resume sections and content
     * @param {Object} jobData - Parsed job description data
     * @returns {Object} Match analysis with percentage and details
     */
    calculateMatch(resumeData, jobData) {
        console.log('[Mapper] Calculating resume-to-job match...');

        // Extract all text from resume
        const resumeText = this.extractResumeText(resumeData);
        const resumeTextLower = resumeText.toLowerCase();

        // Calculate individual match scores
        const requiredSkillsMatch = this.calculateSkillsMatch(
            resumeTextLower,
            jobData.requiredSkills || []
        );

        const preferredSkillsMatch = this.calculateSkillsMatch(
            resumeTextLower,
            jobData.preferredSkills || []
        );

        const keywordsMatch = this.calculateSkillsMatch(
            resumeTextLower,
            jobData.keywords || []
        );

        const toolsMatch = this.calculateSkillsMatch(
            resumeTextLower,
            jobData.tools || []
        );

        const experienceMatch = this.calculateExperienceMatch(
            resumeData,
            jobData.requiredExperience
        );

        // Calculate weighted overall score
        const overallScore = (
            requiredSkillsMatch.percentage * this.weights.requiredSkills +
            preferredSkillsMatch.percentage * this.weights.preferredSkills +
            keywordsMatch.percentage * this.weights.keywords +
            toolsMatch.percentage * this.weights.tools +
            experienceMatch.percentage * this.weights.experience
        );

        // Identify gaps
        const gaps = {
            missingRequiredSkills: requiredSkillsMatch.missing,
            missingPreferredSkills: preferredSkillsMatch.missing,
            missingKeywords: keywordsMatch.missing,
            missingTools: toolsMatch.missing
        };

        // Generate recommendations
        const recommendations = this.generateRecommendations(gaps, overallScore);

        const result = {
            overallScore: Math.round(overallScore),
            breakdown: {
                requiredSkills: Math.round(requiredSkillsMatch.percentage),
                preferredSkills: Math.round(preferredSkillsMatch.percentage),
                keywords: Math.round(keywordsMatch.percentage),
                tools: Math.round(toolsMatch.percentage),
                experience: Math.round(experienceMatch.percentage)
            },
            matched: {
                requiredSkills: requiredSkillsMatch.matched,
                preferredSkills: preferredSkillsMatch.matched,
                keywords: keywordsMatch.matched,
                tools: toolsMatch.matched
            },
            gaps: gaps,
            recommendations: recommendations,
            grade: this.getGrade(overallScore)
        };

        console.log('[Mapper] Match calculation complete:', result.overallScore + '%');
        return result;
    }

    /**
     * Calculate skills match
     * @param {string} resumeText - Resume text (lowercase)
     * @param {Array<string>} requiredSkills - Skills to check for
     * @returns {Object} Match results
     */
    calculateSkillsMatch(resumeText, requiredSkills) {
        if (!requiredSkills || requiredSkills.length === 0) {
            return { percentage: 100, matched: [], missing: [] };
        }

        const matched = [];
        const missing = [];

        requiredSkills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            // Check for exact match or word boundary match
            const regex = new RegExp(`\\b${this.escapeRegex(skillLower)}\\b`, 'i');

            if (regex.test(resumeText)) {
                matched.push(skill);
            } else {
                missing.push(skill);
            }
        });

        const percentage = (matched.length / requiredSkills.length) * 100;

        return {
            percentage: percentage,
            matched: matched,
            missing: missing,
            total: requiredSkills.length
        };
    }

    /**
     * Calculate experience match
     * @param {Object} resumeData - Resume data
     * @param {string} requiredExperience - Required experience description
     * @returns {Object} Experience match result
     */
    calculateExperienceMatch(resumeData, requiredExperience) {
        if (!requiredExperience) {
            return { percentage: 100, details: 'No specific requirement' };
        }

        // Extract years from experience sections
        const experienceSections = resumeData.sections?.filter(s =>
            s.type === 'experience' || s.type === 'work-experience'
        ) || [];

        let totalYears = 0;

        experienceSections.forEach(section => {
            const items = section.content?.items || [];
            items.forEach(item => {
                const years = this.extractYearsFromDates(item.startDate, item.endDate);
                totalYears += years;
            });
        });

        // Extract required years from job requirement
        const requiredYearsMatch = requiredExperience.match(/(\d+)[\s-]*(?:years?|yrs?)/i);
        const requiredYears = requiredYearsMatch ? parseInt(requiredYearsMatch[1]) : 0;

        let percentage = 100;
        if (requiredYears > 0) {
            percentage = Math.min((totalYears / requiredYears) * 100, 100);
        }

        return {
            percentage: percentage,
            details: `${totalYears} years found, ${requiredYears} required`,
            totalYears: totalYears,
            requiredYears: requiredYears
        };
    }

    /**
     * Extract years from date range
     * @param {string} startDate - Start date
     * @param {string} endDate - End date (or 'Present')
     * @returns {number} Years of experience
     */
    extractYearsFromDates(startDate, endDate) {
        if (!startDate) return 0;

        try {
            const start = new Date(startDate);
            const end = endDate && endDate.toLowerCase() !== 'present'
                ? new Date(endDate)
                : new Date();

            const diffMs = end - start;
            const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
            return Math.max(0, years);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Extract all text from resume sections
     * @param {Object} resumeData - Resume data
     * @returns {string} Combined text
     */
    extractResumeText(resumeData) {
        let text = '';

        if (resumeData.sections) {
            resumeData.sections.forEach(section => {
                // Add section title
                text += ' ' + (section.title || '');

                // Add content based on section type
                if (section.content) {
                    if (section.content.text) {
                        text += ' ' + section.content.text;
                    }
                    if (section.content.items) {
                        section.content.items.forEach(item => {
                            Object.values(item).forEach(value => {
                                if (typeof value === 'string') {
                                    text += ' ' + value;
                                }
                                if (Array.isArray(value)) {
                                    text += ' ' + value.join(' ');
                                }
                            });
                        });
                    }
                }
            });
        }

        return text;
    }

    /**
     * Generate recommendations based on gaps
     * @param {Object} gaps - Identified gaps
     * @param {number} score - Overall match score
     * @returns {Array<Object>} Recommendations
     */
    generateRecommendations(gaps, score) {
        const recommendations = [];

        // Priority 1: Missing required skills
        if (gaps.missingRequiredSkills.length > 0) {
            recommendations.push({
                priority: 'high',
                type: 'required_skills',
                title: 'Add Missing Required Skills',
                description: `The job requires these skills that are not clearly visible in your resume: ${gaps.missingRequiredSkills.slice(0, 5).join(', ')}`,
                action: 'Add these skills to your Skills section or incorporate them into your experience descriptions',
                impact: 'high',
                skills: gaps.missingRequiredSkills
            });
        }

        // Priority 2: Missing keywords
        if (gaps.missingKeywords.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'keywords',
                title: 'Incorporate Missing Keywords',
                description: `Important keywords from the job description: ${gaps.missingKeywords.slice(0, 5).join(', ')}`,
                action: 'Naturally incorporate these keywords into your bullet points and descriptions',
                impact: 'medium',
                keywords: gaps.missingKeywords
            });
        }

        // Priority 3: Missing tools
        if (gaps.missingTools.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'tools',
                title: 'Add Relevant Tools and Technologies',
                description: `The job mentions these tools: ${gaps.missingTools.slice(0, 5).join(', ')}`,
                action: 'Add a Tools/Technologies section or mention them in context of your work',
                impact: 'medium',
                tools: gaps.missingTools
            });
        }

        // Priority 4: Preferred skills (nice to have)
        if (gaps.missingPreferredSkills.length > 0) {
            recommendations.push({
                priority: 'low',
                type: 'preferred_skills',
                title: 'Highlight Preferred Skills',
                description: `Consider highlighting these preferred skills if you have them: ${gaps.missingPreferredSkills.slice(0, 5).join(', ')}`,
                action: 'Add any matching preferred skills to stand out from other candidates',
                impact: 'low',
                skills: gaps.missingPreferredSkills
            });
        }

        // Overall recommendations based on score
        if (score < 50) {
            recommendations.unshift({
                priority: 'critical',
                type: 'overall',
                title: 'Significant Resume Tailoring Needed',
                description: 'Your resume match is below 50%. Consider whether this role aligns with your experience.',
                action: 'Review the job requirements carefully and tailor your resume significantly',
                impact: 'critical'
            });
        } else if (score < 70) {
            recommendations.unshift({
                priority: 'high',
                type: 'overall',
                title: 'Resume Needs Moderate Tailoring',
                description: 'Your resume shows some alignment but needs improvement to be competitive.',
                action: 'Focus on highlighting relevant skills and experiences',
                impact: 'high'
            });
        }

        return recommendations;
    }

    /**
     * Get letter grade based on score
     * @param {number} score - Match score
     * @returns {string} Letter grade
     */
    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Escape regex special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Create singleton instance
const resumeJobMapper = new ResumeJobMapper();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = resumeJobMapper;
}
