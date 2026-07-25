"use client";

import React, { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F7F6F3] text-[#1E1E1E] flex min-h-screen items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card text-center space-y-4 m-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEBE6] text-[#FF6B4A] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#1E1E1E]">Application Error</h2>
            <p className="text-xs text-[#8A8A8A]">
              {error?.message || "An unexpected system error occurred."}
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1E1E1E] hover:bg-[#333333] text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
