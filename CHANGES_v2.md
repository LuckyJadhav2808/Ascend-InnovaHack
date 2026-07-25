# ASCEND — Scope & Stack Update (v2)

> **How to use this file:** read this together with the original 6 files
> (`00_MASTER_GUIDE.md`, `GIT_WORKFLOW.md`, `PERSON_A/B/C/D_*.md`). This file does **not**
> replace them — it tells you exactly what changed and which sections in the originals are now
> outdated. If a section below conflicts with something in the original files, **this file
> wins**. If an AI assistant is helping build this project, give it the relevant `PERSON_X.md`
> file **and** this file together, always.

---

## 1. What changed, in one paragraph

Original plan: React (Vite) frontend + Express backend + in-memory server-side store, single-
user demo with simulated peers only, and a fixed "do not build" list (voice input, resume
upload, real accounts/matchmaking, profile/history page, sound effects, LangChain wrapper,
Socket.io) that was either explicitly out of scope or Tier-3 stretch goals.

**New plan:** all of those excluded/Tier-3 items are now in scope and required. To fit that in
24 hours with 4 people, the stack changes to **Next.js (React) + Firebase (Auth + Firestore +
Storage)**, replacing Express and the in-memory store. Firebase absorbs a huge amount of what
would've been custom backend work (auth, persistence, real-time sync), which is what makes the
expanded scope realistic in the same time budget.

---

## 2. Tech stack — supersedes `00_MASTER_GUIDE.md` §3 entirely

| Layer | OLD | NEW |
|---|---|---|
| Framework | React (Vite) frontend + Express backend, two separate apps | **Next.js (App Router)** — one app, pages + API routes together |
| Auth | none (single anonymous demo user) | **Firebase Authentication** (email/password) — real signup/login |
| Database | In-memory JS objects (`server/store.js`) | **Firestore** — real, persistent, no snapshot hack needed |
| File storage | n/a | **Firebase Storage** — resume uploads |
| Real-time updates | Client polling every 3–5s | **Firestore `onSnapshot` listeners** — push-based, no polling code needed (see §4) |
| LLM calls | Plain sequential `fetch` calls | Plain sequential calls **by default**; **LangChain.js `SequentialChain`** wrapper is now an in-scope upgrade (Person A, build after the plain version works) |
| Voice input | out of scope | **Web Speech API** (built into the browser — `SpeechRecognition`). No Whisper, no extra API cost, no backend involvement. |
| Resume | out of scope | Upload to **Firebase Storage** (Person B) + a parsing API route using `pdf-parse` (Person A) that pulls topics/keywords to pre-seed the skill graph before the assessment starts |
| Deployment | Frontend → Vercel, Backend → Render (two deploys) | **Single Vercel deploy** (Next.js serves both pages and API routes). Firebase project is configured separately in the Firebase Console — no separate backend host at all. |

**RAG stays the same:** still a precomputed `resources.json` + cosine similarity, no real
vector DB. This part of the original plan didn't change.

---

## 3. Feature tiers — supersedes `00_MASTER_GUIDE.md` §2 and `features.md`'s "explicitly not
features" list

The following are **no longer excluded** — they're in scope. Updated tier placement:

**Tier 1 (must have) — added:**
- Firebase Auth signup/login (real accounts, not anonymous)
- League matchmaking now finds/creates a real Firestore league doc per track, mixing real
  authenticated users with seeded bots (bots still fill out the leaderboard so it doesn't look
  empty with only 1–2 real testers)

**Tier 2 (should have) — added:**
- Voice input on the practice/assessment answer box (Web Speech API, alternative to typing)
- Resume upload (Firebase Storage) on the onboarding screen
- Profile/history page (past sessions, read directly from Firestore)

**Tier 3 (stretch, only if far ahead) — added:**
- LangChain.js `SequentialChain` wrapper around the question→evaluate→roadmap flow
- Resume **parsing** specifically (auto-extracting skills from the uploaded file to pre-seed
  the skill graph) — the upload itself is Tier 2, the parsing logic is Tier 3
- Sound effects / micro-animations on XP gain, streak, rank change
- A literal Socket.io layer — **see §4, this is likely unnecessary now, read before building it**

Everything else in the original Tier 1/2/3 lists is unchanged.

**Still explicitly not in scope, no change:** real payment flow, features not listed anywhere in
these docs.

---

## 4. Important architecture note: Socket.io is probably redundant now

The original "Socket.io true real-time" request existed because the old plan used polling.
Firestore's `onSnapshot` listeners already push live updates to every connected client the
instant a document changes — that's the same problem Socket.io solves, built into Firebase for
free, with no server to run or connections to manage.

**Default/recommended approach:** Person C wires the skill graph, league board, and streak bar
directly to `onSnapshot` listeners on the relevant Firestore documents. This satisfies the
"live leaderboard" and "no reload" demo requirements without any extra real-time infrastructure.

**If you still want literal Socket.io:** it would only add value for something Firestore
doesn't naturally give you — e.g., ephemeral presence ("who's online right now") or typing
indicators. If the team wants that specifically, treat it as a genuine Tier 3 add-on late in
the day, layered on top of (not replacing) the Firestore listeners. Don't spend Tier 1 time on
it.

---

## 5. Reads vs. writes — new rule that changes ownership slightly

With Firestore, **not every piece of data needs a custom API route.** Split it like this:

- **Direct client reads (no API route, Firestore security rules control access):**
  - `users/{uid}` — skill graph, XP, streak, track (read by Person C's skill graph/streak
    components and Person B's dashboard, written by Person A/D's API routes)
  - `leagues/{leagueId}/members` — league board (read live by Person C, written by Person D's
    API routes)
  - `users/{uid}/history` — profile/history page (read by Person B, written by Person A's
    evaluate route)
