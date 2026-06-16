/* Cross-game house-edge cheat sheet. Pulls every reference bet into one list,
   plus the blackjack-with-basic-strategy and video-poker baselines, sorted
   best (lowest edge) to worst.

   Blackjack and video-poker baselines are sourced constants (Wizard of Odds,
   last verified 2026-06-15); the per-bet table/roulette/craps numbers come from
   their own modules where they are recomputed and tested. */

import { CRAPS_BETS } from "./craps.js";
import { ROULETTE_BETS } from "./roulette.js";
import { BACCARAT_BETS } from "./baccarat.js";

export const BLACKJACK_BASELINES = [
  {
    game: "Blackjack",
    bet: "Basic strategy, 6-deck S17 DAS (3:2)",
    houseEdgePct: 0.4,
    source: "Wizard of Odds",
  },
  {
    game: "Blackjack",
    bet: "Basic strategy, 6-deck H17 DAS (3:2)",
    houseEdgePct: 0.62,
    source: "Wizard of Odds",
  },
];

export const VIDEOPOKER_BASELINES = [
  {
    game: "Video Poker",
    bet: "9/6 Jacks or Better, optimal play",
    houseEdgePct: 0.46, // 100% - 99.54% return
    source: "Wizard of Odds",
  },
  {
    game: "Video Poker",
    bet: "8/5 Jacks or Better, optimal play",
    houseEdgePct: 2.7, // 100% - 97.30% return
    source: "Wizard of Odds",
  },
];

export function buildCheatSheet() {
  const rows = [
    ...BLACKJACK_BASELINES,
    ...VIDEOPOKER_BASELINES,
    ...CRAPS_BETS.map((b) => ({ game: "Craps", bet: b.name, houseEdgePct: b.houseEdgePct })),
    ...ROULETTE_BETS.map((b) => ({
      game: "Roulette",
      bet: `${b.wheel === "american" ? "American" : "European"} — ${b.name}`,
      houseEdgePct: b.houseEdgePct,
    })),
    ...BACCARAT_BETS.map((b) => ({ game: "Baccarat", bet: b.name, houseEdgePct: b.houseEdgePct })),
  ];
  return rows.sort((a, b) => a.houseEdgePct - b.houseEdgePct);
}
