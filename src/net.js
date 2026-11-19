/* Sala online sin cuentas: misma interfaz que la capacidad "room", sobre PeerJS (WebRTC).
   El primero que entra con un código hace de "centro" (hub); los demás se conectan a él. */
(function () {
  var ICE = [                 /* solo STUN: la sala va por el servidor propio y PeerJS queda de respaldo */
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];
  function mkPeer(id) {
    var cfg = {}, k, extra = window.PEER_CFG || {};
    for (k in extra) cfg[k] = extra[k];
    if (!cfg.config) cfg.config = { iceServers: ICE };
    cfg.debug = 0;
    return id ? new window.Peer(id, cfg) : new window.Peer(cfg);
  }
  function rid() { return Math.random().toString(36).slice(2, 8); }
  function fail(code) { var e = new Error(code); e.code = code; return e; }

  function join(name) {
    return new Promise(function (resolve, reject) {
      if (!window.Peer) { reject(fail('sin_peerjs')); return; }
      var hubId = 'gpa-' + String(name).replace(/[^a-z0-9-]/gi, ''), done = false, timer;
      var listeners = [], errCbs = [], mine = {}, myId = hubId, isHub = false;
      var states = {}, conns = {}, snap = {}, peer = null, conn = null, bt = null, alive = true, stage = 'servidor';

      function emit() { listeners.slice().forEach(function (f) { try { f(); } catch (e) { /* nada */ } }); }
      var pend = {};
      function mark(id, patch) { var p = pend[id] || (pend[id] = {}), k; for (k in patch) p[k] = patch[k]; }
      function sendAll(msg) { Object.keys(conns).forEach(function (id) { try { if (conns[id].open) conns[id].send(msg); } catch (e) { /* nada */ } }); }
      function broadcast() {          /* solo se envían los cambios, agrupados cada 200 ms */
        if (bt) return;
        bt = setTimeout(function () {
          bt = null;
          if (!Object.keys(pend).length) return;
          var d = pend; pend = {};
          sendAll({ t: 'd', d: d });
        }, 200);
      }
      function full() { pend = {}; sendAll({ t: 's', s: states }); }
      function lost() { alive = false; errCbs.slice().forEach(function (f) { try { f(); } catch (e) { /* nada */ } }); }

      var nr = {
        via: 'respaldo PeerJS',
        presence: function (patch) {
          var k;
          for (k in patch) mine[k] = patch[k];
          if (isHub) { states[myId] = mine; mark(myId, patch); broadcast(); }
          else if (conn && conn.open) { try { conn.send({ t: 'p', patch: patch }); } catch (e) { /* nada */ } }
          emit();
          return Promise.resolve();
        },
        peers: function () {
          var src = isHub ? states : snap, ids = Object.keys(src);
          if (ids.indexOf(myId) < 0) ids.push(myId);
          return ids.map(function (id) {
            return { peer: id, presence: id === myId ? mine : src[id], isMe: id === myId, kind: 'user' };
          });
        },
        onPeers: function (fn, onErr) {
          listeners.push(fn); if (onErr) errCbs.push(onErr);
          return function () { listeners = listeners.filter(function (f) { return f !== fn; }); errCbs = errCbs.filter(function (f) { return f !== onErr; }); };
        },
        connected: function () {
          if (!alive) return false;
          return isHub ? !!(peer && !peer.disconnected && !peer.destroyed) : !!(conn && conn.open);
        },
        leave: function () { alive = false; try { if (peer) peer.destroy(); } catch (e) { /* nada */ } }
      };

      function ok() { if (done) return; done = true; clearTimeout(timer); resolve(nr); }
      function ko(code) { if (done) return; done = true; clearTimeout(timer); try { if (peer) peer.destroy(); } catch (e) { /* nada */ } reject(fail(code)); }
      timer = setTimeout(function () { ko(stage === 'servidor' ? 'sin_servidor' : 'sin_conexion_directa'); }, 20000);

      function asGuest() {
        try { if (peer) peer.destroy(); } catch (e) { /* nada */ }
        isHub = false; myId = hubId + '-' + rid();
        peer = mkPeer(myId);
        peer.on('open', function () {
          stage = 'directa';
          conn = peer.connect(hubId, { reliable: true });
          conn.on('open', function () { conn.send({ t: 'p', patch: mine }); ok(); });
          conn.on('data', function (m) {
            if (!m) return;
            if (m.t === 's') { snap = m.s || {}; emit(); }
            else if (m.t === 'd') {
              Object.keys(m.d || {}).forEach(function (id) { var o = snap[id] || (snap[id] = {}), k; for (k in m.d[id]) o[k] = m.d[id][k]; });
              emit();
            }
          });
          conn.on('close', function () { lost(); });
          conn.on('error', function () { if (!done) ko('sin_conexion'); else lost(); });
        });
        peer.on('error', function (e) {
          if (!done) ko(e && e.type === 'peer-unavailable' ? 'sala_no_disponible' : (e && e.type) || 'error');
          else lost();
        });
        peer.on('disconnected', function () { /* el canal de datos puede seguir vivo */ });
      }
      function asHub() {
        peer = mkPeer(hubId);
        peer.on('open', function () { isHub = true; myId = hubId; states[myId] = mine; ok(); });
        peer.on('connection', function (c) {
          var id = c.peer;
          c.on('open', function () {
            conns[id] = c; states[id] = states[id] || {};
            full(); emit();
          });
          c.on('data', function (m) {
            if (!m || m.t !== 'p') return;
            var s = states[id] || (states[id] = {}), k;
            for (k in m.patch) s[k] = m.patch[k];
            mark(id, m.patch); broadcast(); emit();
          });
          var gone = function () { if (conns[id] === c) { delete conns[id]; delete states[id]; full(); emit(); } };
          c.on('close', gone); c.on('error', gone);
        });
        peer.on('error', function (e) {
          if (!done && e && e.type === 'unavailable-id') { asGuest(); return; }
          if (!done) ko((e && e.type) || 'error'); else lost();
        });
        peer.on('disconnected', function () { try { if (alive && !peer.destroyed) peer.reconnect(); } catch (e) { /* nada */ } });
      }
      asHub();
    });
  }
  window.PeerRoom = { join: join };
})();
/* Sala online con servidor propio (WebSocket). Misma interfaz que peerroom.js.
   La dirección del servidor se pone en window.ROOM_WS_URL (p. ej. 'wss://barbaridades-salas.xxx.workers.dev').
   Si no hay dirección o el servidor no responde, el juego usa PeerJS como respaldo. */
