export default function Toast({ show, type, message, onClose }: { show: boolean, type: "success"|"error", message: string, onClose: () => void }) {
  if (!show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-3">×</button>
    </div>
  );
}
