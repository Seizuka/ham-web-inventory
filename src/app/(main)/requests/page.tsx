"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Toast from "../../../../components/Toast";

type Item = {
  id: number;
  name: string;
  merk: string;
  jumlah: number;
  lokasi: string;
  my_request?: { id: number; status: string; jumlah: number; };
};
type Request = {
  id: number;
  name: string;
  merk: string;
  jumlah: number;
  lokasi: string;
  requester_email: string;
};

const ITEMS_PER_PAGE = 5;

export default function RequestsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success"|"error" }>({ show: false, message: "", type: "success" });
  const [inputJumlah, setInputJumlah] = useState<{[key:number]:number}>({});

  // ===== FETCH DATA BY ROLE =====
  function fetchData() {
    if (!user) return;
    setLoading(true); setErr(null);
    fetch("/api/requests")
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(data => {
        if (user.role === "admin_inventory") setRequests(data);
        else setItems(data); // superadmin & user (item+my_request)
        setLoading(false);
      })
      .catch(() => { setErr("Gagal memuat data"); setLoading(false); });
  }

  useEffect(() => { fetchData(); }, [user]);
  useEffect(() => { if (toast.show) { const t = setTimeout(() => setToast(v=>({...v,show:false})), 2000); return ()=>clearTimeout(t); } }, [toast.show]);

  // ===== FILTER & PAGINATION =====
  const filtered = useMemo(() => {
    if (user?.role === "admin_inventory") {
      return requests.filter(req =>
        req.name?.toLowerCase().includes(search.toLowerCase()) ||
        req.merk?.toLowerCase().includes(search.toLowerCase()) ||
        (req.requester_email || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.merk.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, requests, search, user]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ===== ACTION HANDLER =====
  async function handlePinjam(item: Item) {
    if (!user) return;
    const jumlah = inputJumlah[item.id] ? inputJumlah[item.id] : 1;
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id, jumlah }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setToast({ show: true, message: msg.includes("Not enough stock") ? "Stok tidak cukup!" : "Gagal request.", type: "error" });
        return;
      }
      setToast({ show: true, message: "Request berhasil!", type: "success" });
      fetchData();
    } catch {
      setToast({ show: true, message: "Gagal request.", type: "error" });
    }
  }
  async function handleCancelRequest(reqId: number) {
    if (!user) return;
    try {
      const res = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId, action: "cancel" }),
      });
      if (!res.ok) {
        setToast({ show: true, message: "Gagal membatalkan request.", type: "error" });
        return;
      }
      setToast({ show: true, message: "Request dibatalkan!", type: "success" });
      fetchData();
    } catch {
      setToast({ show: true, message: "Gagal membatalkan request.", type: "error" });
    }
  }
  async function handleAdminAction(reqId: number, action: "accept"|"reject") {
    if (!user) return;
    try {
      const res = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId, action }),
      });
      if (!res.ok) {
        setToast({ show: true, message: `Gagal ${action === "accept" ? "approve" : "reject"}.`, type: "error" });
        return;
      }
      setToast({ show: true, message: `Berhasil ${action === "accept" ? "approve" : "reject"}!`, type: "success" });
      fetchData();
    } catch {
      setToast({ show: true, message: `Gagal ${action === "accept" ? "approve" : "reject"}.`, type: "error" });
    }
  }

  if (!user) return <div className="p-8">Loading user...</div>;
  return (
    <div className="p-8">
      <Toast {...toast} onClose={()=>setToast(v=>({...v,show:false}))}/>
      <h1 className="text-2xl font-bold mb-4 text-black">Request Barang</h1>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg text-black">Daftar Request Barang</h2>
          <input type="text" placeholder="Cari nama barang/peminjam" value={search}
            onChange={e=>setSearch(e.target.value)}
            className="border-2 border-blue-600 px-4 py-2 rounded-lg text-black placeholder-gray-400"/>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left border-b border-gray-300 text-black">Nama Barang</th>
                <th className="py-2 px-3 text-left border-b border-gray-300 text-black">Merk</th>
                <th className="py-2 px-3 text-center border-b border-gray-300 text-black">Jumlah</th>
                <th className="py-2 px-3 text-left border-b border-gray-300 text-black">Lokasi</th>
                {user.role === "admin_inventory" && (
                  <th className="py-2 px-3 text-left border-b border-gray-300 text-black">Requester</th>
                )}
                <th className="py-2 px-3 text-center border-b border-gray-300 text-black">Status</th>
                <th className="py-2 px-3 text-center border-b border-gray-300 text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={user.role==="admin_inventory"?7:6} className="py-8 text-center text-black">Loading...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={user.role==="admin_inventory"?7:6} className="py-8 text-center text-black">Tidak ada data.</td></tr>
              ) : user.role === "admin_inventory" ? (
                paged.map((req: any) => (
                  <tr key={req.id}>
                    <td className="py-2 px-3 text-black">{req.name}</td>
                    <td className="py-2 px-3 text-black">{req.merk}</td>
                    <td className="py-2 px-3 text-center text-black">{req.jumlah}</td>
                    <td className="py-2 px-3 text-black">{req.lokasi}</td>
                    <td className="py-2 px-3 text-black">{req.requester_email}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button className="bg-green-600 text-white rounded px-3 py-1 mr-2"
                        onClick={()=>handleAdminAction(req.id, "accept")}>Accept</button>
                      <button className="bg-red-600 text-white rounded px-3 py-1"
                        onClick={()=>handleAdminAction(req.id, "reject")}>Reject</button>
                    </td>
                  </tr>
                ))
              ) : (
                paged.map((item: Item) => {
                  const available = item.jumlah > 0;
                  return (
                    <tr key={item.id}>
                      <td className="py-2 px-3 text-black">{item.name}</td>
                      <td className="py-2 px-3 text-black">{item.merk}</td>
                      <td className="py-2 px-3 text-center text-black">{item.jumlah}</td>
                      <td className="py-2 px-3 text-black">{item.lokasi}</td>
                      <td className="py-2 px-3 text-center">
                        {item.my_request
                          ? <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                          : <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                            }`}>{available ? "Available" : "Not Available"}</span>
                        }
                      </td>
                      <td className="py-2 px-3 text-center">
                        {user.role === "superadmin" ? (
                          <span className="text-gray-400 text-xs italic">View Only</span>
                        ) : item.my_request ? (
                          <button
                            className="bg-red-600 text-white rounded px-3 py-1"
                            onClick={() => handleCancelRequest(item.my_request!.id)}
                          >Batal</button>
                        ) : available ? (
                          <div className="flex items-center gap-2 justify-center">
                            <input type="number" min={1} max={item.jumlah}
                              className="w-16 border-2 border-gray-600 rounded px-2 py-1 text-black"
                              value={inputJumlah[item.id]||1}
                              onChange={e => setInputJumlah(j=>({...j, [item.id]: Math.max(1, Math.min(item.jumlah, Number(e.target.value)||1))}))}
                            />
                            <button className="bg-blue-600 text-white rounded px-3 py-1"
                              onClick={()=>handlePinjam(item)}
                            >Pinjam</button>
                          </div>
                        ) : <span className="text-gray-400">Stok habis</span>}
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
          >Previous</button>
          <span className="mx-2 text-gray-700 select-none">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >Next</button>
        </div>
        {err && <div className="text-red-500 mt-4">{err}</div>}
      </div>
    </div>
  );
}
