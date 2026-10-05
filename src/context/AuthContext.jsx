import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'que-rico-session';

function readSession() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || null;
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

  // Demo adapter: replace these methods with Firebase Auth or Supabase Auth in production.
  const signInWithGoogle = async () => saveUser({
    id: 'google-demo-customer',
    name: 'Cliente Que Rico!',
    email: 'cliente@querico.local',
    photoURL: '',
    role: 'cliente',
    provider: 'google-demo',
  });

  const signInAdmin = async (email, password) => {
    const expectedEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@querico.local';
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (email !== expectedEmail || password !== expectedPassword) {
      throw new Error('El correo o la contraseña no son correctos.');
    }
    return saveUser({
      id: 'demo-admin',
      name: 'Administración',
      email,
      role: 'administrador',
      provider: 'demo',
    });
  };

  const signOut = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}