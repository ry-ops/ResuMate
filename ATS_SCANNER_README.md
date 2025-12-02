# ResuMate ATS Scanner v2 - Quick Reference Guide

**Version:** 2.0.0
**Date:** December 1, 2025

## Overview

The Enhanced ATS Scanner v2 provides comprehensive resume analysis with **30+ checks**, **5-category weighted scoring**, **letter grades**, and **prioritized recommendations**.

## Quick Start

### 1. Test the Scanner

Open the test page:
```bash
open http://localhost:3101/test-ats-scanner.html
```

Or directly:
```bash
open /Users/ryandahlberg/Projects/cortex/ResuMate/test-ats-scanner.html
```

### 2. Basic Usage

```javascript
// Run full scan
const results = await atsScanner.scan(resumeData, {
    fileFormat: 'pdf',
    industry: 'software'
});

console.log(`Score: ${results.score.overallScore}/100`);
console.log(`Grade: ${results.score.grade}`);
console.log(`Passed: ${results.checks.passed}/${results.checks.total}`);
```

### 3. Quick Scan (Critical Checks Only)

```javascript
const quickResults = await atsScanner.quickScan(resumeData);
console.log(`Quick Score: ${quickResults.score}/100`);
```

## Features

### 30+ Comprehensive Checks

#### Formatting (10 checks)
- No tables or table-based layouts
- No multi-column layouts
- No headers/footers
- No images, charts, icons
- No text boxes or floating elements
- Web-safe fonts only
- No Unicode bullets
- Consistent date formats
- Supported file format (PDF/DOCX)
- No background colors

#### Structure (10 checks)
- Standard section headers
- Parseable contact information
- Chronological order (reverse)
- Acronyms spelled out
- Clear job titles
- Proper section ordering
- No orphaned content
- Consistent heading hierarchy
- Clear section boundaries
- No complex tables

#### Content (10 checks)
- Keyword density analysis
- Dedicated skills section
- Quantified achievements
- No personal pronouns
- Action verb bullets
- Appropriate length (1-2 pages)
- No typos or grammar errors
- Industry-specific keywords
- Proper noun capitalization
- No excessive jargon

### 5-Category Weighted Scoring

```
ATS Compatibility:  25%  (Formatting + Structure + Parseability)
Keyword Match:      25%  (Hard Skills + Soft Skills + Tools)
Content Quality:    20%  (Action Verbs + Quantification + Specificity)
Formatting:         15%  (Consistency + Readability + Length)
Completeness:       15%  (Sections + Contact Info + Dates)
```

### Letter Grade Scale

| Grade | Range | Description |
|-------|-------|-------------|
| A+ | 97-100 | Exceptional - Top 1% |
| A  | 93-96  | Excellent - Highly competitive |
| A- | 90-92  | Very Good - Strong candidate |
| B+ | 87-89  | Good - Above average |
| B  | 83-86  | Good - Competitive |
| B- | 80-82  | Acceptable - Some improvements needed |
| C+ | 77-79  | Fair - Several improvements needed |
| C  | 73-76  | Fair - Significant work needed |
| C- | 70-72  | Below Average - Major revisions needed |
| D  | 60-69  | Poor - Extensive revisions required |
| F  | 0-59   | Fail - Complete rewrite recommended |

## API Reference

### Main Scanner (`atsScanner`)

#### `scan(resumeData, options)`
Run comprehensive analysis with all 30+ checks.

**Parameters:**
- `resumeData` (Object): Resume data object
- `options` (Object):
  - `fileFormat` (String): 'pdf', 'docx', etc.
  - `industry` (String): 'software', 'marketing', 'finance', etc.

**Returns:** Complete analysis object with scores, checks, recommendations

#### `quickScan(resumeData, options)`
Run quick scan with critical checks only (faster).

**Returns:** Quick scan results with basic score

#### `compareResumes(resume1, resume2, options)`
Compare two resumes side-by-side.

**Returns:** Comparison object showing differences

#### `exportResults(results, format)`
Export results in various formats.

**Formats:**
- `'json'`: Full JSON export
- `'summary'`: Text summary
- `'csv'`: CSV format
- `'html'`: HTML report

#### `getHistory()`
Get scan history from localStorage.

**Returns:** Array of historical scans

#### `getStatistics()`
Get statistics from scan history.

**Returns:** Object with averages, trends, etc.

### Scorer (`atsScorer`)

#### `calculateScore(checkResults, options)`
Calculate comprehensive score from check results.

