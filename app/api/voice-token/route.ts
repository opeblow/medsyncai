import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const apiKey = process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AssemblyAI API key is not configured on server" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://agents.assemblyai.com/v1/token?expires_in_seconds=300&max_session_duration_seconds=600",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`, // CRITICAL: Voice Agent API uses Bearer prefix
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AssemblyAI token minting failed:", response.status, errorText);
      return NextResponse.json(
        { error: "Voice session token could not be created. Please try again." },
        { status: Math.min(500, Math.max(400, response.status)) }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Token endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mint AssemblyAI session token" },
      { status: 500 }
    );
  }
}
