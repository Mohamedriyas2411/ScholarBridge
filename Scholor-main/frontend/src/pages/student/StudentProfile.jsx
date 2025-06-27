import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar';
import api from '../../utils/axios';
import './StudentProfile.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    familyIncome: '',
    fatherOccupation: '',
    motherOccupation: '',
    isSingleParentChild: false,
    currentDegree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
    backlogs: '',
    tuitionFee: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    ugCgpa: '',
    bio: '',
    profilePicture: '',
    certificates: [],
    upiId: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [newCertificate, setNewCertificate] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/student/profile');
      setProfile(response.data);
      setEditableProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      
      // Append all profile fields
      Object.keys(editableProfile).forEach(key => {
        if (key !== 'profilePicture' && key !== 'certificates') {
          formData.append(key, editableProfile[key]);
        }
      });
      
      await api.put('/api/student/profile', formData);
      await fetchProfile();
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAddCertificate = async () => {
    if (!newCertificate) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('certificates', newCertificate);
    
    try {
      await api.post('/api/student/add-certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewCertificate(null);
      fetchProfile(); // Refresh profile data
      alert('Certificate added successfully!');
    } catch (error) {
      console.error('Error adding certificate:', error);
      alert('Error adding certificate. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-contents">
        <h1>My Profile</h1>
        
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-image">
              <img 
                src={profile.profilePicture || 'https://via.placeholder.com/150x150?text=Profile'} 
                alt="Profile Picture" 
              />
            </div>
            <div className="profile-info">
              <h2>{profile.username}</h2>
              <p className="student-email">{profile.email}</p>
              <p className="student-id">Phone: {profile.phoneNumber || 'Not provided'}</p>
              <button 
                className="edit-profile-btn"
                onClick={() => window.location.href = '/fill-to-apply'}
              >
                Update Profile
              </button>
            </div>
          </div>
          
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
                  <span className="info-label">Date of Birth:</span>
                  <span className="info-value">{formatDate(profile.dateOfBirth)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender:</span>
                  <span className="info-value">{profile.gender || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>👨‍👩‍👧‍👦 Family Information</h3>
              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">Family Income:</span>
                  <span className="info-value">₹{profile.familyIncome || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Father's Occupation:</span>
                  <span className="info-value">{profile.fatherOccupation || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mother's Occupation:</span>
                  <span className="info-value">{profile.motherOccupation || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Single Parent Child:</span>
                  <span className="info-value">{profile.isSingleParentChild ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>🎓 Academic Information</h3>
              <div className="info-card">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Current Degree:</span>
                    <span className="info-value">{profile.currentDegree || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Branch:</span>
                    <span className="info-value">{profile.branch || 'Not provided'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Current CGPA:</span>
                    <span className="info-value">{profile.cgpa || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Graduation Year:</span>
                    <span className="info-value">{profile.graduationYear || 'Not provided'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Backlogs:</span>
                    <span className="info-value">{profile.backlogs || '0'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tuition Fee:</span>
                    <span className="info-value">₹{profile.tuitionFee || 'Not provided'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">10th Percentage:</span>
                    <span className="info-value">{profile.tenthPercentage || 'Not provided'}%</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">12th Percentage:</span>
                    <span className="info-value">{profile.twelfthPercentage || 'Not provided'}%</span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">UG CGPA (if completed):</span>
                  <span className="info-value">{profile.ugCgpa || 'Not applicable'}</span>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>📄 Documents</h3>
              <div className="info-card">
                <div className="certificates-section">
                  <div className="certificates-header">
                    <h4>Certificates</h4>
                    <button 
                      className="toggle-btn"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Done' : 'Add Certificate'}
                    </button>
                  </div>
                  
                  {isEditing && (
                    <div className="add-certificate">
                      <input 
                        type="file" 
                        onChange={(e) => setNewCertificate(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <button 
                        className="upload-btn"
                        onClick={handleAddCertificate}
                        disabled={!newCertificate || isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload Certificate'}
                      </button>
                    </div>
                  )}
                  
                  <div className="certificates-list">
                    {profile.certificates?.length > 0 ? (
                      <ul>
                        {profile.certificates.map((cert, index) => (
                          <li key={index} className="certificate-item">
                            <a href={cert} target="_blank" rel="noopener noreferrer">
                              <span className="certificate-icon">📜</span>
                              Certificate {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No certificates uploaded yet.</p>
                    )}
                  </div>
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

            <div className="profile-section">
              <h3>💰 Payment Information</h3>
              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">UPI ID:</span>
                  <span className="info-value">{profile.upiId || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
