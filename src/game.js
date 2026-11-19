(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  var LENS = [{ m: 500, n: 'Relámpago' }, { m: 1000, n: 'Sprint' }, { m: 2000, n: 'Carrera' }, { m: 3000, n: 'Resistencia' }];
  var VMAX = 300, MINV = 20, FRIC = 5;
  /* niveles: margen de lectura, segundos en flash, velocidad perdida al fallar */
  var LV = {
    f: { n: 'Fácil', d: 'Más tiempo, sin problemas largos', grace: 1.5, flash: 5, loss: 0.4, noProb: true },
    n: { n: 'Normal', d: 'Lo de siempre', grace: 1, flash: 3, loss: 0.55 },
    d: { n: 'Difícil', d: 'Menos tiempo, fallar duele más', grace: 0.7, flash: 2, loss: 0.65 }
  };
  function lvOf(k) { return LV[k] || LV.n; }
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }


  /* ---------- sonido (WebAudio, sin archivos) ---------- */
  var Snd = (function () {
    var ctx = null, muted = store.get('gpa-mute') === '1', eng = null;
    function ensure() {
      if (muted) return null;
      try {
        if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
        if (ctx && ctx.state === 'suspended') ctx.resume();
      } catch (e) { ctx = null; }
      return ctx;
    }
    function tone(f0, dur, type, vol, delay, f1) {
      var c = ensure(); if (!c) return;
      var t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    }
    return {
      ensure: ensure,
      isMuted: function () { return muted; },
      setMuted: function (m) { muted = m; store.set('gpa-mute', m ? '1' : '0'); if (m) Snd.engineStop(); },
      ok: function (streak) { var b = 660 * Math.pow(1.0595, Math.min(streak, 8)); tone(b, 0.11, 'triangle', 0.11); tone(b * 1.5, 0.16, 'triangle', 0.1, 0.07); },
      bad: function () { tone(170, 0.32, 'sawtooth', 0.1, 0, 70); },
      siren: function () {
        var c = ensure(); if (!c) return;
        var t = c.currentTime, o = c.createOscillator(), g = c.createGain(), i;
        o.type = 'sawtooth';
        for (i = 0; i < 6; i++) { o.frequency.setValueAtTime(i % 2 ? 960 : 640, t + i * 0.24); }
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.1, t + 0.03);
        g.gain.setValueAtTime(0.1, t + 1.3);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 1.55);
      },
      beep: function () { tone(440, 0.14, 'square', 0.07); },
      go: function () { tone(880, 0.4, 'square', 0.08); },
      finish: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.28, 'triangle', 0.12, i * 0.13); }); },
      engineStart: function () {
        var c = ensure(); if (!c || eng) return;
        var o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.value = 60;
        f.type = 'lowpass'; f.frequency.value = 400;
        g.gain.value = 0.025;
        o.connect(f); f.connect(g); g.connect(c.destination); o.start();
        eng = { o: o, g: g, f: f };
      },
      engine: function (v) {
        if (!eng || !ctx) return;
        var t = ctx.currentTime;
        eng.o.frequency.setTargetAtTime(55 + v * 0.75, t, 0.08);
        eng.f.frequency.setTargetAtTime(300 + v * 3, t, 0.08);
      },
      engineStop: function () {
        if (!eng) return;
        try { eng.o.stop(); } catch (e) { /* ya parado */ }
        eng = null;
      }
    };
  })();
  (function () {
    var b = $('mute');
    var paint = function () {
      b.textContent = Snd.isMuted() ? 'Sonido: no' : 'Sonido: sí';
      b.setAttribute('aria-pressed', Snd.isMuted() ? 'true' : 'false');
    };
    b.addEventListener('click', function () { Snd.setMuted(!Snd.isMuted()); if (!Snd.isMuted()) { Snd.ensure(); Snd.beep(); } paint(); });
    paint();
  })();

  var st = { topics: Object.keys(TOPICS).filter(function (k) { return normal(k); }), len: 1000, lvl: 'n', curso: null, sel: {} };
  var showAll = false;
  var locked = false, hashRoom = null;
  var CNT = {}, HASGEN = {};
  STATIC.forEach(function (q) { CNT[q.t] = (CNT[q.t] || 0) + 1; if (q.f) CNT.ficha = (CNT.ficha || 0) + 1; });
  GENS.forEach(function (g) { HASGEN[g.t] = true; });
  try {
    var sv = JSON.parse(store.get('gpa-setup') || 'null');
    if (sv) {
      if (Array.isArray(sv.topics)) {
        var tt = sv.topics.filter(function (k) { return TOPICS[k]; });
        if (tt.length) st.topics = tt;
      }
      if ([500, 1000, 2000, 3000].indexOf(sv.len) >= 0) st.len = sv.len;
      if (LV[sv.lvl]) st.lvl = sv.lvl;
      if (cursoById(sv.curso)) st.curso = sv.curso;
      if (sv.sel && typeof sv.sel === 'object') st.sel = sv.sel;
    }
  } catch (e) { /* ajustes por defecto */ }

  function saveSetup() { if (st.curso && !locked) st.sel[st.curso] = st.topics.slice(); store.set('gpa-setup', JSON.stringify(st)); if (typeof D !== 'undefined' && D.nr) { D.nr.presence({ cfg: cfgNow() }); } }
  function fmt(t) {
    var d = Math.round(t * 10), m = Math.floor(d / 600), r = d % 600, s = Math.floor(r / 10);
    return m + ':' + (s < 10 ? '0' : '') + s + ',' + (r % 10);
  }
  function fmt2(t) {
    var d = Math.round(t * 100), m = Math.floor(d / 6000), r = d % 6000, s = Math.floor(r / 100), c = r % 100;
    return m + ':' + (s < 10 ? '0' : '') + s + ',' + (c < 10 ? '0' : '') + c;
  }
  function bestKey() { return 'gpa-best-' + st.len + '-' + st.topics.slice().sort().join('.'); }
  function getBest() { var v = parseFloat(store.get(bestKey())); return isNaN(v) ? null : v; }


  /* ---------- preguntas propias del profe (en este dispositivo) ---------- */
  function parseCustom(txt) {
    var out = [], bad = [];
    String(txt || '').split(/\r?\n/).forEach(function (ln, i) {
      if (!ln.trim()) return;
      var f = ln.split('|').map(function (x) { return x.trim(); });
      if (f.length < 5 || f.slice(0, 5).some(function (x) { return !x; })) { bad.push(i + 1); return; }
      var w = f.slice(2, 5);
      if (w.indexOf(f[1]) >= 0 || w[0] === w[1] || w[0] === w[2] || w[1] === w[2]) { bad.push(i + 1); return; }
      out.push({ q: f[0], a: f[1], w: w, e: f[5] || 'Respuesta correcta: ' + f[1] + '.' });
    });
    return { ok: out, bad: bad };
  }
  (function () {
    var c = parseCustom(store.get('gpa-custom'));
    if (!c.ok.length) return;
    TOPICS.mis = 'Mis preguntas';
    GROUPS.push({ b: 'Mis preguntas', n: 'Mis preguntas', t: ['mis'] });
    CURSOS.forEach(function (cu) { cu.t.push('mis'); });
    c.ok.forEach(function (x) { add('mis', x.q, x.a, x.w, x.e); });
  })();
  $('custom-text').value = store.get('gpa-custom') || '';
  $('custom-save').addEventListener('click', function () {
    var v = $('custom-text').value, c = parseCustom(v), m = $('custom-msg');
    if (c.bad.length) { m.textContent = 'Revisa la(s) línea(s) ' + c.bad.join(', ') + ': necesitan enunciado, correcta y 3 incorrectas distintas.'; return; }
    store.set('gpa-custom', v);
    m.textContent = c.ok.length ? 'Guardadas ' + c.ok.length + ' preguntas. Recargando…' : 'Borradas. Recargando…';
    setTimeout(function () { try { window.location.reload(); } catch (e) { /* nada */ } }, 600);
  });

  /* ---------- fallos guardados (para practicarlos después) ---------- */
  function loadFails() { try { var o = JSON.parse(store.get('gpa-fails') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function failKeys() { return Object.keys(loadFails()); }
  /* repaso espaciado: un fallo superado vuelve a salir al cabo de 1, 3, 7 y 14 días */
  var REV_DAYS = [1, 3, 7, 14], DAY_MS = 86400000;
  function loadRev() { try { var o = JSON.parse(store.get('gpa-rev') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function dueKeys() { var r = loadRev(), n = Date.now(); return Object.keys(r).filter(function (k) { return r[k].due <= n; }); }
  function practiceKeys() { var a = failKeys(); dueKeys().forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }
  function noteFail(q, ok) {
    if (!q || !q.k) return;
    var f = loadFails(), rv = loadRev(), now = Date.now();
    if (!ok) { f[q.k] = { t: q.t, need: 2, at: now }; delete rv[q.k]; }
    else if (f[q.k]) {
      f[q.k].need--;
      if (f[q.k].need <= 0) { delete f[q.k]; rv[q.k] = { t: q.t, s: 0, due: now + REV_DAYS[0] * DAY_MS }; }
    } else if (rv[q.k] && rv[q.k].due <= now) {
      if (race) race.revHit = true;
      var s = rv[q.k].s + 1;
      if (s >= REV_DAYS.length) delete rv[q.k]; else rv[q.k] = { t: q.t, s: s, due: now + REV_DAYS[s] * DAY_MS };
    } else return;
    var ks = Object.keys(f);
    if (ks.length > 150) { ks.sort(function (a, b) { return f[a].at - f[b].at; }); ks.slice(0, ks.length - 150).forEach(function (k) { delete f[k]; }); }
    store.set('gpa-fails', JSON.stringify(f));
    store.set('gpa-rev', JSON.stringify(rv));
  }

  /* ---------- historial de partidas (en este dispositivo) ---------- */
  function loadHist() { try { var a = JSON.parse(store.get('gpa-hist') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveHist(r) {
    var by = {};
    r.log.forEach(function (x) { var e = by[x.t] || (by[x.t] = [0, 0]); e[1]++; if (x.ok) e[0]++; });
    var h = loadHist();
    h.push({ d: Date.now(), m: r.mode, l: r.total, t: Math.round(r.finalT * 100) / 100, ok: r.log.filter(function (x) { return x.ok; }).length, n: r.log.length, b: by });
    if (h.length > 300) h = h.slice(h.length - 300);
    store.set('gpa-hist', JSON.stringify(h));
  }

  /* ---------- insignias y racha de días (en este dispositivo) ---------- */
  var BADGES = [
    ['first', '🏁', 'Primera bandera a cuadros', 'Termina tu primera carrera'],
    ['d3', '🔥', 'Racha de 3 días', 'Juega 3 días seguidos'],
    ['d7', '🔥', 'Semana perfecta', 'Juega 7 días seguidos'],
    ['d14', '🔥', 'Quincena de hierro', 'Juega 14 días seguidos'],
    ['ok100', '🎯', '100 aciertos', 'Acumula 100 respuestas correctas'],
    ['ok500', '🎯', '500 aciertos', 'Acumula 500 respuestas correctas'],
    ['ok1000', '🏆', '1000 aciertos', 'Acumula 1000 respuestas correctas'],
    ['s10', '⚡', 'Racha de 10', '10 aciertos seguidos en una carrera'],
    ['s20', '⚡', 'Racha de 20', '20 aciertos seguidos en una carrera'],
    ['flash', '🧠', 'Calculadora humana', 'Una carrera flash de 10 preguntas o más sin fallar'],
    ['sim8', '📝', 'Notable en simulacro', 'Saca 8 o más en un simulacro'],
    ['sim10', '🥇', 'Matrícula de honor', 'Saca un 10 en un simulacro'],
    ['rev', '♻️', 'Memoria de elefante', 'Acierta una pregunta de repaso espaciado']
  ];
  function loadAch() { try { var o = JSON.parse(store.get('gpa-ach') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function dnum(k) { return Math.round(Date.UTC(Math.floor(k / 10000), Math.floor(k / 100) % 100 - 1, k % 100) / 86400000); }
  function loadDays() { try { var a = JSON.parse(store.get('gpa-days') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function streakDays() {
    var s = {}, n = 0;
    loadDays().forEach(function (k) { s[dnum(k)] = 1; });
    var t = dnum(dayKey()), i = s[t] ? t : t - 1;
    while (s[i]) { n++; i--; }
    return n;
  }
  function topicName(k) { return TOPICS[k] || k; }
  function updateAch(r) {
    var days = loadDays();
    if (days.indexOf(dayKey()) < 0) { days.push(dayKey()); store.set('gpa-days', JSON.stringify(days.slice(-120))); }
    var ach = loadAch(), got = [], h = loadHist();
    var okT = h.reduce(function (s, x) { return s + x.ok; }, 0), sd = streakDays();
    var n = r.log.length, ok = r.log.filter(function (x) { return x.ok; }).length, nota = n ? ok / n * 10 : 0;
    var test = {
      first: h.length >= 1, d3: sd >= 3, d7: sd >= 7, d14: sd >= 14,
      ok100: okT >= 100, ok500: okT >= 500, ok1000: okT >= 1000,
      s10: r.maxStreak >= 10, s20: r.maxStreak >= 20,
      flash: n >= 10 && ok === n && r.log.every(function (x) { return FLASHIDS.indexOf(x.t) >= 0; }),
      sim8: r.mode === 'sim' && nota >= 8, sim10: r.mode === 'sim' && ok === n,
      rev: !!r.revHit
    };
    var per = {};
    h.forEach(function (x) { Object.keys(x.b || {}).forEach(function (k) { var e = per[k] || (per[k] = [0, 0]); e[0] += x.b[k][0]; e[1] += x.b[k][1]; }); });
    Object.keys(per).forEach(function (k) { if (TOPICS[k] && per[k][1] >= 30 && per[k][0] / per[k][1] >= 0.85) test['m-' + k] = true; });
    Object.keys(test).forEach(function (id) {
      if (test[id] && !ach[id]) { ach[id] = Date.now(); got.push(id); }
    });
    if (got.length) store.set('gpa-ach', JSON.stringify(ach));
    return got;
  }
  function badgeInfo(id) {
    for (var i = 0; i < BADGES.length; i++) if (BADGES[i][0] === id) return BADGES[i];
    if (id.indexOf('m-') === 0) return [id, '⭐', 'Experto en ' + topicName(id.slice(2)), 'Más de 30 preguntas del tema con un 85 % de aciertos'];
    return [id, '🏅', id, ''];
  }
  function renderBadges() {
    var ach = loadAch(), sd = streakDays(), ids = BADGES.map(function (b) { return b[0]; });
    Object.keys(ach).forEach(function (k) { if (ids.indexOf(k) < 0) ids.push(k); });
    var got = ids.filter(function (k) { return ach[k]; }).length;
    $('badges').innerHTML = '<p>' + (sd ? '🔥 Racha: ' + sd + ' día' + (sd > 1 ? 's' : '') + ' seguido' + (sd > 1 ? 's' : '') + ' · ' : '') + '🏅 ' + got + ' insignia' + (got === 1 ? '' : 's') + '</p><div class="badges">' + ids.map(function (k) {
      var b = badgeInfo(k);
      return '<span class="badge' + (ach[k] ? '' : ' off') + '" title="' + b[3] + '"><i>' + b[1] + '</i>' + b[2] + '</span>';
    }).join('') + '</div>';
  }
  var MODEN = { solo: 'Individual', duel: 'Online', practice: 'Fallos', reto: 'Reto del día', sim: 'Simulacro' };
  var SIMN = 15;
  function renderProgress() {
    var h = loadHist(), box = $('prog');
    $('progress').hidden = h.length === 0;
    if (!h.length) return;
    renderBadges();
    var name = D.nick ? safe(D.nick) + ': ' : '';
    var tot = h.reduce(function (s, x) { return s + x.n; }, 0), okt = h.reduce(function (s, x) { return s + x.ok; }, 0);
    var html = '<p>' + name + h.length + ' carrera' + (h.length > 1 ? 's' : '') + ' · ' + okt + ' de ' + tot + ' preguntas acertadas (' + (tot ? Math.round(okt / tot * 100) : 0) + ' %)</p>';
    /* por tema: aciertos totales y tendencia (mitad reciente frente a la mitad anterior) */
    var per = {};
    h.forEach(function (x) { Object.keys(x.b || {}).forEach(function (k) { if (!TOPICS[k]) return; (per[k] = per[k] || []).push(x.b[k]); }); });
    var rows = Object.keys(per).map(function (k) {
      var a = per[k], ok = 0, n = 0;
      a.forEach(function (e) { ok += e[0]; n += e[1]; });
      var tr = '';
      if (a.length >= 2) {
        var mid = Math.floor(a.length / 2), pc = function (l) { var o = 0, m = 0; l.forEach(function (e) { o += e[0]; m += e[1]; }); return m ? o / m : 0; };
        var dlt = pc(a.slice(mid)) - pc(a.slice(0, mid));
        tr = dlt > 0.05 ? ' <span class="up">▲</span>' : dlt < -0.05 ? ' <span class="down">▼</span>' : '';
      }
      return { k: k, p: n ? Math.round(ok / n * 100) : 0, ok: ok, n: n, tr: tr };
    }).filter(function (r) { return r.n >= 2; }).sort(function (a, b) { return a.p - b.p; });
    if (rows.length) {
      html += '<p class="ph">Por tema (de peor a mejor). ▲ mejora · ▼ empeora en las últimas partidas</p>' + rows.slice(0, 15).map(function (r) {
        return '<div class="trow"><span>' + TOPICS[r.k] + r.tr + '</span><span class="bar' + (r.p < 70 ? ' low' : '') + '"><i style="width:' + r.p + '%"></i></span><span>' + r.p + ' %</span></div>';
      }).join('');
    }
    html += '<p class="ph">Últimas carreras</p><ul class="hist">' + h.slice(-8).reverse().map(function (x) {
      var dt = new Date(x.d);
      return '<li><span>' + dt.getDate() + '/' + (dt.getMonth() + 1) + '</span><span>' + (MODEN[x.m] || '') + ' · ' + (x.m === 'sim' ? SIMN + ' preg.' : x.l + ' m') + '</span><span>' + fmt2(x.t) + '</span><span>' + x.ok + '/' + x.n + '</span></li>';
    }).join('') + '</ul><button class="link" id="histclear" type="button">Borrar mi historial</button>';
    box.innerHTML = html;
    $('histclear').addEventListener('click', function () {
      if (!window.confirm || window.confirm('¿Borrar tu historial y tus fallos guardados?')) { store.set('gpa-hist', '[]'); store.set('gpa-fails', '{}'); store.set('gpa-rev', '{}'); renderProgress(); renderExtras(); }
    });
  }
  function retoTopics() { var c = cur(); return c ? c.fl.slice() : FLASHIDS.slice(); }
  function retoSalt() { var s = 0, id = st.curso || ''; for (var i = 0; i < id.length; i++) s = s * 31 + id.charCodeAt(i); return s % 100003; }
  function retoKey() { return 'gpa-reto-' + dayKey() + (st.curso ? '-' + st.curso : ''); }
  function retoBest() { var v = parseFloat(store.get(retoKey())); return isNaN(v) ? null : v; }
  function renderExtras() {
    var nf = failKeys().length, nd = dueKeys().length, pb = $('practice');
    pb.disabled = nf + nd === 0;
    pb.innerHTML = '<b>Practicar mis fallos</b><small>' + (nf + nd ? (nf ? nf + ' por superar' : '') + (nf && nd ? ' · ' : '') + (nd ? nd + ' de repaso' : '') : 'No tienes fallos pendientes') + '</small>';
    var rb = retoBest();
    $('reto').innerHTML = '<b>⚡ Reto del día</b><small>' + (rb === null ? 'Las mismas preguntas flash para ' + (cur() ? 'todo ' + cur().n : 'todos') + ' hoy' : 'Tu tiempo de hoy: ' + fmt2(rb)) + '</small>';
  }

  /* ---------- pantallas ---------- */
  var hero = null, heroRun = false, heroT = 0, heroLast = 0, heroTok = 0, race = null, view = null;
  function show(id) {
    ['s-course', 's-start', 's-race', 's-end'].forEach(function (i) { $(i).hidden = (i !== id); });
    heroRun = false;
    if (id !== 's-race') Snd.engineStop();
    if (id === 's-start') { startHero(); renderExtras(); renderProgress(); }
    try { window.scrollTo(0, 0); } catch (e) { /* sin scroll */ }
  }

  /* ---------- inicio ---------- */
  function allIds() { return Object.keys(TOPICS); }
  function cursoById(id) { for (var i = 0; i < CURSOS.length; i++) if (CURSOS[i].id === id) return CURSOS[i]; return null; }
  function cur() { return cursoById(st.curso); }
  function normal(k) { return k !== 'ficha' && FLASHIDS.indexOf(k) < 0; }
  function normalIds() { var c = cur(); return c && !showAll ? c.t.filter(function (k) { return TOPICS[k]; }) : allIds().filter(normal); }
  function flashIds() { var c = cur(); return c && !showAll ? c.fl.slice() : FLASHIDS.slice(); }
  /* temas visibles en el selector: los del curso (y su modo flash) o todos */
  function visible(k) { var c = cur(); if (!c || showAll || locked) return k !== 'ficha'; return c.t.indexOf(k) >= 0 || c.fl.indexOf(k) >= 0; }
  function pickCourse(id) {
    st.curso = id; showAll = false;
    var c = cur(), sv = st.sel[id];
    st.topics = Array.isArray(sv) && sv.filter(function (k) { return TOPICS[k]; }).length ? sv.filter(function (k) { return TOPICS[k]; }) : c.t.filter(function (k) { return TOPICS[k]; });
    saveSetup(); renderChips(); renderSeg(); updateStart(); renderCourse();
    show('s-start');
  }
  function renderCourse() {
    var c = cur();
    $('cur-name').innerHTML = c ? '<b>' + c.n + '</b> · ' + c.d : 'Sin curso elegido';
    $('allt').textContent = showAll ? 'Ver solo los temas de mi curso' : 'Ver temas de otros cursos';
    $('allt').hidden = !c;
  }
  function renderCourses() {
    var box = $('courses'); box.innerHTML = '';
    var lastN = null, grp = null;
    CURSOS.forEach(function (c) {
      if (c.n !== lastN) {
        lastN = c.n;
        var h = document.createElement('h2'); h.textContent = c.n; box.appendChild(h);
        grp = document.createElement('div'); grp.className = 'cgrid'; box.appendChild(grp);
      }
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cbtn' + (st.curso === c.id ? ' last' : '');
      b.innerHTML = '<b>' + c.n + '</b><small>' + c.d + '</small>';
      b.addEventListener('click', function () { pickCourse(c.id); });
      grp.appendChild(b);
    });
  }
  function isFull() { return normalIds().every(function (k) { return st.topics.indexOf(k) >= 0; }); }
  function renderChips() {
    var box = $('groups');
    box.innerHTML = '';
    var lastB = null;
    var GS = GROUPS.map(function (G) { return { b: G.b, n: G.n, t: G.t.filter(visible) }; }).filter(function (G) { return G.t.length; });
    GS.forEach(function (G) {
      if (G.b !== lastB) {
        lastB = G.b;
        var ids = [];
        GS.forEach(function (H) { if (H.b === G.b) ids = ids.concat(H.t); });
        var onB = ids.filter(function (k) { return st.topics.indexOf(k) >= 0; }).length;
        var bh = document.createElement('div'); bh.className = 'blk';
        var h3 = document.createElement('h3'); h3.textContent = G.b;
        var bb = document.createElement('button'); bb.type = 'button'; bb.className = 'link';
        bb.textContent = onB === ids.length ? 'Quitar bloque' : 'Marcar bloque';
        bb.addEventListener('click', function () {
          if (onB === ids.length) st.topics = st.topics.filter(function (k) { return ids.indexOf(k) < 0; });
          else ids.forEach(function (k) { if (st.topics.indexOf(k) < 0) st.topics.push(k); });
          saveSetup(); renderChips(); updateStart();
        });
        bh.appendChild(h3); bh.appendChild(bb); box.appendChild(bh);
      }
      var on = G.t.filter(function (k) { return st.topics.indexOf(k) >= 0; }).length;
      var sec = document.createElement('div'); sec.className = 'grp';
      var single = GS.filter(function (H) { return H.b === G.b; }).length === 1;
      var h = document.createElement('button');
      h.type = 'button'; h.className = 'grp-h';
      h.setAttribute('aria-pressed', on === G.t.length ? 'true' : 'false');
      h.innerHTML = '<span>' + G.n + '</span><small>' + (on === G.t.length ? 'todo' : on ? on + '/' + G.t.length : 'ninguno') + '</small>';
      h.addEventListener('click', function () {
        if (on === G.t.length) st.topics = st.topics.filter(function (k) { return G.t.indexOf(k) < 0; });
        else G.t.forEach(function (k) { if (st.topics.indexOf(k) < 0) st.topics.push(k); });
        saveSetup(); renderChips(); updateStart();
      });
      if (!single) sec.appendChild(h);
      var row = document.createElement('div'); row.className = 'chips';
      G.t.forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip';
        b.textContent = TOPICS[k];
        b.setAttribute('aria-pressed', st.topics.indexOf(k) >= 0 ? 'true' : 'false');
        b.addEventListener('click', function () {
          var i = st.topics.indexOf(k);
          if (i >= 0) st.topics.splice(i, 1); else st.topics.push(k);
          saveSetup(); renderChips(); updateStart();
        });
        row.appendChild(b);
      });
      sec.appendChild(row);
      box.appendChild(sec);
    });
    $('toggle-all').textContent = isFull() ? 'Quitar todos' : 'Marcar todos';
  }
  function codeStr() {
    var ids = allIds().filter(function (k) { return st.topics.indexOf(k) >= 0; });
    return '#l' + st.len + (ids.length ? '.' + ids.join('.') : '');
  }
  function parseHash() {
    var h = '';
    try { h = (window.location.hash || '').replace(/^#/, ''); } catch (e) { h = ''; }
    var ids = [], len = null;
    h.split('.').forEach(function (t) {
      var m = /^l(500|1000|2000|3000)$/.exec(t), rm = /^sala-([a-z0-9]{3,12})$/.exec(t);
      if (rm) hashRoom = rm[1];
      else if (m) len = parseInt(m[1], 10);
      else if (TOPICS[t] && ids.indexOf(t) < 0) ids.push(t);
    });
    return ids.length ? { ids: ids, len: len } : null;
  }
  function applyHash() {
    var c = parseHash();
    if (!c) { locked = false; return; }
    locked = true; st.topics = c.ids;
    if (c.len) st.len = c.len;
  }
  function renderLock() {
    $('classbox').hidden = !locked;
    $('picker').hidden = locked;
    $('teacher').hidden = locked || (typeof D !== 'undefined' && D.mode === 'duel');
    if (locked) {
      var ul = $('today'); ul.innerHTML = '';
      st.topics.forEach(function (k) { var li = document.createElement('li'); li.textContent = TOPICS[k]; ul.appendChild(li); });
    }
  }
  function renderSeg() {
    var box = $('seg');
    box.innerHTML = '';
    LENS.forEach(function (L) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', st.len === L.m ? 'true' : 'false');
      b.innerHTML = '<b>' + L.m + ' m</b><small>' + L.n + '</small>';
      b.addEventListener('click', function () { st.len = L.m; saveSetup(); renderSeg(); updateStart(); });
      box.appendChild(b);
    });
    var lb = $('lvl');
    lb.innerHTML = '';
    Object.keys(LV).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', st.lvl === k ? 'true' : 'false');
      b.innerHTML = '<b>' + LV[k].n + '</b><small>' + LV[k].d + '</small>';
      b.addEventListener('click', function () { st.lvl = k; saveSetup(); renderSeg(); updateStart(); });
      lb.appendChild(b);
    });
  }
  function updateStart() {
    var best = getBest(), n = st.topics.length;
    $('best').innerHTML = n === 0 ? 'Elige al menos un tema.' :
      (best === null ? 'Aún no tienes tiempo con esta selección.' : 'Tu mejor tiempo con esta selección: <b>' + fmt2(best) + '</b>');
    $('go').disabled = n === 0;
    $('code').value = codeStr();
    renderLock();
  }
  $('toggle-all').addEventListener('click', function () {
    st.topics = isFull() ? [] : normalIds();
    saveSetup(); renderChips(); updateStart();
  });
  $('flash').addEventListener('click', function () {
    st.topics = flashIds();
    saveSetup(); renderChips(); updateStart();
  });
  $('allt').addEventListener('click', function () { showAll = !showAll; renderChips(); renderCourse(); });
  $('cur-change').addEventListener('click', function () { renderCourses(); show('s-course'); });
  $('unlock').addEventListener('click', function () { locked = false; renderChips(); updateStart(); });
  $('copycode').addEventListener('click', function () {
    var v = $('code').value, b = $('copycode');
    var ok = function () { b.textContent = '¡Copiado!'; setTimeout(function () { b.textContent = 'Copiar código'; }, 1600); };
    var fb = function () { $('code').select(); b.textContent = 'Selecciona y copia'; };
    try { navigator.clipboard.writeText(v).then(ok, fb); } catch (e) { fb(); }
  });
  window.addEventListener('hashchange', function () {
    applyHash(); renderSeg(); renderChips(); updateStart();
  });

  function startHero() {
    var cv = $('hero');
    if (!cv) return;
    hero = fitCanvas(cv, window.innerWidth < 520 ? 150 : 190);
    heroRun = !reduce;
    heroLast = performance.now();
    drawHero();
    var my = ++heroTok;
    var loop = function (now) {
      if (!heroRun || my !== heroTok) return;
      heroT += Math.min(0.05, (now - heroLast) / 1000);
      heroLast = now;
      drawHero();
      requestAnimationFrame(loop);
    };
    if (heroRun) requestAnimationFrame(loop);
  }
  function drawHero() {
    drawScene(hero, { dist: 40 + heroT * 12, total: 3000, speed: 55, wheel: heroT * 12, boost: 0 });
  }

  /* ---------- carrera ---------- */
  function raceHeight() { return window.innerWidth < 520 ? 150 : window.innerWidth < 760 ? 185 : 230; }

  function seeded(deck, seed) {
    var a = seed >>> 0;
    var rng = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next: function () {
        var old = Math.random;
        Math.random = rng;
        try { return deck.next(); } finally { Math.random = old; }
      }
    };
  }

  function dayKey() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function startRace(opts) {
    opts = opts && (opts.topics || opts.mode) ? opts : { mode: 'solo' };
    var dz = opts.topics ? opts : null, mode = dz ? 'duel' : opts.mode;
    var lvl = dz ? (LV[dz.lvl] ? dz.lvl : 'n') : mode === 'reto' || mode === 'sim' ? 'n' : st.lvl;
    var deck, len = dz ? dz.len : st.len;
    if (dz) deck = seeded(makeDeck(dz.topics, { noProb: lvOf(lvl).noProb }), dz.seed);
    else if (mode === 'practice') { deck = keysDeck(practiceKeys()); if (!deck.n) return; len = 500; }
    else if (mode === 'sim') { var sid = st.topics.filter(normal); if (!sid.length) sid = normalIds(); deck = makeDeck(sid, {}); len = SIMN * 60; lvl = 'f'; }
    else if (mode === 'reto') { deck = seeded(makeDeck(retoTopics()), dayKey() * 7919 + retoSalt()); len = 500; }
    else { if (!st.topics.length) return; deck = makeDeck(st.topics, { noProb: lvOf(lvl).noProb }); }
    if (race) { race.dead = true; clearTimers(); }
    race = {
      mode: mode, lvl: lvl,
      deck: deck, total: len, duel: !!dz, pids: dz ? dz.pids : [], myPid: dz ? dz.myPid : null, pnames: dz ? dz.pnames : {}, lastPush: 0, endShown: false, draft: 0, v: 0, dist: 0, t: 0, phase: 'count', streak: 0, maxStreak: 0,
      log: [], cur: null, lock: false, wrongLock: false, lockAt: 0, qStart: 0, wheel: 0, last: performance.now(),
      boost: 0, timers: [], dead: false, doneAt: 0, finalT: 0
    };
    Snd.ensure();
    show('s-race');
    view = fitCanvas($('cv'), raceHeight());
    $('h-dl').textContent = mode === 'sim' ? 'Preguntas que faltan' : 'Meta en'; $('h-du').textContent = mode === 'sim' ? '' : 'm';
    $('q-topic').textContent = '';
    $('q-text').textContent = 'Prepárate';
    $('opts').innerHTML = '';
    $('fb').innerHTML = '';
    $('pop').className = 'pop';
    $('gotxt').hidden = true;
    $('draft').hidden = true;
    $('rival').hidden = !dz; $('m-dots').innerHTML = ''; $('rival').textContent = '';
    if (dz) duelRaceStart();
    var lights = $('lights').children;
    for (var i = 0; i < 3; i++) lights[i].className = '';
    $('lights').hidden = false;
    hud();
    [0, 1, 2].forEach(function (i) { later(function () { lights[i].className = 'on'; Snd.beep(); }, 500 + i * 550); });
    later(go, 2250);
    var tk = race.token = ++tok;
    var loop = function (now) {
      if (!race || race.token !== tk || race.dead) return;
      if (frame(now)) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  function later(fn, ms) { race.timers.push(setTimeout(function () { if (race && !race.dead) fn(); }, ms)); }
  function clearTimers() { if (race) race.timers.forEach(clearTimeout); }

  function go() {
    race.phase = 'run';
    race.v = MINV;
    Snd.go(); Snd.engineStart();
    $('lights').hidden = true;
    $('gotxt').hidden = false;
    later(function () { $('gotxt').hidden = true; }, 800);
    nextQ();
  }

  function nextQ() {
    if (race.phase !== 'run') return;
    var q = race.cur = race.deck.next();
    $('q-topic').textContent = TOPICS[q.t] + (q.p ? ' · Problema: usa papel' : q.fl ? ' · ¡de cabeza!' : '');
    $('q-text').innerHTML = '<span class="qin">' + R(q.q) + '</span>';
    var box = $('opts');
    box.innerHTML = '';
    q.opts.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt';
      b.innerHTML = '<span class="k">' + (i + 1) + '</span><span class="v">' + R(o.s) + '</span>';
      b.addEventListener('click', function () { answer(i); });
      box.appendChild(b);
    });
    $('fb').innerHTML = '';
    race.lock = false; race.wrongLock = false;
    race.qStart = performance.now();
    /* margen de lectura: las preguntas largas dejan más tiempo antes de que el coche empiece a frenar */
    var plain = function (s) { return R(s).replace(/<[^>]*>/g, ''); };
    var longest = 0;
    q.opts.forEach(function (o) { longest = Math.max(longest, plain(o.s).length); });
    var lv = lvOf(race.lvl);
    race.grace = race.mode === 'sim' ? 600 : q.fl ? lv.flash : q.p ? (race.lvl === 'd' ? 45 : 60) : lv.grace * Math.min(10, 3 + (plain(q.q).length + longest) * 0.09);
  }

  function pop(text, bad) {
    var p = $('pop');
    p.textContent = text;
    p.className = 'pop show' + (bad ? ' bad' : '');
    later(function () { p.className = 'pop' + (bad ? ' bad' : ''); }, 900);
  }

  function answer(i) {
    if (!race || race.phase !== 'run' || race.lock) return;
    var q = race.cur, o = q.opts[i], btns = $('opts').children;
    race.lock = true;
    race.log.push({ t: q.t, q: q.q, a: q.a, e: q.e, ok: o.ok, picked: o.s, ms: performance.now() - race.qStart });
    noteFail(q, o.ok);
    if (race.mode === 'sim' && race.log.length >= SIMN) { var rr = race; setTimeout(function () { if (race === rr && !rr.dead && rr.phase === 'run') { rr.dist = rr.total; finishRace(); } }, o.ok ? 150 : 1800); }
    for (var k = 0; k < btns.length; k++) btns[k].disabled = true;
    if (o.ok) {
      var gain = 26 + Math.min(race.streak, 8) * 3;
      race.v = Math.min(VMAX, race.v + gain);
      race.streak++;
      race.maxStreak = Math.max(race.maxStreak, race.streak);
      race.boost = 1;
      btns[i].classList.add('ok');
      Snd.ok(race.streak);
      pop('+' + gain + ' km/h', false);
      later(nextQ, 170);
    } else {
      var loss = lvOf(race.lvl).loss, lost = Math.round(race.v * loss);
      race.v *= 1 - loss;
      race.streak = 0;
      btns[i].classList.add('no');
      for (var j = 0; j < q.opts.length; j++) if (q.opts[j].ok) btns[j].classList.add('reveal');
      if (o.bar) { Snd.siren(); sirenFx(); } else Snd.bad();
      $('fb').innerHTML = '<strong>' + (o.bar ? '¡Barbaridad!' : 'Fallo') + '</strong> La respuesta es ' + R(q.a) + '. ' + R(q.e);
      pop('−' + lost + ' km/h', true);
      if (!reduce) {
        var st0 = $('cv').parentNode;
        st0.classList.remove('shake'); void st0.offsetWidth; st0.classList.add('shake');
      }
      race.wrongLock = true; race.lockAt = performance.now();
      later(nextQ, 2200);
    }
  }

  function sirenFx() {
    var s = $('cv').parentNode;
    s.classList.remove('siren'); void s.offsetWidth; s.classList.add('siren');
    setTimeout(function () { s.classList.remove('siren'); }, 1500);
  }

  function skipWrong() {
    if (race && race.phase === 'run' && race.wrongLock && performance.now() - race.lockAt > 700) {
      race.wrongLock = false;
      race.timers.forEach(clearTimeout);
      race.timers = [];
      nextQ();
    }
  }

  var tok = 0;
  function frame(now) {
    var dt = Math.min(0.05, (now - race.last) / 1000);
    race.last = now;
    if (race.phase === 'run') {
      race.t += dt;
      if (!race.lock && performance.now() - race.qStart > race.grace * 1000) race.v = Math.max(MINV, race.v - FRIC * dt);
      var bonus = 0;
      if (race.duel) {
        var rd = leaderDist();
        if (rd !== null && rd - race.dist > 10) bonus = Math.min(0.12, 0.12 * (rd - race.dist - 10) / 90);
        if (bonus > 0) race.boost = Math.max(race.boost, 0.6);
      }
      race.draft = bonus;
      if (race.mode === 'sim') race.dist += (race.total * Math.min(SIMN, race.log.length) / SIMN - race.dist) * Math.min(1, dt * 3);
      else race.dist += race.v / 3.6 * dt * (1 + bonus);
      if (race.dist >= race.total && race.phase === 'run') finishRace();
      if (race.duel) duelTick(now);
    } else if (race.phase === 'done') {
      race.dist += race.v / 3.6 * dt;
      if (now - race.doneAt > 1000) { showEnd(); return false; }
    }
    Snd.engine(race.phase === 'run' ? race.v : 0);
    race.wheel += race.v / 3.6 * dt;
    race.boost = Math.max(0, race.boost - dt * 2.5);
    drawScene(view, { dist: race.dist, total: race.total, speed: race.v, wheel: race.wheel, boost: race.boost });
    hud();
    return true;
  }

  function hud() {
    var r = race;
    $('h-time').textContent = fmt(r.phase === 'done' ? r.finalT : r.t);
    $('h-v').textContent = Math.round(r.v);
    $('h-g').style.width = Math.min(100, r.v / VMAX * 100) + '%';
    $('h-d').textContent = r.mode === 'sim' ? Math.max(0, SIMN - r.log.length) : Math.max(0, Math.ceil(r.total - r.dist));
    $('h-s').textContent = r.streak;
    var pct = Math.min(100, r.dist / r.total * 100) + '%';
    $('m-fill').style.width = pct;
    $('m-dot').style.left = pct;
    if (r.duel) rivalHud();
    var dp = $('draft');
    dp.hidden = !(r.duel && r.draft > 0.005 && r.phase === 'run');
    if (!dp.hidden) dp.textContent = 'Rebufo +' + Math.round(r.draft * 100) + ' %';
  }

  function finishRace() {
    var over = (race.dist - race.total) / Math.max(1, race.v / 3.6);
    race.finalT = race.t - over;
    race.phase = 'done';
    race.doneAt = performance.now();
    race.timers.forEach(clearTimeout);
    race.timers = [];
    Snd.engineStop(); Snd.finish();
    var btns = $('opts').children;
    for (var k = 0; k < btns.length; k++) btns[k].disabled = true;
    if (race.duel) duelFinished();
  }

  /* ---------- resultados ---------- */
  function showEnd() {
    var r = race, n = r.log.length, ok = r.log.filter(function (x) { return x.ok; }).length;
    var pct = n ? Math.round(ok / n * 100) : 0;
    var avg = n ? r.log.reduce(function (s, x) { return s + x.ms; }, 0) / n / 1000 : 0;
    var solo = r.mode === 'solo';
    var prev = solo ? getBest() : r.mode === 'reto' ? retoBest() : null, record = (solo || r.mode === 'reto') && (prev === null || r.finalT < prev);
    if (record) store.set(solo ? bestKey() : retoKey(), String(r.finalT));
    saveHist(r);
    var newB = updateAch(r);
    show('s-end');
    var bx = $('e-badges');
    bx.hidden = !newB.length;
    bx.innerHTML = newB.map(function (id) { var b = badgeInfo(id); return '<span class="badge"><i>' + b[1] + '</i>¡Nueva insignia! ' + b[2] + '</span>'; }).join('');
    var kick = { duel: 'Carrera online terminada', practice: 'Práctica de fallos', reto: 'Reto del día', sim: 'Simulacro' }[r.mode];
    $('e-kick').textContent = kick ? kick + (r.mode === 'reto' && record ? ' · tu mejor tiempo de hoy' : '') : record ? (prev === null ? 'Primer tiempo en esta selección' : 'Nuevo récord personal') : 'Bandera a cuadros';
    $('e-time').innerHTML = r.mode === 'sim' ? (ok / n * 10).toFixed(1).replace('.', ',') + ' <small>/ 10</small>' : fmt2(r.finalT) + ' <small>min</small>';
    var left = failKeys().length;
    $('e-sub').textContent = r.total + ' m · nivel ' + lvOf(r.lvl).n.toLowerCase() +
      (r.mode === 'practice' ? ' · ' + (left ? 'te quedan ' + left + ' tipos de pregunta por superar (cada una se supera acertándola 2 veces)' : '¡has superado todos tus fallos!') :
       record || prev === null ? '' : ' · tu mejor tiempo ' + (r.mode === 'reto' ? 'de hoy ' : '') + 'es ' + fmt2(prev) + ' (' + (r.finalT - prev >= 0 ? '+' : '−') + Math.abs(r.finalT - prev).toFixed(1).replace('.', ',') + ' s)');
    var avgKmh = Math.round(r.total / r.finalT * 3.6);
    if (r.mode === 'sim') $('e-sub').textContent = 'Nota: ' + (ok / n * 10).toFixed(1).replace('.', ',') + ' sobre 10 · ' + n + ' preguntas del curso, sin límite de velocidad';
    $('e-stats').innerHTML = (r.mode === 'sim' ? [
      ['Nota', (ok / n * 10).toFixed(1).replace('.', ',') + ' / 10'],
      ['Aciertos', ok + ' / ' + n],
      ['Respuesta media', avg.toFixed(1).replace('.', ',') + ' s'],
      ['Tiempo total', fmt2(r.finalT)]
    ] : [
      ['Aciertos', ok + ' / ' + n + ' (' + pct + '%)'],
      ['Respuesta media', avg.toFixed(1).replace('.', ',') + ' s'],
      ['Mejor racha', String(r.maxStreak)],
      ['Velocidad media', avgKmh + ' km/h']
    ]).map(function (x) { return '<div class="stat"><span class="lab">' + x[0] + '</span><span class="val">' + x[1] + '</span></div>'; }).join('');

    var by = {};
    r.log.forEach(function (x) { by[x.t] = by[x.t] || { n: 0, ok: 0 }; by[x.t].n++; if (x.ok) by[x.t].ok++; });
    var keys = Object.keys(by).sort(function (a, b) { return by[a].ok / by[a].n - by[b].ok / by[b].n; });
    $('e-topics').innerHTML = keys.map(function (k) {
      var p = Math.round(by[k].ok / by[k].n * 100);
      return '<div class="trow"><span>' + TOPICS[k] + '</span><span class="bar' + (p < 70 ? ' low' : '') + '"><i style="width:' + p + '%"></i></span><span>' + by[k].ok + ' / ' + by[k].n + '</span></div>';
    }).join('');

    var miss = r.log.filter(function (x) { return !x.ok; });
    function item(x, i) {
      return '<div class="miss-item' + (x.ok ? ' good' : '') + '"><span class="miss-t">' + (i + 1) + '. ' + TOPICS[x.t] + ' · ' + (x.ok ? 'acertada' : 'fallada') + '</span><div class="miss-q">' + R(x.q) + '</div>' +
        '<div class="miss-a">Correcta: <b>' + R(x.a) + '</b>' + (x.ok ? '' : ' · Tú elegiste: ' + R(x.picked)) + '</div><div class="miss-e">' + R(x.e) + '</div></div>';
    }
    $('e-miss-h').hidden = miss.length === 0;
    $('e-miss-h').textContent = 'Para repasar (' + miss.length + ' falladas)';
    $('e-miss').innerHTML = miss.map(function (x) { return item(x, r.log.indexOf(x)); }).join('');
    $('e-all-h').hidden = n === 0;
    $('e-all').innerHTML = r.log.map(item).join('');

    var fails = keys.filter(function (k) { return by[k].ok < by[k].n; }).map(function (k) { return TOPICS[k] + ' ' + (by[k].n - by[k].ok); });
    var td = new Date();
    r.shareText = (r.duel ? 'Online · ' : r.mode === 'reto' ? 'Reto del día ' + td.getDate() + '/' + (td.getMonth() + 1) + ' · ' : r.mode === 'practice' ? 'Práctica de fallos · ' : r.mode === 'sim' ? 'Simulacro · ' : '') + 'Gran Premio de Barbaridades · ' + r.total + ' m · ' + fmt2(r.finalT) + ' · ' + ok + '/' + n + ' aciertos (' + pct + '%)' + (fails.length ? ' · Fallos: ' + fails.join(', ') : '');
    $('share').hidden = true;
    $('copy').textContent = 'Copiar resultado';
    $('again').textContent = r.duel ? 'Revancha' : r.mode === 'practice' ? (left ? 'Seguir practicando' : 'Otra carrera') : r.mode === 'reto' ? 'Repetir el reto' : r.mode === 'sim' ? 'Otro simulacro' : 'Otra carrera';
    $('menu').textContent = r.duel ? 'Salir de la sala' : 'Cambiar temas';
    $('duelres').hidden = !r.duel;
    r.endShown = true;
    if (r.duel) duelResult();
  }

  $('d-print').addEventListener('click', function () { document.body.classList.add('print-report'); try { window.print(); } catch (e) { /* nada */ } setTimeout(function () { document.body.classList.remove('print-report'); }, 500); });
  $('print').addEventListener('click', function () { try { window.print(); } catch (e) { /* nada */ } });

  $('copy').addEventListener('click', function () {
    var text = race && race.shareText;
    if (!text) return;
    var fallback = function () { var s = $('share'); s.value = text; s.hidden = false; s.focus(); s.select(); };
    try {
      navigator.clipboard.writeText(text).then(function () {
        $('copy').textContent = 'Copiado';
        setTimeout(function () { $('copy').textContent = 'Copiar resultado'; }, 1800);
      }, fallback);
    } catch (e) { fallback(); }
  });


  /* ---------- carrera online (2 a 8 jugadores) ---------- */
  var MAXP = 8;
  var roomNS = null;
  var D = { mode: 'solo', nr: null, code: '', nick: store.get('gpa-nick') || '', unsub: null, ph: 'lobby', ready: false,
            seen: {}, track: {} };

  function setMode(m) {
    D.mode = m;
    $('mode-solo').setAttribute('aria-checked', m === 'solo' ? 'true' : 'false');
    $('mode-duel').setAttribute('aria-checked', m === 'duel' ? 'true' : 'false');
    $('duelbox').hidden = m !== 'duel';
    $('go').hidden = m === 'duel';
    $('best').hidden = m === 'duel';
    $('teacher').hidden = locked || m === 'duel';
    $('extras').hidden = m === 'duel';
    $('progress').hidden = m === 'duel' || loadHist().length === 0;
    if (m === 'duel') renderLobby();
  }
  $('mode-solo').addEventListener('click', function () { setMode('solo'); });
  $('mode-duel').addEventListener('click', function () { setMode('duel'); });

  function cfgNow() { return { t: st.topics.filter(function (k) { return k !== 'mis'; }), l: st.len, v: st.lvl }; }
  function players() {
    if (!D.nr) return [];
    return D.nr.peers().filter(function (p) { return p.kind !== 'agent' && p.presence && p.presence.nick && !p.presence.obs; })
      .sort(function (a, b) { return a.peer < b.peer ? -1 : a.peer > b.peer ? 1 : 0; });
  }
  function watchers() {
    if (!D.nr) return [];
    return D.nr.peers().filter(function (p) { return p.presence && p.presence.nick && p.presence.obs; })
      .sort(function (a, b) { return a.peer < b.peer ? -1 : a.peer > b.peer ? 1 : 0; });
  }
  /* quien elige temas: el profe si hay uno en la sala; si no, el primer jugador */
  function cfgOwner() { return watchers()[0] || players()[0] || null; }
  function effCfg() { var o = cfgOwner(); return o && !o.isMe && o.presence.cfg ? o.presence.cfg : cfgNow(); }
  function pctS(ok, n) { return n ? Math.round(ok / n * 100) + ' %' : '–'; }
  /* informe de la sala a partir de lo que publica cada jugador */
  var lastRep = [];
  function reportHTML(list, live) {
    lastRep = [];
    if (!list.length) return '<p class="hintp">Aún no hay alumnos en la sala.</p>';
    var by = {}, miss = {}, anyRep = false;
    var rows = list.map(function (p) {
      var pr = p.presence || {}, rp = pr.rep && typeof pr.rep === 'object' ? pr.rep : null;
      var est = pr.fin > 0 ? 'meta ' + fmt2(pr.fin) : pr.fin === -1 ? 'abandonó' : pr.ph === 'race' ? 'en carrera · ' + Math.round(pr.d || 0) + ' m' : pr.rdy ? 'listo' : 'esperando';
      var ok = rp ? null : pr.ok, n = rp ? null : pr.n, worst = '';
      if (rp && rp.b) {
        anyRep = true; ok = 0; n = 0;
        var wk = null, wp = 2;
        Object.keys(rp.b).forEach(function (k) {
          var e = rp.b[k]; if (!TOPICS[k] || !Array.isArray(e)) return;
          var a = +e[0] || 0, m = +e[1] || 0; ok += a; n += m;
          var B = by[k] || (by[k] = [0, 0]); B[0] += a; B[1] += m;
          if (m && a / m < wp) { wp = a / m; wk = k; }
        });
        if (wk && wp < 1) worst = TOPICS[wk] + ' (' + Math.round(wp * 100) + ' %)';
        (Array.isArray(rp.m) ? rp.m : []).forEach(function (q) {
          q = String(q).slice(0, 120); var M = miss[q] || (miss[q] = { c: 0, who: [] }); M.c++; M.who.push(pr.nick);
        });
      }
      lastRep.push([pr.nick || '?', est, n ? ok : '', n ? n : '', n ? Math.round(ok / n * 100) : '', worst]);
      return '<tr><td>' + safe(pr.nick || '?') + '</td><td>' + est + '</td><td>' + (n ? ok + '/' + n + ' (' + pctS(ok, n) + ')' : '–') + '</td><td>' + (worst ? safe(worst) : '–') + '</td></tr>';
    }).join('');
    var html = '<div class="tscroll"><table class="rep"><thead><tr><th>Alumno</th><th>Estado</th><th>Aciertos</th><th>Tema más flojo</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    if (anyRep) {
      var ks = Object.keys(by).sort(function (a, b) { return by[a][0] / by[a][1] - by[b][0] / by[b][1]; });
      html += '<p class="ph">Toda la sala, por tema (de peor a mejor)</p>' + ks.map(function (k) {
        var p = Math.round(by[k][0] / by[k][1] * 100);
        return '<div class="trow"><span>' + TOPICS[k] + '</span><span class="bar' + (p < 70 ? ' low' : '') + '"><i style="width:' + p + '%"></i></span><span>' + by[k][0] + '/' + by[k][1] + '</span></div>';
      }).join('');
      var mq = Object.keys(miss).sort(function (a, b) { return miss[b].c - miss[a].c; }).slice(0, 12);
      if (mq.length) html += '<p class="ph">Preguntas falladas en la sala</p><ul class="mq">' + mq.map(function (q) {
        var txt = /…$/.test(q) ? safe(q) : R(safe(q));
        return '<li><span class="miss-q">' + txt + '</span><small>' + miss[q].c + ' · ' + miss[q].who.map(safe).join(', ') + '</small></li>';
      }).join('') + '</ul>';
    } else if (!live) html += '<p class="hintp">El detalle por tema aparece cuando cada alumno cruza la meta.</p>';
    return html;
  }
  function peerById(id) { var l = players(); for (var i = 0; i < l.length; i++) if (l[i].peer === id) return l[i]; return null; }
  function cleanName(s) { return String(s || '').replace(/[^\wÀ-ÿ .-]/g, '').trim().slice(0, 14); }
  function safe(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function renderLobby() {
    var joined = !!D.nr;
    $('d-join').hidden = joined; $('d-lobby').hidden = !joined;
    if (!joined) {
      if (!$('nick').value) $('nick').value = D.nick;
      return;
    }
    $('d-code').textContent = D.code;
    var list = players(), me = null, i;
    for (i = 0; i < list.length; i++) if (list[i].isMe) me = list[i];
    var inGame = !!me && list.indexOf(me) < MAXP, host = list[0], owner = cfgOwner();
    var shown = list.slice(0, MAXP);
    $('players').innerHTML = shown.map(function (p) {
      var pr = p.presence;
      return '<li class="' + (pr.rdy ? 'rdy' : '') + '"><span>' + safe(pr.nick) + (p.isMe ? ' <small>(tú)</small>' : '') + (owner && p.peer === owner.peer ? ' <small>· elige los temas</small>' : '') + '</span><small>' + (pr.ph && pr.ph !== 'lobby' ? 'en carrera' : pr.rdy ? 'listo' : 'esperando…') + '</small></li>';
    }).join('') || '<li><span>' + (D.obs ? 'Aún no ha entrado ningún alumno' : 'Conectando…') + '</span></li>';
    var ws = watchers();
    if (ws.length) $('players').innerHTML += ws.map(function (p) { return '<li class="obs"><span>' + safe(p.presence.nick) + (p.isMe ? ' <small>(tú)</small>' : '') + (owner && p.peer === owner.peer ? ' <small>· elige los temas</small>' : '') + '</span><small>profe, mirando</small></li>'; }).join('');
    var hostCfg = owner && !owner.isMe && owner.presence.cfg ? owner.presence.cfg : cfgNow();
    $('d-cfg').innerHTML = 'Temas: ' + (hostCfg.t || []).map(function (k) { return TOPICS[k] || k; }).join(', ') + ' · ' + hostCfg.l + ' m · nivel ' + lvOf(hostCfg.v).n.toLowerCase() +
      (owner && !owner.isMe ? ' (los elige ' + safe(owner.presence.nick) + ')' : '');
    $('d-report').hidden = !D.obs;
    $('ready').hidden = !!D.obs;
    if (D.obs) {
      $('d-report-body').innerHTML = reportHTML(list.slice(0, MAXP), true);
      $('d-status').innerHTML = list.length < 2 ? 'Pásales el código ' + D.code + ' a tus alumnos. Salen cuando todos pulsen «Estoy listo».' : 'Alumnos listos: ' + list.filter(function (p) { return p.presence.rdy; }).length + ' de ' + Math.min(list.length, MAXP) + '.';
      var np0 = D.nr.peers().length;
      $('d-diag').textContent = 'Conectados en la sala: ' + np0 + (D.nr.via ? ' · ' + D.nr.via : '');
      $('picker').style.opacity = owner && !owner.isMe ? .5 : '';
      return;
    }
    var waiting = shown.filter(function (p) { return !p.presence.rdy; });
    var msg;
    if (list.length && !inGame) msg = 'La sala está llena (máximo ' + MAXP + ' jugadores).';
    else if (shown.length < 2) msg = (D.ready ? 'Estás listo. ' : 'Pulsa «Estoy listo». ') + 'Pásale el código ' + D.code + ' a quien quiera jugar (hasta ' + MAXP + ').';
    else if (!D.ready) msg = 'Cuando estés listo, pulsa el botón. Salís todos a la vez cuando todos estéis listos.';
    else if (waiting.length) msg = 'Listos: ' + (shown.length - waiting.length) + ' de ' + shown.length + '. Falta: ' + waiting.map(function (p) { return safe(p.presence.nick); }).join(', ') + '.';
    else msg = 'Salimos…';
    $('d-status').innerHTML = msg;
    $('ready').disabled = (list.length > 0 && !inGame) || hostCfg.t.length === 0;
    var np = D.nr.peers().length, cn = (typeof D.nr.connected === 'function') ? D.nr.connected() : true;
    $('d-diag').textContent = 'Conectados en la sala: ' + np + (D.nr.via ? ' · ' + D.nr.via : '') + (cn ? '' : ' · sin conexión con el servidor');
    $('ready').textContent = D.ready ? 'Cancelar' : 'Estoy listo';
    $('picker').style.opacity = owner && !owner.isMe ? .5 : '';
  }

  function onPeersChange() {
    var list = players(), me = null, i;
    for (i = 0; i < list.length; i++) {
      var p = list[i], pr = p.presence, tr = D.track[p.peer];
      if (!p.isMe && (!tr || tr.d !== (pr.d || 0) || tr.v !== (pr.v || 0))) D.track[p.peer] = { d: pr.d || 0, v: pr.v || 0, at: performance.now() };
      if (p.isMe) me = p;
    }
    renderLobby();
    if (!me) return;
    var shown = list.slice(0, MAXP);
    if (shown.indexOf(me) < 0) return;
    var host = list[0];
    if (!(host.peer in D.seen)) D.seen[host.peer] = host.presence.go || null;
    // el anfitrión decide la salida cuando todos están listos y en el vestíbulo
    if (host.isMe && D.ph === 'lobby' && D.ready && shown.length >= 2 &&
        shown.every(function (p) { return p.presence.rdy && p.presence.ph === 'lobby'; })) {
      var gid = String(Date.now()) + Math.floor(Math.random() * 1e6);
      var seed = Math.floor(Math.random() * 4294967295);
      var cfg = effCfg();
      var plist = shown.map(function (p) { return p.peer; });
      D.ph = 'race'; D.seen[host.peer] = gid;
      D.nr.presence({ go: gid, seed: seed, gcfg: cfg, plist: plist, ph: 'race', d: 0, v: 0, fin: null, okc: null, n: null, ok: 0, rep: null });
      launchDuel(cfg, seed, plist, me.peer);
    } else if (!host.isMe) {
      var go = host.presence.go || null;
      if (go && go !== D.seen[host.peer]) {
        D.seen[host.peer] = go;
        var pl = host.presence.plist || [];
        var gc = host.presence.gcfg || host.presence.cfg;
        if (D.ph === 'lobby' && D.ready && gc && pl.indexOf(me.peer) >= 0) {
          D.ph = 'race';
          D.nr.presence({ ph: 'race', d: 0, v: 0, fin: null, okc: null, n: null, ok: 0, rep: null });
          launchDuel(gc, host.presence.seed, pl, me.peer);
        }
      }
    }
    if (race && race.duel && race.endShown) duelResult();
  }

  function launchDuel(cfg, seed, plist, myPid) {
    var names = {};
    plist.forEach(function (id) { var p = peerById(id); names[id] = p ? p.presence.nick : 'Jugador'; });
    startRace({ topics: (cfg.t || []).filter(function (k) { return TOPICS[k]; }), len: cfg.l, lvl: cfg.v, seed: seed, pids: plist, myPid: myPid, pnames: names });
  }

  async function joinDuel() {
    var nick = cleanName($('nick').value), code = $('roomcode').value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    var err = $('d-err');
    err.textContent = '';
    if (!nick) { err.textContent = 'Escribe tu nombre.'; return; }
    if (code.length < 3) { err.textContent = 'El código debe tener al menos 3 letras o números.'; return; }
    if (!roomNS) { err.textContent = 'El modo online no está disponible en este navegador.'; return; }
    D.nick = nick; store.set('gpa-nick', nick);
    D.obs = !!$('obs').checked;
    $('join').disabled = true;
    try {
      var nr = await roomNS.join('bar-' + code);
      rememberRoom(code, D.obs); renderRooms();
      D.nr = nr; D.code = code; D.ph = 'lobby'; D.ready = false; D.seen = {}; D.track = {};
      D.unsub = nr.onPeers(onPeersChange, function () { err.textContent = 'Se ha perdido la conexión con la sala.'; duelLeave(); });
      await nr.presence(D.obs ? { nick: nick, obs: true, cfg: cfgNow() } : { nick: nick, rdy: false, ph: 'lobby', cfg: cfgNow(), d: 0, v: 0, fin: null, go: null });
      renderLobby(); onPeersChange();
    } catch (e) {
      D.nr = null;
      err.textContent = 'No se ha podido entrar en la sala (' + (e && e.code ? e.code : 'error') + '). Prueba otra vez.';
    }
    $('join').disabled = false;
    renderLobby();
  }
  function duelLeave() {
    if (D.unsub) { try { D.unsub(); } catch (e) { /* nada */ } }
    if (D.nr) { try { D.nr.leave(); } catch (e) { /* nada */ } }
    D.nr = null; D.unsub = null; D.ready = false; D.ph = 'lobby';
    renderLobby();
  }
  function duelBackToLobby() {
    D.ph = 'lobby'; D.ready = false;
    if (D.nr) D.nr.presence({ ph: 'lobby', rdy: false, d: 0, v: 0, fin: null, cfg: cfgNow() });
    setMode('duel'); renderLobby();
  }
  function duelAbandon() {
    D.ph = 'lobby'; D.ready = false;
    if (D.nr) D.nr.presence({ ph: 'lobby', rdy: false, fin: -1 });
    setMode('duel'); renderLobby();
  }

  var DOTCOL = function (i) { return 'hsl(' + ((i * 67 + 200) % 360) + ',80%,62%)'; };
  function duelRaceStart() {
    $('rival').textContent = '';
    var box = $('m-dots'); box.innerHTML = '';
    race.pids.forEach(function (id, i) {
      if (id === race.myPid) return;
      var d = document.createElement('b');
      d.className = 'rdot'; d.setAttribute('data-p', id); d.style.background = DOTCOL(i); d.style.left = '0%';
      box.appendChild(d);
    });
  }
  function duelTick(now) {
    if (!D.nr || now - race.lastPush < 330) return;
    race.lastPush = now;
    D.nr.presence({ d: Math.round(race.dist), v: Math.round(race.v), ok: race.log.filter(function (x) { return x.ok; }).length, n: race.log.length });
  }
  function duelFinished() {
    if (!D.nr) return;
    var ok = race.log.filter(function (x) { return x.ok; }).length;
    var b = {}, m = [];
    race.log.forEach(function (x) {
      var e = b[x.t] || (b[x.t] = [0, 0]); e[1]++; if (x.ok) e[0]++;
      if (!x.ok && m.indexOf(x.q) < 0) m.push(x.q.length > 90 ? x.q.slice(0, 80) + '…' : x.q);
    });
    var rp = { b: b, m: m.slice(0, 6) };
    while (JSON.stringify(rp).length > 700 && rp.m.length) rp.m.pop();
    D.nr.presence({ d: race.total, v: 0, fin: race.finalT, ph: 'end', okc: ok, n: race.log.length, rep: rp });
  }

  /* estado de cada rival: { pid, name, d, fin, gone } */
  function rivalsNow() {
    var out = [], t = performance.now();
    race.pids.forEach(function (id) {
      if (id === race.myPid) return;
      var p = peerById(id), name = race.pnames[id] || 'Jugador';
      if (!p) { out.push({ pid: id, name: name, gone: true, d: 0, fin: null }); return; }
      var pr = p.presence;
      if (pr.fin === -1) { out.push({ pid: id, name: name, gone: true, d: 0, fin: null, ab: true }); return; }
      if (pr.fin > 0) { out.push({ pid: id, name: name, d: race.total, fin: pr.fin, okc: pr.okc, n: pr.n }); return; }
      var tr = D.track[id] || { d: 0, v: 0, at: t };
      out.push({ pid: id, name: name, d: Math.min(race.total, tr.d + tr.v / 3.6 * (t - tr.at) / 1000), v: tr.v, fin: null });
    });
    return out;
  }
  function leaderDist() {
    var best = null;
    rivalsNow().forEach(function (r) { if (!r.gone && !r.fin && (best === null || r.d > best)) best = r.d; });
    return best;
  }
  function rivalHud() {
    var rs = rivalsNow(), el = $('rival'), N = race.pids.length;
    var dots = $('m-dots').children, i;
    rs.forEach(function (r) {
      for (i = 0; i < dots.length; i++) if (dots[i].getAttribute('data-p') === r.pid) {
        dots[i].hidden = !!r.gone;
        dots[i].style.left = Math.min(100, r.d / race.total * 100) + '%';
      }
    });
    var rank = 1, lead = null;
    rs.forEach(function (r) {
      if (r.gone) return;
      if (r.fin || r.d > race.dist) rank++;
      if (!lead || r.d > lead.d || (r.fin && !lead.fin)) lead = r;
    });
    var active = rs.filter(function (r) { return !r.gone; }).length;
    if (!active) { el.innerHTML = '<span>Todos los rivales se han ido</span>'; return; }
    var info;
    if (lead && lead.fin) info = '<b>' + safe(lead.name) + '</b> ya ha cruzado la meta en ' + fmt2(lead.fin);
    else if (rank === 1) info = 'Vas en cabeza' + (lead ? ' · ' + Math.max(0, Math.round(race.dist - lead.d)) + ' m sobre ' + safe(lead.name) : '');
    else info = '<b>' + safe(lead.name) + '</b> te saca ' + Math.max(0, Math.round(lead.d - race.dist)) + ' m';
    el.innerHTML = '<span><b>' + rank + '.º</b> de ' + (active + 1 < N ? active + 1 : N) + '</span><span>' + info + '</span>';
  }
  function duelResult() {
    var box = $('duelres'), r = race;
    if (!r || !r.duel) return;
    var ok = r.log.filter(function (x) { return x.ok; }).length;
    var rows = [{ name: D.nick || 'Tú', fin: r.finalT, okc: ok, n: r.log.length, me: true }];
    rivalsNow().forEach(function (x) { rows.push({ name: x.name, fin: x.fin, okc: x.okc, n: x.n, gone: x.gone }); });
    var rank = function (x) { return x.fin ? 0 : x.gone ? 2 : 1; };
    rows.sort(function (a, b) { return rank(a) - rank(b) || (a.fin || 0) - (b.fin || 0); });
    var pending = rows.filter(function (x) { return !x.fin && !x.gone; }).length;
    var pos = rows.indexOf(rows.filter(function (x) { return x.me; })[0]) + 1;
    var h, cls = '';
    if (pending) { h = 'Has cruzado la meta'; }
    else if (rows.length === 1) { h = 'Te has quedado solo'; }
    else if (pos === 1) { h = '¡Has ganado!'; cls = 'win'; }
    else { h = 'Quedas ' + pos + '.º de ' + rows.length; }
    var list = rows.map(function (x, i) {
      var t = x.fin ? fmt2(x.fin) + (x.n ? ' · ' + x.okc + '/' + x.n + ' aciertos' : '') : x.gone ? 'se ha ido' : 'en carrera…';
      return '<li' + (x.me ? ' class="me"' : '') + '><span>' + (x.fin ? (i + 1) + '.' : '–') + '</span><span>' + safe(x.name) + (x.me ? ' (tú)' : '') + '</span><span>' + t + '</span></li>';
    }).join('');
    box.className = 'duelres ' + cls;
    var opened = box.querySelector('details[open]') ? ' open' : '';
    var pl = r.pids.map(peerById).filter(Boolean);
    box.innerHTML = '<div class="dr-h">' + h + '</div>' + (pending ? '<div class="dr-s">Esperando a ' + pending + ' jugador' + (pending > 1 ? 'es' : '') + '…</div>' : '') + '<ol class="rank">' + list + '</ol>' +
      '<details class="drrep"' + opened + '><summary>Informe de la sala</summary>' + reportHTML(pl, false) + '</details>';
  }


  $('d-csv').addEventListener('click', function () {
    var rows = [['Alumno', 'Estado', 'Aciertos', 'Preguntas', '% acierto', 'Tema más flojo']].concat(lastRep);
    var txt = '\ufeff' + rows.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
    var d = new Date(), name = 'informe-' + (D.code || 'sala') + '-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '.csv';
    try {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
      a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) {
      try { navigator.clipboard.writeText(txt); $('d-csv').textContent = 'Copiado: pégalo en Excel'; } catch (e2) { /* nada */ }
    }
  });
  /* salas recientes y enlace directo */
  function loadRooms() { try { var a = JSON.parse(store.get('gpa-rooms') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function rememberRoom(code, obs) {
    var a = loadRooms().filter(function (r) { return r.c !== code; });
    a.unshift({ c: code, o: !!obs });
    store.set('gpa-rooms', JSON.stringify(a.slice(0, 5)));
  }
  function renderRooms() {
    var a = loadRooms(), box = $('rooms');
    box.hidden = !a.length;
    box.innerHTML = a.length ? '<span class="hintp">Salas recientes:</span> ' : '';
    a.forEach(function (r) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'chip'; bt.textContent = r.c + (r.o ? ' (profe)' : '');
      bt.addEventListener('click', function () { $('roomcode').value = r.c; $('obs').checked = !!r.o; });
      box.appendChild(bt);
    });
  }
  $('copylink').addEventListener('click', function () {
    var b = $('copylink'), url = '';
    try { url = window.location.href.split('#')[0] + '#sala-' + D.code; } catch (e) { url = '#sala-' + D.code; }
    var ok = function () { b.textContent = '¡Enlace copiado!'; setTimeout(function () { b.textContent = 'Copiar enlace de la sala'; }, 1600); };
    try { navigator.clipboard.writeText(url).then(ok, function () { window.prompt('Copia el enlace:', url); }); } catch (e) { try { window.prompt('Copia el enlace:', url); } catch (e2) { /* nada */ } }
  });

  $('nick').addEventListener('input', function () { D.nick = cleanName($('nick').value); });
  $('newcode').addEventListener('click', function () {
    var abc = 'abcdefghjkmnpqrstuvwxyz23456789', c = '';
    for (var i = 0; i < 4; i++) c += abc.charAt(Math.floor(Math.random() * abc.length));
    $('roomcode').value = c;
  });
  $('join').addEventListener('click', joinDuel);
  $('roomcode').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinDuel(); });
  $('leave').addEventListener('click', duelLeave);
  $('ready').addEventListener('click', function () {
    Snd.ensure();
    if (!D.nr) return;
    D.ready = !D.ready;
    D.nr.presence({ rdy: D.ready, ph: 'lobby', cfg: cfgNow(), fin: null });
    renderLobby();
    onPeersChange();
  });
  setInterval(function () { if (D.nr) { renderLobby(); onPeersChange(); } }, 1000);
  (async function () {
    try { if (window.claude && window.claude.use) roomNS = await window.claude.use('room'); } catch (e) { roomNS = null; }
    if (!roomNS && (window.RoomWS || (window.PeerRoom && window.Peer))) {
      roomNS = {   /* primero el servidor propio; si no responde, PeerJS */
        join: async function (name) {
          if (window.RoomWS && window.ROOM_WS_URL) {
            try { return await window.RoomWS.join(name); } catch (e) { /* respaldo */ }
          }
          if (window.PeerRoom && window.Peer) return window.PeerRoom.join(name);
          var er = new Error('sin_servidor'); er.code = 'sin_servidor'; throw er;
        }
      };
    }
    if (!roomNS) { $('mode-duel').disabled = true; $('mode-duel').querySelector('small').textContent = 'No disponible aquí'; }
  })();

  /* ---------- eventos ---------- */
  $('go').addEventListener('click', function () { startRace({ mode: 'solo' }); });
  $('sim').addEventListener('click', function () { startRace({ mode: 'sim' }); });
  $('practice').addEventListener('click', function () { startRace({ mode: 'practice' }); });
  $('reto').addEventListener('click', function () { startRace({ mode: 'reto' }); });
  $('again').addEventListener('click', function () {
    if (race && race.duel) { duelBackToLobby(); show('s-start'); }
    else if (race && race.mode === 'practice' && practiceKeys().length) startRace({ mode: 'practice' });
    else if (race && race.mode === 'reto') startRace({ mode: 'reto' });
    else startRace();
  });
  $('menu').addEventListener('click', function () {
    if (race && race.duel) duelLeave();
    show('s-start');
  });
  $('quit').addEventListener('click', function () {
    var wasDuel = race && race.duel && race.phase !== 'done';
    if (race) { race.dead = true; clearTimers(); }
    if (wasDuel) duelAbandon();
    show('s-start');
  });
  $('fb').addEventListener('click', skipWrong);
  document.addEventListener('keydown', function (e) {
    if (!race || $('s-race').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) { answer(n - 1); }
    else if (e.key === 'Enter' || e.key === ' ') {
      if (race.wrongLock) { e.preventDefault(); skipWrong(); }
    }
  });
  var rz = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (!$('s-start').hidden) startHero();
      else if (!$('s-race').hidden && race) view = fitCanvas($('cv'), raceHeight());
    }, 150);
  });

  renderRooms();
  if (!hashRoom) { var lr = loadRooms()[0]; if (lr) { $('roomcode').value = lr.c; $('obs').checked = !!lr.o; } }
  applyHash(); renderChips(); renderSeg(); updateStart(); renderCourse(); renderCourses();
  if (hashRoom) { $('roomcode').value = hashRoom; setMode('duel'); }
  /* el juego empieza preguntando el curso (salvo enlace de clase con temas fijados o enlace a una sala) */
  show(locked || hashRoom ? 's-start' : 's-course');
})();
