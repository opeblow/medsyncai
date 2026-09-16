import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM journal_entries ORDER BY timestamp DESC").all();
    const parsed = rows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      symptoms: JSON.parse(r.symptoms || "[]"),
      severity: r.severity,
      mood: r.mood,
      notes: r.notes,
      recommended_action: r.recommended_action,
    }));
    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const id = `entry-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO journal_entries (id, timestamp, symptoms, severity, mood, notes, recommended_action)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      timestamp,
      JSON.stringify(body.symptoms || []),
      body.severity || "mild",
      body.mood || "okay",
      body.notes || "",
      body.recommended_action || "Manual entry."
    );
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 });
  }
}
