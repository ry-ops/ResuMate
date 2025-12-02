# Wave 3 Implementation Tasks

## Worker 12: Cover Letter Writer (resumate-coverletter-writer)

### Objective
Implement AI-powered cover letter generation with multiple modes, customization options, and professional structure.

### Task Details
Implement cover letter system in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Cover Letter Generator**
   - Create `js/coverletter/generator.js`
   - Create `js/coverletter/prompts.js`
   - AI-powered generation using Claude API

2. **Generation Modes**
   - **From Scratch**: Job description + resume analysis
   - **Template-Based**: Fill in the blanks
   - **Rewrite Existing**: Improve/tailor existing letter

3. **Customization Options**
   - **Tone**: Professional / Conversational / Enthusiastic
   - **Length**: Brief (150 words) / Standard (250) / Detailed (400)
   - **Focus**: Skills / Experience / Culture Fit / Unique Story
   - **Opening Style**: Traditional / Hook / Achievement Lead

4. **Structure Components**
   - Opening paragraph (hook + position + source)
   - Body 1 (relevant experience match)
   - Body 2 (skills + achievements)
   - Body 3 (company interest + culture fit)
   - Closing (call to action + availability)

5. **AI Prompts to Create**
```javascript
generateCoverLetter: `
Generate a professional cover letter based on:

Job Title: {jobTitle}
Company: {companyName}
Job Description: {jobDescription}
Resume Summary: {resumeSummary}

Customization:
- Tone: {tone} (professional/conversational/enthusiastic)
- Length: {length} words (150/250/400)
- Focus: {focus} (skills/experience/culture-fit/story)
- Opening Style: {openingStyle}

Structure:
1. Opening: Hook + position mention + how you found it
2. Body 1: Most relevant experience matching job requirements
3. Body 2: Key skills and achievements with metrics
4. Body 3: Why this company/role interests you
5. Closing: Call to action + availability

Requirements:
- Specific to this job, not generic
- Include concrete examples
- Show enthusiasm without being over-the-top
- Professional yet personable
- No clichés or buzzwords
`,

rewriteCoverLetter: `
Improve this cover letter for the target job:

Current Cover Letter:
{currentLetter}

Job Description:
{jobDescription}

Improvements needed:
- Make more specific to the role
- Add concrete examples and metrics
- Improve opening hook
- Strengthen closing
- Maintain {tone} tone
- Target length: {length} words

Provide the rewritten version.
`,

tailorCoverLetter: `
Tailor this cover letter for a different job:

Original Cover Letter:
{originalLetter}

New Job Description:
{newJobDescription}

Adjustments:
- Update company name and role
- Modify examples to match new requirements
- Adjust skills emphasis
- Maintain structure and tone
- Keep length similar
`
```

6. **UI Components**
   - Cover letter editor (rich text)
   - Generation options panel
   - Preview pane
   - Save/export buttons

### Files to Create
```
js/coverletter/
├── generator.js (main generator)
├── prompts.js (Claude prompts)
├── editor.js (UI controller)
└── structure.js (letter structure utils)

css/
└── coverletter.css (styling)
```

### Acceptance Criteria
- [ ] Generate cover letters from scratch
- [ ] Template-based generation working
- [ ] Rewrite existing letters
- [ ] All customization options functional (tone, length, focus, opening)
- [ ] Letter structure follows best practices
- [ ] Preview updates in real-time
- [ ] Export to TXT, PDF, DOCX

---

## Worker 13: Cover Letter Templates (resumate-coverletter-templates)

### Objective
Create 8 professional cover letter templates for different career situations and industries.

### Task Details
Implement cover letter templates in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Template Engine**
   - Create `js/coverletter/templates.js`
   - Template registry with metadata
   - Fill-in-the-blank functionality
   - Variable substitution

2. **8 Cover Letter Templates to Create**

**Template 1: Traditional Professional**
- Conservative, formal tone
- Standard structure
- Best for: Corporate, Finance, Legal
- Variables: name, company, role, experience highlights

**Template 2: Modern Conversational**
- Friendly but professional
- Personal storytelling
- Best for: Startups, Tech, Creative
- Variables: name, company, role, unique value prop

**Template 3: Career Changer**
- Addresses career transition
- Emphasizes transferable skills
- Best for: Career pivots
- Variables: previous industry, new industry, transferable skills

**Template 4: Entry Level / New Grad**
- Emphasizes education and potential
- Highlights internships/projects
- Best for: Recent graduates
- Variables: school, degree, relevant coursework, projects

