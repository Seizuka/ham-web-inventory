"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";

type ProfileData = {
  id: string;
  email: string;
  avatarUrl?: string;
  role: string;
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatar, setAvatar] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password & visibility toggle
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [msgColor, setMsgColor] = useState("text-green-700");
  const [loading, setLoading] = useState(false);

  // GET profile dari API (selalu fresh)
  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal load profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data.user || data); // handle {user: {}} & direct data
        setAvatar(data.user?.avatarUrl || data.avatarUrl || "");
      })
      .catch(() => setProfile(null));
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setAvatar(base64);
      try {
        setLoading(true);
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: base64 }),
        });
        if (!res.ok) throw new Error(await res.text());
        setMessage("Avatar berhasil diupdate!");
        setMsgColor("text-green-700");
        // Refresh profile info setelah update avatar
        const newProfile = await fetch("/api/profile").then(r => r.json());
        setProfile(newProfile.user || newProfile);
        if (typeof refreshUser === "function") refreshUser();
      } catch {
        setMessage("Gagal update avatar");
        setMsgColor("text-red-700");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMsgColor("text-green-700");
    if (newPassword.length < 4) {
      setMessage("Password baru minimal 4 karakter.");
      setMsgColor("text-red-700");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Password baru & konfirmasi tidak sama.");
      setMsgColor("text-red-700");
      return;
    }
    try {
      setLoading(true);
      // ONLY SEND password + newPassword (tidak gabung avatarUrl)
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          newPassword,
        }),
      });
      // Cek error response
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data?.message || "Gagal update password");
      setMessage("Password berhasil diubah!");
      setMsgColor("text-green-700");
      setPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setMessage(err?.message || "Gagal update password");
      setMsgColor("text-red-700");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-6">User tidak ditemukan.</div>;

  const readonlyInput =
    "w-full border-2 border-gray-300 rounded px-3 py-2 text-black bg-gray-100 cursor-not-allowed";
  const editableInput =
    "w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2 bg-white text-black transition pr-12";

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
        <h1 className="text-2xl font-bold mb-6 text-black">Akun Profil</h1>
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
              disabled={loading}
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
            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold text-sm text-gray-700">Email</label>
              <input
                className={readonlyInput}
                value={profile.email}
                disabled
                readOnly
              />
            </div>
            {/* Role */}
            <div className="mb-6">
              <label className="block mb-1 font-semibold text-sm text-gray-700">Role</label>
              <input
                className={readonlyInput + " capitalize"}
                value={profile.role}
                disabled
                readOnly
              />
            </div>
            <hr className="mb-6" />
            {/* Change password form */}
            <form onSubmit={handleChangePassword}>
              {/* Password Lama */}
              <label className="block mb-1 font-semibold text-sm text-gray-700">Password Lama</label>
              <div className="relative mb-4">
                <input
                  className={editableInput}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password lama"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Sembunyikan" : "Lihat"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Password Baru */}
              <label className="block mb-1 font-semibold text-sm text-gray-700">Password Baru</label>
              <div className="relative mb-4">
                <input
                  className={editableInput}
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword(v => !v)}
                  aria-label={showNewPassword ? "Sembunyikan" : "Lihat"}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Konfirmasi Password Baru */}
              <label className="block mb-1 font-semibold text-sm text-gray-700">Konfirmasi Password Baru</label>
              <div className="relative mb-6">
                <input
                  className={editableInput}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? "Sembunyikan" : "Lihat"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-900 transition"
                disabled={loading}
              >
                Ganti Password
              </button>
              {message && <div className={"mt-3 text-sm text-center " + msgColor}>{message}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
