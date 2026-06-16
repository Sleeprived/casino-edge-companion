# Changelog

## 2026-06-15 — fixes from casino-edge-companion-build-audit.md
### Fixed
- Video poker now solves a hand in about 0.65s instead of ~4s (rewrote the hand evaluator to integer rank-counts and build the draw deck once per solve), comfortably under the responsiveness target.
- "Show optimal" in video poker no longer lets a follow-up "Score my hold" count as a free correct answer — a revealed hand is not scored until you deal a new one.
- The craps sucker-bet quiz buttons are now disabled during the answer feedback, so a fast double-tap can't record two attempts on the same bet.
- Added a `<noscript>` responsible-play reminder to every page so the disclaimer is present even if JavaScript fails.
- Added the Apple touch icon to the service worker's offline precache list.
### Changed
- No change to any game's odds, strategy answers, or stored data — fixes were performance, fairness of self-scoring, and offline robustness only.

## 2026-06-15 — casino-edge-companion.md (initial build)
### Added
- Static, installable, offline PWA (vanilla JS, no build step) scaffolded from squinks-arcade, with a three-theme switcher (Neon / Felt Dark / Daylight) persisted in localStorage.
- Hub page listing all six tools, a link to Squinks Arcade, and a "reset all saved progress" button.
- Blackjack basic-strategy trainer: two published rule presets (6-deck Stand-on-soft-17 DAS, 6-deck Hit-on-soft-17 DAS), initial two-card decisions only, scored Hit/Stand/Double/Split/Surrender with a viewable strategy chart and per-preset accuracy/streak tracking.
- Video poker trainer: 9/6 and 8/5 Jacks-or-Better paytables, a full-enumeration EV solver (run in a Web Worker so the UI never freezes) that finds the optimal hold and exact expected value, scores your chosen hold against it, supports random or hand-picked deals, and tracks accuracy per paytable.
- Craps reference: every common bet with its payout and house edge, sucker-bet flags (edge >= 5%), and a scored sucker-bet quiz.
- Roulette reference: American vs European wheels, every bet's payout and house edge, with the single-zero and la-partage guidance.
- Baccarat reference: Banker / Player / Tie / pairs with house edges and the "always bet Banker" takeaway.
- Cross-game house-edge cheat sheet: every bet ranked best-to-worst, with a toggle to hide the 5%+ sucker bets.
- Always-on responsible-play disclaimer on every screen ("reduces the house edge, does not give you an edge"), including 1-800-GAMBLER.
- Node `node --test` suite (38 tests): craps and roulette house edges re-derived from first principles, an independent hand-derived video-poker EV cross-check, video-poker hand evaluation across all categories, blackjack landmark cells and the exact S17/H17 deltas, input validation, scoring, and the cheat sheet.
- Defensive localStorage wrapper that degrades to in-memory state on private-mode/quota/blocked storage.
- Service worker with a versioned cache for offline use, plus PWA manifest and poker-chip app icons.
