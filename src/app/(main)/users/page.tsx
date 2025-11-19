"use client";
import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Type
type Role = { id: number; name: string };
type User = { id: number; email: string; role: string; role_id: number };

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  // HOOKS WAJIB DI ATAS, JANGAN ADA RETURN SEBELUMNYA
  const { user, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", password: "", role_id: 0 });
  const [saving, setSaving] = useState(false);

  // Redirect: pastikan semua hook dipanggil sebelum redirect
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "superadmin") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Fetch users dan roles hanya jika sudah superadmin
  useEffect(() => {
    if (!loading && user && user.role === "superadmin") {
      fetchUsers();
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const fetchUsers = () => {
    setTableLoading(true);
    fetch("/api/users")
      .then(res => res.json())
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setTableLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch users");
        setTableLoading(false);
      });
  };

  const fetchRoles = () => {
    fetch("/api/roles")
      .then(res => res.json())
      .then(json => setRoles(Array.isArray(json) ? json : []));
  };

  // Search filter
  const filteredData = Array.isArray(data)
    ? data.filter(
        u =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const pagedUsers = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  // Modal open/close
  const openAddModal = () => {
    setModalMode("add");
    setForm({ email: "", password: "", role_id: 0 });
    setModalOpen(true);
  };
  const openEditModal = (u: User) => {
    setModalMode("edit");
    setSelectedUser(u);
    setForm({ email: u.email, password: "", role_id: u.role_id });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      email: form.email,
      password: form.password,
      role_id: form.role_id,
    };

    try {
      if (modalMode === "add") {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else if (modalMode === "edit" && selectedUser) {
        await fetch(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      fetchUsers();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  // Delete user
  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }

  // Jangan pernah return sebelum semua hook dipanggil!
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user || user.role !== "superadmin") {
    // Render kosong agar urutan hooks tetap, redirect dilakukan oleh useEffect di atas
    return <></>;
  }

  // ----- UI -----
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Manajemen User</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* SEARCH BAR + Tambah User */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex flex-col items-start w-full md:w-auto">
            <label className="mb-1 font-semibold text-gray-800" htmlFor="search-user">
              Daftar User
            </label>
            <div className="relative w-full">
              <input
                id="search-user"
                type="text"
                placeholder="Cari email / role..."
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
          <button
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition"
            onClick={openAddModal}
          >
            Tambah User
          </button>
        </div>

        {/* TABLE */}
        {tableLoading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Email</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Role</th>
                  <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b w-40">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">Tidak ada data.</td>
                  </tr>
                ) : (
                  pagedUsers.map((u) => (
                    <tr key={u.id} className="border-b last:border-none">
                      <td className="py-2 px-3 text-black">{u.email}</td>
                      <td className="py-2 px-3">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <button
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded font-semibold mr-2"
                          onClick={() => openEditModal(u)}
                        >
                          Ubah
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-semibold"
                          onClick={() => handleDelete(u.id)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
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

      {/* MODAL TAMBAH/EDIT */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={closeModal}
        >
          <div
            className="relative bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-2 border-blue-600"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-blue-800">{modalMode === "add" ? "Tambah User" : "Edit User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-gray-800">Email:</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-gray-400 rounded px-3 py-2 text-black font-medium focus:border-blue-700 focus:ring-2 focus:ring-blue-200 transition"
                  required
                  disabled={modalMode === "edit"}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-800">
                  Password:
                  {modalMode === "edit" && (
                    <span className="text-gray-400 ml-2">(Kosongkan jika tidak ingin diganti)</span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border-2 border-gray-400 rounded px-3 py-2 text-black font-medium focus:border-blue-700 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder={modalMode === "edit" ? "Biarkan kosong jika tidak ingin diganti" : ""}
                  required={modalMode === "add"}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-800">Role:</label>
                <select
                  value={form.role_id}
                  onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}
                  className="w-full border-2 border-gray-400 rounded px-3 py-2 text-black font-medium focus:border-blue-700 focus:ring-2 focus:ring-blue-200 transition"
                  required
                  disabled={modalMode === "edit"}
                >
                  <option value={0}>Pilih Role</option>
                  {roles.map(role => (
                    <option value={role.id} key={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                  disabled={saving}
                >
                  {modalMode === "add" ? "Tambah" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
