/**
 * ATSFlow Interactive Tooltip System
 * Provides contextual help and guidance throughout the application
 */

class TooltipManager {
    constructor() {
        this.tooltipElement = null;
        this.currentTarget = null;
        this.hideTimeout = null;
        this.showDelay = 300;
        this.hideDelay = 200;
        this.isInitialized = false;

        // Tooltip content library
        this.tooltipContent = {
            // Resume Builder tooltips
            'resume-name': {
                title: 'Your Name',
                content: 'Use your full professional name. Avoid nicknames unless commonly used in your industry.',
                tip: 'Pro tip: Match the name on your LinkedIn profile for consistency.'
            },
            'resume-title': {
                title: 'Professional Title',
                content: 'Your current or target job title. Make it specific and relevant to the positions you\'re targeting.',
                tip: 'Pro tip: Align this with the job titles in postings you\'re applying to.'
            },
            'resume-summary': {
                title: 'Professional Summary',
                content: 'A 2-4 sentence overview highlighting your experience, key skills, and value proposition.',
                tip: 'Pro tip: Include keywords from job descriptions to pass ATS screening.'
            },
            'resume-experience': {
                title: 'Work Experience',
                content: 'List your most relevant positions in reverse chronological order. Focus on achievements, not just duties.',
                tip: 'Pro tip: Use action verbs and quantify results (e.g., "Increased sales by 25%").'
            },
            'resume-skills': {
                title: 'Skills Section',
                content: 'Include both technical and soft skills relevant to your target role.',
                tip: 'Pro tip: Mirror the exact skill names used in job postings for better ATS matching.'
            },
            'resume-education': {
                title: 'Education',
                content: 'List degrees, certifications, and relevant coursework. Include graduation dates and honors.',
                tip: 'Pro tip: Recent graduates can include GPA if 3.5+; experienced professionals can omit it.'
            },

            // Career Documents tooltips
            'bio-name': {
                title: 'Full Name',
                content: 'Enter your complete professional name as you want it to appear in your executive bio.',
                tip: 'Pro tip: Use the same name format across all professional documents.'
            },
            'bio-title': {
                title: 'Current Title',
                content: 'Your current job title or the role you\'re best known for professionally.',
                tip: 'Pro tip: For executives, include board positions if relevant.'
            },
            'bio-style': {
                title: 'Bio Style',
                content: 'Choose the tone that matches your intended use:<br>• Executive: C-suite, board presentations<br>• Professional: Corporate communications<br>• Speaker: Conference bios<br>• Academic: Research profiles',
                tip: 'Pro tip: Select "Speaker" for conference materials or panel intros.'
            },
            'bio-achievements': {
                title: 'Key Achievements',
                content: 'Highlight your most impressive accomplishments. Focus on quantifiable results and notable recognition.',
                tip: 'Pro tip: Include awards, patents, publications, or major project outcomes.'
            },

            'inquiry-type': {
                title: 'Inquiry Type',
                content: 'Select based on where you are in the application process:<br>• Post-Application: 1-2 weeks after applying<br>• Post-Interview: 3-5 days after interview<br>• Offer Timeline: When expecting an offer<br>• Decision Update: Final status check',
                tip: 'Pro tip: Timing matters - wait at least a week before following up.'
            },
            'inquiry-tone': {
                title: 'Letter Tone',
                content: 'Match the tone to the company culture:<br>• Professional: Traditional/corporate<br>• Warm: Startups/creative industries<br>• Direct: Fast-paced environments',
                tip: 'Pro tip: Mirror the communication style used in job postings.'
            },

            'brand-audience': {
                title: 'Target Audience',
                content: 'Who will read this statement?<br>• Recruiters: Job-focused messaging<br>• Networking: Event introductions<br>• LinkedIn: Profile optimization<br>• Website: Personal branding',
                tip: 'Pro tip: Create multiple versions for different contexts.'
            },
            'brand-values': {
                title: 'Core Values',
                content: 'The principles that guide your professional decisions and work ethic.',
                tip: 'Pro tip: Choose 3-5 values that genuinely reflect who you are.'
            },
            'brand-differentiators': {
                title: 'Unique Differentiators',
                content: 'What sets you apart from others in your field? Think unique combinations of skills or experiences.',
                tip: 'Pro tip: Consider your "career intersections" - unique skill combinations.'
            },

            // Job Import tooltips
            'job-import': {
                title: 'Import Job Posting',
                content: 'Paste a job URL to automatically extract key information and tailor your documents to the position.',
                tip: 'Pro tip: This helps ensure your documents match the language used in the posting.'
            },
            'job-url': {
                title: 'Job URL',
                content: 'Paste the full URL of a job posting from supported sites like LinkedIn, Indeed, or Glassdoor.',
                tip: 'Pro tip: Use the direct job posting URL, not a search results page.'
            },

            // Export tooltips
            'export-pdf': {
                title: 'PDF Export',
                content: 'Creates a professional, print-ready PDF document. Best for submitting applications.',
                tip: 'Pro tip: Use "High Quality" for print; "Standard" for email attachments.'
            },
            'export-docx': {
                title: 'Word Export',
                content: 'Creates an editable Word document. Good when you need to make final adjustments.',
                tip: 'Pro tip: Some ATS systems parse Word documents better than PDFs.'
            },
            'export-txt': {
                title: 'Plain Text Export',
                content: 'Creates a simple text file. Perfect for copying into online application forms.',
                tip: 'Pro tip: Review formatting after pasting into application systems.'
            },

            // ATS tooltips
            'ats-score': {
                title: 'ATS Compatibility Score',
                content: 'Measures how well your resume will be parsed by Applicant Tracking Systems used by employers.',
                tip: 'Pro tip: Aim for 80%+ for best results. Fix critical issues first.'
            },
            'ats-keywords': {
                title: 'Keyword Matching',
                content: 'Shows which keywords from the job posting appear in your resume.',
                tip: 'Pro tip: Include exact phrases from job requirements naturally in your content.'
            },

            // API Key
            'api-key': {
                title: 'Claude API Key',
                content: 'Your Claude API key is required for AI-powered features. Get one at console.anthropic.com.',
                tip: 'Pro tip: Your key is stored locally and never sent to our servers.'
            },

            // General actions
            'generate-btn': {
                title: 'Generate Content',
                content: 'Click to generate AI-powered content based on your inputs.',
                tip: 'Pro tip: Review and personalize the generated content - it\'s a starting point!'
            },
            'copy-btn': {
                title: 'Copy to Clipboard',
                content: 'Copies the generated content to your clipboard for easy pasting.',
                tip: 'Pro tip: Paste into a document editor to review before using.'
            }
        };
    }

