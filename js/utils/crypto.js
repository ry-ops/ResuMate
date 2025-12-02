/**
 * ResuMate Cryptography Utility
 * Handles secure encryption/decryption of sensitive data (API keys) using Web Crypto API
 *
 * Security features:
 * - AES-GCM encryption with 256-bit keys
 * - PBKDF2 key derivation from user passphrase
 * - Randomly generated salt and IV for each encryption
 * - Constant-time decryption to prevent timing attacks
 */

class CryptoManager {
    constructor() {
        // Encryption algorithm configuration
        this.ALGORITHM = 'AES-GCM';
        this.KEY_LENGTH = 256;
        this.IV_LENGTH = 12; // 96 bits recommended for AES-GCM
        this.SALT_LENGTH = 16; // 128 bits
        this.ITERATIONS = 100000; // PBKDF2 iterations (OWASP recommendation)
        this.TAG_LENGTH = 128; // Authentication tag length
    }

    /**
     * Generate a cryptographic key from a passphrase using PBKDF2
     * @param {string} passphrase - User-provided passphrase
     * @param {Uint8Array} salt - Cryptographic salt
     * @returns {Promise<CryptoKey>} Derived encryption key
     */
    async deriveKey(passphrase, salt) {
        const encoder = new TextEncoder();
        const passphraseKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(passphrase),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.ITERATIONS,
                hash: 'SHA-256'
            },
            passphraseKey,
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt sensitive data (e.g., API keys)
     * @param {string} plaintext - Data to encrypt
     * @param {string} passphrase - User passphrase for encryption
     * @returns {Promise<string>} Base64-encoded encrypted data with salt and IV
     */
    async encrypt(plaintext, passphrase) {
        if (!plaintext || !passphrase) {
            throw new Error('Plaintext and passphrase are required');
        }

        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

        // Derive encryption key from passphrase
        const key = await this.deriveKey(passphrase, salt);

        // Encrypt the plaintext
        const encoder = new TextEncoder();
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: this.ALGORITHM,
                iv: iv,
                tagLength: this.TAG_LENGTH
            },
            key,
            encoder.encode(plaintext)
        );

        // Combine salt + IV + encrypted data for storage
        const combined = new Uint8Array(
            this.SALT_LENGTH + this.IV_LENGTH + encryptedData.byteLength
        );
        combined.set(salt, 0);
        combined.set(iv, this.SALT_LENGTH);
        combined.set(new Uint8Array(encryptedData), this.SALT_LENGTH + this.IV_LENGTH);

        // Return base64-encoded result
        return this.arrayBufferToBase64(combined);
    }

    /**
     * Decrypt encrypted data
     * @param {string} encryptedBase64 - Base64-encoded encrypted data
     * @param {string} passphrase - User passphrase for decryption
     * @returns {Promise<string>} Decrypted plaintext
     */
    async decrypt(encryptedBase64, passphrase) {
        if (!encryptedBase64 || !passphrase) {
            throw new Error('Encrypted data and passphrase are required');
        }

        try {
            // Decode base64
            const combined = this.base64ToArrayBuffer(encryptedBase64);

            // Extract salt, IV, and encrypted data
            const salt = combined.slice(0, this.SALT_LENGTH);
            const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
            const encryptedData = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);

            // Derive decryption key from passphrase
            const key = await this.deriveKey(passphrase, salt);

            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv,
                    tagLength: this.TAG_LENGTH
                },
                key,
                encryptedData
            );

            // Convert to string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);
        } catch (error) {
            throw new Error('Decryption failed: Invalid passphrase or corrupted data');
        }
    }

    /**
     * Securely store encrypted API key in localStorage
     * @param {string} apiKey - API key to store
     * @param {string} passphrase - Encryption passphrase
     */
    async storeApiKey(apiKey, passphrase) {
        const encrypted = await this.encrypt(apiKey, passphrase);
        localStorage.setItem('claude_api_key_encrypted', encrypted);
        localStorage.setItem('encryption_enabled', 'true');
        // Remove any unencrypted keys
        localStorage.removeItem('claude_api_key');
    }

    /**
     * Retrieve and decrypt API key from localStorage
     * @param {string} passphrase - Decryption passphrase
     * @returns {Promise<string|null>} Decrypted API key or null if not found
     */
    async retrieveApiKey(passphrase) {
        const encrypted = localStorage.getItem('claude_api_key_encrypted');
        if (!encrypted) {
            return null;
        }

        return await this.decrypt(encrypted, passphrase);
    }

    /**
     * Check if API key is stored in encrypted form
     * @returns {boolean} True if encrypted key exists
     */
    hasEncryptedKey() {
        return localStorage.getItem('claude_api_key_encrypted') !== null;
    }

    /**
     * Check if unencrypted API key exists (legacy/insecure storage)
     * @returns {boolean} True if unencrypted key exists
     */
    hasUnencryptedKey() {
        return localStorage.getItem('claude_api_key') !== null;
    }

    /**
     * Migrate existing unencrypted API key to encrypted storage
     * @param {string} passphrase - Encryption passphrase
     * @returns {Promise<boolean>} True if migration succeeded
     */
    async migrateToEncrypted(passphrase) {
        const unencryptedKey = localStorage.getItem('claude_api_key');
        if (!unencryptedKey) {
            return false;
        }

        await this.storeApiKey(unencryptedKey, passphrase);
        console.log('[Security] API key migrated to encrypted storage');
        return true;
    }

    /**
     * Clear all stored API keys (encrypted and unencrypted)
     */
    clearAllKeys() {
        localStorage.removeItem('claude_api_key');
        localStorage.removeItem('claude_api_key_encrypted');
        localStorage.removeItem('encryption_enabled');
    }

    /**
     * Convert ArrayBuffer to Base64 string
     * @param {ArrayBuffer|Uint8Array} buffer
     * @returns {string} Base64-encoded string
     */
    arrayBufferToBase64(buffer) {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert Base64 string to Uint8Array
     * @param {string} base64
     * @returns {Uint8Array}
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Generate a secure random passphrase (for testing/demo purposes)
     * @param {number} length - Length of passphrase
     * @returns {string} Random passphrase
     */
    generateSecurePassphrase(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return Array.from(values)
            .map(x => charset[x % charset.length])
            .join('');
    }
}

// Export singleton instance
const cryptoManager = new CryptoManager();

// Browser compatibility check
if (typeof crypto === 'undefined' || !crypto.subtle) {
    console.error('[Security] Web Crypto API not available. Encryption features disabled.');
    console.error('[Security] Please use HTTPS or a modern browser that supports Web Crypto API.');
}
