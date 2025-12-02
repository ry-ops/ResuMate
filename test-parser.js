// Test script for resume parser
// Tests PDF, DOCX, and TXT parsing functionality

const fs = require('fs');
const path = require('path');
const parser = require('./js/export/parser');

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, colors.green);
}

function logError(message) {
    log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
    log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
    log(`⚠ ${message}`, colors.yellow);
}

// Test cases
async function runTests() {
    log('\n===========================================', colors.bright);
    log('ResuMate Parser Test Suite', colors.bright);
    log('===========================================\n', colors.bright);

    let passCount = 0;
    let failCount = 0;

    // Test 1: Plain text parsing
    log('Test 1: Plain Text Parsing', colors.cyan);
    try {
        const sampleText = `John Doe
john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years in web development.

EXPERIENCE
Senior Developer
Tech Company Inc.
2020 - Present
- Led development of major features
- Mentored junior developers

EDUCATION
Bachelor of Science in Computer Science
University of Technology
2015 - 2019

SKILLS
JavaScript, Python, React, Node.js, AWS`;

        const result = await parser.parseResume(
            Buffer.from(sampleText),
            'sample-resume.txt',
            null,
            { useAI: false, extractSections: true }
        );

        if (result.success && result.sections.length > 0) {
            logSuccess('Plain text parsing successful');
            logInfo(`  - Found ${result.sections.length} sections`);
            logInfo(`  - Text length: ${result.text.length} characters`);
            logInfo(`  - Word count: ${result.stats.wordCount} words`);
            passCount++;
        } else {
            logError('Plain text parsing failed');
            console.log('  Error:', result.error);
            failCount++;
        }
    } catch (error) {
        logError(`Plain text parsing threw error: ${error.message}`);
        failCount++;
    }
    console.log('');

    // Test 2: File type detection
    log('Test 2: File Type Detection', colors.cyan);
    try {
        const tests = [
            { file: 'resume.pdf', expected: 'pdf' },
            { file: 'resume.docx', expected: 'docx' },
            { file: 'resume.doc', expected: 'docx' },
            { file: 'resume.txt', expected: 'txt' },
            { file: 'resume.xyz', expected: null }
        ];

        let allPassed = true;
        tests.forEach(test => {
            const detected = parser.getFileType(test.file);
            if (detected === test.expected) {
                logInfo(`  ✓ ${test.file} → ${detected || 'null'}`);
            } else {
                logError(`  ✗ ${test.file} → Expected: ${test.expected}, Got: ${detected}`);
                allPassed = false;
            }
        });

        if (allPassed) {
            logSuccess('File type detection successful');
            passCount++;
        } else {
            logError('Some file type detections failed');
            failCount++;
        }
    } catch (error) {
        logError(`File type detection threw error: ${error.message}`);
        failCount++;
    }
    console.log('');

    // Test 3: Resume validation
    log('Test 3: Resume Validation', colors.cyan);
    try {
        const mockParsedData = {
            success: true,
            text: 'Sample resume text with sufficient length to pass validation checks',
            structuredData: {
                personalInfo: {
                    name: 'John Doe',
                    email: 'john.doe@email.com',
                    phone: '(555) 123-4567'
                },
                experience: [
                    {
                        title: 'Senior Developer',
                        company: 'Tech Co',
                        startDate: '2020-01',
                        endDate: 'Present'
                    }
                ],
                education: [
                    {
                        degree: 'Bachelor of Science',
                        school: 'University',
                        graduationDate: '2019-05'
                    }
                ],
                skills: {
                    technical: ['JavaScript', 'Python'],
                    frameworks: ['React', 'Node.js']
                }
            }
        };

        const validation = parser.validateResumeData(mockParsedData);

        if (validation.valid) {
            logSuccess('Resume validation successful');
            logInfo(`  - Valid: ${validation.valid}`);
            logInfo(`  - Completeness score: ${validation.score}/100`);
            logInfo(`  - Warnings: ${validation.warnings.length}`);
            validation.warnings.forEach(w => logWarning(`    - ${w}`));
            passCount++;
        } else {
            logError('Resume validation failed');
            console.log('  Errors:', validation.errors);
            failCount++;
        }
    } catch (error) {
        logError(`Resume validation threw error: ${error.message}`);
        failCount++;
    }
    console.log('');

    // Test 4: Completeness scoring
    log('Test 4: Completeness Scoring', colors.cyan);
    try {
        const testCases = [
            {
                name: 'Complete resume',
                data: {
                    success: true,
                    structuredData: {
                        personalInfo: { name: 'John Doe', email: 'john@email.com', location: 'NYC' },
                        summary: 'Experienced developer with strong background in full-stack development',
                        experience: [{ title: 'Dev', company: 'Co' }, { title: 'Dev2', company: 'Co2' }],
                        education: [{ degree: 'BS CS', school: 'Uni' }],
                        skills: { technical: ['JS', 'Python', 'React', 'Node', 'AWS'] },
                        certifications: [{ name: 'AWS Cert' }],
                        projects: [{ name: 'Project 1' }]
                    }
                },
                expectedMin: 90
            },
            {
                name: 'Minimal resume',
                data: {
                    success: true,
                    structuredData: {
                        personalInfo: { name: 'Jane Doe' },
                        experience: [],
                        education: [],
                        skills: {}
                    }
                },
                expectedMax: 30
            }
        ];

        let allPassed = true;
        testCases.forEach(test => {
            const score = parser.calculateCompletenessScore(test.data);
            const passed = test.expectedMin ? score >= test.expectedMin : score <= test.expectedMax;

            if (passed) {
                logInfo(`  ✓ ${test.name}: ${score}/100`);
            } else {
                logError(`  ✗ ${test.name}: ${score}/100 (expected ${test.expectedMin ? '>=' + test.expectedMin : '<=' + test.expectedMax})`);
                allPassed = false;
            }
        });

        if (allPassed) {
            logSuccess('Completeness scoring successful');
            passCount++;
        } else {
            logError('Some completeness scores failed expectations');
            failCount++;
        }
    } catch (error) {
        logError(`Completeness scoring threw error: ${error.message}`);
        failCount++;
    }
    console.log('');

    // Test 5: Multiple resume parsing (mock)
    log('Test 5: Batch Parsing Interface', colors.cyan);
    try {
        const sampleFiles = [
            { buffer: Buffer.from('Resume 1 text'), filename: 'resume1.txt' },
            { buffer: Buffer.from('Resume 2 text'), filename: 'resume2.txt' }
        ];

        const results = await parser.parseMultipleResumes(sampleFiles, null, {
            useAI: false,
            extractSections: false
        });

        if (results.length === 2 && results.every(r => r.success)) {
            logSuccess('Batch parsing successful');
            logInfo(`  - Processed ${results.length} resumes`);
            passCount++;
        } else {
            logError('Batch parsing failed');
            console.log('  Results:', results);
            failCount++;
        }
    } catch (error) {
        logError(`Batch parsing threw error: ${error.message}`);
        failCount++;
    }
    console.log('');

    // Summary
    log('===========================================', colors.bright);
    log('Test Summary', colors.bright);
    log('===========================================', colors.bright);
    logSuccess(`Passed: ${passCount}`);
    if (failCount > 0) {
        logError(`Failed: ${failCount}`);
    } else {
        logInfo(`Failed: ${failCount}`);
    }
    log(`Total:  ${passCount + failCount}\n`, colors.bright);

    if (failCount === 0) {
        log('All tests passed! ✓', colors.green + colors.bright);
    } else {
        log('Some tests failed. Please review the errors above.', colors.red + colors.bright);
    }
    console.log('');

    // Additional info
    logInfo('Note: PDF and DOCX parsing require actual file samples to test.');
    logInfo('AI extraction requires a valid Claude API key.');
    logInfo('To test with real files, place sample resumes in a test/ directory.\n');
}

// Run tests
runTests().catch(error => {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
});
