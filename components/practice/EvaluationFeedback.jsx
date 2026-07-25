"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Sparkles, ExternalLink, ArrowUpRight, Award, Zap } from "lucide-react";

export default function EvaluationFeedback({ evaluation, onNextQuestion, onRetry }) {
  if (!evaluation) return null;

  const { score, strengths, gaps, feedbackText, xpAwarded, recommendedResources, topic } = evaluation;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-6 animate-in fade-in slide-in-from-bottom-3">
      {/* Header Result Score & XP Banner */}
      <div className="bg-[#F7F6F3] rounded-2xl p-5 border border-[#E5E5E0] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Score Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold shadow-sm ${
              score >= 75
                ? "bg-[#B7D9CF] text-[#1E1E1E]"
                : score >= 50
                ? "bg-[#F6D67A] text-[#1E1E1E]"
                : "bg-[#F4C9D6] text-[#1E1E1E]"
            }`}
          >
            <span className="text-lg leading-none">{score}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#1E1E1E]/70 font-bold">/100</span>
          </div>

          <div>
            <h3 className="font-bold text-base text-[#1E1E1E]">AI Evaluation Summary</h3>
            <p className="text-xs text-[#8A8A8A]">Topic: <span className="font-semibold text-[#1E1E1E]">{topic}</span></p>
          </div>
        </div>

        {/* XP Award Pill */}
        <div className="bg-[#FFEBE6] border border-[#FF6B4A]/30 text-[#FF6B4A] px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-xs animate-bounce">
          <Zap className="w-5 h-5 fill-[#FF6B4A]" />
          <span>+{xpAwarded} XP Awarded</span>
        </div>
      </div>

      {/* Main Feedback Text */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Coach Feedback</h4>
        <p className="text-sm text-[#1E1E1E] bg-[#F7F6F3] p-4 rounded-2xl leading-relaxed border border-[#E5E5E0]">
          "{feedbackText}"
        </p>
      </div>

      {/* Strengths & Knowledge Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-[#E8F4F0] p-4 rounded-2xl border border-[#B7D9CF]">
          <h5 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#86C2B2]" /> Key Strengths
          </h5>
          <ul className="space-y-1.5 text-xs text-[#1E1E1E] font-medium">
            {strengths && strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#86C2B2]">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-[#8A8A8A]">Clear conceptual structure presented.</li>
            )}
          </ul>
        </div>

        {/* Gaps */}
        <div className="bg-[#FCEBF0] p-4 rounded-2xl border border-[#F4C9D6]">
          <h5 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B4A]" /> Knowledge Gaps to Bridge
          </h5>
          <ul className="space-y-1.5 text-xs text-[#1E1E1E] font-medium">
            {gaps && gaps.length > 0 ? (
              gaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#FF6B4A]">•</span>
                  <span>{gap}</span>
                </li>
              ))
            ) : (
              <li className="text-[#8A8A8A]">No major gaps detected in core logic.</li>
            )}
          </ul>
        </div>
      </div>

      {/* RAG Recommended Resources */}
      {recommendedResources && recommendedResources.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF6B4A]" /> RAG Recommended Reading
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedResources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="bg-[#F7F6F3] hover:bg-[#F1F1EF] p-3 rounded-2xl border border-[#E5E5E0] flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-bold text-[#1E1E1E] group-hover:text-[#FF6B4A] transition-colors">
                    {res.title}
                  </div>
                  <span className="text-[10px] text-[#8A8A8A]">{res.type} • {Math.round(res.relevanceScore * 100)}% Match</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#FF6B4A] transition-colors shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-[#F7F6F3] hover:bg-[#FFEBE6] text-[#1E1E1E] hover:text-[#FF6B4A] border border-[#E5E5E0] hover:border-[#FF6B4A]/30 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-[#8A8A8A]" />
            <span>Try Question Again</span>
          </button>
        )}
        <button
          onClick={onNextQuestion}
          className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 transition-all"
        >
          <span>Continue Daily Loop</span>
          <Sparkles className="w-4 h-4 text-[#F6D67A]" />
        </button>
      </div>
    </div>
  );
}
