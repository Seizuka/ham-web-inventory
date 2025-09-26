"use client";
import { useAuth } from "../../../../contexts/AuthContext";
import { useEffect, useState } from "react";

type RequestItem = {
  id: number;
  nama_barang: string;
  merk: string;
  jumlah: number;
  label: string;
  lokasi: string;
  requester: string;
  requester_email: string;
  status: "Pending" | "Accepted" | "Rejected";
};

const ITEMS_PER_PAGE = 5;

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<RequestItem[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Fetch requests
  const fetchRequests = () => {
    setTableLoading(true);
    fetch("/api/requests")
      .then(res => res.json())
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setTableLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch requests");
        setTableLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Search + paging
  const filtered = data.filter(
    (r) =>
      r.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
      r.requester.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // --- Action Handlers ---
  const handlePinjam = async (id: number) => {
    // implement logic pinjam
    await fetch(`/api/requests/${id}/pinjam`, { method: "POST" });
    fetchRequests();
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Batalkan request ini?")) return;
    await fetch(`/api/requests/${id}/cancel`, { method: "POST" });
    fetchRequests();
  };

  const handleAccept = async (id: number) => {
    await fetch(`/api/requests/${id}/accept`, { method: "POST" });
    fetchRequests();
  };

  const handleReject = async (id: number) => {
    if (!confirm("Tolak request ini?")) return;
    await fetch(`/api/requests/${id}/reject`, { method: "POST" });
    fetchRequests();
  };

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  // --- UI Table Action ---
  function renderAction(r: RequestItem) {
    // Superadmin: view only
    if (user?.role === "superadmin") return <span className="text-gray-500">View only</span>;
    // Inventory Admin: Accept/Reject button jika Pending
    if (user?.role === "admin_inventory") {
      if (r.status === "Pending") {
        return (
          <div className="flex gap-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => handleAccept(r.id)}
            >
              Accept
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => handleReject(r.id)}
            >
              Reject
            </button>
          </div>
        );
      }
      return <span className="text-gray-400">View only</span>;
    }
    // User: Pinjam atau Cancel (hanya milik sendiri, dan belum Accepted/Rejected)
    if (user?.role === "user") {
      if (r.status === "Pending" && r.requester_email === user.email) {
        return (
          <div className="flex gap-2">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => handleCancel(r.id)}
            >
              Cancel
            </button>
          </div>
        );
      }
      if (r.status === "Pending") {
        return (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            onClick={() => handlePinjam(r.id)}
          >
            Pinjam
          </button>
        );
      }
      return <span className="text-gray-400">View only</span>;
    }
    // Default fallback
    return <span className="text-gray-400">View only</span>;
  }

  // --- UI ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Request Barang</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-black">Daftar Request Barang</h2>
          </div>
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
        {/* Table */}
        {tableLoading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Nama Barang</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Merk</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Jumlah</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Label</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Lokasi</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Requester</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Status</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">Tidak ada data.</td>
                  </tr>
                ) : (
                  paged.map((r) => (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 px-3">{r.nama_barang}</td>
                      <td className="py-2 px-3">{r.merk}</td>
                      <td className="py-2 px-3">{r.jumlah}</td>
                      <td className="py-2 px-3">{r.label}</td>
                      <td className="py-2 px-3">{r.lokasi}</td>
                      <td className="py-2 px-3">{r.requester}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs
                          ${r.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.status === "Accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">{renderAction(r)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
