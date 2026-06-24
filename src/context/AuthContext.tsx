import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../api/auth.api';
import type { User } from '../api/users.api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, age?: number) => Promise<void>;
  logout: () => void;
  updateAuth: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(!localStorage.getItem('token')); // 无 token 直接 ready

  // 同步 token 到 localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // 同步 user 到 localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data.data;
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (name: string, email: string, password: string, age?: number) => {
    const res = await authAPI.register({ name, email, password, age });
    const { token: newToken, user: newUser } = res.data.data;
    setToken(newToken);
    setUser(newUser);
  };

  const updateAuth = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // 每次刷新页面都从后端拉取最新角色 + 新 token，完成前阻塞页面渲染
  useEffect(() => {
    if (!token) return;
    authAPI.me().then(res => {
      if (res.data?.data) {
        const { user: freshUser, token: freshToken } = res.data.data;
        setUser(freshUser);
        setToken(freshToken);
      }
    }).catch(() => {}).finally(() => {
      setReady(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f1119', gap: 20 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#6b7280', fontSize: 14, letterSpacing: 1 }}>加载中</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, register, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
