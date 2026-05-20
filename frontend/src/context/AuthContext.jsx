import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await auth.me();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loginUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-store text-4xl text-indigo-600 mb-4 block"></i>
          <div className="flex space-x-2 justify-center">
            <span className="typing-dot w-3 h-3 bg-indigo-600 rounded-full inline-block"></span>
            <span className="typing-dot w-3 h-3 bg-indigo-600 rounded-full inline-block"></span>
            <span className="typing-dot w-3 h-3 bg-indigo-600 rounded-full inline-block"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login: loginUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
