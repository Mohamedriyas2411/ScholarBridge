import express from 'express';
import { updateProfile, getProfile, addCertificate } from '../controllers/studentController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import Student from '../models/Student.js';
import { getStudentPaymentRequests, approvePaymentRequest, rejectPaymentRequest } from '../controllers/paymentController.js';

const router = express.Router();

// Configure multer for file uploads with improved error handling
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum number of files
  },
  fileFilter: function (req, file, cb) {
    // Log file info for debugging
    console.log('Received file:', file.originalname, file.mimetype, file.size);
    
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'certificates', maxCount: 5 }
]);

// Middleware to handle multer errors
const handleMulterErrors = (req, res, next) => {
  return function(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File too large',
          details: 'Maximum file size is 5MB'
        });
      }
      return res.status(400).json({
        message: 'File upload error',
        details: err.message
      });
    } else if (err) {
      // A different error occurred
      console.error('Non-multer error:', err);
      return res.status(500).json({
        message: 'Error processing upload',
        details: err.message
      });
    }
    // No error occurred, continue
    next();
  };
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Debug middleware
router.use((req, res, next) => {
  console.log('Request to student routes:', req.method, req.path);
  console.log('User ID:', req.user?._id);
  next();
});

// Profile routes
router.get('/profile', getProfile);

// Update profile route with error handling
router.put('/update-profile', (req, res, next) => {
  console.log('Processing update-profile request');
  upload(req, res, function(err) {
    if (err) {
      console.error('Multer error in update-profile:', err);
      return res.status(400).json({
        message: 'File upload error',
        details: err.message
      });
    }
    console.log('Multer processed files successfully');
    next();
  });
}, updateProfile);

// Certificate routes
router.post('/add-certificate', (req, res, next) => {
  console.log('Processing add-certificate request');
  multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
  }).fields([
    { name: 'certificates', maxCount: 1 }
  ])(req, res, function(err) {
    if (err) {
      console.error('Multer error in add-certificate:', err);
      return res.status(400).json({
        message: 'File upload error',
        details: err.message
      });
    }
    console.log('Multer processed certificate file successfully');
    next();
  });
}, addCertificate);

// Payment routes
router.get('/payment/student-requests', getStudentPaymentRequests);
router.post('/payment/approve/:requestId', approvePaymentRequest);
router.post('/payment/reject/:requestId', rejectPaymentRequest);

// List all students (for alumni dashboard)
router.get('/list', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

export default router; 