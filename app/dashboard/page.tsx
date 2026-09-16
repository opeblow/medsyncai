"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  Pill,
  Clock,
  Mic,
  Plus,
  ChevronRight,
} from "lucide-react";

interface JournalEntry {
  id: string;
  timestamp: string;
  symptoms: string[];
  severity: string;
  mood: string;
  notes: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

const severityColors: Record<string, string> = {
  mild: "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50 text-amber-700",
  urgent: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const moodEmoji: Record<string, string> = {
  good: "😊",
  okay: "🙂",
  not_great: "😐",
  bad: "😟",
  terrible: "😢",
};

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/journal").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setEntries(d); }).catch(() => {});
    fetch("/api/medications").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setMeds(d); }).catch(() => {});
    fetch("/api/reminders").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setReminders(d); }).catch(() => {});
  }, []);

  const stats = [
    { label: "Journal Entries", value: entries.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Medications", value: meds.length, icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Reminders", value: reminders.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Conversations", value: entries.length, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Welcome back
        </h2>
        <p className="text-gray-500 mt-1">Here&apos;s your health overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${s.bg} ${s.color} rounded-lg p-2`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">
              {s.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent entries */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Recent Health Entries
            </h3>
            <Link
              href="/dashboard/journal"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {entries.length === 0 && (
              <div className="px-6 py-12 text-center">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No journal entries yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start a conversation with MedSync to log your first entry.
                </p>
              </div>
            )}
            {entries.slice(0, 5).map((e) => (
              <div key={e.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">
                    {new Date(e.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{moodEmoji[e.mood] || "🙂"}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        severityColors[e.severity] || severityColors.mild
                      }`}
                    >
                      {e.severity}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {e.symptoms.map((s) => (
                    <span
                      key={s}
                      className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                  {e.notes}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/talk"
                className="flex items-center gap-3 bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Mic className="w-5 h-5" />
                Talk to MedSync
              </Link>
              <Link
                href="/dashboard/journal"
                className="flex items-center gap-3 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-gray-400" />
                View Health Journal
              </Link>
              <Link
                href="/dashboard/medications"
                className="flex items-center gap-3 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-400" />
                Add Medication
              </Link>
            </div>
          </div>

          {/* Current medications */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Your Medications</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {meds.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <Pill className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No medications tracked yet.</p>
                </div>
              )}
              {meds.map((m) => (
                <div key={m.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.dosage} · {m.frequency}
                    </p>
                  </div>
                  <Pill className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
