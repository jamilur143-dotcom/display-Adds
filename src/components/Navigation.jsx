import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <header className="header">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
          <rect x="2" y="3" width="20" height="14" rx="2.5" ry="2.5"></rect>
          <path d="M8 21h8"></path>
          <path d="M12 17v4"></path>
        </svg>
        <div>Ad<span>Folio</span></div>
      </div>
      <nav className="nav-links">
        <NavLink to="/portfolio" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Portfolio
        </NavLink>
      </nav>
    </header>
  );
};

export default Navigation;
