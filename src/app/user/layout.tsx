"use client";

import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { AuthProvider } from "../../../contexts/AuthContext";         // <<--- Tambah ini!
import { SidebarProvider, useSidebar } from "../../../contexts/SidebarContext";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isOpen ? "pl-64" : "pl-0"
        }`}
      >
        {/* Navbar */}
        <Navbar />
        {/* Konten Utama */}
        <main className="p-4 pt-20 overflow-y-auto flex-1 bg-gray-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </SidebarProvider>
    </AuthProvider>
  );
}
