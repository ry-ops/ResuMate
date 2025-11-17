// ResuMate Backend Proxy Server
// Handles Claude API requests to avoid CORS issues

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Proxy endpoint for Claude API
app.post('/api/analyze', async (req, res) => {
    const { resumeText, jobText, apiKey } = req.body;

    if (!resumeText || !jobText || !apiKey) {
        return res.status(400).json({
            error: 'Missing required fields: resumeText, jobText, or apiKey'
        });
    }

    const prompt = `You are an expert resume consultant and ATS (Applicant Tracking System) specialist.

Analyze the following resume against the job description and provide comprehensive feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobText}

Please provide your analysis in the following structure:

1. OVERALL MATCH SCORE (0-100): Provide a numerical score
2. KEY STRENGTHS: List 3-5 strengths of this resume for this specific job
3. GAPS AND CONCERNS: List 3-5 areas where the resume doesn't match the job requirements
4. RECOMMENDATIONS: Provide 5-7 specific, actionable recommendations to improve the resume
5. ATS COMPATIBILITY: Analyze ATS-friendliness and provide a score (0-100) with explanations
6. KEYWORD ANALYSIS: List important keywords from the job description that are missing or underutilized in the resume
7. FORMATTING SUGGESTIONS: Provide specific formatting improvements for better ATS parsing

Format your response clearly with headers and bullet points.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({
                error: error.error?.message || 'API request failed'
            });
        }

        const data = await response.json();
        res.json({ analysis: data.content[0].text });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to connect to Claude API: ' + error.message
        });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`
┌─────────────────────────────────────────────────────┐
│  ResuMate Server                                    │
├─────────────────────────────────────────────────────┤
│  Server running at: http://localhost:${PORT}       │
│  Open in browser:   http://localhost:${PORT}       │
└─────────────────────────────────────────────────────┘
    `);
});
