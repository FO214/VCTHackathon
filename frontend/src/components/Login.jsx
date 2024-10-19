import React from 'react';
import logo from '../assets/logo.png';

const Login = () => {
  return (
    <div className="login-wrapper">
      <img src={logo} alt="Vantasy Logo" className="logo" />
      <input type="text" placeholder="Name" />
      <input type="password" placeholder="Password" />
      <button>Login</button>
    </div>
  );
};

export default Login;
