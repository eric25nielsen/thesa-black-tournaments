window.SQUADS = [
  {
    id: "jh-black",
    name: "THESA JH Black",
    division: "Middle School",
    pool: "R1PA",
    court: "Court 9",
    teams: ["THESA JH Black", "SA Patriots MS A-1", "Kingwood Legacy MS", "Wildfire MSG Orange"],
    matches: [
      { time: "8:00 AM", a: "THESA JH Black", b: "Kingwood Legacy MS", ref: "SA Patriots MS A-1", result: { tie: true, setsW: 1, setsL: 1 } },
      { time: "9:00 AM", a: "SA Patriots MS A-1", b: "Wildfire MSG Orange", ref: "THESA JH Black" },
      { time: "10:00 AM", a: "THESA JH Black", b: "Wildfire MSG Orange", ref: "Kingwood Legacy MS", result: { winner: "THESA JH Black", setsW: 2, setsL: 0 } },
      { time: "11:00 AM", a: "SA Patriots MS A-1", b: "Kingwood Legacy MS", ref: "THESA JH Black" },
      { time: "12:00 PM", a: "Kingwood Legacy MS", b: "Wildfire MSG Orange", ref: "SA Patriots MS A-1" },
      { time: "1:00 PM", a: "THESA JH Black", b: "SA Patriots MS A-1", ref: "Wildfire MSG Orange" }
    ]
  },
  {
    id: "jh-red",
    name: "THESA JH Red",
    division: "Middle School",
    pool: "R1PD",
    court: "Court 5",
    teams: ["THESA JH Red", "DasCHE 14U", "Lonestar Elite MS", "Timberwolves MS Black"],
    matches: [
      { time: "8:00 AM", a: "DasCHE 14U", b: "Timberwolves MS Black", ref: "Lonestar Elite MS" },
      { time: "9:00 AM", a: "Lonestar Elite MS", b: "THESA JH Red", ref: "DasCHE 14U" },
      { time: "10:00 AM", a: "DasCHE 14U", b: "THESA JH Red", ref: "Timberwolves MS Black" },
      { time: "11:00 AM", a: "Lonestar Elite MS", b: "Timberwolves MS Black", ref: "DasCHE 14U" },
      { time: "12:00 PM", a: "Timberwolves MS Black", b: "THESA JH Red", ref: "Lonestar Elite MS" },
      { time: "1:00 PM", a: "DasCHE 14U", b: "Lonestar Elite MS", ref: "THESA JH Red" }
    ]
  },
  {
    id: "jv-black",
    name: "THESA JV Black",
    division: "JV",
    pool: "R1PE",
    court: "Court 4",
    teams: ["THESA JV Black", "FBCHA JV Blue", "Greenville Homeschool Athletics JV", "SA Patriots JV"],
    matches: [
      { time: "8:00 AM", a: "FBCHA JV Blue", b: "SA Patriots JV", ref: "Greenville Homeschool Athletics JV" },
      { time: "9:00 AM", a: "Greenville Homeschool Athletics JV", b: "THESA JV Black", ref: "FBCHA JV Blue" },
      { time: "10:00 AM", a: "FBCHA JV Blue", b: "THESA JV Black", ref: "SA Patriots JV" },
      { time: "11:00 AM", a: "Greenville Homeschool Athletics JV", b: "SA Patriots JV", ref: "FBCHA JV Blue" },
      { time: "12:00 PM", a: "SA Patriots JV", b: "THESA JV Black", ref: "Greenville Homeschool Athletics JV" },
      { time: "1:00 PM", a: "FBCHA JV Blue", b: "Greenville Homeschool Athletics JV", ref: "THESA JV Black" }
    ]
  },
  {
    id: "jv-red",
    name: "THESA JV Red",
    division: "JV",
    pool: "R1PD",
    court: "Court 6",
    teams: ["THESA JV Red", "CHSA JV", "FBCHA JV White", "Austin Royals JV"],
    matches: [
      { time: "8:00 AM", a: "CHSA JV", b: "Austin Royals JV", ref: "FBCHA JV White" },
      { time: "9:00 AM", a: "FBCHA JV White", b: "THESA JV Red", ref: "CHSA JV", result: { winner: "FBCHA JV White", setsW: 2, setsL: 0 } },
      { time: "10:00 AM", a: "CHSA JV", b: "THESA JV Red", ref: "Austin Royals JV" },
      { time: "11:00 AM", a: "FBCHA JV White", b: "Austin Royals JV", ref: "CHSA JV" },
      { time: "12:00 PM", a: "Austin Royals JV", b: "THESA JV Red", ref: "FBCHA JV White" },
      { time: "1:00 PM", a: "CHSA JV", b: "FBCHA JV White", ref: "THESA JV Red" }
    ]
  },
  {
    id: "var",
    name: "THESA Var",
    division: "Varsity",
    pool: "R1PD",
    court: "Court 6",
    teams: ["THESA Var", "SA Patriots Var 1", "FBCHA Var", "Greenville Homeschool Athletics Var"],
    matches: [
      { time: "2:00 PM", a: "SA Patriots Var 1", b: "Greenville Homeschool Athletics Var", ref: "FBCHA Var" },
      { time: "3:00 PM", a: "FBCHA Var", b: "THESA Var", ref: "SA Patriots Var 1" },
      { time: "4:00 PM", a: "SA Patriots Var 1", b: "THESA Var", ref: "Greenville Homeschool Athletics Var" },
      { time: "5:00 PM", a: "FBCHA Var", b: "Greenville Homeschool Athletics Var", ref: "SA Patriots Var 1" },
      { time: "6:00 PM", a: "Greenville Homeschool Athletics Var", b: "THESA Var", ref: "FBCHA Var" },
      { time: "7:00 PM", a: "SA Patriots Var 1", b: "FBCHA Var", ref: "THESA Var" }
    ]
  }
];
window.EVENT = {
  name: "Dallas Angels Classic",
  date: "October 2–3, 2026",
  site: "AES",
  notes: "JH Black split 8:00 with Kingwood 1–1, then beat Wildfire 2–0 at 10:00. They work the 11:00.",
  officialLink: "https://results.advancedeventsystems.com/event/RGFsbGFzX0FuZ2Vsc19DbGFzc2ljXzIwMjY1/divisions/-50016/overview",
  bracketNote: "Saturday bracket posts after Friday pool."
};
