import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const body = await req.json();
    const symptoms: string[] = body.symptoms || [];
    const severity = body.severity || "mild";
    const mood = body.mood || "okay";
    const notes = body.notes || "";
    const recommendedAction = body.recommended_action || "Monitored symptoms.";

    const db = getDb();
    const entryId = `entry-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO journal_entries (id, timestamp, symptoms, severity, mood, notes, recommended_action, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(entryId, timestamp, JSON.stringify(symptoms), severity, mood, notes, recommendedAction, user.id);

    return NextResponse.json({
      success: true,
      entry_id: entryId,
      timestamp,
      message: "Health entry logged successfully to your MedSync journal.",
    });
  } catch (err: any) {
    console.error("log-health-entry tool error:", err);
    return NextResponse.json({ error: "Failed to log health entry" }, { status: 500 });
  }
}