"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Lock, Mail } from "lucide-react";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithFirebase, setUser, enterGuestDemoMode } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const u = await loginWithFirebase(email, password);
      toast.success(`Welcome back, ${u?.name || email.split("@")[0]}!`);
      if (u && (u.track || u.trackTitle || (u.skillGraph && u.skillGraph.nodes?.length > 0))) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.message || "Invalid email or password. Please check your credentials or sign up for a new account.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    toast.info("Entering Demo Mode...");
    await enterGuestDemoMode();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-center p-6">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-8 hover:scale-105 transition-transform">
        <div className="w-12 h-12 bg-[#1E1E1E] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
          A
        </div>
        <span className="font-extrabold text-xl tracking-tight text-[#1E1E1E]">ASCEND</span>
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-[#E5E5E0] shadow-card max-w-md w-full space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-[#1E1E1E]">Welcome Back 👋</h1>
          <p className="text-xs text-[#8A8A8A]">Sign in to continue your technical interview prep sprint.</p>
        </div>

        {errorMsg && (
          <div className="bg-[#FFEBE6] border border-[#FF6B4A]/30 text-[#FF6B4A] text-xs font-semibold p-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] placeholder-[#8A8A8A] p-3.5 pl-10 rounded-2xl focus:outline-none focus:border-[#1E1E1E]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] placeholder-[#8A8A8A] p-3.5 pl-10 rounded-2xl focus:outline-none focus:border-[#1E1E1E]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all"
          >
            <span>{loading ? "Signing In..." : "Sign In & Continue"}</span>
            <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
          </button>
        </form>

        {/* Demo Mode Button for Judges */}
        <button
          onClick={handleDemoClick}
          className="w-full bg-[#E8F4F0] hover:bg-[#D9EBE5] text-[#86C2B2] font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 border border-[#86C2B2]/30 transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-4 h-4" />
          <span>⚡ Explore Instant Demo Mode (Judges)</span>
        </button>

        <div className="text-center pt-2 border-t border-[#E5E5E0]">
          <p className="text-xs text-[#8A8A8A]">
            Don't have an account?{" "}
            <Link href="/" className="font-bold text-[#FF6B4A] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
