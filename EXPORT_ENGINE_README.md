# ResuMate Export Engine

## Overview
High-quality multi-format export engine supporting PDF, DOCX, TXT, JSON, and HTML with template preservation and ATS optimization.

## Features

### Supported Formats

1. **PDF Export**
   - High-quality rendering using html2pdf.js
   - ATS-optimized with selectable text
   - Proper page breaks and orphan/widow control
   - Template styling preserved
   - Quality settings: Standard (2x) and High (3x)
   - Page sizes: A4 and US Letter

2. **DOCX Export**
   - Editable Word documents using docx.js
   - Preserves formatting and structure
   - ATS-compatible layout
   - Professional styling with proper heading hierarchy
   - Bullet point support

3. **TXT Export**
   - Plain text format for easy copy/paste
   - Clean, readable structure
   - Section separators
   - All formatting converted to text equivalents

4. **JSON Export**
   - Full data backup with metadata
   - Structured format for data portability
   - Includes export timestamp and version
   - Can be imported back into ResuMate

5. **HTML Export**
   - Self-contained single-file webpage
   - Embedded CSS styling
   - Template styles preserved
   - Print-ready with @media print styles
   - Auto-print option with #print hash

### Print Optimization

- **Print Preview Mode**: Toggle preview before printing
- **Page Break Control**: Intelligent page break placement
- **Orphan/Widow Prevention**: Keeps content together
- **Page Size Support**: A4 and US Letter
- **Print-Ready CSS**: Optimized @media print styles
- **Header/Footer Management**: Hides non-printable elements

## Architecture

### Module Structure

```
js/export/
├── pdf-export.js       - PDF generation (PDFExporter class)
├── docx-export.js      - DOCX generation (DOCXExporter class)
├── formats.js          - TXT/JSON/HTML handlers (FormatExporter class)
├── print.js            - Print optimization (PrintManager class)
└── export-manager.js   - Main orchestrator (ExportManager class)

css/
└── export.css          - Export modal and UI styles
```

### Class Hierarchy

```
ExportManager (Main Controller)
├── PDFExporter (pdf-export.js)
├── DOCXExporter (docx-export.js)
├── FormatExporter (formats.js)
└── PrintManager (print.js)
```

## Usage

### Basic Export (via UI)

1. Click the "Export" button in the preview toolbar
2. Select desired format (PDF, DOCX, TXT, JSON, HTML)
3. Configure options:
   - Filename
   - Quality (PDF/DOCX)
   - Page Size (PDF)
   - Template Preservation
4. Click "Export" to download

### Programmatic Export

```javascript
// Get export manager instance
const exportManager = window.exportManager;

// Quick export (skips modal)
await exportManager.quickExport('pdf', 'my-resume');

// Export with options
await exportManager.pdfExporter.exportToPDF(element, {
    filename: 'resume',
    quality: 'high',
    pageSize: 'a4'
});

// Export to DOCX
const blob = await exportManager.docxExporter.exportToDOCX(resumeState);
exportManager.docxExporter.downloadDOCX(blob, 'resume');

// Export to other formats
const txtContent = exportManager.formatExporter.exportToTXT(resumeState);
exportManager.formatExporter.downloadTXT(txtContent, 'resume');
```

### Print Functions

```javascript
// Toggle print preview
exportManager.printManager.togglePrintPreview();

// Trigger print
exportManager.printManager.print();

// Set page size
exportManager.printManager.setPageSize('letter');

// Get print statistics
const stats = exportManager.printManager.getStats();
console.log(stats.pageCount, stats.pageSize);
```

## API Reference

### ExportManager

#### Methods

- `initialize()` - Initialize export system
- `openModal()` - Open export modal
- `closeModal()` - Close export modal
- `quickExport(format, filename)` - Export without modal
- `handleExport()` - Process export based on modal settings

### PDFExporter

#### Methods

- `exportToPDF(element, options)` - Export element to PDF
- `generatePDFBlob(element, options)` - Generate PDF blob
- `validateElement(element)` - Validate element for PDF export
- `estimateFileSize(element)` - Estimate PDF file size

#### Options

```javascript
{
    filename: 'resume.pdf',
    quality: 'standard' | 'high',
    pageSize: 'a4' | 'letter',
    margins: { top, right, bottom, left }
}
```

### DOCXExporter

#### Methods

- `exportToDOCX(resumeState, options)` - Export to DOCX
- `downloadDOCX(blob, filename)` - Download DOCX file

### FormatExporter

#### Methods

- `exportToTXT(resumeState, options)` - Export to plain text
- `exportToJSON(resumeState, options)` - Export to JSON
- `exportToHTML(resumeState, options)` - Export to HTML
- `downloadTXT(content, filename)` - Download TXT file
- `downloadJSON(content, filename)` - Download JSON file
- `downloadHTML(content, filename)` - Download HTML file

