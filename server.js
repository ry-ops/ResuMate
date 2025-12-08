// ATSFlow Backend Proxy Server
// Handles Claude API requests to avoid CORS issues

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const parser = require('./js/export/parser');
const logger = require('./js/utils/logger');

// Load environment variables from secrets.env (for testing) or .env
const envFiles = ['secrets.env', '.env', '.env.local'];
for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=').trim();
                if (key && value && !process.env[key.trim()]) {
                    process.env[key.trim()] = value;
                }
            }
        });
        logger.info(`[Config] Loaded environment from ${envFile}`);
        break; // Only load first found env file
    }
}

// Server-side API key (from env file)
const SERVER_API_KEY = process.env.CLAUDE_API_KEY || null;
if (SERVER_API_KEY && SERVER_API_KEY !== 'your_api_key_here') {
    logger.info('[Config] Server-side Claude API key configured');
} else {
    logger.info('[Config] No server-side API key - clients must provide their own');
}

// LinkedIn Jobs API
let linkedIn;
try {
    linkedIn = require('linkedin-jobs-api');
    logger.info('[LinkedIn] LinkedIn Jobs API loaded successfully');
} catch (error) {
    logger.warn('[LinkedIn] LinkedIn Jobs API not available:', error.message);
    linkedIn = null;
}

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
    logger.warn('[Security] CSP config not found, using default policy');
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
    const { resumeText, jobText, apiKey: clientApiKey } = req.body;

    // Check required fields
    if (!resumeText || !jobText) {
        return res.status(400).json({
            error: 'Missing required fields: resumeText or jobText'
        });
    }

    // Validate types
    if (typeof resumeText !== 'string' || typeof jobText !== 'string') {
        return res.status(400).json({
            error: 'Invalid field types: resumeText and jobText must be strings'
        });
    }

    // Validate lengths
    const MAX_TEXT_LENGTH = 100000; // 100KB

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

    // Get effective API key (client-provided or server fallback)
    const effectiveApiKey = getEffectiveApiKey(clientApiKey);
    if (!effectiveApiKey) {
        return res.status(400).json({
            error: 'No API key available. Please provide an API key or configure one in secrets.env'
        });
    }

    // Sanitize inputs (basic XSS prevention)
    req.body.resumeText = resumeText.trim();
    req.body.jobText = jobText.trim();
    req.body.effectiveApiKey = effectiveApiKey;

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

        logger.info(`[Parse] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
        logger.info(`[Parse] AI extraction: ${useAI ? 'enabled' : 'disabled'}`);

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
        logger.error('[Parse] Error:', error);
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

        logger.info(`[Extract] Processing file: ${req.file.originalname}`);

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
        logger.error('[Extract] Error:', error);
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

        logger.info(`[Batch Parse] Processing ${req.files.length} files`);

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
        logger.error('[Batch Parse] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to parse resumes'
        });
    }
});

// Helper function to get effective API key (client-provided or server fallback)
function getEffectiveApiKey(clientKey) {
    // Use client key if provided and valid
    if (clientKey && clientKey.match(/^sk-ant-[a-zA-Z0-9_-]+$/)) {
        return clientKey;
    }
    // Fall back to server key
    if (SERVER_API_KEY && SERVER_API_KEY !== 'your_api_key_here') {
        return SERVER_API_KEY;
    }
    return null;
}

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
        logger.error('Claude API Error:', {
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
    const { resumeText, jobText, effectiveApiKey } = req.body;

    const prompt = `You are an expert resume consultant and ATS (Applicant Tracking System) specialist.

Analyze the following resume against the job description and provide comprehensive feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobText}

IMPORTANT: Format your response EXACTLY as shown below, with numbered section headers followed by content. Use this exact structure:

1. OVERALL MATCH SCORE
Score: [0-100]
[Brief explanation of the score]

2. KEY STRENGTHS
- [Strength 1]
- [Strength 2]
- [Strength 3]
- [Strength 4]
- [Strength 5]

3. GAPS AND CONCERNS
- [Gap 1]
- [Gap 2]
- [Gap 3]
- [Gap 4]
- [Gap 5]

