"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import { getToken, logout as logoutSvc } from "@/services/auth";
import { apiFetch } from "@/lib/api";

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => void;
  logout: () => void;
  setUser: (u: User | null) => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    const t = getToken();
    setToken(t);
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const u = await apiFetch<User>("/users/me", { cacheTtl: 60_000, dedupe: true });
      setUser(u);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch user");
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchUser();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
  };

  const handleLogout = () => {
    logoutSvc();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        setUser,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
