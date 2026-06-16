import { PAYTABLES } from "../lib/videopoker.js";
import { RANKS, SUITS, SUIT_SYMBOL, rankLabel } from "../lib/deck.js";
import { isValidFiveCardHand } from "../lib/validate.js";
import { newStats, record, accuracyPct } from "../lib/stats.js";
import { deal, renderHand } from "../cards.js";
import { getJSON, setJSON, remove, getString, setString } from "../storage.js";
import { mountThemeSelect } from "../theme.js";
import "../disclaimer.js";

mountThemeSelect(document.getElementById("theme"));

const $ = (id) => document.getElementById(id);
const PAYIDS = Object.keys(PAYTABLES);

let paytable = getString("casinoedge.vp.paytable", PAYIDS[0]);
if (!PAYIDS.includes(paytable)) paytable = PAYIDS[0];
let stats = loadStats();
let cards = deal(5);
let hold = [false, false, false, false, false];
let busy = false;
let lastBest = null;

const worker = new Worker(new URL("./videopoker-worker.js", import.meta.url), { type: "module" });

function statsKey() {
  return `casinoedge.vp.stats.${paytable}`;
}
function loadStats() {
  return getJSON(statsKey(), newStats());
}

/* ---- paytable selector ---- */
$("paytable").innerHTML = PAYIDS.map((p) => `<option value="${p}">${PAYTABLES[p].label}</option>`).join("");
$("paytable").value = paytable;
$("paytable").addEventListener("change", () => {
  paytable = $("paytable").value;
  setString("casinoedge.vp.paytable", paytable);
  stats = loadStats();
  updateScore();
  newDeal();
});

/* ---- rendering ---- */
function render() {
  renderHand($("hand"), cards, (c, i) => ({ holdable: true, held: hold[i] }));
}

$("hand").addEventListener("click", (e) => {
  if (busy) return;
  const el = e.target.closest(".pcard");
  if (!el) return;
  const i = [...$("hand").children].indexOf(el);
  if (i < 0) return;
  hold[i] = !hold[i];
  clearResult();
  render();
});

function clearResult() {
  $("result").textContent = "";
  $("result").className = "msg";
  $("evnote").textContent = "";
  lastBest = null;
}

function newDeal() {
  cards = deal(5);
  hold = [false, false, false, false, false];
  busy = false;
  $("status").textContent = "";
  clearResult();
  render();
}

/* ---- compute via worker ---- */
function setBusy(on, label) {
  busy = on;
  $("status").textContent = on ? label : "";
  for (const id of ["deal", "score", "optimal", "paytable"]) $(id).disabled = on;
}

function highlightOptimal(best) {
  const ids = new Set(best.held.map((c) => c.r + c.s));
  renderHand($("hand"), cards, (c) => ({ holdable: true, held: ids.has(c.r + c.s) }));
}

function score() {
  if (busy) return;
  setBusy(true, "Calculating best play…");
  const userMask = [...hold];
  worker.onmessage = (e) => {
    setBusy(false);
    const { best, userEv } = e.data;
    lastBest = best;
    const isRight = Math.abs(userEv - best.ev) < 1e-9;
    stats = record(stats, isRight);
    setJSON(statsKey(), stats);
    updateScore();
    const r = $("result");
    r.textContent = isRight
      ? `Correct — that's the best hold (EV ${best.ev.toFixed(3)}).`
      : `Better hold exists. Your EV ${userEv.toFixed(3)} vs optimal ${best.ev.toFixed(3)}.`;
    r.className = `msg ${isRight ? "good" : "bad"}`;
    $("evnote").innerHTML = `Optimal: keep <strong>${best.held.map((c) => rankLabel(c.r) + SUIT_SYMBOL[c.s]).join(" ") || "nothing"}</strong>. EV is coins returned per coin bet (1.000 = break-even on this hand).`;
    highlightOptimal(best);
  };
  worker.postMessage({ cards, paytable, userMask });
}

function showOptimal() {
  if (busy) return;
  setBusy(true, "Calculating best play…");
  worker.onmessage = (e) => {
    setBusy(false);
    const { best } = e.data;
    lastBest = best;
    $("result").textContent = `Optimal hold: EV ${best.ev.toFixed(3)}.`;
    $("result").className = "msg";
    $("evnote").innerHTML = `Keep <strong>${best.held.map((c) => rankLabel(c.r) + SUIT_SYMBOL[c.s]).join(" ") || "nothing"}</strong>.`;
    highlightOptimal(best);
    hold = cards.map((c) => best.held.some((h) => h.r === c.r && h.s === c.s));
  };
  worker.postMessage({ cards, paytable });
}

$("deal").addEventListener("click", newDeal);
$("score").addEventListener("click", score);
$("optimal").addEventListener("click", showOptimal);
$("reset").addEventListener("click", () => {
  remove(statsKey());
  stats = newStats();
  updateScore();
});

function updateScore() {
  $("acc").textContent = `${accuracyPct(stats)}%`;
  $("streak").textContent = stats.streak;
  $("best").textContent = stats.best;
  $("hands").textContent = stats.attempts;
  $("paynote").textContent = `${PAYTABLES[paytable].label} — published return ${PAYTABLES[paytable].returnPct}% with optimal play.`;
}

/* ---- custom hand picker ---- */
function buildPickers() {
  const rankOpts = RANKS.map((r) => `<option value="${r}">${rankLabel(r)}</option>`).join("");
  const suitOpts = SUITS.map((s) => `<option value="${s}">${SUIT_SYMBOL[s]}</option>`).join("");
  $("pickers").innerHTML = [0, 1, 2, 3, 4]
    .map(
      (i) => `<span><select class="btn pr" data-i="${i}">${rankOpts}</select><select class="btn ps" data-i="${i}">${suitOpts}</select></span>`,
    )
    .join("");
}

$("togglecustom").addEventListener("click", () => {
  const el = $("custom");
  el.classList.toggle("hidden");
  if (!el.dataset.built) {
    buildPickers();
    el.dataset.built = "1";
  }
});

$("loadcustom").addEventListener("click", () => {
  const prs = [...document.querySelectorAll(".pr")];
  const pss = [...document.querySelectorAll(".ps")];
  const picked = prs.map((sel, i) => ({ r: sel.value, s: pss[i].value }));
  if (!isValidFiveCardHand(picked)) {
    $("customerr").textContent = "Pick five different cards.";
    return;
  }
  $("customerr").textContent = "";
  cards = picked;
  hold = [false, false, false, false, false];
  clearResult();
  $("status").textContent = "";
  render();
});

updateScore();
render();
