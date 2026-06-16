import { mountThemeSelect } from "./theme.js";
import { clearAll } from "./storage.js";
import "./disclaimer.js";

const TOOLS = [
  { href: "blackjack/", badge: "♠", name: "Blackjack Trainer", desc: "Drill perfect basic strategy" },
  { href: "videopoker/", badge: "♥", name: "Video Poker", desc: "Optimal holds + exact EV" },
  { href: "craps/", badge: "🎲", name: "Craps", desc: "Every bet's odds + sucker-bet quiz" },
  { href: "roulette/", badge: "⊚", name: "Roulette", desc: "American vs European edges" },
  { href: "baccarat/", badge: "♦", name: "Baccarat", desc: "Banker, Player, Tie" },
  { href: "cheatsheet/", badge: "📊", name: "House-Edge Cheat Sheet", desc: "Every bet, best to worst" },
];

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = TOOLS.map(
    (t) => `
    <a class="tile" href="${t.href}">
      <span class="badge">${t.badge}</span>
      <span class="name">${t.name}</span>
      <span class="stat">${t.desc}</span>
    </a>`,
  ).join("");
}

mountThemeSelect(document.getElementById("theme"));
render();

document.getElementById("reset-all").addEventListener("click", () => {
  if (confirm("Clear all saved trainer/quiz progress and your theme choice?")) {
    clearAll();
    location.reload();
  }
});
