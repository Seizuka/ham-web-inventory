"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../src/app/types/user";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from API (cookie-based)
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi untuk refresh user dari /api/me (misal setelah update avatar, password, dll)
  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) throw new Error("No login");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return false;
        let errorMsg = "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.";
        try {
          const errorJson = await res.json();
          if (errorJson?.error) errorMsg = errorJson.error;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null); // pastikan langsung set null, biar login page tidak redirect ke dashboard lagi
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
