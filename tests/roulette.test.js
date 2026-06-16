import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AMERICAN_BETS,
  EUROPEAN_BETS,
  recomputeEdgePct,
  TRAP_THRESHOLD_PCT,
} from "../js/lib/roulette.js";

const TOL = 0.02;

test("every bet's stored edge matches the recompute from pockets+payout", () => {
  for (const b of [...AMERICAN_BETS, ...EUROPEAN_BETS]) {
    const got = recomputeEdgePct(b.payoutNum, b.pockets, b.totalPockets);
    assert.ok(
      Math.abs(got - b.houseEdgePct) < TOL,
      `${b.id}: stored ${b.houseEdgePct} vs recomputed ${got.toFixed(4)}`,
    );
  }
});

test("American wheel: 5.26% on standard bets, 7.89% on the five-number trap", () => {
  const straight = AMERICAN_BETS.find((b) => b.betId === "straight");
  assert.ok(Math.abs(straight.houseEdgePct - 5.26) < TOL);
  const five = AMERICAN_BETS.find((b) => b.betId === "fivenumber");
  assert.ok(Math.abs(five.houseEdgePct - 7.89) < TOL);
});

test("European wheel: 2.70% across the board, no five-number bet", () => {
  for (const b of EUROPEAN_BETS) assert.ok(Math.abs(b.houseEdgePct - 2.7) < TOL);
  assert.equal(EUROPEAN_BETS.find((b) => b.betId === "fivenumber"), undefined);
});

test("trap flag separates the two wheels (American all traps, European none)", () => {
  assert.equal(TRAP_THRESHOLD_PCT, 5);
  assert.ok(AMERICAN_BETS.every((b) => b.trap === true));
  assert.ok(EUROPEAN_BETS.every((b) => b.trap === false));
});
