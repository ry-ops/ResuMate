// Cover Letter Structure Utilities
// Handles parsing, validation, and formatting of cover letter structure

/**
 * Cover Letter Structure Manager
 * Provides utilities for working with structured cover letters
 */
class CoverLetterStructure {
    constructor() {
        this.defaultStructure = {
            opening: '',
            body1: '',
            body2: '',
            body3: '',
            closing: ''
        };

        this.sectionLabels = {
            opening: 'Opening Paragraph',
            body1: 'Relevant Experience',
            body2: 'Skills & Achievements',
            body3: 'Company Interest & Fit',
            closing: 'Closing & Call to Action'
        };

        this.sectionDescriptions = {
            opening: 'Hook, position mention, and statement of interest (2-3 sentences)',
            body1: 'Most relevant experience matching job requirements (3-4 sentences)',
            body2: 'Key skills and achievements with metrics (3-4 sentences)',
            body3: 'Why this company and cultural fit (2-3 sentences)',
            closing: 'Thank you, call to action, and availability (2-3 sentences)'
        };
    }

    /**
     * Parse a complete cover letter into structured sections
     * @param {string} letterText - Full cover letter text
     * @returns {Object} - Structured sections
     */
    parseLetterIntoSections(letterText) {
        if (!letterText || typeof letterText !== 'string') {
            return { ...this.defaultStructure };
        }

        // Remove greeting and signature if present
        let cleaned = letterText.trim();

        // Remove common greetings
        cleaned = cleaned.replace(/^(Dear\s+.*?,?\s*)/i, '');

        // Remove common closings and signatures
        cleaned = cleaned.replace(/\n(Sincerely|Best regards|Kind regards|Warm regards|Thank you|Regards).*$/is, '');

        // Split into paragraphs
        const paragraphs = cleaned
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const structure = { ...this.defaultStructure };

        if (paragraphs.length >= 5) {
            // Full 5-paragraph structure
            structure.opening = paragraphs[0];
            structure.body1 = paragraphs[1];
            structure.body2 = paragraphs[2];
            structure.body3 = paragraphs[3];
            structure.closing = paragraphs[4];
        } else if (paragraphs.length === 4) {
            // 4 paragraphs - combine body sections
            structure.opening = paragraphs[0];
            structure.body1 = paragraphs[1];
            structure.body2 = paragraphs[2];
            structure.closing = paragraphs[3];
        } else if (paragraphs.length === 3) {
            // 3 paragraphs - minimal structure
            structure.opening = paragraphs[0];
            structure.body1 = paragraphs[1];
            structure.closing = paragraphs[2];
        } else if (paragraphs.length === 2) {
            structure.opening = paragraphs[0];
            structure.closing = paragraphs[1];
        } else if (paragraphs.length === 1) {
            structure.opening = paragraphs[0];
        }

        return structure;
    }

    /**
     * Assemble structured sections into a complete cover letter
     * @param {Object} structure - Structured sections
     * @param {Object} options - Formatting options
     * @returns {string} - Complete formatted cover letter
     */
    assembleLetter(structure, options = {}) {
        const {
            includeGreeting = true,
            includeClosing = true,
            contactName = '',
            candidateName = '',
            candidateEmail = '',
            candidatePhone = ''
        } = options;

        let letter = '';

        // Add greeting
        if (includeGreeting) {
            const greeting = contactName
                ? `Dear ${contactName},`
                : 'Dear Hiring Manager,';
            letter += greeting + '\n\n';
        }

        // Add sections in order
        const sections = ['opening', 'body1', 'body2', 'body3', 'closing'];
        for (const section of sections) {
            const content = structure[section];
            if (content && content.trim().length > 0) {
                letter += content.trim() + '\n\n';
            }
        }

        // Add closing signature
        if (includeClosing) {
            letter += 'Sincerely,\n\n';
            if (candidateName) {
                letter += candidateName + '\n';
            }
            if (candidateEmail) {
                letter += candidateEmail + '\n';
            }
            if (candidatePhone) {
                letter += candidatePhone + '\n';
            }
        }

        return letter.trim();
    }

