import { NextResponse } from "next/server";
import { getUserByEmail, signToken } from "../../../../lib/auth";
import bcrypt from "bcryptjs"; // Tambahkan ini!

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await getUserByEmail(email);

    // Validasi login, pakai bcrypt.compare
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Hapus password_hash dari response user
    const { password_hash, ...userWithoutPassword } = user;
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({ user: userWithoutPassword });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
