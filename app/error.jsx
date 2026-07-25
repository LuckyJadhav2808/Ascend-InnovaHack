"use client";

import React, { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Next.js App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFEBE6] text-[#FF6B4A] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#1E1E1E]">Something Went Wrong</h2>
          <p className="text-xs text-[#8A8A8A]">
            {error?.message || "An unexpected error occurred while loading this view."}
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1E1E1E] hover:bg-[#333333] text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
