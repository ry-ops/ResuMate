# ATSFlow Quick Reference Guide

**Generated**: 2025-12-02
**Version**: 0.1.0
**Purpose**: Fast lookup for developers and architects

---

## Quick Stats

- **Lines of Code**: 50,679+
- **JavaScript Modules**: 57
- **HTML Pages**: 29 (13 main + 16 test)
- **API Endpoints**: 10
- **Templates**: 6 resume + 8 cover letter
- **Test Coverage**: 95%+
- **Security Score**: 85/100

---

## Directory Quick Map

```
ATSFlow/
├── index.html              # Landing page & analyzer
├── server.js               # Express backend (931 lines)
├── app.js                  # Main app logic (471 lines)
│
├── js/                     # 57 JavaScript modules
│   ├── state.js            # State management (385 lines)
│   ├── ai/                 # 11 AI modules
│   ├── editor/             # 7 editor modules
│   ├── export/             # 9 export/parse modules
│   ├── tracker/            # 6 tracking modules
│   ├── analyzer/           # 6 ATS modules
│   ├── coverletter/        # 5 cover letter modules
│   ├── insights/           # 4 benchmarking modules
│   ├── integrations/       # 4 LinkedIn modules
│   ├── navigation/         # 5 navigation modules
│   ├── versions/           # 5 version modules
│   ├── careerdocs/         # 4 document modules
│   ├── templates/          # Template registry
│   └── utils/              # 8 utility modules
│
├── css/                    # 23 CSS files
│   ├── variables.css       # 200+ design tokens
│   ├── templates/          # 6 template styles
│   └── [feature CSS]
│
├── templates/
│   └── cover-letters/      # 8 HTML templates
│
└── components/
    └── navigation.html     # Shared navigation
```

---

## Essential Files

### Core Application
| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | 931 | Express API server |
| `app.js` | 471 | Main application logic |
| `js/state.js` | 385 | State management |
| `index.html` | 302 | Landing page |

### Key Modules
| File | Purpose | Key Features |
|------|---------|--------------|
| `js/ai/generator.js` | AI generation | 13 methods, Claude integration |
| `js/editor/builder.js` | Resume builder | 23 section types |
| `js/export/parser.js` | Resume parser | 87-90% accuracy |
| `js/tracker/board.js` | Application tracker | Kanban with 9 columns |
| `js/analyzer/ats-scanner.js` | ATS scanning | 30+ checks |

---

## Main Pages Overview

### Production Pages

| URL | Purpose | Key Features |
|-----|---------|--------------|
| `/` or `/index.html` | Landing & analyzer | Resume/job analysis, preview, export |
| `/builder.html` | Visual builder | 23 sections, drag-drop, templates |
| `/analytics-dashboard.html` | Analytics | 7 chart types, metrics |
| `/benchmarking.html` | Industry insights | 6 sectors, skills gap |
| `/linkedin-integration.html` | LinkedIn | Profile import, optimization |
| `/parser-demo.html` | File parser | PDF/DOCX upload, AI extraction |
| `/template-test.html` | Template browser | 6 templates, preview |
| `/versions.html` | Version control | Diff, merge, history |

### Test Pages (16)

| Page | Tests |
|------|-------|
| `test-ai.html` | AI generation (13 methods) |
| `test-ats-scanner.html` | ATS checks (30+) |
| `test-coverletter.html` | Cover letters (4 modes) |
| `test-export.html` | Export (5 formats) |
| `test-job-tailor.html` | Job tailoring |
| `test-preview.html` | Preview system |
| `test-proofread.html` | Proofreading (19 patterns) |
| `test-tracker.html` | Application tracking |
| `test-version-management.html` | Version management |
| [+ 7 more] | Various features |

---

## API Endpoints Quick Reference

### Server: `http://localhost:3101`

| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| GET | `/api/config` | Server config | None |
| GET | `/health` | Health check | None |
| POST | `/api/parse` | Parse resume file | 10/min |
| POST | `/api/extract` | AI extraction | 10/min |
| POST | `/api/parse-batch` | Batch parsing | 10/min |
| POST | `/api/analyze` | Resume analysis | 10/min |
| POST | `/api/generate` | AI generation | 10/min |
| POST | `/api/tailor` | Job tailoring | 10/min |
| POST | `/api/fetch-job` | Fetch job URL | 10/min |
| POST | `/api/linkedin-search` | LinkedIn search | 10/min |

---

## LocalStorage Keys

