# Export Engine Testing Guide

## Quick Start Testing

### 1. Start the Server

```bash
cd /Users/ryandahlberg/Projects/cortex/ResuMate
npm start
```

Server will run on: http://localhost:3101

### 2. Verify Export System Initialization

Open browser console and check for:
```
[ResuMate] Preview system initialized
[ResuMate] Export system initialized
[PrintManager] Initialized
```

### 3. Test Export Modal

1. Click the "📥 Export" button in the preview toolbar
2. Verify modal appears with all 5 format options:
   - PDF
   - DOCX
   - TXT
   - HTML
   - JSON

## Format-Specific Tests

### PDF Export Test

**Steps:**
1. Open export modal
2. Select PDF format
3. Configure:
   - Filename: "test-resume-pdf"
   - Quality: High
   - Page Size: A4
4. Click Export
5. Verify download starts

**Validation:**
- [ ] PDF downloads successfully
- [ ] File size is reasonable (200-600 KB)
- [ ] Text is selectable (not an image)
- [ ] All sections visible
- [ ] Page breaks are appropriate
- [ ] No content cutoff

**Tools:**
- Adobe Acrobat Reader
- Browser PDF viewer
- ATS testing tools (e.g., Jobscan)

### DOCX Export Test

**Steps:**
1. Open export modal
2. Select DOCX format
3. Filename: "test-resume-docx"
4. Click Export

**Validation:**
- [ ] DOCX downloads successfully
- [ ] Opens in Microsoft Word/LibreOffice
- [ ] Text is fully editable
- [ ] Formatting preserved (headings, bullets)
- [ ] Styles applied correctly
- [ ] No corrupted content

**Tools:**
- Microsoft Word
- LibreOffice Writer
- Google Docs

### TXT Export Test

**Steps:**
1. Open export modal
2. Select TXT format
3. Filename: "test-resume-txt"
4. Click Export

**Validation:**
- [ ] TXT downloads successfully
- [ ] Opens in any text editor
- [ ] Sections clearly separated
- [ ] Bullets converted to • or -
- [ ] Contact info readable
- [ ] No encoding issues

**Tools:**
- Notepad/TextEdit
- VS Code
- Any text editor

### JSON Export Test

**Steps:**
1. Open export modal
2. Select JSON format
3. Filename: "test-resume-json"
4. Click Export

**Validation:**
- [ ] JSON downloads successfully
- [ ] Valid JSON structure
- [ ] All resume data present
- [ ] Metadata included (version, timestamp)
- [ ] Can be pretty-printed

**Tools:**
- JSONLint.com
- Browser console: `JSON.parse(content)`
- VS Code JSON formatter

### HTML Export Test

**Steps:**
1. Open export modal
2. Select HTML format
3. Filename: "test-resume-html"
4. Click Export

**Validation:**
- [ ] HTML downloads successfully
- [ ] Opens in browser
- [ ] Self-contained (no external dependencies)
- [ ] CSS embedded
- [ ] Print-ready (@media print works)
- [ ] Template styling preserved

**Tools:**
- Any web browser
- View source to verify self-contained
- Print preview

## Print Preview Test

**Steps:**
1. Click "Print Preview" button
2. Verify layout changes to print-ready view
3. Check page breaks
4. Click again to toggle off

**Validation:**
- [ ] Print preview mode activates
- [ ] Editor panel hidden
- [ ] Page breaks visible
- [ ] Content fits within margins
- [ ] Toggle works both ways

## Quick Export Test (Programmatic)

Open browser console and run:

```javascript
// Test PDF quick export
await window.exportManager.quickExport('pdf', 'quick-test-pdf');

// Test DOCX quick export
await window.exportManager.quickExport('docx', 'quick-test-docx');

// Test TXT quick export
await window.exportManager.quickExport('txt', 'quick-test-txt');

// Test JSON quick export
await window.exportManager.quickExport('json', 'quick-test-json');

// Test HTML quick export
await window.exportManager.quickExport('html', 'quick-test-html');
```

## Integration Tests

### Test with Sample Resume

1. **Load Sample Resume:**
   ```javascript
   const sampleResume = {
       sections: [
           {
               type: 'header',
               name: 'Header',
               content: {
                   name: 'Jane Doe',
                   title: 'Senior Software Engineer',
                   email: 'jane.doe@email.com',
                   phone: '(555) 123-4567',
                   location: 'San Francisco, CA',
                   linkedin: 'linkedin.com/in/janedoe',
                   website: 'janedoe.dev'
               }
           },
           {
               type: 'summary',
               name: 'Professional Summary',
               content: {
                   text: 'Experienced software engineer with 8+ years building scalable web applications.'
               }
           },
           {
               type: 'experience',
               name: 'Work Experience',
               content: {
                   items: [
                       {
                           title: 'Senior Software Engineer',
                           company: 'TechCorp Inc.',
                           location: 'San Francisco, CA',
                           date: '2020 - Present',
                           bullets: [
                               'Led development of microservices architecture',
                               'Reduced API response time by 40%',
                               'Mentored 5 junior developers'
                           ]
                       }
                   ]
               }
           },
           {
               type: 'skills',
               name: 'Technical Skills',
               content: {
                   items: ['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes']
               }
           }
       ]
   };

   // Set resume state
   window.resumeState = sampleResume;

   // Test export
   await window.exportManager.quickExport('pdf', 'sample-resume');
   ```

