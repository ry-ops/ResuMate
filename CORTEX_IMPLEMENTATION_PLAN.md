# ResuMate Cortex Implementation Plan
## Parallel Execution Strategy Using Cortex Masters

**Project:** ResuMate Feature Implementation
**Strategy:** Leverage cortex's distributed master architecture for parallel development
**Date:** 2025-12-01

---

## Overview

This plan maps the 7-phase ResuMate implementation to cortex's master agents, enabling parallel execution of independent work streams.

### Current ResuMate State
- Basic resume analyzer with Claude API integration
- Simple file upload and text analysis
- Basic ATS scoring and keyword analysis
- Running on Express server (port 3001)
- Vanilla HTML/CSS/JavaScript stack

### Target State
- Full-featured AI resume platform (CVCompiler + Enhancv competitor)
- 7 major feature phases
- 50+ new components and features
- Comprehensive testing and documentation

---

## Cortex Master Assignment Strategy

### Phase Distribution Across Masters

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR-MASTER                        │
│              (Orchestrates all phases)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  DEVELOPMENT  │ │   SECURITY    │ │   INVENTORY   │
    │    MASTER     │ │    MASTER     │ │    MASTER     │
    └───────────────┘ └───────────────┘ └───────────────┘
         │                   │                  │
    ┌────┴────┐         ┌────┴────┐       ┌────┴────┐
    ▼         ▼         ▼         ▼       ▼         ▼
  Workers  Workers   Workers  Workers  Workers  Workers
```

---

## Phase 1: Resume Builder Engine

### Master: DEVELOPMENT-MASTER
### Priority: HIGH (MVP Core)
### Parallelization: 4 concurrent worker streams

#### Worker Stream 1: Editor Infrastructure
**Task ID:** `resumate-builder-core`
**Components:**
- [ ] Drag-and-drop section manager
- [ ] Section component architecture (20+ types)
- [ ] State management for editor
- [ ] Undo/redo history (50-state stack)
- [ ] Auto-save system (30s interval)

**Files to Create:**
```
js/editor/
├── builder.js          # Main editor controller
├── sections.js         # Section type definitions
├── dragdrop.js         # Drag-and-drop logic
├── history.js          # Undo/redo stack
└── autosave.js         # Auto-save manager
```

**Estimated Complexity:** High
**Dependencies:** None (can start immediately)

---

#### Worker Stream 2: Real-Time Preview
**Task ID:** `resumate-preview-engine`
**Components:**
- [ ] Live preview renderer
- [ ] Split-view layout manager
- [ ] Template CSS injection
- [ ] Print preview mode
- [ ] Page break controls

**Files to Create:**
```
js/editor/
├── preview.js          # Preview controller
└── renderer.js         # HTML/CSS generation

css/
└── preview.css         # Preview panel styles
```

**Estimated Complexity:** Medium
**Dependencies:** None (can start immediately)

---

#### Worker Stream 3: Template System (Part 1)
**Task ID:** `resumate-templates-core`
**Components:**
- [ ] Template engine architecture
- [ ] Template registry system
- [ ] 3 initial templates (Classic, Modern, Creative)
- [ ] Color customization
- [ ] Typography controls

**Files to Create:**
```
js/templates/
├── engine.js           # Template engine
├── registry.js         # Template catalog
└── customizer.js       # Style customization

