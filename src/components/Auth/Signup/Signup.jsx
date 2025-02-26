import React, { useState } from 'react';
import { db, auth } from '../../../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';

    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    switch (score) {
      case 0:
        message = 'Very Weak';
        break;
      case 1:
        message = 'Weak';
        break;
      case 2:
        message = 'Fair';
        break;
      case 3:
        message = 'Good';
        break;
      case 4:
        message = 'Strong';
        break;
      default:
        message = '';
    }

    return { score, message };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateEmail = async (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Email already registered');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification({ show: false, message: '', type: '' });

    try {
      await validateEmail(formData.email);

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      if (passwordStrength.score < 3) {
        throw new Error("Please use a stronger password");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: formData.email.toLowerCase(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'user',
        createdAt: new Date().toISOString(),
        status: 'active',
        lastLogin: null,
        updatedAt: new Date().toISOString()
      });

      await auth.signOut();
      
      // Show a brief success notification before redirecting
      setNotification({
        show: true,
        message: 'Account created successfully! Redirecting to login...',
        type: 'success'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      let errorMessage = 'An error occurred during signup';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else {
        errorMessage = error.message;
      }

      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>
          Create Account
          <span className="subtitle">Join WILD L.S.S</span>
        </h2>
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="name-group">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>

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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
              {passwordStrength.message && (
                <span className={`password-strength ${passwordStrength.message.toLowerCase()}`}>
                  {passwordStrength.message}
                </span>
              )}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="Create a strong password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="Confirm your password"
            />
          </div>

          <button 
            type="submit" 
            className={`signup-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Already have an account?</p>
          <Link to="/login" className="switch-button">
            <i className="fas fa-arrow-left"></i>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 