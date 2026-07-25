# Web App Flow — Ascend

## 1. Screen-by-screen user flow

```
[Landing/Sign In]
        |
        v
[Onboarding] --- pick track (e.g. "SDE Interview – Backend")
        |
        v
[Assessment] --- 10 adaptive questions, one at a time
        |
        v
[Skill Graph Reveal] --- animated first render of skill graph from assessment results
        |
        v
[Roadmap Screen] --- 3–5 day plan generated, shown as timeline/checklist
        |
        v
[League Assignment] --- user placed into a league of ~10 (seeded peers), shown briefly
        |
        v
   ┌──────────────────────── Daily Loop (repeats) ─────────────────────────┐
   |  [Practice Screen] → question shown, user answers                     |
   |         |                                                             |
   |         v                                                             |
   |  [Feedback Screen] → score, strengths/gaps, resource recommendation   |
   |         |                                                             |
   |         v                                                             |
   |  [Skill Graph] updates live (node brightness change)                  |
   |         |                                                             |
   |         v                                                             |
   |  [League Board] updates live (XP added, rank shift)                   |
   └─────────────────────────────────────────────────────────────────────┘
        |
        v
[Season End Ceremony] --- promotion/demotion animation (triggered manually for demo)
```

## 2. Screen ownership (cross-reference with rules.md)

| Screen | Owner |
|---|---|
| Onboarding, Assessment, Practice, Feedback | Person B |
| Skill Graph, League Board, Streak Bar, Ceremony Animation | Person C |
| League Assignment logic, Roadmap generation trigger | Person A + D (backend), rendered by B |

## 3. Data flow (high level)

```
User action (frontend)
      |
      v
API call to Express backend (Person A/D routes)
      |
      v
LLM call (question gen / evaluation / roadmap) OR league state update OR RAG lookup
      |
      v
JSON response matching contracts.md
      |
      v
Frontend updates state → re-renders skill graph / league board / feedback screen
```

## 4. Build schedule with checkpoints (24-hour window)

| Time | Activity | Who |
|---|---|---|
| 0:00–1:00 | Together: finalize `contracts.md`, `schema.md`, repo setup, branch creation | All 4 |
| 1:00–4:00 | A: question/evaluate LLM routes. B: onboarding + assessment UI (mocked data). C: skill graph component skeleton (mocked data). D: league schema + bot simulation logic + RAG embedding script | Split |
| 4:00–4:30 | **Checkpoint 1**: merge, run end-to-end with real + mock mix, fix contract mismatches | All 4 |
| 4:30–8:00 | A: roadmap route + prompt refinement. B: practice + feedback screens (real API now). C: skill graph live-update wiring. D: league leaderboard route + polling/socket setup | Split |
| 8:00–8:30 | **Checkpoint 2**: merge, run full assessment → roadmap → practice loop live | All 4 |
| 8:30–13:00 | A: prompt quality testing/iteration (critical — do not skip). B: roadmap screen UI. C: league board UI + streak bar. D: RAG resource recommendation wired to feedback screen | Split |
| 13:00–13:30 | **Checkpoint 3**: full loop test including resource recommendations | All 4 |
| 13:30–18:00 | A: edge case handling (bad LLM output, empty answers). B: polish assessment/practice UX. C: promotion/demotion ceremony animation. D: seeded bot activity tuning for live demo pacing | Split |
| 18:00–18:30 | **Checkpoint 4**: full run-through, time it, identify any dead air or broken transitions | All 4 |
| 18:30–21:00 | Bug fixing only — no new features past this point | All 4 |
| 21:00–22:00 | **Checkpoint 5 (final)**: full dry-run demo, exact script | All 4 |
| 22:00–23:30 | Deck creation (see PRD.md for talking points), deploy to Vercel/Render, final smoke test on deployed URL (not localhost) | Split (2 on deck, 2 on deploy) |
| 23:30–24:00 | Buffer / rest before presenting | All 4 |

## 5. Demo script skeleton (for rehearsal)

1. Show onboarding → pick track (10 sec)
2. Skip through assessment quickly, or start mid-assessment with 2-3 pre-answered (30 sec)
3. Reveal skill graph, point out weak topic (15 sec)
4. Show roadmap screen (10 sec)
5. Answer 1 live practice question → show evaluation feedback → show skill graph node update
   (45 sec)
6. Show league board, point out live XP/rank change, mention seeded peers honestly if asked
   (30 sec)
7. Trigger season-end ceremony manually → promotion/demotion animation (20 sec)
8. Close with business model line (10 sec)

Total: ~3 minutes core demo, leaves room for Q&A.
