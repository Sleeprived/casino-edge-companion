/* Browser-side card rendering and dealing. The card MODEL and logic live in
   js/lib/deck.js (shared with the Node tests); this module is the DOM/render
   layer, so it is never imported by tests. Shuffle uses crypto.getRandomValues
   for fairness (no security depends on it). */

import { makeDeck, SUIT_SYMBOL, rankLabel, isRed, cardId } from "./lib/deck.js";

function randInt(n) {
  const u = new Uint32Array(1);
  crypto.getRandomValues(u);
  return u[0] % n;
}

export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Deal n distinct cards from a fresh shuffled 52-card deck. */
export function deal(n) {
  return shuffle(makeDeck()).slice(0, n);
}

export function cardHTML(card, { holdable = false, held = false } = {}) {
  const cls = `pcard${isRed(card) ? " red" : ""}${held ? " held" : ""}${holdable ? " holdable" : ""}`;
  const tag = holdable ? `<span class="hold-tag">${held ? "HOLD" : ""}</span>` : "";
  return `<div class="${cls}" data-card="${cardId(card)}"><span>${rankLabel(card.r)}</span><span>${SUIT_SYMBOL[card.s]}</span>${tag}</div>`;
}

export function renderHand(el, cards, opts = {}) {
  el.innerHTML = cards.map((c, i) => cardHTML(c, typeof opts === "function" ? opts(c, i) : opts)).join("");
}
