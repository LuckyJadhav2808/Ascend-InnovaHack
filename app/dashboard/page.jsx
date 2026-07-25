"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import SkillGraphVisualizer from "@/components/skillgraph/SkillGraphVisualizer";
import LeagueBoard, { calculateTrackUserRank } from "@/components/league/LeagueBoard";
import { getLeagueTierInfo } from "@/components/league/LeagueProgressionWidget";
import ActiveTrackBar from "@/components/dashboard/ActiveTrackBar";
import ResumeMatchWidget from "@/components/dashboard/ResumeMatchWidget";
import SeasonEndModal from "@/components/ceremony/SeasonEndModal";
import { Sparkles, Trophy, Flame, Target, BookOpen, ArrowRight, Award, Zap, Map, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user, trackTitle, skillGraph, leagueMembers, history } = useStore();
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);
  const [benchmarks, setBenchmarks] = useState(null);

  // Fetch student placement benchmark metrics from dataset API
  useEffect(() => {
    async function fetchBenchmarks() {
      try {
        const res = await fetch("/api/dataset/benchmarks");
        const data = await res.json();
        if (data.success && data.benchmarks) {
          setBenchmarks(data.benchmarks);
        }
      } catch (err) {
        console.warn("Failed to fetch placement benchmarks:", err);
      }
    }
    fetchBenchmarks();
  }, []);

  // Retrieve current user's unified track rank standing
  const currentRank = calculateTrackUserRank(user, trackTitle);

  // Extract weakest nodes from live skill graph
  const nodes = skillGraph?.nodes || [];
  const sortedNodes = [...nodes].sort((a, b) => (a.mastery || 0) - (b.mastery || 0));
  const weakestNode = sortedNodes[0] || { topic: "Technical Architecture", mastery: 0 };
  const secondWeakestNode = sortedNodes[1] || { topic: "Production Concepts", mastery: 0 };
  const thirdWeakestNode = sortedNodes[2] || { topic: "System Optimization", mastery: 0 };

  // Calculate actual plan tasks status against Firestore history
  const hasCompletedDay1 = history.some((h) => h.topic?.toLowerCase().includes(weakestNode.topic.toLowerCase()));
  const hasCompletedDay2 = history.some((h) => h.topic?.toLowerCase().includes(secondWeakestNode.topic.toLowerCase()));

  const tierInfo = getLeagueTierInfo(user?.xp || 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 0. Production Active Track Switcher & Mastery Summary */}
      <ActiveTrackBar />

      {/* 1. Compact Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stat 1: XP */}
        <div className="bg-[#D9CFF0] p-4 rounded-3xl border border-[#D9CFF0]/60 shadow-card hover-lift transition-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1E1E1E]/70 uppercase tracking-wider">XP Earned</span>
            <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center text-[#1E1E1E]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#1E1E1E] leading-none">{user.xp || 0}</div>
            <span className="text-[10px] text-[#1E1E1E]/70 font-semibold mt-0.5 inline-block">Total XP</span>
          </div>
        </div>

        {/* Stat 2: Division Tier */}
        <div className="bg-[#F4C9D6] p-4 rounded-3xl border border-[#F4C9D6]/60 shadow-card hover-lift transition-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1E1E1E]/70 uppercase tracking-wider">Division</span>
            <span className="text-lg">{tierInfo.icon}</span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-extrabold text-[#1E1E1E] leading-none">{tierInfo.currentTier.replace(' League', '')}</div>
            <span className="text-[10px] text-[#1E1E1E]/70 font-semibold mt-0.5 inline-block">
              {tierInfo.nextTier ? `${tierInfo.xpNeeded} XP to next` : "Max Tier"}
            </span>
          </div>
        </div>

        {/* Stat 3: Leaderboard Rank */}
        <div className="bg-[#F6D67A] p-4 rounded-3xl border border-[#F6D67A]/60 shadow-card hover-lift transition-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1E1E1E]/70 uppercase tracking-wider">Rank</span>
            <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center text-[#1E1E1E]">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#1E1E1E] leading-none">#{currentRank}</div>
            <span className="text-[10px] text-[#1E1E1E]/70 font-semibold mt-0.5 inline-block">In {tierInfo.currentTier}</span>
          </div>
        </div>

        {/* Stat 4: Questions Answered */}
        <div className="bg-[#B7D9CF] p-4 rounded-3xl border border-[#B7D9CF]/60 shadow-card hover-lift transition-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1E1E1E]/70 uppercase tracking-wider">Qs Solved</span>
            <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center text-[#1E1E1E]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#1E1E1E] leading-none">{user.questionsAnswered || 0}</div>
            <span className="text-[10px] text-[#1E1E1E]/70 font-semibold mt-0.5 inline-block">Practice sessions</span>
          </div>
        </div>
      </div>

      {/* Compact Tier Progress Strip (dashboard only — full view on Profile) */}
      {tierInfo.nextTier && (
        <div className="bg-white rounded-2xl px-5 py-3.5 border border-[#E5E5E0] shadow-card flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xl">{tierInfo.icon}</span>
            <div>
              <span className="text-xs font-extrabold text-[#1E1E1E]">{tierInfo.currentTier}</span>
              <span className="text-[10px] text-[#8A8A8A] ml-1.5">→ {tierInfo.nextTier}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B4A] via-[#F6D67A] to-[#86C2B2] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(4, tierInfo.progressPercent)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-extrabold text-[#FF6B4A]">{tierInfo.xpNeeded} XP left</span>
            <Link href="/profile" className="text-[10px] font-bold text-[#8A8A8A] hover:text-[#1E1E1E] underline underline-offset-2 transition-colors">
              Details
            </Link>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (60%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Practice Hero Card (Targeting Candidate's Actual Weakest Node) */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase bg-[#FF6B4A] text-white px-2.5 py-0.5 rounded-full">
                  Today's AI Target Node
                </span>
                <span className="text-xs text-[#8A8A8A] font-semibold">
                  {trackTitle || user.track || "Active Track"}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#1E1E1E] mt-3">
                {weakestNode.topic}
              </h2>
              <p className="text-xs text-[#8A8A8A] mt-1 max-w-md leading-relaxed">
                Your live skill graph flagged <strong className="text-[#1E1E1E]">{weakestNode.topic}</strong> (current mastery: {weakestNode.mastery}%) as your #1 weak node. Solve today's adaptive question to boost your mastery.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#E5E5E0]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E1E1E]">
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                <span>Status: {weakestNode.status || "weak"} • +150 XP Reward</span>
              </div>

              <Link
                href="/practice"
                className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 transition-all"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
              </Link>
            </div>
          </div>

          {/* Actual 4-Day Personalized Plan Summary Widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-[#FF6B4A]" />
                <h3 className="font-bold text-sm text-[#1E1E1E]">Personalized 4-Day Plan</h3>
              </div>
              <Link href="/roadmap" className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1">
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!user.track || nodes.length === 0 ? (
              <div className="p-6 text-center space-y-3 bg-[#F7F6F3] rounded-2xl border border-[#E5E5E0]">
                <Map className="w-8 h-8 text-[#FF6B4A] mx-auto opacity-70" />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1E1E1E]">No Active Track Selected</h4>
                  <p className="text-xs text-[#8A8A8A] mt-1 max-w-xs mx-auto">
                    Select a technical track from our 1,000+ dataset roles or create a custom track to generate your AI study plan.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-1.5 bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  <span>Select Track Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F6D67A]" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E5E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#FF6B4A] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      D1
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#1E1E1E]">{weakestNode.topic}</div>
                      <span className="text-[10px] text-[#8A8A8A]">Target Node #1 • {weakestNode.mastery}% Mastery</span>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${hasCompletedDay1 ? "text-[#86C2B2] fill-[#E8F4F0]" : "text-[#E5E5E0]"}`} />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E5E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#F1F1EF] text-[#1E1E1E] font-extrabold text-xs flex items-center justify-center shrink-0">
                      D2
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#1E1E1E]">{secondWeakestNode.topic}</div>
                      <span className="text-[10px] text-[#8A8A8A]">Target Node #2 • {secondWeakestNode.mastery}% Mastery</span>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${hasCompletedDay2 ? "text-[#86C2B2] fill-[#E8F4F0]" : "text-[#E5E5E0]"}`} />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E5E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#F1F1EF] text-[#1E1E1E] font-extrabold text-xs flex items-center justify-center shrink-0">
                      D3
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#1E1E1E]">{thirdWeakestNode.topic}</div>
                      <span className="text-[10px] text-[#8A8A8A]">Target Node #3 • {thirdWeakestNode.mastery}% Mastery</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#E5E5E0]" />
                </div>
              </div>
            )}
          </div>

          {/* D3 Visual Skill Graph Panel with Accessibility Toggle */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1E1E1E]">Visual Skill Graph</h3>
                <p className="text-[11px] text-[#8A8A8A]">Interactive node mastery & status visualization</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#B7D9CF]" /> Strong</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F6D67A]" /> OK</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F4C9D6]" /> Weak</span>
              </div>
            </div>

            <SkillGraphVisualizer graphData={skillGraph} compact={true} />
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* ATS Resume Skill Alignment Widget */}
          <ResumeMatchWidget />

          {/* League Leaderboard Card */}
          <LeagueBoard compact={true} />

          {/* Placement Dataset Benchmark Card */}
          {benchmarks && (
            <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#86C2B2]" />
                <h3 className="font-bold text-sm text-[#1E1E1E]">2026 Candidate Benchmarks</h3>
              </div>
              <p className="text-xs text-[#8A8A8A]">
                Based on dataset analytics from {benchmarks.totalStudents?.toLocaleString() || "20,000"} engineering candidates:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#F7F6F3] border border-[#E5E5E0]">
                  <div className="text-[10px] text-[#8A8A8A] font-bold uppercase">Avg DSA Solved</div>
                  <div className="text-lg font-extrabold text-[#1E1E1E] mt-0.5">{benchmarks.avgProblemsSolved} Qs</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F6F3] border border-[#E5E5E0]">
                  <div className="text-[10px] text-[#8A8A8A] font-bold uppercase">Avg Placed Package</div>
                  <div className="text-lg font-extrabold text-[#86C2B2] mt-0.5">{benchmarks.avgSalaryLPA} LPA</div>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Demo Ceremony Card */}
          <div className="bg-[#FFEBE6] border border-[#FF6B4A]/30 p-5 rounded-3xl shadow-card flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-[#1E1E1E]">Simulate Season End</div>
              <p className="text-[11px] text-[#8A8A8A] mt-0.5">Trigger promotion/demotion ceremony animation</p>
            </div>

            <button
              onClick={() => setIsCeremonyOpen(true)}
              className="bg-[#FF6B4A] hover:bg-[#E05536] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-105"
            >
              Play Ceremony
            </button>
          </div>
        </div>
      </div>

      {/* Season End Ceremony Modal */}
      <SeasonEndModal
        isOpen={isCeremonyOpen}
        onClose={() => setIsCeremonyOpen(false)}
        userRank={currentRank}
        userXP={user.xp || 0}
      />
    </div>
  );
}