| Key | Size | Purpose |
|-----|------|---------|
| `resumate_state` | ~5MB | Resume builder state |
| `claude_api_key` | ~100B | Encrypted API key |
| `resumate_versions` | ~5MB | Resume versions |
| `resumate_applications` | ~5MB | Job applications |
| `resumate_analytics` | ~2MB | Analytics data |
| `resumate_preferences` | ~10KB | User preferences |
| `theme` | ~10B | UI theme |
| `lastAnalysis` | ~100KB | Last analysis result |

---

## AI Features (13 Methods)

1. **Professional Summary** - Compelling intro paragraph
2. **Job Descriptions** - Expand job titles to bullets
3. **Achievement Bullets** - Task → achievement conversion
4. **Skills Extraction** - Extract from job descriptions
5. **Project Descriptions** - Project summaries with tech
6. **Cover Letters** - Full letter generation
7. **LinkedIn Headlines** - SEO-optimized (120 char)
8. **Section Content** - Any resume section
9. **Keyword Extraction** - Ranked keywords with scores
10. **Action Verb Enhancement** - Replace weak verbs
11. **Quantification Suggestions** - Add metrics prompts
12. **Tone Optimization** - Adjust professional/creative/technical
13. **Full Resume** - Complete resume from minimal input

**Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
**Response Time**: 2-5 seconds average
**Success Rate**: >90%

---

## Resume Section Types (23)

1. Header (name, contact)
2. Professional Summary
3. Work Experience
4. Education
5. Skills (technical, soft, languages, tools)
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

---

## Template System

### Resume Templates (6)

| Template | ATS Score | Best For |
|----------|-----------|----------|
| Classic | 95-100% | Traditional industries |
| Modern | 90-95% | Tech, startups |
| Creative | 85-90% | Creative fields |
| Executive | 95-100% | Leadership roles |
| Technical | 95-100% | IT, engineering |
| Minimal | 90-95% | Clean, simple look |

### Cover Letter Templates (8)

1. Traditional - Formal business
2. Modern - Contemporary design
3. Creative - Creative industries
4. Executive - Senior leadership
5. Technical - IT/Engineering
6. Entry-Level - New graduates
7. Career Changer - Transitions
8. Referral - Referral-based

---

## Export Formats (5)

| Format | Library | Features |
|--------|---------|----------|
| PDF | html2pdf.js | High-quality, selectable text |
| DOCX | docx.js | Editable, track changes |
| HTML | Native | Self-contained, styled |
| TXT | Native | Plain text, universal |
| JSON | Native | Data backup, import |

---

## ATS Scanner (30+ Checks)

### 5 Categories

1. **ATS Compatibility** (0-100)
   - File format, fonts, structure
   - 10 formatting checks

2. **Keyword Match** (0-100)
   - Job-specific keywords
   - Density analysis

3. **Content Quality** (0-100)
   - Action verbs, quantification
   - Clarity, relevance
   - 10 content checks

4. **Formatting** (0-100)
   - Layout, spacing, bullets
   - 10 structure checks

5. **Completeness** (0-100)
   - Required sections
   - Contact info, dates

**Overall Score**: Weighted average
**Letter Grade**: A+ to F
**Recommendations**: Prioritized action items

---

## State Management

### ResumeState Class

**Core State**:
```javascript
{
  sections: [],           // Resume sections
  activeSection: null,    // Currently editing
  editorMode: "split",    // edit/preview/split
  template: "modern",     // Template name
  customization: {...},   // Colors, fonts, spacing
  metadata: {...},        // Title, lastModified, version
  ui: {...}              // UI state
}
```

**Key Methods**:
- `getSections()` - Get all sections
- `addSection()` - Add new section
- `updateSection()` - Update section
- `reorderSections()` - Drag-drop reorder
- `saveToStorage()` - LocalStorage save
- `on(event, callback)` - Event subscription

**Events**:
- `sectionAdded`, `sectionUpdated`, `sectionRemoved`
- `templateChanged`, `customizationChanged`
- `stateModified`, `saveStatusChanged`

---

## Technology Stack

### Frontend
- HTML5/CSS3/JavaScript (Vanilla, no frameworks)
- Chart.js 4.4.0
- html2pdf.js 0.10.1
- docx.js 8.5.0
- FileSaver.js 2.0.5

### Backend
- Node.js 16+
- Express.js 4.22.1
- cors 2.8.5
- multer 2.0.2
- pdfjs-dist 4.10.38
- mammoth 1.6.0

### Development
- Jest (testing)
- nodemon (dev server)
- ESLint (linting)

---

## Security Features

