"use client";
import React, { useState, useMemo } from "react";

// Tipe data untuk form & item
type ItemForm = {
  id?: number;
  name: string;
  merk: string;
  jumlah: number;
  label: string[];
  lokasi: string;
};

// DUMMY DATA awal
const initialItems: ItemForm[] = [
  {
    id: 1,
    name: "Tripod Besar",
    merk: "Costa",
    jumlah: 2,
    label: ["IT - KOMNAS HAM", "IT - KOMNAS HAM"],
    lokasi: "di atas lemari Mas Iyay",
  },
  {
    id: 2,
    name: "Tripod Kecil",
    merk: "Ausdom",
    jumlah: 2,
    label: ["-", "-"],
    lokasi: "Laci Bawah AC Nomor 1",
  },
  {
    id: 3,
    name: "Adapter mini HDMI to HDMI",
    merk: "Vention",
    jumlah: 2,
    label: ["I TI - KH", "II TI - KH"],
    lokasi: "Laci Bawah AC Nomor 1",
  },
  {
    id: 4,
    name: "Adapter micro HDMI to HDMI",
    merk: "Vention",
    jumlah: 3,
    label: ["I TI - KH", "II TI - KH", "III TI - KH"],
    lokasi: "Laci Bawah AC Nomor 1",
  },
  {
    id: 5,
    name: "Video Adapter",
    merk: "Vention",
    jumlah: 3,
    label: ["I TI - KH", "IT 2022", "TI"],
    lokasi: "Laci Bawah AC Nomor 1",
  },
  {
    id: 6,
    name: "Webcam",
    merk: "Logitech",
    jumlah: 1,
    label: ["-"],
    lokasi: "Laci Bawah AC Nomor 1",
  },
];

const INITIAL_LABELS = [
  "IT - KOMNAS HAM",
  "TI",
  "IT 2022",
  "I TI - KH",
  "II TI - KH",
  "III TI - KH",
  "-",
];

const ITEMS_PER_PAGE = 5;

