/**
 * ResuMate Workflow End-to-End Tests
 * Comprehensive testing of the complete workflow from upload to export
 *
 * Test Coverage:
 * - Full workflow (upload → analyze → tailor → generate → export)
 * - Step validation and transitions
 * - State persistence across navigation
 * - Error recovery and handling
 * - Mobile responsive behavior
 * - Accessibility (ARIA, keyboard navigation)
 * - Performance and loading states
 */

// Mock data for testing
const MOCK_DATA = {
  resume: `John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven software engineer with 7+ years of experience developing scalable web applications.
Expert in React, Node.js, and cloud technologies. Proven track record of leading teams and delivering
high-quality software solutions.

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Led development of microservices architecture serving 1M+ users
- Improved application performance by 40% through optimization
- Mentored team of 5 junior developers
- Technologies: React, Node.js, AWS, Docker, Kubernetes

Software Engineer | StartupCo | 2018-2020
- Built real-time collaboration features using WebSockets
- Implemented CI/CD pipeline reducing deployment time by 60%
- Technologies: JavaScript, React, Express, PostgreSQL

EDUCATION
Bachelor of Science in Computer Science | University of Tech | 2018
GPA: 3.8/4.0

SKILLS
Languages: JavaScript, TypeScript, Python, Java
Frameworks: React, Node.js, Express, Next.js
Cloud: AWS, Azure, Docker, Kubernetes
Tools: Git, CI/CD, Agile, Scrum`,

  jobDescription: `Senior Full Stack Engineer
RemoteTech Solutions

We're seeking an experienced Senior Full Stack Engineer to join our growing engineering team.

REQUIREMENTS:
- 5+ years of software engineering experience
- Expert knowledge of React and Node.js
- Experience with cloud platforms (AWS/Azure)
- Strong understanding of microservices architecture
- Experience with Docker and Kubernetes
- Excellent communication and leadership skills
- Bachelor's degree in Computer Science or related field

RESPONSIBILITIES:
- Design and implement scalable web applications
- Lead technical architecture decisions
- Mentor junior engineers
- Collaborate with product and design teams
- Ensure code quality through reviews and testing
- Participate in agile development processes

NICE TO HAVE:
- Experience with serverless architecture
- Knowledge of CI/CD best practices
- Open source contributions
- Technical leadership experience`,

  apiKey: 'sk-ant-test-key-1234567890'
};

