"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import ResumeUploadWidget from "@/components/onboarding/ResumeUploadWidget";
import {
  Server,
  Layout,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  FastForward,
  Cloud,
  Brain,
  Code2,
  Database,
  Shield,
  Loader2,
  Search
} from "lucide-react";

const ICON_MAP = {
  Frontend: Layout,
  Backend: Server,
  DevOps: Cloud,
  "AI/ML": Brain,
  Database: Database,
  Security: Shield,
  default: Code2
};

function getIconForTrack(title = "") {
  const t = title.toLowerCase();
  if (t.includes("react") || t.includes("angular") || t.includes("vue") || t.includes("frontend") || t.includes("ui")) return Layout;
  if (t.includes("devops") || t.includes("cloud") || t.includes("aws") || t.includes("azure")) return Cloud;
  if (t.includes("data") && (t.includes("scien") || t.includes("analy") || t.includes("ml") || t.includes("ai"))) return Brain;
  if (t.includes("database") || t.includes("sql") || t.includes("dba")) return Database;
  if (t.includes("security") || t.includes("cyber")) return Shield;
  return Server;
}

function getColorForIndex(idx) {
  const colors = ["#B7D9CF", "#F4C9D6", "#D9CFF0", "#F6D67A", "#C5D5F0", "#FFD1A9", "#B7EBD9", "#E0C5F0"];
  return colors[idx % colors.length];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { track, selectTrack, createCustomTrack, user, addXP } = useStore();
  const toast = useToast();
  const [selectedTrackId, setSelectedTrackId] = useState(track || "");
  const [availableTracks, setAvailableTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Track modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customTopics, setCustomTopics] = useState("");
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);

  // Fetch available tracks from dataset API
  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch("/api/dataset/tracks");
        const data = await res.json();
        if (data.success && data.tracks) {
          setAvailableTracks(data.tracks);
        }
      } catch (err) {
        console.warn("Failed to fetch tracks:", err);
      } finally {
        setLoadingTracks(false);
      }
    }
    fetchTracks();
  }, []);

  const handleSelectTrack = async (trackItem) => {
    setSelectedTrackId(trackItem.id);
    await selectTrack(trackItem.id, trackItem.title);
    toast.info(`Track selected: ${trackItem.title}`);
  };

  const handleCreateCustomTrackSubmit = async (e) => {
    e.preventDefault();
    if (!customTitle) return;

    setIsCreatingTrack(true);
    const topicsArr = customTopics.split(",").map((t) => t.trim()).filter(Boolean);
    await createCustomTrack(customTitle, customDesc || "Custom Candidate Track", topicsArr);

    const generatedTrackId = `custom-${customTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    setSelectedTrackId(generatedTrackId);
    setIsCreatingTrack(false);
    setShowCustomModal(false);
    toast.success(`Custom track "${customTitle}" created successfully!`);
  };

  const handleContinueToAssessment = async () => {
    if (!selectedTrackId) return;
    const selectedObj = [...availableTracks, ...allCustomTracks].find((t) => t.id === selectedTrackId);
    await selectTrack(selectedTrackId, selectedObj?.title || selectedTrackId);
    toast.info(`Starting assessment for ${selectedObj?.title || selectedTrackId}...`);
    router.push("/assessment");
  };

  const handleSkipToDashboard = async () => {
    if (!selectedTrackId) return;
    const selectedObj = [...availableTracks, ...allCustomTracks].find((t) => t.id === selectedTrackId);
    await selectTrack(selectedTrackId, selectedObj?.title || selectedTrackId);
    toast.info("Skipping to Dashboard...");
    router.push("/dashboard");
  };

  // Merge dataset tracks + user's custom tracks
  const allCustomTracks = (user.customTracks || []).map((ct) => ({
    ...ct,
    id: ct.id,
    title: ct.title,
    skills: [],
    keywords: [],
    isCustom: true
  }));

  // Filter tracks by search query
  const filteredTracks = [...availableTracks, ...allCustomTracks].filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title || "").toLowerCase().includes(q) ||
      (t.skills || []).some((s) => s.toLowerCase().includes(q)) ||
      (t.keywords || []).some((k) => k.toLowerCase().includes(q))
    );
  });

  // Show max 12 tracks initially, more when searching
  const displayTracks = searchQuery ? filteredTracks : filteredTracks.slice(0, 12);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
      {/* Existing Track Notification Banner if already onboarded */}
      {(user.track || user.trackTitle) && (
        <div className="bg-[#E8F4F0] border border-[#86C2B2]/40 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#86C2B2] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              ✓
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#1E1E1E]">Active Track Configured</div>
              <p className="text-[11px] text-[#8A8A8A]">
                You are currently on <strong className="text-[#1E1E1E]">{user.trackTitle || user.track}</strong>. You can switch tracks below or return to your main workspace.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-1.5 shrink-0 shadow-sm hover:scale-105 transition-all"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F6D67A]" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
          Step 1 of 2 • Setup Profile
        </span>
        <h1 className="text-3xl font-extrabold text-[#1E1E1E]">Choose Your Interview Track</h1>
        <p className="text-sm text-[#8A8A8A] max-w-xl mx-auto">
          Select from {availableTracks.length}+ real job roles or create a custom track. Your skill graph, roadmap, and practice questions are generated dynamically using AI + datasets.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
        <input
          type="text"
          placeholder="Search tracks... (e.g. React, Python, DevOps, Data Science)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5E0] rounded-2xl text-xs text-[#1E1E1E] focus:outline-none focus:border-[#1E1E1E] shadow-sm"
        />
      </div>

      {/* Track Selection Cards Grid */}
      {loadingTracks ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6B4A]" />
          <span className="ml-2 text-xs text-[#8A8A8A] font-semibold">Loading tracks from dataset...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayTracks.map((t, idx) => {
            const isSelected = selectedTrackId === t.id;
            const IconComponent = t.isCustom ? Sparkles : getIconForTrack(t.title);
            const bgColor = t.isCustom ? "#D9CFF0" : getColorForIndex(idx);

            return (
              <div
                key={t.id}
                onClick={() => handleSelectTrack(t)}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${isSelected
                    ? "bg-white border-[#1E1E1E] shadow-card-hover scale-[1.02]"
                    : "bg-white border-[#E5E5E0] hover:border-[#8A8A8A] opacity-90 hover:opacity-100"
                  }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: bgColor }}
                    >
                      <IconComponent className="w-4.5 h-4.5 text-[#1E1E1E]" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1E1E1E]" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase bg-[#F1F1EF] text-[#8A8A8A] px-2 py-0.5 rounded">
                      {t.isCustom ? "Custom Track" : t.experienceLevel || "All Levels"}
                    </span>
                    <h3 className="text-sm font-bold text-[#1E1E1E] mt-1.5 leading-snug line-clamp-2">{t.title}</h3>
                    {t.skills && t.skills.length > 0 && (
                      <p className="text-[10px] text-[#8A8A8A] mt-1.5 leading-relaxed line-clamp-2">
                        {t.skills.slice(0, 5).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E5E5E0] text-[10px] font-bold text-[#8A8A8A]">
                  AI-Generated Skill Graph
                </div>
              </div>
            );
          })}

          {/* Add Custom Track Card Button */}
          <div
            onClick={() => setShowCustomModal(true)}
            className="p-5 rounded-3xl border-2 border-dashed border-[#E5E5E0] hover:border-[#FF6B4A] bg-[#F7F6F3]/50 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 group min-h-[160px]"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFEBE6] text-[#FF6B4A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-[#1E1E1E]">Create Custom Track</div>
            <span className="text-[10px] text-[#8A8A8A]">Define your own tech topics</span>
          </div>
        </div>
      )}

      {/* Show count when searching */}
      {searchQuery && (
        <p className="text-center text-xs text-[#8A8A8A]">
          {filteredTracks.length} track{filteredTracks.length !== 1 ? "s" : ""} found for "{searchQuery}"
        </p>
      )}

      {/* AI Resume Upload Widget */}
      <ResumeUploadWidget />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E5E0]">
        <button
          onClick={handleSkipToDashboard}
          disabled={!selectedTrackId}
          className="text-xs font-bold text-[#8A8A8A] hover:text-[#FF6B4A] flex items-center gap-1.5 px-4 py-3 rounded-2xl hover:bg-[#FFEBE6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FastForward className="w-4 h-4 text-[#FF6B4A]" />
          <span>Skip Assessment & Go to Dashboard</span>
        </button>

        <button
          onClick={handleContinueToAssessment}
          disabled={!selectedTrackId}
          className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg hover:scale-105 transition-all w-full sm:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-5 h-5 text-[#F6D67A]" />
        </button>
      </div>

      {/* Custom Track Creation Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E0] shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 text-[#8A8A8A] hover:text-[#1E1E1E]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[#1E1E1E]">Create Custom Track</h3>
              <p className="text-xs text-[#8A8A8A]">AI will generate your skill graph from the topics you provide.</p>
            </div>

            <form onSubmit={handleCreateCustomTrackSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#1E1E1E] uppercase">Track Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fullstack DevOps & Cloud"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full mt-1 bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] p-3 rounded-xl focus:outline-none focus:border-[#1E1E1E]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] uppercase">Description</label>
                <input
                  type="text"
                  placeholder="e.g. AWS, Kubernetes, Terraform, Microservices"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full mt-1 bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] p-3 rounded-xl focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] uppercase">Topics (comma separated)</label>
                <input
                  type="text"
                  placeholder="Docker, Kubernetes, AWS Lambda, System Design"
                  value={customTopics}
                  onChange={(e) => setCustomTopics(e.target.value)}
                  className="w-full mt-1 bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] p-3 rounded-xl focus:outline-none focus:border-[#1E1E1E]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingTrack}
                className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all mt-2 flex items-center justify-center gap-2"
              >
                {isCreatingTrack ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Skill Graph...</span>
                  </>
                ) : (
                  "Create & Select Track"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
