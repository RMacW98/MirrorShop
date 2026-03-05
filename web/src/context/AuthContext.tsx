import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, name: string, password: string, phoneNumber?: string) => Promise<void>;
  updateProfile: (data: { name?: string; phoneNumber?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "mirrorshop_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    apiFetch("/auth/me", { token })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.details ?? data.error ?? "Login failed";
      throw new Error(msg);
    }
    const { user: u, token: t } = await res.json();
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const register = async (email: string, name: string, password: string, phoneNumber?: string) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password, phoneNumber }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.details ?? data.error ?? "Registration failed";
      throw new Error(msg);
    }
    const { user: u, token: t } = await res.json();
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    setUser(u);
  };

  const updateProfile = async (data: { name?: string; phoneNumber?: string }) => {
    if (!token) return;
    const res = await apiFetch("/auth/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const apiData = await res.json().catch(() => ({}));
      throw new Error(apiData.error ?? "Failed to update profile");
    }
    const u = await res.json();
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, token, login, logout, register, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
