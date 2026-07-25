# Design System — Ascend

> Based directly on the reference dashboard image provided. Layout, color logic, card style, and
> typography are copied as closely as possible. Any deviations are explicitly called out below
> with the reason — do not assume anything not marked "CHANGED" differs from the reference.

---

## 1. Color Palette

| Role | Color | Notes |
|---|---|---|
| Background | Soft off-white / cream (`#F7F6F3` approx) | Matches reference base background |
| Card background (neutral) | White / very light grey (`#FFFFFF`–`#F1F1EF`) | |
| Accent — Mint/Sage green | `#B7D9CF` approx | Used for one card category (reference: "UX/UI Design" card) |
| Accent — Soft pink | `#F4C9D6` approx | Used for a second card category (reference: "Motion Design" card) |
| Accent — Lavender | `#D9CFF0` approx | Used for stat cards (reference: "Active" stat) |
| Accent — Warm yellow | `#F6D67A` approx | Used for progress/highlight cards (reference: bottom progress card) |
| Text — Primary | Near-black (`#1E1E1E`) | Headings |
| Text — Secondary | Grey (`#8A8A8A`) | Sub-labels, counts |
| Dark accent (calendar highlight) | Near-black circle fill | Used sparingly for "selected/active" states only |

**CHANGED**: adding one additional accent — a **bright coral/orange** (`#FF6B4A` or similar),
used *only* for streak flame and league rank-up indicators. Reason: the reference palette is
entirely soft pastels, which is great for a calm "learning progress" feel but risks making
competitive/urgent elements (streak at risk, rank change) invisible. A single high-contrast
accent reserved exclusively for these two elements keeps the rest of the palette faithful to
the reference while making sure the league mechanic still reads as "alive" and worth paying
attention to.

---

## 2. Typography

- Heading font: rounded, friendly sans-serif (reference uses something like a geometric
  sans — **Poppins** or **DM Sans** are close, freely available matches).
- Body font: same family, lighter weight, smaller size for sub-labels and card descriptions.
- Large numerals (stat cards) are bold and oversized relative to their label — copy this
  directly, it's a strong pattern in the reference (see "72", "18", "14" stat cards).
- Emoji/icon accents used inline with headings (reference: "Welcome back 👋") — carry this over
  for warmth (e.g. "Ready to practice? 🔥").

---

## 3. Layout Structure

Copied directly from reference:

- **Left rail**: thin vertical icon-only sidebar (dashboard, library/practice, calendar/roadmap,
  settings) — dark circular active-state indicator on the current page icon.
- **Top bar**: greeting/headline on the left, search bar center-right, user avatar top-right.
- **Two-column main layout**: larger primary content area on the left (~60%), secondary
  panel/widget column on the right (~40%) — matches reference's "Learning progress + activity
  cards" (left) vs. "Calendar + lesson list" (right) split.
- **Card grid**: rounded corners (large radius, ~20–24px), soft drop shadow, no hard borders —
  copy this card style for every panel.
- **Stat cards row**: 3 compact cards side by side, each a different pastel accent, big number +
  small label — copy directly for our XP/Rank/Questions-Answered row.
- **Horizontal progress/schedule card** at the bottom spanning full width — reference uses this
  for a single course's progress; we adapt this exact shape for the roadmap strip.

---

## 4. Component Mapping (reference → Ascend)

| Reference component | Ascend equivalent |
|---|---|
| "Welcome back 👋" greeting header | "Welcome back, [Name] 👋" + streak flame next to it |
| "Your activities today" cards (UX/UI Design, Motion Design) | Not directly reused — see section 5 |
| "Learning progress" stat cards (Completed/Score/Active) | XP This Week / Current Rank / Questions Answered |
| Bottom progress card ("IT & Software," progress bar) | Today's Roadmap card (current day, focus topic, progress bar to day's goal) |
| Calendar widget ("Lesson schedule") | **CHANGED** — repurposed as a compact **Skill Graph preview** panel instead of a calendar (see section 5) |
| Lesson list cards (bottom right) | League leaderboard mini-list (rank, avatar, name, XP) |
| Search bar | Kept as-is, searches practice topics/resources |
| Avatar top-right | Kept as-is |

---

## 5. Where I intentionally deviated, and why

1. **Calendar → Skill Graph panel** (CHANGED): The reference's calendar widget doesn't map to
   any Ascend feature — we don't have a lesson schedule. Rather than force a calendar into the
   design, that panel space is better used for a compact skill graph preview (small version of
   the node visualization), since that's one of our core differentiators and deserves prominent
   placement, not a buried secondary screen.
2. **Coral/orange accent added** (CHANGED, explained in section 1): purely for streak and
   rank-change indicators, so competitive urgency doesn't get lost in an all-pastel palette.
3. **"Activities today" cards → not reused as-is**: the reference's two large colored cards
   (UX/UI Design, Motion Design with avatar stacks) don't have a direct Ascend equivalent since
   we don't have social group classes. If you want a similar visual weight in that spot, the
   closest legitimate use is a "Today's Practice" hero card (large, one accent color, with a
   **Start Practice** button inside it) — recommend this as the direct replacement, using the
   same visual size/prominence as the reference's top cards.

Everything else (palette base, card roundness/shadow, typography scale, two-column layout,
stat-card row pattern) is intentionally kept faithful to the reference — no need to deviate
further.
