const STORE_KEY = "thesa-black:" + ((window.EVENT && window.EVENT.name) || "event") + ":" + ((window.EVENT && window.EVENT.date) || "");
function teamById(id) { return window.TEAMS.find(function (t) { return t.id === id; }); }
function loadOverrides() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { return {}; } }
function matchesWithResults() {
  var over = loadOverrides();
  return window.MATCHES.map(function (m) {
    var copy = Object.assign({}, m);
    copy.result = over[String(m.round)] !== undefined ? over[String(m.round)] : m.result;
    return copy;
  });
}
function minutes(t) {
  if (!t) return null;
  var m = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  var h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}
function nowMinutes() {
  var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  var h = 0, min = 0;
  parts.forEach(function (p) {
    if (p.type === "hour") h = Number(p.value);
    if (p.type === "minute") min = Number(p.value);
  });
  return h * 60 + min;
}
function standings() {
  var rows = window.TEAMS.map(function (t) { return Object.assign({}, t, { mw: 0, ml: 0, mt: 0, sw: 0, sl: 0 }); });
  var byId = {};
  rows.forEach(function (r) { byId[r.id] = r; });
  matchesWithResults().forEach(function (m) {
    if (!m.result) return;
    var a = byId[m.a], b = byId[m.b];
    if (!a || !b) return;
    if (m.result.tie) { a.mt += 1; b.mt += 1; a.sw += 1; a.sl += 1; b.sw += 1; b.sl += 1; return; }
    var w = byId[m.result.winner];
    var l = byId[m.result.winner === m.a ? m.b : m.a];
    if (!w || !l) return;
    w.mw += 1; l.ml += 1;
    w.sw += m.result.setsW; w.sl += m.result.setsL;
    l.sw += m.result.setsL; l.sl += m.result.setsW;
  });
  rows.sort(function (x, y) { return y.mw - x.mw || y.sw - x.sw || x.sl - y.sl || x.id - y.id; });
  return rows;
}
function openMatches() { return matchesWithResults().filter(function (m) { return !m.result; }); }
function currentMatch() {
  var now = nowMinutes();
  var open = openMatches();
  var started = open.filter(function (m) { return minutes(m.time) != null && minutes(m.time) <= now; });
  return started.length ? started[started.length - 1] : null;
}
function upcomingMatch() {
  var cur = currentMatch();
  var open = openMatches();
  if (!cur) return open[0] || null;
  return open.find(function (m) { return m.round > cur.round; }) || null;
}
function wePlay(m) { if (!m) return false; var a = teamById(m.a), b = teamById(m.b); return !!((a && a.us) || (b && b.us)); }
function weRef(m) { if (!m) return false; var r = teamById(m.ref); return !!(r && r.us); }
function poolComplete() { return matchesWithResults().every(function (m) { return m.result; }); }
function defaultTab() {
  var hasBracket = window.BRACKET && window.BRACKET.length;
  if (hasBracket && (((window.EVENT.phase || "") + "").toLowerCase() === "bracket" || poolComplete())) return "bracket";
  return "pool";
}
function showTab(name) {
  document.getElementById("tabPool").classList.toggle("on", name === "pool");
  document.getElementById("tabBracket").classList.toggle("on", name === "bracket");
  document.getElementById("tabRot").classList.toggle("on", name === "rot");
  document.getElementById("panelPool").classList.toggle("hidden", name !== "pool");
  document.getElementById("panelBracket").classList.toggle("hidden", name !== "bracket");
  document.getElementById("panelRot").classList.toggle("hidden", name !== "rot");
  document.getElementById("nextCard").classList.toggle("hidden", name === "rot");
}
function matchLabel(m) {
  if (!m.result) return "";
  if (m.result.tie) return "Split 1–1";
  var w = teamById(m.result.winner);
  return (w ? w.name : "") + " " + m.result.setsW + "–" + m.result.setsL;
}
function cardHtml(m, kicker) {
  var a = teamById(m.a), b = teamById(m.b), ref = teamById(m.ref);
  return '<p class="kicker">' + kicker + '</p><h1>' + a.name + ' vs ' + b.name + (weRef(m) ? ' <span class="ref-chip">WE REF</span>' : '') + '</h1><p>' + (m.time || '') + ' · ' + window.EVENT.court + (ref ? ' · Ref ' + ref.name : '') + '</p>';
}
function render() {
  var poolMatches = matchesWithResults();
  var cur = currentMatch();
  var up = upcomingMatch();
  var inBracket = defaultTab() === "bracket";
  document.getElementById("phase").textContent = inBracket ? "Saturday" : (cur ? ((weRef(cur) ? "We are reffing" : "In progress") + " · " + cur.time) : (up ? ("Up next · " + up.time) : "Pool complete"));
  document.getElementById("teamName").textContent = window.TEAM.name;
  document.getElementById("eventName").textContent = window.EVENT.name;
  document.getElementById("eventMeta").textContent = [window.EVENT.date, window.EVENT.site, window.EVENT.pool, window.EVENT.court, "Start " + window.EVENT.start].filter(Boolean).join(" · ");
  document.getElementById("notes").textContent = window.EVENT.notes || "";
  document.getElementById("bracketNote").textContent = window.EVENT.bracketNote || "";
  var bm = document.getElementById("bracketMatches");
  if (bm) bm.innerHTML = '<p class="hint">Saturday bracket posts after Friday pool.</p>';
  var hero = document.getElementById("nextCard");
  if (!inBracket && cur) {
    var after = up ? '<p style="margin-top:8px">Next: ' + teamById(up.a).name + ' vs ' + teamById(up.b).name + ' · ' + up.time + (weRef(up) ? ' · we ref' : '') + '</p>' : '';
    hero.innerHTML = cardHtml(cur, wePlay(cur) ? 'On the court now' : (weRef(cur) ? 'We are reffing now' : 'On our court now')) + after;
  } else if (!inBracket && up) {
    hero.innerHTML = cardHtml(up, wePlay(up) ? 'We play next' : (weRef(up) ? 'We ref next' : 'Next on our court'));
  }
  var st = standings();
  document.getElementById("standings").innerHTML = '<table><thead><tr><th>Team</th><th class="num">M</th><th class="num">Sets</th></tr></thead><tbody>' +
    st.map(function (r) {
      var rec = r.mt ? (r.mw + '–' + r.ml + '–' + r.mt) : (r.mw + '–' + r.ml);
      return '<tr class="' + (r.us ? 'us' : '') + '"><td>' + r.name + (r.us ? ' <span class="us-chip">US</span>' : '') + '</td><td class="num">' + rec + '</td><td class="num">' + r.sw + '–' + r.sl + '</td></tr>';
    }).join('') + '</tbody></table>';
  document.getElementById("matches").innerHTML = poolMatches.slice().sort(function (x, y) { return x.round - y.round; }).map(function (m) {
    var a = teamById(m.a), b = teamById(m.b), ref = teamById(m.ref);
    var res = m.result ? '<div class="result">' + matchLabel(m) + '</div>' : '';
    var tag = '';
    if (!m.result && cur && m.round === cur.round) tag = 'NOW';
    else if (!m.result && up && m.round === up.round) tag = 'NEXT';
    return '<article class="match' + (tag ? ' next' : '') + (weRef(m) ? ' work' : '') + '"><div class="match-top"><span>' + (m.time || '') + (tag ? ' · ' + tag : '') + '</span><span>' + (weRef(m) ? 'WE REF' : ('Ref ' + (ref ? ref.name : ''))) + '</span></div><div class="vs">' + a.name + ' vs ' + b.name + (wePlay(m) ? ' <span class="us-chip">US</span>' : '') + (weRef(m) ? ' <span class="ref-chip">WE REF</span>' : '') + '</div>' + res + '</article>';
  }).join('');
}
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Clear scores saved on this phone?')) { localStorage.removeItem(STORE_KEY); render(); showTab(defaultTab()); }
});
document.getElementById('shareBtn').addEventListener('click', async function () {
  var c = currentMatch();
  var text = c ? ('Now: ' + teamById(c.a).name + ' vs ' + teamById(c.b).name + ' ' + c.time) : window.TEAM.name;
  try { await navigator.clipboard.writeText(text); } catch (e) { prompt('Copy:', text); }
});
document.getElementById('tabPool').addEventListener('click', function () { showTab('pool'); });
document.getElementById('tabBracket').addEventListener('click', function () { showTab('bracket'); });
document.getElementById('tabRot').addEventListener('click', function () { showTab('rot'); });
render();
showTab(defaultTab());
setInterval(render, 60000);
if (window.initRotations) window.initRotations();
