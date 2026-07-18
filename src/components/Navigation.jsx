import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <header className="header">
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/logo.png" 
          alt="DMI Creative Media Agency" 
          style={{ height: '36px', width: 'auto', display: 'block', objectFit: 'contain' }} 
        />
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