    /**
     * Initialize the tooltip system
     */
    initialize() {
        if (this.isInitialized) return;

        this.createTooltipElement();
        this.attachStyles();
        this.setupEventListeners();
        this.isInitialized = true;

        console.log('[TooltipManager] Initialized');
    }

    /**
     * Create the tooltip DOM element
     */
    createTooltipElement() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'resumate-tooltip';
        this.tooltipElement.innerHTML = `
            <div class="tooltip-arrow"></div>
            <div class="tooltip-header">
                <span class="tooltip-icon">?</span>
                <span class="tooltip-title"></span>
            </div>
            <div class="tooltip-content"></div>
            <div class="tooltip-tip">
                <span class="tip-icon">💡</span>
                <span class="tip-text"></span>
            </div>
        `;
        document.body.appendChild(this.tooltipElement);
    }

    /**
     * Attach tooltip styles
     */
    attachStyles() {
        if (document.getElementById('resumate-tooltip-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'resumate-tooltip-styles';
        styles.textContent = `
            .resumate-tooltip {
                position: fixed;
                z-index: 99999;
                max-width: 320px;
                padding: 0;
                background: linear-gradient(135deg, #1e272e 0%, #2d3436 100%);
                color: #fff;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: none;
            }

            .resumate-tooltip.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                pointer-events: auto;
            }

            .resumate-tooltip .tooltip-arrow {
                position: absolute;
                width: 12px;
                height: 12px;
                background: #1e272e;
                transform: rotate(45deg);
                top: -6px;
                left: 24px;
                border-left: 1px solid rgba(255,255,255,0.1);
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .resumate-tooltip.arrow-right .tooltip-arrow {
                left: auto;
                right: 24px;
            }

            .resumate-tooltip.arrow-bottom .tooltip-arrow {
                top: auto;
                bottom: -6px;
                border-left: none;
                border-top: none;
                border-right: 1px solid rgba(255,255,255,0.1);
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .resumate-tooltip .tooltip-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px 12px 0 0;
            }

            .resumate-tooltip .tooltip-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 700;
            }

            .resumate-tooltip .tooltip-title {
                font-size: 15px;
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            .resumate-tooltip .tooltip-content {
                padding: 14px 16px;
                font-size: 13px;
                line-height: 1.6;
                color: rgba(255,255,255,0.9);
            }

            .resumate-tooltip .tooltip-tip {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                padding: 12px 16px;
                background: rgba(255,255,255,0.05);
                border-top: 1px solid rgba(255,255,255,0.1);
                border-radius: 0 0 12px 12px;
                font-size: 12px;
                color: #ffc107;
            }

            .resumate-tooltip .tooltip-tip .tip-icon {
                flex-shrink: 0;
            }

            .resumate-tooltip .tooltip-tip .tip-text {
                color: rgba(255,255,255,0.8);
            }

            /* Tooltip trigger indicator */
            [data-tooltip] {
                position: relative;
                cursor: help;
            }

            [data-tooltip]::after {
                content: '?';
                position: absolute;
                top: -8px;
                right: -8px;
                width: 18px;
                height: 18px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                font-size: 11px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: scale(0.5);
                transition: all 0.2s ease;
                pointer-events: none;
                z-index: 1;
            }

            [data-tooltip]:hover::after {
                opacity: 1;
                transform: scale(1);
            }

            /* Inline tooltip trigger */
            .tooltip-trigger {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                font-size: 11px;
                font-weight: 700;
                cursor: help;
                margin-left: 6px;
                vertical-align: middle;
                transition: all 0.2s ease;
            }

            .tooltip-trigger:hover {
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(102,126,234,0.4);
            }

            /* Dark theme adjustments */
            [data-theme="dark"] .resumate-tooltip {
                background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
                box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
            }

            [data-theme="dark"] .resumate-tooltip .tooltip-arrow {
                background: #0d1117;
            }

            /* Section help buttons */
            .section-help-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 20px;
                color: #667eea;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .section-help-btn:hover {
                background: rgba(102, 126, 234, 0.2);
                border-color: #667eea;
            }

            .section-help-btn .help-icon {
                font-size: 14px;
            }

            /* Guided tour highlight */
            .tooltip-highlight {
                position: relative;
                z-index: 99998;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.2);
                border-radius: 8px;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners for tooltip triggers
     */
    setupEventListeners() {
        // Delegate events for [data-tooltip] elements
        document.addEventListener('mouseenter', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.scheduleShow(target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.scheduleHide();
            }
        }, true);

        // Keep tooltip visible when hovering over it
        this.tooltipElement.addEventListener('mouseenter', () => {
            this.clearHideTimeout();
        });

        this.tooltipElement.addEventListener('mouseleave', () => {
            this.scheduleHide();
        });

        // Hide on scroll
        window.addEventListener('scroll', () => this.hide(), { passive: true });
    }

    /**
     * Schedule tooltip show with delay
     */
    scheduleShow(target) {
        this.clearHideTimeout();
        this.currentTarget = target;

        setTimeout(() => {
            if (this.currentTarget === target) {
                this.show(target);
            }
        }, this.showDelay);
    }

    /**
     * Schedule tooltip hide with delay
     */
    scheduleHide() {
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, this.hideDelay);
    }

    /**
     * Clear hide timeout
     */
    clearHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    /**
     * Show tooltip for target element
     */
    show(target) {
        const tooltipKey = target.getAttribute('data-tooltip');
        const content = this.tooltipContent[tooltipKey];

        if (!content) {
            // Check for inline content
            const inlineTitle = target.getAttribute('data-tooltip-title');
            const inlineContent = target.getAttribute('data-tooltip-content');
            const inlineTip = target.getAttribute('data-tooltip-tip');

            if (inlineTitle || inlineContent) {
                this.setContent({
                    title: inlineTitle || 'Info',
                    content: inlineContent || '',
                    tip: inlineTip
                });
            } else {
                return;
            }
        } else {
            this.setContent(content);
        }

        this.position(target);
        this.tooltipElement.classList.add('visible');
    }

    /**
     * Hide tooltip
     */
    hide() {
        this.tooltipElement.classList.remove('visible');
        this.currentTarget = null;
    }

    /**
     * Set tooltip content
     */
    setContent(content) {
        const titleEl = this.tooltipElement.querySelector('.tooltip-title');
        const contentEl = this.tooltipElement.querySelector('.tooltip-content');
        const tipEl = this.tooltipElement.querySelector('.tooltip-tip');
        const tipTextEl = this.tooltipElement.querySelector('.tip-text');

        titleEl.textContent = content.title || 'Info';
        contentEl.innerHTML = content.content || '';

        if (content.tip) {
            tipTextEl.textContent = content.tip;
            tipEl.style.display = 'flex';
        } else {
            tipEl.style.display = 'none';
        }
    }

    /**
     * Position tooltip relative to target
     */
    position(target) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // Default position: below the element
        let top = rect.bottom + 12;
        let left = rect.left;

        // Reset arrow classes
        this.tooltipElement.classList.remove('arrow-right', 'arrow-bottom');

        // Adjust if tooltip would go off-screen horizontally
        if (left + 320 > viewport.width) {
            left = viewport.width - 330;
            this.tooltipElement.classList.add('arrow-right');
        }

        // Adjust if tooltip would go off-screen vertically
        if (top + tooltipRect.height > viewport.height) {
            top = rect.top - tooltipRect.height - 12;
            this.tooltipElement.classList.add('arrow-bottom');
        }

        // Ensure minimum left position
        left = Math.max(10, left);

        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left}px`;
    }

    /**
     * Add tooltip to an element programmatically
     */
    addTooltip(element, key) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('data-tooltip', key);
        }
    }

    /**
     * Add custom tooltip content
     */
    addContent(key, content) {
        this.tooltipContent[key] = content;
    }

    /**
     * Create inline tooltip trigger
     */
    createTrigger(tooltipKey) {
        const trigger = document.createElement('span');
        trigger.className = 'tooltip-trigger';
        trigger.setAttribute('data-tooltip', tooltipKey);
        trigger.textContent = '?';
        return trigger;
    }

    /**
     * Auto-apply tooltips to common elements
     */
    autoApplyTooltips() {
        const mappings = {
            '#bio-name, #brand-name': 'bio-name',
            '#bio-title': 'bio-title',
            '#bio-achievements-container': 'bio-achievements',
            '#inquiry-type': 'inquiry-type',
            '#inquiry-tone': 'inquiry-tone',
            '#brand-audience': 'brand-audience',
            '#brand-values-container': 'brand-values',
            '#brand-diff-container': 'brand-differentiators',
            '#job-import-section': 'job-import',
            '#job-url-input': 'job-url',
            '.api-key-section input': 'api-key',
            '.btn-primary': 'generate-btn',
            '[onclick*="copyToClipboard"]': 'copy-btn'
        };

        for (const [selector, key] of Object.entries(mappings)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.hasAttribute('data-tooltip')) {
                    el.setAttribute('data-tooltip', key);
                }
            });
        }
    }
}

// Create global instance
const tooltipManager = new TooltipManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tooltipManager.initialize();
        tooltipManager.autoApplyTooltips();
    });
} else {
    tooltipManager.initialize();
    tooltipManager.autoApplyTooltips();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TooltipManager, tooltipManager };
}
