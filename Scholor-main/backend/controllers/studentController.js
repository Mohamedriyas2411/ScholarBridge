import Student from '../models/Student.js';
import { saveFileLocally } from '../utils/fileStorage.js';
import dotenv from 'dotenv';

dotenv.config();

// Get server domain from environment variables or use default
const SERVER_DOMAIN = process.env.SERVER_DOMAIN || 'http://localhost:8080';
const DEFAULT_PROFILE_IMAGE = `${SERVER_DOMAIN}/uploads/profile-pictures/default-profile.jpg`;

export const updateProfile = async (req, res) => {
  try {
    console.log('Update Profile API called');
    console.log('User ID from auth middleware:', req.user?._id);
    console.log('Headers:', req.headers);
    
    // Check if we have a user from the auth middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: 'Authentication required',
        details: 'No user found in request. Please ensure you are logged in.'
      });
    }
    
    const studentId = req.user._id;
    
    // Log request body and files for debugging
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files present:', req.files ? Object.keys(req.files) : 'No files');
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      console.log(`Student with ID ${studentId} not found in database`);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log(`Found student: ${student.username} (${student.email})`);
    
    const formData = req.body;

    // Handle boolean conversions from strings to booleans
    if (formData.isSingleParentChild === 'true') {
      formData.isSingleParentChild = true;
    } else if (formData.isSingleParentChild === 'false') {
      formData.isSingleParentChild = false;
    }

    // Handle confirmDetails field (ignore for DB update)
    if (formData.confirmDetails) {
      delete formData.confirmDetails;
    }

    // Convert date string to Date object if provided
    if (formData.dateOfBirth) {
      formData.dateOfBirth = new Date(formData.dateOfBirth);
    }

    // Convert numeric strings to numbers
    if (formData.familyIncome) formData.familyIncome = Number(formData.familyIncome);
    if (formData.graduationYear) formData.graduationYear = Number(formData.graduationYear);
    if (formData.cgpa) formData.cgpa = Number(formData.cgpa);
    if (formData.backlogs) formData.backlogs = Number(formData.backlogs);
    if (formData.tuitionFee) formData.tuitionFee = Number(formData.tuitionFee);
    if (formData.tenthPercentage) formData.tenthPercentage = Number(formData.tenthPercentage);
    if (formData.twelfthPercentage) formData.twelfthPercentage = Number(formData.twelfthPercentage);
    if (formData.ugCgpa) formData.ugCgpa = Number(formData.ugCgpa);

    // Handle file uploads
    let profilePictureUrl = '';
    if (req.files?.profilePicture) {
      try {
        console.log('Processing profile picture upload');
        const file = req.files.profilePicture[0];
        console.log(`Profile picture details: ${file.originalname}, ${file.mimetype}, ${file.size} bytes`);
        
        // Save profile picture to local storage
        const result = await saveFileLocally(file.buffer, {
          filename: `profile_${studentId}`,
          fileType: 'profile',
          contentType: file.mimetype
        });
        
        profilePictureUrl = result.secure_url;
        console.log('Profile picture saved successfully:', profilePictureUrl);
      } catch (error) {
        console.error('Error processing profile picture:', error);
        
        // Don't fail the whole request for profile picture errors in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Development mode: Continuing despite profile picture error');
          // Provide a fallback URL
          profilePictureUrl = DEFAULT_PROFILE_IMAGE;
        } else {
          return res.status(500).json({ 
            message: 'Error uploading profile picture',
            details: error.message
          });
        }
      }
    }

    const certificateUrls = [];
    if (req.files?.certificates) {
      try {
        console.log(`Processing ${req.files.certificates.length} certificate uploads`);
        
        // Save certificates to local storage
        for (const cert of req.files.certificates) {
          console.log('Uploading certificate:', cert.originalname);
          const result = await saveFileLocally(cert.buffer, {
            filename: `cert_${studentId}_${cert.originalname}`,
            fileType: 'certificate',
            contentType: cert.mimetype
          });
          certificateUrls.push(result.secure_url);
        }
        
        console.log('All certificates processed successfully');
      } catch (error) {
        console.error('Error uploading certificates:', error);
        
        // Don't fail the whole request for certificate errors in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Development mode: Continuing despite certificate upload error');
        } else {
          return res.status(500).json({ 
            message: 'Error uploading certificates',
            details: error.message
          });
        }
      }
    }

    // Prepare update data
    const updateData = { ...formData };
    
    // Only update profilePicture if a new one was uploaded
    if (profilePictureUrl) {
      updateData.profilePicture = profilePictureUrl;
    }
    
    // Only update certificates if new ones were uploaded
    if (certificateUrls.length > 0) {
      // If student already has certificates, append the new ones
      if (student.certificates && student.certificates.length > 0) {
        updateData.certificates = [...student.certificates, ...certificateUrls];
      } else {
        updateData.certificates = certificateUrls;
      }
    }

    console.log('Final update data keys:', Object.keys(updateData));
    
    // Update student profile
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    );

    console.log('Student profile updated successfully');
    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const studentId = req.user._id; // Assuming user ID is available from auth middleware
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // If the student has no profile picture, set the default one
    if (!student.profilePicture) {
      student.profilePicture = DEFAULT_PROFILE_IMAGE;
    } else if (!student.profilePicture.startsWith('http')) {
      // Ensure the profile picture URL is absolute
      student.profilePicture = `${SERVER_DOMAIN}${student.profilePicture}`;
    }
    
    // Make sure certificate URLs are absolute
    if (student.certificates && student.certificates.length > 0) {
      student.certificates = student.certificates.map(cert => {
        if (!cert.startsWith('http')) {
          return `${SERVER_DOMAIN}${cert}`;
        }
        return cert;
      });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const addCertificate = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    if (!req.files || !req.files.certificates) {
      return res.status(400).json({ message: 'No certificate file uploaded' });
    }
    
    // Get the current student to access existing certificates
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Upload new certificate to local storage
    try {
      const certificateFile = req.files.certificates[0];
      const result = await saveFileLocally(certificateFile.buffer, {
        filename: `cert_${studentId}_${certificateFile.originalname}`,
        fileType: 'certificate',
        contentType: certificateFile.mimetype
      });
      
      // Add the new certificate URL to the existing certificates array
      const currentCertificates = student.certificates || [];
      const updatedCertificates = [...currentCertificates, result.secure_url];
      
      // Update student with the new certificates array
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { certificates: updatedCertificates },
        { new: true }
      );
      
      // Make sure URLs are absolute for the response
      if (updatedStudent.certificates) {
        updatedStudent.certificates = updatedStudent.certificates.map(cert => {
          if (!cert.startsWith('http')) {
            return `${SERVER_DOMAIN}${cert}`;
          }
          return cert;
        });
      }
      
      if (updatedStudent.profilePicture && !updatedStudent.profilePicture.startsWith('http')) {
        updatedStudent.profilePicture = `${SERVER_DOMAIN}${updatedStudent.profilePicture}`;
      }
      
      res.json(updatedStudent);
    } catch (error) {
      console.error('Error uploading certificate:', error);
      return res.status(500).json({ message: 'Error uploading certificate' });
    }
  } catch (error) {
    console.error('Error adding certificate:', error);
    res.status(500).json({ message: 'Error adding certificate', error: error.message });
  }
}; 