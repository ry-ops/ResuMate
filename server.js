// ResuMate Backend Proxy Server
// Handles Claude API requests to avoid CORS issues

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const parser = require('./js/export/parser');

const app = express();
const PORT = process.env.PORT || 3101;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
        }
    }
});

// Load CSP configuration
let cspConfig;
try {
    cspConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'security', 'csp-config.json'), 'utf8'));
} catch (error) {
    console.warn('[Security] CSP config not found, using default policy');
    cspConfig = null;
}

// Security middleware - CSP headers
app.use((req, res, next) => {
    if (cspConfig && cspConfig.policy) {
        const policy = Object.entries(cspConfig.policy)
            .map(([key, values]) => {
                if (Array.isArray(values) && values.length > 0) {
                    return `${key} ${values.join(' ')}`;
                } else if (Array.isArray(values) && values.length === 0) {
                    return key;
                }
                return null;
            })
            .filter(Boolean)
            .join('; ');

        const headerName = cspConfig.reportOnly ?
            'Content-Security-Policy-Report-Only' :
            'Content-Security-Policy';

        res.setHeader(headerName, policy);
    }

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Rate limiting store (in-memory for simplicity, use Redis for production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// Rate limiting middleware for API endpoints
function rateLimit(req, res, next) {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore.has(clientId)) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }

    const clientData = rateLimitStore.get(clientId);

    if (now > clientData.resetTime) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }

    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
    }

    clientData.count++;
    next();
}

// Input validation middleware
function validateAnalyzeInput(req, res, next) {
    const { resumeText, jobText, apiKey } = req.body;

    // Check required fields
    if (!resumeText || !jobText || !apiKey) {
        return res.status(400).json({
            error: 'Missing required fields: resumeText, jobText, or apiKey'
        });
    }

    // Validate types
    if (typeof resumeText !== 'string' || typeof jobText !== 'string' || typeof apiKey !== 'string') {
        return res.status(400).json({
            error: 'Invalid field types: all fields must be strings'
        });
    }

    // Validate lengths
    const MAX_TEXT_LENGTH = 100000; // 100KB
    const MAX_API_KEY_LENGTH = 200;

    if (resumeText.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({
            error: `Resume text exceeds maximum length (${MAX_TEXT_LENGTH} characters)`
        });
    }

    if (jobText.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({
            error: `Job description exceeds maximum length (${MAX_TEXT_LENGTH} characters)`
        });
    }

    if (apiKey.length > MAX_API_KEY_LENGTH) {
        return res.status(400).json({
            error: 'API key exceeds maximum length'
        });
    }

    // Validate API key format (basic check)
    if (!apiKey.match(/^sk-ant-[a-zA-Z0-9_-]+$/)) {
        return res.status(400).json({
            error: 'Invalid API key format'
        });
    }

    // Sanitize inputs (basic XSS prevention)
    req.body.resumeText = resumeText.trim();
    req.body.jobText = jobText.trim();
    req.body.apiKey = apiKey.trim();

    next();
}

