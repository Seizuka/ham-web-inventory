import { NextResponse } from "next/server";
import { getUserFromCookie } from "../../../../lib/auth";
import { query } from "../../../../lib/db";

// Get All Users
export async function GET() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  // Ambil users + role_name
  const res = await query(
    `SELECT users.id, users.email, users.role_id, roles.name AS role
     FROM users
     JOIN roles ON users.role_id = roles.id
     ORDER BY users.id`
  );
  return NextResponse.json(res.rows);
}

// Tambah User
export async function POST(req: Request) {
  const { email, password, role_id } = await req.json();
  // Validasi dsb, hash password dulu! (Untuk demo hash: password)
  await query(
    "INSERT INTO users (email, password_hash, role_id, created_at) VALUES ($1, $2, $3, NOW())",
    [email, password, role_id]
  );
  return NextResponse.json({ success: true });
}
