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

function card(title, detail, ours) {
  return "<article class=\"match" + (ours ? " next" : "") + "\"><div class=\"vs\">" + title + "</div><div class=\"result\">" + detail + "</div></article>";
}
function openBoard(title, cols) {
  var html = "<div class=\"board-bar\"><strong>" + title + "</strong><button type=\"button\" id=\"closeBoard\">Close</button></div><div class=\"board-scroll\"><div class=\"board\">";
  cols.forEach(function (col) {
    html += "<div class=\"col\">";
    col.forEach(function (slot) {
      html += "<div class=\"slot" + (slot.us ? " us" : "") + "\"><b>" + slot.t + "</b><span>" + slot.a + "</span><span>" + slot.b + "</span></div>";
    });
    html += "</div>";
  });
  html += "</div></div>";
  var el = document.getElementById("board");
  el.innerHTML = html;
  el.classList.remove("hidden");
  document.getElementById("closeBoard").onclick = function () { el.classList.add("hidden"); };
}
function saturday() {
  var id = squad().id;
  var boards = {
    "jh-black": {
      title: "Silver",
      next: ["3:00 PM · Court 5", "Timberwolves Black"],
      win: "6:00 PM, Court 5, vs winner of Tyler Heat's match",
      loss: "5:00 PM, Court 5, vs loser of the 2:00",
      note: "Ref the 2:00 on Court 5 first",
      cols: [
        [{ t: "2:00 Court 5", a: "Timberwolves Blue", b: "FBCHA Blue" }, { t: "3:00 Court 5", a: "JH Black", b: "Timberwolves Black", us: true }],
        [{ t: "4:00 Court 5", a: "Tyler Heat", b: "Not set yet" }, { t: "5:00 Court 5", a: "Not set yet", b: "Loser of 2:00 vs loser of 3:00" }],
        [{ t: "6:00 Court 5", a: "Not set yet", b: "Winners of 4:00 and 3:00", us: true }]
      ]
    },
    "jh-red": {
      title: "Bronze",
      next: ["5:00 PM · Court 2", "Winner of Lubbock / Aggieland Silver"],
      win: "7:00 PM, Court 2",
      loss: "No second game posted",
      cols: [
        [{ t: "3:00 Court 2", a: "Lubbock", b: "Aggieland Silver" }, { t: "4:00 Court 2", a: "Wildfire", b: "Aggieland Black" }],
        [{ t: "5:00 Court 2", a: "Not set yet", b: "Winner of 3:00" }],
        [{ t: "7:00 Court 2", a: "Not set yet", b: "Winners of earlier matches" }]
      ]
    },
    "jv-black": {
      title: "Gold",
      next: ["9:00 AM · Court 7", "FBCHA JV White"],
      win: "12:00 PM, Court 7",
      loss: "11:00 AM, Court 7, vs loser of the 8:00",
      note: "Ref the 8:00 on Court 7 first",
      cols: [
        [{ t: "8:00 Court 7", a: "HSAA JV Red", b: "2nd Pool C" }, { t: "8:00 Court 8", a: "CHSA", b: "Aggieland JV" }, { t: "9:00 Court 7", a: "JV Black", b: "FBCHA White", us: true }, { t: "9:00 Court 8", a: "1st Pool C", b: "FBCHA Blue" }],
        [{ t: "10:00 Court 7", a: "DasCHE JV", b: "Winner 8:00" }, { t: "10:00 Court 8", a: "Winner 8:00 Ct 8", b: "Tyler Heat" }, { t: "11:00 Court 7", a: "Not set yet", b: "Losers of 8:00 and 9:00" }],
        [{ t: "12:00 Court 7", a: "Not set yet", b: "Winners of earlier matches", us: true }, { t: "1:00 Court 7", a: "Not set yet", b: "Winners of the 12:00 matches" }]
      ]
    },
    "jv-red": {
      title: "Bronze",
      next: ["4:00 PM · Court 7", "4th place, Pool C"],
      win: "7:00 PM, Court 7",
      loss: "6:00 PM, Court 7, vs loser of the 3:00",
      cols: [
        [{ t: "3:00 Court 7", a: "Wildfire JV", b: "HCYA" }, { t: "4:00 Court 7", a: "4th Pool C", b: "JV Red", us: true }],
        [{ t: "5:00 Court 7", a: "Patriots JV", b: "Not set yet" }, { t: "6:00 Court 7", a: "Not set yet", b: "Losers of 3:00 and 4:00" }],
        [{ t: "7:00 Court 7", a: "Not set yet", b: "Winners of earlier matches", us: true }]
      ]
    }
  };
  var p = boards[id];
  if (!p) return "<p class=\"hint\">No bracket assignment yet. Varsity pool has not started.</p>";
  var html = "<article class=\"match next\" id=\"openBoard\"><p class=\"kicker\">Next game · tap for bracket</p><div class=\"vs\">" + p.next[1] + "</div><div class=\"result\">" + p.next[0] + "</div></article>";
  html += "<article class=\"match\"><div class=\"vs\">If we win</div><div class=\"result\">" + p.win + "</div></article>";
  html += "<article class=\"match\"><div class=\"vs\">If we lose</div><div class=\"result\">" + p.loss + "</div></article>";
  if (p.note) html += "<p class=\"hint\">" + p.note + "</p>";
  setTimeout(function () {
    var card = document.getElementById("openBoard");
    if (card) card.onclick = function () { openBoard(p.title, p.cols); };
  }, 0);
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
