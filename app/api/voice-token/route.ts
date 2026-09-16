import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ASSEMBLY_AI_API_KEY || process.env.ASSEMBLE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AssemblyAI API key is not configured on server" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://agents.assemblyai.com/v1/token?expires_in_seconds=300&max_session_duration_seconds=8640",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`, // CRITICAL: Voice Agent API uses Bearer prefix
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Token minting failed: ${errorText}` },
        { status: response.status }
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
