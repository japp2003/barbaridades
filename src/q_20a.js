/* Preguntas nuevas: eq1 (ecuaciones de 1.er grado), fin (matemáticas financieras), cpx (complejos), vec (vectores y rectas), pl (programación lineal) */
(function () {
  'use strict';

  /* ---------- ayudas comunes ---------- */
  function fixm(x) { return String(x).replace(/(^|[\s(⟨{=,:|])-(?=\d)/g, '$1−'); }
  function MK(t, q, a, w, e) { return mk(t, fixm(q), fixm(a), w.map(fixm), fixm(e)); }
  function chk(c, m) { if (!c) throw new Error('comprobación fallida: ' + m); }
  function isInt(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function D(x, k) { var f = Math.pow(10, k === undefined ? 2 : k); var v = Math.round(x * f) / f; if (v === 0) v = 0; return mn(String(v).replace('.', ',')); }
  function eur(c) {
    c = Math.round(c);
    var neg = c < 0; c = Math.abs(c);
    var e = Math.floor(c / 100), r = c % 100;
    return (neg ? '−' : '') + e + (r ? ',' + (r < 10 ? '0' + r : r) : '') + ' €';
  }
  function XE(v) { return 'x = ' + mn(v); }
  function par(v) { return v < 0 ? '(' + mn(v) + ')' : String(v); }
  function kx(k, v) { v = v || 'x'; return k === 1 ? v : k === -1 ? '−' + v : mn(k) + v; }
  function bb(r, x) { if (x && r.w.indexOf(x) >= 0) barb(r.q, x); return r; }
  function yrs(v) { return v === 1 ? '1 año' : v + ' años'; }
  function pt(a, b) { if (Array.isArray(a)) { b = a[1]; a = a[0]; } return '(' + mn(a) + ', ' + mn(b) + ')'; }
  /* ax + by + c */
  function lxy(a, b, c) {
    var out = '';
    [[a, 'x'], [b, 'y'], [c || 0, '']].forEach(function (p) {
      var k = p[0], v = p[1];
      if (k === 0) return;
      var ab = Math.abs(k), body = (ab === 1 && v ? '' : String(ab)) + v;
      if (out === '') out = (k < 0 ? '−' : '') + body;
      else out += (k < 0 ? ' − ' : ' + ') + body;
    });
    return out || '0';
  }
  function gen0(a, b, c) {
    var g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c)) || 1;
    a /= g; b /= g; c /= g;
    if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; c = -c; }
    return lxy(a, b, c) + ' = 0';
  }
  function yexp(m, n) { return 'y = ' + (poly([m, n]) || '0'); }
  /* raíz simplificada de n */
  function sq(n) {
    var k = 1;
    for (var i = Math.floor(Math.sqrt(n)); i >= 1; i--) if (n % (i * i) === 0) { k = i; break; }
    var m = n / (k * k);
    return m === 1 ? String(k) : (k === 1 ? '' : k) + '√{' + m + '}';
  }
  var MULT = { 2: 'doble', 3: 'triple', 4: 'cuádruple', 5: 'quíntuple' };
  /* BigInt para redondeos exactos */
  function bpow(b, n) { var r = BigInt(1); for (var i = 0; i < n; i++) r *= b; return r; }
  function rdivB(a, b) { return (BigInt(2) * a + b) / (BigInt(2) * b); }
  /* capital final en céntimos: C euros, tipo por periodo p diezmilésimas, m periodos */
  function comp(C, p, m) {
    var T = BigInt(10000);
    return Number(rdivB(BigInt(C * 100) * bpow(T + BigInt(p), m), bpow(T, m)));
  }

  /* ======================================================================
     eq1: Ecuaciones de primer grado (1.º-2.º ESO)
     ====================================================================== */

  /* a(x + b) = c */
  genr('eq1', function () {
    var a = ri(2, 6), b = nz(-7, 7), x = nz(-6, 9), c = a * (x + b);
    var q = 'Resuelve ' + a + '(' + poly([1, b]) + ') = ' + mn(c);
    var nd = (c - b) / a, bad = isInt(nd) && nd !== x ? XE(nd) : null, w = [];
    if (bad) w.push(bad);
    w.push(XE(x + 2 * b), XE(a * x), XE(-x), XE(x + 1));
    var r = MK('eq1', q, XE(x), w,
      'Se multiplica el ' + a + ' por cada término: ' + poly([a, a * b]) + ' = ' + mn(c) + ' → ' + a + 'x = ' + mn(a * x) + ' → x = ' + mn(x) + '.');
    return bb(r, bad);
  });

  /* a(x − b) − c(x + d) = e */
  genr('eq1', function () {
    var a = ri(3, 6), c = ri(1, a - 1), b = ri(1, 5), d = ri(1, 5), x = nz(-5, 8);
    var e = a * (x - b) - c * (x + d), k = a - c;
    chk(k * x === e + a * b + c * d, 'eq1 parentesis');
    var q = 'Resuelve ' + a + '(x − ' + b + ') − ' + (c === 1 ? '' : c) + '(x + ' + d + ') = ' + mn(e);
    var w = [], s1 = (e + a * b - c * d) / k, s2 = (e + a * b + d) / k;
    if (isInt(s1)) w.push(XE(s1));
    if (isInt(s2)) w.push(XE(s2));
    w.push(XE(-x), XE(x + 1), XE(x - 1));
    return MK('eq1', q, XE(x), w,
      'El − cambia el signo de todo el segundo paréntesis: ' + a + 'x − ' + a * b + ' − ' + kx(c) + ' − ' + c * d + ' = ' + mn(e) + ' → ' + kx(k) + ' = ' + mn(k * x) + (k === 1 ? '.' : ' → x = ' + mn(x) + '.'));
  });

  /* x/a + x/b = c */
  genr('eq1', function () {
    var pr = pick([[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 6], [3, 6], [4, 6]]), a = pr[0], b = pr[1];
    var L = a * b / gcd(a, b), x = L * ri(1, 3), c = x / a + x / b;
    var bad = XE(c * (a + b));
    var r = MK('eq1', 'Resuelve ⟨x|' + a + '⟩ + ⟨x|' + b + '⟩ = ' + c, XE(x), [bad, XE(c * L), XE(c * a * b), XE(x + L)],
      'Multiplicamos todo por el mcm, ' + L + ': ' + kx(L / a) + ' + ' + kx(L / b) + ' = ' + L * c + ' → ' + (L / a + L / b) + 'x = ' + L * c + ' → x = ' + x + '.');
    return bb(r, bad);
  });

  /* (x + A)/b = (x − C)/d */
  genr('eq1', function () {
    var b = ri(2, 5), d, p, x, A, C;
    do { d = ri(2, 5); } while (d === b);
    do { p = nz(-3, 4); x = nz(-6, 9); A = b * p - x; C = x - d * p; } while (A === 0 || C === 0);
    chk((b - d) * x === b * C + d * A, 'eq1 cruz');
    var w = [], s1 = -(d * C + b * A) / (b - d);
    if (isInt(s1)) w.push(XE(s1));
    w.push(XE(-x), XE(x + 1), XE(x - 1), XE(x + 2));
    return MK('eq1', 'Resuelve ⟨' + poly([1, A]) + '|' + b + '⟩ = ⟨' + poly([1, -C]) + '|' + d + '⟩', XE(x), w,
      'Multiplicamos en cruz: ' + d + '(' + poly([1, A]) + ') = ' + b + '(' + poly([1, -C]) + ') → ' + poly([d, d * A]) + ' = ' + poly([b, -b * C]) + ' → x = ' + mn(x) + '.');
  });

  /* comprobar soluciones */
  genr('eq1', function () {
    var a = ri(2, 5), c, b = ri(1, 6), x = nz(-4, 8);
    do { c = ri(1, 6); } while (c === a);
    var dd = a * (x - b) - c * x;
    chk(a * (x - b) === c * x + dd, 'eq1 comprobar');
    var w = [], s = (dd + b) / (a - c);
    if (isInt(s)) w.push(XE(s));
    w.push(XE(-x), XE(x + 1), XE(x + 2), XE(x - 1));
    return MK('eq1', '¿Cuál de estos valores es solución de ' + a + '(x − ' + b + ') = ' + poly([c, dd]) + '?', XE(x), w,
      'Al sustituir x = ' + mn(x) + ', los dos miembros valen ' + mn(a * (x - b)) + '. Con los otros valores no se cumple la igualdad.');
  });

  /* números consecutivos */
  genr('eq1', function () {
    if (Math.random() < 0.6) {
      var n = ri(4, 40), S = 3 * n + 3, k = ri(0, 2), names = ['el menor', 'el del medio', 'el mayor'];
      return MK('eq1', 'La suma de tres números consecutivos es ' + S + '. ¿Cuánto vale ' + names[k] + '?', String(n + k),
        [n, n + 1, n + 2, n + 3, n - 1].map(String),
        'x + (x + 1) + (x + 2) = ' + S + ' → 3x + 3 = ' + S + ' → x = ' + n + '. Son ' + n + ', ' + (n + 1) + ' y ' + (n + 2) + '.');
    }
    var m = ri(3, 30), S2 = 4 * m + 2, k2 = ri(0, 1);
    return MK('eq1', 'La suma de dos números pares consecutivos es ' + S2 + '. ¿Cuál es el ' + (k2 ? 'mayor' : 'menor') + '?', String(2 * m + 2 * k2),
      [2 * m + 2 * (1 - k2), 2 * m + 1, 2 * m + 4, 2 * m - 2].map(String),
      'x + (x + 2) = ' + S2 + ' → 2x + 2 = ' + S2 + ' → x = ' + 2 * m + '. Son ' + 2 * m + ' y ' + (2 * m + 2) + '.');
  });

  /* edades */
  genr('eq1', function () {
    if (Math.random() < 0.5) {
      var k = pick([2, 3]), h, x, P;
      do { h = ri(3, 12); x = ri(1, 15); P = k * (h + x) - x; } while (P < 26 || P > 60);
      chk((k - 1) * x === P - k * h, 'eq1 edades');
      var nums = [P - k * h, (P - h) / k, P / k - h, x + 1, x + 2, x - 1].filter(function (v) { return isInt(v) && v > 0 && v !== x; });
      return MK('eq1', 'Un padre tiene ' + P + ' años y su hijo ' + h + '. ¿Dentro de cuántos años la edad del padre será el ' + MULT[k] + ' de la del hijo?', yrs(x), nums.map(yrs),
        'Dentro de x años: ' + P + ' + x = ' + k + '(' + h + ' + x) → ' + P + ' + x = ' + k * h + ' + ' + k + 'x → ' + kx(k - 1) + ' = ' + (P - k * h) + (k === 2 ? '.' : ' → x = ' + x + '.'));
    }
    var k2 = pick([2, 3, 4]), bro = ri(3, 15), S = (k2 + 1) * bro, ask = ri(0, 1), ans = ask ? k2 * bro : bro;
    var cand = [ask ? bro : k2 * bro, S / k2, S / 2, ans + 1, ans - 1, ans + k2].filter(function (v) { return isInt(v) && v > 0; });
    return MK('eq1', 'Ana tiene el ' + MULT[k2] + ' de edad que su hermano y entre los dos suman ' + S + ' años. ¿Cuántos años tiene ' + (ask ? 'Ana' : 'su hermano') + '?', yrs(ans), cand.map(yrs),
      'Hermano: x; Ana: ' + k2 + 'x. Entonces x + ' + k2 + 'x = ' + S + ' → ' + (k2 + 1) + 'x = ' + S + ' → x = ' + bro + '. Ana tiene ' + k2 * bro + ' años.');
  });

  /* repartos */
  genr('eq1', function () {
    function E(v) { return D(v) + ' €'; }
    if (Math.random() < 0.5) {
      var B = 5 * ri(4, 40), dl = 5 * ri(1, 10), N = 2 * B + dl, ask = ri(0, 1), ans = ask ? B + dl : B;
      return MK('eq1', 'Se reparten ' + N + ' € entre Luis y Marta de forma que Luis recibe ' + dl + ' € más que Marta. ¿Cuánto recibe ' + (ask ? 'Luis' : 'Marta') + '?', E(ans),
        [E(ask ? B : B + dl), E(N / 2), E(N / 2 + dl), E(N - dl)],
        'Marta: x; Luis: x + ' + dl + '. Entonces 2x + ' + dl + ' = ' + N + ' → x = ' + B + ' €. Luis recibe ' + (B + dl) + ' €.');
    }
    var rt = pick([[1, 2, 3], [1, 2, 4], [1, 3, 4], [1, 2, 5], [1, 3, 5]]), u = 5 * ri(2, 20), tot = rt[0] + rt[1] + rt[2], N2 = tot * u, k = ri(1, 2);
    var names = ['el primero', 'el segundo', 'el tercero'], an = rt[k] * u;
    return MK('eq1', 'Se reparten ' + N2 + ' € entre tres hermanos: el segundo recibe el ' + MULT[rt[1]] + ' que el primero y el tercero el ' + MULT[rt[2]] + ' que el primero. ¿Cuánto recibe ' + names[k] + '?', E(an),
      [E(u), E(rt[3 - k] * u), E(N2 / 3), E(N2 - an), E(N2 / rt[k])],
      'x + ' + rt[1] + 'x + ' + rt[2] + 'x = ' + N2 + ' → ' + tot + 'x = ' + N2 + ' → x = ' + u + ' €. ' + names[k].charAt(0).toUpperCase() + names[k].slice(1) + ' recibe ' + rt[k] + ' · ' + u + ' = ' + an + ' €.');
  });

  /* número de soluciones: identidad, sin solución, una */
  genr('eq1', function () {
    var a = ri(2, 6), b = nz(-6, 6), t = ri(0, 2), c, d = a;
    if (t === 0) c = a * b;
    else if (t === 1) { do { c = nz(-15, 15); } while (c === a * b); }
    else { do { d = ri(1, 7); } while (d === a); c = nz(-12, 12); }
    var opts = ['Infinitas soluciones', 'Ninguna solución', 'Una solución'];
    var e = t === 0 ? 'Al operar: ' + poly([a, a * b]) + ' = ' + poly([a, c]) + ' → 0x = 0. Se cumple para cualquier x: es una identidad.'
      : t === 1 ? 'Al operar: ' + poly([a, a * b]) + ' = ' + poly([a, c]) + ' → 0x = ' + mn(c - a * b) + ', que no se cumple nunca.'
        : 'Los coeficientes de x son distintos (' + a + ' y ' + d + '): al despejar sale un único valor.';
    return MK('eq1', 'La ecuación ' + a + '(' + poly([1, b]) + ') = ' + poly([d, c]) + ' tiene', opts[t],
      opts.filter(function (o, i) { return i !== t; }).concat(['Dos soluciones']), e);
  });

  /* b − ax = c */
  genr('eq1', function () {
    var a = ri(2, 7), x = nz(-6, 8), b = ri(1, 15), c = b - a * x;
    var w = [XE(-x)], s = (b + c) / a;
    if (isInt(s)) w.push(XE(s));
    w.push(XE(c - b), XE(x + 1), XE(x - 1));
    return MK('eq1', 'Resuelve ' + b + ' − ' + a + 'x = ' + mn(c), XE(x), w,
      '−' + a + 'x = ' + mn(c) + ' − ' + b + ' = ' + mn(c - b) + ', y al dividir entre −' + a + ': x = ' + mn(x) + '.');
  });

  /* x/p − (x − A)/q = b  (el menos afecta a todo el numerador) */
  genr('eq1', function () {
    var pr = pick([[2, 3], [3, 2], [2, 5], [3, 4], [4, 3], [5, 2], [3, 5], [5, 3]]), p = pr[0], q = pr[1], L = p * q, m, n, x, A;
    do { m = nz(-4, 6); n = ri(-3, 5); x = p * m; A = x - q * n; } while (A <= 0);
    var bv = m - n;
    chk((q - p) * x + p * A === L * bv, 'eq1 denominadores');
    var w = [], s1 = (L * bv + p * A) / (q - p), s2 = (bv - p * A) / (q - p);
    if (isInt(s1)) w.push(XE(s1));
    if (isInt(s2)) w.push(XE(s2));
    w.push(XE(-x), XE(x + 1), XE(x - 1));
    var r = MK('eq1', 'Resuelve ⟨x|' + p + '⟩ − ⟨x − ' + A + '|' + q + '⟩ = ' + mn(bv), XE(x), w,
      'Multiplicamos por ' + L + ': ' + q + 'x − ' + p + '(x − ' + A + ') = ' + mn(L * bv) + '. El − afecta a todo el numerador: ' + q + 'x − ' + p + 'x + ' + p * A + ' = ' + mn(L * bv) + ' → x = ' + mn(x) + '.');
    r.p = 1;
    return r;
  });

  /* rectángulo */
  genr('eq1', function () {
    var w0 = ri(3, 15), dl = ri(1, 8), P = 2 * (2 * w0 + dl), ask = ri(0, 1), ans = ask ? w0 + dl : w0;
    function C(v) { return D(v) + ' cm'; }
    return MK('eq1', 'Un rectángulo tiene ' + P + ' cm de perímetro y el largo mide ' + dl + ' cm más que el ancho. ¿Cuánto mide el ' + (ask ? 'largo' : 'ancho') + '?', C(ans),
      [C(ask ? w0 : w0 + dl), C((P - dl) / 2), C(P / 4), C(P / 2 - dl), C(ans + dl)],
      'Ancho x, largo x + ' + dl + '. Medio perímetro: 2x + ' + dl + ' = ' + P / 2 + ' → x = ' + w0 + ' cm. El largo mide ' + (w0 + dl) + ' cm.');
  });

  /* problema de números */
  genr('eq1', function () {
    var k1 = ri(3, 5), k2 = ri(1, k1 - 1), x, a, b;
    do { x = ri(2, 15); a = ri(1, 20); b = (k1 - k2) * x - a; } while (b <= 0);
    var dk = k1 - k2;
    var w = [(b - a) / dk, a + b, (a + b) / (k1 + k2), x + 1, x - 1].filter(function (v) { return isInt(v) && v > 0; }).map(String);
    return MK('eq1', 'Si al ' + MULT[k1] + ' de un número le restas ' + a + ', obtienes ' + (k2 === 1 ? 'el número' : 'el ' + MULT[k2] + ' del número') + ' más ' + b + '. ¿Cuál es el número?', String(x), w,
      kx(k1) + ' − ' + a + ' = ' + kx(k2) + ' + ' + b + ' → ' + kx(dk) + ' = ' + (a + b) + ' → x = ' + x + '.');
  });

  add('eq1', 'Al quitar el paréntesis en 5 − (x − 3) queda', '5 − x + 3', ['5 − x − 3', '5 + x − 3', '5 + x + 3'],
    'El signo − delante del paréntesis cambia el signo de todos los términos de dentro.');
  barb('Al quitar el paréntesis en 5 − (x − 3) queda', '5 − x − 3');
  add('eq1', 'Si una ecuación se reduce a 0x = 7, la ecuación', 'No tiene solución', ['Tiene la solución x = 7', 'Tiene la solución x = 0', 'Tiene infinitas soluciones'],
    'Ningún número multiplicado por 0 da 7.');
  add('eq1', 'Si una ecuación se reduce a 0x = 0, la ecuación', 'Tiene infinitas soluciones', ['No tiene solución', 'Tiene la solución x = 0', 'Tiene la solución x = 1'],
    'Cualquier número por 0 da 0: es una identidad y vale cualquier x.');
  add('eq1', 'Para quitar denominadores en ⟨x|4⟩ + ⟨x|6⟩ = 5 se multiplica todo por el mcm, que es', '12', ['24', '10', '2'],
    'mcm(4, 6) = 12. Con 24 también se puede, pero no es el mínimo.');
  add('eq1', 'Dos ecuaciones son equivalentes si', 'Tienen las mismas soluciones', ['Tienen los mismos coeficientes', 'Tienen el mismo número de términos', 'Tienen la misma incógnita'],
    'Por ejemplo, 2x = 6 y x + 1 = 4 son equivalentes: las dos tienen la solución x = 3.');
  add('eq1', '¿Es x = 2 solución de 3x − 1 = 2x + 1?', 'Sí: los dos miembros valen 5', ['No: 5 ≠ 3', 'No: 6 ≠ 5', 'No: la solución es x = 0'],
    '3 · 2 − 1 = 5 y 2 · 2 + 1 = 5: se cumple la igualdad.');
  add('eq1', 'Tres números consecutivos se escriben', 'x, x + 1, x + 2', ['x, 2x, 3x', 'x, x^{2}, x^{3}', 'x, x + 2, x + 4'],
    'Cada número consecutivo es una unidad mayor que el anterior.');
  add('eq1', 'Si Luis tiene hoy x años, dentro de 5 años tendrá', 'x + 5', ['5x', 'x − 5', '⟨x|5⟩'],
    'Pasar 5 años es sumar 5 a la edad actual.');
  add('eq1', 'Si 5x = 0, entonces', 'x = 0', ['x = −5', 'No tiene solución', 'x = 5'],
    'El 5 pasa dividiendo: x = 0 : 5 = 0.');
  barb('Si 5x = 0, entonces', 'x = −5');
  add('eq1', 'Si ⟨x|3⟩ = 4, entonces', 'x = 12', ['x = ⟨4|3⟩', 'x = 1', 'x = 7'],
    'El 3 que divide pasa multiplicando: x = 4 · 3 = 12.');

  /* ======================================================================
     fin: Matemáticas financieras (1.º Bach CCSS)
     ====================================================================== */
  var CAP = { 2: 'semestral', 4: 'trimestral', 12: 'mensual' };
  function varp(v) { return v > 1e-9 ? 'Sube un ' + D(v) + ' %' : v < -1e-9 ? 'Baja un ' + D(-v) + ' %' : 'No varía'; }
  function pcb(bp) { bp = Math.round(bp); var r = bp % 100; return Math.floor(bp / 100) + ',' + (r < 10 ? '0' + r : r) + ' %'; }

  /* índice de variación */
  genr('fin', function () {
    var r = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 21, 25, 30, 35, 40, 45, 60, 75]), up = Math.random() < 0.5;
    var a = D(1 + (up ? 1 : -1) * r / 100);
    var w = up ? [D(1 - r / 100), D(r / 100), D(1 + r / 10)] : [D(1 + r / 100), D(r / 100), D(-r / 100)];
    return MK('fin', (up ? 'Aumentar' : 'Disminuir') + ' una cantidad un ' + r + ' % equivale a multiplicarla por', a, w,
      'Se multiplica por 1 ' + (up ? '+' : '−') + ' ' + D(r / 100) + ' = ' + a + ' (índice de variación).');
  });

  /* nuevo precio tras subida o bajada */
  genr('fin', function () {
    var P = 5 * ri(4, 60), r = pick([5, 10, 12, 15, 20, 25, 30, 40]), s = Math.random() < 0.5 ? 1 : -1, cents = P * (100 + s * r);
    return MK('fin', 'Un artículo de ' + P + ' € ' + (s > 0 ? 'sube' : 'baja') + ' un ' + r + ' %. ¿Cuál es su nuevo precio?', eur(cents),
      [eur(P * (100 - s * r)), eur(P * r), eur(P * 100 + s * r * 100), eur(P * (100 + s * 2 * r))],
      P + ' · ' + D(1 + s * r / 100) + ' = ' + eur(cents) + '.');
  });

  /* porcentajes encadenados */
  genr('fin', function () {
    var a = pick([10, 20, 25, 30, 40, 50]), b = pick([10, 20, 25, 30, 40, 50]), t = ri(0, 2), s1, s2;
    if (t === 0) { s1 = pick([1, -1]); s2 = -s1; } else if (t === 1) { s1 = s2 = 1; } else { s1 = s2 = -1; }
    var A = s1 * a, B = s2 * b, tot = A + B + A * B / 100;
    chk(Math.abs((1 + A / 100) * (1 + B / 100) - (1 + tot / 100)) < 1e-9, 'fin encadenados');
    function vb(s) { return s > 0 ? 'sube' : 'baja'; }
    var bad = varp(A + B);
    var r = MK('fin', 'Un precio ' + vb(s1) + ' un ' + a + ' % y después ' + vb(s2) + ' un ' + b + ' %. En total, el precio', varp(tot),
      [bad, varp(-tot), varp(A + B - A * B / 100), varp(A * B / 100)],
      'Los porcentajes no se suman: se multiplican los índices. ' + D(1 + A / 100) + ' · ' + D(1 + B / 100) + ' = ' + D(1 + tot / 100, 4) + '.');
    if (bad === 'No varía') bb(r, bad);
    return r;
  });

  /* precio sin IVA */
  genr('fin', function () {
    var t = pick([21, 21, 10, 4]), B = 5 * ri(4, 80), Pc = B * (100 + t);
    var bad = eur(Math.round(Pc * (100 - t) / 100));
    var r = MK('fin', 'Un artículo cuesta ' + eur(Pc) + ' con el ' + t + ' % de IVA incluido. ¿Cuál es su precio sin IVA?', eur(B * 100),
      [bad, eur(Pc - t * 100), eur(B * t)],
      'Precio con IVA = precio sin IVA · ' + D(1 + t / 100) + ', así que se divide: ' + eur(Pc) + ' : ' + D(1 + t / 100) + ' = ' + eur(B * 100) + '. Restar el ' + t + ' % del precio final no sirve.');
    return bb(r, bad);
  });

  /* interés simple */
  genr('fin', function () {
    if (Math.random() < 0.6) {
      var C = 500 * ri(2, 30), r = ri(2, 6), t = ri(2, 6), Ic = C * r * t, ask = ri(0, 1), Fc = comp(C, 100 * r, t);
      var e = 'I = C · r · t = ' + C + ' · ' + D(r / 100) + ' · ' + t + ' = ' + eur(Ic) + (ask ? '. Capital final: ' + C + ' € + ' + eur(Ic) + ' = ' + eur(C * 100 + Ic) + '.' : '.');
      if (ask) return MK('fin', 'Se invierten ' + C + ' € al ' + r + ' % de interés simple anual durante ' + t + ' años. ¿Qué capital final se obtiene?', eur(C * 100 + Ic),
        [eur(Fc), eur(Ic), eur(C * 100 + C * r)], e);
      return MK('fin', 'Se invierten ' + C + ' € al ' + r + ' % de interés simple anual durante ' + t + ' años. ¿Qué intereses se generan?', eur(Ic),
        [eur(C * 100 + Ic), eur(C * r), eur(Fc - C * 100)], e);
    }
    var C2 = 1200 * ri(1, 10), r2 = ri(2, 6), m = pick([3, 6, 8, 9, 18]), I2 = C2 * r2 * m / 12;
    chk(isInt(I2), 'fin meses');
    return MK('fin', '¿Qué intereses generan ' + C2 + ' € al ' + r2 + ' % de interés simple anual durante ' + m + ' meses?', eur(I2),
      [eur(C2 * r2 * m), eur(C2 * r2), eur(C2 * 100 + I2)],
      'El tiempo se pasa a años: I = ' + C2 + ' · ' + D(r2 / 100) + ' · ⟨' + m + '|12⟩ = ' + eur(I2) + '.');
  });

  /* interés compuesto (cálculo) */
  genr('fin', function () {
    var C = pick([1000, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000]), r = pick([2, 3, 4, 5, 6]), n = ri(2, 6);
    var Fc = comp(C, 100 * r, n), simple = C * 100 + C * r * n, ask = Math.random() < 0.7, res;
    chk(Math.abs(Fc / 100 - C * Math.pow(1 + r / 100, n)) < 0.01, 'fin compuesto');
    var e = 'Cf = ' + C + ' · ' + D(1 + r / 100) + '^{' + n + '} = ' + eur(Fc) + (ask ? '.' : '. Intereses: ' + eur(Fc) + ' − ' + C + ' € = ' + eur(Fc - C * 100) + '.');
    if (ask) res = MK('fin', 'Se depositan ' + C + ' € al ' + r + ' % de interés compuesto anual durante ' + n + ' años. ¿Cuál es el capital final?', eur(Fc),
      [eur(simple), eur(comp(C, 100 * r, n - 1)), eur(comp(C, 100 * r, n + 1)), eur(Fc - C * 100)], e);
    else res = MK('fin', 'Se depositan ' + C + ' € al ' + r + ' % de interés compuesto anual durante ' + n + ' años. ¿Cuántos intereses se generan?', eur(Fc - C * 100),
      [eur(simple - C * 100), eur(Fc), eur(comp(C, 100 * r, n - 1) - C * 100)], e);
    res.p = 1;
    return res;
  });

  /* expresión del capital final (anual o con capitalización k veces al año) */
  genr('fin', function () {
    var C = pick([1000, 2000, 3000, 5000, 6000, 8000, 10000]), k = pick([1, 1, 2, 4, 12]), n = ri(2, 6), r, q, a, w, e;
    if (k === 1) {
      r = pick([2, 3, 4, 5, 6, 7, 8, 2.5, 1.5, 3.5]);
      q = 'Capital final al invertir ' + C + ' € al ' + D(r) + ' % de interés compuesto anual durante ' + n + ' años:';
      a = C + ' · ' + D(1 + r / 100, 4) + '^{' + n + '}';
      w = [C + ' · (1 + ' + D(r / 100, 4) + ' · ' + n + ')', C + ' · ' + D(1 + r / 100, 4) + ' · ' + n, C + ' · ' + D(1 + r / 10, 4) + '^{' + n + '}', C + ' · ' + D(r / 100, 4) + '^{' + n + '}'];
      e = 'Cada año el capital se multiplica por 1 + ' + D(r / 100, 4) + ' = ' + D(1 + r / 100, 4) + ', y son ' + n + ' años.';
    } else {
      r = pick([2, 3, 4, 5, 6]);
      var rr = D(r / 100, 4);
      q = 'Capital final al invertir ' + C + ' € al ' + r + ' % nominal anual con capitalización ' + CAP[k] + ' durante ' + n + ' años:';
      a = C + ' · (1 + ⟨' + rr + '|' + k + '⟩)^{' + k * n + '}';
      w = [C + ' · (1 + ⟨' + rr + '|' + k + '⟩)^{' + n + '}', C + ' · (1 + ' + rr + ')^{' + k * n + '}', C + ' · (1 + ⟨' + r + '|' + k + '⟩)^{' + k * n + '}'];
      e = 'El tipo de cada periodo es ⟨' + rr + '|' + k + '⟩ y hay ' + k + ' · ' + n + ' = ' + k * n + ' periodos.';
    }
    return MK('fin', q, a, w, e);
  });

  /* TAE */
  genr('fin', function () {
    var o = pick([[3, 12], [6, 12], [9, 12], [12, 12], [2, 4], [4, 4], [5, 4], [6, 4], [8, 4], [10, 4], [4, 2], [5, 2], [6, 2], [8, 2], [10, 2]]);
    var r = o[0], k = o[1], p = r * 100 / k;
    chk(isInt(p), 'fin tae p');
    var T = BigInt(10000), bp = Number(rdivB(T * (bpow(T + BigInt(p), k) - bpow(T, k)), bpow(T, k)));
    chk(Math.abs(bp / 10000 - (Math.pow(1 + r / 100 / k, k) - 1)) < 1e-4, 'fin tae');
    var w = [pcb(r * 100), pcb(100 * r / k)];
    [2, 4, 12].forEach(function (k2) { if (k2 !== k) w.push(pcb(10000 * (Math.pow(1 + r / 100 / k2, k2) - 1))); });
    var res = MK('fin', 'Un depósito ofrece un ' + r + ' % nominal anual con capitalización ' + CAP[k] + '. ¿Cuál es su TAE?', pcb(bp), w,
      'TAE = (1 + ' + D(p / 10000, 6) + ')^{' + k + '} − 1 = ' + D(bp / 10000, 4) + ' → ' + pcb(bp) + '. Es algo mayor que el tipo nominal.');
    res.p = 1;
    return res;
  });

  /* precio original tras una rebaja */
  genr('fin', function () {
    var O = 10 * ri(3, 40), d = pick([10, 15, 20, 25, 30, 40, 50]), Pc = O * (100 - d);
    var bad = eur(Math.round(Pc * (100 + d) / 100));
    var r = MK('fin', 'Tras una rebaja del ' + d + ' %, un artículo cuesta ' + eur(Pc) + '. ¿Cuál era su precio original?', eur(O * 100),
      [bad, eur(Pc + d * 100), eur(Math.round(Pc * 100 / (100 + d)))],
      'Precio rebajado = original · ' + D(1 - d / 100) + ', así que original = ' + eur(Pc) + ' : ' + D(1 - d / 100) + ' = ' + eur(O * 100) + '. Sumar el ' + d + ' % al precio rebajado no devuelve el original.');
    return bb(r, bad);
  });

  /* variación porcentual entre dos precios */
  genr('fin', function () {
    var A = pick([20, 40, 50, 80, 100, 120, 150, 200, 250, 400, 500]), v = pick([-50, -40, -30, -25, -20, -15, -10, -5, 5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]);
    var Bc = A * (100 + v);
    return MK('fin', 'Un precio pasa de ' + A + ' € a ' + eur(Bc) + '. ¿Qué variación porcentual ha sufrido?', varp(v),
      [varp((Bc - A * 100) / Bc * 100), varp(-v), varp((Bc - A * 100) / 100), varp(100 + v)],
      'Se divide la diferencia entre el precio inicial: (' + eur(Bc) + ' − ' + A + ' €) : ' + A + ' € = ' + D(v / 100) + ', es decir, ' + varp(v).toLowerCase() + '.');
  });

  /* interés simple: hallar el tipo o el tiempo */
  genr('fin', function () {
    var C = 500 * ri(2, 20), r = ri(2, 8), t = ri(2, 6), I = C * r * t / 100;
    chk(isInt(I), 'fin I');
    if (Math.random() < 0.5) {
      return MK('fin', '¿A qué tipo de interés simple anual hay que invertir ' + C + ' € para obtener ' + I + ' € de intereses en ' + t + ' años?', r + ' %',
        [D(100 * I / C) + ' %', D(I / (C * t)) + ' %', (r + 1) + ' %', D(100 * I * t / C) + ' %'],
        'I = C · r · t → r = ' + I + ' : (' + C + ' · ' + t + ') = ' + D(r / 100) + ', es decir, un ' + r + ' %.');
    }
    var cand = [r * t, t + 1, t - 1, I / r].filter(function (v) { return isInt(v) && v > 0 && v !== t; });
    return MK('fin', '¿Cuántos años debe estar invertido un capital de ' + C + ' € al ' + r + ' % de interés simple para generar ' + I + ' € de intereses?', yrs(t), cand.map(yrs),
      't = ⟨I|C · r⟩ = ⟨' + I + '|' + C + ' · ' + D(r / 100) + '⟩ = ' + t + ' años.');
  });

  /* préstamos: amortización constante y fórmula de la anualidad */
  genr('fin', function () {
    if (Math.random() < 0.5) {
      var n = pick([4, 5, 8, 10]), C = n * 1000 * ri(1, 6), i = ri(2, 6), first = C / n + C * i / 100;
      return MK('fin', 'Préstamo de ' + C + ' € al ' + i + ' % anual que se devuelve en ' + n + ' años con amortización constante (la misma parte de capital cada año). ¿Cuál es la primera cuota?', first + ' €',
        [C / n + ' €', (C / n + C * i / 100 * n) + ' €', D((C + C * i / 100) / n) + ' €', C * i / 100 + ' €'],
        'Cada año se devuelven ' + C + ' : ' + n + ' = ' + C / n + ' € de capital, y el primer año se pagan intereses de todo lo prestado: ' + C + ' · ' + D(i / 100) + ' = ' + C * i / 100 + ' €. Total: ' + first + ' €.');
    }
    var C2 = pick([6000, 10000, 12000, 20000]), i2 = pick([2, 3, 4, 5, 6]), n2 = pick([5, 8, 10, 15, 20]), ii = D(i2 / 100), f = D(1 + i2 / 100);
    return MK('fin', 'Anualidad (cuota anual constante, sistema francés) de un préstamo de ' + C2 + ' € al ' + i2 + ' % anual a ' + n2 + ' años:', '⟨' + C2 + ' · ' + ii + '|1 − ' + f + '^{−' + n2 + '}⟩',
      ['⟨' + C2 + ' · ' + ii + '|1 + ' + f + '^{−' + n2 + '}⟩', '⟨' + C2 + ' · ' + f + '^{' + n2 + '}|' + n2 + '⟩', '⟨' + C2 + ' · ' + ii + '|1 − ' + f + '^{' + n2 + '}⟩'],
      'a = C · i : (1 − (1 + i)^{−n}), con C = ' + C2 + ', i = ' + ii + ' y n = ' + n2 + '.');
  });

  add('fin', 'Un aumento del 21 % equivale a multiplicar por', '1,21', ['0,21', '21', '0,79'], 'Se multiplica por 1 + 0,21 = 1,21.');
  add('fin', 'Una rebaja del 15 % equivale a multiplicar por', '0,85', ['1,15', '0,15', '−0,15'], 'Queda el 85 % del precio: se multiplica por 1 − 0,15 = 0,85.');
  add('fin', 'Si un precio sube un 10 % y después baja un 10 %, el precio final', 'Es un 1 % menor', ['Es igual al inicial', 'Es un 1 % mayor', 'Es un 10 % menor'],
    '1,1 · 0,9 = 0,99: el precio queda en el 99 % del inicial.');
  barb('Si un precio sube un 10 % y después baja un 10 %, el precio final', 'Es igual al inicial');
  add('fin', 'En interés simple, los intereses de cada año', 'Son siempre los mismos', ['Crecen cada año', 'Disminuyen cada año', 'Se duplican cada año'],
    'Se calculan siempre sobre el capital inicial: C · r cada año.');
  add('fin', 'En interés compuesto, los intereses de cada periodo', 'Se suman al capital', ['Se retiran al final del periodo', 'Son siempre iguales', 'No generan más intereses'],
    'Se acumulan al capital y en el periodo siguiente también producen intereses.');
  add('fin', 'Con capitalización mensual y un tipo nominal positivo, la TAE es', 'Mayor que el tipo nominal', ['Menor que el tipo nominal', 'Igual al tipo nominal', 'La doceava parte del nominal'],
    'Los intereses de cada mes generan a su vez intereses, así que el rendimiento anual efectivo supera al nominal.');
  add('fin', 'Un 0,5 % mensual corresponde a un tipo nominal anual del', '6 %', ['0,5 %', '5 %', '60 %'],
    'Nominal anual = 0,5 % · 12 = 6 %. La TAE sería algo mayor (6,17 %).');
  add('fin', 'En un préstamo por el sistema francés (cuotas iguales), las primeras cuotas pagan sobre todo', 'Intereses', ['Capital', 'Comisiones', 'Impuestos'],
    'Al principio la deuda es grande y los intereses también; con el tiempo crece la parte de capital.');
  add('fin', 'La fórmula del capital final a interés compuesto es', 'C · (1 + r)^{n}', ['C · (1 + r · n)', 'C · r^{n}', 'C · (1 + n)^{r}'],
    'Cada periodo el capital se multiplica por (1 + r); tras n periodos, por (1 + r)^{n}. C · (1 + r · n) es el interés simple.');
  add('fin', 'Pasar de 80 € a 100 € supone una subida del', '25 %', ['20 %', '80 %', '125 %'],
    'La subida, 20 €, se compara con el precio inicial: 20 : 80 = 0,25.');
  add('fin', 'La TAE sirve sobre todo para', 'Comparar productos financieros', ['Calcular el IVA', 'Saber el plazo de un préstamo', 'Calcular la inflación'],
    'Expresa en una misma escala anual el coste o rendimiento real, aunque la capitalización sea distinta.');

  /* ======================================================================
     cpx: Números complejos (1.º Bach Ciencias)
     ====================================================================== */
  function cx(a, b) {
    if (b === 0) return mn(a);
    var im = (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'i';
    if (a === 0) return (b < 0 ? '−' : '') + im;
    return mn(a) + (b < 0 ? ' − ' : ' + ') + im;
  }
  function cfr(rn, inn, den) {
    var re = rn === 0 ? '' : f_fr(rn, den), ia = Math.abs(inn);
    if (ia === 0) return re || '0';
    var imS = f_fr(ia, den); imS = (imS === '1' ? '' : imS) + 'i';
    if (!re) return (inn < 0 ? '−' : '') + imS;
    return re + (inn < 0 ? ' − ' : ' + ') + imS;
  }
  function pol(r, a) { return r + '_{' + a + '°}'; }
  var QN = ['primer', 'segundo', 'tercer', 'cuarto'];
  /* componentes con √3: k o k√3 */
  function term(k, s3) { return (k === 1 && s3 ? '' : String(k)) + (s3 ? '√{3}' : ''); }
  function imt(k, s3) { return (k === 1 ? '' : String(k)) + (s3 ? '√{3}' : '') + 'i'; }
  function zs(sr, kr, r3, si, ki, i3) {
    var re = kr === 0 ? '' : (sr < 0 ? '−' : '') + term(kr, r3);
    if (ki === 0) return re || '0';
    if (!re) return (si < 0 ? '−' : '') + imt(ki, i3);
    return re + (si < 0 ? ' − ' : ' + ') + imt(ki, i3);
  }
  /* complejo notable: devuelve {z, r, ang, ref, re2, im2} */
  function notable(fam) {
    var k = ri(1, 3), sx = pick([1, -1]), sy = pick([1, -1]), ref, ang, z, r, re2, im2, fq = [];
    function qa(rf, a, b) { return a > 0 ? (b > 0 ? rf : 360 - rf) : (b > 0 ? 180 - rf : 180 + rf); }
    if (fam === 'eje') {
      var j = ri(0, 3); ang = 90 * j; r = String(k);
      z = [cx(k, 0), cx(0, k), cx(-k, 0), cx(0, -k)][j];
      return { z: z, r: r, ang: ang, fam: [0, 90, 180, 270], k: k, eje: j };
    }
    if (fam === 45) {
      ref = 45; ang = qa(45, sx, sy); z = cx(sx * k, sy * k); r = sq(2 * k * k); re2 = k * k; im2 = k * k;
    } else if (fam === 30) {
      ref = 30; ang = qa(30, sx, sy); z = zs(sx, k, true, sy, k, false); r = String(2 * k); re2 = 3 * k * k; im2 = k * k;
    } else {
      ref = 60; ang = qa(60, sx, sy); z = zs(sx, k, false, sy, k, true); r = String(2 * k); re2 = k * k; im2 = 3 * k * k;
    }
    [1, -1].forEach(function (a) { [1, -1].forEach(function (b) { fq.push(qa(ref, a, b)); }); });
    return { z: z, r: r, ang: ang, ref: ref, re2: re2, im2: im2, fam: fq, k: k, sx: sx, sy: sy };
  }
  function quad(a) { return QN[Math.floor(a / 90)]; }

  /* i^n */
  genr('cpx', function () {
    var n = ri(5, 150), r = n % 4, vals = ['1', 'i', '−1', '−i'];
    return MK('cpx', 'i^{' + n + '} =', vals[r], vals.filter(function (v, j) { return j !== r; }),
      n + ' = 4 · ' + Math.floor(n / 4) + ' + ' + r + ', así que i^{' + n + '} = i^{' + r + '} = ' + vals[r] + '.');
  });

  /* suma y resta */
  genr('cpx', function () {
    var a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9), plus = Math.random() < 0.5;
    var re = plus ? a + c : a - c, im = plus ? b + d : b - d;
    var w = plus ? [cx(a + c, b - d), cx(a - c, b + d), cx(a + d, b + c)] : [cx(a - c, b + d), cx(a + c, b - d), cx(a + c, b + d)];
    return MK('cpx', '(' + cx(a, b) + ') ' + (plus ? '+' : '−') + ' (' + cx(c, d) + ') =', cx(re, im), w,
      'Parte real: ' + mn(a) + (plus ? ' + ' : ' − ') + par(c) + ' = ' + mn(re) + '. Parte imaginaria: ' + mn(b) + (plus ? ' + ' : ' − ') + par(d) + ' = ' + mn(im) + '.');
  });

  /* producto */
  genr('cpx', function () {
    var a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-6, 6);
    var bad = cx(a * c, b * d);
    var r = MK('cpx', '(' + cx(a, b) + ')(' + cx(c, d) + ') =', cx(a * c - b * d, a * d + b * c),
      [bad, cx(a * c + b * d, a * d + b * c), cx(a * c - b * d, a * d - b * c), cx(a * c + b * d, a * d - b * c)],
      'Se multiplica como dos binomios y se usa i^{2} = −1. Real: ' + par(a) + ' · ' + par(c) + ' − ' + par(b) + ' · ' + par(d) + ' = ' + mn(a * c - b * d) + '. Imaginaria: ' + par(a) + ' · ' + par(d) + ' + ' + par(b) + ' · ' + par(c) + ' = ' + mn(a * d + b * c) + '.');
    return bb(r, bad);
  });

  /* conjugado y z · z̄ */
  genr('cpx', function () {
    var a = nz(-8, 8), b = nz(-8, 8);
    if (Math.random() < 0.5) {
      return MK('cpx', 'El conjugado de ' + cx(a, b) + ' es', cx(a, -b), [cx(-a, b), cx(-a, -b), cx(b, a)],
        'El conjugado conserva la parte real y cambia el signo de la imaginaria.');
    }
    return MK('cpx', 'Si z = ' + cx(a, b) + ', entonces z · z̄ =', String(a * a + b * b),
      [mn(a * a - b * b), cx(a * a - b * b, 2 * a * b), String((a + b) * (a + b)), mn(-(a * a + b * b))],
      'z · z̄ = a^{2} + b^{2} = ' + a * a + ' + ' + b * b + ' = ' + (a * a + b * b) + ' (siempre un número real positivo).');
  });

  /* división */
  genr('cpx', function () {
    if (Math.random() < 0.6) {
      var p = nz(-5, 5), qv = nz(-5, 5), c = nz(-4, 4), d = nz(-4, 4);
      var nr = p * c - qv * d, ni = p * d + qv * c, w = [cx(p, -qv), cx(qv, p), cx(-p, qv), cx(-p, -qv), cx(-qv, p)];
      if (nr !== 0 && ni !== 0 && isInt(nr / c) && isInt(ni / d)) w.push(cx(nr / c, ni / d));
      if (nr === 0 && ni === 0) return MK('cpx', '', '', [], '');
      return MK('cpx', '⟨' + cx(nr, ni) + '|' + cx(c, d) + '⟩ =', cx(p, qv), w,
        'Se multiplica arriba y abajo por el conjugado del denominador, ' + cx(c, -d) + '. El denominador queda ' + c * c + ' + ' + d * d + ' = ' + (c * c + d * d) + ' y el resultado es ' + cx(p, qv) + '.');
    }
    var k = ri(1, 5), a = nz(-3, 3), b = nz(-3, 3), s = a * a + b * b;
    var w2 = [cfr(k * a, k * b, s), cfr(-k * a, -k * b, s), cfr(k * b, -k * a, s)];
    if (a * a !== b * b) w2.unshift(cfr(k * a, -k * b, a * a - b * b));
    return MK('cpx', '⟨' + k + '|' + cx(a, b) + '⟩ =', cfr(k * a, -k * b, s), w2,
      'Se multiplica arriba y abajo por el conjugado ' + cx(a, -b) + ': el denominador es ' + a * a + ' + ' + b * b + ' = ' + s + ' y queda ' + cfr(k * a, -k * b, s) + '.');
  });

  /* módulo */
  genr('cpx', function () {
    var T = pick([[3, 4], [6, 8], [5, 12], [8, 15], [1, 1], [1, 2], [2, 3], [1, 3], [2, 2], [3, 3], [2, 4], [0, 5], [7, 24], [9, 12]]);
    if (Math.random() < 0.5) T = [T[1], T[0]];
    var a = T[0] * (T[0] ? pick([1, -1]) : 1), b = T[1] * (T[1] ? pick([1, -1]) : 1), s = a * a + b * b, ans = sq(s);
    var bad = String(Math.abs(a) + Math.abs(b)), w = [bad, String(s), sq(Math.abs(a) + Math.abs(b))];
    if (a * a !== b * b) w.push(sq(Math.abs(a * a - b * b)));
    if (a === 0 || b === 0) w.unshift(cx(a, b));
    var r = MK('cpx', '|' + cx(a, b) + '| =', ans, w,
      '|a + bi| = √{a^{2} + b^{2}} = √{' + a * a + ' + ' + b * b + '} = ' + ans + '.');
    return bb(r, bad);
  });

  /* argumento de casos notables */
  genr('cpx', function () {
    var N = notable(pick(['eje', 45, 45, 30, 60]));
    var w = N.fam.filter(function (x) { return x !== N.ang; }).map(function (x) { return x + '°'; });
    var e = N.eje !== undefined ? 'El afijo está sobre el semieje ' + ['real positivo', 'imaginario positivo', 'real negativo', 'imaginario negativo'][N.eje] + ': α = ' + N.ang + '°.'
      : 'El afijo está en el ' + quad(N.ang) + ' cuadrante y el ángulo de referencia es ' + N.ref + '°, así que α = ' + N.ang + '°.';
    return MK('cpx', 'El argumento de z = ' + N.z + ' es', N.ang + '°', w, e);
  });

  /* binómica → polar */
  genr('cpx', function () {
    var N = notable(pick(['eje', 45, 45, 30, 60])), w = [];
    N.fam.forEach(function (x) { if (x !== N.ang) w.push(pol(N.r, x)); });
    if (N.eje === undefined) {
      w = shuffle(w).slice(0, 2);
      w.unshift(pol(N.ref === 45 ? String(2 * N.k) : sq(2 * N.k * N.k), N.ang));
    }
    var e = N.eje !== undefined ? 'Módulo ' + N.k + '; el afijo está sobre un eje y α = ' + N.ang + '°.'
      : 'r = √{' + N.re2 + ' + ' + N.im2 + '} = ' + N.r + ' y α = ' + N.ang + '° (' + quad(N.ang) + ' cuadrante).';
    return MK('cpx', 'z = ' + N.z + ' en forma polar es', pol(N.r, N.ang), w, e);
  });

  /* polar → binómica */
  genr('cpx', function () {
    var fam = pick(['eje', 45, 30, 60]), N = notable(fam), w = [];
    if (N.eje !== undefined) {
      var all = [cx(N.k, 0), cx(0, N.k), cx(-N.k, 0), cx(0, -N.k)];
      w = all.filter(function (x, j) { return j !== N.eje; });
    } else {
      var r3 = fam === 30, i3 = fam === 60, k = N.k;
      if (fam !== 45) w.push(zs(N.sx, k, !r3, N.sy, k, !i3));
      w.push(zs(-N.sx, k, r3, N.sy, k, i3), zs(N.sx, k, r3, -N.sy, k, i3), zs(-N.sx, k, r3, -N.sy, k, i3));
    }
    return MK('cpx', 'z = ' + pol(N.r, N.ang) + ' en forma binómica es', N.z, w,
      'z = ' + N.r + '(cos ' + N.ang + '° + i sen ' + N.ang + '°) = ' + N.z + '.');
  });

  /* raíces complejas de ecuaciones de 2.º grado */
  genr('cpx', function () {
    if (Math.random() < 0.55) {
      var a = pick([1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 2, 3, 5, 8, 12, 18, 20]), s = sq(a);
      var si = (s === '1' ? '' : s) + 'i', bad = 'x = ±' + s;
      var r = MK('cpx', 'Soluciones complejas de x^{2} + ' + a + ' = 0:', 'x = ±' + si, [bad, 'x = ±' + a + 'i', 'No tiene solución', 'Solo x = ' + si],
        'x^{2} = −' + a + ' → x = ±√{−' + a + '} = ±' + si + ', porque √{−1} = i.');
      return bb(r, bad);
    }
    var p = nz(-4, 4), q = ri(1, 4), qi = (q === 1 ? '' : q) + 'i';
    return MK('cpx', 'Soluciones de ' + poly([1, -2 * p, p * p + q * q]) + ' = 0:', 'x = ' + mn(p) + ' ± ' + qi,
      ['x = ' + mn(-p) + ' ± ' + qi, 'x = ' + mn(p) + ' ± ' + q, 'x = ' + mn(p) + ' ± ' + 2 * q + 'i', 'x = ' + mn(2 * p) + ' ± ' + 2 * q + 'i'],
      'Δ = ' + 4 * p * p + ' − ' + 4 * (p * p + q * q) + ' = −' + 4 * q * q + ', √Δ = ' + 2 * q + 'i y x = ⟨' + mn(2 * p) + ' ± ' + 2 * q + 'i|2⟩ = ' + mn(p) + ' ± ' + qi + '.');
  });

  /* operaciones en forma polar */
  genr('cpx', function () {
    var A = [30, 45, 60, 90, 120, 135, 150, 210, 240, 270, 300, 315, 330], v = ri(0, 2), al = pick(A.concat([180])), be = pick(A);
    function m(x) { return ((x % 360) + 360) % 360; }
    if (v === 0) {
      var r = ri(2, 5), s = ri(2, 5);
      return MK('cpx', pol(r, al) + ' · ' + pol(s, be) + ' =', pol(r * s, m(al + be)),
        [pol(r + s, m(al + be)), pol(r * s, m(al - be)), pol(r + s, m(al - be))],
        'Se multiplican los módulos (' + r + ' · ' + s + ' = ' + r * s + ') y se suman los argumentos (' + al + '° + ' + be + '° = ' + (al + be) + '°' + (al + be >= 360 ? ' = ' + m(al + be) + '°' : '') + ').');
    }
    if (v === 1) {
      var s2 = ri(2, 4), r2 = s2 * ri(2, 4);
      return MK('cpx', '⟨' + pol(r2, al) + '|' + pol(s2, be) + '⟩ =', pol(r2 / s2, m(al - be)),
        [pol(r2 / s2, m(al + be)), pol(r2 - s2, m(al - be)), pol(r2 * s2, m(al - be))],
        'Se dividen los módulos (' + r2 + ' : ' + s2 + ' = ' + r2 / s2 + ') y se restan los argumentos (' + al + '° − ' + be + '° = ' + mn(al - be) + '°' + (al - be < 0 ? ' = ' + m(al - be) + '°' : '') + ').');
    }
    var r3 = ri(1, 3), n = ri(2, 4), a3 = pick([15, 30, 45, 60, 90, 120]), R3 = Math.pow(r3, n);
    return MK('cpx', '(' + pol(r3, a3) + ')^{' + n + '} =', pol(R3, m(n * a3)),
      [pol(r3 * n, m(n * a3)), pol(R3, a3), pol(r3 * n, a3)],
      'Fórmula de De Moivre: el módulo se eleva a ' + n + ' (' + R3 + ') y el argumento se multiplica por ' + n + ' (' + n * a3 + '°' + (n * a3 >= 360 ? ' = ' + m(n * a3) + '°' : '') + ').');
  });

  /* parte real / imaginaria */
  genr('cpx', function () {
    var a = nz(-9, 9), b = nz(-9, 9), z = cx(a, b);
    if (Math.random() < 0.6) return MK('cpx', 'La parte imaginaria de z = ' + z + ' es', mn(b), [cx(0, b), mn(a), mn(-b)],
      'En z = a + bi, la parte imaginaria es el número b, sin la i: Im(z) = ' + mn(b) + '.');
    return MK('cpx', 'La parte real de z = ' + z + ' es', mn(a), [mn(b), mn(-a), cx(0, b), mn(-b)],
      'En z = a + bi, la parte real es a: Re(z) = ' + mn(a) + '.');
  });

  /* cuadrado de un complejo */
  genr('cpx', function () {
    var a = nz(-5, 5), b = nz(-5, 5);
    var bad = cx(a * a, b * b);
    var r = MK('cpx', '(' + cx(a, b) + ')^{2} =', cx(a * a - b * b, 2 * a * b),
      [bad, cx(a * a + b * b, 2 * a * b), mn(a * a - b * b), cx(a * a - b * b, a * b)],
      '(a + bi)^{2} = a^{2} + 2abi + b^{2}i^{2} = (a^{2} − b^{2}) + 2abi: ' + a * a + ' − ' + b * b + ' = ' + mn(a * a - b * b) + ' y 2 · ' + par(a) + ' · ' + par(b) + ' = ' + mn(2 * a * b) + '.');
    return bb(r, bad);
  });

  add('cpx', 'i^{2} =', '−1', ['1', 'i', '−i'], 'Por definición, i = √{−1}, así que i^{2} = −1.');
  barb('i^{2} =', '1');
  add('cpx', '√{−16} =', '4i', ['−4', '4', '16i'], '√{−16} = √{16} · √{−1} = 4i.');
  add('cpx', 'El conjugado de 5i es', '−5i', ['5', '−5', '5i'], 'La parte real es 0 y se cambia el signo de la imaginaria.');
  add('cpx', 'Un complejo de la forma bi, con b ≠ 0, se llama', 'Imaginario puro', ['Real', 'Conjugado', 'Opuesto'], 'Su parte real es 0.');
  add('cpx', 'Para cualquier complejo z, z + z̄ es', 'Un número real', ['Un imaginario puro', 'Siempre 0', 'El doble de z'],
    '(a + bi) + (a − bi) = 2a: las partes imaginarias se anulan.');
  add('cpx', 'El módulo de z = a + bi es', '√{a^{2} + b^{2}}', ['a + b', 'a^{2} + b^{2}', '√{a^{2} − b^{2}}'],
    'Es la distancia del afijo (a, b) al origen: teorema de Pitágoras.');
  add('cpx', 'Multiplicar un complejo por i equivale a girarlo', '90° en sentido antihorario', ['90° en sentido horario', '180°', '45° en sentido antihorario'],
    'i = 1_{90°}: el módulo no cambia y al argumento se le suman 90°.');
  add('cpx', 'Una ecuación de 2.º grado con coeficientes reales tiene la raíz 2 + 3i. La otra raíz es', '2 − 3i', ['−2 + 3i', '−2 − 3i', '3 + 2i'],
    'Las raíces complejas de una ecuación con coeficientes reales van por parejas conjugadas.');
  add('cpx', '⟨1|i⟩ =', '−i', ['i', '1', '−1'], 'Multiplicando arriba y abajo por i: ⟨i|i^{2}⟩ = ⟨i|−1⟩ = −i.');
  add('cpx', 'El opuesto de 3 − 2i es', '−3 + 2i', ['3 + 2i', '−3 − 2i', '2 − 3i'], 'El opuesto cambia el signo de las dos partes (3 + 2i sería el conjugado).');

  /* ======================================================================
     vec: Vectores y rectas en el plano (4.º ESO B y 1.º Bach)
     ====================================================================== */
  function cross(u, v) { return u[0] * v[1] - u[1] * v[0]; }
  function sh(vr, v0) { return v0 === 0 ? vr : vr + (v0 > 0 ? ' − ' + v0 : ' + ' + (-v0)); }

  /* vector entre dos puntos */
  genr('vec', function () {
    var ax = ri(-6, 8), ay = ri(-6, 8), bx, by;
    do { bx = ri(-6, 8); by = ri(-6, 8); } while (bx === ax || by === ay);
    return MK('vec', 'Si A = ' + pt(ax, ay) + ' y B = ' + pt(bx, by) + ', el vector AB⃗ es', pt(bx - ax, by - ay),
      [pt(ax - bx, ay - by), pt(ax + bx, ay + by), pt(by - ay, bx - ax)],
      'AB⃗ = B − A = (' + bx + ' − ' + par(ax) + ', ' + by + ' − ' + par(ay) + ') = ' + pt(bx - ax, by - ay) + '.');
  });

  /* módulo y distancia entre puntos */
  genr('vec', function () {
    var T = pick([[3, 4], [6, 8], [5, 12], [8, 6], [1, 1], [1, 2], [2, 3], [1, 3], [2, 2], [3, 1], [4, 2], [9, 12], [0, 5]]);
    if (Math.random() < 0.5) T = [T[1], T[0]];
    var a = T[0] * (T[0] ? pick([1, -1]) : 1), b = T[1] * (T[1] ? pick([1, -1]) : 1), s = a * a + b * b, ans = sq(s), q;
    if (Math.random() < 0.5) q = 'El módulo de u⃗ = ' + pt(a, b) + ' es';
    else { var x0 = ri(-5, 5), y0 = ri(-5, 5); q = 'La distancia entre A = ' + pt(x0, y0) + ' y B = ' + pt(x0 + a, y0 + b) + ' es'; }
    var w = [String(Math.abs(a) + Math.abs(b)), String(s), sq(Math.abs(a) + Math.abs(b))];
    if (a * a !== b * b) w.splice(2, 0, sq(Math.abs(a * a - b * b)));
    return MK('vec', q, ans, w, 'Con las componentes ' + pt(a, b) + ': √{' + a * a + ' + ' + b * b + '} = ' + ans + '.');
  });

  /* producto escalar */
  genr('vec', function () {
    var a = nz(-5, 6), b = nz(-5, 6), c = nz(-5, 6), d = nz(-5, 6);
    var bad = pt(a * c, b * d);
    var r = MK('vec', 'u⃗ = ' + pt(a, b) + ', v⃗ = ' + pt(c, d) + '. El producto escalar u⃗ · v⃗ =', mn(a * c + b * d),
      [bad, mn(a * c - b * d), mn(a * d + b * c)],
      'u⃗ · v⃗ = ' + par(a) + ' · ' + par(c) + ' + ' + par(b) + ' · ' + par(d) + ' = ' + mn(a * c + b * d) + ' (es un número, no un vector).');
    return bb(r, bad);
  });

  /* perpendicularidad: hallar k */
  genr('vec', function () {
    var a = nz(-5, 5), b = nz(-5, 5), t = nz(-3, 3), k = -t * b;
    chk(a * k + b * t * a === 0, 'vec perp');
    var w = [mn(t * b)], kp = t * a * a / b;
    if (isInt(kp)) w.push(mn(kp));
    w.push(mn(-t * a), mn(t * a));
    return MK('vec', 'Para que u⃗ = ' + pt(a, b) + ' y v⃗ = (k, ' + mn(t * a) + ') sean perpendiculares, k =', mn(k), w,
      'Perpendiculares ⇔ u⃗ · v⃗ = 0: ' + kx(a, 'k') + ' + ' + par(b) + ' · ' + par(t * a) + ' = 0 → k = ' + mn(k) + '.');
  });

  /* ángulo entre vectores (casos notables) */
  genr('vec', function () {
    var u, v, ang;
    if (Math.random() < 0.6) {
      var dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]], i = ri(0, 7), j = ri(0, 7), s1 = ri(1, 3), s2 = ri(1, 3);
      u = [dirs[i][0] * s1, dirs[i][1] * s1]; v = [dirs[j][0] * s2, dirs[j][1] * s2];
      var df = Math.abs(i - j) * 45; ang = Math.min(df, 360 - df);
    } else {
      var a = nz(-4, 4), b = nz(-4, 4), t = ri(1, 2), z = ri(0, 2);
      u = [a, b]; v = z === 0 ? [-t * b, t * a] : z === 1 ? [t * a, t * b] : [-t * a, -t * b]; ang = [90, 0, 180][z];
    }
    var dot = u[0] * v[0] + u[1] * v[1], n1 = u[0] * u[0] + u[1] * u[1], n2 = v[0] * v[0] + v[1] * v[1];
    chk(Math.abs(dot / Math.sqrt(n1 * n2) - Math.cos(ang * Math.PI / 180)) < 1e-9, 'vec angulo');
    var cs = { 0: '1', 45: '⟨√{2}|2⟩', 90: '0', 135: '−⟨√{2}|2⟩', 180: '−1' };
    var w = shuffle([0, 45, 90, 135, 180].filter(function (x) { return x !== ang; })).map(function (x) { return x + '°'; });
    return MK('vec', 'Ángulo que forman u⃗ = ' + pt(u) + ' y v⃗ = ' + pt(v), ang + '°', w,
      'u⃗ · v⃗ = ' + mn(dot) + ' y |u⃗| · |v⃗| = ' + sq(n1 * n2) + ', así que cos α = ' + cs[ang] + ' y α = ' + ang + '°.');
  });

  /* punto medio y simétrico */
  genr('vec', function () {
    var mx = ri(-5, 6), my = ri(-5, 6), ax = ri(-6, 8), ay = ri(-6, 8), bx = 2 * mx - ax, by = 2 * my - ay;
    if (ax === bx && ay === by) { ax++; bx--; }
    if (Math.random() < 0.6) {
      return MK('vec', 'Punto medio del segmento de extremos A = ' + pt(ax, ay) + ' y B = ' + pt(bx, by), pt(mx, my),
        [pt((bx - ax) / 2, (by - ay) / 2), pt(ax + bx, ay + by), pt(my, mx), pt(bx - ax, by - ay)],
        'M = (⟨' + ax + ' + ' + par(bx) + '|2⟩, ⟨' + ay + ' + ' + par(by) + '|2⟩) = ' + pt(mx, my) + '.');
    }
    return MK('vec', 'El simétrico de A = ' + pt(ax, ay) + ' respecto de M = ' + pt(mx, my) + ' es', pt(bx, by),
      [pt(mx - ax, my - ay), pt(2 * ax - mx, 2 * ay - my), pt(ax + mx, ay + my)],
      'M es el punto medio de A y su simétrico A′: A′ = 2M − A = ' + pt(bx, by) + '.');
  });

  /* pendiente por dos puntos */
  genr('vec', function () {
    var ax = ri(-6, 6), ay = ri(-6, 6), bx, by;
    do { bx = ri(-6, 6); by = ri(-6, 6); } while (bx === ax || by === ay);
    var dx = bx - ax, dy = by - ay, w = [f_fr(dx, dy), f_fr(-dy, dx)];
    if (ax + bx !== 0) w.push(f_fr(ay + by, ax + bx));
    w.push(f_fr(-dx, dy));
    return MK('vec', 'Pendiente de la recta que pasa por ' + pt(ax, ay) + ' y ' + pt(bx, by), f_fr(dy, dx), w,
      'm = ⟨' + by + ' − ' + par(ay) + '|' + bx + ' − ' + par(ax) + '⟩ = ⟨' + mn(dy) + '|' + mn(dx) + '⟩' + (gcd(dy, dx) === 1 && dx > 0 ? '' : ' = ' + f_fr(dy, dx)) + '.');
  });

  /* recta por un punto con pendiente dada: explícita y punto-pendiente */
  genr('vec', function () {
    var m = nz(-4, 4), x0 = nz(-5, 5), y0 = ri(-6, 6), n = y0 - m * x0;
    if (Math.random() < 0.5) {
      return MK('vec', 'Ecuación explícita de la recta que pasa por ' + pt(x0, y0) + ' con pendiente ' + mn(m), yexp(m, n),
        [yexp(m, y0 + m * x0), yexp(m, y0), yexp(-m, y0 + m * x0)],
        'n = y₀ − m · x₀ = ' + y0 + ' − ' + par(m) + ' · ' + par(x0) + ' = ' + mn(n) + ', así que ' + yexp(m, n) + '.');
    }
    function ps(mm, a, b) { var co = mm === 1 ? '' : mm === -1 ? '−' : mn(mm); var rhs = co === '' ? sh('x', a) : co + '(' + sh('x', a) + ')'; return sh('y', b) + ' = ' + rhs; }
    var w = [ps(m, -x0, -y0), ps(-m, x0, y0)];
    if (x0 !== y0) w.push(ps(m, y0, x0));
    w.push(ps(m, x0, -y0));
    return MK('vec', 'Ecuación punto-pendiente de la recta que pasa por ' + pt(x0, y0) + ' con pendiente ' + mn(m), ps(m, x0, y0), w,
      'y − y₀ = m(x − x₀) con (x₀, y₀) = ' + pt(x0, y0) + ' y m = ' + mn(m) + '. Ojo con los signos al restar coordenadas negativas.');
  });

  /* ecuación general por dos puntos */
  genr('vec', function () {
    var ax = ri(-5, 5), ay = ri(-5, 5), d1 = nz(-4, 4), d2 = nz(-4, 4), C = -(d2 * ax - d1 * ay);
    var ans = gen0(d2, -d1, C);
    return MK('vec', 'Ecuación general de la recta que pasa por A = ' + pt(ax, ay) + ' y B = ' + pt(ax + d1, ay + d2), ans,
      [gen0(d1, d2, -(d1 * ax + d2 * ay)), gen0(d2, -d1, -C), gen0(d2, d1, -(d2 * ax + d1 * ay))],
      'AB⃗ = ' + pt(d1, d2) + ' es director, así que ' + pt(d2, -d1) + ' es normal: ' + lxy(d2, -d1, 0) + ' + C = 0. Sustituyendo A sale C = ' + mn(C) + '. Simplificada: ' + ans + '.');
  });

  /* paramétricas y continua: leer punto y vector director */
  genr('vec', function () {
    var x0 = nz(-5, 6), y0 = nz(-5, 6), v1 = nz(-5, 5), v2 = nz(-5, 5), param = Math.random() < 0.5, askV = Math.random() < 0.5;
    function tp(v) { return (v < 0 ? ' − ' : ' + ') + (Math.abs(v) === 1 ? '' : Math.abs(v)) + 't'; }
    var eq = param ? 'x = ' + mn(x0) + tp(v1) + ', y = ' + mn(y0) + tp(v2)
      : '⟨' + sh('x', x0) + '|' + mn(v1) + '⟩ = ⟨' + sh('y', y0) + '|' + mn(v2) + '⟩';
    var V = [v1, v2], w;
    if (askV) {
      w = [[x0, y0], [v2, v1], [-v2, v1], [v1, -v2], [-x0, -y0]].filter(function (u) { return cross(u, V) !== 0; }).map(pt);
      return MK('vec', 'Un vector director de la recta ' + eq + ' es', pt(v1, v2), w,
        param ? 'En las paramétricas, el vector director lo forman los coeficientes de t: ' + pt(v1, v2) + '.'
          : 'En la continua, el vector director lo forman los denominadores: ' + pt(v1, v2) + '.');
    }
    w = [[-x0, -y0], [v1, v2], [y0, x0], [x0, -y0], [-x0, y0]].filter(function (u) { return cross([u[0] - x0, u[1] - y0], V) !== 0; }).map(pt);
    return MK('vec', 'Un punto de la recta ' + eq + ' es', pt(x0, y0), w,
      param ? 'Para t = 0 se obtiene el punto ' + pt(x0, y0) + '.'
        : 'En la continua, el punto se lee cambiando el signo de los números que acompañan a x e y en los numeradores: ' + pt(x0, y0) + '.');
  });

  /* pendiente y vector director desde la ecuación general */
  genr('vec', function () {
    var A = nz(-6, 6), B = nz(-6, 6), C = ri(-9, 9), eq = lxy(A, B, C) + ' = 0';
    if (Math.random() < 0.55) {
      return MK('vec', 'Pendiente de la recta ' + eq, f_fr(-A, B), [f_fr(A, B), f_fr(-B, A), f_fr(B, A)],
        'Despejando y: m = ⟨−A|B⟩ = ⟨' + mn(-A) + '|' + mn(B) + '⟩ = ' + f_fr(-A, B) + '.');
    }
    var V = [-B, A];
    var w = [[A, B], [B, A], [A, -B], [B, -A]].filter(function (u) { return cross(u, V) !== 0; }).map(pt);
    return MK('vec', 'Un vector director de la recta ' + eq + ' es', pt(-B, A), w,
      'En Ax + By + C = 0, (A, B) es normal y (−B, A) es director: ' + pt(-B, A) + '.');
  });

  /* rectas paralelas y perpendiculares */
  genr('vec', function () {
    var v = ri(0, 2), x0 = nz(-4, 4), y0 = ri(-5, 5);
    if (v === 0) {
      var m = pick([-5, -4, -3, -2, 2, 3, 4, 5]), n = ri(-6, 6);
      return MK('vec', 'Pendiente de una recta perpendicular a ' + yexp(m, n), f_fr(-1, m), [mn(-m), f_fr(1, m), mn(m)],
        'Las pendientes de rectas perpendiculares cumplen m · m′ = −1, así que m′ = ' + f_fr(-1, m) + '.');
    }
    if (v === 1) {
      var m1 = nz(-4, 4), n0;
      do { n0 = ri(-6, 6); } while (n0 === y0 - m1 * x0);
      return MK('vec', 'Recta paralela a ' + yexp(m1, n0) + ' que pasa por ' + pt(x0, y0), yexp(m1, y0 - m1 * x0),
        [yexp(m1, n0), yexp(m1, y0 + m1 * x0), yexp(-m1, y0 + m1 * x0)],
        'Misma pendiente, ' + mn(m1) + ': n = ' + y0 + ' − ' + par(m1) + ' · ' + par(x0) + ' = ' + mn(y0 - m1 * x0) + '.');
    }
    var b = nz(-4, 4), c = ri(-6, 6);
    return MK('vec', 'Recta perpendicular a ' + lxy(1, b, c) + ' = 0 que pasa por ' + pt(x0, y0), yexp(b, y0 - b * x0),
      [yexp(-b, y0 + b * x0), yexp(b, y0 + b * x0), yexp(b, y0)],
      'La recta dada tiene pendiente ' + f_fr(-1, b) + ', así que la perpendicular tiene pendiente ' + mn(b) + '. Por ' + pt(x0, y0) + ': ' + yexp(b, y0 - b * x0) + '.');
  });

  /* distancia de un punto a una recta */
  genr('vec', function () {
    var T = pick([[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [0, 1], [1, 0], [0, 2], [3, 4]]);
    var A = T[0] * (T[0] ? pick([1, -1]) : 1), B = T[1] * (T[1] ? pick([1, -1]) : 1), C = ri(-10, 10), x0 = ri(-5, 5), y0 = ri(-5, 5);
    var num = A * x0 + B * y0 + C, s = A * A + B * B, den = Math.round(Math.sqrt(s));
    if (num === 0) { C += 1; num += 1; }
    var ans = f_fr(Math.abs(num), den), bad = mn(Math.abs(num)), w = [];
    if (num < 0) w.push(f_fr(num, den));
    if (den > 1) w.push(bad);
    w.push(f_fr(Math.abs(num), s), f_fr(Math.abs(num), Math.abs(A) + Math.abs(B)));
    var r = MK('vec', 'Distancia del punto P = ' + pt(x0, y0) + ' a la recta ' + lxy(A, B, C) + ' = 0', ans, w,
      'Sustituimos P en la ecuación: ' + mn(num) + '. Se toma el valor absoluto y se divide entre √{A^{2} + B^{2}} = √{' + s + '} = ' + den + ': d = ' + ans + '.');
    return den > 1 ? bb(r, bad) : r;
  });

  /* posición relativa de dos rectas */
  genr('vec', function () {
    var A1 = nz(-5, 5), B1 = nz(-5, 5), C1 = ri(-9, 9), t = ri(0, 2), A2, B2, C2, k = pick([2, 3, -1, -2]);
    if (t === 0) { do { A2 = nz(-5, 5); B2 = nz(-5, 5); } while (A1 * B2 - A2 * B1 === 0); C2 = ri(-9, 9); }
    else { A2 = k * A1; B2 = k * B1; C2 = t === 2 ? k * C1 : k * C1 + nz(-5, 5); }
    var opts = ['Secantes', 'Paralelas', 'Coincidentes'];
    var e = t === 0 ? '⟨' + mn(A1) + '|' + mn(A2) + '⟩ ≠ ⟨' + mn(B1) + '|' + mn(B2) + '⟩: los coeficientes de x e y no son proporcionales y se cortan en un punto.'
      : t === 1 ? 'Los coeficientes de x e y de s son los de r multiplicados por ' + mn(k) + ', pero el término independiente no: no tienen puntos comunes.'
        : 's es r multiplicada por ' + mn(k) + ': son la misma recta.';
    return MK('vec', 'Posición relativa de r: ' + lxy(A1, B1, C1) + ' = 0 y s: ' + lxy(A2, B2, C2) + ' = 0', opts[t],
      opts.filter(function (o, i) { return i !== t; }).concat(['Se cruzan']), e);
  });

  /* punto de corte de dos rectas */
  genr('vec', function () {
    var x0 = ri(-5, 6), y0 = ri(-5, 6), a1 = nz(-4, 4), b1 = nz(-4, 4), a2, b2;
    do { a2 = nz(-4, 4); b2 = nz(-4, 4); } while (a1 * b2 - a2 * b1 === 0);
    var c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
    return MK('vec', 'Punto de corte de las rectas ' + lxy(a1, b1, 0) + ' = ' + mn(c1) + ' y ' + lxy(a2, b2, 0) + ' = ' + mn(c2), pt(x0, y0),
      [pt(y0, x0), pt(-x0, -y0), pt(x0, -y0), pt(-x0, y0), pt(x0 + 1, y0 - 1)],
      'Se resuelve el sistema formado por las dos ecuaciones: x = ' + mn(x0) + ', y = ' + mn(y0) + '. Se puede comprobar sustituyendo en ambas.');
  });

  add('vec', 'Dos vectores no nulos son perpendiculares si su producto escalar es', '0', ['1', '−1', 'Igual al producto de sus módulos'],
    'u⃗ · v⃗ = |u⃗| · |v⃗| · cos α, y cos 90° = 0.');
  add('vec', 'El módulo del vector (3, 4) es', '5', ['7', '25', '√{7}'], '√{3^{2} + 4^{2}} = √{25} = 5.');
  barb('El módulo del vector (3, 4) es', '7');
  add('vec', 'La pendiente de la recta y = 3 es', '0', ['3', '1', 'No está definida'], 'Es una recta horizontal: y = 0x + 3.');
  add('vec', 'La recta x = 2 es', 'Vertical', ['Horizontal', 'La bisectriz del primer cuadrante', 'Paralela a y = 2'],
    'Todos sus puntos tienen abscisa 2: es paralela al eje Y.');
  add('vec', 'Si dos rectas tienen pendientes m y m′ con m · m′ = −1, son', 'Perpendiculares', ['Paralelas', 'Coincidentes', 'Secantes formando 45°'],
    'La condición de perpendicularidad entre pendientes es m · m′ = −1.');
  add('vec', 'En y = mx + n, el número n es', 'La ordenada en el origen', ['La pendiente', 'El corte con el eje X', 'Un vector director'],
    'Para x = 0 se obtiene y = n: el corte con el eje Y.');
  add('vec', 'El producto escalar de dos vectores es', 'Un número', ['Un vector', 'Un ángulo', 'Una recta'],
    'u⃗ · v⃗ = u₁v₁ + u₂v₂ es un número real.');
  add('vec', 'Un vector normal (perpendicular) a la recta 2x − 5y + 1 = 0 es', '(2, −5)', ['(5, 2)', '(2, 5)', '(−5, 2)'],
    'En Ax + By + C = 0, (A, B) es normal. (5, 2) es director.');
  add('vec', 'La recta que pasa por (0, 0) y (1, 1) es', 'y = x', ['y = 1', 'x = 1', 'y = −x'], 'Pendiente ⟨1 − 0|1 − 0⟩ = 1 y pasa por el origen.');
  add('vec', 'Si u⃗ · v⃗ < 0, el ángulo entre u⃗ y v⃗ es', 'Obtuso', ['Agudo', 'Recto', 'Nulo'], 'El signo del producto escalar es el del coseno: negativo ⇒ ángulo entre 90° y 180°.');

  /* ======================================================================
     pl: Programación lineal (2.º Bach CCSS)
     ====================================================================== */
  var LET = ['A', 'B', 'C', 'D'];
  function hull(P) {
    P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < P.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], P[i]) <= 0) lo.pop(); lo.push(P[i]); }
    for (i = P.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(P[i]); }
    lo.pop(); up.pop();
    return lo.concat(up);
  }
  function area(V) { var s = 0; for (var i = 0; i < V.length; i++) { var j = (i + 1) % V.length; s += V[i][0] * V[j][1] - V[j][0] * V[i][1]; } return Math.abs(s) / 2; }
  /* región convexa de 3 o 4 vértices enteros, en sentido antihorario */
  function region() {
    for (var t = 0; t < 500; t++) {
      var P, n;
      if (Math.random() < 0.5) { P = [[0, 0], [ri(3, 10), 0], [ri(1, 9), ri(1, 9)], [0, ri(3, 10)]]; n = 4; }
      else { n = pick([3, 4]); P = []; for (var i = 0; i < n; i++) P.push([ri(0, 10), ri(0, 10)]); }
      var H = hull(P);
      if (H.length === n && area(H) >= 8) return H;
    }
    return [[0, 0], [6, 0], [4, 3], [0, 5]];
  }
  function hasO(V) { return V.some(function (v) { return v[0] === 0 && v[1] === 0; }); }
  function vlist(V) { return V.map(function (v, i) { return LET[i] + pt(v); }).join(', '); }

  /* ¿qué punto está en la región factible? */
  genr('pl', function () {
    for (var t = 0; t < 200; t++) {
      var a1 = ri(1, 3), b1 = ri(1, 3), c1 = ri(6, 14), a2, b2;
      do { a2 = ri(1, 3); b2 = ri(1, 3); } while (a2 * b1 === a1 * b2);
      var ge = Math.random() < 0.35, c2 = ge ? ri(2, 5) : ri(6, 14), op2 = ge ? '≥' : '≤';
      var viol = function (x, y) {
        var s1 = a1 * x + b1 * y, s2 = a2 * x + b2 * y;
        return Math.max(0, s1 - c1) + (ge ? Math.max(0, c2 - s2) : Math.max(0, s2 - c2)) + (x < 0 ? 1 : 0) + (y < 0 ? 1 : 0);
      };
      var good = [], bad = [];
      for (var x = -1; x <= 9; x++) for (var y = -1; y <= 9; y++) {
        var v = viol(x, y);
        if (v === 0 && x + y > 0) good.push([x, y]); else if (v > 0 && v <= 3) bad.push([x, y]);
      }
      if (!good.length || bad.length < 3) continue;
      var g = pick(good), bs = shuffle(bad).slice(0, 3);
      return MK('pl', 'Restricciones: x ≥ 0, y ≥ 0, ' + lxy(a1, b1, 0) + ' ≤ ' + c1 + ', ' + lxy(a2, b2, 0) + ' ' + op2 + ' ' + c2 + '. ¿Qué punto pertenece a la región factible?', pt(g), bs.map(pt),
        'Sustituyendo ' + pt(g) + ': ' + (a1 * g[0] + b1 * g[1]) + ' ≤ ' + c1 + ' y ' + (a2 * g[0] + b2 * g[1]) + ' ' + op2 + ' ' + c2 + '. Los demás puntos incumplen alguna restricción.');
    }
    return MK('pl', '', '', [], '');
  });

  /* vértice como intersección de dos rectas */
  genr('pl', function () {
    var x0 = ri(1, 8), y0 = ri(1, 8), a1 = ri(1, 4), b1 = ri(1, 4), a2, b2;
    do { a2 = ri(1, 4); b2 = ri(1, 4); } while (a1 * b2 - a2 * b1 === 0);
    var c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0, w = [pt(y0, x0)];
    if (isInt(c1 / a1)) w.push(pt(c1 / a1, 0));
    if (isInt(c2 / b2)) w.push(pt(0, c2 / b2));
    w.push(pt(x0 + 1, y0 - 1), pt(x0, y0 + 1));
    return MK('pl', 'Un vértice de la región factible es el corte de ' + lxy(a1, b1, 0) + ' = ' + c1 + ' y ' + lxy(a2, b2, 0) + ' = ' + c2 + '. ¿Cuál es?', pt(x0, y0), w,
      'Se resuelve el sistema de las dos rectas: x = ' + x0 + ', y = ' + y0 + '. Comprobación: ' + a1 * x0 + ' + ' + b1 * y0 + ' = ' + c1 + ' y ' + a2 * x0 + ' + ' + b2 * y0 + ' = ' + c2 + '.');
  });

  /* valor de F en un punto */
  genr('pl', function () {
    var p = ri(1, 9), q = nz(-5, 9), x0 = ri(0, 10), y0 = ri(0, 10);
    if (x0 === y0) x0++;
    return MK('pl', 'F(x, y) = ' + lxy(p, q, 0) + '. ¿Cuánto vale F en el vértice ' + pt(x0, y0) + '?', mn(p * x0 + q * y0),
      [mn(p * y0 + q * x0), mn(p * x0 - q * y0), mn((p + q) * (x0 + y0))],
      'F' + pt(x0, y0) + ' = ' + p + ' · ' + x0 + ' + ' + par(q) + ' · ' + y0 + ' = ' + mn(p * x0 + q * y0) + '.');
  });

  /* valor máximo o mínimo en una región dada por sus vértices */
  genr('pl', function () {
    for (var t = 0; t < 300; t++) {
      var V = region(), p = ri(1, 6), q = ri(1, 6), isMax = Math.random() < 0.6;
      if (!isMax && hasO(V)) isMax = true;
      var vals = V.map(function (v) { return p * v[0] + q * v[1]; });
      var target = isMax ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      var idx = vals.map(function (v, i) { return v === target ? i : -1; }).filter(function (i) { return i >= 0; });
      if (idx.length !== 1) continue;
      var k = idx[0], w = vals.filter(function (v) { return v !== target; }).map(String);
      w.push(String(q * V[k][0] + p * V[k][1]));
      return MK('pl', 'La región factible tiene vértices ' + vlist(V) + '. Valor ' + (isMax ? 'máximo' : 'mínimo') + ' de F(x, y) = ' + lxy(p, q, 0) + ':', String(target), w,
        'Se evalúa F en cada vértice: ' + V.map(function (v, i) { return LET[i] + ': ' + vals[i]; }).join(', ') + '. El ' + (isMax ? 'mayor' : 'menor') + ' es ' + target + ', en ' + LET[k] + '.');
    }
    return MK('pl', '', '', [], '');
  });

  /* dónde se alcanza el óptimo: vértice o lado (infinitas soluciones) */
  genr('pl', function () {
    var tie = Math.random() < 0.45;
    for (var t = 0; t < 500; t++) {
      var V = region(), n = V.length, p, q, isMax, i0;
      if (tie) {
        i0 = ri(0, n - 1);
        var j0 = (i0 + 1) % n, dx = V[j0][0] - V[i0][0], dy = V[j0][1] - V[i0][1];
        p = dy; q = -dx;
        var g = gcd(Math.abs(p), Math.abs(q)) || 1; p /= g; q /= g;
        if (p > 0 && q > 0) isMax = true;
        else if (p < 0 && q < 0 && !hasO(V)) { p = -p; q = -q; isMax = false; }
        else continue;
      } else { p = ri(1, 6); q = ri(1, 6); isMax = Math.random() < 0.6 || hasO(V); }
      var vals = V.map(function (v) { return p * v[0] + q * v[1]; });
      var target = isMax ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      var idx = vals.map(function (v, i) { return v === target ? i : -1; }).filter(function (i) { return i >= 0; });
      if (idx.length !== (tie ? 2 : 1)) continue;
      var q0 = 'Región factible de vértices ' + vlist(V) + '. ¿Dónde alcanza F(x, y) = ' + lxy(p, q, 0) + ' su ' + (isMax ? 'máximo' : 'mínimo') + '?';
      var list = V.map(function (v, i) { return LET[i] + ': ' + vals[i]; }).join(', ');
      if (idx.length === 2) {
        var L1 = LET[idx[0]], L2 = LET[idx[1]], side = L1 + L2;
        return MK('pl', q0, 'En todo el lado ' + side, ['Solo en ' + L1, 'Solo en ' + L2, 'Solo en el punto medio de ' + side],
          'F en los vértices: ' + list + '. Vale ' + target + ' en ' + L1 + ' y en ' + L2 + ', así que el ' + (isMax ? 'máximo' : 'mínimo') + ' se alcanza en todos los puntos del lado ' + side + ' (infinitas soluciones).');
      }
      var k = idx[0], nb = (k + 1) % n, sd = [LET[k], LET[nb]].sort().join('');
      var w = V.map(function (v, i) { return 'Solo en ' + LET[i]; }).filter(function (s, i) { return i !== k; });
      w.splice(1, 0, 'En todo el lado ' + sd);
      return MK('pl', q0, 'Solo en ' + LET[k], w,
        'F en los vértices: ' + list + '. El ' + (isMax ? 'máximo' : 'mínimo') + ', ' + target + ', solo se alcanza en ' + LET[k] + '.');
    }
    return MK('pl', '', '', [], '');
  });

  /* traducir el enunciado a restricciones o función objetivo */
  genr('pl', function () {
    var P = pick([['mesas', 'sillas', 'mesa', 'silla'], ['bicicletas', 'patinetes', 'bicicleta', 'patinete'], ['tartas', 'bizcochos', 'tarta', 'bizcocho'], ['camisas', 'pantalones', 'camisa', 'pantalón']]);
    var v = ri(0, 3), intro = 'Se fabrican x ' + P[0] + ' e y ' + P[1] + '. ';
    if (v === 0) {
      var a, b; do { a = ri(1, 5); b = ri(1, 5); } while (a === b);
      var c = ri(20, 80), u = pick(['h de trabajo', 'kg de materia prima', 'h de máquina']);
      return MK('pl', intro + 'Cada ' + P[2] + ' necesita ' + a + ' ' + u + ' y cada ' + P[3] + ' ' + b + '; se dispone como máximo de ' + c + '. Restricción:', lxy(a, b, 0) + ' ≤ ' + c,
        [lxy(a, b, 0) + ' ≥ ' + c, lxy(b, a, 0) + ' ≤ ' + c, 'x + y ≤ ' + c],
        '“Como máximo” significa ≤, y cada unidad aporta su consumo: ' + lxy(a, b, 0) + ' ≤ ' + c + '.');
    }
    if (v === 1) {
      var m = ri(10, 50);
      return MK('pl', intro + 'Entre las dos cosas hay que fabricar al menos ' + m + ' unidades. Restricción:', 'x + y ≥ ' + m,
        ['x + y ≤ ' + m, 'x ≥ ' + m, 'x · y ≥ ' + m],
        '“Al menos” significa ≥, y el total de unidades es x + y.');
    }
    if (v === 2) {
      var k = ri(2, 4), bad = 'y ≥ ' + k + 'x';
      var r = MK('pl', intro + 'El número de ' + P[0] + ' debe ser al menos el ' + MULT[k] + ' que el de ' + P[1] + '. Restricción:', 'x ≥ ' + k + 'y',
        [bad, k + 'x ≥ y', 'x ≤ ' + k + 'y'],
        'x tiene que ser mayor o igual que ' + k + ' veces y: x ≥ ' + k + 'y. Comprueba con y = 1: x debe ser al menos ' + k + '.');
      return bb(r, bad);
    }
    var p, q; do { p = ri(2, 20); q = ri(2, 20); } while (p === q);
    return MK('pl', intro + 'Cada ' + P[2] + ' deja ' + p + ' € de beneficio y cada ' + P[3] + ' ' + q + ' €. La función objetivo es', 'F(x, y) = ' + lxy(p, q, 0),
      ['F(x, y) = ' + lxy(q, p, 0), 'F(x, y) = ' + (p + q) + 'xy', 'F(x, y) = ' + lxy(p, -q, 0)],
      'Beneficio total: ' + p + ' € por cada una de las x ' + P[0] + ' más ' + q + ' € por cada uno de los y ' + P[1] + '.');
  });

  /* cortes de una recta con los ejes */
  genr('pl', function () {
    var a, b; do { a = ri(1, 6); b = ri(1, 6); } while (a === b);
    var L = a * b / gcd(a, b), c = L * ri(1, Math.max(1, Math.floor(48 / L))), axX = Math.random() < 0.5;
    var X = pt(c / a, 0), Y = pt(0, c / b);
    return MK('pl', 'La recta ' + lxy(a, b, 0) + ' = ' + c + ' corta al eje ' + (axX ? 'X' : 'Y') + ' en', axX ? X : Y,
      axX ? [Y, pt(c / b, 0), pt(c, 0), pt(0, c / a)] : [X, pt(0, c / a), pt(0, c), pt(c / b, 0)],
      axX ? 'En el eje X, y = 0: ' + kx(a) + ' = ' + c + ' → x = ' + c / a + '.' : 'En el eje Y, x = 0: ' + kx(b, 'y') + ' = ' + c + ' → y = ' + c / b + '.');
  });

  /* vértices de una región triangular */
  genr('pl', function () {
    var a, b; do { a = ri(1, 5); b = ri(1, 5); } while (a === b);
    var L = a * b / gcd(a, b), c = L * ri(1, Math.max(1, Math.floor(40 / L)));
    function tri(x, y) { return '(0, 0), ' + pt(x, 0) + ', ' + pt(0, y); }
    return MK('pl', 'Vértices de la región x ≥ 0, y ≥ 0, ' + lxy(a, b, 0) + ' ≤ ' + c + ':', tri(c / a, c / b),
      [tri(c / b, c / a), tri(c, c), tri(a, b)],
      'Es un triángulo: el origen y los cortes de la recta con los ejes, ' + pt(c / a, 0) + ' y ' + pt(0, c / b) + '.');
  });

  /* semiplano que contiene (o no) al origen */
  genr('pl', function () {
    var a, b; do { a = ri(1, 6); b = ri(1, 6); } while (a === b);
    var c = ri(4, 30), cont = Math.random() < 0.5, le = lxy(a, b, 0) + ' ≤ ' + c, ge = lxy(a, b, 0) + ' ≥ ' + c;
    return MK('pl', 'La recta ' + lxy(a, b, 0) + ' = ' + c + ' divide el plano. ¿Qué desigualdad describe el semiplano que ' + (cont ? '' : 'no ') + 'contiene al origen?', cont ? le : ge,
      [cont ? ge : le, lxy(b, a, 0) + ' ≤ ' + c, lxy(b, a, 0) + ' ≥ ' + c],
      'En (0, 0) el primer miembro vale 0, y 0 ≤ ' + c + ': el origen está en ' + le + (cont ? '.' : ', y el otro semiplano es ' + ge + '.'));
  });

  /* número de vértices de una región */
  genr('pl', function () {
    var a = ri(2, 8), b = ri(2, 8), c = ri(2, a + b + 3), V;
    if (c >= a + b) V = [[0, 0], [a, 0], [a, b], [0, b]];
    else {
      V = [[0, 0], [Math.min(a, c), 0]];
      if (c > a) V.push([a, c - a]);
      if (c > b) V.push([c - b, b], [0, b]); else V.push([0, c]);
    }
    var cnt = c >= a + b ? 4 : 3 + (c > a ? 1 : 0) + (c > b ? 1 : 0);
    chk(cnt === V.length, 'pl vertices');
    return MK('pl', 'Número de vértices de la región: x ≥ 0, y ≥ 0, x ≤ ' + a + ', y ≤ ' + b + ', x + y ≤ ' + c, String(cnt),
      ['3', '4', '5', '6'].filter(function (s) { return s !== String(cnt); }),
      'Vértices: ' + V.map(pt).join(', ') + '.');
  });

  add('pl', 'En un problema de programación lineal con región factible acotada, el óptimo se alcanza', 'En un vértice o en un lado', ['En el centro de la región', 'Siempre en (0, 0)', 'En cualquier punto interior'],
    'La función objetivo es lineal: sus valores extremos están en la frontera, en un vértice (o en todo un lado si hay empate).');
  add('pl', 'Si F toma el mismo valor máximo en dos vértices consecutivos A y B,', 'Hay infinitas soluciones: todo el lado AB', ['La solución es el punto medio de AB', 'No hay solución', 'Hay exactamente dos soluciones'],
    'F es lineal y constante sobre el segmento AB: todos sus puntos son óptimos.');
  barb('Si F toma el mismo valor máximo en dos vértices consecutivos A y B,', 'Hay exactamente dos soluciones');
  add('pl', 'La región factible es el conjunto de puntos', 'Que cumplen todas las restricciones', ['Que cumplen alguna restricción', 'Donde F es máxima', 'Situados sobre las rectas'],
    'Es la intersección de todos los semiplanos de las restricciones.');
  add('pl', 'Si la región factible no está acotada, un problema de máximo', 'Puede no tener solución', ['Siempre tiene solución', 'Siempre tiene infinitas soluciones', 'Tiene la solución en (0, 0)'],
    'F puede crecer sin límite dentro de la región; hay que estudiarlo en cada caso.');
  add('pl', 'Las restricciones x ≥ 0, y ≥ 0 sitúan la región en', 'El primer cuadrante', ['El segundo cuadrante', 'El tercer cuadrante', 'Todo el plano'],
    'Las dos coordenadas son no negativas.');
  add('pl', 'Las rectas de nivel de F(x, y) = 2x + 3y son de la forma', '2x + 3y = k', ['3x + 2y = k', '2x − 3y = k', 'y = 2x + 3k'],
    'Son las rectas donde F toma un valor constante k; todas son paralelas.');
  add('pl', 'F(x, y) = 3x + 2y en el vértice (2, 5) vale', '16', ['19', '10', '7'], '3 · 2 + 2 · 5 = 6 + 10 = 16.');
  add('pl', 'Si la región factible es vacía, el problema', 'No tiene solución', ['Tiene la solución (0, 0)', 'Tiene infinitas soluciones', 'Tiene solución en el vértice más alejado'],
    'Ningún punto cumple a la vez todas las restricciones.');
  add('pl', 'Para saber qué semiplano representa 2x + 3y ≤ 6, lo más cómodo es', 'Probar con el punto (0, 0)', ['Probar con un punto de la recta', 'Calcular la pendiente', 'Hallar el punto medio'],
    '0 ≤ 6 es cierto, así que el semiplano es el que contiene al origen (si la recta no pasa por él).');
})();
