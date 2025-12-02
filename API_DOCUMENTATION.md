# ResuMate API Documentation

Complete API reference for the ResuMate backend server.

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
6. [Error Handling](#error-handling)
7. [Data Models](#data-models)
8. [Examples](#examples)

---

## Overview

The ResuMate API provides endpoints for:
- Resume parsing and analysis
- Job description extraction
- AI-powered content generation
- LinkedIn job search integration
- File upload and processing

**Technology Stack:**
- Node.js with Express
- Claude AI (Anthropic)
- Multer (file uploads)
- CORS enabled

---

## Base URL

**Development:**
```
http://localhost:3101
```

**Production:**
```
https://your-domain.com
```

---

## Authentication

### API Key Configuration

ResuMate supports two authentication methods:

**1. Client-Side API Key** (User Provided)
```javascript
{
  "apiKey": "sk-ant-api03-..."
}
```

**2. Server-Side API Key** (Configured in `.env`)
```bash
CLAUDE_API_KEY=sk-ant-api03-...
```

### API Key Priority
1. Client-provided key (if valid)
2. Server-side key (if configured)
3. Error if neither available

### Validation
- API keys must match pattern: `^sk-ant-[a-zA-Z0-9_-]+$`
- Keys are validated server-side before API calls

---

## Rate Limiting

**Rate Limit Configuration:**
- **Window**: 60 seconds (1 minute)
- **Max Requests**: 10 per window per client
- **Identification**: By IP address

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1638360000
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```
**HTTP Status**: `429 Too Many Requests`

---

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200`: Server is healthy

---

### 2. Server Configuration

Get server API key configuration status.

**Endpoint:** `GET /api/config`

**Response:**
```json
{
  "hasServerApiKey": true,
  "message": "Server has API key configured - you can use features without entering your own key"
}
```

**Status Codes:**
- `200`: Success

**Usage:**
Check if server has an API key configured to determine if users need to provide their own.

---

### 3. Resume Analysis

Analyze resume against job description.

**Endpoint:** `POST /api/analyze`

**Request Body:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer...",
  "jobText": "We are seeking a talented Senior Developer...",
  "apiKey": "sk-ant-api03-..." // Optional if server key configured
}
```

**Validation:**
- `resumeText`: Required, string, max 100,000 characters
- `jobText`: Required, string, max 100,000 characters
- `apiKey`: Optional string (required if no server key)

**Response:**
```json
{
  "analysis": "1. OVERALL MATCH SCORE\nScore: 85\n\n2. KEY STRENGTHS\n- JavaScript expertise\n..."
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid input (missing fields, invalid types, exceeds length)
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `500`: Server or Claude API error

**Example:**
```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeText: resumeContent,
    jobText: jobDescription,
    apiKey: userApiKey
  })
});

const data = await response.json();
console.log(data.analysis);
```

---

### 4. AI Content Generation

Generate AI content with custom prompts.

**Endpoint:** `POST /api/generate`

**Request Body:**
```json
{
  "prompt": "Write a professional bio for...",
  "apiKey": "sk-ant-api03-...",
  "maxTokens": 1024,
  "temperature": 0.7
}
```

**Parameters:**
- `prompt`: Required, string, max 50,000 characters
- `apiKey`: Optional string (required if no server key)
- `maxTokens`: Optional, integer, 256-4096, default 1024
- `temperature`: Optional, float, 0-1, default 0.7

**Response:**
```json
{
  "content": "John Doe is an experienced software engineer..."
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid input
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `500`: Server or Claude API error

**Temperature Guide:**
- `0.0-0.3`: Precise, deterministic (good for technical content)
- `0.4-0.7`: Balanced creativity (good for general content)
- `0.8-1.0`: Creative, varied (good for brainstorming)

**Example:**
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: `Write a professional cover letter for the following:
    Resume: ${resumeText}
    Job: ${jobDescription}`,
    apiKey: userApiKey,
    maxTokens: 2048,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.content);
```

---

### 5. Job Tailoring

Parse job description and extract requirements.

**Endpoint:** `POST /api/tailor`

**Request Body:**
```json
{
  "resumeData": "John Doe\nSoftware Engineer...",
  "jobDescription": "We are seeking...",
  "apiKey": "sk-ant-api03-..."
}
```

**Parameters:**
- `resumeData`: Required, string or object
- `jobDescription`: Required, string
- `apiKey`: Optional string (required if no server key)

**Response:**
```json
{
  "success": true,
  "jobData": {
    "jobTitle": "Senior Full Stack Developer",
    "company": "TechCorp Inc.",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "preferredSkills": ["TypeScript", "Docker"],
    "requiredExperience": "5+ years",
    "softSkills": ["Communication", "Leadership"],
    "responsibilities": ["Design scalable systems", "Mentor junior developers"],
    "tools": ["Git", "AWS", "Jenkins"],
    "certifications": ["AWS Certified Developer"],
    "education": "Bachelor's in Computer Science",
    "keywords": ["full-stack", "agile", "microservices"],
    "companyculture": ["Innovation", "Work-life balance"],
    "salaryRange": "$120k-$160k",
    "location": "Remote",
    "workType": "remote"
  },
  "message": "Job description parsed successfully"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid input
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `500`: Server or Claude API error

**Example:**
```javascript
const response = await fetch('/api/tailor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeData: resumeText,
    jobDescription: jobText,
    apiKey: userApiKey
  })
});

