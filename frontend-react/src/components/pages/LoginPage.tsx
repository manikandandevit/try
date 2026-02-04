/**
 * Login Page Component - Split Screen Design
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/services/api';
import styles from './LoginPage.module.css';

export interface LoginPageProps {
  onLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginLogo, setLoginLogo] = useState<string | null>(null);
  const [loginImage, setLoginImage] = useState<string | null>(null);
  const [defaultEmail, setDefaultEmail] = useState<string>('');

  // Load company login data
  useEffect(() => {
    const loadCompanyLogin = async () => {
      try {
        const data = await apiService.getCompanyLogin();
        if (data.login_logo_url) {
          setLoginLogo(data.login_logo_url);
        }
        if (data.login_image_url) {
          setLoginImage(data.login_image_url);
        }
        if (data.email) {
          setDefaultEmail(data.email);
          setEmail(data.email);
        }
      } catch (error) {
        console.error('Error loading company login data:', error);
      }
    };
    loadCompanyLogin();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validation
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

    // Handle login
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        // On success, call the onLogin callback
        if (onLogin) {
          onLogin();
        }
      } else {
        setEmailError(response.error || 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setEmailError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Illustration */}
      <div className={styles.leftSection}>
        {loginImage ? (
          <img src={loginImage} alt="Login Illustration" className={styles.loginImage} />
        ) : (
          <div className={styles.illustration}>
            {/* Person with Laptop */}
            <div className={styles.personLaptop}>
              <div className={styles.person}>
                <div className={styles.head}></div>
                <div className={styles.body}></div>
              </div>
              <div className={styles.laptop}></div>
            </div>
            
            {/* Invoice Document */}
            <div className={styles.invoice}>
              <div className={styles.invoiceText}>INVOICE</div>
              <div className={styles.invoiceLines}>
                <div className={styles.invoiceLine}></div>
                <div className={styles.invoiceLine}></div>
                <div className={styles.invoiceLine}></div>
              </div>
            </div>
            
            {/* Paper Airplane */}
            <div className={styles.paperAirplane}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
              </svg>
            </div>
            
            {/* Dashed Line */}
            <div className={styles.dashedLine}></div>
          </div>
        )}
        
        {/* Branding */}
        <div className={styles.branding}>
          <h1 className={styles.brandName}>syn<span className={styles.boldQ}>Q</span>uot</h1>
          <p className={styles.tagline}>Smart Quotes, Made Simple.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          {/* Company Logo */}
          {loginLogo && (
            <div className={styles.logoContainer}>
              <img src={loginLogo} alt="Company Logo" className={styles.companyLogo} />
            </div>
          )}
          
          {!loginLogo && (
            <div className={styles.logoContainer}>
              <div className={styles.defaultLogo}>
                <div className={styles.logoIcon}></div>
                <div className={styles.logoText}>
                  <div className={styles.logoTitle}>SYNGRID</div>
                  <div className={styles.logoSubtitle}>Digital Solution Architects</div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Text */}
          <h2 className={styles.welcomeText}>Welcome!</h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              {passwordError && <span className={styles.errorMessage}>{passwordError}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Support Link */}
          <a href="#" className={styles.supportLink}>Need a Support?</a>
        </div>
      </div>
    </div>
  );
};
