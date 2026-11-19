/* Preguntas nuevas: vectores en el espacio, rectas y planos, Bayes, binomial/normal e inferencia (2.º Bachillerato) */
(function () {
  'use strict';

  /* ---------- ayudas ---------- */
  function V(a) { return '(' + a.map(function (x) { return mn(x); }).join(', ') + ')'; }
  function VF(a) { return '(' + a.join(', ') + ')'; }
  function rv(a, b) { return [ri(a, b), ri(a, b), ri(a, b)]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function sum(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sc(k, a) { return [k * a[0], k * a[1], k * a[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function det3(u, v, w) { return dot(u, cross(v, w)); }
  function isZ(a) { return a[0] === 0 && a[1] === 0 && a[2] === 0; }
  function par(a, b) { return isZ(cross(a, b)); }
  function n2(a) { return dot(a, a); }
  function red(a) { var g = gcd(gcd(Math.abs(a[0]), Math.abs(a[1])), Math.abs(a[2])) || 1; return [a[0] / g, a[1] / g, a[2] / g]; }
  function rad(n) {
    if (n === 0) return '0';
    var k = 1, m = n;
    for (var i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { m /= i * i; k *= i; } }
    return m === 1 ? String(k) : (k === 1 ? '' : k) + '√{' + m + '}';
  }
  /* decimal con coma, quitando ceros finales */
  function dz(x, d) {
    if (d === undefined) d = 4;
    var p = Math.pow(10, d), r = Math.round(x * p) / p;
    if (r === 0) r = 0;
    var s = r.toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return mn(s.replace('.', ','));
  }
  function lin3(c, vars) {
    var out = '';
    c.forEach(function (k, i) {
      if (k === 0) return;
      var ab = Math.abs(k), v = vars[i];
      var body = v ? (ab === 1 ? '' : String(ab)) + v : String(ab);
      if (out === '') out = (k < 0 ? '−' : '') + body;
      else out += ' ' + (k < 0 ? '−' : '+') + ' ' + body;
    });
    return out || '0';
  }
  function plane(a, b, c, d) { return lin3([a, b, c, d], ['x', 'y', 'z', '']) + ' = 0'; }
  function prop4(p, q) {
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) if (p[i] * q[j] - p[j] * q[i] !== 0) return false;
    return true;
  }
  function line(P, v, nm) { return (nm || 'r') + ': (x, y, z) = ' + V(P) + ' + λ' + V(v); }
  function vt(n, p) { return p === 0 ? n : n + (p > 0 ? ' − ' : ' + ') + Math.abs(p); }
  function cont(P, v) { return ['x', 'y', 'z'].map(function (n, i) { return '⟨' + vt(n, P[i]) + '|' + mn(v[i]) + '⟩'; }).join(' = '); }
  function pt(n, k) { /* término paramétrico p + kλ */
    var t = Math.abs(k) === 1 ? 'λ' : Math.abs(k) + 'λ';
    if (n === 0) return (k < 0 ? '−' : '') + t;
    return mn(n) + (k < 0 ? ' − ' : ' + ') + t;
  }
  function pn(x) { return x < 0 ? '(' + mn(x) + ')' : String(x); }
  function BI(n, p) { return 'B(' + n + (String(p).indexOf(',') >= 0 || String(n).indexOf(',') >= 0 ? '; ' : ', ') + p + ')'; }
  function NO(m, s) { return 'N(' + m + (String(m).indexOf(',') >= 0 || String(s).indexOf(',') >= 0 ? '; ' : ', ') + s + ')'; }
  function bb(r, x) { x = String(x); if (r.w.indexOf(x) >= 0) barb(r.q, x); return r; }
  function nzv(a, b) { var v; do { v = rv(a, b); } while (isZ(v)); return v; }
  function perm3() { return pick([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]); }
  function ap(v, p, s) { return [v[p[0]] * s[0], v[p[1]] * s[1], v[p[2]] * s[2]]; }
  function sgn3() { return [pick([1, -1]), pick([1, -1]), pick([1, -1])]; }
  function C(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
  /* cuaternas pitagóricas a² + b² + c² = d² */
  var QU = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [2, 5, 14, 15], [1, 12, 12, 17], [8, 9, 12, 17], [0, 3, 4, 5], [0, 6, 8, 10]];
  function qv(small) {
    var q = pick(small ? QU.slice(0, 4).concat([QU[11]]) : QU);
    return { v: ap(q, perm3(), sgn3()), m: q[3] };
  }

  /* =====================================================================
     esp — Vectores en el espacio
     ===================================================================== */
  genr('esp', function () {
    var A = rv(-5, 5), B;
    do { B = rv(-5, 5); } while (isZ(sub(B, A)));
    var ab = sub(B, A);
    return mk('esp', 'Dados A' + V(A) + ' y B' + V(B) + ', el vector AB⃗ =', V(ab),
      [V(sub(A, B)), V(sum(A, B)), V([ab[0], -ab[1], ab[2]]), V([ab[0], ab[1], -ab[2]]), V([-ab[0], ab[1], ab[2]])],
      'Extremo menos origen: AB⃗ = B − A = ' + V(ab) + '.');
  });

  genr('esp', function () {
    if (Math.random() < 0.6) {
      var o = qv(), v = o.v, m = o.m, s = Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]);
      return mk('esp', '|u| para u = ' + V(v), String(m), [String(s), String(m * m), rad(s), mn(v[0] + v[1] + v[2])],
        '|u| = √{' + v.map(function (x) { return x < 0 ? '(' + mn(x) + ')^{2}' : x + '^{2}'; }).join(' + ') + '} = √{' + m * m + '} = ' + m + '.');
    }
    var u, q;
    do { u = rv(-4, 4); q = n2(u); } while (q === 0 || rad(q).indexOf('√') < 0 || u.indexOf(0) >= 0);
    var s2 = Math.abs(u[0]) + Math.abs(u[1]) + Math.abs(u[2]);
    return mk('esp', '|u| para u = ' + V(u), rad(q), [String(q), String(s2), rad(s2), '√{' + s2 + '}', rad(q + 2)],
      '|u| = √{' + u.map(function (x) { return x * x; }).join(' + ') + '} = ' + (rad(q) === '√{' + q + '}' ? rad(q) : '√{' + q + '} = ' + rad(q)) + '.');
  });

  genr('esp', function () {
    var u = rv(-4, 5), v = rv(-4, 5), d = dot(u, v), pr = [u[0] * v[0], u[1] * v[1], u[2] * v[2]];
    var r = mk('esp', 'u = ' + V(u) + ', v = ' + V(v) + '. El producto escalar u · v =', mn(d),
      [V(pr), mn(-d), mn(pr[0] + pr[1] - pr[2]), mn(pr[0] - pr[1] + pr[2]), mn(pr[0] + pr[1])],
      'Se multiplican componente a componente y se SUMAN: ' + pr.map(mn).join(' + ').replace(/\+ −/g, '− ') + ' = ' + mn(d) + '. Da un número, no un vector.');
    return bb(r, V(pr));
  });

  genr('esp', function () {
    var a, b, c, d, e, k, i;
    do {
      a = nz(-4, 4); b = nz(-4, 4); c = nz(-4, 4); d = nz(-4, 4); e = pick([1, -1, 2, -2]);
      k = -(a * c + b * d) / e;
    } while (k !== Math.round(k) || k === 0 || Math.abs(k) > 12);
    i = ri(0, 2);
    var uu = [a, b], vv = [c, d];
    uu.splice(i, 0, 'k'); vv.splice(i, 0, e);
    var us = '(' + uu.map(function (x) { return x === 'k' ? 'k' : mn(x); }).join(', ') + ')';
    return mk('esp', 'Halla k para que u = ' + us + ' y v = ' + V(vv) + ' sean ortogonales.', mn(k),
      [mn(-k), mn(a * c + b * d), mn(-(a * c + b * d)), mn(k + e)],
      'Ortogonales ⇔ u · v = 0: ' + mn(a * c + b * d) + (e < 0 ? ' − ' : ' + ') + (Math.abs(e) === 1 ? '' : Math.abs(e)) + 'k = 0, así que k = ' + mn(k) + '.');
  });

  genr('esp', function () {
    var u, v;
    do { u = rv(-3,3); v = rv(-3, 3); } while (isZ(u) || isZ(v) || par(u, v));
    var c = cross(u, v), q = 'u = ' + V(u) + ', v = ' + V(v) + '. ';
    if (Math.random() < 0.55) {
      var r = mk('esp', q + 'u × v =', V(c),
        [V(cross(v, u)), V([c[0], -c[1], c[2]]), V([u[0] * v[0], u[1] * v[1], u[2] * v[2]]), mn(dot(u, v)), V([-c[0], c[1], -c[2]])],
        'Determinante con i, j, k en la primera fila: (' + mn(u[1]) + '·' + pn(v[2]) + ' − ' + pn(u[2]) + '·' + pn(v[1]) + ', …). Ojo con el signo menos de la componente j.');
      return bb(r, mn(dot(u, v)));
    }
    var j = ri(0, 2), nm = ['primera', 'segunda', 'tercera'][j];
    var a1 = (j + 1) % 3, a2 = (j + 2) % 3;
    return mk('esp', q + 'La ' + nm + ' componente de u × v es', mn(c[j]),
      [mn(-c[j]), mn(u[a1] * v[a2] + u[a2] * v[a1]), mn(u[j] * v[j]), mn(c[j] + 1)],
      'Componente ' + nm + ': ' + mn(u[a1]) + '·' + pn(v[a2]) + ' − ' + pn(u[a2]) + '·' + pn(v[a1]) + ' = ' + mn(c[j]) + '.');
  });

  genr('esp', function () {
    var u, v, w, D;
    do { u = rv(-2, 3); v = rv(-2, 3); w = rv(-2, 3); D = det3(u, v, w); } while (D === 0 || Math.abs(D) > 30);
    var M = [u, v, w], pos = M[0][0] * M[1][1] * M[2][2] + M[0][1] * M[1][2] * M[2][0] + M[0][2] * M[1][0] * M[2][1];
    var r = mk('esp', 'Producto mixto [u, v, w] con u = ' + V(u) + ', v = ' + V(v) + ', w = ' + V(w), mn(D),
      [mn(-D), mn(pos), mn(D + 2), mn(D - 2), mn(2 * D)],
      '[u, v, w] = u · (v × w) = det ⟦|' + [u, v, w].map(function (x) { return x.map(mn).join(', '); }).join('; ') + '|⟧ = ' + mn(D) + ' (Sarrus).');
    r.p = 1; return r;
  });

  genr('esp', function () {
    var u, v, c, s, m;
    do { u = rv(-3, 3); v = rv(-3, 3); c = cross(u, v); s = n2(c); m = Math.round(Math.sqrt(s)); } while (s === 0 || m * m !== s || s > 400);
    if (Math.random() < 0.5) {
      return mk('esp', 'Área del paralelogramo de lados u = ' + V(u) + ' y v = ' + V(v), String(m),
        [f_fr(m, 2), String(s), String(Math.abs(dot(u, v))), String(2 * m)],
        'Área = |u × v|; u × v = ' + V(c) + ', de módulo √{' + s + '} = ' + m + '.');
    }
    var A = rv(-3, 3), B = sum(A, u), Cc = sum(A, v);
    return mk('esp', 'Área del triángulo A' + V(A) + ', B' + V(B) + ', C' + V(Cc), f_fr(m, 2),
      [String(m), f_fr(s, 2), f_fr(m, 3), f_fr(Math.abs(dot(u, v)), 2)],
      'AB⃗ × AC⃗ = ' + V(c) + ', de módulo ' + m + '. El triángulo es la mitad: ' + f_fr(m, 2) + '.');
  });

  genr('esp', function () {
    var u, v, w, D;
    do { u = rv(-2, 3); v = rv(-2, 3); w = rv(-2, 3); D = det3(u, v, w); } while (D === 0 || Math.abs(D) > 24);
    var A = Math.abs(D), r;
    if (Math.random() < 0.5) {
      r = mk('esp', 'Volumen del paralelepípedo de aristas u = ' + V(u) + ', v = ' + V(v) + ', w = ' + V(w), String(A),
        [mn(-A), f_fr(A, 6), f_fr(A, 3), String(2 * A), String(A + 1)],
        'V = |[u, v, w]|; el producto mixto vale ' + mn(D) + ', y el volumen es su valor absoluto: ' + A + '.');
      return bb(r, mn(-A));
    }
    r = mk('esp', 'Volumen del tetraedro de vértices O(0, 0, 0), A' + V(u) + ', B' + V(v) + ', C' + V(w), f_fr(A, 6),
      [String(A), f_fr(A, 3), f_fr(A, 2), '−' + f_fr(A, 6)],
      'V = ⟨1|6⟩·|[OA⃗, OB⃗, OC⃗]| = ⟨1|6⟩·' + A + ' = ' + f_fr(A, 6) + '.');
    return bb(r, '−' + f_fr(A, 6));
  });

  genr('esp', function () {
    var u, v, c, d, m, D0, k;
    do {
      u = rv(-3, 3); v = rv(-3, 3); c = ri(-3, 3); d = ri(-3, 3);
      m = u[0] * v[1] - u[1] * v[0]; D0 = det3(u, v, [c, d, 0]);
      k = m === 0 ? 0.5 : -D0 / m;
    } while (m === 0 || k !== Math.round(k) || k === 0 || Math.abs(k) > 12);
    var eq = mn(D0) + (m < 0 ? ' − ' : ' + ') + (Math.abs(m) === 1 ? '' : Math.abs(m)) + 'k = 0';
    if (D0 === 0) eq = (m < 0 ? '−' : '') + (Math.abs(m) === 1 ? '' : Math.abs(m)) + 'k = 0';
    return mk('esp', 'Halla k para que u = ' + V(u) + ', v = ' + V(v) + ' y w = (' + mn(c) + ', ' + mn(d) + ', k) sean coplanarios.', mn(k),
      [mn(-k), mn(D0), mn(m), mn(k + 1), mn(k - 1)],
      'Coplanarios ⇔ det(u, v, w) = 0: ' + eq + ', luego k = ' + mn(k) + '.');
  });

  genr('esp', function () {
    var A = rv(-6, 6), B = A.map(function (x) { return x + 2 * ri(-4, 4); }), M = sc(0.5, sum(A, B));
    if (isZ(sub(A, B))) B[0] += 2, M = sc(0.5, sum(A, B));
    if (Math.random() < 0.6) {
      return mk('esp', 'Punto medio de A' + V(A) + ' y B' + V(B), V(M),
        [V(sc(0.5, sub(B, A))), V(sum(A, B)), V(sub(B, A)), V(sc(0.5, sub(A, B)))],
        'Se suman las coordenadas y se divide entre 2: M = ⟨A + B|2⟩ = ' + V(M) + '.');
    }
    return mk('esp', 'M' + V(M) + ' es el punto medio de A' + V(A) + ' y B. Entonces B =', V(B),
      [V(sub(M, A)), V(sum(A, M)), V(sub(sc(2, A), M)), V(sc(2, M))],
      'B = 2M − A = ' + V(sc(2, M)) + ' − ' + V(A) + ' = ' + V(B) + '.');
  });

  genr('esp', function () {
    var a = qv(), b = qv(), d = dot(a.v, b.v), p = a.m * b.m;
    return mk('esp', 'cos(u, v) para u = ' + V(a.v) + ' y v = ' + V(b.v), f_fr(d, p),
      [f_fr(d, a.m + b.m), mn(d), f_fr(-d, p), f_fr(d, p * p), f_fr(d + 1, p)],
      'cos α = (u · v) / (|u|·|v|): u · v = ' + mn(d) + ', |u| = ' + a.m + ', |v| = ' + b.m + ' → ' + f_fr(d, p) + '.');
  });

  genr('esp', function () {
    var o = qv(true), v = o.v, m = o.m;
    var fr = function (den) { return VF(v.map(function (x) { return f_fr(x, den); })); };
    return mk('esp', 'Vector unitario con la misma dirección y sentido que u = ' + V(v), fr(m),
      [fr(m * m), VF(v.map(function (x) { return f_fr(-x, m); })), fr(Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2])), V(v.map(function (x) { return x * m; }))],
      '|u| = ' + m + '; se divide cada componente entre ' + m + '.');
  });

  genr('esp', function () {
    var A = rv(-5, 5), v = nzv(-5, 5), B = sum(A, v);
    return mk('esp', 'A' + V(A) + ' y AB⃗ = ' + V(v) + '. Entonces B =', V(B),
      [V(sub(A, v)), V(sub(v, A)), V(sc(2, v)), V([B[0], B[1], -B[2]])],
      'B = A + AB⃗ = ' + V(A) + ' + ' + V(v) + ' = ' + V(B) + '.');
  });

  add('esp', 'Si u × v = 0⃗ con u y v no nulos, u y v son', 'Paralelos', ['Perpendiculares', 'Unitarios', 'Iguales'],
    'u × v = 0⃗ cuando sen α = 0, es decir, cuando los vectores tienen la misma dirección.');
  add('esp', 'El vector u × v es', 'Perpendicular a u y a v', ['Paralelo a u y a v', 'Un número real', 'Paralelo a u + v'],
    'El producto vectorial da un vector perpendicular a los dos factores (regla de la mano derecha).');
  barb('El vector u × v es', 'Un número real');
  add('esp', 'v × u =', '−(u × v)', ['u × v', 'u · v', '0⃗'],
    'El producto vectorial es anticonmutativo: cambiar el orden cambia el sentido.');
  add('esp', 'Si u · v = 0 con u y v no nulos, los vectores son', 'Perpendiculares', ['Paralelos', 'Iguales', 'Linealmente dependientes'],
    'u · v = |u|·|v|·cos α = 0 solo si cos α = 0, es decir, α = 90°.');
  add('esp', 'Si [u, v, w] = 0, los vectores u, v, w son', 'Coplanarios', ['Perpendiculares entre sí', 'Unitarios', 'Una base de ℝ^{3}'],
    'Producto mixto nulo ⇔ volumen nulo ⇔ están en un mismo plano (linealmente dependientes).');
  add('esp', 'i⃗ × j⃗ =', 'k⃗', ['0⃗', '−k⃗', '1'],
    'Los vectores de la base canónica cumplen i⃗ × j⃗ = k⃗, j⃗ × k⃗ = i⃗, k⃗ × i⃗ = j⃗.');
  barb('i⃗ × j⃗ =', '1');
  add('esp', 'u · u =', '|u|^{2}', ['|u|', '0', '2|u|'], 'u · u = |u|·|u|·cos 0° = |u|^{2}.');
  add('esp', '|u × v| es', 'El área del paralelogramo', ['El área del triángulo', 'El volumen', 'El ángulo entre u y v'],
    '|u × v| = |u|·|v|·sen α, que es base por altura del paralelogramo de lados u y v.');
  add('esp', '|u × v| =', '|u|·|v|·sen α', ['|u|·|v|·cos α', '|u|·|v|', 'u · v'],
    'El módulo del producto vectorial usa el seno; el producto escalar usa el coseno.');
  add('esp', 'Tres vectores de ℝ^{3} linealmente independientes forman', 'Una base de ℝ^{3}', ['Un plano', 'Una recta', 'Un sistema dependiente'],
    'En ℝ^{3} cualquier terna de vectores independientes es una base.');
  add('esp', 'Cuatro vectores de ℝ^{3} son siempre', 'Linealmente dependientes', ['Linealmente independientes', 'Perpendiculares', 'Una base'],
    'En ℝ^{3} como mucho hay 3 vectores independientes.');

  /* =====================================================================
     rp — Rectas y planos en el espacio
     ===================================================================== */
  genr('rp', function () {
    var P = rv(-5, 5), v = [nz(-5, 5), nz(-5, 5), nz(-5, 5)], form = ri(0, 1);
    var eq = form ? 'r: ' + cont(P, v) : 'r: x = ' + pt(P[0], v[0]) + ', y = ' + pt(P[1], v[1]) + ', z = ' + pt(P[2], v[2]);
    if (Math.random() < 0.5) {
      return mk('rp', eq + '. Un vector director de r es', V(v), [V(P), V(sc(-1, P)), V(sum(P, v)), V([v[1], v[0], v[2]])],
        (form ? 'En la continua, el vector director está en los denominadores: ' : 'En las paramétricas, el vector director son los coeficientes de λ: ') + V(v) + '.');
    }
    return mk('rp', eq + '. Un punto de r es', V(P), [V(sc(-1, P)), V(v), V([-P[0], P[1], P[2]]), V([P[0], -P[1], -P[2]])],
      (form ? 'En la continua se cambia el signo de lo que acompaña a x, y, z: ' : 'Para λ = 0 obtenemos el punto ') + V(P) + '.');
  });

  genr('rp', function () {
    var a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-9, 9), q = 'π: ' + plane(a, b, c, d) + '. Un vector normal a π es';
    return mk('rp', q, V([a, b, c]), [V([a, b, d]), V([b, c, d]), V([a, b, -c]), V([-a, b, c])],
      'El vector normal son los coeficientes de x, y, z: ' + V([a, b, c]) + '.');
  });

  genr('rp', function () {
    var n, P, d;
    do { n = rv(-4, 4); P = rv(-3, 3); } while (isZ(n) || n.indexOf(0) >= 0 && Math.random() < 0.7);
    d = -dot(n, P);
    var A = [n[0], n[1], n[2], d];
    var cand = [[n[0], n[1], n[2], -d], [P[0], P[1], P[2], -dot(n, P)], [n[0], n[1], n[2], 0], [n[0], n[1], n[2], d + 2], [P[0], P[1], P[2], -n2(P)]];
    var w = [];
    cand.forEach(function (c) { if (!(c[0] === 0 && c[1] === 0 && c[2] === 0) && !prop4(c, A)) w.push(plane(c[0], c[1], c[2], c[3])); });
    return mk('rp', 'Plano que pasa por P' + V(P) + ' con vector normal n = ' + V(n), plane(n[0], n[1], n[2], d), w,
      'Con el normal: ' + lin3([n[0], n[1], n[2]], ['x', 'y', 'z']) + ' + D = 0; al sustituir P sale D = ' + mn(d) + '.');
  });

  genr('rp', function () {
    var a = nz(-4, 4), b = pick([1, -1, 2, -2, 3]), c = nz(-4, 4), k = nz(-6, 6), P = [ri(-3, 3), k, ri(-3, 3)];
    var n = [a, b, c], i = ri(0, 2);
    /* coloca k en la posición i */
    var coefs = [a, c], coords = [P[0], P[2]];
    coefs.splice(i, 0, b); coords.splice(i, 0, k);
    var d = -(coefs[0] * coords[0] + coefs[1] * coords[1] + coefs[2] * coords[2]);
    var ps = '(' + coords.map(function (x, j) { return j === i ? 'k' : mn(x); }).join(', ') + ')';
    var rest = d + coefs.reduce(function (s, cc, j) { return j === i ? s : s + cc * coords[j]; }, 0);
    return mk('rp', 'Halla k para que P' + ps + ' pertenezca a π: ' + plane(coefs[0], coefs[1], coefs[2], d), mn(k),
      [mn(-k), mn(rest), mn(-rest), mn(k + 1), mn(k - 1)],
      'Sustituimos P en π: ' + lin3([b, rest], ['k', '']) + ' = 0 → k = ' + mn(k) + '.');
  });

  genr('rp', function () {
    var a = nz(-3, 3), b = nz(-3, 3), c = pick([1, -1]), d = nz(-6, 6);
    var on = function (p) { return a * p[0] + b * p[1] + c * p[2] + d === 0; };
    var x = ri(-3, 3), y = ri(-3, 3), z = -(a * x + b * y + d) / c, Pt = [x, y, z];
    var cand = [[x, y, -z], [-x, y, z], [x, -y, z], [x + 1, y, z], [y, x, z], [x, y, z + 1], [-x, -y, -z]], w = [];
    cand.forEach(function (p) { if (!on(p)) w.push(V(p)); });
    return mk('rp', '¿Qué punto pertenece a π: ' + plane(a, b, c, d) + '?', V(Pt), shuffle(w),
      'Sustituyendo ' + V(Pt) + ': ' + [a * x, b * y, c * z, d].map(pn).join(' + ') + ' = 0. Los demás puntos no cumplen la ecuación.');
  });

  genr('rp', function () {
    var n = red(nzv(-4, 4)), d1 = ri(-6, 6), lam = pick([2, -1, 3, -2]), cs = ri(0, 2), n2v, d2, ans, e;
    if (cs === 0) { n2v = sc(lam, n); d2 = lam * d1; ans = 'Coincidentes'; e = 'π_{2} es π_{1} multiplicado por ' + mn(lam) + ': todos los coeficientes son proporcionales.'; }
    else if (cs === 1) { n2v = sc(lam, n); d2 = lam * d1 + nz(-4, 4); ans = 'Paralelos'; e = 'Los normales son proporcionales pero el término independiente no: planos paralelos distintos.'; }
    else { do { n2v = nzv(-4, 4); } while (par(n, n2v)); d2 = ri(-6, 6); ans = 'Secantes'; e = 'Los vectores normales no son proporcionales: los planos se cortan en una recta.'; }
    var r = mk('rp', 'Posición relativa de π_{1}: ' + plane(n[0], n[1], n[2], d1) + ' y π_{2}: ' + plane(n2v[0], n2v[1], n2v[2], d2),
      ans, ['Coincidentes', 'Paralelos', 'Secantes', 'Se cruzan'], e);
    return bb(r, 'Se cruzan');
  });

  genr('rp', function () {
    var n = red(nzv(-3, 3)), P = rv(-3, 3), cs = ri(0, 2), v, d, ans, e;
    if (cs === 0) {
      do { v = nzv(-3, 3); } while (dot(v, n) === 0);
      d = ri(-6, 6); ans = 'Se cortan en un punto'; e = 'v · n = ' + mn(dot(v, n)) + ' ≠ 0: la recta no es paralela al plano, lo corta en un punto.';
    } else {
      do { v = red(cross(n, nzv(-2, 2))); } while (isZ(v));
      if (cs === 1) { d = -dot(n, P); ans = 'Contenida en el plano'; e = 'v · n = 0 y el punto ' + V(P) + ' de r cumple la ecuación de π: r está contenida.'; }
      else { d = -dot(n, P) + nz(-4, 4); ans = 'Paralela al plano'; e = 'v · n = 0 pero el punto ' + V(P) + ' de r no está en π: recta paralela.'; }
    }
    var r = mk('rp', line(P, v) + ' y π: ' + plane(n[0], n[1], n[2], d) + '. Posición relativa:',
      ans, ['Se cortan en un punto', 'Paralela al plano', 'Contenida en el plano', 'Se cruzan'], e);
    return bb(r, 'Se cruzan');
  });

  genr('rp', function () {
    var u, v, P, Q, cs = ri(0, 3), ans, e;
    do { u = nzv(-2, 2); v = nzv(-2, 2); } while (par(u, v));
    if (cs === 0) {
      var X = rv(-3, 3); P = sum(X, sc(nz(-2, 2), u)); Q = sum(X, sc(nz(-2, 2), v));
      ans = 'Se cortan'; e = 'u y v no son paralelos y det(PQ⃗, u, v) = 0: son coplanarias, así que se cortan en un punto.';
    } else if (cs === 1) {
      var w; P = rv(-3, 3);
      do { w = rv(-3, 3); } while (det3(w, u, v) === 0);
      Q = sum(P, w); ans = 'Se cruzan'; e = 'u y v no son paralelos y det(PQ⃗, u, v) = ' + mn(det3(w, u, v)) + ' ≠ 0: no son coplanarias, se cruzan.';
    } else {
      var lam = pick([1, 2, -1, -2]); v = sc(lam, u); P = rv(-3, 3);
      if (cs === 2) { var w2; do { w2 = rv(-3, 3); } while (par(w2, u)); Q = sum(P, w2); ans = 'Paralelas'; e = 'Vectores directores proporcionales y el punto de s no está en r: paralelas.'; }
      else { Q = sum(P, sc(nz(-2, 2), u)); ans = 'Coincidentes'; e = 'Vectores directores proporcionales y el punto de s también está en r: son la misma recta.'; }
    }
    var r = mk('rp', 'Posición relativa de ' + line(P, u, 'r') + ' y ' + line(Q, v, 's').replace('λ', 'μ'),
      ans, ['Se cortan', 'Se cruzan', 'Paralelas', 'Coincidentes'], e);
    r.p = 1; return r;
  });

  genr('rp', function () {
    var PR = [[[1, 0, 0], [1, 1, 0], 45], [[1, 0, 1], [0, 0, 1], 45], [[1, 1, 0], [0, 1, 1], 60], [[1, 0, 1], [1, 1, 0], 60],
      [[2, 1, 1], [1, 1, 0], 30], [[1, 1, 1], [1, -1, 0], 90], [[1, 2, -1], [1, 0, 1], 90], [[2, 1, 2], [4, 2, 4], 0], [[1, -1, 2], [2, 4, 1], 90]];
    var p = pick(PR), pm = perm3(), sg = sgn3(), a = ap(p[0], pm, sg), b = ap(p[1], pm, sg), t = p[2];
    var kind = ri(0, 2), q, ans, e;
    var dd = Math.abs(dot(a, b)), PP = n2(a) * n2(b), sq = Math.round(Math.sqrt(PP));
    var cosx = dd === 0 ? '0' : sq * sq === PP ? f_fr(dd, sq) : dd + '/√{' + PP + '}';
    if (kind === 0) { q = 'Ángulo entre los planos de vectores normales n_{1} = ' + V(a) + ' y n_{2} = ' + V(b); ans = t; e = 'Es el ángulo de los normales: cos α = |n_{1} · n_{2}| / (|n_{1}|·|n_{2}|) = ' + cosx + ' → ' + t + '°.'; }
    else if (kind === 1) { q = 'Ángulo entre las rectas de vectores directores u = ' + V(a) + ' y v = ' + V(b); ans = t; e = 'cos α = |u · v| / (|u|·|v|) = ' + cosx + ' → ' + t + '°.'; }
    else { q = 'Ángulo entre la recta de vector director v = ' + V(a) + ' y el plano de normal n = ' + V(b); ans = 90 - t; e = 'Entre v y n hay ' + t + '°; el ángulo recta-plano es el complementario: 90° − ' + t + '° = ' + (90 - t) + '° (sen α = |v · n| / (|v|·|n|)).'; }
    var w = [90 - ans, 0, 30, 45, 60, 90].filter(function (x) { return x !== ans; }).map(function (x) { return x + '°'; });
    return mk('rp', q, ans + '°', w, e);
  });

  genr('rp', function () {
    var o = qv(), n = o.v, N = o.m, P = rv(-4, 4), d = ri(-9, 9), val = dot(n, P) + d;
    if (val === 0) { d += 1; val += 1; }
    var A = Math.abs(val);
    var r = mk('rp', 'Distancia de P' + V(P) + ' al plano π: ' + plane(n[0], n[1], n[2], d), f_fr(A, N),
      [f_fr(-A, N), f_fr(A, N * N), String(A), f_fr(Math.abs(dot(n, P) - d), N), f_fr(A, Math.abs(n[0]) + Math.abs(n[1]) + Math.abs(n[2]))],
      'Sustituimos P en π: |' + mn(val) + '| = ' + A + '; dividimos entre |n| = √{' + N * N + '} = ' + N + ' → ' + f_fr(A, N) + '.');
    return bb(r, f_fr(-A, N));
  });

  genr('rp', function () {
    var o = qv(), n = o.v, N = o.m, d1 = ri(-9, 9), d2, k = Math.random() < 0.4 ? 2 : 1;
    do { d2 = ri(-9, 9); } while (d2 === d1);
    var r = mk('rp', 'Distancia entre π_{1}: ' + plane(n[0], n[1], n[2], d1) + ' y π_{2}: ' + plane(k * n[0], k * n[1], k * n[2], k * d2),
      f_fr(Math.abs(d1 - d2), N),
      [f_fr(Math.abs(d1 + d2), N), f_fr(Math.abs(k * d2 - d1), N), String(Math.abs(d1 - d2)), f_fr(Math.abs(d1 - d2), N * N)],
      (k === 2 ? 'Primero dividimos π_{2} entre 2 para tener el mismo normal. ' : '') + 'd = |' + mn(d1) + ' − (' + mn(d2) + ')| / ' + N + ' = ' + f_fr(Math.abs(d1 - d2), N) + '.');
    return r;
  });

  genr('rp', function () {
    var A = rv(-3, 3), u, v, n;
    do { u = rv(-2, 2); v = rv(-2, 2); n = cross(u, v); } while (isZ(n));
    var B = sum(A, u), Cc = sum(A, v), ans = red(n);
    var cand = [[u[0] * v[0], u[1] * v[1], u[2] * v[2]], red([n[0], -n[1], n[2]]), sum(u, v), red(sum(B, Cc)), red([n[1], n[0], n[2]]), sub(u, v)], w = [];
    cand.forEach(function (c) { if (!isZ(c) && !par(c, ans)) w.push(V(c)); });
    return mk('rp', 'Un vector normal al plano que pasa por A' + V(A) + ', B' + V(B) + ' y C' + V(Cc), V(ans), w,
      'n = AB⃗ × AC⃗ = ' + V(u) + ' × ' + V(v) + ' = ' + V(n) + (V(n) !== V(ans) ? ', proporcional a ' + V(ans) : '') + '.');
  });

  genr('rp', function () {
    var v = nzv(-4, 4), P = rv(-4, 4), d = -dot(v, P), A = [v[0], v[1], v[2], d];
    var cand = [[v[0], v[1], v[2], -d], [v[0], v[1], v[2], 0], [P[0], P[1], P[2], -dot(v, P)], [v[0], v[1], v[2], d + 1]], w = [];
    cand.forEach(function (c) { if (!(c[0] === 0 && c[1] === 0 && c[2] === 0) && !prop4(c, A)) w.push(plane(c[0], c[1], c[2], c[3])); });
    return mk('rp', 'Plano perpendicular a ' + line([0, 0, 0], v).replace(V([0, 0, 0]) + ' + ', '') + ' que pasa por P' + V(P),
      plane(v[0], v[1], v[2], d), w,
      'El vector director de r sirve de normal: ' + lin3(v, ['x', 'y', 'z']) + ' + D = 0, y P da D = ' + mn(d) + '.');
  });

  genr('rp', function () {
    var P = rv(-4, 4), v = nzv(-3, 3), k = pick([2, -1, 3, -2]), X = sum(P, sc(k, v));
    return mk('rp', line(P, v) + '. El punto de r con λ = ' + mn(k) + ' es', V(X),
      [V(sum(sc(k, P), v)), V(sum(P, v)), V(sub(P, sc(k, v))), V(sc(k, sum(P, v)))],
      'Sustituimos λ = ' + mn(k) + ': ' + V(P) + ' + ' + pn(k) + '·' + V(v) + ' = ' + V(X) + '.');
  });

  add('rp', 'Un plano queda determinado por', 'Tres puntos no alineados', ['Dos puntos', 'Tres puntos cualesquiera', 'Un punto y un vector'],
    'Si los tres puntos estuvieran alineados, por ellos pasarían infinitos planos.');
  add('rp', 'Dos rectas del espacio se cruzan cuando', 'No son paralelas ni se cortan', ['Se cortan en un punto', 'Son perpendiculares', 'Están en el mismo plano'],
    'Cruzarse es no ser coplanarias: ni paralelas ni secantes.');
  add('rp', 'Para hallar la proyección de P sobre un plano π se corta π con', 'La recta por P perpendicular a π', ['Una recta por P paralela a π', 'El plano XY', 'La recta que une P con el origen'],
    'La recta perpendicular a π por P tiene como director el normal de π; su corte con π es la proyección.');
  add('rp', 'En el espacio, la ecuación z = 0 representa', 'El plano XY', ['El eje Z', 'El origen', 'El eje X'],
    'Una sola ecuación lineal en ℝ^{3} es un plano: el de los puntos (x, y, 0).');
  add('rp', 'En forma implícita, una recta del espacio necesita', 'Dos ecuaciones (dos planos)', ['Una ecuación', 'Tres ecuaciones', 'Cuatro ecuaciones'],
    'Una recta es la intersección de dos planos secantes.');
  barb('En forma implícita, una recta del espacio necesita', 'Una ecuación');
  add('rp', 'Para el ángulo entre una recta (vector v) y un plano (normal n) se usa', 'sen α = |cos(v, n)|', ['cos α = |cos(v, n)|', 'tg α = |cos(v, n)|', 'α = 90° siempre'],
    'El ángulo recta-plano es el complementario del ángulo entre v y n, por eso aparece el seno.');
  add('rp', 'Si los vectores normales de dos planos son perpendiculares, los planos son', 'Perpendiculares', ['Paralelos', 'Coincidentes', 'Se cruzan'],
    'El ángulo entre dos planos es el de sus vectores normales.');
  barb('Si los vectores normales de dos planos son perpendiculares, los planos son', 'Se cruzan');
  add('rp', 'Si el vector director de r es perpendicular al normal de π, la recta', 'Es paralela o está contenida', ['Es perpendicular al plano', 'Corta al plano en un punto', 'Se cruza con el plano'],
    'v · n = 0 significa que r va en una dirección del plano: paralela o contenida (hay que probar un punto).');
  barb('Si el vector director de r es perpendicular al normal de π, la recta', 'Se cruza con el plano');
  add('rp', 'Una recta perpendicular al plano 2x − y + 3z = 5 tiene vector director', '(2, −1, 3)', ['(2, −1, 5)', '(−1, 3, 5)', '(1, 2, 0)'],
    'Si r ⊥ π, el vector director de r es el normal de π: (2, −1, 3).');

  /* =====================================================================
     bay — Probabilidad condicionada y Bayes
     ===================================================================== */
  genr('bay', function () {
    var v = ri(0, 2), r;
    if (v === 0) {
      var s = ri(3, 11), c = 6 - Math.abs(s - 7);
      r = mk('bay', 'Se lanzan dos dados. P(suma = ' + s + ') =', f_fr(c, 36), [f_fr(1, 11), f_fr(c, 12), f_fr(c, 6), f_fr(s, 36)],
        'Hay 36 casos equiprobables y ' + c + ' dan suma ' + s + ': ' + f_fr(c, 36) + '. Las 11 sumas no son equiprobables.');
      return bb(r, f_fr(1, 11));
    }
    if (v === 1) {
      var n = ri(4, 6);
      return mk('bay', 'Se lanzan dos dados. P(al menos un ' + n + ') =', f_fr(11, 36), [f_fr(1, 3), f_fr(1, 36), f_fr(10, 36), f_fr(25, 36)],
        'P = 1 − P(ningún ' + n + ') = 1 − ⟨25|36⟩ = ⟨11|36⟩.');
    }
    var pal = pick(['oros', 'copas', 'espadas', 'bastos']), o = pick([['figura', 12, 3], ['as', 4, 1], ['carta menor que 4', 12, 3]]);
    return mk('bay', 'Baraja española de 40 cartas. P(' + pal + ' o ' + o[0] + ') =', f_fr(10 + o[1] - o[2], 40),
      [f_fr(10 + o[1], 40), f_fr(o[2], 40), f_fr(10 * o[1], 1600), f_fr(10 + o[1] + o[2], 40)],
      'P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ⟨10|40⟩ + ⟨' + o[1] + '|40⟩ − ⟨' + o[2] + '|40⟩ = ' + f_fr(10 + o[1] - o[2], 40) + '.');
  });

  genr('bay', function () {
    var ctx = pick([['chicos', 'chicas', 'usan gafas', 'no usan gafas', 'gafas', 'chico'], ['de 1.º', 'de 2.º', 'hacen deporte', 'no hacen deporte', 'deporte', 'de 1.º'],
      ['hombres', 'mujeres', 'prefieren té', 'prefieren café', 'té', 'hombre']]);
    var a = ri(3, 20), b = ri(3, 20), c = ri(3, 20), d = ri(3, 20), T = a + b + c + d;
    var txt = 'En un grupo: ' + ctx[0] + ' que ' + ctx[2] + ' ' + a + ', ' + ctx[0] + ' que ' + ctx[3] + ' ' + b + ', ' + ctx[1] + ' que ' + ctx[2] + ' ' + c + ', ' + ctx[1] + ' que ' + ctx[3] + ' ' + d + '. Se elige uno al azar. ';
    var opts = [f_fr(a, T), f_fr(a, a + b), f_fr(a, a + c), f_fr(a + b, T), f_fr(a + c, T)];
    var k = ri(0, 2), q, ans, e;
    var X = ctx[0] === 'chicos' ? 'chico' : ctx[0] === 'hombres' ? 'hombre' : ctx[0];
    if (k === 0) { q = 'P(' + ctx[4] + ' / ' + X + ') ='; ans = opts[1]; e = 'Solo miramos a los ' + ctx[0] + ' (' + (a + b) + '), de los que ' + a + ' cumplen: ' + opts[1] + '.'; }
    else if (k === 1) { q = 'P(' + X + ' / ' + ctx[4] + ') ='; ans = opts[2]; e = 'Solo miramos a los que ' + ctx[2] + ' (' + (a + c) + '), de los que ' + a + ' son ' + ctx[0] + ': ' + opts[2] + '.'; }
    else { q = 'P(' + X + ' y ' + ctx[4] + ') ='; ans = opts[0]; e = 'Intersección: ' + a + ' casos de un total de ' + T + ': ' + opts[0] + '.'; }
    return mk('bay', txt + q, ans, opts, e);
  });

  genr('bay', function () {
    var A = 5 * ri(4, 14), B = 5 * ri(4, 14), I, v = ri(0, 2), r;
    do { I = 5 * ri(1, Math.min(A, B) / 5 - 1); } while (A + B - I > 100);
    if (v === 0) {
      r = mk('bay', 'P(A) = ' + dz(A / 100) + ', P(B) = ' + dz(B / 100) + ', P(A ∩ B) = ' + dz(I / 100) + '. P(A ∪ B) =', dz((A + B - I) / 100),
        [dz((A + B) / 100), dz((A + B - 2 * I) / 100), dz(A * B / 10000), dz((A + B + I) / 100)],
        'P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ' + dz((A + B - I) / 100) + '.');
      if (A + B > 100) bb(r, dz((A + B) / 100));
      return r;
    }
    if (v === 1) {
      var U = A + B - I;
      return mk('bay', 'P(A) = ' + dz(A / 100) + ', P(B) = ' + dz(B / 100) + ', P(A ∪ B) = ' + dz(U / 100) + '. P(A ∩ B) =', dz(I / 100),
        [dz((A + B + U) / 100 - 1), dz(A * B / 10000), dz((U - A) / 100), dz((U - B) / 100)],
        'P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = ' + dz(I / 100) + '.');
    }
    var B2 = Math.min(B, 100 - A);
    if (B2 < 10) B2 = 10, A = Math.min(A, 80);
    return mk('bay', 'A y B son incompatibles, P(A) = ' + dz(A / 100) + ' y P(B) = ' + dz(B2 / 100) + '. P(A ∪ B) =', dz((A + B2) / 100),
      [dz(A * B2 / 10000), dz((A + B2) / 100 - A * B2 / 10000), '0', dz(Math.abs(A - B2) / 100)],
      'Incompatibles: P(A ∩ B) = 0, así que P(A ∪ B) = P(A) + P(B).');
  });

  genr('bay', function () {
    var A = pick([20, 30, 40, 50, 60, 70]), B = pick([20, 30, 40, 50, 60]), I = A * B / 100, ind = Math.random() < 0.5;
    if (!ind) I = I + pick([-4, -2, 2, 3, 5]);
    var yes = 'Sí, P(A ∩ B) = P(A)·P(B)', no = 'No, P(A ∩ B) ≠ P(A)·P(B)';
    return mk('bay', 'P(A) = ' + dz(A / 100) + ', P(B) = ' + dz(B / 100) + ', P(A ∩ B) = ' + dz(I / 100) + '. ¿Son A y B independientes?',
      ind ? yes : no, [ind ? no : yes, 'No, porque son compatibles', 'Sí, porque P(A ∩ B) ≠ 0'],
      'P(A)·P(B) = ' + dz(A * B / 10000) + (ind ? ' coincide' : ' no coincide') + ' con P(A ∩ B) = ' + dz(I / 100) + '.');
  });

  genr('bay', function () {
    var B = pick([20, 25, 40, 50, 60, 80]), rr = pick([20, 25, 40, 50, 60, 75, 80]), I = B * rr / 100;
    if (I !== Math.round(I)) { B = 40; rr = 50; I = 20; }
    var A = Math.min(95, I + 5 * ri(2, 8)), r;
    var w = [dz(I / 100), dz(I * B / 10000), dz(B / I), dz(B / 100)];
    if ((I * 100) % A === 0) w.push(dz(I / A));
    r = mk('bay', 'P(A) = ' + dz(A / 100) + ', P(B) = ' + dz(B / 100) + ', P(A ∩ B) = ' + dz(I / 100) + '. P(A / B) =', dz(rr / 100), w,
      'P(A / B) = ⟨P(A ∩ B)|P(B)⟩ = ⟨' + dz(I / 100) + '|' + dz(B / 100) + '⟩ = ' + dz(rr / 100) + '.');
    return bb(r, dz(B / I));
  });

  genr('bay', function () {
    var A = 5 * ri(4, 12), B = 5 * ri(4, 12), I;
    do { I = 5 * ri(1, Math.min(A, B) / 5 - 1); } while (A + B - I > 95);
    var g = 'P(A) = ' + dz(A / 100) + ', P(B) = ' + dz(B / 100) + ', P(A ∩ B) = ' + dz(I / 100) + '. ', v = ri(0, 2);
    if (v === 0) return mk('bay', g + 'P(A^{c} ∩ B^{c}) =', dz(1 - (A + B - I) / 100),
      [dz((100 - A) * (100 - B) / 10000), dz(1 - I / 100), dz((A + B - I) / 100), dz(1 - (A + B) / 100)],
      'De Morgan: A^{c} ∩ B^{c} = (A ∪ B)^{c}, así que vale 1 − P(A ∪ B) = 1 − ' + dz((A + B - I) / 100) + '.');
    if (v === 1) return mk('bay', g + 'P(A^{c} ∪ B^{c}) =', dz(1 - I / 100),
      [dz(1 - (A + B - I) / 100), dz((200 - A - B) / 100), dz(I / 100), dz((100 - A) * (100 - B) / 10000)],
      'De Morgan: A^{c} ∪ B^{c} = (A ∩ B)^{c}, así que vale 1 − P(A ∩ B).');
    return mk('bay', g + 'P(A ∩ B^{c}) =', dz((A - I) / 100),
      [dz(A * (100 - B) / 10000), dz((B - I) / 100), dz(1 - I / 100), dz((A + I) / 100)],
      'P(A ∩ B^{c}) = P(A) − P(A ∩ B) = ' + dz((A - I) / 100) + ' (A sin la parte común).');
  });

  genr('bay', function () {
    var r1 = ri(1, 6), b1 = ri(1, 6), r2 = ri(1, 6), b2 = ri(1, 6), n1 = r1 + b1, n2v = r2 + b2;
    var how = pick([['Se lanza una moneda: si sale cara se extrae de U_{1}, si sale cruz de U_{2}.', 1, 2], ['Se lanza un dado: si sale 1 o 2 se extrae de U_{1}; si no, de U_{2}.', 1, 3]]);
    var pn = how[1], pd = how[2];
    var pl = function (k, a) { return k + ' ' + a + (k === 1 ? '' : 's'); };
    var txt = 'U_{1} tiene ' + pl(r1, 'roja') + ' y ' + pl(b1, 'blanca') + '; U_{2}, ' + pl(r2, 'roja') + ' y ' + pl(b2, 'blanca') + '. ' + how[0] + ' ';
    var num = pn * r1 * n2v + (pd - pn) * r2 * n1, den = pd * n1 * n2v;
    if (Math.random() < 0.5) {
      return mk('bay', txt + 'P(roja) =', f_fr(num, den), [f_fr(r1 + r2, n1 + n2v), f_fr(r1 * n2v + r2 * n1, 2 * n1 * n2v), f_fr(r1 * r2, n1 * n2v), f_fr(r1 * n2v + r2 * n1, n1 * n2v)],
        'Probabilidad total: ' + f_fr(pn, pd) + '·' + f_fr(r1, n1) + ' + ' + f_fr(pd - pn, pd) + '·' + f_fr(r2, n2v) + ' = ' + f_fr(num, den) + '.');
    }
    var r = mk('bay', txt + 'Ha salido roja. P(U_{1} / roja) =', f_fr(pn * r1 * n2v, num),
      [f_fr(r1, n1), f_fr(r1, r1 + r2), f_fr(pn * r1, pd * n1), f_fr(pn, pd)],
      'Bayes: P(U_{1} / R) = ⟨P(U_{1})·P(R / U_{1})|P(R)⟩ = ⟨' + f_fr(pn * r1, pd * n1) + '|' + f_fr(num, den) + '⟩ = ' + f_fr(pn * r1 * n2v, num) + '.');
    r.p = 1; return r;
  });

  genr('bay', function () {
    var three = Math.random() < 0.5, p, d, names;
    if (three) { var a = 10 * ri(2, 5), b = 10 * ri(2, 6); if (a + b > 90) b = 90 - a; p = [a, b, 100 - a - b]; names = ['A', 'B', 'C']; }
    else { var a2 = 10 * ri(2, 8); p = [a2, 100 - a2]; names = ['A', 'B']; }
    d = p.map(function () { return ri(1, 6); });
    var tot = 0; p.forEach(function (x, i) { tot += x * d[i]; });
    var txt = 'Una fábrica tiene ' + p.length + ' máquinas: ' + names.map(function (nm, i) { return nm + ' produce el ' + p[i] + ' % de las piezas (' + d[i] + ' % defectuosas)'; }).join(', ') + '. ';
    if (Math.random() < 0.45) {
      var avg = d.reduce(function (s, x) { return s + x; }, 0) / d.length;
      return mk('bay', txt + 'P(pieza defectuosa) =', dz(tot / 10000),
        [dz(avg / 100), dz(d.reduce(function (s, x) { return s + x; }, 0) / 100), dz(tot / 1000), dz(p[0] * d[0] / 10000)],
        'Probabilidad total: ' + p.map(function (x, i) { return dz(x / 100) + '·' + dz(d[i] / 100); }).join(' + ') + ' = ' + dz(tot / 10000) + '.');
    }
    var i = ri(0, p.length - 1), r = mk('bay', txt + 'Una pieza es defectuosa. P(' + names[i] + ' / defectuosa) =', f_fr(p[i] * d[i], tot),
      [dz(d[i] / 100), dz(p[i] / 100), dz(p[i] * d[i] / 10000), f_fr(d[i], d.reduce(function (s, x) { return s + x; }, 0))],
      'Bayes: ⟨' + dz(p[i] / 100) + '·' + dz(d[i] / 100) + '|' + dz(tot / 10000) + '⟩ = ' + f_fr(p[i] * d[i], tot) + '. No confundas con P(defectuosa / ' + names[i] + ') = ' + dz(d[i] / 100) + '.');
    bb(r, dz(d[i] / 100));
    if (three) r.p = 1;
    return r;
  });

  genr('bay', function () {
    var p = pick([1, 2, 5, 10, 20]), s = pick([80, 90, 95]), f = pick([5, 10, 20]);
    var num = p * s, den = p * s + (100 - p) * f;
    var r = mk('bay', 'Una enfermedad afecta al ' + p + ' % de la población. Un test da positivo en el ' + s + ' % de los enfermos y en el ' + f + ' % de los sanos. Si sale positivo, P(enfermo) =',
      f_fr(num, den), [dz(s / 100), dz(p / 100), dz(num / 10000), f_fr(s, s + f)],
      'Bayes: ⟨' + dz(p / 100) + '·' + dz(s / 100) + '|' + dz(p / 100) + '·' + dz(s / 100) + ' + ' + dz((100 - p) / 100) + '·' + dz(f / 100) + '⟩ = ' + f_fr(num, den) + '.');
    return r;
  });

  genr('bay', function () {
    var rr = ri(2, 6), b = ri(2, 6), n = rr + b, v = ri(0, 2);
    var txt = 'Una urna tiene ' + rr + ' rojas y ' + b + ' azules. Se sacan dos bolas sin reemplazamiento. ';
    if (v === 0) return mk('bay', txt + 'P(2.ª roja / 1.ª roja) =', f_fr(rr - 1, n - 1), [f_fr(rr, n), f_fr(rr - 1, n), f_fr(rr * (rr - 1), n * (n - 1)), f_fr(rr, n - 1)],
      'Tras sacar una roja quedan ' + (rr - 1) + ' rojas de ' + (n - 1) + ' bolas.');
    if (v === 1) return mk('bay', txt + 'P(las dos rojas) =', f_fr(rr * (rr - 1), n * (n - 1)), [f_fr(rr * rr, n * n), f_fr(rr - 1, n - 1), f_fr(rr * (rr - 1), n * n), f_fr(2 * rr, n)],
      'Regla del producto: ' + f_fr(rr, n) + '·' + f_fr(rr - 1, n - 1) + ' = ' + f_fr(rr * (rr - 1), n * (n - 1)) + '.');
    return mk('bay', txt + 'P(la 2.ª es roja) =', f_fr(rr, n), [f_fr(rr - 1, n - 1), f_fr(rr - 1, n), f_fr(rr * (rr - 1), n * (n - 1)), f_fr(b, n)],
      'Probabilidad total: ' + f_fr(rr, n) + '·' + f_fr(rr - 1, n - 1) + ' + ' + f_fr(b, n) + '·' + f_fr(rr, n - 1) + ' = ' + f_fr(rr, n) + ' (igual que la 1.ª).');
  });

  genr('bay', function () {
    var A = pick([20, 30, 40, 50, 60, 80]), BA = pick([10, 20, 25, 30, 50, 60, 75]);
    var r = mk('bay', 'P(A) = ' + dz(A / 100) + ' y P(B / A) = ' + dz(BA / 100) + '. P(A ∩ B) =', dz(A * BA / 10000),
      [dz((A + BA) / 100), (BA * 100) % A === 0 ? dz(BA / A) : dz(A * BA / 5000), dz(BA / 100), dz((A + BA) / 100 - A * BA / 10000)],
      'P(A ∩ B) = P(A)·P(B / A) = ' + dz(A / 100) + '·' + dz(BA / 100) + ' = ' + dz(A * BA / 10000) + '.');
    return r;
  });

  genr('bay', function () {
    var a = ri(1, 9), b = ri(1, 9);
    var r = mk('bay', 'A y B son independientes, P(A) = ' + dz(a / 10) + ' y P(B) = ' + dz(b / 10) + '. P(A ∪ B) =', dz((10 * a + 10 * b - a * b) / 100),
      [dz((a + b) / 10), dz(a * b / 100), dz((10 * a + 10 * b - 2 * a * b) / 100), dz(1 - a * b / 100)],
      'P(A ∩ B) = ' + dz(a / 10) + '·' + dz(b / 10) + ' = ' + dz(a * b / 100) + ', y P(A ∪ B) = ' + dz(a / 10) + ' + ' + dz(b / 10) + ' − ' + dz(a * b / 100) + '.');
    return r;
  });

  add('bay', 'Si A y B son incompatibles, P(A ∩ B) =', '0', ['P(A)·P(B)', '1', 'P(A) + P(B)'],
    'Incompatibles significa que no pueden ocurrir a la vez: A ∩ B = ∅.');
  add('bay', 'P(A^{c}) =', '1 − P(A)', ['P(A) − 1', '−P(A)', '⟨1|P(A)⟩'], 'A y su contrario se reparten toda la probabilidad: P(A) + P(A^{c}) = 1.');
  barb('P(A^{c}) =', '−P(A)');
  add('bay', '(A ∪ B)^{c} =', 'A^{c} ∩ B^{c}', ['A^{c} ∪ B^{c}', 'A ∩ B', '(A ∩ B)^{c}'], 'Ley de De Morgan: el contrario de la unión es la intersección de los contrarios.');
  add('bay', '(A ∩ B)^{c} =', 'A^{c} ∪ B^{c}', ['A^{c} ∩ B^{c}', 'A ∪ B', 'A^{c} ∩ B'], 'Ley de De Morgan: el contrario de la intersección es la unión de los contrarios.');
  add('bay', 'Dos sucesos incompatibles con probabilidades no nulas', 'Nunca son independientes', ['Siempre son independientes', 'Tienen P(A ∪ B) = 1', 'Son contrarios'],
    'P(A ∩ B) = 0 pero P(A)·P(B) > 0, así que no puede cumplirse P(A ∩ B) = P(A)·P(B).');
  add('bay', 'A y B son independientes si', 'P(A ∩ B) = P(A)·P(B)', ['P(A ∩ B) = 0', 'P(A ∪ B) = P(A) + P(B)', 'P(A) = P(B)'],
    'Independencia: saber que ocurre B no cambia la probabilidad de A, P(A / B) = P(A).');
  add('bay', 'La regla de Laplace solo se puede aplicar si', 'Los casos son equiprobables', ['Hay dos sucesos', 'Los sucesos son independientes', 'Hay menos de 10 casos'],
    'Favorables entre posibles solo vale cuando todos los casos tienen la misma probabilidad.');
  add('bay', 'P(A / B) =', '⟨P(A ∩ B)|P(B)⟩', ['⟨P(A ∩ B)|P(A)⟩', 'P(A)·P(B)', '⟨P(A)|P(B)⟩'], 'Se divide entre la probabilidad del suceso que ya sabemos que ha ocurrido (B).');
  add('bay', 'En un árbol, las probabilidades de las ramas que salen de un mismo nudo', 'Suman 1', ['Multiplican 1', 'Son iguales', 'Suman 0'],
    'Desde cada nudo salen todos los casos posibles, que forman un sistema completo.');
  add('bay', 'Si P(A / B) = P(A), los sucesos A y B son', 'Independientes', ['Incompatibles', 'Contrarios', 'Iguales'],
    'Que B ocurra no cambia la probabilidad de A: eso es la independencia.');

  /* =====================================================================
     dis — Distribuciones binomial y normal
     ===================================================================== */
  genr('dis', function () {
    var v = ri(0, 2), n = ri(5, 20), r;
    if (v === 0) {
      var f = pick([4, 5, 6]);
      return mk('dis', 'Se lanza un dado ' + n + ' veces; X = número de veces que sale ' + f + '. X sigue', 'B(' + n + ', ⟨1|6⟩)',
        ['B(' + n + ', ⟨5|6⟩)', 'B(6, ⟨1|' + n + '⟩)', 'B(1, ⟨1|6⟩)', 'N(' + n + ', ⟨1|6⟩)'],
        n + ' pruebas independientes con éxito (sacar ' + f + ') de probabilidad ⟨1|6⟩.');
    }
    var p = v === 1 ? 5 * ri(8, 18) : 5 * ri(1, 6); if (p === 50) p = 45;
    var ctx = v === 1 ? 'Un jugador encesta el ' + p + ' % de sus tiros libres. Lanza ' + n + '; X = número de canastas.' :
      'El ' + p + ' % de las piezas de una fábrica son defectuosas. Se toman ' + n + '; X = número de defectuosas.';
    r = mk('dis', ctx + ' X sigue', BI(n, dz(p / 100)),
      [BI(n, p), BI(n, dz(1 - p / 100)), BI(dz(p / 100), n), NO(n, dz(p / 100))],
      'n = ' + n + ' pruebas independientes y p = ' + dz(p / 100) + ' de éxito en cada una (el porcentaje pasado a tanto por uno).');
    return bb(r, BI(n, p));
  });

  genr('dis', function () {
    var n = ri(2, 5), k = ri(0, n), ans, w, e;
    if (Math.random() < 0.5) {
      var pf = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), a = pf[0], b = pf[1], c = C(n, k);
      var num = c * Math.pow(a, k) * Math.pow(b - a, n - k), den = Math.pow(b, n);
      ans = f_fr(num, den);
      w = [f_fr(Math.pow(a, k) * Math.pow(b - a, n - k), den), f_fr(c * Math.pow(a, n - k) * Math.pow(b - a, k), den), f_fr(c * Math.pow(a, k), Math.pow(b, k)), f_fr(Math.pow(a, k), Math.pow(b, k))];
      e = 'P(X = ' + k + ') = C(' + n + ', ' + k + ')·(' + f_fr(a, b) + ')^{' + k + '}·(' + f_fr(b - a, b) + ')^{' + (n - k) + '} = ' + c + '·' + f_fr(Math.pow(a, k) * Math.pow(b - a, n - k), den) + ' = ' + ans + '.';
      return mk('dis', 'X ~ B(' + n + ', ' + f_fr(a, b) + '). P(X = ' + k + ') =', ans, w, e);
    }
    n = ri(3, 4); k = ri(1, n - 1);
    var p = pick([0.1, 0.2, 0.3, 0.4]), q = 1 - p, cc = C(n, k), val = cc * Math.pow(p, k) * Math.pow(q, n - k);
    return mk('dis', 'X ~ ' + BI(n, dz(p)) + '. P(X = ' + k + ') =', dz(val, 4),
      [dz(Math.pow(p, k) * Math.pow(q, n - k), 4), dz(cc * Math.pow(q, k) * Math.pow(p, n - k), 4), dz(cc * Math.pow(p, k), 4), dz(Math.pow(p, k), 4)],
      'P(X = ' + k + ') = ' + cc + '·' + dz(p) + '^{' + k + '}·' + dz(q) + '^{' + (n - k) + '} = ' + dz(val, 4) + '.');
  });

  var BN = [[100, 0.5, 5], [400, 0.5, 10], [100, 0.2, 4], [100, 0.1, 3], [25, 0.2, 2], [36, 0.5, 3], [64, 0.5, 4], [144, 0.5, 6], [225, 0.2, 6], [400, 0.1, 6], [48, 0.25, 3], [192, 0.25, 6], [400, 0.2, 8], [625, 0.2, 10], [900, 0.1, 9], [100, 0.9, 3], [400, 0.8, 8]];
  genr('dis', function () {
    var t = pick(BN), n = t[0], p = t[1], s = t[2], mu = Math.round(n * p), va = s * s, v = ri(0, 2);
    var q = 'X ~ ' + BI(n, dz(p)) + '. ';
    if (v === 0) return mk('dis', q + 'La media μ =', String(mu), [String(Math.round(n * (1 - p))), String(va), dz(p * (1 - p) * n / 2), String(n)],
      'μ = n·p = ' + n + '·' + dz(p) + ' = ' + mu + '.');
    if (v === 1) return mk('dis', q + 'La desviación típica σ =', String(s), [String(va), rad(mu), String(mu), dz(Math.sqrt(n) * p, 2)],
      'σ = √{n·p·q} = √{' + n + '·' + dz(p) + '·' + dz(1 - p) + '} = √{' + va + '} = ' + s + '.');
    return mk('dis', q + 'La varianza σ^{2} =', String(va), [String(s), String(mu), dz(n * p * p, 2), String(mu + va)],
      'σ^{2} = n·p·q = ' + n + '·' + dz(p) + '·' + dz(1 - p) + ' = ' + va + '.');
  });

  genr('dis', function () {
    var s = pick([2, 4, 5, 8, 10, 20]), z = pick([0.5, 1, 1.5, 2, 2.5, -0.5, -1, -1.5, -2, -2.5]);
    if (z * s !== Math.round(z * s)) s = 2 * s;
    var mu = s * ri(3, 15), x = mu + z * s;
    var r = mk('dis', 'X ~ N(' + mu + ', ' + s + '). Al tipificar x = ' + x + ' se obtiene z =', dz(z),
      [dz(-z), dz((x - mu) / (s * s)), mn(x - mu), dz(x / s), dz(z * 2)],
      'z = ⟨x − μ|σ⟩ = ⟨' + x + ' − ' + mu + '|' + s + '⟩ = ' + dz(z) + '.');
    return r;
  });

  var TB = [[0.5, 0.6915], [1, 0.8413], [1.5, 0.9332], [2, 0.9772], [1.96, 0.975], [1.645, 0.95], [2.5, 0.9938]];
  genr('dis', function () {
    var t = pick(TB), a = t[0], F = t[1], v = ri(0, 3), q, ans, e, r;
    var g = 'Sabiendo que P(Z ≤ ' + dz(a) + ') = ' + dz(F) + ': ';
    if (v === 0) { q = 'P(Z ≥ ' + dz(a) + ') ='; ans = 1 - F; e = 'P(Z ≥ a) = 1 − P(Z ≤ a) = 1 − ' + dz(F) + '.'; }
    else if (v === 1) { q = 'P(Z ≤ ' + mn(dz(-a)) + ') ='; ans = 1 - F; e = 'Por simetría, P(Z ≤ −a) = P(Z ≥ a) = 1 − ' + dz(F) + '.'; }
    else if (v === 2) { q = 'P(Z ≥ ' + dz(-a) + ') ='; ans = F; e = 'Por simetría, P(Z ≥ −a) = P(Z ≤ a) = ' + dz(F) + '.'; }
    else { q = 'P(' + dz(-a) + ' ≤ Z ≤ ' + dz(a) + ') ='; ans = 2 * F - 1; e = 'P(−a ≤ Z ≤ a) = 2·P(Z ≤ a) − 1 = 2·' + dz(F) + ' − 1.'; }
    r = mk('dis', g + q, dz(ans), [dz(F), dz(1 - F), dz(2 * F - 1), dz(2 * (1 - F)), '−' + dz(F)], e);
    return bb(r, '−' + dz(F));
  });

  genr('dis', function () {
    var t = pick(TB.filter(function (x) { return [0.5, 1, 1.5, 2, 2.5].indexOf(x[0]) >= 0; })), k = t[0], F = t[1];
    var s = pick([2, 4, 6, 10, 20]), mu = 10 * ri(5, 20), sg = pick([1, -1]), x = mu + sg * k * s, ge = Math.random() < 0.5;
    var ans = (ge ? 1 : 0) === (sg > 0 ? 1 : 0) ? 1 - F : F;
    var q = 'X ~ N(' + mu + ', ' + s + ') y P(Z ≤ ' + dz(k) + ') = ' + dz(F) + '. P(X ' + (ge ? '≥' : '≤') + ' ' + x + ') =';
    return mk('dis', q, dz(ans), [dz(1 - ans), dz(2 * F - 1), dz(2 * (1 - F)), dz(F / 2)],
      'Tipificamos: z = ⟨' + x + ' − ' + mu + '|' + s + '⟩ = ' + dz(sg * k) + '; P(Z ' + (ge ? '≥' : '≤') + ' ' + dz(sg * k) + ') = ' + dz(ans) + '.');
  });

  genr('dis', function () {
    var t = pick([[1, 0.8413], [2, 0.9772], [0.5, 0.6915], [1.5, 0.9332], [1.96, 0.975]]), k = t[0], F = t[1];
    var s = k === 1.96 ? pick([25, 50, 100]) : pick([2, 4, 10, 20]), mu = 10 * ri(5, 20), lo = mu - k * s, hi = mu + k * s;
    return mk('dis', 'X ~ N(' + mu + ', ' + s + ') y P(Z ≤ ' + dz(k) + ') = ' + dz(F) + '. P(' + dz(lo) + ' ≤ X ≤ ' + dz(hi) + ') =', dz(2 * F - 1),
      [dz(F), dz(1 - F), dz(2 * (1 - F)), dz(2 * F)],
      'Tipificando queda P(−' + dz(k) + ' ≤ Z ≤ ' + dz(k) + ') = 2·' + dz(F) + ' − 1 = ' + dz(2 * F - 1) + '.');
  });

  genr('dis', function () {
    var L = [['P(Z ≤ z) = 0,975', '1,96'], ['P(Z ≥ z) = 0,025', '1,96'], ['P(Z ≤ z) = 0,95', '1,645'], ['P(Z ≥ z) = 0,05', '1,645'],
      ['P(Z ≤ z) = 0,025', '−1,96'], ['P(Z ≤ z) = 0,05', '−1,645'], ['P(Z ≤ z) = 0,8413', '1'], ['P(Z ≤ z) = 0,1587', '−1'],
      ['P(−z ≤ Z ≤ z) = 0,95', '1,96'], ['P(−z ≤ Z ≤ z) = 0,90', '1,645'], ['P(−z ≤ Z ≤ z) = 0,99', '2,575']];
    var t = pick(L), all = ['1,96', '−1,96', '1,645', '−1,645', '2,575', '1', '−1', '0,975', '2,33'];
    return mk('dis', 'Usando la tabla N(0, 1), el valor z tal que ' + t[0] + ' es', t[1], shuffle(all.filter(function (x) { return x !== t[1]; })),
      'Valores clave de la tabla: P(Z ≤ 1) = 0,8413, P(Z ≤ 1,645) = 0,95, P(Z ≤ 1,96) = 0,975, P(Z ≤ 2,575) = 0,995; para colas izquierdas, z negativo.');
  });

  genr('dis', function () {
    var t = pick(BN), n = t[0], p = t[1], s = t[2], mu = Math.round(n * p);
    return mk('dis', 'X ~ ' + BI(n, dz(p)) + ' se aproxima por la normal', NO(mu, s),
      [NO(mu, s * s), NO(mu, rad(mu)), NO(n, dz(p)), NO(n, s)],
      'μ = np = ' + mu + ' y σ = √{npq} = √{' + s * s + '} = ' + s + ' (se pone la desviación, no la varianza).');
  });

  genr('dis', function () {
    var n = pick([10, 20, 30, 40, 50, 60, 80, 100, 200]), p = pick([0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.9, 0.95]);
    var np = Math.round(n * p * 100) / 100, nq = Math.round(n * (1 - p) * 100) / 100;
    var Y = 'Sí: np ≥ 5 y nq ≥ 5', N1 = 'No: np < 5', N2 = 'No: nq < 5', ans, w;
    if (np >= 5 && nq >= 5) { ans = Y; w = [N1, N2, 'No: p tiene que ser 0,5']; }
    else if (np < 5) { ans = N1; w = [Y, 'Sí, porque n ≥ 10', N2]; }
    else { ans = N2; w = [Y, 'Sí, porque n ≥ 10', N1]; }
    return mk('dis', '¿Se puede aproximar ' + BI(n, dz(p)) + ' por una normal?', ans, w,
      'np = ' + dz(np) + ' y nq = ' + dz(nq) + '; hacen falta los dos ≥ 5.');
  });

  genr('dis', function () {
    var k = ri(5, 40), h = function (x) { return dz(x, 1); };
    var S = {
      le: 'P(Y ≤ ' + h(k + 0.5) + ')', lt: 'P(Y ≤ ' + h(k - 0.5) + ')', ge: 'P(Y ≥ ' + h(k - 0.5) + ')', gt: 'P(Y ≥ ' + h(k + 0.5) + ')',
      eq: 'P(' + h(k - 0.5) + ' ≤ Y ≤ ' + h(k + 0.5) + ')', eq0: 'P(Y = ' + k + ')'
    };
    var t = pick([['X ≤ ' + k, 'le'], ['X < ' + k, 'lt'], ['X ≥ ' + k, 'ge'], ['X > ' + k, 'gt'], ['X = ' + k, 'eq']]);
    var w = ['le', 'lt', 'ge', 'gt', 'eq'].filter(function (x) { return x !== t[1]; }).map(function (x) { return S[x]; });
    if (t[1] === 'eq') w.unshift(S.eq0);
    var r = mk('dis', 'Aproximamos X binomial por Y normal con la corrección de Yates. P(' + t[0] + ') ≈', S[t[1]], t[1] === 'eq' ? [w[0], w[1], w[3]] : shuffle(w),
      'Cada valor entero k ocupa el intervalo [k − 0,5; k + 0,5]. ' + (t[1] === 'eq' ? 'En la normal P(Y = k) = 0, por eso se usa el intervalo.' : 'Se incluye o excluye ese medio punto según la desigualdad.'));
    return bb(r, S.eq0);
  });

  genr('dis', function () {
    if (Math.random() < 0.5) {
      var n = ri(2, 3), f = ri(1, 6), r = mk('dis', 'Se lanza un dado ' + n + ' veces. P(al menos un ' + f + ') =', f_fr(Math.pow(6, n) - Math.pow(5, n), Math.pow(6, n)),
        [f_fr(n, 6), f_fr(Math.pow(5, n), Math.pow(6, n)), f_fr(1, Math.pow(6, n)), f_fr(n, Math.pow(6, n))],
        'P(al menos uno) = 1 − P(ninguno) = 1 − (⟨5|6⟩)^{' + n + '} = ' + f_fr(Math.pow(6, n) - Math.pow(5, n), Math.pow(6, n)) + '.');
      return bb(r, f_fr(n, 6));
    }
    var m = ri(2, 5), P = Math.pow(2, m);
    return mk('dis', 'Se lanza una moneda ' + m + ' veces. P(al menos una cara) =', f_fr(P - 1, P), [f_fr(1, P), f_fr(m, P), f_fr(1, 2), f_fr(m, 2 * m + 2)],
      '1 − P(ninguna cara) = 1 − ⟨1|' + P + '⟩ = ' + f_fr(P - 1, P) + '.');
  });

  add('dis', 'Si X es continua, P(X = a) =', '0', ['f(a)', '1', '0,5'], 'En una variable continua la probabilidad es un área; sobre un punto el área es 0.');
  add('dis', 'El área total bajo la curva de una normal es', '1', ['100', '∞', '0,5'], 'Es una función de densidad: el área total es la probabilidad total, 1.');
  barb('El área total bajo la curva de una normal es', '∞');
  add('dis', 'En X ~ N(μ, σ), P(X ≤ μ) =', '0,5', ['1', '0', 'μ'], 'La normal es simétrica respecto de μ: deja la mitad del área a cada lado.');
  add('dis', 'La varianza de X ~ B(n, p) es', 'n·p·q', ['√{n·p·q}', 'n·p', 'p·q'], 'Var(X) = npq con q = 1 − p; la desviación típica es su raíz.');
  add('dis', 'Para que X sea binomial, las pruebas deben ser', 'Independientes y con p fija', ['Dependientes entre sí', 'Con p distinta en cada prueba', 'Infinitas'],
    'Binomial: n pruebas independientes, cada una con éxito de probabilidad constante p.');
  add('dis', 'Si aumenta σ en una normal, la campana', 'Se aplana y se ensancha', ['Se hace más alta y estrecha', 'Se desplaza a la derecha', 'No cambia'],
    'σ mide la dispersión; como el área sigue siendo 1, al ensancharse baja.');
  add('dis', 'Z ~ N(0, 1) se llama', 'Normal tipificada', ['Binomial estándar', 'Normal de media 1', 'Distribución uniforme'], 'Media 0 y desviación 1: es la que viene en la tabla.');
  add('dis', 'La curva de N(μ, σ) es simétrica respecto de', 'La recta x = μ', ['La recta x = 0 siempre', 'La recta x = σ', 'El eje X'], 'El máximo y el eje de simetría están en la media.');
  add('dis', 'P(Z ≤ −a) =', '1 − P(Z ≤ a)', ['−P(Z ≤ a)', 'P(Z ≤ a)', 'P(Z ≤ a) − 1'], 'Por simetría, la cola izquierda de −a es igual a la cola derecha de a.');
  barb('P(Z ≤ −a) =', '−P(Z ≤ a)');

  /* =====================================================================
     inf — Inferencia estadística
     ===================================================================== */
  var ZL = [[90, 1.645], [95, 1.96], [99, 2.575]];
  genr('inf', function () {
    var n = pick([4, 9, 16, 25, 36, 49, 64, 100]), rn = Math.sqrt(n), s = ri(1, 5), sig = s * rn, mu = 10 * ri(3, 30);
    return mk('inf', 'X ~ N(' + mu + ', ' + sig + '). Para muestras de tamaño n = ' + n + ', la media muestral x̄ sigue', 'N(' + mu + ', ' + s + ')',
      ['N(' + mu + ', ' + f_fr(sig, n) + ')', 'N(' + mu + ', ' + sig + ')', 'N(' + mu + ', ' + sig * rn + ')', NO(f_fr(mu, n), s)],
      'x̄ ~ N(μ, ⟨σ|√{n}⟩) = N(' + mu + ', ⟨' + sig + '|' + rn + '⟩) = N(' + mu + ', ' + s + ').');
  });

  genr('inf', function () {
    var L = pick(ZL), z = L[1], n = pick([16, 25, 36, 49, 64, 100]), rn = Math.sqrt(n), s = ri(1, 4), sig = s * rn, xb = ri(20, 200), E = z * s;
    var I = function (e) { return '(' + dz(xb - e, 3) + '; ' + dz(xb + e, 3) + ')'; };
    var oz = ZL.filter(function (x) { return x !== L; });
    return mk('inf', 'σ = ' + sig + ', n = ' + n + ', x̄ = ' + xb + '. Intervalo de confianza para μ al ' + L[0] + ' %:', I(E),
      [I(oz[0][1] * s), I(oz[1][1] * s), I(z * sig), I(s)],
      'E = z·⟨σ|√{n}⟩ = ' + dz(z, 3) + '·⟨' + sig + '|' + rn + '⟩ = ' + dz(E, 3) + '; el intervalo es x̄ ± E.');
  });

  genr('inf', function () {
    var L = pick(ZL), z = L[1], n = pick([4, 16, 25, 36, 64, 100, 400]), rn = Math.sqrt(n), s = pick([1, 2, 3, 4, 5]), sig = s * rn;
    var oz = ZL.filter(function (x) { return x !== L; });
    return mk('inf', 'Error máximo admisible al ' + L[0] + ' % con σ = ' + sig + ' y n = ' + n + ':', dz(z * s, 3),
      [dz(oz[0][1] * s, 3), dz(oz[1][1] * s, 3), dz(z * sig, 3), dz(z * sig / n, 3)],
      'E = z_{α/2}·⟨σ|√{n}⟩ = ' + dz(z, 3) + '·⟨' + sig + '|' + rn + '⟩ = ' + dz(z * s, 3) + '.');
  });

  genr('inf', function () {
    var L, z, sig, E, val;
    do { L = pick(ZL); z = L[1]; sig = pick([4, 5, 6, 8, 10, 12, 15, 20]); E = pick([1, 2, 3, 4, 5]); val = Math.round(Math.pow(z * sig / E, 2) * 1e6) / 1e6; }
    while (val === Math.round(val) || val < 10 || val > 3000);
    var ce = Math.ceil(val), fl0 = Math.floor(val);
    return mk('inf', 'Nivel de confianza ' + L[0] + ' %, σ = ' + sig + '. ¿Tamaño mínimo de muestra para que el error sea como mucho ' + E + '?', String(ce),
      [String(fl0), String(Math.ceil(z * sig / E)), String(Math.ceil(Math.pow(sig / E, 2))), String(Math.ceil(val * 2))],
      'n ≥ (⟨z·σ|E⟩)^{2} = (⟨' + dz(z, 3) + '·' + sig + '|' + E + '⟩)^{2} = ' + dz(val, 2) + '; se redondea hacia arriba: n = ' + ce + '.');
  });

  genr('inf', function () {
    if (Math.random() < 0.5) {
      var n0 = pick([25, 36, 50, 64, 100]), E0 = pick([2, 3, 4, 6, 8, 12]), k = pick([2, 3, 4]);
      if (E0 % k) E0 = 12;
      return mk('inf', 'Con n = ' + n0 + ' el error máximo es ' + E0 + '. Con el mismo nivel de confianza y n = ' + n0 * k * k + ', el error es', String(E0 / k),
        [f_fr(E0, k * k), String(E0 * k), f_fr(E0, k * k * k), String(E0 * k * k)],
        'E es proporcional a ⟨1|√{n}⟩: multiplicar n por ' + k * k + ' divide el error entre √{' + k * k + '} = ' + k + '.');
    }
    var f = pick([[2, 'la mitad'], [3, 'la tercera parte'], [4, 'la cuarta parte']]);
    var r = mk('inf', 'Para reducir el error máximo a ' + f[1] + ' (mismo nivel de confianza), el tamaño de la muestra se multiplica por', String(f[0] * f[0]),
      [String(f[0]), f_fr(1, f[0]), String(2 * f[0]), String(f[0] * f[0] * f[0])],
      'E = z·⟨σ|√{n}⟩: para dividir E entre ' + f[0] + ' hay que dividir entre ' + f[0] + ' la cantidad ⟨1|√{n}⟩, es decir, multiplicar n por ' + f[0] * f[0] + '.');
    return bb(r, f_fr(1, f[0]));
  });

  genr('inf', function () {
    var xb = ri(20, 300), E = ri(1, 20) + pick([0, 0.5, 0.25]), a = xb - E, b = xb + E, v = ri(0, 2);
    var q = 'Un intervalo de confianza para μ es (' + dz(a, 2) + '; ' + dz(b, 2) + '). ';
    if (v === 0) return mk('inf', q + 'La media muestral x̄ =', dz(xb, 2), [dz(b - a, 2), dz(a + b, 2), dz(E, 2), dz(b, 2)],
      'x̄ es el centro: ⟨' + dz(a, 2) + ' + ' + dz(b, 2) + '|2⟩ = ' + dz(xb, 2) + '.');
    if (v === 1) return mk('inf', q + 'El error máximo E =', dz(E, 2), [dz(2 * E, 2), dz(xb, 2), dz(E / 2, 3), dz(a, 2)],
      'E es la mitad de la amplitud: ⟨' + dz(b, 2) + ' − ' + dz(a, 2) + '|2⟩ = ' + dz(E, 2) + '.');
    return mk('inf', q + 'La amplitud del intervalo es', dz(2 * E, 2), [dz(E, 2), dz(E / 2, 3), dz(a + b, 2), dz(xb, 2)],
      'Amplitud = extremo superior − extremo inferior = 2E = ' + dz(2 * E, 2) + '.');
  });

  genr('inf', function () {
    var L = [[90, '1,645', '0,1', '0,95'], [95, '1,96', '0,05', '0,975'], [99, '2,575', '0,01', '0,995'], [80, '1,28', '0,2', '0,9']];
    var t = pick(L), v = ri(0, 2), zs = ['1,645', '1,96', '2,575', '1,28', '2,33'];
    if (v === 0) return mk('inf', 'Nivel de confianza ' + t[0] + ' %. z_{α/2} =', t[1], shuffle(zs.filter(function (x) { return x !== t[1]; })),
      'Buscamos en la tabla P(Z ≤ z) = 1 − ⟨α|2⟩ = ' + t[3] + ', que da z = ' + t[1] + '.');
    if (v === 1) return mk('inf', 'Si z_{α/2} = ' + t[1] + ', el nivel de confianza es', t[0] + ' %', L.filter(function (x) { return x !== t; }).map(function (x) { return x[0] + ' %'; }).concat(['97,5 %']),
      'P(−' + t[1] + ' ≤ Z ≤ ' + t[1] + ') = ' + dz(t[0] / 100) + ' → nivel del ' + t[0] + ' %.');
    return mk('inf', 'Nivel de confianza ' + t[0] + ' %. α =', t[2], L.filter(function (x) { return x !== t; }).map(function (x) { return x[2]; }).concat([t[3]]),
      'Nivel de confianza = 1 − α, así que α = 1 − ' + dz(t[0] / 100) + ' = ' + t[2] + '.');
  });

  genr('inf', function () {
    var pp = pick([[0.5, 0.5], [0.2, 0.4], [0.8, 0.4], [0.1, 0.3], [0.9, 0.3]]), p = pp[0], rq = pp[1];
    var n = rq === 0.3 ? pick([100, 400, 900, 2500]) : pick([100, 400, 2500]), se = rq / Math.sqrt(n), L = pick(ZL), z = L[1], k = Math.round(p * n);
    var q = 'En una muestra de ' + n + ' personas, ' + k + ' están a favor. ';
    if (Math.random() < 0.5) {
      return mk('inf', q + 'Error máximo para la proporción al ' + L[0] + ' %:', dz(z * se, 4),
        [dz(se, 4), dz(z * rq, 4), dz(z * p * (1 - p) / Math.sqrt(n), 4), dz(z * se * 2, 4)],
        'p̂ = ' + dz(p) + '; E = z·√{⟨p̂(1 − p̂)|n⟩} = ' + dz(z, 3) + '·' + dz(se, 4) + ' = ' + dz(z * se, 4) + '.');
    }
    return mk('inf', q + 'La proporción muestral p̂ =', dz(p), [dz(1 - p), String(k), dz(k / 1000), dz(p / 2)],
      'p̂ = ⟨' + k + '|' + n + '⟩ = ' + dz(p) + '.');
  });

  genr('inf', function () {
    var N = ri(10, 30) * 10, k = ri(5, 12), S = [
      ['Se numeran los ' + N + ' alumnos y se sortean ' + k * 3 + ' números.', 'Aleatorio simple'],
      ['De una lista de ' + N + ' socios se elige al azar uno de los ' + k + ' primeros y después uno de cada ' + k + '.', 'Sistemático'],
      ['Se divide a los alumnos por cursos y de cada curso se eligen al azar alumnos en proporción a su tamaño.', 'Estratificado'],
      ['Se eligen al azar ' + (k - 3) + ' clases del instituto y se encuesta a todos sus alumnos.', 'Por conglomerados'],
      ['Se divide la población por grupos de edad y se toma de cada grupo una muestra aleatoria proporcional.', 'Estratificado'],
      ['Se sortean ' + (k - 2) + ' barrios de la ciudad y se encuesta a todos los hogares de esos barrios.', 'Por conglomerados']];
    var t = pick(S), all = ['Aleatorio simple', 'Sistemático', 'Estratificado', 'Por conglomerados'];
    var E = { 'Aleatorio simple': 'Cada individuo tiene la misma probabilidad y se elige por sorteo directo.', 'Sistemático': 'Se elige un arranque al azar y luego a intervalos fijos.',
      'Estratificado': 'La población se divide en estratos homogéneos y se muestrea dentro de cada uno.', 'Por conglomerados': 'Se sortean grupos completos y se estudian todos sus individuos.' };
    return mk('inf', t[0] + ' Tipo de muestreo:', t[1], all.filter(function (x) { return x !== t[1]; }), E[t[1]]);
  });

  genr('inf', function () {
    var k = pick([10, 20, 25, 50]), a = ri(4, 30), b = ri(4, 30), c = ri(4, 30), Ni = [a * k, b * k, c * k], N = (a + b + c) * k, n = a + b + c;
    var nm = ['1.º', '2.º', '3.º'], i = ri(0, 2), ni = Ni[i] / k;
    var w = [String(Math.round(n / 3)), dz(Ni[i] / (k * 2), 1), String(Ni[(i + 1) % 3] / k), String(Math.round(Ni[i] / 10))];
    return mk('inf', 'Un centro tiene ' + Ni[0] + ' alumnos en 1.º, ' + Ni[1] + ' en 2.º y ' + Ni[2] + ' en 3.º. Muestreo estratificado proporcional de ' + n + ' alumnos. ¿Cuántos de ' + nm[i] + '?', String(ni), w,
      'n_{i} = n·⟨N_{i}|N⟩ = ' + n + '·⟨' + Ni[i] + '|' + N + '⟩ = ' + ni + '.');
  });

  genr('inf', function () {
    var c = pick([[4, 2, 2, 1], [4, 1, 1, 0.5], [16, 2, 2, 0.5], [9, 1.5, 1.5, 0.5]]), n = c[0], k = c[1], zR = c[2], zW = c[3];
    var F = function (z) { return { 0.5: 0.6915, 1: 0.8413, 1.5: 0.9332, 2: 0.9772 }[z]; };
    var s = pick([2, 3, 4, 5, 6]), rn = Math.sqrt(n), sig = s * rn, mu = 10 * ri(4, 20), x0 = mu + k * s;
    var r = mk('inf', 'X ~ N(' + mu + ', ' + sig + '); muestras de n = ' + n + '. Con P(Z ≤ ' + dz(zR) + ') = ' + dz(F(zR)) + ' y P(Z ≤ ' + dz(zW) + ') = ' + dz(F(zW)) + ', P(x̄ ≥ ' + dz(x0) + ') =',
      dz(1 - F(zR)), [dz(1 - F(zW)), dz(F(zR)), dz(F(zW)), dz(2 * F(zR) - 1)],
      'x̄ ~ N(' + mu + ', ' + s + '); z = ⟨' + dz(x0) + ' − ' + mu + '|' + s + '⟩ = ' + dz(zR) + ' y P(Z ≥ ' + dz(zR) + ') = 1 − ' + dz(F(zR)) + '.');
    r.p = 1; return r;
  });

  add('inf', 'Si aumenta el nivel de confianza (con n fijo), el intervalo', 'Se ensancha', ['Se estrecha', 'No cambia', 'Se desplaza'],
    'Más confianza exige un z mayor, y E = z·σ/√n crece.');
  add('inf', 'Si aumenta el tamaño de la muestra (mismo nivel de confianza), el error máximo', 'Disminuye', ['Aumenta', 'No cambia', 'Se duplica'],
    'E = z·σ/√n: n está en el denominador.');
  add('inf', 'La media muestral x̄ es', 'Un estadístico', ['Un parámetro de la población', 'Siempre igual a μ', 'La desviación de la población'],
    'x̄ se calcula con la muestra y cambia de una muestra a otra; μ es el parámetro fijo.');
  add('inf', 'μ y σ, media y desviación de la población, son', 'Parámetros', ['Estadísticos', 'Datos de la muestra', 'Valores de la tabla normal'],
    'Los parámetros describen la población; los estadísticos (x̄, s, p̂) la muestra.');
  add('inf', 'Por el teorema central del límite, si n ≥ 30, x̄ sigue', 'Aproximadamente una normal', ['Una binomial', 'Siempre la distribución de X', 'Una uniforme'],
    'Sea cual sea la distribución de X, para n grande x̄ es aproximadamente N(μ, σ/√n).');
  add('inf', 'La amplitud de un intervalo de confianza x̄ ± E es', '2E', ['E', '⟨E|2⟩', 'x̄ + E'], 'Va de x̄ − E a x̄ + E: mide 2E.');
  add('inf', 'Encuestar a los 50 primeros alumnos que llegan al instituto es un muestreo', 'No aleatorio (sesgado)', ['Aleatorio simple', 'Estratificado', 'Sistemático'],
    'No todos tienen la misma probabilidad de ser elegidos: los que llegan antes no representan a todos.');
  add('inf', 'Al 95 % de confianza, si tomamos muchas muestras', 'El 95 % de los intervalos contienen μ', ['El 95 % de los datos está en el intervalo', 'x̄ = μ en el 95 % de los casos', 'El error es del 95 %'],
    'El nivel de confianza habla del método: de cada 100 intervalos construidos así, unos 95 contienen a μ.');
  add('inf', 'En un estudio sobre todos los hogares de una ciudad, el conjunto de todos los hogares es', 'La población', ['La muestra', 'El parámetro', 'El estadístico'],
    'La población es el conjunto completo que se quiere estudiar; la muestra es la parte que se observa.');
})();
