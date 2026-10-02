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
function nextMatch() { return matchesWithResults().find(function (m) { return !m.result; }) || null; }
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
function render() {
  var poolMatches = matchesWithResults();
  var nxt = nextMatch();
  var inBracket = defaultTab() === "bracket";
  document.getElementById("phase").textContent = inBracket ? ("Saturday" + (window.EVENT.bracketPlay ? " · " + window.EVENT.bracketPlay : "")) : ("Pool play · " + (nxt && nxt.time ? nxt.time : ("Round " + (nxt ? nxt.round : poolMatches.length))));
  document.getElementById("teamName").textContent = window.TEAM.name;
  document.getElementById("eventName").textContent = window.EVENT.name;
  document.getElementById("eventMeta").textContent = [window.EVENT.date, window.EVENT.site, window.EVENT.pool, window.EVENT.court, "Start " + window.EVENT.start].filter(Boolean).join(" · ");
  document.getElementById("notes").textContent = window.EVENT.notes || "";
  document.getElementById("bracketNote").textContent = window.EVENT.bracketNote || "";
  var bm = document.getElementById("bracketMatches");
  if (bm) {
    bm.innerHTML = (window.BRACKET && window.BRACKET.length) ? window.BRACKET.map(function (g) {
      var next = g.us && !g.result;
      var res = g.result ? '<div class="result">' + g.result.winner + ' ' + g.result.setsW + '–' + g.result.setsL + '</div>' : '';
      return '<article class="match' + (next ? ' next' : '') + '"><div class="match-top"><span>' + g.label + '</span><span>' + g.time + ' · ' + g.court + '</span></div><div class="vs">' + g.a + ' vs ' + g.b + (g.us ? ' <span class="us-chip">US</span>' : '') + '</div>' + res + '</article>';
    }).join('') : '<p class="hint">Saturday bracket posts after Friday pool.</p>';
  }
  var hero = document.getElementById("nextCard");
  if (!inBracket && nxt) {
    var a = teamById(nxt.a), b = teamById(nxt.b), ref = teamById(nxt.ref);
    var us = (a && a.us) || (b && b.us);
    hero.innerHTML = '<p class="kicker">' + (us ? 'We play next' : 'Next on our court') + ' · ' + window.EVENT.pool + '</p><h1>' + a.name + ' vs ' + b.name + '</h1><p>' + (nxt.time || '') + ' · ' + window.EVENT.court + (ref ? ' · Ref ' + ref.name : '') + '</p>';
  } else if (inBracket) {
    var ours = (window.BRACKET || []).find(function (g) { return g.us && !g.result; });
    hero.innerHTML = ours ? '<p class="kicker">We play next</p><h1>' + ours.a + ' vs ' + ours.b + '</h1><p>' + ours.time + ' · ' + ours.court + '</p>' : '<p class="kicker">Saturday</p><h1>' + (window.EVENT.bracketNote || '') + '</h1>';
  }
  var st = standings();
  document.getElementById("standings").innerHTML = '<table><thead><tr><th>Team</th><th class="num">M</th><th class="num">Sets</th></tr></thead><tbody>' +
    st.map(function (r) {
      var rec = r.mt ? (r.mw + '–' + r.ml + '–' + r.mt) : (r.mw + '–' + r.ml);
      return '<tr class="' + (r.us ? 'us' : '') + '"><td>' + r.name + (r.us ? ' <span class="us-chip">US</span>' : '') + '</td><td class="num">' + rec + '</td><td class="num">' + r.sw + '–' + r.sl + '</td></tr>';
    }).join('') + '</tbody></table>';
  document.getElementById("matches").innerHTML = poolMatches.slice().sort(function (x, y) {
    if (!x.result && y.result) return -1;
    if (x.result && !y.result) return 1;
    return x.result ? y.round - x.round : x.round - y.round;
  }).map(function (m) {
    var a = teamById(m.a), b = teamById(m.b), ref = teamById(m.ref);
    var res = m.result ? '<div class="result">' + matchLabel(m) + '</div>' : '';
    var us = (a && a.us) || (b && b.us);
    return '<article class="match' + (!m.result && us ? ' next' : '') + '"><div class="match-top"><span>' + (m.time || ('Rd ' + m.round)) + '</span><span>Ref ' + (ref ? ref.name : '') + '</span></div><div class="vs">' + a.name + ' vs ' + b.name + (us ? ' <span class="us-chip">US</span>' : '') + '</div>' + res + '</article>';
  }).join('');
}
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Clear scores saved on this phone?')) { localStorage.removeItem(STORE_KEY); render(); showTab(defaultTab()); }
});
document.getElementById('shareBtn').addEventListener('click', async function () {
  var n = nextMatch();
  var text = n ? (teamById(n.a).name + ' vs ' + teamById(n.b).name + ' ' + (n.time || '') + ' ' + window.EVENT.court) : window.TEAM.name;
  try { await navigator.clipboard.writeText(text); } catch (e) { prompt('Copy:', text); }
});
document.getElementById('tabPool').addEventListener('click', function () { showTab('pool'); });
document.getElementById('tabBracket').addEventListener('click', function () { showTab('bracket'); });
document.getElementById('tabRot').addEventListener('click', function () { showTab('rot'); });
render();
showTab(defaultTab());
if (window.initRotations) window.initRotations();
