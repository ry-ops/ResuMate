# Document Generation System

A unified document generation system for ATSFlow's export workflow step. This system provides a cohesive interface for generating, previewing, and exporting all 5 career document types.

## Overview

The Document Generation System consists of three main components:

1. **DocumentFactory** (`js/ai/document-factory.js`) - Unified generation interface
2. **DocumentPreview** (`js/ui/document-preview.js`) - Preview and editing UI
3. **UnifiedExport** (`js/core/unified-export.js`) - Enhanced export with workflow integration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Workflow State                         │
│  (User Data, Job Data, Analysis, Metadata)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │     DocumentFactory         │
        │  • Smart Caching            │
        │  • Parallel Generation      │
        │  • Progress Tracking        │
        │  • Error Handling           │
        └──┬──────────────────────┬───┘
           │                      │
           ▼                      ▼
    ┌─────────────┐      ┌──────────────┐
    │  Document   │      │   Unified    │
    │   Preview   │      │    Export    │
    │  • UI       │      │  • PDF/DOCX  │
    │  • Edit     │      │  • ZIP       │
    │  • Compare  │      │  • Batch     │
    └─────────────┘      └──────────────┘
```

## Features

### DocumentFactory

- **5 Document Types**: Resume, Cover Letter, Executive Bio, Brand Statement, Status Inquiry
- **Smart Caching**: Avoids regeneration if data unchanged (hash-based)
- **Parallel Generation**: Generate multiple documents simultaneously
- **Progress Tracking**: Real-time progress callbacks
- **Error Handling**: Graceful degradation with detailed error reporting
- **Data Validation**: Ensures required fields before generation

### DocumentPreview

- **Tabbed Interface**: Switch between all 5 document types
- **Preview Modes**: Single view or side-by-side comparison
- **Edit-in-Place**: Inline editing with auto-save
- **Copy to Clipboard**: One-click copying
- **Export**: Direct export from preview (PDF, DOCX, TXT)
- **Status Indicators**: Visual feedback on generation status
- **Word/Character Count**: Real-time content statistics

### UnifiedExport

- **Workflow Integration**: Seamless DocumentFactory integration
- **Auto-Generation**: Generate missing documents during export
- **Progress Callbacks**: Track export pipeline stages
- **Multiple Formats**: PDF, DOCX, TXT per document
- **Professional Packaging**: ZIP with README and metadata
- **Naming Conventions**: Standard or simple file naming

## Installation

### Dependencies

```html
<!-- Required Libraries -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

<!-- Document Generators -->
<script src="js/ai/resume-generator.js"></script>
<script src="js/careerdocs/bio-generator.js"></script>
<script src="js/careerdocs/brand-generator.js"></script>
<script src="js/careerdocs/inquiry-generator.js"></script>
<script src="js/coverletter/generator.js"></script>

<!-- Unified System -->
<script src="js/ai/document-factory.js"></script>
<script src="js/ui/document-preview.js"></script>
<script src="js/core/unified-export.js"></script>
```

## Quick Start

### 1. Initialize DocumentFactory

```javascript
// Prepare workflow state
const workflowState = {
    user: {
        name: 'John Doe',
        currentTitle: 'Senior Software Engineer',
        email: 'john.doe@email.com',
        experience: [/* ... */],
        education: [/* ... */],
        skills: [/* ... */]
    },
    job: {
        title: 'Staff Software Engineer',
        company: 'Tech Corp',
        description: '...'
    },
    analysis: {
        yearsExperience: 7,
        topSkills: [/* ... */],
        topAchievements: [/* ... */]
    }
};

// Initialize factory
const factory = initializeDocumentFactory(workflowState);
```

### 2. Generate Documents

```javascript
// Generate all documents with progress tracking
const result = await factory.generateAll(
    (progress) => {
        console.log(`${progress.current}/${progress.total}: ${progress.documentType}`);
    },
    {
        parallel: true,
        documents: {
            resume: true,
            coverLetter: true,
            executiveBio: true,
            brandStatement: true,
            statusInquiry: true
        }
    }
);

// Or generate individually
const resume = await factory.generateResume();
const coverLetter = await factory.generateCoverLetter();
```

### 3. Preview Documents

```javascript
// Initialize preview UI
const preview = new DocumentPreview('container-id');
preview.initialize();

// Load generated documents
preview.loadDocument('resume', result.results.resume);
preview.loadDocument('coverLetter', result.results.coverLetter);

// Show a document
preview.showDocument('resume');

// Listen to events
preview.on('documentEdited', (data) => {
    console.log('Document edited:', data.type);
});
```

### 4. Export Package

```javascript
// Setup export with factory reference
unifiedExport.setDocumentFactory(factory);

// Export complete package
const exportResult = await unifiedExport.exportApplicationPackage({
    jobTitle: 'Staff_Software_Engineer',
    companyName: 'Tech_Corp',
    candidateName: 'John_Doe',
    documents: {
        resume: true,
        coverLetter: true,
        executiveBio: true,
        brandStatement: true,
        statusInquiry: true
    },
    formats: ['pdf', 'docx'],
    generateMissing: true,
    workflowState: factory.workflowState
});

