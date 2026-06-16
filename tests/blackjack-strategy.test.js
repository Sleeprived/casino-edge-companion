import { test } from "node:test";
import assert from "node:assert/strict";
import {
  correctAction,
  strategyCode,
  CHARTS,
  DEALER_UPCARDS,
  classifyHand,
} from "../js/lib/blackjack-strategy.js";

const card = (r, s = "s") => ({ r, s });
const hand = (r1, r2) => [card(r1), card(r2, "h")];
const S17 = "s17-6deck-das";
const H17 = "h17-6deck-das";

test("hand classification: pair / soft / hard / dealt-blackjack", () => {
  assert.deepEqual(classifyHand(hand("8", "8")), { kind: "pair", key: "8" });
  assert.deepEqual(classifyHand(hand("K", "K")), { kind: "pair", key: "T" });
  assert.deepEqual(classifyHand(hand("A", "7")), { kind: "soft", key: "7" });
  assert.deepEqual(classifyHand(hand("A", "K")), { kind: "blackjack", key: null });
  assert.deepEqual(classifyHand(hand("T", "6")), { kind: "hard", key: 16 });
  assert.deepEqual(classifyHand(hand("K", "Q")), { kind: "hard", key: 20 });
});

test("universally-agreed landmark cells (S17)", () => {
  assert.equal(correctAction(hand("A", "A"), "5", S17), "P"); // always split aces
  assert.equal(correctAction(hand("8", "8"), "T", S17), "P"); // always split eights
  assert.equal(correctAction(hand("8", "8"), "A", S17), "P"); // S17: split 88 vs A
  assert.equal(correctAction(hand("T", "T"), "6", S17), "S"); // never split tens
  assert.equal(correctAction(hand("5", "5"), "6", S17), "D"); // 55 = hard 10, double
  assert.equal(correctAction(hand("6", "5"), "T", S17), "D"); // 11 vs T double
  assert.equal(correctAction(hand("T", "6"), "T", S17), "R"); // 16 vs T surrender
  assert.equal(correctAction(hand("T", "6"), "7", S17), "H"); // 16 vs 7 hit
  assert.equal(correctAction(hand("T", "6"), "6", S17), "S"); // 16 vs 6 stand
  assert.equal(correctAction(hand("T", "2"), "4", S17), "S"); // 12 vs 4 stand
  assert.equal(correctAction(hand("T", "2"), "3", S17), "H"); // 12 vs 3 hit
  assert.equal(correctAction(hand("9", "9"), "7", S17), "S"); // 99 vs 7 stand (18)
  assert.equal(correctAction(hand("9", "9"), "8", S17), "P"); // 99 vs 8 split
  assert.equal(correctAction(hand("A", "K"), "5", S17), null); // dealt blackjack, not trained
});

test("soft hands map Ds to the Double button", () => {
  assert.equal(strategyCode(hand("A", "7"), "4", S17), "Ds"); // raw
  assert.equal(correctAction(hand("A", "7"), "4", S17), "D"); // button
  assert.equal(correctAction(hand("A", "7"), "9", S17), "H"); // A7 vs 9 hit
});

test("H17 differs from S17 in exactly the known deltas", () => {
  // 11 vs A: hit (S17) -> double (H17)
  assert.equal(correctAction(hand("6", "5"), "A", S17), "H");
  assert.equal(correctAction(hand("6", "5"), "A", H17), "D");
  // 15 vs A: hit -> surrender
  assert.equal(correctAction(hand("T", "5"), "A", S17), "H");
  assert.equal(correctAction(hand("T", "5"), "A", H17), "R");
  // 17 vs A: stand -> surrender
  assert.equal(correctAction(hand("T", "7"), "A", S17), "S");
  assert.equal(correctAction(hand("T", "7"), "A", H17), "R");
  // soft 18 vs 2: stand -> double
  assert.equal(correctAction(hand("A", "7"), "2", S17), "S");
  assert.equal(correctAction(hand("A", "7"), "2", H17), "D");
  // soft 19 vs 6: stand -> double
  assert.equal(correctAction(hand("A", "8"), "6", S17), "S");
  assert.equal(correctAction(hand("A", "8"), "6", H17), "D");
  // 8,8 vs A: split -> surrender
  assert.equal(correctAction(hand("8", "8"), "A", S17), "P");
  assert.equal(correctAction(hand("8", "8"), "A", H17), "R");
});

test("both charts are structurally complete: 10 valid codes per row", () => {
  const valid = new Set(["H", "S", "D", "Ds", "P", "R"]);
  for (const preset of [S17, H17]) {
    const chart = CHARTS[preset];
    for (const sub of ["hard", "soft", "pair"]) {
      for (const [key, cells] of Object.entries(chart[sub])) {
        assert.equal(cells.length, DEALER_UPCARDS.length, `${preset}.${sub}.${key} length`);
        for (const c of cells) assert.ok(valid.has(c), `${preset}.${sub}.${key} bad code ${c}`);
      }
    }
  }
});

test("correctAction never leaks a raw Ds code", () => {
  for (const preset of [S17, H17]) {
    for (const up of DEALER_UPCARDS) {
      assert.notEqual(correctAction(hand("A", "7"), up, preset), "Ds");
    }
  }
});
