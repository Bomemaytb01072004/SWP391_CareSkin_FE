import React, { useState } from 'react';
import image1 from '../../assets/image-login-1.jpg';
import image2 from '../../assets/image-login-2.jpg';
import bgImage from '../../assets/bg-login.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';

const LoginPage = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const togglePassword = (idField) => {
    const passwordField = document.getElementById(idField);
    passwordField.type =
      passwordField.type === 'password' ? 'text' : 'password';
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
        'https://67b4a923a9acbdb38ecfe654.mockapi.io/Staff'
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      const users = await response.json();
      const user = users.find(
        (u) =>
          u.username?.trim() === enteredUsername &&
          u.password?.trim() === enteredPassword
      );

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome, ${user.username}!`, { autoClose: 2000 });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error('Invalid username or password.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('An error occurred while logging in.');
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('passwordRegister').value.trim();
    const confirmPassword = document
      .getElementById('confirmPassword')
      .value.trim();
    if (!username || !email || !password || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }
    try {
      const response = await fetch(
        'https://67b4a923a9acbdb38ecfe654.mockapi.io/Staff'
      );
      const users = await response.json();
      const usernameExists = users.some((user) => user.username === username);
      const emailExists = users.some((user) => user.email === email);
      if (usernameExists) {
        toast.error('Username is already taken. Please choose another one.');
        return;
      }
      if (emailExists) {
        toast.error('An account with this email already exists.');
        return;
      }
      const registerResponse = await fetch(
        'https://67b4a923a9acbdb38ecfe654.mockapi.io/Staff',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        }
      );
      if (registerResponse.ok) {
        toast.success('Registration successful! You can now log in.');
        setRightPanelActive(false);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <button
        onClick={() => (window.location.href = '/')}
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
              top: '0',
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
              top: '0',
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
                marginBottom: '75px',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '1.375rem',
                fontWeight: 'bold',
              }}
            >
              Sign In
            </h1>
            <div style={{ marginBottom: '20px' }}>
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

          <form
            onSubmit={handleRegister}
            style={{
              position: 'absolute',
              top: '0',
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
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
              id="registerUsername"
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
            <input
              type="email"
              id="registerEmail"
              name="email"
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
            <div style={{ position: 'relative', width: '80%' }}>
              <input
                type="password"
                id="passwordRegister"
                name="password"
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
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
                  color: '#aaa',
                }}
              ></i>
            </div>
            <div style={{ position: 'relative', width: '80%' }}>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
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
                onClick={() => togglePassword('confirmPassword')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#aaa',
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
