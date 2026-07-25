"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Award, ArrowUp, Sparkles, X } from "lucide-react";
import { useStore } from "@/lib/storeContext";

export default function SeasonEndModal({ isOpen, onClose }) {
  const { user, leagueMembers } = useStore();

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMember = (leagueMembers && leagueMembers.length > 0)
    ? (leagueMembers.find((m) => m.userId === user?.userId) || leagueMembers[0])
    : { rank: 1, xp: user?.xp || 500 };

  const memberRank = currentMember?.rank || 1;
  const memberXp = currentMember?.xp || user?.xp || 500;
  const isPromoted = memberRank <= 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E5E0] shadow-2xl relative text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8A8A8A] hover:text-[#1E1E1E] rounded-full hover:bg-[#F7F6F3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ceremony Trophy Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFEBE6] border-2 border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A] shadow-md animate-bounce">
          <Trophy className="w-10 h-10 fill-[#FF6B4A]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full">
            Season Ceremony
          </span>
          <h2 className="text-2xl font-extrabold text-[#1E1E1E] mt-3">
            {isPromoted ? "🎉 You Got Promoted!" : "Season Concluded!"}
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-1">
            {isPromoted
              ? `Outstanding performance! You finished #${memberRank} in Gold League with ${memberXp} XP.`
              : `Great effort this season! You finished #${memberRank} with ${memberXp} XP.`}
          </p>
        </div>

        {/* Rank Achievement Badge */}
        <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] flex items-center justify-around">
          <div className="text-center">
            <span className="text-[10px] text-[#8A8A8A] uppercase font-bold">Final Rank</span>
            <div className="text-xl font-extrabold text-[#1E1E1E]">#{memberRank}</div>
          </div>
          <div className="h-8 w-px bg-[#E5E5E0]" />
          <div className="text-center">
            <span className="text-[10px] text-[#8A8A8A] uppercase font-bold">Total XP</span>
            <div className="text-xl font-extrabold text-[#FF6B4A]">{memberXp}</div>
          </div>
          <div className="h-8 w-px bg-[#E5E5E0]" />
          <div className="text-center">
            <span className="text-[10px] text-[#8A8A8A] uppercase font-bold">Next Division</span>
            <div className="text-xs font-bold text-[#86C2B2] flex items-center gap-1 mt-1">
              <ArrowUp className="w-3 h-3" /> Diamond
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md hover:scale-105 transition-all"
        >
          Claim Rewards & Start New Season
        </button>
      </div>
    </div>
  );
}
