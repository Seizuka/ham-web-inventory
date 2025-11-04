import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET() {
  const res = await query("SELECT id, name FROM roles ORDER BY id");
  return NextResponse.json(res.rows);
}
