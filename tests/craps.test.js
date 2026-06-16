import { test } from "node:test";
import assert from "node:assert/strict";
import { CRAPS_BETS, getBet, recomputeEdgePct, TRAP_THRESHOLD_PCT } from "../js/lib/craps.js";

const TOL = 0.02; // stored edges are rounded to 2 decimals

test("recomputable bets: stored house edge matches first-principles recompute", () => {
  let checked = 0;
  for (const bet of CRAPS_BETS) {
    if (!bet.outcomes) continue;
    const got = recomputeEdgePct(bet);
    assert.ok(
      Math.abs(got - bet.houseEdgePct) < TOL,
      `${bet.id}: stored ${bet.houseEdgePct} vs recomputed ${got.toFixed(4)}`,
    );
    checked++;
  }
  assert.ok(checked >= 10, `expected to cross-check many bets, only did ${checked}`);
});

test("known landmark edges are exactly right", () => {
  assert.ok(Math.abs(recomputeEdgePct(getBet("any7")) - 16.6667) < TOL);
  assert.ok(Math.abs(recomputeEdgePct(getBet("place6or8")) - 1.5152) < TOL);
  assert.ok(Math.abs(recomputeEdgePct(getBet("place4or10")) - 6.6667) < TOL);
  assert.ok(Math.abs(recomputeEdgePct(getBet("field")) - 2.7778) < TOL);
  assert.ok(Math.abs(recomputeEdgePct(getBet("big6or8")) - 9.0909) < TOL);
});

test("sourced line bets are present with published edges", () => {
  assert.equal(getBet("pass").houseEdgePct, 1.41);
  assert.equal(getBet("dontpass").houseEdgePct, 1.36);
  assert.equal(getBet("odds").houseEdgePct, 0.0);
  assert.equal(getBet("odds").recomputable, false);
});

test("trap flag = house edge >= threshold, deterministically", () => {
  assert.equal(TRAP_THRESHOLD_PCT, 5);
  assert.equal(getBet("any7").trap, true);
  assert.equal(getBet("big6or8").trap, true);
  assert.equal(getBet("hard4or10").trap, true);
  assert.equal(getBet("pass").trap, false);
  assert.equal(getBet("place6or8").trap, false);
  assert.equal(getBet("field").trap, false);
  for (const b of CRAPS_BETS) assert.equal(b.trap, b.houseEdgePct >= TRAP_THRESHOLD_PCT);
});

test("getBet returns null for unknown id", () => {
  assert.equal(getBet("nope"), null);
});
