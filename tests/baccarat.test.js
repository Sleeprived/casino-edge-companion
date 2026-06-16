import { test } from "node:test";
import assert from "node:assert/strict";
import { BACCARAT_BETS, getBet, TRAP_THRESHOLD_PCT } from "../js/lib/baccarat.js";

test("published 8-deck edges are present and correct", () => {
  assert.equal(getBet("banker").houseEdgePct, 1.06);
  assert.equal(getBet("player").houseEdgePct, 1.24);
  assert.equal(getBet("tie").houseEdgePct, 14.36);
  assert.equal(getBet("bankerpair").houseEdgePct, 10.36);
});

test("Banker is the best bet, Tie is the worst of the main three", () => {
  assert.ok(getBet("banker").houseEdgePct < getBet("player").houseEdgePct);
  assert.ok(getBet("tie").houseEdgePct > getBet("player").houseEdgePct);
});

test("trap flag: Tie and pairs are traps, Banker/Player are not", () => {
  assert.equal(TRAP_THRESHOLD_PCT, 5);
  assert.equal(getBet("tie").trap, true);
  assert.equal(getBet("bankerpair").trap, true);
  assert.equal(getBet("banker").trap, false);
  assert.equal(getBet("player").trap, false);
});

test("all baccarat edges are transcribed constants, not recomputed", () => {
  assert.ok(BACCARAT_BETS.every((b) => b.recomputable === false && b.source));
});
