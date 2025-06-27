import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Check if Cloudinary credentials are available and valid
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

// Check if we're in development mode or forcing mock uploads
const isDevelopment = process.env.NODE_ENV === 'development';
const forceMockUploads = process.env.FORCE_MOCK_UPLOADS === 'true';

// Set up Cloudinary configuration if credentials are valid and not forcing mock uploads
if (isCloudinaryConfigured && !forceMockUploads) {
  console.log('Cloudinary configured with valid credentials');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  if (isDevelopment || forceMockUploads) {
    console.warn(`⚠️ ${forceMockUploads ? 'FORCED MOCK MODE' : 'Development mode'}: Using mock Cloudinary service`);
  } else {
    console.error('❌ PRODUCTION WARNING: Missing or invalid Cloudinary credentials!');
    console.error('Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
  }
}

/**
 * Uploads a file buffer to Cloudinary or returns a mock URL in development mode
 * @param {Buffer} buffer - The file buffer to upload
 * @param {Object} options - Additional options for the upload
 * @returns {Promise<Object>} - The upload result with secure_url
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  // Always use mock mode if:
  // 1. We're in development mode, OR
  // 2. Cloudinary is not configured, OR
  // 3. FORCE_MOCK_UPLOADS is true
  const useDevMode = isDevelopment || !isCloudinaryConfigured || forceMockUploads;
  
  // If using mock mode, return mock URLs
  if (useDevMode) {
    console.log('⚠️ Generating mock Cloudinary URL (mock mode enabled)');
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileType = options.resource_type || 'image';
    const fileExtension = fileType === 'image' ? 'jpg' : 'pdf';
    
    // Generate a mock URL that resembles a Cloudinary URL
    return {
      secure_url: `https://mock-cloudinary.com/development/${randomId}_${timestamp}.${fileExtension}`,
      public_id: `development/${randomId}`,
      format: fileExtension,
      width: fileType === 'image' ? 800 : null,
      height: fileType === 'image' ? 600 : null,
      resource_type: fileType,
      created_at: new Date().toISOString()
    };
  }

  // If Cloudinary is configured and we're not in mock mode, use the real service
  return new Promise((resolve, reject) => {
    try {
      const uploadOptions = {
        resource_type: 'auto',
        ...options
      };
      
      // Create the upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    } catch (error) {
      console.error('Error initiating Cloudinary upload:', error);
      reject(error);
    }
  });
}; 