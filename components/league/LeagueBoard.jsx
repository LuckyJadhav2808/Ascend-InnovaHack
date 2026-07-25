"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/storeContext";
import { getLeagueTierInfo } from "@/components/league/LeagueProgressionWidget";
import { Award, Flame, TrendingUp, ShieldAlert, Sparkles, Clock } from "lucide-react";

// Real-time Monday-to-Sunday season countdown calculator
function calculateTimeUntilSundayEnd() {
  const now = new Date();
  const nextSunday = new Date(now);
  const dayOfWeek = now.getDay();
  // 0 is Sunday. If today is Sunday, season ends tonight at 11:59:59 PM.
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(23, 59, 59, 999);

  const diff = Math.max(0, nextSunday.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

// Track-specific peer candidates template generator
export function getTrackPeers(trackTitle = "Web Developer") {
  const t = trackTitle.toLowerCase();
  if (t.includes("net") || t.includes("c#")) {
    return [
      { userId: "peer_dotnet_1", name: "Michael Thorne (.NET Core)", xp: 1250, streak: 5, avatar: "M", isBot: true },
      { userId: "peer_dotnet_2", name: "Elena Rostova (C# / Azure)", xp: 980, streak: 4, avatar: "E", isBot: true },
      { userId: "peer_dotnet_3", name: "Lucas Vance (ASP.NET)", xp: 740, streak: 3, avatar: "L", isBot: true },
      { userId: "peer_dotnet_4", name: "Amanda Cruz (Microservices)", xp: 420, streak: 2, avatar: "A", isBot: true }
    ];
  }
  if (t.includes("devops") || t.includes("cloud") || t.includes("aws")) {
    return [
      { userId: "peer_devops_1", name: "Vikram Patel (Kubernetes)", xp: 1310, streak: 6, avatar: "V", isBot: true },
      { userId: "peer_devops_2", name: "Chloe Bennett (AWS/Terraform)", xp: 910, streak: 4, avatar: "C", isBot: true },
      { userId: "peer_devops_3", name: "Jordan Hayes (Docker & CI/CD)", xp: 680, streak: 3, avatar: "J", isBot: true },
      { userId: "peer_devops_4", name: "Marcus Vance (Linux Admin)", xp: 390, streak: 2, avatar: "M", isBot: true }
    ];
  }
  if (t.includes("data") || t.includes("ai") || t.includes("ml") || t.includes("python")) {
    return [
      { userId: "peer_ai_1", name: "Dr. Aris Thorne (PyTorch/ML)", xp: 1420, streak: 7, avatar: "A", isBot: true },
      { userId: "peer_ai_2", name: "Priya Sharma (Data Pipeline)", xp: 950, streak: 5, avatar: "P", isBot: true },
      { userId: "peer_ai_3", name: "Kaitlyn Ross (NLP & LLMs)", xp: 710, streak: 3, avatar: "K", isBot: true },
      { userId: "peer_ai_4", name: "David Zhang (SQL Analytics)", xp: 450, streak: 2, avatar: "D", isBot: true }
    ];
  }
  // Default Web Developer track peers
  return [
    { userId: "peer_web_1", name: "Sarah Jenkins (React/Next.js)", xp: 1180, streak: 5, avatar: "S", isBot: true },
    { userId: "peer_web_2", name: "David Kim (Fullstack Node)", xp: 890, streak: 4, avatar: "D", isBot: true },
    { userId: "peer_web_3", name: "Alex Rivera (Frontend UI)", xp: 620, streak: 3, avatar: "A", isBot: true },
    { userId: "peer_web_4", name: "Maya Patel (TypeScript Dev)", xp: 380, streak: 2, avatar: "M", isBot: true }
  ];
}

export function calculateTrackUserRank(user, trackTitle = "") {
  const currentXp = user?.xp || 0;
  const currentTrackTitle = trackTitle || user?.trackTitle || user?.track || "Web Developer";
  const rawTrackPeers = getTrackPeers(currentTrackTitle);

  const currentUserObj = {
    userId: user?.userId || "guest_demo",
    name: user?.name || "Candidate",
    xp: currentXp,
    streak: user?.streak?.current || 1,
    avatar: "⚡",
    isCurrentUser: true
  };

  const combinedMembers = [currentUserObj, ...rawTrackPeers];
  combinedMembers.sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const currentUserIndex = combinedMembers.findIndex(
    (m) => m.userId === user?.userId || m.isCurrentUser
  );
  return currentUserIndex !== -1 ? currentUserIndex + 1 : 1;
}

export default function LeagueBoard({ compact = false }) {
  const { leagueMembers, user, trackTitle } = useStore();
  const [seasonCountdown, setSeasonCountdown] = useState("");

  // Live 1-second ticker for Monday-to-Sunday season countdown (populated on mount to prevent SSR hydration mismatch)
  useEffect(() => {
    setSeasonCountdown(calculateTimeUntilSundayEnd());
    const timer = setInterval(() => {
      setSeasonCountdown(calculateTimeUntilSundayEnd());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentXp = user?.xp || 0;
  const currentTrackTitle = trackTitle || user?.trackTitle || user?.track || "Web Developer";
  const tierInfo = getLeagueTierInfo(currentXp);

  // Filter Firestore members by active track, or generate track-specific competition peers
  const firestoreTrackMembers = (leagueMembers || []).filter(
    (m) => m.track === user?.track || (m.trackTitle && m.trackTitle.toLowerCase() === currentTrackTitle.toLowerCase())
  );

  const rawTrackPeers = getTrackPeers(currentTrackTitle);

  // Combine currentUser + track peers
  const currentUserObj = {
    userId: user?.userId || "guest_demo",
    name: user?.name || "Candidate",
    xp: currentXp,
    streak: user?.streak?.current || 1,
    avatar: "⚡",
    isCurrentUser: true
  };

  const combinedMembers = [currentUserObj, ...rawTrackPeers];
  // Sort descending by XP
  combinedMembers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const safeMembers = combinedMembers.map((m, idx) => ({ ...m, rank: idx + 1 }));

  const membersToDisplay = compact ? safeMembers.slice(0, 5) : safeMembers;
  const currentUserInList = membersToDisplay.find((m) => m.userId === user?.userId || m.isCurrentUser);
  const currentUserIndex = safeMembers.findIndex((m) => m.userId === user?.userId || m.isCurrentUser);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : safeMembers.length;
  const userAbove = currentUserIndex > 0 ? safeMembers[currentUserIndex - 1] : null;
  const xpGapToNextRank = userAbove ? Math.max(10, (userAbove.xp || 0) - currentXp + 10) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D9CFF0] flex items-center justify-center text-[#1E1E1E]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1E1E1E] flex items-center gap-1.5">
              <span>{tierInfo.currentTier}</span>
              <span className="text-[10px] font-extrabold uppercase bg-[#FFEBE6] text-[#FF6B4A] px-2 py-0.5 rounded border border-[#FF6B4A]/20 truncate max-w-[140px]">
                {currentTrackTitle}
              </span>
            </h3>
            <p className="text-[11px] text-[#8A8A8A] flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-[#FF6B4A]" />
              <span>Season ends in <strong className="text-[#1E1E1E]">{seasonCountdown}</strong></span>
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-[#FFEBE6] text-[#FF6B4A] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#FF6B4A]/20 animate-pulse">
          <TrendingUp className="w-3 h-3" /> Live
        </span>
      </div>

      {/* Leaderboard Table / List */}
      <div className="space-y-2.5 my-2">
        {membersToDisplay.map((member, idx) => {
          const isCurrentUser = member.userId === user?.userId || member.isCurrentUser;
          const memberRank = member.rank || idx + 1;
          const isTop3 = memberRank <= 3;
          const displayStreak = isCurrentUser ? (user?.streak?.current || 1) : (member.streak || 1);
          const displayXP = isCurrentUser ? currentXp : (member.xp || 0);

          return (
            <div
              key={member.userId || idx}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
                isCurrentUser
                  ? "bg-[#1E1E1E] text-white shadow-md scale-[1.02]"
                  : "bg-[#F7F6F3] hover:bg-[#F1F1EF] text-[#1E1E1E]"
              }`}
            >
              {/* Rank & Avatar */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 text-center text-xs font-extrabold ${
                    isCurrentUser
                      ? "text-[#FF6B4A]"
                      : memberRank === 1
                      ? "text-[#F6D67A]"
                      : memberRank === 2
                      ? "text-[#8A8A8A]"
                      : memberRank === 3
                      ? "text-[#FF6B4A]"
                      : "text-[#8A8A8A]"
                  }`}
                >
                  #{memberRank}
                </span>

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-xs ${
                    isCurrentUser ? "bg-[#FF6B4A] text-white" : "bg-white border border-[#E5E5E0]"
                  }`}
                >
                  {member.avatar || (member.name ? member.name.charAt(0) : "C")}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs">{member.name || "Candidate"}</span>
                    {isCurrentUser && (
                      <span className="bg-[#FF6B4A] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                        YOU
                      </span>
                    )}
                    {member.isBot && (
                      <span className={`text-[9px] px-1 rounded ${isCurrentUser ? "bg-white/20 text-white/80" : "bg-[#E5E5E0] text-[#8A8A8A]"}`}>
                        Bot
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] ${isCurrentUser ? "text-white/70" : "text-[#8A8A8A]"}`}>
                    <span className="flex items-center gap-0.5 text-[#FF6B4A] font-semibold">
                      <Flame className="w-3 h-3 fill-[#FF6B4A]" /> {displayStreak}d
                    </span>
                  </div>
                </div>
              </div>

              {/* XP Value & Rank Tag */}
              <div className="text-right flex items-center gap-2">
                <div>
                  <span className={`font-extrabold text-sm ${isCurrentUser ? "text-[#F6D67A]" : "text-[#1E1E1E]"}`}>
                    {displayXP.toLocaleString()}
                  </span>
                  <span className={`text-[10px] ml-1 ${isCurrentUser ? "text-white/70" : "text-[#8A8A8A]"}`}>XP</span>
                </div>

                {isTop3 && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pinned Candidate Position Banner if user is below displayed top members */}
      {!currentUserInList && (
        <div className="my-2 pt-2 border-t border-dashed border-[#E5E5E0]">
          <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Your Live Standing</span>
            {xpGapToNextRank > 0 && (
              <span className="text-[#FF6B4A] font-extrabold">+{xpGapToNextRank} XP to pass #{currentUserRank - 1}</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1E1E1E] text-white shadow-md border border-[#FF6B4A]/40">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-extrabold text-[#FF6B4A]">
                #{currentUserRank}
              </span>

              <div className="w-9 h-9 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                {user?.name ? user.name.charAt(0) : "C"}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs">{user?.name || "Candidate"}</span>
                  <span className="bg-[#FF6B4A] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                    YOU
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/70">
                  <span className="flex items-center gap-0.5 text-[#FF6B4A] font-semibold">
                    <Flame className="w-3 h-3 fill-[#FF6B4A]" /> {user?.streak?.current || 1}d
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="font-extrabold text-sm text-[#F6D67A]">
                {currentXp.toLocaleString()}
              </span>
              <span className="text-[10px] ml-1 text-white/70">XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="mt-3 pt-3 border-t border-[#E5E5E0] flex items-center justify-between text-[11px] text-[#8A8A8A]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#B7D9CF]" /> Top 3 Promoted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#F4C9D6]" /> Bottom 2 Demoted
        </span>
      </div>
    </div>
  );
}