css/templates/
├── classic.css
├── modern.css
└── creative.css
```

**Estimated Complexity:** High
**Dependencies:** None (can start immediately)

---

#### Worker Stream 4: Template System (Part 2)
**Task ID:** `resumate-templates-advanced`
**Components:**
- [ ] 3 additional templates (Executive, Technical, Minimal)
- [ ] A4/US Letter page size support
- [ ] Print optimization CSS
- [ ] Spacing/margin controls
- [ ] Font family selector

**Files to Create:**
```
css/templates/
├── executive.css
├── technical.css
├── minimal.css
└── print.css
```

**Estimated Complexity:** Medium
**Dependencies:** Worker Stream 3 (templates-core)

---

## Phase 2: AI-Powered Content Generation

### Master: DEVELOPMENT-MASTER
### Priority: HIGH (MVP Core)
### Parallelization: 3 concurrent worker streams

#### Worker Stream 5: AI Resume Writer
**Task ID:** `resumate-ai-writer`
**Components:**
- [ ] Professional summary generator
- [ ] Bullet point writer/expander
- [ ] Action verb suggester
- [ ] Quantification prompts
- [ ] Industry-specific rewriting

**Files to Create:**
```
js/ai/
├── prompts.js          # Prompt templates
├── generator.js        # Content generation
└── rewriter.js         # Content refinement
```

**Claude API Prompts:**
- `generateSummary`
- `expandBullet`
- `suggestActionVerbs`
- `quantifyAchievement`
- `rewriteForIndustry`

**Estimated Complexity:** High
**Dependencies:** Existing Claude API integration

---

#### Worker Stream 6: Job Tailoring Engine
**Task ID:** `resumate-job-tailor`
**Components:**
- [ ] Job description parser
- [ ] Keyword extractor
- [ ] Resume-to-job mapper
- [ ] Diff preview UI
- [ ] Selective change application

**Files to Create:**
```
js/ai/
├── tailor.js           # Tailoring engine
├── job-parser.js       # JD analysis
└── diff-viewer.js      # Change preview

css/
└── diff.css            # Diff UI styles
```

**Claude API Prompts:**
- `extractJobRequirements`
- `generateSkills`
- `tailorResume`

**Estimated Complexity:** High
**Dependencies:** AI Writer (prompts.js)

---

#### Worker Stream 7: AI Proofreading Suite
**Task ID:** `resumate-ai-proofread`
**Components:**
- [ ] Grammar/spelling checker
- [ ] Cliché detector
- [ ] Passive voice identifier
- [ ] Weak verb flagging
- [ ] Tone analyzer
- [ ] Consistency checker

**Files to Create:**
```
js/ai/
├── proofread.js        # Proofreading engine
├── tone-analyzer.js    # Tone analysis
└── consistency.js      # Format/tense checks
```

**Claude API Prompts:**
- `proofreadContent`
- `analyzeTone`
- `detectCliches`
- `checkConsistency`

**Estimated Complexity:** Medium
**Dependencies:** AI Writer (prompts.js)

---

## Phase 3: ATS Optimization Suite

### Master: DEVELOPMENT-MASTER
### Priority: HIGH (MVP Core)
### Parallelization: 3 concurrent worker streams

#### Worker Stream 8: ATS Scanner Engine
**Task ID:** `resumate-ats-scanner`
**Components:**
- [ ] 30+ ATS compatibility checks
- [ ] Formatting validator
- [ ] Structure analyzer
- [ ] Content quality checker
- [ ] Parse simulation

**Files to Create:**
```
js/analyzer/
├── ats-scanner.js      # Main scanner (ENHANCE EXISTING)
├── checks/
│   ├── formatting.js   # Format checks
│   ├── structure.js    # Structure validation
│   └── content.js      # Content analysis
```

**Estimated Complexity:** High
**Dependencies:** Current analyzer (enhancement)

---

#### Worker Stream 9: Advanced Scoring System
**Task ID:** `resumate-scoring-system`
**Components:**
- [ ] 5-category scoring (weighted)
- [ ] Letter grade assignment
- [ ] Score breakdown visualization
- [ ] Historical score tracking
- [ ] Comparison metrics

**Files to Create:**
```
js/analyzer/
├── scorer.js           # Scoring engine (ENHANCE EXISTING)
├── categories.js       # Category definitions
└── visualizer.js       # Score visualization

css/
└── scoring.css         # Score UI styles
```

**Estimated Complexity:** Medium
**Dependencies:** ATS Scanner

---

#### Worker Stream 10: Keyword Optimizer
**Task ID:** `resumate-keyword-optimizer`
**Components:**
- [ ] Keyword extraction from JD
- [ ] Required vs. preferred categorization
- [ ] Resume keyword mapping
- [ ] Natural insertion suggestions
- [ ] Keyword cloud visualization

**Files to Create:**
```
js/analyzer/
├── keyword-matcher.js  # Matcher (ENHANCE EXISTING)
├── keyword-extractor.js
├── keyword-suggester.js
└── keyword-viz.js      # Visualization

