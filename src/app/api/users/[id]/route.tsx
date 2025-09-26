import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { email, password, role_id } = await req.json();
  if (password) {
    // Ganti password juga
    await query(
      "UPDATE users SET email = $1, password_hash = $2, role_id = $3 WHERE id = $4",
      [email, password, role_id, id]
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await query("DELETE FROM users WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
