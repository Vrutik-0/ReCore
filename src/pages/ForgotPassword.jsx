import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Mail, Lock, KeyRound } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpw
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { requestOtp, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    const result = requestOtp(email);
    if (result.success) {
      setGeneratedOtp(result.otp);
      setStep(2);
    } else {
      setError(result.error);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const result = verifyOtp(email, otp);
    if (result.success) {
      setStep(3);
    } else {
      setError(result.error);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    const result = resetPassword(email, newPassword);
    if (result.success) {
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <div className="auth-card animate-slide-up">
        <div className="auth-brand">
          <div className="auth-brand-icon"><Box size={28} /></div>
          <h1>Reset Password</h1>
          <p>{step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? 'Enter the OTP sent to your email' : 'Create a new password'}</p>
        </div>

        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''}`} />
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`} />
          <div className={`auth-step ${step >= 3 ? 'active' : ''}`} />
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-otp-display">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={16} />
                <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <>
            <div className="auth-otp-display">
              Your OTP (simulated):<strong>{generatedOtp}</strong>
            </div>
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label>Enter OTP</label>
                <div className="input-icon-wrap">
                  <KeyRound size={16} />
                  <input type="text" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit">Verify OTP</button>
            </form>
          </>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit">Reset Password</button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