    /**
     * Validate cover letter structure and content
     * @param {Object} structure - Structured sections
     * @returns {Object} - Validation results
     */
    validateStructure(structure) {
        const issues = [];
        const warnings = [];
        let score = 100;

        // Check required sections
        if (!structure.opening || structure.opening.trim().length === 0) {
            issues.push({
                section: 'opening',
                severity: 'high',
                message: 'Opening paragraph is missing'
            });
            score -= 30;
        }

        if (!structure.closing || structure.closing.trim().length === 0) {
            issues.push({
                section: 'closing',
                severity: 'high',
                message: 'Closing paragraph is missing'
            });
            score -= 20;
        }

        if (!structure.body1 || structure.body1.trim().length === 0) {
            issues.push({
                section: 'body1',
                severity: 'medium',
                message: 'Experience section is missing'
            });
            score -= 20;
        }

        // Check word counts
        const wordCounts = this.getWordCounts(structure);
        const totalWords = Object.values(wordCounts).reduce((sum, count) => sum + count, 0);

        if (totalWords < 150) {
            warnings.push({
                type: 'length',
                severity: 'medium',
                message: `Cover letter is too short (${totalWords} words). Aim for 200-400 words.`
            });
            score -= 10;
        } else if (totalWords > 500) {
            warnings.push({
                type: 'length',
                severity: 'low',
                message: `Cover letter is quite long (${totalWords} words). Consider reducing to 300-400 words.`
            });
            score -= 5;
        }

        // Check sentence structure
        for (const [section, content] of Object.entries(structure)) {
            if (content && content.trim().length > 0) {
                const sentences = this.countSentences(content);
                const words = this.countWords(content);

                if (section === 'opening' && sentences < 2) {
                    warnings.push({
                        section,
                        type: 'structure',
                        severity: 'low',
                        message: 'Opening paragraph should have 2-3 sentences'
                    });
                }

                if (section === 'closing' && sentences < 2) {
                    warnings.push({
                        section,
                        type: 'structure',
                        severity: 'low',
                        message: 'Closing paragraph should have 2-3 sentences'
                    });
                }

                // Check for overly long paragraphs
                if (words > 150) {
                    warnings.push({
                        section,
                        type: 'length',
                        severity: 'low',
                        message: `${this.sectionLabels[section]} is quite long. Consider breaking it up.`
                    });
                }
            }
        }

        return {
            isValid: issues.length === 0,
            score: Math.max(0, Math.min(100, score)),
            issues,
            warnings,
            wordCount: totalWords,
            sectionCounts: wordCounts
        };
    }

    /**
     * Get word counts for each section
     * @param {Object} structure - Structured sections
     * @returns {Object} - Word counts by section
     */
    getWordCounts(structure) {
        const counts = {};
        for (const [section, content] of Object.entries(structure)) {
            counts[section] = this.countWords(content || '');
        }
        return counts;
    }

    /**
     * Count words in text
     * @param {string} text - Text to count
     * @returns {number} - Word count
     */
    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    /**
     * Count sentences in text
     * @param {string} text - Text to count
     * @returns {number} - Sentence count
     */
    countSentences(text) {
        if (!text) return 0;
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    }

    /**
     * Extract greeting from cover letter
     * @param {string} letterText - Full cover letter text
     * @returns {Object} - Greeting info
     */
    extractGreeting(letterText) {
        const greetingMatch = letterText.match(/^(Dear\s+([^,\n]+),?)/i);
        if (greetingMatch) {
            return {
                full: greetingMatch[1],
                name: greetingMatch[2].trim()
            };
        }
        return { full: '', name: '' };
    }

    /**
     * Extract closing signature from cover letter
     * @param {string} letterText - Full cover letter text
     * @returns {Object} - Closing info
     */
    extractClosing(letterText) {
        const closingMatch = letterText.match(/\n(Sincerely|Best regards|Kind regards|Warm regards|Thank you|Regards),?\s*\n+(.*)$/is);
        if (closingMatch) {
            const signatureText = closingMatch[2].trim();
            const lines = signatureText.split('\n').map(l => l.trim());

            return {
                style: closingMatch[1],
                name: lines[0] || '',
                email: lines.find(l => l.includes('@')) || '',
                phone: lines.find(l => /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(l)) || ''
            };
        }
        return { style: 'Sincerely', name: '', email: '', phone: '' };
    }

