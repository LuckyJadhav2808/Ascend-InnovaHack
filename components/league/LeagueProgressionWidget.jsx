"use client";

import React from "react";
import { useStore } from "@/lib/storeContext";
import { Award, Trophy, Zap, ArrowRight, ShieldCheck, Flame, Lock, CheckCircle2, Sparkles } from "lucide-react";

export function getLeagueTierInfo(xp = 0) {
  if (xp >= 7000) {
    return {
      currentTier: "Master League",
      icon: "👑",
      color: "#FFD700",
      bg: "bg-[#FFF9E6]",
      textColor: "text-[#D9A01D]",
      borderColor: "border-[#F6D67A]",
      minXp: 7000,
      nextTier: null,
      nextMinXp: null,
      progressPercent: 100,
      xpNeeded: 0
    };
  }
  if (xp >= 3500) {
    return {
      currentTier: "Diamond League",
      icon: "💎",
      color: "#86C2B2",
      bg: "bg-[#E8F4F0]",
      textColor: "text-[#86C2B2]",
      borderColor: "border-[#86C2B2]",
      minXp: 3500,
      nextTier: "Master League 👑",
      nextMinXp: 7000,
      progressPercent: Math.round(((xp - 3500) / (7000 - 3500)) * 100),
      xpNeeded: 7000 - xp
    };
  }
  if (xp >= 1500) {
    return {
      currentTier: "Gold League",
      icon: "🥇",
      color: "#F6D67A",
      bg: "bg-[#FFF8E6]",
      textColor: "text-[#D9A01D]",
      borderColor: "border-[#F6D67A]",
      minXp: 1500,
      nextTier: "Diamond League 💎",
      nextMinXp: 3500,
      progressPercent: Math.round(((xp - 1500) / (3500 - 1500)) * 100),
      xpNeeded: 3500 - xp
    };
  }
  if (xp >= 500) {
    return {
      currentTier: "Silver League",
      icon: "🥈",
      color: "#8A8A8A",
      bg: "bg-[#F7F6F3]",
      textColor: "text-[#1E1E1E]",
      borderColor: "border-[#E5E5E0]",
      minXp: 500,
      nextTier: "Gold League 🥇",
      nextMinXp: 1500,
      progressPercent: Math.round(((xp - 500) / (1500 - 500)) * 100),
      xpNeeded: 1500 - xp
    };
  }
  return {
    currentTier: "Bronze League",
    icon: "🥉",
    color: "#FF6B4A",
    bg: "bg-[#FFEBE6]",
    textColor: "text-[#FF6B4A]",
    borderColor: "border-[#FF6B4A]",
    minXp: 0,
    nextTier: "Silver League 🥈",
    nextMinXp: 500,
    progressPercent: Math.round((xp / 500) * 100),
    xpNeeded: 500 - xp
  };
}

const LEAGUE_STAGES = [
  { name: "Bronze", icon: "🥉", minXp: 0, threshold: "0 - 499 XP" },
  { name: "Silver", icon: "🥈", minXp: 500, threshold: "500 - 1,499 XP" },
  { name: "Gold", icon: "🥇", minXp: 1500, threshold: "1,500 - 3,499 XP" },
  { name: "Diamond", icon: "💎", minXp: 3500, threshold: "3,500 - 6,999 XP" },
  { name: "Master", icon: "👑", minXp: 7000, threshold: "7,000+ XP" }
];

