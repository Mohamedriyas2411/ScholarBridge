import Alumni from '../models/Alumini.js';
import { saveFileLocally } from '../utils/fileStorage.js';
import dotenv from 'dotenv';

dotenv.config();

// Get server domain from environment variables or use default
const SERVER_DOMAIN = process.env.SERVER_DOMAIN || 'http://localhost:8080';
const DEFAULT_PROFILE_IMAGE = `${SERVER_DOMAIN}/uploads/profile-pictures/default-profile.jpg`;

export const getProfile = async (req, res) => {
  try {
    const alumniId = req.user._id; // ID from auth middleware
    
    // Find the alumni profile
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    
    // If the alumni has no profile picture, set the default one
    if (!alumni.profilePicture) {
      alumni.profilePicture = DEFAULT_PROFILE_IMAGE;
    } else if (!alumni.profilePicture.startsWith('http')) {
      // Ensure the profile picture URL is absolute
      alumni.profilePicture = `${SERVER_DOMAIN}${alumni.profilePicture}`;
    }
    
    res.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const alumniId = req.user._id;
    
    // Check if alumni exists
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    
    // Handle form data
    const updateData = { ...req.body };
    
    // Convert numeric fields
    if (updateData.batch) updateData.batch = Number(updateData.batch);
    if (updateData.experience) updateData.experience = Number(updateData.experience);
    
    // Handle profile picture upload
    if (req.files?.profilePicture) {
      try {
        console.log('Processing profile picture upload');
        const file = req.files.profilePicture[0];
        
        // Save profile picture locally
        const result = await saveFileLocally(file.buffer, {
          filename: `profile_alumni_${alumniId}`,
          fileType: 'profile',
          contentType: file.mimetype
        });
        
        updateData.profilePicture = result.secure_url;
      } catch (error) {
        console.error('Error processing profile picture:', error);
        
        // Don't fail the whole request for profile picture errors
        if (process.env.NODE_ENV === 'development') {
          console.warn('Development mode: Continuing despite profile picture error');
        } else {
          return res.status(500).json({ 
            message: 'Error uploading profile picture',
            details: error.message
          });
        }
      }
    }
    
    // Update alumni profile
    const updatedAlumni = await Alumni.findByIdAndUpdate(
      alumniId,
      updateData,
      { new: true }
    );
    
    // Format profile picture URL for response
    if (updatedAlumni.profilePicture && !updatedAlumni.profilePicture.startsWith('http')) {
      updatedAlumni.profilePicture = `${SERVER_DOMAIN}${updatedAlumni.profilePicture}`;
    }
    
    res.json(updatedAlumni);
  } catch (error) {
    console.error('Error updating alumni profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message
    });
  }
};

export const updateFilterPreferences = async (req, res) => {
  try {
    const alumniId = req.user._id;
    const { department, incomeThreshold, financialNeedMin, financialNeedMax, noPreference } = req.body;
    
    // Convert numeric values
    const filterPreferences = {
      department: department || 'all',
      incomeThreshold: incomeThreshold ? Number(incomeThreshold) : 0,
      financialNeedMin: financialNeedMin ? Number(financialNeedMin) : 0,
      financialNeedMax: financialNeedMax ? Number(financialNeedMax) : 0,
      noPreference: noPreference !== undefined ? Boolean(noPreference) : true
    };
    
    // Update alumni filter preferences
    const updatedAlumni = await Alumni.findByIdAndUpdate(
      alumniId,
      { filterPreferences },
      { new: true }
    );
    
    if (!updatedAlumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    
    res.json(updatedAlumni.filterPreferences);
  } catch (error) {
    console.error('Error updating filter preferences:', error);
    res.status(500).json({ message: 'Error updating filter preferences', error: error.message });
  }
}; 