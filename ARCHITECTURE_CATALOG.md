# ResuMate Architecture Catalog

**Generated**: 2025-12-02
**Version**: 0.1.0
**Purpose**: Comprehensive catalog of ResuMate's architecture, pages, and components

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Page Inventory](#page-inventory)
4. [Component Hierarchy](#component-hierarchy)
5. [JavaScript Module Map](#javascript-module-map)
6. [API Endpoints](#api-endpoints)
7. [State Management](#state-management)
8. [AI Features & Claude Integration](#ai-features--claude-integration)
9. [Navigation Structure](#navigation-structure)
10. [Data Flow Diagram](#data-flow-diagram)
11. [Integration Points](#integration-points)

---

## System Overview

ResuMate is a **client-side AI-powered career management platform** with a Node.js/Express backend proxy for Claude API access. The application follows a modular architecture with clear separation of concerns:

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Backend**: Express.js API proxy
- **AI Engine**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Data Storage**: LocalStorage (client-side)
- **Security**: AES-GCM 256-bit encryption, CSP headers, rate limiting

### Key Metrics

- **Total Lines of Code**: 50,679+
- **JavaScript Modules**: 57
- **CSS Files**: 23
- **HTML Pages**: 29 (13 main + 16 test)
- **API Endpoints**: 10
- **Resume Templates**: 6
- **Cover Letter Templates**: 8

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Semantic markup, accessibility |
| CSS3 | - | Styling, animations, responsive design |
| JavaScript (Vanilla) | ES6+ | Application logic, no framework dependencies |
| Chart.js | 4.4.0 | Analytics dashboards, visualizations |
| html2pdf.js | 0.10.1 | PDF export functionality |
| docx.js | 8.5.0 | DOCX export functionality |
| FileSaver.js | 2.0.5 | File download handling |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime environment |
| Express.js | 4.22.1 | HTTP server, API routing |
| cors | 2.8.5 | CORS middleware |
| multer | 2.0.2 | File upload handling |
| pdfjs-dist | 4.10.38 | PDF parsing |
| mammoth | 1.6.0 | DOCX parsing |

### Development Tools

| Tool | Purpose |
|------|---------|
| Jest | Unit testing framework |
| nodemon | Development server with auto-reload |
| ESLint | Code quality and consistency |

---

## Page Inventory

### Main Application Pages (13)

#### 1. **index.html** - Landing Page & Resume Analyzer
- **Path**: `/index.html`
- **Purpose**: Main entry point, resume analysis against job descriptions
- **Features**:
  - Resume text/file input (PDF, DOCX, TXT)
  - Job description import (URL or file)
  - AI-powered analysis with Claude
  - Split-view editor/preview
  - Export functionality
- **Key Scripts**: `app.js`, `js/editor/preview.js`, `js/editor/renderer.js`
- **Dependencies**: Export libraries (html2pdf, docx, FileSaver)

#### 2. **builder.html** - Visual Resume Builder
- **Path**: `/builder.html`
- **Purpose**: Drag-and-drop resume builder with real-time preview
- **Features**:
  - 23 section types (header, summary, experience, education, skills, projects, etc.)
  - Template selector (6 templates)
  - Section reordering via drag-and-drop
  - Auto-save (30-second intervals)
  - Undo/redo (50+ states)
- **Key Scripts**: `js/editor/builder.js`, `js/editor/sections.js`, `js/editor/dragdrop.js`

#### 3. **analytics-dashboard.html** - Analytics Dashboard
- **Path**: `/analytics-dashboard.html`
- **Purpose**: Data visualization and job search analytics
- **Features**:
  - 7 chart types (score progression, funnel, template usage, keyword trends, etc.)
  - Date range filters (7d, 30d, 90d, 1yr, all time)
  - ROI tracking, A/B testing
  - Export reports (PDF, CSV)
- **Key Scripts**: `js/tracker/analytics.js`, `js/tracker/charts.js`, `js/tracker/metrics.js`
- **Dependencies**: Chart.js 4.4.0

#### 4. **benchmarking.html** - Industry Benchmarking
- **Path**: `/benchmarking.html`
- **Purpose**: Compare resume against industry standards
- **Features**:
  - 6 industry sectors (Technology, Finance, Healthcare, etc.)
  - Skills gap analysis
  - Career progression suggestions
  - Salary insights ($45k - $230k range)
  - Competitiveness score (0-100)
- **Key Scripts**: `js/insights/benchmarking.js`, `js/insights/industry-data.js`, `js/insights/skills-gap.js`

#### 5. **linkedin-integration.html** - LinkedIn Integration
- **Path**: `/linkedin-integration.html`
- **Purpose**: LinkedIn profile optimization and job search
- **Features**:
  - Profile import from LinkedIn PDF
  - AI headline generator (120 chars)
  - Profile completeness score
  - LinkedIn-to-resume sync
  - Job search integration
- **Key Scripts**: `js/integrations/linkedin-parser.js`, `js/integrations/linkedin-optimizer.js`

#### 6. **parser-demo.html** - Resume Parser Demo
- **Path**: `/parser-demo.html`
- **Purpose**: Upload and parse existing resumes
- **Features**:
  - PDF/DOCX/TXT file upload
  - AI-powered extraction (87-90% accuracy)
  - Section detection and structuring
  - Export to builder
- **Key Scripts**: `js/resume-parser-client.js`, `js/export/parser.js`

#### 7. **template-test.html** - Template Selector
- **Path**: `/template-test.html`
- **Purpose**: Browse and preview resume templates
- **Features**:
  - 6 professional templates (Classic, Modern, Creative, Executive, Technical, Minimal)
  - ATS compatibility scores (85-100%)
  - Live preview with sample data
  - Template customization options
- **Key Scripts**: `js/templates/registry.js`

#### 8. **versions.html** - Version Management
- **Path**: `/versions.html`
- **Purpose**: Manage multiple resume versions
- **Features**:
  - Base vs. tailored versions
  - Side-by-side diff viewer
  - Selective merge functionality
  - Version linking to job applications
- **Key Scripts**: `js/versions/manager.js`, `js/versions/diff.js`, `js/versions/merger.js`

#### 9-13. **Test Pages** (see below)

### Test/Demo Pages (16)

| Page | Purpose | Key Features |
|------|---------|--------------|
| `test-ai.html` | AI generation testing | 13 generation methods, tone analysis |
| `test-ats-scanner.html` | ATS scanner testing | 30+ checks, 5-category scoring |
| `test-careerdocs.html` | Career documents | Multiple document types |
| `test-coverletter.html` | Cover letter generator | 4 modes, 8 templates, customization |
| `test-export.html` | Export engine testing | 5 formats (PDF, DOCX, TXT, JSON, HTML) |
| `test-job-tailor.html` | Job tailoring | One-click optimization, diff viewer |
| `test-preview.html` | Preview system | Split-view, overlay, print modes |
| `test-proofread.html` | Proofreading suite | 19 patterns, consistency checks |
| `test-templates.html` | Template system | Template rendering, customization |
| `test-tracker.html` | Application tracker | Kanban board, analytics |
| `test-version-management.html` | Version control | Diff, merge, conflict resolution |

### Component Pages (1)

| Component | Purpose | Usage |
|-----------|---------|-------|
| `components/navigation.html` | Unified navigation bar | Loaded dynamically on all pages |

### Template Pages (8)

Cover letter templates in `templates/cover-letters/`:
- `traditional.html` - Formal business letter
- `modern.html` - Contemporary design
- `creative.html` - Creative industries
- `executive.html` - Senior leadership
- `technical.html` - IT/Engineering
- `entry-level.html` - New graduates
- `career-changer.html` - Career transitions
- `referral.html` - Referral-based applications

---

## Component Hierarchy

### Global Components

```
Application Root
├── Navigation Bar (navigation.html)
│   ├── Logo & Branding
│   ├── Main Menu
│   │   ├── Builder (dropdown)
│   │   ├── Tools (dropdown)
│   │   ├── Analytics (dropdown)
│   │   └── Resources (dropdown)
│   ├── Theme Toggle
│   └── Mobile Menu (hamburger)
│
├── Feature Shortcuts (floating button)
│   └── Quick access menu
│
└── Footer
    └── Links & Credits
```

### Page-Specific Components

#### Resume Builder (`builder.html`)
```
Builder Page
├── Sidebar Panel
│   ├── Template Selector
│   ├── Section Library (23 types)
│   └── Customization Options
│
├── Editor Panel
│   ├── Section Containers (draggable)
│   ├── Content Editors (inline editing)
│   └── AI Writer Integration
│
└── Preview Panel
    ├── Real-time rendering
    ├── Page size controls (A4/Letter)
    └── Export toolbar
```

#### Analytics Dashboard (`analytics-dashboard.html`)
```
Analytics Page
├── Filter Bar
│   ├── Date Range Selector
│   └── Category Filters
│
├── Metrics Overview
│   ├── Total Applications
│   ├── Response Rate
│   ├── Average Score
│   └── Success Rate
│
└── Chart Grid
    ├── Score Progression (line chart)
    ├── Application Funnel (funnel chart)
    ├── Template Usage (bar chart)
    ├── Keyword Trends (line chart)
    ├── Success Rates (pie chart)
    ├── Response Times (histogram)
    └── Monthly Trends (area chart)
```

#### Job Tailoring (`test-job-tailor.html`)
```
Tailoring Page
├── Input Section
│   ├── Resume Data
│   └── Job Description
│
├── Analysis Section
│   ├── Match Score (0-100)
│   ├── Keyword Analysis
│   └── Gap Identification
│
├── Suggestions Panel
│   ├── Recommended Changes
│   ├── Keyword Insertions
│   └── Action Items
│
└── Diff Viewer
    ├── Side-by-side comparison
    ├── Highlighted changes
    └── Apply/Reject controls
```

### Shared UI Components

| Component | File | Used By | Purpose |
|-----------|------|---------|---------|
| Modal Dialog | `css/variables.css` | All pages | Generic modal container |
| Notification Toast | `js/utils/notifications.js` | All pages | User feedback messages |
| Loading Spinner | `styles.css` | All pages | Progress indicator |
| Tooltip | `js/utils/tooltips.js` | All pages | Contextual help |
| File Upload | `styles.css` | Multiple | Drag-drop file input |
| Button Group | `styles.css` | Multiple | Action button sets |
| Card Container | `styles.css` | All pages | Content grouping |
| Progress Bar | `css/notifications.css` | Multiple | Task progress |

---

## JavaScript Module Map

### Directory Structure

```
js/
├── state.js                    # Global state management
├── resume-parser-client.js     # Resume parsing client
│
├── ai/                         # AI & Claude integration
│   ├── consistency.js          # Consistency checking
│   ├── diff-viewer.js          # Change visualization
│   ├── generator.js            # Content generation (13 methods)
│   ├── job-parser.js           # Job description parsing
│   ├── mapper.js               # Resume-to-job mapping
│   ├── prompts.js              # AI prompt templates
│   ├── proofread.js            # Proofreading engine
│   ├── proofread-ui.js         # Proofreading UI
│   ├── rewriter.js             # Content rewriting
│   ├── tailor.js               # Job tailoring logic
│   └── tone-analyzer.js        # Tone analysis
│
├── analyzer/                   # ATS & analysis tools
│   ├── ats-scanner.js          # ATS compatibility scanner
│   ├── scorer.js               # Scoring algorithms
│   ├── checks/                 # Check modules
│   │   ├── formatting.js       # Format checks
│   │   ├── structure.js        # Structure validation
│   │   └── content.js          # Content analysis
│   └── recommendations.js      # Improvement suggestions
│
├── careerdocs/                 # Career document management
│   ├── manager.js              # Document manager
│   ├── types.js                # Document types
│   ├── templates.js            # Document templates
│   └── export.js               # Document export
│
├── coverletter/                # Cover letter system
│   ├── generator.js            # Letter generation
│   ├── editor.js               # Letter editor
│   ├── templates.js            # Template manager
│   ├── structure.js            # Letter structure
│   └── prompts.js              # Generation prompts
│
├── editor/                     # Resume builder
│   ├── builder.js              # Main builder controller
│   ├── sections.js             # 23 section types
│   ├── dragdrop.js             # Drag-and-drop system
│   ├── history.js              # Undo/redo (50+ states)
│   ├── autosave.js             # Auto-save (30s interval)
│   ├── preview.js              # Preview controller
│   └── renderer.js             # Resume renderer
│
├── export/                     # Export & parsing
│   ├── export-manager.js       # Export orchestrator
│   ├── parser.js               # Resume parser (87-90% accuracy)
│   ├── pdf-export.js           # PDF generation
│   ├── pdf-parser.js           # PDF text extraction
│   ├── docx-export.js          # DOCX generation
│   ├── docx-parser.js          # DOCX parsing
│   ├── ai-extractor.js         # AI-powered extraction
│   ├── formats.js              # Format definitions
│   └── print.js                # Print optimization
│
├── insights/                   # Industry benchmarking
│   ├── benchmarking.js         # Industry comparison
│   ├── industry-data.js        # 6 sectors, 10+ roles
│   ├── skills-gap.js           # Skills gap analyzer
│   └── recommendations.js      # Career progression
│
├── integrations/               # External integrations
│   ├── linkedin-parser.js      # LinkedIn PDF parsing
│   ├── linkedin-scorer.js      # Profile scoring
│   ├── linkedin-optimizer.js   # Profile optimization
│   └── linkedin-export.js      # LinkedIn export
│
├── navigation/                 # Navigation system
│   ├── index.js                # Navigation controller
│   ├── loader.js               # Component loader
│   ├── keyboard-nav.js         # Keyboard shortcuts
│   ├── mobile-menu.js          # Mobile navigation
│   └── focus-trap.js           # Accessibility focus
│
├── templates/                  # Template system
│   └── registry.js             # Template definitions
│
├── tracker/                    # Application tracking
│   ├── board.js                # Kanban board
│   ├── storage.js              # Data persistence
│   ├── analytics.js            # Analytics engine
│   ├── charts.js               # 7 chart types
│   ├── metrics.js              # Advanced metrics
│   └── export.js               # Data export (CSV, JSON, iCal)
│
├── utils/                      # Utilities
│   ├── notifications.js        # Notification system
│   ├── tooltips.js             # Tooltip manager
│   ├── onboarding.js           # User onboarding
│   ├── logger.js               # Logging utility
│   ├── crypto.js               # API key encryption (AES-GCM 256)
│   ├── sanitizer.js            # XSS prevention
│   ├── job-url-parser.js       # Job URL parsing
│   └── linkedin-search.js      # LinkedIn job search
│
└── versions/                   # Version management
    ├── manager.js              # Version controller
    ├── storage.js              # Version persistence
    ├── diff.js                 # Diff algorithm
    ├── merger.js               # Merge logic
    └── ui.js                   # Version UI
```

### Module Responsibilities

#### Core Modules

**state.js** (385 lines)
- Centralized state management
- ResumeState class with event system
- LocalStorage persistence
- State import/export

**app.js** (471 lines)
- Main application controller
- Resume/job file handling
- API integration
- Results display

#### AI Modules (`js/ai/`)

**generator.js** - AI Content Generation
- 13 generation methods:
  1. Professional summary
  2. Job descriptions
  3. Achievement bullets
  4. Skills from experience
  5. Project descriptions
  6. Cover letters
  7. LinkedIn headlines
  8. Section content
  9. Keywords extraction
  10. Action verb enhancement
  11. Quantification suggestions
  12. Tone optimization
  13. Full resume generation
- Claude API integration
- Token management
- Error handling

**prompts.js** - Prompt Templates
- Pre-defined prompts for each generation type
- Template variables
- Tone variations (professional, creative, technical)
- Industry-specific language

**proofread.js** - Proofreading Engine
- 19 pattern checks:
  - Grammar issues
  - Spelling errors
  - Passive voice
  - Weak verbs
  - Clichés
  - Redundancies
  - Tense consistency
  - Punctuation
  - Formatting
- Severity levels (low, medium, high)
- Correction suggestions

**tailor.js** - Job Tailoring
- Resume-to-job matching
- Keyword extraction
- Gap analysis
- Suggestion generation
- Diff creation

#### Editor Modules (`js/editor/`)

**builder.js** - Resume Builder Controller
- Section management (23 types)
- Content editing
- Template switching
- Export coordination

**sections.js** - Section Types
- 23 section definitions:
  1. Header (name, contact)
  2. Professional Summary
  3. Work Experience
  4. Education
  5. Skills (categories: technical, soft, languages, tools)
  6. Projects
  7. Certifications
  8. Publications
  9. Awards & Honors
  10. Volunteer Experience
  11. Languages
  12. Hobbies & Interests
  13. References
  14. Custom Sections
  15. Portfolio Links
  16. Patents
  17. Speaking Engagements
  18. Professional Memberships
  19. Military Service
  20. Research Experience
  21. Teaching Experience
  22. Press & Media
  23. Open Source Contributions

**dragdrop.js** - Drag-and-Drop System
- Section reordering
- Drag handles
- Drop zones
- Visual feedback
- Touch support

**history.js** - Undo/Redo
- 50+ state history
- Command pattern
- Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
- State compression

**autosave.js** - Auto-Save
- 30-second interval
- LocalStorage persistence
- Save status indicator
- Conflict resolution

#### Export Modules (`js/export/`)

**parser.js** - Resume Parser
- Multi-format support (PDF, DOCX, TXT)
- AI-powered extraction (87-90% accuracy)
- Section detection
- Contact info extraction
- Date parsing
- Skills extraction

**pdf-export.js** - PDF Generation
- html2pdf.js integration
- Template preservation
- Page breaks
- Selectable text
- Embedded fonts

**docx-export.js** - DOCX Generation
- docx.js integration
- Formatting preservation
- Editable output
- Track changes support

#### Tracker Modules (`js/tracker/`)

**board.js** - Kanban Board
- 9 status columns:
  1. Wishlist
  2. Researching
  3. Preparing
  4. Applied
  5. Phone Screen
  6. Interviewing
  7. Offer
  8. Accepted
  9. Rejected
- Drag-and-drop status updates
- Card management
- Timeline tracking

**analytics.js** - Analytics Engine
- Conversion rate calculation
- Response time tracking
- Success rate analysis
- Trend detection

**charts.js** - Chart Rendering
- 7 chart types using Chart.js:
  1. Score Progression (line)
  2. Application Funnel (funnel)
  3. Template Usage (bar)
  4. Keyword Trends (line)
  5. Success Rates (pie)
  6. Response Times (histogram)
  7. Monthly Trends (area)

---

## API Endpoints

### Backend Server (`server.js` - 931 lines)

**Base URL**: `http://localhost:3101`

### Authentication & Configuration

#### GET `/api/config`
- **Purpose**: Check if server has API key configured
- **Response**: `{ hasServerApiKey: boolean, message: string }`
- **Authentication**: None required
- **Rate Limit**: None

### Resume Operations

#### POST `/api/parse`
- **Purpose**: Parse resume file (PDF, DOCX, DOC, TXT)
- **Request**: Multipart form-data
  - `resume`: File (max 10MB)
  - `apiKey`: Optional Claude API key
  - `useAI`: Boolean (enable AI extraction)
- **Response**:
  ```json
  {
    "success": true,
    "text": "extracted text",
    "sections": {},
    "validation": {}
  }
  ```
- **Rate Limit**: 10 req/min
- **Authentication**: Optional API key for AI features

#### POST `/api/extract`
- **Purpose**: AI-powered resume extraction
- **Request**: Multipart form-data
  - `resume`: File
  - `apiKey`: Required Claude API key
- **Response**: Structured resume data
- **Rate Limit**: 10 req/min
- **Authentication**: Required API key

#### POST `/api/parse-batch`
- **Purpose**: Parse multiple resumes (up to 10)
- **Request**: Multipart form-data
  - `resumes`: Array of files
  - `apiKey`: Optional API key
  - `useAI`: Boolean
- **Response**: Array of parsed results
- **Rate Limit**: 10 req/min

### AI Content Generation

#### POST `/api/analyze`
- **Purpose**: Analyze resume against job description
- **Request**:
  ```json
  {
    "resumeText": "string",
    "jobText": "string",
    "apiKey": "optional key"
  }
  ```
- **Response**:
  ```json
  {
    "analysis": "formatted analysis text with 7 sections"
  }
  ```
- **Rate Limit**: 10 req/min
- **Validation**: Max 100KB per field

#### POST `/api/generate`
- **Purpose**: Generic AI content generation
- **Request**:
  ```json
  {
    "prompt": "string",
    "apiKey": "optional key",
    "maxTokens": 1024,
    "temperature": 0.7
  }
  ```
- **Response**:
  ```json
  {
    "content": "generated content"
  }
  ```
- **Rate Limit**: 10 req/min
- **Validation**: Max 50KB prompt

#### POST `/api/tailor`
- **Purpose**: Tailor resume to job description
- **Request**:
  ```json
  {
    "resumeData": {},
    "jobDescription": "string",
    "apiKey": "optional key"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "jobData": {
      "jobTitle": "string",
      "requiredSkills": [],
      "keywords": [],
      ...
    }
  }
  ```
- **Rate Limit**: 10 req/min

### Job Board Integration

#### POST `/api/fetch-job`
- **Purpose**: Fetch job posting from URL
- **Request**:
  ```json
  {
    "url": "string",
    "site": "optional site identifier"
  }
  ```
- **Supported Sites**:
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
  - AngelList/Wellfound
- **Response**:
  ```json
  {
    "success": true,
    "content": "job description text",
    "url": "string",
    "site": "string",
    "fetchedAt": "ISO timestamp"
  }
  ```
- **Rate Limit**: 10 req/min
- **Timeout**: 15 seconds

#### POST `/api/linkedin-search`
- **Purpose**: Search LinkedIn jobs
- **Request**:
  ```json
  {
    "keyword": "string (required)",
    "location": "string",
    "dateSincePosted": "past month",
    "jobType": "string",
    "remoteFilter": "string",
    "salary": "string",
    "experienceLevel": "string",
    "limit": "20"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "count": 20,
    "jobs": [
      {
        "position": "string",
        "company": "string",
        "location": "string",
        "date": "string",
        "salary": "string",
        "jobUrl": "string",
        "description": "string"
      }
    ]
  }
  ```
- **Rate Limit**: 10 req/min
- **Max Results**: 50

### Health Check

#### GET `/health`
- **Purpose**: Server health check
- **Response**: `{ status: "ok" }`
- **Rate Limit**: None

### API Response Formats

**Success Response**:
```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

**Error Response**:
```json
{
  "error": "error message",
  "status": 400,
  "retryAfter": 60
}
```

### Rate Limiting

- **Window**: 60 seconds (1 minute)
- **Max Requests**: 10 per window
- **Storage**: In-memory (Map)
- **Identifier**: Client IP address
- **Error Code**: 429 (Too Many Requests)

### Security Headers

All responses include:
- `Content-Security-Policy` (from config)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

---

## State Management

### Global State (`js/state.js`)

**ResumeState Class** - Centralized state management

#### State Structure

```javascript
{
  // Resume sections array
  sections: [
    {
      id: "section-xyz",
      type: "experience",
      title: "Work Experience",
      content: {},
      visible: true,
      order: 0
    }
  ],

  // Active section being edited
  activeSection: "section-xyz" | null,

  // Editor mode
  editorMode: "edit" | "preview" | "split",

  // Current template
  template: "modern" | "classic" | "creative" | "executive" | "technical" | "minimal",

  // Template customization
  customization: {
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    accentColor: "#0ea5e9",
    headingFont: "Inter",
    bodyFont: "Inter",
    spacing: "normal" | "compact" | "relaxed"
  },

  // Resume metadata
  metadata: {
    title: "My Resume",
    lastModified: "2025-12-02T10:00:00Z",
    version: 1
  },

  // UI state
  ui: {
    sidebarOpen: true,
    previewVisible: true,
    isDragging: false,
    draggedSectionId: null,
    saveStatus: "saved" | "saving" | "unsaved"
  }
}
```

#### State Methods

**Getters**:
- `getState()` - Get entire state
- `getSections()` - Get sections array
- `getSection(id)` - Get specific section
- `getActiveSection()` - Get active section
- `getEditorMode()` - Get editor mode
- `getTemplate()` - Get current template
- `getCustomization()` - Get customization settings
- `getUIState()` - Get UI state

**Setters**:
- `setActiveSection(id)` - Set active section
- `setEditorMode(mode)` - Set editor mode
- `setTemplate(name)` - Set template
- `updateCustomization(updates)` - Update customization
- `updateUIState(updates)` - Update UI state
- `setSaveStatus(status)` - Set save status

**Section Operations**:
- `addSection(section)` - Add new section
- `removeSection(id)` - Remove section
- `updateSection(id, updates)` - Update section
- `updateSectionContent(id, content)` - Update section content
- `reorderSections(fromIndex, toIndex)` - Reorder sections
- `moveSection(id, newIndex)` - Move section to index

**Persistence**:
- `loadFromStorage()` - Load from localStorage
- `saveToStorage()` - Save to localStorage
- `exportState()` - Export as JSON string
- `importState(json)` - Import from JSON
- `reset()` - Reset to default state

**Event System**:
- `on(event, callback)` - Subscribe to event
- `off(event, callback)` - Unsubscribe from event
- `emit(event, data)` - Emit event to listeners

**Events**:
- `sectionAdded` - Section added
- `sectionRemoved` - Section removed
- `sectionUpdated` - Section updated
- `sectionContentUpdated` - Section content updated
- `sectionsReordered` - Sections reordered
- `activeSectionChanged` - Active section changed
- `editorModeChanged` - Editor mode changed
- `templateChanged` - Template changed
- `customizationChanged` - Customization changed
- `uiStateChanged` - UI state changed
- `saveStatusChanged` - Save status changed
- `stateModified` - Any modification
- `stateImported` - State imported
- `stateReset` - State reset

### LocalStorage Keys

| Key | Purpose | Data Type | Max Size |
|-----|---------|-----------|----------|
| `resumate_state` | Resume builder state | JSON | ~5MB |
| `claude_api_key` | Encrypted API key | String | ~100B |
| `resumate_versions` | Resume versions | JSON Array | ~5MB |
| `resumate_applications` | Job applications | JSON Array | ~5MB |
| `resumate_analytics` | Analytics data | JSON | ~2MB |
| `resumate_preferences` | User preferences | JSON | ~10KB |
| `theme` | UI theme preference | String | ~10B |
| `lastAnalysis` | Last analysis result | JSON | ~100KB |

### Session State (In-Memory)

**Page-Level State** (`app.js`)
```javascript
{
  resumeText: "",
  jobText: "",
  apiKey: "",
  analyzing: false,
  serverHasApiKey: false
}
```

**Builder State** (attached to window)
```javascript
{
  resumeRenderer: ResumeRenderer instance,
  previewController: PreviewController instance,
  exportManager: ExportManager instance
}
```

### State Persistence Strategy

1. **Auto-Save**: 30-second interval to localStorage
2. **Manual Save**: Cmd+S keyboard shortcut
3. **Version Snapshots**: Saved on template change, major edits
4. **Export Backup**: JSON export includes full state
5. **Session Recovery**: Restore on page reload

---

## AI Features & Claude Integration

### Claude API Configuration

**Model**: claude-sonnet-4-20250514
**API Version**: 2023-06-01
**Endpoint**: https://api.anthropic.com/v1/messages

### AI Feature Matrix

| Feature | Module | Claude Methods | Token Usage | Avg Response Time |
|---------|--------|----------------|-------------|-------------------|
| Resume Analysis | `app.js` | 1 | 4,096 | 3-5s |
| Content Generation | `ai/generator.js` | 13 | 256-4,096 | 2-4s |
| Job Tailoring | `ai/tailor.js` | 2 | 2,048 | 4-6s |
| Cover Letter | `coverletter/generator.js` | 1 | 2,048 | 3-5s |
| Proofreading | `ai/proofread.js` | 1 | 2,048 | 2-3s |
| LinkedIn Optimization | `integrations/linkedin-optimizer.js` | 3 | 1,024 | 2-4s |
| ATS Recommendations | `analyzer/ats-scanner.js` | 1 | 2,048 | 2-3s |

### 13 AI Generation Methods

#### 1. Professional Summary
**Prompt Template**: Generate compelling summary from experience
**Max Tokens**: 512
**Temperature**: 0.7
**Output**: 3-5 sentences highlighting key qualifications

#### 2. Job Descriptions
**Prompt Template**: Expand job title into detailed description
**Max Tokens**: 256
**Temperature**: 0.7
**Output**: 2-3 bullet points with action verbs

#### 3. Achievement Bullets
**Prompt Template**: Transform tasks into achievement-focused bullets
**Max Tokens**: 256
**Temperature**: 0.7
**Output**: Quantified, action-oriented bullets

#### 4. Skills Extraction
**Prompt Template**: Extract skills from job descriptions
**Max Tokens**: 512
**Temperature**: 0.3
**Output**: Categorized skills (technical, soft, tools, languages)

#### 5. Project Descriptions
**Prompt Template**: Generate project descriptions from keywords
**Max Tokens**: 512
**Temperature**: 0.7
**Output**: Structured project summary with tech stack

#### 6. Cover Letters
**Prompt Template**: Generate tailored cover letter
**Max Tokens**: 2,048
**Temperature**: 0.8
**Output**: Complete cover letter (300-500 words)

#### 7. LinkedIn Headlines
**Prompt Template**: Generate SEO-optimized headline
**Max Tokens**: 128
**Temperature**: 0.7
**Output**: 120-character headline

#### 8. Section Content
**Prompt Template**: Generate content for any resume section
**Max Tokens**: 1,024
**Temperature**: 0.7
**Output**: Section-specific formatted content

#### 9. Keyword Extraction
**Prompt Template**: Extract important keywords from job posting
**Max Tokens**: 512
**Temperature**: 0.3
**Output**: Ranked list of keywords with relevance scores

#### 10. Action Verb Enhancement
**Prompt Template**: Replace weak verbs with strong action verbs
**Max Tokens**: 256
**Temperature**: 0.5
**Output**: Enhanced text with power verbs

#### 11. Quantification Suggestions
**Prompt Template**: Suggest ways to quantify achievements
**Max Tokens**: 512
**Temperature**: 0.7
**Output**: Questions/prompts to add metrics

#### 12. Tone Optimization
**Prompt Template**: Adjust content tone (professional/creative/technical)
**Max Tokens**: 1,024
**Temperature**: 0.7
**Output**: Rewritten content in target tone

#### 13. Full Resume Generation
**Prompt Template**: Generate complete resume from minimal input
**Max Tokens**: 4,096
**Temperature**: 0.7
**Output**: Structured resume data for all sections

### AI-Powered Analysis Features

#### Resume Analysis (7 Sections)
1. **Overall Match Score** (0-100)
2. **Key Strengths** (5+ points)
3. **Gaps and Concerns** (5+ points)
4. **Recommendations** (5+ actionable items)
5. **ATS Compatibility** (score + 3+ points)
6. **Keyword Analysis** (missing keywords)
7. **Formatting Suggestions** (3+ improvements)

#### Job Tailoring Analysis
- **Job Data Extraction**: 14 fields
  - Job title
  - Company
  - Required skills
  - Preferred skills
  - Experience level
  - Soft skills
  - Responsibilities
  - Tools/technologies
  - Certifications
  - Education requirements
  - Keywords
  - Company culture
  - Salary range
  - Work type (remote/hybrid/onsite)

- **Resume Optimization**:
  - Keyword insertion suggestions
  - Section reordering recommendations
  - Content enhancement prompts
  - Skill gap identification

#### Proofreading Suite (19 Patterns)

**Grammar & Spelling**:
- Spelling errors
- Common grammar mistakes
- Incorrect punctuation
- Missing articles

**Style Issues**:
- Passive voice detection
- Weak verbs identification
- Cliché detection
- Redundant phrases
- Wordiness
- Inconsistent tense
- Inconsistent date formats

**Resume-Specific**:
- First-person references (I, me, my)
- Incomplete sentences
- Inconsistent bullet formatting
- Excessive jargon
- Abbreviation inconsistency
- Phone number formats
- Email format validation

**Consistency Checks**:
- Tense consistency across sections
- Date format consistency
- Punctuation consistency
- Spacing consistency

### Error Handling & Retry Logic

**API Errors**:
- 400: Invalid request → Show user-friendly error
- 401: Authentication failed → Prompt for valid API key
- 429: Rate limit → Show retry after X seconds
- 500: Server error → Retry up to 3 times with exponential backoff
- 503: Service unavailable → Suggest trying later

**Timeout Handling**:
- Default timeout: 30 seconds
- Show progress indicator
- Allow cancellation
- Retry option on timeout

**Token Management**:
- Monitor token usage
- Warn when approaching limits
- Suggest optimization for long prompts
- Automatic chunking for large documents

---

## Navigation Structure

### Page Hierarchy & Relationships

```
ResuMate Application
│
├── Home (index.html)
│   └── Quick Actions →
│       ├── Build Resume → builder.html
│       ├── Import Resume → parser-demo.html
│       ├── Browse Templates → template-test.html
│       └── Try AI Writer → test-ai.html
│
├── Build
│   ├── Resume Builder (builder.html)
│   ├── Template Selector (template-test.html)
│   └── Resume Parser (parser-demo.html)
│
├── Tools
│   ├── Job Tailoring (test-job-tailor.html)
│   ├── ATS Scanner (test-ats-scanner.html)
│   ├── AI Writer (test-ai.html)
│   ├── Proofreader (test-proofread.html)
│   ├── Cover Letter Generator (test-coverletter.html)
│   └── Version Manager (versions.html)
│
├── Analytics
│   ├── Dashboard (analytics-dashboard.html)
│   ├── Application Tracker (test-tracker.html)
│   └── Benchmarking (benchmarking.html)
│
├── Integrations
│   └── LinkedIn (linkedin-integration.html)
│
└── Testing (Development)
    ├── AI Testing (test-ai.html)
    ├── ATS Testing (test-ats-scanner.html)
    ├── Export Testing (test-export.html)
    ├── Preview Testing (test-preview.html)
    └── [12 more test pages]
```

### Navigation Bar Structure

**Primary Navigation**:
- **Home** - Landing page (index.html)
- **Builder** (Dropdown)
  - Visual Builder
  - Import Resume
  - Browse Templates
- **Tools** (Dropdown)
  - Job Tailoring
  - ATS Scanner
  - AI Writer
  - Proofreader
  - Cover Letters
  - Versions
- **Analytics** (Dropdown)
  - Dashboard
  - Application Tracker
  - Benchmarking
- **Resources** (Dropdown)
  - Documentation
  - Feature Guide
  - Keyboard Shortcuts
  - About

**Secondary Navigation**:
- Theme Toggle (Light/Dark)
- Settings
- Help/Support

**Mobile Navigation**:
- Hamburger menu (< 768px)
- Slide-out drawer
- Touch-optimized

### Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + S` | Save | Builder, Editor |
| `Cmd/Ctrl + Z` | Undo | Builder |
| `Cmd/Ctrl + Shift + Z` | Redo | Builder |
| `Cmd/Ctrl + P` | Print/Export | All pages |
| `Cmd/Ctrl + K` | Open shortcuts menu | All pages |
| `Esc` | Close modal/dropdown | All pages |
| `Tab` | Navigate elements | All pages |
| `Arrow Keys` | Navigate sections | Builder |
| `/` | Focus search | All pages |

### Page Flow Patterns

#### Typical User Journey #1: Create Resume
```
1. index.html (Landing)
   ↓
2. builder.html (Build resume)
   ↓
3. template-test.html (Choose template)
   ↓
4. test-ai.html (Generate content)
   ↓
5. test-ats-scanner.html (Check ATS compatibility)
   ↓
6. Export (PDF/DOCX)
```

#### Typical User Journey #2: Tailor for Job
```
1. index.html (Landing)
   ↓
2. test-job-tailor.html (Input job description)
   ↓
3. builder.html (Apply suggestions)
   ↓
4. test-ats-scanner.html (Verify ATS score)
   ↓
5. test-coverletter.html (Generate cover letter)
   ↓
6. test-tracker.html (Track application)
```

#### Typical User Journey #3: Track Applications
```
1. test-tracker.html (Kanban board)
   ↓
2. analytics-dashboard.html (View metrics)
   ↓
3. benchmarking.html (Industry comparison)
   ↓
4. test-job-tailor.html (Optimize for new role)
```

---

## Data Flow Diagram

### Resume Creation Flow

```
User Input
    ↓
┌───────────────────────────────────────┐
│  1. Input Method                      │
│  • Manual text entry                  │
│  • File upload (PDF/DOCX/TXT)         │
│  • LinkedIn import                    │
│  • Visual builder                     │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  2. Parsing & Extraction              │
│  • Client: text files                 │
│  • Server: PDF/DOCX                   │
│  • AI: structured extraction          │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  3. State Management                  │
│  • ResumeState.sections[]             │
│  • LocalStorage persistence           │
│  • Auto-save (30s)                    │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  4. AI Enhancement (Optional)         │
│  • Content generation                 │
│  • Proofreading                       │
│  • Tone adjustment                    │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  5. Template Rendering                │
│  • ResumeRenderer                     │
│  • CSS styling                        │
│  • Real-time preview                  │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  6. Export                            │
│  • PDF (html2pdf.js)                  │
│  • DOCX (docx.js)                     │
│  • HTML/TXT/JSON                      │
└───────────────────────────────────────┘
```

### Job Tailoring Flow

```
Resume Data + Job Description
    ↓
┌───────────────────────────────────────┐
│  1. Job Analysis                      │
│  • POST /api/tailor                   │
│  • Claude extracts requirements       │
│  • Returns structured job data        │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  2. Resume-Job Mapping                │
│  • ai/mapper.js                       │
│  • Match skills, experience           │
│  • Identify gaps                      │
│  • Calculate match score              │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  3. Suggestion Generation             │
│  • ai/tailor.js                       │
│  • Keyword insertions                 │
│  • Content enhancements               │
│  • Section reordering                 │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  4. Diff Visualization                │
│  • ai/diff-viewer.js                  │
│  • Side-by-side comparison            │
│  • Highlighted changes                │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  5. User Review & Apply               │
│  • Accept/Reject changes              │
│  • Update ResumeState                 │
│  • Create new version                 │
└───────────────────────────────────────┘
```

### ATS Scanning Flow

```
Resume Data
    ↓
┌───────────────────────────────────────┐
│  1. Format Checks (10)                │
│  • analyzer/checks/formatting.js      │
│  • File type, fonts, colors           │
│  • Images, tables, columns            │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  2. Structure Checks (10)             │
│  • analyzer/checks/structure.js       │
│  • Section order, headers             │
│  • Contact info, dates                │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  3. Content Checks (10)               │
│  • analyzer/checks/content.js         │
│  • Keywords, length, clarity          │
│  • Action verbs, quantification       │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  4. Scoring                           │
│  • analyzer/scorer.js                 │
│  • 5 categories (0-100 each)          │
│  • Weighted overall score             │
│  • Letter grade (A+ to F)             │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  5. Recommendations                   │
│  • Prioritized action items           │
│  • Estimated impact scores            │
│  • Links to relevant tools            │
└───────────────────────────────────────┘
```

### Analytics Data Flow

```
User Actions
    ↓
┌───────────────────────────────────────┐
│  1. Event Tracking                    │
│  • Resume edits                       │
│  • Template changes                   │
│  • ATS scans                          │
│  • Applications submitted             │
│  • Job searches                       │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  2. Data Storage                      │
│  • tracker/storage.js                 │
│  • LocalStorage (resumate_analytics)  │
│  • Structured JSON                    │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  3. Metrics Calculation               │
│  • tracker/metrics.js                 │
│  • Conversion rates                   │
│  • Response times                     │
│  • Success rates                      │
│  • ROI analysis                       │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  4. Visualization                     │
│  • tracker/charts.js                  │
│  • Chart.js rendering                 │
│  • 7 chart types                      │
│  • Real-time updates                  │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  5. Export & Reporting                │
│  • tracker/export.js                  │
│  • PDF reports                        │
│  • CSV data export                    │
│  • iCal calendar integration          │
└───────────────────────────────────────┘
```

---

## Integration Points

### External APIs

#### 1. Claude AI (Anthropic)
- **Endpoint**: https://api.anthropic.com/v1/messages
- **Authentication**: API key (header: `x-api-key`)
- **Model**: claude-sonnet-4-20250514
- **Rate Limits**: Per API key plan
- **Used By**: All AI features (13 methods)
- **Integration**: Server-side proxy (`/api/*` endpoints)

#### 2. LinkedIn Jobs API
- **Package**: linkedin-jobs-api (npm)
- **Authentication**: None required (scraping-based)
- **Used By**: Job search feature
- **Integration**: Server-side (`/api/linkedin-search`)
- **Limitations**: Public job postings only

#### 3. Job Board Scrapers
- **Supported Sites**: 13 job boards
- **Method**: HTTP requests + HTML parsing
- **Used By**: Job URL import feature
- **Integration**: Server-side (`/api/fetch-job`)
- **Limitations**: No login-required postings

### Browser APIs

#### LocalStorage
- **Max Size**: ~5-10MB per domain
- **Used For**:
  - Resume data persistence
  - Application tracking
  - Analytics data
  - User preferences
  - API key storage (encrypted)
- **Fallback**: Session-only mode if unavailable

#### File API
- **Used For**:
  - Resume file uploads
  - PDF/DOCX parsing
  - Drag-and-drop uploads
- **Max Size**: 10MB (server limit)
- **Supported Types**: PDF, DOCX, DOC, TXT

#### Canvas API
- **Used For**:
  - Chart rendering (Chart.js)
  - PDF generation (html2pdf.js)
- **Fallback**: SVG rendering

#### Web Workers (Future)
- **Planned For**:
  - Large file parsing
  - Complex calculations
  - Background processing

### CDN Dependencies

#### Production Dependencies
```html
<!-- PDF Export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

<!-- DOCX Export -->
<script src="https://unpkg.com/docx@8.5.0/build/index.umd.js"></script>

<!-- File Saving -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

<!-- Charts (if used on page) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
```

#### Font CDNs
```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Internal Module Dependencies

```
Core Dependencies
├── state.js → Used by: all editor modules
├── utils/logger.js → Used by: all modules
├── utils/sanitizer.js → Used by: all input handling
└── utils/notifications.js → Used by: all user-facing modules

AI Module Dependencies
├── ai/generator.js → Depends on: ai/prompts.js
├── ai/tailor.js → Depends on: ai/generator.js, ai/mapper.js
├── ai/proofread.js → Depends on: ai/prompts.js
└── ai/diff-viewer.js → Depends on: versions/diff.js

Editor Module Dependencies
├── editor/builder.js → Depends on: state.js, editor/sections.js
├── editor/preview.js → Depends on: editor/renderer.js
├── editor/dragdrop.js → Depends on: state.js
├── editor/history.js → Depends on: state.js
└── editor/autosave.js → Depends on: state.js

Export Module Dependencies
├── export/export-manager.js → Depends on: all export modules
├── export/pdf-export.js → Depends on: html2pdf.js (CDN)
├── export/docx-export.js → Depends on: docx.js (CDN)
└── export/parser.js → Depends on: export/*-parser.js, ai/generator.js

Tracker Module Dependencies
├── tracker/board.js → Depends on: tracker/storage.js
├── tracker/analytics.js → Depends on: tracker/storage.js
├── tracker/charts.js → Depends on: Chart.js (CDN)
└── tracker/export.js → Depends on: tracker/storage.js, FileSaver.js
```

### Communication Patterns

#### Frontend ↔ Backend
- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **Methods**: GET, POST
- **Authentication**: API key (optional in body)
- **Error Handling**: Standard HTTP status codes

#### Module ↔ Module
- **Pattern**: Event-driven (state.js) + direct function calls
- **State Updates**: Emit events on change
- **Data Passing**: Method parameters + return values
- **Error Propagation**: try/catch with logging

#### Component ↔ State
- **Read**: Getter methods (`state.getSections()`)
- **Write**: Setter methods (`state.updateSection()`)
- **Subscribe**: Event listeners (`state.on('sectionUpdated', callback)`)
- **Persist**: Auto-save to localStorage

---

## Summary

ResuMate is a **comprehensive, modular, AI-powered career management platform** with:

### Architecture Highlights

1. **Client-Side Focus**: All data stored locally, maximum privacy
2. **Modular Design**: 57 JavaScript modules, clear separation of concerns
3. **AI Integration**: 13 Claude-powered generation methods
4. **Real-Time Preview**: Split-view editing with instant rendering
5. **Comprehensive Export**: 5 formats with template preservation
6. **Analytics Engine**: 7 chart types, advanced metrics tracking
7. **Professional Polish**: 200+ CSS variables, unified design system

### Technology Decisions

- **No Framework**: Vanilla JavaScript for simplicity and performance
- **LocalStorage**: Client-side persistence, no database required
- **Express Proxy**: Backend only for CORS and Claude API access
- **CDN Libraries**: Leverage existing solutions (Chart.js, html2pdf.js)
- **Modular CSS**: Template-specific stylesheets for easy customization

### Integration Strategy

- **Claude AI**: Server-side proxy for security and rate limiting
- **Job Boards**: HTTP scraping with fallback to manual input
- **File Handling**: Client-side for TXT, server-side for PDF/DOCX
- **Export**: Client-side generation with CDN libraries

### Scalability Considerations

- **LocalStorage Limits**: ~5MB per key, compression for large resumes
- **Rate Limiting**: 10 req/min on AI endpoints
- **Batch Processing**: Support for multiple resumes/applications
- **Modular Architecture**: Easy to add new features/templates

This catalog provides a complete reference for understanding, extending, and maintaining the ResuMate codebase.

---

**Document Version**: 1.0
**Last Updated**: 2025-12-02
**Total Pages**: Comprehensive architecture documentation
