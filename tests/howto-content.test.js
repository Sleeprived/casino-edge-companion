import { test } from "node:test";
import assert from "node:assert/strict";
import { HOWTO, HOWTO_GAMES } from "../js/lib/howto-content.js";

test("a how-to guide exists for each of the five games", () => {
  assert.deepEqual([...HOWTO_GAMES].sort(), ["baccarat", "blackjack", "craps", "roulette", "videopoker"]);
});

test("every guide has a full set of non-empty fields", () => {
  for (const game of HOWTO_GAMES) {
    const g = HOWTO[game];
    assert.ok(g.title && typeof g.title === "string", `${game} title`);
    assert.ok(g.intro.length > 40, `${game} intro too short`);
    assert.ok(Array.isArray(g.steps) && g.steps.length >= 3, `${game} needs >=3 steps`);
    assert.ok(Array.isArray(g.tips) && g.tips.length >= 2, `${game} needs >=2 tips`);
    assert.ok(g.pointer && g.pointer.length > 10, `${game} pointer`);
    for (const s of [...g.steps, ...g.tips]) assert.ok(s.trim().length > 0, `${game} empty list item`);
  }
});
