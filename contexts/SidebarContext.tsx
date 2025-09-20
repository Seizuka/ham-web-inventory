"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Tipe context
type SidebarContextType = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

// Inisialisasi context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// SidebarProvider function component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook untuk pakai context
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