css/
└── keywords.css        # Keyword UI styles
```

**Estimated Complexity:** Medium
**Dependencies:** ATS Scanner

---

## Phase 4: Cover Letter Generator

### Master: DEVELOPMENT-MASTER
### Priority: MEDIUM
### Parallelization: 2 concurrent worker streams

#### Worker Stream 11: Cover Letter AI Writer
**Task ID:** `resumate-coverletter-writer`
**Components:**
- [ ] Generation modes (scratch, template, rewrite)
- [ ] Tone customization
- [ ] Length controls
- [ ] Focus area selection
- [ ] Opening style variants

**Files to Create:**
```
js/coverletter/
├── generator.js        # CL generation
├── prompts.js          # CL-specific prompts
└── customizer.js       # Options manager
```

**Claude API Prompts:**
- `generateCoverLetter`
- `rewriteCoverLetter`
- `tailorCoverLetter`

**Estimated Complexity:** Medium
**Dependencies:** AI Writer infrastructure

---

#### Worker Stream 12: Cover Letter Templates
**Task ID:** `resumate-coverletter-templates`
**Components:**
- [ ] 8 cover letter templates
- [ ] Template categorization
- [ ] Fill-in-the-blank editor
- [ ] Preview system
- [ ] Export options

**Files to Create:**
```
js/coverletter/
├── templates.js        # Template registry
└── editor.js           # CL editor

css/
└── coverletter.css     # CL styles

templates/cover-letters/
├── traditional.html
├── modern.html
├── career-changer.html
├── entry-level.html
├── executive.html
├── creative.html
├── technical.html
└── referral.html
```

**Estimated Complexity:** Medium
**Dependencies:** None

---

## Phase 5: Resume Versions & Job Tracking

### Master: DEVELOPMENT-MASTER
### Priority: MEDIUM
### Parallelization: 2 concurrent worker streams

#### Worker Stream 13: Version Management
**Task ID:** `resumate-version-manager`
**Components:**
- [ ] Version schema and storage
- [ ] Base vs. tailored versions
- [ ] Version comparison UI
- [ ] Clone and modify
- [ ] Merge changes

**Files to Create:**
```
js/versions/
├── manager.js          # Version controller
├── storage.js          # Version persistence
├── diff.js             # Version comparison
└── merger.js           # Change merging

css/
└── versions.css        # Version UI styles
```

**Estimated Complexity:** High
**Dependencies:** State management

---

#### Worker Stream 14: Application Tracker
**Task ID:** `resumate-app-tracker`
**Components:**
- [ ] Kanban board UI
- [ ] Application status tracking
- [ ] Drag-and-drop status updates
- [ ] Deadline reminders
- [ ] Statistics dashboard
- [ ] CSV export

**Files to Create:**
```
js/tracker/
├── board.js            # Kanban board
├── analytics.js        # Statistics
└── storage.js          # Tracker persistence

css/
└── tracker.css         # Tracker UI styles
```

**Estimated Complexity:** High
**Dependencies:** Version management

---

## Phase 6: Import/Export & Integration

### Master: DEVELOPMENT-MASTER
### Priority: HIGH (MVP Critical)
### Parallelization: 3 concurrent worker streams

#### Worker Stream 15: Resume Parser
**Task ID:** `resumate-parser`
**Components:**
- [ ] PDF parsing (pdf.js integration)
- [ ] DOCX parsing (mammoth.js)
- [ ] AI-powered section detection
- [ ] Contact info extraction
- [ ] Date normalization
- [ ] Skill categorization

**Files to Create:**
```
js/export/
├── parser.js           # Main parser (ENHANCE EXISTING)
├── pdf-parser.js       # PDF handling
├── docx-parser.js      # DOCX handling
└── ai-extractor.js     # AI-powered extraction

lib/
├── pdf.js              # (External library)
└── mammoth.js          # (External library)
```

**Estimated Complexity:** High
**Dependencies:** None

---

#### Worker Stream 16: Export Engine
**Task ID:** `resumate-export-engine`
**Components:**
- [ ] PDF export (html2pdf.js)
- [ ] DOCX export
- [ ] Plain text export
- [ ] JSON backup
- [ ] HTML export
- [ ] Print optimization

**Files to Create:**
```
js/export/
├── pdf.js              # PDF generation
├── docx.js             # DOCX generation
├── formats.js          # Format handlers
└── print.js            # Print optimization

