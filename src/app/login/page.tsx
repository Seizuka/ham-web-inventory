"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loginWithEmail, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    router.replace("/dashboard");
  }, [user, loading, router]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const success = await loginWithEmail(email, password);
      if (!success) {
        setError("Email atau password salah!");
      }
    } catch (err: any) {
      setError(
        err?.message === "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi."
          ? err.message
          : "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi."
      );
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login Sistem Peminjaman IT</h1>
        <label className="block mb-4">
          <span>Email</span>
          <input
            type="email"
            className="w-full mt-1 px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block mb-6">
          <span>Password</span>
          <input
            type="password"
            className="w-full mt-1 px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Masuk
        </button>
        <div className="mt-4 text-xs text-gray-500">
          {/* <b>Super Admin:</b> super@admin.com / super123<br />
          <b>Admin Inventory:</b> inventory@admin.com / admin123<br />
          <b>User:</b> user@user.com / user123 */}
        </div>
      </form>
    </div>
  );
}
