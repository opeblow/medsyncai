import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reminderType = body.reminder_type || "medication";
    const title = body.title || "Health Reminder";
    const frequency = body.frequency || "daily";
    const time = body.time || "8:00 AM";

    const db = getDb();
    const reminderId = `rem-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO reminders (id, reminder_type, title, frequency, time, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    stmt.run(reminderId, reminderType, title, frequency, time);

    return NextResponse.json({
      success: true,
      reminder_id: reminderId,
      reminder: {
        id: reminderId,
        reminder_type: reminderType,
        title,
        frequency,
        time,
      },
      message: `Reminder scheduled: '${title}' at ${time} (${frequency}).`,
    });
  } catch (err: any) {
    console.error("schedule-reminder tool error:", err);
    return NextResponse.json({ error: "Failed to schedule reminder" }, { status: 500 });
  }
}
