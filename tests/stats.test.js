import { test } from "node:test";
import assert from "node:assert/strict";
import { newStats, record, accuracyPct } from "../js/lib/stats.js";

test("newStats is empty", () => {
  assert.deepEqual(newStats(), { attempts: 0, correct: 0, streak: 0, best: 0 });
});

test("record accumulates and is immutable", () => {
  const s0 = newStats();
  const s1 = record(s0, true);
  assert.deepEqual(s0, { attempts: 0, correct: 0, streak: 0, best: 0 }); // unchanged
  assert.deepEqual(s1, { attempts: 1, correct: 1, streak: 1, best: 1 });
});

test("a wrong answer resets the streak but keeps best", () => {
  let s = newStats();
  s = record(s, true);
  s = record(s, true);
  s = record(s, true); // streak 3, best 3
  s = record(s, false); // streak 0, best still 3
  assert.equal(s.streak, 0);
  assert.equal(s.best, 3);
  assert.equal(s.correct, 3);
  assert.equal(s.attempts, 4);
});

test("accuracyPct is rounded to one decimal, 0 when no attempts", () => {
  assert.equal(accuracyPct(newStats()), 0);
  let s = newStats();
  s = record(s, true);
  s = record(s, false);
  s = record(s, true); // 2/3
  assert.equal(accuracyPct(s), 66.7);
});
