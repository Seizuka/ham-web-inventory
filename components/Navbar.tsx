"use client";

import { useSidebar } from "../contexts/SidebarContext";
import NavbarRight from "./NavbarRight";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="bg-blue-900 text-white px-4 py-2 flex items-center justify-between fixed w-full top-0 z-50 h-14 shadow">
      {/* Kiri: Icon & Judul */}
      <div className="flex items-center gap-2">
        <button onClick={toggleSidebar} className="text-white text-xl font-bold">
          ☰
        </button>
        <h1 className="font-bold text-base md:text-lg break-words text-left">
          Komnas HAM IT Loan System
        </h1>
      </div>

      {/* Kanan: Notifikasi dan Profil */}
      <NavbarRight />
    </nav>
  );
}
