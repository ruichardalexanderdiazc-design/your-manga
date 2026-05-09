import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle as loginProvider, logout as logoutProvider, registerWithEmail as registerEmailProvider, loginWithEmail as loginEmailProvider } from '../lib/firebase';

const ADMIN_EMAIL = 'richardalexanderdiaz0@gmail.com';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Añadir flag de admin
        setCurrentUser({ ...user, isAdmin: user.email === ADMIN_EMAIL });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = () => loginProvider();
  const registerWithEmail = (e, p) => registerEmailProvider(e, p);
  const loginWithEmail = (e, p) => loginEmailProvider(e, p);
  const logout = () => logoutProvider();

  const value = {
    currentUser,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
