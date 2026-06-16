import { buildCheatSheet } from "../lib/houseedge.js";
import { mountThemeSelect } from "../theme.js";
import "../disclaimer.js";

mountThemeSelect(document.getElementById("theme"));

const ALL = buildCheatSheet();

function edgeClass(e) {
  if (e < 1.5) return "edge-good";
  if (e >= 5) return "edge-bad";
  return "";
}

function render(hideTraps) {
  const rows = hideTraps ? ALL.filter((r) => r.houseEdgePct < 5) : ALL;
  document.getElementById("table").innerHTML = `
    <thead><tr><th>Game</th><th>Bet</th><th class="num">House Edge</th></tr></thead>
    <tbody>
      ${rows
        .map(
          (r, i) => `<tr class="${r.houseEdgePct >= 5 ? "trap" : i === 0 && !hideTraps ? "best" : ""}">
        <td>${r.game}</td>
        <td>${r.bet}</td>
        <td class="num ${edgeClass(r.houseEdgePct)}">${r.houseEdgePct.toFixed(2)}%</td>
      </tr>`,
        )
        .join("")}
    </tbody>`;
}

const filter = document.getElementById("filter");
filter.addEventListener("change", () => render(filter.checked));
render(false);
