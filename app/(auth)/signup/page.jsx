"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: name || "Candidate",
      email: email || "demo@example.com"
    }));
    toast.success(`Welcome to Ascend, ${name || "Candidate"}!`);
    router.push("/onboarding");
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-[#E5E5E0] shadow-card space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#1E1E1E] text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md">
          A
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E1E1E]">Join Ascend</h2>
        <p className="text-xs text-[#8A8A8A]">Adaptive AI coaching & live peer leagues for technical interview prep.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#1E1E1E] uppercase">Full Name</label>
          <input
            type="text"
            placeholder="Alex Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] p-3.5 rounded-2xl focus:outline-none focus:border-[#1E1E1E]"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#1E1E1E] uppercase">Email Address</label>
          <input
            type="email"
            placeholder="alex.chen@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] p-3.5 rounded-2xl focus:outline-none focus:border-[#1E1E1E]"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#1E1E1E] uppercase">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] p-3.5 rounded-2xl focus:outline-none focus:border-[#1E1E1E]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all"
        >
          <span>Choose Track & Onboard</span>
          <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-[#E5E5E0]">
        <p className="text-xs text-[#8A8A8A]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#FF6B4A] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
