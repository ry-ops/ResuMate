/**
 * ATSFlow Logger
 * Centralized logging utility with configurable levels and formatting
 */

class Logger {
    constructor() {
        // Log levels
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            NONE: 4
        };

        // Default configuration
        this.config = {
            level: this.levels.INFO,
            enabled: true,
            timestamp: true,
            colorize: true,
            prefix: true
        };

        // ANSI color codes for console (browser-safe)
        this.colors = {
            DEBUG: '#6B7280', // Gray
            INFO: '#3B82F6',  // Blue
            WARN: '#F59E0B',  // Orange
            ERROR: '#EF4444'  // Red
        };

        // Load config from localStorage if available
        this.loadConfig();
    }

    /**
     * Load configuration from localStorage
     */
    loadConfig() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('resumate_logger_config');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.config = { ...this.config, ...parsed };
                }
            }
        } catch (error) {
            // Silently fail if localStorage is not available
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveConfig() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('resumate_logger_config', JSON.stringify(this.config));
            }
        } catch (error) {
            // Silently fail
        }
    }

    /**
     * Set log level
     * @param {string} level - One of: DEBUG, INFO, WARN, ERROR, NONE
     */
    setLevel(level) {
        const upperLevel = level.toUpperCase();
        if (this.levels.hasOwnProperty(upperLevel)) {
            this.config.level = this.levels[upperLevel];
            this.saveConfig();
        } else {
            console.warn(`Invalid log level: ${level}. Use DEBUG, INFO, WARN, ERROR, or NONE`);
        }
    }

    /**
     * Enable or disable logging
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.saveConfig();
    }

    /**
     * Enable or disable timestamps
     * @param {boolean} enabled
     */
    setTimestamp(enabled) {
        this.config.timestamp = enabled;
        this.saveConfig();
    }

    /**
     * Enable or disable colors
     * @param {boolean} enabled
     */
    setColorize(enabled) {
        this.config.colorize = enabled;
        this.saveConfig();
    }

    /**
     * Enable or disable prefix
     * @param {boolean} enabled
     */
    setPrefix(enabled) {
        this.config.prefix = enabled;
        this.saveConfig();
    }

    /**
     * Format timestamp
     */
    formatTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${ms}`;
    }

    /**
     * Format log message
     * @param {string} level - Log level name
     * @param {string} context - Optional context/module name
     * @param {Array} args - Log arguments
     */
    formatMessage(level, context, args) {
        const parts = [];

        // Add timestamp
        if (this.config.timestamp) {
            parts.push(`[${this.formatTimestamp()}]`);
        }

        // Add level
        if (this.config.prefix) {
            parts.push(`[${level}]`);
        }

        // Add context if provided
        if (context && this.config.prefix) {
            parts.push(`[${context}]`);
        }

        return parts.join(' ');
    }

    /**
     * Core logging method
     * @param {string} level - Log level name
     * @param {number} levelValue - Log level numeric value
     * @param {string} context - Optional context
     * @param {Array} args - Arguments to log
     */
    log(level, levelValue, context, ...args) {
        // Check if logging is enabled and level is appropriate
        if (!this.config.enabled || levelValue < this.config.level) {
            return;
        }

        const prefix = this.formatMessage(level, context, args);
        const color = this.colors[level];

        // Log with color if enabled
        if (this.config.colorize && color && typeof console !== 'undefined') {
            console.log(`%c${prefix}`, `color: ${color}; font-weight: bold`, ...args);
        } else if (typeof console !== 'undefined') {
            console.log(prefix, ...args);
        }
    }

    /**
     * Debug level logging
     * @param {...any} args - Arguments to log
     */
    debug(...args) {
        this.log('DEBUG', this.levels.DEBUG, null, ...args);
    }

    /**
     * Info level logging
     * @param {...any} args - Arguments to log
     */
    info(...args) {
        this.log('INFO', this.levels.INFO, null, ...args);
    }

    /**
     * Warning level logging
     * @param {...any} args - Arguments to log
     */
    warn(...args) {
        this.log('WARN', this.levels.WARN, null, ...args);
    }

    /**
     * Error level logging
     * @param {...any} args - Arguments to log
     */
    error(...args) {
        this.log('ERROR', this.levels.ERROR, null, ...args);
    }

    /**
     * Create a namespaced logger
     * @param {string} namespace - Namespace/context for the logger
     * @returns {Object} Logger methods bound to namespace
     */
    namespace(namespace) {
        return {
            debug: (...args) => this.log('DEBUG', this.levels.DEBUG, namespace, ...args),
            info: (...args) => this.log('INFO', this.levels.INFO, namespace, ...args),
            warn: (...args) => this.log('WARN', this.levels.WARN, namespace, ...args),
            error: (...args) => this.log('ERROR', this.levels.ERROR, namespace, ...args)
        };
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Reset to default configuration
     */
    resetConfig() {
        this.config = {
            level: this.levels.INFO,
            enabled: true,
            timestamp: true,
            colorize: true,
            prefix: true
        };
        this.saveConfig();
    }
}

// Create singleton instance
const logger = new Logger();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
}

// Also make available globally in browser
if (typeof window !== 'undefined') {
    window.logger = logger;
}
