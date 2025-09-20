"use client";

import React from "react";
import Link from "next/link";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { MENU_ITEMS } from "../config/menu";

export default function Sidebar() {
  const { isOpen } = useSidebar();
  const { user } = useAuth();

  // Filter menu sesuai role user
  const menus = user
    ? MENU_ITEMS.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <aside
      className={`bg-blue-900 text-white h-screen border-r transition-all duration-300 fixed z-40 top-0 left-0 shadow-md ${
        isOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <nav className="p-4 pt-16 space-y-4 text-sm">
        <ul className="flex flex-col gap-3">
          {menus.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className="block hover:font-semibold">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