// Resume file parsing endpoint
app.post('/api/parse', rateLimit, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const apiKey = req.body.apiKey || null;
        const useAI = req.body.useAI === 'true' || req.body.useAI === true;

        console.log(`[Parse] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
        console.log(`[Parse] AI extraction: ${useAI ? 'enabled' : 'disabled'}`);

        // Parse the resume
        const result = await parser.parseResume(
            req.file.buffer,
            req.file.originalname,
            apiKey,
            {
                useAI: useAI && apiKey,
                extractSections: true,
                structureData: true
            }
        );

        // Validate the parsed data
        if (result.success) {
            const validation = parser.validateResumeData(result);
            result.validation = validation;
        }

        res.json(result);

    } catch (error) {
        console.error('[Parse] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to parse resume'
        });
    }
});

// Resume extraction endpoint (AI-powered)
app.post('/api/extract', rateLimit, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const apiKey = req.body.apiKey;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                error: 'API key is required for AI extraction'
            });
        }

        console.log(`[Extract] Processing file: ${req.file.originalname}`);

        // Parse with AI extraction enabled
        const result = await parser.parseResume(
            req.file.buffer,
            req.file.originalname,
            apiKey,
            {
                useAI: true,
                extractSections: true,
                structureData: true
            }
        );

        res.json(result);

    } catch (error) {
        console.error('[Extract] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to extract resume data'
        });
    }
});

// Batch file parsing endpoint
app.post('/api/parse-batch', rateLimit, upload.array('resumes', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const apiKey = req.body.apiKey || null;
        const useAI = req.body.useAI === 'true' || req.body.useAI === true;

        console.log(`[Batch Parse] Processing ${req.files.length} files`);

        const files = req.files.map(file => ({
            buffer: file.buffer,
            filename: file.originalname
        }));

        const results = await parser.parseMultipleResumes(files, apiKey, {
            useAI: useAI && apiKey,
            extractSections: true,
            structureData: true
        });

        res.json({
            success: true,
            count: results.length,
            results: results
        });

    } catch (error) {
        console.error('[Batch Parse] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to parse resumes'
        });
    }
});

// Helper function to call Claude API
async function callClaudeAPI(apiKey, prompt, maxTokens = 4096, temperature = 0.7) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            temperature: temperature,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Claude API Error:', {
            status: response.status,
            error: error
        });
        throw {
            status: response.status,
            message: error.error?.message || JSON.stringify(error)
        };
    }

    const data = await response.json();
    return data.content[0].text;
}

// Proxy endpoint for Claude API - Resume Analysis
app.post('/api/analyze', rateLimit, validateAnalyzeInput, async (req, res) => {
    const { resumeText, jobText, apiKey } = req.body;

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
        const analysis = await callClaudeAPI(apiKey, prompt, 4096, 0.7);
        res.json({ analysis });
    } catch (error) {
        console.error('API Error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to connect to Claude API'
        });
    }
});

// New endpoint for AI content generation
app.post('/api/generate', rateLimit, async (req, res) => {
    const { prompt, apiKey, maxTokens = 1024, temperature = 0.7 } = req.body;

    // Validate required fields
    if (!prompt || !apiKey) {
        return res.status(400).json({
            error: 'Missing required fields: prompt or apiKey'
        });
    }

    // Validate types
    if (typeof prompt !== 'string' || typeof apiKey !== 'string') {
        return res.status(400).json({
            error: 'Invalid field types: prompt and apiKey must be strings'
        });
    }

    // Validate API key format
    if (!apiKey.match(/^sk-ant-[a-zA-Z0-9_-]+$/)) {
        return res.status(400).json({
            error: 'Invalid API key format'
        });
    }

    // Validate and sanitize parameters
    const validMaxTokens = Math.min(Math.max(parseInt(maxTokens) || 1024, 256), 4096);
    const validTemperature = Math.min(Math.max(parseFloat(temperature) || 0.7, 0), 1);

    // Validate prompt length
    const MAX_PROMPT_LENGTH = 50000;
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({
            error: `Prompt exceeds maximum length (${MAX_PROMPT_LENGTH} characters)`
        });
    }

    try {
        console.log(`[Generate] Processing content generation request (${prompt.substring(0, 50)}...)`);
        const content = await callClaudeAPI(apiKey, prompt, validMaxTokens, validTemperature);
        res.json({ content });
    } catch (error) {
        console.error('Generation API Error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to generate content'
        });
    }
});

// Job Tailoring endpoint - Accepts resume + job description for tailoring
app.post('/api/tailor', rateLimit, async (req, res) => {
    const { resumeData, jobDescription, apiKey } = req.body;

    // Validate required fields
    if (!resumeData || !jobDescription || !apiKey) {
        return res.status(400).json({
            error: 'Missing required fields: resumeData, jobDescription, or apiKey'
        });
    }

    // Validate types
    if (typeof jobDescription !== 'string' || typeof apiKey !== 'string') {
        return res.status(400).json({
            error: 'Invalid field types'
        });
    }

    // Validate API key format
    if (!apiKey.match(/^sk-ant-[a-zA-Z0-9_-]+$/)) {
        return res.status(400).json({
            error: 'Invalid API key format'
        });
    }

    try {
        console.log(`[Tailor] Processing tailoring request`);

        // Step 1: Parse job description
        const jobParsePrompt = `Analyze this job description and extract key information. Return ONLY valid JSON without any markdown formatting or code blocks.

Job Description:
${jobDescription}

Extract the following information and return as JSON:
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "requiredExperience": "X years or entry/mid/senior level",
  "softSkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "tools": ["tool1", "tool2"],
  "certifications": ["cert1", "cert2"],
  "education": "required education level",
  "keywords": ["keyword1", "keyword2"],
  "companyculture": ["value1", "value2"],
  "salaryRange": "if mentioned",
  "location": "if mentioned",
  "workType": "remote/hybrid/onsite"
}

Important: Return ONLY the JSON object, no other text or formatting.`;

        const jobDataResponse = await callClaudeAPI(apiKey, jobParsePrompt, 2048, 0.3);

        // Parse job data
        let jobData;
        try {
            const jsonMatch = jobDataResponse.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : jobDataResponse;
            jobData = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('[Tailor] Failed to parse job data:', parseError);
            jobData = {
                jobTitle: 'Unknown',
                requiredSkills: [],
                preferredSkills: [],
                keywords: []
            };
        }

        // Return combined data
        res.json({
            success: true,
            jobData: jobData,
            message: 'Job description parsed successfully'
        });

    } catch (error) {
        console.error('Tailoring API Error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to process tailoring request'
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