**Returns:** Score object with breakdown

#### `compareScores(currentScore, previousScore)`
Compare two scores to show improvement.

**Returns:** Comparison object

#### `getScoreTrend(scoreHistory)`
Analyze score trend over time.

**Returns:** Trend analysis (improving/declining/stable)

#### `generateRoadmap(scoreResult)`
Generate improvement roadmap.

**Returns:** Quick wins, short-term, long-term improvements

#### `saveToHistory(scoreResult)`
Save score to localStorage history.

#### `getHistory()`
Get score history.

### Recommendations Engine (`recommendationsEngine`)

#### `generate(checkResults, scoreResult, options)`
Generate prioritized recommendations.

**Parameters:**
- `checkResults` (Array): All check results
- `scoreResult` (Object): Score breakdown
- `options` (Object):
  - `industry` (String): Target industry for tips

**Returns:** Recommendations object with quick wins, major improvements

#### `generateMatrix(recommendations)`
Generate impact vs. effort matrix.

**Returns:** Matrix organized by priority quadrants

#### `exportActionPlan(recommendations, format)`
Export recommendations as action plan.

**Formats:**
- `'markdown'`: Markdown format
- `'checklist'`: Simple checklist
- `'json'`: JSON format

### Check Modules

Each check module has:
- `runAll(resumeData, options)`: Run all checks in category
- `getSummary(results)`: Get summary of results

**Modules:**
- `formattingChecks`: 10 formatting checks
- `structureChecks`: 10 structure checks
- `contentChecks`: 10 content checks

## Result Structure

```javascript
{
  version: "2.0.0",
  timestamp: "2025-12-01T...",
  executionTime: 350, // milliseconds

  score: {
    overallScore: 87,
    grade: "B+",
    gradeDescription: "Good - Above average",
    percentile: 90,
    categoryScores: {
      atsCompatibility: { score: 92, weight: 25, ... },
      keywordMatch: { score: 85, weight: 25, ... },
      contentQuality: { score: 88, weight: 20, ... },
      formatting: { score: 90, weight: 15, ... },
      completeness: { score: 82, weight: 15, ... }
    },
    breakdown: {
      categories: [...],
      criticalIssues: [...],
      highPriorityIssues: [...],
      mediumPriorityIssues: [...],
      lowPriorityIssues: [...]
    },
    strengths: [...],
    weaknesses: [...]
  },

  checks: {
    total: 30,
    passed: 24,
    failed: 6,
    results: [
      {
        category: "formatting",
        checkName: "noTables",
        passed: true,
        score: 100,
        severity: "pass",
        message: "...",
        recommendation: null,
        impact: "critical",
        details: {...}
      },
      // ... more checks
    ]
  },

  summaries: {
    formatting: { averageScore: 90, passed: 8, failed: 2, ... },
    structure: { averageScore: 85, passed: 7, failed: 3, ... },
    content: { averageScore: 88, passed: 9, failed: 1, ... }
  },

  recommendations: {
    summary: {
      totalRecommendations: 6,
      criticalCount: 1,
      highCount: 2,
      mediumCount: 2,
      lowCount: 1,
      estimatedTime: { hours: 1.5, minutes: 90, formatted: "1h 30m" }
    },
    quickWins: [
      {
        rank: 1,
        issue: "...",
        recommendation: "...",
        impact: "high",
        effort: "low",
        priorityScore: 150,
        steps: [...],
        examples: [...]
      },
      // ... more quick wins
    ],
    majorImprovements: [...],
    allRecommendations: [...],
    categorized: {
      atsCompatibility: [...],
      content: [...],
      formatting: [...],
      keywords: [...],
      structure: [...]
    },
    industryTips: [
      {
        tip: "...",
        reason: "...",
        example: "..."
      }
    ]
  },

  metadata: {
    resumeWordCount: 850,
    resumeSections: 6,
    fileFormat: "pdf",
    targetIndustry: "software"
  }
}
```

## Integration Examples

### With Resume Builder

```javascript
// In your resume builder
function analyzeCurrentResume() {
    const resumeData = resumeState.getState();

    const results = await atsScanner.scan(resumeData, {
        fileFormat: 'pdf',
        industry: getUserIndustry()
    });

    displayScoreCard(results.score);
    showRecommendations(results.recommendations.quickWins);
}
```

### With AI Writer

