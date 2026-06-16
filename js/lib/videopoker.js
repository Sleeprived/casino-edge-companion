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

/* Rank index A=0,2=1,...,T=9,J=10,Q=11,K=12; suit index for fast counting.
   The classifier uses reused scratch arrays and integer counts instead of
   Object.entries/sort allocations, and takes the hand as two parts so the EV
   enumerator never allocates a concatenated array (audit-1 M1). The worker and
   tests are single-threaded and call sequentially, so the scratch is safe. */
const RIDX = {};
RANKS.forEach((r, i) => (RIDX[r] = i));
const SIDX = { s: 0, h: 1, d: 2, c: 3 };
const _rc = new Array(13);
const _sc = new Array(4);
const EMPTY = [];

function classify(a, b) {
  _rc.fill(0);
  _sc.fill(0);
  for (const c of a) { _rc[RIDX[c.r]]++; _sc[SIDX[c.s]]++; }
  for (const c of b) { _rc[RIDX[c.r]]++; _sc[SIDX[c.s]]++; }

  const flush = _sc[0] === 5 || _sc[1] === 5 || _sc[2] === 5 || _sc[3] === 5;
  let distinct = 0, run = 0, maxRun = 0, four = false, three = false, pairs = 0, pairIdx = -1;
  for (let i = 0; i < 13; i++) {
    const n = _rc[i];
    if (n) { distinct++; run++; if (run > maxRun) maxRun = run; } else run = 0;
    if (n === 4) four = true;
    else if (n === 3) three = true;
    else if (n === 2) { pairs++; pairIdx = i; }
  }
  const broadway = _rc[9] && _rc[10] && _rc[11] && _rc[12] && _rc[0]; // T J Q K A
  const straight = distinct === 5 && (maxRun === 5 || broadway);

  if (flush && straight) return broadway ? "ROYAL_FLUSH" : "STRAIGHT_FLUSH";
  if (four) return "FOUR_KIND";
  if (three && pairs === 1) return "FULL_HOUSE";
  if (flush) return "FLUSH";
  if (straight) return "STRAIGHT";
  if (three) return "THREE_KIND";
  if (pairs === 2) return "TWO_PAIR";
  if (pairs === 1) return pairIdx === 0 || pairIdx >= 10 ? "JACKS_OR_BETTER" : "NOTHING"; // A,J,Q,K pair
  return "NOTHING";
}

export function evaluate(cards) {
  return classify(cards, EMPTY);
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

/* Expected value (coins/coin) of keeping the cards marked true in `holdMask`.
   `pool` (the 47 remaining cards) may be passed in so a full solve builds it
   once instead of 32 times (audit-1 M1). */
export function evHold(cards, holdMask, paytableId, pool) {
  const held = cards.filter((_, i) => holdMask[i]);
  const drawCount = 5 - held.length;
  const pay = PAYTABLES[paytableId].pay;

  if (drawCount === 0) return pay[classify(held, EMPTY)];

  const deck = pool || remainingDeck(cards);
  let total = 0;
  let n = 0;
  for (const draw of combinations(deck, drawCount)) {
    total += pay[classify(held, draw)];
    n++;
  }
  return total / n;
}

/* Best hold over all 32 keep/discard masks. Returns the winning mask, its EV,
   and the held cards. The browser runs this in a Web Worker; tests call it
   directly on a small number of hands. */
export function bestHold(cards, paytableId) {
  const pool = remainingDeck(cards); // built once, reused across all 32 holds
  let best = null;
  for (let m = 0; m < 32; m++) {
    const mask = [0, 1, 2, 3, 4].map((i) => Boolean(m & (1 << i)));
    const ev = evHold(cards, mask, paytableId, pool);
    if (best === null || ev > best.ev) {
      best = { mask, ev, held: cards.filter((_, i) => mask[i]) };
    }
  }
  return best;
}

export { RANKS };
