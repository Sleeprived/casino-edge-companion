import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCheatSheet } from "../js/lib/houseedge.js";

test("cheat sheet is sorted best-to-worst with no bad numbers", () => {
  const rows = buildCheatSheet();
  assert.ok(rows.length > 20);
  for (const row of rows) {
    assert.equal(typeof row.houseEdgePct, "number");
    assert.ok(Number.isFinite(row.houseEdgePct));
    assert.ok(row.game && row.bet);
  }
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i].houseEdgePct >= rows[i - 1].houseEdgePct, "not sorted ascending");
  }
});

test("the best row is a low-edge blackjack/VP line and the worst is a sucker bet", () => {
  const rows = buildCheatSheet();
  assert.ok(rows[0].houseEdgePct < 1);
  assert.ok(rows[rows.length - 1].houseEdgePct > 10);
});

test("every game is represented", () => {
  const games = new Set(buildCheatSheet().map((r) => r.game));
  for (const g of ["Blackjack", "Video Poker", "Craps", "Roulette", "Baccarat"]) {
    assert.ok(games.has(g), `missing ${g}`);
  }
});
