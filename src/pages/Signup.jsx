import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Mail, Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Inventory Manager' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = signup(form.name, form.email, form.password, form.role);
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
          <h1>Create Account</h1>
          <p>Start managing your inventory today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrap">
              <User size={16} />
              <input type="text" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={16} />
              <input type="email" placeholder="you@company.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="input-icon-wrap">
              <Shield size={16} />
              <select value={form.role} onChange={e => update('role', e.target.value)} style={{ paddingLeft: '40px' }}>
                <option>Inventory Manager</option>
                <option>Warehouse Staff</option>
              </select>
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
