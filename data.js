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
  notes: "Warm-up balls provided. Two sets in pool play. Bracket play 2:00 PM. Each division has its own Gold and Silver. Every team guaranteed 10 sets.",
  officialLink: "",
  phase: "pool",
  bracketPlay: "2:00 PM",
  bracketNote: "Seeds fill after all Division 1 pools finish. D1 Gold Courts 4-5. D1 Silver Court 6."
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
  { round: 5, a: 3, b: 4, ref: 2, result: { tie: true, setsW: 1, setsL: 1 } },
  { round: 6, a: 1, b: 2, ref: 4, result: null }
];
