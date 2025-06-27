import React, { useState, useEffect } from 'react';
import AlumniSidebar from './AlumniSidebar';
import api from '../../utils/axios';
import './AlumniDashboard.css'; // Import the CSS file

const AlumniDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Students Mentored', value: 0 },
    { label: 'Scholarships Provided', value: 0 },
    { label: 'Pending Requests', value: 0 },
  ]);

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Filter states
  const [filterPreferences, setFilterPreferences] = useState({
    department: 'all',
    incomeThreshold: '',
    financialNeedMin: '',
    financialNeedMax: '',
    noPreference: true
  });

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, filterPreferences]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/alumni/dashboard-stats');
      if (response.data) {
        setStats([  
          { label: 'Scholarships Provided', value: response.data.scholarships || 0 },
          { label: 'Pending Requests', value: response.data.pendingRequests || 0 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again later.');
      // Set default values in case of error
      setStats([
        { label: 'Scholarships Provided', value: 0 },
        { label: 'Pending Requests', value: 0 },
      ]);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/student/list');
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load student data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'noPreference') {
      setFilterPreferences(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFilterPreferences(prev => ({
        ...prev,
        [name]: value,
        noPreference: false
      }));
    }
  };

  const saveFilterPreferences = async () => {
    try {
      await api.post('/api/alumni/filter-preferences', filterPreferences);
    } catch (error) {
      console.error('Error saving filter preferences:', error);
    }
  };

  const applyFilters = () => {
    if (filterPreferences.noPreference || !students.length) {
      setFilteredStudents(students);
      return;
    }

    let filtered = [...students];

    // Filter by department
    if (filterPreferences.department !== 'all') {
      filtered = filtered.filter(student => 
        student.branch?.toLowerCase() === filterPreferences.department.toLowerCase()
      );
    }

    // Filter by family income
    if (filterPreferences.incomeThreshold) {
      const threshold = Number(filterPreferences.incomeThreshold);
      filtered = filtered.filter(student => 
        student.familyIncome && Number(student.familyIncome) <= threshold
      );
    }

    // Filter by financial need range
    if (filterPreferences.financialNeedMin) {
      const minNeed = Number(filterPreferences.financialNeedMin);
      filtered = filtered.filter(student => 
        student.financialNeed && Number(student.financialNeed) >= minNeed
      );
    }

    if (filterPreferences.financialNeedMax) {
      const maxNeed = Number(filterPreferences.financialNeedMax);
      filtered = filtered.filter(student => 
        student.financialNeed && Number(student.financialNeed) <= maxNeed
      );
    }

    setFilteredStudents(filtered);
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const closeStudentDetails = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
    setPaymentAmount('');
  };

  const handlePaymentAmountChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPaymentAmount(value);
  };

  const sendPaymentRequest = async () => {
    if (!selectedStudent || !paymentAmount || Number(paymentAmount) <= 0) {
      return;
    }

    try {
      const response = await api.post('/api/alumni/payment/request', {
        studentId: selectedStudent._id,
        amount: Number(paymentAmount),
        message: `Payment request of ₹${paymentAmount} from Alumni`
      });
      
      // Update the student's financial need in the local state
      const updatedStudent = {
        ...selectedStudent,
        financialNeed: Math.max(0, selectedStudent.financialNeed - Number(paymentAmount))
      };
      
      // Update the students list
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student._id === selectedStudent._id ? updatedStudent : student
        )
      );
      
      alert('Payment request sent successfully!');
      closeStudentDetails();
      fetchDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Error sending payment request:', error);
      alert('Failed to send payment request. Please try again.');
    }
  };

  return (
    <div className="dashboard-containera dashboard-page">
      <AlumniSidebar />
      <div className="dashboard-content">
        <h2 className="dashboard-title">
          Welcome, Alumni <span role="img" aria-label="sparkle">🌟</span>
        </h2>

        <div className="dashboard-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="dashboard-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="filter-section">
          <h3>Filter Students</h3>
          <div className="filter-form">
            <div className="filter-group">
              <label>
                <input 
                  type="checkbox" 
                  name="noPreference" 
                  checked={filterPreferences.noPreference}
                  onChange={handleFilterChange}
                />
                Show all students (no filters)
              </label>
            </div>
            
            <div className="filter-options" style={{ opacity: filterPreferences.noPreference ? 0.5 : 1 }}>
              <div className="filter-group">
                <label>Department</label>
                <select 
                  name="department" 
                  value={filterPreferences.department}
                  onChange={handleFilterChange}
                  disabled={filterPreferences.noPreference}
                >
                  <option value="all">All Departments</option>
                  <option value="computer science">Computer Science</option>
                  <option value="electrical">Electrical</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="civil">Civil</option>
                  <option value="business">Business</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Family Income Threshold (₹)</label>
                <input 
                  type="number" 
                  name="incomeThreshold" 
                  placeholder="Max family income"
                  value={filterPreferences.incomeThreshold}
                  onChange={handleFilterChange}
                  disabled={filterPreferences.noPreference}
                />
              </div>
              
              <div className="filter-row">
                <div className="filter-group">
                  <label>Financial Need (₹)</label>
                  <div className="range-inputs">
                    <input 
                      type="number" 
                      name="financialNeedMin" 
                      placeholder="Min"
                      value={filterPreferences.financialNeedMin}
                      onChange={handleFilterChange}
                      disabled={filterPreferences.noPreference}
                    />
                    <span>to</span>
                    <input 
                      type="number" 
                      name="financialNeedMax" 
                      placeholder="Max"
                      value={filterPreferences.financialNeedMax}
                      onChange={handleFilterChange}
                      disabled={filterPreferences.noPreference}
                    />
                  </div>
                </div>
              </div>
              
              <button className="save-filters-btn" onClick={saveFilterPreferences}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        <h3 className="students-heading">
          Students ({filteredStudents.length})
          {!filterPreferences.noPreference && students.length !== filteredStudents.length && 
            ` - Filtered from ${students.length} total`}
        </h3>
        
        {loading && <div className="loading">Loading students...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="students-container">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student._id} className="student-card">
                  <div className="student-info">
                    <img 
                      src={student.profilePicture || 'https://via.placeholder.com/50x50?text=Profile'} 
                      alt={student.username} 
                      className="student-avatar"
                    />
                    <div>
                      <h4>{student.username}</h4>
                      <p>{student.currentDegree} - {student.branch || 'N/A'}</p>
                      <p>CGPA: {student.cgpa || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="financial-info">
                    <p>Family Income: ₹{student.familyIncome || 'N/A'}</p>
                    <p className="financial-need">
                      Financial Need: ₹{student.financialNeed || 'N/A'}
                      {student.financialNeed > 0 && (
                        <span className="need-badge">Needs Support</span>
                      )}
                    </p>
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => viewStudentDetails(student)}
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="no-students">
                No students match your filter criteria. Try adjusting your filters.
              </div>
            )}
          </div>
        )}

        {showStudentDetails && selectedStudent && (
          <div className="modal-overlay">
            <div className="student-details-modal">
              <button className="close-modal" onClick={closeStudentDetails}>×</button>
              
              <div className="modal-header">
                <img 
                  src={selectedStudent.profilePicture || 'https://via.placeholder.com/100x100?text=Profile'} 
                  alt={selectedStudent.username} 
                  className="student-modal-avatar"
                />
                <div>
                  <h3>{selectedStudent.username}</h3>
                  <p>{selectedStudent.email}</p>
                  <p>Phone: {selectedStudent.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h4>Academic Details</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Program:</span>
                      <span className="detail-value">{selectedStudent.currentDegree || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Branch:</span>
                      <span className="detail-value">{selectedStudent.branch || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">CGPA:</span>
                      <span className="detail-value">{selectedStudent.cgpa || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Graduation Year:</span>
                      <span className="detail-value">{selectedStudent.graduationYear || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Financial Details</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Family Income:</span>
                      <span className="detail-value">₹{selectedStudent.familyIncome || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tuition Fee:</span>
                      <span className="detail-value">₹{selectedStudent.tuitionFee || 'N/A'}</span>
                    </div>
                    <div className="detail-item highlight">
                      <span className="detail-label">Financial Need:</span>
                      <span className="detail-value">₹{selectedStudent.financialNeed || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Certificates & Documents</h4>
                  {selectedStudent.certificates && selectedStudent.certificates.length > 0 ? (
                    <div className="certificates-grid">
                      {selectedStudent.certificates.map((certificate, index) => (
                        <div key={index} className="certificate-item">
                          <div className="certificate-preview">
                            {certificate.endsWith('.pdf') ? (
                              <div className="pdf-preview">
                                <i className="fas fa-file-pdf"></i>
                                <span>PDF Document</span>
                              </div>
                            ) : (
                              <img 
                                src={certificate} 
                                alt={`Certificate ${index + 1}`} 
                                className="certificate-image"
                              />
                            )}
                          </div>
                          <a 
                            href={certificate} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="view-certificate-btn"
                          >
                            View Certificate
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-certificates">No certificates uploaded yet.</p>
                  )}
                </div>
                
                <div className="payment-section">
                  <h4>Send Payment Request</h4>
                  <div className="payment-form">
                    <div className="amount-input">
                      <span className="currency-symbol">₹</span>
                      <input 
                        type="text" 
                        placeholder="Enter amount" 
                        value={paymentAmount}
                        onChange={handlePaymentAmountChange}
                        max={selectedStudent.financialNeed}
                      />
                    </div>
                    <button 
                      className="send-request-btn"
                      onClick={sendPaymentRequest}
                      disabled={!paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > selectedStudent.financialNeed}
                    >
                      Send Payment Request
                    </button>
                  </div>
                  <p className="payment-note">
                    <strong>Note:</strong> This will send a payment request notification to the student. 
                    Once approved, you'll be able to pay via GPay using the student's UPI ID.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;
