import { AMERICAN_BETS, EUROPEAN_BETS } from "../lib/roulette.js";
import { mountThemeSelect } from "../theme.js";
import "../disclaimer.js";

mountThemeSelect(document.getElementById("theme"));

function renderTable(el, bets) {
  el.innerHTML = `
    <thead><tr><th>Bet</th><th>Payout</th><th class="num">House Edge</th></tr></thead>
    <tbody>
      ${bets
        .map(
          (b) => `<tr class="${b.trap ? "trap" : ""}">
        <td>${b.name}${b.betId === "fivenumber" ? ' <span class="pill trap">WORST</span>' : ""}</td>
        <td>${b.payoutText}</td>
        <td class="num">${b.houseEdgePct.toFixed(2)}%</td>
      </tr>`,
        )
        .join("")}
    </tbody>`;
}

renderTable(document.getElementById("american"), AMERICAN_BETS);
renderTable(document.getElementById("european"), EUROPEAN_BETS);
