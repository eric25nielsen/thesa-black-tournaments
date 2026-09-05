const STORE_KEY = "thesa-black:" + ((window.EVENT && window.EVENT.name) || "event") + ":" + ((window.EVENT && window.EVENT.date) || "");
function teamById(id) { return window.TEAMS.find(function (t) { return t.id === id; }); }
function loadOverrides() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { return {}; } }
function saveOverrides(map) { localStorage.setItem(STORE_KEY, JSON.stringify(map)); }
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
  if (((window.EVENT.phase || "") + "").toLowerCase() === "bracket" || poolComplete()) return "bracket";
  return "pool";
}
function showTab(name) {
  var pool = name !== "bracket";
  document.getElementById("tabPool").classList.toggle("on", pool);
  document.getElementById("tabBracket").classList.toggle("on", !pool);
  document.getElementById("panelPool").classList.toggle("hidden", !pool);
  document.getElementById("panelBracket").classList.toggle("hidden", pool);
}
function matchLabel(m) {
  if (!m.result) return "";
  if (m.result.tie) return "Split 1–1";
  return teamById(m.result.winner).name + " " + m.result.setsW + "–" + m.result.setsL;
}
function render() {
  var poolMatches = matchesWithResults();
  var nxt = nextMatch();
  var inBracket = defaultTab() === "bracket";
  document.getElementById("phase").textContent = inBracket ? ("Bracket play" + (window.EVENT.bracketPlay ? " · " + window.EVENT.bracketPlay : "")) : ("Pool play · Round " + (nxt ? nxt.round : poolMatches.length) + " of " + poolMatches.length);
  document.getElementById("teamName").textContent = window.TEAM.name;
  document.getElementById("eventName").textContent = window.EVENT.name;
  document.getElementById("eventMeta").textContent = [window.EVENT.date, window.EVENT.site, window.EVENT.division, window.EVENT.pool, "Doors " + window.EVENT.doors, "Start " + window.EVENT.start].join(" · ");
  document.getElementById("notes").textContent = window.EVENT.notes || "";
  document.getElementById("bracketNote").textContent = window.EVENT.bracketNote || "";
  var bm = document.getElementById("bracketMatches");
  if (bm && window.BRACKET) {
    bm.innerHTML = window.BRACKET.map(function (g) {
      return '<article class="match' + (g.us ? ' next' : '') + '"><div class="match-top"><span>' + g.label + '</span><span>' + g.time + ' · ' + g.court + '</span></div><div class="vs">' + g.a + ' vs ' + g.b + (g.us ? ' <span class="us-chip">US</span>' : '') + '</div></article>';
    }).join('');
  }
  var hero = document.getElementById("nextCard");
  var ours = (window.BRACKET || []).find(function (g) { return g.us && !g.result; });
  if (inBracket && ours) {
    hero.innerHTML = '<p class="kicker">We play next · D1 Silver</p><h1>' + ours.a + ' vs ' + ours.b + '</h1><p>' + ours.time + ' · ' + ours.court + '</p>';
  } else if (inBracket) {
    hero.innerHTML = '<p class="kicker">Bracket play</p><h1>' + (window.EVENT.bracketNote || '') + '</h1>';
  } else {
    var a = teamById(nxt.a), b = teamById(nxt.b);
    hero.innerHTML = '<p class="kicker">Pool</p><h1>' + a.name + ' vs ' + b.name + '</h1>';
  }
  var st = standings();
  document.getElementById("standings").innerHTML = '<table><thead><tr><th>Team</th><th class="num">M</th><th class="num">Sets</th></tr></thead><tbody>' +
    st.map(function (r) {
      var rec = r.mt ? (r.mw + '–' + r.ml + '–' + r.mt) : (r.mw + '–' + r.ml);
      return '<tr class="' + (r.us ? 'us' : '') + '"><td>' + r.name + (r.us ? ' <span class="us-chip">US</span>' : '') + '</td><td class="num">' + rec + '</td><td class="num">' + r.sw + '–' + r.sl + '</td></tr>';
    }).join('') + '</tbody></table>';
  document.getElementById("matches").innerHTML = poolMatches.slice().sort(function (x, y) { return y.round - x.round; }).map(function (m) {
    var a = teamById(m.a), b = teamById(m.b);
    var res = m.result ? '<div class="result">' + matchLabel(m) + '</div>' : '';
    return '<article class="match"><div class="match-top"><span>Rd ' + m.round + '</span></div><div class="vs">' + a.name + ' vs ' + b.name + '</div>' + res + '</article>';
  }).join('');
}
document.getElementById('sheetCancel').addEventListener('click', function () { document.getElementById('sheet').classList.add('hidden'); });
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Clear scores saved on this phone?')) { localStorage.removeItem(STORE_KEY); render(); showTab(defaultTab()); }
});
document.getElementById('shareBtn').addEventListener('click', async function () {
  var text = window.TEAM.name + ' vs SWC 1 — D1 Silver 3:00 PM Court 6';
  try { await navigator.clipboard.writeText(text); } catch (e) { prompt('Copy:', text); }
});
document.getElementById('tabPool').addEventListener('click', function () { showTab('pool'); });
document.getElementById('tabBracket').addEventListener('click', function () { showTab('bracket'); });
render();
showTab(defaultTab());
