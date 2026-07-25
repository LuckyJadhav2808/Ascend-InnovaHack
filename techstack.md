# Tech Stack — Ascend

## Guiding principle

Use tools the team already knows wherever possible. Where a new tool (LangChain, RAG/embeddings)
is included because it strengthens the pitch, it is scoped to the **smallest, lowest-risk
version** of that tool — not the full framework capability. Do not expand scope mid-build even
if a tool "can do more" — stick to what's written here.

---

## Frontend

| Tool | Purpose | Notes |
|---|---|---|
| React | UI framework | Known by team |
| Tailwind CSS | Styling | Known by team |
| D3.js | Skill graph force-directed visualization | New but well-documented; scope to force-layout + basic node styling only, don't attempt custom physics |
| Recharts (optional) | Streak/XP history charts if time allows | Simpler fallback if D3 eats too much time |
| Socket.io-client (stretch) | Live leaderboard updates | Fallback: `setInterval` polling every 3–5s — visually indistinguishable to a judge |

## Backend

| Tool | Purpose | Notes |
|---|---|---|
| Node.js + Express | API server | Known by team |
| Socket.io (stretch) | Real-time push to leaderboard | Fallback: plain REST + frontend polling |
| SQLite (via `better-sqlite3`) or MongoDB | Data storage | Pick whichever the backend owner is fastest in; SQLite needs zero setup/hosting for a hackathon |

## AI / LLM

| Tool | Purpose | Notes |
|---|---|---|
| OpenAI API or Gemini API | Question generation, answer evaluation, roadmap generation | Direct API calls — team already has this experience |
| **LangChain.js** (scoped) | Wraps the Question → Evaluate sequence in a `SequentialChain` | See "Scoped-down usage" below. Do NOT use LangGraph or multi-tool agent executors — too much surface area for team's first time using it |

## Retrieval (lightweight RAG)

| Tool | Purpose | Notes |
|---|---|---|
| OpenAI/Gemini Embeddings endpoint | Convert curated resource list + weak-topic queries into vectors | Run embedding generation for the curated list **once, before the hackathon**, save to a static JSON file |
| Plain JS cosine similarity function | "Retrieval" step | ~10 lines of code, no server, no dependency — see contracts.md for function shape |

**No vector DB server (Chroma/FAISS/Pinecone) is used.** This is a deliberate scope decision,
not an oversight — see PRD.md non-goals.

## Deployment

| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render or Railway | Backend hosting |

---

## Scoped-down usage: LangChain

**What to actually build**: a single `SequentialChain` (LangChain.js) that:
1. Takes `{track, topic, difficulty}` → calls the Question prompt
2. Passes the generated question + user's answer → calls the Evaluation prompt
3. Returns the combined result

**What NOT to build**: LangGraph state graphs, tool-calling agents, agent executors with
multiple tools, memory modules beyond what you already store in your own DB. If LangChain.js
setup takes more than ~1 hour and isn't working, **fall back to plain sequential `fetch()` calls
to the OpenAI/Gemini API** — functionally identical result, zero framework risk. It is fine, and
recommended, to make this fallback decision without discussion mid-build if the framework is
fighting you.

## Scoped-down usage: RAG

**What to actually build**:
1. Before the hackathon (or in the first hour), write a JSON file of 30–50 curated resources per
   track: `{id, title, url, topic, embedding: [...]}`. Generate the embeddings with one script
   run against the OpenAI/Gemini embeddings endpoint — this is a one-time offline step.
2. At runtime, when a topic is flagged weak: embed the topic name/description with the same
   embeddings endpoint, compute cosine similarity against the stored list, return the top 1–2
   matches.

**What NOT to build**: live document ingestion, chunking, any vector database server, retrieval
over a large/unbounded corpus. This is intentionally small and curated.

---

## Explicit "do not add" list (protects scope discipline)

- Whisper / voice input
- Resume parsing / OCR
- Real payment integration
- Real multi-tenant user auth beyond a simple session/JWT
- LangGraph, CrewAI, AutoGen, or any multi-agent framework beyond the single SequentialChain
  described above
- Any vector DB requiring its own server/hosting
