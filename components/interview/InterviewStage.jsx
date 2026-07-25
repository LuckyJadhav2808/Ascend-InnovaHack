"use client";

import React, { useState, useEffect, useRef } from "react";
import AudioWaveVisualizer from "./AudioWaveVisualizer";
import { Mic, MicOff, Send, Sparkles, User, Bot, Loader2, ArrowRight, Volume2, VolumeX, SkipForward } from "lucide-react";
import { useToast } from "@/lib/toastContext";

export default function InterviewStage({ session, onCompleteInterview }) {
  const toast = useToast();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stages, setStages] = useState(session?.stages || []);
  const [transcript, setTranscript] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const recognitionRef = useRef(null);
  const seenStagesRef = useRef(new Set());
  const activeStage = stages[currentStageIndex] || stages[0];

  // Web Speech Synthesis Audio Voice Playback Helper
  const speakText = (text) => {
    if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Select a natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("David"))
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => setIsAISpeaking(false);
      utterance.onerror = () => setIsAISpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  };

  // Initialize stage prompt into transcript (IDEMPOTENT FIX FOR DOUBLE INSERTION)
  useEffect(() => {
    if (!activeStage) return;

    const stageNum = currentStageIndex + 1;

    // Synchronous ref check guarantees zero duplicate prompt insertion across re-renders / strict mode!
    if (!seenStagesRef.current.has(stageNum)) {
      seenStagesRef.current.add(stageNum);

      setTranscript((prev) => [
        ...prev,
        {
          role: "interviewer",
          text: activeStage.prompt,
          stageTitle: activeStage.title,
          stageNumber: stageNum
        }
      ]);

      // Speak prompt via Text-to-Speech audio
      speakText(activeStage.prompt);
    }
  }, [currentStageIndex, activeStage]);

  // Handle Voice Speech-to-Text Recording Setup (FIXED FOR DUPLICATE TEXT)
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      toast.info("Voice input paused.");
    } else {
      // Start recording
      if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = false; // Set to false to avoid duplicate interim frames!
          recognition.lang = "en-US";

          recognition.onresult = (event) => {
            let finalSpeechText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              finalSpeechText += event.results[i][0].transcript + " ";
            }
            if (finalSpeechText.trim()) {
              setAnswerText((prev) => (prev ? `${prev.trim()} ${finalSpeechText.trim()}` : finalSpeechText.trim()));
            }
          };

          recognition.onerror = (err) => {
            console.warn("Speech recognition notice:", err.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("SpeechRecognition init error:", e);
        }
      }

      navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then((stream) => {
          setMediaStream(stream);
          setIsRecording(true);
          toast.success("Microphone active — speak your response.");
        })
        .catch(() => {
          setIsRecording(true);
          toast.info("Listening (speech recognition active).");
        });
    }
  };

  // Submit Answer & Fetch Dynamic AI Probe for Stage Advancement
  const handleSubmitTurn = async (overrideText = null) => {
    const textToSubmit = (typeof overrideText === "string" ? overrideText : answerText).trim();
    if (!textToSubmit) {
      toast.warning("Please record or type your answer before proceeding.");
      return;
    }

    if (isRecording) {
      toggleRecording();
    }

    window.speechSynthesis?.cancel(); // Stop AI voice if playing

    const currentStageNum = currentStageIndex + 1;

    // Append candidate's answer to transcript
    const updatedTranscript = [
      ...transcript,
      {
        role: "candidate",
        text: textToSubmit,
        stageNumber: currentStageNum
      }
    ];

    setTranscript(updatedTranscript);
    setAnswerText("");

    // If there are more stages remaining (Stage 1 or Stage 2)
    if (currentStageNum < 3) {
      setIsSubmitting(true);
      toast.info(`Staff Engineer evaluating Stage ${currentStageNum} & preparing probe...`);

      try {
        const res = await fetch("/api/mock-interview/probe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            previousAnswer: textToSubmit,
            currentStageIndex,
            track: session?.track || "web-developer",
            topic: activeStage?.topic || "System Architecture",
            transcript: updatedTranscript
          })
        });

        const data = await res.json();

        if (data.success && data.nextStage) {
          const nextStageObj = data.nextStage;
          // Update stages array with the dynamically generated probe
          setStages((prevStages) => {
            const copy = [...prevStages];
            copy[currentStageIndex + 1] = nextStageObj;
            return copy;
          });

          setCurrentStageIndex((prev) => prev + 1);

          if (data.isUnknownPivot) {
            toast.info("Empathic pivot generated for your technical screen.");
          } else {
            toast.success(`Advancing to Stage ${currentStageNum + 1}...`);
          }
        } else {
          setCurrentStageIndex((prev) => prev + 1);
        }
      } catch (err) {
        console.warn("Probe generation error:", err);
        setCurrentStageIndex((prev) => prev + 1);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Final Stage 3 completed! Submit full transcript for Scorecard evaluation
      setIsSubmitting(true);
      toast.info("Generating your Executive Hiring Scorecard...");
      onCompleteInterview(updatedTranscript);
    }
  };

  return (
    <div className="w-full max-w-4xl max-w-full mx-auto space-y-4 sm:space-y-6 py-2 sm:py-4 px-1 sm:px-0 overflow-x-hidden">
      {/* Top Stage Progression Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#E5E5E0] shadow-card flex items-center justify-between gap-2 overflow-x-auto w-full max-w-full">
        {[0, 1, 2].map((idx) => {
          const isActive = idx === currentStageIndex;
          const isDone = idx < currentStageIndex;
          return (
            <div
              key={idx}
              className={`flex-1 min-w-[120px] sm:min-w-[140px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-center transition-all ${
                isActive
                  ? "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-md scale-[1.02]"
                  : isDone
                  ? "bg-[#E8F4F0] text-[#1E1E1E] border-[#B7D9CF]"
                  : "bg-[#F7F6F3] text-[#8A8A8A] border-[#E5E5E0]"
              }`}
            >
              <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest">
                Stage {idx + 1}
              </div>
              <div className="text-[11px] sm:text-xs font-bold truncate mt-0.5">
                {idx === 0 ? "Architecture Design" : idx === 1 ? "Technical Probe" : "Failure Recovery"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Engineer Interviewer Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E5E5E0] shadow-card flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="relative shrink-0">
            <div className="w-12 sm:w-14 h-12 sm:h-14 bg-[#1E1E1E] text-white rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-md">
              <Bot className="w-6 sm:w-7 h-6 sm:h-7 text-[#F6D67A]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#86C2B2] border-2 border-white rounded-full animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold bg-[#FFEBE6] text-[#FF6B4A] px-2 py-0.5 rounded-full border border-[#FF6B4A]/20">
                Staff Engineer Interviewer
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8A8A8A]">
                {(session?.track || "Web Developer").toUpperCase()} Track
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1E1E1E] mt-0.5 truncate">
              Alex Rivera • Bar-Raiser AI
            </h2>
          </div>
        </div>

        {/* Audio Visualizer & Mute Controls */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#F7F6F3] p-2 sm:p-2.5 rounded-2xl border border-[#E5E5E0] w-full md:w-auto justify-between md:justify-start">
          <AudioWaveVisualizer isRecording={isRecording} isSpeaking={isAISpeaking} audioStream={mediaStream} />
          
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              window.speechSynthesis?.cancel();
            }}
            className="p-2 rounded-xl bg-white border border-[#E5E5E0] hover:bg-[#FFEBE6] text-[#8A8A8A] hover:text-[#FF6B4A] transition-colors shrink-0"
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#FF6B4A]" /> : <Volume2 className="w-4 h-4 text-[#1E1E1E]" />}
          </button>
        </div>
      </div>

      {/* Live Transcript Conversation Bubble Stream */}
      <div className="bg-[#F7F6F3] rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#E5E5E0] shadow-card space-y-3 sm:space-y-4 max-h-[380px] overflow-y-auto w-full max-w-full">
        {transcript.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 sm:gap-3 ${
              item.role === "candidate" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                item.role === "candidate" ? "bg-[#FF6B4A] text-white" : "bg-[#1E1E1E] text-white"
              }`}
            >
              {item.role === "candidate" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#F6D67A]" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-xl p-3 sm:p-4 rounded-2xl text-xs leading-relaxed shadow-xs break-words overflow-hidden ${
                item.role === "candidate"
                  ? "bg-[#1E1E1E] text-white rounded-tr-none"
                  : "bg-white text-[#1E1E1E] border border-[#E5E5E0] rounded-tl-none font-medium"
              }`}
            >
              {item.stageTitle && (
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest font-extrabold text-[#FF6B4A] mb-1">
                  {item.stageTitle}
                </div>
              )}
              <p className="break-words leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Voice & Keyboard Text Answer Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E5E5E0] shadow-card space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-[11px] sm:text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
            Your Stage {currentStageIndex + 1} Response
          </label>

          <button
            onClick={toggleRecording}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all ${
              isRecording
                ? "bg-[#FF6B4A] text-white shadow-md animate-pulse"
                : "bg-[#F7F6F3] text-[#1E1E1E] hover:bg-[#FFEBE6] hover:text-[#FF6B4A] border border-[#E5E5E0]"
            }`}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#FF6B4A]" />}
            <span>{isRecording ? "Stop Recording" : "Push to Talk (Mic)"}</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Speak into your mic or type your response here... (If unsure, type 'I don't know' for a pivot question)."
          className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] placeholder-[#8A8A8A] p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#1E1E1E] resize-none"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={() => handleSubmitTurn("I don't know")}
            disabled={isSubmitting}
            className="text-xs font-bold text-[#8A8A8A] hover:text-[#FF6B4A] underline underline-offset-2 transition-colors disabled:opacity-50 text-center sm:text-left"
          >
            Don't know this? Pivot question
          </button>

          <button
            onClick={handleSubmitTurn}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all"
          >
            <span>
              {isSubmitting
                ? "Evaluating..."
                : currentStageIndex === 2
                ? "Submit Final Screen"
                : "Submit Stage & Continue"}
            </span>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#F6D67A]" /> : <ArrowRight className="w-4 h-4 text-[#F6D67A]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
