/* Input validation. Every user-driven input is checked against a fixed allowed
   set before any logic runs (spec §8). No free text, no file/URL input. */

import { RANKS, SUITS, cardId } from "./deck.js";

export const BLACKJACK_ACTIONS = ["H", "S", "D", "P", "R"]; // hit/stand/double/split/surrender
export const BLACKJACK_PRESETS = ["s17-6deck-das", "h17-6deck-das"];
export const VIDEOPOKER_PAYTABLES = ["jacks96", "jacks85"];

export function isCard(card) {
  return (
    card != null &&
    typeof card === "object" &&
    RANKS.includes(card.r) &&
    SUITS.includes(card.s)
  );
}

export function hasDuplicates(cards) {
  const seen = new Set();
  for (const c of cards) {
    if (!isCard(c)) return true; // an invalid card is not a usable hand
    const id = cardId(c);
    if (seen.has(id)) return true;
    seen.add(id);
  }
  return false;
}

/* A legal 5-card video-poker hand: five valid, distinct cards. */
export function isValidFiveCardHand(cards) {
  return Array.isArray(cards) && cards.length === 5 && !hasDuplicates(cards);
}

export function isValidAction(a) {
  return BLACKJACK_ACTIONS.includes(a);
}

export function isKnownPreset(id) {
  return BLACKJACK_PRESETS.includes(id);
}

export function isKnownPaytable(id) {
  return VIDEOPOKER_PAYTABLES.includes(id);
}

/* A hold mask is 5 booleans (which dealt cards to keep). */
export function isValidHoldMask(mask) {
  return Array.isArray(mask) && mask.length === 5 && mask.every((b) => typeof b === "boolean");
}
