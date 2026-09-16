import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const medNameInput: string = (body.medication_name || "").toLowerCase().trim();

    const medsFilePath = path.join(process.cwd(), "data", "medications.json");
    const fileData = fs.readFileSync(medsFilePath, "utf-8");
    const { medications } = JSON.parse(fileData);

    const match = medications.find(
      (m: any) =>
        m.name.toLowerCase() === medNameInput ||
        m.id.toLowerCase() === medNameInput ||
        m.brand_names.some((b: string) => b.toLowerCase() === medNameInput)
    );

    if (match) {
      return NextResponse.json({
        found: true,
        medication: match,
      });
    }

    return NextResponse.json({
      found: false,
      message: `No exact database match found for '${body.medication_name}'. Please verify spelling or ask your pharmacist.`,
    });
  } catch (err: any) {
    console.error("get-medication-info tool error:", err);
    return NextResponse.json({ error: "Failed to fetch medication info" }, { status: 500 });
  }
}
