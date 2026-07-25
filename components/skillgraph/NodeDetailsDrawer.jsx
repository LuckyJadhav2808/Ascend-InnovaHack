"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useToast } from "@/lib/toastContext";
import {
  X,
  Target,
  Sparkles,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Brain,
  Code2
} from "lucide-react";

// Cheat sheet topics mapping for dataset enrichment
const TOPIC_CHEATSHEETS = {
  "react": {
    category: "Frontend Architecture",
    cheatsheet: [
      "Virtual DOM diffing algorithm & reconciliation batching.",
      "useMemo & useCallback optimization rules.",
      "Custom hooks abstraction & State colocation principles."
    ],
    antiPatterns: [
      "Over-using useEffect for derived state instead of inline computation.",
      "Mutating state directly instead of immutable updates.",
      "Missing unique keys in dynamic list rendering."
    ]
  },
  "javascript": {
    category: "Language & Runtime",
    cheatsheet: [
      "Event loop, Microtask queue (Promises) vs Macrotask queue (setTimeout).",
      "Prototypal inheritance, Lexical scoping & Closures.",
      "Async/Await error handling & Promise.allSettled concurrency."
    ],
    antiPatterns: [
      "Global scope pollution and implicitly creating global variables.",
      "Unhandled promise rejections crashing asynchronous code paths.",
      "Memory leaks caused by uncleaned event listeners in closures."
    ]
  },
  "html": {
    category: "Frontend Fundamentals",
    cheatsheet: [
      "Semantic HTML5 tags for accessibility & SEO indexing.",
      "DOM event bubbling, capturing & event delegation.",
      "Critical rendering path (HTML parsing, CSSOM, Render Tree)."
    ],
    antiPatterns: [
      "Using generic <div> elements for interactive controls missing ARIA roles.",
      "Inline scripts blocking main thread DOM parsing.",
      "Missing alt attributes on image tags degrading accessibility."
    ]
  },
  "css": {
    category: "Styling & Layout",
    cheatsheet: [
      "Flexbox & Grid layout math, container query responsiveness.",
      "CSS Specificity calculation & BEM class naming architecture.",
      "Hardware-accelerated CSS transforms & compositing performance."
    ],
    antiPatterns: [
      "Overusing !important overrides breaking CSS specificity hierarchy.",
      "Expensive non-composite animations triggering main thread reflows.",
      "Hardcoded static pixel dimensions breaking responsive viewports."
    ]
  },
  "node": {
    category: "Backend & Runtime",
    cheatsheet: [
      "Event loop phases: Timers, I/O Polling, Check (setImmediate), Microtasks.",
      "Stream processing & backpressure handling.",
      "Cluster module & process thread worker pools."
    ],
    antiPatterns: [
      "Blocking the single-threaded event loop with synchronous CPU ops.",
      "Unhandled promise rejections crashing Node.js runtime.",
      "Memory leaks from global event emitter listeners."
    ]
  },
  "sql": {
    category: "Databases & Storage",
    cheatsheet: [
      "B-Tree vs Hash indexing & Composite index column ordering.",
      "ACID transactions, Isolation levels (Read Committed vs Serializable).",
      "Query EXPLAIN ANALYZE optimization."
    ],
    antiPatterns: [
      "N+1 Query problem when loading foreign key relations.",
      "SELECT * fetching unnecessary column data over network.",
      "Missing indexes on frequently filtered WHERE / JOIN columns."
    ]
  },
  "system": {
    category: "Distributed Architecture",
    cheatsheet: [
      "CAP Theorem trade-offs (Consistency vs Availability under Partition).",
      "Load balancing algorithms (Round Robin, Consistent Hashing).",
      "Caching strategies (Cache-Aside, Write-Through, Write-Behind)."
    ],
    antiPatterns: [
      "Single Point of Failure (SPOF) in core database or auth service.",
      "Cache stampede (thundering herd) under peak load.",
      "Tight coupling of synchronous RPC calls between microservices."
    ]
  }
};

