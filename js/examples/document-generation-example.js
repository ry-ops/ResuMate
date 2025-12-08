/**
 * Document Generation System - Usage Examples
 *
 * This file demonstrates how to use the unified document generation system
 * including DocumentFactory, DocumentPreview, and UnifiedExport integration.
 *
 * @file document-generation-example.js
 * @version 1.0.0
 */

// ============================================================================
// EXAMPLE 1: Initialize Document Factory with Workflow State
// ============================================================================

/**
 * Initialize the document factory with user and job data
 */
function example1_initializeFactory() {
    console.log('=== Example 1: Initialize Document Factory ===');

    // Sample workflow state
    const workflowState = {
        user: {
            name: 'John Doe',
            currentTitle: 'Senior Software Engineer',
            currentCompany: 'Tech Corp',
            email: 'john.doe@email.com',
            phone: '555-0123',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/johndoe',
            website: 'johndoe.dev',
            experience: [
                {
                    title: 'Senior Software Engineer',
                    company: 'Tech Corp',
                    location: 'San Francisco, CA',
                    date: '2020 - Present',
                    startDate: '2020-01-15',
                    current: true,
                    bullets: [
                        'Led development of microservices architecture serving 10M+ users',
                        'Improved system performance by 40% through optimization',
                        'Mentored team of 5 junior developers'
                    ]
                },
                {
                    title: 'Software Engineer',
                    company: 'Startup Inc',
                    location: 'Palo Alto, CA',
                    date: '2017 - 2020',
                    startDate: '2017-06-01',
                    endDate: '2020-01-10',
                    bullets: [
                        'Built scalable backend APIs using Node.js and PostgreSQL',
                        'Implemented CI/CD pipeline reducing deployment time by 60%',
                        'Collaborated with product team on feature development'
                    ]
                }
            ],
            education: [
                {
                    degree: 'B.S. Computer Science',
                    school: 'University of California',
                    location: 'Berkeley, CA',
                    graduationYear: '2017',
                    gpa: '3.8'
                }
            ],
            skills: [
                'JavaScript', 'TypeScript', 'Node.js', 'React', 'Python',
                'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'
            ],
            certifications: [
                {
                    name: 'AWS Solutions Architect',
                    issuer: 'Amazon Web Services',
                    date: '2021'
                }
            ]
        },
        job: {
            title: 'Staff Software Engineer',
            company: 'Innovative Solutions Inc',
            industry: 'Technology',
            description: 'We are seeking a Staff Software Engineer to lead our backend team...',
            url: 'https://careers.innovativesolutions.com/job/123',
            hiringManager: 'Jane Smith'
        },
        analysis: {
            yearsExperience: 7,
            topSkills: ['JavaScript', 'Node.js', 'System Architecture', 'Team Leadership'],
            topAchievements: [
                'Led development of microservices architecture serving 10M+ users',
                'Improved system performance by 40% through optimization'
            ],
            uniqueValue: [
                'Full-stack expertise with focus on scalability',
                'Track record of performance optimization',
                'Strong leadership and mentoring experience'
            ]
        },
        metadata: {
            applicationDate: new Date().toISOString(),
            version: '1.0'
        }
    };

    // Initialize DocumentFactory
    const factory = initializeDocumentFactory(workflowState);

    console.log('DocumentFactory initialized with workflow state');
    console.log('Status:', factory.getStatus());

    return factory;
}

// ============================================================================
// EXAMPLE 2: Generate All Documents
// ============================================================================

/**
 * Generate all 5 document types with progress tracking
 */
async function example2_generateAllDocuments() {
    console.log('=== Example 2: Generate All Documents ===');

    const factory = example1_initializeFactory();

    // Define progress callback
    const progressCallback = (progress) => {
        console.log(`Progress: ${progress.current}/${progress.total} - ${progress.documentType} - ${progress.status}`);
        if (progress.error) {
            console.error('Error:', progress.error);
        }
    };

    try {
        // Generate all documents in parallel
        const result = await factory.generateAll(progressCallback, {
            forceRegenerate: false,
            parallel: true,
            documents: {
                resume: true,
                coverLetter: true,
                executiveBio: true,
                brandStatement: true,
                statusInquiry: true
            }
        });

        console.log('Generation result:', result);
        console.log('Completion percentage:', factory.getCompletionPercentage() + '%');

        return result;
    } catch (error) {
        console.error('Failed to generate documents:', error);
        throw error;
    }
}

// ============================================================================
// EXAMPLE 3: Generate Individual Documents
// ============================================================================

/**
 * Generate documents individually
 */
async function example3_generateIndividualDocuments() {
    console.log('=== Example 3: Generate Individual Documents ===');

    const factory = example1_initializeFactory();

    try {
        // Generate resume only
        console.log('Generating resume...');
        const resume = await factory.generateResume();
        console.log('Resume generated:', resume.success);

        // Generate cover letter only
        console.log('Generating cover letter...');
        const coverLetter = await factory.generateCoverLetter();
        console.log('Cover letter generated:', coverLetter.success);

        // Check status
        console.log('Current status:', factory.getStatus());

        return { resume, coverLetter };
    } catch (error) {
        console.error('Failed to generate document:', error);
        throw error;
    }
}

