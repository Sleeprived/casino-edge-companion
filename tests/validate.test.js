import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isCard,
  hasDuplicates,
  isValidFiveCardHand,
  isValidAction,
  isKnownPreset,
  isKnownPaytable,
  isValidHoldMask,
} from "../js/lib/validate.js";

test("isCard accepts valid cards and rejects junk", () => {
  assert.equal(isCard({ r: "A", s: "s" }), true);
  assert.equal(isCard({ r: "T", s: "h" }), true);
  assert.equal(isCard({ r: "1", s: "s" }), false); // no rank "1"
  assert.equal(isCard({ r: "A", s: "x" }), false); // bad suit
  assert.equal(isCard({ r: "10", s: "s" }), false); // ten is "T", not "10"
  assert.equal(isCard(null), false);
  assert.equal(isCard("As"), false);
});

test("hasDuplicates catches repeated and invalid cards", () => {
  assert.equal(hasDuplicates([{ r: "A", s: "s" }, { r: "K", s: "h" }]), false);
  assert.equal(hasDuplicates([{ r: "A", s: "s" }, { r: "A", s: "s" }]), true);
  assert.equal(hasDuplicates([{ r: "A", s: "s" }, { r: "Z", s: "s" }]), true);
});

test("isValidFiveCardHand requires exactly five distinct valid cards", () => {
  const ok = [
    { r: "A", s: "s" },
    { r: "K", s: "s" },
    { r: "Q", s: "s" },
    { r: "J", s: "s" },
    { r: "T", s: "s" },
  ];
  assert.equal(isValidFiveCardHand(ok), true);
  assert.equal(isValidFiveCardHand(ok.slice(0, 4)), false);
  const dupe = [...ok.slice(0, 4), { r: "A", s: "s" }];
  assert.equal(isValidFiveCardHand(dupe), false);
});

test("enum validators reject unknown ids", () => {
  assert.equal(isValidAction("H"), true);
  assert.equal(isValidAction("X"), false);
  assert.equal(isKnownPreset("s17-6deck-das"), true);
  assert.equal(isKnownPreset("triple-deck"), false);
  assert.equal(isKnownPaytable("jacks96"), true);
  assert.equal(isKnownPaytable("jacks99"), false);
});

test("hold mask must be five booleans", () => {
  assert.equal(isValidHoldMask([true, false, true, false, true]), true);
  assert.equal(isValidHoldMask([true, false, true, false]), false);
  assert.equal(isValidHoldMask([1, 0, 1, 0, 1]), false);
});
