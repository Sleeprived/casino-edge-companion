/* Blackjack basic-strategy charts for the initial two-card decision (spec M3).
   Source: Wizard of Odds 4-8 deck basic strategy, DAS, late surrender
   (last verified 2026-06-15). These cells are transcribed from that published
   strategy, not recomputed — there is no cheap independent oracle for full-game
   blackjack strategy, so the test suite pins the universally-agreed landmark
   cells and the H17-vs-S17 deltas. Spot-checking a few cells against the live
   chart is part of the human verification step.

   Dealer upcard order is fixed: 2 3 4 5 6 7 8 9 T A.
   Codes: H hit, S stand, D double-else-hit, Ds double-else-stand, P split,
   R surrender-else-hit. The trainer button for Ds is Double; for R, Surrender. */

export const DEALER_UPCARDS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"];

const row = (s) => s.trim().split(/\s+/);

/* 6-deck, dealer Stands on soft 17, DAS, late surrender. */
const S17 = {
  hard: {
    9: row("H D D D D H H H H H"),
    10: row("D D D D D D D D H H"),
    11: row("D D D D D D D D D H"),
    12: row("H H S S S H H H H H"),
    13: row("S S S S S H H H H H"),
    14: row("S S S S S H H H H H"),
    15: row("S S S S S H H H R H"),
    16: row("S S S S S H H R R R"),
    17: row("S S S S S S S S S S"),
  },
  soft: {
    2: row("H H H D D H H H H H"),
    3: row("H H H D D H H H H H"),
    4: row("H H D D D H H H H H"),
    5: row("H H D D D H H H H H"),
    6: row("H D D D D H H H H H"),
    7: row("S Ds Ds Ds Ds S S H H H"),
    8: row("S S S S S S S S S S"),
    9: row("S S S S S S S S S S"),
  },
  pair: {
    2: row("P P P P P P H H H H"),
    3: row("P P P P P P H H H H"),
    4: row("H H H P P H H H H H"),
    5: row("D D D D D D D D H H"),
    6: row("P P P P P H H H H H"),
    7: row("P P P P P P H H H H"),
    8: row("P P P P P P P P P P"),
    9: row("P P P P P S P P S S"),
    T: row("S S S S S S S S S S"),
    A: row("P P P P P P P P P P"),
  },
};

/* 6-deck, dealer Hits soft 17, DAS, late surrender: S17 plus the standard
   H17 deviations only. */
function buildH17() {
  const clone = JSON.parse(JSON.stringify(S17));
  const A = DEALER_UPCARDS.indexOf("A");
  const six = DEALER_UPCARDS.indexOf("6");
  const two = DEALER_UPCARDS.indexOf("2");
  clone.hard[11][A] = "D"; // double 11 vs A
  clone.hard[15][A] = "R"; // surrender 15 vs A
  clone.hard[17][A] = "R"; // surrender 17 vs A
  clone.soft[7][two] = "Ds"; // A,7 double vs 2
  clone.soft[8][six] = "Ds"; // A,8 double vs 6
  clone.pair[8][A] = "R"; // 8,8 surrender vs A
  return clone;
}

export const CHARTS = {
  "s17-6deck-das": S17,
  "h17-6deck-das": buildH17(),
};

export const PRESET_LABELS = {
  "s17-6deck-das": "6-deck · dealer Stands on soft 17 · DAS · surrender",
  "h17-6deck-das": "6-deck · dealer Hits soft 17 · DAS · surrender",
};

const TEN = { T: true, J: true, Q: true, K: true };

/* Classify a two-card hand into the sub-chart key it uses. */
export function classifyHand(cards) {
  const [a, b] = cards;
  const pairRank = (r) => (TEN[r] ? "T" : r);
  if (a.r === b.r) return { kind: "pair", key: pairRank(a.r) };
  const hasAce = a.r === "A" || b.r === "A";
  if (hasAce) {
    const other = a.r === "A" ? b.r : a.r;
    if (TEN[other]) return { kind: "blackjack", key: null }; // A + ten = 21
    return { kind: "soft", key: other };
  }
  const val = (r) => (TEN[r] ? 10 : Number(r));
  return { kind: "hard", key: val(a.r) + val(b.r) };
}

const dealerIdx = (up) => DEALER_UPCARDS.indexOf(TEN[up] ? "T" : up);

/* Raw chart code (H/S/D/Ds/P/R) for the initial decision, or null for a dealt
   blackjack (not trained). */
export function strategyCode(cards, dealerUp, presetId) {
  const chart = CHARTS[presetId];
  if (!chart) return null;
  const c = classifyHand(cards);
  const di = dealerIdx(dealerUp);
  if (di < 0) return null;
  if (c.kind === "blackjack") return null; // a natural is not a trained decision
  if (c.kind === "pair") return chart.pair[c.key][di];
  if (c.kind === "soft") return chart.soft[c.key][di];
  // hard
  if (c.key <= 8) return "H";
  if (c.key >= 18) return "S";
  return chart.hard[c.key][di];
}

/* The button the trainer expects: H/S/D/P/R. Ds -> Double, R -> Surrender. */
export function correctAction(cards, dealerUp, presetId) {
  const code = strategyCode(cards, dealerUp, presetId);
  if (code === null) return null;
  if (code === "Ds") return "D";
  return code;
}
