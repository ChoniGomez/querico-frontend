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
    return saveUser({ ...session.user, token: session.token });
  };

  const signOut = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}