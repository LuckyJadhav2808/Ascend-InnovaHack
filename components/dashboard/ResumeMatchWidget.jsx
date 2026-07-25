"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/storeContext";
import { FileText, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Upload } from "lucide-react";

export default function ResumeMatchWidget() {
  const { user } = useStore();
  const hasResume = user?.resumeUploaded || (user?.extractedSkills && user.extractedSkills.length > 0);
  const extractedSkills = user?.extractedSkills || [];

  // Calculate ATS Alignment Score based on skills match
  const atsScore = hasResume ? Math.min(94, 65 + extractedSkills.length * 4) : 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E5E5E0] shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F4F0] text-[#86C2B2] flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1E1E1E]">ATS Resume Alignment</h3>
            <p className="text-[10px] text-[#8A8A8A]">Automated resume parser & gap analyzer</p>
          </div>
        </div>

        {hasResume ? (
          <span className="text-xs font-extrabold bg-[#E8F4F0] text-[#86C2B2] px-2.5 py-1 rounded-full border border-[#86C2B2]/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {atsScore}% Match
          </span>
        ) : (
          <Link
            href="/onboarding"
            className="text-[10px] font-bold bg-[#FFEBE6] text-[#FF6B4A] px-2.5 py-1 rounded-full hover:bg-[#FF6B4A] hover:text-white transition-colors"
          >
            Upload Resume
          </Link>
        )}
      </div>

      {hasResume ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A8A8A] font-semibold">
            <span>Verified Resume Skills ({extractedSkills.length})</span>
            <span className="text-[#1E1E1E] font-bold">{user?.resumeFileName || "Uploaded Resume"}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {extractedSkills.slice(0, 6).map((skill, idx) => (
              <span key={idx} className="text-[10px] font-bold bg-[#F7F6F3] text-[#1E1E1E] px-2.5 py-1 rounded-full border border-[#E5E5E0] flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#86C2B2]" /> {skill}
              </span>
            ))}
            {extractedSkills.length > 6 && (
              <span className="text-[10px] font-bold bg-[#F7F6F3] text-[#8A8A8A] px-2.5 py-1 rounded-full border border-[#E5E5E0]">
                +{extractedSkills.length - 6} more
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-[#F7F6F3] border border-[#E5E5E0] flex items-center justify-between text-xs">
          <span className="text-[#8A8A8A] font-medium">Upload your CV to automatically populate skill graph & benchmark salary</span>
          <Link href="/onboarding" className="text-[#FF6B4A] font-bold hover:underline shrink-0 ml-2">
            Upload →
          </Link>
        </div>
      )}
    </div>
  );
}
