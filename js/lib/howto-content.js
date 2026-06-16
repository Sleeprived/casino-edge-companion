/* "How to play at the casino" guides, one per game. Plain data so it can be
   unit-tested and rendered by js/ui/howto.js. Procedural how-to only — the
   strategy/odds live in each game's tool on the same page. */

export const HOWTO = {
  blackjack: {
    title: "blackjack",
    intro:
      "You're trying to get a hand total closer to 21 than the dealer without going over ('busting'). You play against the dealer, not the other players. Cards 2-10 are face value, J/Q/K are 10, and an Ace is 1 or 11 — whichever helps.",
    steps: [
      "Buy in: set your cash flat on the table between hands (don't hand it to the dealer). They'll slide you chips.",
      "Bet: place chips in your betting circle before the deal.",
      "The deal: you get two cards face up; the dealer takes one card up and one face down.",
      "Your turn: Hit (take a card), Stand (keep your total), Double (double the bet, take exactly one card), Split (turn a pair into two hands), or Surrender (give up half your bet, where offered).",
      "Dealer plays: the dealer reveals the hole card and must keep hitting until reaching 17 or more. If the dealer busts, everyone still in wins.",
      "Payout: a win pays 1:1; a two-card 21 ('blackjack') pays 3:2.",
    ],
    tips: [
      "Use hand signals, not words — tap the felt to hit, wave a flat hand to stand. The cameras need to see your decision.",
      "In a shoe game the cards are dealt face up — don't touch them. Don't touch your chips once the bet is placed.",
      "Decline 'insurance'. It's a side bet that loses money over time.",
      "Avoid tables where blackjack pays 6:5 instead of 3:2 — it quietly doubles the house edge.",
    ],
    pointer: "Use the trainer below to drill the mathematically correct move for every hand.",
  },

  videopoker: {
    title: "video poker",
    intro:
      "A solo machine game — no dealer, no other players, no pressure. You're dealt five cards, keep the ones you want, and the rest are replaced. You get paid when your final hand is a pair of Jacks or better, up to a royal flush.",
    steps: [
      "Load money: insert cash or a ticket into the machine; your credits appear on screen.",
      "Set your bet: choose coins per hand. Bet MAX (5 coins) — the royal flush pays a big bonus only at max bet, so betting less quietly lowers your return.",
      "Deal: press Deal to get your five cards.",
      "Hold: tap each card you want to keep so it shows 'Held', then press Draw.",
      "Get paid: the machine replaces the cards you didn't hold and pays you per the paytable shown on the glass.",
      "Cash out: press Cash Out for a ticket, which you redeem at a kiosk or the cage.",
    ],
    tips: [
      "Read the paytable first. '9/6' Jacks or Better (9 for a full house, 6 for a flush) is the good one; '8/5' pays you less for the exact same play.",
      "If you can't afford max coins at one denomination, drop to a lower denomination and still bet max — never bet under max.",
      "There's no etiquette to worry about — it's just you and the machine, at your own pace.",
    ],
    pointer: "Use the trainer below to learn the best cards to hold and what each hand is really worth.",
  },

  craps: {
    title: "craps",
    intro:
      "A dice game where the whole table bets on the roll of two dice. It looks chaotic, but the core bet is simple. One player (the 'shooter') rolls, and everyone can bet on the outcome.",
    steps: [
      "Buy in: drop cash on the layout (not into the dealer's hand) when they're not mid-action; you'll get chips.",
      "Make the basic bet: put a chip on the PASS LINE before a new 'come-out' roll.",
      "Come-out roll: 7 or 11 wins immediately; 2, 3, or 12 ('craps') loses. Any other number becomes 'the point'.",
      "Chasing the point: the shooter keeps rolling. If the point rolls again before a 7, Pass wins; if a 7 comes first, Pass loses and the dice move to the next shooter.",
      "Back it with Odds: once a point is set, place an Odds bet right behind your Pass Line bet. It pays true odds with ZERO house edge — always take it.",
    ],
    tips: [
      "Keep your hands out of the table area whenever the dice are out.",
      "If you're the shooter, throw with one hand and hit the far wall.",
      "Don't say the word 'seven' at the table — it's superstition, but take it seriously.",
      "Stick to Pass + Odds (and Come + Odds). The flashy one-roll bets in the middle of the table are sucker bets.",
    ],
    pointer: "Use the reference below for every bet's true odds and which ones to avoid.",
  },

  roulette: {
    title: "roulette",
    intro:
      "Bet on where a ball lands on a spinning numbered wheel. You can bet a single number, groups of numbers, colors, or odd/even — small bets pay big but hit rarely, broad bets pay little but hit often.",
    steps: [
      "Buy chips: roulette uses special colored chips unique to you, so nobody's bets get mixed up. Hand the dealer cash and pick a color.",
      "Place bets: 'inside' bets sit on the numbers (big payouts, long odds); 'outside' bets are red/black, odd/even, and 1-18/19-36 (even money, the best odds).",
      "The spin: the dealer spins the wheel and ball. You can keep betting until they wave a hand and call 'no more bets'.",
      "Payout: the dealer marks the winning number, sweeps the losers, and pays the winners.",
      "Cash out: trade your colored chips back for regular casino chips at the table before you leave.",
    ],
    tips: [
      "Play a EUROPEAN (single-zero) wheel whenever you can — it has half the house edge of the American double-zero wheel.",
      "Don't touch any chips on the layout once 'no more bets' is called.",
      "Your colored chips only work at that one table — always cash them out before walking away.",
    ],
    pointer: "Use the reference below for the payout and true house edge of every bet.",
  },

  baccarat: {
    title: "baccarat",
    intro:
      "One of the simplest games in the house. You don't play a hand — you just bet on which of two hands, 'Player' or 'Banker', will win. Despite the high-roller image, you make no decisions at all.",
    steps: [
      "Buy in for chips like any table game.",
      "Place your bet: on Banker, Player, or Tie. That is your only choice.",
      "The deal: the dealer deals two hands. The one closest to 9 wins. Cards 2-9 count face value, 10s and faces count 0, Aces count 1; if a total passes 9 only the last digit counts (7 + 6 = 13 → 3).",
      "Drawing: whether a third card is drawn follows fixed house rules — nobody decides anything.",
      "Payout: Banker and Player pay even money (Banker takes a 5% commission); Tie pays 8:1 but rarely lands.",
    ],
    tips: [
      "Always bet BANKER — it has the lowest house edge, even after the commission.",
      "Never bet the Tie. It looks tempting at 8:1 but it's a sucker bet.",
      "'Mini-baccarat' on the main floor is the same game — faster, lower minimums, and less intimidating.",
    ],
    pointer: "Use the reference below for the exact house edge of each bet.",
  },
};

export const HOWTO_GAMES = Object.keys(HOWTO);