export default function ItemsPage() {
  const [data, setData] = useState<ItemForm[]>(initialItems);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ type: "add" | "edit"; data?: ItemForm } | null>(null);

  const [allLabels, setAllLabels] = useState<string[]>(INITIAL_LABELS);

  // SEARCH & PAGINATION
  const filtered = useMemo(
    () =>
      data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, data]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagedItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  // CRUD HANDLER
  function handleAdd(newItem: ItemForm) {
    setData((prev) => [...prev, { ...newItem, id: Date.now() }]);
  }
  function handleEdit(newItem: ItemForm) {
    setData((prev) =>
      prev.map((item) => (item.id === newItem.id ? newItem : item))
    );
  }
  function handleDelete(id?: number) {
    if (window.confirm("Yakin ingin menghapus barang ini?")) {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
  }

  function handleAddNewLabel(label: string) {
    if (
      label.trim() &&
      !allLabels.map((l) => l.toLowerCase()).includes(label.trim().toLowerCase())
    ) {
      setAllLabels((prev) => [...prev, label.trim()]);
    }
  }

  function ItemModal({
    open,
    onClose,
    onSubmit,
    initial,
    allLabels,
    onAddNewLabel,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmit: (item: ItemForm) => void;
    initial?: ItemForm;
    allLabels: string[];
    onAddNewLabel: (label: string) => void;
  }) {
    const [form, setForm] = useState<ItemForm>(
      initial || { name: "", merk: "", jumlah: 1, label: [], lokasi: "" }
    );
    const [newLabel, setNewLabel] = useState("");

    React.useEffect(() => {
      if (initial) setForm(initial);
      else setForm({ name: "", merk: "", jumlah: 1, label: [], lokasi: "" });
    }, [initial, open]);

    function handleSelectLabel(e: React.ChangeEvent<HTMLSelectElement>) {
      const val = e.target.value;
      if (val && !form.label.includes(val)) {
        setForm((f: ItemForm) => ({ ...f, label: [...f.label, val] }));
      }
      e.target.selectedIndex = 0;
    }
    function removeLabel(i: number) {
      setForm((f: ItemForm) => ({
        ...f,
        label: f.label.filter((_, idx) => idx !== i),
      }));
    }
    function handleAddLabelManual() {
      if (
        newLabel.trim() &&
        !form.label.includes(newLabel.trim())
      ) {
        setForm((f: ItemForm) => ({
          ...f,
          label: [...f.label, newLabel.trim()],
        }));
        onAddNewLabel(newLabel.trim());
        setNewLabel("");
      }
    }

    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 min-w-[350px] max-w-lg w-full">
          <h2 className="font-bold text-xl mb-4 text-gray-900">
            {initial ? "Edit" : "Tambah"} Barang
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(form);
              onClose();
            }}
            className="flex flex-col gap-3"
          >
            <input
              required
              placeholder="Nama Barang"
              className="border border-gray-300 px-3 py-2 rounded bg-white text-black placeholder-gray-400"
              value={form.name}
              onChange={e =>
                setForm((f: ItemForm) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              required
              placeholder="Merk"
              className="border border-gray-300 px-3 py-2 rounded bg-white text-black placeholder-gray-400"
              value={form.merk}
              onChange={e =>
                setForm((f: ItemForm) => ({ ...f, merk: e.target.value }))
              }
            />
            <input
              required
              type="number"
              min={1}
              placeholder="Jumlah"
              className="border border-gray-300 px-3 py-2 rounded bg-white text-black placeholder-gray-400"
              value={form.jumlah}
              onChange={e =>
                setForm((f: ItemForm) => ({ ...f, jumlah: Number(e.target.value) }))
              }
            />
            {/* Label Section */}
            <div>
              <label className="block font-medium mb-1 text-gray-800">
                Label Barang
              </label>
              <select
                className="border border-gray-300 px-3 py-2 rounded w-full bg-white text-black"
                onChange={handleSelectLabel}
                value=""
              >
                <option value="" disabled>
                  Pilih label...
                </option>
                {allLabels
                  .filter((lbl) => !form.label.includes(lbl))
                  .map((lbl) => (
                    <option key={lbl} value={lbl}>
                      {lbl}
                    </option>
                  ))}
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.label.map((lbl: string, i: number) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center"
                  >
                    {lbl}
                    <button
                      type="button"
                      onClick={() => removeLabel(i)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Hapus label"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  placeholder="Tambah label baru..."
                  className="border border-gray-300 px-3 py-2 rounded flex-1 bg-white text-black"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={handleAddLabelManual}
                  disabled={!newLabel.trim()}
                >
                  Tambah
                </button>
              </div>
            </div>
            <input
              required
              placeholder="Lokasi"
              className="border border-gray-300 px-3 py-2 rounded bg-white text-black placeholder-gray-400"
              value={form.lokasi}
              onChange={e =>
                setForm((f: ItemForm) => ({ ...f, lokasi: e.target.value }))
              }
            />
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

  // ==== Render utama ====
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">List Barang</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* SEARCH BAR */}
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
            + Tambah Barang
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Nama Barang</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Merk</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Jumlah Unit</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Label</th>
                <th className="py-2 px-3 text-left text-gray-700 font-semibold border-b">Lokasi</th>
                <th className="py-2 px-3 text-center text-gray-700 font-semibold border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                pagedItems.map((item, i) => (
                  <tr key={item.id} className="border-b last:border-none">
                    <td className="py-2 px-3 font-medium text-black">{item.name}</td>
                    <td className="py-2 px-3 text-black">{item.merk}</td>
                    <td className="py-2 px-3 text-center text-black">{item.jumlah}</td>
                    <td className="py-2 px-3 text-black">{item.label.join(", ")}</td>
                    <td className="py-2 px-3 text-black">{item.lokasi}</td>
                    <td className="py-2 px-3 text-center flex gap-2 justify-center">
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                        onClick={() => setModal({ type: "edit", data: item })}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        onClick={() => handleDelete(item.id)}
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
        <ItemModal
          open={!!modal}
          onClose={() => setModal(null)}
          onSubmit={modal.type === "add" ? handleAdd : handleEdit}
          initial={modal.type === "edit" ? modal.data : undefined}
          allLabels={allLabels}
          onAddNewLabel={handleAddNewLabel}
        />
      )}
    </div>
  );
}
