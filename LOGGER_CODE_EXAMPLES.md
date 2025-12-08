# Logger Implementation - Code Examples

## Logger Utility Implementation

**File:** `/Users/ryandahlberg/Projects/ATSFlow/js/utils/logger.js`

```javascript
class Logger {
    constructor() {
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            NONE: 4
        };
        
        this.config = {
            level: this.levels.INFO,
            enabled: true,
            timestamp: true,
            colorize: true,
            prefix: true
        };
        
        this.colors = {
            DEBUG: '#6B7280', // Gray
            INFO: '#3B82F6',  // Blue
            WARN: '#F59E0B',  // Orange
            ERROR: '#EF4444'  // Red
        };
    }
    
    debug(...args) { /* ... */ }
    info(...args) { /* ... */ }
    warn(...args) { /* ... */ }
    error(...args) { /* ... */ }
    
    namespace(name) { /* ... */ }
    setLevel(level) { /* ... */ }
    setEnabled(enabled) { /* ... */ }
}

const logger = new Logger();
```

## Real Examples from Modified Files

### 1. Server.js (Node.js Backend)

**Before:**
```javascript
const express = require('express');
const cors = require('cors');

console.log(`[Parse] Processing file: ${req.file.originalname}`);
console.error('[Parse] Error:', error);
console.warn('[Security] CSP config not found');
```

**After:**
```javascript
const express = require('express');
const cors = require('cors');
const logger = require('./js/utils/logger');

logger.info(`[Parse] Processing file: ${req.file.originalname}`);
logger.error('[Parse] Error:', error);
logger.warn('[Security] CSP config not found');
```

### 2. js/ai/job-parser.js (Browser)

**Before:**
```javascript
async parseJobDescription(jobDescription, apiKey) {
    const cacheKey = this.getCacheKey(jobDescription);
    if (this.cache.has(cacheKey)) {
        console.log('[JobParser] Using cached job data');
        return this.cache.get(cacheKey);
    }

    console.log('[JobParser] Parsing job description...');
    
    try {
        // ... parsing logic ...
        console.log('[JobParser] Job description parsed successfully');
        return result;
    } catch (error) {
        console.error('[JobParser] Error parsing job description:', error);
        throw new Error('Failed to parse job description');
    }
}
```

**After:**
```javascript
async parseJobDescription(jobDescription, apiKey) {
    const cacheKey = this.getCacheKey(jobDescription);
    if (this.cache.has(cacheKey)) {
        if (typeof logger !== 'undefined') logger.info('[JobParser] Using cached job data');
        return this.cache.get(cacheKey);
    }

    if (typeof logger !== 'undefined') logger.info('[JobParser] Parsing job description...');
    
    try {
        // ... parsing logic ...
        if (typeof logger !== 'undefined') logger.info('[JobParser] Job description parsed successfully');
        return result;
    } catch (error) {
        if (typeof logger !== 'undefined') logger.error('[JobParser] Error parsing job description:', error);
        throw new Error('Failed to parse job description');
    }
}
```

### 3. js/state.js (Browser)

**Before:**
```javascript
loadFromStorage() {
    try {
        const saved = localStorage.getItem('resumate_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state = { ...this.state, ...parsed };
            console.log('State loaded from localStorage');
        }
    } catch (error) {
        console.error('Failed to load state from localStorage:', error);
    }
}

saveToStorage() {
    try {
        localStorage.setItem('resumate_state', JSON.stringify(this.state));
        console.log('State saved to localStorage');
        return true;
    } catch (error) {
        console.error('Failed to save state to localStorage:', error);
        return false;
    }
}
```

**After:**
```javascript
loadFromStorage() {
    try {
        const saved = localStorage.getItem('resumate_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state = { ...this.state, ...parsed };
            if (typeof logger !== 'undefined') {
                logger.info('State loaded from localStorage');
            }
        }
    } catch (error) {
        if (typeof logger !== 'undefined') {
            logger.error('Failed to load state from localStorage:', error);
        }
    }
}

saveToStorage() {
    try {
        localStorage.setItem('resumate_state', JSON.stringify(this.state));
        if (typeof logger !== 'undefined') {
            logger.info('State saved to localStorage');
        }
        return true;
    } catch (error) {
        if (typeof logger !== 'undefined') {
            logger.error('Failed to save state to localStorage:', error);
        }
        return false;
    }
}
```

