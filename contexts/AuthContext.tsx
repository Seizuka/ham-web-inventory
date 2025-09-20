// contexts/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Role } from "../config/roles";

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
  loginWithEmail: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore user dari localStorage ketika pertama kali mount
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const loginWithEmail = (email: string, password: string) => {
    const found = USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const u = {
        id: found.email,
        name: found.email.split("@")[0],
        email: found.email,
        role: found.role,
        avatarUrl: ""
      };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u)); // <-- simpan ke localStorage
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // <-- hapus dari localStorage
  };

  return (
    <AuthContext.Provider value={{ user, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
