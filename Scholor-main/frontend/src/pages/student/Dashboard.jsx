// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import Sidebar from './SideBar';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    availableScholarships: 0,
    submittedApplications: 0,
    alumniConnected: 0,
    topScholarships: [],
  });

  useEffect(() => {
    // Simulate fetching data from backend
    const fetchData = async () => {
      const mockData = {
        availableScholarships: 12,
        submittedApplications: 3,
        alumniConnected: 5,
        topScholarships: [
          {
            title: "TechSpark Fellowship",
            deadline: "April 30"
          },
          {
            title: "Women in STEM Grant",
            deadline: "May 10"
          },
          {
            title: "Alumni Support Fund",
            deadline: "May 20"
          }
        ]
      };

      // Simulate a delay (like fetching from server)
      setTimeout(() => {
        setDashboardData(mockData);
      }, 500);
    };

    fetchData();
  }, []);

  return (
    <div className='dash' style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content">
        <h1>Welcome, Students 👋</h1>

        <div className="stats">
          <div className="stat-card">
            <strong>{dashboardData.availableScholarships}</strong>
            Scholarships Available
          </div>
          <div className="stat-card">
            <strong>{dashboardData.submittedApplications}</strong>
            Applications Submitted
          </div>
          <div className="stat-card">
            <strong>{dashboardData.alumniConnected}</strong>
            Alumni Connected
          </div>
        </div>

        <div className="top-scholarships">
          <h2>Top Scholarships</h2>
          {dashboardData.topScholarships.map((scholarship, index) => (
            <div className="scholarship" key={index}>
              <span>
                <strong>{scholarship.title}</strong><br />
                Deadline: {scholarship.deadline}
              </span>
              <button className="apply-btn">Apply</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