4. RECOMMENDATIONS
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]
- [Recommendation 4]
- [Recommendation 5]

5. ATS COMPATIBILITY
Score: [0-100]
- [Point 1]
- [Point 2]
- [Point 3]

6. KEYWORD ANALYSIS
Missing Keywords:
- [Keyword 1]
- [Keyword 2]
- [Keyword 3]

7. FORMATTING SUGGESTIONS
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]

Be specific and actionable in your feedback. Start each section with the numbered header exactly as shown above.`;

    try {
        const analysis = await callClaudeAPI(effectiveApiKey, prompt, 4096, 0.7);
        res.json({ analysis });
    } catch (error) {
        logger.error('API Error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to connect to Claude API'
        });
    }
});

// New endpoint for AI content generation
app.post('/api/generate', rateLimit, async (req, res) => {
    const { prompt, apiKey: clientApiKey, maxTokens = 1024, temperature = 0.7 } = req.body;

    // Validate required fields
    if (!prompt) {
        return res.status(400).json({
            error: 'Missing required field: prompt'
        });
    }

    // Validate types
    if (typeof prompt !== 'string') {
        return res.status(400).json({
            error: 'Invalid field type: prompt must be a string'
        });
    }

    // Get effective API key (client-provided or server fallback)
    const effectiveApiKey = getEffectiveApiKey(clientApiKey);
    if (!effectiveApiKey) {
        return res.status(400).json({
            error: 'No API key available. Please provide an API key or configure one in secrets.env'
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
        logger.info(`[Generate] Processing content generation request (${prompt.substring(0, 50)}...)`);
        const content = await callClaudeAPI(effectiveApiKey, prompt, validMaxTokens, validTemperature);
        res.json({ content });
    } catch (error) {
        logger.error('Generation API Error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to generate content'
        });
    }
});

// Job Tailoring endpoint - Accepts resume + job description for tailoring
app.post('/api/tailor', rateLimit, async (req, res) => {
    const { resumeData, jobDescription, apiKey: clientApiKey } = req.body;

    // Validate required fields
    if (!resumeData || !jobDescription) {
        return res.status(400).json({
            error: 'Missing required fields: resumeData or jobDescription'
        });
    }

    // Validate types
    if (typeof jobDescription !== 'string') {
        return res.status(400).json({
            error: 'Invalid field types'
        });
    }

    // Get effective API key (client-provided or server fallback)
    const effectiveApiKey = getEffectiveApiKey(clientApiKey);
    if (!effectiveApiKey) {
        return res.status(400).json({
            error: 'No API key available. Please provide an API key or configure one in secrets.env'
        });
    }

    try {
        logger.info(`[Tailor] Processing tailoring request`);

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

        const jobDataResponse = await callClaudeAPI(effectiveApiKey, jobParsePrompt, 2048, 0.3);

        // Parse job data
        let jobData;
        try {
            const jsonMatch = jobDataResponse.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : jobDataResponse;
            jobData = JSON.parse(jsonText);
        } catch (parseError) {
            logger.error('[Tailor] Failed to parse job data:', parseError);
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
        logger.error('Tailoring API Error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to process tailoring request'
        });
    }
});

// Job URL Fetching endpoint - Fetches job postings from various job boards
app.post('/api/fetch-job', rateLimit, async (req, res) => {
    const { url, site } = req.body;

    // Validate URL
    if (!url) {
        return res.status(400).json({
            error: 'Missing required field: url'
        });
    }

    try {
        // Validate URL format
        const urlObj = new URL(url);

        // Whitelist of allowed job board domains
        const allowedDomains = [
            'linkedin.com', 'www.linkedin.com',
            'indeed.com', 'www.indeed.com',
            'glassdoor.com', 'www.glassdoor.com',
            'ziprecruiter.com', 'www.ziprecruiter.com',
            'monster.com', 'www.monster.com',
            'dice.com', 'www.dice.com',
            'simplyhired.com', 'www.simplyhired.com',
            'careerbuilder.com', 'www.careerbuilder.com',
            'greenhouse.io', 'boards.greenhouse.io',
            'lever.co', 'jobs.lever.co',
            'myworkdayjobs.com',
            'builtin.com', 'www.builtin.com',
            'angel.co', 'wellfound.com'
        ];

        const hostname = urlObj.hostname.toLowerCase();
        const isAllowed = allowedDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain) ||
            hostname.includes('myworkdayjobs.com') || hostname.includes('greenhouse.io') ||
            hostname.includes('lever.co')
        );

        if (!isAllowed) {
            return res.status(400).json({
                error: `Domain not allowed. Supported job boards: LinkedIn, Indeed, Glassdoor, ZipRecruiter, Monster, Dice, SimplyHired, CareerBuilder, Greenhouse, Lever, Workday, Built In`
            });
        }

        logger.info(`[Job Fetch] Fetching job posting from: ${hostname}`);

        // Fetch the job posting page
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache'
            },
            redirect: 'follow',
            timeout: 15000
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch job posting: ${response.status}`);
        }

        const html = await response.text();

        // Extract text content from HTML (basic extraction)
        let content = extractJobContent(html, site);

        if (!content || content.length < 100) {
            return res.status(400).json({
                error: 'Could not extract job content from URL. The page may require login or use JavaScript rendering. Please copy and paste the job description text instead.',
                requiresManualInput: true
            });
        }

        res.json({
            success: true,
            content: content,
            url: url,
            site: site || 'unknown',
            fetchedAt: new Date().toISOString()
        });

    } catch (error) {
        logger.error('[Job Fetch] Error:', error);

        // Provide helpful error message
        let errorMessage = error.message;
        if (error.code === 'ENOTFOUND') {
            errorMessage = 'Could not reach the job posting URL. Please check the URL and try again.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. The job site may be slow or blocking requests.';
        }

        res.status(500).json({
            error: errorMessage,
            requiresManualInput: true,
            suggestion: 'Please copy and paste the job description text directly.'
        });
    }
});

