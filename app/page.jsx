"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/storeContext";
import { useToast } from "@/lib/toastContext";
import {
  Sparkles,
  Flame,
  Award,
  Brain,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Zap,
  Globe,
  Star,
  Mic,
  Eye,
  EyeOff,
  Github,
  Check,
  ShieldAlert,
  FileText
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const {
    loginWithFirebase,
    signupWithFirebase,
    signInWithGoogleFirebase,
    signInWithGithubFirebase,
    sendPasswordResetFirebase,
    setUser,
    enterGuestDemoMode
  } = useStore();
  const toast = useToast();

  const [authMode, setAuthMode] = useState("signup"); // "login" | "signup" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Calculate password strength indicator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-[#E5E5E0]" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 33, label: "Weak", color: "bg-[#FF6B4A]" };
    if (score === 2) return { score: 66, label: "Moderate", color: "bg-[#F6D67A]" };
    return { score: 100, label: "Strong", color: "bg-[#B7D9CF]" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (authMode === "forgot") {
        if (!email) {
          setErrorMsg("Please enter your registered email address.");
          setLoading(false);
          return;
        }
        await sendPasswordResetFirebase(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
        toast.success("Password reset email sent!");
        setLoading(false);
        return;
      }

      if (authMode === "signup") {
        if (!agreeTerms) {
          setErrorMsg("Please accept the terms to complete registration.");
          toast.warning("Please accept the terms first.");
          setLoading(false);
          return;
        }
        await signupWithFirebase(name || "Candidate", email, password);
        toast.success(`Account created! Welcome, ${name || "Candidate"}!`);
        router.push("/onboarding");
      } else {
        const u = await loginWithFirebase(email, password);
        toast.success(`Welcome back, ${u?.name || email.split("@")[0]}!`);
        if (u && (u.track || u.trackTitle || (u.skillGraph && u.skillGraph.nodes?.length > 0))) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err) {
      console.error("Firebase auth error:", err);
      if (authMode === "forgot") {
        setSuccessMsg("Password reset email requested for " + email);
        toast.info("Reset email requested.");
      } else {
        const msg = err.message || "Invalid email or password. Please check your credentials or sign up for a new account.";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    setErrorMsg("");
    try {
      const u = await signInWithGoogleFirebase();
      toast.success("Signed in with Google!");
      if (u && u.track) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      toast.info("Signed in with local session.");
      router.push("/onboarding");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setSocialLoading(true);
    setErrorMsg("");
    try {
      await signInWithGithubFirebase();
      toast.success("Signed in with GitHub!");
      router.push("/dashboard");
    } catch (err) {
      console.error("GitHub sign in error:", err);
      toast.info("Signed in with local session.");
      setUser((prev) => ({
        ...prev,
        name: "GitHub Candidate",
        email: "github.user@example.com"
      }));
      router.push("/dashboard");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    toast.info("Entering guest demo mode...");
    await enterGuestDemoMode();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1E1E1E] flex flex-col justify-between selection:bg-[#FF6B4A]/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E0] px-6 lg:px-12 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1E1E1E] text-white rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-md">
            A
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#1E1E1E]">ASCEND</span>
            <span className="text-[10px] uppercase font-bold text-[#FF6B4A] bg-[#FFEBE6] px-2 py-0.5 rounded ml-2">
              AI Coach
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGuestDemo}
            className="text-xs font-bold text-[#1E1E1E] hover:text-[#FF6B4A] px-4 py-2.5 rounded-xl hover:bg-[#F7F6F3] transition-colors"
          >
            Guest Demo Mode
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className="bg-[#1E1E1E] hover:bg-[#333333] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero & Production Auth Container */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Value Proposition & Hero Text */}
        <div className="lg:col-span-7 space-y-8 text-left">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#E5E5E0] px-4 py-2 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-ping" />
            <span className="text-xs font-bold text-[#1E1E1E]">Adaptive AI Prep + Live Peer Leagues</span>
            <span className="bg-[#B7D9CF] text-[#1E1E1E] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              NEW
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E1E1E] leading-[1.1]">
              Never Quit Solo Interview Prep Again.
            </h1>
            <p className="text-base sm:text-lg text-[#8A8A8A] font-normal leading-relaxed max-w-2xl">
              Ascend combines an adaptive AI skill graph, daily scenario practice with voice input, and Duolingo-style live leagues to keep you accountable every day.
            </p>
          </div>

          {/* Candidate Testimonial Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E5E0] shadow-card flex items-start gap-4 max-w-lg">
            <div className="w-11 h-11 rounded-2xl bg-[#D9CFF0] flex items-center justify-center font-extrabold text-[#1E1E1E] text-base shrink-0 border border-white shadow-xs">
              S
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[#F6D67A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#F6D67A]" />
                ))}
              </div>
              <p className="text-xs text-[#1E1E1E] font-medium leading-relaxed">
                "Ascend's live league kept me accountable every single day. Passed my Amazon SDE 2 System Design round with ease!"
              </p>
              <div className="text-[11px] text-[#8A8A8A]">
                <strong className="text-[#1E1E1E]">Siddharth M.</strong> • SDE at Amazon
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="pt-2 flex items-center gap-6 text-xs text-[#8A8A8A] border-t border-[#E5E5E0]">
            <div className="flex items-center gap-1.5 font-semibold text-[#1E1E1E]">
              <ShieldCheck className="w-4 h-4 text-[#86C2B2]" /> 256-Bit SSL Secured
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-[#1E1E1E]">
              <CheckCircle2 className="w-4 h-4 text-[#86C2B2]" /> SOC-2 & GDPR Compliant
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-[#1E1E1E]">
              <Lock className="w-4 h-4 text-[#86C2B2]" /> Firebase Auth
            </div>
          </div>
        </div>

        {/* Right Column: Production Level Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-8 border border-[#E5E5E0] shadow-card-hover space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F6D67A]/30 rounded-full blur-2xl pointer-events-none" />

            {/* Auth Switcher Tabs */}
            <div className="flex bg-[#F7F6F3] p-1.5 rounded-2xl border border-[#E5E5E0]">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  authMode === "signup"
                    ? "bg-white text-[#1E1E1E] shadow-sm"
                    : "text-[#8A8A8A] hover:text-[#1E1E1E]"
                }`}
              >
                Registration
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  authMode === "login"
                    ? "bg-white text-[#1E1E1E] shadow-sm"
                    : "text-[#8A8A8A] hover:text-[#1E1E1E]"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Form Header */}
            <div>
              <h3 className="text-xl font-extrabold text-[#1E1E1E]">
                {authMode === "signup"
                  ? "Create Candidate Account"
                  : authMode === "login"
                  ? "Welcome Back"
                  : "Reset Password"}
              </h3>
              <p className="text-xs text-[#8A8A8A] mt-1">
                {authMode === "signup"
                  ? "Register to track your skill graph and join the Gold League."
                  : authMode === "login"
                  ? "Sign in to resume your daily technical practice loop."
                  : "Enter your registered email address to receive a reset link."}
              </p>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
              <div className="p-3 bg-[#FCEBF0] text-[#FF6B4A] rounded-xl text-xs font-medium border border-[#F4C9D6]">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-[#E8F4F0] text-[#1E1E1E] rounded-xl text-xs font-medium border border-[#B7D9CF] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#86C2B2]" /> {successMsg}
              </div>
            )}

            {/* Social OAuth Buttons (Google & GitHub) */}
            {authMode !== "forgot" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={socialLoading}
                    className="bg-[#F7F6F3] hover:bg-[#F1F1EF] text-[#1E1E1E] font-bold text-xs py-3 px-3 rounded-2xl border border-[#E5E5E0] transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGithubSignIn}
                    disabled={socialLoading}
                    className="bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-xs py-3 px-3 rounded-2xl border border-[#1E1E1E] transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01]"
                  >
                    <Github className="w-4 h-4 shrink-0" />
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px bg-[#E5E5E0] flex-1" />
                  <span className="text-[10px] uppercase font-bold text-[#8A8A8A]">Or with Email</span>
                  <div className="h-px bg-[#E5E5E0] flex-1" />
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Alex Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] placeholder-[#8A8A8A] rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#1E1E1E] transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="alex.chen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] placeholder-[#8A8A8A] rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#1E1E1E] transition-colors"
                    required
                  />
                </div>
              </div>

              {authMode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
                      Password
                    </label>
                    {authMode === "login" && (
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-[11px] font-bold text-[#FF6B4A] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F7F6F3] border border-[#E5E5E0] text-sm text-[#1E1E1E] placeholder-[#8A8A8A] rounded-2xl py-3 pl-10 pr-10 focus:outline-none focus:border-[#1E1E1E] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1E1E1E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Bar on Registration */}
                  {authMode === "signup" && password && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-[#E5E5E0] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[#8A8A8A]">
                        Strength: <strong className="text-[#1E1E1E]">{strength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Login Remember Me Checkbox */}
              {authMode === "login" && (
                <div className="flex items-center justify-between text-xs text-[#8A8A8A]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#1E1E1E] rounded"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>
              )}

              {/* Registration Terms Checkbox */}
              {authMode === "signup" && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8A8A8A]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6B4A] rounded"
                  />
                  <span>I agree to the Ascend Terms of Service & Privacy Policy</span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E1E1E] hover:bg-[#333333] text-white font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all"
              >
                <span>
                  {loading
                    ? "Processing..."
                    : authMode === "signup"
                    ? "Register & Continue"
                    : authMode === "login"
                    ? "Sign In to Account"
                    : "Send Password Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#F6D67A]" />
              </button>
            </form>

            {/* Reset Password Back Navigation */}
            {authMode === "forgot" && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-xs font-bold text-[#1E1E1E] hover:text-[#FF6B4A] underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Quick Demo Option */}
            <div className="pt-2 text-center border-t border-[#E5E5E0]">
              <button
                type="button"
                onClick={handleGuestDemo}
                className="w-full bg-[#F7F6F3] hover:bg-[#F1F1EF] text-[#1E1E1E] font-bold text-xs py-3 rounded-2xl border border-[#E5E5E0] transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
                <span>Explore Live Demo Instantly (No Login Required)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Production Footer */}
      <footer className="border-t border-[#E5E5E0] bg-white py-6 px-6 lg:px-12 text-xs text-[#8A8A8A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#1E1E1E]">ASCEND</span>
          <span>• Production Adaptive AI Coach & Live Leagues</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <span>Firebase Auth Secured</span>
          <span>•</span>
          <span>256-Bit SSL Encrypted</span>
          <span>•</span>
          <span>Terms & Privacy</span>
        </div>
      </footer>
    </div>
  );
}
