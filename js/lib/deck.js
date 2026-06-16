/* Pure card model shared by the blackjack and video-poker logic and by the Node
   tests. No DOM, no randomness at import time. Cards are { r, s } where r is a
   rank char and s is a suit char.

   Ranks use 'T' for ten so every rank is one character (display maps it to 10).
   Suits are lowercase letters; SUIT_SYMBOL maps them to glyphs for the UI. */

export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
export const SUITS = ["s", "h", "d", "c"];

export const SUIT_SYMBOL = { s: "♠", h: "♥", d: "♦", c: "♣" };
export const RANK_LABEL = { T: "10" };

export function rankLabel(r) {
  return RANK_LABEL[r] || r;
}

export function isRed(card) {
  return card.s === "h" || card.s === "d";
}

/* Card key like "As", "Th", "9c" — unique per physical card. */
export function cardId(card) {
  return card.r + card.s;
}

export function cardFromId(id) {
  return { r: id[0], s: id[1] };
}

/* Index of a rank within RANKS (A=0 .. K=12). Used for straights/ordering. */
export function rankIndex(r) {
  return RANKS.indexOf(r);
}

/* Blackjack point value; aces are 11 here and softened by the hand evaluator. */
export function bjValue(r) {
  if (r === "A") return 11;
  if (r === "T" || r === "J" || r === "Q" || r === "K") return 10;
  return Number(r);
}

export function makeDeck() {
  const out = [];
  for (const s of SUITS) for (const r of RANKS) out.push({ r, s });
  return out;
}
