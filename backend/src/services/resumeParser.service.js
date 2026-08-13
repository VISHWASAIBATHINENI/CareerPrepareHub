/**
 * resumeParser.service.js
 *
 * Handles PDF upload, text extraction, and structured resume parsing.
 * Uses pdf-parse for server-side PDF text extraction.
 * All resume data stays server-side — never exposed to other users.
 */

import { createRequire } from 'module';
import { ApiError } from '../middleware/error.middleware.js';
import logger from '../logger/index.js';

// pdf-parse is a CommonJS module — use createRequire to import in ESM context
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

/**
 * Extract plain text from a PDF Buffer.
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>}
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = (data.text || '').trim();
    if (!text || text.length < 50) {
      throw new ApiError(
        'The uploaded PDF appears to be empty or image-based (scanned). Please upload a text-based PDF.',
        422,
        'PDF_NO_TEXT',
      );
    }
    // Truncate to 8000 chars to fit within AI prompt budget
    return text.slice(0, 8000);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`PDF parse error: ${err.message}`);
    throw new ApiError(
      'Failed to extract text from PDF. Please ensure the file is a valid, non-encrypted PDF.',
      422,
      'PDF_PARSE_ERROR',
    );
  }
};

/**
 * Validate that multer file is a PDF within size limits.
 * @param {object} file — multer file object
 */
export const validatePDFFile = (file) => {
  if (!file) {
    throw new ApiError('Resume PDF file is required for this interview type.', 400, 'FILE_REQUIRED');
  }
  const mime = file.mimetype || '';
  const originalName = (file.originalname || '').toLowerCase();
  if (mime !== 'application/pdf' && !originalName.endsWith('.pdf')) {
    throw new ApiError(
      'Only PDF files are accepted. Please upload a .pdf file.',
      400,
      'INVALID_FILE_TYPE',
    );
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new ApiError(
      'PDF file is too large. Maximum allowed size is 5 MB.',
      400,
      'FILE_TOO_LARGE',
    );
  }
};
