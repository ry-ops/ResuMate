# AI Resume Writer - Implementation Documentation

## Overview

The AI Resume Writer feature provides AI-powered content generation for ResuMate using Claude API. This implementation includes comprehensive prompt templates, API client, and high-level rewriter utilities for resume optimization.

## Architecture

```
js/ai/
├── prompts.js      # Prompt templates for various content types
├── generator.js    # API client for Claude communication
└── rewriter.js     # High-level content improvement functions
```

## Features Implemented

### 1. Prompt Templates (`prompts.js`)

Comprehensive set of prompt templates for different resume writing scenarios:

- **generateSummary** - Create professional summary statements
- **expandBullet** - Transform brief bullets into achievement-focused statements
- **suggestActionVerbs** - Get powerful action verbs for context
- **quantifyAchievement** - Add metrics and quantification to achievements
- **rewriteForIndustry** - Adapt content for target industry
- **strengthenLanguage** - Replace weak language with strong, active voice
- **generateKeywords** - Extract ATS keywords from job descriptions
- **generateBullets** - Convert responsibilities into achievement bullets
- **optimizeForATS** - Optimize content for ATS scanning

### 2. API Generator (`generator.js`)

Core API communication layer with:

- **Retry Logic** - Automatic retry for network errors and rate limits
- **Error Handling** - Comprehensive error handling with specific error types
- **Response Parsing** - Intelligent parsing of various response formats
- **Token Management** - Configurable token limits and temperature
- **Rate Limiting** - Built-in rate limit detection and handling

#### Key Methods:

```javascript
// Generate professional summary
await aiGenerator.generateSummary({
    jobTitle: 'Senior Software Engineer',
    yearsExp: 8,
    skills: ['Python', 'AWS', 'React'],
    targetRole: 'Tech Lead',
    industry: 'FinTech'
});

// Expand bullet point
await aiGenerator.expandBullet({
    userInput: 'Led team project',
    jobTitle: 'Engineering Manager',
    industry: 'SaaS'
});

// Suggest action verbs
await aiGenerator.suggestActionVerbs({
    context: 'Improved system performance',
    industry: 'Technology',
    jobFunction: 'engineering'
});

// Quantify achievement
await aiGenerator.quantifyAchievement({
    achievement: 'Improved application performance',
    role: 'Backend Engineer'
});

// Rewrite for industry
await aiGenerator.rewriteForIndustry({
    content: 'Managed customer database',
    targetIndustry: 'Healthcare',
    currentIndustry: 'E-commerce'
});
```

### 3. Content Rewriter (`rewriter.js`)

High-level utilities for common resume improvement tasks:

- **improveBullet** - Comprehensive bullet point improvement
- **makeMoreImpactful** - Strengthen weak language
- **addMetrics** - Add quantification to achievements
- **adaptForIndustry** - Industry-specific rewrites
- **getBetterVerbs** - Get action verb suggestions
- **optimizeForATS** - ATS optimization
- **createSummary** - Generate professional summaries
- **analyzeJobKeywords** - Extract keywords from job descriptions
- **convertToBullets** - Convert responsibilities to bullets
- **improveBulletsBatch** - Batch process multiple bullets
- **quickFixWeakVerbs** - Identify and fix weak verbs

#### Example Usage:

```javascript
// Improve single bullet
const result = await contentRewriter.improveBullet(
    'Led team project',
    { jobTitle: 'Engineering Manager', industry: 'SaaS' }
);
// Returns: { original, suggestions: [...], count }

// Make content more impactful
const improved = await contentRewriter.makeMoreImpactful(
    'Helped improve system performance'
);
// Returns: { original, conservative, bold }

// Batch improve bullets
const results = await contentRewriter.improveBulletsBatch(
    ['Led team', 'Fixed bugs', 'Wrote code'],
    { jobTitle: 'Software Engineer' },
    (current, total, result) => {
        console.log(`Progress: ${current}/${total}`);
    }
);
```

## Backend Integration

### New API Endpoint: `/api/generate`

Added to `server.js` for AI content generation.

**Request:**
```json
{
    "prompt": "AI prompt text",
    "apiKey": "sk-ant-...",
    "maxTokens": 1024,
    "temperature": 0.7
}
```

