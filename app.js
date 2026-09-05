const STORE_KEY = "thesa-black:" + ((window.EVENT && window.EVENT.name) || "event") + ":" + ((window.EVENT && window.EVENT.date) || "");
function teamById(id) { return window.TEAMS.find(function (t) { return t.id === id; }); }
function loadOverrides() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { return {}; } }
function saveOverrides(map) { localStorage.setItem(STORE_KEY, JSON.stringify(map)); }
function matchesWithResults() {
  var over = loadOverrides();
  return window.MATCHES.map(function (m) {
    var key = String(m.round);
    var copy = Object.assign({}, m);
    copy.result = over[key] !== undefined ? over[key] : m.result;
    return copy;
  });
}
function standings() {
  var rows = window.TEAMS.map(function (t) { return Object.assign({}, t, { mw: 0, ml: 0, sw: 0, sl: 0 }); });
  var byId = {};
  rows.forEach(function (r) { byId[r.id] = r; });
  matchesWithResults().forEach(function (m) {
    if (!m.result) return;
    var w = byId[m.result.winner];
    var l = byId[m.result.winner === m.a ? m.b : m.a];
    if (!w || !l) return;
    w.mw += 1; l.ml += 1;
    w.sw += m.result.setsW; w.sl += m.result.setsL;
    l.sw += m.result.setsL; l.sl += m.result.setsW;
  });
  rows.sort(function (a, b) { return b.mw - a.mw || b.sw - a.sw || a.sl - b.sl || a.id - b.id; });
  return rows;
}
function nextMatch() { return matchesWithResults().find(function (m) { return !m.result; }) || null; }
function ourRole(m) {
  var us = window.TEAMS.find(function (t) { return t.us; });
  if (!us) return "";
  if (m.a === us.id || m.b === us.id) return "PLAY";
  if (m.ref === us.id) return "REF";
  return "";
}
function render() {
  var poolMatches = matchesWithResults();
  var nxt = nextMatch();
  var poolDone = poolMatches.every(function (m) { return m.result; });
  var forced = ((window.EVENT.phase || "") + "").toLowerCase();
  var inBracket = forced === "bracket" || (forced !== "pool" && poolDone);
  var phaseEl = document.getElementById("phase");
  if (inBracket) phaseEl.textContent = "Bracket play" + (window.EVENT.bracketPlay ? " · " + window.EVENT.bracketPlay : "");
  else phaseEl.textContent = "Pool play · Round " + (nxt ? nxt.round : poolMatches.length) + " of " + poolMatches.length;
  document.getElementById("teamName").textContent = window.TEAM.name;
  document.getElementById("eventName").textContent = window.EVENT.name;
  document.getElementById("eventMeta").textContent = [window.EVENT.date, window.EVENT.site, window.EVENT.division, window.EVENT.pool, window.EVENT.court, "Doors " + window.EVENT.doors, "Start " + window.EVENT.start].join(" · ");
  document.getElementById("notes").textContent = window.EVENT.notes || "";
  document.getElementById("bracketNote").textContent = (window.EVENT.bracketPlay ? "Bracket play " + window.EVENT.bracketPlay + ". " : "") + (window.EVENT.bracketNote || "");
  var hero = document.getElementById("nextCard");
  if (inBracket) {
    hero.innerHTML = '<p class="kicker">Bracket play</p><h1>' + (window.EVENT.bracketNote || "Seeds and courts after pools lock") + '</h1><p>' + (window.EVENT.bracketPlay ? "Starts " + window.EVENT.bracketPlay : "") + '</p>';
  } else if (!nxt) {
    hero.innerHTML = '<p class="kicker">Pool complete</p><h1>Waiting on bracket seeds</h1><p>' + (window.EVENT.bracketNote || "") + '</p>';
  } else {
    var a = teamById(nxt.a), b = teamById(nxt.b), ref = teamById(nxt.ref), role = ourRole(nxt);
    var kick = role === "PLAY" ? "We play next" : role === "REF" ? "We referee next" : "Up next";
    hero.innerHTML = '<p class="kicker">' + kick + ' · Pool round ' + nxt.round + ' of ' + poolMatches.length + '</p><h1>' + a.name + ' vs ' + b.name + '</h1><p>Ref ' + ref.name + (role ? ' <span class="us-chip">' + role + '</span>' : '') + '</p>';
  }
  var st = standings();
  document.getElementById("standings").innerHTML = '<table><thead><tr><th>Team</th><th class="num">M</th><th class="num">Sets</th></tr></thead><tbody>' +
    st.map(function (r) {
      return '<tr class="' + (r.us ? 'us' : '') + '"><td>' + r.name + (r.us ? ' <span class="us-chip">US</span>' : '') + '</td><td class="num">' + r.mw + '–' + r.ml + '</td><td class="num">' + r.sw + '–' + r.sl + '</td></tr>';
    }).join('') + '</tbody></table>';
  document.getElementById("matches").innerHTML = poolMatches.map(function (m) {
    var a = teamById(m.a), b = teamById(m.b), ref = teamById(m.ref), role = ourRole(m);
    var isNext = nxt && nxt.round === m.round;
    var res = m.result ? '<div class="result">' + teamById(m.result.winner).name + ' ' + m.result.setsW + '–' + m.result.setsL + '</div>' : '';
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
    '<button data-w="' + a.id + '" data-sw="2" data-sl="1">' + a.name + ' 2–1</button>' +
    '<button data-w="' + b.id + '" data-sw="2" data-sl="0">' + b.name + ' 2–0</button>' +
    '<button data-w="' + b.id + '" data-sw="2" data-sl="1">' + b.name + ' 2–1</button>' +
    '<button class="ghost" data-clear="1">Clear this match</button>';
  document.getElementById('sheet').classList.remove('hidden');
  document.querySelectorAll('#sheetActions button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var over = loadOverrides();
      if (btn.dataset.clear) over[String(round)] = null;
      else over[String(round)] = { winner: Number(btn.dataset.w), setsW: Number(btn.dataset.sw), setsL: Number(btn.dataset.sl) };
      saveOverrides(over);
      document.getElementById('sheet').classList.add('hidden');
      render();
    });
  });
}
document.getElementById('sheetCancel').addEventListener('click', function () { document.getElementById('sheet').classList.add('hidden'); });
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Clear scores saved on this phone and reload data.js?')) { localStorage.removeItem(STORE_KEY); render(); }
});
document.getElementById('shareBtn').addEventListener('click', async function () {
  var st = standings(); var nxt = nextMatch();
  var lines = [window.TEAM.name + ' — ' + window.EVENT.name, window.EVENT.pool + ' · ' + window.EVENT.court, '', 'Standings:'].concat(st.map(function (r) { return r.name + ': ' + r.mw + '-' + r.ml + ' matches, ' + r.sw + '-' + r.sl + ' sets'; }));
  if (nxt) lines.push('', 'Next: ' + teamById(nxt.a).name + ' vs ' + teamById(nxt.b).name + ' (ref ' + teamById(nxt.ref).name + ')');
  else lines.push('', 'Pool complete.');
  var text = lines.join('\n');
  try { await navigator.clipboard.writeText(text); document.getElementById('shareBtn').textContent = 'Copied'; setTimeout(function () { document.getElementById('shareBtn').textContent = 'Copy update text'; }, 1500); }
  catch (e) { prompt('Copy this update:', text); }
});
render();
