# ResuMate Parser API Documentation

## Overview

The ResuMate parser system provides comprehensive resume parsing capabilities with support for PDF, DOCX, and TXT formats. It includes both basic text extraction and AI-powered structured data extraction using Claude API.

## Features

- **Multi-format Support**: PDF, DOCX, DOC, and TXT files
- **AI-Powered Extraction**: Uses Claude API to intelligently extract structured resume data
- **Section Detection**: Automatically identifies resume sections (experience, education, skills, etc.)
- **Contact Extraction**: Extracts email, phone, LinkedIn, GitHub, and website URLs
- **Date Normalization**: Standardizes date formats across the resume
- **Skill Categorization**: Automatically categorizes skills (technical, languages, frameworks, tools, soft skills)
- **Validation**: Validates parsed data and provides completeness scoring
- **Batch Processing**: Parse multiple resumes simultaneously

## Architecture

```
js/export/
├── parser.js          # Main controller, routes to appropriate parser
├── pdf-parser.js      # PDF text extraction using pdf.js
├── docx-parser.js     # DOCX text extraction using mammoth.js
└── ai-extractor.js    # AI-powered section detection and data extraction
```

## API Endpoints

### 1. Parse Resume (`POST /api/parse`)

Parse a resume file with optional AI extraction.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `resume` (file): The resume file (PDF, DOCX, or TXT)
  - `apiKey` (string, optional): Claude API key for AI extraction
  - `useAI` (boolean, optional): Enable AI extraction (requires apiKey)

**Response:**
```json
{
  "success": true,
  "fileType": "pdf",
  "filename": "john-doe-resume.pdf",
  "text": "Full extracted text...",
  "sections": [
    {
      "title": "Experience",
      "content": "Section content..."
    }
  ],
  "structuredData": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "(555) 123-4567",
      "location": "New York, NY",
      "linkedin": "linkedin.com/in/johndoe",
      "github": "github.com/johndoe",
      "website": "johndoe.com"
    },
    "summary": "Professional summary text...",
    "experience": [
      {
        "title": "Senior Developer",
        "company": "Tech Company Inc.",
        "location": "New York, NY",
        "startDate": "2020-01",
        "endDate": "Present",
        "description": "Job description...",
        "achievements": [
          "Achievement 1",
          "Achievement 2"
        ]
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "school": "University of Technology",
        "location": "Boston, MA",
        "graduationDate": "2019-05",
        "gpa": "3.8",
        "honors": "Cum Laude"
      }
    ],
    "skills": {
      "technical": ["JavaScript", "Python"],
      "languages": ["JavaScript", "Python", "Java"],
      "frameworks": ["React", "Node.js", "Django"],
      "tools": ["Git", "Docker", "AWS"],
      "soft": ["Leadership", "Communication"]
    },
    "certifications": [
      {
        "name": "AWS Solutions Architect",
        "issuer": "Amazon Web Services",
        "date": "2021-03",
        "expirationDate": "2024-03",
        "credentialId": "ABC123"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built scalable platform...",
        "technologies": ["React", "Node.js", "MongoDB"],
        "url": "github.com/johndoe/ecommerce",
        "date": "2020-06"
      }
    ],
    "achievements": ["Achievement 1", "Achievement 2"],
    "awards": ["Award 1", "Award 2"],
    "publications": ["Publication 1"],
    "languages": [
      {
        "language": "English",
        "proficiency": "Native"
      },
      {
        "language": "Spanish",
        "proficiency": "Professional"
      }
    ],
    "volunteering": [
      {
        "role": "Mentor",
        "organization": "Code Academy",
        "startDate": "2019-01",
        "endDate": "Present",
        "description": "Mentoring junior developers"
      }
    ],
    "interests": ["Open source", "Machine learning"]
  },
  "metadata": {
    "title": "Resume PDF Title",
    "author": "John Doe",
    "creationDate": "2023-01-15"
  },
  "stats": {
    "textLength": 5432,
    "wordCount": 892,
    "sectionCount": 8,
    "hasStructuredData": true,
    "parsingMethod": "AI-enhanced"
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": ["No certifications found"],
    "score": 87
  },
  "aiExtracted": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 2. Extract Resume Data (`POST /api/extract`)

Extract structured data from resume using AI (always enabled).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `resume` (file): The resume file
  - `apiKey` (string, required): Claude API key

**Response:** Same as `/api/parse` with AI extraction enabled.

### 3. Batch Parse (`POST /api/parse-batch`)

Parse multiple resume files at once (max 10 files).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `resumes` (files): Array of resume files
  - `apiKey` (string, optional): Claude API key
  - `useAI` (boolean, optional): Enable AI extraction

**Response:**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "filename": "resume1.pdf",
      "success": true,
      // ... parsed data
    },
    {
      "filename": "resume2.docx",
      "success": true,
      // ... parsed data
    }
  ]
}
```

