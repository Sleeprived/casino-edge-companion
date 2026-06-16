/* Renders the "How to play at the casino" panel on a game page. The page
   includes <div class="panel howto" id="howto" data-game="blackjack"></div>;
   this fills it with the intro (always shown) and a collapsible step-by-step.
   Content is static data from js/lib/howto-content.js (no user input). */

import { HOWTO } from "../lib/howto-content.js";

const el = document.getElementById("howto");
const game = el && el.dataset.game;
const content = game && HOWTO[game];

if (el && content) {
  el.innerHTML = `
    <h2>New here? How to play ${content.title} at the casino</h2>
    <p class="lead">${content.intro}</p>
    <button class="btn ghost" id="howto-toggle" aria-expanded="false">Show step-by-step ▾</button>
    <div id="howto-body" class="hidden">
      <h3>At the table</h3>
      <ol>${content.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <h3>Tips &amp; etiquette</h3>
      <ul>${content.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
      <p class="hint">${content.pointer}</p>
    </div>`;

  const toggle = document.getElementById("howto-toggle");
  const body = document.getElementById("howto-body");
  toggle.addEventListener("click", () => {
    const open = body.classList.toggle("hidden") === false;
    toggle.textContent = open ? "Hide step-by-step ▴" : "Show step-by-step ▾";
    toggle.setAttribute("aria-expanded", String(open));
  });
}
