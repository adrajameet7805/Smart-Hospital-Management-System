import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  profile: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify session via HTTP-Only cookie (no localStorage!)
  useEffect(() => {
    authApi.getMe()
      .then(res => {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
      })
      .catch((err) => {
        console.error('Session verification failed:', err?.response?.status || err.message);
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { user: u, profile: p } = res.data.data;
    // JWT is set as HTTP-Only cookie by the backend — no localStorage needed
    setUser(u);
    setProfile(p);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    const { user: u } = res.data.data;
    setUser(u);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout endpoint may fail, that's fine
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
