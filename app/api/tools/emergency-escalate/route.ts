import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reason = body.reason || "Potential medical emergency detected";
    const symptoms: string[] = body.symptoms || [];

    return NextResponse.json({
      escalated: true,
      reason,
      symptoms,
      emergency_info: {
        call_911: "Call 911 immediately or go to your nearest Emergency Room.",
        crisis_line: "988 Suicide & Crisis Lifeline — Call or Text 988 (Available 24/7, Free & Confidential)",
        poison_control: "Poison Control Helpline: 1-800-222-1222",
        action_required: "Do not wait or delay seeking immediate in-person emergency care."
      }
    });
  } catch (err: any) {
    console.error("emergency-escalate tool error:", err);
    return NextResponse.json({ error: "Failed to trigger emergency escalation" }, { status: 500 });
  }
}
