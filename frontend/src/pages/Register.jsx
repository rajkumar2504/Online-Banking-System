import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// Icons
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Register = ({ showToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Focus states to prevent premature error displays
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Visibilities
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow and status triggers
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const navigate = useNavigate();

  // Password checklist conditions
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const satisfiedCount = Object.values(requirements).filter(Boolean).length;
  const strengthScore = password.length > 0 ? Math.max(1, satisfiedCount) : 0;

  const getStrengthLabel = (score) => {
    if (score === 0) return '';
    if (score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score) => {
    if (score === 0) return 'transparent';
    if (score === 1) return '#ef4444';
    if (score === 2) return '#f97316';
    if (score === 3) return '#eab308';
    return '#22c55e';
  };

  const strengthLabel = getStrengthLabel(strengthScore);
  const strengthColor = getStrengthColor(strengthScore);

  // Border classes helper
  const getNameBorderClass = () => {
    if (!nameTouched) return '';
    return name.trim() !== '' ? 'success-border' : 'error-border';
  };

  const getEmailBorderClass = () => {
    if (!emailTouched) return '';
    return /\S+@\S+\.\S+/.test(email) ? 'success-border' : 'error-border';
  };

  const getConfirmBorderClass = () => {
    if (!confirmPassword) return '';
    return password === confirmPassword ? 'success-border' : 'error-border';
  };

  // Form validity gating
  const isFormValid = name.trim() !== '' &&
                      /\S+@\S+\.\S+/.test(email) &&
                      satisfiedCount === 4 &&
                      confirmPassword !== '' &&
                      password === confirmPassword &&
                      termsAccepted;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    setNameTouched(true);
    setEmailTouched(true);
    setConfirmTouched(true);

    if (!isFormValid) {
      showToast('Please fill all fields correctly', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      setRegisterSuccess(true);
      showToast('Account created successfully! Please sign in.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Registration failed. Email might already be in use.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ position: 'relative' }}>
      {/* Background Radial Glow Blobs */}
      <div className="bg-glow-blob bg-glow-top-left"></div>
      <div className="bg-glow-blob bg-glow-bottom-right"></div>

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
            {registerSuccess ? (
              <div className="success-checkmark-overlay">
                <div className="success-checkmark-circle">
                  <CheckIcon />
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#4ade80', marginBottom: '8px' }}>Registration Complete</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                  Your NexaBank profile has been registered. Redirecting to sign in console...
                </p>
              </div>
            ) : (
              <>
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

                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Create Account</h2>
                <p style={{ fontSize: '0.9rem', color: '#5a5f7a', marginBottom: '24px' }}>Join NexaBank today</p>

                <form onSubmit={handleSubmit}>
                  <div className="auth-group">
                    <label className="auth-label" htmlFor="register-name">Full Name</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><UserIcon /></span>
                      <input
                        id="register-name"
                        type="text"
                        className={`auth-input ${getNameBorderClass()}`}
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setNameTouched(true)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-group">
                    <label className="auth-label" htmlFor="register-email">Email Address</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><MailIcon /></span>
                      <input
                        id="register-email"
                        type="email"
                        className={`auth-input ${getEmailBorderClass()}`}
                        placeholder="e.g. johndoe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-group" style={{ marginBottom: '10px' }}>
                    <label className="auth-label" htmlFor="register-password">Password</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><LockIcon /></span>
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input has-toggle"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    {/* Password strength indicator bar */}
                    <div className="strength-bar-wrapper">
                      <div className="strength-bar-segments">
                        <div className={`strength-segment ${strengthScore >= 1 ? `filled-${strengthLabel.toLowerCase()}` : ''}`} />
                        <div className={`strength-segment ${strengthScore >= 2 ? `filled-${strengthLabel.toLowerCase()}` : ''}`} />
                        <div className={`strength-segment ${strengthScore >= 3 ? `filled-${strengthLabel.toLowerCase()}` : ''}`} />
                        <div className={`strength-segment ${strengthScore >= 4 ? `filled-${strengthLabel.toLowerCase()}` : ''}`} />
                      </div>
                      <span className="strength-text-label" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </span>
                    </div>

                    {/* Password requirements checklist */}
                    <div className="validation-checklist">
                      <div className={`checklist-item ${requirements.length ? 'satisfied' : ''}`}>
                        <span className="checklist-bullet">{requirements.length ? '✓' : '○'}</span>
                        At least 8 characters
                      </div>
                      <div className={`checklist-item ${requirements.uppercase ? 'satisfied' : ''}`}>
                        <span className="checklist-bullet">{requirements.uppercase ? '✓' : '○'}</span>
                        One uppercase letter
                      </div>
                      <div className={`checklist-item ${requirements.number ? 'satisfied' : ''}`}>
                        <span className="checklist-bullet">{requirements.number ? '✓' : '○'}</span>
                        One number
                      </div>
                      <div className={`checklist-item ${requirements.special ? 'satisfied' : ''}`}>
                        <span className="checklist-bullet">{requirements.special ? '✓' : '○'}</span>
                        One special character
                      </div>
                    </div>
                  </div>

                  <div className="auth-group" style={{ marginBottom: '24px' }}>
                    <label className="auth-label" htmlFor="register-confirm">Confirm Password</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><LockIcon /></span>
                      <input
                        id="register-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`auth-input has-toggle ${getConfirmBorderClass()}`}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmTouched(true);
                        }}
                        onBlur={() => setConfirmTouched(true)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {confirmPassword && (
                      password === confirmPassword ? (
                        <span className="auth-error-msg" style={{ color: '#22c55e' }}>✓ Passwords match</span>
                      ) : (
                        <span className="auth-error-msg" style={{ color: '#ef4444' }}>✗ Passwords do not match</span>
                      )
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <input
                      id="register-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="auth-checkbox"
                      required
                    />
                    <label htmlFor="register-terms" style={{ fontSize: '0.85rem', color: '#5a5f7a', cursor: 'pointer', userSelect: 'none' }}>
                      I agree to the <a href="#terms" onClick={(e) => { e.preventDefault(); showToast('Terms of Service and Privacy Policy details displayed.', 'info'); }} style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Terms & Privacy Policy</a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={loading || !isFormValid}
                  >
                    {loading ? <div className="spinner spinner-sm"></div> : 'Create Account'}
                  </button>
                </form>

                <div className="auth-divider">OR</div>

                <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                  <span style={{ color: '#5a5f7a' }}>Already have an account? </span>
                  <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
                    Sign In
                  </Link>
                </div>
              </>
            )}
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

export default Register;
