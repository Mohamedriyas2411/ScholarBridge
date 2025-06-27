import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the upload directory - default to a local 'uploads' directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

// Create the upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory: ${UPLOAD_DIR}`);
}

// Create subdirectories for different file types
const PROFILE_PICS_DIR = path.join(UPLOAD_DIR, 'profile-pictures');
const CERTIFICATES_DIR = path.join(UPLOAD_DIR, 'certificates');
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'documents');

// Create subdirectories if they don't exist
[PROFILE_PICS_DIR, CERTIFICATES_DIR, DOCUMENTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Get server domain from environment variables or use default
const SERVER_DOMAIN = process.env.SERVER_DOMAIN || 'http://localhost:8080';

/**
 * Saves a file buffer to the local file system
 * @param {Buffer} buffer - The file buffer to save
 * @param {Object} options - Additional options for the upload
 * @returns {Promise<Object>} - The upload result with path and URL
 */
export const saveFileLocally = async (buffer, options = {}) => {
  try {
    const { 
      filename = `file_${Date.now()}`,
      fileType = 'image',
      contentType = 'image/jpeg',
      fileExtension = getExtensionFromMimeType(contentType)
    } = options;
    
    // Generate a unique filename
    const uniqueId = uuidv4();
    const safeFilename = sanitizeFilename(`${filename}_${uniqueId}`);
    const finalFilename = `${safeFilename}.${fileExtension}`;
    
    // Determine which directory to use based on file type
    let uploadDir;
    if (fileType === 'profile') {
      uploadDir = PROFILE_PICS_DIR;
    } else if (fileType === 'certificate') {
      uploadDir = CERTIFICATES_DIR;
    } else {
      uploadDir = DOCUMENTS_DIR;
    }
    
    // Create the full file path
    const filePath = path.join(uploadDir, finalFilename);
    
    // Write the file
    await fs.promises.writeFile(filePath, buffer);
    
    // Determine the URL path (relative to the server root)
    const relativeDir = path.relative(path.join(__dirname, '..'), uploadDir).replace(/\\/g, '/');
    const urlPath = `/${relativeDir}/${finalFilename}`;
    
    // Create a fully qualified URL with the server domain
    const fullUrl = `${SERVER_DOMAIN}${urlPath}`;
    
    console.log(`File saved successfully: ${filePath}`);
    console.log(`File URL: ${fullUrl}`);
    
    // Return an object similar to Cloudinary's response
    return {
      secure_url: fullUrl,
      public_id: safeFilename,
      format: fileExtension,
      width: fileType === 'image' ? 800 : null,
      height: fileType === 'image' ? 600 : null,
      resource_type: fileType,
      created_at: new Date().toISOString(),
      originalPath: filePath
    };
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw error;
  }
};

/**
 * Sanitizes a filename to make it safe for file systems
 * @param {string} filename - The original filename
 * @returns {string} - A sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100); // Limit filename length
}

/**
 * Gets a file extension from a MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - The file extension
 */
function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };
  
  return mimeToExt[mimeType] || 'bin';
}

/**
 * Deletes a file from the local file system
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteFileLocally = async (filePath) => {
  try {
    // If the path is a URL path, convert it to a full file path
    if (filePath.startsWith('http')) {
      // Extract the path from the URL
      const url = new URL(filePath);
      filePath = url.pathname;
    }
    
    if (filePath.startsWith('/')) {
      // Remove the leading slash and combine with the base path
      const relativePath = filePath.substring(1);
      filePath = path.join(__dirname, '..', relativePath);
    }
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
      return true;
    }
    
    console.warn(`File not found for deletion: ${filePath}`);
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}; 