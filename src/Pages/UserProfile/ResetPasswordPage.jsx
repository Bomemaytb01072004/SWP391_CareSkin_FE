import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faEye,
  faEyeSlash,
  faExclamationTriangle,
  faCheckCircle,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import bgImage from '../../assets/bg-login.png';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Get email from URL if provided
  const emailFromUrl = searchParams.get('email') || '';

  // States for the reset password process
  const [resetStep, setResetStep] = useState(0); // 0: email input, 1: OTP verification, 2: new password, 3: success
  const [resetEmail, setResetEmail] = useState(emailFromUrl);
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Send reset OTP
  const handleSendResetOTP = async (e) => {
    if (e) e.preventDefault();

    if (!resetEmail || !/^\S+@\S+\.\S+$/.test(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: resetEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }

      toast.success('Reset code sent successfully!');
      setResetStep(1); // Move to OTP verification step
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError(
        error.message || 'Failed to send reset code. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (resetOTP.length !== 6) {
      setResetError('Please enter a valid 6-digit code');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/verify-reset-pin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ResetPin: resetOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      toast.success('Code verified successfully!');
      setResetStep(2); // Move to new password step
    } catch (error) {
      console.error('OTP verification error:', error);
      setResetError(
        error.message || 'Invalid verification code. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: resetEmail,
            NewPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password reset successfully!');

      // Reset all form fields
      setNewPassword('');
      setConfirmNewPassword('');
      setResetOTP('');

      // Show success message
      setResetStep(3);
    } catch (error) {
      console.error('Password change error:', error);
      setResetError(
        error.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Render different steps of the reset password process
  const renderStep = () => {
    switch (resetStep) {
      case 0:
        return (
          <>
            <h1 className={styles.formTitle}>Reset Password</h1>
            <p className={styles.subTitle}>
              Enter your email address and we'll send you a code to reset your
              password.
            </p>

            {resetError && (
              <div className={styles.errorContainer}>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className={styles.errorIcon}
                />
                <p className={styles.errorMessage}>{resetError}</p>
              </div>
            )}

            <form onSubmit={handleSendResetOTP} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={styles.formField}
                  placeholder="Enter your email"
                  required
                  disabled={resetLoading}
                />
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className={styles.buttonIcon}
                    />
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          </>
        );

      case 1:
        return (
          <>
            <h1 className={styles.formTitle}>Verify Code</h1>
            <p className={styles.subTitle}>
              We've sent a 6-digit code to <strong>{resetEmail}</strong>. Enter
              it below to verify your identity.
            </p>

            {resetError && (
              <div className={styles.errorContainer}>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className={styles.errorIcon}
                />
                <p className={styles.errorMessage}>{resetError}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="otp" className={styles.inputLabel}>
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={resetOTP}
                  onChange={(e) =>
                    setResetOTP(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={`${styles.formField} ${styles.otpField}`}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  disabled={resetLoading}
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className={styles.buttonIcon}
                      />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetStep(0);
                    setResetOTP('');
                    setResetError('');
                  }}
                  className={styles.secondaryButton}
                  disabled={resetLoading}
                >
                  Back
                </button>
              </div>

              <div className={styles.resendLink}>
                <button
                  type="button"
                  onClick={handleSendResetOTP}
                  className={styles.textButton}
                  disabled={resetLoading}
                >
                  Didn't receive a code? Send again
                </button>
              </div>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h1 className={styles.formTitle}>Set New Password</h1>
            <p className={styles.subTitle}>
              Create a new password for your account.
            </p>

            {resetError && (
              <div className={styles.errorContainer}>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className={styles.errorIcon}
                />
                <p className={styles.errorMessage}>{resetError}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.inputLabel}>
                  New Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.formField}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                    disabled={resetLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.toggleButton}
                    tabIndex="-1"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                <p className={styles.fieldHint}>
                  Password must be at least 6 characters
                </p>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>
                  Confirm Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={styles.formField}
                    placeholder="Confirm new password"
                    required
                    disabled={resetLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.toggleButton}
                    tabIndex="-1"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className={styles.fieldError}>Passwords do not match</p>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                    resetLoading ||
                    (confirmNewPassword && newPassword !== confirmNewPassword)
                  }
                >
                  {resetLoading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className={styles.buttonIcon}
                      />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetStep(1);
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setResetError('');
                  }}
                  className={styles.secondaryButton}
                  disabled={resetLoading}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        );

      case 3:
        return (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h1 className={styles.formTitle}>Password Reset Successfully!</h1>
            <p className={styles.subTitle}>
              Your password has been reset. You can now log in with your new
              password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className={styles.primaryButton}
            >
              Go to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={styles.pageContainer}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className={styles.backButton}>
        <button
          onClick={() => navigate('/login')}
          className={styles.iconButton}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
        </button>
      </div>

      <div className={styles.formContainer}>{renderStep()}</div>
    </div>
  );
};

export default ResetPasswordPage;