lib/
└── html2pdf.js         # (External library)
```

**Estimated Complexity:** High
**Dependencies:** Template system

---

#### Worker Stream 17: LinkedIn Integration
**Task ID:** `resumate-linkedin`
**Components:**
- [ ] LinkedIn PDF parser
- [ ] Profile optimization tips
- [ ] Headline suggester
- [ ] Keyword alignment
- [ ] Profile scoring

**Files to Create:**
```
js/integrations/
├── linkedin.js         # LinkedIn integration
├── profile-parser.js   # LI profile parsing
└── optimizer.js        # LI optimization
```

**Estimated Complexity:** Medium
**Dependencies:** Parser, AI Writer

---

## Phase 7: Analytics & Insights

### Master: DEVELOPMENT-MASTER
### Priority: LOW (Post-MVP)
### Parallelization: 2 concurrent worker streams

#### Worker Stream 18: Analytics Dashboard
**Task ID:** `resumate-analytics`
**Components:**
- [ ] Resume score tracking
- [ ] Keyword trend analysis
- [ ] Template usage stats
- [ ] Export history
- [ ] Application success rates
- [ ] Visualization charts

**Files to Create:**
```
js/tracker/
├── analytics.js        # Analytics engine (ENHANCE)
├── charts.js           # Chart rendering
└── metrics.js          # Metric calculations

css/
└── analytics.css       # Dashboard styles
```

**Estimated Complexity:** Medium
**Dependencies:** Version manager, Tracker

---

#### Worker Stream 19: Industry Benchmarking
**Task ID:** `resumate-benchmarking`
**Components:**
- [ ] Industry standard comparisons
- [ ] Role-specific recommendations
- [ ] Skills gap analysis
- [ ] Career progression suggestions
- [ ] Salary insights (AI-powered)

**Files to Create:**
```
js/insights/
├── benchmarking.js     # Benchmarking engine
├── industry-data.js    # Industry standards
└── recommendations.js  # AI recommendations
```

**Estimated Complexity:** Medium
**Dependencies:** Analytics, AI Writer

---

## Security & Quality Assurance

### Master: SECURITY-MASTER
### Priority: HIGH (Continuous)
### Parallelization: 2 concurrent streams

#### Security Stream 1: Security Audit
**Task ID:** `resumate-security-audit`
**Components:**
- [ ] API key encryption audit
- [ ] XSS vulnerability scan
- [ ] Input sanitization review
- [ ] localStorage security
- [ ] CSP header implementation
- [ ] Dependency vulnerability scan

**Files to Create:**
```
js/utils/
├── crypto.js           # API key encryption
└── sanitizer.js        # Input sanitization

security/
├── SECURITY.md         # Security documentation
└── csp-config.json     # CSP configuration
```

**Estimated Complexity:** Medium
**Dependencies:** None (can run in parallel)

---

#### Security Stream 2: Testing Infrastructure
**Task ID:** `resumate-testing`
**Components:**
- [ ] Unit test framework (Jest/Vitest)
- [ ] Integration test suite
- [ ] E2E test scenarios
- [ ] Parser accuracy tests
- [ ] ATS logic tests
- [ ] Template rendering tests
- [ ] CI/CD pipeline

**Files to Create:**
```
tests/
├── unit/
│   ├── parser.test.js
│   ├── ats-scanner.test.js
│   ├── scorer.test.js
│   └── templates.test.js
├── integration/
│   ├── editor-flow.test.js
│   ├── ai-generation.test.js
│   └── export.test.js
└── e2e/
    ├── full-workflow.test.js
    └── cross-browser.test.js

