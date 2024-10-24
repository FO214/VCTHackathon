import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}>
        VANTASY
      </NavLink>
      <NavLink to="/how-to-play" className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}>
        HOW TO PLAY
      </NavLink>
      <NavLink to="/brackets" className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}>
        BRACKETS
      </NavLink>
      <NavLink to="/make-your-team" className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}>
        MAKE YOUR TEAM
      </NavLink>
      <NavLink to="/meet-the-team" className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}>
        MEET THE TEAM
      </NavLink>
      <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}>
        LOGIN
      </NavLink>
    </nav>
  );
};

export default NavBar;