2. **Verify all sections exported**
3. **Check formatting preserved**

### Test with Real Resume

1. Upload your actual resume (PDF/DOCX)
2. Let parser extract content
3. Export to all 5 formats
4. Compare quality and completeness

## Edge Cases to Test

### Empty Resume
```javascript
window.resumeState = { sections: [] };
await window.exportManager.quickExport('pdf');
// Should show error or empty message
```

### Very Long Resume (3+ pages)
- Create resume with many sections
- Test page breaks in PDF
- Verify DOCX pagination
- Check file sizes

### Special Characters
- Test with accents: José, François, München
- Unicode symbols: ★ ✓ → ∞
- Verify encoding in all formats

### Missing Data
- Sections with no content
- Empty contact fields
- No bullets in experience

## Performance Testing

### File Size Tests

```javascript
// Get file size estimate
const pdfExporter = window.exportManager.pdfExporter;
const container = document.querySelector('.resume-document');
const size = await pdfExporter.estimateFileSize(container);
console.log('Estimated PDF size:', pdfExporter.formatFileSize(size));
```

**Expected Sizes:**
- PDF (Standard): 200-400 KB
- PDF (High): 400-700 KB
- DOCX: 50-150 KB
- TXT: 5-20 KB
- JSON: 10-50 KB
- HTML: 30-100 KB

### Export Speed

Measure export time:

```javascript
console.time('pdf-export');
await window.exportManager.quickExport('pdf', 'speed-test');
console.timeEnd('pdf-export');
// Should complete in < 3 seconds
```

## Browser Compatibility Testing

Test in multiple browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## ATS Compatibility Testing

1. Export resume as PDF
2. Upload to ATS testing tools:
   - Jobscan.co
   - Resume Worded
   - TopResume ATS checker
3. Verify parsing accuracy > 95%

**Key ATS Checks:**
- [ ] Text is extractable
- [ ] Section headers recognized
- [ ] Contact info parsed correctly
- [ ] Experience dates parsed
- [ ] Skills extracted
- [ ] No formatting errors

## Accessibility Testing

- [ ] Export modal keyboard navigable
- [ ] Format cards keyboard selectable
- [ ] Screen reader friendly
- [ ] Focus indicators visible
- [ ] Escape key closes modal

## Error Handling Tests

### Test Error Scenarios

```javascript
// 1. No resume data
window.resumeState = null;
await window.exportManager.quickExport('pdf');
// Should show error message

// 2. Invalid format
await window.exportManager.quickExport('invalid', 'test');
// Should throw error

// 3. Network error (block CDN)
// Block html2pdf.js in DevTools Network tab
// Try PDF export - should show library error
```

## Regression Testing Checklist

After any changes, verify:

- [ ] All 5 formats still work
- [ ] Export modal opens/closes
- [ ] Print preview toggles
- [ ] Page size selection works
- [ ] Quality settings apply
- [ ] Filename customization works
- [ ] Progress indicator shows
- [ ] Success messages display
- [ ] Downloads trigger properly
- [ ] No console errors

## Manual UI Testing

### Export Modal UI
- [ ] Modal centers on screen
- [ ] Close button works
- [ ] Click outside closes modal
- [ ] Format cards highlight on selection
- [ ] Quality options toggle correctly
- [ ] Input fields accept text
- [ ] Buttons styled correctly
- [ ] Responsive on mobile

### Export Button
- [ ] Visible in toolbar
- [ ] Icon displays correctly
- [ ] Tooltip shows on hover
- [ ] Click opens modal
- [ ] Disabled state works (if no resume)

## Success Criteria

The export engine is considered fully functional when:

- ✅ All 5 formats export successfully
- ✅ PDF is ATS-compatible (>95% parsing accuracy)
- ✅ DOCX opens and edits in Word
- ✅ TXT is clean and readable
- ✅ JSON is valid and complete
- ✅ HTML is self-contained and prints correctly
- ✅ Print preview works properly
- ✅ Page breaks are optimized
- ✅ File sizes are reasonable
- ✅ Export completes in < 3 seconds
- ✅ No console errors
- ✅ Works in all major browsers
- ✅ Error handling is graceful
- ✅ UI is intuitive and responsive

## Reporting Issues

If you encounter issues, capture:

1. **Environment:**
   - Browser and version
   - Operating system
   - Screen size

2. **Steps to Reproduce:**
   - Exact steps taken
   - Resume content used

3. **Expected vs Actual:**
   - What should happen
   - What actually happened

4. **Console Errors:**
   - Full error messages
   - Stack traces

5. **Screenshots:**
   - Export modal
   - Exported files (if applicable)
   - Console errors

## Next Steps

After successful testing:

1. Update WAVE_2_TASKS.md with completion status
2. Document any issues found
3. Create follow-up tickets for enhancements
4. Update main README.md with export features
5. Consider Wave 3 enhancements
