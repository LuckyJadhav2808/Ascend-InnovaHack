"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Map,
  User,
  Flame,
  AlertCircle,
  FastForward,
  X,
  LogOut,
  Sparkles,
  Mic,
  FileText,
  Menu,
  ChevronRight
} from "lucide-react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";

export default function LeftRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, addXP, logoutFirebase } = useStore();
  const toast = useToast();

  const [pendingNavHref, setPendingNavHref] = useState(null);
  const [showAssessmentWarning, setShowAssessmentWarning] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
    { name: "Assessment", href: "/assessment", icon: Target, badge: "10Q" },
    { name: "Daily Practice", href: "/practice", icon: BookOpen, badge: "+XP" },
    { name: "AI Mock Interview", href: "/mock-interview", icon: Mic, badge: "AI" },
    { name: "Resume Enhancer", href: "/resume-enhancer", icon: FileText, badge: "ATS" },
    { name: "Roadmap", href: "/roadmap", icon: Map, badge: "4D" },
    { name: "Profile & History", href: "/profile", icon: User, badge: null },
  ];

  const handleNavClick = (e, href) => {
    setShowMobileMenu(false);
    if (pathname === "/assessment" && href !== "/assessment") {
      e.preventDefault();
      setPendingNavHref(href);
      setShowAssessmentWarning(true);
      toast.warning("Assessment in progress! Please complete or fast-forward before navigating.");
    }
  };

  const handleFastForwardAndNavigate = async () => {
    await addXP(300);
    toast.xp("+300 XP Baseline Bonus Awarded!");
    setShowAssessmentWarning(false);
    if (pendingNavHref) {
      router.push(pendingNavHref);
      setPendingNavHref(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      toast.info("Logged out successfully");
      router.push("/");
    } catch (e) {
      console.warn("Logout error:", e);
      router.push("/");
    }
  };

  return (
    <>
      {/* Desktop Vertical Navigation Rail */}
      <aside className="hidden md:flex w-20 bg-white border-r border-[#E5E5E0] flex-col items-center py-6 justify-between shadow-xs z-30 shrink-0 fixed top-0 left-0 h-screen select-none overflow-hidden">
        {/* Top: Ascend Brand Badge */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <Link
            href="/dashboard"
            onClick={(e) => handleNavClick(e, "/dashboard")}
            title="Dashboard"
            className="w-12 h-12 bg-[#1E1E1E] hover:bg-[#333333] rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-card transition-all duration-200 group"
          >
            <span className="text-[#F6D67A] group-hover:rotate-12 transition-transform duration-200">A</span>
          </Link>
          <span className="text-[9px] font-extrabold tracking-widest text-[#8A8A8A] uppercase">
            ASCEND
          </span>
        </div>

        {/* Center: Main Icon Navigation */}
        <nav className="flex flex-col items-center gap-1.5 my-auto w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                title={item.name}
                className="relative flex items-center justify-center w-full"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                    isActive
                      ? "bg-[#1E1E1E] text-white"
                      : "text-[#8A8A8A] hover:bg-[#F7F6F3] hover:text-[#1E1E1E]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                </div>

                {/* Inset Active Indicator Right Pill Bar */}
                {isActive && (
                  <span className="absolute right-0 w-1 h-6 bg-[#FF6B4A] rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Streak Badge & Logout Button */}
        <div className="flex flex-col items-center gap-3 pt-3 border-t border-[#E5E5E0]/70 w-full shrink-0">
          {/* Streak Flame Pill */}
          <div
            title={`${user.streak?.current || 1} Day Active Practice Streak`}
            className="w-11 h-11 bg-[#FFEBE6] border border-[#FF6B4A]/30 rounded-2xl flex flex-col items-center justify-center text-[#FF6B4A] cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-[#FF6B4A]" />
            <span className="text-[9px] font-extrabold text-[#FF6B4A] leading-none mt-0.5">
              {user.streak?.current || 1}d
            </span>
          </div>

          {/* Logout Action Icon */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-10 h-10 rounded-xl text-[#8A8A8A] hover:text-[#FF6B4A] hover:bg-[#FFEBE6] flex items-center justify-center transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </aside>

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E0] px-3 py-1.5 flex items-center justify-around shadow-xl">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="flex flex-col items-center justify-center py-0.5 px-2 rounded-xl transition-all"
            >
              <div
                className={`p-1.5 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-[#1E1E1E] text-white shadow-xs" : "text-[#8A8A8A]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-[#1E1E1E]" : "text-[#8A8A8A]"}`}>
                {item.name.split(" ")[0]}
              </span>
            </Link>
          );
        })}

        {/* 5th Mobile Trigger: "More Pages" Drawer Button */}
        <button
          onClick={() => setShowMobileMenu((prev) => !prev)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-[#8A8A8A]"
        >
          <div className={`p-2 rounded-xl flex items-center justify-center ${showMobileMenu ? "bg-[#FF6B4A] text-white" : "bg-[#F7F6F3] text-[#1E1E1E]"}`}>
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-extrabold mt-1 text-[#1E1E1E]">More</span>
        </button>
      </nav>

      {/* Mobile All-Pages Slide-Up Drawer Sheet */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-6 border-t border-[#E5E5E0] shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 pb-20">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1E1E1E] text-white rounded-xl flex items-center justify-center font-extrabold text-sm">
                  <span className="text-[#F6D67A]">A</span>
                </div>
                <h3 className="text-base font-extrabold text-[#1E1E1E]">All Navigation Pages</h3>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1.5 text-[#8A8A8A] hover:text-[#1E1E1E] rounded-full bg-[#F7F6F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-sm font-bold"
                        : "bg-[#F7F6F3] text-[#1E1E1E] border-[#E5E5E0] hover:bg-[#E5E5E0]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? "bg-[#FF6B4A] text-white" : "bg-white text-[#1E1E1E]"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="bg-[#FF6B4A] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E5E5E0]">
              <button
                onClick={handleLogout}
                className="w-full bg-[#FFEBE6] text-[#FF6B4A] font-extrabold text-xs py-3 rounded-2xl border border-[#FF6B4A]/30 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Navigation Guard Modal */}
      {showAssessmentWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E0] shadow-2xl relative text-center space-y-5 animate-in zoom-in-95">
            <button
              onClick={() => setShowAssessmentWarning(false)}
              className="absolute top-4 right-4 text-[#8A8A8A] hover:text-[#1E1E1E]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#FFEBE6] border border-[#FF6B4A]/30 text-[#FF6B4A] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#FFEBE6] text-[#FF6B4A] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
                Assessment In Progress
              </span>
              <h3 className="text-xl font-extrabold text-[#1E1E1E] mt-3">
                Complete Your Assessment First
              </h3>
              <p className="text-xs text-[#8A8A8A] mt-2 leading-relaxed">
                Your 10-question technical baseline assessment is currently in progress. Please complete the assessment or fast-forward to unlock all features.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowAssessmentWarning(false)}
                className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all"
              >
                Continue Assessment
              </button>

              <button
                onClick={handleFastForwardAndNavigate}
                className="w-full bg-[#F7F6F3] hover:bg-[#FFEBE6] text-[#FF6B4A] font-bold text-xs py-3 rounded-2xl border border-[#FF6B4A]/30 transition-all flex items-center justify-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Fast-Forward & Exit to {pendingNavHref ? pendingNavHref.replace("/", "") : "page"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
