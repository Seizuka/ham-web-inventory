'use client';

const items = [
  { name: 'Laptop Lenovo', stock: 5 },
  { name: 'Proyektor Epson', stock: 2 },
  { name: 'Kabel HDMI', stock: 15 },
];

export default function ItemsPage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Kelola Barang</h1>
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Nama Barang</th>
              <th className="px-4 py-2 border">Stok</th>
              <th className="px-4 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.stock}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
