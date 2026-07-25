"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import ResumeFeedbackStudio from "@/components/resume/ResumeFeedbackStudio";
import { FileText, Upload, Sparkles, Loader2, ArrowRight, CheckCircle2, RefreshCw, Briefcase, Search } from "lucide-react";

export default function ResumeEnhancerPage() {
  const { track, trackTitle, analyzeAndStoreResume } = useStore();
  const toast = useToast();

  const [availableTracks, setAvailableTracks] = useState([]);
  // Target track state
  const [selectedTrackId, setSelectedTrackId] = useState(track || "web-developer");
  const [selectedTrackTitle, setSelectedTrackTitle] = useState(trackTitle || "Web Developer");
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Fetch all available dataset tracks on mount
  useEffect(() => {
    fetch("/api/dataset/tracks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tracks?.length > 0) {
          setAvailableTracks(data.tracks);
        }
      })
      .catch((err) => console.warn("Failed to fetch available tracks:", err));
  }, []);

  const extractCleanTextFromPDFArrayBuffer = async (arrayBuffer) => {
    try {
      // 1. Dynamically load Mozilla PDF.js if not available
      if (typeof window !== "undefined" && !window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error("Failed to load PDF parser script."));
          document.head.appendChild(script);
        });
      }

      const pdfjsLib = typeof window !== "undefined" ? (window["pdfjs-dist/build/pdf"] || window.pdfjsLib) : null;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let pdfText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          pdfText += pageText + "\n";
        }

        if (pdfText.trim().length > 15) {
          return pdfText.trim();
        }
      }
    } catch (err) {
      console.warn("PDF.js extraction failed, using vocabulary fallback:", err);
    }

    // 2. Vocabulary & Technical Skill Fallback Extractor
    const bytes = new Uint8Array(arrayBuffer);
    let rawText = "";

    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
        rawText += String.fromCharCode(b);
      } else {
        rawText += " ";
      }
    }

    const contactLinks = rawText.match(/(mailto:[^\s]+|https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];

    const resumeVocabulary = new Set([
      "c", "c++", "python", "javascript", "typescript", "html", "css", "react", "next.js",
      "node.js", "fastapi", "mongodb", "sql", "supabase", "firebase", "firestore", "git",
      "github", "netlify", "vercel", "docker", "socket.io", "yjs", "oop", "dbms", "networking",
      "crdt", "programming", "web", "databases", "tools", "concepts", "problem", "solving",
      "developer", "engineer", "software", "frontend", "backend", "fullstack", "experience",
      "projects", "education", "skills", "built", "developed", "managed", "designed",
      "implemented", "created", "lead", "team", "api", "apis", "rest", "graphql", "redux",
      "tailwind", "bootstrap", "express", "postgresql", "mysql", "redis", "linux", "aws",
      "azure", "gcp", "ci/cd", "devops", "jest", "cypress", "junit", "mocha", "pandas",
      "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "android", "ios", "flutter",
      "swift", "kotlin", "java", "golang", "rust", "ruby", "rails", "php", "laravel"
    ]);

    const words = rawText.match(/[a-zA-Z0-9\+\#\.\:\;\/\-\_\@]{1,}/g) || [];
    const matchedResumeWords = [];

    for (const w of words) {
      const lower = w.toLowerCase();
      if (resumeVocabulary.has(lower) || w.includes("@") || w.includes("http")) {
        matchedResumeWords.push(w);
      }
    }

    const allMatches = [...contactLinks, ...matchedResumeWords];
    return [...new Set(allMatches)].join(" ").trim();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.warning("Only PDF files (.pdf) are supported. Please select a PDF document.");
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      try {
        const sanitizedText = await extractCleanTextFromPDFArrayBuffer(arrayBuffer);
        const finalStr = typeof sanitizedText === "string" ? sanitizedText : String(sanitizedText || "");
        setResumeText(finalStr);
        toast.success(`Loaded PDF: ${file.name}`);
      } catch (err) {
        console.warn("Failed to extract text from PDF:", err);
        toast.error("Failed to parse PDF content. Please paste bullet points manually.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAnalyzeResume = async () => {
    const rawStr = typeof resumeText === "string" ? resumeText : String(resumeText || "");
    const cleanStr = rawStr.trim();

    if (!cleanStr || cleanStr.length < 15) {
      toast.warning("Please upload a file or paste your resume content before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    toast.info(`Cross-referencing CV against ${selectedTrackTitle} requirements...`);

    try {
      const res = await fetch("/api/dataset/resume-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: cleanStr,
          track: selectedTrackId
        })
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation({
          ...data.evaluation,
          targetTrack: selectedTrackTitle
        });
        toast.success(`ATS Evaluation complete! Score: ${data.evaluation.atsScore}/100`);

        // Sync extracted skills to global store & skill graph
        if (data.evaluation.matchedKeywords?.length > 0) {
          analyzeAndStoreResume(fileName || "Uploaded_Resume.pdf", cleanStr);
        }
      } else {
        toast.error("Error analyzing resume. Please try again.");
      }
    } catch (err) {
      console.warn("Resume enhancer error:", err);
      toast.error("Network error analyzing resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setEvaluation(null);
  };

  const primaryRoles = [
    { id: "web-developer", title: "Web Developer", category: "Frontend & Full Stack" },
    { id: "sde-backend", title: "SDE Backend Engineer", category: "Systems & APIs" },
    { id: "ai-engineer", title: "AI / ML Engineer", category: "LLMs & ML Pipelines" },
    { id: "data-scientist", title: "Data Scientist & Engineer", category: "Big Data & Analytics" },
    { id: "devops-engineer", title: "DevOps & Cloud Architect", category: "CI/CD & Infrastructure" },
    { id: "mobile-developer", title: "Mobile Developer (iOS / Android)", category: "Mobile Apps" },
    { id: "cybersecurity-engineer", title: "Cybersecurity Analyst", category: "Security & Auditing" },
    { id: "software-engineer", title: "Full Stack Software Engineer", category: "General Engineering" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full border border-[#FF6B4A]/20">
            Dedicated ATS Resume Studio
          </span>
          <h1 className="text-2xl font-extrabold text-[#1E1E1E] mt-2">
            ATS Resume Enhancer & Bullet Studio
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-1">
            Select your target engineering role to benchmark, score, and rewrite your CV bullet points.
          </p>
        </div>
      </div>

      {!evaluation ? (
        <div className="space-y-6">
          {/* File Upload & Target Track Selector Card */}
          <div className="bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card space-y-6">
            {/* Target Role Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#FF6B4A]" /> Target Engineering Role for ATS Benchmark
                </label>
                <span className="text-[10px] text-[#FF6B4A] bg-[#FFEBE6] px-3 py-1 rounded-full font-bold border border-[#FF6B4A]/20">
                  Target: {selectedTrackTitle}
                </span>
              </div>

              {/* Clean 8 Primary Role Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {primaryRoles.map((role) => {
                  const isSelected = selectedTrackId === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedTrackId(role.id);
                        setSelectedTrackTitle(role.title);
                        toast.success(`Target role set to ${role.title}`);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${isSelected
                          ? "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-md scale-[1.02]"
                          : "bg-[#F7F6F3] text-[#1E1E1E] border-[#E5E5E0] hover:border-[#1E1E1E]"
                        }`}
                    >
                      <div className="text-[9px] font-extrabold uppercase tracking-wider opacity-70">
                        {role.category}
                      </div>
                      <div className="text-xs font-extrabold truncate mt-1">
                        {role.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Search Bar for 50+ Specialized Roles */}
              <div className="pt-2 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    placeholder="Search specialized roles (e.g., Android, Python, Cloud, Security, QA)..."
                    className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-[#1E1E1E]"
                  />
                  {trackSearchQuery && (
                    <button
                      onClick={() => setTrackSearchQuery("")}
                      className="absolute right-3 top-3 text-xs text-[#8A8A8A] hover:text-[#1E1E1E] font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filtered Search Results Chips */}
                {trackSearchQuery && (
                  <div className="p-3 bg-[#F7F6F3] rounded-2xl border border-[#E5E5E0] space-y-2 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
                      Search Results ({availableTracks.filter((t) => t.title.toLowerCase().includes(trackSearchQuery.toLowerCase()) || t.id.includes(trackSearchQuery.toLowerCase())).length})
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTracks
                        .filter((t) => t.title.toLowerCase().includes(trackSearchQuery.toLowerCase()) || t.id.includes(trackSearchQuery.toLowerCase()))
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setSelectedTrackId(t.id);
                              setSelectedTrackTitle(t.title);
                              setTrackSearchQuery("");
                              toast.success(`Target role set to ${t.title}`);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedTrackId === t.id
                                ? "bg-[#1E1E1E] text-white shadow-xs"
                                : "bg-white text-[#1E1E1E] border border-[#E5E5E0] hover:border-[#FF6B4A]"
                              }`}
                          >
                            + {t.title}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div className="border-2 border-dashed border-[#E5E5E0] hover:border-[#FF6B4A]/50 bg-[#F7F6F3]/50 p-8 rounded-3xl text-center space-y-3 transition-colors relative group cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#FF6B4A]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#1E1E1E]">
                  {fileName ? `Selected PDF: ${fileName}` : "Click or drag PDF resume here (.pdf)"}
                </h3>
                <p className="text-xs text-[#8A8A8A] mt-1">
                  Supported format: Adobe PDF Document (.pdf)
                </p>
              </div>
            </div>

            {/* Manual Raw Text Area Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider block">
                Or Paste Resume Content / Bullet Points Below
              </label>
              <textarea
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your work experience bullet points, summary, or full resume text here..."
                className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-xs text-[#1E1E1E] placeholder-[#8A8A8A] p-4 rounded-2xl focus:outline-none focus:border-[#1E1E1E] resize-none"
              />
            </div>

            {/* Action CTA Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing}
                className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs px-8 py-4 rounded-2xl flex items-center gap-3 shadow-md hover:scale-105 transition-all"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin text-[#F6D67A]" /> : <Sparkles className="w-5 h-5 text-[#F6D67A]" />}
                <span>{isAnalyzing ? `Evaluating against ${selectedTrackTitle}...` : `Analyze & Enhance for ${selectedTrackTitle}`}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ResumeFeedbackStudio evaluation={evaluation} onReset={handleReset} />
      )}
    </div>
  );
}
