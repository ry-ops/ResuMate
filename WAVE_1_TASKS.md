# Wave 1 Implementation Tasks

## Worker 1: Editor Infrastructure (resumate-builder-core)

### Objective
Build the foundational drag-and-drop resume editor with section-based architecture.

### Task Details
Implement the following components in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Drag-and-Drop Section Manager**
   - Create `js/editor/dragdrop.js`
   - Implement HTML5 drag-and-drop API
   - Enable section reordering with visual feedback
   - Handle drop zones and insertion points

2. **Section Component Architecture**
   - Create `js/editor/sections.js`
   - Implement 20+ section types (header, summary, experience, education, skills, certifications, projects, achievements, languages, volunteering, publications, awards, references, dayInLife, philosophy, strengths, passions, etc.)
   - Each section should have: id, type, name, required flag, content object

3. **State Management**
   - Create `js/state.js`
   - Implement centralized state store
   - Handle resume sections array
   - Manage active section tracking

4. **Undo/Redo History**
   - Create `js/editor/history.js`
   - Implement history stack (minimum 50 states)
   - Add undo/redo functionality
   - Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

5. **Auto-Save System**
   - Create `js/editor/autosave.js`
   - Implement 30-second interval auto-save
   - Save to localStorage
   - Visual indicator for save status

6. **Main Editor Controller**
   - Create `js/editor/builder.js`
   - Orchestrate all editor components
   - Handle section addition/removal
   - Manage editor modes

### Files to Create
```
js/
├── state.js
└── editor/
    ├── builder.js
    ├── sections.js
    ├── dragdrop.js
    ├── history.js
    └── autosave.js
```

### Acceptance Criteria
- [ ] Sections can be dragged and reordered
- [ ] Undo/redo works for at least 50 actions
- [ ] Auto-save triggers every 30 seconds
- [ ] All 20+ section types defined
- [ ] State persists to localStorage

---

## Worker 2: Real-Time Preview (resumate-preview-engine)

### Objective
Create a live preview system that renders resume changes in real-time.

### Task Details
Implement preview rendering in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Live Preview Renderer**
   - Create `js/editor/preview.js`
   - Render resume sections as HTML
   - Update on state changes (debounced)
   - Handle template CSS injection

2. **HTML/CSS Generation**
   - Create `js/editor/renderer.js`
   - Convert section data to HTML
   - Apply template styles dynamically
   - Generate print-ready markup

3. **Split-View Layout**
   - Update `index.html` to include preview panel
   - Create `css/preview.css`
   - Implement resizable split panes
   - Toggle between split and overlay modes

4. **Print Preview Mode**
   - Add print preview toggle
   - Show page breaks
   - Display page numbers
   - A4 and US Letter sizing

5. **Page Break Controls**
   - Detect and visualize page breaks
   - Manual page break insertion
   - Orphan/widow prevention

### Files to Create
```
js/editor/
├── preview.js
└── renderer.js

css/
└── preview.css
```

### Acceptance Criteria
- [ ] Preview updates within 500ms of changes
- [ ] Split-view layout works responsively
- [ ] Print preview shows accurate pagination
- [ ] Page breaks are controllable

---

## Worker 3: Template System Core (resumate-templates-core)

### Objective
Build template engine and create first 3 professional resume templates.

### Task Details
Implement template system in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Template Engine**
   - Create `js/templates/engine.js`
   - Load and apply template CSS
   - Handle template switching
   - Manage template metadata

2. **Template Registry**
   - Create `js/templates/registry.js`
   - Template catalog with metadata
   - Template preview thumbnails
   - Template categorization

3. **Style Customizer**
   - Create `js/templates/customizer.js`
   - Color customization (primary, secondary, accent)
   - Typography controls (heading/body fonts)
   - Spacing adjustments

4. **Template: Classic**
   - Create `css/templates/classic.css`
   - Single-column layout
   - Conservative styling
   - ATS-compatible structure

5. **Template: Modern**
   - Create `css/templates/modern.css`
   - Clean lines with subtle color accents
   - Good whitespace usage
   - Professional but fresh

6. **Template: Creative**
   - Create `css/templates/creative.css`
   - Two-column layout
   - Sidebar for skills/contact
   - Visual hierarchy with color

### Files to Create
```
js/templates/
├── engine.js
├── registry.js
└── customizer.js

css/templates/
├── classic.css
├── modern.css
└── creative.css
```

### Acceptance Criteria
- [ ] Templates can be switched dynamically
- [ ] All 3 templates are ATS-compatible
- [ ] Color customization works
- [ ] Typography controls functional
- [ ] Templates support both A4 and US Letter

---

## Worker 4: AI Resume Writer (resumate-ai-writer)

### Objective
Implement AI-powered content generation using Claude API.

### Task Details
Implement AI features in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **Prompt Templates**
   - Create `js/ai/prompts.js`
   - Define prompt templates:
     - `generateSummary(jobTitle, yearsExp, skills, targetRole)`
     - `expandBullet(userInput)`
     - `suggestActionVerbs(context)`
     - `quantifyAchievement(achievement)`
     - `rewriteForIndustry(content, industry)`

