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
  var blocks = [
    ["Gold", [
      ["Match 1", "8:00 AM", "Court 2", "Seed 9 vs Seed 8", "Ref seed 5"],
      ["Match 2", "8:00 AM", "Court 5", "Seed 7 vs Seed 10", "Ref seed 6"],
      ["Match 3", "9:00 AM", "Court 2", "Seed 5 vs Seed 4", "Ref loser of Match 1"],
      ["Match 4", "9:00 AM", "Court 5", "Seed 3 vs Seed 6", "Ref loser of Match 2"],
      ["Match 5", "10:00 AM", "Court 2", "Loser of Match 1 vs loser of Match 3", "Ref loser of Match 3"],
      ["Match 6", "11:00 AM", "Court 5", "Loser of Match 2 vs loser of Match 4", "Ref loser of Match 8"],
      ["Match 7", "11:00 AM", "Court 2", "Seed 1 vs winner of Match 1", "Ref loser of Match 5"],
      ["Match 8", "10:00 AM", "Court 5", "Winner of Match 2 vs Seed 2", "Ref loser of Match 4"],
      ["Match 9", "12:00 PM", "Court 2", "Winner of Match 7 vs winner of Match 3", "Ref loser of Match 7"],
      ["Match 10", "12:00 PM", "Court 5", "Winner of Match 4 vs winner of Match 8", "Ref loser of Match 6"],
      ["Match 11", "1:00 PM", "Court 2", "Winner of Match 9 vs winner of Match 10", "Ref loser of Match 9"]
    ]],
    ["Silver", [
      ["Match 1", "2:00 PM", "Court 5", "3rd-place seed 5 vs seed 4", "Ref seed 3"],
      ["Match 2", "4:00 PM", "Court 5", "3rd-place seed 1 vs winner of Match 1", "Ref loser of Match 3"],
      ["Match 3", "3:00 PM", "Court 5", "3rd-place seed 3 vs seed 2", "Ref loser of Match 1"],
      ["Match 4", "6:00 PM", "Court 5", "Winner of Match 2 vs winner of Match 3", "Ref loser of Match 5"],
      ["Match 5", "5:00 PM", "Court 5", "Loser of Match 1 vs loser of Match 3", "Ref loser of Match 2"]
    ]],
    ["Bronze", [
      ["Match 1", "3:00 PM", "Court 2", "4th-place seed 5 vs seed 4", "Ref seed 3"],
      ["Match 2", "5:00 PM", "Court 2", "4th-place seed 1 vs winner of Match 1", "Ref loser of Match 3"],
      ["Match 3", "4:00 PM", "Court 2", "4th-place seed 3 vs seed 2", "Ref loser of Match 1"],
      ["Match 4", "7:00 PM", "Court 2", "Winner of Match 2 vs winner of Match 3", "Ref loser of Match 5"],
      ["Match 5", "6:00 PM", "Court 2", "Loser of Match 1 vs loser of Match 3", "Ref loser of Match 2"]
    ]]
  ];
  var html = "<article class=\"match next\"><p class=\"kicker\">Next game</p><div class=\"vs\">Silver</div><div class=\"result\">2:00 PM · Court 5</div><p class=\"hint\">JH Black finished 3rd. This is the first silver match.</p></article>";
  blocks.forEach(function (block) {
    html += "<h2>" + block[0] + "</h2>";
    block[1].forEach(function (m) {
      html += "<article class=\"match\"><div class=\"match-top\"><span>" + m[0] + " · " + m[1] + "</span><span>" + m[2] + "</span></div><div class=\"vs\">" + m[3] + "</div><div class=\"result\">" + m[4] + "</div></article>";
    });
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
    standings(list).map(function (r) {
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
