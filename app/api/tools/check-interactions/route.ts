import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const medsInput: string[] = body.medications || [];

    const interactionsFilePath = path.join(process.cwd(), "data", "drug-interactions.json");
    const fileData = fs.readFileSync(interactionsFilePath, "utf-8");
    const { interactions } = JSON.parse(fileData);

    const normMeds = medsInput.map((m) => m.toLowerCase().trim());
    const foundInteractions: any[] = [];

    for (let i = 0; i < normMeds.length; i++) {
      for (let j = i + 1; j < normMeds.length; j++) {
        const medA = normMeds[i];
        const medB = normMeds[j];

        const match = interactions.find(
          (item: any) =>
            (medA.includes(item.drug_a.toLowerCase()) && medB.includes(item.drug_b.toLowerCase())) ||
            (medB.includes(item.drug_a.toLowerCase()) && medA.includes(item.drug_b.toLowerCase()))
        );

        if (match) {
          foundInteractions.push(match);
        }
      }
    }

    return NextResponse.json({
      medications_checked: medsInput,
      interactions_found: foundInteractions.length > 0,
      count: foundInteractions.length,
      interactions: foundInteractions,
      safety_disclaimer: "Always verify drug interactions with your pharmacist or prescribing doctor.",
    });
  } catch (err: any) {
    console.error("check-interactions tool error:", err);
    return NextResponse.json({ error: "Failed to check drug interactions" }, { status: 500 });
  }
}