### 4. js/editor/preview.js (Browser)

**Before:**
```javascript
initialize(containerId, resumeBuilder) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
        console.error(`Preview container '${containerId}' not found`);
        return false;
    }

    console.log('[Preview] Initialized successfully');
    return true;
}

setViewMode(mode) {
    this.viewMode = mode;
    this.render();
    console.log(`[Preview] View mode changed to: ${mode}`);
}
```

**After:**
```javascript
initialize(containerId, resumeBuilder) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
        if (typeof logger !== 'undefined') logger.error(`Preview container '${containerId}' not found`);
        return false;
    }

    if (typeof logger !== 'undefined') logger.info('[Preview] Initialized successfully');
    return true;
}

setViewMode(mode) {
    this.viewMode = mode;
    this.render();
    if (typeof logger !== 'undefined') logger.info(`[Preview] View mode changed to: ${mode}`);
}
```

### 5. js/export/parser.js (Browser)

**Before:**
```javascript
async parseResume(fileBuffer, filename, apiKey, options = {}) {
    console.log(`[Parser] Parsing ${filename}...`);
    
    try {
        const result = await this.parseFile(fileBuffer, filename);
        console.log('[Parser] Parse successful');
        return result;
    } catch (error) {
        console.error('[Parser] Parse failed:', error);
        return { success: false, error: error.message };
    }
}
```

**After:**
```javascript
async parseResume(fileBuffer, filename, apiKey, options = {}) {
    if (typeof logger !== 'undefined') logger.info(`[Parser] Parsing ${filename}...`);
    
    try {
        const result = await this.parseFile(fileBuffer, filename);
        if (typeof logger !== 'undefined') logger.info('[Parser] Parse successful');
        return result;
    } catch (error) {
        if (typeof logger !== 'undefined') logger.error('[Parser] Parse failed:', error);
        return { success: false, error: error.message };
    }
}
```

## HTML Integration

Add logger before other scripts in your HTML files:

```html
<!DOCTYPE html>
<html>
<head>
    <title>ATSFlow</title>
</head>
<body>
    <!-- Load logger first -->
    <script src="js/utils/logger.js"></script>
    
    <!-- Then other modules -->
    <script src="js/state.js"></script>
    <script src="js/ai/generator.js"></script>
    <script src="js/editor/builder.js"></script>
    
    <script>
        // Configure logger for production
        if (window.location.hostname !== 'localhost') {
            logger.setLevel('ERROR');
        }
        
        // App initialization
        logger.info('ATSFlow application loaded');
    </script>
</body>
</html>
```

## Console Output Examples

When logger is enabled with timestamps and colors:

```
[12:34:56.789] [INFO] ATSFlow application loaded
[12:34:56.890] [INFO] [JobParser] Parsing job description...
[12:34:57.123] [INFO] [JobParser] Job description parsed successfully
[12:34:57.456] [WARN] API key missing, using cached data
[12:34:57.789] [ERROR] Failed to save state: QuotaExceededError
```

## Advanced Usage - Namespaced Loggers

Create module-specific loggers:

```javascript
// In js/ai/generator.js
const aiLogger = logger.namespace('AIGenerator');

class AIGenerator {
    async generate(prompt) {
        aiLogger.info('Generating content');
        try {
            const result = await this.callAPI(prompt);
            aiLogger.debug('Raw response:', result);
            return result;
        } catch (error) {
            aiLogger.error('Generation failed:', error);
            throw error;
        }
    }
}
```

Output:
```
[12:34:56.789] [INFO] [AIGenerator] Generating content
[12:34:57.123] [DEBUG] [AIGenerator] Raw response: {...}
```

## Configuration Examples

```javascript
// Development: Show all logs
logger.setLevel('DEBUG');
logger.setEnabled(true);
logger.setTimestamp(true);
logger.setColorize(true);

// Production: Only errors
logger.setLevel('ERROR');

// Staging: Warnings and errors
logger.setLevel('WARN');

// Disable completely
logger.setEnabled(false);

// Disable timestamps for cleaner output
logger.setTimestamp(false);

// Get current config
const config = logger.getConfig();
console.log(config);
// { level: 1, enabled: true, timestamp: true, colorize: true, prefix: true }
```
