# ATSFlow

**AI-Powered Resume Optimization for Claude Code**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Claude AI](https://img.shields.io/badge/AI-Claude%20Sonnet%204-purple.svg)](https://www.anthropic.com/)

---

## Overview

ATSFlow is a command-line tool and API server designed specifically for Claude Code integration. It provides AI-powered resume optimization, ATS analysis, job tailoring, and intelligent document generation—all accessible programmatically or via CLI commands.

**Key Features:**
- 🤖 **AI Content Generation** - Claude Sonnet 4 integration for summaries, cover letters, job descriptions
- 📊 **ATS Analysis** - 30+ compatibility checks with scoring and recommendations
- 🎯 **Job Tailoring** - One-command resume optimization for specific positions
- 📄 **Document Parsing** - Extract data from PDF/DOCX resumes
- 📤 **Multi-Format Export** - PDF, DOCX, TXT, JSON, HTML
- 📈 **Industry Benchmarking** - Skills gap analysis and career recommendations
- 🔄 **Version Management** - Track and compare resume versions

---

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/ry-ops/ATSFlow.git
cd ATSFlow

# Install dependencies
npm install

# Make CLI executable (Unix/Mac)
chmod +x cli.js
```

### Basic Usage

```bash
# Show help
node cli.js help

# Generate AI content
node cli.js generate summary --input resume.json --tone professional

# Analyze resume for ATS
node cli.js analyze resume.pdf --output analysis.json

# Tailor resume to job
node cli.js tailor resume.json job-description.txt --output tailored.json

# Export to PDF
node cli.js export resume.json pdf --output resume.pdf

# Industry benchmarking
node cli.js benchmark resume.json --industry tech
```

### Start API Server

```bash
# Start server on port 3000
npm start

# API available at http://localhost:3000
```

---

## CLI Commands

### `generate <type> [options]`

Generate AI-powered content using Claude Sonnet 4.

**Types:**
- `summary` - Professional summary/objective
- `experience` - Job description expansion
- `skills` - Skills assessment and recommendations
- `cover-letter` - Tailored cover letter
- `headline` - LinkedIn-style headline

**Options:**
- `--input <file>` - Input resume/data file (JSON)
- `--output <file>` - Output file path
- `--tone <type>` - Tone: professional, creative, technical (default: professional)
- `--length <type>` - Length: brief, standard, detailed (default: standard)

**Examples:**
```bash
# Generate professional summary
node cli.js generate summary --input resume.json --output summary.txt

# Generate cover letter
node cli.js generate cover-letter --input resume.json --tone professional
```

---

### `analyze <file> [options]`

Run comprehensive ATS (Applicant Tracking System) analysis.

**Analysis Includes:**
- 30+ formatting and structure checks
- Keyword density analysis
- Readability scoring
- ATS compatibility rating (A+ to F)
- Prioritized recommendations

**Options:**
- `--output <file>` - Output file for results
- `--format <type>` - Output format: json, text (default: json)
- `--verbose` - Detailed analysis output

**Examples:**
```bash
# Analyze resume
node cli.js analyze resume.pdf --output analysis.json

# Get detailed text report
node cli.js analyze resume.docx --format text --verbose
```

**Sample Output:**
```json
{
  "overall_score": 87,
  "letter_grade": "A",
  "categories": {
    "ats_compatibility": 90,
    "keyword_match": 85,
    "content_quality": 88,
    "formatting": 92,
    "completeness": 80
  },
  "recommendations": [
    {"priority": "high", "issue": "Add 3-5 more industry keywords"},
    {"priority": "medium", "issue": "Quantify achievements with metrics"}
  ]
}
```

---

### `parse <file> [options]`

Extract structured data from PDF or DOCX resumes.

**Features:**
- Automatic section detection (experience, education, skills, etc.)
- Contact information extraction
- Date parsing and formatting
- 87-90% accuracy rate

**Options:**
- `--output <file>` - Output JSON file
- `--format <type>` - Output format: json, yaml (default: json)

**Examples:**
```bash
# Parse PDF resume
node cli.js parse resume.pdf --output extracted.json

# Parse DOCX resume
node cli.js parse resume.docx
```

**Sample Output:**
```json
{
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0100"
  },
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Engineer",
      "start_date": "2020-01",
      "end_date": "present",
      "achievements": ["Led team of 5", "Reduced latency by 40%"]
    }
  ],
  "skills": ["Python", "AWS", "Docker"]
}
```

---

### `tailor <resume> <job> [options]`

Tailor resume to specific job description using AI analysis.

**Process:**
1. Analyzes job description for keywords and requirements
2. Scores current resume match (0-100%)
3. Suggests specific changes to improve match
4. Generates tailored version

**Options:**
- `--output <file>` - Output tailored resume
- `--auto-apply` - Automatically apply all suggestions
- `--diff` - Show before/after comparison

**Examples:**
```bash
# Tailor resume
node cli.js tailor resume.json job-desc.txt --output tailored.json

