/* Video poker engine: hand evaluator + full-enumeration EV solver + optimal-hold
   finder for the Jacks-or-Better family. Pure and DOM-free so the Node tests and
   the browser Web Worker import the exact same code (spec §2, M1/M2).

   EV is expressed as coins returned per coin bet on a max-coin basis (royal pays
   800/coin), which is the basis for the published returns:
     9/6 JoB = 99.5439%   8/5 JoB = 97.2984%   (Wizard of Odds, verified 2026-06-15)

   The solver carries an independent self-check property the tests rely on:
   bestHold's EV is, by construction, >= the EV of any specific hold of the same
   hand — a hold the solver did not pick can never beat the one it did. */

import { RANKS, makeDeck, cardId } from "./deck.js";

export const CATEGORIES = [
  "ROYAL_FLUSH",
  "STRAIGHT_FLUSH",
  "FOUR_KIND",
  "FULL_HOUSE",
  "FLUSH",
  "STRAIGHT",
  "THREE_KIND",
  "TWO_PAIR",
  "JACKS_OR_BETTER",
  "NOTHING",
];

export const PAYTABLES = {
  jacks96: {
    label: "9/6 Jacks or Better (full pay)",
    returnPct: 99.5439,
    pay: {
      ROYAL_FLUSH: 800,
      STRAIGHT_FLUSH: 50,
      FOUR_KIND: 25,
      FULL_HOUSE: 9,
      FLUSH: 6,
      STRAIGHT: 4,
      THREE_KIND: 3,
      TWO_PAIR: 2,
      JACKS_OR_BETTER: 1,
      NOTHING: 0,
    },
  },
  jacks85: {
    label: "8/5 Jacks or Better (short pay)",
    returnPct: 97.2984,
    pay: {
      ROYAL_FLUSH: 800,
      STRAIGHT_FLUSH: 50,
      FOUR_KIND: 25,
      FULL_HOUSE: 8,
      FLUSH: 5,
      STRAIGHT: 4,
      THREE_KIND: 3,
      TWO_PAIR: 2,
      JACKS_OR_BETTER: 1,
      NOTHING: 0,
    },
  },
};

const HIGH = { J: true, Q: true, K: true, A: true };

/* Straight value with ace high (A=14); the wheel A-2-3-4-5 is handled below. */
function straightValue(r) {
  if (r === "A") return 14;
  if (r === "K") return 13;
  if (r === "Q") return 12;
  if (r === "J") return 11;
  if (r === "T") return 10;
  return Number(r);
}

function isStraight(ranks) {
  const vals = ranks.map(straightValue).sort((a, b) => a - b);
  const uniq = [...new Set(vals)];
  if (uniq.length !== 5) return false;
  if (uniq[4] - uniq[0] === 4) return true;
  // wheel: A,2,3,4,5 -> values 14,2,3,4,5
  return uniq.join(",") === "2,3,4,5,14";
}

export function evaluate(cards) {
  const ranks = cards.map((c) => c.r);
  const suits = cards.map((c) => c.s);
  const flush = suits.every((s) => s === suits[0]);
  const straight = isStraight(ranks);

  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const groups = Object.entries(counts).sort((a, b) => b[1] - a[1]); // [rank, n] desc
  const shape = groups.map((g) => g[1]).sort((a, b) => b - a); // e.g. [3,2]

  if (flush && straight) {
    const vals = ranks.map(straightValue).sort((a, b) => a - b);
    const royal = vals.join(",") === "10,11,12,13,14";
    return royal ? "ROYAL_FLUSH" : "STRAIGHT_FLUSH";
  }
  if (shape[0] === 4) return "FOUR_KIND";
  if (shape[0] === 3 && shape[1] === 2) return "FULL_HOUSE";
  if (flush) return "FLUSH";
  if (straight) return "STRAIGHT";
  if (shape[0] === 3) return "THREE_KIND";
  if (shape[0] === 2 && shape[1] === 2) return "TWO_PAIR";
  if (shape[0] === 2) {
    const pairRank = groups.find((g) => g[1] === 2)[0];
    return HIGH[pairRank] ? "JACKS_OR_BETTER" : "NOTHING";
  }
  return "NOTHING";
}

export function payout(category, paytableId) {
  return PAYTABLES[paytableId].pay[category];
}

/* k-combinations of an array (indices preserved as elements). */
function* combinations(arr, k) {
  const n = arr.length;
  if (k === 0) {
    yield [];
    return;
  }
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield idx.map((i) => arr[i]);
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

function remainingDeck(dealt) {
  const used = new Set(dealt.map(cardId));
  return makeDeck().filter((c) => !used.has(cardId(c)));
}

/* Expected value (coins/coin) of keeping the cards marked true in `holdMask`. */
export function evHold(cards, holdMask, paytableId) {
  const held = cards.filter((_, i) => holdMask[i]);
  const drawCount = 5 - held.length;
  const pool = remainingDeck(cards);
  const pay = PAYTABLES[paytableId].pay;

  if (drawCount === 0) return pay[evaluate(held)];

  let total = 0;
  let n = 0;
  for (const draw of combinations(pool, drawCount)) {
    total += pay[evaluate(held.concat(draw))];
    n++;
  }
  return total / n;
}

/* Best hold over all 32 keep/discard masks. Returns the winning mask, its EV,
   and the held cards. The browser runs this in a Web Worker; tests call it
   directly on a small number of hands. */
export function bestHold(cards, paytableId) {
  let best = null;
  for (let m = 0; m < 32; m++) {
    const mask = [0, 1, 2, 3, 4].map((i) => Boolean(m & (1 << i)));
    const ev = evHold(cards, mask, paytableId);
    if (best === null || ev > best.ev) {
      best = { mask, ev, held: cards.filter((_, i) => mask[i]) };
    }
  }
  return best;
}

export { RANKS };