// ============================================================================
// EXAMPLE 4: Initialize Document Preview UI
// ============================================================================

/**
 * Initialize and use the document preview component
 */
async function example4_initializePreview() {
    console.log('=== Example 4: Initialize Document Preview ===');

    // Create preview container in HTML
    // <div id="document-preview-container"></div>

    // Initialize preview component
    const preview = new DocumentPreview('document-preview-container');
    preview.initialize();

    // Generate documents
    const factory = example1_initializeFactory();
    const result = await factory.generateAll();

    // Load documents into preview
    if (result.success) {
        preview.loadDocument('resume', result.results.resume);
        preview.loadDocument('coverLetter', result.results.coverLetter);
        preview.loadDocument('executiveBio', result.results.executiveBio);
        preview.loadDocument('brandStatement', result.results.brandStatement);
        preview.loadDocument('statusInquiry', result.results.statusInquiry);

        // Show resume by default
        preview.showDocument('resume');
    }

    // Register event listeners
    preview.on('documentShown', (data) => {
        console.log('Document shown:', data.type);
    });

    preview.on('documentEdited', (data) => {
        console.log('Document edited:', data.type);
        // Save edited content
        localStorage.setItem(`edited_${data.type}`, data.content);
    });

    return preview;
}

// ============================================================================
// EXAMPLE 5: Export Application Package
// ============================================================================

/**
 * Export complete application package with all documents
 */
async function example5_exportPackage() {
    console.log('=== Example 5: Export Application Package ===');

    // Initialize factory and generate documents
    const factory = example1_initializeFactory();
    await factory.generateAll();

    // Setup unified export with factory reference
    unifiedExport.setDocumentFactory(factory);

    // Add progress callback
    unifiedExport.addProgressCallback((progress) => {
        console.log(`Export progress: ${progress.stage} - ${progress.message}`);
    });

    try {
        // Export complete package
        const result = await unifiedExport.exportApplicationPackage({
            jobTitle: 'Staff_Software_Engineer',
            companyName: 'Innovative_Solutions',
            candidateName: 'John_Doe',
            documents: {
                resume: true,
                coverLetter: true,
                executiveBio: true,
                brandStatement: true,
                statusInquiry: true
            },
            formats: ['pdf', 'docx'],
            includeReadme: true,
            includeMetadata: true,
            namingConvention: 'standard',
            generateMissing: true, // Auto-generate if not already generated
            workflowState: factory.workflowState
        });

        if (result.success) {
            console.log('Package exported successfully!');
            console.log('Filename:', result.filename);
            console.log('File size:', result.metadata.fileSize);
            console.log('Total files:', result.metadata.totalFiles);

            // Trigger download
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.filename;
            link.click();

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(result.downloadUrl), 1000);
        }

        return result;
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}

// ============================================================================
// EXAMPLE 6: Smart Caching and Regeneration
// ============================================================================

/**
 * Demonstrate smart caching behavior
 */
async function example6_smartCaching() {
    console.log('=== Example 6: Smart Caching ===');

    const factory = example1_initializeFactory();

    // Generate resume first time
    console.log('First generation...');
    const start1 = Date.now();
    await factory.generateResume();
    const time1 = Date.now() - start1;
    console.log(`First generation took: ${time1}ms`);

    // Generate resume second time (should use cache)
    console.log('Second generation (cached)...');
    const start2 = Date.now();
    await factory.generateResume(); // Uses cache
    const time2 = Date.now() - start2;
    console.log(`Second generation took: ${time2}ms (cached)`);

    // Force regeneration
    console.log('Forced regeneration...');
    const start3 = Date.now();
    await factory.generateResume(true); // Force regenerate
    const time3 = Date.now() - start3;
    console.log(`Forced regeneration took: ${time3}ms`);

    // Clear cache
    factory.clearCache('resume');
    console.log('Cache cleared for resume');

    // Check status
    console.log('Status after cache clear:', factory.getStatus());
}

// ============================================================================
// EXAMPLE 7: Error Handling
// ============================================================================

/**
 * Demonstrate error handling
 */
async function example7_errorHandling() {
    console.log('=== Example 7: Error Handling ===');

    // Create factory with incomplete data
    const incompleteState = {
        user: {
            name: 'John Doe'
            // Missing required fields
        },
        job: {},
        analysis: {}
    };

    const factory = new DocumentFactory(incompleteState);

    try {
        // Try to generate resume (should fail due to missing data)
        await factory.generateResume();
    } catch (error) {
        console.log('Expected error caught:', error.message);
    }

    // Check status after error
    const status = factory.getStatus();
    console.log('Status after error:', status);
    console.log('Errors:', status.errors);
}

// ============================================================================
// EXAMPLE 8: Progressive Enhancement - Generate as Needed
// ============================================================================

/**
 * Generate documents progressively as user navigates
 */
