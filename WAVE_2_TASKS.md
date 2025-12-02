# Wave 2 Implementation Tasks

## Worker 7: Advanced Templates (resumate-templates-advanced)

### Objective
Create 3 additional professional resume templates (Executive, Technical, Minimal) with full customization support.

### Task Details
Implement advanced templates in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Template: Executive**
   - Create `css/templates/executive.css`
   - Premium, understated elegance
   - Single-column with subtle visual hierarchy
   - Serif typography (Garamond, Georgia fallback)
   - Muted color palette (navy, charcoal, gold accents)
   - Wide margins, generous whitespace
   - Best for: C-suite, VP, Director roles
   - ATS Score target: 90-95/100

2. **Template: Technical**
   - Create `css/templates/technical.css`
   - Code-inspired design
   - Monospace font accents (JetBrains Mono, Courier New)
   - Syntax highlighting-inspired colors
   - Compact, information-dense layout
   - Perfect for: Software Engineers, DevOps, Data Scientists
   - ATS Score target: 85-90/100

3. **Template: Minimal**
   - Create `css/templates/minimal.css`
   - Typography-focused, lots of whitespace
   - Ultra-clean layout
   - Light weight fonts (Lato, Open Sans)
   - Subtle dividers, minimal color
   - Best for: Designers, Writers, Consultants
   - ATS Score target: 95-100/100

4. **Update Template Registry**
   - Add 3 new templates to `js/templates/registry.js`
   - Include full metadata (ATS scores, categories, use cases)
   - Generate preview thumbnails (placeholder SVGs)

5. **Print Optimization**
   - Enhance `css/templates/print.css`
   - Page break optimization for all 6 templates
   - Orphan/widow prevention
   - Footer with page numbers

### Files to Create/Update
```
css/templates/
├── executive.css (NEW)
├── technical.css (NEW)
├── minimal.css (NEW)
└── print.css (ENHANCE)

js/templates/
└── registry.js (UPDATE - add 3 templates)
```

### Acceptance Criteria
- [ ] All 3 templates created and styled
- [ ] Templates registered in registry.js
- [ ] ATS scores meet targets
- [ ] Print optimization works across all 6 templates
- [ ] Templates switch dynamically
- [ ] Support A4 and US Letter

---

## Worker 8: Job Tailoring Engine (resumate-job-tailor)

### Objective
Implement one-click job tailoring feature that analyzes job descriptions and suggests specific resume changes.

### Task Details
Implement tailoring engine in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Job Description Parser**
   - Create `js/ai/job-parser.js`
   - Extract key requirements, skills, keywords
   - Identify required vs. preferred qualifications
   - Parse company culture indicators
   - Extract technology stack mentioned

2. **Resume-to-Job Mapper**
   - Create `js/ai/mapper.js`
   - Map resume content to job requirements
   - Calculate keyword match percentage
   - Identify missing keywords
   - Suggest natural insertion points

3. **Tailoring Engine**
   - Create `js/ai/tailor.js`
   - Generate specific change suggestions
   - Provide diff preview (before/after)
   - Support selective application
   - Track base resume vs. tailored versions

4. **Diff Viewer UI**
   - Create `js/ai/diff-viewer.js`
   - Create `css/diff.css`
   - Side-by-side comparison view
   - Highlighted changes (green additions, red removals)
   - Individual toggle switches
   - "Apply All" button

5. **Version Tracking**
   - Enhance state management
   - Track base resume
   - Store tailored versions
   - Link versions to job descriptions

### Claude API Prompts to Add
```javascript
extractJobRequirements: `
Analyze this job description and extract:
1. Required hard skills (MUST have)
2. Preferred hard skills (nice to have)
3. Required experience level
4. Soft skills mentioned or implied
5. Key responsibilities
6. Company culture indicators
7. Technical tools/frameworks mentioned
8. Certifications mentioned

Job Description: {jobDescription}

Return as structured JSON.
`,

tailorResume: `
Analyze the resume against this job description and provide specific changes:

Resume: {resumeContent}
Job Description: {jobDescription}

Provide:
1. Keywords to add/emphasize (with suggested locations)
2. Specific bullet points to rewrite (provide rewrites)
3. Skills to highlight or add
4. Sections to reorder (with reasoning)
5. Content to de-emphasize or remove
6. New bullet points to add based on job requirements

Return as structured JSON with before/after for each suggestion.
`
```

### Files to Create
```
js/ai/
├── job-parser.js
├── mapper.js
├── tailor.js
└── diff-viewer.js

css/
└── diff.css
```