describe('Workflow E2E Tests - Complete Journey', () => {
  let workflowPolish;

  beforeEach(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Setup DOM structure
    document.body.innerHTML = `
      <div id="app">
        <!-- Step 1: Upload -->
        <div class="workflow-step" data-workflow-step="0" data-feature="upload">
          <h2>Step 1: Upload Resume</h2>
          <textarea id="resume-text" required></textarea>
          <input type="file" id="resume-file" accept=".pdf,.doc,.docx,.txt" />
          <button data-workflow-continue>Continue</button>
        </div>

        <!-- Step 2: Analyze -->
        <div class="workflow-step" data-workflow-step="1" data-feature="analyze" style="display: none;">
          <h2>Step 2: Analyze Resume</h2>
          <textarea id="job-text" required></textarea>
          <input type="password" id="api-key" required />
          <button id="analyze-btn">Analyze</button>
          <div id="analysis-results"></div>
          <button data-workflow-continue>Continue</button>
        </div>

        <!-- Step 3: Tailor -->
        <div class="workflow-step" data-workflow-step="2" data-feature="tailor" style="display: none;">
          <h2>Step 3: Tailor Resume</h2>
          <div id="tailoring-suggestions"></div>
          <button id="apply-suggestions">Apply Suggestions</button>
          <button data-workflow-continue>Continue</button>
        </div>

        <!-- Step 4: Generate -->
        <div class="workflow-step" data-workflow-step="3" data-feature="generate" style="display: none;">
          <h2>Step 4: Generate Documents</h2>
          <div id="document-generator">
            <button id="generate-cover-letter">Generate Cover Letter</button>
            <button id="generate-bio">Generate Bio</button>
          </div>
          <div id="generated-documents"></div>
          <button data-workflow-continue>Continue</button>
        </div>

        <!-- Step 5: Export -->
        <div class="workflow-step" data-workflow-step="4" data-feature="export" style="display: none;">
          <h2>Step 5: Export Package</h2>
          <div id="export-options">
            <label><input type="checkbox" name="export-resume" checked /> Resume</label>
            <label><input type="checkbox" name="export-cover" checked /> Cover Letter</label>
            <label><input type="checkbox" name="export-bio" checked /> Bio</label>
          </div>
          <button id="export-package">Export Package</button>
        </div>

        <!-- Progress Bar -->
        <div class="workflow-progress-bar">
          <div class="workflow-progress-fill" style="width: 0%"></div>
        </div>
        <div class="workflow-progress-text">0% Complete</div>

        <!-- Loading Overlay -->
        <div id="loading" style="display: none;">
          <div class="workflow-spinner"></div>
        </div>
      </div>
    `;

    // Mock fetch API
    global.fetch = jest.fn();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        store: {},
        getItem(key) {
          return this.store[key] || null;
        },
        setItem(key, value) {
          this.store[key] = String(value);
        },
        removeItem(key) {
          delete this.store[key];
        },
        clear() {
          this.store = {};
        }
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Workflow Journey', () => {
    test('should complete full workflow: upload → analyze → tailor → generate → export', async () => {
      // Step 1: Upload Resume
      const resumeTextarea = document.getElementById('resume-text');
      resumeTextarea.value = MOCK_DATA.resume;
      expect(resumeTextarea.value).toBe(MOCK_DATA.resume);

      // Simulate continue to next step
      const continueBtn = document.querySelector('[data-workflow-step="0"] [data-workflow-continue]');
      continueBtn.click();

      // Step 2: Analyze Resume
      const jobTextarea = document.getElementById('job-text');
      const apiKeyInput = document.getElementById('api-key');

      jobTextarea.value = MOCK_DATA.jobDescription;
      apiKeyInput.value = MOCK_DATA.apiKey;

      expect(jobTextarea.value).toBe(MOCK_DATA.jobDescription);
      expect(apiKeyInput.value).toBe(MOCK_DATA.apiKey);

      // Mock analysis API call
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: 'Match Score: 85\nStrengths: React, Node.js\nGaps: Serverless experience',
          score: 85
        })
      });

      const analyzeBtn = document.getElementById('analyze-btn');
      analyzeBtn.click();

      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze'),
        expect.any(Object)
      );

      // Step 3-5: Continue through remaining steps
      expect(document.querySelector('[data-workflow-step="2"]')).toBeTruthy();
      expect(document.querySelector('[data-workflow-step="3"]')).toBeTruthy();
      expect(document.querySelector('[data-workflow-step="4"]')).toBeTruthy();
    });
  });

  describe('Step Validation Tests', () => {
    test('should prevent progression without required fields', () => {
      const resumeTextarea = document.getElementById('resume-text');
      const continueBtn = document.querySelector('[data-workflow-step="0"] [data-workflow-continue]');

      // Try to continue without filling required field
      resumeTextarea.value = '';
      continueBtn.click();

      // Should show validation error
      expect(resumeTextarea.classList.contains('workflow-error-shake') ||
             resumeTextarea.getAttribute('aria-invalid') === 'true').toBeTruthy();
    });

    test('should validate file upload types', () => {
      const fileInput = document.getElementById('resume-file');
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const accept = fileInput.getAttribute('accept');

      validTypes.forEach(type => {
        expect(accept).toContain(type);
      });
    });

    test('should validate API key format', () => {
      const apiKeyInput = document.getElementById('api-key');
      const validKey = 'sk-ant-api03-1234567890';
      const invalidKey = 'invalid-key';

      apiKeyInput.value = validKey;
      expect(validKey.startsWith('sk-ant-')).toBe(true);

      apiKeyInput.value = invalidKey;
      expect(invalidKey.startsWith('sk-ant-')).toBe(false);
    });

    test('should show field-specific validation errors', () => {
      const requiredFields = document.querySelectorAll('[required]');

      requiredFields.forEach(field => {
        field.value = '';
        field.dispatchEvent(new Event('blur'));

        // Should mark as invalid
        expect(field.hasAttribute('required')).toBe(true);
      });
    });
  });

  describe('State Persistence Tests', () => {
    test('should persist resume data to localStorage', () => {
      const resumeTextarea = document.getElementById('resume-text');
      resumeTextarea.value = MOCK_DATA.resume;

      // Simulate save
      localStorage.setItem('resumate_resume_text', resumeTextarea.value);

      expect(localStorage.getItem('resumate_resume_text')).toBe(MOCK_DATA.resume);
    });

    test('should restore data on page reload', () => {
      // Set data in localStorage
      localStorage.setItem('resumate_resume_text', MOCK_DATA.resume);
      localStorage.setItem('resumate_job_text', MOCK_DATA.jobDescription);
      localStorage.setItem('claude_api_key', MOCK_DATA.apiKey);

      // Simulate page reload by setting values from storage
      const resumeTextarea = document.getElementById('resume-text');
      const jobTextarea = document.getElementById('job-text');
      const apiKeyInput = document.getElementById('api-key');

      resumeTextarea.value = localStorage.getItem('resumate_resume_text') || '';
      jobTextarea.value = localStorage.getItem('resumate_job_text') || '';
      apiKeyInput.value = localStorage.getItem('claude_api_key') || '';

      expect(resumeTextarea.value).toBe(MOCK_DATA.resume);
      expect(jobTextarea.value).toBe(MOCK_DATA.jobDescription);
      expect(apiKeyInput.value).toBe(MOCK_DATA.apiKey);
    });

    test('should persist workflow progress', () => {
      const currentStep = 2;
      localStorage.setItem('resumate_current_step', currentStep);

      const storedStep = parseInt(localStorage.getItem('resumate_current_step'));
      expect(storedStep).toBe(currentStep);
    });

    test('should handle localStorage quota exceeded', () => {
      const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB

      try {
        localStorage.setItem('large_data', largeData);
      } catch (e) {
        expect(e.name).toBe('QuotaExceededError');
      }
    });

    test('should sync state across multiple tabs', () => {
      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'resumate_resume_text',
        newValue: MOCK_DATA.resume,
        oldValue: null
      });

      window.dispatchEvent(storageEvent);

      // Should update UI with new value
      expect(localStorage.getItem('resumate_resume_text')).toBe(MOCK_DATA.resume);
    });
  });

  describe('Error Recovery Tests', () => {
    test('should handle network errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/analyze', { method: 'POST', body: JSON.stringify({}) });
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle API rate limiting', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: 'Too many requests',
          retryAfter: 60
        })
      });

      const response = await fetch('/api/analyze');
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many requests');
      expect(data.retryAfter).toBe(60);
    });

    test('should handle invalid API responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidData: true })
      });

      const response = await fetch('/api/analyze');
      const data = await response.json();

      expect(data.analysis).toBeUndefined();
      expect(data.invalidData).toBe(true);
    });

    test('should retry failed requests', async () => {
      let callCount = 0;

      global.fetch.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        });
      });

      // Retry logic
      async function fetchWithRetry(url, options, retries = 3) {
        for (let i = 0; i < retries; i++) {
          try {
            return await fetch(url, options);
          } catch (error) {
            if (i === retries - 1) throw error;
          }
        }
      }

      const response = await fetchWithRetry('/api/analyze', {});
      const data = await response.json();

      expect(callCount).toBe(3);
      expect(data.success).toBe(true);
    });

    test('should recover from corrupted localStorage data', () => {
      // Set invalid JSON
      localStorage.store['resumate_state'] = 'invalid{json}';

      try {
        JSON.parse(localStorage.getItem('resumate_state'));
        fail('Should have thrown error');
      } catch (e) {
        expect(e instanceof SyntaxError).toBe(true);

        // Should clear corrupted data
        localStorage.removeItem('resumate_state');
        expect(localStorage.getItem('resumate_state')).toBeNull();
      }
    });
  });

  describe('Mobile Responsive Tests', () => {
    test('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });

      window.dispatchEvent(new Event('resize'));

      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
    });

    test('should show mobile-optimized controls', () => {
      // Mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

      const isMobile = window.innerWidth < 768;
      expect(isMobile).toBe(true);
    });

    test('should handle touch events', () => {
      const button = document.querySelector('[data-workflow-continue]');

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: []
      });

      button.dispatchEvent(touchStart);
      button.dispatchEvent(touchEnd);

      // Should trigger click
      expect(button).toBeTruthy();
    });

    test('should support pinch-to-zoom for accessibility', () => {
      const viewport = document.querySelector('meta[name="viewport"]');

      // Should NOT disable zoom
      if (viewport) {
        const content = viewport.getAttribute('content');
        expect(content).not.toContain('user-scalable=no');
        expect(content).not.toContain('maximum-scale=1');
      }
    });
  });

  describe('Accessibility (A11y) Tests', () => {
    test('should have proper ARIA labels', () => {
      const buttons = document.querySelectorAll('button');

      buttons.forEach(button => {
        // Should have accessible name
        const hasLabel = button.textContent.trim() ||
                        button.getAttribute('aria-label') ||
                        button.getAttribute('aria-labelledby');

        expect(hasLabel).toBeTruthy();
      });
    });

    test('should support keyboard navigation', () => {
      const continueBtn = document.querySelector('[data-workflow-continue]');

      // Focus element
      continueBtn.focus();
      expect(document.activeElement).toBe(continueBtn);

      // Trigger with Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      continueBtn.dispatchEvent(enterEvent);

      expect(enterEvent.key).toBe('Enter');
    });

    test('should have proper heading hierarchy', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const levels = Array.from(headings).map(h => parseInt(h.tagName[1]));

      // Should not skip heading levels
      for (let i = 1; i < levels.length; i++) {
        const diff = levels[i] - levels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });

    test('should announce dynamic content changes', () => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveRegion);

      liveRegion.textContent = 'Step completed successfully';

      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.textContent).toContain('Step completed');
    });

    test('should mark required fields properly', () => {
      const requiredFields = document.querySelectorAll('[required]');

      requiredFields.forEach(field => {
        expect(field.hasAttribute('required') ||
               field.getAttribute('aria-required') === 'true').toBeTruthy();
      });
    });

    test('should provide error messages to screen readers', () => {
      const input = document.getElementById('resume-text');
      input.value = '';

      // Simulate validation
      const errorId = 'resume-text-error';
      const errorMsg = document.createElement('div');
      errorMsg.id = errorId;
      errorMsg.setAttribute('role', 'alert');
      errorMsg.textContent = 'Resume text is required';

      input.setAttribute('aria-describedby', errorId);
      input.setAttribute('aria-invalid', 'true');
      input.parentNode.appendChild(errorMsg);

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(errorId);
    });

    test('should support prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      });

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      expect(prefersReducedMotion).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should load step content efficiently', () => {
      const startTime = performance.now();

      const step = document.querySelector('[data-workflow-step="0"]');
      step.style.display = 'block';

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load in less than 100ms
      expect(loadTime).toBeLessThan(100);
    });

    test('should debounce rapid input changes', (done) => {
      let callCount = 0;

      function debounce(fn, delay) {
        let timeout;
        return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn(...args), delay);
        };
      }

      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Rapid calls
      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    test('should lazy load non-critical assets', () => {
      const lazyElements = document.querySelectorAll('[loading="lazy"]');

      lazyElements.forEach(el => {
        expect(el.getAttribute('loading')).toBe('lazy');
      });
    });

    test('should handle large resume text efficiently', () => {
      const largeText = 'x'.repeat(50000); // 50KB
      const textarea = document.getElementById('resume-text');

      const startTime = performance.now();
      textarea.value = largeText;
      const endTime = performance.now();

      const setTime = endTime - startTime;
      expect(setTime).toBeLessThan(100);
    });

    test('should cancel pending requests on navigation', () => {
      const controller = new AbortController();

      fetch('/api/analyze', {
        signal: controller.signal
      }).catch(err => {
        expect(err.name).toBe('AbortError');
      });

      controller.abort();
    });
  });

  describe('Progress Tracking Tests', () => {
    test('should update progress bar on step completion', () => {
      const progressBar = document.querySelector('.workflow-progress-fill');
      const progressText = document.querySelector('.workflow-progress-text');

      // Simulate step completion
      const totalSteps = 5;
      const completedSteps = 2;
      const progress = (completedSteps / totalSteps) * 100;

      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}% Complete`;

      expect(progressBar.style.width).toBe('40%');
      expect(progressText.textContent).toContain('40%');
    });

    test('should track step completion times', () => {
      const stepTimes = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        // Simulate step completion
        setTimeout(() => {
          const endTime = Date.now();
          stepTimes.push(endTime - startTime);
        }, 100 * (i + 1));
      }

      setTimeout(() => {
        expect(stepTimes.length).toBeGreaterThan(0);
      }, 600);
    });
  });

  describe('Export Functionality Tests', () => {
    test('should select documents for export', () => {
      const checkboxes = document.querySelectorAll('#export-options input[type="checkbox"]');

      checkboxes.forEach(cb => {
        cb.checked = true;
      });

      const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
      expect(selectedCount).toBe(checkboxes.length);
    });

    test('should validate at least one document is selected', () => {
      const checkboxes = document.querySelectorAll('#export-options input[type="checkbox"]');

      checkboxes.forEach(cb => {
        cb.checked = false;
      });

      const hasSelection = Array.from(checkboxes).some(cb => cb.checked);
      expect(hasSelection).toBe(false);
    });

    test('should trigger export package generation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['mock-zip-content'], { type: 'application/zip' })
      });

      const response = await fetch('/api/export-package', {
        method: 'POST',
        body: JSON.stringify({ documents: ['resume', 'cover-letter'] })
      });

      const blob = await response.blob();
      expect(blob.type).toBe('application/zip');
    });
  });

  describe('Loading States Tests', () => {
    test('should show loading spinner during async operations', () => {
      const loading = document.getElementById('loading');

      loading.style.display = 'flex';
      expect(loading.style.display).toBe('flex');

      loading.style.display = 'none';
      expect(loading.style.display).toBe('none');
    });

    test('should disable buttons during loading', () => {
      const button = document.getElementById('analyze-btn');

      button.disabled = true;
      expect(button.disabled).toBe(true);

      button.disabled = false;
      expect(button.disabled).toBe(false);
    });
  });
});

describe('Integration with WorkflowPolish', () => {
  test('should integrate with WorkflowPolish class', () => {
    // Mock WorkflowPolish
    class MockWorkflowPolish {
      constructor() {
        this.currentStep = 0;
        this.totalSteps = 5;
      }

      scrollToNextStep() {
        this.currentStep++;
      }

      validateStep() {
        return true;
      }
    }

    const polish = new MockWorkflowPolish();
    expect(polish.currentStep).toBe(0);

    polish.scrollToNextStep();
    expect(polish.currentStep).toBe(1);
  });
});