**Template 5: Executive / Senior**
- Leadership focus
- Strategic thinking
- Best for: C-suite, VP, Director
- Variables: years of experience, leadership achievements, strategic vision

**Template 6: Creative Industry**
- Personality-driven
- Unique voice
- Best for: Design, Marketing, Media
- Variables: creative projects, portfolio link, unique approach

**Template 7: Technical / Engineering**
- Technical expertise focus
- Problem-solving emphasis
- Best for: Engineers, Data Scientists, IT
- Variables: technical skills, projects, technical achievements

**Template 8: Referral / Networking**
- Mentions referral/connection
- Warm introduction
- Best for: Network-based applications
- Variables: referral name, connection context, mutual interest

3. **Template Structure**
```javascript
const templateSchema = {
  id: 'string',
  name: 'string',
  category: 'traditional|modern|specialized',
  industry: 'string[]',
  careerLevel: 'entry|mid|senior|executive',
  tone: 'professional|conversational|enthusiastic',
  structure: {
    opening: 'string (with {variables})',
    body1: 'string',
    body2: 'string',
    body3: 'string (optional)',
    closing: 'string'
  },
  variables: ['name', 'company', 'role', ...],
  tips: 'string',
  example: 'string (filled example)'
};
```

4. **Template HTML Files**
   - Create `templates/cover-letters/` directory
   - One HTML file per template
   - Variable placeholders: {{variable_name}}
   - Styling with inline CSS

### Files to Create
```
js/coverletter/
└── templates.js (template engine)

templates/cover-letters/
├── traditional.html
├── modern.html
├── career-changer.html
├── entry-level.html
├── executive.html
├── creative.html
├── technical.html
└── referral.html

css/
└── coverletter-templates.css
```

### Acceptance Criteria
- [ ] All 8 templates created
- [ ] Templates categorized correctly
- [ ] Variable substitution working
- [ ] Fill-in-the-blank UI functional
- [ ] Template selection UI intuitive
- [ ] Preview shows filled template
- [ ] Export preserves formatting

---

## Worker 14: Version Management (resumate-version-manager)

### Objective
Implement comprehensive resume version management system for tracking base resumes, tailored versions, and change history.

### Task Details
Implement version management in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Version Schema**
```javascript
const versionSchema = {
  id: 'uuid',
  type: 'base|tailored',
  name: 'string',
  baseResumeId: 'uuid', // parent resume (if tailored)

  // Resume data
  resumeData: {}, // full resume JSON
  templateId: 'string',
  customization: {},

  // Job context (for tailored versions)
  targetCompany: 'string',
  targetRole: 'string',
  jobDescription: 'string',
  jobUrl: 'string',

  // Tracking
  status: 'draft|applied|interviewing|rejected|offer|accepted',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  appliedAt: 'timestamp',

  // Changes
  tailoringChanges: [], // diff from base
  notes: 'string',

  // Associated documents
  coverLetterId: 'uuid',

  // Metadata
  tags: ['string'],
  favorite: 'boolean',
  archived: 'boolean'
};
```

2. **Version Manager**
   - Create `js/versions/manager.js`
   - CRUD operations (create, read, update, delete)
   - Version tree navigation
   - localStorage persistence

3. **Key Features**

**Create Versions:**
- Create base resume
- Create tailored version from base
- Clone existing version
- Import from file

**Manage Versions:**
- List all versions (grouped by base)
- Search/filter versions
- Sort by date, status, company
- Tag management
- Archive old versions

**Compare Versions:**
- Side-by-side comparison
- Diff highlighting
- Change summary
- Merge changes back to base

**Track Applications:**
- Update status (draft → applied → interviewing → offer)
- Add notes and feedback
- Set reminders
- Link to job posting

4. **Comparison Engine**
   - Create `js/versions/diff.js`
   - Text-level diff
   - Section-level diff
   - Visual highlighting
   - Change statistics

5. **Merge Engine**
   - Create `js/versions/merger.js`
   - Selective merge from tailored to base
   - Conflict resolution
   - Merge preview

6. **UI Components**
   - Version list (tree view)
   - Version card (with status, company, date)
   - Comparison view (side-by-side)
   - Status kanban board
   - Quick actions (clone, delete, archive)

### Files to Create
```
js/versions/
├── manager.js (CRUD operations)
├── storage.js (localStorage wrapper)
├── diff.js (comparison engine)
└── merger.js (merge changes)

css/
└── versions.css (version UI)
```

### Acceptance Criteria
- [ ] Create base and tailored versions
- [ ] Version tree navigation working
- [ ] Compare versions side-by-side
- [ ] Clone and modify versions
- [ ] Track application status
- [ ] Merge changes back to base
- [ ] Search and filter functional
- [ ] localStorage persistence working

