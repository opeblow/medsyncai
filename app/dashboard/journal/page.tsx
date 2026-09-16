"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";

interface JournalEntry {
  id: string;
  timestamp: string;
  symptoms: string[];
  severity: string;
  mood: string;
  notes: string;
  recommended_action: string;
}

const severityColors: Record<string, string> = {
  mild: "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50 text-amber-700",
  urgent: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const moodLabels: Record<string, string> = {
  good: "😊 Good",
  okay: "🙂 Okay",
  not_great: "😐 Not great",
  bad: "😟 Bad",
  terrible: "😢 Terrible",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setEntries(d);
      })
      .catch(() => {});
  }, []);

  const filtered = entries.filter((e) => {
    const matchSearch = search === "" || e.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase())) || e.notes.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || e.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Health Journal
        </h2>
        <p className="text-gray-500 mt-1">
          Your health conversations and entries
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search symptoms or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All severities</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="urgent">Urgent</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No journal entries found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Start a conversation with MedSync to log your first entry.
            </p>
          </div>
        )}
        {filtered.map((e) => (
          <div
            key={e.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(e.timestamp).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {moodLabels[e.mood]?.split(" ")[0] || "🙂"}
                  </span>
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
                    className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {e.notes}
              </p>
            </button>
            {expanded === e.id && (
              <div className="px-6 pb-5 pt-0 border-t border-gray-100 mt-0">
                <div className="pt-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                      Full Notes
                    </p>
                    <p className="text-sm text-gray-700">{e.notes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                      Mood
                    </p>
                    <p className="text-sm text-gray-700">
                      {moodLabels[e.mood] || e.mood}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                      Recommended Action
                    </p>
                    <p className="text-sm text-gray-700">
                      {e.recommended_action}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
