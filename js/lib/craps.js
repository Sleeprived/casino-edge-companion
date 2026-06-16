/* Craps bet reference data.
   Source: Wizard of Odds craps house-edge tables (last verified 2026-06-15).

   Two kinds of bet:
   - recomputable: carries `total` + `outcomes` (ways, net pay per unit) so the
     test suite re-derives the house edge from first principles and confirms the
     stored `houseEdgePct` — the oracle is independent of the stored number.
   - sourced: pass/come/odds depend on the full point model; their edges are
     transcribed published constants (recomputable:false) and the test only
     asserts they are present and within published bounds.

   net pay per unit: a win returns +ratio (e.g. 7/6), a loss returns -1.
   edge% = -100 * sum(ways * pay) / total. */

export const TRAP_THRESHOLD_PCT = 5;

const r = (num, den) => num / den;

const RAW = [
  {
    id: "pass",
    name: "Pass Line",
    group: "line",
    payoutText: "1:1",
    houseEdgePct: 1.41,
    recomputable: false,
    source: "Wizard of Odds",
    note: "The baseline good bet. Back it with free odds to lower your overall edge.",
  },
  {
    id: "dontpass",
    name: "Don't Pass",
    group: "line",
    payoutText: "1:1",
    houseEdgePct: 1.36,
    recomputable: false,
    source: "Wizard of Odds",
    note: "Very slightly better than Pass; you bet with the house.",
  },
  {
    id: "come",
    name: "Come",
    group: "line",
    payoutText: "1:1",
    houseEdgePct: 1.41,
    recomputable: false,
    source: "Wizard of Odds",
    note: "Pass Line applied to the next roll once a point is established.",
  },
  {
    id: "dontcome",
    name: "Don't Come",
    group: "line",
    payoutText: "1:1",
    houseEdgePct: 1.36,
    recomputable: false,
    source: "Wizard of Odds",
    note: "Don't Pass applied after a point is established.",
  },
  {
    id: "odds",
    name: "Free Odds (behind the line)",
    group: "line",
    payoutText: "true odds",
    houseEdgePct: 0.0,
    recomputable: false,
    source: "Wizard of Odds",
    note: "The only zero-edge bet on the table. Always take/lay max odds.",
  },
  {
    id: "place6or8",
    name: "Place 6 or 8",
    group: "place",
    payoutText: "7:6",
    total: 11,
    outcomes: [
      { ways: 5, pay: r(7, 6) },
      { ways: 6, pay: -1 },
    ],
    houseEdgePct: 1.52,
    note: "The best of the place bets.",
  },
  {
    id: "place5or9",
    name: "Place 5 or 9",
    group: "place",
    payoutText: "7:5",
    total: 10,
    outcomes: [
      { ways: 4, pay: r(7, 5) },
      { ways: 6, pay: -1 },
    ],
    houseEdgePct: 4.0,
  },
  {
    id: "place4or10",
    name: "Place 4 or 10",
    group: "place",
    payoutText: "9:5",
    total: 9,
    outcomes: [
      { ways: 3, pay: r(9, 5) },
      { ways: 6, pay: -1 },
    ],
    houseEdgePct: 6.67,
  },
  {
    id: "field",
    name: "Field (2 pays 2:1, 12 pays 3:1)",
    group: "oneRoll",
    payoutText: "1:1 (2x on 2, 3x on 12)",
    total: 36,
    outcomes: [
      { ways: 1, pay: 2 }, // the 2
      { ways: 1, pay: 3 }, // the 12
      { ways: 14, pay: 1 }, // 3,4,9,10,11
      { ways: 20, pay: -1 }, // 5,6,7,8
    ],
    houseEdgePct: 2.78,
    note: "Edge swings with the casino's 2/12 rule. Paying 2x on both 2 and 12 makes it 5.56%.",
  },
  {
    id: "big6or8",
    name: "Big 6 or Big 8",
    group: "place",
    payoutText: "1:1",
    total: 11,
    outcomes: [
      { ways: 5, pay: 1 },
      { ways: 6, pay: -1 },
    ],
    houseEdgePct: 9.09,
    note: "Same bet as Place 6/8 but pays even money — strictly worse. Place it instead.",
  },
  {
    id: "hard6or8",
    name: "Hard 6 or Hard 8",
    group: "hardway",
    payoutText: "9:1",
    total: 11,
    outcomes: [
      { ways: 1, pay: 9 },
      { ways: 10, pay: -1 },
    ],
    houseEdgePct: 9.09,
  },
  {
    id: "hard4or10",
    name: "Hard 4 or Hard 10",
    group: "hardway",
    payoutText: "7:1",
    total: 9,
    outcomes: [
      { ways: 1, pay: 7 },
      { ways: 8, pay: -1 },
    ],
    houseEdgePct: 11.11,
  },
  {
    id: "any7",
    name: "Any Seven",
    group: "oneRoll",
    payoutText: "4:1",
    total: 36,
    outcomes: [
      { ways: 6, pay: 4 },
      { ways: 30, pay: -1 },
    ],
    houseEdgePct: 16.67,
    note: "The worst bet on the table.",
  },
  {
    id: "anycraps",
    name: "Any Craps (2, 3, 12)",
    group: "oneRoll",
    payoutText: "7:1",
    total: 36,
    outcomes: [
      { ways: 4, pay: 7 },
      { ways: 32, pay: -1 },
    ],
    houseEdgePct: 11.11,
  },
  {
    id: "twoOr12",
    name: "2 or 12 (snake eyes / boxcars)",
    group: "oneRoll",
    payoutText: "30:1",
    total: 36,
    outcomes: [
      { ways: 1, pay: 30 },
      { ways: 35, pay: -1 },
    ],
    houseEdgePct: 13.89,
  },
  {
    id: "threeOr11",
    name: "3 or 11",
    group: "oneRoll",
    payoutText: "15:1",
    total: 36,
    outcomes: [
      { ways: 2, pay: 15 },
      { ways: 34, pay: -1 },
    ],
    houseEdgePct: 11.11,
  },
];

/* Re-derive house edge from the outcomes table (independent oracle). */
export function recomputeEdgePct(bet) {
  if (!bet.outcomes) return null;
  const ev = bet.outcomes.reduce((s, o) => s + o.ways * o.pay, 0) / bet.total;
  return -100 * ev;
}

export const CRAPS_BETS = RAW.map((b) => ({
  ...b,
  trap: b.houseEdgePct >= TRAP_THRESHOLD_PCT,
}));

export function getBet(id) {
  return CRAPS_BETS.find((b) => b.id === id) || null;
}
