import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar';
import api from '../../utils/axios';
import './FillToApply.css';

const FillToApply = () => {
  const [formData, setFormData] = useState({
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
    backlogs: '0',
    tuitionFee: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    ugCgpa: '',
    bio: '',
    profilePicture: null,
    certificates: [],
    confirmDetails: false,
    financialNeed: ''
  });

  const [certificateFiles, setCertificateFiles] = useState([{ id: 1, file: null }]);
  const [nextCertId, setNextCertId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Add state for mobile sidebar
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport on component mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch existing data if available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/student/profile');
        if (response.data) {
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            ...response.data,
            dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '',
            profilePicture: null, // Reset file inputs as they can't be pre-filled
            certificates: []
          }));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'profilePicture') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCertificateChange = (id, file) => {
    setCertificateFiles(prev => 
      prev.map(cert => cert.id === id ? { ...cert, file } : cert)
    );
  };

  const addAnotherCertificate = () => {
    setCertificateFiles(prev => [...prev, { id: nextCertId, file: null }]);
    setNextCertId(prev => prev + 1);
  };

  const removeCertificate = (id) => {
    setCertificateFiles(prev => prev.filter(cert => cert.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.confirmDetails) {
      alert('Please confirm that the details are correct');
      return;
    }

    setIsLoading(true);
    const formDataToSend = new FormData();

    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key !== 'profilePicture' && key !== 'certificates') {
        // Handle boolean values correctly for FormData
        if (typeof formData[key] === 'boolean') {
          formDataToSend.append(key, formData[key] ? 'true' : 'false');
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    // Add profile picture
    if (formData.profilePicture) {
      formDataToSend.append('profilePicture', formData.profilePicture);
      console.log('Added profile picture to form data');
    }

    // Add all certificates
    let certificatesAdded = 0;
    certificateFiles.forEach(cert => {
      if (cert.file) {
        formDataToSend.append('certificates', cert.file);
        certificatesAdded++;
      }
    });
    console.log(`Added ${certificatesAdded} certificates to form data`);

    // Log FormData contents for debugging (FormData is not directly loggable)
    console.log('FormData entries:');
    for (let pair of formDataToSend.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], 'File:', pair[1].name, 'Size:', pair[1].size, 'Type:', pair[1].type);
      } else {
        console.log(pair[0], pair[1]);
      }
    }

    try {
      // Ensure the token is in localStorage before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found in localStorage');
      } else {
        console.log('Token found, proceeding with request');
      }

      // Debug timing
      console.time('api-request');
      
      // Make the request with explicit headers
      const response = await api.put('/api/student/update-profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // The Authorization header will be added by the axios interceptor
        },
      });
      
      console.timeEnd('api-request');
      console.log('Profile update successful:', response.data);
      
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Enhanced error logging
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Server response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        alert(`Error updating profile (${error.response.status}): ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        alert('Server did not respond. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        alert(`Error setting up request: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <h1>Complete Your Application 📝</h1>
        
        {success ? (
          <div className="success-message">
            <h2>Profile Updated Successfully!</h2>
            <p>Redirecting to your profile page...</p>
          </div>
        ) : (
          <div className="application-form-container">
            <div className="form-header">
              <h2>Student Scholarship Application Form</h2>
              <p>Please fill in all the required details accurately to apply for scholarships.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="application-form">
              <div className="form-section">
                <h3>📱 Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth <span className="required">*</span></label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Gender <span className="required">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>👨‍👩‍👧‍👦 Family Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Yearly Family Income <span className="required">*</span></label>
                    <input
                      type="number"
                      name="familyIncome"
                      value={formData.familyIncome}
                      onChange={handleChange}
                      placeholder="Enter yearly family income"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Father's Occupation <span className="required">*</span></label>
                    <input
                      type="text"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleChange}
                      placeholder="Enter father's occupation"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mother's Occupation <span className="required">*</span></label>
                    <input
                      type="text"
                      name="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={handleChange}
                      placeholder="Enter mother's occupation"
                      required
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isSingleParentChild"
                        checked={formData.isSingleParentChild}
                        onChange={handleChange}
                      />
                      I am a Single Parent Child
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>🎓 Academic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Current Pursuing Degree <span className="required">*</span></label>
                    <input
                      type="text"
                      name="currentDegree"
                      value={formData.currentDegree}
                      onChange={handleChange}
                      placeholder="e.g., B.Tech, M.Tech, BBA"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch <span className="required">*</span></label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science, Civil Engineering"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Current CGPA <span className="required">*</span></label>
                    <input
                      type="number"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      placeholder="Current CGPA (e.g., 8.5)"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Graduation Year <span className="required">*</span></label>
                    <input
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="Expected year of graduation"
                      min="2023"
                      max="2030"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Number of Backlogs</label>
                    <input
                      type="number"
                      name="backlogs"
                      value={formData.backlogs}
                      onChange={handleChange}
                      placeholder="Enter 0 if none"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tuition Fee Amount <span className="required">*</span></label>
                    <input
                      type="number"
                      name="tuitionFee"
                      value={formData.tuitionFee}
                      onChange={handleChange}
                      placeholder="Amount as per fee structure"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Financial Need <span className="required">*</span></label>
                    <input
                      type="number"
                      name="financialNeed"
                      value={formData.financialNeed}
                      onChange={handleChange}
                      placeholder="Enter your financial need (₹)"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>10th Percentage <span className="required">*</span></label>
                    <input
                      type="number"
                      name="tenthPercentage"
                      value={formData.tenthPercentage}
                      onChange={handleChange}
                      placeholder="e.g., 85.7"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>12th Percentage <span className="required">*</span></label>
                    <input
                      type="number"
                      name="twelfthPercentage"
                      value={formData.twelfthPercentage}
                      onChange={handleChange}
                      placeholder="e.g., 82.3"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>UG CGPA (if completed)</label>
                  <input
                    type="number"
                    name="ugCgpa"
                    value={formData.ugCgpa}
                    onChange={handleChange}
                    placeholder="Leave blank if not applicable"
                    step="0.01"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>📄 Documents</h3>
                <div className="form-group">
                  <label>Profile Picture <span className="required">*</span></label>
                  <div className="file-input">
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={(e) => handleFileChange(e)}
                      accept="image/*"
                      required={!formData.profilePicture}
                    />
                    <small>Upload a recent passport-sized photo (Max. 5MB)</small>
                  </div>
                </div>
                
                <div className="certificates-section">
                  <label>Certificates <span className="required">*</span></label>
                  <p className="certificates-info">Upload relevant certificates (academic, achievements, etc.)</p>
                  
                  {certificateFiles.map((cert, index) => (
                    <div className="certificate-item" key={cert.id}>
                      <div className="file-input">
                        <div className="certificate-header">
                          <span>Certificate {index + 1}</span>
                          {certificateFiles.length > 1 && (
                            <button 
                              type="button" 
                              className="remove-cert-btn"
                              onClick={() => removeCertificate(cert.id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleCertificateChange(cert.id, e.target.files[0])}
                          accept=".pdf,.jpg,.jpeg,.png"
                          required={index === 0}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="add-cert-btn"
                    onClick={addAnotherCertificate}
                  >
                    + Add Another Certificate
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h3>ℹ️ Additional Information</h3>
                <div className="form-group">
                  <label>Bio <span className="required">*</span></label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Briefly describe yourself, your achievements, and why you deserve this scholarship (200-500 characters)"
                    required
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-group confirmation">
                <label>
                  <input
                    type="checkbox"
                    name="confirmDetails"
                    checked={formData.confirmDetails}
                    onChange={handleChange}
                    required
                  />
                  I confirm that all the above details are correct as per my knowledge
                </label>
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillToApply;