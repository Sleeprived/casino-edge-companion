# Casino Edge Companion

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

**Quick start (just use it):** open `index.html` through a small local web server
and visit it in your browser. The simplest one, if you have Python:

```
python -m http.server 8000
```

Then open `http://localhost:8000/` in your browser. (Opening the file directly with
a `file://` path will not work — see the Plain-English guide for why.)

**Quick start (run the math tests):** with Node.js installed, from the project folder:

```
node --test
```

You should see `pass 38  fail 0`.

---

## 2. Plain-English guide

This section assumes you have never used a terminal. Follow it literally.

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

### The commands, explained piece by piece

You only need these to run or develop the app — not to use it on a phone once it is live.

**Serve the app locally:**
```
python -m http.server 8000
```
- `python` — runs the Python programming language, which is pre-installed on most
  computers and which you are using here only as a convenient mini web server.
- `-m http.server` — tells Python to run its built-in "serve these files over the web"
  module. This is what makes the app reachable at an `http://...` address.
- `8000` — the port number (think of it as a door number on your own computer). The app
  will be at `http://localhost:8000/`. Any free number works; 8000 is just convention.
- **What it actually does:** turns the project folder into a little website served only
  to your own machine, so the browser will load the JavaScript modules and the offline
  service worker — both of which browsers refuse to load from a bare `file://` path for
  security reasons. That refusal is why double-clicking `index.html` shows a blank page.
- **To stop it:** press `Ctrl + C` in the terminal.

**Run the math tests:**
```
node --test
```
- `node` — runs Node.js, a way to execute JavaScript outside the browser.
- `--test` — switches Node into its built-in test runner, which automatically finds and
  runs every file ending in `.test.js` in the `tests/` folder.
- **What it actually does:** checks the engine's math — re-deriving the craps and roulette
  house edges from scratch, confirming a hand-calculated video-poker expected value, and
  verifying the blackjack chart's known cells. If anything is wrong, it prints a failing
  test instead of `pass 38`.

**Regenerate the app icons (rarely needed):**
```
python tools/make-icons.py
```
- Runs the small Python script in `tools/` that draws the poker-chip icons into `icons/`.
  You only run this if you change the icon design.

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

## 3. Detailed guide

### Requirements
- **To use:** any modern browser (Chrome, Edge, Firefox, Safari). For installation and
  offline use it must be served over `http://` or `https://` (a local server or GitHub
  Pages), not `file://`.
- **To develop/test:** Node.js 18+ (uses the built-in `node:test` runner and ES modules;
  no npm dependencies). Python 3 only to regenerate icons.

### Project layout
```
index.html            Hub page (registers the service worker)
manifest.webmanifest  PWA metadata
sw.js                 Service worker (versioned offline cache)
css/                  themes.css (3 themes) + base.css
js/lib/               Pure, DOM-free logic — imported by both browser AND tests
js/ui/                One module per page (DOM wiring; videopoker-worker.js = Web Worker)
js/                   Shared shell: cards.js, theme.js, storage.js, disclaimer.js, hub.js
<game>/index.html     One page per tool
tests/                node --test suite (mirrors js/lib)
icons/, tools/        App icons + the dev-only generator and UI smoke
```

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

---

## 4. Glossary

- **PWA (Progressive Web App):** a website that can be "installed" to your home screen and
  run offline like a normal app.
- **Service worker:** a small background script the browser keeps; here it stores the app's
  files so it loads with no internet.
- **localStorage:** a small per-browser storage box where your theme and accuracy stats are
  kept. It never leaves your device.
- **House edge:** the percentage of each bet the casino expects to keep over the long run.
  Lower is better for you; this app's whole job is helping you pick lower-edge plays.
- **Basic strategy:** the mathematically proven best decision for every blackjack hand,
  given the rules — it minimizes the house edge but does not erase it.
- **DAS / S17 / H17:** blackjack rule shorthand. DAS = "double after split allowed."
  S17 = dealer Stands on soft 17. H17 = dealer Hits soft 17. These change the correct play.
- **Soft hand:** a blackjack hand with an Ace counted as 11 (e.g. A-7 = "soft 18").
- **Expected value (EV):** the average coins you get back per coin bet on a play. 1.000 means
  break-even on that hand; above 1 is a long-run winner, below 1 a loser.
- **Paytable (9/6, 8/5):** how much a video poker machine pays for a full house and a flush
  (9-for-1 and 6-for-1 is "9/6"). Higher is better; it sets the game's overall return.
- **Optimal hold:** the set of cards to keep from a video-poker hand that gives the highest
  expected value.
- **Enumeration:** checking every possibility exhaustively — here, every way the remaining
  cards could complete your hand — to get an exact answer rather than an estimate.
- **Sucker bet / trap:** a bet with a high house edge (5% or more here) that looks fun but
  costs you fast.
- **la partage:** a roulette rule that refunds half of an even-money bet when the ball hits
  zero, lowering that bet's edge.
- **Web Worker:** a way to run heavy JavaScript in the background so the page does not freeze.
- **ES module:** a modern, self-contained JavaScript file that can `import`/`export` code;
  this app shares the same logic files between the browser and the test runner.
- **Node.js / `node --test`:** a tool to run JavaScript outside a browser; its built-in test
  runner executes the project's automated checks.
- **Terminal:** the text window where you type the commands above.
- **Port:** a numbered "door" on your computer that a local server listens on (e.g. 8000).
