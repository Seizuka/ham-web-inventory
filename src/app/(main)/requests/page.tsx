"use client";
import React, { useState } from "react";

// Simulasi Auth
const mockUser = { role: "superadmin" as "user" | "admin_inventory" | "superadmin" }; // ganti role untuk test

// Dummy request data
type RequestStatus = "pending" | "accepted" | "rejected";
type RequestBarang = {
  id: number;
  itemName: string;
  merk: string;
  jumlah: number;
  label: string;
  lokasi: string;
  requester: string;
  status: RequestStatus;
};
const initialRequests: RequestBarang[] = [
  {
    id: 1,
    itemName: "Tripod Besar",
    merk: "Costa",
    jumlah: 1,
    label: "IT - KOMNAS HAM",
    lokasi: "di atas lemari Mas Iyay",
    requester: "Budi",
    status: "pending",
  },
  {
    id: 2,
    itemName: "Adapter mini HDMI to HDMI",
    merk: "Vention",
    jumlah: 1,
    label: "I TI - KH",
    lokasi: "Laci Bawah AC Nomor 1",
    requester: "Siti",
    status: "pending",
  },
  {
    id: 3,
    itemName: "Webcam",
    merk: "Logitech",
    jumlah: 1,
    label: "-",
    lokasi: "Laci Bawah AC Nomor 1",
    requester: "Eka",
    status: "accepted",
  },
  {
    id: 4,
    itemName: "Video Adapter",
    merk: "Vention",
    jumlah: 1,
    label: "TI",
    lokasi: "Laci Bawah AC Nomor 1",
    requester: "Deni",
    status: "rejected",
  },
];

const ITEMS_PER_PAGE = 5;

export default function RequestBarangPage() {
  // --- Semua hooks di atas! ---
  const [requests, setRequests] = useState<RequestBarang[]>(initialRequests);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  // FILTER + PAGINATION
  const filtered = requests.filter(req =>
    req.itemName.toLowerCase().includes(search.toLowerCase()) ||
    req.requester.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagedRequests = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleAccept(id: number) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "accepted" } : r));
    // TODO: Call API accept here
  }
  function handleReject(id: number) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
    // TODO: Call API reject here
  }
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  const user = mockUser; // ganti ke AuthContext jika sudah ada

  // Hanya role superadmin/admin_inventory yang bisa akses halaman ini
  if (!user) return <div>Loading...</div>;
  if (!["superadmin", "admin_inventory"].includes(user.role)) {
    return <div className="text-center text-lg mt-20">Anda tidak punya akses ke menu ini.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Request Barang</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-black">Daftar Request Barang</h2>
          <div className="flex flex-col items-start w-full md:w-auto">
            <label className="mb-1 font-semibold text-gray-800" htmlFor="search-barang">
              Cari Nama Barang/Peminjam
            </label>
            <div className="relative w-full">
              <input
                id="search-barang"
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
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Merk</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Jumlah</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Label</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Lokasi</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Requester</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Status</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Tidak ada data.</td>
                </tr>
              ) : (
                pagedRequests.map((req) => (
                  <tr key={req.id} className="border-b last:border-none">
                    <td className="py-2 px-3 font-medium text-black">{req.itemName}</td>
                    <td className="py-2 px-3 text-black">{req.merk}</td>
                    <td className="py-2 px-3 text-center text-black">{req.jumlah}</td>
                    <td className="py-2 px-3 text-black">{req.label}</td>
                    <td className="py-2 px-3 text-black">{req.lokasi}</td>
                    <td className="py-2 px-3 text-black">{req.requester}</td>
                    <td className="py-2 px-3 text-center">
                      {req.status === "accepted" && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">Accepted</span>}
                      {req.status === "rejected" && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs">Rejected</span>}
                      {req.status === "pending" && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-xs">Pending</span>}
                    </td>
                    <td className="py-2 px-3 text-center flex gap-2 justify-center">
                      {user.role === "admin_inventory" && req.status === "pending" ? (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            onClick={() => handleAccept(req.id)}
                          >Accept</button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            onClick={() => handleReject(req.id)}
                          >Reject</button>
                        </>
                      ) : user.role === "superadmin" ? (
                        // superadmin: hanya bisa lihat, tidak ada tombol!
                        <span className="text-gray-400 text-xs italic">View only</span>
                      ) : null}
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