# Auto-apply with diff
node cli.js tailor resume.json job-desc.txt --auto-apply --diff
```

**Sample Output:**
```json
{
  "match_score": 75,
  "suggestions": [
    {
      "section": "skills",
      "action": "add",
      "content": "Kubernetes, Terraform",
      "impact": "high"
    },
    {
      "section": "experience",
      "action": "modify",
      "content": "Highlight cloud infrastructure experience",
      "impact": "medium"
    }
  ],
  "tailored_resume": { ... }
}
```

---

### `export <file> <format> [options]`

Export resume to various formats.

**Supported Formats:**
- `pdf` - High-quality PDF with selectable text
- `docx` - Editable Microsoft Word document
- `txt` - Plain text format
- `json` - Structured data backup
- `html` - Self-contained HTML (single file)

**Options:**
- `--output <file>` - Output file path
- `--template <name>` - Template style (for PDF/HTML): classic, modern, minimal
- `--page-size <size>` - Page size: letter, a4 (default: letter)

**Examples:**
```bash
# Export to PDF
node cli.js export resume.json pdf --output resume.pdf --template modern

# Export to DOCX
node cli.js export resume.json docx --output resume.docx

# Export to HTML
node cli.js export resume.json html --output resume.html
```

---

### `benchmark <file> [options]`

Run industry benchmarking and skills gap analysis.

**Analysis:**
- Compare skills against industry standards
- Identify missing critical skills
- Get career progression suggestions
- Salary range estimates
- Competitiveness scoring (0-100)

**Options:**
- `--industry <type>` - Industry: tech, finance, healthcare, marketing, manufacturing
- `--role <name>` - Target role for comparison
- `--output <file>` - Output analysis results

**Examples:**
```bash
# Benchmark for tech industry
node cli.js benchmark resume.json --industry tech --output benchmark.json

# Compare to specific role
node cli.js benchmark resume.json --industry tech --role "Senior Engineer"
```

**Sample Output:**
```json
{
  "competitiveness_score": 82,
  "percentile": 78,
  "skills_gap": {
    "critical_missing": ["Kubernetes", "Terraform"],
    "recommended": ["GraphQL", "Redis"],
    "learning_paths": [...]
  },
  "career_progression": [
    "Senior Software Engineer",
    "Staff Engineer",
    "Principal Engineer"
  ],
  "salary_estimate": {
    "min": "$120,000",
    "max": "$180,000",
    "median": "$150,000"
  }
}
```

---

### `version list|diff [options]`

Manage resume versions.

**Commands:**
- `version list` - List all saved versions
- `version diff <v1> <v2>` - Compare two versions

**Examples:**
```bash
# List versions
node cli.js version list

# Compare versions
node cli.js version diff base-2024 tailored-tech-company
```

---

## API Server

Start the API server for programmatic access from Claude Code or other tools.

### Start Server

```bash
npm start
# Server runs on http://localhost:3000
```

### API Endpoints

**Resume Analysis:**
```bash
POST /api/analyze
Content-Type: application/json

