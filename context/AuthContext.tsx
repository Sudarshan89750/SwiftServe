import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'provider';
  phone?: string;
  address?: string;
  hourlyRate?: number;
  description?: string;
  services?: string[];
}

const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    }
  }, []);

  // Set axios default headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          joinDate: userData.joinDate,
          avatar: userData.avatar
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', authToken);
        setToken(authToken);
        
        // Set user data
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          joinDate: userData.joinDate,
          avatar: userData.avatar
        });
        setIsAuthenticated(true);
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.success) {
        const { token: authToken, user: newUser } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', authToken);
        setToken(authToken);
        
        // Set user data
        setUser({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          address: newUser.address,
          joinDate: newUser.joinDate,
          avatar: newUser.avatar
        });
        setIsAuthenticated(true);
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
