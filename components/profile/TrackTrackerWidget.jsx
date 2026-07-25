"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  ChevronRight
} from "lucide-react";

export default function TrackTrackerWidget() {
  const { user, skillGraph, selectTrack } = useStore();
  const toast = useToast();
  const [switchingId, setSwitchingId] = useState(null);

  // Extract all tracks saved in user.trackGraphs + current active track
  const trackGraphsMap = user.trackGraphs || {};
  
  // Ensure current track is present in list if valid
  const allTrackIds = Array.from(
    new Set([
      ...(user.track ? [user.track] : []),
      ...Object.keys(trackGraphsMap)
    ])
  );

  const handleSwitchTrack = async (trackId, title) => {
    setSwitchingId(trackId);
    try {
      await selectTrack(trackId, title);
      toast.success(`Switched active track to ${title}`);
    } catch (e) {
      console.warn("Track switch error:", e);
    } finally {
      setSwitchingId(null);
    }
  };

  if (allTrackIds.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card text-center py-8 space-y-3">
        <Layers className="w-8 h-8 text-[#FF6B4A] mx-auto opacity-80" />
        <h3 className="font-extrabold text-sm text-[#1E1E1E]">No Tracks Tracked Yet</h3>
        <p className="text-xs text-[#8A8A8A] max-w-sm mx-auto">
          Select a job track or create a custom track to start tracking your skill mastery and assessment history across technical roles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFEBE6] text-[#FF6B4A] flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1E1E1E]">Multi-Track Master Tracker</h3>
            <p className="text-xs text-[#8A8A8A]">Track performance, node mastery, and interview readiness across all your technical tracks.</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-[#F7F6F3] text-[#1E1E1E] px-3 py-1 rounded-full border border-[#E5E5E0]">
          {allTrackIds.length} Track{allTrackIds.length !== 1 ? "s" : ""} Recorded
        </span>
      </div>

      {/* Grid of Track Cards */}
      <div className="grid grid-cols-1 gap-4">
        {allTrackIds.map((tId) => {
          const isActive = user.track === tId;
          // Use current live graph if active, else cached trackGraph
          const graphData = isActive ? skillGraph : trackGraphsMap[tId] || { nodes: [], edges: [] };
          const nodes = graphData.nodes || [];

          // Calculate statistics
          const totalNodes = nodes.length;
          const totalMasterySum = nodes.reduce((sum, n) => sum + (n.mastery || 0), 0);
          const avgMastery = totalNodes > 0 ? Math.round(totalMasterySum / totalNodes) : 0;

          const strongNodes = nodes.filter((n) => (n.mastery || 0) >= 70);
          const okNodes = nodes.filter((n) => (n.mastery || 0) >= 40 && (n.mastery || 0) < 70);
          const weakNodes = nodes.filter((n) => (n.mastery || 0) < 40);

          // Pretty Title
          let title = tId.replace(/^custom-/, "").replace(/-/g, " ");
          title = title.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          if (isActive && user.trackTitle) title = user.trackTitle;

          // Readiness level
          let readinessLabel = "Needs Baseline Assessment";
          let readinessBg = "bg-[#F7F6F3] text-[#8A8A8A]";
          if (avgMastery >= 75) {
            readinessLabel = "Interview Ready 🔥";
            readinessBg = "bg-[#E8F4F0] text-[#86C2B2] border border-[#86C2B2]/30";
          } else if (avgMastery >= 40) {
            readinessLabel = "Developing Mastery";
            readinessBg = "bg-[#F6D67A]/20 text-[#1E1E1E] border border-[#F6D67A]/40";
          } else if (totalNodes > 0) {
            readinessLabel = "Baseline Assessment Recorded";
            readinessBg = "bg-[#FFEBE6] text-[#FF6B4A] border border-[#FF6B4A]/20";
          }

          return (
            <div
              key={tId}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
                isActive
                  ? "bg-white border-[#1E1E1E] shadow-md"
                  : "bg-[#F7F6F3]/50 border-[#E5E5E0] hover:border-[#8A8A8A]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Track Information Header */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isActive ? (
                      <span className="text-[10px] font-extrabold uppercase bg-[#1E1E1E] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#86C2B2] animate-pulse" />
                        Active Track
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase bg-[#E5E5E0] text-[#8A8A8A] px-2.5 py-0.5 rounded-full">
                        Saved Track
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${readinessBg}`}>
                      {readinessLabel}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-[#1E1E1E]">{title}</h4>
                </div>

                {/* Switch Button */}
                {!isActive && (
                  <button
                    onClick={() => handleSwitchTrack(tId, title)}
                    disabled={switchingId === tId}
                    className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all shrink-0 hover:scale-105"
                  >
                    <span>Switch to Track</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F6D67A]" />
                  </button>
                )}
              </div>

              {/* Progress & Breakdown Section */}
              <div className="mt-4 pt-4 border-t border-[#E5E5E0] grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                {/* Stat 1: Overall Track Mastery */}
                <div className="sm:col-span-1 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1E1E1E]">
                    <span>Track Mastery</span>
                    <span className="text-[#FF6B4A] font-extrabold">{avgMastery}%</span>
                  </div>
                  {/* Mastery Bar */}
                  <div className="w-full bg-[#E5E5E0] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B4A] via-[#F6D67A] to-[#86C2B2] transition-all duration-500"
                      style={{ width: `${avgMastery}%` }}
                    />
                  </div>
                </div>

                {/* Stat 2: Node Distribution Breakdown Pills */}
                <div className="sm:col-span-3 flex items-center justify-start sm:justify-end gap-3 flex-wrap text-xs">
                  <div className="bg-white border border-[#E5E5E0] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#86C2B2]" />
                    <span className="text-[#1E1E1E]">{strongNodes.length} Strong</span>
                  </div>

                  <div className="bg-white border border-[#E5E5E0] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#F6D67A]" />
                    <span className="text-[#1E1E1E]">{okNodes.length} Developing</span>
                  </div>

                  <div className="bg-white border border-[#E5E5E0] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                    <span className="text-[#1E1E1E]">{weakNodes.length} Target Weak</span>
                  </div>

                  <div className="bg-[#F7F6F3] border border-[#E5E5E0] px-3 py-1.5 rounded-xl font-bold text-[#8A8A8A]">
                    {totalNodes} Skill Nodes
                  </div>
                </div>
              </div>

              {/* Sample Topic Chips */}
              {nodes.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {nodes.slice(0, 6).map((node) => (
                    <span
                      key={node.id || node.topic}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        (node.mastery || 0) >= 70
                          ? "bg-[#E8F4F0] text-[#86C2B2] border-[#86C2B2]/30"
                          : (node.mastery || 0) >= 40
                          ? "bg-[#FFF8E6] text-[#D9A01D] border-[#F6D67A]/40"
                          : "bg-[#FFEBE6] text-[#FF6B4A] border-[#FF6B4A]/20"
                      }`}
                    >
                      {node.topic}: {node.mastery || 0}%
                    </span>
                  ))}
                  {nodes.length > 6 && (
                    <span className="text-[10px] font-bold text-[#8A8A8A] px-1">
                      +{nodes.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
