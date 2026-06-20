# Casino Edge Companion

## ▶ Use it live — just open this link

**https://sleeprived.github.io/casino-edge-companion/**

Works on any phone, tablet, or computer. Nothing to install, no account, no server.

A phone-friendly, **offline** web app that teaches you the *mathematically correct*
play for casino table games and shows you the real odds — so you play smarter and
lose slower. It does **not** claim to beat the house; every game here still favors
the casino. It is a learning tool, not a betting system.

Built as a static Progressive Web App (PWA): plain HTML/CSS/JavaScript, no servers,
no accounts, no internet required once loaded, nothing leaves your device.

---

## 1. Quick summary

**What it is:** six tools in one app —
- **Blackjack Trainer** — drills perfect basic strategy and scores you.
- **Video Poker** — finds the optimal cards to hold and the exact expected value.
- **Craps** — every bet's true odds and house edge, plus a sucker-bet quiz.
- **Roulette** — American vs European edges for every bet.
- **Baccarat** — the three bets and why you always bet Banker.
- **House-Edge Cheat Sheet** — every bet in the app ranked best-to-worst.


### Using the app

1. **Open the app.** You need to serve the folder over a tiny local web server (one
   line, below) and then open the address it gives you. Once it loads the first time,
   it works with no internet at all, and on a phone you can "Add to Home Screen" to
   install it like an app.
2. **Pick a tool** from the home screen by tapping a tile.
3. **Blackjack Trainer:** you are shown your two cards and the dealer's up card. Tap
   what you would do — Hit, Stand, Double, Split, or Surrender. The app instantly tells
   you if that was the textbook-correct play and keeps your accuracy. Use the **Table
   rules** dropdown to match the game in front of you, and **Show strategy chart** to
   see the whole answer key.
4. **Video Poker:** you are dealt five cards. Tap the cards you want to **HOLD**, then
   tap **Score my hold**. The app works out the best possible hold and tells you whether
   yours matched it. **Show optimal** just reveals the best hold without scoring.
5. **Craps / Roulette / Baccarat:** these are reference tables — every bet with its
   payout and house edge. Red rows are "sucker bets" (the house takes 5% or more). Craps
   also has a quick quiz.
6. **House-Edge Cheat Sheet:** one big list of every bet, best at the top. Tick the box
   to hide the bad bets.
7. **The disclaimer at the bottom of every screen is the point:** this lowers the
   house's edge, it never flips it in your favor. Only gamble money you can lose.



### What error messages mean

- **Blank page when you open `index.html` directly:** you opened it as a `file://` path.
  Use the `python -m http.server` command above and open the `http://localhost:8000/`
  address instead.
- **"calculating…" in Video Poker takes a second or two:** normal. The app is honestly
  computing the best hold by checking every possible draw; it runs in the background so
  the page never freezes.
- **`node: command not found`:** Node.js is not installed. You only need it to run the
  tests, not to use the app.
- **Your saved accuracy disappeared:** that is stored only in your browser. Clearing site
  data, using private/incognito mode, or a different browser/device starts fresh. The app
  is designed to keep working even if storage is blocked.

---



### How correctness is verified
- **Craps & roulette:** every house edge is **recomputed from first principles** in the
  tests (pockets/dice outcomes × payout) and compared to the stored value — the test
  oracle is independent of the data.
- **Video poker:** the full-enumeration solver is cross-checked against a
  **hand-derived** three-of-a-kind expected value (the derivation is written out in the
  test) and against exact pat-hand payouts.
- **Blackjack:** the charts are transcribed from the published Wizard of Odds 4-8 deck
  basic strategy; the tests pin the universally-agreed landmark cells and the exact
  S17-vs-H17 differences. (These cells are the one place values are transcribed rather
  than machine-recomputed — spot-checking a few against wizardofodds.com is a good idea.)
- **Baccarat:** house edges are published constants (the drawing rules make them
  impractical to recompute here); the source is cited in the data file.

### Options and limits
- **Blackjack presets:** 6-deck S17 DAS (default) and 6-deck H17 DAS. Single-deck and
  other rule sets are intentionally out of this version.
- **Video poker paytables:** 9/6 and 8/5 Jacks or Better. EV is shown on a max-coin basis
  (royal = 800/coin), which matches the published returns (99.54% and 97.30%).
- **No real money, no wagering, no card counting** — by design.
- **Offline caching** activates after you have visited the home page once (that is where
  the service worker registers). After a redeploy, bump `CACHE_VERSION` in `sw.js` so
  installed users pick up the new version.

### Deploying (GitHub Pages)
This ships as a static site. Push the folder to a public GitHub repo and enable Pages on
the default branch. The `.nojekyll` file is included so GitHub serves the `js/` folder
as-is. No build step.

### Troubleshooting
- **Service worker not updating:** bump `CACHE_VERSION` in `sw.js`; the old cache is
  deleted on activate and the new worker claims the page on next load.
- **Video poker feels slow on a very old phone:** the worst-case solve enumerates ~1.5M
  draws; it still runs off the main thread, so the page stays responsive while it works.
- **A reference number looks off for your specific casino:** payouts vary by house (e.g.
  the craps Field, or a 9:1 baccarat Tie). Each data file notes its assumptions.

