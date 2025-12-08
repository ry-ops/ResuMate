/**
 * ATSFlow - ATS Formatting Checks
 * 10 comprehensive formatting checks for ATS compatibility
 */

class FormattingChecks {
    constructor() {
        this.checks = [
            'noTables',
            'noMultiColumn',
            'noHeadersFooters',
            'noImages',
            'noTextBoxes',
            'webSafeFonts',
            'noUnicodeBullets',
            'consistentDates',
            'supportedFileFormat',
            'noBackgroundColors'
        ];
    }

    /**
     * Run all formatting checks
     * @param {Object} resumeData - Resume data object with sections and metadata
     * @param {Object} options - Analysis options
     * @returns {Array} Array of check results
     */
    runAll(resumeData, options = {}) {
        const results = [];

        for (const checkName of this.checks) {
            try {
                const result = this[checkName](resumeData, options);
                results.push({
                    category: 'formatting',
                    checkName,
                    ...result
                });
            } catch (error) {
                if (typeof logger !== 'undefined') logger.error(`Error running check ${checkName}:`, error);
                results.push({
                    category: 'formatting',
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
     * Check 1: No table-based layouts
     */
    noTables(resumeData, options) {
        const hasTableLayout = this._detectTableLayout(resumeData);

        return {
            passed: !hasTableLayout,
            score: hasTableLayout ? 0 : 100,
            severity: hasTableLayout ? 'critical' : 'pass',
            message: hasTableLayout
                ? 'Table-based layouts detected. ATS systems struggle to parse tabular data correctly.'
                : 'No table-based layouts detected.',
            recommendation: hasTableLayout
                ? 'Convert tables to simple text sections with clear hierarchies.'
                : null,
            impact: 'critical',
            details: {
                reason: 'ATS parsers read left-to-right, top-to-bottom. Tables break this flow.'
            }
        };
    }

    /**
     * Check 2: No multi-column layouts
     */
    noMultiColumn(resumeData, options) {
        const hasMultiColumn = this._detectMultiColumnLayout(resumeData);

        return {
            passed: !hasMultiColumn,
            score: hasMultiColumn ? 0 : 100,
            severity: hasMultiColumn ? 'critical' : 'pass',
            message: hasMultiColumn
                ? 'Multi-column layout detected. Columns break ATS parsing flow.'
                : 'Single-column layout detected.',
            recommendation: hasMultiColumn
                ? 'Use a single-column layout. Stack all content vertically.'
                : null,
            impact: 'critical',
            details: {
                reason: 'ATS reads line-by-line. Multi-column layouts scramble content order.'
            }
        };
    }

    /**
     * Check 3: No headers/footers
     */
    noHeadersFooters(resumeData, options) {
        const hasHeadersFooters = this._detectHeadersFooters(resumeData);

        return {
            passed: !hasHeadersFooters,
            score: hasHeadersFooters ? 30 : 100,
            severity: hasHeadersFooters ? 'high' : 'pass',
            message: hasHeadersFooters
                ? 'Headers or footers detected. ATS often ignores or misplaces this content.'
                : 'No headers or footers detected.',
            recommendation: hasHeadersFooters
                ? 'Move all important information (name, contact) into the main body.'
                : null,
            impact: 'high',
            details: {
                reason: 'Many ATS systems skip header/footer regions entirely.'
            }
        };
    }

    /**
     * Check 4: No images, charts, icons
     */
    noImages(resumeData, options) {
        const hasImages = this._detectImages(resumeData);

        return {
            passed: !hasImages,
            score: hasImages ? 50 : 100,
            severity: hasImages ? 'medium' : 'pass',
            message: hasImages
                ? 'Images or graphics detected. ATS cannot read image content.'
                : 'No images or graphics detected.',
            recommendation: hasImages
                ? 'Remove all images, photos, charts, and icons. Use text only.'
                : null,
            impact: 'medium',
            details: {
                reason: 'ATS systems cannot extract text from images or decode graphics.',
                examples: ['Profile photos', 'Charts', 'Icons', 'Logos', 'Infographics']
            }
        };
    }

    /**
     * Check 5: No text boxes or floating elements
     */
    noTextBoxes(resumeData, options) {
        const hasTextBoxes = this._detectTextBoxes(resumeData);

        return {
            passed: !hasTextBoxes,
            score: hasTextBoxes ? 20 : 100,
            severity: hasTextBoxes ? 'high' : 'pass',
            message: hasTextBoxes
                ? 'Text boxes or floating elements detected. These often get skipped by ATS.'
                : 'No text boxes or floating elements detected.',
            recommendation: hasTextBoxes
                ? 'Use standard paragraphs and bullet points. Avoid positioning elements.'
                : null,
            impact: 'high',
            details: {
                reason: 'Floating elements break the document flow that ATS parsers expect.'
            }
        };
    }

    /**
     * Check 6: Standard web-safe fonts
     */
    webSafeFonts(resumeData, options) {
        const fonts = this._extractFonts(resumeData);
        const unsafeFonts = this._checkFontSafety(fonts);

        return {
            passed: unsafeFonts.length === 0,
            score: unsafeFonts.length === 0 ? 100 : Math.max(0, 100 - unsafeFonts.length * 20),
            severity: unsafeFonts.length > 0 ? 'low' : 'pass',
            message: unsafeFonts.length > 0
                ? `Non-standard fonts detected: ${unsafeFonts.join(', ')}. May not render correctly in ATS.`
                : 'All fonts are standard and web-safe.',
            recommendation: unsafeFonts.length > 0
                ? 'Use standard fonts: Arial, Times New Roman, Calibri, Helvetica, Georgia.'
                : null,
            impact: 'low',
            details: {
                detectedFonts: fonts,
                unsafeFonts: unsafeFonts,
                safeFonts: ['Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Georgia', 'Verdana']
            }
        };
    }

    /**
     * Check 7: No Unicode bullets
     */
    noUnicodeBullets(resumeData, options) {
        const unicodeBullets = this._detectUnicodeBullets(resumeData);

        return {
            passed: unicodeBullets.count === 0,
            score: unicodeBullets.count === 0 ? 100 : Math.max(50, 100 - unicodeBullets.count * 5),
            severity: unicodeBullets.count > 0 ? 'low' : 'pass',
            message: unicodeBullets.count > 0
                ? `${unicodeBullets.count} Unicode or special bullets detected. May not display correctly in ATS.`
                : 'Standard bullet points used.',
            recommendation: unicodeBullets.count > 0
                ? 'Use standard keyboard bullets (-, •) or simple dashes/asterisks.'
                : null,
            impact: 'low',
            details: {
                count: unicodeBullets.count,
                examples: unicodeBullets.examples,
                safeBullets: ['•', '-', '*', '◦']
            }
        };
    }

    /**
     * Check 8: Consistent date formats
     */
    consistentDates(resumeData, options) {
        const dateAnalysis = this._analyzeDateFormats(resumeData);

        return {
            passed: dateAnalysis.consistent,
            score: dateAnalysis.consistent ? 100 : Math.max(50, 100 - dateAnalysis.inconsistencies * 10),
            severity: !dateAnalysis.consistent ? 'low' : 'pass',
            message: dateAnalysis.consistent
                ? 'All dates use consistent formatting.'
                : `Found ${dateAnalysis.inconsistencies} different date formats. Inconsistency may confuse ATS.`,
            recommendation: !dateAnalysis.consistent
                ? `Standardize all dates to one format (recommended: ${dateAnalysis.recommendedFormat}).`
                : null,
            impact: 'low',
            details: {
                formats: dateAnalysis.formats,
                recommendedFormat: dateAnalysis.recommendedFormat,
                examples: dateAnalysis.examples
            }
        };
    }

    /**
     * Check 9: Recommended file format
     */
    supportedFileFormat(resumeData, options) {
        const fileFormat = options.fileFormat || 'unknown';
        const isSupported = ['pdf', 'docx'].includes(fileFormat.toLowerCase());
        const isPDF = fileFormat.toLowerCase() === 'pdf';

        return {
            passed: isSupported,
            score: isPDF ? 100 : (fileFormat.toLowerCase() === 'docx' ? 90 : 50),
            severity: !isSupported ? 'medium' : 'pass',
            message: isSupported
                ? `${fileFormat.toUpperCase()} format is widely supported by ATS systems.`
                : `${fileFormat.toUpperCase()} format may not be compatible with all ATS systems.`,
            recommendation: !isSupported
                ? 'Convert your resume to PDF (preferred) or DOCX format.'
                : isPDF ? null : 'PDF format is slightly preferred over DOCX for consistent rendering.',
            impact: 'medium',
            details: {
                currentFormat: fileFormat,
                supportedFormats: ['PDF', 'DOCX'],
                bestFormat: 'PDF',
                reason: 'PDF preserves formatting while remaining ATS-parseable.'
            }
        };
    }

    /**
     * Check 10: No background colors
     */
    noBackgroundColors(resumeData, options) {
        const hasBackgrounds = this._detectBackgroundColors(resumeData);

        return {
            passed: !hasBackgrounds.detected,
            score: hasBackgrounds.detected ? 70 : 100,
            severity: hasBackgrounds.detected ? 'low' : 'pass',
            message: hasBackgrounds.detected
                ? 'Background colors or shading detected. May reduce text readability in ATS.'
                : 'No background colors detected.',
            recommendation: hasBackgrounds.detected
                ? 'Use white/transparent backgrounds only. Add emphasis with bold or headings.'
                : null,
            impact: 'low',
            details: {
                colors: hasBackgrounds.colors,
                reason: 'Background colors can reduce contrast and make text harder to parse.'
            }
        };
    }

    // Helper methods

    _detectTableLayout(resumeData) {
        // Check for table indicators in content
        const content = JSON.stringify(resumeData);
        const tableIndicators = [
            /\btable\b/i,
            /\btd\b/i,
            /\btr\b/i,
            /<table/i,
            /\|.*\|.*\|/  // Markdown-style tables
        ];

        return tableIndicators.some(pattern => pattern.test(content));
    }

    _detectMultiColumnLayout(resumeData) {
        // Check for column indicators
        const content = JSON.stringify(resumeData);
        const columnIndicators = [
            /column-count/i,
            /columns:/i,
            /multicol/i,
            /\bfloat:\s*(left|right)/i
        ];

        return columnIndicators.some(pattern => pattern.test(content));
    }

    _detectHeadersFooters(resumeData) {
        // Check for header/footer indicators in section types
        if (!resumeData.sections) return false;

        return resumeData.sections.some(section =>
            section.type === 'header' ||
            section.type === 'footer' ||
            (section.metadata && (section.metadata.isHeader || section.metadata.isFooter))
        );
    }

    _detectImages(resumeData) {
        const content = JSON.stringify(resumeData);
        const imageIndicators = [
            /<img/i,
            /\bimage\b/i,
            /\.jpg/i,
            /\.png/i,
            /\.gif/i,
            /\.svg/i,
            /\bphoto\b/i
        ];

        return imageIndicators.some(pattern => pattern.test(content));
    }

    _detectTextBoxes(resumeData) {
        const content = JSON.stringify(resumeData);
        const textBoxIndicators = [
            /\btextbox\b/i,
            /position:\s*absolute/i,
            /position:\s*fixed/i,
            /\bfloat\b/i
        ];

        return textBoxIndicators.some(pattern => pattern.test(content));
    }

    _extractFonts(resumeData) {
        const fonts = new Set();

        // Check customization
        if (resumeData.customization) {
            if (resumeData.customization.headingFont) fonts.add(resumeData.customization.headingFont);
            if (resumeData.customization.bodyFont) fonts.add(resumeData.customization.bodyFont);
        }

        // Default to common fonts if none specified
        if (fonts.size === 0) {
            fonts.add('Arial');
        }

        return Array.from(fonts);
    }

    _checkFontSafety(fonts) {
        const safeFonts = [
            'arial', 'times new roman', 'calibri', 'helvetica',
            'georgia', 'verdana', 'courier new', 'times',
            'trebuchet ms', 'garamond', 'inter', 'roboto'
        ];

        return fonts.filter(font =>
            !safeFonts.some(safe => font.toLowerCase().includes(safe))
        );
    }

    _detectUnicodeBullets(resumeData) {
        if (!resumeData.sections) return { count: 0, examples: [] };

        const unicodeBulletPattern = /[▪▫■□●○◆◇★☆✓✔✖✗➤➢➣⮞]/g;
        const examples = [];
        let count = 0;

        resumeData.sections.forEach(section => {
            if (section.content && section.content.items) {
                section.content.items.forEach(item => {
                    const matches = JSON.stringify(item).match(unicodeBulletPattern);
                    if (matches) {
                        count += matches.length;
                        examples.push(...matches.slice(0, 3));
                    }
                });
            }
        });

        return {
            count,
            examples: [...new Set(examples)].slice(0, 5)
        };
    }

    _analyzeDateFormats(resumeData) {
        if (!resumeData.sections) return { consistent: true, inconsistencies: 0, formats: [] };

        const datePatterns = {
            'MM/YYYY': /\b\d{1,2}\/\d{4}\b/,
            'Month YYYY': /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i,
            'YYYY-MM': /\b\d{4}-\d{1,2}\b/,
            'YYYY': /\b\d{4}\b/
        };

        const foundFormats = new Set();
        const examples = {};

        resumeData.sections.forEach(section => {
            if (section.content) {
                const content = JSON.stringify(section.content);

                Object.entries(datePatterns).forEach(([format, pattern]) => {
                    const matches = content.match(pattern);
                    if (matches) {
                        foundFormats.add(format);
                        if (!examples[format]) examples[format] = [];
                        examples[format].push(matches[0]);
                    }
                });
            }
        });

        return {
            consistent: foundFormats.size <= 1,
            inconsistencies: Math.max(0, foundFormats.size - 1),
            formats: Array.from(foundFormats),
            recommendedFormat: 'Month YYYY (e.g., January 2024)',
            examples
        };
    }

    _detectBackgroundColors(resumeData) {
        const content = JSON.stringify(resumeData);
        const backgroundPatterns = [
            /background-color:\s*(?!white|transparent|#fff|#ffffff)/i,
            /background:\s*(?!white|transparent|none)/i
        ];

        const detected = backgroundPatterns.some(pattern => pattern.test(content));
        const colors = [];

        // Try to extract specific colors
        const colorMatch = content.match(/background-color:\s*([^;}"'\s]+)/gi);
        if (colorMatch) {
            colors.push(...colorMatch.map(m => m.split(':')[1].trim()));
        }

        return {
            detected,
            colors: colors.filter(c => !['white', 'transparent', '#fff', '#ffffff'].includes(c.toLowerCase()))
        };
    }

    /**
     * Get summary of all formatting checks
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
            category: 'formatting',
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
    module.exports = FormattingChecks;
}