- **API routes required (need the Anthropic key or privileged writes — Firebase Admin SDK
  only, never exposed to the browser):**
  - Everything that calls the LLM (Person A)
  - Everything that awards XP, joins a league, or ends a season (Person D — these need
    server-side validation so a client can't just write itself a higher XP value directly)
  - Resume parsing (Person A)
  - RAG resource recommendation (Person D)

This means Person C in particular has **less to build against custom endpoints** than before —
mostly just Firestore listeners — which is what frees up time for the sound effects/animation
work now in their Tier 3 list.

---

## 6. Firestore data model — supersedes the "Data schema" sections in the original files

```
users/{uid}
  name, email, track, createdAt
  xp: number
  streak: { current, longest, lastActiveDate }
  leagueId
  skillGraph: { nodes: [{ id, topic, mastery, status }], edges: [{ from, to }] }
  resumeUrl: string | null

users/{uid}/history/{recordId}
  questionId, topic, difficulty, prompt, answerText, score, feedback, mode, timestamp

leagues/{leagueId}
  track, seasonEndsAt, maxMembers

leagues/{leagueId}/members/{uid}
  name, xp, rank, isBot, streak
```

`resources.json` (RAG) stays a bundled static file, not a Firestore collection — no change
there.

---

## 7. Updated API routes — supersedes the contract table in the original files

All routes now live under Next.js's `/app/api/*` and are called with an
`Authorization: Bearer <firebaseIdToken>` header. Every route verifies that token server-side
with the Firebase Admin SDK before touching Firestore — this is the one piece of shared setup
code (in `/lib/firebaseAdmin.js`) that Person D should build first, since everyone else's
routes depend on it.

| Route | Owner | Notes |
|---|---|---|
| `POST /api/question/generate` | A | unchanged in shape |
| `POST /api/answer/evaluate` | A | now also writes to `users/{uid}/history` |
| `POST /api/roadmap/generate` | A | unchanged in shape |
| `POST /api/resume/parse` | A | new, Tier 3 |
| `POST /api/league/join` | D | now does real matchmaking: find an open Firestore league for the user's track, or create one seeded with bots |
| `POST /api/league/xp` | D | unchanged in shape, now writes to Firestore instead of memory |
| `POST /api/season/end` | D | unchanged in shape |
| `GET /api/resources/recommend` | D | unchanged |
| `POST /api/bots/tick` | D | new — nudges bot XP in Firestore periodically so the leaderboard moves live |

Anything not listed here that used to be a `GET` route in the old contract (skillgraph, league
state, streak) is now a **direct Firestore read**, not a route — see §5.

---

## 8. Repo structure — supersedes `00_MASTER_GUIDE.md` §4

```
/app
  /app/(auth)/login/page.jsx         ← B
  /app/(auth)/signup/page.jsx        ← B
  /app/onboarding/page.jsx           ← B
  /app/assessment/page.jsx           ← B
  /app/practice/page.jsx             ← B (incl. voice input)
  /app/feedback/page.jsx             ← B
  /app/roadmap/page.jsx              ← B
  /app/dashboard/page.jsx            ← C (skill graph + league board + streak)
  /app/profile/page.jsx              ← B
  /app/api/question/generate/route.js   ← A
  /app/api/answer/evaluate/route.js     ← A
  /app/api/roadmap/generate/route.js    ← A
  /app/api/resume/parse/route.js        ← A
  /app/api/league/join/route.js         ← D
  /app/api/league/xp/route.js           ← D
  /app/api/season/end/route.js          ← D
  /app/api/resources/recommend/route.js ← D
  /app/api/bots/tick/route.js           ← D
/components
  /auth /onboarding /assessment /practice /feedback /profile   ← B
  /skillgraph /league /streak /ceremony                        ← C
/lib
  firebaseClient.js   ← shared, Firebase client SDK init (Auth + Firestore + Storage)
  firebaseAdmin.js    ← shared, Firebase Admin SDK init + token-verify helper (D builds first)
  llm.js              ← A (Anthropic client + optional LangChain chain)
  rag.js              ← D
  botSimulator.js     ← D
/data
  resources.json  ← D
  seedBots.json   ← D
  prompts/        ← A
firestore.rules   ← shared, D drafts first, whole team reviews before Checkpoint 1
```

---

## 9. Deployment — supersedes `GIT_WORKFLOW.md` §10

1. **Firebase Console** (not Render): create a Firebase project, enable **Authentication**
   (Email/Password), **Firestore**, and **Storage**. Generate a service account key for the
   Admin SDK (used only server-side, in `/lib/firebaseAdmin.js` — never shipped to the browser).
2. **Single Vercel deploy** for the whole Next.js app (pages + API routes together) — no
   separate backend host needed.
3. Environment variables needed on Vercel: the Firebase client config (public, safe to expose),
   the Firebase Admin service account credentials (secret), and the Anthropic API key (secret).
4. Deploy `firestore.rules` via the Firebase CLI (`firebase deploy --only firestore:rules`)
   before the final demo — don't leave Firestore in fully-open test mode on stage.

---

## 10. Ownership — no lane changes, features just slot into the existing 4 people

- **Person A** — adds: LangChain wrapper (Tier 3), resume parsing route (Tier 3)
- **Person B** — adds: login/signup screens, voice input in practice screen, resume upload UI,
  profile/history page
- **Person C** — adds: switches from polling to Firestore `onSnapshot` listeners, sound
  effects/micro-animations (Tier 3)
- **Person D** — adds: Firebase Admin token-verify helper (build first, everyone depends on
  it), real matchmaking logic, `firestore.rules`, bot-tick route

No 5th person needed, per your earlier call to keep the 4 roles.
