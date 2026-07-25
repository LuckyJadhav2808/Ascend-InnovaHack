# PRD — Ascend: Adaptive AI Prep Coach with Live Leagues

## 1. Problem

Interview/exam prep is solo, unstructured, and easy to abandon. Existing tools (LeetCode,
Pramp, generic AI quiz apps) either lack adaptivity (same question set for everyone) or lack
any social/accountability layer, so users lose motivation after a few days. There is no tool
that combines **adaptive AI coaching** with a **live social pressure mechanic** proven to work
in habit-forming apps (Duolingo-style leagues/streaks).

## 2. Solution

Ascend is an AI coach that assesses a user's skill level, builds a visual skill graph, generates
a personalized roadmap, and runs a daily adaptive Q&A loop — while placing the user in a small
live league of peers prepping for similar roles, with XP, streaks, and promotion/demotion to
create real reason to show up daily.

## 3. Target user

Students and early-career professionals preparing for technical interviews or exams (initial
track focus: SDE interview prep — DSA, system design fundamentals) who currently rely on
disconnected, unstructured self-study.

## 4. Core user story

> "As a candidate preparing for interviews, I want a coach that knows exactly what I'm weak at,
> tells me what to do today, and makes me feel like I'll fall behind my peers if I skip a day —
> so I actually finish my prep instead of giving up after day 3."

## 5. Scope for this build (24-hour hackathon)

### In scope (MVP)
- Track selection (start with 1–2 tracks: "SDE Interview – Backend", "SDE Interview – Frontend")
- 10-question adaptive assessment
- Skill graph (visual, per-topic mastery)
- Roadmap generation (3–5 day plan)
- Daily learning loop: generate question → answer → evaluate → update skill graph → award XP
- Live league: leaderboard, streaks, seeded peer activity, promotion/demotion ceremony
- Resource recommendation via lightweight RAG (curated list + embedding similarity)

### Explicitly out of scope (do not build, even if time remains)
- Voice input/Whisper integration
- Real multi-user backend (real matchmaking across real accounts) — league is single-user +
  simulated peers for demo
- Full LangGraph multi-agent graph orchestration
- Real vector DB server (Chroma/FAISS) — use precomputed JSON embeddings instead
- Resume parsing/upload
- Payment/subscription flow (business model is pitched, not built)

## 6. Success criteria for the demo

1. A judge can watch one full loop live: answer a question → see skill graph update → see XP
   added → see leaderboard shift — without a page reload feeling disconnected from the action.
2. The AI's evaluation feedback must be specific and correct on at least 3 rehearsed sample
   answers (not generic "good job" text).
3. The promotion/demotion ceremony must trigger and look intentional, not broken, when
   season-end is simulated at the end of the demo.

## 7. Non-goals

This is not a replacement for real interview practice with humans, not a hiring tool, not a
resume builder. It is a **habit and skill-development layer** for solo prep.

## 8. Business model (for pitch, not built)

- B2C freemium: free league + basic practice, paid tier for more tracks / deeper analytics.
- B2B2C: license to bootcamps/college placement cells to keep cohorts engaged during placement
  season (real, existing budget line for these institutions).

## 9. Risks (see rules.md and techstack.md for mitigation)

- LLM evaluation quality is the actual product — must be tested with real sample answers before
  the demo, not just built and trusted.
- Seeded league members must be disclosed honestly if asked by judges, not presented as real
  live users.
- Team has no prior LangChain/RAG experience — scoped to minimal, low-risk implementations only
  (see techstack.md section "Scoped-down usage").