## Client-Side Usage

### Basic Usage

```javascript
// Include the client library
const parser = new ResumeParserClient();

// Parse without AI
const result = await parser.parseResume(file);

// Parse with AI extraction
const apiKey = 'your-claude-api-key';
const result = await parser.extractResumeData(file, apiKey);

// Batch processing
const files = fileInput.files; // FileList from input
const results = await parser.parseMultiple(files, apiKey, true);
```

### With UI Helpers

```javascript
// Setup file upload handler
const fileInput = document.getElementById('resume-upload');
const resultsContainer = document.getElementById('results');

ResumeParserUI.setupFileUpload(
  fileInput,
  (result) => {
    // Success callback
    ResumeParserUI.displayParsedResume(result, resultsContainer);
  },
  (error) => {
    // Error callback
    ResumeParserUI.showError(resultsContainer, error);
  },
  (progress) => {
    // Progress callback
    console.log(progress.stage, progress.message);
  }
);
```

### File Validation

```javascript
const parser = new ResumeParserClient();

// Validate before upload
const validation = parser.validateFile(file);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  return;
}

if (validation.warnings.length > 0) {
  console.warn('Validation warnings:', validation.warnings);
}

// Proceed with parsing
const result = await parser.parseResume(file);
```

## Parsing Options

The parser supports various options:

```javascript
const options = {
  useAI: true,           // Use AI for enhanced extraction
  extractSections: true,  // Extract basic sections
  structureData: true     // Structure the data
};

const result = await parser.parseResume(fileBuffer, filename, apiKey, options);
```

## Data Schema

### Personal Information
- `name`: Full name
- `email`: Email address
- `phone`: Phone number
- `location`: City, state/country
- `linkedin`: LinkedIn profile URL
- `github`: GitHub profile URL
- `website`: Personal website URL
- `portfolio`: Portfolio URL

### Experience
Each entry includes:
- `title`: Job title
- `company`: Company name
- `location`: City, state
- `startDate`: Start date (YYYY-MM format)
- `endDate`: End date (YYYY-MM or "Present")
- `description`: Job description
- `achievements`: Array of achievements/bullet points

### Education
Each entry includes:
- `degree`: Degree name
- `field`: Field of study
- `school`: School name
- `location`: City, state
- `graduationDate`: Graduation date (YYYY-MM)
- `gpa`: GPA if mentioned
- `honors`: Honors if mentioned

### Skills
Categorized into:
- `technical`: General technical skills
- `languages`: Programming languages
- `frameworks`: Frameworks and libraries
- `tools`: Tools and software
- `soft`: Soft skills

### Certifications
Each entry includes:
- `name`: Certification name
- `issuer`: Issuing organization
- `date`: Date obtained (YYYY-MM)
- `expirationDate`: Expiration date (YYYY-MM or null)
- `credentialId`: Credential ID if provided

## Validation and Scoring

The parser includes a validation system that checks:

1. **Essential Data**: Name, contact info, experience, education
2. **Completeness Score**: 0-100 score based on:
   - Personal Info (20 points)
   - Summary (10 points)
   - Experience (25 points)
   - Education (20 points)
   - Skills (15 points)
   - Certifications (5 points)
   - Projects (5 points)

**Example:**
```javascript
const validation = parser.validateResumeData(parsedData);

console.log(validation.valid);      // true/false
console.log(validation.score);      // 0-100
console.log(validation.errors);     // Array of errors
console.log(validation.warnings);   // Array of warnings
```

## Error Handling

The parser provides detailed error information:

```javascript
const result = await parser.parseResume(file, apiKey);

if (!result.success) {
  console.error('Parsing failed:', result.error);

  // Check for specific errors
  if (result.error.includes('Unsupported file type')) {
    // Handle unsupported file
  } else if (result.error.includes('API key')) {
    // Handle API key issues
  }
}
```

## Performance Considerations