const data = await response.json();
const requirements = data.jobData.requiredSkills;
```

---

### 6. Resume File Parsing

Parse resume files (PDF, DOCX, DOC, TXT).

**Endpoint:** `POST /api/parse`

**Request:** `multipart/form-data`

**Form Fields:**
- `resume`: File (required)
- `apiKey`: String (optional)
- `useAI`: Boolean (optional, default false)

**File Constraints:**
- Max size: 10 MB
- Allowed types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`, `text/plain`

**Response:**
```json
{
  "success": true,
  "text": "John Doe\nSoftware Engineer\n...",
  "sections": {
    "header": "John Doe\nSoftware Engineer",
    "experience": "Senior Developer at TechCorp...",
    "education": "BS Computer Science...",
    "skills": "JavaScript, React, Node.js"
  },
  "metadata": {
    "filename": "resume.pdf",
    "fileSize": 245678,
    "extractedAt": "2024-12-02T10:30:00Z",
    "method": "ai"
  },
  "validation": {
    "hasContact": true,
    "hasExperience": true,
    "hasEducation": true,
    "hasSkills": true,
    "warnings": []
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid file (missing, wrong type, too large)
- `429`: Rate limit exceeded
- `500`: Parsing error

**Example:**
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);
formData.append('apiKey', userApiKey);
formData.append('useAI', 'true');

const response = await fetch('/api/parse', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.text);
```

**AI vs Non-AI Parsing:**

**Non-AI (Fast, Free):**
- Simple text extraction
- No structure understanding
- Good for clean, simple resumes

**AI-Powered (Slower, Uses API Credits):**
- Intelligent section detection
- Understands context
- Better for complex layouts

---

### 7. AI Resume Extraction

Extract structured data from resume using AI.

**Endpoint:** `POST /api/extract`

**Request:** `multipart/form-data`

**Form Fields:**
- `resume`: File (required)
- `apiKey`: String (required)

**Response:**
```json
{
  "success": true,
  "text": "John Doe\nSoftware Engineer...",
  "sections": {
    "personal": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "(555) 123-4567",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/johndoe"
    },
    "summary": "Experienced software engineer...",
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "TechCorp",
        "dates": "2020-Present",
        "responsibilities": [
          "Developed web applications",
          "Led team of 5 engineers"
        ]
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "school": "State University",
        "year": "2018"
      }
    ],
    "skills": {
      "technical": ["JavaScript", "React", "Node.js"],
      "soft": ["Leadership", "Communication"]
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid file or missing API key
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `500`: Extraction error

---

### 8. Batch Resume Parsing

Parse multiple resume files at once.

**Endpoint:** `POST /api/parse-batch`

**Request:** `multipart/form-data`

**Form Fields:**
- `resumes`: Files (required, max 10 files)
- `apiKey`: String (optional)
- `useAI`: Boolean (optional)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "success": true,
      "filename": "resume1.pdf",
      "text": "John Doe...",
      "sections": { /* ... */ }
    },
    {
      "success": true,
      "filename": "resume2.docx",
      "text": "Jane Smith...",
      "sections": { /* ... */ }
    },
    {
      "success": false,
      "filename": "resume3.pdf",
      "error": "Failed to parse PDF"
    }
  ]
}
```