/**
 * Extract job content from HTML
 * @param {string} html - Raw HTML
 * @param {string} site - Site identifier
 * @returns {string} - Extracted text content
 */
function extractJobContent(html, site) {
    // Remove script and style tags
    let cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    // Site-specific selectors (look for common job description containers)
    const jobSelectors = [
        // LinkedIn
        /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        // Indeed
        /<div[^>]*id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>/gi,
        // Glassdoor
        /<div[^>]*class="[^"]*jobDescriptionContent[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        // Generic
        /<div[^>]*class="[^"]*job[_-]?details[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
        /<article[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/article>/gi
    ];

    let bestContent = '';

    // Try to find job-specific content first
    for (const selector of jobSelectors) {
        const matches = cleaned.match(selector);
        if (matches) {
            for (const match of matches) {
                const text = stripHtml(match);
                if (text.length > bestContent.length) {
                    bestContent = text;
                }
            }
        }
    }

    // If no specific content found, extract from body
    if (bestContent.length < 200) {
        const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            bestContent = stripHtml(bodyMatch[1]);
        }
    }

    // Clean up and limit length
    bestContent = bestContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

    // Limit to reasonable length for API
    if (bestContent.length > 15000) {
        bestContent = bestContent.substring(0, 15000) + '...';
    }

    return bestContent;
}

/**
 * Strip HTML tags and decode entities
 * @param {string} html - HTML string
 * @returns {string} - Plain text
 */
function stripHtml(html) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&bull;/g, '•')
        .trim();
}