(function () {
  function fail(code) { var e = new Error(code); e.code = code; return e; }

  function join(name) {
    return new Promise(function (resolve, reject) {
      var base = window.ROOM_WS_URL;
      if (!base || typeof WebSocket === 'undefined') { reject(fail('sin_servidor_propio')); return; }
      var ws, done = false, alive = true, myId = null, snap = {}, mine = {}, listeners = [], errCbs = [];
      var hb = null, lastPong = Date.now(), timer;

      function emit() { listeners.slice().forEach(function (f) { try { f(); } catch (e) { /* nada */ } }); }
      function lost() {
        if (!alive) return;
        alive = false; clearInterval(hb);
        errCbs.slice().forEach(function (f) { try { f(); } catch (e) { /* nada */ } });
      }
      function ko(code) { if (done) return; done = true; clearTimeout(timer); try { ws.close(); } catch (e) { /* nada */ } reject(fail(code)); }

      var nr = {
        via: 'servidor propio',
        presence: function (patch) {
          var k;
          for (k in patch) mine[k] = patch[k];
          if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify({ t: 'p', patch: patch })); } catch (e) { /* nada */ } }
          emit();
          return Promise.resolve();
        },
        peers: function () {
          var ids = Object.keys(snap);
          if (myId && ids.indexOf(myId) < 0) ids.push(myId);
          return ids.map(function (id) {
            return { peer: id, presence: id === myId ? mine : snap[id], isMe: id === myId, kind: 'user' };
          });
        },
        onPeers: function (fn, onErr) {
          listeners.push(fn); if (onErr) errCbs.push(onErr);
          return function () { listeners = listeners.filter(function (f) { return f !== fn; }); errCbs = errCbs.filter(function (f) { return f !== onErr; }); };
        },
        connected: function () { return alive && !!ws && ws.readyState === 1; },
        leave: function () { alive = false; clearInterval(hb); try { ws.close(); } catch (e) { /* nada */ } }
      };

      timer = setTimeout(function () { ko('sin_servidor'); }, 7000);
      try { ws = new WebSocket(base.replace(/\/$/, '') + '/sala/' + String(name).replace(/[^a-z0-9-]/gi, '').toLowerCase()); }
      catch (e) { ko('sin_servidor'); return; }

      ws.onmessage = function (ev) {
        if (ev.data === 'pong') { lastPong = Date.now(); return; }
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (!m) return;
        if (m.t === 'hola') {
          myId = m.id; snap = m.s || {}; delete snap[myId];
          if (!done) {
            done = true; clearTimeout(timer);
            hb = setInterval(function () {
              if (Date.now() - lastPong > 45000) { lost(); return; }
              try { ws.send('ping'); } catch (e) { /* nada */ }
            }, 15000);
            resolve(nr);
          }
          emit();
        } else if (m.t === 'd') {
          Object.keys(m.d || {}).forEach(function (id) {
            if (id === myId) return;
            var o = snap[id] || (snap[id] = {}), k;
            for (k in m.d[id]) o[k] = m.d[id][k];
          });
          emit();
        } else if (m.t === 'x') { delete snap[m.id]; emit(); }
      };
      ws.onclose = function () { if (!done) ko('sin_servidor'); else lost(); };
      ws.onerror = function () { if (!done) ko('sin_servidor'); };
    });
  }
  window.RoomWS = { join: join };
})();
/* Dibujo de la pista, el coche y los carteles. Todo en metros; ppm = píxeles por metro. */
var CC = null;
function colors() {
  if (CC) return CC;
  var cs = getComputedStyle(document.documentElement);
  var g = function (n) { return cs.getPropertyValue(n).trim() || '#888'; };
  CC = {
    skyA: g('--sky-a'), skyB: g('--sky-b'), hill: g('--hill'), hill2: g('--hill-2'), grass: g('--grass'),
    asphalt: g('--asphalt'), asphalt2: g('--asphalt-2'), kerbA: g('--kerb-a'), kerbB: g('--kerb-b'),
    car: g('--car'), ink: g('--hud-ink'), muted: g('--hud-muted'), gold: g('--gold'), accent: g('--accent')
  };
  return CC;
}
function resetColors() { CC = null; }
try {
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', resetColors);
  new MutationObserver(resetColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
} catch (e) { /* sin observador: los colores se leen al iniciar */ }

function fitCanvas(cv, h) {
  var dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(280, cv.clientWidth || 320);
  cv.style.height = h + 'px';
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  var ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: w, h: h };
}

