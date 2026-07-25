"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Sparkles, Info, X, Flame, Zap } from "lucide-react";

const ToastContext = createContext(null);

function ToastContainer({ toasts, removeToast }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: 320,
        maxWidth: "calc(100vw - 40px)",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter pointer-events-auto p-4 rounded-2xl border-2 shadow-2xl flex flex-col justify-between gap-2.5 bg-white relative overflow-hidden ${
            t.type === "success"
              ? "border-[#86C2B2] text-[#1E1E1E]"
              : t.type === "warning" || t.type === "error"
              ? "border-[#FF6B4A] text-[#1E1E1E]"
              : t.type === "xp"
              ? "border-[#F6D67A] text-[#1E1E1E]"
              : "border-[#1E1E1E] text-[#1E1E1E]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {t.type === "success" && (
                <div className="w-8 h-8 rounded-xl bg-[#E8F4F0] flex items-center justify-center text-[#86C2B2] shrink-0 border border-[#86C2B2]/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {(t.type === "warning" || t.type === "error") && (
                <div className="w-8 h-8 rounded-xl bg-[#FFEBE6] flex items-center justify-center text-[#FF6B4A] shrink-0 border border-[#FF6B4A]/30">
                  <Flame className="w-5 h-5 fill-[#FF6B4A]" />
                </div>
              )}
              {t.type === "xp" && (
                <div className="w-8 h-8 rounded-xl bg-[#F6D67A] flex items-center justify-center text-[#1E1E1E] shrink-0 border border-[#1E1E1E]/20">
                  <Zap className="w-5 h-5 fill-[#1E1E1E]" />
                </div>
              )}
              {t.type === "info" && (
                <div className="w-8 h-8 rounded-xl bg-[#F7F6F3] flex items-center justify-center text-[#1E1E1E] shrink-0 border border-[#1E1E1E]/20">
                  <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-xs capitalize text-[#1E1E1E]">
                  {t.type === "xp" ? "XP Reward" : t.type}
                </div>
                <p className="text-xs text-[#1E1E1E] font-semibold mt-0.5 leading-relaxed break-words">{t.message}</p>
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-[#8A8A8A] hover:text-[#1E1E1E] p-1 rounded-lg hover:bg-[#F7F6F3] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Visual Time Remaining Progress Bar */}
          <div className="w-full bg-[#F7F6F3] h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ease-linear ${
                t.type === "success"
                  ? "bg-[#86C2B2]"
                  : t.type === "warning" || t.type === "error"
                  ? "bg-[#FF6B4A]"
                  : t.type === "xp"
                  ? "bg-[#F6D67A]"
                  : "bg-[#1E1E1E]"
              }`}
              style={{
                animation: `toastProgress ${t.duration || 5500}ms linear forwards`
              }}
            />
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 2500) => {
    if (!message) return;

    // Deduplicate: Don't show duplicate toast if exact same message is currently active
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev;

      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast = { id, message, type, duration };

      // Fast auto-dismiss timer
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      // Max 1 clean active toast at a time to prevent UI clutter
      return [newToast];
    });
  }, [removeToast]);

  const toast = {
    success: (msg, duration = 2500) => addToast(msg, "success", duration),
    warning: (msg, duration = 2800) => addToast(msg, "warning", duration),
    error: (msg, duration = 3000) => addToast(msg, "error", duration),
    info: (msg, duration = 1800) => addToast(msg, "info", duration),
    xp: (msg, duration = 3000) => addToast(msg, "xp", duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
