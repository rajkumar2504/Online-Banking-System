import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Icons
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Login = ({ showToast }) => {
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Temp token returned from step 1 credentials validation
  const [tempToken, setTempToken] = useState('');

  // OTP inputs state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const { login } = useAuth();
  const navigate = useNavigate();

  // Timer countdown logic for OTP resend limit
  useEffect(() => {
    let timer = null;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft]);

  // Live credentials check
  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  // Submit credentials (Step 1)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || emailError || passwordError) {
      showToast('Please correct the validation errors first', 'error');
      return;
    }

    setLoading(true);
    try {
      // Use api service login which stores token in localStorage
      const data = await api.login(email, password);
      // Update auth context
      login(data.accessToken || data.token, email);
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setShowErrorToast(true);
      setTimeout(() => {
        setShowErrorToast(false);
      }, 3000);
      showToast('Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // OTP box input navigation handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError(false);

    // Auto-focus next box
    if (newOtp[index] && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace moves to previous box
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpRefs[index - 1].current.focus();
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setTimeLeft(45);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
    otpRefs[0].current.focus();
    showToast('A new 6-digit OTP code has been sent.', 'success');
  };

  // Verify OTP (Step 2)
  const handleOtpVerify = async (e) => {
    if (e) e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit OTP code', 'error');
      setOtpError(true);
      return;
    }

    setLoading(true);
    // Mock authentication check: accept '123456' as correct verification
    // Otherwise show shake/red error states
    setTimeout(() => {
      if (otpCode === '123456') {
        setOtpSuccess(true);
        setTimeout(() => {
          login(tempToken, email);
          showToast('Verification successful! Logged in.', 'success');
          navigate('/');
        }, 1200);
      } else {
        setOtpError(true);
        showToast('Incorrect security verification code', 'error');
      }
      setLoading(false);
    }, 800);
  };

  // Helper to mask email address: ar***@gmail.com
  const getMaskedEmail = (emailStr) => {
    if (!emailStr) return 'ar***@gmail.com';
    const parts = emailStr.split('@');
    if (parts.length < 2) return emailStr;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  // RENDER TWO-STEP OTP PAGE
  if (step === 'otp') {
    const isAllFilled = otp.every(char => char !== '');

    return (
      <div className="otp-page" style={{ position: 'relative' }}>
        {/* Background radial glow - same as login page */}
        <div className="bg-glow-blob bg-glow-top-left" />
        <div className="bg-glow-blob bg-glow-bottom-right" />

        <div className={`otp-card ${otpError ? 'shake-otp' : ''}`}>
          {otpSuccess ? (
            <div className="success-checkmark-overlay">
              <div className="success-checkmark-circle">
                <CheckIcon />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#4ade80', marginBottom: '8px' }}>Identity Verified</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Redirecting to secure account console...</p>
            </div>
          ) : (
            <>
              {/* Top logo */}
              <div className="otp-logo-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px var(--color-primary-glow))' }}>
                  <path d="M3 22v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
                  <path d="M6 14V9" />
                  <path d="M10 14V9" />
                  <path d="M14 14V9" />
                  <path d="M18 14V9" />
                  <path d="M12 2 2 7h20L12 2z" />
                </svg>
                <span className="auth-left-logo-text" style={{ fontSize: '1.2rem' }}>
                  Nexa<span>Bank</span>
                </span>
              </div>

              {/* Shield Icon */}
              <div className="otp-icon-wrapper">
                <ShieldIcon />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Verify Your Identity</h2>
              <p style={{ fontSize: '0.9rem', color: '#5a5f7a', marginBottom: '16px', maxWidth: '340px' }}>
                Enter the 6-digit OTP sent to <span style={{ color: '#e2e4ef', fontWeight: 500 }}>{getMaskedEmail(email)}</span>
              </p>

              {/* OTP Inputs Grid */}
              <form onSubmit={handleOtpVerify} style={{ width: '100%' }}>
                <div className="otp-inputs-row">
                  {otp.map((char, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`otp-input-box ${otpSuccess ? 'success-otp' : ''} ${otpError ? 'error-otp' : ''}`}
                      ref={otpRefs[index]}
                      value={char}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      autoFocus={index === 0}
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Countdown / Resend options */}
                <div className="otp-timer">
                  {canResend ? (
                    <span>
                      Didn't get code?{' '}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        Resend OTP
                      </button>
                    </span>
                  ) : (
                    <span>
                      Resend OTP in <span>0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                    </span>
                  )}
                </div>

                {/* Dev-mode badge — subtle, positioned inside card bottom area */}
                <div style={{
                  fontSize: '11px',
                  color: '#4b5067',
                  marginBottom: '20px',
                  userSelect: 'none',
                }}>
                  Dev mode: use <span style={{ fontFamily: 'monospace', color: '#5c5e75' }}>123456</span>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  className="auth-btn-primary"
                  style={{ marginBottom: '20px' }}
                  disabled={loading || !isAllFilled}
                >
                  {loading ? <div className="spinner spinner-sm"></div> : 'Verify'}
                </button>

                {/* Back Link */}
                <a
                  href="#back"
                  onClick={(e) => {
                    e.preventDefault();
                    setStep('login');
                  }}
                  style={{ color: '#5a5f7a', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Back to Login
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // RENDER STANDARD LOGIN PAGE WITH SPLIT LAYOUT
  return (
    <div className="login-page" style={{ position: 'relative' }}>
      {/* Background Radial Glow Blobs */}
      <div className="bg-glow-blob bg-glow-top-left"></div>
      <div className="bg-glow-blob bg-glow-bottom-right"></div>

      {showErrorToast && (
        <div className="login-error-toast">
          <span>❌ Invalid email or password. Try again.</span>
        </div>
      )}

      <div className="login-container">
        {/* LEFT 50% DECORATIVE PANEL */}
        <div className="login-left">
          {/* Glowing 3D Credit Card */}
          <div className="glowing-card-container">
            <div className="glowing-credit-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="card-chip"></div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="card-number-mock">•••• •••• •••• 8824</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.7rem', opacity: 0.8, letterSpacing: '0.05em' }}>
                <span>NEXABANK SECURE</span>
                <span>05/30</span>
              </div>
            </div>
          </div>

          <h1 className="auth-left-tagline">Secure. Fast. Reliable.</h1>
          <p className="auth-left-sub">The next generation digital banking console, providing advanced liquidity management and real-time transaction processing.</p>

          {/* Stacked Stat Badges centered vertically */}
          <div className="auth-stat-badges-stack">
            <div className="auth-stat-badge-item">
              <div className="floating-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div className="floating-stat-text">₹2.4M+ Transferred today</div>
            </div>

            <div className="auth-stat-badge-item">
              <div className="floating-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="floating-stat-text">99.9% Uptime</div>
            </div>

            <div className="auth-stat-badge-item">
              <div className="floating-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="floating-stat-text">256-bit Encryption</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div className="login-card">
            {/* Small NexaBank Logo inside form card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px var(--color-primary-glow))' }}>
                <path d="M3 22v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
                <path d="M6 14V9" />
                <path d="M10 14V9" />
                <path d="M14 14V9" />
                <path d="M18 14V9" />
                <path d="M12 2 2 7h20L12 2z" />
              </svg>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                Nexa<span style={{ color: '#a78bfa' }}>Bank</span>
              </span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.9rem', color: '#5a5f7a', marginBottom: '28px' }}>Sign in to your account</p>

            <form onSubmit={handleLoginSubmit}>
              {/* Email Field */}
              <div className="auth-group">
                <label className="auth-label" htmlFor="login-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <MailIcon />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className={`auth-input ${emailError ? 'error-border' : ''}`}
                    placeholder="e.g. user@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    required
                  />
                </div>
                {emailError && <span className="auth-error-msg">⚠️ {emailError}</span>}
              </div>

              {/* Password Field */}
              <div className="auth-group" style={{ marginBottom: '14px' }}>
                <label className="auth-label" htmlFor="login-password">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <LockIcon />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input has-toggle ${passwordError ? 'error-border' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordError && <span className="auth-error-msg">⚠️ {passwordError}</span>}
              </div>

              {/* Forgot Password */}
              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Password recovery instructions sent to your email.', 'success');
                  }}
                  style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading || !!emailError || !!passwordError}
              >
                {loading ? (
                  <>
                    <div className="auth-btn-spinner"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="auth-divider">OR</div>

            {/* Google Sign-in with colored icon */}
            <button
              type="button"
              className="auth-google-btn"
              onClick={() => showToast('Google Sign-In is a mockup for testing.', 'info')}
              style={{ marginBottom: '24px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h3.99c2.34-2.16 3.685-5.32 3.685-8.74z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.99-3.12c-1.12.75-2.54 1.19-3.97 1.19-3.05 0-5.64-2.06-6.57-4.83H1.32v3.23A12.01 12.01 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.43 14.33a7.19 7.19 0 0 1 0-4.66V6.44H1.32a12.01 12.01 0 0 0 0 11.12l4.11-3.23z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.93 11.93 0 0 0 12 0 12.01 12.01 0 0 0 1.32 6.44l4.11 3.23c.93-2.77 3.52-4.92 6.57-4.92z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Register Link */}
            <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              <span style={{ color: '#5a5f7a' }}>Don't have an account? </span>
              <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
                Register
              </Link>
            </div>
          </div>

          {/* Mobile badges, visible only on screens < 768px */}
          <div className="auth-mobile-badges">
            <div className="auth-feature-badge">🔒 Bank-grade Security</div>
            <div className="auth-feature-badge">⚡ Instant Transfers</div>
            <div className="auth-feature-badge">📊 Real-time Analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
