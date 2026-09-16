import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const symptoms: string[] = body.symptoms || [];
    const duration = body.duration || "";
    const additionalContext = body.additional_context || "";

    const triageFilePath = path.join(process.cwd(), "data", "triage-rules.json");
    const fileData = fs.readFileSync(triageFilePath, "utf-8");
    const { rules } = JSON.parse(fileData);

    const combinedText = [...symptoms, duration, additionalContext].join(" ").toLowerCase();

    // Check critical rule triggers first
    for (const rule of rules) {
      for (const trigger of rule.triggers) {
        if (combinedText.includes(trigger.toLowerCase())) {
          return NextResponse.json({
            severity: rule.severity,
            label: rule.label,
            action: rule.action,
            matched_trigger: trigger,
            symptoms_evaluated: symptoms,
          });
        }
      }
    }

    // Default fallback assessment if no explicit trigger string matched
    if (symptoms.some((s) => s.toLowerCase().includes("chest") || s.toLowerCase().includes("breath"))) {
      const urgentRule = rules.find((r: any) => r.severity === "urgent");
      return NextResponse.json({
        severity: "urgent",
        label: urgentRule.label,
        action: urgentRule.action,
        symptoms_evaluated: symptoms,
      });
    }

    const mildRule = rules.find((r: any) => r.severity === "mild");
    return NextResponse.json({
      severity: "mild",
      label: mildRule.label,
      action: mildRule.action,
      symptoms_evaluated: symptoms,
    });
  } catch (err: any) {
    console.error("triage-severity tool error:", err);
    return NextResponse.json({ error: "Failed to classify triage severity" }, { status: 500 });
  }
}