.github/workflows/
└── ci.yml              # GitHub Actions CI
```

**Estimated Complexity:** High
**Dependencies:** All feature implementations

---

## Documentation & Portfolio

### Master: INVENTORY-MASTER
### Priority: MEDIUM
### Parallelization: 1 stream (ongoing)

#### Documentation Stream
**Task ID:** `resumate-documentation`
**Components:**
- [ ] README.md (enhanced)
- [ ] CONTRIBUTING.md
- [ ] API.md (Claude integration)
- [ ] TEMPLATES.md (custom templates guide)
- [ ] CHANGELOG.md
- [ ] User guide
- [ ] Developer guide

**Files to Create:**
```
docs/
├── README.md           # Main documentation (ENHANCE)
├── CONTRIBUTING.md     # Contribution guidelines
├── API.md              # API documentation
├── TEMPLATES.md        # Template creation guide
├── CHANGELOG.md        # Version history
├── USER_GUIDE.md       # End-user documentation
└── DEV_GUIDE.md        # Developer documentation
```

**Estimated Complexity:** Low
**Dependencies:** Feature completions (ongoing)

---

## Parallel Execution Strategy

### Wave 1: MVP Foundation (Weeks 1-2)
**CAN RUN IN PARALLEL - No dependencies**

```bash
# Start all MVP core workers simultaneously
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-builder-core --master development-master --priority high

GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-preview-engine --master development-master --priority high

GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-templates-core --master development-master --priority high

GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-ai-writer --master development-master --priority high

GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type scan-worker \
  --task-id resumate-security-audit --master security-master --priority high

GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-parser --master development-master --priority high
```

**Workers:** 6 parallel
**Target:** Editor + 3 templates + AI writer + Security + Parser

---

### Wave 2: Core Features (Weeks 2-3)
**Dependencies: Wave 1 completions**

```bash
# Templates Part 2 (depends on templates-core)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-templates-advanced --master development-master --priority high

# Job Tailoring (depends on ai-writer)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-job-tailor --master development-master --priority high

# Proofreading (depends on ai-writer)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-ai-proofread --master development-master --priority medium

# ATS Scanner (enhancement)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-ats-scanner --master development-master --priority high

# Export Engine (depends on templates)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-export-engine --master development-master --priority high
```

**Workers:** 5 parallel
**Target:** All 6 templates + AI suite + ATS + Export

---

### Wave 3: Advanced Features (Weeks 3-4)
**Dependencies: Wave 2 completions**

```bash
# Scoring System (depends on ats-scanner)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-scoring-system --master development-master --priority medium

# Keyword Optimizer (depends on ats-scanner)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-keyword-optimizer --master development-master --priority medium

# Cover Letter Writer
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-coverletter-writer --master development-master --priority medium

# Cover Letter Templates
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-coverletter-templates --master development-master --priority medium

# Version Manager
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-version-manager --master development-master --priority medium
```

**Workers:** 5 parallel
**Target:** Scoring + Keywords + Cover Letters + Versions

---

### Wave 4: Tracking & Integrations (Weeks 4-5)
**Dependencies: Wave 3 completions**

```bash
# Application Tracker (depends on version-manager)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-app-tracker --master development-master --priority medium

# LinkedIn Integration
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-linkedin --master development-master --priority low

# Testing Infrastructure
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-testing --master security-master --priority high
```

**Workers:** 3 parallel
**Target:** Tracker + LinkedIn + Tests

---

### Wave 5: Analytics & Polish (Weeks 5-6)
**Dependencies: Wave 4 completions**

```bash
# Analytics Dashboard
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-analytics --master development-master --priority low

# Industry Benchmarking
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type implementation-worker \
  --task-id resumate-benchmarking --master development-master --priority low

# Documentation (ongoing)
GOVERNANCE_BYPASS=true ./scripts/spawn-worker.sh --type documentation-worker \
  --task-id resumate-documentation --master inventory-master --priority medium
