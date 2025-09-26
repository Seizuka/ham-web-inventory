// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET() {
  try {
    const res = await query("SELECT * FROM public.items ORDER BY id ASC");
    return NextResponse.json(res.rows); // atau { data: res.rows }
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return NextResponse.json({ error: "API Error" }, { status: 500 });
  }
}
