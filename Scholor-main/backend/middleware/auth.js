import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Improved authentication middleware with better error handling
export const authenticateToken = (req, res, next) => {
  // Check for authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Development mode - check environment variable
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // If we're in development mode and no token is provided, use a test user ID
  if (isDevelopment && !token) {
    console.log('⚠️ Development mode: Bypassing authentication with test user');
    // Set a test user ID for development purposes
    req.user = { _id: process.env.TEST_USER_ID || '65bd1e3c4c6f5a0f35d9c4b8' };
    return next();
  }

  // In production or if token is provided, validate it
  if (!token) {
    return res.status(401).json({ 
      message: 'Access token is required',
      details: 'Authorization header with Bearer token is missing'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        details: 'Please log in again to get a new token'
      });
    }
    
    return res.status(403).json({ 
      message: 'Invalid token',
      details: error.message
    });
  }
}; 