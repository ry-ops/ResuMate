# ResuMate User Guide

Welcome to ResuMate! This comprehensive guide will walk you through every step of optimizing your resume and generating professional career documents using AI.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Complete User Journey](#complete-user-journey)
3. [Feature Guide](#feature-guide)
4. [Tips for Best Results](#tips-for-best-results)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Claude API key (get one from [Anthropic Console](https://console.anthropic.com/))
- Your resume (PDF, DOCX, DOC, or TXT format)
- Job description you're applying for

### Quick Start

1. **Start the Server**
   ```bash
   npm start
   ```
   The server will start at `http://localhost:3101`

2. **Open in Browser**
   Navigate to `http://localhost:3101` in your web browser

3. **Enter API Key**
   - Enter your Claude API key in the API Key section
   - Or configure a server-side key in `secrets.env` file

You're ready to optimize your resume!

---

## Complete User Journey

### Step 1: Upload Your Resume

**Method 1: Upload File**
1. Click the "Upload Resume" button
2. Select your resume file (PDF, DOCX, DOC, or TXT)
3. Wait for the file to be parsed
4. Review the extracted text in the text area

**Method 2: Paste Text**
1. Copy your resume text
2. Paste directly into the "Resume Text" field
3. The text will be automatically saved

**Supported Formats:**
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

**File Size Limit:** 10MB

---

### Step 2: Add Job Description

**Method 1: Import from URL** (Recommended)
1. Copy the job posting URL from LinkedIn, Indeed, or other job boards
2. Paste the URL in the "Import from URL" field
3. Click "Import"
4. The job description will be automatically extracted

**Supported Job Boards:**
- LinkedIn
- Indeed
- Glassdoor
- ZipRecruiter
- Monster
- Dice
- SimplyHired
- CareerBuilder
- Greenhouse
- Lever
- Workday
- Built In
- Wellfound (Angel.co)

**Method 2: Upload File**
1. Click "Upload Job Description"
2. Select the job description file
3. Review extracted text

**Method 3: Paste Text**
1. Copy the job description text
2. Paste into the text area

---

### Step 3: Run Analysis

1. Click the "Analyze Resume" button
2. Wait for Claude AI to analyze (typically 10-30 seconds)
3. Review the comprehensive analysis results

**Analysis Includes:**

**1. Overall Match Score (0-100)**
   - Quantitative assessment of your fit for the role
   - Explanation of scoring factors

**2. Key Strengths**
   - 5 strongest aspects of your resume for this role
   - Specific skills and experiences that match

**3. Gaps and Concerns**
   - Missing skills or experience
   - Areas where you don't match requirements
   - Red flags to address

**4. Recommendations**
   - Actionable improvements for your resume
   - Specific suggestions to increase match score
   - Prioritized list of changes

**5. ATS Compatibility Score (0-100)**
   - How well your resume will perform in ATS systems
   - Formatting recommendations
   - Technical suggestions

**6. Keyword Analysis**
   - Keywords present in job description
   - Missing keywords you should include
   - Keyword density recommendations

**7. Formatting Suggestions**
   - Layout improvements
   - Section organization
   - Visual presentation tips

---

### Step 4: Job Tailoring (Optional)

Navigate to the Job Tailoring page to get AI-powered suggestions:

1. Your resume data is automatically loaded
2. Job requirements are extracted and analyzed
3. Review tailoring suggestions:
   - Skills to emphasize
   - Experience to highlight
   - Keywords to incorporate
   - Achievements to showcase

4. Apply suggestions to your resume

**Access Job Tailoring:**
- Click "Job Tailoring" in the navigation menu
- Or visit `http://localhost:3101/test-job-tailor.html`

---

### Step 5: Generate Career Documents

Navigate to Career Documents Generator to create a complete application package:

**Access Career Documents:**
- Click "Career Docs" in the navigation menu
- Or visit `http://localhost:3101/test-careerdocs.html`

**Available Documents:**

#### 1. Professional Cover Letter
- Tailored to the specific job
- Highlights relevant experience
- Professional tone and structure
- Multiple templates available:
  - Traditional (formal business format)
  - Modern (contemporary design)
  - Technical (for tech roles)
  - Creative (for design/creative roles)
  - Entry-Level (for early career)
  - Executive (for senior positions)
  - Career Changer (transitioning careers)
  - Referral (with employee referral)

**How to Generate:**
1. Ensure resume and job data are loaded
2. Select cover letter template
3. Click "Generate Cover Letter"
4. Review and customize generated content
5. Download as PDF or DOCX

#### 2. Professional Bio
- Concise 3rd-person biography
- Ideal for LinkedIn, portfolios, speaker profiles
- Formats: Short (100 words), Medium (250 words), Long (500 words)

**How to Generate:**
1. Click "Generate Bio"
2. Select desired length
3. Customize tone (professional, casual, technical)
4. Download or copy

#### 3. Personal Brand Statement
- Compelling value proposition
- Elevator pitch format
- Highlights unique strengths
- 2-3 sentences

**How to Generate:**
1. Click "Generate Brand Statement"
2. Review and refine
3. Use in LinkedIn summary, resume summary, email signatures

#### 4. Inquiry Letter (Networking)
- Professional outreach template
- For informational interviews
- Networking opportunities
- Industry connections

**How to Generate:**
1. Click "Generate Inquiry Letter"
2. Customize for specific contacts
3. Download or copy

#### 5. Tailored Resume
- Optimized version of your resume
- Keywords incorporated
- Achievements highlighted
- ATS-friendly formatting

**How to Generate:**
1. Apply suggested changes from analysis
2. Use the Resume Builder (if available)
3. Export in preferred format

---

### Step 6: Proofread Documents

Navigate to AI Proofreading Suite for final polish:

**Access Proofreading:**
- Click "Proofread" in the navigation menu
- Or visit `http://localhost:3101/test-proofread.html`

**Proofreading Features:**

**Grammar & Spelling**
- Fixes grammatical errors
- Corrects spelling mistakes
- Improves sentence structure

**Tone Analysis**
- Ensures professional tone
- Checks consistency
- Suggests improvements

**Clarity Enhancement**
- Simplifies complex sentences
- Improves readability
- Removes ambiguity

**Impact Optimization**
- Strengthens action verbs
- Quantifies achievements
- Highlights results

**How to Use:**
1. Paste your document text
2. Select analysis type (grammar, tone, clarity, impact)
3. Click "Analyze"
4. Review suggestions
5. Apply changes
6. Re-check until perfect

---

### Step 7: Export Application Package

Export all documents in your preferred format:

**Export Options:**

**1. Individual Documents**
- Click "Export" button in preview panel
- Select format:
  - PDF (recommended for applications)
  - DOCX (for editing in Word)
  - TXT (plain text)
  - Print (physical copies)

**2. Application Package (ZIP)**
- Includes all 5 documents
- Organized file naming
- Ready to submit

**Export Quality Settings:**
- Standard (fast, smaller file)
- High (better quality)
- Print (300 DPI, best for printing)

**File Naming Convention:**
```
FirstName_LastName_Resume.pdf
FirstName_LastName_CoverLetter.pdf
FirstName_LastName_Bio.pdf
FirstName_LastName_BrandStatement.pdf
FirstName_LastName_InquiryLetter.pdf
```

---

### Step 8: Track Applications

Navigate to Application Tracker to manage your job search:

**Access Tracker:**
- Click "Tracker" in the navigation menu
- Or visit `http://localhost:3101/test-tracker.html`

**Track Application Status:**

**Application Stages:**
1. Wishlist - Jobs you're interested in
2. Applied - Submitted applications
3. Phone Screen - Initial phone interviews
4. Interview - In-person or video interviews
5. Offer - Job offers received
6. Rejected - Unsuccessful applications

**Features:**
- Kanban board view
- Application details (company, position, date, status)
- Notes and follow-up reminders
- Application history
- Statistics and analytics

**How to Use:**
1. Click "Add Application"
2. Enter job details
3. Drag cards between stages as status changes
4. Add notes for each application
5. Review statistics to track progress

---

## Feature Guide

### Resume Analysis

**What it analyzes:**
- Skills match vs job requirements
- Experience relevance
- Education requirements
- Technical skills
- Soft skills
- Keywords and phrases
- ATS compatibility
- Formatting and structure

**How to interpret results:**

**Match Score:**
- 90-100: Excellent match, apply immediately
- 75-89: Strong match, minor improvements needed
- 60-74: Good match, moderate improvements needed
- Below 60: Significant gaps, consider if worth applying

**ATS Score:**
- 90-100: Will pass ATS filters easily
- 75-89: Likely to pass ATS filters
- 60-74: May have ATS issues, fix formatting
- Below 60: Will likely be filtered out by ATS

### Preview System

**View Modes:**
- **Split View**: Editor and preview side-by-side
- **Preview Only**: Full-screen preview
- **Editor Only**: Focus on editing
- **Print Preview**: See how it will print

**Page Sizes:**
- **A4**: International standard (210mm × 297mm)
- **US Letter**: US standard (8.5" × 11")

**Controls:**
- Zoom in/out
- Page count
- Real-time updates
- Resizable panels

### Version Management

Keep track of resume versions for different jobs:

**Access Versions:**
- Click "Versions" in navigation menu
- Or visit `http://localhost:3101/versions.html`

**Features:**
- Save multiple resume versions
- Compare versions side-by-side
- Restore previous versions
- Name versions (e.g., "Software Engineer - Google")
- Export specific versions

### LinkedIn Integration

Search and analyze job postings directly:

**Access LinkedIn Search:**
- Click "LinkedIn Jobs" in navigation menu
- Or visit `http://localhost:3101/linkedin-integration.html`

**Search Features:**
- Keyword search
- Location filter
- Date posted filter
- Experience level filter
- Job type (full-time, contract, etc.)
- Remote/hybrid/onsite filter

**Results:**
- Job listings with details
- Direct links to applications
- One-click job import for analysis

### Analytics Dashboard

Track your optimization progress:

**Access Analytics:**
- Click "Analytics" in navigation menu
- Or visit `http://localhost:3101/analytics-dashboard.html`

**Metrics:**
- Resume score over time
- ATS compatibility trends
- Skills coverage
- Application success rate
- Response rates

**Visualizations:**
- Line charts (progress over time)
- Bar charts (skill comparisons)
- Pie charts (application status breakdown)
- Heatmaps (keyword density)

### Benchmarking

Compare your resume against industry standards:

**Access Benchmarking:**
- Click "Benchmark" in navigation menu
- Or visit `http://localhost:3101/benchmarking.html`

**Comparisons:**
- Your score vs average
- Skills coverage vs industry standard
- Experience level expectations
- Education requirements
- Certification importance

---

## Tips for Best Results

### Resume Writing Best Practices

**1. Use Action Verbs**
Start bullet points with strong action verbs:
- ✅ "Developed web application serving 10K+ users"
- ❌ "Responsible for web development"

**2. Quantify Achievements**
Include numbers, percentages, and metrics:
- ✅ "Increased sales by 35% through targeted campaigns"
- ❌ "Increased sales significantly"

**3. Tailor for Each Job**
Customize your resume for each application:
- Match keywords from job description
- Emphasize relevant experience
- Highlight required skills
- Adjust order of sections based on requirements

**4. Keep It Concise**
- 1 page for <10 years experience
- 2 pages for 10+ years experience
- Use bullet points, not paragraphs
- Remove outdated or irrelevant information

**5. Use Standard Section Headers**
ATS systems look for specific headers:
- ✅ "Work Experience" or "Professional Experience"
- ❌ "My Career Journey"
- ✅ "Education"
- ❌ "Academic Background"

**6. Avoid Graphics and Tables**
ATS systems can't parse these well:
- ❌ Skill bars/ratings
- ❌ Complex tables
- ❌ Text in images
- ✅ Clean, text-based formatting
- ✅ Simple bullet points

**7. Use Standard Fonts**
Stick to ATS-friendly fonts:
- ✅ Arial, Calibri, Times New Roman, Georgia
- ❌ Decorative or script fonts

**8. Include Keywords**
Use exact keywords from job description:
- Job title variants
- Required skills
- Technical tools
- Certifications
- Industry terms

### Cover Letter Best Practices

**1. Customize for Each Job**
Never use a generic cover letter:
- Address hiring manager by name (if possible)
- Reference specific job title and company
- Mention company values or recent news
- Explain why you want THIS job at THIS company

**2. Tell a Story**
Connect your experience to their needs:
- Opening: Hook that grabs attention
- Body: 2-3 specific examples of relevant achievements
- Closing: Call to action and enthusiasm

**3. Show Personality**
Professional doesn't mean boring:
- Let your authentic voice come through
- Show enthusiasm for the role
- Demonstrate culture fit
- Be confident but not arrogant

**4. Keep It Brief**
- Maximum 1 page
- 3-4 paragraphs
- Skip obvious information from resume
- Focus on "why" not "what"

### Job Description Analysis Tips

**1. Read Carefully**
- Note required vs preferred qualifications
- Identify deal-breakers
- Look for culture clues
- Check for red flags (unrealistic requirements, vague descriptions)

**2. Identify Keywords**
- Circle all skills mentioned
- Note repeated phrases
- Highlight technical requirements
- Find industry jargon

**3. Understand Priorities**
Items listed first are usually most important:
- First 3 requirements are critical
- "Nice to have" items are truly optional
- "Preferred" often means "required for top candidates"

### API Usage Optimization

**1. Be Specific**
More detailed input = better output:
- Include full resume text
- Provide complete job description
- Add context in prompts

**2. Review and Refine**
AI suggestions are starting points:
- Always review generated content
- Customize to your voice
- Verify accuracy
- Add personal touches

**3. Iterate**
Don't expect perfection on first try:
- Analyze multiple times if needed
- Try different approaches
- Refine based on results
- Learn what works best for you

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Resume file won't upload

**Possible Causes:**
- File is too large (>10MB)
- Unsupported file format
- Corrupted file
- Network error

**Solutions:**
1. Check file size (should be under 10MB)
2. Convert to supported format (PDF, DOCX, DOC, TXT)
3. Try copying and pasting text instead
4. Check internet connection
5. Refresh page and try again

#### Issue: Job URL import fails

**Possible Causes:**
- URL requires login
- Website blocking automated access
- Network issues
- Unsupported job board

**Solutions:**
1. Try opening URL in incognito/private window
2. Copy and paste job description text manually
3. Check if URL is from supported job board
4. Wait a few minutes and try again (rate limiting)

#### Issue: Analysis returns error

**Possible Causes:**
- Invalid API key
- API rate limiting
- Network issues
- Server error

**Solutions:**
1. Verify API key is correct (starts with `sk-ant-`)
2. Check API key has available credits
3. Wait 60 seconds and retry (rate limiting)
4. Check server logs for detailed error
5. Try with shorter input text

#### Issue: API key not working

**Possible Causes:**
- Incorrect key format
- Expired key
- No credits remaining
- Key not active

**Solutions:**
1. Get new key from [Anthropic Console](https://console.anthropic.com/)
2. Verify key format: `sk-ant-api03-...`
3. Check account billing status
4. Ensure key permissions are correct
5. Try server-side key (configure in `secrets.env`)

#### Issue: Export fails

**Possible Causes:**
- Browser compatibility
- Missing required libraries
- Large file size
- Popup blocker

**Solutions:**
1. Try different export format (PDF vs DOCX)
2. Disable popup blocker temporarily
3. Update browser to latest version
4. Clear browser cache
5. Try in different browser

#### Issue: Preview not showing

**Possible Causes:**
- JavaScript error
- Missing resume data
- Browser compatibility
- Console errors

**Solutions:**
1. Check browser console for errors (F12)
2. Refresh page and try again
3. Clear browser cache
4. Ensure resume text is not empty
5. Try different browser

#### Issue: localStorage full

**Possible Causes:**
- Too much data stored
- Browser quota exceeded
- Multiple resume versions saved

**Solutions:**
1. Clear old application data
2. Delete unused resume versions
3. Clear browser localStorage manually
4. Use export feature and save files locally
5. Reduce saved data by exporting to files

#### Issue: Slow performance

**Possible Causes:**
- Large resume files
- Too many concurrent requests
- Browser resource constraints
- Network latency

**Solutions:**
1. Close unnecessary browser tabs
2. Clear browser cache
3. Use smaller input text
4. Wait for one operation to complete before starting another
5. Restart browser

#### Issue: Text extraction incorrect

**Possible Causes:**
- Complex PDF formatting
- Scanned documents (images)
- Unusual fonts or layout
- Corrupted file

**Solutions:**
1. Try AI-powered extraction (slower but more accurate)
2. Use DOCX format instead of PDF
3. Manually copy and paste text
4. Convert PDF to text using external tool first
5. Recreate document in simpler format

### Error Messages Explained

**"No API key available"**
- You need to enter a Claude API key or configure server-side key
- Get key from: https://console.anthropic.com/

**"Too many requests"**
- Rate limit reached (10 requests per minute)
- Wait 60 seconds before trying again

**"Failed to parse resume"**
- File format not supported or corrupted
- Try different format or manual text input

**"Network error"**
- Check internet connection
- Verify server is running
- Check firewall settings

**"Invalid file type"**
- Only PDF, DOCX, DOC, and TXT are supported
- Convert file to supported format

**"File size exceeds limit"**
- Maximum file size is 10MB
- Reduce file size or extract text manually

**"Could not extract job content from URL"**
- Job board requires login
- Copy and paste job description manually

### Getting Help

**Check Logs:**
```bash
# View server logs
npm start

# Check browser console
Press F12 → Console tab
```

**Report Issues:**
- GitHub Issues: https://github.com/ry-ops/ResuMate/issues
- Include error messages
- Provide steps to reproduce
- Mention browser and OS version

**Community Support:**
- GitHub Discussions
- Stack Overflow (tag: resumate)

---

## FAQ

### General Questions

**Q: Is my data stored on your servers?**
A: No. All data is processed client-side or temporarily on your local server. API keys and resume data are stored only in your browser's localStorage.

**Q: How much does it cost?**
A: ResuMate is free and open-source. You only pay for Claude API usage (pay-as-you-go, typically $0.01-0.05 per resume analysis).

**Q: Can I use this offline?**
A: Partially. The UI works offline, but AI features require internet connection to Claude API.

**Q: How long does analysis take?**
A: Typically 10-30 seconds depending on resume length and API response time.

**Q: Can I use my own AI model?**
A: Currently only Claude AI is supported. Other models may be added in future updates.

**Q: Is this ATS-proof?**
A: ResuMate optimizes for ATS compatibility, but no tool can guarantee ATS passage. Follow recommendations and test with ATS scanners.

### Privacy & Security

**Q: Is my resume data private?**
A: Yes. Data is stored locally in your browser. Server-side processing is temporary and not logged.

**Q: Can I use this for client resumes?**
A: Yes, but inform clients that data is processed through Claude API. Review Anthropic's privacy policy.

**Q: Where is my API key stored?**
A: In your browser's localStorage (local only) or server's `.env` file (if configured).

**Q: Can someone steal my API key?**
A: Not easily. Keys are stored client-side only. Don't share your browser storage or `.env` files.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest 2 versions).

**Q: Can I self-host this?**
A: Yes! Clone the repo and run `npm start`. It's fully self-contained.

**Q: Does this work on mobile?**
A: Basic functionality works, but experience is optimized for desktop.

**Q: Can I customize the templates?**
A: Yes! Edit template files in `/templates` directory.

**Q: How do I update to the latest version?**
A: Pull latest changes from GitHub:
```bash
git pull origin main
npm install
npm start
```

**Q: Can I contribute to the project?**
A: Yes! Pull requests welcome. See CONTRIBUTING.md (if available).

### Resume Optimization

**Q: Should I have one resume or multiple versions?**
A: Multiple versions! Tailor each resume to specific job types or industries. Use the version management feature.

**Q: How often should I update my resume?**
A: After every significant achievement, new skill, or job change. Minimum every 6 months.

**Q: Should I include a photo on my resume?**
A: In the US: No (discrimination concerns). In Europe/Asia: Often expected. Check local norms.

**Q: How far back should employment history go?**
A: 10-15 years maximum. Older experience can be summarized or omitted unless highly relevant.

**Q: Should I include GPA?**
A: Only if:
- You're a recent graduate (< 2 years)
- Your GPA is above 3.5
- The job specifically requests it

**Q: What about references?**
A: Don't include on resume. Have separate reference list ready when requested.

### Cover Letters

**Q: Are cover letters still necessary?**
A: Yes, for most applications. Skip only if explicitly marked optional.

**Q: Should I address it "To Whom It May Concern"?**
A: Avoid if possible. Research to find hiring manager's name. "Dear Hiring Manager" is better than "To Whom It May Concern."

**Q: Can I reuse cover letters?**
A: Never completely. Customize at minimum:
- Company name
- Position title
- Specific job requirements
- Why you want to work there

**Q: How formal should it be?**
A: Match company culture:
- Corporate/finance: Formal
- Tech startup: Professional but conversational
- Creative agencies: Show personality
- Government: Very formal

### Job Search Strategy

**Q: How many jobs should I apply to per week?**
A: Quality > quantity. 5-10 highly targeted applications with customized materials beats 50 generic applications.

**Q: When should I follow up?**
A: Wait 1-2 weeks after applying. Follow up once only unless they respond.

**Q: Should I apply even if I don't meet all requirements?**
A: Yes, if you meet 70%+ of requirements. Job descriptions are often "wish lists."

**Q: How important is the LinkedIn application?**
A: Very. Ensure your LinkedIn profile matches and reinforces your resume. Many recruiters check both.

**Q: Should I apply directly or through recruiters?**
A: Both! Apply directly when possible, but work with recruiters too. More channels = more opportunities.

---

## Additional Resources

### Recommended Reading
- "The 2-Hour Job Search" by Steve Dalton
- "Knock 'em Dead Resumes" by Martin Yate
- "What Color Is Your Parachute?" by Richard N. Bolles

### Useful Tools
- **ATS Scanners**: Jobscan, Resume Worded
- **LinkedIn**: Profile optimization, job search
- **Glassdoor**: Company reviews, salary data
- **Grammarly**: Additional proofreading
- **Canva**: Visual resume templates (use sparingly)

### Job Search Resources
- LinkedIn Jobs
- Indeed
- Glassdoor
- ZipRecruiter
- Company career pages (apply directly)
- Industry-specific job boards

### Career Coaching
Consider professional help for:
- Career transitions
- Executive-level positions
- Persistent rejections
- Interview preparation
- Salary negotiation

---

## Updates and Changelog

**Current Version**: 2.0.0

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

**Stay Updated:**
- Watch GitHub repo for updates
- Check for new features regularly
- Follow update announcements

---

## Feedback and Support

**Found a bug?** Report it on [GitHub Issues](https://github.com/ry-ops/ResuMate/issues)

**Have a suggestion?** Open a feature request on GitHub

**Love ResuMate?** Star the repo and share with others!

---

**Good luck with your job search! 🚀**

Remember: ResuMate is a tool to enhance your application, but your skills, experience, and personality are what truly matter. Use AI as an assistant, not a replacement for your authentic self.