2. **Content Generator**
   - Create `js/ai/generator.js`
   - Call Claude API via existing `/api/analyze` endpoint
   - Handle API responses
   - Error handling and retries

3. **Content Rewriter**
   - Create `js/ai/rewriter.js`
   - Expand bullet points
   - Improve weak verbs
   - Add quantification
   - Industry-specific rewrites

4. **API Client**
   - Enhance `server.js` with new endpoint `/api/generate`
   - Support multiple prompt types
   - Rate limiting
   - Response caching

5. **UI Integration**
   - Add AI assistant buttons to editor
   - Modal for AI generation
   - Loading states
   - Copy/insert generated content

### Files to Create
```
js/ai/
├── prompts.js
├── generator.js
└── rewriter.js

(Update existing server.js)
```

### Acceptance Criteria
- [ ] Generate professional summaries
- [ ] Expand brief bullet points
- [ ] Suggest action verbs
- [ ] Rewrite for different industries
- [ ] Handle API errors gracefully

---

## Worker 5: Security Audit (resumate-security-audit)

### Objective
Perform comprehensive security audit and implement fixes.

### Task Details
Audit and secure `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **API Key Encryption**
   - Create `js/utils/crypto.js`
   - Encrypt API keys in localStorage
   - Use Web Crypto API
   - Key derivation from user input

2. **Input Sanitization**
   - Create `js/utils/sanitizer.js`
   - Sanitize user input (XSS prevention)
   - Validate file uploads
   - Content Security Policy

3. **Security Audit**
   - Scan for XSS vulnerabilities
   - Check localStorage security
   - Review API key handling
   - Test file upload security

4. **CSP Implementation**
   - Create `security/csp-config.json`
   - Define Content Security Policy
   - Update server.js with CSP headers
   - Test CSP effectiveness

5. **Dependency Scanning**
   - Run `npm audit`
   - Fix vulnerability warnings
   - Update dependencies
   - Document security considerations

6. **Documentation**
   - Create `security/SECURITY.md`
   - Document security measures
   - Provide security guidelines
   - Incident response plan

### Files to Create
```
js/utils/
├── crypto.js
└── sanitizer.js

security/
├── SECURITY.md
└── csp-config.json
```

### Acceptance Criteria
- [ ] API keys encrypted in localStorage
- [ ] XSS vulnerabilities fixed
- [ ] CSP headers implemented
- [ ] npm audit shows no high/critical issues
- [ ] Security documentation complete

---

## Worker 6: Resume Parser (resumate-parser)

### Objective
Enhance file parsing to support PDF and DOCX import with AI-powered extraction.

### Task Details
Implement advanced parsing in `/Users/ryandahlberg/Projects/cortex/ResuMate/`:

1. **PDF Parser**
   - Create `js/export/pdf-parser.js`
   - Install and integrate pdf.js library
   - Extract text from PDF
   - Preserve structure/formatting hints

2. **DOCX Parser**
   - Create `js/export/docx-parser.js`
   - Install and integrate mammoth.js
   - Extract text from DOCX
   - Parse formatting and structure

3. **AI-Powered Extraction**
   - Create `js/export/ai-extractor.js`
   - Use Claude to identify sections
   - Extract contact information
   - Parse dates and normalize formats
   - Categorize skills

4. **Main Parser Controller**
   - Enhance `js/export/parser.js`
   - Route to appropriate parser (PDF/DOCX/TXT)
   - Combine extracted data into resume schema
   - Handle parsing errors

5. **Library Integration**
   - Add pdf.js to `lib/` (via CDN or local)
   - Add mammoth.js to `lib/`
   - Update `package.json` if using npm
   - Test library compatibility

### Files to Create
```
js/export/
├── parser.js (enhance existing)
├── pdf-parser.js
├── docx-parser.js
└── ai-extractor.js

lib/
├── pdf.js (or CDN link)
└── mammoth.js (or CDN link)
```

### Acceptance Criteria
- [ ] PDF files parsed successfully
- [ ] DOCX files parsed successfully
- [ ] AI extracts sections accurately (>80%)
- [ ] Contact info extracted correctly
- [ ] Dates normalized to consistent format
- [ ] Skills categorized appropriately

---

## Coordination Notes

### Dependencies
- All workers can start in parallel (no interdependencies)
- Workers should coordinate via shared state in localStorage
- Each worker should create its files without conflicts

### Testing
- Each worker should test their functionality independently
- Integration testing will happen after Wave 1 completion
- Use existing ResuMate files as test cases

### Communication
- Workers should log progress to console
- Use structured logging for debugging
- Report blockers immediately

### Working Directory
All work should be done in: `/Users/ryandahlberg/Projects/cortex/ResuMate/`

### Port Configuration
ResuMate will run on port **3101** (already updated in server.js)
