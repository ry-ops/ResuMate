# ATSFlow Security Documentation

## Overview

This document outlines the security measures implemented in ATSFlow to protect user data and prevent common web application vulnerabilities.

**Last Updated:** 2025-12-01
**Security Contact:** security@resumate.app
**Version:** 1.0.0

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Implemented Security Measures](#implemented-security-measures)
3. [API Key Security](#api-key-security)
4. [XSS Prevention](#xss-prevention)
5. [File Upload Security](#file-upload-security)
6. [Content Security Policy](#content-security-policy)
7. [Rate Limiting](#rate-limiting)
8. [Dependency Security](#dependency-security)
9. [Security Best Practices](#security-best-practices)
10. [Vulnerability Reporting](#vulnerability-reporting)
11. [Incident Response](#incident-response)

---

## Security Architecture

ATSFlow implements a defense-in-depth security strategy with multiple layers:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Client-Side Security                              │
│ - Input sanitization (sanitizer.js)                        │
│ - API key encryption (crypto.js)                           │
│ - File upload validation                                   │
│ - XSS prevention                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Transport Security                                │
│ - HTTPS enforcement (production)                           │
│ - CSP headers                                              │
│ - Security headers (X-Frame-Options, etc.)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Server-Side Security                              │
│ - Rate limiting                                            │
│ - Input validation                                         │
│ - API key format validation                                │
│ - Request size limits                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: External API Security                             │
│ - Secure API key transmission                              │
│ - API error handling                                       │
│ - No API key logging                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implemented Security Measures

### 1. API Key Encryption (`js/utils/crypto.js`)

**Technology:** Web Crypto API with AES-GCM encryption

**Features:**
- **Algorithm:** AES-GCM with 256-bit keys
- **Key Derivation:** PBKDF2 with 100,000 iterations (OWASP recommendation)
- **Encryption:** Unique salt and IV for each encryption operation
- **Authentication:** Built-in authentication tag (128-bit) for integrity verification

**Implementation:**
```javascript
// Encrypt API key before storing
await cryptoManager.storeApiKey(apiKey, userPassphrase);

// Retrieve encrypted API key
const decryptedKey = await cryptoManager.retrieveApiKey(userPassphrase);
```

**Security Guarantees:**
- API keys are never stored in plain text in localStorage
- Passphrase never leaves the client
- Forward secrecy through random salts
- Constant-time decryption to prevent timing attacks

### 2. Input Sanitization (`js/utils/sanitizer.js`)

**Purpose:** Prevent XSS (Cross-Site Scripting) attacks

**Features:**
- HTML entity escaping
- Dangerous pattern removal (javascript:, data:, etc.)
- File upload validation
- Rate limiting
- JSON injection prevention

**Protected Inputs:**
- Resume text
- Job description text
- API keys
- File uploads
- All user-generated content

**Example Usage:**
```javascript
// Sanitize user input before display
const safe = inputSanitizer.sanitizeUserInput(userInput);

// Validate file upload
const validation = inputSanitizer.validateFileUpload(file);
if (!validation.valid) {
    alert(validation.error);
    return;
}
```

### 3. Content Security Policy (`security/csp-config.json`)

**Implemented Directives:**

```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
connect-src 'self' https://api.anthropic.com
frame-src 'none'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
```

**Protection Against:**
- Code injection attacks
- Data exfiltration
- Clickjacking
- Mixed content vulnerabilities

**Future Improvements:**
- Replace `unsafe-inline` with nonce-based CSP
- Implement CSP violation reporting endpoint
- Stricter policy for production environment

### 4. Additional Security Headers

Implemented in `server.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disables unnecessary browser APIs |

---

## API Key Security

### Storage

**Current Implementation:**
- API keys stored in localStorage (with encryption available)
- Encryption using Web Crypto API (AES-GCM)
- Never transmitted to our servers
- Only sent directly to Anthropic API

**Migration Path:**
```javascript
// Check for unencrypted keys
if (cryptoManager.hasUnencryptedKey()) {
    // Prompt user for passphrase
    const passphrase = prompt('Set encryption passphrase:');
    await cryptoManager.migrateToEncrypted(passphrase);
}
```

### Validation

API keys are validated at multiple levels:

1. **Client-side:**
   - Format validation (must start with `sk-ant-`)
   - Length validation (max 200 characters)
   - Pattern matching for valid characters

2. **Server-side:**
   - Same validations as client
   - Additional sanitization
   - Rate limiting per API key

### Best Practices

**DO:**
- ✅ Use encryption when storing API keys
- ✅ Set a strong passphrase for encryption
- ✅ Clear API keys when done
- ✅ Use environment-specific keys

**DON'T:**
- ❌ Share API keys publicly
- ❌ Commit API keys to version control
- ❌ Use production keys for testing
- ❌ Store API keys in plain text

---

## XSS Prevention

### Identified Vulnerabilities (Fixed)

**Location:** `app.js` - Result display functions

**Issue:** Direct innerHTML assignment with unsanitized API responses

**Before:**
```javascript
resultsContent.innerHTML = html; // UNSAFE
```

**After:**
```javascript
// Sanitize before display
const sanitizedHtml = inputSanitizer.sanitizeHtml(html);
resultsContent.innerHTML = sanitizedHtml;
```

### Input Sanitization Points

1. **Resume Text Input**
   - Escape HTML entities
   - Remove script tags
   - Validate length

2. **Job Description Input**
   - Same as resume text
   - Additional formatting preservation

3. **API Response Display**
   - Sanitize before rendering
   - Escape user-controlled data
   - Use textContent where possible

4. **Error Messages**
   - Never include raw user input
   - Use parameterized error templates

### XSS Testing Checklist

- [ ] Test with `<script>alert('XSS')</script>` in all inputs
- [ ] Test with `javascript:` URLs
- [ ] Test with `data:text/html` URLs
- [ ] Test with HTML event handlers (`onclick`, etc.)
- [ ] Test with SVG-based XSS
- [ ] Test with CSS injection

---

## File Upload Security

### Validation

**File Type Restrictions:**
- Allowed extensions: `.txt`, `.pdf`, `.doc`, `.docx`
- MIME type validation
- Maximum file size: 10MB

**Implementation:**
```javascript
const validation = inputSanitizer.validateFileUpload(file);
if (!validation.valid) {
    throw new Error(validation.error);
}
```

### Security Checks

1. **Extension Validation**
   - Whitelist approach (only specific extensions allowed)
   - Case-insensitive matching

2. **MIME Type Validation**
   - Cross-reference with file extension
   - Prevent MIME type spoofing

3. **Size Validation**
   - Maximum 10MB to prevent DoS
   - Client and server-side enforcement

4. **Filename Sanitization**
   - Prevent directory traversal (`../`, `..\\`)
   - Maximum filename length (255 characters)

5. **Content Validation** (Future Enhancement)
   - Magic byte validation
   - Malware scanning integration
   - Content type verification

### File Processing

**Security Measures:**
- Files processed client-side only (never uploaded to server)
- Content read as text (no execution)
- Sandboxed file reading using FileReader API
- No direct file system access

---

## Content Security Policy

### Current Policy

See `security/csp-config.json` for full configuration.

**Key Restrictions:**
- No inline scripts (except during development)
- No third-party scripts
- Limited image sources
- No frames/iframes
- No plugins/objects

### CSP Violations

**Monitoring:**
CSP violations should be reported and reviewed regularly.

**Common Violations:**
1. Inline scripts/styles (development only)
2. External CDN resources
3. Data URLs in unexpected contexts

**Production Recommendations:**
1. Remove all `unsafe-inline` directives
2. Implement nonce-based CSP
3. Add violation reporting endpoint
4. Monitor CSP reports in production

---

## Rate Limiting

### API Endpoints

**Configuration:**
- Window: 60 seconds
- Max Requests: 10 per window
- Response: HTTP 429 (Too Many Requests)

**Implementation:**
```javascript
// server.js
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
```

**Per-Client Tracking:**
- Based on IP address
- In-memory storage (development)
- Redis recommended for production

### Client-Side Rate Limiting

**Features:**
- localStorage-based tracking
- Configurable limits per operation
- User feedback on limit reached

**Example:**
```javascript
const rateLimit = inputSanitizer.checkRateLimit('api_call', 10, 60000);
if (!rateLimit.allowed) {
    alert(`Rate limit exceeded. Try again at ${rateLimit.resetAt}`);
}
```

---

## Dependency Security

### Audit Process

**Regular Audits:**
```bash
npm audit
```

**Current Status:** ✅ No vulnerabilities

**Dependencies:**
- `express`: ^4.18.2 (Web framework)
- `cors`: ^2.8.5 (CORS middleware)

**Update Policy:**
- Review security advisories weekly
- Update dependencies monthly
- Test updates in development before production
- Document breaking changes

### Vulnerability Response SLA

| Severity | Response Time | Fix Time |
|----------|--------------|----------|
| Critical (CVSS ≥ 9.0) | < 4 hours | < 24 hours |
| High (CVSS 7.0-8.9) | < 24 hours | < 7 days |
| Medium (CVSS 4.0-6.9) | < 7 days | < 30 days |
| Low (CVSS < 4.0) | < 30 days | Next release |

---

## Security Best Practices

### For Developers

1. **Never Trust User Input**
   - Validate all inputs
   - Sanitize before display
   - Use parameterized queries (when applicable)

2. **Principle of Least Privilege**
   - Minimize localStorage data
   - Request only necessary permissions
   - Limit API access scope

3. **Defense in Depth**
   - Multiple validation layers
   - Client and server-side checks
   - Fail securely

4. **Secure Defaults**
   - Encryption enabled by default
   - Strictest CSP in production
   - HTTPS only in production

### For Users

1. **API Key Security**
   - Use unique API keys per application
   - Enable encryption with strong passphrase
   - Clear browser data when done
   - Don't share API keys

2. **Browser Security**
   - Use modern, updated browser
   - Enable security features
   - Clear cache/cookies regularly
   - Be cautious of browser extensions

3. **File Uploads**
   - Only upload trusted files
   - Verify file contents before upload
   - Don't upload sensitive PII unnecessarily

---

## Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability, please follow responsible disclosure:

1. **DO NOT** publicly disclose the vulnerability
2. Email details to: **security@resumate.app**
3. Include:
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 24 hours
- **Initial Assessment:** Within 72 hours
- **Fix Timeline:** Based on severity (see SLA above)
- **Disclosure:** Coordinated with reporter

### Security Rewards

We appreciate security researchers:
- Public acknowledgment (with permission)
- Listing in Hall of Fame
- Potential bug bounty (if program active)

---

## Incident Response

### Detection

**Monitoring:**
- Server logs (errors, rate limits)
- CSP violation reports
- Dependency audit alerts
- User reports

### Response Steps

1. **Identify & Contain**
   - Assess impact
   - Isolate affected systems
   - Prevent further damage

2. **Analyze**
   - Determine root cause
   - Identify compromised data
   - Document timeline

3. **Remediate**
   - Apply security patches
   - Update configurations
   - Test fixes thoroughly

4. **Communicate**
   - Notify affected users
   - Document incident
   - Update security measures

5. **Post-Incident**
   - Conduct retrospective
   - Update security policies
   - Improve detection capabilities

### Emergency Contacts

- **Security Lead:** security@resumate.app
- **Development Team:** dev@resumate.app
- **CERT:** https://www.us-cert.gov/report

---

## Compliance

### Standards Alignment

- ✅ OWASP Top 10 2021
- ✅ CWE Top 25 Most Dangerous Software Weaknesses
- ✅ NIST Cybersecurity Framework
- ⏳ SOC 2 Type II (planned)
- ⏳ GDPR Compliance (planned)

### Security Controls

| Control | Status | Implementation |
|---------|--------|----------------|
| Authentication | ⏳ Planned | User accounts with MFA |
| Authorization | ⏳ Planned | Role-based access control |
| Encryption at Rest | ✅ Implemented | Web Crypto API (AES-GCM) |
| Encryption in Transit | ✅ Required | HTTPS in production |
| Input Validation | ✅ Implemented | sanitizer.js |
| Output Encoding | ✅ Implemented | HTML escaping |
| Rate Limiting | ✅ Implemented | Server-side middleware |
| Security Headers | ✅ Implemented | CSP, X-Frame-Options, etc. |
| Dependency Scanning | ✅ Implemented | npm audit |
| Logging & Monitoring | ⏳ Planned | Centralized logging |

---

## Security Roadmap

### Short-term (Next Release)

- [ ] Implement nonce-based CSP
- [ ] Add CSP violation reporting endpoint
- [ ] Integrate malware scanning for file uploads
- [ ] Add security logging and monitoring
- [ ] Implement automated security testing

### Medium-term (3-6 months)

- [ ] User authentication system
- [ ] Multi-factor authentication (MFA)
- [ ] Session management
- [ ] Audit logging
- [ ] Penetration testing

### Long-term (6-12 months)

- [ ] SOC 2 Type II certification
- [ ] Bug bounty program
- [ ] Advanced threat detection
- [ ] SIEM integration
- [ ] Security awareness training

---

## Changelog

### Version 1.0.0 (2025-12-01)

**Initial security implementation:**
- ✅ API key encryption (Web Crypto API)
- ✅ Input sanitization (sanitizer.js)
- ✅ XSS prevention
- ✅ Content Security Policy
- ✅ Rate limiting
- ✅ File upload validation
- ✅ Security headers
- ✅ Dependency audit (0 vulnerabilities)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Document Version:** 1.0.0
**Last Review:** 2025-12-01
**Next Review:** 2025-03-01