### Acceptance Criteria
- [ ] Job description parsing extracts key info
- [ ] Resume-to-job mapping calculates match %
- [ ] Tailoring generates specific suggestions
- [ ] Diff viewer shows before/after changes
- [ ] Changes can be applied selectively or all at once
- [ ] Base resume vs. tailored versions tracked

---

## Worker 9: AI Proofreading Suite (resumate-ai-proofread)

### Objective
Implement comprehensive AI-powered proofreading with grammar, tone analysis, cliché detection, and consistency checks.

### Task Details
Implement proofreading suite in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Proofreading Engine**
   - Create `js/ai/proofread.js`
   - Grammar and spelling check
   - Passive voice identification
   - Weak verb detection
   - Sentence length analysis
   - Readability scoring (Flesch-Kincaid)

2. **Cliché Detector**
   - Built-in cliché database
   - Pattern matching for common phrases
   - Suggest alternatives
   - Examples: "team player", "go-getter", "results-oriented"

3. **Tone Analyzer**
   - Create `js/ai/tone-analyzer.js`
   - Analyze overall tone (professional, creative, technical)
   - Detect tone inconsistencies
   - Suggest tone adjustments
   - Industry-specific tone recommendations

4. **Consistency Checker**
   - Create `js/ai/consistency.js`
   - Tense consistency (past for old jobs, present for current)
   - Date format consistency
   - Formatting consistency (bullets, spacing)
   - Punctuation consistency

5. **Polish Score Calculator**
   - Overall "polish score" (0-100)
   - Breakdown by category
   - Specific improvement suggestions
   - Track score over time

6. **Inline Annotations UI**
   - Visual indicators for issues
   - Tooltips with suggestions
   - One-click fix options
   - Ignore/add to dictionary

### Claude API Prompts to Add
```javascript
proofreadContent: `
Proofread this resume content and identify:
1. Grammar and spelling errors
2. Passive voice usage
3. Weak or overused verbs
4. Clichés and buzzwords
5. Sentence length issues (too long/short)
6. Punctuation errors
7. Consistency issues

Content: {content}

For each issue found, provide:
- Type of issue
- Location (approximate)
- Suggested fix
- Explanation

Return as structured JSON.
`,

analyzeTone: `
Analyze the tone of this resume content:

Content: {content}
Target Industry: {industry}
Target Role: {role}

Provide:
1. Overall tone assessment (professional/creative/technical)
2. Tone consistency score (0-100)
3. Industry appropriateness
4. Specific phrases that affect tone
5. Suggestions for improvement

Return as JSON.
`
```

### Files to Create
```
js/ai/
├── proofread.js
├── tone-analyzer.js
└── consistency.js

css/
└── proofread.css (annotation styles)
```

### Acceptance Criteria
- [ ] Grammar and spelling errors detected
- [ ] Clichés identified with alternatives
- [ ] Passive voice flagged
- [ ] Weak verbs highlighted
- [ ] Tone analyzed and scored
- [ ] Consistency issues found
- [ ] Polish score calculated (0-100)
- [ ] One-click fixes available

---

## Worker 10: Advanced ATS Scanner (resumate-ats-scanner-v2)

### Objective
Enhance existing ATS scanner with 30+ comprehensive checks and advanced scoring system.

### Task Details
Enhance ATS scanner in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Expand ATS Checks**
   - Enhance `js/analyzer/ats-scanner.js`
   - Create `js/analyzer/checks/formatting.js`
   - Create `js/analyzer/checks/structure.js`
   - Create `js/analyzer/checks/content.js`

2. **30+ ATS Checks**

**Formatting Checks (10):**
- No table-based layouts
- No multi-column layouts (breaks parsing)
- No headers/footers
- No images, charts, icons
- No text boxes or floating elements
- Standard web-safe fonts
- No Unicode bullets
- Consistent date formats
- Recommended file format (PDF/DOCX)
- No background colors

**Structure Checks (10):**
- Standard section headers
- Contact info parseable (email, phone visible)
- Chronological order (reverse)
- Acronyms spelled out first use
- Job titles clear and standard
- Section ordering (contact → summary → experience → education)
- No orphaned content
- Consistent heading hierarchy
- Clear section boundaries
- No merged cells or complex tables

**Content Checks (10):**
- Keyword density analysis
- Dedicated skills section exists
- Quantified achievements present
- No personal pronouns (I, me, my)
- Bullet points start with action verbs
- Appropriate length (1-2 pages)
- No typos or grammar errors
- Industry-specific keywords present
- Proper noun capitalization
- No excessive jargon

3. **Advanced Scoring System**
   - Create `js/analyzer/scorer.js`
   - 5-category weighted scoring
   - Letter grade assignment (A-F)
   - Score breakdown visualization
   - Historical score tracking

