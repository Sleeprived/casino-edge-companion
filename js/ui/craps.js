import { CRAPS_BETS } from "../lib/craps.js";
import { newStats, record, accuracyPct } from "../lib/stats.js";
import { getJSON, setJSON, remove } from "../storage.js";
import { mountThemeSelect } from "../theme.js";
import "../disclaimer.js";

mountThemeSelect(document.getElementById("theme"));

const KEY = "casinoedge.craps.quiz";
let stats = getJSON(KEY, newStats());
let current = null;

const $ = (id) => document.getElementById(id);

function fmtEdge(e) {
  return e === 0 ? "0.00%" : `${e.toFixed(2)}%`;
}

/* ---- reference table ---- */
let sortAsc = true;
function renderTable() {
  const rows = [...CRAPS_BETS].sort((a, b) =>
    sortAsc ? a.houseEdgePct - b.houseEdgePct : b.houseEdgePct - a.houseEdgePct,
  );
  $("table").innerHTML = `
    <thead><tr>
      <th>Bet</th><th>Payout</th><th id="edgehdr" class="num">House Edge ${sortAsc ? "▲" : "▼"}</th>
    </tr></thead>
    <tbody>
      ${rows
        .map(
          (b) => `<tr class="${b.trap ? "trap" : ""}">
        <td>${b.name}${b.trap ? ' <span class="pill trap">SUCKER</span>' : ""}</td>
        <td>${b.payoutText}</td>
        <td class="num">${fmtEdge(b.houseEdgePct)}</td>
      </tr>`,
        )
        .join("")}
    </tbody>`;
  $("edgehdr").addEventListener("click", () => {
    sortAsc = !sortAsc;
    renderTable();
  });
}

/* ---- quiz ---- */
function updateScore() {
  $("acc").textContent = `${accuracyPct(stats)}%`;
  $("streak").textContent = stats.streak;
  $("best").textContent = stats.best;
}

function nextQuestion() {
  current = CRAPS_BETS[Math.floor(Math.random() * CRAPS_BETS.length)];
  $("quiz-bet").textContent = `${current.name} — pays ${current.payoutText}`;
  $("quiz-feedback").textContent = "";
  $("quiz-feedback").className = "msg";
}

function answer(saidSucker) {
  if (!current) return;
  const correct = saidSucker === current.trap;
  stats = record(stats, correct);
  setJSON(KEY, stats);
  updateScore();
  const fb = $("quiz-feedback");
  fb.textContent = correct
    ? `Correct — ${current.houseEdgePct.toFixed(2)}% edge.`
    : `Not quite — it's ${current.houseEdgePct.toFixed(2)}% (${current.trap ? "a sucker bet" : "a smart bet"}).`;
  fb.className = `msg ${correct ? "good" : "bad"}`;
  setTimeout(nextQuestion, 1100);
}

$("smart").addEventListener("click", () => answer(false));
$("sucker").addEventListener("click", () => answer(true));
$("reset").addEventListener("click", () => {
  remove(KEY);
  stats = newStats();
  updateScore();
});

renderTable();
updateScore();
nextQuestion();
