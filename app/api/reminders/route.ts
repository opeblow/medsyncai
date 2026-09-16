import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM reminders ORDER BY active DESC, time ASC").all();
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const id = `rem-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO reminders (id, reminder_type, title, frequency, time, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    stmt.run(id, body.reminder_type || "medication", body.title || "Reminder", body.frequency || "daily", body.time || "8:00 AM");
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing reminder ID" }, { status: 400 });
    const db = getDb();
    db.prepare("UPDATE reminders SET active = 0 WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || typeof body.active !== "boolean") {
      return NextResponse.json({ error: "A reminder ID and active state are required" }, { status: 400 });
    }
    const db = getDb();
    db.prepare("UPDATE reminders SET active = ? WHERE id = ?").run(body.active ? 1 : 0, body.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
