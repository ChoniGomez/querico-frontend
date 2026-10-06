import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../utils/api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'que-rico-session';

function readSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!session?.token || !['customer', 'admin'].includes(session.role)) return null;
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const saveUser = (nextUser) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const signInWithGoogle = async (credential) => {
    const session = await apiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (!session.user || !session.token) throw new Error('La API no devolvió una sesión válida.');
    return saveUser({ ...session.user, token: session.token });
  };

  const signInWithEmail = async (email, password) => {
    const session = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!session.user || !session.token) throw new Error('La API no devolvió una sesión válida.');
    return saveUser({ ...session.user, token: session.token });
  };

  const registerWithEmail = (details) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  });

  const verifyEmail = async (email, code) => {
    const session = await apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (!session.user || !session.token) throw new Error('La API no devolvió una sesión válida.');
    return saveUser({ ...session.user, token: session.token });
  };

  const resendVerification = (email) => apiRequest('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  const updateProfile = async (profile) => {
    if (!user?.token) throw new Error('Iniciá sesión para actualizar tu perfil.');
    const updatedProfile = await apiRequest('/api/auth/me', {
      method: 'PATCH',
      token: user.token,
      body: JSON.stringify(profile),
    });
    return saveUser({ ...user, ...updatedProfile, token: user.token });
  };

  const signOut = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInWithEmail, registerWithEmail, verifyEmail, resendVerification, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}