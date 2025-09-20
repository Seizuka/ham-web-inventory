type Props = {
  name: string;
  stock: number;
};

export default function ItemCard({ name, stock }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">Stok tersedia: {stock}</p>
      <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
        Request
      </button>
    </div>
  );
}
