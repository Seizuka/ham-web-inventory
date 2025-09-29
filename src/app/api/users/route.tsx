import { NextResponse } from "next/server";
import { getUserFromCookie } from "../../../../lib/auth";
import { query } from "../../../../lib/db";
import bcrypt from "bcrypt";

// GET: List all users
export async function GET() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const res = await query(
    `SELECT users.id, users.email, users.role_id, roles.name AS role
     FROM users
     JOIN roles ON users.role_id = roles.id
     ORDER BY users.id`
  );
  return NextResponse.json(res.rows);
}

// POST: Add new user (hash password!)
export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, password, role_id } = await req.json();
  // Validasi
  if (!email || !password || !role_id) {
    return NextResponse.json({ error: "Semua field wajib diisi!" }, { status: 400 });
  }

  // Cek jika email sudah ada
  const check = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (check.rows.length > 0) {
    return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
  }

  // Hash password!
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await query(
    "INSERT INTO users (email, password_hash, role_id, created_at) VALUES ($1, $2, $3, NOW())",
    [email, hashedPassword, role_id]
  );
  return NextResponse.json({ success: true });
}