---

## Worker 15: LinkedIn Integration (resumate-linkedin)

### Objective
Implement LinkedIn profile optimization tools including PDF import, keyword alignment, and headline generation.

### Task Details
Implement LinkedIn features in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **LinkedIn PDF Parser**
   - Create `js/integrations/linkedin-parser.js`
   - Parse LinkedIn PDF export
   - Extract profile sections
   - Map to resume format

2. **LinkedIn Profile Sections**
```javascript
const linkedInSchema = {
  headline: 'string',
  summary: 'string (About section)',
  experience: [
    {
      title: 'string',
      company: 'string',
      location: 'string',
      dates: { start, end },
      description: 'string'
    }
  ],
  education: [],
  skills: ['string'],
  certifications: [],
  projects: [],
  publications: [],
  languages: []
};
```

3. **Profile Optimization**
   - Create `js/integrations/linkedin-optimizer.js`
   - Headline generator (AI-powered)
   - Summary optimizer
   - Skill recommendations
   - Keyword alignment with resume

4. **AI Prompts**
```javascript
generateLinkedInHeadline: `
Generate a LinkedIn headline based on:

Current Role: {currentRole}
Key Skills: {skills}
Target Industry: {industry}
Years of Experience: {yearsExp}

Requirements:
- Maximum 120 characters
- Include role + key skill + value proposition
- Professional but engaging
- SEO-optimized for LinkedIn search
- No buzzwords or clichés

Examples:
- "Senior Software Engineer | Full-Stack Development | Building Scalable Cloud Solutions"
- "Marketing Director | Digital Strategy | Driving 300%+ Revenue Growth"
`,

optimizeLinkedInSummary: `
Optimize this LinkedIn About section:

Current Summary:
{currentSummary}

Resume Summary:
{resumeSummary}

Requirements:
- 3-5 short paragraphs
- First-person voice
- Lead with impact/value proposition
- Include key achievements with metrics
- End with call to action
- Maximum 2,000 characters
- Include relevant keywords: {keywords}
`,

alignLinkedInWithResume: `
Analyze alignment between LinkedIn profile and resume:

LinkedIn Profile:
{linkedInData}

Resume:
{resumeData}

Provide:
1. Keywords missing from LinkedIn
2. Skills to add to LinkedIn
3. Experience descriptions to enhance
4. Headline suggestions
5. Summary improvements
6. Overall consistency score (0-100)
`
```

5. **Profile Scoring**
   - Create `js/integrations/linkedin-scorer.js`
   - Completeness score (0-100)
   - Keyword coverage
   - Profile strength assessment
   - Recommendations

6. **Import/Export**
   - Import from LinkedIn PDF
   - Export resume to LinkedIn format
   - Copy sections to clipboard (LinkedIn-friendly)

### Files to Create
```
js/integrations/
├── linkedin-parser.js (PDF import)
├── linkedin-optimizer.js (optimization tools)
├── linkedin-scorer.js (profile scoring)
└── linkedin-export.js (export utilities)

css/
└── linkedin.css (UI styling)
```

### Acceptance Criteria
- [ ] Parse LinkedIn PDF export
- [ ] Map profile to resume format
- [ ] Generate optimized headlines (5+ options)
- [ ] Optimize profile summary
- [ ] Keyword alignment analysis
- [ ] Profile completeness scoring
- [ ] Export resume in LinkedIn-friendly format
- [ ] Copy sections to clipboard

---

## Worker 16: Application Tracker (resumate-app-tracker)

### Objective
Implement Kanban-style application tracking system with status management, deadline reminders, and analytics dashboard.

### Task Details
Implement application tracker in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Application Schema**
```javascript
const applicationSchema = {
  id: 'uuid',

  // Job details
  company: 'string',
  role: 'string',
  location: 'string',
  jobUrl: 'string',
  jobDescription: 'string',
  salaryRange: { min, max, currency },

  // Documents
  resumeVersionId: 'uuid',
  coverLetterId: 'uuid',

  // Status tracking
  status: 'saved|preparing|applied|phone-screen|interview|final-round|offer|rejected|withdrawn',
  appliedDate: 'timestamp',
  lastUpdated: 'timestamp',

  // Contacts
  contacts: [
    {
      name: 'string',
      title: 'string',
      email: 'string',
      linkedin: 'string',
      notes: 'string'
    }
  ],

  // Timeline
  timeline: [
    {
      date: 'timestamp',
      event: 'string',
      notes: 'string'
    }
  ],

  // Next steps
  nextAction: 'string',
  nextDeadline: 'timestamp',

  // Notes
  notes: 'string',
  interviewNotes: 'string',
  pros: ['string'],
  cons: ['string'],

  // Metadata
  priority: 'low|medium|high',
  favorite: 'boolean',
  archived: 'boolean',
  tags: ['string'],
  source: 'linkedin|indeed|company-website|referral|other'
};
```

