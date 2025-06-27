import express from 'express';
import { getProfile, updateProfile, updateFilterPreferences } from '../controllers/alumniController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import { createPaymentRequest, getAlumniPaymentRequests, completePayment, getPaymentRequestDetails } from '../controllers/paymentController.js';
import PaymentRequest from '../models/PaymentRequest.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum number of files
  },
  fileFilter: function (req, file, cb) {
    // Accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile picture'));
    }
  }
}).fields([
  { name: 'profilePicture', maxCount: 1 }
]);

// Middleware to handle multer errors
const handleMulterErrors = (err, req, res, next) => {
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

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', (req, res, next) => {
  upload(req, res, function(err) {
    handleMulterErrors(err, req, res, next);
  });
}, updateProfile);

// Filter preference routes
router.post('/filter-preferences', updateFilterPreferences);

// Payment routes
router.post('/payment/request', createPaymentRequest);
router.get('/payment/alumni-requests', getAlumniPaymentRequests);
router.get('/payment/request-details/:requestId', getPaymentRequestDetails);
router.post('/payment/complete/:requestId', completePayment);

// Dashboard stats route
router.get('/dashboard-stats', async (req, res) => {
  try {
    const alumniId = req.user._id;
    
    // Get completed scholarships count
    const scholarshipsCount = await PaymentRequest.countDocuments({
      sender: alumniId,
      status: 'completed'
    });
    
    // Get pending requests count
    const pendingRequestsCount = await PaymentRequest.countDocuments({
      sender: alumniId,
      status: 'pending'
    });
    
    // Get mentored students count (students who have received at least one completed payment)
    const mentoredStudents = await PaymentRequest.distinct('recipient', {
      sender: alumniId,
      status: 'completed'
    });
    
    res.json({
      scholarships: scholarshipsCount,
      pendingRequests: pendingRequestsCount,
      mentored: mentoredStudents.length
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

export default router; 