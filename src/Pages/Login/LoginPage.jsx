import React, { useState } from 'react';
import image1 from '../../assets/image-login-1.jpg';
import image2 from '../../assets/image-login-2.jpg';
import bgImage from '../../assets/bg-login.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const navigate = useNavigate();

  const togglePassword = (idField) => {
    const passwordField = document.getElementById(idField);
    if (passwordField) {
      passwordField.type =
        passwordField.type === 'password' ? 'text' : 'password';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const enteredUsername = document
      .getElementById('loginUsername')
      .value.trim();
    const enteredPassword = document
      .getElementById('passwordLogin')
      .value.trim();

    if (!enteredUsername || !enteredPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(
        'http://careskinbeauty.shop:4456/api/Customer/Login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            UserName: enteredUsername,
            Password: enteredPassword,
          }),
        }
      );

      // Parse the response once and store it
      const responseData = await response.json();
      console.log('Response:', responseData); // Debugging

      if (!responseData.Success) {
        throw new Error(responseData.Message || 'Login failed');
      }

      // Extract token correctly from response data
      const token = responseData.Data;
      if (token) {
        localStorage.setItem('token', token);

        // Decode JWT (if needed)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));
        localStorage.setItem('user', JSON.stringify(decodedPayload));

        toast.success('Login successful', { autoClose: 2000 });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error('Invalid username or password.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error(error.message || 'An error occurred while logging in.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const UserName = document.getElementById('registerUserName')?.value.trim();
    const Email = document.getElementById('registerEmail')?.value.trim();
    const Password = document.getElementById('passwordRegister')?.value.trim();
    const ConfirmPassword = document
      .getElementById('ConfirmPassword')
      ?.value.trim();
    if (!UserName || !Email || !Password || !ConfirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (Password !== ConfirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('UserName', UserName);
      formData.append('Email', Email);
      formData.append('Password', Password);
      formData.append('ConfirmPassword', ConfirmPassword);
      const registerResponse = await fetch(
        'http://careskinbeauty.shop:4456/api/Customer/Register',
        { method: 'POST', body: formData }
      );
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        toast.error(errorData.message || 'Registration failed');
        return;
      }
      const data = await registerResponse.json();
      toast.success('Registration successful! You can now log in.');
      setRightPanelActive(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: '#059669',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        ← Homepage
      </button>
      <div
        className="h-screen flex items-center justify-center bg-cover bg-center p-4"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="relative w-full max-w-4xl h-[600px] bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: rightPanelActive ? '0' : '50%',
              width: '50%',
              height: '100%',
              backgroundImage: `url(${rightPanelActive ? image2 : image1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.6s ease-in-out',
              zIndex: 1,
            }}
          >
            {!rightPanelActive && (
              <button
                onClick={() => setRightPanelActive(true)}
                style={{
                  position: 'absolute',
                  bottom: '85px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '12px 40px',
                  backgroundColor: 'white',
                  color: '#059669',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                }}
              >
                Sign Up
              </button>
            )}

            {rightPanelActive && (
              <button
                onClick={() => setRightPanelActive(false)}
                style={{
                  position: 'absolute',
                  bottom: '85px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '12px 40px',
                  backgroundColor: 'white',
                  color: '#059669',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                }}
              >
                Sign In
              </button>
            )}
          </div>

          <form
            onSubmit={handleLogin}
            style={{
              position: 'absolute',
              top: 0,
              left: rightPanelActive ? '-50%' : '0',
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'white',
              transition: 'all 0.6s ease-in-out',
              zIndex: 2,
            }}
          >
            <h1
              style={{
                marginBottom: '80px',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '1.375rem',
                fontWeight: 'bold',
              }}
            >
              Sign In
            </h1>
            <div style={{ marginBottom: '20px' }}>
              {/* <GoogleLogin
                onSuccess={credentialResponse => {
                  console.log(credentialResponse);
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
              /> */}
              <a href="#facebook-login">
                <i
                  className="fa-brands fa-facebook"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '25px',
                    backgroundColor: '#fff',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    color: '#2AA4F4',
                  }}
                ></i>
              </a>
              <a href="#google-login">
                <i
                  className="fa-brands fa-google"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '25px',
                    backgroundColor: '#fff',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    color: '#DB4437',
                    marginLeft: '10px',
                  }}
                ></i>
              </a>
            </div>
            <span
              style={{ fontSize: '14px', marginBottom: '20px', color: '#666' }}
            >
              or use your account
            </span>
            <input
              type="text"
              id="loginUsername"
              name="username"
              placeholder="Username"
              required
              style={{
                width: '80%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            />
            <div style={{ position: 'relative', width: '80%' }}>
              <input
                type="password"
                id="passwordLogin"
                name="password"
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
              <i
                className="fa-solid fa-eye toggle-password"
                onClick={() => togglePassword('passwordLogin')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              ></i>
            </div>
            <a
              href="#forgot-password"
              style={{ margin: '15px 0', fontSize: '12px', color: '#059669' }}
            >
              Forgot your password?
            </a>
            <button
              type="submit"
              style={{
                padding: '12px 40px',
                marginTop: '20px',
                backgroundColor: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </form>

          {/* Form Đăng Ký */}
          <form
            onSubmit={handleRegister}
            style={{
              position: 'absolute',
              top: 0,
              left: rightPanelActive ? '50%' : '100%',
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'white',
              transition: 'all 0.6s ease-in-out',
              zIndex: 2,
            }}
          >
            <h1
              style={{
                marginBottom: '20px',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '1.375rem',
                fontWeight: 'bold',
              }}
            >
              Create Account
            </h1>
            <div
              style={{
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <a href="#facebook-signup">
                <i
                  className="fa-brands fa-facebook"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '25px',
                    backgroundColor: '#fff',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    color: '#2AA4F4',
                  }}
                ></i>
              </a>
              <a href="#google-signup">
                <i
                  className="fa-brands fa-google"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '25px',
                    backgroundColor: '#fff',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    color: '#DB4437',
                  }}
                ></i>
              </a>
            </div>
            <span
              style={{ fontSize: '14px', marginBottom: '20px', color: '#666' }}
            >
              or use your email for registration
            </span>
            <input
              type="text"
              id="registerUserName"
              name="UserName"
              placeholder="Username"
              required
              style={{
                width: '80%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            />
            <input
              type="email"
              id="registerEmail"
              name="Email"
              placeholder="Email"
              required
              style={{
                width: '80%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            />
            <div
              style={{
                position: 'relative',
                width: '80%',
                marginBottom: '10px',
              }}
            >
              <input
                type="password"
                id="passwordRegister"
                name="Password"
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
              <i
                className="fa-solid fa-eye toggle-password"
                onClick={() => togglePassword('passwordRegister')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              ></i>
            </div>
            <div style={{ position: 'relative', width: '80%' }}>
              <input
                type="password"
                id="ConfirmPassword"
                name="ConfirmPassword"
                placeholder="Confirm Password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
              <i
                className="fa-solid fa-eye toggle-password"
                onClick={() => togglePassword('ConfirmPassword')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              ></i>
            </div>
            <button
              type="submit"
              style={{
                padding: '12px 40px',
                marginTop: '20px',
                backgroundColor: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