### File Sizes
- Maximum file size: 10MB
- Recommended: < 5MB for optimal performance
- Large PDFs may take longer to process

### AI Extraction
- AI extraction requires Claude API key
- Adds 2-5 seconds processing time
- Uses Claude Sonnet 3.5 model
- Token usage: ~3000-8000 tokens per resume

### Batch Processing
- Maximum 10 files per batch request
- Processes sequentially (not in parallel)
- Total time = (per-file time) × (number of files)

## Rate Limiting

API endpoints are rate-limited:
- 10 requests per minute per IP
- Returns 429 status code when exceeded
- Includes `retryAfter` in error response

## Security

### File Upload Security
- File type validation (MIME type checking)
- File size limits (10MB max)
- No server-side file storage (memory only)
- Automatic cleanup after processing

### API Key Handling
- API keys never logged or stored server-side
- Transmitted via secure HTTPS
- Client-side encryption recommended (use Web Crypto API)
- Store in localStorage with encryption

### Input Sanitization
- All text inputs sanitized
- XSS prevention measures
- Content Security Policy headers
- Rate limiting on all endpoints

## Testing

Run the test suite:

```bash
npm test

# Or directly
node test-parser.js
```

Test coverage:
- Plain text parsing
- File type detection
- Resume validation
- Completeness scoring
- Batch parsing interface

## Troubleshooting

### PDF Parsing Issues
- Ensure PDF is text-based (not scanned image)
- Try converting PDF to DOCX if extraction fails
- Check for PDF protection/encryption

### DOCX Parsing Issues
- Ensure file is valid DOCX format (not corrupted)
- Complex formatting may not be fully preserved
- Tables and multi-column layouts may lose structure

### AI Extraction Issues
- Verify API key is valid and has credits
- Check network connectivity
- Review rate limiting status
- Ensure resume text is substantial (>50 words)

### Common Errors

1. **"Unsupported file type"**
   - Solution: Use PDF, DOCX, DOC, or TXT formats

2. **"API key is required"**
   - Solution: Provide valid Claude API key for AI extraction

3. **"File size exceeds maximum"**
   - Solution: Compress or reduce file size to under 10MB

4. **"Failed to parse PDF"**
   - Solution: PDF may be image-based; use OCR or convert to text

5. **"AI extraction failed"**
   - Solution: Check API key, credits, and network connection

## Examples

### Complete Example: Parse and Display

```html
<!DOCTYPE html>
<html>
<head>
  <title>Resume Parser Example</title>
  <script src="js/resume-parser-client.js"></script>
</head>
<body>
  <input type="file" id="resume-upload" accept=".pdf,.docx,.doc,.txt">
  <div id="results"></div>

  <script>
    const fileInput = document.getElementById('resume-upload');
    const resultsDiv = document.getElementById('results');
    const parser = new ResumeParserClient();

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Show loading
      ResumeParserUI.showLoading(resultsDiv);

      // Get API key (if available)
      const apiKey = localStorage.getItem('claude_api_key');

      // Parse resume
      const result = apiKey
        ? await parser.extractResumeData(file, apiKey)
        : await parser.parseResume(file);

      // Display results
      if (result.success) {
        ResumeParserUI.displayParsedResume(result, resultsDiv);
      } else {
        ResumeParserUI.showError(resultsDiv, result.error);
      }
    });
  </script>
</body>
</html>
```

### Node.js Example

```javascript
const fs = require('fs');
const parser = require('./js/export/parser');

async function parseResumeFile(filePath, apiKey) {
  // Read file
  const fileBuffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  // Parse with AI
  const result = await parser.parseResume(
    fileBuffer,
    filename,
    apiKey,
    { useAI: true, extractSections: true, structureData: true }
  );

  if (result.success) {
    console.log('Name:', result.structuredData.personalInfo.name);
    console.log('Email:', result.structuredData.personalInfo.email);
    console.log('Experience:', result.structuredData.experience.length, 'positions');
    console.log('Completeness:', result.validation.score, '/100');
  } else {
    console.error('Parsing failed:', result.error);
  }
}

// Usage
parseResumeFile('./resumes/john-doe.pdf', process.env.CLAUDE_API_KEY);
```

## Support

For issues, feature requests, or questions:
- GitHub Issues: https://github.com/ry-ops/ResuMate/issues
- Documentation: https://github.com/ry-ops/ResuMate#readme

## License

MIT License - See LICENSE file for details