**Status Codes:**
- `200`: Success (even if some files fail)
- `400`: No files or too many files
- `429`: Rate limit exceeded
- `500`: Server error

**Limits:**
- Maximum 10 files per request
- Each file max 10 MB

---

### 9. Job URL Fetching

Fetch job posting content from URL.

**Endpoint:** `POST /api/fetch-job`

**Request Body:**
```json
{
  "url": "https://linkedin.com/jobs/view/123456789",
  "site": "linkedin"
}
```

**Parameters:**
- `url`: Required, valid URL from supported job boards
- `site`: Optional, site identifier for optimization

**Supported Job Boards:**
- LinkedIn (linkedin.com)
- Indeed (indeed.com)
- Glassdoor (glassdoor.com)
- ZipRecruiter (ziprecruiter.com)
- Monster (monster.com)
- Dice (dice.com)
- SimplyHired (simplyhired.com)
- CareerBuilder (careerbuilder.com)
- Greenhouse (greenhouse.io)
- Lever (lever.co)
- Workday (myworkdayjobs.com)
- Built In (builtin.com)
- Wellfound/Angel (angel.co, wellfound.com)

**Response (Success):**
```json
{
  "success": true,
  "content": "Senior Full Stack Developer\n\nWe are seeking...",
  "url": "https://linkedin.com/jobs/view/123456789",
  "site": "linkedin",
  "fetchedAt": "2024-12-02T10:30:00Z"
}
```

**Response (Requires Manual Input):**
```json
{
  "error": "Could not extract job content from URL. The page may require login or use JavaScript rendering.",
  "requiresManualInput": true,
  "suggestion": "Please copy and paste the job description text directly."
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid URL or unsupported site
- `429`: Rate limit exceeded
- `500`: Fetch error

**Example:**
```javascript
const response = await fetch('/api/fetch-job', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://linkedin.com/jobs/view/123456789',
    site: 'linkedin'
  })
});