{
  "resume": "resume content or file path",
  "options": {
    "verbose": true
  }
}
```

**AI Content Generation:**
```bash
POST /api/generate
Content-Type: application/json

{
  "type": "summary",
  "input": { ... resume data ... },
  "options": {
    "tone": "professional",
    "length": "standard"
  }
}
```

**Job Tailoring:**
```bash
POST /api/tailor
Content-Type: application/json

{
  "resume": { ... resume data ... },
  "job_description": "job description text",
  "auto_apply": false
}
```

**Document Export:**
```bash
POST /api/export
Content-Type: application/json

{
  "resume": { ... resume data ... },
  "format": "pdf",
  "options": {
    "template": "modern",
    "page_size": "letter"
  }
}
```

**Industry Benchmarking:**
```bash
POST /api/benchmark
Content-Type: application/json

{
  "resume": { ... resume data ... },
  "industry": "tech",
  "role": "Senior Engineer"
}
```

### API Response Format

All API endpoints return JSON in this format:

```json
{
  "success": true,
  "data": { ... result data ... },
  "error": null,
  "timestamp": "2025-12-04T10:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Resume file not found"
  },
  "timestamp": "2025-12-04T10:00:00Z"
}
```

---

## Configuration

### Environment Variables

```bash
# API Keys
ANTHROPIC_API_KEY=your_claude_api_key

# Server Configuration
PORT=3000
NODE_ENV=production

# Feature Flags
ENABLE_BENCHMARKING=true
ENABLE_AI_GENERATION=true
MAX_FILE_SIZE=10MB
```

### Resume Data Format

ATSFlow uses a standardized JSON format:

```json
{
  "version": "3.0.0",
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0100",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Engineer",
      "start_date": "2020-01",
      "end_date": "present",
      "location": "San Francisco, CA",
      "achievements": [
        "Led team of 5 engineers",
        "Reduced API latency by 40%"
      ]
    }
  ],
  "education": [
    {
      "institution": "University of Technology",
      "degree": "B.S. Computer Science",
      "graduation_date": "2018-05",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "programming": ["Python", "JavaScript", "Go"],
    "cloud": ["AWS", "Docker", "Kubernetes"],
    "databases": ["PostgreSQL", "MongoDB"]
  },
  "certifications": [
    {
      "name": "AWS Solutions Architect",
      "issuer": "Amazon",
      "date": "2023-06"
    }
  ]
}
```

---

## Claude Code Integration

ATSFlow is designed for seamless integration with Claude Code.

### Example Workflows

**1. Resume Analysis and Optimization:**
```javascript
// Claude Code can call CLI commands directly
const result = await exec('node cli.js analyze resume.pdf --output analysis.json');
const analysis = JSON.parse(fs.readFileSync('analysis.json'));

// Review recommendations and apply fixes
for (const rec of analysis.recommendations) {
  console.log(`Priority ${rec.priority}: ${rec.issue}`);
}
```

**2. Job Application Automation:**
```javascript
// Tailor resume for specific job
await exec('node cli.js tailor base-resume.json job-posting.txt --auto-apply --output tailored.json');

// Generate matching cover letter
await exec('node cli.js generate cover-letter --input tailored.json --output cover-letter.txt');

// Export to PDF
await exec('node cli.js export tailored.json pdf --output application-resume.pdf');
```

**3. Batch Processing:**
```javascript
// Process multiple job applications
const jobs = ['job1.txt', 'job2.txt', 'job3.txt'];