### PrintManager

#### Methods

- `initialize()` - Setup print listeners and styles
- `print()` - Trigger print dialog
- `togglePrintPreview()` - Toggle print preview mode
- `setPageSize(size)` - Set page size ('a4' or 'letter')
- `optimizePageBreaks()` - Optimize page break placement
- `calculatePageCount(container)` - Calculate number of pages
- `validatePrintReady()` - Validate print readiness

## Dependencies

### CDN Libraries (loaded via index.html)

```html
<!-- html2pdf.js for PDF export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

<!-- docx.js for DOCX export -->
<script src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js"></script>

<!-- FileSaver.js for file downloads -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
```

### NPM Packages (package.json)

```json
{
    "html2pdf.js": "^0.10.1",
    "docx": "^8.5.0",
    "file-saver": "^2.0.5"
}
```

## Configuration

### Default Export Options

```javascript
{
    filename: 'resume',
    quality: 'standard',
    pageSize: 'a4',
    preserveTemplate: true
}
```

### PDF Quality Settings

- **Standard**: 2x scale, 95% image quality, ~200-300 KB
- **High**: 3x scale, 100% image quality, ~400-600 KB

### Page Sizes

- **A4**: 210mm × 297mm (International)
- **Letter**: 8.5in × 11in (US)

## ATS Optimization

The export engine ensures ATS (Applicant Tracking System) compatibility:

1. **Text Selectability**: All text is selectable/searchable
2. **Standard Fonts**: Uses web-safe fonts (Calibri, Arial, Times New Roman)
3. **Proper Structure**: Maintains heading hierarchy
4. **No Images/Graphics**: Text-only content for maximum compatibility
5. **Single Column**: Avoids complex multi-column layouts in PDF/DOCX
6. **Black Text**: Ensures text is dark enough for scanning
7. **Standard Sections**: Uses common section names (Experience, Education, Skills)

## Error Handling

All export methods include comprehensive error handling:

```javascript
try {
    await exportManager.quickExport('pdf');
} catch (error) {
    console.error('Export failed:', error.message);
    // Show user-friendly error message
}
```

## Performance

- **Debounced Updates**: Prevents excessive re-rendering
- **Lazy Loading**: Libraries loaded via CDN
- **Optimized Rendering**: Efficient DOM manipulation
- **Progress Indicators**: Visual feedback during export
- **File Size Estimation**: Pre-export size calculation

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (print may require manual trigger)
- Mobile: Limited support (PDF/HTML work best)

## Testing

To test export functionality:

1. **Manual Testing**:
   ```bash
   cd /Users/ryandahlberg/Projects/cortex/ResuMate
   npm start
   # Open http://localhost:3101
   # Create/load a resume
   # Click Export button
   # Test each format
   ```

2. **Format Validation**:
   - PDF: Open in Acrobat Reader, verify text selectability
   - DOCX: Open in Microsoft Word, verify editability
   - TXT: Open in text editor, verify formatting
   - JSON: Validate JSON structure
   - HTML: Open in browser, verify self-contained

3. **Print Testing**:
   - Toggle print preview
   - Verify page breaks
   - Check page count
   - Test both A4 and Letter sizes

## Troubleshooting

### Common Issues

1. **PDF Export Fails**
   - Ensure html2pdf.js is loaded
   - Check console for errors
   - Verify element has content

2. **DOCX Export Fails**
   - Ensure docx.js is loaded
   - Check resume state structure
   - Verify all required fields

3. **Print Preview Not Working**
   - Check PrintManager initialization
   - Verify CSS is loaded
   - Check browser console

4. **Modal Not Appearing**
   - Verify ExportManager initialized
   - Check export.css is loaded
   - Check for JavaScript errors

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('export-debug', 'true');
```

## Future Enhancements

Potential improvements for Wave 3+:

1. **LaTeX Export**: For academic CVs
2. **Markdown Export**: For GitHub/text-based platforms
3. **CSV Export**: For data analysis
4. **Batch Export**: Multiple formats at once
5. **Cloud Storage**: Direct upload to Google Drive/Dropbox
6. **Email Integration**: Send resume directly via email
7. **QR Code**: Generate QR code linking to online version
8. **Watermarking**: Add custom watermarks
9. **Password Protection**: Protect PDF with password
10. **Digital Signature**: Sign PDF documents

## Credits

- **html2pdf.js**: PDF generation
- **docx.js**: DOCX generation
- **FileSaver.js**: File download handling

## License

Part of ResuMate - MIT License
