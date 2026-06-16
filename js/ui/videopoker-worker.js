/* Module Web Worker: runs the full-enumeration EV solve off the UI thread
   (spec M2). Imports the exact same pure module the Node tests use. */

import { bestHold, evHold } from "../lib/videopoker.js";

self.onmessage = (e) => {
  const { cards, paytable, userMask } = e.data;
  const best = bestHold(cards, paytable);
  const userEv = userMask ? evHold(cards, userMask, paytable) : null;
  self.postMessage({ best, userEv });
};