for (const job of jobs) {
  const company = path.basename(job, '.txt');
  await exec(`node cli.js tailor base-resume.json ${job} --output ${company}-resume.json`);
  await exec(`node cli.js export ${company}-resume.json pdf --output ${company}-resume.pdf`);
}
```

---

## Architecture

### Core Modules

```
ATSFlow/
├── cli.js                      # CLI entry point
├── server.js                   # API server
├── js/
│   ├── ai/                     # AI integration (Claude)
│   │   ├── generator.js        # Content generation
│   │   └── prompts.js          # AI prompt templates
│   ├── analyzer/               # ATS analysis
│   │   ├── ats-scanner.js      # 30+ ATS checks
│   │   ├── scorer.js           # Scoring engine
│   │   └── checks/             # Individual check modules
│   ├── export/                 # Document export/parsing
│   │   ├── parser.js           # Resume parser (PDF/DOCX)
│   │   ├── pdf-export.js       # PDF generation
│   │   └── docx-export.js      # DOCX generation
│   ├── coverletter/            # Cover letter generation
│   │   ├── generator.js        # Cover letter AI
│   │   └── templates.js        # Cover letter templates
│   ├── insights/               # Industry benchmarking
│   │   ├── benchmarking.js     # Benchmark engine
│   │   ├── industry-data.js    # Industry standards
│   │   └── skills-gap.js       # Skills gap analysis
│   ├── versions/               # Version management
│   │   └── diff.js             # Version comparison
│   ├── tracker/                # Application tracking
│   │   └── analytics.js        # Analytics engine
│   └── utils/                  # Shared utilities
│       ├── crypto.js           # Encryption
│       └── sanitizer.js        # Input validation
└── package.json
```

### Technology Stack

- **Runtime:** Node.js 16+
- **AI:** Claude Sonnet 4 (Anthropic)
- **Document Parsing:** PDF.js, Mammoth.js
- **Document Export:** docx, html2pdf
- **API Server:** Express.js
- **Storage:** Local filesystem (JSON)

---

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="ATS Scanner"

# Watch mode
npm run test:watch
```

### Adding New Commands

1. Create handler in appropriate `js/` subdirectory:

```javascript
// js/analyzer/cli-analyze.js
module.exports = async function(args) {
  const file = args[0];
  // Implementation
  console.log('Analysis complete');
};
```

2. Register command in `cli.js`:

```javascript
case 'analyze':
  await require('./js/analyzer/cli-analyze.js')(args.slice(1));
  break;
```

3. Add to `package.json` scripts (optional):

```json
"scripts": {
  "analyze": "node cli.js analyze"
}
```

---

## Security

- **API Key Encryption:** AES-GCM 256-bit encryption for stored API keys
- **Input Sanitization:** All user input sanitized to prevent injection attacks
- **Rate Limiting:** API endpoints protected (10 req/min default)
- **No Server Storage:** All data processed locally, no cloud storage
- **CSP Headers:** Content Security Policy headers on API server

---

## Performance

- **Resume Parsing:** 87-90% accuracy, ~2-5 seconds per document
- **ATS Analysis:** 30+ checks, <1 second
- **AI Generation:** 5-15 seconds depending on content type
- **PDF Export:** <2 seconds for standard resume
- **Benchmarking:** <1 second (cached industry data)

---

## Troubleshooting

### Common Issues

**1. API Key Not Found**
```bash
# Set environment variable
export ANTHROPIC_API_KEY=your_key_here

# Or create .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env
```

**2. PDF Parsing Fails**
```bash
# Ensure pdfjs-dist is installed
npm install pdfjs-dist@latest

# Try with --verbose for debug output
node cli.js parse resume.pdf --verbose
```

**3. Port Already in Use**
```bash
# Change port
PORT=3001 npm start

# Or kill existing process
lsof -ti:3000 | xargs kill
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Author

**Ryan Dahlberg** - [ry-ops](https://github.com/ry-ops)

Built with Claude Code by Anthropic.

---

## Changelog

### v3.0.0 (2025-12-04)
- **Breaking Change:** Removed GUI/dashboard interface
- **New:** CLI interface for Claude Code integration
- **New:** REST API server for programmatic access
- **Improved:** Streamlined core functionality
- **Removed:** Frontend dependencies (Chart.js, html2pdf.js, etc.)
- **Updated:** Documentation for CLI/API usage

### v2.0.0 (Previous)
- GUI-based resume builder
- Full dashboard interface
- 40+ features across 4 waves

---

**Questions or Issues?** Open an issue on [GitHub](https://github.com/ry-ops/ATSFlow/issues)
