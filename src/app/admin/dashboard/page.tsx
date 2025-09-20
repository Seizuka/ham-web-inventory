"use client";
import { useAuth } from "../../../../contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2 text-black">Admin Dashboard</h1>
      <p className="text-black">
        Selamat datang, <b>{user?.name}</b>! (Role: <span className="capitalize">{user?.role}</span>)
      </p>
    </div>
  );
}
