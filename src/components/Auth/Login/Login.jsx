import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get user data from Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await auth.signOut();
        throw new Error('User data not found');
      }

      const userData = userSnap.data();

      // Check if user is active
      if (userData.status !== 'active') {
        await auth.signOut();
        throw new Error('Account is not active');
      }

      // Update last login
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      });

      // Redirect based on user role
      if (userData.role === 'user') {
        navigate('/departments');
      } else if (userData.role === 'admin' || userData.role === 'superadmin') {
        navigate('/'); // Original routing for admin and superadmin
      } else {
        // Handle unexpected role
        await auth.signOut();
        throw new Error('Invalid user role');
      }

    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Invalid email or password';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>
          WILD L.S.S
          <span className="subtitle">Linkages Summary System</span>
        </h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-switch">
          <p>Don't have an account?</p>
          <Link to="/signup" className="switch-button">
            Create Account
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 