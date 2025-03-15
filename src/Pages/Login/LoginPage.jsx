import React, { useState } from 'react';
import image1 from '../../assets/image-login-1.jpg';
import image2 from '../../assets/image-login-2.jpg';
import bgImage from '../../assets/bg-login.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
import { Formik, useFormik } from 'formik';
import * as Yup from 'yup'

const LoginPage = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const [loginPassword, setLoginPassword] = useState('password');
  const [loginPasswordType, setLoginPasswordType] = useState(false);


  const [registerPassword, setRegisterPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('password')
  const [registerPasswordType, setRegisterPasswordType] = useState(false);
  const [confirmPasswordType, setConfirmPasswordType] = useState(false);

  const navigate = useNavigate();

  const formikLogin = useFormik({
    initialValues: {
      username: "",
      password: ""
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("This field is required"),
      password: Yup.string()
        .required("You must enter a password")
        .min(3, "Password must be at least 8 characters")
    }),
    onSubmit: async (values) => {
      const { username, password } = values;
      try {
        const response = await fetch(
          'http://careskinbeauty.shop:4456/api/Auth/Login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              UserName: username,
              Password: password,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();

        if (!data.token) {
          toast.error(data.message || data.error || 'Invalid username or password.');
          return;
        }

        const token = data.token;
        const CustomerId = data.CustomerId;
        localStorage.setItem('token', token);
        localStorage.setItem('CustomerId', CustomerId);

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));
        localStorage.setItem('user', JSON.stringify(decodedPayload));

        toast.success('Login successful', { autoClose: 2000 });
        setTimeout(() => {
          if (data.Role === 'User') {
            navigate('/');
          } else {
            navigate('/admin');
          }
        }, 2000);
      } catch (error) {
        console.error('Login Error:', error);
        toast.error(error.message || 'An error occurred while logging in.');
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
      email: Yup.string()
        .email('Invalid email')
        .required('Please enter email'),
      password: Yup.string()
        .required('Please enter password')
        .min(3, 'Password minimum 3 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Confirmation password does not match')
        .required('Please confirm password'),
    }),
    onSubmit: async (values) => {
      // Code xử lý đăng ký ở đây
      const { userName, email, password, confirmPassword } = values;

      try {
        const formData = new FormData();
        formData.append('UserName', userName);
        formData.append('Email', email);
        formData.append('Password', password);
        formData.append('ConfirmPassword', confirmPassword);

        const registerResponse = await fetch(
          'http://careskinbeauty.shop:4456/api/Customer/register',
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

        // Switch về màn hình đăng nhập
        setRightPanelActive(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred. Please try again later.');
      }
    },
  });

  const toggleLoginPassword = () => {
    setLoginPasswordType(!loginPasswordType)
    if (loginPasswordType == true) {
      setLoginPassword('password')
    } else {
      setLoginPassword('text')
    }
  };

  const toggleRegisterPassword = () => {
    setRegisterPasswordType(!registerPasswordType)
    if (registerPasswordType == true) {
      setRegisterPassword('password')
    } else {
      setRegisterPassword('text')
    }
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordType(!confirmPasswordType)

    if (confirmPasswordType == true) {
      setConfirmPassword('password')
    } else {
      setConfirmPassword('text')
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

          {/* Form Đăng Nhập */}
          <form
            onSubmit={formikLogin.handleSubmit}
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
              {/* 
              <GoogleLogin
              {/* 
              <GoogleLogin
                onSuccess={credentialResponse => {
                  console.log(credentialResponse);
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
              /> 
              */}

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
              name="username"
              placeholder="Username"
              autoComplete="username"
              required
              style={{
                width: '80%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
              value={formikLogin.values.username}
              onChange={formikLogin.handleChange}
              onBlur={formikLogin.handleBlur}
            />
            {formikLogin.touched.username && formikLogin.errors.username && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'left', width: '80%' }}>
                {formikLogin.errors.username}
              </div>
            )}

            <div style={{ position: 'relative', width: '80%' }}>
              <input
                type={loginPassword}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
                value={formikLogin.values.password}
                onChange={formikLogin.handleChange}
                onBlur={formikLogin.handleBlur}
              />
              <i
                className={`fa-solid ${loginPasswordType ? "fa-eye" : "fa-eye-slash"} toggle-password`}
                onClick={toggleLoginPassword}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              ></i>
            </div>
            {formikLogin.touched.password && formikLogin.errors.password && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'left', width: '80%' }}>
                {formikLogin.errors.password}
              </div>
            )}
            <a
              href="#forgot-password"
              style={{ margin: '15px 0', fontSize: '12px', color: '#059669' }}
            >
              Forgot your password?
            </a>
            <button
              onClick={() => {
                // Gọi hàm đăng nhập trước
                setRightPanelActive(false);

                // Xóa giỏ hàng khi đăng nhập thành công
                const CustomerId = localStorage.getItem('CustomerId');
                const Token = localStorage.getItem('Token');

                if (CustomerId && Token) {
                  console.log(
                    'User is logged in. Clearing cart and checkout...'
                  );

                  // ✅ Clear session storage
                  localStorage.removeItem('cart');
                  localStorage.removeItem('checkoutItems');

                  // ✅ Update state
                  setCart([]);

                  // ✅ Notify UI components of changes
                  window.dispatchEvent(new Event('storage'));

                  console.log('Cart and checkout items have been cleared.');
                }
              }}
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
            onSubmit={formikRegister.handleSubmit}
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
              name="userName"
              placeholder="Username"
              autoComplete="username"
              required
              style={{
                width: '80%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
              value={formikRegister.values.userName}
              onChange={formikRegister.handleChange}
              onBlur={formikRegister.handleBlur}
            />
            {formikRegister.touched.userName && formikRegister.errors.userName && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'left', width: '80%' }}>
                {formikRegister.errors.email}
              </div>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              required
              style={{
                width: '80%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
              value={formikRegister.values.email}
              onChange={formikRegister.handleChange}
              onBlur={formikRegister.handleBlur}
            />

            {formikRegister.touched.email && formikRegister.errors.email && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'left', width: '80%' }}>
                {formikRegister.errors.email}
              </div>
            )}

            <div
              style={{
                position: 'relative',
                width: '80%',
                marginBottom: '10px',
              }}
            >
              <input
                type={registerPassword}
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
                value={formikRegister.values.password}
                onChange={formikRegister.handleChange}
                onBlur={formikRegister.handleBlur}
              />
              <i
                className={`fa-solid ${registerPasswordType ? "fa-eye" : "fa-eye-slash"} toggle-password`}
                onClick={toggleRegisterPassword}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}

              ></i>
            </div>
            {formikRegister.touched.password && formikRegister.errors.password && (
              <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'left', width: '80%' }}>
                {formikRegister.errors.password}
              </div>
            )}
            <div style={{ position: 'relative', width: '80%' }}>
              <input
                type={confirmPassword}
                name="confirmPassword"
                placeholder="Confirm Password"
                autoComplete="new-password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
                value={formikRegister.values.confirmPassword}
                onChange={formikRegister.handleChange}
                onBlur={formikRegister.handleBlur}
              />
              <i
                className={`fa-solid ${confirmPasswordType ? "fa-eye" : "fa-eye-slash"} toggle-password`}
                onClick={toggleConfirmPassword}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              ></i>
            </div>
            {formikRegister.touched.confirmPassword &&
              formikRegister.errors.confirmPassword && (
                <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'left', width: '80%' }}>
                  {formikRegister.errors.confirmPassword}
                </div>
              )}
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