```javascript
// Get keyword suggestions
const results = await atsScanner.scan(resumeData);
const missingKeywords = results.recommendations.categorized.keywords;

// Use AI to improve content
for (const rec of results.recommendations.quickWins) {
    if (rec.impact === 'high') {
        const improved = await aiWriter.improve(rec.issue, rec.recommendation);
        // Apply improvement
    }
}
```

### Real-Time Analysis

```javascript
// Listen for resume changes
resumeState.on('stateModified', async () => {
    // Debounce analysis
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(async () => {
        const results = await atsScanner.quickScan(
            resumeState.getState()
        );
        updateScoreBadge(results.score);
    }, 1000);
});
```

## Visualization

### Include CSS

```html
<link rel="stylesheet" href="css/scoring.css">
```

### Display Score Card

```javascript
function displayScore(scoreResult) {
    const gradeClass = scoreResult.grade.toLowerCase().replace(/[^a-z]/g, '-');

    const html = `
        <div class="score-card grade-${gradeClass}">
            <div class="score-display">
                <div class="score-number">${scoreResult.overallScore}</div>
                <div class="score-divider">/</div>
                <div class="score-total">100</div>
            </div>
            <div class="score-grade">${scoreResult.grade}</div>
            <div class="score-description">${scoreResult.gradeDescription}</div>
        </div>
    `;

    document.getElementById('scoreCard').innerHTML = html;
}
```

### Display Category Breakdown

```javascript
function displayCategories(breakdown) {
    const html = breakdown.categories.map(cat => `
        <div class="category-card">
            <div class="category-header">
                <div class="category-name">${cat.displayName}</div>
                <div class="category-score">${cat.score}</div>
            </div>
            <div class="category-progress">
                <div class="category-progress-bar ${cat.status}"
                     style="width: ${cat.score}%"></div>
            </div>
            <div class="category-status ${cat.status}">${cat.status}</div>
        </div>
    `).join('');

    document.getElementById('categoryBreakdown').innerHTML = html;
}
```

## Best Practices

### 1. Run Regular Scans
- Scan after every major change
- Track improvement over time
- Compare versions before/after edits

### 2. Prioritize Quick Wins
- Start with high-impact, low-effort fixes
- Quick wins provide immediate score boost
- Build momentum with visible progress

### 3. Use Industry-Specific Tips
- Set correct industry in options
- Apply industry-specific keywords
- Follow industry conventions

### 4. Export and Share
- Export results for record-keeping
- Share recommendations with reviewers
- Track progress with exports

### 5. Combine with AI Writer
- Use ATS recommendations to guide AI improvements
- Let AI help with quantification and action verbs
- AI can suggest better phrasing for keywords

## Troubleshooting

### Low Score?
1. Check critical issues first (red badges)
2. Fix high-priority issues (orange badges)
3. Focus on quick wins for fast improvement
4. Review category breakdowns to find weakest areas

### Missing Keywords?
1. Check industry-specific tips
2. Review job descriptions for target roles
3. Add skills section if missing
4. Use exact terminology from your field

### Poor Structure?
1. Use standard section headers
2. Ensure reverse chronological order
3. Add clear contact information
4. Remove creative formatting

### Content Issues?
1. Add numbers and metrics to bullets
2. Start bullets with action verbs
3. Remove personal pronouns (I, me, my)
4. Check for typos and grammar errors

## Performance Tips

- **Quick Scan**: Use for rapid feedback (< 100ms)
- **Full Scan**: Run periodically for comprehensive analysis
- **Caching**: Results are cached until next change
- **Background**: Run scans in background for large resumes

## File Locations

```
js/analyzer/
├── ats-scanner.js          # Main scanner
├── scorer.js               # Scoring system
├── recommendations.js      # Recommendations engine
└── checks/
    ├── formatting.js       # 10 formatting checks
    ├── structure.js        # 10 structure checks
    └── content.js          # 10 content checks

css/
└── scoring.css             # Visualization styles

test-ats-scanner.html       # Test suite
```

## Support

For issues or questions:
1. Check test suite: `/test-ats-scanner.html`
2. Review completion report: `/TASK_COMPLETE_resumate-ats-scanner-v2.md`
3. Check browser console for detailed logs

## Version History

**v2.0.0** (December 1, 2025)
- Initial release with 30+ checks
- 5-category weighted scoring
- Letter grade assignment
- Prioritized recommendations
- Historical tracking
- Industry-specific tips

---

**Quick Access:** http://localhost:3101/test-ats-scanner.html
