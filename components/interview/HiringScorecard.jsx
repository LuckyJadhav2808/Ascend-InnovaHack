"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Trophy, Zap, ArrowRight, ShieldCheck, Award } from "lucide-react";

export default function HiringScorecard({ scorecard, onRestart }) {
  if (!scorecard) return null;

  const { hiringDecision = "HIRE", decisionSummary = "", scores = {}, strengths = [], redFlags = [], keyTakeaways = [], recommendedDatasetTopics = [] } = scorecard;

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case "STRONG HIRE":
        return {
          bg: "bg-[#B7D9CF]",
          border: "border-[#86C2B2]",
          text: "text-[#1E1E1E]",
          label: "STRONG HIRE",
          icon: Trophy
        };
      case "HIRE":
        return {
          bg: "bg-[#E8F4F0]",
          border: "border-[#86C2B2]",
          text: "text-[#1E1E1E]",
          label: "HIRE",
          icon: ShieldCheck
        };
      case "LEAN NO":
        return {
          bg: "bg-[#F6D67A]",
          border: "border-[#E5E5E0]",
          text: "text-[#1E1E1E]",
          label: "LEAN NO",
          icon: AlertTriangle
        };
      default:
        return {
          bg: "bg-[#FCEBF0]",
          border: "border-[#F4C9D6]",
          text: "text-[#FF6B4A]",
          label: "NO HIRE",
          icon: AlertTriangle
        };
    }
  };

  const badgeStyle = getDecisionBadge(hiringDecision);
  const BadgeIcon = badgeStyle.icon;

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card space-y-8 animate-in fade-in duration-300">
      {/* Hiring Decision Banner */}
      <div className={`p-6 rounded-3xl border ${badgeStyle.bg} ${badgeStyle.border} flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm`}>
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md shrink-0">
            <BadgeIcon className="w-8 h-8 text-[#1E1E1E]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#1E1E1E]/70 bg-white/60 px-3 py-1 rounded-full">
              Bar-Raiser Executive Hiring Recommendation
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1E1E1E] mt-1">
              {badgeStyle.label}
            </h2>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 text-center min-w-[140px] shadow-xs">
          <span className="text-xs font-bold text-[#8A8A8A] block uppercase tracking-wider">Overall Rating</span>
          <span className="text-3xl font-extrabold text-[#1E1E1E]">{scores.overall || 75}</span>
          <span className="text-xs font-semibold text-[#8A8A8A]"> / 100</span>
        </div>
      </div>

      {/* Decision Summary */}
      <div className="bg-[#F7F6F3] p-5 rounded-2xl border border-[#E5E5E0] space-y-1">
        <h4 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Interviewer Executive Summary</h4>
        <p className="text-sm text-[#1E1E1E] font-medium leading-relaxed">
          "{decisionSummary}"
        </p>
      </div>

      {/* Dimensional Performance Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Dimensional Performance Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* System Design */}
          <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
              <span>System Design</span>
              <span>{scores.systemDesign || 70}/100</span>
            </div>
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#1E1E1E] h-full rounded-full transition-all duration-500" style={{ width: `${scores.systemDesign || 70}%` }} />
            </div>
          </div>

          {/* Communication */}
          <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
              <span>Technical Clarity</span>
              <span>{scores.communication || 75}/100</span>
            </div>
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#86C2B2] h-full rounded-full transition-all duration-500" style={{ width: `${scores.communication || 75}%` }} />
            </div>
          </div>

          {/* Code Efficiency */}
          <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
              <span>Code Efficiency</span>
              <span>{scores.codeEfficiency || 80}/100</span>
            </div>
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#FF6B4A] h-full rounded-full transition-all duration-500" style={{ width: `${scores.codeEfficiency || 80}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Red Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-[#E8F4F0] p-5 rounded-2xl border border-[#B7D9CF] space-y-2">
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#86C2B2]" /> Key Strengths Evaluated
          </h4>
          <ul className="space-y-2 text-xs text-[#1E1E1E] font-medium">
            {strengths && strengths.length > 0 ? (
              strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#86C2B2] font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li className="text-[#8A8A8A]">Demonstrated clear technical engagement during screen.</li>
            )}
          </ul>
        </div>

        {/* Red Flags / Gaps */}
        <div className="bg-[#FCEBF0] p-5 rounded-2xl border border-[#F4C9D6] space-y-2">
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B4A]" /> Anti-Pattern Red Flags & Gaps
          </h4>
          <ul className="space-y-2 text-xs text-[#1E1E1E] font-medium">
            {redFlags && redFlags.length > 0 ? (
              redFlags.map((rf, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#FF6B4A] font-bold">•</span>
                  <span>{rf}</span>
                </li>
              ))
            ) : (
              <li className="text-[#8A8A8A]">No critical red flags detected.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E5E0]">
        <button
          onClick={onRestart}
          className="bg-[#F7F6F3] hover:bg-[#FFEBE6] text-[#1E1E1E] hover:text-[#FF6B4A] border border-[#E5E5E0] font-extrabold text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New Mock Screen</span>
        </button>

        <a
          href="/dashboard"
          className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 transition-all"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
        </a>
      </div>
    </div>
  );
}
