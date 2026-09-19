import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('token', res.token);
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-bg-shape login-bg-shape-1"></div>
      <div className="login-bg-shape login-bg-shape-2"></div>
      
      <div className="login-card">
        
        <Link to="/" className="login-brand text-decoration-none d-flex justify-content-center">
          <img src="/raketbase%20logo.png" alt="RaketBase Logo" style={{ height: '90px', objectFit: 'contain' }} />
        </Link>
        
        <p className="login-subtitle">Please sign in to access your dashboard</p>
        
        {justRegistered && (
          <div className="alert alert-success py-2 mb-4" role="alert">
            Account created. Log in below.
          </div>
        )}
        {error && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="loginForm" className="needs-validation" noValidate>
          
          <div className="login-form-group">
            <label htmlFor="email" className="login-form-label">Email Address</label>
            <div className="login-input-group">
              <i className="bi bi-envelope input-icon"></i>
              <input 
                type="email" 
                id="email" 
                className="login-input" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="login-form-group">
            <label htmlFor="password" className="login-form-label">Password</label>
            <div className="login-input-group">
              <i className="bi bi-shield-lock input-icon"></i>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                className="login-input login-input-password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                aria-label="Show password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <div className="login-options">
            <label className="custom-control-label">
              <input type="checkbox" className="custom-checkbox-input" id="rememberMe" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="forgot-password-link">Forgot Password?</a>
          </div>
          
          <button type="submit" className="btn-login" id="btn-submit" disabled={loading}>
            <span>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
            <i className="bi bi-arrow-right"></i>
          </button>
          
        </form>
        
        <div className="login-divider">Or sign in with</div>
        
        <div className="social-login-grid" style={{ gridTemplateColumns: '1fr' }}>
          <button className="btn-social" type="button" id="btn-google">
            <i className="bi bi-google text-danger"></i>
            <span>Google</span>
          </button>
        </div>
        
        <p className="login-footer-text">
          Don't have an account? <Link to="/register" id="link-register">Register Now</Link>
        </p>
        
      </div>
    </div>
  );
}