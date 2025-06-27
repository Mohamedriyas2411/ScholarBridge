import React, { useState, useEffect } from 'react';
import AlumniSidebar from './AlumniSidebar';
import api from '../../utils/axios';
import '../student/StudentProfile.css'; // Reuse the student profile CSS
import './AlumniProfile.css'; // Add custom overrides

const AlumniProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    aluminiId: '',
    phoneNumber: '',
    batch: '',
    company: '',
    designation: '',
    qualification: '',
    experience: '',
    skills: '',
    bio: '',
    profilePicture: '',
    upiId: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/alumni/profile');
      setProfile(response.data);
      setEditableProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data. Please try again later.');
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // If we're closing the edit mode without saving, reset to original
      setEditableProfile(profile);
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      
      // Add all profile fields to the form data
      Object.keys(editableProfile).forEach(key => {
        if (key !== 'profilePicture') {
          formData.append(key, editableProfile[key]);
        }
      });
      
      // Add profile image if one was selected
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }
      
      const response = await api.put('/api/alumni/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="dashboard-container dashboard-page">
      <AlumniSidebar />
      <div className="main-content">
        <h1>My Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-image">
              {isEditing ? (
                <div className="image-upload">
                  <img 
                    src={profileImage ? URL.createObjectURL(profileImage) : (profile.profilePicture || 'https://via.placeholder.com/150x150?text=Profile')} 
                    alt="Profile Preview" 
                  />
                  <input 
                    type="file" 
                    onChange={handleImageChange} 
                    accept="image/*"
                  />
                </div>
              ) : (
                <img 
                  src={profile.profilePicture || 'https://via.placeholder.com/150x150?text=Profile'} 
                  alt="Profile Picture" 
                />
              )}
            </div>
            <div className="profile-info">
              <h2>{profile.username}</h2>
              <p className="student-email">{profile.email}</p>
              <p className="student-id">Alumni ID: {profile.aluminiId}</p>
              <button 
                className="edit-profile-btn"
                onClick={handleEditToggle}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <div className="profile-body">
                <div className="profile-section">
                  <h3>📱 Personal Information</h3>
                  <div className="info-card">
                    <div className="info-item">
                      <label className="info-label">Phone Number:</label>
                      <input 
                        type="text" 
                        name="phoneNumber" 
                        value={editableProfile.phoneNumber || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="info-item">
                      <label className="info-label">Batch:</label>
                      <input 
                        type="text" 
                        name="batch" 
                        value={editableProfile.batch || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your graduation batch"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="profile-section">
                  <h3>💼 Professional Information</h3>
                  <div className="info-card">
                    <div className="info-item">
                      <label className="info-label">Company:</label>
                      <input 
                        type="text" 
                        name="company" 
                        value={editableProfile.company || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your current company"
                      />
                    </div>
                    <div className="info-item">
                      <label className="info-label">Designation:</label>
                      <input 
                        type="text" 
                        name="designation" 
                        value={editableProfile.designation || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your job title"
                      />
                    </div>
                    <div className="info-item">
                      <label className="info-label">Qualification:</label>
                      <input 
                        type="text" 
                        name="qualification" 
                        value={editableProfile.qualification || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your highest qualification"
                      />
                    </div>
                    <div className="info-item">
                      <label className="info-label">Experience (years):</label>
                      <input 
                        type="text" 
                        name="experience" 
                        value={editableProfile.experience || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your years of experience"
                      />
                    </div>
                    <div className="info-item">
                      <label className="info-label">Skills:</label>
                      <input 
                        type="text" 
                        name="skills" 
                        value={editableProfile.skills || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your key skills (comma separated)"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="profile-section">
                  <h3>💰 Payment Information</h3>
                  <div className="info-card">
                    <div className="info-item">
                      <label className="info-label">UPI ID:</label>
                      <input 
                        type="text" 
                        name="upiId" 
                        value={editableProfile.upiId || ''} 
                        onChange={handleInputChange}
                        placeholder="Enter your UPI ID (for payments)"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="profile-section">
                  <h3>ℹ️ Additional Information</h3>
                  <div className="info-card">
                    <div className="info-item">
                      <label className="info-label">Bio:</label>
                      <textarea 
                        name="bio" 
                        value={editableProfile.bio || ''} 
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="button-group">
                  <button type="submit" className="save-btn" disabled={isUploading}>
                    {isUploading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleEditToggle}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="profile-body">
              <div className="profile-section">
                <h3>📱 Personal Information</h3>
                <div className="info-card">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{profile.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone Number:</span>
                    <span className="info-value">{profile.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Batch:</span>
                    <span className="info-value">{profile.batch || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>💼 Professional Information</h3>
                <div className="info-card">
                  <div className="info-item">
                    <span className="info-label">Company:</span>
                    <span className="info-value">{profile.company || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Designation:</span>
                    <span className="info-value">{profile.designation || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Qualification:</span>
                    <span className="info-value">{profile.qualification || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Experience:</span>
                    <span className="info-value">{profile.experience ? `${profile.experience} years` : 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Skills:</span>
                    <span className="info-value">{profile.skills || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>💰 Payment Information</h3>
                <div className="info-card">
                  <div className="info-item">
                    <span className="info-label">UPI ID:</span>
                    <span className="info-value">{profile.upiId || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>ℹ️ Additional Information</h3>
                <div className="info-card">
                  <div className="bio-section">
                    <h4>Bio</h4>
                    <p className="bio-content">{profile.bio || 'No bio provided.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile; 