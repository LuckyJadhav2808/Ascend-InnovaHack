"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Sparkles, Copy, Check, ShieldCheck, Zap, ArrowUpRight, Award, RefreshCw } from "lucide-react";
import { useToast } from "@/lib/toastContext";

export default function ResumeFeedbackStudio({ evaluation, onReset }) {
  const toast = useToast();
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!evaluation) return null;

  const {
    atsScore = 75,
    atsTier = "COMPETITIVE",
    summaryAdvice = "",
    sectionScores = {},
    actionableAdvice = [],
    bulletRewrites = [],
    matchedKeywords = [],
    missingKeywords = [],
    targetTrack = "Web Developer"
  } = evaluation;

  const handleCopyRewrite = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("AI bullet rewrite copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "ELITE ATS READY":
        return { bg: "bg-[#B7D9CF]", text: "text-[#1E1E1E]", border: "border-[#86C2B2]" };
      case "COMPETITIVE":
        return { bg: "bg-[#E8F4F0]", text: "text-[#1E1E1E]", border: "border-[#86C2B2]" };
      case "NEEDS IMPACT":
        return { bg: "bg-[#F6D67A]", text: "text-[#1E1E1E]", border: "border-[#E5E5E0]" };
      default:
        return { bg: "bg-[#FCEBF0]", text: "text-[#FF6B4A]", border: "border-[#F4C9D6]" };
    }
  };

  const tierStyle = getTierColor(atsTier);

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & ATS Score Gauge */}
      <div className={`p-6 rounded-3xl border ${tierStyle.bg} ${tierStyle.border} flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs`}>
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white/90 backdrop-blur-md flex flex-col items-center justify-center shadow-md shrink-0">
            <span className="text-3xl font-extrabold text-[#1E1E1E] leading-none">{atsScore}</span>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#8A8A8A] mt-1">/ 100 ATS</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/70 px-3 py-1 rounded-full text-[#1E1E1E]">
              ATS Match Analysis • {targetTrack.toUpperCase()}
            </span>
            <h2 className="text-2xl font-extrabold text-[#1E1E1E] mt-1">
              {atsTier}
            </h2>
            <p className="text-xs text-[#1E1E1E]/80 font-medium leading-relaxed max-w-xl">
              {summaryAdvice}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="bg-white hover:bg-[#F7F6F3] text-[#1E1E1E] border border-white/60 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs shrink-0 transition-all hover:scale-105"
        >
          <RefreshCw className="w-4 h-4 text-[#8A8A8A]" />
          <span>Analyze Another Resume</span>
        </button>
      </div>

      {/* Section Breakdown Ratings */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Section ATS Ratings</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
              <span>Bullet Impact & Metrics</span>
              <span>{sectionScores.bulletImpact || 70}/100</span>
            </div>
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#FF6B4A] h-full rounded-full transition-all duration-500" style={{ width: `${sectionScores.bulletImpact || 70}%` }} />
            </div>
          </div>

          <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
              <span>Skill & Keyword Alignment</span>
              <span>{sectionScores.skillAlignment || 75}/100</span>
            </div>
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#86C2B2] h-full rounded-full transition-all duration-500" style={{ width: `${sectionScores.skillAlignment || 75}%` }} />
            </div>
          </div>

          <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
              <span>Formatting & Parser Clarity</span>
              <span>{sectionScores.formattingClarity || 80}/100</span>
            </div>
            <div className="w-full bg-[#E5E5E0] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#1E1E1E] h-full rounded-full transition-all duration-500" style={{ width: `${sectionScores.formattingClarity || 80}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Matched vs Missing High-Demand Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched */}
        <div className="bg-[#E8F4F0] p-5 rounded-2xl border border-[#B7D9CF] space-y-3">
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#86C2B2]" /> Verified ATS Keywords ({matchedKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((kw, idx) => (
                <span key={idx} className="bg-white text-[#1E1E1E] font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-[#B7D9CF] shadow-xs">
                  ✓ {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#8A8A8A]">No high-value keywords detected.</span>
            )}
          </div>
        </div>

        {/* Missing */}
        <div className="bg-[#FCEBF0] p-5 rounded-2xl border border-[#F4C9D6] space-y-3">
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF6B4A]" /> Recommended Missing Keywords ({missingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((kw, idx) => (
                <span key={idx} className="bg-white text-[#FF6B4A] font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-[#FF6B4A]/30 shadow-xs">
                  + Add {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#8A8A8A]">All target ATS keywords detected!</span>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Executive Advice */}
      {actionableAdvice.length > 0 && (
        <div className="bg-[#F7F6F3] p-6 rounded-3xl border border-[#E5E5E0] space-y-3">
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF6B4A]" /> Actionable ATS Enhancement Steps
          </h4>
          <ul className="space-y-2 text-xs text-[#1E1E1E] font-medium">
            {actionableAdvice.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#FF6B4A] font-bold">•</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 1-Click AI Bullet Rewriter Studio */}
      {bulletRewrites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B4A]" /> 1-Click AI High-Impact Bullet Rewriter
            </h3>
            <span className="text-[10px] text-[#8A8A8A] font-medium">Metric-Driven & ATS Verified</span>
          </div>

          <div className="space-y-4">
            {bulletRewrites.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-[#E5E5E0] shadow-card space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-[#8A8A8A]">Original Resume Bullet</span>
                  <p className="text-xs text-[#8A8A8A] italic bg-[#F7F6F3] p-3 rounded-xl border border-[#E5E5E0]">
                    "{item.original}"
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-[#FF6B4A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FF6B4A]" /> AI High-Impact Bullet Rewrite
                    </span>

                    <button
                      onClick={() => handleCopyRewrite(item.rewritten, idx)}
                      className="text-xs font-bold text-[#1E1E1E] hover:text-[#FF6B4A] flex items-center gap-1.5 bg-[#F7F6F3] hover:bg-[#FFEBE6] px-3 py-1.5 rounded-xl border border-[#E5E5E0] transition-all"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-[#86C2B2]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? "Copied!" : "Copy Bullet"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#1E1E1E] font-bold bg-[#E8F4F0] p-3 rounded-xl border border-[#B7D9CF] leading-relaxed">
                    "{item.rewritten}"
                  </p>
                  {item.impactNote && (
                    <span className="text-[10px] text-[#8A8A8A] block pt-1">
                      💡 Reason: {item.impactNote}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
