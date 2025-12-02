// ResuMate Application Logic

// State management
const state = {
    resumeText: '',
    jobText: '',
    apiKey: localStorage.getItem('claude_api_key') || '',
    analyzing: false,
    serverHasApiKey: false
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load API key from localStorage
    if (state.apiKey) {
        document.getElementById('api-key').value = state.apiKey;
    }

    // Check if server has API key configured
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        state.serverHasApiKey = config.hasServerApiKey;

        // Update API key section hint if server has key
        if (state.serverHasApiKey) {
            const helpText = document.querySelector('.help-text');
            if (helpText) {
                helpText.innerHTML = `
                    <span style="color: var(--success-color);">✓ Server API key configured</span> -
                    You can use the app without entering your own key, or
                    <a href="https://console.anthropic.com/" target="_blank">get your own from Anthropic Console</a>.
                `;
            }
        }
    } catch (e) {
        state.serverHasApiKey = false;
    }

    updateAnalyzeButton();
});

// Handle resume file upload
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const textarea = document.getElementById('resume-text');

    try {
        // Show loading indicator
        textarea.value = 'Parsing resume...';
        textarea.disabled = true;

        // Check file type - PDFs and DOCXs need server-side parsing
        const fileName = file.name.toLowerCase();
        let text;

        if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            // Use server-side parsing for PDFs and Word docs
            text = await parseFileOnServer(file);
        } else {
            // Read plain text files directly
            text = await readFileAsText(file);
        }

        state.resumeText = text;
        textarea.value = text;
        textarea.disabled = false;
        updateAnalyzeButton();
    } catch (error) {
        textarea.value = '';
        textarea.disabled = false;
        alert('Error reading file: ' + error.message);
    }
}

// Handle job description file upload
async function handleJobUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const textarea = document.getElementById('job-text');

    try {
        // Show loading indicator
        textarea.value = 'Parsing job description...';
        textarea.disabled = true;

        // Check file type - PDFs and DOCXs need server-side parsing
        const fileName = file.name.toLowerCase();
        let text;

        if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            // Use server-side parsing for PDFs and Word docs
            text = await parseFileOnServer(file);
        } else {
            // Read plain text files directly
            text = await readFileAsText(file);
        }

        state.jobText = text;
        textarea.value = text;
        textarea.disabled = false;
        updateAnalyzeButton();
    } catch (error) {
        textarea.value = '';
        textarea.disabled = false;
        alert('Error reading file: ' + error.message);
    }
}

// Handle resume text input
function handleResumeInput() {
    state.resumeText = document.getElementById('resume-text').value;
    updateAnalyzeButton();
}

// Handle job description text input
function handleJobInput() {
    state.jobText = document.getElementById('job-text').value;
    updateAnalyzeButton();
}

// Handle API key input
function handleApiKeyInput() {
    state.apiKey = document.getElementById('api-key').value;
    localStorage.setItem('claude_api_key', state.apiKey);
    updateAnalyzeButton();
}

// Update analyze button state
function updateAnalyzeButton() {
    const button = document.getElementById('analyze-btn');
    const hasApiKey = state.apiKey.trim() || state.serverHasApiKey;
    const canAnalyze = state.resumeText.trim() &&
                       state.jobText.trim() &&
                       hasApiKey &&
                       !state.analyzing;
    button.disabled = !canAnalyze;
}

// Read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Parse PDF/DOCX file on server
async function parseFileOnServer(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse file');
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Failed to parse file');
    }

    // Return the extracted text
    return result.text || '';
}

// Analyze resume with Claude AI
async function analyzeResume() {
    if (state.analyzing) return;

    state.analyzing = true;
    updateAnalyzeButton();

    // Show results section and loading state
    const resultsSection = document.getElementById('results-section');
    const loading = document.getElementById('loading');
    const resultsContent = document.getElementById('results-content');

    resultsSection.style.display = 'block';
    loading.style.display = 'block';
    resultsContent.innerHTML = '';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const analysis = await callClaudeAPI();
        displayResults(analysis);
    } catch (error) {
        displayError(error.message);
    } finally {
        loading.style.display = 'none';
        state.analyzing = false;
        updateAnalyzeButton();
    }
}

// Call Claude API via backend proxy
async function callClaudeAPI() {
    // Use backend proxy to avoid CORS issues
    // Server will use its own API key if none provided
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            resumeText: state.resumeText,
            jobText: state.jobText,
            apiKey: state.apiKey || null  // Server uses fallback if null
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data.analysis;
}

