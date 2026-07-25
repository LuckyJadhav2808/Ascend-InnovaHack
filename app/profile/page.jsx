"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import TrackTrackerWidget from "@/components/profile/TrackTrackerWidget";
import LeagueProgressionWidget from "@/components/league/LeagueProgressionWidget";
import LeagueBoard from "@/components/league/LeagueBoard";
import { User, Flame, History, Trash2, AlertTriangle, Loader2, Edit3, Check, X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, history, updateUserName, clearAllFirebaseData } = useStore();
  const toast = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Username Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name || "");

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.warning("Username cannot be empty.");
      return;
    }
    await updateUserName(editedName.trim());
    setIsEditingName(false);
    toast.success(`Username updated to "${editedName.trim()}"!`);
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await clearAllFirebaseData();
      toast.success("Account deleted! Redirecting to landing page.");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        router.push("/");
      }
    } catch (err) {
      console.warn("Clear error:", err);
      toast.error("Failed to delete account.");
    } finally {
      setIsClearing(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-[#D9CFF0] text-[#1E1E1E] font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md uppercase shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            {isEditingName ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1 w-full max-w-md">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter custom username..."
                  className="bg-[#F7F6F3] border border-[#E5E5E0] font-bold text-base text-[#1E1E1E] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#1E1E1E] w-full"
                  autoFocus
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveName}
                    className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all flex-1 sm:flex-none"
                  >
                    <Check className="w-3.5 h-3.5 text-[#F6D67A]" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(user.name);
                      setIsEditingName(false);
                    }}
                    className="bg-[#F7F6F3] text-[#8A8A8A] hover:text-[#1E1E1E] font-bold text-xs px-3 py-2 rounded-xl border border-[#E5E5E0] transition-all flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1E1E1E]">{user.name}</h1>
                <button
                  onClick={() => {
                    setEditedName(user.name);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-[#8A8A8A] hover:text-[#FF6B4A] hover:bg-[#FFEBE6] rounded-lg transition-all"
                  title="Edit Username"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              {user.email || "Guest User"} • Active Track: <span className="font-bold text-[#FF6B4A] uppercase">{user.trackTitle || user.track || "None"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#FFEBE6] border border-[#FF6B4A]/30 text-[#FF6B4A] px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-[#FF6B4A]" /> {user.streak?.current || 1}d Streak
          </div>
          <div className="bg-[#F6D67A] text-[#1E1E1E] px-3.5 py-1.5 rounded-full font-bold text-xs">
            {user.xp || 0} XP
          </div>
        </div>
      </div>

      {/* Production-Grade Division XP Progression & Tier Tracker */}
      <LeagueProgressionWidget />

      {/* Full Leaderboard & Rank Standing */}
      <LeagueBoard />

      {/* Production-Level Multi-Track Master Tracker Widget */}
      <TrackTrackerWidget />

      {/* Danger Zone / Reset Profile Section */}
      {/* Danger Zone: Account & Data Deletion */}
      <div className="bg-white rounded-3xl p-6 border border-[#FF6B4A]/30 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#1E1E1E] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#FF6B4A]" />
              <span>Delete Account & All Data</span>
            </h3>
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              Permanently purges your Firebase Authentication user credentials (email & user ID), stored Firestore documents, skill graph, and local history.
            </p>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="bg-[#FF6B4A] hover:bg-[#E05536] text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-xs hover:scale-105 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Session History List */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF6B4A]" />
          <h3 className="font-bold text-sm text-[#1E1E1E]">Recent Practice Sessions</h3>
        </div>

        <div className="space-y-3">
          {history && history.length > 0 ? (
            history.map((record) => (
              <div
                key={record.id || record.timestamp}
                className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#E5E5E0] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1E1E1E]">{record.topic}</span>
                    <span className="bg-[#E8F4F0] text-[#86C2B2] font-bold px-2 py-0.5 rounded text-[10px]">
                      Score: {record.score}/100
                    </span>
                  </div>
                  <p className="text-[#8A8A8A] font-medium">"{record.userAnswer}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="font-bold text-[#FF6B4A]">+{record.xpAwarded} XP</span>
                  <span className="text-[10px] text-[#8A8A8A]">{record.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#8A8A8A] text-center py-4">No completed sessions yet.</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5E0] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEBE6] text-[#FF6B4A] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-[#1E1E1E]">Permanently Delete Account & Data?</h3>
              <p className="text-xs text-[#8A8A8A] leading-relaxed">
                This will permanently delete your Firebase user account (email & user ID), Firestore documents, XP, streak, skill graph, and browser storage. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-[#F7F6F3] hover:bg-[#E5E5E0] text-[#1E1E1E] font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleClearAllData}
                disabled={isClearing}
                className="flex-1 bg-[#FF6B4A] hover:bg-[#E05536] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <span>Yes, Delete Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
