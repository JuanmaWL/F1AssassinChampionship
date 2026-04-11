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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return false;
      
      // Soporte para el formato antiguo (solo 'true')
      if (stored === 'true') {
        return true;
      }

      const parsed: SessionData = JSON.parse(stored);
      if (parsed.expires && Date.now() > parsed.expires) {
        localStorage.removeItem(SESSION_KEY);
        return false;
      }
      return parsed.valid === true;
    } catch {
      return false;
    }
  });

  const logout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const login = () => {
    const expires = Date.now() + SESSION_TTL;
    const sessionData: SessionData = {
      valid: true,
      expires
    };
    setIsAdmin(true);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  };

  // Comprobación periódica de expiración (cada minuto)
  useEffect(() => {
    if (!isAdmin) return;

    const checkExpiration = () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) {
          setIsAdmin(false);
          return;
        }
        
        // Si es el formato antiguo, no tiene expiración, lo dejamos pasar o lo actualizamos
        if (stored === 'true') return;

        const parsed: SessionData = JSON.parse(stored);
        if (parsed.expires && Date.now() > parsed.expires) {
          logout();
        }
      } catch {
        logout();
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
