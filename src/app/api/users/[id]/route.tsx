import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import bcrypt from "bcrypt";

// PUT: Update user (hash password jika diisi)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { email, password, role_id } = await req.json();

  if (password) {
    // Hash password jika ada perubahan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await query(
      "UPDATE users SET email = $1, password_hash = $2, role_id = $3 WHERE id = $4",
      [email, hashedPassword, role_id, id]
    );
  } else {
    // Tanpa ubah password
    await query(
      "UPDATE users SET email = $1, role_id = $2 WHERE id = $3",
      [email, role_id, id]
    );
  }
  return NextResponse.json({ success: true });
}

// DELETE: Delete user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await query("DELETE FROM users WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
