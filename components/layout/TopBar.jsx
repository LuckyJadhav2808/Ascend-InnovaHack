"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import { Search, Flame, ChevronDown, Sparkles, AlertCircle, FastForward, X, Check, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TopBar() {
  const { user, track, trackTitle, selectTrack, createCustomTrack, addXP } = useStore();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [datasetTracks, setDatasetTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const [showCustomTrackModal, setShowCustomTrackModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customTopics, setCustomTopics] = useState("System Design, Databases, APIs");

  const [pendingNavHref, setPendingNavHref] = useState(null);
  const [showAssessmentWarning, setShowAssessmentWarning] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch dataset tracks when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && datasetTracks.length === 0) {
      setLoadingTracks(true);
      fetch("/api/dataset/tracks")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.tracks) {
            setDatasetTracks(data.tracks);
          }
        })
        .catch(console.warn)
        .finally(() => setLoadingTracks(false));
    }
  }, [isDropdownOpen, datasetTracks.length]);

  // Format clean display first name
  const rawName = user.name || user.email || "Candidate";
  const firstName = rawName.split(" ")[0].split("@")[0];
  const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Combine custom tracks + dataset tracks
  const customTrackList = (user.customTracks || []).map((ct) => ({
    id: ct.id,
    title: ct.title,
    isCustom: true
  }));

  const allTracks = [...customTrackList, ...datasetTracks];

  const currentTrackObj = allTracks.find((t) => t.id === track) || null;
  const displayTrackTitle = currentTrackObj?.title || trackTitle || track || "Select Track";

  // Filter tracks by dropdown search query
  const filteredDropdownTracks = allTracks.filter((t) => {
    if (!dropdownSearch) return true;
    const q = dropdownSearch.toLowerCase();
    return (t.title || "").toLowerCase().includes(q) || (t.skills || []).some((s) => s.toLowerCase().includes(q));
  });

  const handleSelectTrackOption = async (trackId, title) => {
    setIsDropdownOpen(false);
    toast.info(`Switching track to ${title}...`);
    await selectTrack(trackId, title);
    toast.success(`Active track set to ${title}`);
  };

  const handleCreateCustomTrackSubmit = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const topicsArr = customTopics.split(",").map((t) => t.trim()).filter(Boolean);
    await createCustomTrack(customTitle, customDesc || "Custom Candidate Track", topicsArr);

    const generatedTrackId = `custom-${customTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    await selectTrack(generatedTrackId, customTitle);
    setShowCustomTrackModal(false);
    setIsDropdownOpen(false);
    toast.success(`Created & selected custom track: ${customTitle}`);
  };

  const handleNavClick = (e, href) => {
    if (pathname === "/assessment" && href !== "/assessment") {
      e.preventDefault();
      setPendingNavHref(href);
      setShowAssessmentWarning(true);
      toast.warning("Assessment in progress! Please complete or fast-forward before navigating.");
    }
  };

  const handleFastForwardAndNavigate = async () => {
    await addXP(300);
    toast.xp("+300 XP Baseline Bonus Awarded!");
    setShowAssessmentWarning(false);
    if (pendingNavHref) {
      router.push(pendingNavHref);
      setPendingNavHref(null);
    }
  };

  return (
    <>
      <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-[#E5E5E0] px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-2 sm:gap-4 w-full max-w-full">
        {/* Left Section: Greeting & Streak Flame Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="min-w-0">
            <h1 suppressHydrationWarning className="text-xs sm:text-lg font-extrabold text-[#1E1E1E] flex items-center gap-1 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              Welcome, {formattedName} 👋
            </h1>
            <p className="text-[11px] text-[#8A8A8A] font-medium whitespace-nowrap truncate hidden xl:block">
              Ready to ascend your technical prep today?
            </p>
          </div>

          {/* Coral Streak Flame Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-[#FFEBE6] text-[#FF6B4A] border border-[#FF6B4A]/20 px-2.5 py-1 rounded-full font-bold text-xs shadow-xs shrink-0 whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 fill-[#FF6B4A]" />
            <span>{user.streak?.current || 1}d Streak</span>
          </div>
        </div>

        {/* Center Section: Custom Aesthetic Track Selector & Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Custom Styled Floating Track Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="bg-[#F7F6F3] hover:bg-[#F1F1EF] border border-[#E5E5E0] text-[#1E1E1E] font-bold text-[11px] sm:text-xs py-1.5 sm:py-2.5 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap"
            >
              <span className="max-w-[95px] xs:max-w-[130px] sm:max-w-[160px] truncate">{displayTrackTitle}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8A8A8A] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Custom Aesthetic Floating Dropdown Card */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-72 bg-white rounded-2xl border border-[#E5E5E0] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-[#8A8A8A] px-1 tracking-wider flex items-center justify-between">
                  <span>Select Active Track</span>
                  <span className="text-[#FF6B4A]">{allTracks.length} Available</span>
                </div>

                {/* Search Input Bar inside Dropdown */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 1,000+ tracks..."
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] placeholder-[#8A8A8A] rounded-xl py-2 pl-8 pr-3 focus:outline-none focus:border-[#1E1E1E]"
                  />
                </div>

                {/* Track List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {loadingTracks ? (
                    <div className="flex items-center justify-center py-6 text-xs text-[#8A8A8A]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF6B4A] mr-2" />
                      Loading tracks...
                    </div>
                  ) : filteredDropdownTracks.length > 0 ? (
                    filteredDropdownTracks.map((t) => {
                      const isSelected = t.id === track;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTrackOption(t.id, t.title)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-bold ${
                            isSelected
                              ? "bg-[#1E1E1E] text-white shadow-xs"
                              : "hover:bg-[#F7F6F3] text-[#1E1E1E]"
                          }`}
                        >
                          <span className="truncate">{t.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#F6D67A] shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-[#8A8A8A]">
                      No tracks found for "{dropdownSearch}"
                    </div>
                  )}
                </div>

                {/* Create Custom Track Button */}
                <div className="pt-2 border-t border-[#E5E5E0]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowCustomTrackModal(true);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#FFEBE6] text-[#FF6B4A] font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Create Custom Track</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-44 md:w-56 hidden md:block shrink">
            <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] placeholder-[#8A8A8A] rounded-2xl py-2 pl-8 pr-3 focus:outline-none focus:border-[#1E1E1E] transition-colors truncate"
            />
          </div>
        </div>

        {/* Right Section: Action Button & User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/practice"
            onClick={(e) => handleNavClick(e, "/practice")}
            className="hidden lg:flex items-center gap-1.5 bg-[#FF6B4A] hover:bg-[#E05536] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-105 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Now</span>
          </Link>

          {/* User Avatar */}
          <Link
            href="/profile"
            onClick={(e) => handleNavClick(e, "/profile")}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F7F6F3] transition-colors shrink-0"
          >
            <div suppressHydrationWarning className="w-9 h-9 rounded-full bg-[#D9CFF0] text-[#1E1E1E] font-extrabold flex items-center justify-center text-sm shadow-xs border-2 border-white uppercase">
              {formattedName.charAt(0)}
            </div>
          </Link>
        </div>
      </header>

      {/* Quick Custom Track Creation Modal */}
      {showCustomTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E0] shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCustomTrackModal(false)}
              className="absolute top-4 right-4 text-[#8A8A8A] hover:text-[#1E1E1E]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[#1E1E1E]">Create Custom Technical Track</h3>
              <p className="text-xs text-[#8A8A8A]">Add a personalized track to your active switcher.</p>
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
                className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all mt-2"
              >
                Create & Switch Track
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Navigation Guard Modal */}
      {showAssessmentWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E0] shadow-2xl relative text-center space-y-5 animate-in zoom-in-95">
            <button
              onClick={() => setShowAssessmentWarning(false)}
              className="absolute top-4 right-4 text-[#8A8A8A] hover:text-[#1E1E1E]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#FFEBE6] border border-[#FF6B4A]/30 text-[#FF6B4A] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#FFEBE6] text-[#FF6B4A] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
                Assessment In Progress
              </span>
              <h3 className="text-xl font-extrabold text-[#1E1E1E] mt-3">
                Complete Your Assessment First
              </h3>
              <p className="text-xs text-[#8A8A8A] mt-2 leading-relaxed">
                Your 10-question technical baseline assessment is currently in progress. Please complete the assessment or fast-forward to unlock all features.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowAssessmentWarning(false)}
                className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all"
              >
                Continue Assessment
              </button>

              <button
                onClick={handleFastForwardAndNavigate}
                className="w-full bg-[#F7F6F3] hover:bg-[#FFEBE6] text-[#FF6B4A] font-bold text-xs py-3 rounded-2xl border border-[#FF6B4A]/30 transition-all flex items-center justify-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Fast-Forward & Exit to {pendingNavHref ? pendingNavHref.replace("/", "") : "page"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
