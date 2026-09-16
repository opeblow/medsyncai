import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const symptoms: string[] = Array.isArray(body.symptoms) ? body.symptoms.map((s: any) => String(s)) : [];
    const duration = body.duration || "";
    const additionalContext = body.additional_context || "";

    const triageFilePath = path.join(process.cwd(), "data", "triage-rules.json");
    const fileData = fs.readFileSync(triageFilePath, "utf-8");
    const { rules } = JSON.parse(fileData);

    const combinedText = [...symptoms, duration, additionalContext].join(" ").toLowerCase();

    const unableToAssess = () =>
      NextResponse.json({
        severity: "unknown",
        assessed: false,
        label: "Unable to assess — consult a healthcare provider",
        action:
          "Not enough information was provided for MedSync to recommend an urgency level. If symptoms are concerning or worsening, please consult a healthcare provider or call your local emergency number.",
        symptoms_evaluated: symptoms,
      });

    // No symptoms at all: never reach a reassuring fallback.
    if (symptoms.length === 0 && !combinedText.trim()) {
      return unableToAssess();
    }

    // Check critical rule triggers first, including a symptom phrase that is
    // contained within a critical trigger. This catches degraded descriptions
    // like "slurred speech" without matching against "headache"-style short
    // words across all severity levels.
    for (const rule of rules) {
      for (const trigger of rule.triggers) {
        if (combinedText.includes(trigger.toLowerCase())) {
          return matchResponse(rule, symptoms);
        }
      }
    }

    const criticalRule = rules.find((r: any) => r.severity === "critical");
    for (const trigger of criticalRule?.triggers ?? []) {
      const normalizedTrigger = trigger.toLowerCase();
      const matched = symptoms.some(
        (s) => normalizedTrigger.includes(s.toLowerCase().trim()) && s.trim().length > 2
      );
      if (matched) {
        return matchResponse(criticalRule, symptoms);
      }
    }

    // Symptom phrases explicitly naming chest or breathing problems are always
    // worth an urgent assessment.
    if (symptoms.some((s) => s.toLowerCase().includes("chest") || s.toLowerCase().includes("breath"))) {
      const urgentRule = rules.find((r: any) => r.severity === "urgent");
      return matchResponse(urgentRule, symptoms);
    }

    // Nothing matched: be honest instead of defaulting to "mild".
    return unableToAssess();
  } catch (err: any) {
    console.error("triage-severity tool error:", err);
    return NextResponse.json({ error: "Failed to classify triage severity" }, { status: 500 });
  }
}

function matchResponse(rule: any, symptoms: string[], matched_trigger?: string) {
  return NextResponse.json({
    severity: rule.severity,
    assessed: true,
    label: rule.label,
    action: rule.action,
    matched_trigger,
    symptoms_evaluated: symptoms,
  });
}