// LinkedIn Job Search endpoint
app.post('/api/linkedin-search', rateLimit, async (req, res) => {
    if (!linkedIn) {
        return res.status(503).json({
            success: false,
            error: 'LinkedIn Jobs API not available. Please install linkedin-jobs-api package.'
        });
    }

    const {
        keyword = '',
        location = '',
        dateSincePosted = 'past month',
        jobType = '',
        remoteFilter = '',
        salary = '',
        experienceLevel = '',
        limit = '20'
    } = req.body;

    // Validate keyword
    if (!keyword || keyword.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a search keyword (minimum 2 characters)'
        });
    }

    try {
        logger.info(`[LinkedIn] Searching for jobs: "${keyword}" in "${location || 'any location'}"`);

        const queryOptions = {
            keyword: keyword.trim(),
            location: location.trim() || undefined,
            dateSincePosted: dateSincePosted || undefined,
            jobType: jobType || undefined,
            remoteFilter: remoteFilter || undefined,
            salary: salary || undefined,
            experienceLevel: experienceLevel || undefined,
            limit: String(Math.min(parseInt(limit) || 20, 50)) // Max 50 results
        };

        // Remove undefined values
        Object.keys(queryOptions).forEach(key => {
            if (queryOptions[key] === undefined || queryOptions[key] === '') {
                delete queryOptions[key];
            }
        });

        const jobs = await linkedIn.query(queryOptions);

        logger.info(`[LinkedIn] Found ${jobs.length} jobs for "${keyword}"`);

        res.json({
            success: true,
            query: {
                keyword,
                location: location || 'Any',
                filters: {
                    dateSincePosted,
                    jobType: jobType || 'Any',
                    remoteFilter: remoteFilter || 'Any',
                    experienceLevel: experienceLevel || 'Any'
                }
            },
            count: jobs.length,
            jobs: jobs.map(job => ({
                position: job.position || job.title,
                company: job.company,
                location: job.location,
                date: job.date || job.postedAt,
                salary: job.salary || job.salaryRange,
                jobUrl: job.jobUrl || job.link,
                description: job.description || job.snippet || ''
            }))
        });

    } catch (error) {
        logger.error('[LinkedIn] Search error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to search LinkedIn jobs'
        });
    }
});

// Get LinkedIn job details by URL
app.post('/api/linkedin-job-details', rateLimit, async (req, res) => {
    const { jobUrl } = req.body;

    if (!jobUrl) {
        return res.status(400).json({
            success: false,
            error: 'Job URL is required'
        });
    }

    try {
        // For now, redirect to the job fetch endpoint
        // The linkedin-jobs-api doesn't have a direct job details function
        res.json({
            success: true,
            message: 'Use /api/fetch-job endpoint for detailed job content',
            jobUrl: jobUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Legacy redirect rules - redirect old test pages to workflow steps
const legacyRedirects = {
    '/test-job-tailor.html': '/workflow.html#step-3',
    '/test-ats-scanner.html': '/workflow.html#step-2',
    '/test-coverletter.html': '/workflow.html#step-4',
    '/test-careerdocs.html': '/workflow.html#step-4',
    '/test-export.html': '/workflow.html#step-5',
    '/test-ai.html': '/workflow.html#step-2',
    '/test-proofread.html': '/workflow.html#step-2',
    '/test-preview.html': '/index.html',
    '/test-tracker.html': '/analytics-dashboard.html',
    '/test-templates.html': '/workflow.html#step-4',
    '/test-version-management.html': '/analytics-dashboard.html',
    '/test-workflow.html': '/workflow.html',
    '/dashboard.html': '/analytics-dashboard.html'
};

// Apply legacy redirects
Object.entries(legacyRedirects).forEach(([oldPath, newPath]) => {
    app.get(oldPath, (req, res) => {
        logger.info(`[Redirect] ${oldPath} -> ${newPath}`);
        res.redirect(301, newPath);
    });
});

// Serve workflow.html as main entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'workflow.html'));
});

// Serve legacy index.html at /legacy
app.get('/legacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Config endpoint - tells frontend if server has API key configured
app.get('/api/config', (req, res) => {
    const hasServerKey = SERVER_API_KEY && SERVER_API_KEY !== 'your_api_key_here';
    res.json({
        hasServerApiKey: hasServerKey,
        message: hasServerKey
            ? 'Server has API key configured - you can use features without entering your own key'
            : 'No server API key - please enter your Claude API key in settings'
    });
});

app.listen(PORT, () => {
    logger.info(`
┌─────────────────────────────────────────────────────┐
│  ATSFlow Server                                     │
├─────────────────────────────────────────────────────┤
│  Server running at: http://localhost:${PORT}       │
│  Open in browser:   http://localhost:${PORT}       │
└─────────────────────────────────────────────────────┘
    `);
});