export default function LeagueProgressionWidget() {
  const { user } = useStore();
  const currentXp = user?.xp || 0;
  const tierInfo = getLeagueTierInfo(currentXp);

  // Estimate number of practice questions needed (~120 XP per practice answer)
  const estimatedPracticeNeeded = tierInfo.xpNeeded > 0 ? Math.ceil(tierInfo.xpNeeded / 120) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${tierInfo.bg} ${tierInfo.borderColor} border-2 flex items-center justify-center text-2xl shadow-xs shrink-0`}>
            {tierInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-[#1E1E1E] text-white px-2.5 py-0.5 rounded-full tracking-wider">
                Active Tier
              </span>
              <span className={`text-xs font-bold ${tierInfo.textColor}`}>
                {tierInfo.currentTier}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#1E1E1E] mt-0.5">
              Division XP Progression
            </h3>
          </div>
        </div>

        {/* Current XP Display */}
        <div className="bg-[#F7F6F3] p-3.5 rounded-2xl border border-[#E5E5E0] flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#F6D67A] text-[#1E1E1E] flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 fill-[#1E1E1E]" />
          </div>
          <div>
            <div className="text-xs text-[#8A8A8A] font-bold">Total XP Balance</div>
            <div className="text-base font-extrabold text-[#1E1E1E] leading-none">
              {currentXp.toLocaleString()} <span className="text-xs text-[#FF6B4A]">XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Progress Bar & XP Needed Callout */}
      {tierInfo.nextTier ? (
        <div className="bg-[#F7F6F3] p-5 rounded-2xl border border-[#E5E5E0] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#1E1E1E]">
            <span className="flex items-center gap-1.5">
              <span>Progress to {tierInfo.nextTier}</span>
            </span>
            <span className="text-[#FF6B4A] font-extrabold">
              {tierInfo.progressPercent}% Completed
            </span>
          </div>

          {/* Visual Gradient Progress Bar */}
          <div className="w-full bg-[#E5E5E0] h-3.5 rounded-full overflow-hidden p-0.5 relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B4A] via-[#F6D67A] to-[#86C2B2] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(4, tierInfo.progressPercent)}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 text-[#1E1E1E] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
              <span>
                Need <strong className="text-[#FF6B4A] font-extrabold">{tierInfo.xpNeeded.toLocaleString()} XP</strong> more to unlock {tierInfo.nextTier}
              </span>
            </div>

            {estimatedPracticeNeeded > 0 && (
              <span className="text-[11px] font-bold bg-white text-[#8A8A8A] px-3 py-1 rounded-full border border-[#E5E5E0] shrink-0">
                ~{estimatedPracticeNeeded} practice answers away
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF9E6] p-5 rounded-2xl border border-[#F6D67A] text-center space-y-2">
          <Sparkles className="w-6 h-6 text-[#D9A01D] mx-auto" />
          <h4 className="font-extrabold text-base text-[#1E1E1E]">👑 Master Division Unlocked!</h4>
          <p className="text-xs text-[#8A8A8A]">You have reached the highest league division in Ascend. Keep practicing to maintain your #1 spot on the global legend board!</p>
        </div>
      )}

      {/* Division Ladder Stages */}
      <div className="space-y-2">
        <div className="text-xs font-extrabold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#FF6B4A]" />
          <span>League Division Ladder</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {LEAGUE_STAGES.map((stage) => {
            const isUnlocked = currentXp >= stage.minXp;
            const isCurrent = tierInfo.currentTier.toLowerCase().includes(stage.name.toLowerCase());

            return (
              <div
                key={stage.name}
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-md scale-[1.03]"
                    : isUnlocked
                    ? "bg-[#E8F4F0]/60 text-[#1E1E1E] border-[#86C2B2]/40"
                    : "bg-[#F7F6F3] text-[#8A8A8A] border-[#E5E5E0] opacity-75"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{stage.icon}</span>
                  {isCurrent ? (
                    <span className="text-[9px] font-extrabold bg-[#FF6B4A] text-white px-1.5 py-0.2 rounded uppercase">
                      Active
                    </span>
                  ) : isUnlocked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#86C2B2]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#8A8A8A]" />
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  <div className={`font-extrabold text-xs ${isCurrent ? "text-white" : "text-[#1E1E1E]"}`}>
                    {stage.name}
                  </div>
                  <div className={`text-[10px] font-medium ${isCurrent ? "text-white/70" : "text-[#8A8A8A]"}`}>
                    {stage.threshold}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
