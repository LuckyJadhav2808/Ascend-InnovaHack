"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import { Layers, ChevronDown, Check, Sparkles, ArrowRight, Target, Flame, RotateCcw } from "lucide-react";

const POPULAR_TRACKS = [
  { id: "sde-backend", title: "Web Developer (Fullstack / Backend)" },
  { id: "dotnet-developer", title: ".NET Developer (C# / Azure)" },
  { id: "devops-engineer", title: "DevOps & Cloud Systems" },
  { id: "data-scientist", title: "Data Science & AI / ML" }
];

export default function ActiveTrackBar() {
  const { user, trackTitle, skillGraph, selectTrack } = useStore();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const currentTrackTitle = trackTitle || user?.trackTitle || user?.track || "Web Developer";
  const nodes = skillGraph?.nodes || [];

  const strongCount = nodes.filter((n) => n.status === "strong" || (n.mastery || 0) >= 70).length;
  const developingCount = nodes.filter((n) => (n.mastery || 0) >= 30 && (n.mastery || 0) < 70).length;
  const weakCount = nodes.filter((n) => n.status === "weak" || (n.mastery || 0) < 30).length;

  const totalMastery = nodes.length > 0
    ? Math.round(nodes.reduce((acc, curr) => acc + (curr.mastery || 0), 0) / nodes.length)
    : 0;

  const handleSelectTrack = async (trackId, title) => {
    setIsSwitching(true);
    setIsOpen(false);
    try {
      await selectTrack(trackId, title);
      toast.success(`Switched active track to ${title}`);
    } catch (e) {
      toast.error("Failed to switch track");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E5E5E0] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-[#FFEBE6] border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A] shrink-0">
          <Layers className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-[#FF6B4A] text-white px-2 py-0.5 rounded-full tracking-wider">
              Active Track
            </span>
            <span className="text-xs font-bold text-[#8A8A8A] flex items-center gap-1">
              <Target className="w-3 h-3 text-[#86C2B2]" /> {totalMastery}% Total Mastery
            </span>
          </div>

          <div className="relative mt-0.5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 font-extrabold text-base text-[#1E1E1E] hover:text-[#FF6B4A] transition-colors truncate text-left"
            >
              <span className="truncate">{currentTrackTitle}</span>
              <ChevronDown className={`w-4 h-4 text-[#FF6B4A] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Quick Track Switcher Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-[#E5E5E0] shadow-2xl z-50 p-2 space-y-1 animate-in zoom-in-95 duration-150">
                <div className="text-[10px] font-extrabold uppercase text-[#8A8A8A] px-3 py-1 tracking-wider">
                  Switch Target Track
                </div>

                {POPULAR_TRACKS.map((t) => {
                  const isSelected = (user.track === t.id) || (currentTrackTitle.toLowerCase() === t.title.toLowerCase());
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTrack(t.id, t.title)}
                      disabled={isSwitching}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-[#1E1E1E] text-white"
                          : "text-[#1E1E1E] hover:bg-[#F7F6F3]"
                      }`}
                    >
                      <span className="truncate">{t.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F6D67A] shrink-0" />}
                    </button>
                  );
                })}

                <div className="pt-1.5 border-t border-[#E5E5E0]">
                  <Link
                    href="/onboarding"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#FF6B4A] hover:bg-[#FFEBE6] flex items-center justify-between transition-colors"
                  >
                    <span>+ Explore 1,000+ Dataset Tracks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mastery Breakdown Pills */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-[#E8F4F0] border border-[#86C2B2]/30 px-3 py-1.5 rounded-2xl text-center">
          <span className="text-xs font-extrabold text-[#86C2B2]">{strongCount}</span>
          <span className="text-[10px] font-bold text-[#1E1E1E]/70 ml-1">Strong</span>
        </div>
        <div className="bg-[#FFF8E6] border border-[#F6D67A]/50 px-3 py-1.5 rounded-2xl text-center">
          <span className="text-xs font-extrabold text-[#D9A01D]">{developingCount}</span>
          <span className="text-[10px] font-bold text-[#1E1E1E]/70 ml-1">Developing</span>
        </div>
        <div className="bg-[#FFEBE6] border border-[#FF6B4A]/30 px-3 py-1.5 rounded-2xl text-center">
          <span className="text-xs font-extrabold text-[#FF6B4A]">{weakCount}</span>
          <span className="text-[10px] font-bold text-[#1E1E1E]/70 ml-1">Weak</span>
        </div>
      </div>
    </div>
  );
}
