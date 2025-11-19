"use client";

import Link from "next/link";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { isOpen } = useSidebar();
  const { user } = useAuth();

  // Tidak tampil sidebar kalau belum login
  if (!user) return null;

  // List menu sesuai role, path universal TANPA /user /admin /superadmin
  let menu: Array<{ name: string; href: string }> = [];

  if (user.role === "superadmin") {
    menu = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Daftar Barang", href: "/items" },
      { name: "Daftar Peminjaman Barang", href: "/requests" },
      //{ name: "Role", href: "/role" },
      { name: "User", href: "/users" },
      { name: "Data Peminjaman", href: "/loans" },
    ];
  } else if (user.role === "admin_inventory") {
    menu = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Daftar Barang", href: "/items" },
      { name: "Daftar Peminjaman Barang", href: "/requests" },
      { name: "Data Peminjaman", href: "/loans" },
    ];
  } else if (user.role === "user") {
    menu = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Daftar Peminjaman Barang", href: "/requests" },
      { name: "Data Peminjaman", href: "/loans" },
    ];
  }

  return (
    <aside
      className={`bg-blue-900 text-white h-screen border-r transition-all duration-300 fixed z-40 top-0 left-0 shadow-md ${
        isOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <nav className="p-4 pt-16 space-y-4 text-sm">
        <ul className="flex flex-col gap-3">
          {menu.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block hover:font-semibold hover:bg-blue-800 rounded px-3 py-2 transition"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
