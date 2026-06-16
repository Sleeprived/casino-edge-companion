/* Dev-only import smoke for the browser UI modules. Stubs just enough of the DOM
   (a permissive Proxy element, localStorage, Worker) to import each page module
   and run its setup code, catching runtime errors that `node --check` cannot.
   Not shipped behavior; run with: node tools/smoke-ui.mjs */

function makeFake() {
  return new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === "children") return [];
      if (prop === "dataset" || prop === "style") return {};
      if (prop === "classList")
        return { toggle() {}, contains() { return false; }, add() {}, remove() {} };
      if (prop === "value" || prop === "textContent" || prop === "innerHTML" || prop === "className")
        return "";
      if (prop === "disabled") return false;
      if (prop === Symbol.iterator) return [][Symbol.iterator].bind([]);
      return makeFake();
    },
    set() { return true; },
    apply() { return makeFake(); },
  });
}

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

globalThis.document = {
  getElementById: () => makeFake(),
  createElement: () => makeFake(),
  querySelector: () => makeFake(),
  querySelectorAll: () => [],
  addEventListener: () => {},
  readyState: "complete",
  documentElement: { dataset: {} },
  body: makeFake(),
};

globalThis.Worker = class {
  constructor() {}
  postMessage() {}
  terminate() {}
};
globalThis.confirm = () => true;
globalThis.location = { reload() {} };

const modules = [
  "../js/hub.js",
  "../js/ui/blackjack.js",
  "../js/ui/videopoker.js",
  "../js/ui/craps.js",
  "../js/ui/roulette.js",
  "../js/ui/baccarat.js",
  "../js/ui/cheatsheet.js",
];

let failed = 0;
for (const m of modules) {
  try {
    await import(m);
    console.log("ok  ", m);
  } catch (e) {
    failed++;
    console.log("FAIL", m, "\n   ", e.message);
  }
}
console.log(failed ? `\n${failed} module(s) threw on import` : "\nall UI modules imported and ran setup cleanly");
process.exit(failed ? 1 : 0);
