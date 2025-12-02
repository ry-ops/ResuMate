# Job Tailoring Engine - Implementation Guide

## Overview

The Job Tailoring Engine provides one-click resume optimization by analyzing job descriptions and generating specific, actionable suggestions with before/after previews. This feature is part of Wave 2 implementation for ResuMate.

## Features Implemented

### 1. Job Description Parser (`js/ai/job-parser.js`)
- Extracts requirements, skills, and keywords from job descriptions
- Uses Claude AI for intelligent parsing
- Caches parsed results for performance
- Returns structured JSON with:
  - Job title and company
  - Required vs. preferred skills
  - Tools and technologies
  - Soft skills and culture indicators
  - Experience requirements
  - Keywords for ATS optimization

**Usage:**
```javascript
const jobData = await jobParser.parseJobDescription(jobDescription, apiKey);
console.log(jobData.requiredSkills); // Array of required skills
console.log(jobData.keywords); // ATS keywords
```

### 2. Resume-to-Job Mapper (`js/ai/mapper.js`)
- Calculates match percentage between resume and job requirements
- Provides detailed breakdown by category:
  - Required skills match (35% weight)
  - Preferred skills match (15% weight)
  - Keywords match (25% weight)
  - Tools match (15% weight)
  - Experience match (10% weight)
- Identifies gaps and missing keywords
- Generates prioritized recommendations
- Assigns letter grade (A-F)

**Usage:**
```javascript
const matchData = resumeJobMapper.calculateMatch(resumeData, jobData);
console.log(matchData.overallScore); // 0-100
console.log(matchData.grade); // "A", "B", "C", etc.
console.log(matchData.gaps.missingRequiredSkills); // Missing skills
```

### 3. Tailoring Engine (`js/ai/tailor.js`)
- Generates specific, actionable suggestions
- Provides before/after for each change
- Supports multiple suggestion types:
  - `rewrite_bullet` - Improve bullet points
  - `add_keyword` - Add missing keywords
  - `add_skill` - Add skills to Skills section
  - `modify_summary` - Update professional summary
  - `add_bullet` - Add new achievement bullets
  - `emphasize_experience` - Highlight relevant experience
  - `reorder_section` - Reorganize sections
- Tracks base resume vs. tailored versions
- Maintains session history

**Usage:**
```javascript
const session = await resumeTailor.generateSuggestions(
    resumeData,
    jobData,
    matchData,
    apiKey
);

// Apply individual suggestion
const updatedResume = resumeTailor.applySuggestion(resumeData, session.suggestions[0]);

// Apply all suggestions
const fullyTailored = resumeTailor.applyAllSuggestions(resumeData, session.suggestions);
```

### 4. Diff Viewer UI (`js/ai/diff-viewer.js`)
- Side-by-side before/after comparison
- Visual highlighting of changes
- Individual toggle switches for each suggestion
- "Apply All" batch operation
- Impact indicators (high/medium/low)
- Keyword tags for each suggestion
- Real-time statistics

**Usage:**
```javascript
const diffViewer = new DiffViewer();

diffViewer.initialize(
    containerElement,
    tailoringSession,
    (suggestion) => {
        // Handle individual apply
        console.log('Applied:', suggestion);
    },
    (suggestions) => {
        // Handle apply all
        console.log('Applied all:', suggestions.length);
    }
);
```

### 5. Diff Visualization Styles (`css/diff.css`)
- Professional, modern design
- Color-coded impact levels:
  - High impact: Red border
  - Medium impact: Orange border
  - Low impact: Blue border
- Highlighted changes:
  - Green for additions
  - Red for removals
- Responsive layout
- Smooth animations
- Print-friendly styles

## API Endpoints

### POST `/api/tailor`
Accepts resume and job description, returns parsed job data.

**Request:**
```json
{
  "resumeData": { /* resume object */ },
  "jobDescription": "job description text...",
  "apiKey": "sk-ant-api..."
}
```

**Response:**
```json
{
  "success": true,
  "jobData": {
    "jobTitle": "Senior Full Stack Engineer",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "keywords": ["scalable", "microservices"],
    "tools": ["Docker", "Kubernetes"],
    ...
  },
  "message": "Job description parsed successfully"
}
```

## Prompts Added to `prompts.js`

### `extractJobRequirements`
Parses job description into structured data:
- Required vs. preferred skills
- Experience level
- Soft skills
- Tools and technologies
- Company culture indicators
- Certifications

### `tailorResume`
Generates specific suggestions with before/after:
- Keyword additions
- Bullet point rewrites
- Skill additions
- Section reordering
- Content optimization

## Testing

Use the included test page: `test-job-tailor.html`

1. Start the server:
   ```bash
   npm run dev
   ```

2. Open test page:
   ```
   http://localhost:3101/test-job-tailor.html
   ```

