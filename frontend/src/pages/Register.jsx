import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Member 1 Validation Specifications
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address.');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return setError('Password must be at least 8 characters long, include at least 1 uppercase letter and 1 number.');
    }

    setLoading(true);
    try {
      await registerUser({ firstName, lastName, email, password, role });
      navigate('/login?registered=1');
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
        
        <p className="login-subtitle">Create your account to start posting jobs or picking up work.</p>
        
        {error && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="registerForm" className="needs-validation" noValidate>
          
          <div className="row mb-3">
            <div className="col-6">
              <label htmlFor="first-name" className="login-form-label">First Name</label>
              <div className="login-input-group">
                <i className="bi bi-person input-icon"></i>
                <input 
                  type="text" 
                  id="first-name" 
                  className="login-input" 
                  placeholder="First" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="col-6">
              <label htmlFor="last-name" className="login-form-label">Last Name</label>
              <div className="login-input-group">
                <i className="bi bi-person input-icon"></i>
                <input 
                  type="text" 
                  id="last-name" 
                  className="login-input" 
                  placeholder="Last" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>
          
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
            <div className="text-muted mt-1" style={{ fontSize: '12px', color: '#9ba1a8' }}>
              Min. 8 chars, 1 uppercase, 1 number.
            </div>
          </div>
          
          <div className="login-form-group">
            <label htmlFor="role" className="login-form-label">I want to join as a:</label>
            <div className="login-input-group">
              <i className={`bi ${role === 'freelancer' ? 'bi-laptop' : 'bi-briefcase'} input-icon`}></i>
              <select 
                id="role" 
                className="login-input bg-transparent" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="customer" style={{color: 'black'}}>Client (Customer)</option>
                <option value="freelancer" style={{color: 'black'}}>Freelancer</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-login mt-4" id="btn-submit" disabled={loading}>
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <i className="bi bi-arrow-right"></i>
          </button>
          
        </form>
        
        <div className="login-divider">Or register with</div>
        
        <div className="social-login-grid" style={{ gridTemplateColumns: '1fr' }}>
          <button className="btn-social" type="button" id="btn-google">
            <i className="bi bi-google text-danger"></i>
            <span>Google</span>
          </button>
        </div>
        
        <p className="login-footer-text">
          Already have an account? <Link to="/login" id="link-login">Log in</Link>
        </p>
        
      </div>
    </div>
  );
}