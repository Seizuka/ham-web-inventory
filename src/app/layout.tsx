// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '../../contexts/AuthContext'        // <--- Tambahkan
import { SidebarProvider } from '../../contexts/SidebarContext'  // <--- Tambahkan

export const metadata: Metadata = {
  title: 'Sistem Peminjaman IT',
  description: 'Aplikasi Peminjaman Barang Komnas HAM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
