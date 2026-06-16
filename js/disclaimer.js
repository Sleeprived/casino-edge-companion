/* Injects the always-on responsible-play disclaimer at the foot of every page
   (spec §2). Importing this module is all a page needs. */

const TEXT = `<strong>This reduces the house edge — it does not give you an edge.</strong>
Every game here still favors the casino over time. Use this to play smarter and
lose slower, not to "beat the house." Gamble responsibly, only with money you can
afford to lose. Problem gambling? Call 1-800-GAMBLER (1-800-426-2537).`;

function mount() {
  if (document.querySelector(".disclaimer")) return;
  const el = document.createElement("footer");
  el.className = "disclaimer";
  el.innerHTML = TEXT;
  document.body.appendChild(el);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
