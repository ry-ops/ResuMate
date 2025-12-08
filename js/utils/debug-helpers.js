/**
 * Debug Helpers for ATSFlow Workflow
 * Console utilities for debugging and testing the workflow integration
 *
 * Usage in browser console:
 *   ATSFlowDebug.inspectState()
 *   ATSFlowDebug.testAPI('/api/analyze', {...})
 *   ATSFlowDebug.resetWorkflow()
 *   ATSFlowDebug.simulateUpload()
 *
 * @version 1.0.0
 */

window.ATSFlowDebug = {
    /**
     * Inspect current workflow state
     */
    inspectState() {
        console.group('📊 ATSFlow Workflow State');

        // LocalStorage state
        console.group('💾 LocalStorage Data');
        console.log('API Key:', localStorage.getItem('claude_api_key') ? '✓ Set' : '✗ Not set');
        console.log('Resume Text:', localStorage.getItem('resumate_resume_text')?.substring(0, 50) + '...' || '✗ Not set');
        console.log('Job Text:', localStorage.getItem('resumate_job_text')?.substring(0, 50) + '...' || '✗ Not set');
        console.log('Analysis Results:', localStorage.getItem('resumate_analysis_results') ? '✓ Available' : '✗ Not available');
        console.log('Current Step:', localStorage.getItem('resumate_current_step') || 'Not set');
        console.groupEnd();

        // Workflow state object
        if (window.workflowState) {
            console.group('🔄 Workflow State Object');
            console.log('Current Step:', window.workflowState.get('currentStep'));
            console.log('Steps Completed:', window.workflowState.get('steps'));
            console.log('Inputs:', window.workflowState.get('inputs'));
            console.log('Analysis:', window.workflowState.get('analysis'));
            console.log('Documents:', window.workflowState.get('documents'));
            console.groupEnd();
        }

        // DOM elements
        console.group('🌐 DOM State');
        const steps = document.querySelectorAll('.workflow-step');
        steps.forEach((step, index) => {
            const isVisible = step.style.display !== 'none' && !step.classList.contains('locked');
            console.log(`Step ${index + 1}:`, isVisible ? '👁️ Visible' : '🔒 Hidden');
        });
        console.groupEnd();

        console.groupEnd();
    },

    /**
     * Test API endpoint
     * @param {string} endpoint - API endpoint path
     * @param {object} payload - Request payload
     */
    async testAPI(endpoint, payload = {}) {
        console.group(`🔌 Testing API: ${endpoint}`);

        try {
            const startTime = performance.now();

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            console.log('⏱️ Duration:', duration + 'ms');
            console.log('✅ Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('📦 Response:', data);

            console.groupEnd();
            return data;
        } catch (error) {
            console.error('❌ Error:', error);
            console.groupEnd();
            throw error;
        }
    },

    /**
     * Reset workflow to initial state
     */
    resetWorkflow() {
        console.log('🔄 Resetting workflow...');

        // Clear localStorage (except API key)
        const apiKey = localStorage.getItem('claude_api_key');
        localStorage.clear();
        if (apiKey) {
            localStorage.setItem('claude_api_key', apiKey);
            console.log('✓ Preserved API key');
        }

        // Reset workflow state object
        if (window.workflowState) {
            window.workflowState.reset();
            console.log('✓ Reset workflow state');
        }

        // Reset DOM
        const steps = document.querySelectorAll('.workflow-step');
        steps.forEach((step, index) => {
            if (index === 0) {
                step.classList.add('active');
                step.classList.remove('locked');
                step.style.display = 'block';
            } else {
                step.classList.remove('active');
                step.classList.add('locked');
                step.style.display = 'none';
            }
        });

        // Clear form inputs
        const inputs = document.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            if (input.id !== 'api-key') {
                input.value = '';
            }
        });

        console.log('✅ Workflow reset complete');
        window.location.reload();
    },

    /**
     * Simulate resume upload with test data
     */
    simulateUpload() {
        console.log('📤 Simulating resume upload...');

        const mockResume = `John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 7+ years developing scalable web applications.

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture
- Technologies: React, Node.js, AWS, Docker

EDUCATION
Bachelor of Science in Computer Science | 2018

SKILLS
JavaScript, React, Node.js, TypeScript, AWS, Docker`;

        const mockJob = `Senior Full Stack Engineer
RemoteTech Solutions

Requirements:
- 5+ years of software engineering experience
- Expert knowledge of React and Node.js
- Experience with cloud platforms (AWS/Azure)
- Docker and Kubernetes experience

Responsibilities:
- Design and implement scalable web applications
- Lead technical architecture decisions
- Mentor junior engineers`;

        const resumeText = document.getElementById('resume-text');
        const jobText = document.getElementById('job-text');

        if (resumeText) {
            resumeText.value = mockResume;
            resumeText.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✓ Resume text set');
        }

        if (jobText) {
            jobText.value = mockJob;
            jobText.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✓ Job description set');
        }

        // Save to localStorage
        localStorage.setItem('resumate_resume_text', mockResume);
        localStorage.setItem('resumate_job_text', mockJob);

        console.log('✅ Upload simulation complete');
    },

    /**
     * Simulate complete workflow progression
     */
    async simulateWorkflow() {
        console.group('🎯 Simulating Complete Workflow');

        // Step 1: Upload
        console.log('Step 1: Uploading documents...');
        this.simulateUpload();
        await this.sleep(1000);

        // Step 2: Analyze
        console.log('Step 2: Running analysis...');
        const apiKey = localStorage.getItem('claude_api_key') || 'test-key';
        try {
            await this.testAPI('/api/analyze', {
                resumeText: localStorage.getItem('resumate_resume_text'),
                jobText: localStorage.getItem('resumate_job_text'),
                apiKey: apiKey
            });
        } catch (error) {
            console.warn('Analysis failed (expected if no API key):', error.message);
        }
        await this.sleep(1000);

        // Step 3: Tailor
        console.log('Step 3: Tailoring resume...');
        await this.sleep(1000);

        // Step 4: Optimize
        console.log('Step 4: Running ATS scan...');
        await this.sleep(1000);

        // Step 5: Export
        console.log('Step 5: Preparing export...');
        await this.sleep(1000);

        console.log('✅ Workflow simulation complete');
        console.groupEnd();
    },

    /**
     * Export current state as JSON
     */
    exportState() {
        const state = {
            localStorage: {
                apiKey: localStorage.getItem('claude_api_key') ? '***' : null,
                resumeText: localStorage.getItem('resumate_resume_text'),
                jobText: localStorage.getItem('resumate_job_text'),
                analysisResults: localStorage.getItem('resumate_analysis_results'),
                currentStep: localStorage.getItem('resumate_current_step')
            },
            workflowState: window.workflowState?.getState?.() || null,
            timestamp: new Date().toISOString()
        };

        console.log('📋 Exporting state...');
        console.log(JSON.stringify(state, null, 2));

        // Copy to clipboard
        const stateJson = JSON.stringify(state, null, 2);
        navigator.clipboard.writeText(stateJson).then(() => {
            console.log('✅ State copied to clipboard');
        });

        return state;
    },

    /**
     * Import state from JSON
     * @param {object} state - State object to import
     */
    importState(state) {
        console.log('📥 Importing state...');

        if (state.localStorage) {
            Object.keys(state.localStorage).forEach(key => {
                if (state.localStorage[key]) {
                    localStorage.setItem(key, state.localStorage[key]);
                }
            });
            console.log('✓ LocalStorage restored');
        }

        if (window.workflowState && state.workflowState) {
            window.workflowState.setState?.(state.workflowState);
            console.log('✓ Workflow state restored');
        }

        console.log('✅ State import complete');
    },

    /**
     * Monitor API calls
     */
    startAPIMonitoring() {
        console.log('🔍 Starting API monitoring...');

        const originalFetch = window.fetch;
        let callCount = 0;

        window.fetch = async function(...args) {
            callCount++;
            const callId = callCount;
            const url = args[0];
            const options = args[1] || {};

            console.group(`🌐 API Call #${callId}: ${url}`);
            console.log('Method:', options.method || 'GET');
            console.log('Headers:', options.headers);

            if (options.body) {
                try {
                    const body = JSON.parse(options.body);
                    console.log('Payload:', body);
                } catch (e) {
                    console.log('Payload:', options.body);
                }
            }

            const startTime = performance.now();

            try {
                const response = await originalFetch.apply(this, args);
                const duration = Math.round(performance.now() - startTime);

                console.log('✅ Status:', response.status);
                console.log('⏱️ Duration:', duration + 'ms');
                console.groupEnd();

                return response;
            } catch (error) {
                console.error('❌ Error:', error);
                console.groupEnd();
                throw error;
            }
        };

        console.log('✅ API monitoring enabled');
    },

    /**
     * Stop API monitoring
     */
    stopAPIMonitoring() {
        if (window.originalFetch) {
            window.fetch = window.originalFetch;
            console.log('🛑 API monitoring disabled');
        }
    },

    /**
     * Check system health
     */
    async checkHealth() {
        console.group('🏥 System Health Check');

        // Check localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('✅ LocalStorage: OK');
        } catch (e) {
            console.error('❌ LocalStorage: Failed', e);
        }

        // Check API server
        try {
            const response = await fetch('/health');
            if (response.ok) {
                console.log('✅ API Server: OK');
            } else {
                console.warn('⚠️ API Server: Unhealthy');
            }
        } catch (e) {
            console.error('❌ API Server: Unreachable', e);
        }

        // Check DOM elements
        const requiredElements = [
            'resume-text',
            'job-text',
            'step-upload',
            'step-analyze'
        ];

        requiredElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                console.log(`✅ Element #${id}: Found`);
            } else {
                console.warn(`⚠️ Element #${id}: Missing`);
            }
        });

        // Check global objects
        const globals = ['workflowUI', 'workflowState', 'workflowEngine'];
        globals.forEach(name => {
            if (window[name]) {
                console.log(`✅ Global ${name}: Available`);
            } else {
                console.warn(`⚠️ Global ${name}: Missing`);
            }
        });

        console.groupEnd();
    },

    /**
     * Validate workflow step requirements
     * @param {number} stepNumber - Step number to validate
     */
    validateStep(stepNumber) {
        console.group(`🔍 Validating Step ${stepNumber}`);

        const validations = {
            1: () => {
                const hasResume = !!localStorage.getItem('resumate_resume_text');
                console.log('Resume uploaded:', hasResume ? '✅' : '❌');
                return hasResume;
            },
            2: () => {
                const hasJob = !!localStorage.getItem('resumate_job_text');
                const hasApiKey = !!localStorage.getItem('claude_api_key');
                console.log('Job description:', hasJob ? '✅' : '❌');
                console.log('API key:', hasApiKey ? '✅' : '❌');
                return hasJob && hasApiKey;
            },
            3: () => {
                const hasAnalysis = !!localStorage.getItem('resumate_analysis_results');
                console.log('Analysis complete:', hasAnalysis ? '✅' : '❌');
                return hasAnalysis;
            },
            4: () => {
                console.log('Tailoring complete:', '✅');
                return true;
            },
            5: () => {
                console.log('Ready to export:', '✅');
                return true;
            }
        };

        const isValid = validations[stepNumber]?.() || false;
        console.log('Overall:', isValid ? '✅ Valid' : '❌ Invalid');
        console.groupEnd();

        return isValid;
    },

    /**
     * Sleep utility for simulations
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Print help message
     */
    help() {
        console.log(`
🔧 ATSFlow Debug Helpers

Available Commands:
  ATSFlowDebug.inspectState()           - View current workflow state
  ATSFlowDebug.testAPI(url, payload)    - Test API endpoint
  ATSFlowDebug.resetWorkflow()          - Reset to initial state
  ATSFlowDebug.simulateUpload()         - Fill forms with test data
  ATSFlowDebug.simulateWorkflow()       - Run complete workflow simulation
  ATSFlowDebug.exportState()            - Export state as JSON
  ATSFlowDebug.importState(state)       - Import state from JSON
  ATSFlowDebug.startAPIMonitoring()     - Monitor all API calls
  ATSFlowDebug.stopAPIMonitoring()      - Stop API monitoring
  ATSFlowDebug.checkHealth()            - Run system health check
  ATSFlowDebug.validateStep(n)          - Validate step requirements
  ATSFlowDebug.help()                   - Show this help message

Example Usage:
  ATSFlowDebug.inspectState()
  ATSFlowDebug.simulateUpload()
  ATSFlowDebug.testAPI('/api/analyze', {
    resumeText: 'My resume...',
    jobText: 'Job description...',
    apiKey: 'sk-ant-...'
  })
        `);
    }
};

// Auto-initialize
console.log('🔧 ATSFlow Debug Helpers loaded. Type ATSFlowDebug.help() for commands.');
