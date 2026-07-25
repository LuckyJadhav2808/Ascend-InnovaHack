# ASCEND — Master Build Guide (24-Hour Hackathon)

> **Purpose of this file:** single source of truth for the whole team + any AI coding
> assistant. If you (human or AI) only read one file, read this one. Each teammate also has
> their own `PERSON_X.md` file that is self-contained (repeats the parts of this guide that
> matter to them) so it can be pasted into a fresh AI chat and understood with zero extra
> context.
>
> **Do not deviate from this document's scope, contracts, or schema without posting in the
> team channel first.** Silent contract changes are the #1 way a 4-person hackathon team loses
> hours to merge conflicts.

---

## 1. Product summary (from PRD.md)

**Ascend** is an AI coach for technical interview/exam prep that combines:
- An adaptive 10-question skill assessment → visual skill graph → 3–5 day roadmap
- A daily practice loop (question → answer → AI evaluation → skill graph update → XP)
- A **live league** (Duolingo-style): leaderboard, streaks, seeded peer bots, promotion/demotion

**Initial tracks:** "SDE Interview – Backend", "SDE Interview – Frontend"

**Target user:** students / early-career devs prepping for interviews who quit solo prep after
a few days from lack of structure and accountability.

**Non-goals:** not a hiring tool, not a resume builder, not a human-practice replacement.

### Demo success criteria (memorize these — they define "done")
1. Judge watches one full loop live: answer → skill graph updates → XP added → leaderboard
   shifts — no reload, no dead air.
2. AI evaluation feedback is specific & correct on ≥3 rehearsed sample answers (not generic).
3. Promotion/demotion ceremony triggers and looks intentional when season-end is simulated.

### Hard constraints / risks (from PRD.md §9)
- LLM evaluation quality **is** the product — must be tested against real sample answers before
  the demo, not just built and trusted. (Owner: Person A, non-negotiable checklist item.)
- Seeded league members must be **disclosed honestly** if judges ask — never claim they're real.
- No prior LangChain/RAG experience on the team → everything is scoped to the simplest possible
  implementation (see Tech Stack §3 "Scoped-down usage").

---

## 2. Feature scope (from features.md)

### Tier 1 — Must have (demo breaks without these)
1. Track selection (onboarding)
2. 10-question adaptive assessment
3. Skill graph generation + visual rendering
4. Practice loop: question generation → answer → evaluation → skill graph update
5. XP awarding tied to difficulty
6. League leaderboard (seeded peers) with live-feeling updates
7. Streak counter

### Tier 2 — Should have (build if Tier 1 stable by hour ~13)
8. Roadmap generation screen (post-assessment)
9. Resource recommendation via lightweight RAG
10. Matchup callouts ("You and Rahul both got asked about X...")
11. Promotion/demotion season-end ceremony animation
12. Streak decay visual (greyed flame when inactive)

### Tier 3 — Nice to have (only if far ahead of schedule)
13. Multiple tracks beyond the initial 1–2
14. Socket.io true real-time (vs. polling fallback)
15. LangChain.js SequentialChain wrapper (vs. plain sequential fetch calls)
16. Basic profile/history page showing past sessions
17. Sound effects / micro-animations on XP gain

### Explicitly NOT features (do not build even with spare time)
- Voice/Whisper input
- Resume upload/parsing
- Real payment flow
- Real multi-account matchmaking (beyond seeded bots)
- Anything not listed above — if it's not in this doc, it goes in a "future ideas" note, not
  into code.

**Rule:** nobody touches Tier 2 work until their Tier 1 items are merged and demoed working at
Checkpoint 2 (see §6).

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Fast setup, component reuse across skill graph / league widgets, matches design.md's card-based system well |
| Backend | Node.js + Express | Whole team can read/write JS, minimal setup overhead |
| LLM | Anthropic API (Claude), called via plain `fetch`/SDK, **sequential calls only** | No LangGraph/multi-agent — PRD explicitly scopes this out |
| "Vector DB" | Precomputed JSON embeddings + cosine similarity in a small util function | PRD explicitly forbids standing up a real vector DB server |
| Persistence | In-memory JS objects on the server (`server/store.js`), snapshotted to a local JSON file every N seconds as a demo-safety net | No time to stand up Postgres/Mongo for a 24h single-session demo; a real DB is NOT worth the setup risk |
| Real-time updates | Polling every 3–5s from client (Tier 1) | Socket.io is Tier 3 only — do not build it until leaderboard polling works end-to-end |
| Deployment | Frontend → Vercel, Backend → Render (or a single Render web service serving both) | Matches webappflow.md build schedule |

