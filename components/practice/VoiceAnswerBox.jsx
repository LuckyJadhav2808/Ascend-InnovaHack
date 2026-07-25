"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, RefreshCw, AlertCircle } from "lucide-react";

export default function VoiceAnswerBox({ onSubmit, isSubmitting = false }) {
  const [answerText, setAnswerText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  // Store initial text before recording starts so we can cleanly append without interim duplication
  const baseTextRef = useRef("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event) => {
          let sessionTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }

          const base = baseTextRef.current;
          const fullText = base ? `${base.trim()} ${sessionTranscript.trim()}` : sessionTranscript.trim();
          setAnswerText(fullText);
        };

        recog.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      } else {
        setRecognitionSupported(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      baseTextRef.current = answerText;
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim() || isSubmitting) return;
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    const textToSubmit = answerText;
    setAnswerText("");
    baseTextRef.current = "";
    onSubmit(textToSubmit);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header & Voice Controls */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
            <span>Your Technical Answer</span>
            <span className="text-[10px] normal-case bg-[#F1F1EF] text-[#8A8A8A] px-2 py-0.5 rounded-full font-medium">
              Type or Speak
            </span>
          </label>

          {/* Voice Input Toggle Button */}
          {recognitionSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                isListening
                  ? "bg-[#FF6B4A] text-white animate-pulse shadow-glow-coral"
                  : "bg-[#FFEBE6] text-[#FF6B4A] hover:bg-[#FFD6CD]"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? "Listening... (Click to Stop)" : "Voice Answer"}</span>
            </button>
          ) : (
            <span className="text-[10px] text-[#8A8A8A] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-[#FF6B4A]" /> Voice input unsupported in browser
            </span>
          )}
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            value={answerText}
            onChange={(e) => {
              setAnswerText(e.target.value);
              baseTextRef.current = e.target.value;
            }}
            placeholder="Type your structured answer here or click 'Voice Answer' to dictate live..."
            rows={5}
            className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] placeholder-[#8A8A8A] rounded-2xl p-4 focus:outline-none focus:border-[#1E1E1E] transition-colors resize-none leading-relaxed"
          />

          {isListening && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[#FF6B4A] bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-xs border border-[#FF6B4A]/20">
              <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-ping" />
              Live Dictating...
            </div>
          )}
        </div>

        {/* Submit & Reset Action Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setAnswerText("");
              baseTextRef.current = "";
            }}
            className="text-xs text-[#8A8A8A] hover:text-[#1E1E1E] flex items-center gap-1 transition-colors font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Text
          </button>

          <button
            type="submit"
            disabled={!answerText.trim() || isSubmitting}
            className="bg-[#1E1E1E] hover:bg-[#333333] disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 transition-all"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Answer...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#F6D67A]" /> Submit Answer for AI Evaluation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
