/* Roulette bet reference data for American (38 pockets, 0 and 00) and European
   (37 pockets, single 0) wheels.
   Source: Wizard of Odds roulette tables (last verified 2026-06-15).

   Every roulette bet is recomputable: house edge derives purely from how many
   pockets win, the total pockets on the wheel, and the payout. The test suite
   re-derives each edge and confirms the stored value. */

export const TRAP_THRESHOLD_PCT = 5;

const AMERICAN = 38;
const EUROPEAN = 37;

/* (payout numerator:1, pockets covered). Five-number is American-only. */
const BET_TYPES = [
  { id: "straight", name: "Straight up (1 number)", payoutNum: 35, pockets: 1 },
  { id: "split", name: "Split (2 numbers)", payoutNum: 17, pockets: 2 },
  { id: "street", name: "Street (3 numbers)", payoutNum: 11, pockets: 3 },
  { id: "corner", name: "Corner (4 numbers)", payoutNum: 8, pockets: 4 },
  { id: "sixline", name: "Six line (6 numbers)", payoutNum: 5, pockets: 6 },
  { id: "column", name: "Column (12 numbers)", payoutNum: 2, pockets: 12 },
  { id: "dozen", name: "Dozen (12 numbers)", payoutNum: 2, pockets: 12 },
  { id: "evenmoney", name: "Red/Black, Odd/Even, High/Low (18)", payoutNum: 1, pockets: 18 },
];

const FIVE_NUMBER = {
  id: "fivenumber",
  name: "Five-number (0, 00, 1, 2, 3)",
  payoutNum: 6,
  pockets: 5,
};

/* edge% = -100 * (win*payoutNum - lose) / total */
export function recomputeEdgePct(payoutNum, pockets, total) {
  const lose = total - pockets;
  const ev = (pockets * payoutNum - lose) / total;
  return -100 * ev;
}

function buildWheel(wheelId, total, types) {
  return types.map((t) => {
    const houseEdgePct = recomputeEdgePct(t.payoutNum, t.pockets, total);
    return {
      id: `${wheelId}-${t.id}`,
      betId: t.id,
      wheel: wheelId,
      name: t.name,
      payoutText: `${t.payoutNum}:1`,
      payoutNum: t.payoutNum,
      pockets: t.pockets,
      totalPockets: total,
      houseEdgePct: Math.round(houseEdgePct * 100) / 100,
      trap: houseEdgePct >= TRAP_THRESHOLD_PCT,
    };
  });
}

export const AMERICAN_BETS = buildWheel("american", AMERICAN, [...BET_TYPES, FIVE_NUMBER]);
export const EUROPEAN_BETS = buildWheel("european", EUROPEAN, BET_TYPES);

export const ROULETTE_BETS = [...AMERICAN_BETS, ...EUROPEAN_BETS];

/* European even-money bets with the la-partage rule refund half on a zero,
   halving their edge. Shown as a teaching note, not a separate row. */
export const LA_PARTAGE_NOTE = {
  appliesTo: "European even-money bets",
  edgePct: 1.35,
  text: "Where 'la partage' or 'en prison' is offered, even-money bets refund half on zero, cutting their edge to 1.35%.",
};

export const WHEEL_SUMMARY = {
  american: { pockets: AMERICAN, typicalEdgePct: 5.26 },
  european: { pockets: EUROPEAN, typicalEdgePct: 2.7 },
};
