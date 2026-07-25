# Rules — Ascend Team Working Agreement

## 1. Branching

- `main` stays stable at all times. Nobody commits directly to `main`.
- Each person works on their own branch: `feature/backend-core`, `feature/frontend-flow`,
  `feature/frontend-showcase`, `feature/league-rag`.
- Merge to `main` only at scheduled checkpoints (see webappflow.md build schedule), not
  continuously.
- Before merging: pull latest `main`, resolve conflicts locally, confirm your feature still
  builds, then merge.

## 2. File ownership (avoid merge conflicts)

Each person owns specific files/folders. Do not edit another person's owned files without
telling them first — if you need a change in someone else's file, ask them or wait for a
checkpoint.

| Owner | Owns |
|---|---|
| Person A (Backend Core) | `/server/routes/question.js`, `/server/routes/evaluate.js`, `/server/routes/roadmap.js`, `/server/services/llm.js` |
| Person B (Frontend Flow) | `/client/src/screens/Onboarding.jsx`, `/Assessment.jsx`, `/Practice.jsx`, `/Feedback.jsx` |
| Person C (Frontend Showcase) | `/client/src/components/SkillGraph.jsx`, `/LeagueBoard.jsx`, `/StreakBar.jsx`, `/CeremonyAnimation.jsx` |
| Person D (League/RAG/Infra) | `/server/routes/league.js`, `/server/services/rag.js`, `/server/services/botSimulation.js`, deployment configs |

Shared files (`contracts.md`, `schema.md`, `mockData.js`) are edited **together**, only during
checkpoints, never solo mid-build.

## 3. Contracts are law

Nobody changes an API request/response shape defined in `contracts.md` without telling the other
three people first. If you discover mid-build that a contract needs to change, stop, message the
team, update `contracts.md` together, then continue. Silent contract changes are the #1 cause of
integration failures at hour 20 — do not let this happen.

## 4. Mocking discipline

Person B and C do not wait for Person A/D's real backend to be finished. Build against
`mockData.js` (hardcoded JSON matching `contracts.md` exactly) from hour 1. Swap mock calls for
real API calls only at checkpoints, after confirming the real endpoint matches the contract.

## 5. Commit hygiene

- Commit small, working chunks — not one giant commit at hour 20.
- Write a one-line commit message describing what changed, not "fix" or "update."
- If your code doesn't run, don't merge it to `main`, even at a checkpoint — flag it and get
  help instead.

## 6. Scope discipline

- Refer to `techstack.md`'s "explicit do not add" list before adding any new library or feature
  idea mid-build. If it's not in `PRD.md` scope, it doesn't go in, no matter how good the idea
  seems at hour 15.
- If a "stretch" feature (Socket.io real-time, LangChain SequentialChain) is fighting you for
  more than ~1 hour, fall back to the documented simpler alternative without a team debate —
  this decision is pre-approved in `techstack.md`.

## 7. Checkpoints (mandatory, not optional)

At every checkpoint (see `webappflow.md` schedule), all four people stop feature work and:
1. Merge all branches to `main`.
2. Run the full app together, end to end.
3. Fix any contract mismatches immediately, together.
4. Only then resume separate feature work.

Skipping a checkpoint to "save time" is the most common reason hackathon integrations fail at
the very end — do not skip these.

## 8. For AI coding assistants / agents working on this project

If you are an AI assistant (e.g. Claude Code, Cursor, Copilot) helping a team member on this
project:
- Read `PRD.md`, `techstack.md`, `contracts.md`, and `schema.md` before writing code — do not
  infer scope or data shapes from assumption.
- Do not introduce libraries outside `techstack.md` without the human explicitly confirming
  first — this project has a deliberately constrained scope for time-safety reasons.
- Only write code inside the file ownership boundaries listed in section 2 for the person you
  are assisting, unless they explicitly say they're doing cross-owner work during a checkpoint.
- If asked to implement something not described in `PRD.md`'s in-scope feature list, flag that
  it's out of scope before implementing it, and ask for confirmation.
- Always match API response shapes to `contracts.md` exactly — do not invent extra fields or
  rename fields for convenience.