### Scoped-down usage (per PRD.md risk §9)
- **RAG** = curated `resources.json` (title, url, topic, precomputed embedding array) +
  cosine-similarity ranking against the embedding of the user's weak topic. That's it. No
  chunking pipeline, no live re-embedding, no external vector DB.
- **LLM orchestration** = a handful of plain async functions in `server/services/llm.js`
  (`generateQuestion()`, `evaluateAnswer()`, `generateRoadmap()`). Each is one API call with a
  carefully engineered prompt. No agent loops, no tool-use chains.

---

## 4. Repo structure (agree on this before anyone writes code)

```
/client
  /src
    /components
      /onboarding      ← Person B
      /assessment      ← Person B
      /practice        ← Person B
      /feedback        ← Person B
      /skillgraph      ← Person C
      /league          ← Person C
      /streak          ← Person C
      /ceremony        ← Person C
    /pages             ← shared, thin wrappers that assemble components
    /api               ← fetch wrapper functions, ONE file per contract resource
        assessmentApi.js
        practiceApi.js
        skillgraphApi.js
        roadmapApi.js
        leagueApi.js
        resourcesApi.js
    /state             ← React context or zustand store (user, skillGraph, league)
    App.jsx
/server
  /routes
    assessment.js      ← Person A
    question.js        ← Person A
    evaluate.js        ← Person A
    roadmap.js         ← Person A
    skillgraph.js       ← Person A
    user.js            ← Person D
    league.js          ← Person D
    season.js          ← Person D
    resources.js       ← Person D
    streak.js          ← Person D
  /services
    llm.js             ← Person A (Anthropic client wrapper + prompt templates)
    rag.js             ← Person D (embedding similarity util)
    botSimulator.js     ← Person D
  /data
    resources.json     ← Person D (curated resources + precomputed embeddings)
    seedBots.json       ← Person D (fake league peers)
    prompts/            ← Person A (prompt template text files)
  store.js             ← shared in-memory data store — CHANGE TOGETHER ONLY, see rules.md
  server.js
contracts.md            ← this repo's copy of §7 below — do not edit without team sign-off
schema.md                ← this repo's copy of §8 below — do not edit without team sign-off
rules.md                 ← this repo's copy of §9 below
```

**Ownership rule:** you may read any file. You may only *write* to files under your own
folder(s) listed above without pinging the owner first. `store.js` and any `contracts.md` /
`schema.md` change requires a 1-line heads-up message to all 4 people before you commit.

---

## 5. Design system (from design.md) — quick reference for Person B & C

- Background: soft off-white `#F7F6F3`. Cards: white/`#F1F1EF`, large rounded corners
  (~20–24px), soft drop shadow, no hard borders.
- Category accents (pastel): mint `#B7D9CF`, pink `#F4C9D6`, lavender `#D9CFF0`, warm yellow
  `#F6D67A`.
- **One added accent — coral `#FF6B4A`** — reserved *exclusively* for streak-at-risk flame and
  league rank-change indicators. Do not use it anywhere else; that's what keeps it meaningful.
- Text: near-black `#1E1E1E` primary, grey `#8A8A8A` secondary.
- Font: rounded geometric sans (Poppins or DM Sans).
- Layout: thin icon-only left sidebar; top bar with greeting left / search center / avatar
  right; two-column main (60/40 split); 3-card stat row (XP this week / current rank /
  questions answered); full-width horizontal roadmap strip at bottom.
- Skill Graph panel replaces the reference design's calendar widget (see design.md §5.1) —
  Person C builds this as a compact node-preview, not a calendar.
- League leaderboard mini-list replaces the reference's lesson-list cards.
- "Today's Practice" hero card (one accent color, big **Start Practice** button) replaces the
  reference's "activities today" cards — Person B owns this component.

Full detail lives in `design.md` — read it once before building any component.

---

## 6. Build schedule with checkpoints (24h) — from webappflow.md

