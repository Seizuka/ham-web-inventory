"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Role } from "../config/roles"; // Pastikan file roles berisi type "superadmin" | "admin_inventory" | "user"

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
};

const USERS: Array<{ email: string; password: string; role: Role }> = [
  { email: "super@admin.com", password: "super123", role: "superadmin" },
  { email: "inventory@admin.com", password: "admin123", role: "admin_inventory" },
  { email: "user@user.com", password: "user123", role: "user" }
];

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const loginWithEmail = (email: string, password: string) => {
    const found = USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const userObj: User = {
        id: found.email,
        name: found.email.split("@")[0],
        email: found.email,
        role: found.role,
        avatarUrl: ""
      };
      setUser(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
