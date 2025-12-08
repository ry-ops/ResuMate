# Jest Testing Quick Start Guide

## Quick Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run with verbose output
npm run test:verbose

# Run specific test file
npm test -- tests/unit/resume-parser-client.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should validate"
```

## Project Structure

```
ATSFlow/
├── jest.config.js              # Jest configuration
├── package.json                # Updated with test scripts
├── tests/
│   ├── README.md              # Detailed testing docs
│   ├── setup.js               # Global test setup
│   ├── __mocks__/             # Asset mocks
│   ├── unit/                  # Unit tests
│   │   ├── state.test.js              (45+ tests)
│   │   ├── resume-parser-client.test.js  (37 tests ✅)
│   │   ├── analyzer/
│   │   │   └── scorer.test.js         (27 tests)
│   │   └── utils/
│   │       ├── sanitizer.test.js      (35+ tests)
│   │       └── crypto.test.js         (40+ tests)
│   └── integration/           # Integration tests (future)
└── JEST_SETUP_SUMMARY.md      # Complete setup documentation
```

## What's Tested

### ✅ Resume Parser Client (37 tests - ALL PASSING)
- File validation (PDF, DOCX, DOC, TXT)
- API communication
- Error handling
- Batch processing

### 📝 State Management (45+ tests)
- Section CRUD operations
- Event system
- localStorage persistence
- State import/export

### 🎯 ATS Scorer (27 tests)
- 5-category weighted scoring
- Grade assignment (A+ to F)
- Strengths/weaknesses analysis
- Score breakdowns

### 🔒 Security - Input Sanitizer (35+ tests)
- XSS prevention
- HTML sanitization
- File validation
- API key validation

### 🔐 Crypto Manager (40+ tests)
- AES-GCM encryption
- Key derivation (PBKDF2)
- Secure storage
- Key migration

## Test Coverage

Current: **183+ tests** across 5 test suites
Target: 80%+ code coverage

Run `npm run test:coverage` to see detailed coverage report.

## Writing Your First Test

```javascript
// tests/unit/mymodule.test.js
describe('MyModule', () => {
  test('should do something', () => {
    // Arrange - setup test data
    const input = 'test';

    // Act - execute the code
    const result = myFunction(input);

    // Assert - verify the result
    expect(result).toBe('expected output');
  });
});
```

## Common Jest Matchers

```javascript
expect(value).toBe(expected)           // Exact equality (===)
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeTruthy()             // Boolean true
expect(value).toBeFalsy()              // Boolean false
expect(value).toBeNull()               // Null check
expect(value).toBeUndefined()          // Undefined check
expect(value).toContain(item)          // Array/string contains
expect(value).toHaveLength(number)     // Array/string length
expect(value).toHaveProperty(key)      // Object has property
expect(fn).toThrow()                   // Function throws error
expect(fn).toHaveBeenCalled()          // Mock was called
expect(fn).toHaveBeenCalledWith(args)  // Mock called with args
```

## Mocking Examples

```javascript
// Mock a function
const mockFn = jest.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue(Promise.resolve('async result'));

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' })
});

// Mock localStorage
localStorage.setItem('key', 'value');
expect(localStorage.getItem('key')).toBe('value');
```

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run only one test
test.only('should run only this test', () => {
  // ...
});

# Skip a test
test.skip('should skip this test', () => {
  // ...
});
```

## Coverage Reports

After running `npm run test:coverage`:
- **Terminal**: Summary in console
- **HTML**: Open `coverage/lcov-report/index.html` in browser
- **LCOV**: Machine-readable format for CI/CD

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Next Steps

1. Review test files in `tests/unit/`
2. Run `npm test` to see current status
3. Add tests for new features before implementation (TDD)
4. Keep coverage above 50% (enforced by Jest)
5. Read `tests/README.md` for detailed guidelines

## Getting Help

- Jest Docs: https://jestjs.io/
- Project Tests: `tests/README.md`
- Setup Details: `JEST_SETUP_SUMMARY.md`

## Key Stats

- 📦 **2,625 lines** of test code written
- ✅ **183+ tests** covering core functionality
- 🎯 **100% pass rate** on resume-parser-client
- 🔒 **Security-focused** tests for XSS and encryption
- 📊 **Coverage thresholds** set at 50%