**Response:**
```json
{
    "content": "Generated content from Claude"
}
```

**Features:**
- Rate limiting (10 requests/minute)
- Input validation and sanitization
- Token limit enforcement (256-4096)
- Temperature validation (0-1)
- API key format validation
- Comprehensive error handling

### Updated Claude API Helper

Refactored API calls to use shared `callClaudeAPI()` function:
- Upgraded to Claude Sonnet 4 (claude-sonnet-4-20250514)
- Consistent error handling across endpoints
- Configurable max_tokens and temperature

## Testing

### Test Suite (`test-ai.html`)

Comprehensive test page for all AI features:

1. **Generate Professional Summary** - Test summary generation
2. **Expand Bullet Point** - Test bullet expansion
3. **Suggest Action Verbs** - Test verb suggestions
4. **Quantify Achievement** - Test quantification
5. **Rewrite for Industry** - Test industry adaptation

**Access:** http://localhost:3101/test-ai.html

### Running Tests

1. Start the server:
   ```bash
   cd /Users/ryandahlberg/Projects/cortex/ResuMate
   node server.js
   ```

2. Open test page:
   ```
   http://localhost:3101/test-ai.html
   ```

3. Enter Claude API key

4. Test each feature individually

## Security Features

- API key validation (format checking)
- Input sanitization
- Length limits on prompts (50,000 characters)
- Rate limiting (10 requests/minute)
- CSP headers
- XSS protection

## Error Handling

### Client-Side Errors

```javascript
try {
    const result = await aiGenerator.generateSummary(params);
} catch (error) {
    // error.message contains user-friendly error
    console.error('Generation failed:', error.message);
}
```

### Server-Side Errors

All endpoints return consistent error format:
```json
{
    "error": "Error message description"
}
```

Common errors:
- `Missing required fields` - Missing prompt or API key
- `Invalid API key format` - Malformed API key
- `Prompt exceeds maximum length` - Prompt too long
- `Too many requests` - Rate limit exceeded
- `Failed to generate content` - API error

## Performance Considerations

### Token Usage

Each function has optimized token limits:
- Summary generation: 512 tokens
- Bullet expansion: 512 tokens
- Action verbs: 256 tokens
- Quantification: 512 tokens
- Industry rewrite: 512 tokens
- Keyword extraction: 1024 tokens
- Bullet generation: 768 tokens

### Retry Logic

- Automatic retry for network errors
- Exponential backoff (1s, 2s, 3s)
- Maximum 3 retry attempts
- Only retries on retryable errors (network, timeout, rate limit)

### Rate Limiting

- 10 requests per minute per IP
- 60-second sliding window
- Graceful error with retry-after header

## Integration with ResuMate

### Future UI Integration Points

1. **Editor Sections** - Add AI assistant buttons to resume sections
2. **Bullet Point Editor** - Inline AI improvement suggestions
3. **Summary Generator** - Modal for summary generation
4. **Industry Adapter** - Dropdown to rewrite for different industries
5. **ATS Optimizer** - One-click ATS optimization
6. **Verb Suggester** - Contextual action verb suggestions

### Recommended UI Flow

```
User edits bullet point
    ↓
Click "Improve with AI" button
    ↓
Modal shows 2-3 suggestions
    ↓
User selects or edits suggestion
    ↓
Content updated in editor
```

## Configuration

### Environment Variables

None required - API key stored in localStorage client-side.

### Customization

Adjust in `generator.js`:
```javascript
// Change retry behavior
this.maxRetries = 3;
this.retryDelay = 1000;

// Change API endpoint
this.apiEndpoint = '/api/generate';
```

Adjust in `server.js`:
```javascript
// Change rate limit
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60000;

// Change token/prompt limits
const MAX_PROMPT_LENGTH = 50000;
const validMaxTokens = Math.min(Math.max(maxTokens, 256), 4096);
```

## API Usage Examples

### Complete Example: Improve Resume Section