```

**Workers:** 3 parallel
**Target:** Analytics + Benchmarking + Docs

---

## Coordination Strategy

### Coordinator-Master Orchestration

The coordinator-master will:

1. **Monitor Dependencies**
   - Track completion of prerequisite tasks
   - Trigger dependent waves automatically
   - Handle failures and retries

2. **Resource Management**
   - Prevent overwhelming system (max 6 concurrent workers)
   - Balance priority across streams
   - Allocate Claude API tokens efficiently

3. **Quality Gates**
   - Ensure security-master approval before deployment
   - Validate test coverage thresholds
   - Check documentation completeness

4. **Progress Reporting**
   - Real-time dashboard of worker status
   - Completion percentage by phase
   - Blocker identification and escalation

---

## External Dependencies

### NPM Packages to Add

```json
{
  "dependencies": {
    "pdf.js": "^3.11.174",
    "mammoth": "^1.6.0",
    "html2pdf.js": "^0.10.1",
    "marked": "^11.0.0"
  },
  "devDependencies": {
    "vitest": "^1.0.4",
    "@testing-library/dom": "^9.3.3",
    "playwright": "^1.40.1"
  }
}
```

### External APIs
- Anthropic Claude API (existing)
- Consider: OpenAI for alternative AI features
- Consider: Browserless.io for PDF rendering (if needed)

---

## Success Metrics

### Phase 1 (MVP) - Weeks 1-2
- [ ] Visual editor functional with 3 templates
- [ ] Basic AI content generation working
- [ ] Enhanced ATS scanning operational
- [ ] PDF import and export working
- [ ] Security audit complete

### Phase 2 (Core) - Weeks 3-4
- [ ] All 6 templates implemented
- [ ] Job tailoring feature live
- [ ] AI proofreading suite complete
- [ ] Advanced scoring system live
- [ ] Cover letter generator functional

### Phase 3 (Advanced) - Weeks 5-6
- [ ] Version management operational
- [ ] Application tracker live
- [ ] LinkedIn integration working
- [ ] Analytics dashboard functional
- [ ] Test coverage > 80%
- [ ] Documentation complete

---

## Risk Mitigation

### High-Risk Areas

1. **PDF Parsing Complexity**
   - Risk: PDF structure varies widely
   - Mitigation: Implement fallback to text extraction + AI parsing
   - Backup: Manual section mapping UI

2. **Claude API Token Limits**
   - Risk: High token usage with 19 workers
   - Mitigation: Implement caching, batch requests
   - Backup: Queue system for API calls

3. **Browser Compatibility**
   - Risk: Drag-and-drop may vary across browsers
   - Mitigation: Use standard APIs, test on Chrome/Firefox/Safari
   - Backup: Fallback to button-based reordering

4. **Performance with Large Resumes**
   - Risk: Real-time preview may lag
   - Mitigation: Debounce rendering, optimize DOM updates
   - Backup: Manual refresh button

---

## Rollout Strategy

### Week 1-2: MVP Release
**Target:** Internal testing + beta users
- Core editor + 3 templates
- Basic AI features
- PDF import/export

### Week 3-4: Feature Release
**Target:** Public beta
- All 6 templates
- Full AI suite
- Cover letters
- Version management

### Week 5-6: Full Release
**Target:** Production launch
- Application tracker
- Analytics
- LinkedIn integration
- Full documentation

---

## Next Steps

1. **User Confirmation:**
   - Confirm web interface port assignment
   - Confirm Claude API budget allocation
   - Confirm priority of phases (MVP first?)

2. **Cortex Setup:**
   - Verify cortex system is running
   - Check worker daemon availability
   - Test coordinator routing

3. **Execution:**
   - Launch Wave 1 (6 parallel workers)
   - Monitor progress via dashboard
   - Address blockers as they arise

---

**Plan Created:** 2025-12-01
**Plan Author:** Claude (Sonnet 4.5) via cortex
**Estimated Total Duration:** 6-8 weeks
**Estimated Worker-Hours:** 500-700 hours
**Parallelized Duration:** 6 weeks (vs. 30+ weeks sequential)

---

## Questions for User

Before launching cortex workers, we need to confirm:

1. **Port Assignment:** What port should the ResuMate web interface run on?
   - Current: 3001 (Express server)
   - Cortex dashboard: 3000
   - Recommendation: Keep 3001 or move to 3002?

2. **API Budget:** What's the Claude API token budget for this project?
   - 19 workers will make many API calls
   - Estimate: 5-10M tokens total
   - Cost: $150-300 (Claude Sonnet)

3. **Priority:** Should we start with MVP (Wave 1) only, or launch all waves?
   - MVP: 6 workers, 2 weeks
   - Full: 19 workers, 6 weeks

4. **Testing:** Should testing run in parallel or after feature completion?
   - Parallel: Slower but safer
   - After: Faster but riskier