3. Test flow:
   - Click "Load Sample" buttons to populate fields
   - Enter your Claude API key
   - Click "Analyze & Tailor Resume"
   - Review match analysis and suggestions
   - Apply individual suggestions or all at once

## File Structure

```
ResuMate/
├── js/ai/
│   ├── job-parser.js         # NEW - Job description parsing
│   ├── mapper.js              # NEW - Resume-to-job matching
│   ├── tailor.js              # NEW - Suggestion generation
│   ├── diff-viewer.js         # NEW - UI component
│   └── prompts.js             # UPDATED - Added 2 new prompts
├── css/
│   └── diff.css               # NEW - Diff visualization styles
├── server.js                   # UPDATED - Added /api/tailor endpoint
└── test-job-tailor.html        # NEW - Testing interface
```

## Workflow

```
1. User pastes job description
   ↓
2. Job Parser extracts requirements
   ↓
3. Mapper calculates match percentage
   ↓
4. Tailor generates specific suggestions
   ↓
5. Diff Viewer displays before/after
   ↓
6. User applies suggestions selectively
   ↓
7. Resume updated with tailored content
```

## Performance Considerations

- **Caching**: Job parser caches parsed results to avoid redundant API calls
- **Token Optimization**: Uses efficient prompts to minimize token usage
- **Progressive Loading**: Shows status updates during multi-step process
- **Client-side Processing**: Match calculation runs client-side (no API calls)

## Match Score Calculation

Weighted scoring system:
```
Overall Score =
  (Required Skills × 35%) +
  (Preferred Skills × 15%) +
  (Keywords × 25%) +
  (Tools × 15%) +
  (Experience × 10%)
```

Letter grades:
- A: 90-100%
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: <60%

## Suggestion Impact Levels

- **High**: Missing required skills, weak bullet points, poor summary
- **Medium**: Missing keywords, tools not mentioned, preferred skills
- **Low**: Optional improvements, nice-to-have additions

## Version Tracking

The system tracks:
- Base resume (original)
- Tailoring session metadata
- Applied suggestions history
- Session ID for each tailoring run
- Timestamps for all changes

## Integration with Main App

To integrate into the main ResuMate app:

```javascript
// Import modules
import jobParser from './js/ai/job-parser.js';
import resumeJobMapper from './js/ai/mapper.js';
import resumeTailor from './js/ai/tailor.js';
import DiffViewer from './js/ai/diff-viewer.js';

// In your resume builder
async function tailorToJob(resumeData, jobDescription, apiKey) {
    // Parse job
    const jobData = await jobParser.parseJobDescription(jobDescription, apiKey);

    // Calculate match
    const matchData = resumeJobMapper.calculateMatch(resumeData, jobData);

    // Generate suggestions
    const session = await resumeTailor.generateSuggestions(
        resumeData,
        jobData,
        matchData,
        apiKey
    );

    // Show in UI
    const viewer = new DiffViewer();
    viewer.initialize(container, session, handleApply, handleApplyAll);
}
```

## Acceptance Criteria Status

- [x] Job parsing extracts requirements/skills/keywords
- [x] Resume-to-job mapping calculates match %
- [x] Tailoring generates specific, actionable suggestions
- [x] Diff viewer shows before/after clearly
- [x] Changes can be applied selectively or all at once
- [x] Base resume and tailored versions tracked

## Dependencies

All features use existing dependencies:
- Express.js (server)
- Claude API (AI processing)
- No new npm packages required

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Limitations

1. **API Rate Limits**: Respects 10 requests/minute rate limit
2. **Token Limits**: Large resumes may hit token limits (handled gracefully)
3. **Cache Persistence**: Job parser cache clears on page reload
4. **JSON Parsing**: Some Claude responses may need fallback parsing

## Future Enhancements

Potential improvements for Wave 3:
- Save tailored versions to database
- Compare multiple job descriptions
- A/B testing different tailoring strategies
- Industry-specific optimization
- ATS score prediction after tailoring
- Batch tailoring for multiple jobs

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify API key is valid
3. Ensure job description is substantive (>100 words)
4. Test with sample data first

## Example Use Cases

### Use Case 1: Career Transition
Engineer → Product Manager
- Emphasizes leadership and communication
- Adds PM-specific keywords
- Reframes technical work in business impact terms

### Use Case 2: Skill Gap Filling
Missing required skills detection
- Identifies exact missing skills
- Suggests natural incorporation points
- Provides before/after examples

### Use Case 3: ATS Optimization
Improving keyword density
- Finds missing ATS keywords
- Suggests keyword-rich rewrites
- Maintains natural language

## Conclusion

The Job Tailoring Engine provides a complete, production-ready solution for AI-powered resume optimization. All acceptance criteria have been met, and the system is fully tested and documented.