```javascript
// Improve entire experience section
const section = {
    type: 'experience',
    jobTitle: 'Software Engineer',
    bullets: [
        'Wrote code for features',
        'Fixed bugs',
        'Participated in code reviews'
    ]
};

// Batch improve all bullets
const results = await contentRewriter.improveBulletsBatch(
    section.bullets,
    { jobTitle: section.jobTitle, industry: 'Technology' }
);

// Get best suggestion for each
const improved = results.map(r => r.suggestions[0]);
console.log('Improved bullets:', improved);
```

### Example: Generate Summary from Profile

```javascript
const profile = {
    jobTitle: 'Senior Software Engineer',
    yearsExp: 8,
    skills: ['Python', 'JavaScript', 'AWS', 'Docker', 'React'],
    targetRole: 'Engineering Manager',
    industry: 'SaaS'
};

const summary = await contentRewriter.createSummary(profile);
console.log('Generated summary:', summary);
```

### Example: Analyze Job and Optimize Resume

```javascript
const jobDescription = `
Senior Software Engineer position requiring:
- 5+ years Python experience
- AWS cloud expertise
- CI/CD pipeline management
- Team leadership skills
`;

const currentSkills = ['Python', 'Docker', 'Git'];

// Get missing keywords
const keywords = await contentRewriter.analyzeJobKeywords(
    jobDescription,
    currentSkills
);

console.log('Missing keywords:', keywords.missingKeywords);
// Output: ['AWS', 'CI/CD', 'leadership', ...]

// Optimize bullet for ATS
const optimized = await contentRewriter.optimizeForATS(
    'Built deployment pipeline',
    keywords.missingKeywords
);

console.log('ATS-optimized:', optimized.keywordFocused);
// Output: "Built CI/CD deployment pipeline on AWS cloud infrastructure"
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify format: `sk-ant-...`
   - Check key is active in Anthropic Console
   - Ensure key stored in localStorage

2. **Rate Limit Errors**
   - Wait 60 seconds between batches
   - Reduce concurrent requests
   - Check server logs for actual limit

3. **Generation Takes Long Time**
   - Normal for complex prompts
   - Reduce maxTokens if too slow
   - Check network connectivity

4. **Parser Warnings on Server Start**
   - Canvas module warnings are expected
   - PDF parsing still works via pdfjs-dist
   - Safe to ignore

## Future Enhancements

### Planned Features

1. **Caching** - Cache common generations (summary templates)
2. **Templates** - Pre-built templates for common roles
3. **Smart Suggestions** - Context-aware inline suggestions
4. **Batch Operations** - Process entire resume at once
5. **A/B Testing** - Compare different writing styles
6. **Tone Adjustment** - Formal vs casual tone slider
7. **Length Control** - Specific word/character count targets
8. **Industry Presets** - Pre-configured industry settings

### Integration Roadmap

1. **Wave 2**: UI integration in resume editor
2. **Wave 3**: Real-time AI suggestions
3. **Wave 4**: Advanced ATS optimization
4. **Wave 5**: Industry-specific templates

## File Reference

### Created Files

```
/Users/ryandahlberg/Projects/cortex/ResuMate/js/ai/prompts.js
/Users/ryandahlberg/Projects/cortex/ResuMate/js/ai/generator.js
/Users/ryandahlberg/Projects/cortex/ResuMate/js/ai/rewriter.js
/Users/ryandahlberg/Projects/cortex/ResuMate/test-ai.html
/Users/ryandahlberg/Projects/cortex/ResuMate/AI_WRITER_README.md
```

### Modified Files

```
/Users/ryandahlberg/Projects/cortex/ResuMate/server.js
  - Added callClaudeAPI() helper function
  - Added /api/generate endpoint
  - Upgraded to Claude Sonnet 4
```

## Acceptance Criteria Status

- [x] Generate professional summaries
- [x] Expand bullet points effectively
- [x] Suggest strong action verbs
- [x] Rewrite content for different industries
- [x] Handle API errors gracefully
- [x] Comprehensive error handling
- [x] Rate limiting implemented
- [x] Input validation and sanitization
- [x] Test suite created
- [x] Documentation complete

## Wave 1 Task Status: COMPLETE

All requirements for Worker 4 (AI Resume Writer) have been implemented and tested.

## Support

For issues or questions:
1. Check this documentation
2. Review test-ai.html for examples
3. Check server logs for API errors
4. Verify API key in Anthropic Console
