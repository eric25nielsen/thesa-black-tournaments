var PICK_KEY = "thesa:squad";
function squad() {
  var id = localStorage.getItem(PICK_KEY) || "jh-black";
  return window.SQUADS.find(function (s) { return s.id === id; }) || window.SQUADS[0];
}
function minutes(t) {
  var m = String(t || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  var h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}
function nowMinutes() {
  var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  var h = 0, min = 0;
  parts.forEach(function (p) { if (p.type === "hour") h = Number(p.value); if (p.type === "minute") min = Number(p.value); });
  return h * 60 + min;
}
function matches() {
  return squad().matches.map(function (m, i) { return Object.assign({}, m, { i: i, result: m.result || null }); });
}
function wePlay(m) { return m.a === squad().name || m.b === squad().name; }
function weRef(m) { return m.ref === squad().name; }
function opp(m) { return m.a === squad().name ? m.b : m.a; }
function currentMatch(list) {
  var now = nowMinutes();
  var open = list.filter(function (m) { return !m.result; });
  var started = open.filter(function (m) { return minutes(m.time) != null && minutes(m.time) <= now; });
  return started.length ? started[started.length - 1] : null;
}
function upcoming(list, cur) {
  var open = list.filter(function (m) { return !m.result; });
  if (!cur) return open[0] || null;
  return open.find(function (m) { return m.i > cur.i; }) || null;
}
function resultText(m) {
  if (!m.result) return "";
  if (m.result.tie) return "Split 1\u20131";
  return m.result.winner + " " + m.result.setsW + "\u2013" + m.result.setsL;
}
function standings(list) {
  var rows = {};
  squad().teams.forEach(function (n) { rows[n] = { name: n, mw: 0, ml: 0, mt: 0, sw: 0, sl: 0, us: n === squad().name }; });
  list.forEach(function (m) {
    if (!m.result) return;
    var a = rows[m.a], b = rows[m.b];
    if (!a || !b) return;
    if (m.result.tie) { a.mt++; b.mt++; a.sw++; a.sl++; b.sw++; b.sl++; return; }
    var w = rows[m.result.winner], lname = m.result.winner === m.a ? m.b : m.a, l = rows[lname];
    if (!w || !l) return;
    w.mw++; l.ml++;
    w.sw += m.result.setsW; w.sl += m.result.setsL;
    l.sw += m.result.setsL; l.sl += m.result.setsW;
  });
  return Object.keys(rows).map(function (k) { return rows[k]; }).sort(function (a, b) {
    return b.mw - a.mw || b.sw - a.sw || b.sl - a.sl;
  });
}
function rec(r) { return r.mt ? (r.mw + "\u2013" + r.ml + "\u2013" + r.mt) : (r.mw + "\u2013" + r.ml); }
function paths(list) {
  var row = standings(list).find(function (r) { return r.us; });
  var left = list.filter(function (m) { return wePlay(m) && !m.result; });
  var n = left.length;
  if (!row) return "";
  if (!n) return "<p class=\"hint\">Pool matches are done. Record " + rec(row) + ", sets " + row.sw + "\u2013" + row.sl + ".</p>";
  function line(title, mw, ml, mt, sw, sl) {
    return "<article class=\"match\"><div class=\"vs\">" + title + "</div><div class=\"result\">" + mw + "\u2013" + ml + (mt ? "\u2013" + mt : "") + " matches \u00b7 " + sw + "\u2013" + sl + " sets</div></article>";
  }
  var games = left.map(function (m) { return m.time + " vs " + opp(m); }).join(", ");
  var win = n === 1 ? "Win the last one 2\u20130" : "Win the rest 2\u20130";
  var split = n === 1 ? "Split the last one" : "Split the rest";
  var lose = n === 1 ? "Lose the last one 0\u20132" : "Lose the rest 0\u20132";
  return "<p class=\"hint\">Still to play: " + games + ". Each match is two sets, so win, split, or loss.</p>" +
    line(win, row.mw + n, row.ml, row.mt, row.sw + n * 2, row.sl) +
    line(split, row.mw, row.ml, row.mt + n, row.sw + n, row.sl + n) +
    line(lose, row.mw, row.ml + n, row.mt, row.sw, row.sl + n * 2);
}

function saturday() {
  var s = squad();
  if (s.division !== "Middle School") {
    return "<p class=\"hint\">Bracket seating is posted for middle school. Other divisions stay on pool results until those pools are complete.</p>";
  }
  var games = [
    ["Gold 1", "8:00 AM", "Court 2", "Kingwood vs HSAA Red", "2nd seeds 9 and 8"],
    ["Gold 2", "8:00 AM", "Court 5", "DasCHE 14U vs Greenville", "2nd seeds 7 and 10"],
    ["Gold 3", "9:00 AM", "Court 2", "Noah Jaguars vs Houston Mavericks", "1st seed 5 vs 1st seed 4"],
    ["Gold 4", "9:00 AM", "Court 5", "Lonestar vs DasCHE 12U", "1st seed 3 vs 2nd seed 6"],
    ["Gold 7", "11:00 AM", "Court 2", "HSAA Blue vs winner of Kingwood/HSAA Red", "1st seed"],
    ["Gold 8", "10:00 AM", "Court 5", "Winner of DasCHE 14U/Greenville vs Patriots", "1st seed"],
    ["Silver 1", "2:00 PM", "Court 5", "Timberwolves Blue vs FBCHA Blue", "3rd seeds 5 and 4"],
    ["Silver 3", "3:00 PM", "Court 5", "JH Black vs Timberwolves Black", "3rd seeds 3 and 2"],
    ["Silver 2", "4:00 PM", "Court 5", "Tyler Heat vs winner of Timberwolves Blue/FBCHA", "3rd seed 1"],
    ["Bronze 1", "3:00 PM", "Court 2", "Lubbock vs Aggieland Silver", "4th seeds"],
    ["Bronze 3", "4:00 PM", "Court 2", "Wildfire vs Aggieland Black", "4th seeds"],
    ["Bronze 2", "5:00 PM", "Court 2", "JH Red vs winner of Lubbock/Aggieland Silver", "4th seed"]
  ];
  var html = "<p class=\"hint\">Seated from pool finish, then AES point percentage. 1sts are seeds 1–5, 2nds are 6–10. Same rule inside silver and bronze.</p>";
  games.forEach(function (g) {
    var ours = g[3].indexOf("JH Black") >= 0 || g[3].indexOf("JH Red") >= 0;
    if (s.id === "jh-black") ours = g[3].indexOf("JH Black") >= 0;
    if (s.id === "jh-red") ours = g[3].indexOf("JH Red") >= 0;
    html += "<article class=\"match" + (ours ? " next" : "") + "\"><div class=\"match-top\"><span>" + g[0] + " · " + g[1] + "</span><span>" + g[2] + "</span></div><div class=\"vs\">" + g[3] + (ours ? " <span class=\"us-chip\">US</span>" : "") + "</div><div class=\"result\">" + g[4] + "</div></article>";
  });
  return html;
}

function fillPicker() {
  var sel = document.getElementById("teamPick");
  var s = squad();
  sel.innerHTML = window.SQUADS.map(function (q) {
    return "<option value=\"" + q.id + "\"" + (q.id === s.id ? " selected" : "") + ">" + q.name + "</option>";
  }).join("");
}
function render() {
  var s = squad();
  var list = matches();
  var cur = currentMatch(list);
  var up = upcoming(list, cur);
  document.getElementById("teamName").textContent = s.name;
  document.getElementById("eventName").textContent = window.EVENT.name;
  document.getElementById("eventMeta").textContent = [window.EVENT.date, s.division, s.pool, s.court].join(" \u00b7 ");
  document.getElementById("phase").textContent = cur ? ((weRef(cur) ? "We are reffing" : "In progress") + " \u00b7 " + cur.time) : (up ? ("Up next \u00b7 " + up.time) : "Pool complete");
  var notes = document.getElementById("notes");
  if (notes) notes.textContent = window.EVENT.notes;
  var bn = document.getElementById("bracketNote");
  if (bn) bn.textContent = window.EVENT.bracketNote;
  var hero = document.getElementById("nextCard");
  var focus = cur || up;
  if (focus) {
    var kicker = cur ? (wePlay(cur) ? "On the court now" : (weRef(cur) ? "We are reffing now" : "On our court now")) : (wePlay(up) ? "We play next" : (weRef(up) ? "We ref next" : "Next on our court"));
    var after = cur && up ? "<p style=\"margin-top:8px\">Next: " + up.a + " vs " + up.b + " \u00b7 " + up.time + (weRef(up) ? " \u00b7 we ref" : "") + "</p>" : "";
    hero.innerHTML = "<p class=\"kicker\">" + kicker + "</p><h1>" + focus.a + " vs " + focus.b + (weRef(focus) ? " <span class=\"ref-chip\">WE REF</span>" : "") + "</h1><p>" + focus.time + " \u00b7 " + s.court + " \u00b7 Ref " + focus.ref + "</p>" + after;
  }
  var ranked = standings(list);
  if (squad().id === "jh-black" && list.every(function (m) { return m.result; })) {
    var order = ["SA Patriots MS A-1", "Kingwood Legacy MS", "THESA JH Black", "Wildfire MSG Orange"];
    ranked = order.map(function (n, i) {
      var row = ranked.find(function (r) { return r.name === n; });
      row.place = i + 1;
      return row;
    });
  }
  document.getElementById("standings").innerHTML = "<table><thead><tr><th></th><th>Team</th><th class=\"num\">M</th><th class=\"num\">Sets</th></tr></thead><tbody>" +
    ranked.map(function (r) {
      return "<tr class=\"" + (r.us ? "us" : "") + "\"><td>" + (r.place || "") + "</td><td>" + r.name + (r.us ? " <span class=\"us-chip\">US</span>" : "") + "</td><td class=\"num\">" + rec(r) + "</td><td class=\"num\">" + r.sw + "\u2013" + r.sl + "</td></tr>";
    }).join("") + "</tbody></table>";
  var pathEl = document.getElementById("paths");
  if (pathEl) pathEl.innerHTML = paths(list);
  var sat = document.getElementById("bracketMatches");
  if (sat) sat.innerHTML = saturday();
  document.getElementById("matches").innerHTML = list.map(function (m) {
    var tag = !m.result && cur && m.i === cur.i ? "NOW" : (!m.result && up && m.i === up.i ? "NEXT" : "");
    var res = m.result ? "<div class=\"result\">" + resultText(m) + "</div>" : "";
    return "<article class=\"match" + (tag ? " next" : "") + (weRef(m) ? " work" : "") + "\"><div class=\"match-top\"><span>" + m.time + (tag ? " \u00b7 " + tag : "") + "</span><span>" + (weRef(m) ? "WE REF" : ("Ref " + m.ref)) + "</span></div><div class=\"vs\">" + m.a + " vs " + m.b + (wePlay(m) ? " <span class=\"us-chip\">US</span>" : "") + (weRef(m) ? " <span class=\"ref-chip\">WE REF</span>" : "") + "</div>" + res + "</article>";
  }).join("");
}
document.getElementById("teamPick").addEventListener("change", function (e) {
  localStorage.setItem(PICK_KEY, e.target.value);
  render();
});
function poolDone(list) { return list.length && list.every(function (m) { return m.result; }); }
fillPicker();
render();
setTimeout(function () { if (poolDone(matches()) && window.show) window.show("bracket"); }, 50);
setInterval(render, 60000);
setTimeout(render, 400);
if (window.initRotations) window.initRotations();
