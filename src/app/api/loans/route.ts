import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getUserFromCookie } from "../../../../lib/auth";

// GET loans: role-based
export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let sql = `
    SELECT l.*, i.name as item_name, u.email as peminjam_email
    FROM loans l
    JOIN items i ON i.id = l.item_id
    JOIN users u ON u.id = l.user_id
  `;
  let params: any[] = [];
  if (user.role === "user") {
    sql += " WHERE l.user_id = $1";
    params = [user.id];
  }
  sql += " ORDER BY l.id DESC";

  const { rows } = await query(sql, params);
  return NextResponse.json(rows);
}

// PUT: Pengembalian barang (user only untuk pinjaman miliknya sendiri)
export async function PUT(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { loan_id } = body;

  const loanRes = await query("SELECT * FROM loans WHERE id = $1", [loan_id]);
  if (!loanRes.rows.length) return NextResponse.json({ message: "Loan not found" }, { status: 404 });
  const loan = loanRes.rows[0];

  if (user.role === "user" && loan.user_id !== user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (loan.status === "returned") {
    return NextResponse.json({ message: "Loan already returned" }, { status: 400 });
  }

  await query(`UPDATE loans SET status='returned', tanggal_kembali=NOW() WHERE id=$1`, [loan_id]);
  await query(`UPDATE items SET jumlah = jumlah + $1 WHERE id = $2`, [loan.jumlah, loan.item_id]);
  return NextResponse.json({ message: "Barang sudah dikembalikan!" });
}
