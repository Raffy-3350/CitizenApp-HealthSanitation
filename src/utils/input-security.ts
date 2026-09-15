/**
 * Input Security Guard Utility
 * Detects & prevents SQL Injection (SQLi), Cross-Site Scripting (XSS), Ad Injection,
 * and Phishing URLs across form inputs and API payloads.
 */

// Regular expressions for detecting common SQL Injection syntax patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|DECLARE|UNION|GRANT|REVOKE)\b)/i,
  /('|\"|;)\s*(OR|AND)\s*('|\"|\d|\w)/i,
  /('|\")\s*=\s*('|\")/i,
  /--\s*$/m,
  /\/\*[\s\S]*?\*\//,
  /;\s*(DROP|DELETE|UPDATE|ALTER|TRUNCATE|INSERT)/i,
  /\bUNION\s+(ALL\s+)?SELECT\b/i,
  /\b(BENCHMARK|SLEEP|WAITFOR\s+DELAY)\b/i,
  /0x[0-9a-f]+/i,
  /'\s*OR\s*'1'='1/i,
  /"\s*OR\s*"1"="1/i,
];

// Regular expressions for detecting XSS, Script Injection, and Ad Injection
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /onfocus\s*=/gi,
  /onblur\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /<a\s+[^>]*href\s*=\s*['"]?javascript:/gi,
];

// Trusted government and municipal domain list for phishing protection
export const TRUSTED_DOMAINS = [
  'civentral.tech',
  'caloocancity.gov.ph',
  'gov.ph',
  '911.gov.ph',
  'philippines.gov.ph',
  'doh.gov.ph',
  'deped.gov.ph',
];

export interface InputSecurityResult {
  isSafe: boolean;
  threatType?: 'SQL_INJECTION' | 'XSS_INJECTION' | 'PHISHING_URL' | 'INVALID_CHARACTERS';
  errorTitle?: string;
  errorMessage?: string;
  sanitizedValue?: string;
}

/**
 * Checks a text string for SQL Injection signatures.
 */
export function detectSqlInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Checks a text string for XSS, Script, or Ad Injection code.
 */
export function detectXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Performs complete security inspection on a user-entered text input.
 */
export function validateTextInput(input: string, fieldName: string = 'Input'): InputSecurityResult {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, sanitizedValue: '' };
  }

  // 1. Check SQL Injection
  if (detectSqlInjection(input)) {
    return {
      isSafe: false,
      threatType: 'SQL_INJECTION',
      errorTitle: 'Security Risk Blocked',
      errorMessage: `The text in "${fieldName}" contains illegal SQL syntax or database query characters and was blocked for system security.`,
    };
  }

  // 2. Check XSS / Script / Ad Injection
  if (detectXSS(input)) {
    return {
      isSafe: false,
      threatType: 'XSS_INJECTION',
      errorTitle: 'Malicious Content Blocked',
      errorMessage: `The text in "${fieldName}" contains executable scripts or HTML tags that are forbidden.`,
    };
  }

  // 3. Sanitize control characters
  const sanitizedValue = sanitizeTextInput(input);

  return {
    isSafe: true,
    sanitizedValue,
  };
}

/**
 * Sanitizes input string by stripping null bytes, control characters, and leading/trailing spaces.
 */
export function sanitizeTextInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove ASCII control characters
    .trim();
}

/**
 * Validates external URLs to prevent phishing attacks, IP-based URLs, and fake domains.
 */
export function validateSafeUrl(url: string): { isSafe: boolean; errorMessage?: string } {
  if (!url || typeof url !== 'string') {
    return { isSafe: false, errorMessage: 'Invalid URL provided.' };
  }

  const cleanUrl = url.trim().toLowerCase();

  // 1. Enforce HTTPS (Block plain HTTP or dangerous pseudoprotocols)
  if (!cleanUrl.startsWith('https://')) {
    return {
      isSafe: false,
      errorMessage: 'Unencrypted (http://) links are blocked to protect against phishing. Only HTTPS links are allowed.',
    };
  }

  // 2. Reject IP address URLs (e.g. https://192.168.1.1 or https://104.28.1.1)
  const ipPattern = /^https:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipPattern.test(cleanUrl)) {
    return {
      isSafe: false,
      errorMessage: 'Direct IP address links are restricted to prevent phishing attacks.',
    };
  }

  // 3. Extract domain host
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check if domain matches trusted whitelist
    const isDomainTrusted = TRUSTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isDomainTrusted) {
      return {
        isSafe: false,
        errorMessage: `The domain "${hostname}" is not on the list of verified official government portals.`,
      };
    }

    return { isSafe: true };
  } catch {
    return {
      isSafe: false,
      errorMessage: 'The provided URL structure is invalid or malformed.',
    };
  }
}
