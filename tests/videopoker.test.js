import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, payout, evHold, bestHold } from "../js/lib/videopoker.js";

/* "As" -> {r:'A', s:'s'}; ten is "T". */
const h = (...ids) => ids.map((id) => ({ r: id[0], s: id[1] }));
const ALL = [true, true, true, true, true];

test("evaluate classifies every category, including both straight edge cases", () => {
  assert.equal(evaluate(h("As", "Ks", "Qs", "Js", "Ts")), "ROYAL_FLUSH");
  assert.equal(evaluate(h("9s", "8s", "7s", "6s", "5s")), "STRAIGHT_FLUSH");
  assert.equal(evaluate(h("As", "2s", "3s", "4s", "5s")), "STRAIGHT_FLUSH"); // wheel SF
  assert.equal(evaluate(h("As", "Ah", "Ad", "Ac", "Kd")), "FOUR_KIND");
  assert.equal(evaluate(h("As", "Ah", "Ad", "Ks", "Kh")), "FULL_HOUSE");
  assert.equal(evaluate(h("As", "Js", "9s", "6s", "3s")), "FLUSH");
  assert.equal(evaluate(h("Ts", "9h", "8s", "7d", "6c")), "STRAIGHT");
  assert.equal(evaluate(h("As", "2h", "3s", "4d", "5c")), "STRAIGHT"); // wheel
  assert.equal(evaluate(h("Ah", "Kh", "Qh", "Js", "Tc")), "STRAIGHT"); // broadway mixed
  assert.equal(evaluate(h("As", "Ah", "Ad", "9s", "3c")), "THREE_KIND");
  assert.equal(evaluate(h("As", "Ah", "Ks", "Kh", "3c")), "TWO_PAIR");
  assert.equal(evaluate(h("Js", "Jh", "9s", "6d", "3c")), "JACKS_OR_BETTER");
  assert.equal(evaluate(h("As", "Ah", "9s", "6d", "3c")), "JACKS_OR_BETTER"); // pair of aces
  assert.equal(evaluate(h("5s", "5h", "9s", "6d", "3c")), "NOTHING"); // low pair
  assert.equal(evaluate(h("As", "Kh", "9s", "6d", "3c")), "NOTHING"); // ace high
});

test("payout reflects the 9/6 vs 8/5 difference (full house & flush)", () => {
  assert.equal(payout("ROYAL_FLUSH", "jacks96"), 800);
  assert.equal(payout("FULL_HOUSE", "jacks96"), 9);
  assert.equal(payout("FULL_HOUSE", "jacks85"), 8);
  assert.equal(payout("FLUSH", "jacks96"), 6);
  assert.equal(payout("FLUSH", "jacks85"), 5);
});

test("pat-hand hold-all EV equals the paytable value exactly (no draw)", () => {
  assert.equal(evHold(h("As", "Ks", "Qs", "Js", "Ts"), ALL, "jacks96"), 800);
  assert.equal(evHold(h("As", "Ah", "Ad", "Ks", "Kh"), ALL, "jacks96"), 9);
  assert.equal(evHold(h("As", "Ah", "Ad", "Ks", "Kh"), ALL, "jacks85"), 8);
  assert.equal(evHold(h("As", "Js", "9s", "6s", "3s"), ALL, "jacks96"), 6);
});

test("holding four-of-a-kind is worth exactly the quad payout regardless of the kicker", () => {
  const quad = h("As", "Ah", "Ad", "Ac", "Kd");
  assert.equal(evHold(quad, ALL, "jacks96"), 25); // keep all
  assert.equal(evHold(quad, [true, true, true, true, false], "jacks96"), 25); // draw the 5th
});

test("on two pair, keeping both pairs beats keeping one pair or standing pat-equivalent", () => {
  const twoPair = h("As", "Ah", "Ks", "Kh", "3c");
  const keepBoth = evHold(twoPair, [true, true, true, true, false], "jacks96"); // draw 1
  const keepOne = evHold(twoPair, [true, true, false, false, false], "jacks96"); // draw 3
  assert.ok(keepBoth > keepOne, `keepBoth ${keepBoth} should beat keepOne ${keepOne}`);
  assert.ok(keepBoth >= 2, "two pair already pays 2, draw can only help");
});

test("bestHold finds the obvious max: a pat royal holds all five for 800", () => {
  const best = bestHold(h("As", "Ks", "Qs", "Js", "Ts"), "jacks96");
  assert.equal(best.ev, 800);
  assert.deepEqual(best.mask, ALL);
});

/* Independent EV cross-check (spec M1). Hand 7s 7h 7d 2c 3c, hold the three 7s,
   draw 2 of the 47 unseen cards (C(47,2)=1081). Derived BY HAND, not by the
   engine:
     FOUR_KIND  = draws containing the last seven (7c): C(1,1)*C(46,1) = 46
     FULL_HOUSE = drawing a pair of a non-7 rank:
                  rank 2 -> C(3,2)=3, rank 3 -> C(3,2)=3 (one each already dealt),
                  ten other ranks -> C(4,2)=6 each = 60; total 66
     THREE_KIND = 1081 - 46 - 66 = 969
   9/6 EV = (46*25 + 66*9 + 969*3)/1081 = 4651/1081 = 4.30249...
   8/5 EV = (46*25 + 66*8 + 969*3)/1081 = 4585/1081 = 4.24144...  */
test("engine reproduces a hand-derived three-of-a-kind EV (independent oracle)", () => {
  const hand = h("7s", "7h", "7d", "2c", "3c");
  const holdTrips = [true, true, true, false, false];
  assert.ok(Math.abs(evHold(hand, holdTrips, "jacks96") - 4651 / 1081) < 1e-9);
  assert.ok(Math.abs(evHold(hand, holdTrips, "jacks85") - 4585 / 1081) < 1e-9);
});
