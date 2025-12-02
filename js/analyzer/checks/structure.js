/**
 * ResuMate - ATS Structure Checks
 * 10 comprehensive structure checks for ATS compatibility
 */

class StructureChecks {
    constructor() {
        this.checks = [
            'standardSectionHeaders',
            'parseableContactInfo',
            'chronologicalOrder',
            'acronymsSpelledOut',
            'clearJobTitles',
            'properSectionOrdering',
            'noOrphanedContent',
            'consistentHeadingHierarchy',
            'clearSectionBoundaries',
            'noComplexTables'
        ];

        this.standardHeaders = [
            'contact', 'summary', 'professional summary', 'objective',
            'experience', 'work experience', 'professional experience', 'employment',
            'education', 'academic background',
            'skills', 'technical skills', 'core competencies',
            'certifications', 'licenses',
            'projects', 'publications', 'awards', 'achievements',
            'volunteer', 'volunteering', 'languages', 'references'
        ];

        this.idealSectionOrder = [
            'contact', 'summary', 'experience', 'education', 'skills',
            'certifications', 'projects', 'awards', 'volunteer', 'references'
        ];
    }

    /**
     * Run all structure checks
     */
    runAll(resumeData, options = {}) {
        const results = [];

        for (const checkName of this.checks) {
            try {
                const result = this[checkName](resumeData, options);
                results.push({
                    category: 'structure',
                    checkName,
                    ...result
                });
            } catch (error) {
                console.error(`Error running check ${checkName}:`, error);
                results.push({
                    category: 'structure',
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
     * Check 1: Standard section headers
     */
    standardSectionHeaders(resumeData, options) {
        if (!resumeData.sections) {
            return this._failedCheck('No sections found in resume');
        }

        const nonStandardHeaders = [];
        const sectionHeaders = [];

        resumeData.sections.forEach(section => {
            const header = (section.title || section.type || '').toLowerCase().trim();
            if (header) {
                sectionHeaders.push(header);
                const isStandard = this.standardHeaders.some(std =>
                    header.includes(std) || std.includes(header)
                );
                if (!isStandard) {
                    nonStandardHeaders.push(section.title || section.type);
                }
            }
        });

        const passed = nonStandardHeaders.length === 0;
        const score = Math.max(50, 100 - (nonStandardHeaders.length * 15));

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? 'All section headers use standard terminology recognized by ATS.'
                : `${nonStandardHeaders.length} non-standard section headers detected: ${nonStandardHeaders.join(', ')}`,
            recommendation: passed ? null :
                'Use standard headers: Summary, Experience, Education, Skills, Certifications.',
            impact: 'medium',
            details: {
                nonStandardHeaders,
                standardHeaders: this.standardHeaders.slice(0, 10),
                suggestions: this._suggestStandardHeaders(nonStandardHeaders)
            }
        };
    }

    /**
     * Check 2: Parseable contact info
     */
    parseableContactInfo(resumeData, options) {
        const contactInfo = this._extractContactInfo(resumeData);
        const required = ['name', 'email', 'phone'];
        const missing = [];

        required.forEach(field => {
            if (!contactInfo[field]) {
                missing.push(field);
            }
        });

        const hasEmail = contactInfo.email && this._isValidEmail(contactInfo.email);
        const hasPhone = contactInfo.phone && this._isValidPhone(contactInfo.phone);
        const hasName = contactInfo.name && contactInfo.name.length > 2;

        const passed = missing.length === 0 && hasEmail && hasPhone && hasName;
        const foundCount = 3 - missing.length;
        const score = Math.round((foundCount / 3) * 100);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'critical',
            message: passed
                ? 'Contact information is complete and parseable by ATS.'
                : `Missing or invalid contact info: ${missing.join(', ')}`,
            recommendation: !passed
                ? 'Include full name, valid email address, and phone number in standard formats at the top.'
                : null,
            impact: 'critical',
            details: {
                found: {
                    name: hasName,
                    email: hasEmail,
                    phone: hasPhone,
                    location: !!contactInfo.location
                },
                missing,
                contactInfo
            }
        };
    }

    /**
     * Check 3: Chronological order (reverse)
     */
    chronologicalOrder(resumeData, options) {
        if (!resumeData.sections) {
            return this._failedCheck('No sections found');
        }

        const experienceSections = resumeData.sections.filter(s =>
            ['experience', 'work-experience', 'employment'].includes(s.type)
        );

        if (experienceSections.length === 0) {
            return {
                passed: true,
                score: 100,
                severity: 'pass',
                message: 'No experience sections found to check ordering.',
                recommendation: null,
                impact: 'low',
                details: {}
            };
        }

        const orderingIssues = [];
        let properlyOrdered = true;

        experienceSections.forEach(section => {
            if (section.content && section.content.items) {
                const dates = this._extractDates(section.content.items);

                for (let i = 0; i < dates.length - 1; i++) {
                    if (dates[i].year < dates[i + 1].year) {
                        properlyOrdered = false;
                        orderingIssues.push({
                            section: section.title,
                            issue: `${dates[i].text} appears before ${dates[i + 1].text}`
                        });
                    }
                }
            }
        });

        return {
            passed: properlyOrdered,
            score: properlyOrdered ? 100 : Math.max(50, 100 - orderingIssues.length * 20),
            severity: properlyOrdered ? 'pass' : 'medium',
            message: properlyOrdered
                ? 'Experience entries are in reverse chronological order (most recent first).'
                : `${orderingIssues.length} chronological ordering issues found.`,
            recommendation: !properlyOrdered
                ? 'Order all experience entries from most recent to oldest (reverse chronological).'
                : null,
            impact: 'medium',
            details: {
                issues: orderingIssues,
                correctOrder: 'Most Recent → Oldest'
            }
        };
    }

    /**
     * Check 4: Acronyms spelled out on first use
     */
    acronymsSpelledOut(resumeData, options) {
        const acronyms = this._findAcronyms(resumeData);
        const unspelledOut = [];

        acronyms.forEach(acronym => {
            const spelledOut = this._findSpelledOutVersion(resumeData, acronym);
            if (!spelledOut) {
                unspelledOut.push(acronym);
            }
        });

        const passed = unspelledOut.length === 0 || acronyms.length === 0;
        const score = acronyms.length === 0 ? 100 :
            Math.max(60, 100 - (unspelledOut.length * 10));

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'low',
            message: passed
                ? 'Acronyms are properly spelled out or are universally recognized.'
                : `${unspelledOut.length} acronyms may need spelling out: ${unspelledOut.slice(0, 5).join(', ')}`,
            recommendation: !passed
                ? 'Spell out acronyms on first use: "Application Programming Interface (API)"'
                : null,
            impact: 'low',
            details: {
                totalAcronyms: acronyms.length,
                unspelledOut: unspelledOut.slice(0, 10),
                examples: ['AWS (Amazon Web Services)', 'API (Application Programming Interface)']
            }
        };
    }

    /**
     * Check 5: Clear and standard job titles
     */
    clearJobTitles(resumeData, options) {
        if (!resumeData.sections) {
            return this._failedCheck('No sections found');
        }

        const jobTitles = this._extractJobTitles(resumeData);
        const unclear = [];

        jobTitles.forEach(title => {
            if (this._isUnclearTitle(title)) {
                unclear.push(title);
            }
        });

        const passed = unclear.length === 0;
        const score = jobTitles.length === 0 ? 100 :
            Math.max(50, 100 - (unclear.length / jobTitles.length) * 50);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'medium',
            message: passed
                ? 'Job titles are clear and use standard industry terminology.'
                : `${unclear.length} job titles may be unclear or non-standard: ${unclear.join(', ')}`,
            recommendation: !passed
                ? 'Use standard job titles that clearly describe your role. Avoid internal jargon.'
                : null,
            impact: 'medium',
            details: {
                totalTitles: jobTitles.length,
                unclearTitles: unclear,
                goodExamples: ['Software Engineer', 'Senior Product Manager', 'Data Analyst'],
                badExamples: ['Code Ninja', 'Growth Hacker', 'Rockstar Developer']
            }
        };
    }

    /**
     * Check 6: Proper section ordering
     */
    properSectionOrdering(resumeData, options) {
        if (!resumeData.sections || resumeData.sections.length === 0) {
            return this._failedCheck('No sections found');
        }

        const currentOrder = resumeData.sections.map(s =>
            this._normalizeSectionType(s.type || s.title)
        );

        const orderScore = this._calculateOrderScore(currentOrder);
        const passed = orderScore >= 80;

        const suggestions = this._suggestBetterOrder(currentOrder);

        return {
            passed,
            score: orderScore,
            severity: passed ? 'pass' : 'low',
            message: passed
                ? 'Sections are in a logical order for ATS parsing.'
                : 'Section ordering could be improved for better ATS readability.',
            recommendation: !passed
                ? `Recommended order: ${this.idealSectionOrder.join(' → ')}`
                : null,
            impact: 'low',
            details: {
                currentOrder,
                idealOrder: this.idealSectionOrder,
                suggestions
            }
        };
    }

    /**
     * Check 7: No orphaned content
     */
    noOrphanedContent(resumeData, options) {
        if (!resumeData.sections) {
            return this._failedCheck('No sections found');
        }

        const orphanedSections = [];

        resumeData.sections.forEach(section => {
            // Check for sections with no content
            if (!section.content || this._isEmptyContent(section.content)) {
                orphanedSections.push({
                    section: section.title || section.type,
                    reason: 'Empty content'
                });
            }

            // Check for items with no text
            if (section.content && section.content.items) {
                const emptyItems = section.content.items.filter(item =>
                    !item.text && !item.description && !item.title
                );
                if (emptyItems.length > 0) {
                    orphanedSections.push({
                        section: section.title || section.type,
                        reason: `${emptyItems.length} empty items`
                    });
                }
            }
        });

        const passed = orphanedSections.length === 0;
        const score = Math.max(60, 100 - orphanedSections.length * 15);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'low',
            message: passed
                ? 'All sections have proper content with no orphaned elements.'
                : `${orphanedSections.length} sections with orphaned or empty content detected.`,
            recommendation: !passed
                ? 'Remove empty sections or fill them with relevant content.'
                : null,
            impact: 'low',
            details: {
                orphanedSections
            }
        };
    }

