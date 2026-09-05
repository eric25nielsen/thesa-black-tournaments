(function () {
  var KEY = "thesa-black:rotations";
  var ROLES = { S1: "#c41e3a", S2: "#ffb3c0", OH: "#f3f4f6", MB: "#d4af37", L: "#9aa3ae" };

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
    return role;
  }
  function textColor(role) {
    if (role === "OH1" || role === "OH2" || role === "MB" || role === "S2" || role === "L") return "#111";
    return "#fff";
  }

  var ZONE = { 4: [18, 18], 3: [50, 18], 2: [82, 18], 5: [18, 78], 6: [50, 78], 1: [82, 78] };

  function courtSvg(spots, arrow) {
    var parts = [];
    parts.push('<svg viewBox="0 0 100 100" class="court-svg" aria-hidden="true">');
    parts.push('<rect x="2" y="2" width="96" height="96" rx="2" fill="#15181d" stroke="#c41e3a" stroke-width="1.8"/>');
    parts.push('<line x1="2" y1="2" x2="98" y2="2" stroke="#c41e3a" stroke-width="3.6"/>');
    parts.push('<line x1="2" y1="34" x2="98" y2="34" stroke="#ffb3c0" stroke-width="1.1" stroke-dasharray="3 2"/>');
    parts.push('<line x1="50" y1="2" x2="50" y2="34" stroke="#2a3038" stroke-width="0.8"/>');
    [4, 3, 2].forEach(function (z, i) {
      parts.push('<text x="' + [18, 50, 82][i] + '" y="8" text-anchor="middle" font-size="5" fill="#ffb3c0" font-weight="700">' + z + "</text>");
    });
    [5, 6, 1].forEach(function (z, i) {
      parts.push('<text x="' + [18, 50, 82][i] + '" y="97" text-anchor="middle" font-size="5" fill="#9aa3ae" font-weight="700">' + z + "</text>");
    });
    if (arrow) {
      parts.push('<line x1="' + arrow[0] + '" y1="' + arrow[1] + '" x2="' + arrow[2] + '" y2="' + arrow[3] + '" stroke="#c41e3a" stroke-width="1.8"/>');
    }
    spots.forEach(function (s) {
      var fill = color(s.role);
      var tc = textColor(s.role);
      parts.push('<circle cx="' + s.x + '" cy="' + s.y + '" r="7.2" fill="' + fill + '" stroke="#0b0d10" stroke-width="1.1"/>');
      parts.push('<text x="' + s.x + '" y="' + (s.y + 1.6) + '" text-anchor="middle" font-size="4.4" font-weight="800" fill="' + tc + '">' + short(s.role) + "</text>");
      if (s.tag) {
        parts.push('<text x="' + s.x + '" y="' + (s.y + 12) + '" text-anchor="middle" font-size="3.6" font-weight="700" fill="#ffb3c0">' + s.tag + "</text>");
      }
    });
    parts.push("</svg>");
    return parts.join("");
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
      { x: 18, y: 18, role: "OH1" },
      { x: 50, y: 18, role: "MB" },
      { x: 82, y: 18, role: fs },
      { x: 18, y: 78, role: "L" },
      { x: 50, y: 78, role: "OH2" },
      { x: 82, y: 78, role: s }
    ];
  }
  function receiveSpots(rot) {
    var s = activeSetter(rot), fs = frontSetter(rot);
    if (rot === 1 || rot === 4) {
      return [
        { x: 18, y: 18, role: fs },
        { x: 50, y: 18, role: "MB" },
        { x: 18, y: 74, role: "OH2", tag: "PASS" },
        { x: 50, y: 74, role: "L", tag: "PASS" },
        { x: 78, y: 68, role: "OH1", tag: "PASS" },
        { x: 86, y: 80, role: s }
      ];
    }
    if (rot === 2 || rot === 5) {
      return [
        { x: 50, y: 16, role: fs },
        { x: 50, y: 32, role: s },
        { x: 82, y: 16, role: "MB" },
        { x: 18, y: 74, role: "OH1", tag: "PASS" },
        { x: 50, y: 78, role: "L", tag: "PASS" },
        { x: 82, y: 74, role: "OH2", tag: "PASS" }
      ];
    }
    return [
      { x: 18, y: 16, role: "MB" },
      { x: 82, y: 16, role: fs },
      { x: 18, y: 72, role: "OH2", tag: "PASS" },
      { x: 28, y: 82, role: s },
      { x: 50, y: 74, role: "L", tag: "PASS" },
      { x: 82, y: 74, role: "OH1", tag: "PASS" }
    ];
  }
  function afterReceive(rot) {
    var s = activeSetter(rot), fs = frontSetter(rot);
    return [
      { x: 18, y: 18, role: "OH1" },
      { x: 50, y: 18, role: "MB" },
      { x: 82, y: 18, role: fs },
      { x: 18, y: 78, role: "L" },
      { x: 50, y: 78, role: "OH2" },
      { x: 68, y: 36, role: s, tag: "SET" }
    ];
  }
  function setterArrow(rot) {
    if (rot === 1 || rot === 4) return [82, 78, 68, 36];
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
    if (state.serving) {
      wrap.innerHTML =
        card("Before serve", courtSvg(beforeServe(state.rot))) +
        card("After serve → base", courtSvg(baseSpots(state.rot)));
    } else {
      wrap.innerHTML =
        card("Before receive", courtSvg(receiveSpots(state.rot))) +
        card("After receive", courtSvg(afterReceive(state.rot), setterArrow(state.rot)));
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

  function allSix() {
    var html = "";
    for (var r = 1; r <= 6; r++) {
      var s = activeSetter(r);
      html += '<details class="rot-all"' + (r === 1 ? " open" : "") + "><summary>Rotation " + r + " — " + s + " sets</summary>";
      html += '<div class="rot-grid">';
      html += card("Before serve", courtSvg(beforeServe(r)));
      html += card("After serve (base)", courtSvg(baseSpots(r)));
      html += card("Before receive", courtSvg(receiveSpots(r)));
      html += card("After receive", courtSvg(afterReceive(r), setterArrow(r)));
      html += "</div></details>";
    }
    document.getElementById("rotAll").innerHTML = html;
  }

  window.initRotations = function () {
    var state = load();
    function persist() { save(state); renderTracker(state); }
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
      });
    });
    renderTracker(state);
    allSix();
  };
})();