2. **Kanban Board**
   - Create `js/tracker/board.js`
   - 9 status columns
   - Drag-and-drop cards
   - Card filtering and search
   - Bulk operations

3. **Kanban Columns**
```javascript
const BOARD_COLUMNS = [
  { id: 'saved', name: 'Saved / Interested', color: '#6b7280' },
  { id: 'preparing', name: 'Preparing Application', color: '#3b82f6' },
  { id: 'applied', name: 'Applied', color: '#8b5cf6' },
  { id: 'phone-screen', name: 'Phone Screen', color: '#ec4899' },
  { id: 'interview', name: 'Interview', color: '#f59e0b' },
  { id: 'final-round', name: 'Final Round', color: '#f97316' },
  { id: 'offer', name: 'Offer', color: '#10b981' },
  { id: 'rejected', name: 'Rejected', color: '#ef4444' },
  { id: 'withdrawn', name: 'Withdrawn', color: '#64748b' }
];
```

4. **Application Card**
   - Company logo (favicon)
   - Role title
   - Location
   - Applied date
   - Days since last update
   - Status indicator
   - Quick actions (view, edit, move, archive)
   - Priority badge

5. **Analytics Dashboard**
   - Create `js/tracker/analytics.js`
   - Total applications by status
   - Response rate
   - Average time in each stage
   - Success rate
   - Monthly trends
   - Charts and visualizations

6. **Statistics**
```javascript
const statistics = {
  total: 'number',
  byStatus: { saved: 0, preparing: 0, applied: 0, ... },
  responseRate: 'percentage',
  interviewRate: 'percentage',
  offerRate: 'percentage',
  averageTimeToResponse: 'days',
  averageTimeToOffer: 'days',
  monthlyTrends: [{ month, applied, offers, rejections }],
  topSources: [{ source, count }],
  successRate: 'percentage'
};
```

7. **Deadline Reminders**
   - Upcoming deadlines list
   - Overdue tasks highlighting
   - Email reminder export (iCal format)
   - localStorage-based notifications

8. **Export Options**
   - Export to CSV
   - Export to JSON
   - Export to Excel-compatible format
   - Print application list

### Files to Create
```
js/tracker/
├── board.js (Kanban controller)
├── analytics.js (statistics and charts)
├── storage.js (localStorage wrapper)
└── export.js (CSV/JSON export)

css/
└── tracker.css (Kanban board styles)
```

### Acceptance Criteria
- [ ] Kanban board with 9 columns working
- [ ] Drag-and-drop status updates functional
- [ ] Application cards display all key info
- [ ] Search and filter working
- [ ] Analytics dashboard showing statistics
- [ ] Deadline reminders visible
- [ ] Export to CSV functional
- [ ] localStorage persistence working

---

## Coordination Notes

### Dependencies

**Wave 3 Dependencies:**
- Worker 12 (Cover Letter Writer) → No dependencies (uses existing AI infrastructure)
- Worker 13 (Cover Letter Templates) → No dependencies
- Worker 14 (Version Manager) → No dependencies
- Worker 15 (LinkedIn) → Depends on Parser (Worker 6, complete)
- Worker 16 (Tracker) → Depends on Version Manager (Worker 14)

**Launch Strategy:**
- Workers 12, 13, 14, 15 can start immediately in parallel
- Worker 16 should wait for Worker 14 to complete, OR can start and wait for version schema

### Testing
- Each worker creates test page
- Integration testing after all complete
- Use existing resumes and job data

### Working Directory
All work in: `/Users/ryandahlberg/Projects/cortex/ResuMate/`

### Server Port
ResuMate running on port **3101**

---

## Wave 3 Success Metrics

### Deliverables
- AI-powered cover letter generator (3 modes)
- 8 professional cover letter templates
- Complete version management system
- LinkedIn profile optimization tools
- Full-featured application tracker

### Quality Targets
- Cover letter quality: professional, specific, engaging
- Version management: intuitive, reliable
- LinkedIn optimization: actionable recommendations
- Application tracker: comprehensive tracking

### Timeline
Wave 3 estimated: 2-3 hours (parallel execution)
