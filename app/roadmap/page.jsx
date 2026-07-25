"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import { getLeagueTierInfo } from "@/components/league/LeagueProgressionWidget";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Target,
  TrendingUp,
  Building2,
  Map,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  BookOpen,
  Code2,
  Brain,
  Trophy,
  Play,
  Lock
} from "lucide-react";

// Estimate study time based on task count and complexity
function estimateTime(tasks) {
  if (!tasks || tasks.length === 0) return "~30 min";
  const mins = tasks.length * 15 + 10;
  if (mins >= 60) return `~${Math.round(mins / 60)}h ${mins % 60}m`;
  return `~${mins} min`;
}

// Get category icon for a focus topic
function getCategoryIcon(topic) {
  const t = (topic || "").toLowerCase();
  if (t.includes("system") || t.includes("design") || t.includes("architect")) return <Brain className="w-4 h-4" />;
  if (t.includes("algo") || t.includes("data struct") || t.includes("leetcode") || t.includes("dsa")) return <Code2 className="w-4 h-4" />;
  if (t.includes("api") || t.includes("rest") || t.includes("backend")) return <Target className="w-4 h-4" />;
  return <BookOpen className="w-4 h-4" />;
}

export default function RoadmapPage() {
  const { user, skillGraph, history } = useStore();
  const track = user?.track;
  const trackTitle = user?.trackTitle || track;
  const toast = useToast();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  const tierInfo = getLeagueTierInfo(user?.xp || 0);

  const fetchRoadmap = async () => {
    if (!skillGraph || !skillGraph.nodes || skillGraph.nodes.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const weakNodes = [...skillGraph.nodes]
        .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
        .slice(0, 4)
        .map((n) => n.topic);

      const params = new URLSearchParams({
        track: track || "",
        trackTitle: trackTitle || track || "",
        weakNodes: weakNodes.join(","),
        skillGraph: JSON.stringify(skillGraph)
      });

      const res = await fetch(`/api/dataset/roadmap?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      console.warn("Failed to fetch roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [track, skillGraph]);

  // Auto-expand first incomplete day
  useEffect(() => {
    if (roadmap?.days) {
      const firstIncomplete = roadmap.days.findIndex((d) => {
        if (!d.tasks) return true;
        return d.tasks.some((t) => !t.done && !getTaskDone(t.title));
      });
      setExpandedDays({ [firstIncomplete === -1 ? 0 : firstIncomplete]: true });
    }
  }, [roadmap]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setRoadmap(null);
    toast.info("Regenerating your AI roadmap with latest skill data...");
    try {
      await fetchRoadmap();
      toast.success("Roadmap refreshed with your latest mastery scores!");
    } catch {
      toast.error("Failed to regenerate roadmap.");
    } finally {
      setRegenerating(false);
    }
  };

  const toggleDay = (idx) => {
    setExpandedDays((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Check completed tasks against history
  const getTaskDone = (taskTitle) => {
    return history.some((h) => {
      const hTopic = (h.topic || "").toLowerCase();
      const tTitle = taskTitle.toLowerCase();
      return tTitle.includes(hTopic.substring(0, 6)) || hTopic.includes(tTitle.substring(0, 6));
    });
  };

  // Get mastery for a topic from skill graph
  const getMasteryForTopic = (topic) => {
    if (!skillGraph?.nodes) return 0;
    const node = skillGraph.nodes.find(
      (n) => n.topic && topic && n.topic.toLowerCase().includes(topic.toLowerCase().substring(0, 5))
    );
    return node?.mastery || 0;
  };

  if (loading || regenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-[#FFEBE6] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B4A]" />
        </div>
        <div className="text-center">
          <h3 className="font-extrabold text-base text-[#1E1E1E]">
            {regenerating ? "Regenerating Your Plan..." : "Building Personalized Roadmap..."}
          </h3>
          <p className="text-xs text-[#8A8A8A] mt-1 max-w-xs mx-auto">
            Analyzing your skill graph, LeetCode trends, and system design patterns to create your optimal study path.
          </p>
        </div>
      </div>
    );
  }

  if (!roadmap || !roadmap.days || roadmap.days.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-[#F7F6F3] border border-[#E5E5E0] flex items-center justify-center mx-auto">
          <Map className="w-8 h-8 text-[#E5E5E0]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#1E1E1E]">No Roadmap Generated Yet</h2>
          <p className="text-xs text-[#8A8A8A] mt-1.5 max-w-sm mx-auto">
            Select a track and complete your baseline assessment to unlock your AI-personalized study roadmap.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-[#1E1E1E] text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-[#333333] hover:scale-105 transition-all shadow-md"
        >
          Choose a Track <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
        </Link>
      </div>
    );
  }

  const days = roadmap.days || [];
  const totalTasks = days.reduce((sum, d) => sum + (d.tasks?.length || 0), 0);
  const completedTasks = days.reduce(
    (sum, d) => sum + (d.tasks?.filter((t) => t.done || getTaskDone(t.title)).length || 0),
    0
  );
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedDays = days.filter((d) =>
    d.tasks && d.tasks.length > 0 && d.tasks.every((t) => t.done || getTaskDone(t.title))
  ).length;
  const xpEstimate = completedTasks * 120;
  const xpRemaining = (totalTasks - completedTasks) * 120;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Hero Progress Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
                AI Dynamic Plan
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A] bg-[#F7F6F3] px-2.5 py-1 rounded-full border border-[#E5E5E0]">
                {trackTitle || track}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E1E1E] mt-2.5">
              {days.length}-Day Interview Prep Roadmap
            </h1>
            <p className="text-xs text-[#8A8A8A] mt-1 max-w-lg leading-relaxed">
              Personalized from your live skill graph mastery scores, trending LeetCode patterns, and system design fundamentals.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRegenerate}
              className="text-xs font-bold text-[#8A8A8A] hover:text-[#1E1E1E] bg-[#F7F6F3] hover:bg-[#F1F1EF] border border-[#E5E5E0] px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <Link
              href="/practice"
              className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-[#F6D67A] text-[#F6D67A]" />
              <span>Continue</span>
            </Link>
          </div>
        </div>

        {/* Overall Progress Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F7F6F3] p-3 rounded-2xl border border-[#E5E5E0] text-center">
            <div className="text-lg font-extrabold text-[#1E1E1E]">{completedDays}/{days.length}</div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">Days Done</div>
          </div>
          <div className="bg-[#F7F6F3] p-3 rounded-2xl border border-[#E5E5E0] text-center">
            <div className="text-lg font-extrabold text-[#1E1E1E]">{completedTasks}/{totalTasks}</div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">Tasks Done</div>
          </div>
          <div className="bg-[#FFEBE6] p-3 rounded-2xl border border-[#FF6B4A]/20 text-center">
            <div className="text-lg font-extrabold text-[#FF6B4A]">+{xpEstimate}</div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">XP Earned</div>
          </div>
          <div className="bg-[#E8F4F0] p-3 rounded-2xl border border-[#86C2B2]/30 text-center">
            <div className="text-lg font-extrabold text-[#86C2B2]">+{xpRemaining}</div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">XP Available</div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1E1E1E]">Overall Completion</span>
            <span className="font-extrabold text-[#FF6B4A]">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#E5E5E0] h-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B4A] via-[#F6D67A] to-[#86C2B2] rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trending Topics & Companies Row */}
      {(roadmap.trendingTopics?.length > 0 || roadmap.topCompanies?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roadmap.trendingTopics?.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E0] shadow-card">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FFEBE6] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-[#FF6B4A]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-[#8A8A8A] tracking-wider">Trending Topics (2024–2025)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roadmap.trendingTopics.map((t, i) => (
                  <span key={i} className="text-[10px] font-bold bg-[#FFEBE6] text-[#FF6B4A] px-2.5 py-1 rounded-full border border-[#FF6B4A]/15">
                    {t.topic || t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {roadmap.topCompanies?.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E0] shadow-card">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E8F4F0] flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-[#86C2B2]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-[#8A8A8A] tracking-wider">Top Companies Asking These</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roadmap.topCompanies.map((c, i) => (
                  <span key={i} className="text-[10px] font-bold bg-[#E8F4F0] text-[#1E1E1E] px-2.5 py-1 rounded-full border border-[#86C2B2]/20">
                    {c.company || c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vertical Timeline Days */}
      <div className="relative">
        {/* Timeline Rail */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E5E5E0] hidden sm:block" />

        <div className="space-y-4">
          {days.map((d, dayIdx) => {
            const dayTasks = d.tasks || [];
            const dayCompleted = dayTasks.filter((t) => t.done || getTaskDone(t.title)).length;
            const dayTotal = dayTasks.length;
            const dayProgress = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
            const isDayComplete = dayTotal > 0 && dayCompleted === dayTotal;
            const isExpanded = expandedDays[dayIdx] || false;
            const mastery = getMasteryForTopic(d.focusTopic);
            const prevDayComplete = dayIdx === 0 ? true : (days[dayIdx - 1].tasks || []).every((t) => t.done || getTaskDone(t.title));
            const isLocked = dayIdx > 0 && !prevDayComplete && dayProgress === 0;
            const isCurrentDay = !isDayComplete && (dayIdx === 0 || prevDayComplete);

            return (
              <div key={dayIdx} className="relative sm:pl-14">
                {/* Timeline Node */}
                <div className={`absolute left-3.5 top-6 w-5 h-5 rounded-full border-[3px] z-10 hidden sm:flex items-center justify-center transition-all ${
                  isDayComplete
                    ? "bg-[#86C2B2] border-[#86C2B2] text-white"
                    : isCurrentDay
                    ? "bg-[#FF6B4A] border-[#FF6B4A] text-white animate-pulse"
                    : isLocked
                    ? "bg-[#E5E5E0] border-[#E5E5E0] text-[#8A8A8A]"
                    : "bg-white border-[#E5E5E0]"
                }`}>
                  {isDayComplete && <CheckCircle2 className="w-3 h-3" />}
                  {isCurrentDay && !isDayComplete && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  {isLocked && <Lock className="w-2.5 h-2.5" />}
                </div>

                {/* Day Card */}
                <div
                  className={`bg-white rounded-3xl border shadow-card overflow-hidden transition-all ${
                    isCurrentDay
                      ? "border-[#FF6B4A]/40 shadow-md"
                      : isDayComplete
                      ? "border-[#86C2B2]/40"
                      : isLocked
                      ? "border-[#E5E5E0] opacity-60"
                      : "border-[#E5E5E0] hover:border-[#1E1E1E]/30"
                  }`}
                >
                  {/* Day Header — Always Visible */}
                  <button
                    onClick={() => !isLocked && toggleDay(dayIdx)}
                    disabled={isLocked}
                    className="w-full p-5 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl font-extrabold flex items-center justify-center text-sm shrink-0 ${
                        isDayComplete
                          ? "bg-[#E8F4F0] text-[#86C2B2] border border-[#86C2B2]/30"
                          : isCurrentDay
                          ? "bg-[#FF6B4A] text-white shadow-sm"
                          : "bg-[#F7F6F3] text-[#8A8A8A] border border-[#E5E5E0]"
                      }`}>
                        D{d.day || dayIdx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-[#1E1E1E] truncate">{d.focusTopic}</h3>
                          {isCurrentDay && (
                            <span className="text-[9px] font-extrabold bg-[#FF6B4A] text-white px-2 py-0.5 rounded-full uppercase shrink-0">
                              Current
                            </span>
                          )}
                          {isDayComplete && (
                            <span className="text-[9px] font-extrabold bg-[#E8F4F0] text-[#86C2B2] px-2 py-0.5 rounded-full uppercase border border-[#86C2B2]/30 shrink-0">
                              Complete
                            </span>
                          )}
                          {d.badge && !isDayComplete && !isCurrentDay && (
                            <span className="text-[9px] font-bold bg-[#F7F6F3] text-[#8A8A8A] px-2 py-0.5 rounded-full shrink-0">
                              {d.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8A8A8A] font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {estimateTime(dayTasks)}
                          </span>
                          <span>{dayCompleted}/{dayTotal} tasks</span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" /> {mastery}% mastery
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Mini Progress Ring */}
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E5E0" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke={isDayComplete ? "#86C2B2" : "#FF6B4A"}
                            strokeWidth="3"
                            strokeDasharray={`${dayProgress * 0.94} 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-[#1E1E1E]">
                          {dayProgress}%
                        </span>
                      </div>

                      {!isLocked && (
                        isExpanded ? <ChevronUp className="w-4 h-4 text-[#8A8A8A]" /> : <ChevronDown className="w-4 h-4 text-[#8A8A8A]" />
                      )}
                    </div>
                  </button>

                  {/* Day Expanded Content */}
                  {isExpanded && !isLocked && (
                    <div className="px-5 pb-5 space-y-4 border-t border-[#E5E5E0]">
                      {/* Tasks Checklist */}
                      <div className="space-y-2 pt-4">
                        <span className="text-[10px] font-extrabold uppercase text-[#8A8A8A] tracking-wider">Study Tasks</span>
                        {dayTasks.map((task, idx) => {
                          const isDone = task.done || getTaskDone(task.title);
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isDone
                                  ? "bg-[#E8F4F0]/50 border-[#86C2B2]/30"
                                  : "bg-[#F7F6F3] border-[#E5E5E0] hover:border-[#FF6B4A]/40"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle2
                                  className={`w-5 h-5 shrink-0 transition-colors ${
                                    isDone ? "text-[#86C2B2] fill-[#E8F4F0]" : "text-[#E5E5E0]"
                                  }`}
                                />
                                <span className={`text-xs font-semibold ${isDone ? "line-through text-[#8A8A8A]" : "text-[#1E1E1E]"}`}>
                                  {task.title}
                                </span>
                              </div>
                              {!isDone && (
                                <Link
                                  href="/practice"
                                  className="text-[10px] font-bold text-[#FF6B4A] bg-[#FFEBE6] px-2.5 py-1 rounded-full hover:bg-[#FF6B4A] hover:text-white transition-colors shrink-0"
                                >
                                  Practice →
                                </Link>
                              )}
                              {isDone && (
                                <span className="text-[10px] font-bold text-[#86C2B2]">+120 XP</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Live Mastery Sync */}
                      <div className="bg-[#F7F6F3] p-3.5 rounded-2xl border border-[#E5E5E0] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#D9CFF0] flex items-center justify-center">
                            {getCategoryIcon(d.focusTopic)}
                          </div>
                          <div>
                            <div className="text-[10px] font-extrabold uppercase text-[#8A8A8A]">Live Skill Graph Mastery</div>
                            <div className="text-xs font-bold text-[#1E1E1E]">{d.focusTopic}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 bg-[#E5E5E0] h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#F6D67A] rounded-full transition-all duration-500"
                              style={{ width: `${mastery}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-[#1E1E1E] w-8 text-right">{mastery}%</span>
                        </div>
                      </div>

                      {/* Pattern references */}
                      {d.patterns && d.patterns.length > 0 && (
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#8A8A8A] tracking-wider">Related Patterns & Concepts</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {d.patterns.map((p, i) => (
                              <span key={i} className="text-[10px] font-semibold bg-white text-[#1E1E1E] px-2.5 py-1 rounded-full border border-[#E5E5E0]">
                                {p.pattern_name || p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Day CTA */}
                      {!isDayComplete && (
                        <Link
                          href="/practice"
                          className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#F6D67A] text-[#F6D67A]" />
                          Start Day {d.day || dayIdx + 1}: {d.focusTopic}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Reward Estimator Footer */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E5E0] shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F6D67A] flex items-center justify-center">
            <Zap className="w-4 h-4 fill-[#1E1E1E] text-[#1E1E1E]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#1E1E1E]">Complete this roadmap for +{totalTasks * 120} XP</div>
            <div className="text-[10px] text-[#8A8A8A] font-semibold">
              {tierInfo.nextTier
                ? `That's enough to ${xpRemaining + (user?.xp || 0) >= (tierInfo.nextMinXp || 0) ? "unlock" : "progress toward"} ${tierInfo.nextTier}`
                : "You've reached Master Division!"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{tierInfo.icon}</span>
          <div>
            <div className="text-[10px] font-bold text-[#8A8A8A]">Current Tier</div>
            <div className="text-xs font-extrabold text-[#1E1E1E]">{tierInfo.currentTier}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