async function example8_progressiveGeneration() {
    console.log('=== Example 8: Progressive Generation ===');

    const factory = example1_initializeFactory();
    const preview = new DocumentPreview('document-preview-container');
    preview.initialize();

    // Register tab click handler to generate on-demand
    preview.on('documentShown', async (data) => {
        console.log('User viewing:', data.type);

        // Check if document is already generated
        if (!factory.getCached(data.type)) {
            console.log('Generating', data.type, 'on demand...');

            try {
                // Generate based on type
                const methodName = `generate${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`;
                const result = await factory[methodName]();

                // Load into preview
                preview.loadDocument(data.type, result);
                preview.showDocument(data.type);
            } catch (error) {
                console.error('Failed to generate:', error);
                alert(`Failed to generate ${data.type}: ${error.message}`);
            }
        }
    });

    console.log('Progressive generation setup complete');
}

// ============================================================================
// EXAMPLE 9: Complete Workflow Integration
// ============================================================================

/**
 * Complete workflow: Initialize -> Generate -> Preview -> Export
 */
async function example9_completeWorkflow() {
    console.log('=== Example 9: Complete Workflow ===');

    try {
        // Step 1: Initialize factory
        console.log('Step 1: Initializing factory...');
        const factory = example1_initializeFactory();

        // Step 2: Generate all documents
        console.log('Step 2: Generating documents...');
        const generateResult = await factory.generateAll(
            (progress) => console.log(`  Progress: ${progress.current}/${progress.total}`),
            { parallel: true }
        );

        if (!generateResult.success) {
            throw new Error('Document generation failed');
        }

        // Step 3: Setup preview
        console.log('Step 3: Setting up preview...');
        const preview = new DocumentPreview('document-preview-container');
        preview.initialize();

        // Load all generated documents
        Object.entries(generateResult.results).forEach(([type, data]) => {
            preview.loadDocument(type, data);
        });

        preview.showDocument('resume');

        // Step 4: Export package
        console.log('Step 4: Exporting package...');
        unifiedExport.setDocumentFactory(factory);

        const exportResult = await unifiedExport.exportApplicationPackage({
            jobTitle: 'Staff_Software_Engineer',
            companyName: 'Innovative_Solutions',
            candidateName: 'John_Doe',
            documents: {
                resume: true,
                coverLetter: true,
                executiveBio: true,
                brandStatement: true,
                statusInquiry: true
            },
            formats: ['pdf', 'docx'],
            generateMissing: false, // Already generated
            workflowState: factory.workflowState
        });

        console.log('Workflow complete!');
        console.log('Export result:', exportResult);

        return {
            factory,
            preview,
            exportResult
        };
    } catch (error) {
        console.error('Workflow failed:', error);
        throw error;
    }
}

// ============================================================================
// EXAMPLE 10: Real-time Updates
// ============================================================================

/**
 * Demonstrate real-time updates when workflow state changes
 */
async function example10_realTimeUpdates() {
    console.log('=== Example 10: Real-time Updates ===');

    const factory = example1_initializeFactory();

    // Generate initial resume
    await factory.generateResume();
    console.log('Initial resume generated');

    // Simulate workflow state update
    console.log('Updating workflow state...');
    factory.updateWorkflowState({
        job: {
            ...factory.workflowState.job,
            title: 'Principal Software Engineer', // Changed job title
            company: 'New Company Inc'
        }
    });

    // Regenerate with new data
    console.log('Regenerating with updated state...');
    await factory.generateResume(true); // Force regenerate

    console.log('Resume updated with new job information');
}

// ============================================================================
// USAGE IN HTML
// ============================================================================

/*
<!DOCTYPE html>
<html>
<head>
    <title>ATSFlow - Document Generation</title>
    <!-- Load dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

    <!-- Load ATSFlow modules -->
    <script src="js/ai/resume-generator.js"></script>
    <script src="js/careerdocs/bio-generator.js"></script>
    <script src="js/careerdocs/brand-generator.js"></script>
    <script src="js/careerdocs/inquiry-generator.js"></script>
    <script src="js/coverletter/generator.js"></script>

    <!-- Load new unified system -->
    <script src="js/ai/document-factory.js"></script>
    <script src="js/ui/document-preview.js"></script>
    <script src="js/core/unified-export.js"></script>

    <!-- Load examples -->
    <script src="js/examples/document-generation-example.js"></script>
</head>
<body>
    <div id="document-preview-container"></div>

    <button onclick="example9_completeWorkflow()">Run Complete Workflow</button>

    <script>
        // Run when page loads
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await example9_completeWorkflow();
            } catch (error) {
                console.error('Failed to run workflow:', error);
            }
        });
    </script>
</body>
</html>
*/

// ============================================================================
// EXPORT EXAMPLES FOR USE
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        example1_initializeFactory,
        example2_generateAllDocuments,
        example3_generateIndividualDocuments,
        example4_initializePreview,
        example5_exportPackage,
        example6_smartCaching,
        example7_errorHandling,
        example8_progressiveGeneration,
        example9_completeWorkflow,
        example10_realTimeUpdates
    };
}
