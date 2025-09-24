"use client";
import React, { useState, useMemo } from "react";

// --- Dummy User Data & Role ---
type User = {
  id: number;
  email: string;
  password: string;
  role: "user" | "admin_inventory" | "superadmin";
};

const initialUsers: User[] = [
  { id: 1, email: "superadmin@email.com", password: "superpass", role: "superadmin" },
  { id: 2, email: "admin@email.com", password: "adminpass", role: "admin_inventory" },
  { id: 3, email: "user1@email.com", password: "userpass1", role: "user" },
  { id: 4, email: "user2@email.com", password: "userpass2", role: "user" },
];

// --- Simulasi role login ---
const mockUser = { role: "superadmin" as "superadmin" | "admin_inventory" | "user" };

const ROLES = [
  { value: "superadmin", label: "Superadmin" },
  { value: "admin_inventory", label: "Admin Inventory" },
  { value: "user", label: "User" },
];

const USERS_PER_PAGE = 5;

export default function UserManagementPage() {
  // Semua HOOKS wajib di paling atas!
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [modal, setModal] = useState<{ type: "add" | "edit", data?: User } | null>(null);

  // Search & Pagination
  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  const pagedUsers = filtered.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  // CRUD Handler
  function handleAdd(newUser: Omit<User, "id">) {
    setUsers((prev) => [
      ...prev,
      { ...newUser, id: Date.now() },
    ]);
  }
  function handleEdit(newUser: User) {
    setUsers((prev) =>
      prev.map((u) => (u.id === newUser.id ? newUser : u))
    );
  }
  function handleDelete(id: number) {
    if (window.confirm("Yakin ingin menghapus user ini?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  // Handler agar TIDAK error assignability
  function handleModalSubmit(user: User | Omit<User, "id">) {
    if ("id" in user) {
      handleEdit(user as User);
    } else {
      handleAdd(user as Omit<User, "id">);
    }
  }

  // Modal Form
function UserModal({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: User | Omit<User, "id">) => void;
  initial?: User;
}) {
  const [form, setForm] = useState<Omit<User, "id">>(
    initial
      ? { email: initial.email, password: initial.password, role: initial.role }
      : { email: "", password: "", role: "user" }
  );

  // Sync initial value on open
  React.useEffect(() => {
    if (initial)
      setForm({ email: initial.email, password: initial.password, role: initial.role });
    else setForm({ email: "", password: "", role: "user" });
  }, [initial, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded-xl shadow-md min-w-[350px] max-w-lg w-full">
        <h2 className="font-bold text-xl mb-4 text-gray-900">{initial ? "Edit" : "Tambah"} User</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (initial) {
              onSubmit({ ...form, id: initial.id });
            } else {
              onSubmit(form);
            }
            onClose();
          }}
          className="flex flex-col gap-3"
        >
          <input
            required
            type="email"
            placeholder="Email"
            className="border border-gray-300 px-3 py-2 rounded bg-white text-black placeholder-gray-400"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <input
            required
            type="password"
            placeholder="Password"
            className="border border-gray-300 px-3 py-2 rounded bg-white text-black placeholder-gray-400"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <div>
            <label className="block font-medium mb-1 text-gray-800">Role</label>
            <select
              required
              className="border border-gray-300 px-3 py-2 rounded w-full bg-white text-black"
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as User["role"],
                }))
              }
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 rounded px-4 py-2 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            >
              {initial ? "Update" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


  const user = mockUser; // Ganti dengan useAuth().user jika sudah ada auth context

  // Hanya superadmin yang bisa akses halaman ini
  if (!user || user.role !== "superadmin") {
    return (
      <div className="text-center text-lg mt-20">
        Anda tidak punya akses ke menu ini.
      </div>
    );
  }

  // --- Render table & modal ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Manajemen User</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-black">Daftar User</h2>
          <div className="flex flex-col items-start w-full md:w-auto">
            <label className="mb-1 font-semibold text-gray-800" htmlFor="search-user">
              Cari Email/Role
            </label>
            <div className="relative w-full">
              <input
                id="search-user"
                type="text"
                placeholder="Cari email atau role..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="border-2 border-blue-600 text-black px-10 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-64 placeholder-gray-400"
                autoComplete="off"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m16.5 16.5 4 4" />
                </svg>
              </span>
            </div>
          </div>
          <button
            className="bg-blue-600 text-white rounded-xl px-4 py-2 shadow"
            onClick={() => setModal({ type: "add" })}
          >
            + Tambah User
          </button>
        </div>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Email</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Role</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Password</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-none">
                    <td className="py-2 px-3 text-black">{u.email}</td>
                    <td className="py-2 px-3 text-black capitalize">{u.role.replace("_", " ")}</td>
                    <td className="py-2 px-3 text-black">{u.password}</td>
                    <td className="py-2 px-3 text-center flex gap-2 justify-center">
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                        onClick={() => setModal({ type: "edit", data: u })}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
      {/* MODAL */}
      {modal && (
        <UserModal
          open={!!modal}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
          initial={modal.type === "edit" ? modal.data : undefined}
        />
      )}
    </div>
  );
}
