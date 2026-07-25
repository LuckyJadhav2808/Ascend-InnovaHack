"use client";

import React, { useEffect, useRef } from "react";

export default function AudioWaveVisualizer({ isRecording, isSpeaking, audioStream }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let audioCtx;
    let analyser;
    let source;
    let dataArray;

    if (isRecording && audioStream) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        console.warn("AudioContext setup notice:", e);
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 6;
      const gap = 4;
      const numBars = 16;
      const startX = (canvas.width - (numBars * (barWidth + gap))) / 2;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < numBars; i++) {
        let barHeight = 8;

        if (isRecording && dataArray && dataArray[i]) {
          barHeight = Math.max(8, (dataArray[i] / 255) * canvas.height * 0.8);
        } else if (isSpeaking) {
          // Animated wave simulation when AI interviewer is speaking
          barHeight = Math.max(8, Math.sin(Date.now() / 150 + i) * 16 + 18);
        } else if (isRecording) {
          // Idle ambient recording wave simulation
          barHeight = Math.max(8, Math.sin(Date.now() / 200 + i * 0.8) * 10 + 12);
        }

        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          gradient.addColorStop(0, "#86C2B2");
          gradient.addColorStop(1, "#B7D9CF");
        } else if (isRecording) {
          gradient.addColorStop(0, "#FF6B4A");
          gradient.addColorStop(1, "#F6D67A");
        } else {
          gradient.addColorStop(0, "#E5E5E0");
          gradient.addColorStop(1, "#8A8A8A");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isRecording, isSpeaking, audioStream]);

  return (
    <div className="flex items-center justify-center p-2">
      <canvas ref={canvasRef} width={220} height={48} className="rounded-xl bg-[#F7F6F3]/50 border border-[#E5E5E0]/50 shadow-inner" />
    </div>
  );
}
