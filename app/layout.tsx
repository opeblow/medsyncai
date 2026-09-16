import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedSync AI — Your Voice Health Companion",
  description:
    "Talk to MedSync about your symptoms, medications, and health concerns. Get instant triage, drug interaction checks, and personalized health insights — all through natural voice conversation.",
  keywords: ["health", "voice", "AI", "symptom triage", "medication", "AssemblyAI"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
