// client/src/components/Navbar.jsx
// Navigation header showing role-based links and user profile status

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isDonor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Brand Logo */}
        <Link to={isAdmin ? '/admin/dashboard' : isDonor ? '/profile' : '/login'} className="brand">
          <div className="brand-icon">
            <Droplet size={20} fill="currentColor" />
          </div>
          <span>LifeFlow</span>
        </Link>

        {/* Navigation Links based on role */}
        <ul className="nav-links">
          {isDonor && (
            <>
              <li>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-donations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Donations
                </NavLink>
              </li>
              <li>
                <NavLink to="/requests/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Request Blood
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Requests
                </NavLink>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/stock" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Blood Stock
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Requests
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/donors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Donors
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/donations/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  + Record Donation
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* User Status / Login Buttons */}
        <div className="nav-user">
          {user ? (
            <>
              <div className="user-badge">
                <User size={15} />
                <span>{user.name}</span>
                <span className={`role-pill ${user.role}`}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
