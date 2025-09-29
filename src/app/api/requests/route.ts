import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "../../../../lib/auth";
import { query } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // User
  if (user.role === "user") {
    const itemsRes = await query("SELECT id, name, merk, jumlah, lokasi FROM items ORDER BY id ASC");
    const items = itemsRes.rows;
    const reqs = await query("SELECT * FROM requests WHERE user_id=$1 ORDER BY id DESC", [user.id]);
    const userRequests = reqs.rows;
    const results = items.map(item => {
      const req = userRequests.find(r => r.item_id === item.id && r.status === "Pending");
      return { ...item, my_request: req || null };
    });
    return NextResponse.json(results);
  }

  // Admin Inventory
  if (user.role === "admin_inventory") {
    const res = await query(`
      SELECT r.*, u.email as requester_email, i.name, i.merk, i.lokasi, i.jumlah as item_jumlah
      FROM requests r
      JOIN users u ON u.id = r.user_id
      JOIN items i ON i.id = r.item_id
      WHERE r.status = 'Pending'
      ORDER BY r.id DESC
    `);
    return NextResponse.json(res.rows);
  }

  // Superadmin (view only)
  if (user.role === "superadmin") {
    const itemsRes = await query("SELECT id, name, merk, jumlah, lokasi FROM items ORDER BY id ASC");
    return NextResponse.json(itemsRes.rows);
  }

  return NextResponse.json([], { status: 200 });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "user")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { item_id, jumlah } = body;

  const stockRes = await query("SELECT jumlah FROM items WHERE id=$1", [item_id]);
  if (!stockRes.rows.length || stockRes.rows[0].jumlah < jumlah)
    return NextResponse.json({ message: "Not enough stock" }, { status: 400 });

  const exist = await query(
    "SELECT 1 FROM requests WHERE user_id=$1 AND item_id=$2 AND status='Pending'",
    [user.id, item_id]
  );
  if (exist.rows.length)
    return NextResponse.json({ message: "Request sudah ada." }, { status: 409 });

  const result = await query(
    `INSERT INTO requests (user_id, item_id, jumlah, status, requested_at)
     VALUES ($1, $2, $3, 'Pending', NOW())
     RETURNING *`,
    [user.id, item_id, jumlah]
  );
  return NextResponse.json(result.rows[0]);
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, action } = body;
  let sql = "", params: any[] = [];

  // User cancel
  if (action === "cancel" && user.role === "user") {
    sql = "UPDATE requests SET status='Cancelled' WHERE id=$1 AND user_id=$2 RETURNING *";
    params = [id, user.id];
  }
  // Admin inventory approve/accept
  else if ((action === "accept" || action === "approve") && user.role === "admin_inventory") {
    // Kurangi stok barang
    await query(
      `UPDATE items SET jumlah = jumlah - (SELECT jumlah FROM requests WHERE id=$1)
       WHERE id = (SELECT item_id FROM requests WHERE id=$1)`, [id]);
    // Update status request
    sql = "UPDATE requests SET status='Approved', accepted_by=$2, accepted_at=NOW() WHERE id=$1 RETURNING *";
    params = [id, user.id];

    // Insert ke loans jika belum ada
    const reqRes = await query("SELECT * FROM requests WHERE id=$1", [id]);
    if (reqRes.rows.length) {
      const reqRow = reqRes.rows[0];
      const loanCheck = await query("SELECT 1 FROM loans WHERE request_id = $1", [id]);
      if (!loanCheck.rows.length) {
        await query(
          `INSERT INTO loans (request_id, user_id, item_id, jumlah, tanggal_pinjam, status)
           VALUES ($1, $2, $3, $4, NOW(), 'borrowed')`,
          [id, reqRow.user_id, reqRow.item_id, reqRow.jumlah]
        );
      }
    }
  }
  // Admin inventory reject
  else if (action === "reject" && user.role === "admin_inventory") {
    sql = "UPDATE requests SET status='Rejected', accepted_by=$2, accepted_at=NOW() WHERE id=$1 RETURNING *";
    params = [id, user.id];
  }
  else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const result = await query(sql, params);
  return NextResponse.json(result.rows[0]);
}
