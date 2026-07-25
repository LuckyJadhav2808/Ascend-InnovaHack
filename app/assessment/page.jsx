"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import VoiceAnswerBox from "@/components/practice/VoiceAnswerBox";
import { Sparkles, Brain, FastForward, Loader2 } from "lucide-react";

export default function AssessmentPage() {
  const router = useRouter();
  const { track, trackTitle, skillGraph, setSkillNodeMastery, addXP, updateStreak } = useStore();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch track-specific assessment questions from dataset API
  useEffect(() => {
    async function fetchQuestions() {
      try {
        let url = `/api/dataset/questions?track=${encodeURIComponent(track)}&count=10`;
        if (skillGraph && skillGraph.nodes?.length > 0) {
          url += `&skillGraph=${encodeURIComponent(JSON.stringify(skillGraph))}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.questions?.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions([{
            id: "fallback_1",
            source: "fallback",
            topic: "Web Development",
            difficulty: "Medium",
            prompt: "Describe your approach to designing a scalable web application. What key architecture decisions would you make?"
          }]);
        }
      } catch (err) {
        console.warn("Failed to fetch assessment questions:", err);
        setQuestions([{
          id: "fallback_1",
          source: "fallback",
          topic: "Web Development",
          difficulty: "Medium",
          prompt: "Describe your approach to designing a scalable web application. What key architecture decisions would you make?"
        }]);
      } finally {
        setLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, [track]);

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleAnswerSubmit = async (text) => {
    if (!currentQuestion) return;
    setIsSubmitting(true);

    try {
      // Call Gemini evaluation API
      const evalRes = await fetch("/api/dataset/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.prompt,
          answer: text,
          topic: currentQuestion.topic,
          referenceAnswer: currentQuestion.referenceAnswer || ""
        })
      });
      const evalData = await evalRes.json();

      // Extract exact evaluation score (0 for "I don't know", up to 100)
      const score = typeof evalData.evaluation?.score === "number" ? evalData.evaluation.score : 50;
      const xpEarned = score >= 70 ? 50 : score > 0 ? 25 : 0;

      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { text, score, evaluation: evalData.evaluation } }));
      
      // Update node mastery directly to the candidate's evaluation score
      setSkillNodeMastery(currentQuestion.topic, score);
      if (xpEarned > 0) {
        addXP(xpEarned);
        toast.xp(`+${xpEarned} XP Earned! AI Score: ${score}/100`);
      } else {
        toast.warning(`Score: 0/100 for ${currentQuestion.topic}. Marked as weak node.`);
      }
    } catch (err) {
      console.warn("Evaluation error:", err);
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { text, score: 0 } }));
      setSkillNodeMastery(currentQuestion.topic, 0);
      toast.warning("Evaluation recorded.");
    }

    setIsSubmitting(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      updateStreak();
      toast.success("Assessment completed! Your Skill Graph has been generated.");
    }
  };

  const handleFastForwardAssessment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      addXP(200);
      updateStreak();
      setIsSubmitting(false);
      setIsCompleted(true);
      toast.xp("+200 XP Baseline Bonus Awarded!");
      toast.success("Assessment Completed via Fast-Forward!");
    }, 400);
  };

  const handleRevealSkillGraph = () => {
    router.push("/dashboard");
    setTimeout(() => {
      if (typeof window !== "undefined" && window.location.pathname.includes("assessment")) {
        window.location.href = "/dashboard";
      }
    }, 150);
  };

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-in fade-in duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B4A]" />
        <p className="text-xs font-semibold text-[#8A8A8A]">Generating track-specific assessment questions...</p>
      </div>
    );
  }

  if (isCompleted) {
    const totalAnswered = Object.keys(answers).length;
    const avgScore = totalAnswered > 0
      ? Math.round(Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0) / totalAnswered)
      : 0;

    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-[#B7D9CF] rounded-3xl flex items-center justify-center text-[#1E1E1E] mx-auto shadow-md">
          <Brain className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
            Assessment Completed
          </span>
          <h2 className="text-3xl font-extrabold text-[#1E1E1E] mt-3">Skill Graph Generated!</h2>
          <p className="text-sm text-[#8A8A8A] mt-2">
            AI evaluated your responses across {totalAnswered} questions. Your personalized skill graph and roadmap are ready.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5E5E0] shadow-card text-left space-y-3">
          <h4 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Assessment Summary</h4>
          <div className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-[#E5E5E0]">
            <span>Questions Evaluated</span>
            <span className="text-[#1E1E1E] font-bold">{totalAnswered} / {questions.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-[#E5E5E0]">
            <span>Average Assessment Score</span>
            <span className="text-[#FF6B4A] font-bold">{avgScore}/100</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold py-1.5">
            <span>Track</span>
            <span className="text-[#86C2B2] font-bold">{trackTitle || track}</span>
          </div>
        </div>

        <button
          onClick={handleRevealSkillGraph}
          className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <span>Reveal Skill Graph & Dashboard</span>
          <Sparkles className="w-4 h-4 text-[#F6D67A]" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Assessment Header & Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider flex items-center gap-1.5">
              <span>AI Assessment</span>
              <span className="text-[10px] bg-[#F1F1EF] text-[#8A8A8A] px-2 py-0.5 rounded-full font-bold uppercase">
                {trackTitle || track}
              </span>
            </span>
            <h2 className="text-xl font-bold text-[#1E1E1E] mt-0.5">
              Question {currentIndex + 1} of {questions.length}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleFastForwardAssessment}
            className="text-xs font-bold text-[#8A8A8A] hover:text-[#FF6B4A] bg-[#F7F6F3] hover:bg-[#FFEBE6] px-3.5 py-1.5 rounded-full border border-[#E5E5E0] transition-colors flex items-center gap-1.5"
          >
            <FastForward className="w-3.5 h-3.5 text-[#FF6B4A]" /> Fast-Forward
          </button>
        </div>

        <div className="w-full h-2.5 bg-[#F7F6F3] rounded-full overflow-hidden border border-[#E5E5E0]">
          <div
            className="h-full bg-[#1E1E1E] transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold bg-[#F6D67A] text-[#1E1E1E] px-2 py-0.5 rounded">
              {currentQuestion.difficulty || "Medium"}
            </span>
            <span className="text-xs text-[#8A8A8A] font-semibold">
              Topic: {currentQuestion.topic}
            </span>
          </div>

          <p className="text-base font-bold text-[#1E1E1E] leading-relaxed">
            {currentQuestion.prompt}
          </p>

          {currentQuestion.source === "leetcode" && currentQuestion.title && (
            <span className="text-[10px] text-[#8A8A8A] bg-[#F1F1EF] px-2 py-0.5 rounded">
              Based on: {currentQuestion.title}
            </span>
          )}
        </div>
      )}

      <VoiceAnswerBox onSubmit={handleAnswerSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
