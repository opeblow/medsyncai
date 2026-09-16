import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const symptomFilter = (body.symptom_filter || "").toLowerCase();

    const db = getDb();
    const rows = db.prepare("SELECT * FROM journal_entries ORDER BY timestamp DESC").all();

    const parsedEntries = rows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      symptoms: JSON.parse(r.symptoms || "[]"),
      severity: r.severity,
      mood: r.mood,
      notes: r.notes,
      recommended_action: r.recommended_action,
    }));

    let filtered = parsedEntries;
    if (symptomFilter) {
      filtered = parsedEntries.filter((e: any) =>
        e.symptoms.some((s: string) => s.toLowerCase().includes(symptomFilter))
      );
    }

    return NextResponse.json({
      total_count: filtered.length,
      entries: filtered,
    });
  } catch (err: any) {
    console.error("get-health-history tool error:", err);
    return NextResponse.json({ error: "Failed to retrieve health history" }, { status: 500 });
  }
}