function getTopicEnrichment(topicName = "") {
  const t = topicName.toLowerCase();
  for (const key of Object.keys(TOPIC_CHEATSHEETS)) {
    if (t.includes(key)) return TOPIC_CHEATSHEETS[key];
  }
  return {
    category: "Core Technical Mastery",
    cheatsheet: [
      `Understand fundamental design patterns and trade-offs for ${topicName}.`,
      "Analyze edge cases, error handling, and performance under scale.",
      "Practice open-ended architectural explanations."
    ],
    antiPatterns: [
      "Premature optimization without profiling latency metrics.",
      "Ignoring error boundaries and fallback recovery paths.",
      "Hardcoding environment configuration parameters."
    ]
  };
}

export default function NodeDetailsDrawer({ node, onClose }) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!node || !mounted) return null;

  const enrichment = getTopicEnrichment(node.topic);
  const mastery = node.mastery || 0;
  const isStrong = mastery >= 70;
  const isOk = mastery >= 40 && mastery < 70;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-[#E5E5E0] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Fixed Top Header */}
        <div className="p-6 pb-4 border-b border-[#E5E5E0] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFEBE6] text-[#FF6B4A] flex items-center justify-center font-bold shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B4A] bg-[#FFEBE6] px-2.5 py-0.5 rounded-full border border-[#FF6B4A]/20">
                {enrichment.category}
              </span>
              <h2 className="text-xl font-extrabold text-[#1E1E1E] mt-1">{node.topic}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8A8A8A] hover:text-[#1E1E1E] rounded-full hover:bg-[#F7F6F3] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Mastery Meter Card */}
          <div className="bg-[#F7F6F3] p-4.5 rounded-2xl border border-[#E5E5E0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8A8A8A]">Live Node Mastery</span>
              <span
                className={`text-xs font-extrabold uppercase px-3 py-0.5 rounded-full ${
                  isStrong
                    ? "bg-[#E8F4F0] text-[#86C2B2] border border-[#86C2B2]/30"
                    : isOk
                    ? "bg-[#FFF8E6] text-[#D9A01D] border border-[#F6D67A]/50"
                    : "bg-[#FFEBE6] text-[#FF6B4A] border border-[#FF6B4A]/30"
                }`}
              >
                {isStrong ? "Strong Mastery" : isOk ? "Developing" : "Weak Point"}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="text-3xl font-extrabold text-[#1E1E1E] leading-none">{mastery}%</div>
              <div className="flex-1 bg-[#E5E5E0] h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isStrong ? "bg-[#86C2B2]" : isOk ? "bg-[#F6D67A]" : "bg-[#FF6B4A]"
                  }`}
                  style={{ width: `${Math.max(4, mastery)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-[#8A8A8A] leading-relaxed">
              {isStrong
                ? "Excellent! You have demonstrated strong architectural proficiency in this topic."
                : isOk
                ? "Good progress! Practice 1-2 adaptive questions to push this topic above 70%."
                : "Target node! Solve questions in this category to increase your Gold League standing."}
            </p>
          </div>

          {/* Engineering Cheat Sheet Principles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1E1E1E] uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#FF6B4A]" />
              <span>Core Architectural Concepts</span>
            </div>

            <div className="space-y-2">
              {enrichment.cheatsheet.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#E5E5E0] text-xs font-semibold text-[#1E1E1E] flex items-start gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#86C2B2] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Anti-Patterns & Common Pitfalls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1E1E1E] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-[#FF6B4A]" />
              <span>Dataset Anti-Patterns to Avoid</span>
            </div>

            <div className="space-y-2">
              {enrichment.antiPatterns.map((pitfall, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FFEBE6]/60 border border-[#FF6B4A]/20 text-xs font-semibold text-[#1E1E1E] flex items-start gap-2.5 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pitfall}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Fixed Bottom Footer CTA */}
        <div className="p-5 border-t border-[#E5E5E0] bg-white shrink-0 shadow-lg">
          <Link
            href={`/practice?topic=${encodeURIComponent(node.topic)}`}
            onClick={() => {
              toast.info(`Starting practice targeting ${node.topic}...`);
              onClose();
            }}
            className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-extrabold text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all"
          >
            <Zap className="w-4 h-4 text-[#F6D67A] fill-[#F6D67A]" />
            <span>Practice {node.topic} Now (+150 XP)</span>
            <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
