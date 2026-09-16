import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession, sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      // Do not reveal whether the email exists.
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const { token } = createSession(user.id);
    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email } },
      { headers: { "Set-Cookie": sessionCookie(token) } }
    );
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}