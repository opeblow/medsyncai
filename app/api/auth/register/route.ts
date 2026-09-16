import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { hashPassword, createSession, sessionCookie } from "@/lib/auth";

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing: any = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    db.prepare(
      "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
    ).run(userId, email, hashPassword(password), new Date().toISOString());

    const { token } = createSession(userId);
    return NextResponse.json(
      { success: true, user: { id: userId, email } },
      { headers: { "Set-Cookie": sessionCookie(token) } }
    );
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}