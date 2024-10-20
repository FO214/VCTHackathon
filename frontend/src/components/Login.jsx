import React from 'react';
import logo from '../assets/logo.png';

const Login = () => {
  return (
    <div className="login-wrapper">
      <img src={logo} alt="Vantasy Logo" className="logo" />
      <input type="text" placeholder="NAME" />
      <input type="password" placeholder="PASSWORD" />
      <button>LOGIN</button>
    </div>
  );
};

export default Login;
