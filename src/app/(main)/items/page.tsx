"use client";
import React, { useState, useMemo } from "react";

// 1. DEFINISI TYPE untuk barang dan form
type Item = {
  id: number;
  name: string;
  merk: string;
  jumlah: number;
  label: string[];
  lokasi: string;
};
type ItemForm = Omit<Item, "id">;

// 2. Dummy Data
const initialItems: Item[] = [
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

const ITEMS_PER_PAGE = 5;

export default function ItemsPage() {
  const [data, setData] = useState<Item[]>(initialItems);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [modal, setModal] = useState<{ type: "add" | "edit", data?: Item } | null>(null);

  // SEARCH & PAGINATION
  const filtered = useMemo(() => {
    return data.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pagedItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  // CRUD HANDLER
  function handleAdd(newItem: ItemForm) {
    setData(prev => [
      ...prev,
      { ...newItem, id: Date.now() }
    ]);
  }
  function handleEdit(newItem: Item) {
    setData(prev => prev.map(item => item.id === newItem.id ? newItem : item));
  }
  function handleDelete(id: number) {
    if (window.confirm("Yakin ingin menghapus barang ini?")) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  }

  // FORM MODAL COMPONENT
  function ItemModal({ open, onClose, onSubmit, initial }: {
    open: boolean,
    onClose: () => void,
    onSubmit: (item: any) => void,
    initial?: Item
  }) {
    const [form, setForm] = useState<ItemForm>(
      initial
        ? { ...initial }
        : { name: "", merk: "", jumlah: 1, label: [""], lokasi: "" }
    );

    // Sync initial value on open
    React.useEffect(() => {
      if (initial) setForm({ ...initial });
      else setForm({ name: "", merk: "", jumlah: 1, label: [""], lokasi: "" });
    }, [initial, open]);

    function handleLabelChange(i: number, val: string) {
      setForm((f: ItemForm) => {
        const label = [...f.label];
        label[i] = val;
        return { ...f, label };
      });
    }

    function addLabel() {
      setForm((f: ItemForm) => ({ ...f, label: [...f.label, ""] }));
    }

    function removeLabel(i: number) {
      setForm((f: ItemForm) => ({ ...f, label: f.label.filter((_, idx) => idx !== i) }));
    }

    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-6 rounded-xl shadow-md min-w-[350px] max-w-lg w-full">
          <h2 className="font-bold text-xl mb-4">{initial ? "Edit" : "Tambah"} Barang</h2>
          <form onSubmit={e => {
            e.preventDefault();
            onSubmit(initial ? { ...form, id: initial.id } : form);
            onClose();
          }} className="flex flex-col gap-3">
            <input required placeholder="Nama Barang" className="border px-3 py-2 rounded" value={form.name} onChange={e => setForm((f: ItemForm) => ({ ...f, name: e.target.value }))} />
            <input required placeholder="Merk" className="border px-3 py-2 rounded" value={form.merk} onChange={e => setForm((f: ItemForm) => ({ ...f, merk: e.target.value }))} />
            <input required type="number" min={1} placeholder="Jumlah" className="border px-3 py-2 rounded" value={form.jumlah} onChange={e => setForm((f: ItemForm) => ({ ...f, jumlah: Number(e.target.value) }))} />
            <div>
              <label className="block font-medium mb-1">Label</label>
              {form.label.map((val: string, i: number) => (
                <div className="flex gap-2 mb-1" key={i}>
                  <input className="border px-3 py-2 rounded flex-1" value={val} onChange={e => handleLabelChange(i, e.target.value)} />
                  {form.label.length > 1 &&
                    <button type="button" onClick={() => removeLabel(i)} className="px-2 text-red-600">✕</button>
                  }
                </div>
              ))}
              <button type="button" onClick={addLabel} className="text-blue-600 text-xs mt-1">+ Tambah Label</button>
            </div>
            <input required placeholder="Lokasi" className="border px-3 py-2 rounded" value={form.lokasi} onChange={e => setForm((f: ItemForm) => ({ ...f, lokasi: e.target.value }))} />
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={onClose} className="bg-gray-100 rounded px-4 py-2">Batal</button>
              <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">{initial ? "Update" : "Tambah"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m16.5 16.5 4 4"/>
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
                  <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada data.</td>
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

      {/* MODAL */}
      {modal &&
        <ItemModal
          open={!!modal}
          onClose={() => setModal(null)}
          onSubmit={modal.type === "add" ? handleAdd : handleEdit}
          initial={modal.type === "edit" ? modal.data : undefined}
        />
      }
    </div>
  );
}