    /**
     * Check 8: Consistent heading hierarchy
     */
    consistentHeadingHierarchy(resumeData, options) {
        if (!resumeData.sections) {
            return this._failedCheck('No sections found');
        }

        const hierarchyIssues = this._analyzeHeadingHierarchy(resumeData);

        return {
            passed: hierarchyIssues.length === 0,
            score: Math.max(70, 100 - hierarchyIssues.length * 10),
            severity: hierarchyIssues.length > 0 ? 'low' : 'pass',
            message: hierarchyIssues.length === 0
                ? 'Heading hierarchy is consistent throughout the resume.'
                : `${hierarchyIssues.length} heading hierarchy issues detected.`,
            recommendation: hierarchyIssues.length > 0
                ? 'Use consistent heading levels: H1 for name, H2 for sections, H3 for subsections.'
                : null,
            impact: 'low',
            details: {
                issues: hierarchyIssues,
                recommendation: 'H1: Name, H2: Section Titles, H3: Job Titles/Subsections'
            }
        };
    }

    /**
     * Check 9: Clear section boundaries
     */
    clearSectionBoundaries(resumeData, options) {
        if (!resumeData.sections || resumeData.sections.length < 2) {
            return {
                passed: true,
                score: 100,
                severity: 'pass',
                message: 'Section boundaries are clear.',
                recommendation: null,
                impact: 'low',
                details: {}
            };
        }

        const boundaryIssues = [];

        for (let i = 0; i < resumeData.sections.length - 1; i++) {
            const current = resumeData.sections[i];
            const next = resumeData.sections[i + 1];

            // Check if sections have clear titles
            if (!current.title && !current.type) {
                boundaryIssues.push({
                    section: i + 1,
                    issue: 'Section has no title'
                });
            }

            // Check if sections have visual separation (in metadata)
            if (current.metadata && next.metadata) {
                const hasGap = this._hasSeparation(current, next);
                if (!hasGap) {
                    boundaryIssues.push({
                        section: `${current.title} → ${next.title}`,
                        issue: 'No clear separation'
                    });
                }
            }
        }

        const passed = boundaryIssues.length === 0;
        const score = Math.max(70, 100 - boundaryIssues.length * 10);

        return {
            passed,
            score,
            severity: passed ? 'pass' : 'low',
            message: passed
                ? 'All sections have clear boundaries and separation.'
                : `${boundaryIssues.length} section boundary issues detected.`,
            recommendation: !passed
                ? 'Ensure each section has a clear title and adequate spacing.'
                : null,
            impact: 'low',
            details: {
                issues: boundaryIssues
            }
        };
    }

