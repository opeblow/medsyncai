import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM medications WHERE active = 1").all();
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch medications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const id = `med-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO medications (id, name, dosage, frequency, time_of_day, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    stmt.run(
      id,
      body.name || "Medication",
      body.dosage || "1 dose",
      body.frequency || "Daily",
      body.time_of_day || "Morning"
    );
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to add medication" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing medication ID" }, { status: 400 });

    const db = getDb();
    db.prepare("UPDATE medications SET active = 0 WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete medication" }, { status: 500 });
  }
}
