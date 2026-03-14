import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const [form, setForm] = useState({ loginId: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.loginId || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = signup({ loginId: form.loginId, email: form.email, password: form.password });
    if (result.success) {
      navigate('/dashboard');
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
          <h1>SIGN UP</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Enter Login Id</label>
            <div className="input-icon-wrap">
              <User size={16} />
              <input type="text" placeholder="6-12 characters" value={form.loginId} onChange={e => update('loginId', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Enter Email Id</label>
            <div className="input-icon-wrap">
              <Mail size={16} />
              <input type="email" placeholder="you@company.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Enter Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} />
              <input type={showPw ? 'text' : 'password'} placeholder="Min 8 chars, upper+lower+special" value={form.password} onChange={e => update('password', e.target.value)} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Re-Enter Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} />
              <input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
