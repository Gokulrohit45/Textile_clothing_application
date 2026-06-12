import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const DEFAULT_LOGIN_IMAGE = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80';
const API_URL = 'http://localhost:5000/api';

const ForgotPasswordPage = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setInfoMessage('');
    
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || 'OTP sent successfully!');
        if (data.otp_fallback) {
          // Fallback popup if Brevo fails/is unconfigured during local test
          setInfoMessage(`Test Mode: Use verification code "${data.otp_fallback}" to reset.`);
          toast.success(`Verification Code: ${data.otp_fallback}`, { duration: 8000 });
        }
        setStep(2);
      } else {
        setError(data.error || 'Failed to request OTP. Please verify email.');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Password reset successfully!');
        navigate('/login');
      } else {
        setError(data.error || 'Invalid OTP or expired verification session.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Visual with Background Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-neutral-900 items-center justify-center">
        <img
          src={settings.loginImage || DEFAULT_LOGIN_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[10000ms] ease-out scale-100 hover:scale-105 opacity-80 z-0"
        />
        <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1px] z-10" />
        
        <div className="relative z-20 text-white max-w-sm text-center bg-primary/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="w-16 h-16 rounded-2xl object-contain mx-auto mb-6 bg-white p-1 shadow-btn-gold" />
          ) : (
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-btn-gold">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          )}
          <h1 className="font-display font-bold text-3xl mb-3">{settings.siteName}</h1>
          <p className="text-white/80 text-sm leading-relaxed mb-6">{settings.tagline}</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {['Secure Verification', 'Fast Reset', '24/7 Safety', 'Email OTP Code'].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <span className="text-accent font-bold">✓</span>
                <span className="text-white/90 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto max-h-screen">
        <div className="w-full max-w-md my-auto">
          {/* Logo link for mobile */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.siteName} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-accent" />
              </div>
            )}
            <span className="font-display font-bold text-xl text-primary">{settings.siteName}</span>
          </Link>

          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl text-primary mb-1">Reset Password</h2>
            <p className="text-neutral-400 text-sm">
              {step === 1 ? 'Enter your email to receive a verification OTP code' : 'Verify the OTP and enter your new password'}
            </p>
          </div>

          {error && (
            <div className="bg-danger/10 text-danger text-sm rounded-xl px-4 py-3 border border-danger/20 mb-4 animate-fade-in">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="bg-accent/10 text-accent-800 text-xs rounded-xl px-4 py-3 border border-accent/20 mb-4 animate-fade-in flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-accent-700 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="label">Registered Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                id="request-otp-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-scale-in">
              <div>
                <label className="label">6-Digit OTP Code</label>
                <input
                  id="forgot-otp"
                  type="text"
                  maxLength="6"
                  className="input text-center tracking-[10px] font-mono text-lg font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  id="forgot-new-password"
                  type="password"
                  className="input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  id="forgot-confirm-password"
                  type="password"
                  className="input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                id="reset-password-btn"
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-3.5 text-base"
              >
                {loading ? 'Verifying...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center text-sm text-neutral-500 mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-accent-700 transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
