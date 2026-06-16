/* Baccarat bet reference data (standard 8-deck shoe).
   Source: Wizard of Odds baccarat tables (last verified 2026-06-15).

   Baccarat edges come from the fixed third-card drawing rules, which are not
   re-derivable with simple combinatorics here, so these are transcribed
   published constants (recomputable:false). The test asserts each against its
   published figure within tolerance. */

export const TRAP_THRESHOLD_PCT = 5;

const RAW = [
  {
    id: "banker",
    name: "Banker",
    payoutText: "1:1 minus 5% commission",
    houseEdgePct: 1.06,
    source: "Wizard of Odds (8-deck)",
    note: "The best bet in baccarat. The 5% commission is already in this edge.",
  },
  {
    id: "player",
    name: "Player",
    payoutText: "1:1",
    houseEdgePct: 1.24,
    source: "Wizard of Odds (8-deck)",
    note: "Almost as good as Banker, with no commission.",
  },
  {
    id: "tie",
    name: "Tie",
    payoutText: "8:1",
    houseEdgePct: 14.36,
    source: "Wizard of Odds (8-deck, 8:1)",
    note: "A sucker bet. Some tables pay 9:1, which is still ~4.84%.",
  },
  {
    id: "bankerpair",
    name: "Banker Pair / Player Pair",
    payoutText: "11:1",
    houseEdgePct: 10.36,
    source: "Wizard of Odds (8-deck)",
    note: "Side bet on the first two cards matching. High edge.",
  },
];

export const BACCARAT_BETS = RAW.map((b) => ({
  ...b,
  recomputable: false,
  trap: b.houseEdgePct >= TRAP_THRESHOLD_PCT,
}));

export function getBet(id) {
  return BACCARAT_BETS.find((b) => b.id === id) || null;
}
