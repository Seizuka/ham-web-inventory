"use client";
import React, { useState } from "react";

// --- Type & Dummy Data ---
type BorrowStatus = "borrowed" | "returned";
type BorrowItem = {
  id: number;
  itemId: number;
  namaBarang: string;
  peminjam: string;
  tanggalPinjam: string; // YYYY-MM-DD
  tanggalKembali?: string;
  status: BorrowStatus;
};

const initialBorrows: BorrowItem[] = [
  {
    id: 1,
    itemId: 2,
    namaBarang: "Tripod Kecil",
    peminjam: "budi@email.com",
    tanggalPinjam: "2025-09-23",
    status: "borrowed",
  },
  {
    id: 2,
    itemId: 6,
    namaBarang: "Webcam",
    peminjam: "siti@email.com",
    tanggalPinjam: "2025-09-22",
    status: "borrowed",
  },
  {
    id: 3,
    itemId: 1,
    namaBarang: "Tripod Besar",
    peminjam: "agus@email.com",
    tanggalPinjam: "2025-09-18",
    tanggalKembali: "2025-09-21",
    status: "returned",
  },
];

// Data barang untuk stok
const items = [
  { id: 1, name: "Tripod Besar", jumlah: 2 },
  { id: 2, name: "Tripod Kecil", jumlah: 2 },
  { id: 6, name: "Webcam", jumlah: 1 },
];

const ITEMS_PER_PAGE = 5;

// --- SIMULASI ROLE (Ganti ke role user/admin_inventory/superadmin untuk testing) ---
const mockUser = { role: "admin_inventory" as "user" | "admin_inventory" | "superadmin" }; // <-- Ganti sesuai role yang mau di-test

// --- COMPONENT ---
export default function BorrowListPage() {
  // ⬇️ Semua hooks di paling atas!
  // (JANGAN TARUH return sebelum bagian ini!)
  const [borrows, setBorrows] = useState<BorrowItem[]>(initialBorrows);
  const [itemList, setItemList] = useState(items);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // FILTER & PAGINATION
  const filteredBorrows = borrows.filter(b =>
    b.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
    b.peminjam.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredBorrows.length / ITEMS_PER_PAGE));
  const pagedBorrows = filteredBorrows.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function handleReturn(borrowId: number) {
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    setBorrows(prev =>
      prev.map(b =>
        b.id === borrowId
          ? { ...b, status: "returned", tanggalKembali: today }
          : b
      )
    );
    const borrow = borrows.find(b => b.id === borrowId);
    if (borrow) {
      setItemList(prev =>
        prev.map(item =>
          item.id === borrow.itemId
            ? { ...item, jumlah: item.jumlah + 1 }
            : item
        )
      );
    }
    // TODO: update dashboard/statistic/API jika perlu
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  // ⬇️ Setelah semua hooks, baru boleh conditional rendering!
  const user = mockUser; // Ganti dengan context dari Auth kalau sudah ada

  if (!user) return <div>Loading...</div>;
  if (!["superadmin", "admin_inventory"].includes(user.role)) {
    return <div className="text-center text-lg mt-20">Anda tidak punya akses ke menu ini.</div>;
  }

  // --- Render Table ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Daftar Peminjaman Barang</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-black">Data Peminjaman</h2>
          <div className="flex flex-col items-start w-full md:w-auto">
            <label className="mb-1 font-semibold text-gray-800" htmlFor="search-peminjam">
              Cari Barang/Peminjam
            </label>
            <div className="relative w-full">
              <input
                id="search-peminjam"
                type="text"
                placeholder="Cari nama barang/peminjam..."
                value={search}
                onChange={handleSearch}
                className="border-2 border-blue-600 text-black px-10 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-64 placeholder-gray-400"
                autoComplete="off"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m16.5 16.5 4 4"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Nama Barang</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Peminjam</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Tanggal Pinjam</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Tanggal Kembali</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Status</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedBorrows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada data peminjaman.</td>
                </tr>
              ) : (
                pagedBorrows.map(borrow => (
                  <tr key={borrow.id} className="border-b last:border-none">
                    <td className="py-2 px-3 text-black font-medium">{borrow.namaBarang}</td>
                    <td className="py-2 px-3 text-black">{borrow.peminjam}</td>
                    <td className="py-2 px-3 text-center text-black">{borrow.tanggalPinjam}</td>
                    <td className="py-2 px-3 text-center text-black">
                      {borrow.status === "returned"
                        ? borrow.tanggalKembali
                        : ""}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {borrow.status === "returned" ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
                          Sudah Kembali
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-xs">
                          Dipinjam
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {borrow.status === "borrowed" ? (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          onClick={() => handleReturn(borrow.id)}
                        >
                          Kembalikan
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* PAGINATION */}
        <div className="flex justify-end items-center mt-4 gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
          >
            Previous
          </button>
          <span className="mx-2 text-gray-700 select-none">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
