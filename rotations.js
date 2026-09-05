(function () {
  var KEY = "thesa-black:rotations";
  var ROLES = { S1: "#9e1b32", S2: "#c9a227", OH: "#f7f7f7", MB: "#7a1a28", L: "#8a8a8a" };

  function load() {
    try {
      return Object.assign({ rot: 1, serving: true, names: defaultNames() }, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch (e) {
      return { rot: 1, serving: true, names: defaultNames() };
    }
  }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
  function defaultNames() {
    return { S1: "S1", S2: "S2", OH1: "OH1", OH2: "OH2", MB: "MB", L: "Libero" };
  }
  function rolesFor(rot) {
    var orig = { 1: "S1", 2: "OH1", 3: "MB", 4: "S2", 5: "OH2", 6: "MB" };
    function step(z) { return { 1: 6, 6: 5, 5: 4, 4: 3, 3: 2, 2: 1 }[z]; }
    var now = {};
    Object.keys(orig).forEach(function (start) {
      var z = +start;
      for (var i = 0; i < rot - 1; i++) z = step(z);
      now[z] = orig[start];
    });
    [1, 5, 6].forEach(function (z) { if (now[z] === "MB") now[z] = "L"; });
    return now;
  }
  function activeSetter(rot) { return rot <= 3 ? "S1" : "S2"; }
  function frontSetter(rot) { return rot <= 3 ? "S2" : "S1"; }
  function color(role) {
    if (role === "OH1" || role === "OH2") return ROLES.OH;
    return ROLES[role] || ROLES.OH;
  }
  function short(role) {
    if (role === "OH1" || role === "OH2") return "OH";
    if (role === "L") return "L";
    return role;
  }
  function textColor(role) {
    if (role === "OH1" || role === "OH2" || role === "S2") return "#111";
    return "#fff";
  }
  function labelFor(role, names) {
    names = names || defaultNames();
    return names[role] || short(role);
  }

  var ZONE = { 4: [18, 20], 3: [50, 20], 2: [82, 20], 5: [18, 76], 6: [50, 76], 1: [82, 76] };

  function courtSvg(spots, arrow, names) {
    var parts = [];
    parts.push('<svg viewBox="0 0 100 100" class="court-svg" aria-hidden="true">');
    parts.push('<defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#c9a227"/></marker></defs>');
    parts.push('<rect x="3" y="3" width="94" height="94" rx="2" fill="#0b0b0b" stroke="#9e1b32" stroke-width="1.6"/>');
    parts.push('<rect x="3" y="3" width="94" height="5" fill="#9e1b32"/>');
    parts.push('<text x="50" y="7" text-anchor="middle" font-size="3.4" font-weight="800" fill="#c9a227">NET</text>');
    parts.push('<line x1="3" y1="36" x2="97" y2="36" stroke="#c9a227" stroke-width="1" stroke-dasharray="2.4 1.6"/>');
    parts.push('<text x="50" y="34" text-anchor="middle" font-size="3" fill="#c9a227">10 FT</text>');
    [4, 3, 2].forEach(function (z, i) {
      parts.push('<text x="' + [18, 50, 82][i] + '" y="12" text-anchor="middle" font-size="4.2" fill="#c9a227" font-weight="700">' + z + '</text>');
    });
    [5, 6, 1].forEach(function (z, i) {
      parts.push('<text x="' + [18, 50, 82][i] + '" y="97" text-anchor="middle" font-size="4.2" fill="#8a8a8a" font-weight="700">' + z + '</text>');
    });
    if (arrow) {
      parts.push('<line x1="' + arrow[0] + '" y1="' + arrow[1] + '" x2="' + arrow[2] + '" y2="' + arrow[3] + '" stroke="#c9a227" stroke-width="1.6" marker-end="url(#arr)"/>');
    }
    spots.forEach(function (s) {
      parts.push('<circle cx="' + s.x + '" cy="' + s.y + '" r="7.4" fill="' + color(s.role) + '" stroke="#c9a227" stroke-width="0.7"/>');
      parts.push('<text x="' + s.x + '" y="' + (s.y + 1.5) + '" text-anchor="middle" font-size="4.2" font-weight="800" fill="' + textColor(s.role) + '">' + short(s.role) + '</text>');
      parts.push('<text x="' + s.x + '" y="' + (s.y + 12.2) + '" text-anchor="middle" font-size="3.3" font-weight="700" fill="#f3c6ce">' + (s.tag || labelFor(s.role, names)) + '</text>');
    });
    parts.push('</svg>');
    return parts.join('');
  }

  function beforeServe(rot) {
    var roles = rolesFor(rot);
    return [4, 3, 2, 5, 6, 1].map(function (z) {
      return { x: ZONE[z][0], y: ZONE[z][1], role: roles[z], tag: z === 1 ? "SERVER" : "" };
    });
  }
  function baseSpots(rot) {
    var s = activeSetter(rot), fs = frontSetter(rot);
    return [
      { x: 18, y: 20, role: "OH1" },
      { x: 50, y: 20, role: "MB" },
      { x: 82, y: 20, role: fs },
      { x: 18, y: 76, role: "L" },
      { x: 50, y: 76, role: "OH2" },
      { x: 82, y: 76, role: s }
    ];
  }
  function receiveSpots(rot) {
    var s = activeSetter(rot), fs = frontSetter(rot);
    if (rot === 1 || rot === 4) {
      return [
        { x: 18, y: 20, role: fs },
        { x: 50, y: 20, role: "MB" },
        { x: 18, y: 72, role: "OH2", tag: "PASS" },
        { x: 50, y: 74, role: "L", tag: "PASS" },
        { x: 78, y: 66, role: "OH1", tag: "PASS" },
        { x: 88, y: 80, role: s }
      ];
    }
    if (rot === 2 || rot === 5) {
      return [
        { x: 50, y: 16, role: fs },
        { x: 50, y: 32, role: s },
        { x: 82, y: 16, role: "MB" },
        { x: 18, y: 72, role: "OH1", tag: "PASS" },
        { x: 50, y: 76, role: "L", tag: "PASS" },
        { x: 82, y: 72, role: "OH2", tag: "PASS" }
      ];
    }
    return [
      { x: 18, y: 16, role: "MB" },
      { x: 82, y: 16, role: fs },
      { x: 18, y: 70, role: "OH2", tag: "PASS" },
      { x: 28, y: 82, role: s },
      { x: 50, y: 74, role: "L", tag: "PASS" },
      { x: 82, y: 72, role: "OH1", tag: "PASS" }
    ];
  }
  function afterReceive(rot) {
    var s = activeSetter(rot), fs = frontSetter(rot);
    return [
      { x: 18, y: 20, role: "OH1" },
      { x: 50, y: 20, role: "MB" },
      { x: 82, y: 20, role: fs },
      { x: 18, y: 76, role: "L" },
      { x: 50, y: 76, role: "OH2" },
      { x: 68, y: 36, role: s, tag: "SET" }
    ];
  }
  function setterArrow(rot) {
    if (rot === 1 || rot === 4) return [82, 76, 68, 36];
    if (rot === 2 || rot === 5) return [50, 32, 68, 36];
    return [28, 82, 68, 36];
  }

  function renderTracker(state) {
    var s = activeSetter(state.rot);
    var phase = state.serving ? "Our serve" : "Receive";
    document.getElementById("rotNum").textContent = "Rotation " + state.rot;
    document.getElementById("rotMeta").textContent = s + " sets  ·  " + phase;
    document.getElementById("serveChip").classList.toggle("on", state.serving);
    document.getElementById("recvChip").classList.toggle("on", !state.serving);
    var wrap = document.getElementById("rotBoards");
    var n = state.names;
    if (state.serving) {
      wrap.innerHTML =
        card("Before serve", courtSvg(beforeServe(state.rot), null, n)) +
        card("After serve → base", courtSvg(baseSpots(state.rot), null, n));
    } else {
      wrap.innerHTML =
        card("Before receive", courtSvg(receiveSpots(state.rot), null, n)) +
        card("After receive", courtSvg(afterReceive(state.rot), setterArrow(state.rot), n));
    }
    var names = state.names || defaultNames();
    ["S1", "S2", "OH1", "OH2", "MB", "L"].forEach(function (k) {
      var el = document.getElementById("name" + k);
      if (el && document.activeElement !== el) el.value = names[k] || "";
    });
  }
  function card(title, svg) {
    return '<article class="rot-card"><h3>' + title + "</h3>" + svg + "</article>";
  }

  function allSix(names) {
    var html = "";
    for (var r = 1; r <= 6; r++) {
      var s = activeSetter(r);
      html += '<details class="rot-all"' + (r === 1 ? " open" : "") + "><summary>Rotation " + r + " — " + s + " sets</summary>";
      html += '<div class="rot-grid">';
      html += card("Before serve", courtSvg(beforeServe(r), null, names));
      html += card("After serve (base)", courtSvg(baseSpots(r), null, names));
      html += card("Before receive", courtSvg(receiveSpots(r), null, names));
      html += card("After receive", courtSvg(afterReceive(r), setterArrow(r), names));
      html += "</div></details>";
    }
    document.getElementById("rotAll").innerHTML = html;
  }

  window.initRotations = function () {
    var state = load();
    function persist() { save(state); renderTracker(state); allSix(state.names); }
    document.getElementById("rotPrev").onclick = function () {
      state.rot = state.rot === 1 ? 6 : state.rot - 1;
      persist();
    };
    document.getElementById("rotNext").onclick = function () {
      state.rot = state.rot === 6 ? 1 : state.rot + 1;
      persist();
    };
    document.getElementById("sideOut").onclick = function () {
      state.rot = state.rot === 6 ? 1 : state.rot + 1;
      state.serving = !state.serving;
      persist();
    };
    document.getElementById("weScored").onclick = function () { persist(); };
    document.getElementById("serveChip").onclick = function () { state.serving = true; persist(); };
    document.getElementById("recvChip").onclick = function () { state.serving = false; persist(); };
    document.getElementById("rotReset").onclick = function () {
      state.rot = 1; state.serving = true; persist();
    };
    ["S1", "S2", "OH1", "OH2", "MB", "L"].forEach(function (k) {
      document.getElementById("name" + k).addEventListener("input", function (e) {
        state.names = state.names || defaultNames();
        state.names[k] = e.target.value;
        save(state);
        allSix(state.names);
      });
    });
    renderTracker(state);
    allSix(state.names);
  };
})();
