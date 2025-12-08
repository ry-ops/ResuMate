/**
 * Jest Setup File
 * Configures the test environment for ATSFlow tests
 */

// Setup Jest DOM matchers
require('@testing-library/jest-dom');

// Mock localStorage
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value.toString();
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
};

// Mock sessionStorage
global.sessionStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value.toString();
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
};

// Mock window.fetch for API tests
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Setup canvas mock (required for Chart.js and PDF generation)
require('jest-canvas-mock');

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  fetch.mockClear();
});

// Cleanup after each test
afterEach(() => {
  jest.restoreAllMocks();
});
