import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AlumniSidebar.css';

const AlumniSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/aluminiLogin');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/aluminidash' },
    { name: 'Student Requests', path: '/requests' },
    { name: 'Network', path: '/alumni-connections' },
    { name: 'Messages', path: '/alumni-messages' },
  ];

  return (
    <div className="alumni-sidebar">
      <h2 className="sidebar-title">Alumni Panel</h2>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.name} className="sidebar-item">
            <NavLink 
              to={item.path}
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              {item.name}
            </NavLink>
          </li>
        ))}
        <li className="sidebar-item">
          <button 
            onClick={handleLogout}
            className="sidebar-link logout-btn"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AlumniSidebar;
