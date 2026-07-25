# Features — Ascend

## Tier 1 — Must have (demo breaks without these)

1. Track selection (onboarding)
2. 10-question adaptive assessment
3. Skill graph generation + visual rendering
4. Practice loop: question generation → answer → evaluation → skill graph update
5. XP awarding tied to difficulty
6. League leaderboard (seeded peers) with live-feeling updates
7. Streak counter

## Tier 2 — Should have (strong differentiators, build if Tier 1 is stable by hour ~13)

8. Roadmap generation screen (post-assessment)
9. Resource recommendation via lightweight RAG
10. Matchup callouts ("You and Rahul both got asked about X...")
11. Promotion/demotion season-end ceremony animation
12. Streak decay visual (greyed flame when inactive)

## Tier 3 — Nice to have (only if far ahead of schedule)

13. Multiple tracks beyond the initial 1–2
14. Socket.io true real-time (vs. polling fallback)
15. LangChain.js SequentialChain wrapper (vs. plain sequential fetch calls)
16. Basic profile/history page showing past sessions
17. Sound effects / micro-animations on XP gain

## Explicitly not features (do not build even with spare time)

- Voice/Whisper input
- Resume upload/parsing
- Real payment flow
- Real multi-account matchmaking (beyond seeded bots)
- Any feature not listed in PRD.md scope — if it's not here, it's not in scope; add it to a
  "future ideas" note instead of building it during the hackathon

## Feature ownership cross-reference

See `rules.md` section 2 for file ownership and `webappflow.md` for the build schedule showing
when each tier should be tackled.
