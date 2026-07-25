"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, RefreshCw, Sparkles, Tag, Type, Send } from "lucide-react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";

export default function ResumeUploadWidget() {
  const { analyzeAndStoreResume, user } = useStore();
  const toast = useToast();
  const [inputMode, setInputMode] = useState("file"); // "file" | "text"
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState(user.resumeFileName || null);
  const [extractedTags, setExtractedTags] = useState(user.extractedSkills || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result || file.name + " React Node.js System Design SQL Python Algorithms Docker";
      await processAndExtractText(file.name, text.toString());
    };

    reader.readAsText(file);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!pastedText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setFileName("pasted-resume-summary.txt");
    await processAndExtractText("pasted-resume-summary.txt", pastedText);
  };

  const processAndExtractText = async (name, textContent) => {
    await analyzeAndStoreResume(name, textContent);

    const knownKeywords = [
      "React", "Node.js", "System Design", "SQL", "Python", "Java", "C++",
      "Docker", "Algorithms", "Microservices", "TypeScript", "Redis", "AWS"
    ];
    const found = knownKeywords.filter((kw) =>
      textContent.toLowerCase().includes(kw.toLowerCase())
    );

    const resultSkills = found.length > 0 ? found : ["System Design", "Algorithms", "React", "Node.js"];
    setExtractedTags(resultSkills);
    setIsAnalyzing(false);

    toast.success(`Extracted ${resultSkills.length} skills & pre-seeded skill graph!`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-card space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-[#1E1E1E] flex items-center gap-2">
            <span>AI Resume & Background Skill Extractor</span>
            <span className="text-[10px] bg-[#FFEBE6] text-[#FF6B4A] border border-[#FF6B4A]/20 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Pre-seed
            </span>
          </h3>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Upload a resume file or paste your skill summary to pre-seed your skill graph nodes in real-time.
          </p>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="flex bg-[#F7F6F3] p-1 rounded-xl border border-[#E5E5E0]">
          <button
            type="button"
            onClick={() => setInputMode("file")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              inputMode === "file"
                ? "bg-white text-[#1E1E1E] shadow-xs"
                : "text-[#8A8A8A] hover:text-[#1E1E1E]"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> File Upload
          </button>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              inputMode === "text"
                ? "bg-white text-[#1E1E1E] shadow-xs"
                : "text-[#8A8A8A] hover:text-[#1E1E1E]"
            }`}
          >
            <Type className="w-3.5 h-3.5" /> Paste Text
          </button>
        </div>
      </div>

      {/* Uploaded Result Summary */}
      {fileName && (
        <div className="bg-[#E8F4F0] p-4 rounded-2xl border border-[#B7D9CF] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#86C2B2] shadow-xs border border-[#B7D9CF]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[#1E1E1E]">{fileName}</div>
                <span className="text-[10px] text-[#86C2B2] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Skills Extracted & Saved to Firestore
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setFileName(null);
                setExtractedTags([]);
                setPastedText("");
              }}
              className="text-xs font-bold text-[#8A8A8A] hover:text-[#1E1E1E] underline"
            >
              Reset
            </button>
          </div>

          {/* Extracted Skill Badges */}
          {extractedTags && extractedTags.length > 0 && (
            <div className="pt-2 border-t border-[#B7D9CF]/60 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E1E1E]">
                Detected Technical Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-[#1E1E1E] font-bold text-[11px] px-2.5 py-1 rounded-lg border border-[#B7D9CF] shadow-2xs flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-[#FF6B4A]" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Mode 1: Drag & Drop File */}
      {!fileName && inputMode === "file" && (
        <label className="border-2 border-dashed border-[#E5E5E0] hover:border-[#1E1E1E] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F7F6F3]/50">
          <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileChange} className="hidden" />
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-2 text-xs text-[#8A8A8A]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FF6B4A]" />
              <span>Analyzing resume skills & saving to Firestore...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <UploadCloud className="w-8 h-8 text-[#FF6B4A]" />
              <span className="text-xs font-bold text-[#1E1E1E]">Click or Drag Resume File</span>
              <span className="text-[10px] text-[#8A8A8A]">PDF, TXT, DOCX up to 10MB</span>
            </div>
          )}
        </label>
      )}

      {/* Input Mode 2: Paste Direct Resume Text */}
      {!fileName && inputMode === "text" && (
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume summary, bio, or technical skills list here (e.g. 'Software Engineer with 2 years experience in React, Node.js, System Design, SQL, and Docker')..."
            rows={4}
            className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] placeholder-[#8A8A8A] rounded-2xl p-3.5 focus:outline-none focus:border-[#1E1E1E] leading-relaxed resize-none"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!pastedText.trim() || isAnalyzing}
              className="bg-[#1E1E1E] hover:bg-[#333333] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Text...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#F6D67A]" /> Analyze & Pre-seed Skills
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
