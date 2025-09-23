"use client";
import { useAuth } from "../../../../contexts/AuthContext";
import { useState } from "react";

// Dummy data (boleh diganti dari API/DB)
const items = [
  { name: "Laptop Dell", stock: 10 },
  { name: "Monitor Samsung", stock: 2 },
  { name: "Mouse Logitech", stock: 1 },
  { name: "Kabel HDMI", stock: 0 },
  { name: "Keyboard Lenovo", stock: 5 },
  { name: "Headset Sony", stock: 3 },
  { name: "Flashdisk 16GB", stock: 6 },
  { name: "Webcam Logitech", stock: 0 },
  { name: "Proyektor Epson", stock: 7 },
  { name: "Speaker JBL", stock: 1 },
];

function getStatus(stock: number) {
  if (stock >= 5) return { text: `${stock} available`, color: "bg-green-100 text-green-700" };
  if (stock > 0) return { text: `${stock} left`, color: "bg-yellow-100 text-yellow-800" };
  return { text: "Not Available", color: "bg-red-100 text-red-700" };
}

const ITEMS_PER_PAGE = 5;

export default function DashboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Search & Pagination logic
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const pagedItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page ke 1 saat search berubah
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Dashboard</h1>
      <div className="mb-8">
        <p className="text-base text-gray-700">
          Selamat datang, <b className="capitalize">{user?.name}</b>! Role: <span className="capitalize">{user?.role}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* SEARCH BAR LEBIH JELAS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-black">Daftar Barang</h2>
          <div className="flex flex-col items-start w-full md:w-auto">
            <label className="mb-1 font-semibold text-gray-800" htmlFor="search-barang">
              Cari Barang
            </label>
            <div className="relative w-full">
              <input
                id="search-barang"
                type="text"
                placeholder="Cari nama barang..."
                value={search}
                onChange={handleSearch}
                className="border-2 border-blue-600 text-black px-10 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-64 placeholder-gray-400"
                autoComplete="off"
              />
              {/* Kaca pembesar */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m16.5 16.5 4 4"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Nama Barang</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Total Barang</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">Tidak ada data.</td>
                </tr>
              ) : (
                pagedItems.map((item, i) => {
                  const status = getStatus(item.stock);
                  return (
                    <tr key={i} className="border-b last:border-none">
                      <td className="py-2 px-3 font-medium text-black">{item.name}</td>
                      <td className="py-2 px-3 text-black">{item.stock}</td>
                      <td className="py-2 px-3">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </button>
          <span className="mx-2 text-gray-700 select-none">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