// Download the ZIP file
if (exportResult.success) {
    const link = document.createElement('a');
    link.href = exportResult.downloadUrl;
    link.download = exportResult.filename;
    link.click();
}
```

## API Reference

### DocumentFactory

#### Constructor
```javascript
new DocumentFactory(workflowState)
```

#### Methods

**generateAll(progressCallback, options)**
- Generate all selected documents
- `progressCallback`: Function receiving progress updates
- `options.parallel`: Boolean, generate in parallel (default: true)
- `options.forceRegenerate`: Boolean, bypass cache (default: false)
- `options.documents`: Object, which documents to generate
- Returns: `Promise<Object>`

**generateResume(forceRegenerate)**
**generateCoverLetter(forceRegenerate)**
**generateExecutiveBio(forceRegenerate)**
**generateBrandStatement(forceRegenerate)**
**generateStatusInquiry(forceRegenerate)**
- Generate individual documents
- Returns: `Promise<Object>`

**updateWorkflowState(newState)**
- Update workflow state
- Invalidates cache for changed data

**getStatus()**
- Get generation status for all documents
- Returns: `Object` with status and errors

**getCached(type)**
- Get cached document
- Returns: `Object|null`

**clearCache(type)**
- Clear cache for specific or all documents
- `type`: Document type or null for all

**isComplete()**
- Check if all documents generated
- Returns: `Boolean`

**getCompletionPercentage()**
- Get completion percentage
- Returns: `Number` (0-100)

### DocumentPreview

#### Constructor
```javascript
new DocumentPreview(containerId)
```

#### Methods

**initialize()**
- Initialize the preview UI

**loadDocument(type, data)**
- Load document for preview
- `type`: Document type
- `data`: Document data object

**showDocument(type)**
- Display document in preview
- `type`: Document type

**enableComparison(mode, beforeData, afterData)**
- Enable side-by-side comparison
- `mode`: 'side-by-side'
- `beforeData`: Original document
- `afterData`: Updated document

**disableComparison()**
- Disable comparison mode

**enableEditMode()**
- Enable inline editing

**disableEditMode()**
- Disable editing and save changes

**copyToClipboard()**
- Copy current document to clipboard
- Returns: `Promise<void>`

**exportDocument(format)**
- Export current document
- `format`: 'pdf', 'docx', or 'txt'
- Returns: `Promise<void>`

**regenerateDocument()**
- Regenerate current document
- Returns: `Promise<void>`

**on(event, callback)**
- Register event listener
- Events: 'documentShown', 'documentEdited'

**destroy()**
- Clean up component

### UnifiedExport (Enhanced)

#### Methods

**setDocumentFactory(factory)**
- Set DocumentFactory reference
- `factory`: DocumentFactory instance

**addProgressCallback(callback)**
- Add progress callback
- `callback`: Function receiving progress updates

**exportApplicationPackage(options)**
- Export complete application package
- `options.jobTitle`: Job title for naming
- `options.companyName`: Company name for naming
- `options.candidateName`: Candidate name for naming
- `options.documents`: Object, which documents to export
- `options.formats`: Array, export formats ['pdf', 'docx', 'txt']
- `options.includeReadme`: Boolean, include README.txt
- `options.includeMetadata`: Boolean, include metadata.json
- `options.namingConvention`: 'standard' or 'simple'
- `options.generateMissing`: Boolean, auto-generate missing docs
- `options.workflowState`: Workflow state for generation
- Returns: `Promise<Object>`

## Workflow State Schema

```javascript
{
    user: {
        name: String,
        currentTitle: String,
        currentCompany: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        website: String,
        experience: Array<{
            title: String,
            company: String,
            location: String,
            date: String,
            startDate: String,
            endDate: String,
            current: Boolean,
            bullets: Array<String>
        }>,
        education: Array<{
            degree: String,
            school: String,
            location: String,
            graduationYear: String,
            gpa: String
        }>,
        skills: Array<String>,
        certifications: Array<{
            name: String,
            issuer: String,
            date: String
        }>,
        projects: Array<Object>,
        languages: Array<String>,
        volunteering: Array<Object>
    },
    job: {
        title: String,
        company: String,
        industry: String,
        description: String,
        url: String,
        hiringManager: String
    },
    analysis: {
        yearsExperience: Number,
        topSkills: Array<String>,
        topAchievements: Array<String>,
        uniqueValue: Array<String>
    },
    metadata: {
        applicationDate: String,
        version: String
    }
}
```

## Smart Caching

The DocumentFactory uses hash-based caching to avoid unnecessary regeneration:

```javascript
// First generation - calls AI
await factory.generateResume(); // ~3-5 seconds

// Second generation - uses cache
await factory.generateResume(); // <1ms

// Force regeneration
await factory.generateResume(true); // ~3-5 seconds

