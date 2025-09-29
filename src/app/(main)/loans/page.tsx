"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Toast from "../../../../components/Toast";

type LoanStatus = "borrowed" | "returned";
type Loan = {
  id: number;
  item_id: number;
  item_name: string;
  peminjam_email: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali?: string | null;
  status: LoanStatus;
};

const ITEMS_PER_PAGE = 5;

export default function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success"|"error" }>({ show: false, message: "", type: "success" });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  function fetchLoans() {
    setLoading(true);
    fetch("/api/loans")
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(data => { setLoans(data); setLoading(false); })
      .catch(() => { setLoans([]); setLoading(false); });
  }

  useEffect(() => { if (user) fetchLoans(); }, [user]);
  useEffect(() => { if (toast.show) { const t = setTimeout(() => setToast(v=>({...v,show:false})), 2000); return ()=>clearTimeout(t); } }, [toast.show]);

  // Filtering & pagination
  const filtered = loans.filter(l =>
    l.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.peminjam_email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagedLoans = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  async function handleReturn(loanId: number) {
    try {
      const res = await fetch("/api/loans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loan_id: loanId }),
      });
      if (!res.ok) {
        setToast({ show: true, message: "Gagal mengembalikan barang.", type: "error" });
        return;
      }
      setToast({ show: true, message: "Barang berhasil dikembalikan!", type: "success" });
      fetchLoans();
    } catch {
      setToast({ show: true, message: "Gagal mengembalikan barang.", type: "error" });
    }
  }

  if (!user) return <div>Loading...</div>;
  return (
    <div className="p-8">
      <Toast {...toast} onClose={()=>setToast(v=>({...v,show:false}))}/>
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
                onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Jumlah</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Tanggal Pinjam</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Tanggal Kembali</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Status</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-black">Loading...</td></tr>
              ) : pagedLoans.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada data peminjaman.</td></tr>
              ) : (
                pagedLoans.map(loan => (
                  <tr key={loan.id} className="border-b last:border-none">
                    <td className="py-2 px-3 text-black font-medium">{loan.item_name}</td>
                    <td className="py-2 px-3 text-black">{loan.peminjam_email}</td>
                    <td className="py-2 px-3 text-center text-black">{loan.jumlah}</td>
                    <td className="py-2 px-3 text-center text-black">
                      {loan.tanggal_pinjam ? loan.tanggal_pinjam.slice(0, 10) : "-"}
                    </td>
                    <td className="py-2 px-3 text-center text-black">
                      {(loan.status === "returned" && loan.tanggal_kembali)
                        ? loan.tanggal_kembali.slice(0, 10)
                        : ""}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {loan.status === "returned" ? (
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
                      {user.role === "user" && loan.status === "borrowed" && loan.peminjam_email === user.email ? (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          onClick={() => handleReturn(loan.id)}
                        >
                          Kembalikan
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          {loan.status === "borrowed" ? "-" : "Selesai"}
                        </span>
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
