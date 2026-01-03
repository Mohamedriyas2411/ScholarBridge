import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css"; 

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <h2>Student Panel</h2>
      <ul>
        <li><NavLink to="/fill-to-apply" className={({ isActive }) => isActive ? "active" : ""}>Fill to Apply</NavLink></li>
        <li><NavLink to="/payment-requests" className={({ isActive }) => isActive ? "active" : ""}>Payment Requests</NavLink></li>
        <li><NavLink to="/connections" className={({ isActive }) => isActive ? "active" : ""}>Network</NavLink></li>
        <li><NavLink to="/messages" className={({ isActive }) => isActive ? "active" : ""}>Messages</NavLink></li>
        <li><NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink></li>
        <li>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
