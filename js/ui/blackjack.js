import {
  CHARTS,
  DEALER_UPCARDS,
  PRESET_LABELS,
  classifyHand,
  correctAction,
  strategyCode,
} from "../lib/blackjack-strategy.js";
import { newStats, record, accuracyPct } from "../lib/stats.js";
import { deal, renderHand } from "../cards.js";
import { getJSON, setJSON, remove, getString, setString } from "../storage.js";
import { mountThemeSelect } from "../theme.js";
import "../disclaimer.js";

mountThemeSelect(document.getElementById("theme"));

const ACTION_NAME = { H: "Hit", S: "Stand", D: "Double", P: "Split", R: "Surrender" };
const PRESETS = Object.keys(PRESET_LABELS);
const $ = (id) => document.getElementById(id);

let preset = getString("casinoedge.bj.preset", PRESETS[0]);
if (!PRESETS.includes(preset)) preset = PRESETS[0];
let stats = loadStats();
let player = null;
let dealerUp = null;
let answered = false;

function statsKey() {
  return `casinoedge.bj.stats.${preset}`;
}
function loadStats() {
  return getJSON(statsKey(), newStats());
}

/* ---- preset selector ---- */
$("preset").innerHTML = PRESETS.map((p) => `<option value="${p}">${PRESET_LABELS[p]}</option>`).join("");
$("preset").value = preset;
$("preset").addEventListener("change", () => {
  preset = $("preset").value;
  setString("casinoedge.bj.preset", preset);
  stats = loadStats();
  updateScore();
  renderChart();
  newHand();
});

/* ---- hand label ---- */
function handLabel() {
  const c = classifyHand(player);
  const upLabel = dealerUp.r === "T" || ["J", "Q", "K"].includes(dealerUp.r) ? "10" : dealerUp.r;
  if (c.kind === "pair") return `Pair of ${c.key === "T" ? "10s" : c.key + "s"} vs ${upLabel}`;
  if (c.kind === "soft") return `Soft ${11 + Number(c.key)} (A-${c.key}) vs ${upLabel}`;
  return `Hard ${c.key} vs ${upLabel}`;
}

/* ---- deal ---- */
function newHand() {
  let three;
  do {
    three = deal(3);
    player = [three[0], three[1]];
    dealerUp = three[2];
  } while (classifyHand(player).kind === "blackjack");

  answered = false;
  renderHand($("player"), player);
  renderHand($("dealer"), [dealerUp]);
  $("handlabel").textContent = handLabel();
  $("feedback").textContent = "";
  $("feedback").className = "msg";

  const isPair = player[0].r === player[1].r;
  for (const btn of $("actions").querySelectorAll("button")) {
    btn.disabled = false;
    if (btn.dataset.a === "P" && !isPair) btn.disabled = true;
  }
}

/* ---- scoring ---- */
function answer(chosen) {
  if (answered) return;
  answered = true;
  const correct = correctAction(player, dealerUp.r, preset);
  const isRight = chosen === correct;
  stats = record(stats, isRight);
  setJSON(statsKey(), stats);
  updateScore();

  const raw = strategyCode(player, dealerUp.r, preset);
  const nuance = raw === "Ds" ? " (double, or stand if you can't)" : raw === "R" ? " (surrender, or hit if not offered)" : "";
  const fb = $("feedback");
  fb.textContent = isRight
    ? `Correct — ${ACTION_NAME[correct]}${nuance}.`
    : `Wrong. Correct play: ${ACTION_NAME[correct]}${nuance}.`;
  fb.className = `msg ${isRight ? "good" : "bad"}`;
  for (const btn of $("actions").querySelectorAll("button")) btn.disabled = true;
}

$("actions").addEventListener("click", (e) => {
  const a = e.target.dataset && e.target.dataset.a;
  if (a) answer(a);
});
$("next").addEventListener("click", newHand);
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
  $("presetnote").textContent = PRESET_LABELS[preset];
}

/* ---- strategy chart viewer ---- */
function chartTable(title, sub, rowKeys, labelFor) {
  const chart = CHARTS[preset][sub];
  const header = DEALER_UPCARDS.map((d) => `<th class="num">${d}</th>`).join("");
  const body = rowKeys
    .map((k) => {
      const cells = chart[k].map((code) => `<td class="num">${code}</td>`).join("");
      return `<tr><td>${labelFor(k)}</td>${cells}</tr>`;
    })
    .join("");
  return `<h2>${title}</h2><table class="ref"><thead><tr><th></th>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderChart() {
  $("chart").innerHTML =
    chartTable("Hard totals", "hard", [9, 10, 11, 12, 13, 14, 15, 16, 17], (k) => k) +
    chartTable("Soft totals", "soft", [2, 3, 4, 5, 6, 7, 8, 9], (k) => `A-${k}`) +
    chartTable("Pairs", "pair", ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"], (k) => `${k === "T" ? "10" : k},${k === "T" ? "10" : k}`) +
    `<p class="hint">H hit · S stand · D double/hit · Ds double/stand · P split · R surrender/hit</p>`;
}

$("togglechart").addEventListener("click", () => {
  const el = $("chart");
  el.classList.toggle("hidden");
  $("togglechart").textContent = el.classList.contains("hidden") ? "Show strategy chart" : "Hide strategy chart";
});

updateScore();
renderChart();
newHand();
