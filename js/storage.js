/* Defensive localStorage helpers. Every key is namespaced "casinoedge.". Reads
   tolerate a missing/corrupt/blocked store and fall back to a caller default, so
   private-mode or quota errors degrade to in-memory behavior instead of throwing
   (spec §8, audit-1 m2). */

export const PREFIX = "casinoedge.";

export function getJSON(key, def = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return def;
    return JSON.parse(raw);
  } catch {
    return def;
  }
}

export function setJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* full / blocked / private mode — ignore, app continues */
  }
}

export function getString(key, def = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? def : raw;
  } catch {
    return def;
  }
}

export function setString(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* Wipe every casinoedge.* key (hub "reset all data"). */
export function clearAll() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
