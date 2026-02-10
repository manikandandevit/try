/**
 * Login Page Component
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { apiService } from '@/services/api';
import styles from './LoginPage.module.css';

export interface LoginPageProps {
  onLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [companyImage, setCompanyImage] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await apiService.checkAuth();
        if (authStatus.authenticated) {
          setIsAlreadyLoggedIn(true);
          setUserEmail(authStatus.user_email);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // If check fails, assume not logged in
        setIsAlreadyLoggedIn(false);
      }
    };
    checkAuthStatus();
  }, []);

  // Load company image, logo, and email
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const data = await apiService.getCompanyLogin();
        if (data.login_image_url) {
          setCompanyImage(data.login_image_url);
        }
        if (data.login_logo_url) {
          setCompanyLogo(data.login_logo_url);
        }
        if (data.email && !isAlreadyLoggedIn) {
          setEmail(data.email); // Pre-fill email if available and not already logged in
        }
      } catch (error) {
        console.error('Error loading company data:', error);
        if (!isAlreadyLoggedIn) {
          setLoginError('Failed to load company data. Please refresh the page.');
        }
      }
    };
    loadCompanyData();
  }, [isAlreadyLoggedIn]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLoginError('');

    try {
      const response = await apiService.logout();
      if (response.success) {
        // Logout successful - reset state
        setIsAlreadyLoggedIn(false);
        setUserEmail(null);
        setPassword(''); // Clear password for security
        // Reload page or reset form
        window.location.reload(); // Simple approach - reload to ensure clean state
      } else {
        setLoginError(response.error || 'Failed to logout. Please try again.');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Handle different error types
      if (error?.message) {
        setLoginError(error.message);
      } else if (error?.data?.error) {
        setLoginError(error.data.error);
      } else {
        setLoginError('An error occurred during logout. Please try again.');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle login
  const handleLogin = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    // Check if already logged in
    if (isAlreadyLoggedIn) {
      setLoginError('You are already logged in. Please logout first for security.');
      return;
    }

    // Reset all errors
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    // Client-side validation
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Start loading
    setIsLoading(true);
    setLoginError('');

    try {
      // Call login API - backend will validate against company credentials
      const response = await apiService.login(email.trim(), password);

      if (response.success) {
        // Store access token if provided
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        
        // Login successful
        setIsAlreadyLoggedIn(true);
        if (onLogin) {
          onLogin();
        }
      } else {
        // Login failed - show error message
        setLoginError(response.error || response.message || 'Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      // Production-level exception handling
      console.error('Login error:', error);
      
      // Handle different error types
      // ApiError from fetchWithCsrf has error.message and error.data
      if (error?.message) {
        // Check if error is about already being logged in
        if (error.message.includes('already logged in')) {
          setIsAlreadyLoggedIn(true);
          setLoginError(error.message);
        } else {
          setLoginError(error.message);
        }
      } else if (error?.data?.error) {
        if (error.data.error.includes('already logged in')) {
          setIsAlreadyLoggedIn(true);
          setLoginError(error.data.error);
        } else {
          setLoginError(error.data.error);
        }
      } else if (error?.response?.data?.error) {
        setLoginError(error.response.data.error);
      } else if (error?.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (typeof error === 'string') {
        setLoginError(error);
      } else {
        // Generic error message for production
        setLoginError('An unexpected error occurred. Please try again later or contact support.');
      }
    } finally {
      // Always stop loading
      setIsLoading(false);
    }
  };

  // Enable scrolling for login page
  useEffect(() => {
    document.body.classList.add('login-page-active');
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('login-page-active');
    }
    
    return () => {
      document.body.classList.remove('login-page-active');
      if (root) {
        root.classList.remove('login-page-active');
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Left Card */}
      <div className={styles.leftCard}>
        <div className={styles.leftCardContent}>
          {companyImage && (
            <img 
              src={companyImage} 
              alt="Company" 
              className={styles.companyImage}
            />
          )}
          {/* Branding */}
          <div className={styles.branding}>
            <h1 className={styles.brandName}>syn<span className={styles.boldQ}>Q</span>uot</h1>
            <p className={styles.tagline}>Smart Quotes, Made Simple.</p>
          </div>
        </div>
      </div>

      {/* Right Card */}
      <div className={styles.rightCard}>
        <div className={styles.rightCardContent}>
          {/* Company Logo */}
          {companyLogo && (
            <div className={styles.logoContainer}>
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className={styles.companyLogo}
              />
            </div>
          )}
          
          {/* Welcome Text */}
          <h2 className={styles.welcomeText}>Welcome!</h2>

          {/* Already Logged In Message */}
          {isAlreadyLoggedIn && (
            <div className={styles.alreadyLoggedInMessage}>
              <div className={styles.loggedInInfo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
                <span>You are already logged in as <strong>{userEmail || 'User'}</strong></span>
              </div>
              <p className={styles.logoutPrompt}>
                For security, please logout first before logging in with a different account.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutButton}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <span className={styles.buttonContent}>
                    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Logging out...
                  </span>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          )}

          {/* Login Error Message */}
          {loginError && !isAlreadyLoggedIn && (
            <div className={styles.errorMessage}>
              {loginError}
            </div>
          )}

          {/* Login Form - Hide if already logged in */}
          {!isAlreadyLoggedIn && (
            <form onSubmit={handleLogin} className={styles.loginForm}>
            {/* Email Input */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setLoginError('');
                }}
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                disabled={isLoading}
              />
              {emailError && (
                <span className={styles.fieldError}>{emailError}</span>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setLoginError('');
                  }}
                  className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <span className={styles.fieldError}>{passwordError}</span>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.buttonContent}>
                  <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          )}

          {/* Need Support Link */}
          {!isAlreadyLoggedIn && (
            <a href="#" className={styles.supportLink}>Need Support?</a>
          )}
        </div>
      </div>
    </div>
  );
};
