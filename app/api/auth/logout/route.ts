import { NextResponse } from "next/server";
import { SESSION_COOKIE, destroySession, clearSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (match) {
    const token = match.slice(SESSION_COOKIE.length + 1);
    if (token) destroySession(token);
  }
  return NextResponse.json({ success: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}