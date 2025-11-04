import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getUserFromCookie } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

// GET profile detail (email, role, avatar)
export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const res = await query(`
    SELECT u.id, u.email, u.avatar_url, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `, [user.id]);
  if (!res.rows.length) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // Optional: Samakan format frontend, ubah avatar_url → avatarUrl
  const row = res.rows[0];
  return NextResponse.json({
    id: row.id,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role,
  });
}

// PUT: update avatar_url atau ganti password
export async function PUT(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Update avatar
  if (body.avatarUrl) {
    await query("UPDATE users SET avatar_url=$1 WHERE id=$2", [body.avatarUrl, user.id]);
    return NextResponse.json({ message: "Avatar updated" });
  }

  // Change password
  if (body.password && body.newPassword) {
    const userRes = await query("SELECT password_hash FROM users WHERE id=$1", [user.id]);
    if (!userRes.rows.length) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const match = await bcrypt.compare(body.password, userRes.rows[0].password_hash);
    if (!match) return NextResponse.json({ message: "Password lama salah" }, { status: 400 });

    const hash = await bcrypt.hash(body.newPassword, 10);
    await query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, user.id]);
    return NextResponse.json({ message: "Password updated" });
  }

  return NextResponse.json({ message: "No action" }, { status: 400 });
}