// Display results
function displayResults(analysisText) {
    const resultsContent = document.getElementById('results-content');

    // Parse the analysis text into sections
    const sections = parseAnalysis(analysisText);

    let html = '';

    sections.forEach(section => {
        html += `
            <div class="analysis-section">
                <h3>${section.icon} ${section.title}</h3>
                <div class="analysis-content">
                    ${section.content}
                </div>
            </div>
        `;
    });

    // Add Next Steps section
    html += `
        <div class="next-steps-section" style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%); border-radius: 12px; color: white;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">🚀 What's Next?</h3>
            <p style="margin: 0 0 1.5rem 0; opacity: 0.9;">Based on your analysis, here are recommended next steps:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <a href="/test-job-tailor.html" class="next-step-btn" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(255,255,255,0.15); border-radius: 8px; color: white; text-decoration: none; transition: all 0.2s;">
                    <span style="font-size: 1.5rem;">🎯</span>
                    <div>
                        <div style="font-weight: 600;">Tailor Resume</div>
                        <div style="font-size: 0.85rem; opacity: 0.8;">Optimize for this job</div>
                    </div>
                </a>
                <a href="/test-ats-scanner.html" class="next-step-btn" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(255,255,255,0.15); border-radius: 8px; color: white; text-decoration: none; transition: all 0.2s;">
                    <span style="font-size: 1.5rem;">🔍</span>
                    <div>
                        <div style="font-weight: 600;">ATS Check</div>
                        <div style="font-size: 0.85rem; opacity: 0.8;">Scan for compatibility</div>
                    </div>
                </a>
                <a href="/test-coverletter.html" class="next-step-btn" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(255,255,255,0.15); border-radius: 8px; color: white; text-decoration: none; transition: all 0.2s;">
                    <span style="font-size: 1.5rem;">📧</span>
                    <div>
                        <div style="font-weight: 600;">Cover Letter</div>
                        <div style="font-size: 0.85rem; opacity: 0.8;">Generate matching letter</div>
                    </div>
                </a>
                <a href="/test-export.html" class="next-step-btn" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(255,255,255,0.15); border-radius: 8px; color: white; text-decoration: none; transition: all 0.2s;">
                    <span style="font-size: 1.5rem;">💾</span>
                    <div>
                        <div style="font-weight: 600;">Export</div>
                        <div style="font-size: 0.85rem; opacity: 0.8;">Download your resume</div>
                    </div>
                </a>
            </div>
        </div>
    `;

    resultsContent.innerHTML = html;

    // Store analysis data for other pages to use
    localStorage.setItem('lastAnalysis', JSON.stringify({
        resumeText: state.resumeText,
        jobText: state.jobText,
        analysisText: analysisText,
        timestamp: new Date().toISOString()
    }));
}

// Parse analysis text into structured sections
function parseAnalysis(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];

    // Icons for different sections
    const icons = {
        'OVERALL MATCH SCORE': '📊',
        'KEY STRENGTHS': '💪',
        'GAPS AND CONCERNS': '⚠️',
        'RECOMMENDATIONS': '✨',
        'ATS COMPATIBILITY': '🤖',
        'KEYWORD ANALYSIS': '🔑',
        'FORMATTING SUGGESTIONS': '📐',
        'default': '📋'
    };

    lines.forEach(line => {
        const trimmed = line.trim();

        // Check if this is a section header
        const isHeader = /^\d+\.\s+[A-Z\s]+:?/.test(trimmed) ||
                        /^[A-Z\s]+:$/.test(trimmed);

        if (isHeader) {
            // Save previous section
            if (currentSection) {
                sections.push({
                    title: currentSection,
                    icon: icons[currentSection.toUpperCase()] || icons['default'],
                    content: formatContent(currentContent.join('\n'))
                });
            }

            // Start new section
            currentSection = trimmed.replace(/^\d+\.\s+/, '').replace(/:$/, '').trim();
            currentContent = [];
        } else if (trimmed && currentSection) {
            currentContent.push(trimmed);
        }
    });

    // Add last section
    if (currentSection && currentContent.length > 0) {
        sections.push({
            title: currentSection,
            icon: icons[currentSection.toUpperCase()] || icons['default'],
            content: formatContent(currentContent.join('\n'))
        });
    }

    // If no sections were parsed, return the whole text
    if (sections.length === 0) {
        sections.push({
            title: 'Analysis Results',
            icon: '📋',
            content: formatContent(text)
        });
    }

    return sections;
}

// Format content with better structure
function formatContent(content) {
    // Convert markdown-style lists to HTML
    content = content.replace(/^- (.+)$/gm, '<li>$1</li>');
    content = content.replace(/^\* (.+)$/gm, '<li>$1</li>');

    // Wrap lists
    content = content.replace(/(<li>.*<\/li>)/s, '<ul class="recommendation-list">$1</ul>');

    // Add score badges
    content = content.replace(/(\d+)\/100/g, '<span class="score-badge score-medium">$1/100</span>');
    content = content.replace(/Score:\s*(\d+)/gi, 'Score: <span class="score-badge score-medium">$1</span>');

    // Bold important terms
    content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert line breaks to paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    content = paragraphs.map(p => `<p>${p}</p>`).join('');

    return content;
}

// Display error
function displayError(message) {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = `
        <div class="analysis-section">
            <h3>❌ Error</h3>
            <div class="analysis-content" style="border-left-color: var(--danger-color);">
                <p><strong>Analysis failed:</strong> ${message}</p>
                <p>Please check your API key and try again.</p>
            </div>
        </div>
    `;
}

// Import job from URL
async function importJobFromURL() {
    const urlInput = document.getElementById('job-url');
    const importBtn = document.getElementById('import-job-btn');
    const statusEl = document.getElementById('job-url-status');
    const jobTextarea = document.getElementById('job-text');

    const url = urlInput.value.trim();

    if (!url) {
        statusEl.textContent = '⚠️ Please enter a job URL';
        statusEl.style.color = 'var(--warning-color)';
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        statusEl.textContent = '⚠️ Please enter a valid URL';
        statusEl.style.color = 'var(--warning-color)';
        return;
    }

    // Show loading state
    importBtn.disabled = true;
    importBtn.textContent = 'Importing...';
    statusEl.textContent = '🔄 Fetching job posting...';
    statusEl.style.color = 'var(--text-muted)';

    try {
        // Fetch job content from server
        const response = await fetch('/api/fetch-job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch job posting');
        }

        // Populate the job description textarea
        jobTextarea.value = data.content;
        state.jobText = data.content;
        updateAnalyzeButton();

        statusEl.textContent = '✅ Job imported successfully!';
        statusEl.style.color = 'var(--success-color)';

        // Clear URL input
        urlInput.value = '';

    } catch (error) {
        console.error('Job import error:', error);
        statusEl.textContent = `❌ ${error.message}`;
        statusEl.style.color = 'var(--danger-color)';
    } finally {
        importBtn.disabled = false;
        importBtn.textContent = 'Import';
    }
}
