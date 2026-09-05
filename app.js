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
    if (m.result.tie) {
      a.mt += 1; b.mt += 1;
      a.sw += 1; a.sl += 1; b.sw += 1; b.sl += 1;
      return;
    }
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
function ourRole(m) {
  var us = window.TEAMS.find(function (t) { return t.us; });
  if (!us) return "";
  if (m.a === us.id || m.b === us.id) return "PLAY";
  if (m.ref === us.id) return "REF";
  return "";
}
function defaultTab() {
  var forced = ((window.EVENT.phase || "") + "").toLowerCase();
  if (forced === "bracket" || poolComplete()) return "bracket";
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
  var poolDone = poolComplete();
  var inBracket = defaultTab() === "bracket";
  var phaseEl = document.getElementById("phase");
  if (inBracket) phaseEl.textContent = "Bracket play" + (window.EVENT.bracketPlay ? " · " + window.EVENT.bracketPlay : "");
  else phaseEl.textContent = "Pool play · Round " + (nxt ? nxt.round : poolMatches.length) + " of " + poolMatches.length;
  document.getElementById("teamName").textContent = window.TEAM.name;
  document.getElementById("eventName").textContent = window.EVENT.name;
  document.getElementById("eventMeta").textContent = [window.EVENT.date, window.EVENT.site, window.EVENT.division, window.EVENT.pool, window.EVENT.court, "Doors " + window.EVENT.doors, "Start " + window.EVENT.start].join(" · ");
  document.getElementById("notes").textContent = window.EVENT.notes || "";
  document.getElementById("bracketNote").textContent = (window.EVENT.bracketPlay ? "Bracket play " + window.EVENT.bracketPlay + ". " : "") + (window.EVENT.bracketNote || "");
  var hero = document.getElementById("nextCard");
  if (poolDone || inBracket) {
    hero.innerHTML = '<p class="kicker">Bracket play</p><h1>' + (window.EVENT.bracketNote || "Seeds and courts after pools lock") + '</h1><p>' + (window.EVENT.bracketPlay ? "Starts " + window.EVENT.bracketPlay : "") + '</p>';
  } else {
    var a = teamById(nxt.a), b = teamById(nxt.b), ref = teamById(nxt.ref), role = ourRole(nxt);
    var kick = role === "PLAY" ? "We play next" : role === "REF" ? "We referee next" : "Up next";
    hero.innerHTML = '<p class="kicker">' + kick + ' · Pool round ' + nxt.round + ' of ' + poolMatches.length + '</p><h1>' + a.name + ' vs ' + b.name + '</h1><p>Ref ' + ref.name + (role ? ' <span class="us-chip">' + role + '</span>' : '') + '</p>';
  }
  var st = standings();
  document.getElementById("standings").innerHTML = '<table><thead><tr><th>Team</th><th class="num">M</th><th class="num">Sets</th></tr></thead><tbody>' +
    st.map(function (r) {
      var rec = r.mt ? (r.mw + '–' + r.ml + '–' + r.mt) : (r.mw + '–' + r.ml);
      return '<tr class="' + (r.us ? 'us' : '') + '"><td>' + r.name + (r.us ? ' <span class="us-chip">US</span>' : '') + '</td><td class="num">' + rec + '</td><td class="num">' + r.sw + '–' + r.sl + '</td></tr>';
    }).join('') + '</tbody></table>';
  var listed = poolMatches.slice().sort(function (x, y) {
    var xDone = x.result ? 1 : 0, yDone = y.result ? 1 : 0;
    if (xDone !== yDone) return xDone - yDone;
    if (!xDone) return x.round - y.round;
    return y.round - x.round;
  });
  document.getElementById("matches").innerHTML = listed.map(function (m) {
    var a = teamById(m.a), b = teamById(m.b), ref = teamById(m.ref), role = ourRole(m);
    var isNext = nxt && nxt.round === m.round;
    var res = m.result ? '<div class="result">' + matchLabel(m) + '</div>' : '';
    return '<article class="match ' + (m.result ? 'done ' : '') + (isNext ? 'next' : '') + '" data-round="' + m.round + '"><div class="match-top"><span>Rd ' + m.round + (isNext ? ' · NEXT' : '') + '</span><span>Ref ' + ref.name + (role ? ' · ' + role : '') + '</span></div><div class="vs">' + a.name + ' vs ' + b.name + '</div>' + res + '</article>';
  }).join('');
  document.querySelectorAll('.match').forEach(function (el) {
    el.addEventListener('click', function () { openSheet(Number(el.dataset.round)); });
  });
}
function openSheet(round) {
  var m = matchesWithResults().find(function (x) { return x.round === round; });
  if (!m) return;
  var a = teamById(m.a), b = teamById(m.b);
  document.getElementById('sheetTitle').textContent = 'Rd ' + round + ': ' + a.name + ' vs ' + b.name;
  document.getElementById('sheetActions').innerHTML =
    '<button data-w="' + a.id + '" data-sw="2" data-sl="0">' + a.name + ' 2–0</button>' +
    '<button data-w="' + b.id + '" data-sw="2" data-sl="0">' + b.name + ' 2–0</button>' +
    '<button data-tie="1">Split 1–1</button>' +
    '<button class="ghost" data-clear="1">Clear this match</button>';
  document.getElementById('sheet').classList.remove('hidden');
  document.querySelectorAll('#sheetActions button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var over = loadOverrides();
      if (btn.dataset.clear) over[String(round)] = null;
      else if (btn.dataset.tie) over[String(round)] = { tie: true, setsW: 1, setsL: 1 };
      else over[String(round)] = { winner: Number(btn.dataset.w), setsW: Number(btn.dataset.sw), setsL: Number(btn.dataset.sl) };
      saveOverrides(over);
      document.getElementById('sheet').classList.add('hidden');
      render();
      showTab(defaultTab());
    });
  });
}
document.getElementById('sheetCancel').addEventListener('click', function () { document.getElementById('sheet').classList.add('hidden'); });
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Clear scores saved on this phone and reload data.js?')) { localStorage.removeItem(STORE_KEY); render(); showTab(defaultTab()); }
});
document.getElementById('shareBtn').addEventListener('click', async function () {
  var st = standings(); var nxt = nextMatch();
  var lines = [window.TEAM.name + ' — ' + window.EVENT.name, window.EVENT.pool + ' · ' + window.EVENT.court, '', 'Standings:'].concat(st.map(function (r) { return r.name + ': ' + r.mw + '-' + r.ml + (r.mt ? '-' + r.mt : '') + ' matches, ' + r.sw + '-' + r.sl + ' sets'; }));
  if (nxt) lines.push('', 'Next: ' + teamById(nxt.a).name + ' vs ' + teamById(nxt.b).name + ' (ref ' + teamById(nxt.ref).name + ')');
  else lines.push('', 'Pool complete.');
  var text = lines.join('\n');
  try { await navigator.clipboard.writeText(text); document.getElementById('shareBtn').textContent = 'Copied'; setTimeout(function () { document.getElementById('shareBtn').textContent = 'Copy update text'; }, 1500); }
  catch (e) { prompt('Copy this update:', text); }
});
document.getElementById('tabPool').addEventListener('click', function () { showTab('pool'); });
document.getElementById('tabBracket').addEventListener('click', function () { showTab('bracket'); });
render();
showTab(defaultTab());
