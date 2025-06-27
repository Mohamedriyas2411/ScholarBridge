// src/pages/MyApplications.js
import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Simulated backend data
    const mockApplications = [
      {
        name: 'TechSpark Fellowship',
        dateApplied: 'April 5, 2025',
        status: 'Pending',
      },
      {
        name: 'Women in STEM Grant',
        dateApplied: 'April 2, 2025',
        status: 'Approved',
      },
      {
        name: 'Minority Support Scheme',
        dateApplied: 'March 20, 2025',
        status: 'Rejected',
      },
    ];

    setApplications(mockApplications);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'status approved';
      case 'Pending': return 'status pending';
      case 'Rejected': return 'status rejected';
      default: return 'status';
    }
  };

  return (
    <div className="my-app-page" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="my-applications">
        <h2>My Applications</h2>
        <div className="application-table">
          <table>
            <thead>
              <tr>
                <th>Scholarship Name</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.name}</td>
                  <td>{app.dateApplied}</td>
                  <td>
                    <span className={getStatusClass(app.status)}>{app.status}</span>
                  </td>
                  <td>
                    <button className="view-btn">View</button>
                    {app.status === 'Pending' && (
                      <button className="withdraw-btn">Withdraw</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
