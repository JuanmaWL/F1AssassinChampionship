import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'f1_admin_auth';
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

interface SessionData {
  valid: boolean;
  expires: number;
}

// In-memory fallback for when localStorage is blocked
let inMemoryAuth = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return inMemoryAuth;
      
      // Soporte para el formato antiguo (solo 'true')
      if (stored === 'true') {
        inMemoryAuth = true;
        return true;
      }

      const parsed: SessionData = JSON.parse(stored);
      if (parsed.expires && Date.now() > parsed.expires) {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
        inMemoryAuth = false;
        return false;
      }
      inMemoryAuth = parsed.valid === true;
      return inMemoryAuth;
    } catch {
      return inMemoryAuth;
    }
  });

  const logout = useCallback(() => {
    setIsAdmin(false);
    inMemoryAuth = false;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const login = () => {
    const expires = Date.now() + SESSION_TTL;
    const sessionData: SessionData = {
      valid: true,
      expires
    };
    setIsAdmin(true);
    inMemoryAuth = true;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      // Ignore storage errors, fallback to in-memory state
    }
  };

  // Comprobación periódica de expiración (cada minuto)
  useEffect(() => {
    if (!isAdmin) return;

    const checkExpiration = () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) {
          // If we are relying on in-memory auth, don't auto-logout just because storage is empty
          if (!inMemoryAuth) {
            setIsAdmin(false);
          }
          return;
        }
        
        // Si es el formato antiguo, no tiene expiración, lo dejamos pasar o lo actualizamos
        if (stored === 'true') return;

        const parsed: SessionData = JSON.parse(stored);
        if (parsed.expires && Date.now() > parsed.expires) {
          logout();
        }
      } catch {
        // If we can't read storage, rely on in-memory state
        if (!inMemoryAuth) {
          logout();
        }
      }
    };

    const interval = setInterval(checkExpiration, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, [isAdmin, logout]);

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
