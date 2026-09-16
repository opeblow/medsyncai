"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  BookOpen,
  Pill,
  Bell,
  TrendingUp,
  Heart,
  Phone,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Talk to MedSync", href: "/dashboard/talk", icon: Mic, primary: true },
  { label: "Health Journal", href: "/dashboard/journal", icon: BookOpen },
  { label: "Medications", href: "/dashboard/medications", icon: Pill },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Insights", href: "/dashboard/insights", icon: TrendingUp },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <Heart className="w-6 h-6 text-blue-600" fill="currentColor" />
        <span className="text-lg font-semibold text-gray-900 tracking-tight">
          MedSync
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn("w-[18px] h-[18px]", isActive ? "text-blue-600" : "text-gray-400")}
              />
              {item.label}
              {item.primary && !isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Emergency */}
      <div className="px-4 pb-6">
        <div className="border border-gray-100 rounded-lg p-3">
          <a
            href="tel:911"
            className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700"
          >
            <Phone className="w-3.5 h-3.5" />
            Need emergency help? Call 911
          </a>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle =
    navItems.find((n) => n.href === pathname)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-stone-200 bg-white h-screen sticky top-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 w-72 h-full bg-white border-r border-gray-200 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-blue-600" fill="currentColor" />
                <span className="text-lg font-semibold text-gray-900">
                  MedSync
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div onClick={() => setMobileOpen(false)}>
              <SidebarContent pathname={pathname} />
            </div>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-stone-200 px-6 lg:px-8 flex items-center justify-between bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              AI Companion
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
