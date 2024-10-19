import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav>
      <Link to="/">VANTASY</Link>
      <Link to="/how-to-play">HOW TO PLAY</Link>
      <Link to="/brackets">BRACKETS</Link>
      <Link to="/make-your-team">MAKE YOUR TEAM</Link>
      <Link to="/meet-the-team">MEET THE TEAM</Link>
      <Link to="/login">LOGIN</Link>
    </nav>
  );
};

export default NavBar;
