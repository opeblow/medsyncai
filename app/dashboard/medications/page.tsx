"use client";

import { useEffect, useState } from "react";
import { Pill, Plus, X, AlertTriangle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
}

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "Daily", time_of_day: "Morning" });

  const loadMeds = () => {
    fetch("/api/medications").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setMeds(d); }).catch(() => {});
  };

  useEffect(() => { loadMeds(); }, []);

  const addMed = async () => {
    if (!newMed.name) return;
    await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMed),
    });
    setNewMed({ name: "", dosage: "", frequency: "Daily", time_of_day: "Morning" });
    setShowAdd(false);
    loadMeds();
  };

  const removeMed = async (id: string) => {
    await fetch(`/api/medications?id=${id}`, { method: "DELETE" });
    loadMeds();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Medications</h2>
          <p className="text-gray-500 mt-1">Track your current medications</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* Interaction warning example */}
      {meds.length >= 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Drug Interaction Tip
            </p>
            <p className="text-xs text-amber-700 mt-1">
              You have multiple medications tracked. Ask MedSync to check for
              drug interactions by saying &quot;Check my medications for
              interactions.&quot;
            </p>
          </div>
        </div>
      )}

      {/* Add medication form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Add New Medication</h3>
            <button onClick={() => setShowAdd(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Name</label>
              <input
                type="text"
                placeholder="e.g. Ibuprofen"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Dosage</label>
              <input
                type="text"
                placeholder="e.g. 200mg"
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Frequency</label>
              <select
                value={newMed.frequency}
                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>As needed</option>
                <option>Daily</option>
                <option>Twice daily</option>
                <option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Time of Day</label>
              <input
                type="text"
                placeholder="e.g. 8:00 AM"
                value={newMed.time_of_day}
                onChange={(e) => setNewMed({ ...newMed, time_of_day: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={addMed}
            className="bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Medication
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {meds.length === 0 && (
          <div className="text-center py-16">
            <Pill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No medications tracked yet.</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;Add Medication&quot; above to get started.</p>
          </div>
        )}
        <div className="divide-y divide-gray-50">
          {meds.map((m) => (
            <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {m.dosage} · {m.frequency} · {m.time_of_day}
                </p>
              </div>
              <button onClick={() => removeMed(m.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