| Time | Activity | Who |
|---|---|---|
| 0:00–1:00 | Together: finalize contracts.md, schema.md, repo setup, branches | All 4 |
| 1:00–4:00 | A: question/evaluate LLM routes. B: onboarding + assessment UI (mocked data). C: skill graph component skeleton (mocked data). D: league schema + bot simulation + RAG embedding script | Split |
| 4:00–4:30 | **Checkpoint 1**: merge, run end-to-end with real+mock mix, fix contract mismatches | All 4 |
| 4:30–8:00 | A: roadmap route + prompt refinement. B: practice + feedback screens (real API). C: skill graph live-update wiring. D: leaderboard route + polling setup | Split |
| 8:00–8:30 | **Checkpoint 2**: merge, run full assessment → roadmap → practice loop live | All 4 |
| 8:30–13:00 | A: prompt quality testing/iteration (do not skip). B: roadmap screen UI. C: league board UI + streak bar. D: RAG resource recommendation wired to feedback screen | Split |
| 13:00–13:30 | **Checkpoint 3**: full loop test incl. resource recommendations | All 4 |
| 13:30–18:00 | A: edge case handling (bad LLM output, empty answers). B: polish assessment/practice UX. C: promotion/demotion ceremony animation. D: seeded bot activity tuning for demo pacing | Split |
| 18:00–18:30 | **Checkpoint 4**: full run-through, time it, find dead air / broken transitions | All 4 |
| 18:30–21:00 | **Bug fixing only — no new features past this point** | All 4 |
| 21:00–22:00 | **Checkpoint 5 (final)**: full dry-run demo, exact script | All 4 |
| 22:00–23:30 | Deck creation + deploy to Vercel/Render + smoke test on the deployed URL | Split (2 deck / 2 deploy) |
| 23:30–24:00 | Buffer / rest before presenting | All 4 |

### Screen-by-screen flow
```
Landing/Sign In → Onboarding (pick track) → Assessment (10 adaptive Qs)
→ Skill Graph Reveal → Roadmap Screen → League Assignment (seeded ~10 peers)
→ [Daily Loop: Practice → Feedback → Skill Graph updates → League Board updates]
→ Season End Ceremony (triggered manually for demo)
```

### Demo script skeleton (~3 min core, rehearse this exact sequence)
1. Onboarding → pick track (10s)
2. Skip/fast-forward assessment, or start mid-assessment with 2–3 pre-answered (30s)
3. Reveal skill graph, point out weak topic (15s)
4. Show roadmap screen (10s)
5. Answer 1 live practice question → evaluation feedback → skill graph node update (45s)
6. League board → point out live XP/rank change → **mention seeded peers honestly if asked**
   (30s)
7. Trigger season-end ceremony manually → promotion/demotion animation (20s)
8. Close with business model line (10s)

---

## 7. API Contracts (also duplicated in `contracts.md` and each `PERSON_X.md`)

**Response envelope for every endpoint:**
```json
{ "success": true, "data": { /* ... */ } }
{ "success": false, "error": "human readable message" }
```

| # | Method & Path | Owner | Body / Query | Success `data` shape |
|---|---|---|---|---|
| 1 | `POST /api/user` | D | `{ name, track }` | `{ userId, name, track, createdAt }` |
| 2 | `POST /api/question/generate` | A | `{ userId, mode: "assessment"\|"practice" }` | `{ questionId, topic, difficulty, prompt, mode }` |
| 3 | `POST /api/answer/evaluate` | A | `{ userId, questionId, answerText, mode }` | `{ score, correctness, strengths: [], gaps: [], feedbackText, updatedSkillGraph, xpAwarded }` |
| 4 | `GET /api/skillgraph/:userId` | A | — | `{ nodes: [{ id, topic, mastery, status }], edges: [{ from, to }] }` |
| 5 | `POST /api/roadmap/generate` | A | `{ userId }` | `{ days: [{ day, focusTopic, tasks: [], goalProgress }] }` |
| 6 | `POST /api/league/join` | D | `{ userId, track }` | `{ leagueId, members: [{ userId, name, xp, rank, isBot }], seasonEndsAt }` |
| 7 | `GET /api/league/:leagueId` | D | — | `{ leagueId, members: [], seasonEndsAt }` |
| 8 | `GET /api/league/:leagueId/poll` | D | — | `{ members: [], recentEvents: [] }` |
| 9 | `POST /api/league/xp` | D | `{ userId, leagueId, xpDelta, reason }` | `{ newXp, newRank, rankChanged }` |
| 10 | `POST /api/season/end` | D | `{ leagueId }` | `{ promoted: [], demoted: [], stayed: [] }` |
| 11 | `GET /api/resources/recommend` | D | `?topic=&userId=` | `{ resources: [{ title, url, type, relevanceScore }] }` |
| 12 | `GET /api/streak/:userId` | D | — | `{ currentStreak, longestStreak, lastActiveDate, status }` |

