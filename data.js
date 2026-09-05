window.TEAM = { name: "THESA Black", tag: "THESA Riders" };
window.EVENT = {
  name: "Rattlers Middle School Classic",
  date: "September 5, 2026",
  site: "Fieldhouse",
  division: "Division 1",
  pool: "Pool 1",
  court: "Court 4",
  doors: "7:00 AM",
  start: "8:00 AM",
  format: "2 games to 25, no cap",
  notes: "Official live sheet: Pool 1 finished. THESA Black 4th in pool, D1 Silver. Next: 3:00 PM Court 6 vs SWC 1.",
  officialLink: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkU0EFX-1haozmkmlMe4UFc2LtF4y5fwwV8j6dphksmIBMCUyr063lv9Q5_OO_J4XEWJ9inhDHtH94/pubhtml?gid=1887933325&single=true",
  phase: "bracket",
  bracketPlay: "2:00 PM",
  bracketNote: "D1 Silver Court 6. THESA Black is seed 11. Semifinal vs SWC 1 at 3:00 PM."
};
window.TEAMS = [
  { id: 1, name: "RRR Black" },
  { id: 2, name: "THESA Black", us: true },
  { id: 3, name: "HSAA Blue" },
  { id: 4, name: "Lone Star" }
];
window.MATCHES = [
  { round: 1, a: 1, b: 3, ref: 2, result: { winner: 3, setsW: 2, setsL: 0 } },
  { round: 2, a: 2, b: 4, ref: 1, result: { winner: 4, setsW: 2, setsL: 0 } },
  { round: 3, a: 1, b: 4, ref: 3, result: { winner: 4, setsW: 2, setsL: 0 } },
  { round: 4, a: 2, b: 3, ref: 1, result: { winner: 3, setsW: 2, setsL: 0 } },
  { round: 5, a: 3, b: 4, ref: 2, result: { winner: 4, setsW: 2, setsL: 0 } },
  { round: 6, a: 1, b: 2, ref: 4, result: { tie: true, setsW: 1, setsL: 1 } }
];
window.BRACKET = [
  { id: "SF1", label: "Silver SF1", time: "2:00 PM", court: "Court 6", a: "RRR Black", b: "NTHAA", us: false, result: null },
  { id: "SF2", label: "Silver SF2", time: "3:00 PM", court: "Court 6", a: "SWC 1", b: "THESA Black", us: true, result: null },
  { id: "3P", label: "3rd place", time: "4:00 PM", court: "Court 6", a: "Loser SF1", b: "Loser SF2", us: false, result: null },
  { id: "F", label: "Silver final", time: "5:00 PM", court: "Court 6", a: "Winner SF1", b: "Winner SF2", us: false, result: null }
];
