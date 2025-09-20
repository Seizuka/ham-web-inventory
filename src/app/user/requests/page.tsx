export default function UserRequests() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Permintaan Saya</h1>
        <table className="min-w-full border bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Barang</th>
              <th className="px-4 py-2 border">Tanggal</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="border px-4 py-2">Laptop Lenovo</td>
              <td className="border px-4 py-2">2025-09-01</td>
              <td className="border px-4 py-2">Menunggu</td>
              <td className="border px-4 py-2">
                <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                  Batalkan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