// Cache invalidated when workflow state changes
factory.updateWorkflowState({ job: { title: 'New Title' } });
await factory.generateResume(); // ~3-5 seconds (cache invalid)
```

## Error Handling

The system provides comprehensive error handling:

```javascript
try {
    const result = await factory.generateAll();

    // Check overall success
    if (!result.success) {
        console.error('Some documents failed:', result.metadata);
    }

    // Check individual documents
    Object.entries(result.results).forEach(([type, doc]) => {
        if (doc.error) {
            console.error(`${type} failed:`, doc.error);
        }
    });
} catch (error) {
    console.error('Generation failed:', error);
}

// Check status after errors
const status = factory.getStatus();
console.log('Errors:', status.errors);
```

## Progress Tracking

Track progress during generation and export:

```javascript
// Generation progress
factory.generateAll((progress) => {
    console.log(`[${progress.status}] ${progress.documentType}`);
    console.log(`Progress: ${progress.current}/${progress.total}`);

    // Update UI
    updateProgressBar(progress.current / progress.total * 100);
});

// Export progress
unifiedExport.addProgressCallback((progress) => {
    console.log(`Stage: ${progress.stage} - ${progress.message}`);

    // Stages: validation, collection, generation, export, zip, complete
    switch (progress.stage) {
        case 'generation':
            showGenerationProgress(progress);
            break;
        case 'export':
            showExportProgress(progress);
            break;
        case 'complete':
            showSuccess();
            break;
    }
});
```

## Performance Optimization

### Parallel Generation
Generate documents simultaneously for faster completion:

```javascript
// Parallel (faster)
await factory.generateAll(null, { parallel: true }); // ~5 seconds for all

// Sequential (slower)
await factory.generateAll(null, { parallel: false }); // ~15 seconds for all
```

### Selective Generation
Only generate what you need:

```javascript
// Generate only resume and cover letter
await factory.generateAll(null, {
    documents: {
        resume: true,
        coverLetter: true,
        executiveBio: false,
        brandStatement: false,
        statusInquiry: false
    }
});
```

### Progressive Enhancement
Generate documents on-demand as user navigates:

```javascript
preview.on('documentShown', async (data) => {
    if (!factory.getCached(data.type)) {
        // Generate only when user views
        const methodName = `generate${capitalize(data.type)}`;
        const result = await factory[methodName]();
        preview.loadDocument(data.type, result);
    }
});
```

## Testing

See `js/examples/document-generation-example.js` for comprehensive examples:

```bash
# Run in browser console
example1_initializeFactory()
example2_generateAllDocuments()
example3_generateIndividualDocuments()
example4_initializePreview()
example5_exportPackage()
example6_smartCaching()
example7_errorHandling()
example8_progressiveGeneration()
example9_completeWorkflow()
example10_realTimeUpdates()
```

## Troubleshooting

### Document Generation Fails

**Problem**: `Error: API key not found`
**Solution**: Ensure Claude API key is set in localStorage

```javascript
localStorage.setItem('claude_api_key', 'your-api-key');
```

**Problem**: `Error: Name and current title are required`
**Solution**: Ensure workflow state has required user data

```javascript
factory.updateWorkflowState({
    user: { name: 'John Doe', currentTitle: 'Engineer' }
});
```

### Export Fails

**Problem**: `Error: JSZip library not loaded`
**Solution**: Include JSZip CDN before unified-export.js

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

**Problem**: Export creates empty files
**Solution**: Ensure documents are generated before export

```javascript
// Generate before export
await factory.generateAll();
// Then export
await unifiedExport.exportApplicationPackage({...});
```

### Preview Not Showing

**Problem**: Preview container empty
**Solution**: Ensure container exists and preview initialized

```javascript
// Check container exists
const container = document.getElementById('container-id');
if (!container) {
    console.error('Container not found');
}

// Initialize preview
const preview = new DocumentPreview('container-id');
preview.initialize();
```

## Best Practices

1. **Always initialize DocumentFactory with complete workflow state**
2. **Use parallel generation for better performance**
3. **Enable smart caching to avoid unnecessary API calls**
4. **Implement progress tracking for better UX**
5. **Handle errors gracefully with try-catch**
6. **Clear cache when workflow state changes significantly**
7. **Use progressive enhancement for large documents**
8. **Validate data before generation**
9. **Provide user feedback during long operations**
10. **Test with various data scenarios**

## Future Enhancements

- [ ] WebSocket support for real-time collaboration
- [ ] Version history and rollback
- [ ] A/B testing for different document variations
- [ ] AI-powered document comparison
- [ ] Custom templates per document type
- [ ] Batch generation queue management
- [ ] Document merging and splitting
- [ ] Advanced formatting options
- [ ] Integration with cloud storage (Google Drive, Dropbox)
- [ ] Automated quality scoring

## License

Part of ATSFlow - AI-Powered Resume Optimization Platform

## Support

For issues or questions:
1. Check examples in `js/examples/document-generation-example.js`
2. Review API documentation above
3. Check browser console for detailed error messages
4. Enable debug logging: `localStorage.setItem('debug', 'true')`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-02
**Maintainer**: ATSFlow Development Team
