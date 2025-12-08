# ATSFlow Test Suite

Comprehensive Jest test suite for the ATSFlow resume optimization platform.

## Overview

This test suite provides unit and integration tests for all core ATSFlow modules, ensuring code quality, reliability, and maintainability.

## Directory Structure

```
tests/
├── __mocks__/           # Mock files for assets
│   ├── styleMock.js     # CSS imports mock
│   └── fileMock.js      # Image/media imports mock
├── setup.js             # Jest global setup and configuration
├── unit/                # Unit tests
│   ├── state.test.js                 # State management tests
│   ├── resume-parser-client.test.js  # Parser client tests
│   ├── analyzer/                     # Analyzer module tests
│   │   └── scorer.test.js
│   └── utils/                        # Utility tests
│       ├── sanitizer.test.js
│       └── crypto.test.js
└── integration/         # Integration tests (future)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests with verbose output
```bash
npm run test:verbose
```

## Test Coverage

Current test coverage focuses on:

### Core Modules (100% coverage target)
- **State Management (state.js)**: Complete state management, event system, persistence
- **Resume Parser Client**: File validation, API communication, error handling
- **ATS Scorer**: Scoring algorithm, grade assignment, category weighting

### Security & Utilities (100% coverage target)
- **Input Sanitizer**: XSS prevention, HTML sanitization, file validation
- **Crypto Manager**: Encryption/decryption, key derivation, secure storage

## Test Statistics

- **Total Test Suites**: 5
- **Total Tests**: 183+
- **Key Test Areas**:
  - State Management: 45+ tests
  - Resume Parser: 35+ tests
  - ATS Scorer: 27+ tests
  - Input Sanitizer: 35+ tests
  - Crypto Manager: 40+ tests

## Writing New Tests

### Test File Template

```javascript
/**
 * Unit Tests for [ModuleName]
 * Description of what this module does
 */

describe('[ModuleName]', () => {
  let instance;

  beforeEach(() => {
    // Setup before each test
    instance = new ModuleName();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  describe('[Feature/Method Name]', () => {
    test('should [expected behavior]', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = instance.method(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Test One Thing**: Each test should verify a single behavior
4. **Mock External Dependencies**: Use Jest mocks for external APIs, localStorage, etc.
5. **Edge Cases**: Always test edge cases, error conditions, and boundary values

## Mocking Strategy

### DOM APIs
- `localStorage` and `sessionStorage` are mocked in `setup.js`
- `document` createElement is mocked where needed for DOM manipulation tests
- `fetch` is mocked globally for API testing

### Browser APIs
- `crypto.subtle` (Web Crypto API) mocked for encryption tests
- `TextEncoder`/`TextDecoder` mocked for Node.js compatibility
- Canvas API mocked via `jest-canvas-mock` for Chart.js tests

### Example Mock Usage

```javascript
// Mock fetch for API tests
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true })
});

// Use in test
await client.parseResume(file);
expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedOptions);
```

## Coverage Thresholds

Minimum coverage requirements (enforced by Jest):
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Goal: Achieve 80%+ coverage across all modules

## CI/CD Integration

This test suite is designed to integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests Failing Locally

1. **Clear Jest cache**: `npx jest --clearCache`
2. **Reinstall dependencies**: `rm -rf node_modules && npm install`
3. **Check Node version**: Requires Node.js 16+

### Coverage Not Updating

1. **Remove coverage directory**: `rm -rf coverage`
2. **Run tests with coverage**: `npm run test:coverage`

### Mock Issues

If mocks aren't working:
1. Ensure mocks are defined before imports
2. Check `setup.js` is being loaded
3. Verify `jest.config.js` setupFilesAfterEnv includes setup.js

## Future Enhancements

- [ ] Integration tests for full user workflows
- [ ] E2E tests with Playwright or Cypress
- [ ] Performance benchmarking tests
- [ ] Visual regression tests for templates
- [ ] API contract tests
- [ ] Mutation testing with Stryker

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass: `npm test`
3. Verify coverage: `npm run test:coverage`
4. Update this README if adding new test categories

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Mocking Guide](https://jestjs.io/docs/mock-functions)
