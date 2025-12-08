/**
 * ATSFlow Onboarding & Progress System
 * Guides users through the app and shows progress
 */

class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.hasSeenTour = localStorage.getItem('resumate_tour_completed') === 'true';
        this.overlayElement = null;
        this.highlightElement = null;
        this.modalElement = null;

        // Define tour steps for different pages
        this.tours = {
            main: [
                {
                    target: '.card:first-child',
                    title: 'Upload Your Resume',
                    content: 'Start by uploading your existing resume or paste the text directly. We support PDF, Word, and text files.',
                    position: 'right'
                },
                {
                    target: '.card:nth-child(2)',
                    title: 'Add Job Description',
                    content: 'Paste the job description you\'re targeting. This helps us optimize your resume for ATS systems and keyword matching.',
                    position: 'right'
                },
                {
                    target: '.card:nth-child(3)',
                    title: 'API Key Required',
                    content: 'Enter your Claude API key to enable AI-powered analysis. Your key is stored locally and never shared.',
                    position: 'right'
                },
                {
                    target: '#analyze-btn',
                    title: 'Analyze Your Resume',
                    content: 'Click here to get AI-powered feedback on how to improve your resume for your target job.',
                    position: 'top'
                },
                {
                    target: '.preview-panel',
                    title: 'Live Preview',
                    content: 'See your optimized resume in real-time. Export to PDF, Word, or print directly.',
                    position: 'left'
                }
            ],
            careerdocs: [
                {
                    target: '#job-import-section',
                    title: 'Import Job Postings',
                    content: 'Paste a job URL to automatically extract key information and tailor your documents to the position.',
                    position: 'bottom'
                },
                {
                    target: '.tabs',
                    title: 'Choose Your Document',
                    content: 'Create executive bios, status inquiry letters, or personal brand statements tailored to your needs.',
                    position: 'bottom'
                },
                {
                    target: '.option-cards',
                    title: 'Customize Your Output',
                    content: 'Select styles, tones, and lengths that match your audience and purpose.',
                    position: 'top'
                },
                {
                    target: '.btn-primary',
                    title: 'Generate Content',
                    content: 'Click to generate AI-powered content. Review and edit as needed before using.',
                    position: 'top'
                }
            ]
        };

        // Progress tracking for main resume builder
        this.progressSteps = {
            resumeUploaded: { label: 'Resume Added', complete: false },
            jobDescAdded: { label: 'Job Description Added', complete: false },
            apiKeySet: { label: 'API Key Configured', complete: false },
            analyzed: { label: 'Resume Analyzed', complete: false },
            exported: { label: 'Document Exported', complete: false }
        };
    }

    /**
     * Initialize the onboarding system
     */
    initialize() {
        this.createElements();
        this.loadProgress();
        this.attachProgressListeners();

        // Show welcome modal on every page load (user can dismiss)
        setTimeout(() => this.showWelcomeModal(), 800);

        // Show progress indicator
        this.updateProgressBar();

        console.log('[OnboardingManager] Initialized');
    }

    /**
     * Detect current page
     */
    detectPage() {
        const path = window.location.pathname;
        if (path.includes('careerdocs') || path.includes('test-careerdocs')) {
            return 'careerdocs';
        }
        return 'main';
    }

    /**
     * Create DOM elements for tour and progress
     */
    createElements() {
        // Overlay
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'onboarding-overlay';
        document.body.appendChild(this.overlayElement);

        // Highlight box
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'onboarding-highlight';
        document.body.appendChild(this.highlightElement);

        // Tour modal
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'onboarding-modal';
        this.modalElement.innerHTML = `
            <div class="onboarding-modal-content">
                <button class="onboarding-close">&times;</button>
                <div class="onboarding-step-indicator"></div>
                <h3 class="onboarding-title"></h3>
                <p class="onboarding-content"></p>
                <div class="onboarding-actions">
                    <button class="onboarding-btn onboarding-skip">Skip Tour</button>
                    <button class="onboarding-btn onboarding-prev" disabled>Previous</button>
                    <button class="onboarding-btn onboarding-next primary">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modalElement);

        // Progress bar container
        this.progressElement = document.createElement('div');
        this.progressElement.className = 'onboarding-progress-bar';
        this.progressElement.innerHTML = `
            <div class="progress-header">
                <span class="progress-title">Getting Started</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-steps"></div>
            <button class="progress-toggle">Hide</button>
        `;
        document.body.appendChild(this.progressElement);

        // Add event listeners
        this.modalElement.querySelector('.onboarding-close').addEventListener('click', () => this.endTour());
        this.modalElement.querySelector('.onboarding-skip').addEventListener('click', () => this.endTour());
        this.modalElement.querySelector('.onboarding-prev').addEventListener('click', () => this.prevStep());
        this.modalElement.querySelector('.onboarding-next').addEventListener('click', () => this.nextStep());
        this.progressElement.querySelector('.progress-toggle').addEventListener('click', () => this.toggleProgress());

        this.overlayElement.addEventListener('click', () => this.endTour());

        this.attachStyles();
    }

    /**
     * Attach CSS styles
     */
    attachStyles() {
        if (document.getElementById('onboarding-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'onboarding-styles';
        styles.textContent = `
            .onboarding-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 99990;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .onboarding-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .onboarding-highlight {
                position: fixed;
                z-index: 99991;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
                border-radius: 8px;
                pointer-events: none;
                transition: all 0.3s ease;
                opacity: 0;
            }

            .onboarding-highlight.active {
                opacity: 1;
            }

            .onboarding-modal {
                position: fixed;
                z-index: 99992;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }

            .onboarding-modal.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .onboarding-modal-content {
                background: white;
                border-radius: 16px;
                padding: 24px;
                width: 360px;
                max-width: 90vw;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
            }

            .onboarding-close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .onboarding-close:hover {
                background: #f0f0f0;
                color: #333;
            }

            .onboarding-step-indicator {
                display: flex;
                gap: 6px;
                margin-bottom: 16px;
            }

            .onboarding-step-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ddd;
                transition: all 0.3s;
            }

            .onboarding-step-dot.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                width: 24px;
                border-radius: 4px;
            }

            .onboarding-step-dot.completed {
                background: #27ae60;
            }

            .onboarding-title {
                margin: 0 0 12px;
                font-size: 20px;
                color: #2c3e50;
            }

            .onboarding-content {
                margin: 0 0 20px;
                font-size: 14px;
                line-height: 1.6;
                color: #666;
            }

            .onboarding-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .onboarding-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .onboarding-btn.onboarding-skip {
                background: none;
                color: #999;
            }

            .onboarding-btn.onboarding-skip:hover {
                color: #666;
            }

            .onboarding-btn.onboarding-prev,
            .onboarding-btn.onboarding-next {
                background: #f0f0f0;
                color: #333;
            }

            .onboarding-btn.onboarding-prev:hover,
            .onboarding-btn.onboarding-next:hover {
                background: #e0e0e0;
            }

            .onboarding-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .onboarding-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .onboarding-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Modal arrow */
            .onboarding-modal::before {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                background: white;
                transform: rotate(45deg);
            }

            .onboarding-modal.position-top::before {
                bottom: -8px;
                left: 50%;
                margin-left: -8px;
            }

            .onboarding-modal.position-bottom::before {
                top: -8px;
                left: 50%;
                margin-left: -8px;
            }

            .onboarding-modal.position-left::before {
                right: -8px;
                top: 50%;
                margin-top: -8px;
            }

            .onboarding-modal.position-right::before {
                left: -8px;
                top: 50%;
                margin-top: -8px;
            }

            /* Progress Bar */
            .onboarding-progress-bar {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 280px;
                background: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                z-index: 9990;
                transform: translateY(100%);
                opacity: 0;
                transition: all 0.3s ease;
            }

            .onboarding-progress-bar.visible {
                transform: translateY(0);
                opacity: 1;
            }

            .onboarding-progress-bar.minimized {
                width: auto;
                padding: 12px 16px;
            }

            .onboarding-progress-bar.minimized .progress-steps,
            .onboarding-progress-bar.minimized .progress-track {
                display: none;
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .progress-title {
                font-weight: 600;
                color: #2c3e50;
                font-size: 14px;
            }

            .progress-percentage {
                font-weight: 700;
                color: #667eea;
                font-size: 14px;
            }

            .progress-track {
                height: 6px;
                background: #eee;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 12px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                border-radius: 3px;
                width: 0%;
                transition: width 0.5s ease;
            }

            .progress-steps {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .progress-step {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: #999;
            }

            .progress-step.complete {
                color: #27ae60;
            }

            .progress-step-icon {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid currentColor;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }

            .progress-step.complete .progress-step-icon {
                background: #27ae60;
                border-color: #27ae60;
                color: white;
            }

            .progress-toggle {
                position: absolute;
                top: 8px;
                right: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                padding: 6px 12px;
                border-radius: 15px;
                transition: all 0.2s;
            }

            .progress-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
            }

            /* Welcome Modal */
            .welcome-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .welcome-modal.active {
                opacity: 1;
                visibility: visible;
            }

            .welcome-modal-content {
                background: white;
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                transform: scale(0.9);
                transition: transform 0.3s ease;
                position: relative;
            }

            .welcome-modal.active .welcome-modal-content {
                transform: scale(1);
            }

            .welcome-close-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 36px;
                height: 36px;
                border: none;
                background: #f0f0f0;
                border-radius: 50%;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .welcome-close-btn:hover {
                background: #e0e0e0;
                color: #333;
            }

            .welcome-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }

            .welcome-title {
                font-size: 28px;
                margin: 0 0 12px;
                color: #2c3e50;
            }

            .welcome-subtitle {
                color: #666;
                margin: 0 0 20px;
                line-height: 1.6;
            }

            .welcome-features {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
                text-align: left;
            }

            .welcome-feature {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;
                font-size: 14px;
                color: #555;
            }

            .welcome-feature .feature-icon {
                font-size: 18px;
            }

            .welcome-feature .tooltip-trigger {
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
            }

            .welcome-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .welcome-btn {
                padding: 14px 28px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .welcome-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .welcome-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }

            .welcome-btn.secondary {
                background: #f0f0f0;
                color: #333;
            }

            .welcome-btn.secondary:hover {
                background: #e0e0e0;
            }

            /* Dark theme support */
            [data-theme="dark"] .onboarding-modal-content,
            [data-theme="dark"] .onboarding-progress-bar,
            [data-theme="dark"] .welcome-modal-content {
                background: #1e272e;
                color: #ecf0f1;
            }

            [data-theme="dark"] .onboarding-title,
            [data-theme="dark"] .progress-title,
            [data-theme="dark"] .welcome-title {
                color: #ecf0f1;
            }

            [data-theme="dark"] .onboarding-content,
            [data-theme="dark"] .welcome-subtitle {
                color: #b2bec3;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Show welcome modal on every page load
     */
    showWelcomeModal() {
        // Remove any existing welcome modal
        const existing = document.querySelector('.welcome-modal');
        if (existing) existing.remove();

        const page = this.detectPage();
        const pageTitle = page === 'careerdocs' ? 'Career Documents' : 'ATSFlow';
        const pageDesc = page === 'careerdocs'
            ? 'Create executive bios, status inquiries, and brand statements tailored to your career goals.'
            : 'Create ATS-optimized resumes that get noticed by recruiters and hiring managers.';

        const modal = document.createElement('div');
        modal.className = 'welcome-modal';
        modal.innerHTML = `
            <div class="welcome-modal-content">
                <button class="welcome-close-btn" onclick="onboardingManager.closeWelcome(this)" aria-label="Close">&times;</button>
                <div class="welcome-icon">🎯</div>
                <h2 class="welcome-title">Welcome to ${pageTitle}!</h2>
                <p class="welcome-subtitle">${pageDesc}</p>
                <div class="welcome-features">
                    <div class="welcome-feature">
                        <span class="feature-icon">💡</span>
                        <span>Hover over <span class="tooltip-trigger" style="margin: 0 4px;">?</span> icons for tips</span>
                    </div>
                    <div class="welcome-feature">
                        <span class="feature-icon">🌙</span>
                        <span>Use the theme toggle (top-right) for dark mode</span>
                    </div>
                </div>
                <div class="welcome-actions">
                    <button class="welcome-btn secondary" onclick="onboardingManager.closeWelcome(this)">
                        Got it, let's go!
                    </button>
                    <button class="welcome-btn primary" onclick="onboardingManager.startTourFromWelcome(this)">
                        Take the Tour
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Close welcome modal without starting tour
     */
    closeWelcome(button) {
        const modal = button.closest('.welcome-modal');
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    /**
     * Skip welcome and close modal
     */
    skipWelcome(button) {
        const modal = button.closest('.welcome-modal');
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        localStorage.setItem('resumate_tour_completed', 'true');
        this.hasSeenTour = true;
    }

    /**
     * Start tour from welcome modal
     */
    startTourFromWelcome(button) {
        const modal = button.closest('.welcome-modal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            this.startTour();
        }, 300);
    }

    /**
     * Start guided tour
     */
    startTour() {
        const page = this.detectPage();
        const tour = this.tours[page];

        if (!tour || tour.length === 0) return;

        this.currentStep = 0;
        this.isActive = true;
        this.overlayElement.classList.add('active');
        this.showStep();
    }

    /**
     * Show current step
     */
    showStep() {
        const page = this.detectPage();
        const tour = this.tours[page];
        const step = tour[this.currentStep];

        if (!step) {
            this.endTour();
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) {
            console.warn(`[Onboarding] Target not found: ${step.target}`);
            this.nextStep();
            return;
        }

        // Update step indicators
        const indicatorContainer = this.modalElement.querySelector('.onboarding-step-indicator');
        indicatorContainer.innerHTML = tour.map((_, i) => `
            <div class="onboarding-step-dot ${i < this.currentStep ? 'completed' : ''} ${i === this.currentStep ? 'active' : ''}"></div>
        `).join('');

        // Update content
        this.modalElement.querySelector('.onboarding-title').textContent = step.title;
        this.modalElement.querySelector('.onboarding-content').textContent = step.content;

        // Update buttons
        const prevBtn = this.modalElement.querySelector('.onboarding-prev');
        const nextBtn = this.modalElement.querySelector('.onboarding-next');
        prevBtn.disabled = this.currentStep === 0;
        nextBtn.textContent = this.currentStep === tour.length - 1 ? 'Finish' : 'Next';

        // Position highlight
        const rect = target.getBoundingClientRect();
        this.highlightElement.style.top = `${rect.top - 8}px`;
        this.highlightElement.style.left = `${rect.left - 8}px`;
        this.highlightElement.style.width = `${rect.width + 16}px`;
        this.highlightElement.style.height = `${rect.height + 16}px`;
        this.highlightElement.classList.add('active');

        // Position modal
        this.positionModal(rect, step.position);
        this.modalElement.classList.add('active');

        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Position modal relative to target
     */
    positionModal(rect, position) {
        const modalRect = this.modalElement.querySelector('.onboarding-modal-content').getBoundingClientRect();
        let top, left;

        // Remove previous position classes
        this.modalElement.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
        this.modalElement.classList.add(`position-${position}`);

        switch (position) {
            case 'top':
                top = rect.top - modalRect.height - 20;
                left = rect.left + (rect.width / 2) - (modalRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width / 2) - (modalRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (modalRect.height / 2);
                left = rect.left - modalRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (modalRect.height / 2);
                left = rect.right + 20;
                break;
        }

        // Keep within viewport
        top = Math.max(10, Math.min(top, window.innerHeight - modalRect.height - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - modalRect.width - 10));

        this.modalElement.style.top = `${top}px`;
        this.modalElement.style.left = `${left}px`;
    }

    /**
     * Go to next step
     */
    nextStep() {
        const page = this.detectPage();
        const tour = this.tours[page];

        if (this.currentStep >= tour.length - 1) {
            this.endTour();
        } else {
            this.currentStep++;
            this.showStep();
        }
    }

    /**
     * Go to previous step
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    /**
     * End tour
     */
    endTour() {
        this.isActive = false;
        this.overlayElement.classList.remove('active');
        this.highlightElement.classList.remove('active');
        this.modalElement.classList.remove('active');
        localStorage.setItem('resumate_tour_completed', 'true');
        this.hasSeenTour = true;
    }

    /**
     * Load saved progress
     */
    loadProgress() {
        const saved = localStorage.getItem('resumate_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(this.progressSteps, parsed);
            } catch (e) {
                console.error('[Onboarding] Failed to load progress:', e);
            }
        }
    }

    /**
     * Reset all progress (clear localStorage)
     */
    resetProgress() {
        // Reset all steps to incomplete
        Object.keys(this.progressSteps).forEach(key => {
            this.progressSteps[key].complete = false;
        });

        // Clear from localStorage
        localStorage.removeItem('resumate_progress');

        // Update the progress bar
        this.updateProgressBar();

        console.log('[Onboarding] Progress reset');
    }

    /**
     * Add reset button to progress bar (for testing/development)
     */
    addResetButton() {
        if (!this.progressElement) return;

        const resetBtn = document.createElement('button');
        resetBtn.className = 'progress-reset-btn';
        resetBtn.innerHTML = '↻ Reset Progress';
        resetBtn.title = 'Clear all progress';
        resetBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        `;

        resetBtn.addEventListener('mouseover', () => {
            resetBtn.style.background = 'rgba(255,255,255,0.1)';
        });

        resetBtn.addEventListener('mouseout', () => {
            resetBtn.style.background = 'transparent';
        });

        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Reset all progress? This will clear your current session.')) {
                this.resetProgress();
                // Also clear the inputs
                const resumeText = document.getElementById('resume-text');
                const jobText = document.getElementById('job-text');
                if (resumeText) resumeText.value = '';
                if (jobText) jobText.value = '';
            }
        });

        this.progressElement.appendChild(resetBtn);
    }

    /**
     * Save progress
     */
    saveProgress() {
        localStorage.setItem('resumate_progress', JSON.stringify(this.progressSteps));
    }

    /**
     * Mark step as complete
     */
    completeStep(stepKey) {
        if (this.progressSteps[stepKey]) {
            this.progressSteps[stepKey].complete = true;
            this.saveProgress();
            this.updateProgressBar();
        }
    }

    /**
     * Check if server has API key configured
     */
    async checkServerApiKey() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();

            if (config.hasServerApiKey) {
                console.log('[Onboarding] ✅ Server API key detected - marking step complete');
                this.completeStep('apiKeySet');
            }
        } catch (error) {
            console.error('[Onboarding] Failed to check server API key:', error);
        }
    }

    /**
     * Attach listeners to track progress
     */
    attachProgressListeners() {
        // Check for server API key on load
        this.checkServerApiKey();

        // Listen to workflow state changes (new unified state management)
        if (window.workflowState) {
            window.workflowState.on('change', (data) => {
                this.handleWorkflowStateChange(data);
            });
            console.log('[Onboarding] Listening to workflow state changes');

            // Check initial state
            this.syncWithWorkflowState();
        }

        // Fallback to direct DOM listeners if workflow state not available
        // Resume input
        const resumeText = document.getElementById('resume-text');
        const resumeFile = document.getElementById('resume-file');
        if (resumeText) {
            resumeText.addEventListener('input', () => {
                if (resumeText.value.length > 50) {
                    this.completeStep('resumeUploaded');
                }
            });
        }
        if (resumeFile) {
            resumeFile.addEventListener('change', () => {
                this.completeStep('resumeUploaded');
            });
        }

        // Job description - text input
        const jobText = document.getElementById('job-text');
        if (jobText) {
            jobText.addEventListener('input', () => {
                if (jobText.value.length > 50) {
                    this.completeStep('jobDescAdded');
                }
            });
        }

        // Job description - file upload
        const jobFile = document.getElementById('job-file');
        if (jobFile) {
            jobFile.addEventListener('change', () => {
                // Wait a bit for the file to be processed
                setTimeout(() => {
                    if (jobText && jobText.value.length > 50) {
                        this.completeStep('jobDescAdded');
                    }
                }, 1000);
            });
        }

        // API Key
        const apiKey = document.getElementById('api-key');
        if (apiKey) {
            apiKey.addEventListener('input', () => {
                if (apiKey.value.length > 10) {
                    this.completeStep('apiKeySet');
                }
            });
        }

        // Analyze button click
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                setTimeout(() => this.completeStep('analyzed'), 2000);
            });
        }
    }

    /**
     * Handle workflow state changes
     * Updates progress indicators in real-time
     * @param {Object} data - Change event data
     */
    handleWorkflowStateChange(data) {
        if (!data || !data.state) return;

        const state = data.state;

        // Check resume uploaded
        if (state.inputs?.resume?.text && state.inputs.resume.text.length > 50) {
            this.completeStep('resumeUploaded');
        }

        // Check job description added
        if (state.inputs?.job?.description && state.inputs.job.description.length > 50) {
            this.completeStep('jobDescAdded');
        }

        // Check API key set
        if (state.inputs?.preferences?.apiKey && state.inputs.preferences.apiKey.length > 10) {
            this.completeStep('apiKeySet');
        }

        // Check analysis completed
        if (state.analysis?.score !== null || state.analysis?.timestamp) {
            this.completeStep('analyzed');
        }

        // Check if documents exported
        if (state.documents) {
            const hasDocument = Object.values(state.documents).some(doc => doc !== null);
            if (hasDocument) {
                this.completeStep('exported');
            }
        }

        console.log('[Onboarding] Updated progress from workflow state');
    }

    /**
     * Sync progress with current workflow state
     * Called on initialization
     */
    syncWithWorkflowState() {
        if (!window.workflowState) return;

        const state = window.workflowState.getState();
        this.handleWorkflowStateChange({ state });

        console.log('[Onboarding] Synced with workflow state');
    }

    /**
     * Update progress bar display
     */
    updateProgressBar() {
        const steps = Object.entries(this.progressSteps);
        const completedCount = steps.filter(([, s]) => s.complete).length;
        const percentage = Math.round((completedCount / steps.length) * 100);

        // Update percentage
        this.progressElement.querySelector('.progress-percentage').textContent = `${percentage}%`;

        // Update fill
        this.progressElement.querySelector('.progress-fill').style.width = `${percentage}%`;

        // Update steps list
        const stepsContainer = this.progressElement.querySelector('.progress-steps');
        stepsContainer.innerHTML = steps.map(([key, step]) => `
            <div class="progress-step ${step.complete ? 'complete' : ''}">
                <span class="progress-step-icon">${step.complete ? '✓' : ''}</span>
                <span>${step.label}</span>
            </div>
        `).join('');

        // Show progress bar
        if (percentage < 100 && this.detectPage() === 'main') {
            setTimeout(() => this.progressElement.classList.add('visible'), 500);
        }

        // Hide if complete
        if (percentage === 100) {
            setTimeout(() => this.progressElement.classList.remove('visible'), 2000);
        }
    }

    /**
     * Toggle progress bar visibility
     */
    toggleProgress() {
        this.progressElement.classList.toggle('minimized');
        const toggleBtn = this.progressElement.querySelector('.progress-toggle');
        toggleBtn.textContent = this.progressElement.classList.contains('minimized') ? 'Expand' : 'Hide';
    }

    /**
     * Manually trigger tour
     */
    showTour() {
        this.startTour();
    }

    /**
     * Reset tour (for testing)
     */
    resetTour() {
        localStorage.removeItem('resumate_tour_completed');
        localStorage.removeItem('resumate_progress');
        this.hasSeenTour = false;
        Object.keys(this.progressSteps).forEach(key => {
            this.progressSteps[key].complete = false;
        });
        this.updateProgressBar();
    }
}

// Create global instance
const onboardingManager = new OnboardingManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        onboardingManager.initialize();
    });
} else {
    onboardingManager.initialize();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OnboardingManager, onboardingManager };
}