1. **API Key Encryption** - AES-GCM 256-bit
2. **XSS Prevention** - Input sanitization
3. **CSP Headers** - Content Security Policy
4. **Rate Limiting** - 10 req/min
5. **No Server Storage** - Client-side only
6. **File Validation** - Type/size checks
7. **Security Headers** - X-Frame, X-XSS, etc.

---

## Performance Targets

- **Page Load**: < 2 seconds
- **Preview Render**: < 500ms
- **AI Response**: 2-5 seconds
- **PDF Export**: 1-3 seconds
- **Auto-save**: 30-second interval
- **Undo/Redo**: < 50ms

---

## Common Tasks

### Start Development Server
```bash
npm install
npm start
# http://localhost:3101
```

### Run Tests
```bash
npm test
# Opens test pages in browser
```

### Change Port
```bash
PORT=8080 npm start
```

### Environment Variables
```bash
# .env file
PORT=3101
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Save |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+P` | Print/Export |
| `Cmd+K` | Shortcuts menu |
| `Esc` | Close modal |
| `/` | Focus search |

---

## Integration Points

### External APIs
- **Claude AI**: https://api.anthropic.com/v1/messages
- **Job Boards**: LinkedIn, Indeed, Glassdoor, etc. (13 supported)

### CDN Services
- **cdnjs.cloudflare.com**: html2pdf.js, FileSaver.js
- **unpkg.com**: docx.js
- **fonts.googleapis.com**: Inter font

### Browser APIs
- LocalStorage (5-10MB limit)
- File API (uploads, drag-drop)
- Canvas API (charts, PDF)

---

## Project Structure Patterns

### Module Pattern
```javascript
// Each module exports functions/classes
export class MyClass { ... }
export function myFunction() { ... }
```

### State Pattern
```javascript
// Centralized state with events
resumeState.updateSection(id, data);
resumeState.on('sectionUpdated', callback);
```

### Component Pattern
```html
<!-- Shared components loaded dynamically -->
<div id="nav-container"></div>
<script src="js/navigation/loader.js"></script>
```

---

## Debugging Tips

### Enable Logging
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### View State
```javascript
// In browser console
console.log(resumeState.getState());
```

### Clear All Data
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Check API Status
```javascript
// Navigate to:
http://localhost:3101/api/config
```

---

## Common Issues & Solutions

### Issue: "No API key" error
**Solution**: Enter API key in settings or add to `.env` file

### Issue: PDF export not working
**Solution**: Check CDN libraries loaded, check console for errors

### Issue: Resume not saving
**Solution**: Check localStorage not full (5-10MB limit)

### Issue: File upload fails
**Solution**: Check file size < 10MB, correct format (PDF/DOCX/TXT)

### Issue: Rate limit exceeded
**Solution**: Wait 60 seconds between API requests

---

## Documentation Index

### Architecture
- `ARCHITECTURE_CATALOG.md` - Complete architecture catalog
- `ARCHITECTURE_DIAGRAM.txt` - Visual system diagram
- `QUICK_REFERENCE.md` - This file
- `README.md` - Project overview

### Features
- `FEATURE_DEMO_GUIDE.md` - Complete walkthrough
- `STYLE_GUIDE.md` - Design system
- `INTEGRATION_MAP.md` - System integration

### Implementation
- `WAVE_1_COMPLETION_REPORT.md` - MVP foundation
- `WAVE_2_COMPLETION_REPORT.md` - Core features
- `WAVE_3_COMPLETION_REPORT.md` - Advanced features
- `WAVE_4_COMPLETION_REPORT.md` - Analytics & insights

### Testing
- `TEST_RESULTS.md` - Test coverage report
- `BUGS_FOUND.md` - Known issues
- `TESTING_QUICK_START.md` - Test guide

### API Documentation
- `PARSER_API.md` - Parser documentation
- `AI_WRITER_README.md` - AI features
- `ANALYTICS_README.md` - Analytics system
- `BENCHMARKING_README.md` - Benchmarking
- `EXPORT_ENGINE_README.md` - Export system

### Security
- `security/SECURITY.md` - Security guide
- `security/csp-config.json` - CSP configuration

---

## Support & Resources

- **GitHub**: https://github.com/ry-ops/ATSFlow
- **Issues**: https://github.com/ry-ops/ATSFlow/issues
- **Claude AI**: https://console.anthropic.com/
- **Documentation**: See `/docs` folder

---

## Version History

- **0.1.0** (Current) - MVP + enhanced features (Waves 1-4)
- **Future**: Testing infrastructure, performance optimization (Waves 5-7)

---

**Last Updated**: 2025-12-02
**Maintainer**: ry-ops
**License**: MIT