**Rule:** endpoint #3 (`answer/evaluate`) is the one endpoint every screen ultimately depends
on — it returns the updated skill graph AND the xp awarded in one response so the frontend
doesn't have to orchestrate three separate calls after every answer. Person A owns getting
this shape right; Person B/C consume it as-is.

---

## 8. Data schema (also in `schema.md`)

```
User {
  userId, name, track, createdAt,
  skillGraph: SkillGraph,
  xp: number,
  streak: { current, longest, lastActiveDate },
  leagueId
}

SkillGraph {
  nodes: [{ id, topic, mastery (0-100), status: "weak"|"ok"|"strong" }],
  edges: [{ from, to }]
}

Question {
  questionId, topic, difficulty ("easy"|"medium"|"hard"), prompt, mode, expectedConcepts: []
}

EvaluationRecord {
  questionId, userId, answerText, score, feedback, timestamp
}

League {
  leagueId, track, seasonEndsAt,
  members: [{ userId, name, xp, rank, isBot, streak }]
}

Resource {
  id, title, url, topic, type, embedding: number[]
}

RoadmapDay {
  day, focusTopic, tasks: [], goalProgress
}
```

---

## 9. Team rules (also in `rules.md`)

1. **Branches:** `feat/person-a-llm`, `feat/person-b-frontend-flow`, `feat/person-c-graph-league`,
   `feat/person-d-league-backend`. Merge into `main` only at checkpoints, not continuously.
2. **Never edit `contracts.md` / `schema.md` / `store.js` unilaterally** — post a 1-line
   heads-up to the team channel first, wait for a thumbs-up (or 2 min of silence if it's
   urgent and non-breaking).
3. **Mock before real:** before Checkpoint 1, every frontend component must work against
   hardcoded mock JSON matching the contract shape exactly — this is what makes parallel work
   possible at all.
4. **No new features after 18:30** — bug fixing only from Checkpoint 4 onward.
5. **Prompt quality is a scheduled task, not an afterthought** — Person A's 8:30–13:00 block is
   specifically for testing evaluation prompts against real sample answers. Do not skip this
   even if behind schedule elsewhere.
6. **Seeded bots must be disclosed honestly** if a judge asks whether the league is live —
   never claim simulated peers are real users.
7. **Secrets:** API keys go in `.env`, never committed. Add `.env` to `.gitignore` in the first
   commit.
8. **Commit style:** `[A] add question generation route`, `[C] wire skill graph live updates` —
   prefix with your letter so the log stays scannable under time pressure.
9. **If an LLM call fails or returns malformed JSON,** the route must return a safe fallback
   (see PERSON_A.md edge-case checklist) — never let a bad LLM response crash a screen during
   the demo.
10. **Checkpoints are mandatory, not optional** — if your piece isn't ready at a checkpoint,
    say so immediately; the team re-scopes down (drop to a lower tier) rather than letting one
    person's delay silently cascade.

---

## 10. Files in this deliverable

- `00_MASTER_GUIDE.md` — this file
- `PERSON_A_backend_llm.md` — assessment/question/evaluate/roadmap/skillgraph routes + prompt engineering
- `PERSON_B_frontend_flow.md` — onboarding/assessment/practice/feedback screens
- `PERSON_C_frontend_graph_league.md` — skill graph, league board, streak bar, ceremony animation
- `PERSON_D_backend_league.md` — user/league/season/resources/streak routes, bot simulation, RAG

Each person file is self-contained: paste it into a fresh AI chat and it has everything needed
(product context, its own scope, the shared contracts/schema, and the rules) to start building
immediately without cross-referencing this file.
