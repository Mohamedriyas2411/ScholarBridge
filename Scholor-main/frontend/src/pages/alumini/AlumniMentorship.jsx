import React from 'react';
import AlumniSidebar from './AlumniSidebar';
import './Mentorship.css';

const mentorshipData = [
  {
    name: 'Priya Sharma',
    message: 'I’m preparing for GRE and want your guidance.',
    branch: 'Computer Science',
    date: '16-Apr-2025',
  },
  {
    name: 'Rahul Mehta',
    message: 'Need mentorship for tech career path.',
    branch: 'Information Technology',
    date: '14-Apr-2025',
  },
];

const AlumniMentorship = () => {
  return (
    <div className="mentorship-container">
      <AlumniSidebar />
      <div className="mentorship-content">
        <h2 className="mentorship-title">Mentorship Requests</h2>
        {mentorshipData.map((req, index) => (
          <div className="mentorship-card" key={index}>
            <h3>{req.name}</h3>
            <p><strong>Message:</strong> {req.message}</p>
            <p><strong>Branch:</strong> {req.branch}</p>
            <p><strong>Requested on:</strong> {req.date}</p>
            <div className="button-group">
              <button className="btn-accept">Accept</button>
              <button className="btn-decline">Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniMentorship;
