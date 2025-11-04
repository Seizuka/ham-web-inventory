import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import bcrypt from "bcrypt";

// Helper universal context
async function getParams(contextOrPromise: any) {
  // Jika context adalah Promise, tunggu, jika bukan, langsung return
  return typeof contextOrPromise.then === "function"
    ? (await contextOrPromise).params
    : contextOrPromise.params;
}

// PUT: Update user (hash password jika diisi)
export async function PUT(req: Request, context: any) {
  const params = await getParams(context);
  const id = params.id;
  const { email, password, role_id } = await req.json();

  if (password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await query(
      "UPDATE users SET email = $1, password_hash = $2, role_id = $3 WHERE id = $4",
      [email, hashedPassword, role_id, id]
    );
  } else {
    await query(
      "UPDATE users SET email = $1, role_id = $2 WHERE id = $3",
      [email, role_id, id]
    );
  }
  return NextResponse.json({ success: true });
}

// DELETE: Delete user
export async function DELETE(req: Request, context: any) {
  const params = await getParams(context);
  const id = params.id;
  await query("DELETE FROM users WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
