import React, { useState } from 'react';
import image1 from '../../assets/image-login-1.jpg';
import image2 from '../../assets/image-login-2.jpg';
import bgImage from '../../assets/bg-login.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login-lite';
import axios from 'axios';
import { Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const LoginPage = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const [loginPassword, setLoginPassword] = useState('password');
  const [loginPasswordType, setLoginPasswordType] = useState(false);

  const [registerPassword, setRegisterPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('password');
  const [registerPasswordType, setRegisterPasswordType] = useState(false);
  const [confirmPasswordType, setConfirmPasswordType] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccessfulLogin = () => {
    if (location.state?.from) {
      navigate(`/${location.state.from}`);
    } else {
      navigate('/');
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    console.log('Google Token:', response.credential);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.post(`${backendUrl}/api/Auth/google-login`, {
        token: response.credential,
      });

      console.log('Backend Response:', res.data);

      const { token, user } = res.data;

      if (!token || !user || !user.CustomerId) {
        console.error('Invalid response format:', res.data);
        toast.error('Login failed: Invalid server response');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('CustomerId', user.CustomerId);
      localStorage.setItem('user', JSON.stringify(user));

      localStorage.removeItem('cartMerged');

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));

        login(decodedPayload, token);
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      toast.success('Login successful!', { autoClose: 2000 });

      setTimeout(() => {
        if (user.role === 'Customer' || user.role === 'User') {
          handleSuccessfulLogin();
        } else {
          navigate('/admin');
        }
      }, 2000);

      window.dispatchEvent(new Event('careSkinUserChanged'));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error sending token to BE:', error);
      if (error.response && error.response.data) {
        toast.error(
          `Login failed: ${error.response.data.message || JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        toast.error('Login failed: No response from server');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  const handleGoogleLoginFailure = () => {
    console.error('Google Login Failed');
    toast.error('Google login failed!');
  };

  const handleFacebookLoginSuccess = async (response) => {
    console.log('Facebook Token:', response.authResponse.accessToken);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.post(`${backendUrl}/api/Auth/facebook-login`, {
        token: response.authResponse.accessToken,
      });

      console.log('Backend Response:', res.data);

      const { token, user } = res.data;

      if (!token || !user || !user.CustomerId) {
        console.error('Invalid response format:', res.data);
        toast.error('Login failed: Invalid server response');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('CustomerId', user.CustomerId);
      localStorage.setItem('user', JSON.stringify(user));

      localStorage.removeItem('cartMerged');

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));

        login(decodedPayload, token);
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      toast.success('Login successful!', { autoClose: 2000 });

      setTimeout(() => {
        if (user.role === 'Customer' || user.role === 'User') {
          handleSuccessfulLogin();
        } else {
          navigate('/admin');
        }
      }, 2000);

      window.dispatchEvent(new Event('careSkinUserChanged'));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFacebookLoginFailure = () => {
    console.error('Facebook Login Failed');
    toast.error('Login with Facebook failed!');
  };

  const { login } = useAuth();

  const formikLogin = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('This field is required'),
      password: Yup.string()
        .required('You must enter a password')
        .min(3, 'Password must be at least 3 characters'),
    }),
    onSubmit: async (values) => {
      const { username, password } = values;
      try {
        const response = await fetch(`${backendUrl}/api/Auth/Login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            UserName: username,
            Password: password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || data.error || 'Login failed');
          return;
        }

        if (!data.token) {
          toast.error(
            data.message || data.error || 'Invalid username or password.'
          );
          return;
        }

        const token = data.token;
        const CustomerId = data.CustomerId;
        localStorage.setItem('CustomerId', CustomerId);

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));

        login(decodedPayload, token);

        toast.success('Login successful', { autoClose: 2000 });
        setTimeout(() => {
          if (data.Role === 'User') {
            handleSuccessfulLogin();
          } else {
            navigate('/admin');
          }
        }, 2000);
      } catch (error) {
        console.error('Login Error:', error);
        if (error.name === 'SyntaxError') {
          toast.error('Invalid username or password.');
        } else {
          toast.error(error.message || 'Login failed. Please try again.');
        }
      }
    },
  });

  const formikRegister = useFormik({
    initialValues: {
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      userName: Yup.string()
        .required('Please enter username')
        .min(6, 'Username must be at least 6 characters'),
      email: Yup.string().email('Invalid email').required('Please enter email'),
      password: Yup.string()
        .required('Please enter password')
        .min(3, 'Password minimum 3 characters'),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref('password'), null],
          'Confirmation password does not match'
        )
        .required('Please confirm password'),
    }),
    onSubmit: async (values) => {
      const { userName, email, password, confirmPassword } = values;

      try {
        const formData = new FormData();
        formData.append('UserName', userName);
        formData.append('Email', email);
        formData.append('Password', password);
        formData.append('ConfirmPassword', confirmPassword);

        const registerResponse = await fetch(
          `${backendUrl}/api/Customer/register`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          toast.error(errorData.message || 'Registration failed');
          return;
        }

        await registerResponse.json();
        toast.success('Registration successful! You can now log in.');

        setRightPanelActive(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred. Please try again later.');
      }
    },
  });

  const toggleLoginPassword = () => {
    setLoginPasswordType(!loginPasswordType);
    if (loginPasswordType == true) {
      setLoginPassword('password');
    } else {
      setLoginPassword('text');
    }
  };

  const toggleRegisterPassword = () => {
    setRegisterPasswordType(!registerPasswordType);
    if (registerPasswordType == true) {
      setRegisterPassword('password');
    } else {
      setRegisterPassword('text');
    }
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordType(!confirmPasswordType);

    if (confirmPasswordType == true) {
      setConfirmPassword('password');
    } else {
      setConfirmPassword('text');
    }
  };

  const [mobileView, setMobileView] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <button onClick={() => navigate('/')} className={styles.homeButton}>
          ← Homepage
        </button>

        <div
          className={styles.container}
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className={styles.formContainer}>
            {!mobileView && (
              <div
                className={styles.imagePanel}
                style={{
                  backgroundImage: `url(${rightPanelActive ? image2 : image1})`,
                  left: rightPanelActive ? '0' : '50%',
                }}
              >
                {!rightPanelActive && (
                  <button
                    onClick={() => setRightPanelActive(true)}
                    className={styles.switchButton}
                  >
                    Sign Up
                  </button>
                )}

                {rightPanelActive && (
                  <button
                    onClick={() => setRightPanelActive(false)}
                    className={styles.switchButton}
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}

            <form
              onSubmit={formikLogin.handleSubmit}
              className={`${styles.formBase} ${mobileView && rightPanelActive ? styles.inactive : ''}`}
              style={{
                left: rightPanelActive ? '-50%' : '0',
                ...(mobileView && { position: 'relative', left: '0' }),
              }}
            >
              <h1 className={styles.formTitle}>Sign In</h1>

              <div className={styles.socialButtonsContainer}>
                <div className="google-button-container">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginFailure}
                  />
                </div>

                <FacebookLogin
                  appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                  onSuccess={(response) => {
                    console.log('Facebook Response:', response);
                    if (response.authResponse) {
                      handleFacebookLoginSuccess(response);
                    } else {
                      handleFacebookLoginFailure();
                    }
                  }}
                />
              </div>

              <span className={styles.divider}>or use your account</span>

              <input
                type="text"
                name="username"
                placeholder="Username"
                autoComplete="username"
                required
                className={styles.formField}
                value={formikLogin.values.username}
                onChange={formikLogin.handleChange}
                onBlur={formikLogin.handleBlur}
              />

              {formikLogin.touched.username && formikLogin.errors.username && (
                <div className={styles.errorMessage}>
                  {formikLogin.errors.username}
                </div>
              )}

              <div className={styles.passwordContainer}>
                <input
                  type={loginPassword}
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className={styles.formField}
                  style={{ width: '100%', marginBottom: 0 }}
                  value={formikLogin.values.password}
                  onChange={formikLogin.handleChange}
                  onBlur={formikLogin.handleBlur}
                />
                <i
                  className={`fa-solid ${loginPasswordType ? 'fa-eye' : 'fa-eye-slash'} ${styles.toggleButton}`}
                  onClick={toggleLoginPassword}
                ></i>
              </div>

              {formikLogin.touched.password && formikLogin.errors.password && (
                <div className={styles.errorMessage}>
                  {formikLogin.errors.password}
                </div>
              )}

              <a href="#forgot-password" className={styles.forgotPassword}>
                Forgot your password?
              </a>

              <button type="submit" className={styles.primaryButton}>
                Sign In
              </button>

              {mobileView && (
                <button
                  type="button"
                  onClick={() => setRightPanelActive(true)}
                  className={styles.switchButton}
                  style={{
                    position: 'relative',
                    transform: 'none',
                    left: 'auto',
                  }}
                >
                  Sign Up
                </button>
              )}
            </form>

            <form
              onSubmit={formikRegister.handleSubmit}
              className={`${styles.formBase} ${mobileView && !rightPanelActive ? styles.inactive : ''}`}
              style={{
                left: rightPanelActive ? '50%' : '100%',
                ...(mobileView && {
                  position: 'relative',
                  left: rightPanelActive ? '0' : '100%',
                }),
              }}
            >
              <h1 className={styles.formTitle}>Create Account</h1>

              <div className={styles.socialButtonsContainer}>
                <div className="google-button-container">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginFailure}
                  />
                </div>

                <FacebookLogin
                  appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                  onSuccess={(response) => {
                    console.log('Facebook Response:', response);
                    if (response.authResponse) {
                      handleFacebookLoginSuccess(response);
                    } else {
                      handleFacebookLoginFailure();
                    }
                  }}
                />
              </div>

              <span className={styles.divider}>
                or use your email for registration
              </span>

              <input
                type="text"
                name="userName"
                placeholder="Username"
                autoComplete="username"
                required
                className={styles.formField}
                value={formikRegister.values.userName}
                onChange={formikRegister.handleChange}
                onBlur={formikRegister.handleBlur}
              />

              {formikRegister.touched.userName &&
                formikRegister.errors.userName && (
                  <div className={styles.errorMessage}>
                    {formikRegister.errors.userName}
                  </div>
                )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                required
                className={styles.formField}
                value={formikRegister.values.email}
                onChange={formikRegister.handleChange}
                onBlur={formikRegister.handleBlur}
              />

              {formikRegister.touched.email && formikRegister.errors.email && (
                <div className={styles.errorMessage}>
                  {formikRegister.errors.email}
                </div>
              )}

              <div className={styles.passwordContainer}>
                <input
                  type={registerPassword}
                  name="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                  className={styles.formField}
                  style={{ width: '100%', marginBottom: 0 }}
                  value={formikRegister.values.password}
                  onChange={formikRegister.handleChange}
                  onBlur={formikRegister.handleBlur}
                />
                <i
                  className={`fa-solid ${registerPasswordType ? 'fa-eye' : 'fa-eye-slash'} ${styles.toggleButton}`}
                  onClick={toggleRegisterPassword}
                ></i>
              </div>

              {formikRegister.touched.password &&
                formikRegister.errors.password && (
                  <div className={styles.errorMessage}>
                    {formikRegister.errors.password}
                  </div>
                )}

              <div className={styles.passwordContainer}>
                <input
                  type={confirmPassword}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                  className={styles.formField}
                  style={{ width: '100%', marginBottom: 0 }}
                  value={formikRegister.values.confirmPassword}
                  onChange={formikRegister.handleChange}
                  onBlur={formikRegister.handleBlur}
                />
                <i
                  className={`fa-solid ${confirmPasswordType ? 'fa-eye' : 'fa-eye-slash'} ${styles.toggleButton}`}
                  onClick={toggleConfirmPassword}
                ></i>
              </div>

              {formikRegister.touched.confirmPassword &&
                formikRegister.errors.confirmPassword && (
                  <div className={styles.errorMessage}>
                    {formikRegister.errors.confirmPassword}
                  </div>
                )}

              <button type="submit" className={styles.primaryButton1}>
                Sign Up
              </button>

              {mobileView && (
                <button
                  type="button"
                  onClick={() => setRightPanelActive(false)}
                  className={styles.switchButton}
                  style={{
                    position: 'relative',
                    transform: 'none',
                    left: 'auto',
                  }}
                >
                  Sign In
                </button>
              )}
            </form>
          </div>
        </div>
      </>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