    /**
     * Format letter for display with section markers
     * @param {Object} structure - Structured sections
     * @returns {string} - Formatted HTML
     */
    formatWithSectionMarkers(structure) {
        let html = '';

        for (const [section, content] of Object.entries(structure)) {
            if (content && content.trim().length > 0) {
                const label = this.sectionLabels[section];
                const description = this.sectionDescriptions[section];
                html += `<div class="letter-section" data-section="${section}">
                    <div class="section-label" title="${description}">${label}</div>
                    <div class="section-content">${this.escapeHtml(content)}</div>
                </div>\n`;
            }
        }

        return html;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Analyze opening paragraph for common issues
     * @param {string} opening - Opening paragraph text
     * @returns {Object} - Analysis results
     */
    analyzeOpening(opening) {
        const issues = [];
        const suggestions = [];

        if (!opening || opening.trim().length === 0) {
            return { score: 0, issues: [{ message: 'Opening is missing' }], suggestions: [] };
        }

        let score = 100;

        // Check for weak openings
        const weakPhrases = [
            'I am writing to apply',
            'I am interested in',
            'I would like to apply',
            'I saw your posting',
            'I am submitting my resume'
        ];

        for (const phrase of weakPhrases) {
            if (opening.toLowerCase().includes(phrase.toLowerCase())) {
                issues.push({
                    type: 'weak_opening',
                    text: phrase,
                    message: 'Opening uses a generic, overused phrase'
                });
                suggestions.push('Start with a compelling hook or achievement instead of a generic statement');
                score -= 15;
                break;
            }
        }

        // Check for position title mention
        if (!opening.match(/\b(position|role|opportunity)\b/i)) {
            issues.push({
                type: 'missing_position',
                message: 'Opening should mention the specific position'
            });
            suggestions.push('Clearly state the position you\'re applying for');
            score -= 10;
        }

        // Check length
        const words = this.countWords(opening);
        if (words < 20) {
            issues.push({
                type: 'too_short',
                message: 'Opening is too brief'
            });
            suggestions.push('Expand the opening to 2-3 sentences that hook the reader');
            score -= 10;
        } else if (words > 80) {
            issues.push({
                type: 'too_long',
                message: 'Opening is too long'
            });
            suggestions.push('Keep the opening concise and punchy (2-3 sentences)');
            score -= 5;
        }

        return {
            score: Math.max(0, score),
            issues,
            suggestions
        };
    }

    /**
     * Get template structure for a specific type
     * @param {string} templateType - Type of template
     * @returns {Object} - Template structure with placeholders
     */
    getTemplateStructure(templateType) {
        const templates = {
            traditional: {
                opening: 'I am writing to express my strong interest in the [Position] role at [Company]. With [X years] of experience in [Industry/Field], I am confident that my background in [Key Skill] makes me an excellent candidate for this position.',
                body1: 'In my current role as [Current Title], I have [Achievement 1]. This experience has given me deep expertise in [Skill 1] and [Skill 2], which directly align with the requirements outlined in your job description.',
                body2: 'Throughout my career, I have consistently [Achievement 2]. For example, [Specific Example]. I am particularly proud of [Notable Accomplishment], which demonstrates my ability to [Key Capability].',
                body3: '[Company] stands out to me because [Why Company]. Your commitment to [Company Value] aligns perfectly with my professional values, and I am excited about the opportunity to contribute to [Company Goal/Project].',
                closing: 'Thank you for considering my application. I would welcome the opportunity to discuss how my experience and skills can contribute to [Company]\'s continued success. I look forward to speaking with you soon.'
            },
            modern: {
                opening: 'When I saw the [Position] opening at [Company], I knew I had to apply. As someone who has [Achievement/Hook], I\'m excited about the opportunity to bring my expertise in [Skill] to your team.',
                body1: '[Key Experience Story]. This experience taught me [Lesson/Skill], which I\'ve applied to [Result/Achievement]. I thrive in [Type of Environment], which is why [Company]\'s approach to [Something Specific] resonates with me.',
                body2: 'What sets me apart is [Unique Strength]. In my most recent role, I [Specific Achievement with Metrics]. I believe in [Work Philosophy], which has helped me [Result].',
                body3: 'I\'ve been following [Company]\'s work in [Area], and I\'m particularly impressed by [Specific Project/Achievement]. The chance to work on [Type of Problems] while contributing to [Company Mission] is exactly the kind of challenge I\'m looking for.',
                closing: 'I\'d love to chat more about how I can contribute to [Company]\'s mission. Let\'s connect soon to discuss how my skills and your needs align.'
            },
            'career-changer': {
                opening: 'I am excited to apply for the [Position] role at [Company]. While my background is in [Previous Industry], I am making a deliberate transition to [New Industry] and bring a unique set of transferable skills that would benefit your team.',
                body1: 'Although I am transitioning from [Previous Field], many of my core skills directly translate to this role. In my previous position, I [Achievement], which required [Transferable Skill 1] and [Transferable Skill 2] - the same capabilities needed for success in [Target Role].',
                body2: 'To prepare for this transition, I have [What You\'ve Done to Prepare - courses, certifications, projects]. This includes [Specific Example of New Skill Development]. My diverse background gives me a fresh perspective on [Industry Challenge].',
                body3: '[Company]\'s mission to [Mission] particularly resonates with me because [Personal Connection]. I am eager to bring my [Previous Industry] experience in [Skill] to help [Company] achieve [Goal].',
                closing: 'I would appreciate the opportunity to discuss how my unique background and fresh perspective can add value to your team. Thank you for considering my application.'
            }
        };

        return templates[templateType] || templates.traditional;
    }
}

// Create global instance
const coverLetterStructure = new CoverLetterStructure();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CoverLetterStructure, coverLetterStructure };
}
