"use client";

import { useEffect, useState } from "react";
import { Bell, Pill, Calendar, CheckCircle2, Plus, X } from "lucide-react";

interface Reminder {
  id: string;
  reminder_type: string;
  title: string;
  frequency: string;
  time: string;
  active: number;
}

const typeIcons: Record<string, typeof Bell> = {
  medication: Pill,
  appointment: Calendar,
  follow_up: CheckCircle2,
  check_in: Bell,
};

const typeColors: Record<string, string> = {
  medication: "bg-blue-50 text-blue-600",
  appointment: "bg-purple-50 text-purple-600",
  follow_up: "bg-emerald-50 text-emerald-600",
  check_in: "bg-amber-50 text-amber-600",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRem, setNewRem] = useState({ title: "", reminder_type: "medication", frequency: "daily", time: "8:00 AM" });

  const loadReminders = () => {
    fetch("/api/reminders").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setReminders(d); }).catch(() => {});
  };

  useEffect(() => { loadReminders(); }, []);

  const addReminder = async () => {
    if (!newRem.title) return;
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRem),
    });
    setNewRem({ title: "", reminder_type: "medication", frequency: "daily", time: "8:00 AM" });
    setShowAdd(false);
    loadReminders();
  };

  const removeReminder = async (id: string) => {
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
    loadReminders();
  };

  const toggleReminder = async (id: string, active: boolean) => {
    setReminders((current) => current.map((reminder) => reminder.id === id ? { ...reminder, active: active ? 1 : 0 } : reminder));
    const response = await fetch("/api/reminders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    if (!response.ok) loadReminders();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Reminders</h2>
          <p className="text-gray-500 mt-1">Never miss a dose or appointment</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="clinical-button"
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {showAdd && (
        <div className="clinical-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">New Reminder</h3>
            <button onClick={() => setShowAdd(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. Take Lisinopril"
                value={newRem.title}
                onChange={(e) => setNewRem({ ...newRem, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Type</label>
              <select
                value={newRem.reminder_type}
                onChange={(e) => setNewRem({ ...newRem, reminder_type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="follow_up">Follow-up</option>
                <option value="check_in">Check-in</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Frequency</label>
              <select
                value={newRem.frequency}
                onChange={(e) => setNewRem({ ...newRem, frequency: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="twice_daily">Twice daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Time</label>
              <input
                type="text"
                placeholder="e.g. 8:00 AM"
                value={newRem.time}
                onChange={(e) => setNewRem({ ...newRem, time: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={addReminder}
            className="clinical-button"
          >
            Save Reminder
          </button>
        </div>
      )}

      <div className="clinical-card overflow-hidden">
        {reminders.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No reminders set.</p>
            <p className="text-xs text-gray-400 mt-1">Add a reminder or ask MedSync to set one for you.</p>
          </div>
        )}
        <div className="divide-y divide-gray-50">
          {reminders.map((r) => {
            const Icon = typeIcons[r.reminder_type] || Bell;
            const colorClass = typeColors[r.reminder_type] || typeColors.check_in;
            return (
              <div key={r.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-stone-50 transition-colors ${r.active ? "" : "opacity-50"}`}>
                <div className={`${colorClass} rounded-lg p-2.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.time} · {r.frequency.replace("_", " ")} · {r.reminder_type.replace("_", " ")}
                  </p>
                </div>
                <button aria-label={`Turn ${r.title} ${r.active ? "off" : "on"}`} onClick={() => toggleReminder(r.id, !Boolean(r.active))} className={`relative h-6 w-11 rounded-full transition-colors ${r.active ? "bg-stone-900" : "bg-stone-200"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${r.active ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <button aria-label={`Remove ${r.title}`} onClick={() => removeReminder(r.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
