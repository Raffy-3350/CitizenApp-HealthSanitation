import { Alert } from 'react-native';

/**
 * Frontend File Security Utility
 * Provides client-side validation against malicious file uploads, oversized files,
 * double extensions, and path traversal sequences.
 */

export const DEFAULT_MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const DEFAULT_MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024;    // 20 MB

/**
 * Prompts explicit mobile storage access permission pop-up before opening document picker
 */
export async function requestFileAccessPermission(docName: string = 'document'): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Allow Storage Access',
      `Civentral requires permission to access your mobile file storage to select your ${docName}.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Allow & Select File',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true }
    );
  });
}

// Strictly allowed document extensions
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Strictly allowed video extensions
export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi'];

// Blacklisted dangerous executable/script extensions
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.php', '.php3', '.php4', '.php5', '.phtml', '.js', '.ts',
  '.sh', '.bat', '.cmd', '.apk', '.html', '.htm', '.dll', '.vbs',
  '.jar', '.py', '.rb', '.pl', '.asp', '.aspx', '.cgi', '.ps1', '.vbe',
  '.jse', '.ws', '.wsf', '.scr', '.cpl', '.com', '.msi', '.deb', '.rpm'
];

// Strictly allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
];

export interface FileSecurityCheckParams {
  name: string;
  size?: number;
  mimeType?: string;
  maxSizeBytes?: number;
  isVideo?: boolean;
}

export interface FileSecurityValidationResult {
  isValid: boolean;
  errorTitle?: string;
  errorMessage?: string;
  sanitizedName?: string;
}

/**
 * Sanitizes filename to prevent path traversal & control code injection
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  
  // Remove null bytes and control characters
  let clean = filename.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Remove directory traversal indicators (../ or ..\)
  clean = clean.replace(/\.\.[\/\\]/g, '');
  
  // Replace slashes and backslashes with underscores
  clean = clean.replace(/[\/\\]/g, '_');

  // Strip leading/trailing spaces and dots
  clean = clean.trim().replace(/^\.+|\.+$/g, '');

  return clean || 'unnamed_file';
}

/**
 * Performs complete client-side security validation on a picked file asset.
 */
export function validateFileSecurity(params: FileSecurityCheckParams): FileSecurityValidationResult {
  const { name, size, mimeType, maxSizeBytes, isVideo } = params;
  const sanitizedName = sanitizeFilename(name);

  // 1. Double Extension Detection (e.g. "document.pdf.exe" or "photo.png.php")
  const nameParts = sanitizedName.toLowerCase().split('.');
  if (nameParts.length > 2) {
    // Check if any intermediate or final extension is in the dangerous list
    for (let i = 1; i < nameParts.length; i++) {
      const ext = `.${nameParts[i]}`;
      if (DANGEROUS_EXTENSIONS.includes(ext)) {
        return {
          isValid: false,
          errorTitle: 'Security Risk Blocked',
          errorMessage: `The file "${name}" has a suspicious double extension (${ext}) and was blocked for your safety.`,
        };
      }
    }
  }

  // Extract final extension
  const finalExt = sanitizedName.includes('.')
    ? `.${sanitizedName.split('.').pop()?.toLowerCase()}`
    : '';

  // 2. Explicit Dangerous Extension Check
  if (DANGEROUS_EXTENSIONS.includes(finalExt)) {
    return {
      isValid: false,
      errorTitle: 'File Type Restricted',
      errorMessage: `Executable or script files (${finalExt}) are not allowed for security reasons.`,
    };
  }

  // 3. Extension Whitelist Check
  const allowedExts = isVideo ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_DOCUMENT_EXTENSIONS;
  if (!allowedExts.includes(finalExt)) {
    const allowedListStr = allowedExts.join(', ');
    return {
      isValid: false,
      errorTitle: 'Invalid File Extension',
      errorMessage: `The extension "${finalExt}" is not supported. Allowed formats: ${allowedListStr}.`,
    };
  }

  // 4. File Size Check
  const effectiveLimitBytes = maxSizeBytes || (isVideo ? DEFAULT_MAX_VIDEO_SIZE_BYTES : DEFAULT_MAX_DOCUMENT_SIZE_BYTES);
  if (size && size > effectiveLimitBytes) {
    const limitMb = Math.round(effectiveLimitBytes / (1024 * 1024));
    return {
      isValid: false,
      errorTitle: 'File Too Large',
      errorMessage: `The selected file (${(size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${limitMb} MB.`,
    };
  }

  // 5. MIME Type Whitelist Check (if mimeType is provided by native picker)
  if (mimeType && mimeType.trim() !== '' && mimeType !== 'application/octet-stream') {
    const normalizedMime = mimeType.toLowerCase();
    const isMimeAllowed = ALLOWED_MIME_TYPES.some((type) => normalizedMime.startsWith(type.replace('/*', '')));
    if (!isMimeAllowed) {
      return {
        isValid: false,
        errorTitle: 'Invalid File Type',
        errorMessage: `The file format (${mimeType}) does not match allowed security policies.`,
      };
    }
  }

  return {
    isValid: true,
    sanitizedName,
  };
}
