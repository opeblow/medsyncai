"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, BookOpen, HeartPulse, TrendingUp } from "lucide-react";

interface JournalEntry {
  id: string;
  timestamp: string;
  symptoms: string[];
  severity: string;
  mood: string;
}

const moodMarks: Record<string, { label: string; value: number }> = {
  good: { label: "Good", value: 5 },
  okay: { label: "Okay", value: 4 },
  not_great: { label: "Not great", value: 3 },
  bad: { label: "Bad", value: 2 },
  terrible: { label: "Terrible", value: 1 },
};

const severityTone: Record<string, string> = {
  mild: "bg-stone-300",
  moderate: "bg-stone-500",
  urgent: "bg-amber-500",
  critical: "bg-red-600",
};

export default function InsightsPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  useEffect(() => {
    fetch("/api/journal").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setEntries(data);
    }).catch(() => undefined);
  }, []);

  const insights = useMemo(() => {
    const symptomCounts = new Map<string, number>();
    const severityCounts = new Map<string, number>();
    const weeks = new Map<string, number>();
    entries.forEach((entry) => {
      entry.symptoms.forEach((symptom) => symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1));
      severityCounts.set(entry.severity, (severityCounts.get(entry.severity) || 0) + 1);
      const date = new Date(entry.timestamp);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      weeks.set(label, (weeks.get(label) || 0) + 1);
    });
    return {
      symptoms: [...symptomCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
      severities: [...severityCounts.entries()],
      weeks: [...weeks.entries()].slice(-6),
      moods: entries.slice(0, 6).reverse(),
    };
  }, [entries]);
  const maxSymptoms = Math.max(...insights.symptoms.map(([, count]) => count), 1);
  const maxWeeks = Math.max(...insights.weeks.map(([, count]) => count), 1);

  return <div className="max-w-6xl mx-auto space-y-8">
    <div>
      <p className="clinical-label">Your health data</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950">Health insights</h2>
      <p className="mt-2 text-stone-500">Patterns from your journal entries. These are observations, not medical advice.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      {[
        [BookOpen, entries.length, "Entries recorded"],
        [Activity, insights.symptoms.length, "Symptoms tracked"],
        [HeartPulse, entries.filter((entry) => ["urgent", "critical"].includes(entry.severity)).length, "Entries needing follow-up"],
      ].map(([Icon, value, label]) => {
        const MetricIcon = Icon as typeof BookOpen;
        return <div key={String(label)} className="clinical-card p-5"><MetricIcon className="h-4 w-4 text-stone-500" /><p className="mt-5 text-3xl font-semibold tabular-nums">{value as number}</p><p className="mt-1 text-sm text-stone-500">{label as string}</p></div>;
      })}
    </div>

    {entries.length === 0 ? <div className="clinical-card py-16 text-center"><BarChart3 className="mx-auto h-10 w-10 text-stone-300" /><h3 className="mt-4 font-semibold">No trends yet</h3><p className="mt-1 text-sm text-stone-500">Add a journal entry or talk with MedSync to start building a health picture.</p></div> : <div className="grid gap-6 lg:grid-cols-2">
      <section className="clinical-card p-6"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-stone-500" /><h3 className="font-semibold">Most common symptoms</h3></div><div className="mt-6 space-y-5">{insights.symptoms.map(([symptom, count]) => <div key={symptom}><div className="mb-2 flex justify-between text-sm"><span className="capitalize text-stone-700">{symptom.replaceAll("_", " ")}</span><span className="tabular-nums text-stone-500">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-stone-800" style={{ width: `${(count / maxSymptoms) * 100}%` }} /></div></div>)}</div></section>
      <section className="clinical-card p-6"><h3 className="font-semibold">Entry frequency</h3><p className="mt-1 text-sm text-stone-500">Recent journal activity</p><div className="mt-7 flex h-40 items-end gap-3">{insights.weeks.map(([label, count]) => <div className="flex h-full flex-1 flex-col justify-end" key={label}><span className="mb-2 text-center text-xs tabular-nums text-stone-500">{count}</span><div className="min-h-2 rounded-t-md bg-stone-800" style={{ height: `${Math.max(10, (count / maxWeeks) * 100)}%` }} /><span className="mt-2 truncate text-center text-[10px] text-stone-500">{label}</span></div>)}</div></section>
      <section className="clinical-card p-6"><h3 className="font-semibold">Mood timeline</h3><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{insights.moods.map((entry) => { const mood = moodMarks[entry.mood] || { label: entry.mood, value: 0 }; return <div key={entry.id} className="rounded-xl bg-stone-50 p-3"><p className="text-sm font-medium text-stone-800">{mood.label}</p><p className="mt-1 text-xs text-stone-500">{new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div>; })}</div></section>
      <section className="clinical-card p-6"><h3 className="font-semibold">Severity distribution</h3><div className="mt-6 space-y-4">{insights.severities.map(([severity, count]) => <div className="flex items-center gap-3" key={severity}><span className={`h-2.5 w-2.5 rounded-full ${severityTone[severity] || "bg-stone-400"}`} /><span className="flex-1 text-sm capitalize text-stone-700">{severity}</span><span className="text-sm tabular-nums text-stone-500">{count}</span></div>)}</div></section>
    </div>}
  </div>;
}
