import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputSymptoms: string[] = body.symptoms || [];

    const symptomsFilePath = path.join(process.cwd(), "data", "symptoms.json");
    const fileData = fs.readFileSync(symptomsFilePath, "utf-8");
    const { symptoms } = JSON.parse(fileData);

    const matches: any[] = [];
    const followUpQuestionsSet = new Set<string>();
    let hasEmergencyFlag = false;

    const normalizedInput = inputSymptoms.map((s) => s.toLowerCase().trim().replace(/[\s-]/g, "_"));

    for (const item of symptoms) {
      const itemNormalizedId = item.id.toLowerCase();
      const isMatch = normalizedInput.some(
        (inp) => itemNormalizedId.includes(inp) || inp.includes(itemNormalizedId)
      );

      if (isMatch) {
        if (item.emergency_flag) hasEmergencyFlag = true;

        if (item.follow_up_questions) {
          item.follow_up_questions.forEach((q: string) => followUpQuestionsSet.add(q));
        }

        if (item.possible_conditions) {
          matches.push(...item.possible_conditions);
        }
      }
    }

    return NextResponse.json({
      query_symptoms: inputSymptoms,
      matched_conditions_count: matches.length,
      possible_conditions: matches.slice(0, 4),
      suggested_follow_up_questions: Array.from(followUpQuestionsSet).slice(0, 3),
      emergency_flag: hasEmergencyFlag,
    });
  } catch (err: any) {
    console.error("lookup-symptoms tool error:", err);
    return NextResponse.json({ error: "Failed to lookup symptoms" }, { status: 500 });
  }
}
