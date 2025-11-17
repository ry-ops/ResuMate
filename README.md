# ResuMate

AI-powered resume optimization tool that helps you land more interviews.

## Features

- **Resume Upload/Paste**: Upload your resume or paste it directly
- **Job Description Matching**: Upload or paste job descriptions to analyze fit
- **AI-Powered Analysis**: Claude AI provides intelligent recommendations
- **ATS Compatibility**: Scan for Applicant Tracking System compatibility
- **LPS Optimization**: Optimize for LinkedIn Profile Search
- **Browser-Based**: Runs natively in your web browser
- **Privacy-First**: All processing happens client-side

## Tech Stack

- HTML5/CSS3/JavaScript (Vanilla - no framework overhead)
- Claude AI API for intelligent analysis
- Browser-based file handling
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- A Claude AI API key from [Anthropic Console](https://console.anthropic.com/)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/ry-ops/ResuMate.git
cd ResuMate

# Open in browser
open index.html
# Or simply double-click index.html in your file explorer
```

### Usage

1. **Enter Your Resume**
   - Upload a resume file (PDF, DOC, DOCX, or TXT), OR
   - Paste your resume text directly into the text area

2. **Enter Job Description**
   - Upload a job description file, OR
   - Paste the job description text

3. **Add Your Claude API Key**
   - Enter your Claude API key (starts with `sk-ant-`)
   - Your key is stored locally in your browser and never sent to our servers
   - Get your key at [https://console.anthropic.com/](https://console.anthropic.com/)

4. **Click "Analyze Resume"**
   - Claude AI will analyze your resume against the job description
   - You'll receive:
     - Overall match score
     - Key strengths
     - Gaps and concerns
     - Actionable recommendations
     - ATS compatibility analysis
     - Keyword optimization suggestions
     - Formatting improvements

## Features Explained

### ATS Compatibility
ResuMate analyzes your resume for compatibility with Applicant Tracking Systems (ATS), which are used by most companies to screen resumes before human review.

### Keyword Analysis
Identifies important keywords from the job description that are missing or underutilized in your resume, helping you optimize for both ATS and human reviewers.

### LPS Optimization
Provides recommendations to optimize your resume for LinkedIn Profile Search, helping recruiters find you.

## Development

This project is managed using [commit-relay](https://github.com/ry-ops/commit-relay), an autonomous AI-powered development system.

## License

MIT License

---

Built with Claude Code by Anthropic
