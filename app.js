// ResuMate Application Logic

// State management
const state = {
    resumeText: '',
    jobText: '',
    apiKey: localStorage.getItem('claude_api_key') || '',
    analyzing: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load API key from localStorage
    if (state.apiKey) {
        document.getElementById('api-key').value = state.apiKey;
    }
    updateAnalyzeButton();
});

// Handle resume file upload
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await readFileAsText(file);
        state.resumeText = text;
        document.getElementById('resume-text').value = text;
        updateAnalyzeButton();
    } catch (error) {
        alert('Error reading file: ' + error.message);
    }
}

// Handle job description file upload
async function handleJobUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await readFileAsText(file);
        state.jobText = text;
        document.getElementById('job-text').value = text;
        updateAnalyzeButton();
    } catch (error) {
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
    const canAnalyze = state.resumeText.trim() &&
                       state.jobText.trim() &&
                       state.apiKey.trim() &&
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

// Call Claude API
async function callClaudeAPI() {
    const prompt = `You are an expert resume consultant and ATS (Applicant Tracking System) specialist.

Analyze the following resume against the job description and provide comprehensive feedback.

RESUME:
${state.resumeText}

JOB DESCRIPTION:
${state.jobText}

Please provide your analysis in the following structure:

1. OVERALL MATCH SCORE (0-100): Provide a numerical score
2. KEY STRENGTHS: List 3-5 strengths of this resume for this specific job
3. GAPS AND CONCERNS: List 3-5 areas where the resume doesn't match the job requirements
4. RECOMMENDATIONS: Provide 5-7 specific, actionable recommendations to improve the resume
5. ATS COMPATIBILITY: Analyze ATS-friendliness and provide a score (0-100) with explanations
6. KEYWORD ANALYSIS: List important keywords from the job description that are missing or underutilized in the resume
7. FORMATTING SUGGESTIONS: Provide specific formatting improvements for better ATS parsing

Format your response clearly with headers and bullet points.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': state.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
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

    resultsContent.innerHTML = html;
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
