# Schema — Ascend Database

> Keep it minimal. This is a 24-hour build — no migrations system needed, just create these
> tables/collections at startup.

## `users`
| Field | Type | Notes |
|---|---|---|
| id | string (uuid) | primary key |
| name | string | display name, simple text input, no real auth |
| track | string | e.g. "sde-backend" |
| createdAt | datetime | |

## `assessment_results`
| Field | Type | Notes |
|---|---|---|
| id | string | |
| userId | string | FK → users.id |
| topic | string | |
| score | float | 0–1 |
| createdAt | datetime | |

## `skill_graph`
| Field | Type | Notes |
|---|---|---|
| userId | string | FK → users.id |
| topic | string | |
| mastery | float | 0–1, updated after each practice answer |
| updatedAt | datetime | |

## `roadmap`
| Field | Type | Notes |
|---|---|---|
| userId | string | |
| day | int | |
| focusTopic | string | |
| goal | string | |

## `practice_sessions`
| Field | Type | Notes |
|---|---|---|
| id | string | |
| userId | string | |
| questionId | string | |
| topic | string | |
| difficulty | string | |
| userAnswer | text | |
| score | float | |
| strengths | text (JSON array) | |
| gaps | text (JSON array) | |
| createdAt | datetime | |

## `league`
| Field | Type | Notes |
|---|---|---|
| id | string | |
| trackId | string | one league per track for demo simplicity |

## `league_members`
| Field | Type | Notes |
|---|---|---|
| leagueId | string | FK → league.id |
| userId | string | nullable if seeded bot |
| displayName | string | |
| xp | int | |
| isBot | boolean | true for seeded demo peers |
| streak | int | |
| lastActive | datetime | |

## `resources` (static, pre-seeded — not user-generated)
| Field | Type | Notes |
|---|---|---|
| id | string | |
| track | string | |
| topic | string | |
| title | string | |
| url | string | |
| embedding | JSON array (float[]) | precomputed offline before hackathon |

---

## Notes

- No `passwords` table — auth is a simple name-entry session for demo purposes, not a real
  auth system (explicitly out of scope, see PRD.md).
- `isBot` on `league_members` is what enables the honest disclosure in rules.md/PRD.md — never
  remove or hide this flag, it's how the team keeps track of what's real vs. seeded for the
  pitch's honesty commitments.
- SQLite is sufficient; if using MongoDB instead, treat each table above as a collection with
  the same fields.
