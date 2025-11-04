import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// Ambil semua label unik
export async function GET() {
  const res = await query("SELECT DISTINCT label FROM item_labels ORDER BY label ASC");
  return NextResponse.json(res.rows.map(r => r.label));
}

// Tambah label baru ke DB (opsional: ke master label)
export async function POST(req: NextRequest) {
  const { label } = await req.json();
  if (!label || !label.trim()) return NextResponse.json({ message: "Label kosong" }, { status: 400 });

  // Pastikan label belum ada (case-insensitive)
  const exist = await query("SELECT 1 FROM item_labels WHERE LOWER(label) = LOWER($1)", [label]);
  if (exist.rows.length) return NextResponse.json({ message: "Label sudah ada" }, { status: 409 });

  // Insert ke tabel (tanpa item_id, hanya master)
  await query("INSERT INTO item_labels(label) VALUES($1)", [label]);
  return NextResponse.json({ message: "Label berhasil ditambah", label });
}
