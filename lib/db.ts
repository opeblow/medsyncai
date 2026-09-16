import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  try {
    const dbDir = path.join(process.cwd(), "sqlite");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, "medsync.db");
    dbInstance = new Database(dbPath);
  } catch (e) {
    // Fallback to in-memory SQLite if file system is restricted
    dbInstance = new Database(":memory:");
  }

  // Initialize Tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      severity TEXT NOT NULL,
      mood TEXT NOT NULL,
      notes TEXT NOT NULL,
      recommended_action TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      time_of_day TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      reminder_type TEXT NOT NULL,
      title TEXT NOT NULL,
      frequency TEXT NOT NULL,
      time TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Seed sample data if empty
  const journalCount = dbInstance.prepare("SELECT count(*) as count FROM journal_entries").get() as { count: number };
  if (journalCount.count === 0) {
    const insertJournal = dbInstance.prepare(`
      INSERT INTO journal_entries (id, timestamp, symptoms, severity, mood, notes, recommended_action)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertJournal.run(
      "entry-1",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      JSON.stringify(["headache", "light_sensitivity"]),
      "moderate",
      "not_great",
      "Throbbing pain on left temple for ~4 hours after looking at screens. Hydrated and rested.",
      "Rest in dark room, consider OTC ibuprofen. Monitor if persists >24h."
    );

    insertJournal.run(
      "entry-2",
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      JSON.stringify(["cough", "sore_throat"]),
      "mild",
      "okay",
      "Mild tickle in throat with dry cough. No fever detected.",
      "Stay hydrated, warm tea with honey, monitor temperature."
    );
  }

  const medCount = dbInstance.prepare("SELECT count(*) as count FROM medications").get() as { count: number };
  if (medCount.count === 0) {
    const insertMed = dbInstance.prepare(`
      INSERT INTO medications (id, name, dosage, frequency, time_of_day, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insertMed.run("med-1", "Ibuprofen", "200mg", "As needed", "With food", 1);
    insertMed.run("med-2", "Lisinopril", "10mg", "Daily", "8:00 AM", 1);
  }

  const remCount = dbInstance.prepare("SELECT count(*) as count FROM reminders").get() as { count: number };
  if (remCount.count === 0) {
    const insertRem = dbInstance.prepare(`
      INSERT INTO reminders (id, reminder_type, title, frequency, time, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insertRem.run("rem-1", "medication", "Take Lisinopril 10mg", "daily", "8:00 AM", 1);
    insertRem.run("rem-2", "appointment", "Dr. Miller Annual Checkup", "once", "2:30 PM", 1);
  }

  return dbInstance;
}
