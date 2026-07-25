"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import InterviewStage from "@/components/interview/InterviewStage";
import HiringScorecard from "@/components/interview/HiringScorecard";
import { Sparkles, Bot, Mic, ShieldCheck, Trophy, ArrowRight, Loader2, Play } from "lucide-react";

export default function MockInterviewPage() {
  const { track, trackTitle, skillGraph } = useStore();
  const toast = useToast();

  const [viewState, setViewState] = useState("setup"); // "setup" | "interviewing" | "scorecard"
  const [selectedDifficulty, setSelectedDifficulty] = useState("Senior");
  const [session, setSession] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const handleStartInterview = async () => {
    setIsStartingSession(true);
    toast.info("Initializing Staff Engineer Interview Room...");

    try {
      const res = await fetch("/api/mock-interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: track || "web-developer",
          difficulty: selectedDifficulty,
          skillGraph
        })
      });

      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setViewState("interviewing");
        toast.success("Interview session live! Stage 1 initialized.");
      } else {
        toast.error("Failed to start session. Please try again.");
      }
    } catch (err) {
      console.warn("Session init error:", err);
      toast.error("Network error starting interview.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const { recordPracticeEvaluation, addXP, updateStreak } = useStore();

  const handleCompleteInterview = async (finalTranscript) => {
    try {
      const res = await fetch("/api/mock-interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: finalTranscript,
          track: track || "web-developer",
          difficulty: selectedDifficulty
        })
      });

      const data = await res.json();
      if (data.success && data.scorecard) {
        const sc = data.scorecard;
        setScorecard(sc);
        setViewState("scorecard");

        const overall = sc.scores?.overall || 0;
        const xpEarned =
          sc.hiringDecision === "STRONG HIRE"
            ? 250
            : sc.hiringDecision === "HIRE"
            ? 200
            : sc.hiringDecision === "LEAN NO" && overall >= 40
            ? 70
            : 0;

        // Record in candidate profile history & update streak
        recordPracticeEvaluation({
          topic: `AI Technical Screen (${selectedDifficulty})`,
          prompt: `1-on-1 Mock Interview Screen (${sc.hiringDecision})`,
          answerText: `Completed 3-stage screen. Overall Rating: ${overall}/100`,
          score: overall,
          xpAwarded: xpEarned,
          feedback: sc.decisionSummary || "Technical screen evaluation completed."
        });
        updateStreak();

        if (xpEarned > 0) {
          toast.xp(`+${xpEarned} XP Earned! Hiring Recommendation: ${sc.hiringDecision}`);
        } else {
          toast.warning(`Hiring Recommendation: ${sc.hiringDecision} (Score: ${overall}/100 — 0 XP). Try again to improve!`);
        }
      } else {
        toast.error("Error evaluating interview.");
      }
    } catch (err) {
      console.warn("Evaluation error:", err);
      toast.error("Network error submitting interview.");
    }
  };

  const handleRestart = () => {
    setViewState("setup");
    setSession(null);
    setScorecard(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {viewState === "setup" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
                1-on-1 AI Technical Screen
              </span>
              <h1 className="text-2xl font-extrabold text-[#1E1E1E] mt-2">
                Senior Staff Engineer Mock Interview Simulator
              </h1>
              <p className="text-xs text-[#8A8A8A] mt-1">
                Real-time 3-stage voice & text screen evaluating system design, technical trade-offs, and failure recovery.
              </p>
            </div>
          </div>

          {/* AI Staff Engineer Avatar Banner */}
          <div className="bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 bg-[#1E1E1E] text-white rounded-3xl flex items-center justify-center font-extrabold text-2xl shadow-md">
                  <Bot className="w-10 h-10 text-[#F6D67A]" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#86C2B2] border-4 border-white rounded-full animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold bg-[#B7D9CF] text-[#1E1E1E] px-2.5 py-0.5 rounded-full">
                    Bar-Raiser Interviewer
                  </span>
                  <span className="text-xs font-bold text-[#8A8A8A]">Active Track: {trackTitle || "Web Developer"}</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#1E1E1E]">
                  Alex Rivera • Senior Staff Engineer
                </h2>
                <p className="text-xs text-[#8A8A8A]">
                  Conducts adaptive 3-stage screens and issues official Hiring Decision Scorecards.
                </p>
              </div>
            </div>

            {/* Difficulty Level Selector */}
            <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-3 w-full md:w-auto">
              <label className="text-[10px] font-extrabold text-[#1E1E1E] uppercase tracking-wider block">
                Target Interview Level
              </label>
              <div className="flex gap-2">
                {["Mid-Level", "Senior", "Staff Engineer"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedDifficulty === lvl
                        ? "bg-[#1E1E1E] text-white shadow-xs"
                        : "bg-white text-[#8A8A8A] border border-[#E5E5E0] hover:text-[#1E1E1E]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Stage Process Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="text-[10px] font-extrabold text-[#FF6B4A] uppercase tracking-widest">Stage 1</span>
              <h3 className="text-sm font-bold text-[#1E1E1E]">System Architecture</h3>
              <p className="text-xs text-[#8A8A8A]">High-level component layout, API gateway design, and data store selection.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="text-[10px] font-extrabold text-[#FF6B4A] uppercase tracking-widest">Stage 2</span>
              <h3 className="text-sm font-bold text-[#1E1E1E]">Technical Probe</h3>
              <p className="text-xs text-[#8A8A8A]">Deep-dive probing into time complexity, cache invalidation, and replication lag.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E5E0] space-y-1">
              <span className="text-[10px] font-extrabold text-[#FF6B4A] uppercase tracking-widest">Stage 3</span>
              <h3 className="text-sm font-bold text-[#1E1E1E]">Failure Recovery</h3>
              <p className="text-xs text-[#8A8A8A]">Handling cache stampedes, circuit breaker fallbacks, and emergency scaling.</p>
            </div>
          </div>

          {/* Start CTA Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartInterview}
              disabled={isStartingSession}
              className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm px-8 py-4 rounded-2xl flex items-center gap-3 shadow-md hover:scale-105 transition-all"
            >
              {isStartingSession ? <Loader2 className="w-5 h-5 animate-spin text-[#F6D67A]" /> : <Play className="w-5 h-5 fill-[#F6D67A] text-[#F6D67A]" />}
              <span>{isStartingSession ? "Launching Simulator..." : "Start AI Technical Screen"}</span>
            </button>
          </div>
        </div>
      )}

      {viewState === "interviewing" && session && (
        <InterviewStage session={session} onCompleteInterview={handleCompleteInterview} />
      )}

      {viewState === "scorecard" && scorecard && (
        <HiringScorecard scorecard={scorecard} onRestart={handleRestart} />
      )}
    </div>
  );
}
