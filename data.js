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
  notes: "THESA Black won Silver SF 2-0 over SWC 1. RRR Black won SF1 and beat THESA 2-1 in the Silver final. Silver finish: 2nd.",
  officialLink: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkU0EFX-1haozmkmlMe4UFc2LtF4y5fwwV8j6dphksmIBMCUyr063lv9Q5_OO_J4XEWJ9inhDHtH94/pubhtml?gid=1887933325&single=true",
  liveCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkU0EFX-1haozmkmlMe4UFc2LtF4y5fwwV8j6dphksmIBMCUyr063lv9Q5_OO_J4XEWJ9inhDHtH94/pub?gid=1887933325&single=true&output=csv",
  phase: "bracket",
  bracketPlay: "Final",
  bracketNote: "D1 Silver complete. RRR Black champion. THESA Black 2nd (lost final 2-1)."
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
  { id: "SF1", label: "Silver SF1", time: "2:00 PM", court: "Court 6", a: "RRR Black", b: "NTHAA", us: false, result: { winner: "RRR Black", setsW: 2, setsL: 0 } },
  { id: "SF2", label: "Silver SF2", time: "3:00 PM", court: "Court 6", a: "SWC 1", b: "THESA Black", us: true, result: { winner: "THESA Black", setsW: 2, setsL: 0 } },
  { id: "3P", label: "3rd place", time: "4:00 PM", court: "Court 6", a: "NTHAA", b: "SWC 1", us: false, result: null },
  { id: "F", label: "Silver final", time: "5:00 PM", court: "Court 6", a: "RRR Black", b: "THESA Black", us: true, result: { winner: "RRR Black", setsW: 2, setsL: 1 } }
];
window.SILVER_POOL = [
  { seed: 9, name: "RRR Black", pool: "Pool 1", finish: 3, sw: 1, sl: 5, pf: 101, pa: 133, us: false },
  { seed: 10, name: "SWC 1", pool: "Pool 2", finish: 4, sw: 1, sl: 5, pf: 92, pa: 144, us: false },
  { seed: 11, name: "THESA Black", pool: "Pool 1", finish: 4, sw: 1, sl: 5, pf: 81, pa: 149, us: true },
  { seed: 12, name: "NTHAA", pool: "Pool 3", finish: 4, sw: 0, sl: 6, pf: 69, pa: 150, us: false }
];
window.OTHER_POOLS = [
  {
    title: "Pool 2 · Court 5 — SWC 1 came from here",
    rows: [
      { name: "TCA Blue", sw: 6, sl: 0, pf: 150, pa: 52, finish: 1, highlight: false },
      { name: "FCA FM 1", sw: 3, sl: 3, pf: 111, pa: 123, finish: 2, highlight: false },
      { name: "JCSA (A)", sw: 2, sl: 4, pf: 104, pa: 138, finish: 3, highlight: false },
      { name: "SWC 1", sw: 1, sl: 5, pf: 92, pa: 144, finish: 4, highlight: true }
    ]
  },
  {
    title: "Pool 3 · Court 6 — NTHAA came from here",
    rows: [
      { name: "FWC Black", sw: 6, sl: 0, pf: 150, pa: 88, finish: 1, highlight: false },
      { name: "Legacy 8th", sw: 4, sl: 2, pf: 139, pa: 89, finish: 2, highlight: false },
      { name: "Founders Corinth", sw: 2, sl: 4, pf: 101, pa: 132, finish: 3, highlight: false },
      { name: "NTHAA", sw: 0, sl: 6, pf: 69, pa: 150, finish: 4, highlight: true }
    ]
  }
];
