"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import VoiceAnswerBox from "@/components/practice/VoiceAnswerBox";
import EvaluationFeedback from "@/components/practice/EvaluationFeedback";
import { Sparkles, Brain, Loader2, RefreshCw } from "lucide-react";

function PracticeContent() {
  const { track, trackTitle, skillGraph, recordPracticeEvaluation, updateStreak } = useStore();
  const searchParams = useSearchParams();
  const targetTopic = searchParams?.get("topic") || "";
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Fetch practice questions from dataset API
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      let url = `/api/dataset/questions?track=${encodeURIComponent(track)}&count=5`;
      if (targetTopic) {
        url += `&topic=${encodeURIComponent(targetTopic)}`;
      }
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
          topic: "General",
          difficulty: "Medium",
          prompt: "How would you design a scalable caching layer for a high-traffic web application?"
        }]);
      }
    } catch (err) {
      console.warn("Failed to fetch practice questions:", err);
      setQuestions([{
        id: "fallback_1",
        source: "fallback",
        topic: "General",
        difficulty: "Medium",
        prompt: "Explain the key differences between SQL and NoSQL databases and when to use each."
      }]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [track, targetTopic]);

  const currentQuestion = questions[questionIndex % questions.length] || questions[0];

  const handleAnswerSubmit = async (answerText) => {
    if (!currentQuestion) return;
    setIsSubmitting(true);

    try {
      // Call Gemini evaluation API
      const evalRes = await fetch("/api/dataset/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.prompt,
          answer: answerText,
          topic: currentQuestion.topic,
          referenceAnswer: currentQuestion.referenceAnswer || ""
        })
      });
      const evalData = await evalRes.json();

      const evaluation = evalData.evaluation || {};
      const score = evaluation.score !== undefined && evaluation.score !== null ? Number(evaluation.score) : 60;
      const xpAwarded = score >= 85 ? 150 : score >= 70 ? 120 : score >= 40 ? 70 : score > 0 ? 30 : 0;

      const evalResult = {
        topic: currentQuestion.topic,
        prompt: currentQuestion.prompt,
        answerText,
        score,
        strengths: evaluation.strengths || ["Provided a response"],
        gaps: evaluation.gaps || [],
        feedbackText: evaluation.feedback || `Score: ${score}/100. Keep practicing!`,
        xpAwarded,
        conceptsCovered: evaluation.conceptsCovered || [],
        suggestedTopics: evaluation.suggestedTopics || []
      };

      setEvaluationResult(evalResult);

      recordPracticeEvaluation({
        topic: currentQuestion.topic,
        prompt: currentQuestion.prompt,
        answerText,
        score,
        xpAwarded,
        feedback: evaluation.feedback || `Evaluated score: ${score}/100`
      });

      updateStreak();
      if (score > 0) {
        toast.xp(`+${xpAwarded} XP Earned! AI Score: ${score}/100`);
      } else {
        toast.warning(`Score: 0/100 for ${currentQuestion.topic}`);
      }
    } catch (err) {
      console.warn("Practice evaluation error:", err);
      const fallbackResult = {
        topic: currentQuestion.topic,
        prompt: currentQuestion.prompt,
        answerText,
        score: 65,
        strengths: ["Provided a response to the question"],
        gaps: ["AI evaluation temporarily unavailable"],
        feedbackText: "Your response was recorded. AI evaluation will be available shortly.",
        xpAwarded: 100
      };
      recordPracticeEvaluation(fallbackResult);
      setEvaluationResult(fallbackResult);
    }

    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setEvaluationResult(null);
  };

  const handleNextQuestion = () => {
    setEvaluationResult(null);
    if (questionIndex + 1 >= questions.length) {
      // Fetch new batch of questions
      fetchQuestions();
      setQuestionIndex(0);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-in fade-in duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B4A]" />
        <p className="text-xs font-semibold text-[#8A8A8A]">Loading adaptive practice questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
            Adaptive Practice
          </span>
          <h1 className="text-2xl font-extrabold text-[#1E1E1E] mt-2">
            Question #{questionIndex + 1}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1E1E1E] bg-[#F6D67A] px-3 py-1.5 rounded-full shadow-xs">
            {currentQuestion?.topic || "General"}
          </span>
          <button
            onClick={() => { fetchQuestions(); setQuestionIndex(0); setEvaluationResult(null); }}
            className="p-2 rounded-xl bg-[#F7F6F3] border border-[#E5E5E0] hover:bg-[#FFEBE6] transition-colors"
            title="Refresh questions"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8A8A8A]" />
          </button>
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold bg-[#F1F1EF] text-[#8A8A8A] px-2 py-0.5 rounded">
              {currentQuestion.difficulty || "Medium"}
            </span>
            {currentQuestion.source === "leetcode" && currentQuestion.title && (
              <span className="text-[10px] text-[#FF6B4A] bg-[#FFEBE6] px-2 py-0.5 rounded font-bold">
                LeetCode: {currentQuestion.title}
              </span>
            )}
          </div>
          <p className="text-base font-bold text-[#1E1E1E] leading-relaxed">
            {currentQuestion.prompt}
          </p>
        </div>
      )}

      {/* Answer Box or Evaluation Feedback */}
      {evaluationResult ? (
        <EvaluationFeedback
          evaluation={evaluationResult}
          onNextQuestion={handleNextQuestion}
          onRetry={handleRetry}
        />
      ) : (
        <VoiceAnswerBox onSubmit={handleAnswerSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B4A]" />
          <p className="text-xs font-semibold text-[#8A8A8A]">Loading practice module...</p>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
