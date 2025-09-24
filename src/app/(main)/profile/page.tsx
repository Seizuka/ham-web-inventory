"use client";
import { useAuth } from "../../../../contexts/AuthContext";
import { useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [avatar, setAvatar] = useState<string>(user?.avatarUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setMessage("Password baru minimal 4 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Password baru & konfirmasi tidak sama.");
      return;
    }
    setMessage("Password berhasil diubah! (dummy, tidak update backend)");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!user) return <div className="p-6">User tidak ditemukan.</div>;

  // Class input untuk view-only dan edit field
  const readonlyInput =
    "w-full border-2 border-gray-300 rounded px-3 py-2 text-black bg-gray-100 cursor-not-allowed";
  const editableInput =
    "w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2 bg-white text-black transition";

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white rounded shadow px-8 py-8 mt-8">
        {/* TOMBOL BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-800 font-bold text-lg mb-5 px-4 py-2 rounded-lg
              hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400
              transition-colors duration-150 shadow-sm border border-transparent hover:border-blue-200"
          type="button"
        >
          <ArrowLeft size={26} />
          Kembali
        </button>

        <h1 className="text-2xl font-bold mb-6 text-black">Profile Account</h1>
        <div className="flex gap-8 items-start flex-col md:flex-row">
          {/* AVATAR */}
          <div className="flex flex-col items-center md:w-1/3 w-full mb-6 md:mb-0">
            <div className="mb-3">
              <img
                src={avatar || "/default-avatar.png"}
                alt="avatar"
                className="rounded-full border w-24 h-24 object-cover bg-gray-200"
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Ganti Avatar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* FORM */}
          <div className="flex-1 w-full">
            {/* Nama */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-sm text-gray-700">Nama</label>
              <input
                className={readonlyInput}
                value={user.name}
                disabled
                readOnly
              />
            </div>
            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-sm text-gray-700">Email</label>
              <input
                className={readonlyInput}
                value={user.email}
                disabled
                readOnly
              />
            </div>
            {/* Role */}
            <div className="mb-6">
              <label className="block mb-1 font-semibold text-sm text-gray-700">Role</label>
              <input
                className={readonlyInput + " capitalize"}
                value={user.role}
                disabled
                readOnly
              />
            </div>
            <hr className="mb-6" />

            {/* Change password form */}
            <form onSubmit={handleChangePassword}>
              <label className="block mb-1 font-semibold text-sm text-gray-700">Password Lama</label>
              <input
                className={editableInput + " mb-4"}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password lama"
                autoComplete="current-password"
              />

              <label className="block mb-1 font-semibold text-sm text-gray-700">Password Baru</label>
              <input
                className={editableInput + " mb-4"}
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Password baru"
                autoComplete="new-password"
              />

              <label className="block mb-1 font-semibold text-sm text-gray-700">Konfirmasi Password Baru</label>
              <input
                className={editableInput + " mb-6"}
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                autoComplete="new-password"
              />

              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-900 transition"
              >
                Ganti Password
              </button>
              {message && <div className="mt-3 text-sm text-center text-green-700">{message}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
