import { BACCARAT_BETS } from "../lib/baccarat.js";
import { mountThemeSelect } from "../theme.js";
import "../disclaimer.js";

mountThemeSelect(document.getElementById("theme"));

document.getElementById("table").innerHTML = `
  <thead><tr><th>Bet</th><th>Payout</th><th class="num">House Edge</th></tr></thead>
  <tbody>
    ${BACCARAT_BETS.map(
      (b) => `<tr class="${b.trap ? "trap" : b.id === "banker" ? "best" : ""}">
      <td>${b.name}${b.trap ? ' <span class="pill trap">SUCKER</span>' : b.id === "banker" ? ' <span class="pill good">BEST</span>' : ""}</td>
      <td>${b.payoutText}</td>
      <td class="num">${b.houseEdgePct.toFixed(2)}%</td>
    </tr>`,
    ).join("")}
  </tbody>`;

document.getElementById("notes").innerHTML = BACCARAT_BETS.map(
  (b) => `<p class="hint"><strong>${b.name}:</strong> ${b.note}</p>`,
).join("");
