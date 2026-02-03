/**
 * Login Page Component with Parallax Design
 */

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './LoginPage.module.css';

export interface LoginPageProps {
  onLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Smooth painting-like mouse parallax effect with interpolation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    // Smooth interpolation function (lerp) for painting-like effect
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setSmoothMousePosition(prev => ({
        x: lerp(prev.x, mousePosition.x, 0.08),
        y: lerp(prev.y, mousePosition.y, 0.08)
      }));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition]);

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Handle login
    setIsLoading(true);
    try {
      // TODO: Implement actual login API call
      console.log('Login attempt:', { email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success, call the onLogin callback
      if (onLogin) {
        onLogin();
      }
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      setEmailError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className={styles.loginContainer}>
      {/* Animated Background Grid */}
      <div className={styles.gridBackground}></div>
      
      {/* Parallax Background Layers with smooth painting effect */}
      <div 
        className={styles.parallaxLayer1}
        style={{
          transform: `translate(${smoothMousePosition.x * 40}px, ${smoothMousePosition.y * 40}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      <div 
        className={styles.parallaxLayer2}
        style={{
          transform: `translate(${smoothMousePosition.x * -30}px, ${smoothMousePosition.y * -30}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      <div 
        className={styles.parallaxLayer3}
        style={{
          transform: `translate(${smoothMousePosition.x * 20}px, ${smoothMousePosition.y * 20}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      
      {/* Floating Geometric Shapes with mouse interaction */}
      <div 
        className={styles.geometricShape1}
        style={{
          transform: `translate(${smoothMousePosition.x * 25}px, ${smoothMousePosition.y * 25}px) rotate(45deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      ></div>
      <div 
        className={styles.geometricShape2}
        style={{
          transform: `translate(${smoothMousePosition.x * -20}px, ${smoothMousePosition.y * -20}px) rotate(-30deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      ></div>
      <div 
        className={styles.geometricShape3}
        style={{
          transform: `translate(${smoothMousePosition.x * 15}px, ${smoothMousePosition.y * 15}px) rotate(60deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      ></div>
      <div 
        className={styles.geometricShape4}
        style={{
          transform: `translate(${smoothMousePosition.x * -15}px, ${smoothMousePosition.y * -15}px) rotate(120deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      ></div>
      <div 
        className={styles.geometricShape5}
        style={{
          transform: `translate(${smoothMousePosition.x * 18}px, ${smoothMousePosition.y * 18}px) rotate(-45deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      ></div>
      <div 
        className={styles.geometricShape6}
        style={{
          transform: `translate(${smoothMousePosition.x * -12}px, ${smoothMousePosition.y * -12}px) rotate(90deg)`,
          transition: 'transform 0.15s ease-out'
        }}
      ></div>
      
      {/* Painting brush effect - cursor trail */}
      <div 
        className={styles.paintBrush}
        style={{
          left: `${(mousePosition.x + 1) * 50}%`,
          top: `${(mousePosition.y + 1) * 50}%`,
        }}
      ></div>
      
      {/* Animated Particles */}
      <div className={styles.particles}>
        {Array.from({ length: 50 }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = 10 + Math.random() * 10;
          return (
            <div 
              key={i} 
              className={styles.particle} 
              style={{ 
                '--delay': `${delay}s`,
                '--duration': `${duration}s`,
                '--left': `${left}%`
              } as React.CSSProperties}
            ></div>
          );
        })}
      </div>
      
      {/* Glowing Orbs with mouse interaction */}
      <div 
        className={styles.orb1}
        style={{
          transform: `translate(${smoothMousePosition.x * 10}px, ${smoothMousePosition.y * 10}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      ></div>
      <div 
        className={styles.orb2}
        style={{
          transform: `translate(${smoothMousePosition.x * -8}px, ${smoothMousePosition.y * -8}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      ></div>
      <div 
        className={styles.orb3}
        style={{
          transform: `translate(${smoothMousePosition.x * 6}px, ${smoothMousePosition.y * 6}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      ></div>
      
      {/* Login Form Card */}
      <div 
        className={styles.loginCard}
        style={{
          transform: `translate(${smoothMousePosition.x * 8}px, ${smoothMousePosition.y * 8}px)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        <div className={styles.loginHeader}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

