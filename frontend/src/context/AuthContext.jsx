import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/is-auth', {
          withCredentials: true
        });
        
        if (response.data.success) {
          const userRes = await axios.get('http://localhost:5000/api/user/me', {
            withCredentials: true
          });
          
          if (userRes.data.success) {
            setUser(userRes.data.user);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const userRes = await axios.get('http://localhost:5000/api/user/me', {
          withCredentials: true
        });
        
        if (userRes.data.success) {
          setUser(userRes.data.user);
          return true;
        }
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        userData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Wait a brief moment for the backend to complete user creation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const userRes = await axios.get('http://localhost:5000/api/user/me', {
            withCredentials: true
          });
          
          if (userRes.data.success) {
            setUser(userRes.data.user);
            return true;
          } else {
            setError('Failed to fetch user data after registration');
            return false;
          }
        } catch (userError) {
          console.error('Error fetching user after registration:', userError);
          setError('Registration successful, but failed to load user data');
          return true; // Registration was successful, even if fetching user failed
        }
      } else {
        setError(response.data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};