const data = await response.json();
if (data.success) {
  console.log(data.content);
} else if (data.requiresManualInput) {
  // Prompt user to paste job description manually
}
```

---

### 10. LinkedIn Job Search

Search for jobs on LinkedIn.

**Endpoint:** `POST /api/linkedin-search`

**Request Body:**
```json
{
  "keyword": "software engineer",
  "location": "San Francisco, CA",
  "dateSincePosted": "past month",
  "jobType": "full-time",
  "remoteFilter": "remote",
  "salary": "",
  "experienceLevel": "mid-senior level",
  "limit": "20"
}
```

**Parameters:**
- `keyword`: Required, string, minimum 2 characters
- `location`: Optional, string
- `dateSincePosted`: Optional, "past 24 hours", "past week", "past month", "any time"
- `jobType`: Optional, "full-time", "part-time", "contract", "temporary", "internship"
- `remoteFilter`: Optional, "remote", "on-site", "hybrid"
- `salary`: Optional, salary range filter
- `experienceLevel`: Optional, "entry level", "mid-senior level", "director", "executive"
- `limit`: Optional, string, max 50, default 20

**Response:**
```json
{
  "success": true,
  "query": {
    "keyword": "software engineer",
    "location": "San Francisco, CA",
    "filters": {
      "dateSincePosted": "past month",
      "jobType": "full-time",
      "remoteFilter": "remote",
      "experienceLevel": "mid-senior level"
    }
  },
  "count": 20,
  "jobs": [
    {
      "position": "Senior Software Engineer",
      "company": "TechCorp Inc.",
      "location": "San Francisco, CA (Remote)",
      "date": "2 days ago",
      "salary": "$150k - $200k",
      "jobUrl": "https://linkedin.com/jobs/view/123456789",
      "description": "We are seeking a talented engineer..."
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid keyword
- `429`: Rate limit exceeded
- `500`: LinkedIn API error
- `503`: LinkedIn Jobs API not available

**Example:**
```javascript
const response = await fetch('/api/linkedin-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    keyword: 'software engineer',
    location: 'San Francisco, CA',
    remoteFilter: 'remote',
    limit: '20'
  })
});

const data = await response.json();
data.jobs.forEach(job => {
  console.log(`${job.position} at ${job.company}`);
});
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message describing what went wrong",
  "details": "Additional details (optional)",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Invalid or missing API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, Claude API error |
| 503 | Service Unavailable | Feature not available |

### Common Errors

**Invalid API Key:**
```json
{
  "error": "No API key available. Please provide an API key or configure one in secrets.env"
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

**Invalid Input:**
```json
{
  "error": "Missing required fields: resumeText or jobText"
}
```

**Claude API Error:**
```json
{
  "error": "Failed to connect to Claude API",
  "details": "API returned status 500"
}
```

**File Upload Error:**
```json
{
  "error": "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
}
```

### Error Handling Best Practices

**Client-Side:**
```javascript
try {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();

    if (response.status === 429) {
      // Rate limit - wait and retry
      setTimeout(() => retryRequest(), errorData.retryAfter * 1000);
    } else if (response.status === 401) {
      // Invalid API key - prompt user
      promptForApiKey();
    } else {
      // Other error - show message
      showError(errorData.error);
    }
    return;
  }

  const result = await response.json();
  // Process successful result

} catch (error) {
  // Network error or parsing error
  showError('Network error. Please check your connection.');
}
```

---

## Data Models

### Resume Analysis Result

```typescript
interface AnalysisResult {
  analysis: string; // Formatted analysis text with sections
}
```

**Analysis Format:**
```
1. OVERALL MATCH SCORE
Score: [0-100]
[Explanation]

2. KEY STRENGTHS
- [Strength 1]
- [Strength 2]
...

3. GAPS AND CONCERNS
- [Gap 1]
- [Gap 2]
...

4. RECOMMENDATIONS
- [Recommendation 1]
- [Recommendation 2]
...

5. ATS COMPATIBILITY
Score: [0-100]
- [Point 1]
- [Point 2]
...

6. KEYWORD ANALYSIS
Missing Keywords:
- [Keyword 1]
- [Keyword 2]
...

7. FORMATTING SUGGESTIONS
- [Suggestion 1]
- [Suggestion 2]
...
```

### Job Data Model

```typescript
interface JobData {
  jobTitle: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience?: string;
  softSkills: string[];
  responsibilities: string[];
  tools: string[];
  certifications: string[];
  education?: string;
  keywords: string[];
  companyculture: string[];
  salaryRange?: string;
  location?: string;
  workType?: 'remote' | 'hybrid' | 'onsite';
}
```

### Resume Parse Result

```typescript
interface ParseResult {
  success: boolean;
  text?: string;
  sections?: {
    header?: string;
    experience?: string;
    education?: string;
    skills?: string;
    [key: string]: string | undefined;
  };
  metadata?: {
    filename: string;
    fileSize: number;
    extractedAt: string;
    method: 'text' | 'ai';
  };
  validation?: {
    hasContact: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    warnings: string[];
  };
  error?: string;
}
```

### LinkedIn Job Result

```typescript
interface LinkedInJob {
  position: string;
  company: string;
  location: string;
  date: string;
  salary?: string;
  jobUrl: string;
  description?: string;
}

interface LinkedInSearchResult {
  success: boolean;
  query: {
    keyword: string;
    location: string;
    filters: {
      dateSincePosted?: string;
      jobType?: string;
      remoteFilter?: string;
      experienceLevel?: string;
    };
  };
  count: number;
  jobs: LinkedInJob[];
}
```

---

## Examples

### Complete Workflow Example

```javascript
// 1. Check server configuration
async function checkConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  return config.hasServerApiKey;
}

// 2. Parse resume file
async function parseResume(file, apiKey) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('apiKey', apiKey);
  formData.append('useAI', 'true');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.text;
}

// 3. Fetch job from URL
async function fetchJob(url) {
  const response = await fetch('/api/fetch-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await response.json();
  return data.success ? data.content : null;
}

// 4. Analyze resume
async function analyzeResume(resumeText, jobText, apiKey) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText,
      jobText,
      apiKey
    })
  });

  const data = await response.json();
  return data.analysis;
}

// 5. Get tailoring suggestions
async function getTailoringSuggestions(resumeText, jobText, apiKey) {
  const response = await fetch('/api/tailor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeData: resumeText,
      jobDescription: jobText,
      apiKey
    })
  });

  const data = await response.json();
  return data.jobData;
}

// 6. Generate cover letter
async function generateCoverLetter(resumeText, jobText, apiKey) {
  const prompt = `Write a professional cover letter for the following:

  RESUME:
  ${resumeText}

  JOB DESCRIPTION:
  ${jobText}

  Create a compelling cover letter that highlights relevant experience and skills.`;

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      apiKey,
      maxTokens: 2048,
      temperature: 0.7
    })
  });

  const data = await response.json();
  return data.content;
}

// Complete workflow
async function completeWorkflow() {
  try {
    // Check configuration
    const hasServerKey = await checkConfig();
    const apiKey = hasServerKey ? null : getUserApiKey();

    // Parse resume
    const resumeFile = getResumeFile();
    const resumeText = await parseResume(resumeFile, apiKey);

    // Fetch job
    const jobUrl = getJobUrl();
    const jobText = await fetchJob(jobUrl);

    // Analyze
    const analysis = await analyzeResume(resumeText, jobText, apiKey);
    displayAnalysis(analysis);

    // Get tailoring suggestions
    const suggestions = await getTailoringSuggestions(resumeText, jobText, apiKey);
    displaySuggestions(suggestions);

    // Generate cover letter
    const coverLetter = await generateCoverLetter(resumeText, jobText, apiKey);
    displayCoverLetter(coverLetter);

    console.log('Workflow completed successfully!');
  } catch (error) {
    console.error('Workflow error:', error);
    handleError(error);
  }
}
```

### Error Handling Example

```javascript
async function robustApiCall(endpoint, data, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return await response.json();
      }

      const errorData = await response.json();

      if (response.status === 429) {
        // Rate limit - wait and retry
        const waitTime = errorData.retryAfter || 60;
        console.log(`Rate limited. Waiting ${waitTime}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        continue;
      }

      if (response.status === 401) {
        // Auth error - don't retry
        throw new Error('Invalid API key. Please check your credentials.');
      }

      if (response.status >= 500) {
        // Server error - retry
        console.log(`Server error. Retry ${i + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      // Client error - don't retry
      throw new Error(errorData.error || 'Request failed');

    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Network error. Retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Rate Limit Handling Example

```javascript
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      // Wait until oldest request expires
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      return this.throttle(); // Retry after waiting
    }

    this.requests.push(now);
  }

  async makeRequest(url, options) {
    await this.throttle();
    return fetch(url, options);
  }
}

// Usage
const limiter = new RateLimiter();

async function analyzeWithRateLimit(data) {
  const response = await limiter.makeRequest('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return response.json();
}
```

---

## Security

### Best Practices

**1. API Key Security**
- Never commit API keys to version control
- Store server keys in `.env` file (gitignored)
- Use environment variables for production
- Rotate keys regularly

**2. Input Validation**
- All inputs are validated server-side
- Maximum length limits enforced
- File type and size restrictions
- XSS prevention through sanitization

**3. CORS**
- CORS enabled for development
- Configure allowed origins for production

**4. Content Security Policy**
- CSP headers configured in `security/csp-config.json`
- Prevents XSS attacks
- Restricts resource loading

**5. Rate Limiting**
- Prevents abuse
- IP-based tracking
- Configurable limits

### Production Deployment

**Environment Variables:**
```bash
PORT=3101
CLAUDE_API_KEY=sk-ant-...
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

**Security Headers:**
```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured policy]
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for API version history and breaking changes.

**Current Version**: 2.0.0

---

## Support

**Issues:** https://github.com/ry-ops/ResuMate/issues

**Documentation:** https://github.com/ry-ops/ResuMate

**License:** MIT
