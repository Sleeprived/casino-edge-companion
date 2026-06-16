/* Theme switcher. Neon is default. Stored under casinoedge.theme and applied to
   <html data-theme>. A tiny inline script in each page <head> applies it before
   first paint (no flash); this module is the API the hub switcher uses. */

export const THEMES = [
  { id: "neon", label: "Neon" },
  { id: "dark", label: "Felt Dark" },
  { id: "playful", label: "Daylight" },
];

const KEY = "casinoedge.theme";
const IDS = THEMES.map((t) => t.id);

export function getTheme() {
  let t = null;
  try {
    t = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  return IDS.includes(t) ? t : "neon";
}

export function applyTheme(id) {
  document.documentElement.dataset.theme = IDS.includes(id) ? id : "neon";
}

export function setTheme(id) {
  if (!IDS.includes(id)) return;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
  applyTheme(id);
}

/* Wire a <select> element to the theme system. */
export function mountThemeSelect(select) {
  if (!select) return;
  select.innerHTML = THEMES.map((t) => `<option value="${t.id}">${t.label}</option>`).join("");
  select.value = getTheme();
  select.addEventListener("change", () => setTheme(select.value));
}