function hills(ctx, w, hy, col, off, amp, fr, ph) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, hy);
  for (var x = 0; x <= w + 6; x += 6) {
    var t = (x + off) * fr;
    ctx.lineTo(x, hy - amp * (0.55 + 0.3 * Math.sin(t * ph + ph) + 0.15 * Math.sin(t * 2.7 + ph * 2)));
  }
  ctx.lineTo(w + 6, hy);
  ctx.closePath();
  ctx.fill();
}

function stripes(ctx, w, y, h, dist, ppm, C) {
  var seg = 3 * ppm, off = (dist * ppm) % (2 * seg);
  for (var x = -off, i = 0; x < w; x += seg, i++) {
    ctx.fillStyle = (i % 2) ? C.kerbB : C.kerbA;
    ctx.fillRect(x, y, seg + 1, h);
  }
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillPoly(ctx, pts, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

var VEHICLE = 'car';   /* 'car' | 'sport' | 'f1' | 'moto' | 'truck' (se elige en Ajustes) */
function wheelAt(ctx, x, y, r, ang, rim) {
  ctx.fillStyle = '#10141B'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C9D1DC'; ctx.beginPath(); ctx.arc(x, y, r * 0.58, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#10141B'; ctx.lineWidth = 1.3;
  for (var k = 0; k < 3; k++) {
    var a = ang + k * Math.PI / 3, q = r * 0.58;
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * q, y - Math.sin(a) * q); ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); ctx.stroke();
  }
}
function drawCar(ctx, x, yb, L, wheel, C, boost, v) {
  var s = L / 100, bob = v > 5 ? Math.sin(wheel * 1.7) * 0.3 * s : 0, V = VEHICLE, ang = wheel / 0.33;
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(x, yb + 1, L * 0.5, Math.max(2, 2.4 * s), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x - L / 2, yb - 33 * s + bob);
  ctx.scale(s, s);
  if (boost > 0.02) {
    var fl = 8 + 26 * boost, fy = V === 'moto' ? 19 : V === 'f1' ? 21 : 20.5;
    fillPoly(ctx, [[3, fy - 3.5], [3 - fl, fy], [3, fy + 3.5]], C.gold);
    fillPoly(ctx, [[3, fy - 1.9], [3 - fl * 0.55, fy], [3, fy + 1.9]], '#FFF4D0');
  }
  if (V === 'sport') {
    rr(ctx, 2, 16, 96, 10, 4); ctx.fillStyle = C.car; ctx.fill();
    fillPoly(ctx, [[30, 16.5], [47, 8], [66, 8], [86, 16.5]], C.car);
    fillPoly(ctx, [[38, 15.5], [49, 9.6], [57, 9.6], [57, 15.5]], '#0F1722');
    fillPoly(ctx, [[60, 15.5], [60, 9.6], [66, 9.6], [78, 15.5]], '#0F1722');
    ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillRect(6, 20.5, 88, 1.4);
    ctx.fillStyle = '#10141B'; ctx.fillRect(1, 9, 13, 2.2); ctx.fillRect(5, 10.5, 2, 6);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(96.5, 19.5, 2.6, 1.4, 0, 0, Math.PI * 2); ctx.fill();
    wheelAt(ctx, 22, 26, 7.4, ang); wheelAt(ctx, 78, 26, 7.4, ang);
  } else if (V === 'f1') {
    fillPoly(ctx, [[8, 22], [12, 15.5], [52, 14], [98, 21.5], [98, 25], [8, 25.5]], C.car);
    fillPoly(ctx, [[44, 14.5], [54, 11], [62, 14.2]], '#10141B');
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(52, 11.2, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10141B'; ctx.fillRect(1, 6.5, 14, 2.6); ctx.fillRect(7, 8.5, 2, 10);
    ctx.fillRect(88, 24.5, 12, 2.4);
    ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillRect(14, 20, 70, 1.3);
    wheelAt(ctx, 20, 25.5, 8.2, ang); wheelAt(ctx, 82, 26, 7, ang);
  } else if (V === 'moto') {
    wheelAt(ctx, 17, 25.5, 8.4, ang); wheelAt(ctx, 82, 25.5, 8.4, ang);
    ctx.strokeStyle = '#10141B'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(72, 11); ctx.lineTo(82, 25.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, 25.5); ctx.lineTo(36, 19); ctx.stroke();
    fillPoly(ctx, [[26, 18], [34, 11], [58, 9.5], [72, 12], [62, 20], [38, 21]], C.car);
    fillPoly(ctx, [[22, 12], [36, 10.5], [38, 14], [24, 15]], '#10141B');
    ctx.strokeStyle = '#10141B'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(70, 9.5); ctx.lineTo(76, 8); ctx.stroke();
    fillPoly(ctx, [[32, 11], [36, 2], [48, 0.5], [56, 7], [58, 10], [40, 12]], C.ink);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(52, 4); ctx.lineTo(70, 8.5); ctx.stroke();
    ctx.fillStyle = C.car; ctx.beginPath(); ctx.arc(52, -3, 4.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0F1722'; ctx.beginPath(); ctx.arc(54, -3, 2.6, -0.5, 1.6); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(86, 11, 2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  } else if (V === 'truck') {
    rr(ctx, 2, 3, 62, 22, 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = C.car; ctx.fillRect(2, 14, 62, 4);
    fillPoly(ctx, [[64, 25], [64, 9], [82, 9], [93, 17.5], [98, 19], [98, 25]], C.car);
    fillPoly(ctx, [[69, 11.5], [80, 11.5], [88, 17.5], [69, 17.5]], '#0F1722');
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(96.5, 21, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    wheelAt(ctx, 14, 26, 6.6, ang); wheelAt(ctx, 34, 26, 6.6, ang); wheelAt(ctx, 82, 26, 6.6, ang);
  } else {
    rr(ctx, 2, 14, 96, 12, 5); ctx.fillStyle = C.car; ctx.fill();
    fillPoly(ctx, [[26, 14.5], [37, 3], [67, 3], [82, 14.5]], C.car);
    fillPoly(ctx, [[32, 13.5], [40, 5.2], [51, 5.2], [51, 13.5]], '#0F1722');
    fillPoly(ctx, [[54, 13.5], [54, 5.2], [65, 5.2], [74, 13.5]], '#0F1722');
    ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillRect(6, 19.5, 88, 1.6);
    ctx.fillStyle = '#10141B'; ctx.fillRect(1, 6, 11, 2.4); ctx.fillRect(4, 8, 2, 6.5);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(96.5, 18, 2.4, 1.7, 0, 0, Math.PI * 2); ctx.fill();
    wheelAt(ctx, 24, 26, 7.4, ang); wheelAt(ctx, 77, 26, 7.4, ang);
  }
  ctx.restore();
}

function finishLine(ctx, x, V, C, h, hy) {
  var y0 = V.roadTop + V.kh, y1 = V.roadBot, cell = Math.max(5, (y1 - y0) / 6), rows = Math.ceil((y1 - y0) / cell);
  for (var c = 0; c < 2; c++) {
    for (var r = 0; r < rows; r++) {
      ctx.fillStyle = ((r + c) % 2) ? '#111' : '#fff';
      ctx.fillRect(x + c * cell, y0 + r * cell, cell, Math.min(cell, y1 - (y0 + r * cell)));
    }
  }
  var top = Math.max(4, hy - h * 0.34), bw = 150, bx = x + cell - bw / 2, bh = h * 0.15;
  ctx.fillStyle = C.asphalt;
  ctx.fillRect(bx, top, 5, V.roadTop - top);
  ctx.fillRect(bx + bw - 5, top, 5, V.roadTop - top);
  ctx.fillRect(bx, top, bw, bh);
  ctx.fillStyle = '#fff';
  ctx.font = '700 ' + Math.round(bh * 0.72) + 'px "Saira Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('META', bx + bw / 2, top + bh / 2 + 1);
}

/* S = { dist, total, speed, wheel, boost } */
function drawScene(view, S) {
  var ctx = view.ctx, w = view.w, h = view.h, C = colors();
  var ppm = w / 120, carX = w * 0.27;
  var hy = h * 0.46, roadTop = h * 0.62, kh = Math.max(5, h * 0.035), roadBot = h - kh;
  var V = { roadTop: roadTop, kh: kh, roadBot: roadBot };

  var g = ctx.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, C.skyA); g.addColorStop(1, C.skyB);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, hy + 1);
  hills(ctx, w, hy, C.hill, S.dist * ppm * 0.04, h * 0.14, 0.011, 1);
  hills(ctx, w, hy, C.hill2, S.dist * ppm * 0.1, h * 0.08, 0.019, 2);
  ctx.fillStyle = C.grass; ctx.fillRect(0, hy, w, roadTop - hy);

  stripes(ctx, w, roadTop, kh, S.dist, ppm, C);
  ctx.fillStyle = C.asphalt; ctx.fillRect(0, roadTop + kh, w, roadBot - roadTop - kh);
  stripes(ctx, w, roadBot, kh, S.dist, ppm, C);

  var ly = (roadTop + kh + roadBot) / 2, per = 9 * ppm, dash = 4.5 * ppm, lo = (S.dist * ppm) % per;
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  for (var x = -lo; x < w; x += per) ctx.fillRect(x, ly - 1.5, dash, 3);

  var band = roadTop - hy, m0 = Math.floor((S.dist - carX / ppm - 8) / 50) * 50, m1 = S.dist + (w - carX) / ppm + 8;
  var sw = Math.max(40, band * 1.9), sh = band * 0.66, fs = Math.round(sh * 0.62);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '700 ' + fs + 'px "Saira Condensed", "Arial Narrow", sans-serif';
  for (var m = m0; m <= m1; m += 50) {
    if (m < 0 || m > S.total) continue;
    var px = carX + (m - S.dist) * ppm;
    if (m === 0) {
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(px, roadTop + kh, 3, roadBot - roadTop - kh);
    } else if (m === S.total) {
      finishLine(ctx, px, V, C, h, hy);
    } else {
      ctx.fillStyle = C.asphalt; ctx.fillRect(px - sw / 2, hy + (band - sh) / 2, sw, sh);
      ctx.fillStyle = C.kerbA; ctx.fillRect(px - sw / 2, hy + (band - sh) / 2, sw, 2);
      ctx.fillStyle = C.ink; ctx.fillText(String(S.total - m), px, hy + band / 2 + 1);
    }
  }

  if (S.speed > 110) {
    var n = 5 + Math.floor((S.speed - 110) / 30), seed = Math.floor(S.dist * 1.3);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.14 + 0.3 * Math.min(1, S.speed / 300)).toFixed(2) + ')';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < n; i++) {
      var r1 = Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
      var r2 = Math.abs(Math.sin(i * 39.346 + seed * 11.135) * 24634.6345) % 1;
      var yy = roadTop + kh + 4 + r1 * (roadBot - roadTop - kh - 8), x1 = carX - h * 0.34 - r2 * w * 0.35, len = 24 + S.speed / 4;
      ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x1 - len, yy); ctx.stroke();
    }
  }

  drawCar(ctx, carX, roadBot - (roadBot - roadTop - kh) * 0.1, h * 0.62, S.wheel, C, S.boost, S.speed);
}
/* Lógica del juego: pantallas, carrera, resultados */