// PDF Parser Module
// Uses pdf.js to extract text from PDF files

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<Object>} - Extracted text and metadata
 */
async function parsePDF(pdfBuffer) {
    try {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(pdfBuffer)
        });

        const pdf = await loadingTask.promise;

        // Extract metadata
        const metadata = await pdf.getMetadata();
        const numPages = pdf.numPages;

        // Extract text from all pages
        let fullText = '';
        const pageTexts = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Combine text items with proper spacing
            let pageText = '';
            let lastY = null;

            textContent.items.forEach(item => {
                const currentY = item.transform[5];

                // Add line break if vertical position changed significantly
                if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                    pageText += '\n';
                }

                // Add space if this is a new word on same line
                if (lastY === currentY && pageText.length > 0 && !pageText.endsWith(' ')) {
                    pageText += ' ';
                }

                pageText += item.str;
                lastY = currentY;
            });

            pageTexts.push(pageText);
            fullText += pageText + '\n\n';
        }

        return {
            success: true,
            text: fullText.trim(),
            pageCount: numPages,
            pages: pageTexts,
            metadata: {
                title: metadata.info?.Title || null,
                author: metadata.info?.Author || null,
                subject: metadata.info?.Subject || null,
                creator: metadata.info?.Creator || null,
                producer: metadata.info?.Producer || null,
                creationDate: metadata.info?.CreationDate || null
            }
        };

    } catch (error) {
        console.error('PDF parsing error:', error);
        return {
            success: false,
            error: error.message,
            text: null
        };
    }
}

/**
 * Extract structured data from PDF
 * Attempts to identify sections based on formatting
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<Object>} - Structured resume data
 */
async function extractStructuredPDF(pdfBuffer) {
    const result = await parsePDF(pdfBuffer);

    if (!result.success) {
        return result;
    }

    // Identify potential sections based on common resume patterns
    const sections = identifySections(result.text);

    return {
        success: true,
        text: result.text,
        sections: sections,
        metadata: result.metadata,
        pageCount: result.pageCount
    };
}

/**
 * Identify resume sections from text
 * @param {string} text - The extracted text
 * @returns {Array} - Identified sections
 */
function identifySections(text) {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common section headers
    const sectionHeaders = [
        'summary', 'objective', 'profile',
        'experience', 'work experience', 'employment',
        'education', 'academic background',
        'skills', 'technical skills', 'core competencies',
        'certifications', 'certificates',
        'projects', 'portfolio',
        'achievements', 'accomplishments',
        'awards', 'honors',
        'publications',
        'references',
        'languages',
        'volunteering', 'volunteer experience',
        'interests', 'hobbies'
    ];

    let currentSection = null;
    let currentContent = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        const lowerLine = trimmed.toLowerCase();

        // Check if this line is a section header
        const isHeader = sectionHeaders.some(header => {
            return lowerLine === header ||
                   lowerLine === header + ':' ||
                   (lowerLine.length < 30 && lowerLine.includes(header));
        });

        if (isHeader && trimmed.length < 50) {
            // Save previous section
            if (currentSection) {
                sections.push({
                    title: currentSection,
                    content: currentContent.join('\n').trim()
                });
            }

            // Start new section
            currentSection = trimmed.replace(/[:]/g, '').trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(trimmed);
        } else {
            // Before any section (likely header/contact info)
            if (sections.length === 0) {
                sections.push({
                    title: 'Header',
                    content: trimmed
                });
            }
        }
    });

    // Add last section
    if (currentSection && currentContent.length > 0) {
        sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
        });
    }

    return sections;
}

module.exports = {
    parsePDF,
    extractStructuredPDF
};
