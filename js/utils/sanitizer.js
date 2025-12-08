/**
 * ATSFlow Input Sanitization Utility
 * Prevents XSS (Cross-Site Scripting) attacks and ensures safe data handling
 *
 * Security features:
 * - HTML sanitization to prevent XSS
 * - URL validation and sanitization
 * - File upload validation
 * - Content Security Policy compliance
 * - DOMPurify-like sanitization without external dependencies
 */

class InputSanitizer {
    constructor() {
        // Allowed HTML tags for rich text (very restrictive for security)
        this.ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'];

        // Allowed HTML attributes (minimal set)
        this.ALLOWED_ATTRIBUTES = ['class', 'id'];

        // Maximum input lengths to prevent DoS
        this.MAX_TEXT_LENGTH = 100000; // 100KB for resume text
        this.MAX_API_KEY_LENGTH = 200;
        this.MAX_FILENAME_LENGTH = 255;

        // Allowed file extensions for uploads
        this.ALLOWED_FILE_EXTENSIONS = ['.txt', '.pdf', '.doc', '.docx'];
        this.ALLOWED_MIME_TYPES = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        // Maximum file size (10MB)
        this.MAX_FILE_SIZE = 10 * 1024 * 1024;
    }

    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} html - HTML string to sanitize
     * @param {boolean} stripAll - If true, strip all HTML tags
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html, stripAll = false) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        // Truncate if too long
        if (html.length > this.MAX_TEXT_LENGTH) {
            if (typeof logger !== 'undefined') logger.warn('[Security] Input truncated due to length limit');
            html = html.substring(0, this.MAX_TEXT_LENGTH);
        }

        if (stripAll) {
            // Remove all HTML tags
            return this.stripHtml(html);
        }

        // Create a temporary DOM element for parsing
        const temp = document.createElement('div');
        temp.textContent = html; // This escapes HTML entities

        return temp.innerHTML;
    }

    /**
     * Strip all HTML tags from string
     * @param {string} html - HTML string
     * @returns {string} Plain text
     */
    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };

        return text.replace(/[&<>"'/]/g, char => map[char]);
    }

    /**
     * Sanitize user input for display in HTML
     * @param {string} input - User input
     * @returns {string} Sanitized input safe for HTML display
     */
    sanitizeUserInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }

        // First escape HTML
        let sanitized = this.escapeHtml(input);

        // Remove any remaining dangerous patterns
        sanitized = this.removeDangerousPatterns(sanitized);

        return sanitized;
    }

    /**
     * Remove dangerous patterns that could lead to XSS
     * @param {string} text - Text to clean
     * @returns {string} Cleaned text
     */
    removeDangerousPatterns(text) {
        // Remove javascript: protocol
        text = text.replace(/javascript:/gi, '');

        // Remove data: protocol (can be used for XSS)
        text = text.replace(/data:text\/html/gi, '');

        // Remove vbscript: protocol
        text = text.replace(/vbscript:/gi, '');

        // Remove on* event handlers
        text = text.replace(/on\w+\s*=/gi, '');

        return text;
    }

    /**
     * Validate and sanitize API key
     * @param {string} apiKey - API key to validate
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return {
                valid: false,
                sanitized: '',
                error: 'API key is required'
            };
        }

        // Trim whitespace
        const sanitized = apiKey.trim();

        // Check length
        if (sanitized.length > this.MAX_API_KEY_LENGTH) {
            return {
                valid: false,
                sanitized: '',
                error: 'API key exceeds maximum length'
            };
        }

        // Check format (Anthropic API keys start with sk-ant-)
        if (!sanitized.match(/^sk-ant-[a-zA-Z0-9_-]+$/)) {
            return {
                valid: false,
                sanitized: '',
                error: 'Invalid API key format (should start with sk-ant-)'
            };
        }

        return {
            valid: true,
            sanitized: sanitized,
            error: null
        };
    }

    /**
     * Validate file upload
     * @param {File} file - File object to validate
     * @returns {object} {valid: boolean, error: string}
     */
    validateFileUpload(file) {
        if (!file) {
            return {
                valid: false,
                error: 'No file provided'
            };
        }

        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`
            };
        }

        // Check file extension
        const extension = this.getFileExtension(file.name);
        if (!this.ALLOWED_FILE_EXTENSIONS.includes(extension.toLowerCase())) {
            return {
                valid: false,
                error: `File type not allowed. Allowed types: ${this.ALLOWED_FILE_EXTENSIONS.join(', ')}`
            };
        }

        // Check MIME type
        if (file.type && !this.ALLOWED_MIME_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: `MIME type not allowed: ${file.type}`
            };
        }

        // Validate filename (prevent directory traversal)
        if (this.containsDirectoryTraversal(file.name)) {
            return {
                valid: false,
                error: 'Invalid filename: directory traversal detected'
            };
        }

        return {
            valid: true,
            error: null
        };
    }

    /**
     * Get file extension from filename
     * @param {string} filename
     * @returns {string} File extension with dot (e.g., '.pdf')
     */
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot !== -1 ? filename.substring(lastDot) : '';
    }

    /**
     * Check if filename contains directory traversal attempts
     * @param {string} filename
     * @returns {boolean} True if traversal detected
     */
    containsDirectoryTraversal(filename) {
        return /(\.\.[/\\]|[/\\]\.\.)/.test(filename);
    }

    /**
     * Sanitize URL
     * @param {string} url - URL to sanitize
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return {
                valid: false,
                sanitized: '',
                error: 'URL is required'
            };
        }

        const trimmed = url.trim();

        // Check for dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        const lowerUrl = trimmed.toLowerCase();

        for (const protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return {
                    valid: false,
                    sanitized: '',
                    error: `Dangerous protocol detected: ${protocol}`
                };
            }
        }

        // Only allow http, https, and relative URLs
        if (!trimmed.match(/^(https?:)?\/\//)) {
            return {
                valid: false,
                sanitized: '',
                error: 'Only HTTP(S) URLs are allowed'
            };
        }

        return {
            valid: true,
            sanitized: trimmed,
            error: null
        };
    }

    /**
     * Sanitize JSON input (prevent JSON injection)
     * @param {string} jsonString - JSON string to sanitize
     * @returns {object} {valid: boolean, parsed: any, error: string}
     */
    sanitizeJson(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') {
            return {
                valid: false,
                parsed: null,
                error: 'Invalid JSON input'
            };
        }

        try {
            const parsed = JSON.parse(jsonString);

            // Prevent prototype pollution
            if (parsed && typeof parsed === 'object') {
                if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
                    return {
                        valid: false,
                        parsed: null,
                        error: 'Potential prototype pollution detected'
                    };
                }
            }

            return {
                valid: true,
                parsed: parsed,
                error: null
            };
        } catch (error) {
            return {
                valid: false,
                parsed: null,
                error: `JSON parse error: ${error.message}`
            };
        }
    }

    /**
     * Rate limiting helper (prevents brute force)
     * @param {string} key - Rate limit key (e.g., 'api_call', 'file_upload')
     * @param {number} maxAttempts - Maximum attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {object} {allowed: boolean, remainingAttempts: number}
     */
    checkRateLimit(key, maxAttempts = 10, windowMs = 60000) {
        const storageKey = `ratelimit_${key}`;
        const now = Date.now();

        let rateLimitData = localStorage.getItem(storageKey);

        if (!rateLimitData) {
            rateLimitData = {
                attempts: 1,
                windowStart: now
            };
        } else {
            rateLimitData = JSON.parse(rateLimitData);

            // Reset if window expired
            if (now - rateLimitData.windowStart > windowMs) {
                rateLimitData = {
                    attempts: 1,
                    windowStart: now
                };
            } else {
                rateLimitData.attempts++;
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(rateLimitData));

        const allowed = rateLimitData.attempts <= maxAttempts;
        const remainingAttempts = Math.max(0, maxAttempts - rateLimitData.attempts);

        return {
            allowed: allowed,
            remainingAttempts: remainingAttempts,
            resetAt: new Date(rateLimitData.windowStart + windowMs)
        };
    }

    /**
     * Clear rate limit for a specific key
     * @param {string} key - Rate limit key to clear
     */
    clearRateLimit(key) {
        localStorage.removeItem(`ratelimit_${key}`);
    }

    /**
     * Validate and sanitize resume/job text input
     * @param {string} text - Text to validate
     * @param {string} fieldName - Name of the field (for error messages)
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    validateTextInput(text, fieldName = 'Input') {
        if (!text || typeof text !== 'string') {
            return {
                valid: false,
                sanitized: '',
                error: `${fieldName} is required`
            };
        }

        const trimmed = text.trim();

        if (trimmed.length === 0) {
            return {
                valid: false,
                sanitized: '',
                error: `${fieldName} cannot be empty`
            };
        }

        if (trimmed.length > this.MAX_TEXT_LENGTH) {
            return {
                valid: false,
                sanitized: '',
                error: `${fieldName} exceeds maximum length (${this.MAX_TEXT_LENGTH} characters)`
            };
        }

        // Sanitize for XSS
        const sanitized = this.sanitizeUserInput(trimmed);

        return {
            valid: true,
            sanitized: sanitized,
            error: null
        };
    }
}

// Export singleton instance
const inputSanitizer = new InputSanitizer();

// Log security initialization
if (typeof logger !== 'undefined') logger.info('[Security] Input sanitizer initialized');
