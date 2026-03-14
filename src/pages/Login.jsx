import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, User, Lock, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!loginId || !password) {
      setError('Please fill in all fields');
      return;
    }
    const result = login(loginId, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = () => {
    setLoginId('admin');
    setPassword('Admin@123');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <div className="auth-card animate-slide-up">
        <div className="auth-brand">
          <div className="auth-brand-icon"><Layers size={28} /></div>
          <h1>Re<span className="brand-green-accent">Core</span></h1>
          <p>SIGN IN</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Login Id</label>
            <div className="input-icon-wrap">
              <User size={16} />
              <input
                type="text"
                placeholder="Enter Login Id"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/forgot-password">Forget Password ?</Link> | <Link to="/signup">Sign Up</Link>
        </div>

        <div className="auth-demo-hint">
          <span className="demo-hint-label">Demo Account</span>
          <div className="demo-hint-creds">
            <span><strong>ID:</strong> admin</span>
            <span><strong>Pass:</strong> Admin@123</span>
          </div>
          <button type="button" className="demo-hint-fill" onClick={fillDemo}>
            Use Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
