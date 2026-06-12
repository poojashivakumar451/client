import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import API_BASE_URL from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Cleanup legacy persistent sessions
    localStorage.removeItem('masterUser');

    // Session Restoration (Only if session is active in this tab)
    const masterUser = sessionStorage.getItem('masterUser');
    if (masterUser) {
      setCurrentUser(JSON.parse(masterUser));
      setLoading(false);
      return; 
    }

    const studentUser = sessionStorage.getItem('studentUser');
    if (studentUser) {
      setCurrentUser(JSON.parse(studentUser));
      setLoading(false);
      return; 
    }

    // Standard Firebase Flow
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/sync`, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'Student',
          });
          
          const { token, user: userData } = response.data;
          setToken(token);
          localStorage.setItem('token', token);
          setCurrentUser(userData);
        } catch (error) {
          console.error("Auth sync error:", error);
        }
      } else {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