**Scoring Categories:**
```javascript
{
  atsCompatibility: { weight: 25, factors: ['formatting', 'structure', 'parseability'] },
  keywordMatch: { weight: 25, factors: ['hard-skills', 'soft-skills', 'tools', 'certifications'] },
  contentQuality: { weight: 20, factors: ['action-verbs', 'quantification', 'specificity', 'relevance'] },
  formatting: { weight: 15, factors: ['consistency', 'readability', 'length', 'whitespace'] },
  completeness: { weight: 15, factors: ['sections-present', 'contact-info', 'dates', 'details'] }
}
```

4. **Recommendations Engine**
   - Prioritized action items
   - Quick wins vs. major improvements
   - Industry-specific recommendations
   - Estimated impact scores

### Files to Create/Update
```
js/analyzer/
├── ats-scanner.js (ENHANCE)
├── scorer.js (NEW)
├── recommendations.js (NEW)
└── checks/
    ├── formatting.js (NEW)
    ├── structure.js (NEW)
    └── content.js (NEW)

css/
└── scoring.css (visualization)
```

### Acceptance Criteria
- [ ] 30+ ATS checks implemented
- [ ] All checks return pass/fail + explanation
- [ ] 5-category scoring system working
- [ ] Letter grade assigned (A-F)
- [ ] Score breakdown visualized
- [ ] Recommendations prioritized
- [ ] Historical tracking functional

---

## Worker 11: Export Engine (resumate-export-engine)

### Objective
Implement high-quality PDF and DOCX export with template preservation and ATS optimization.

### Task Details
Implement export engine in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **PDF Export**
   - Create `js/export/pdf.js`
   - Use html2pdf.js or jsPDF
   - Maintain exact template styling
   - Proper page breaks
   - Selectable/searchable text
   - Optimized file size
   - Embedded fonts

2. **DOCX Export**
   - Create `js/export/docx.js`
   - Use docx.js library
   - Editable Word format
   - Preserve formatting
   - Template styles maintained
   - ATS-compatible structure

3. **Export Options**
   - Create `js/export/formats.js`
   - PDF (high-quality, ATS-optimized)
   - DOCX (editable)
   - TXT (plain text for copy/paste)
   - JSON (full data backup)
   - HTML (self-contained single file)

4. **Print Optimization**
   - Create `js/export/print.js`
   - Print-ready CSS
   - Page break control
   - Header/footer management
   - Print preview mode

5. **Export UI**
   - Export modal with format selection
   - Quality settings (standard/high)
   - Template preservation toggle
   - Filename customization
   - Download progress indicator

### Libraries to Add
```json
{
  "dependencies": {
    "html2pdf.js": "^0.10.1",
    "docx": "^8.5.0",
    "file-saver": "^2.0.5"
  }
}
```

### Files to Create
```
js/export/
├── pdf.js (NEW)
├── docx.js (NEW)
├── formats.js (NEW)
└── print.js (NEW)

css/
└── export.css (modal styles)
```

### Acceptance Criteria
- [ ] PDF export generates high-quality output
- [ ] DOCX export creates editable Word files
- [ ] TXT export provides plain text
- [ ] JSON export includes full data
- [ ] HTML export is self-contained
- [ ] Template styling preserved in exports
- [ ] Print preview works correctly
- [ ] Page breaks controlled properly
- [ ] File sizes optimized

---

## Coordination Notes

### Dependencies
- **Worker 7** (Templates) → No dependencies, can start immediately
- **Worker 8** (Tailoring) → Depends on AI Writer prompts (Worker 4, complete)
- **Worker 9** (Proofreading) → Depends on AI Writer prompts (Worker 4, complete)
- **Worker 10** (ATS Scanner) → Enhances existing scanner, can start immediately
- **Worker 11** (Export) → Depends on Templates (Worker 3, complete) and Preview (Worker 2, complete)

**All workers can start in parallel** since Wave 1 is complete.

### Testing
- Each worker should test independently
- Integration testing after all workers complete
- Use existing resume samples for testing

### Working Directory
All work in: `/Users/ryandahlberg/Projects/cortex/ResuMate/`

### Server Port
ResuMate running on port **3101**

---

## Wave 2 Success Metrics

### Deliverables
- 3 additional templates (total: 6)
- Job tailoring feature (one-click)
- AI proofreading suite (8+ checks)
- Advanced ATS scanner (30+ checks)
- Export engine (5 formats)

### Quality Targets
- All templates ATS score >85%
- Tailoring match accuracy >80%
- Proofreading detection rate >90%
- ATS checks comprehensive (30+)
- Export quality: print-ready

### Timeline
Wave 2 estimated: 2-3 hours (parallel execution)