    /**
     * Check 10: No complex tables or merged cells
     */
    noComplexTables(resumeData, options) {
        const complexTables = this._detectComplexTables(resumeData);

        return {
            passed: complexTables.length === 0,
            score: complexTables.length === 0 ? 100 : Math.max(30, 100 - complexTables.length * 30),
            severity: complexTables.length > 0 ? 'high' : 'pass',
            message: complexTables.length === 0
                ? 'No complex tables or merged cells detected.'
                : `${complexTables.length} complex table structures detected.`,
            recommendation: complexTables.length > 0
                ? 'Avoid tables with merged cells, nested tables, or complex layouts. Use simple lists.'
                : null,
            impact: 'high',
            details: {
                complexTables,
                reason: 'Merged cells and nested tables break ATS parsing logic.'
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

    _suggestStandardHeaders(nonStandardHeaders) {
        const suggestions = {};
        const mapping = {
            'about': 'Summary',
            'bio': 'Professional Summary',
            'jobs': 'Experience',
            'work': 'Experience',
            'career': 'Experience',
            'schooling': 'Education',
            'learning': 'Education',
            'expertise': 'Skills',
            'abilities': 'Skills',
            'tech': 'Technical Skills'
        };

        nonStandardHeaders.forEach(header => {
            const lower = header.toLowerCase();
            for (const [key, value] of Object.entries(mapping)) {
                if (lower.includes(key)) {
                    suggestions[header] = value;
                    break;
                }
            }
            if (!suggestions[header]) {
                suggestions[header] = 'Consider using standard terminology';
            }
        });

        return suggestions;
    }

    _extractContactInfo(resumeData) {
        const contactInfo = {
            name: null,
            email: null,
            phone: null,
            location: null
        };

        if (!resumeData.sections) return contactInfo;

        // Look for contact section
        const contactSection = resumeData.sections.find(s =>
            ['contact', 'header', 'personal'].includes(s.type)
        );

        if (contactSection && contactSection.content) {
            const content = contactSection.content;
            contactInfo.name = content.name || content.fullName || null;
            contactInfo.email = content.email || null;
            contactInfo.phone = content.phone || content.phoneNumber || null;
            contactInfo.location = content.location || content.address || null;
        }

        // If not found, search in all sections
        if (!contactInfo.email || !contactInfo.phone) {
            const allText = JSON.stringify(resumeData);

            if (!contactInfo.email) {
                const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (emailMatch) contactInfo.email = emailMatch[0];
            }

            if (!contactInfo.phone) {
                const phoneMatch = allText.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                if (phoneMatch) contactInfo.phone = phoneMatch[0];
            }
        }

        return contactInfo;
    }

    _isValidEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }

    _isValidPhone(phone) {
        // Remove common formatting
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    }

    _extractDates(items) {
        const dates = [];

        items.forEach(item => {
            const dateText = item.startDate || item.date || item.year || '';
            const endDate = item.endDate || '';
            const combined = `${dateText} ${endDate}`;

            const yearMatch = combined.match(/\d{4}/);
            if (yearMatch) {
                dates.push({
                    year: parseInt(yearMatch[0]),
                    text: dateText || endDate
                });
            }
        });

        return dates;
    }

    _findAcronyms(resumeData) {
        const text = JSON.stringify(resumeData);
        const acronymPattern = /\b[A-Z]{2,}(?![a-z])\b/g;
        const matches = text.match(acronymPattern) || [];

        // Filter out common words that look like acronyms
        const commonWords = ['US', 'USA', 'UK', 'PhD', 'MBA', 'GPA', 'ID'];
        return [...new Set(matches)].filter(a =>
            !commonWords.includes(a) && a.length <= 6
        );
    }

    _findSpelledOutVersion(resumeData, acronym) {
        const text = JSON.stringify(resumeData);
        // Look for pattern: "Full Name (ACRONYM)"
        const pattern = new RegExp(`([A-Z][a-z]+\\s+){1,5}\\(${acronym}\\)`, 'i');
        return pattern.test(text);
    }

    _extractJobTitles(resumeData) {
        const titles = [];

        if (!resumeData.sections) return titles;

        resumeData.sections.forEach(section => {
            if (['experience', 'work-experience'].includes(section.type)) {
                if (section.content && section.content.items) {
                    section.content.items.forEach(item => {
                        if (item.title || item.position || item.role) {
                            titles.push(item.title || item.position || item.role);
                        }
                    });
                }
            }
        });

        return titles;
    }

    _isUnclearTitle(title) {
        const jargon = ['ninja', 'rockstar', 'guru', 'wizard', 'hacker', 'jedi', 'evangelist'];
        const lowerTitle = title.toLowerCase();

        // Check for jargon
        if (jargon.some(j => lowerTitle.includes(j))) return true;

        // Check for overly vague titles
        const vague = ['specialist', 'expert', 'professional', 'consultant'];
        if (vague.some(v => lowerTitle === v)) return true;

        // Check for titles that are too short or unclear
        if (title.split(/\s+/).length === 1 && !['manager', 'director', 'engineer', 'developer', 'analyst'].includes(lowerTitle)) {
            return true;
        }

        return false;
    }

    _normalizeSectionType(type) {
        const lower = (type || '').toLowerCase();
        const mapping = {
            'contact': 'contact',
            'header': 'contact',
            'summary': 'summary',
            'objective': 'summary',
            'experience': 'experience',
            'work': 'experience',
            'employment': 'experience',
            'education': 'education',
            'skills': 'skills',
            'certifications': 'certifications',
            'projects': 'projects',
            'awards': 'awards',
            'volunteer': 'volunteer',
            'references': 'references'
        };

        for (const [key, value] of Object.entries(mapping)) {
            if (lower.includes(key)) return value;
        }

        return type;
    }

    _calculateOrderScore(currentOrder) {
        let score = 100;
        const normalized = currentOrder.map(this._normalizeSectionType);

        // Check for key sections in wrong order
        const contactIdx = normalized.indexOf('contact');
        const summaryIdx = normalized.indexOf('summary');
        const experienceIdx = normalized.indexOf('experience');
        const educationIdx = normalized.indexOf('education');

        // Contact should be first
        if (contactIdx > 0) score -= 10;

        // Summary should come before experience
        if (summaryIdx > experienceIdx && summaryIdx !== -1 && experienceIdx !== -1) {
            score -= 10;
        }

        // Experience should come before education (usually)
        if (experienceIdx > educationIdx && experienceIdx !== -1 && educationIdx !== -1) {
            score -= 5;
        }

        return Math.max(0, score);
    }

    _suggestBetterOrder(currentOrder) {
        const suggestions = [];
        const normalized = currentOrder.map(this._normalizeSectionType);

        if (normalized[0] !== 'contact') {
            suggestions.push('Move contact information to the top');
        }

        const experienceIdx = normalized.indexOf('experience');
        const educationIdx = normalized.indexOf('education');

        if (experienceIdx > educationIdx && experienceIdx !== -1) {
            suggestions.push('Consider moving Experience before Education');
        }

        return suggestions;
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

    _analyzeHeadingHierarchy(resumeData) {
        const issues = [];
        let previousLevel = 0;

        resumeData.sections.forEach((section, idx) => {
            const level = section.level || 2; // Default to H2 for sections

            // Check for skipped levels
            if (level > previousLevel + 1) {
                issues.push({
                    section: section.title || section.type,
                    issue: `Skipped heading level (H${previousLevel} to H${level})`
                });
            }

            previousLevel = level;
        });

        return issues;
    }

    _hasSeparation(section1, section2) {
        // Check metadata for spacing indicators
        if (section1.metadata && section1.metadata.marginBottom) return true;
        if (section2.metadata && section2.metadata.marginTop) return true;

        // Default to true if no metadata (assume proper template)
        return true;
    }

    _detectComplexTables(resumeData) {
        const text = JSON.stringify(resumeData);
        const indicators = [
            'colspan',
            'rowspan',
            'merged',
            'nested-table'
        ];

        return indicators.filter(indicator =>
            text.toLowerCase().includes(indicator)
        );
    }

    /**
     * Get summary of all structure checks
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
            category: 'structure',
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
    module.exports = StructureChecks;
}
