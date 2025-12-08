# ATSFlow Integration Map

**Version:** 1.0.0
**Last Updated:** December 1, 2025
**Status:** Production Ready

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Feature Integration Matrix](#feature-integration-matrix)
4. [Data Flow](#data-flow)
5. [Cross-Feature Workflows](#cross-feature-workflows)
6. [API Integration Points](#api-integration-points)
7. [Storage Schema](#storage-schema)
8. [Event System](#event-system)
9. [Analytics Integration](#analytics-integration)
10. [Future Enhancements](#future-enhancements)

---

## Overview

ATSFlow consists of **16 test pages** and **multiple integrated features** across 3 implementation waves. This document maps how all features interconnect, share data, and create cohesive user workflows.

### Wave Summary

- **Wave 1 (Core):** 5 features - Builder, Preview, Templates, AI Writer, Parser
- **Wave 2 (Advanced):** 4 features - Job Tailoring, Proofreading, ATS Scanner, Export
- **Wave 3 (Premium):** 5 features - Cover Letter Writer, Letter Templates, Versions, LinkedIn, Tracker

### Integration Philosophy

1. **Unified Data Model:** Single source of truth in localStorage
2. **Event-Driven Communication:** Features emit events that others can consume
3. **Modular Architecture:** Each feature is self-contained but interconnected
4. **Progressive Enhancement:** Core features work independently, enhanced features add value

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Navigation  │  │ Notifications │  │ Quick Shortcuts  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Feature Layer                           │
│  ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────────────┐  │
│  │ Builder  │ │ Preview │ │ AI Gen │ │ Job Tailoring    │  │
│  └──────────┘ └─────────┘ └────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────────────┐  │
│  │ ATS Scan │ │ Export  │ │ Versions│ │ Cover Letter     │  │
│  └──────────┘ └─────────┘ └────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ State Manager│  │ Event Emitter │  │ API Gateway     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Storage      │  │ Renderer     │  │ Analytics       │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ localStorage │  │ IndexedDB    │  │ Session Storage │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Integration Matrix

This matrix shows which features integrate with each other and how.

| Feature | Builder | Preview | Templates | AI | Tailor | ATS | Export | Versions | Tracker |
|---------|---------|---------|-----------|----|---------|----|--------|----------|---------|
| **Builder** | - | Real-time | Apply | Generate | Input | - | Source | Create | - |
| **Preview** | Updates | - | Switch | - | Compare | - | Source | View | - |
| **Templates** | Apply | Render | - | - | - | - | Preserve | - | - |
| **AI Writer** | Insert | - | - | - | - | - | - | - | - |
| **Job Tailor** | Update | Diff | - | Enhance | - | Check | - | Create | Link |
| **ATS Scanner** | Suggest | - | - | - | Pre-check | - | - | - | - |
| **Export** | Read | Render | Format | - | - | - | - | - | - |
| **Versions** | Load | Show | - | - | Compare | - | Export | - | Link |
| **Cover Letter** | Data | - | Template | Generate | Align | - | Include | - | - |
| **LinkedIn** | Import | - | - | Optimize | - | - | - | - | - |
| **Tracker** | Link | - | - | - | Job | - | Attach | Link | - |

### Integration Types

- **Real-time:** Live updates between features
- **Data Sharing:** Read/write shared data structures
- **Event-Based:** Publish/subscribe pattern
- **User-Initiated:** User triggers integration via UI

---

## Data Flow

### Primary Data Flow: Resume Creation & Optimization

```
┌──────────────┐
│   Builder    │ Creates/edits resume structure
└──────┬───────┘
       │ emit('resume.updated')
       ↓
┌──────────────┐
│   Preview    │ Real-time rendering
└──────┬───────┘
       │
       ├─→ Templates: Apply styling
       ├─→ Export: Generate files
       └─→ Versions: Save snapshot

┌──────────────┐
│  AI Writer   │ Generates content
└──────┬───────┘
       │ emit('content.generated')
       ↓
┌──────────────┐
│   Builder    │ Inserts AI content
└──────────────┘

┌──────────────┐
│ Job Tailor   │ Analyzes job posting
└──────┬───────┘
       │ emit('tailor.analyzed')
       ↓
┌──────────────┐
│   Builder    │ Applies suggestions
└──────┬───────┘
       │ emit('resume.updated')
       ↓
┌──────────────┐
│  ATS Scanner │ Validates changes
└──────┬───────┘
       │ emit('ats.scored')
       ↓
┌──────────────┐
│   Versions   │ Saves tailored version
└──────────────┘
```

### Data Storage Flow

```
User Action → Feature Logic → State Manager → localStorage/IndexedDB
                                    ↓
                              Event Emitter
                                    ↓
                         Listening Features Update
```

---

## Cross-Feature Workflows

### Workflow 1: Complete Resume Creation

**User Journey:** Create a professional resume from scratch

```
1. Builder
   ↓ Create sections, add content
2. AI Writer
   ↓ Generate professional descriptions
3. Builder
   ↓ Review and edit AI content
4. Templates
   ↓ Choose professional template
5. Preview
   ↓ Verify appearance
6. ATS Scanner
   ↓ Check ATS compatibility (score 85+)
7. Export
   ↓ Download as PDF/DOCX
```

**Integration Points:**
- Builder → AI Writer: Pass section context for generation
- AI Writer → Builder: Insert generated content
- Builder → Templates: Apply template styling
- Templates → Preview: Render with template
- Preview → ATS Scanner: Analyze rendered content
- ATS Scanner → Builder: Suggest improvements
- Builder → Export: Final resume data

### Workflow 2: Job Application Tailoring

**User Journey:** Tailor existing resume for specific job posting

```
1. Versions
   ↓ Load base resume version
2. Job Tailor
   ↓ Paste job description
3. Job Tailor
   ↓ Analyze match (calculate percentage)
4. Job Tailor
   ↓ Generate tailoring suggestions
5. Builder
   ↓ Apply selected suggestions
6. Preview
   ↓ Review diff (before/after)
7. ATS Scanner
   ↓ Verify ATS score improved
8. Versions
   ↓ Save as tailored version
9. Cover Letter
   ↓ Generate matching cover letter
10. Tracker
    ↓ Add to job applications Kanban
11. Export
    ↓ Download application package
```

**Integration Points:**
- Versions → Builder: Load resume
- Job Tailor → Builder: Apply changes
- Builder → Preview: Show comparison
- Preview → ATS Scanner: Validate
- Builder → Versions: Save variant
- Builder → Cover Letter: Pass context
- Job Tailor → Tracker: Link application
- All → Export: Package everything

### Workflow 3: LinkedIn Profile Optimization

**User Journey:** Import LinkedIn, optimize, export

```
1. LinkedIn Integration
   ↓ Import profile data
2. Builder
   ↓ Parse into resume sections
3. AI Writer
   ↓ Enhance descriptions
4. ATS Scanner
   ↓ Check keyword density
5. LinkedIn Integration
   ↓ Generate optimized headline
6. Export
   ↓ Export for LinkedIn (TXT format)
```

### Workflow 4: Application Tracking

**User Journey:** Manage job search pipeline

```
1. Tracker
   ↓ Create job entry (Kanban)
2. Job Tailor
   ↓ Tailor resume for position
3. Versions
   ↓ Save tailored version linked to job
4. Cover Letter
   ↓ Generate job-specific letter
5. Export
   ↓ Download application materials
6. Tracker
   ↓ Move to "Applied" status
7. Tracker
   ↓ Set follow-up reminders
8. Tracker
   ↓ Track through interview pipeline
```

---

## API Integration Points

### Claude AI API (Anthropic)

**Used By:**
- AI Resume Writer (`/test-ai.html`)
- Job Tailoring Engine (`/test-job-tailor.html`)
- Proofreading Suite (`/test-proofread.html`)
- Cover Letter Writer (`/test-coverletter.html`)
- LinkedIn Optimization (`/linkedin-integration.html`)

**Endpoints:**
```javascript
// Shared API configuration
const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

// Common request structure
{
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  temperature: 0.7,
  messages: [...]
}
```

**Rate Limiting:**
- Shared across all features
- Implement exponential backoff
- Queue requests if needed

**Error Handling:**
```javascript
try {
  const response = await callClaudeAPI(prompt);
  notify.success('Content generated successfully');
} catch (error) {
  if (error.status === 429) {
    notify.warning('Rate limit reached. Please wait...');
  } else {
    notify.error('API request failed. Please try again.');
  }
}
```

### PDF.js (Resume Parsing)

**Used By:**
- Resume Parser (`/parser-demo.html`)

**Integration:**
```javascript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
```

### Export Libraries

**html2pdf.js**
- Used by: Export Engine
- Purpose: PDF generation
- CDN: `https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js`

**docx.js**
- Used by: Export Engine
- Purpose: DOCX generation
- CDN: `https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js`

**FileSaver.js**
- Used by: Export Engine
- Purpose: File downloads
- CDN: `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js`

---

## Storage Schema

### localStorage Schema

All data stored in localStorage follows this structure:

#### Resume Data
```javascript
{
  "resumate_currentResume": {
    "id": "uuid",
    "title": "Software Engineer Resume",
    "template": "modern",
    "lastModified": "2025-12-01T19:00:00Z",
    "sections": [
      {
        "id": "section-uuid",
        "type": "personal-info",
        "order": 0,
        "data": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1 (555) 123-4567",
          "location": "San Francisco, CA",
          "linkedin": "linkedin.com/in/johndoe",
          "website": "johndoe.com"
        }
      },
      {
        "id": "section-uuid",
        "type": "experience",
        "order": 1,
        "data": {
          "entries": [
            {
              "title": "Senior Software Engineer",
              "company": "Tech Corp",
              "location": "San Francisco, CA",
              "startDate": "2020-01",
              "endDate": "present",
              "current": true,
              "description": "Led development of...",
              "achievements": [
                "Increased performance by 40%",
                "Mentored 5 junior developers"
              ]
            }
          ]
        }
      }
    ],
    "metadata": {
      "atsScore": 87,
      "lastATSScan": "2025-12-01T18:45:00Z",
      "wordCount": 450
    }
  }
}
```

#### Versions Data
```javascript
{
  "resumate_versions": {
    "base": "uuid-of-base-resume",
    "versions": [
      {
        "id": "version-uuid",
        "name": "Google - Software Engineer",
        "baseVersion": "uuid-of-base",
        "type": "tailored",
        "jobId": "tracker-job-uuid",
        "createdAt": "2025-12-01T19:00:00Z",
        "changes": {
          "section-uuid": {
            "field": "description",
            "before": "original text",
            "after": "tailored text"
          }
        }
      }
    ]
  }
}
```

#### Job Tracker Data
```javascript
{
  "resumate_tracker": {
    "jobs": [
      {
        "id": "job-uuid",
        "company": "Google",
        "position": "Software Engineer",
        "status": "applied", // wishlist, researching, applying, applied, interviewing, offer, rejected, accepted, withdrawn
        "resumeVersion": "version-uuid",
        "coverLetter": "letter-uuid",
        "appliedDate": "2025-12-01",
        "source": "LinkedIn",
        "url": "https://careers.google.com/...",
        "notes": "Referred by Jane Smith",
        "contacts": [
          {
            "name": "Jane Smith",
            "title": "Engineering Manager",
            "email": "jane@google.com"
          }
        ],
        "timeline": [
          {
            "date": "2025-12-01",
            "status": "applied",
            "notes": "Application submitted"
          }
        ]
      }
    ],
    "stats": {
      "totalApplications": 15,
      "responseRate": 0.4,
      "interviewRate": 0.2
    }
  }
}
```

#### Settings Data
```javascript
{
  "resumate_settings": {
    "apiKey": "encrypted-or-hashed",
    "theme": "light",
    "autoSave": true,
    "autoSaveInterval": 30000,
    "defaultTemplate": "modern",
    "notifications": true,
    "analytics": true
  }
}
```

### IndexedDB Schema (Future Enhancement)

For larger datasets (resume history, analytics):

```javascript
// Database: resumate_db
// Version: 1

// Object Store: resume_history
{
  keyPath: 'id',
  autoIncrement: false,
  indexes: [
    { name: 'timestamp', keyPath: 'timestamp' },
    { name: 'resumeId', keyPath: 'resumeId' }
  ]
}

// Object Store: analytics_events
{
  keyPath: 'id',
  autoIncrement: true,
  indexes: [
    { name: 'eventType', keyPath: 'eventType' },
    { name: 'timestamp', keyPath: 'timestamp' }
  ]
}
```

---

## Event System

### Event Emitter Pattern

ATSFlow uses a global event system for cross-feature communication.

```javascript
// Global event emitter (in state.js)
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

window.resumeEvents = new EventEmitter();
```

### Standard Events

#### Resume Events
```javascript
// Resume updated
resumeEvents.emit('resume.updated', {
  resumeId: 'uuid',
  changes: {...},
  timestamp: Date.now()
});

// Resume saved
resumeEvents.emit('resume.saved', {
  resumeId: 'uuid',
  autoSave: false
});

// Section added/removed
resumeEvents.emit('section.added', { sectionId: 'uuid', type: 'experience' });
resumeEvents.emit('section.removed', { sectionId: 'uuid' });
```

#### AI Events
```javascript
// AI generation started
resumeEvents.emit('ai.generating', {
  type: 'description',
  context: {...}
});

// AI generation completed
resumeEvents.emit('ai.generated', {
  type: 'description',
  content: 'Generated text...',
  metadata: {...}
});

// AI generation failed
resumeEvents.emit('ai.error', {
  error: 'Rate limit exceeded',
  retryAfter: 60000
});
```

#### ATS Events
```javascript
// ATS scan completed
resumeEvents.emit('ats.scanned', {
  score: 87,
  grade: 'B+',
  issues: [...],
  recommendations: [...]
});
```

#### Export Events
```javascript
// Export started
resumeEvents.emit('export.started', { format: 'pdf' });

// Export completed
resumeEvents.emit('export.completed', {
  format: 'pdf',
  filename: 'resume.pdf',
  size: 245678
});
```

#### Tracker Events
```javascript
// Job added
resumeEvents.emit('tracker.jobAdded', {
  jobId: 'uuid',
  company: 'Google',
  position: 'Software Engineer'
});

// Status changed
resumeEvents.emit('tracker.statusChanged', {
  jobId: 'uuid',
  from: 'applied',
  to: 'interviewing'
});
```

---

## Analytics Integration

### Analytics Events

Track user behavior and feature usage:

```javascript
// Analytics event structure
{
  eventType: 'feature_used',
  feature: 'job_tailor',
  action: 'generate_suggestions',
  metadata: {
    matchPercentage: 78,
    suggestionsCount: 12,
    appliedCount: 8
  },
  timestamp: Date.now(),
  sessionId: 'session-uuid',
  userId: 'user-uuid' // if auth added
}
```

### Tracked Events

1. **Feature Usage**
   - Which features are used most
   - Time spent in each feature
   - Feature completion rates

2. **AI Usage**
   - Number of AI generations
   - Token usage
   - Success/failure rates

3. **Export Metrics**
   - Most popular export formats
   - Template preferences
   - Export frequency

4. **Job Tracking**
   - Application funnel metrics
   - Conversion rates
   - Time to response

5. **Performance**
   - Page load times
   - Time to interactive
   - Error rates

---

## Future Enhancements

### Planned Integrations

1. **Cloud Sync**
   - Backend API for cross-device sync
   - Real-time collaboration
   - Version history in cloud

2. **Email Integration**
   - Send resumes directly from app
   - Email templates
   - Application follow-ups

3. **Calendar Integration**
   - Interview scheduling
   - Follow-up reminders
   - Application deadlines

4. **Job Board Integration**
   - Direct application to job boards
   - Auto-fill applications
   - Job recommendations

5. **GitHub Integration**
   - Import projects
   - Show contribution graph
   - Link to portfolio

6. **Dark Mode**
   - System preference detection
   - Manual toggle
   - Persistent across sessions

7. **Advanced Analytics**
   - Success rate by template
   - ATS score trends
   - A/B testing for content

8. **Mobile App**
   - Native iOS/Android apps
   - Resume scanning with camera
   - Push notifications

---

## Integration Best Practices

### 1. Loose Coupling
```javascript
// Good: Event-based communication
resumeEvents.emit('resume.updated', data);

// Bad: Direct function calls
otherFeature.updateResume(data);
```

### 2. Error Handling
```javascript
// Always handle integration errors
try {
  await integrateWithFeature();
} catch (error) {
  notify.error('Integration failed', error.message);
  // Fallback behavior
}
```

### 3. Data Validation
```javascript
// Validate data before cross-feature use
function validateResumeData(data) {
  if (!data.id || !data.sections) {
    throw new Error('Invalid resume data');
  }
  return true;
}
```

### 4. Backwards Compatibility
```javascript
// Handle missing data gracefully
const atsScore = resume.metadata?.atsScore ?? null;
```

### 5. Performance
```javascript
// Debounce frequent events
const debouncedUpdate = debounce(() => {
  resumeEvents.emit('resume.updated', data);
}, 300);
```

---

## Quick Reference

### Key Integration Points

| From | To | Method | Data |
|------|-----|--------|------|
| Builder | Preview | Event | Resume object |
| AI | Builder | Event | Generated content |
| Tailor | Builder | Event | Suggestions array |
| Builder | ATS | Event | Resume object |
| Any | Export | Function call | Resume + template |
| Builder | Versions | localStorage | Resume snapshot |
| Tailor | Tracker | Event | Job metadata |

### Common Data Structures

See [Storage Schema](#storage-schema) section for complete data models.

---

**Maintained by:** ATSFlow Development Team
**Last Review:** December 1, 2025
**Next Review:** Quarterly
