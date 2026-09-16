"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Stethoscope,
  Pill,
  BookHeart,
  Bell,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  Heart,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Stethoscope,
    title: "Symptom Triage",
    desc: "Describe your symptoms naturally. MedSync asks the right follow-up questions and classifies urgency — from self-care to emergency.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Pill,
    title: "Drug Interaction Checker",
    desc: "Tell MedSync what medications you take. It checks for dangerous interactions and provides safety recommendations.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: BookHeart,
    title: "Health Journal",
    desc: "Every conversation is logged to your health journal. Track symptoms over time and spot patterns before your doctor visit.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Bell,
    title: "Medication Reminders",
    desc: "Never miss a dose. Set up voice-activated reminders for medications, appointments, and follow-ups.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Detection",
    desc: "MedSync recognizes emergency symptoms and immediately provides 911 guidance and crisis resources.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: TrendingUp,
    title: "Health Insights",
    desc: "See trends in your symptoms, mood, and health over time. Prepare better for doctor visits with data-backed insights.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const steps = [
  {
    num: "1",
    title: "Start talking",
    desc: "Click the mic button and describe how you're feeling in your own words.",
  },
  {
    num: "2",
    title: "Get assessed",
    desc: "MedSync asks focused follow-ups and triages your symptoms with medical tools.",
  },
  {
    num: "3",
    title: "Take action",
    desc: "Receive severity rating, recommendations, and log everything to your health journal.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600" fill="currentColor" />
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              MedSync
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">
              How it works
            </a>
            <Link
              href="/dashboard/talk"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </nav>
          <Link
            href="/dashboard/talk"
            className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="max-w-3xl mx-auto text-center pt-24 pb-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
            Voice-First Health Companion
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.1]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Your health companion
          <br />
          that <span className="text-blue-600">listens</span>
        </motion.h1>

        <motion.p
          className="text-lg text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Talk to MedSync about your symptoms, medications, and health concerns.
          Get instant triage, drug interaction checks, and personalized health
          insights — all through natural voice conversation.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link
            href="/dashboard/talk"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Mic className="w-5 h-5" />
            Start a conversation
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </motion.div>
      </section>

      {/* ─── Product Preview ─── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-gray-50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
            </div>
            <span className="text-sm text-gray-400 font-medium">
              MedSync AI — Talk
            </span>
          </div>
          <div className="p-8 space-y-4">
            {/* Mock transcript */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-700 max-w-md">
                Hi there! I&apos;m MedSync, your health companion. How are you
                feeling today? Is there anything I can help you with?
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 text-sm max-w-md">
                I&apos;ve had this headache for about 3 days now. It&apos;s
                throbbing, mostly on the left side.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-700 max-w-md">
                I&apos;m sorry to hear that. A throbbing, one-sided headache for
                3 days does warrant attention. Are you experiencing any nausea or
                sensitivity to light?
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="bg-gray-50/60 border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              Everything you need
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              MedSync combines voice AI with medical intelligence to give you a
              health companion that&apos;s always available.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
              >
                <div
                  className={`${f.bg} ${f.color} rounded-lg p-2.5 w-10 h-10 flex items-center justify-center mb-4`}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="text-gray-500 mt-3">
              Three simple steps to better health insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="text-center relative"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-semibold flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 w-5 h-5 text-gray-300" />
                )}
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gray-50/60 border-t border-gray-100 py-24">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">
            Ready to talk to MedSync?
          </h2>
          <p className="text-gray-500 mb-8">
            Start a free voice conversation. No sign-up required.
          </p>
          <Link
            href="/dashboard/talk"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-8 py-4 text-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Mic className="w-5 h-5" />
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-blue-600" fill="currentColor" />
            <span className="text-sm font-semibold text-gray-900">
              MedSync AI
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Built for the AssemblyAI Voice Agent Hackathon
          </p>
          <p className="text-xs text-gray-400 mt-1">
            MedSync AI is not a substitute for professional medical advice,
            diagnosis, or treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}
