import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM medications WHERE active = 1 AND owner_id = ?")
      .all(user.id);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch medications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const body = await req.json();
    const db = getDb();
    const id = `med-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO medications (id, name, dosage, frequency, time_of_day, active, owner_id)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);
    stmt.run(
      id,
      body.name || "Medication",
      body.dosage || "1 dose",
      body.frequency || "Daily",
      body.time_of_day || "Morning",
      user.id
    );
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to add medication" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing medication ID" }, { status: 400 });

    const db = getDb();
    const result = db
      .prepare("UPDATE medications SET active = 0 WHERE id = ? AND owner_id = ?")
      .run(id, user.id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete medication" }, { status: 500 });
  }
}