import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "../../../../lib/auth";
import { query } from "../../../../lib/db";

// Helper: Ambil semua items + labels
async function getAllItemsWithLabels() {
  const itemsRes = await query(`
    SELECT i.id, i.name, i.merk, i.jumlah, i.lokasi, i.created_at, 
      ARRAY_REMOVE(ARRAY_AGG(il.label ORDER BY il.label), NULL) AS label
    FROM items i
    LEFT JOIN item_labels il ON il.item_id = i.id
    GROUP BY i.id
    ORDER BY i.id ASC
  `);
  return itemsRes.rows.map((row: any) => ({
    ...row,
    label: row.label.filter((l: string) => l && l !== "-"),
  }));
}

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // Semua role boleh GET
  const rows = await getAllItemsWithLabels();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "admin_inventory")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { name, merk, jumlah, label, lokasi } = await req.json();
  const itemRes = await query(
    "INSERT INTO items (name, merk, jumlah, lokasi, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
    [name, merk, jumlah, lokasi]
  );
  const item = itemRes.rows[0];
  // Insert ke item_labels
  if (Array.isArray(label)) {
    for (const l of label) {
      await query("INSERT INTO item_labels (item_id, label) VALUES ($1, $2)", [item.id, l]);
    }
  }
  const data = await getAllItemsWithLabels();
  return NextResponse.json(data.find(i => i.id === item.id));
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "admin_inventory")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { id, name, merk, jumlah, label, lokasi } = await req.json();
  await query(
    "UPDATE items SET name=$1, merk=$2, jumlah=$3, lokasi=$4 WHERE id=$5",
    [name, merk, jumlah, lokasi, id]
  );
  // Hapus semua label lama, insert yang baru
  await query("DELETE FROM item_labels WHERE item_id=$1", [id]);
  if (Array.isArray(label)) {
    for (const l of label) {
      await query("INSERT INTO item_labels (item_id, label) VALUES ($1, $2)", [id, l]);
    }
  }
  const data = await getAllItemsWithLabels();
  return NextResponse.json(data.find(i => i.id === id));
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "admin_inventory")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  await query("DELETE FROM item_labels WHERE item_id=$1", [id]);
  await query("DELETE FROM items WHERE id=$1", [id]);
  return NextResponse.json({ message: "Deleted" });
}
