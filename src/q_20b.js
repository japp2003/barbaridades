/* Límites, continuidad, derivadas y flash de límites (1.º y 2.º Bach) */
(function () {
  'use strict';

  /* ---------- ayudas locales ---------- */
  function P(c) { var s = poly(c); return s === '' ? '0' : s; }
  var F = f_fr;
  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function mono(c, p) { return p === 0 ? mn(c) : P([c].concat(zeros(p))); }
  function xp(p) { return p === 1 ? 'x' : 'x^{' + p + '}'; }
  function lf(r) { return r === 0 ? 'x' : r > 0 ? 'x − ' + r : 'x + ' + (-r); } /* x − r */
  function L(to) { return 'lim_{x→' + to + '} '; }
  function sq(n) { return n < 0 ? '(' + mn(n) + ')^{2}' : n + '^{2}'; }
  function ep(n) { return n === 1 ? 'e' : 'e^{' + mn(n) + '}'; }
  /* N/(D·expr) simplificado, con signo delante */
  function rf(N, D, expr) {
    var g = gcd(Math.abs(N), Math.abs(D)) || 1, n = Math.abs(N) / g, d = Math.abs(D) / g;
    var s = (N < 0) !== (D < 0) ? '−' : '';
    return s + '⟨' + n + '|' + (d === 1 ? '' : d) + expr + '⟩';
  }
  function q2(N, expr) { return N === 0 ? '0' : (N < 0 ? '−' : '') + '⟨' + Math.abs(N) + '|' + expr + '⟩'; }
  function av(list) { return list.slice().sort(function (a, b) { return a - b; }).map(function (v) { return 'x = ' + mn(v); }).join(' y '); }
  function iv(a, b) { return '(' + (a === null ? '−∞' : mn(a)) + ', ' + (b === null ? '+∞' : mn(b)) + ')'; }
  function B(r) { for (var i = 1; i < arguments.length; i++) { var x = String(arguments[i]); if (r.w.indexOf(x) >= 0) barb(r.q, x); } return r; }
  function sg(n) { return n < 0 ? ' − ' + (-n) : ' + ' + n; }
  var PI = '+∞', MI = '−∞';
  function pr(n) { return n < 0 ? '(' + mn(n) + ')' : String(n); }

  /* =====================================================================
     lim1 — Límites
     ===================================================================== */

  /* sustitución directa */
  genr('lim1', function () {
    var a = nz(-4, 4);
    if (Math.random() < 0.5) {
      var b = ri(-6, 6), c = ri(-9, 9), v = a * a + b * a + c;
      return mk('lim1', L(mn(a)) + '(' + P([1, b, c]) + ') =', mn(v),
        [mn(-a * a + b * a + c), mn(a * a - b * a + c), mn(2 * a + b)],
        'La función es un polinomio (continua): basta sustituir x = ' + mn(a) + ' y queda ' + mn(v) + '.');
    }
    var b2, c2;
    do { b2 = nz(-6, 6); c2 = nz(-5, 5); } while (c2 === a || a + b2 === 0);
    return mk('lim1', L(mn(a)) + '⟨' + P([1, b2]) + '|' + lf(c2) + '⟩ =', F(a + b2, a - c2),
      [F(a + b2, a + c2), F(a - c2, a + b2), '0', PI],
      'El denominador no se anula en x = ' + mn(a) + ': se sustituye directamente, ' + mn(a + b2) + ' entre ' + mn(a - c2) + ' = ' + F(a + b2, a - c2) + '.');
  });

  /* 0/0 diferencia de cuadrados */
  genr('lim1', function () {
    var a = nz(-6, 6);
    var r = mk('lim1', L(mn(a)) + '⟨x^{2} − ' + a * a + '|' + lf(a) + '⟩ =', mn(2 * a),
      ['0', mn(a), mn(-2 * a), 'No existe'],
      'Sale ⟨0|0⟩: factorizamos x^{2} − ' + a * a + ' = (' + lf(a) + ')(' + lf(-a) + '), simplificamos y queda ' + lf(-a) + ' → ' + mn(2 * a) + '.');
    return B(r, '0');
  });

  /* 0/0 trinomio entre (x − r) */
  genr('lim1', function () {
    var r0 = nz(-5, 5), s;
    do { s = nz(-5, 5); } while (s === r0);
    return mk('lim1', L(mn(r0)) + '⟨' + P([1, -(r0 + s), r0 * s]) + '|' + lf(r0) + '⟩ =', mn(r0 - s),
      [mn(s - r0), mn(r0 + s), '0', 'No existe'],
      'Factorizamos el numerador: (' + lf(r0) + ')(' + lf(s) + '). Se simplifica (' + lf(r0) + ') y queda ' + lf(s) + ' en x = ' + mn(r0) + ': ' + mn(r0 - s) + '.');
  });

  /* 0/0 cociente de trinomios */
  genr('lim1', function () {
    var r0 = nz(-4, 4), s, t;
    do { s = nz(-5, 5); t = nz(-5, 5); } while (s === r0 || t === r0 || s === t);
    return mk('lim1', L(mn(r0)) + '⟨' + P([1, -(r0 + s), r0 * s]) + '|' + P([1, -(r0 + t), r0 * t]) + '⟩ =', F(r0 - s, r0 - t),
      [F(r0 + s, r0 + t), F(r0 - t, r0 - s), F(s, t), '1', '0'],
      'Arriba (' + lf(r0) + ')(' + lf(s) + '), abajo (' + lf(r0) + ')(' + lf(t) + '). Se simplifica (' + lf(r0) + ') y sustituimos: ' + mn(r0 - s) + ' entre ' + mn(r0 - t) + ' = ' + F(r0 - s, r0 - t) + '.');
  });

  /* 0/0 con raíces: conjugado */
  genr('lim1', function () {
    var c = ri(1, 4), a = nz(-4, 5), b = c * c - a;
    var rad = '√{' + P([1, b]) + '}';
    if (Math.random() < 0.5) {
      return mk('lim1', L(mn(a)) + '⟨' + rad + ' − ' + c + '|' + lf(a) + '⟩ =', F(1, 2 * c),
        [F(1, c), mn(2 * c), '0', F(c, 2), 'No existe'],
        'Multiplicamos por el conjugado ' + rad + ' + ' + c + ': el numerador queda ' + lf(a) + ', se simplifica y queda ⟨1|' + rad + ' + ' + c + '⟩ → ⟨1|' + 2 * c + '⟩.');
    }
    return mk('lim1', L(mn(a)) + '⟨' + lf(a) + '|' + rad + ' − ' + c + '⟩ =', mn(2 * c),
      [F(1, 2 * c), mn(c), '0', 'No existe'],
      'Multiplicamos arriba y abajo por el conjugado ' + rad + ' + ' + c + ': se simplifica ' + lf(a) + ' y queda ' + rad + ' + ' + c + ' → ' + 2 * c + '.');
  });

  /* ∞/∞ mismo grado */
  genr('lim1', function () {
    var a = nz(-6, 6), d = nz(-6, 6), b = ri(-7, 7), c = ri(-9, 9), e = nz(-9, 9), dir = pick([PI, MI]);
    var q, deg = ri(1, 2);
    if (deg === 2) q = L(dir) + '⟨' + P([a, b, c]) + '|' + P([d, 0, e]) + '⟩ =';
    else q = L(dir) + '⟨' + P([a, c]) + '|' + P([d, e]) + '⟩ =';
    var r = mk('lim1', q, F(a, d), [PI, '1', F(c, e), '0', F(d, a)],
      'Numerador y denominador tienen el mismo grado: el límite es el cociente de los coeficientes principales, ' + mn(a) + ' entre ' + mn(d) + ' = ' + F(a, d) + '.');
    return B(r, '1');
  });

  /* ∞/∞ grados distintos */
  genr('lim1', function () {
    var m = ri(1, 3), n;
    do { n = ri(1, 3); } while (n === m);
    var a = nz(-5, 5), d = nz(-5, 5), k = nz(-6, 6), j = nz(-6, 6), dir = pick([PI, MI]);
    var num = [a].concat(zeros(m - 1)).concat([k]), den = [d].concat(zeros(n - 1)).concat([j]);
    var ans, e;
    if (m < n) { ans = '0'; e = 'El grado del denominador (' + n + ') es mayor que el del numerador (' + m + '): el cociente tiende a 0.'; }
    else {
      var s = (a / d > 0 ? 1 : -1) * (dir === MI && (m - n) % 2 ? -1 : 1);
      ans = s > 0 ? PI : MI;
      e = 'El numerador tiene más grado: el cociente se comporta como ' + rf(a, d, '').replace('⟨', '(').replace('|', '/').replace('⟩', ')') + '·' + xp(m - n) + ', que tiende a ' + ans + '.';
    }
    return mk('lim1', L(dir) + '⟨' + P(num) + '|' + P(den) + '⟩ =', ans, ['0', PI, MI, F(a, d)], e);
  });

  /* ∞ − ∞ con raíces */
  genr('lim1', function () {
    var b = nz(-8, 8);
    if (Math.random() < 0.6) {
      var c = ri(-5, 5);
      var r = mk('lim1', L(PI) + '(√{' + P([1, b, c]) + '} − x) =', F(b, 2),
        ['0', mn(b), PI, F(b, 4), '1'],
        'Es ∞ − ∞: multiplicamos y dividimos por el conjugado. Queda ⟨' + P([b, c]) + '|√{' + P([1, b, c]) + '} + x⟩ → ⟨' + mn(b) + '|2⟩ = ' + F(b, 2) + '.');
      return B(r, '0');
    }
    var c2;
    do { c2 = nz(-8, 8); } while (c2 === b);
    var r2 = mk('lim1', L(PI) + '(√{' + P([1, b, 0]) + '} − √{' + P([1, c2, 0]) + '}) =', F(b - c2, 2),
      ['0', mn(b - c2), PI, F(b + c2, 2)],
      'Por el conjugado queda ⟨' + P([b - c2, 0]) + '|√{…} + √{…}⟩ ≈ ⟨' + P([b - c2, 0]) + '|2x⟩ → ' + F(b - c2, 2) + '.');
    return B(r2, '0');
  });

  /* límites laterales k/(x − a) */
  genr('lim1', function () {
    var k = nz(-6, 6), a = ri(-5, 5), v = ri(0, 2);
    var opts = [PI, MI, '0', 'No existe', mn(k)];
    if (v === 2) {
      var ans2 = k > 0 ? PI : MI;
      return mk('lim1', L(mn(a)) + '⟨' + mn(k) + '|(' + lf(a) + ')^{2}⟩ =', ans2, opts.filter(function (o) { return o !== ans2; }),
        'Sale ⟨' + mn(k) + '|0⟩ y el denominador (al cuadrado) es siempre positivo: los dos laterales valen ' + ans2 + '.');
    }
    if (Math.random() < 0.3) {
      return mk('lim1', L(mn(a)) + '⟨' + mn(k) + '|' + lf(a) + '⟩ =', 'No existe', [PI, MI, '0'],
        'Por un lado tiende a +∞ y por el otro a −∞: los límites laterales son distintos, así que el límite no existe.');
    }
    var side = v === 0 ? '+' : '−', val = (k > 0 ? 1 : -1) * (side === '+' ? 1 : -1) > 0 ? PI : MI;
    return mk('lim1', L(mn(a) + '^{' + (side === '+' ? '+' : '−') + '}') + '⟨' + mn(k) + '|' + lf(a) + '⟩ =', val,
      opts.filter(function (o) { return o !== val; }),
      'Si x → ' + mn(a) + '^{' + side + '}, el denominador es un número muy pequeño ' + (side === '+' ? 'positivo' : 'negativo') + ': ⟨' + mn(k) + '|0^{' + side + '}⟩ = ' + val + '.');
  });

  /* límites laterales en una función a trozos */
  genr('lim1', function () {
    var p = nz(-3, 3), b = ri(-4, 4), m = nz(-4, 4), L1 = p * p + b, v = ri(0, 2), n;
    var eq = v === 2 && Math.random() < 0.5;
    if (eq) n = L1 - m * p; else do { n = ri(-6, 6); } while (m * p + n === L1);
    var L2 = m * p + n;
    var def = 'f(x) = ' + P([1, 0, b]) + ' si x < ' + mn(p) + ', y f(x) = ' + P([m, n]) + ' si x ≥ ' + mn(p) + '. ';
    if (v === 0) return mk('lim1', def + L(mn(p) + '^{−}') + 'f(x) =', mn(L1), [mn(L2), 'No existe', mn(-L1), mn(L1 + L2)],
      'Por la izquierda (x < ' + mn(p) + ') se usa ' + P([1, 0, b]) + ': ' + sq(p) + (b ? sg(b) : '') + ' = ' + mn(L1) + '.');
    if (v === 1) return mk('lim1', def + L(mn(p) + '^{+}') + 'f(x) =', mn(L2), [mn(L1), 'No existe', mn(-L2), mn(L1 + L2)],
      'Por la derecha (x > ' + mn(p) + ') se usa ' + P([m, n]) + ': ' + mn(m) + '·' + pr(p) + (n ? sg(n) : '') + ' = ' + mn(L2) + '.');
    if (eq) return mk('lim1', def + L(mn(p)) + 'f(x) =', mn(L1), ['No existe', mn(-L1), mn(2 * L1), mn(L1 + 1)],
      'Los dos límites laterales valen ' + mn(L1) + ', así que el límite existe y vale ' + mn(L1) + '.');
    return mk('lim1', def + L(mn(p)) + 'f(x) =', 'No existe', [mn(L1), mn(L2), mn(L1 + L2)],
      'Por la izquierda tiende a ' + mn(L1) + ' y por la derecha a ' + mn(L2) + ': los laterales son distintos y el límite no existe.');
  });

  /* 1^∞ y el número e (2.º Bach) */
  genr('lim1', function () {
    var v = ri(0, 3), q, n, e;
    if (v === 0) {
      var k = nz(-5, 5);
      n = k; q = L(PI) + '(1 ' + (k < 0 ? '−' : '+') + ' ⟨' + Math.abs(k) + '|x⟩)^{x} =';
      e = 'Es 1^{∞}. Se usa lim (1 + ⟨k|x⟩)^{x} = e^{k}, con k = ' + mn(k) + '.';
    } else if (v === 1) {
      var m = ri(2, 6) * pick([1, -1]);
      n = m; q = L(PI) + '(1 + ⟨1|x⟩)^{' + mn(m) + 'x} =';
      e = 'Es 1^{∞}: (1 + ⟨1|x⟩)^{' + mn(m) + 'x} = ((1 + ⟨1|x⟩)^{x})^{' + mn(m) + '} → e^{' + mn(m) + '}.';
    } else if (v === 2) {
      var a = ri(-5, 5), b;
      do { b = ri(-5, 5); } while (b === a);
      n = a - b; q = L(PI) + '(⟨' + P([1, a]) + '|' + P([1, b]) + '⟩)^{x} =';
      e = 'Es 1^{∞}: e^{lim x·(⟨' + P([1, a]) + '|' + P([1, b]) + '⟩ − 1)} = e^{lim ⟨' + P([a - b, 0]) + '|' + P([1, b]) + '⟩} = e^{' + mn(a - b) + '}.';
    } else {
      var k2 = ri(2, 4), m2 = ri(2, 3);
      n = k2 * m2; q = L(PI) + '(1 + ⟨' + k2 + '|x⟩)^{' + m2 + 'x} =';
      e = 'Es 1^{∞}: e^{lim ' + m2 + 'x·⟨' + k2 + '|x⟩} = e^{' + k2 * m2 + '}.';
    }
    var r = mk('lim1', q, ep(n), ['1', PI, ep(-n), 'e', ep(n + 1), '0'], e);
    return B(r, '1');
  });

  /* exponenciales en el infinito */
  genr('lim1', function () {
    var dir = pick([PI, MI]);
    if (Math.random() < 0.5) {
      var base = pick(['2', '3', 'e']), a = ri(1, 5), c = ri(1, 5), b = nz(-6, 6), d = nz(-6, 6);
      var term = function (k) { return (k === 1 ? '' : k + '·') + base + '^{x}'; };
      var ans = dir === PI ? F(a, c) : F(b, d), other = dir === PI ? F(b, d) : F(a, c);
      return mk('lim1', L(dir) + '⟨' + term(a) + sg(b) + '|' + term(c) + sg(d) + '⟩ =', ans,
        [other, '1', '0', PI, c + d !== 0 ? F(a + b, c + d) : '−1'],
        dir === PI ? base + '^{x} → +∞ y domina: queda ⟨' + a + '|' + c + '⟩.' : 'Si x → −∞, ' + base + '^{x} → 0: quedan los términos independientes, ⟨' + mn(b) + '|' + mn(d) + '⟩.');
    }
    var m = nz(-5, 5), k = ri(2, 5), ex = pick(['x', '−x']);
    var grows = (ex === 'x') === (dir === PI);
    return mk('lim1', L(dir) + '(' + mn(m) + ' + ' + k + 'e^{' + ex + '}) =', grows ? PI : mn(m),
      [grows ? mn(m) : PI, mn(m + k), '0', MI],
      grows ? 'La exponencial e^{' + ex + '} crece sin límite: el resultado es +∞.' : 'e^{' + ex + '} → 0, así que solo queda ' + mn(m) + '.');
  });

  /* polinomios en el infinito */
  genr('lim1', function () {
    var n = ri(2, 5), a = nz(-4, 4), b = ri(-9, 9), c = ri(-9, 9), dir = pick([PI, MI]);
    var arr = [a].concat(zeros(n - 2)).concat([b, c]);
    var s = (a > 0 ? 1 : -1) * (dir === MI && n % 2 ? -1 : 1);
    return mk('lim1', L(dir) + '(' + P(arr) + ') =', s > 0 ? PI : MI, [s > 0 ? MI : PI, '0', mn(a), 'No existe'],
      'Manda el término de mayor grado, ' + mono(a, n) + (dir === MI ? ' (con x negativo y exponente ' + (n % 2 ? 'impar' : 'par') + ')' : '') + ': tiende a ' + (s > 0 ? PI : MI) + '.');
  });

  /* ∞/∞ con raíz */
  genr('lim1', function () {
    var a = ri(2, 5), b, k = ri(1, 9), c = nz(-5, 5), dir = Math.random() < 0.7 ? PI : MI;
    do { b = ri(1, 5); } while (b === a);
    var ans = dir === PI ? F(a, b) : F(-a, b);
    return mk('lim1', L(dir) + '⟨√{' + a * a + 'x^{2} + ' + k + '}|' + P([b, c]) + '⟩ =', ans,
      [dir === PI ? F(-a, b) : F(a, b), F(a * a, b), PI, '1', '0'],
      'Arriba √{' + a * a + 'x^{2}} = ' + a + '|x|' + (dir === MI ? ' = −' + a + 'x (x negativo)' : '') + ': el cociente tiende a ' + ans + '.');
  });

  add('lim1', '¿Cuál de estas expresiones NO es una indeterminación?', '∞ + ∞', ['⟨0|0⟩', '∞ − ∞', '1^{∞}'],
    '∞ + ∞ = ∞ siempre. Las otras pueden dar cualquier valor según el caso.');
  add('lim1', '¿Cuál de estas expresiones SÍ es una indeterminación?', '0 · ∞', ['⟨0|∞⟩', '⟨5|0⟩', '∞ · ∞'],
    '0 · ∞ puede dar cualquier cosa. ⟨0|∞⟩ = 0, ∞ · ∞ = ∞ y ⟨5|0⟩ es infinito (hay que estudiar el signo).');
  add('lim1', 'Si lim_{x→2^{−}} f(x) = 3 y lim_{x→2^{+}} f(x) = 5, entonces lim_{x→2} f(x)', 'No existe', ['Vale 4', 'Vale 8', 'Vale 3'],
    'El límite existe solo si los dos laterales coinciden. Aquí son distintos.');
  barb('Si lim_{x→2^{−}} f(x) = 3 y lim_{x→2^{+}} f(x) = 5, entonces lim_{x→2} f(x)', 'Vale 8');
  add('lim1', 'lim_{x→+∞} (1 + ⟨1|x⟩)^{x} =', 'e', ['1', '+∞', '0'],
    'Es la definición del número e ≈ 2,718. Ojo: 1^{∞} es una indeterminación, no vale 1.');
  barb('lim_{x→+∞} (1 + ⟨1|x⟩)^{x} =', '1');
  add('lim1', 'Al sustituir en un límite sale ⟨k|0⟩ con k ≠ 0. Entonces el límite', 'Es infinito (ver laterales)', ['Vale 0', 'Vale k', 'Es ⟨0|0⟩: hay que factorizar'],
    'Un número entre algo que tiende a 0 se hace infinitamente grande; el signo se decide con los límites laterales.');
  add('lim1', 'lim_{x→0^{+}} ln x =', '−∞', ['0', '+∞', '1'],
    'ln x se hunde hacia −∞ cuando x se acerca a 0 por la derecha (asíntota vertical x = 0).');
  add('lim1', 'Para resolver ⟨0|0⟩ en un cociente de polinomios se suele', 'Factorizar y simplificar', ['Decir que vale 0', 'Decir que vale 1', 'Sustituir otra vez'],
    'Si sale ⟨0|0⟩ en x = a, los dos polinomios tienen el factor (x − a): se simplifica y se vuelve a sustituir.');
  barb('Para resolver ⟨0|0⟩ en un cociente de polinomios se suele', 'Decir que vale 1');
  add('lim1', 'Para resolver ∞ − ∞ con raíces cuadradas se suele', 'Multiplicar por el conjugado', ['Restar: da 0', 'Elevar todo al cuadrado', 'Dividir entre x^{2}'],
    'Multiplicando y dividiendo por el conjugado desaparecen las raíces del numerador.');
  barb('Para resolver ∞ − ∞ con raíces cuadradas se suele', 'Restar: da 0');
  add('lim1', 'lim_{x→+∞} ⟨x^{3}|e^{x}⟩ =', '0', ['+∞', '1', 'No existe'],
    'La exponencial crece más deprisa que cualquier potencia de x.');

  /* =====================================================================
     lim2 — Continuidad y asíntotas
     ===================================================================== */

  /* parámetro en el trozo cuadrático */
  genr('lim2', function () {
    var p = nz(-3, 3), k = nz(-4, 4), b = ri(-5, 5), a = k * p + b - p * p;
    return mk('lim2', 'f(x) = x^{2} + a si x < ' + mn(p) + ', y f(x) = ' + P([k, b]) + ' si x ≥ ' + mn(p) + '. ¿Para qué valor de a es f continua?', mn(a),
      [mn(k * p + b + p * p), mn(k * p + b), mn(-a), mn(p * p - k * p - b)],
      'Igualamos los límites laterales en x = ' + mn(p) + ': ' + sq(p) + ' + a = ' + mn(k * p + b) + ', luego a = ' + mn(a) + '.');
  });

  /* parámetro en el trozo lineal */
  genr('lim2', function () {
    var m = nz(-4, 4), p = nz(-3, 3), q0 = ri(-5, 5), c = m * p + q0 - p * p;
    var lin1 = 'kx' + (q0 ? sg(q0) : '');
    return mk('lim2', 'f(x) = ' + lin1 + ' si x ≤ ' + mn(p) + ', y f(x) = ' + P([1, 0, c]) + ' si x > ' + mn(p) + '. ¿Qué valor de k hace f continua?', mn(m),
      [mn(-m), F(p * p + c, p), F(p * p + c + q0, p), mn(m + 1)],
      'En x = ' + mn(p) + ': k·' + pr(p) + (q0 ? sg(q0) : '') + ' = ' + sq(p) + sg(c) + ' = ' + mn(p * p + c) + ', de donde k = ' + mn(m) + '.');
  });

  /* tipo de discontinuidad */
  genr('lim2', function () {
    var T = ['Evitable', 'De salto finito', 'De salto infinito', 'Es continua'];
    var v = ri(0, 3), q, ans, e;
    if (v === 0) {
      var r0 = nz(-5, 5);
      q = 'f(x) = ⟨x^{2} − ' + r0 * r0 + '|' + lf(r0) + '⟩ en x = ' + mn(r0) + ':';
      ans = T[0]; e = 'f no está definida en x = ' + mn(r0) + ', pero el límite existe (vale ' + mn(2 * r0) + '): discontinuidad evitable.';
    } else if (v === 1) {
      var r1 = nz(-5, 5), s;
      do { s = ri(-5, 5); } while (s === -r1);
      q = 'f(x) = ⟨' + P([1, s]) + '|' + lf(r1) + '⟩ en x = ' + mn(r1) + ':';
      ans = T[2]; e = 'Al sustituir sale ⟨' + mn(r1 + s) + '|0⟩: los laterales son ±∞ (asíntota vertical), salto infinito.';
    } else {
      var p = nz(-3, 3), b = ri(-4, 4), m = nz(-3, 3), L1 = p * p + b, n;
      if (v === 3) n = L1 - m * p; else do { n = ri(-6, 6); } while (m * p + n === L1);
      q = 'f(x) = ' + P([1, 0, b]) + ' si x < ' + mn(p) + ', y f(x) = ' + P([m, n]) + ' si x ≥ ' + mn(p) + ', en x = ' + mn(p) + ':';
      if (v === 2) { ans = T[1]; e = 'Laterales: ' + mn(L1) + ' por la izquierda y ' + mn(m * p + n) + ' por la derecha. Son finitos y distintos: salto finito.'; }
      else { ans = T[3]; e = 'Los dos laterales valen ' + mn(L1) + ' y f(' + mn(p) + ') = ' + mn(L1) + ': es continua.'; }
    }
    return mk('lim2', 'Tipo de discontinuidad de ' + q, ans, T.filter(function (x) { return x !== ans; }), e);
  });

  /* asíntotas verticales */
  genr('lim2', function () {
    var r0 = nz(-5, 5), s, t;
    do { s = nz(-5, 5); } while (s === r0 || s === -r0);
    var den = P([1, -(r0 + s), r0 * s]);
    if (Math.random() < 0.6) {
      do { t = ri(-5, 5); } while (t === r0 || t === s);
      return mk('lim2', 'Asíntotas verticales de f(x) = ⟨' + lf(t) + '|' + den + '⟩', av([r0, s]),
        [av([-r0, -s]), 'x = ' + mn(r0), 'x = ' + mn(s), av([t, r0])],
        'El denominador es (' + lf(r0) + ')(' + lf(s) + ') y el numerador no se anula ahí: asíntotas en ' + av([r0, s]) + '.');
    }
    return mk('lim2', 'Asíntotas verticales de f(x) = ⟨' + lf(r0) + '|' + den + '⟩', 'x = ' + mn(s),
      [av([r0, s]), 'x = ' + mn(r0), 'x = ' + mn(-s)],
      'Denominador (' + lf(r0) + ')(' + lf(s) + '). El factor (' + lf(r0) + ') se simplifica (en x = ' + mn(r0) + ' hay un hueco, discontinuidad evitable): solo queda x = ' + mn(s) + '.');
  });

  /* asíntota horizontal (mismo grado) */
  genr('lim2', function () {
    var a = nz(-6, 6), c = nz(-6, 6), b = nz(-6, 6), d = nz(-6, 6), q;
    if (Math.random() < 0.6) q = '⟨' + P([a, b]) + '|' + P([c, d]) + '⟩';
    else q = '⟨' + P([a, b, ri(-5, 5)]) + '|' + P([c, 0, d]) + '⟩';
    return mk('lim2', 'Asíntota horizontal de f(x) = ' + q, 'y = ' + F(a, c),
      ['y = ' + F(b, d), 'y = 0', 'x = ' + F(-d, c), 'y = ' + F(c, a)],
      'Mismo grado arriba y abajo: y = cociente de coeficientes principales, ' + mn(a) + ' entre ' + mn(c) + ' = ' + F(a, c) + '.');
  });

  /* asíntota horizontal según los grados */
  genr('lim2', function () {
    var m = ri(1, 3), n;
    do { n = ri(1, 3); } while (n === m);
    var a = nz(-5, 5), c = nz(-5, 5), k = nz(-6, 6), j = nz(-6, 6);
    var num = [a].concat(zeros(m - 1)).concat([k]), den = [c].concat(zeros(n - 1)).concat([j]);
    var ans = m < n ? 'y = 0' : 'No tiene';
    return mk('lim2', 'Asíntota horizontal de f(x) = ⟨' + P(num) + '|' + P(den) + '⟩', ans,
      ['y = 0', 'No tiene', 'y = ' + F(a, c), 'y = 1'].filter(function (x) { return x !== ans; }),
      m < n ? 'Grado del numerador menor que el del denominador: f → 0, asíntota y = 0.' : 'Grado del numerador mayor: f → ±∞, no hay asíntota horizontal' + (m === n + 1 ? ' (hay oblicua).' : '.'));
  });

  /* asíntota oblicua */
  genr('lim2', function () {
    var a = ri(1, 3), r0 = nz(-4, 4), b = ri(-5, 5), c, q0 = b + a * r0;
    do { c = ri(-6, 6); } while (c + r0 * q0 === 0);
    var r = mk('lim2', 'Asíntota oblicua de f(x) = ⟨' + P([a, b, c]) + '|' + lf(r0) + '⟩', 'y = ' + P([a, q0]),
      ['y = ' + P([a, b - a * r0]), 'y = ' + P([a, b]), 'y = ' + P([a, -q0]), 'y = ' + P([a, 0])],
      'Dividimos (' + P([a, b, c]) + ') : (' + lf(r0) + '): cociente ' + P([a, q0]) + ' y resto ' + mn(c + r0 * q0) + '. La asíntota es el cociente.');
    if (Math.random() < 0.3) r.p = 1;
    return r;
  });

  /* Bolzano: intervalo con raíz */
  genr('lim2', function () {
    var b, c, S, N, f;
    do {
      b = ri(-6, 3); c = nz(-6, 6); S = []; N = [];
      f = function (x) { return x * x * x + b * x + c; };
      for (var k = -3; k <= 2; k++) {
        var fa = f(k), fb = f(k + 1);
        if (fa * fb < 0) S.push(k);
        else if (fa !== 0 && fb !== 0) {
          var ok = true;
          for (var x = k; x < k + 1; x += 0.01) if (f(x) * fa <= 0) { ok = false; break; }
          if (ok) N.push(k);
        }
      }
    } while (!S.length || N.length < 3);
    var k0 = pick(S), I = function (k) { return '(' + mn(k) + ', ' + mn(k + 1) + ')'; };
    return mk('lim2', 'Por el teorema de Bolzano, f(x) = ' + P([1, 0, b, c]) + ' tiene seguro una raíz en', I(k0),
      shuffle(N).slice(0, 3).map(I),
      'f es continua y f(' + mn(k0) + ') = ' + mn(f(k0)) + ', f(' + mn(k0 + 1) + ') = ' + mn(f(k0 + 1)) + ' tienen distinto signo.');
  });

  /* Bolzano conceptual */
  genr('lim2', function () {
    var a = ri(-3, 1), b = a + ri(2, 4);
    if (Math.random() < 0.3) {
      var m = ri(a + 1, b - 1);
      return mk('lim2', '¿Asegura Bolzano una raíz de f(x) = ⟨1|' + lf(m) + '⟩ en [' + mn(a) + ', ' + mn(b) + '], si f(' + mn(a) + ') < 0 < f(' + mn(b) + ')?', 'No: f no es continua',
        ['Sí: hay cambio de signo', 'Sí: la raíz es x = ' + mn(m), 'No: f(a)·f(b) > 0'],
        'f no es continua en x = ' + mn(m) + ' (asíntota vertical), así que Bolzano no se aplica. De hecho, f nunca vale 0.');
    }
    var u = nz(-9, 9), v = nz(-9, 9);
    var O = ['Sí, al menos una', 'No se puede asegurar', 'Sí, exactamente una', 'No, ninguna'];
    var ans = u * v < 0 ? O[0] : O[1];
    return mk('lim2', 'f es continua en [' + mn(a) + ', ' + mn(b) + '], f(' + mn(a) + ') = ' + mn(u) + ' y f(' + mn(b) + ') = ' + mn(v) + '. ¿Tiene f alguna raíz en (' + mn(a) + ', ' + mn(b) + ')?', ans,
      O.filter(function (x) { return x !== ans; }),
      u * v < 0 ? 'Hay cambio de signo y f es continua: Bolzano asegura al menos una raíz (puede haber más).' : 'No hay cambio de signo: Bolzano no dice nada (podría haber raíces o no).');
  });

  /* L'Hôpital (2.º Bach) */
  genr('lim2', function () {
    var v = ri(0, 4), r;
    if (v === 0) {
      var k = ri(2, 5) * pick([1, -1]);
      r = mk('lim2', L('0') + '⟨e^{' + mn(k) + 'x} − 1|x⟩ =', mn(k), ['0', '1', ep(k) + ' − 1', PI],
        'Es ⟨0|0⟩. Por L\'Hôpital: ⟨' + mn(k) + 'e^{' + mn(k) + 'x}|1⟩ → ' + mn(k) + '.');
      return B(r, ep(k) + ' − 1');
    }
    if (v === 1) {
      var a = ri(2, 6), m;
      do { m = ri(2, 6); } while (m === a);
      r = mk('lim2', L('0') + '⟨sen(' + a + 'x)|' + m + 'x⟩ =', F(a, m), [F(m, a), '1', '0', '⟨sen ' + a + '|' + m + '⟩'],
        'Es ⟨0|0⟩. Por L\'Hôpital: ⟨' + a + 'cos(' + a + 'x)|' + m + '⟩ → ⟨' + a + '|' + m + '⟩.');
      return B(r, '⟨sen ' + a + '|' + m + '⟩');
    }
    if (v === 2) {
      var k2 = ri(2, 6);
      return mk('lim2', L('0') + '⟨ln(1 + ' + k2 + 'x)|x⟩ =', String(k2), ['1', '0', F(1, k2), 'ln ' + k2],
        'Es ⟨0|0⟩. Por L\'Hôpital: ⟨' + k2 + '|1 + ' + k2 + 'x⟩ → ' + k2 + '.');
    }
    if (v === 3) {
      var n = ri(2, 4), w = pick([0, 1, 2]);
      if (w === 0) return mk('lim2', L(PI) + '⟨' + xp(n) + '|e^{x}⟩ =', '0', [PI, '1', String(n)],
        'Aplicando L\'Hôpital ' + n + ' veces el numerador queda constante y abajo sigue e^{x} → +∞: tiende a 0.');
      if (w === 1) return mk('lim2', L(PI) + '⟨e^{x}|' + xp(n) + '⟩ =', PI, ['0', '1', String(n)],
        'Aplicando L\'Hôpital ' + n + ' veces queda ⟨e^{x}|' + (n === 2 ? 2 : n === 3 ? 6 : 24) + '⟩ → +∞.');
      return mk('lim2', L(PI) + '⟨ln x|' + xp(n) + '⟩ =', '0', [PI, '1', F(1, n)],
        'L\'Hôpital: ⟨⟨1|x⟩|' + n + xp(n - 1) + '⟩ = ⟨1|' + n + xp(n) + '⟩ → 0.');
    }
    var a2 = ri(2, 3), n2 = ri(2, 4), val = n2 * Math.pow(a2, n2 - 1);
    return mk('lim2', L(String(a2)) + '⟨' + xp(n2) + ' − ' + Math.pow(a2, n2) + '|x − ' + a2 + '⟩ =', String(val),
      [String(n2 * Math.pow(a2, n2)), String(Math.pow(a2, n2 - 1)), '0', String(n2)],
      'Es ⟨0|0⟩. Por L\'Hôpital: ⟨' + n2 + xp(n2 - 1) + '|1⟩ en x = ' + a2 + ' → ' + val + '.');
  });

  /* asíntotas de m + k/(x − r) */
  genr('lim2', function () {
    var m = nz(-5, 5), k = ri(1, 6), r0 = nz(-5, 5);
    var s = function (x, y) { return 'x = ' + mn(x) + '; y = ' + mn(y); };
    return mk('lim2', 'Asíntotas de f(x) = ' + mn(m) + ' + ⟨' + k + '|' + lf(r0) + '⟩', s(r0, m),
      [s(-r0, m), s(r0, k), s(m, r0), s(r0, 0)],
      'Vertical donde se anula el denominador (x = ' + mn(r0) + '); cuando x → ±∞ la fracción → 0, así que y = ' + mn(m) + '.');
  });

  /* puntos de discontinuidad / dónde es continua */
  genr('lim2', function () {
    var v = ri(0, 2), k = ri(1, 5), c = nz(-6, 6);
    var both = 'x = −' + k + ' y x = ' + k;
    if (v === 0) return mk('lim2', '¿Dónde es discontinua f(x) = ⟨' + P([1, c]) + '|x^{2} − ' + k * k + '⟩?', both,
      ['x = ' + k, 'En ningún punto', 'x = ' + k * k],
      'Donde se anula el denominador: x^{2} = ' + k * k + ' → x = ±' + k + '.');
    if (v === 1) {
      var r = mk('lim2', '¿Dónde es discontinua f(x) = ⟨' + P([1, c]) + '|x^{2} + ' + k * k + '⟩?', 'En ningún punto',
        [both, 'x = 0', 'x = −' + k * k],
        'x^{2} + ' + k * k + ' es siempre positivo: el denominador nunca se anula y f es continua en todo ℝ.');
      return B(r, both);
    }
    var r0 = nz(-5, 5);
    return mk('lim2', '¿En qué intervalo es continua f(x) = ln(' + lf(r0) + ')?', iv(r0, null),
      ['[' + mn(r0) + ', +∞)', iv(-r0, null), 'En todo ℝ'],
      'El logaritmo solo existe si ' + lf(r0) + ' > 0, es decir, x > ' + mn(r0) + '; ahí es continua.');
  });

  add('lim2', 'Una función f es continua en x = a si', 'lim_{x→a} f(x) = f(a)', ['f(a) existe', 'Existen los dos laterales', "f'(a) = 0"],
    'Hacen falta tres cosas: que exista f(a), que exista el límite y que coincidan.');
  add('lim2', 'Hipótesis del teorema de Bolzano en [a, b]', 'Continua y f(a)·f(b) < 0', ['Derivable y f(a) = f(b)', 'Continua y f(a)·f(b) > 0', 'f(a) = f(b) = 0'],
    'Si f es continua en [a, b] y cambia de signo en los extremos, hay al menos un c ∈ (a, b) con f(c) = 0.');
  add('lim2', '¿Puede la gráfica de una función cortar a su asíntota horizontal?', 'Sí, puede cortarla', ['No, nunca', 'Solo si es una recta', 'Solo en x = 0'],
    'Por ejemplo f(x) = ⟨x|x^{2} + 1⟩ tiene asíntota y = 0 y la corta en x = 0. La asíntota describe el comportamiento en ±∞.');
  add('lim2', 'Una función racional tiene asíntota oblicua cuando', 'grado num. = grado den. + 1', ['Los grados son iguales', 'grado num. < grado den.', 'El denominador se anula'],
    'Si el numerador tiene exactamente un grado más, el cociente de la división es una recta y = mx + n.');
  add('lim2', 'f(x) = ln x tiene una asíntota vertical en', 'x = 0', ['y = 0', 'x = 1', 'No tiene'],
    'lim_{x→0^{+}} ln x = −∞. En x = 1 lo que hay es un corte con el eje X.');
  add('lim2', 'La regla de L\'Hôpital se aplica directamente a límites del tipo', '⟨0|0⟩ y ⟨∞|∞⟩', ['Cualquier cociente', '∞ − ∞', '⟨k|0⟩ con k ≠ 0'],
    'Solo vale para ⟨0|0⟩ y ⟨∞|∞⟩. Las demás indeterminaciones hay que transformarlas antes en un cociente.');
  add('lim2', 'En L\'Hôpital, el límite de ⟨f|g⟩ se cambia por el de', "⟨f'|g'⟩", ["⟨f'g − fg'|g^{2}⟩", "⟨f|g'⟩", "⟨f'|g⟩"],
    'Se derivan numerador y denominador POR SEPARADO; no se usa la regla de la derivada del cociente.');
  barb('En L\'Hôpital, el límite de ⟨f|g⟩ se cambia por el de', "⟨f'g − fg'|g^{2}⟩");
  add('lim2', 'f(x) = ⟨1|x⟩ en x = 0 tiene una discontinuidad', 'De salto infinito', ['Evitable', 'De salto finito', 'Ninguna: es continua'],
    'Por la izquierda tiende a −∞ y por la derecha a +∞: asíntota vertical.');
  add('lim2', 'Una función polinómica es continua', 'En todo ℝ', ['Salvo en sus raíces', 'Solo si es de grado 1', 'Solo en [0, +∞)'],
    'Los polinomios son continuos en todos los números reales.');
  add('lim2', 'f(x) = tan x es discontinua en', 'x = ⟨π|2⟩ + kπ', ['x = kπ', 'x = 0', 'Ningún punto'],
    'tan x = ⟨sen x|cos x⟩ y cos x = 0 en x = ⟨π|2⟩ + kπ: ahí hay asíntotas verticales.');

  /* =====================================================================
     der1 — Cálculo de derivadas
     ===================================================================== */
  var D = function (f) { return 'Si f(x) = ' + f + ', entonces f\'(x) ='; };

  /* potencia */
  genr('der1', function () {
    var a = nz(-9, 9), n = ri(2, 7);
    var r = mk('der1', D(mono(a, n)), mono(a * n, n - 1),
      [mono(a * n, n), mono(a, n - 1), mono(a * (n - 1), n - 1), mono(a * n, n + 1)],
      'Se baja el exponente multiplicando y se resta 1: ' + mn(a) + '·' + n + xp(n - 1) + ' = ' + mono(a * n, n - 1) + '.');
    return B(r, mono(a * n, n));
  });

  /* polinomio */
  genr('der1', function () {
    var a = nz(-4, 4), b = ri(-6, 6), c = nz(-9, 9), d = nz(-9, 9);
    return mk('der1', D(P([a, b, c, d])), P([3 * a, 2 * b, c]),
      [P([3 * a, 2 * b, c, d]), P([a, b, c]), P([3 * a, 2 * b, 0]), P([3 * a, b, c])],
      'Derivamos término a término: (x^{3})\' = 3x^{2}, (x^{2})\' = 2x, (x)\' = 1 y la constante da 0.');
  });

  /* raíces y potencias negativas */
  genr('der1', function () {
    var v = ri(0, 3);
    if (v === 0) {
      var k = pick([1, 2, 4, 6, 8]);
      return mk('der1', D((k === 1 ? '' : k) + '√{x}'), rf(k, 2, '√{x}'),
        [rf(k, 1, '√{x}'), rf(k, 2, 'x'), rf(-k, 2, '√{x}'), rf(1, 2 * k, '√{x}')],
        '(√{x})\' = ⟨1|2√{x}⟩, multiplicado por ' + k + '.');
    }
    if (v === 1) {
      var k1 = ri(1, 9), s = pick([1, -1]);
      return mk('der1', D((s < 0 ? '−' : '') + '⟨' + k1 + '|x⟩'), rf(-s * k1, 1, 'x^{2}'),
        [rf(s * k1, 1, 'x^{2}'), rf(-s * k1, 1, 'x'), rf(s * k1, 1, 'x'), rf(-s * k1, 2, 'x^{2}')],
        '⟨1|x⟩ = x^{−1} y su derivada es −x^{−2} = −⟨1|x^{2}⟩; se multiplica por ' + mn(s * k1) + '.');
    }
    if (v === 2) {
      var n = ri(2, 5);
      return mk('der1', D('⟨1|' + xp(n) + '⟩'), rf(-n, 1, xp(n + 1)),
        [rf(-n, 1, xp(n - 1)), rf(1, n, xp(n - 1)), rf(-1, 1, xp(n + 1)), rf(n, 1, xp(n + 1))],
        '⟨1|' + xp(n) + '⟩ = x^{−' + n + '}; derivada −' + n + 'x^{−' + (n + 1) + '} = −⟨' + n + '|' + xp(n + 1) + '⟩.');
    }
    return mk('der1', D('√[3]{x}'), '⟨1|3√[3]{x^{2}}⟩', ['⟨1|3√[3]{x}⟩', '⟨1|2√[3]{x^{2}}⟩', '⟨1|√[3]{x^{2}}⟩'],
      '√[3]{x} = x^{⟨1|3⟩}; derivada ⟨1|3⟩x^{−⟨2|3⟩} = ⟨1|3√[3]{x^{2}}⟩.');
  });

  /* producto de dos binomios */
  genr('der1', function () {
    var a = nz(-4, 4), b = nz(-6, 6), c = nz(-4, 4), d = nz(-6, 6);
    var r = mk('der1', D('(' + P([a, b]) + ')(' + P([c, d]) + ')'), P([2 * a * c, a * d + b * c]),
      [mn(a * c), P([a * c, a * d + b * c]), P([2 * a * c, a * d - b * c]), P([2 * a * c, b * d])],
      'Regla del producto: ' + mn(a) + '(' + P([c, d]) + ') + (' + P([a, b]) + ')·' + pr(c) + ' = ' + P([2 * a * c, a * d + b * c]) + '.');
    return B(r, mn(a * c));
  });

  /* producto con exponencial, logaritmo o trigonométrica */
  genr('der1', function () {
    var v = ri(0, 4), r, bad;
    if (v === 0) {
      var n = ri(1, 3), arr = [1, n].concat(zeros(n - 1));
      bad = n === 1 ? 'e^{x}' : n + xp(n - 1) + '·e^{x}';
      r = mk('der1', D(xp(n) + '·e^{x}'), 'e^{x}(' + P(arr) + ')',
        [bad, 'e^{x}(' + P([1, -n].concat(zeros(n - 1))) + ')', (n + 1) + xp(n) + '·e^{x}'],
        'Producto: ' + (n === 1 ? '1' : n + xp(n - 1)) + '·e^{x} + ' + xp(n) + '·e^{x} = e^{x}(' + P(arr) + ').');
    } else if (v === 1) {
      bad = '⟨1|x⟩';
      r = mk('der1', D('x·ln x'), 'ln x + 1', [bad, 'ln x', 'ln x + x'],
        'Producto: 1·ln x + x·⟨1|x⟩ = ln x + 1.');
    } else if (v === 2) {
      bad = '2';
      r = mk('der1', D('x^{2}·ln x'), '2x·ln x + x', [bad, '2x·ln x', '2x·ln x + 1'],
        'Producto: 2x·ln x + x^{2}·⟨1|x⟩ = 2x·ln x + x.');
    } else if (v === 3) {
      bad = 'cos x';
      r = mk('der1', D('x·sen x'), 'sen x + x·cos x', [bad, 'sen x − x·cos x', 'x·cos x'],
        'Producto: 1·sen x + x·cos x.');
    } else {
      bad = '−sen x';
      r = mk('der1', D('x·cos x'), 'cos x − x·sen x', [bad, 'cos x + x·sen x', '−x·sen x'],
        'Producto: 1·cos x + x·(−sen x) = cos x − x·sen x.');
    }
    return r;
  });

  /* cociente de binomios */
  genr('der1', function () {
    var a, b, c, d, N;
    do { a = nz(-5, 5); b = nz(-6, 6); c = nz(-5, 5); d = nz(-6, 6); N = a * d - b * c; } while (N === 0);
    var den = '(' + P([c, d]) + ')^{2}';
    var r = mk('der1', D('⟨' + P([a, b]) + '|' + P([c, d]) + '⟩'), q2(N, den),
      [q2(-N, den), q2(a * d + b * c, den), F(a, c), q2(N, P([c, d]))],
      'Cociente: ⟨' + mn(a) + '(' + P([c, d]) + ') − (' + P([a, b]) + ')·' + pr(c) + '|' + den + '⟩ = ' + q2(N, den) + '.');
    return B(r, F(a, c));
  });

  /* regla de la cadena: potencias */
  genr('der1', function () {
    var n = ri(2, 5), pw = n - 1 === 1 ? '' : '^{' + (n - 1) + '}';
    if (Math.random() < 0.6) {
      var a = ri(2, 4) * pick([1, -1]), b = nz(-6, 6), base = '(' + P([a, b]) + ')';
      return mk('der1', D(base + '^{' + n + '}'), mn(n * a) + base + pw,
        [n + base + pw, mn(n * a) + base + '^{' + n + '}', mn(a) + base + pw, mn(n + a) + base + pw],
        'Cadena: ' + n + base + pw + ' por la derivada de dentro (' + mn(a) + ') = ' + mn(n * a) + base + pw + '.');
    }
    var k = nz(-9, 9), bs = '(' + P([1, 0, k]) + ')', m = Math.min(n, 4);
    pw = m - 1 === 1 ? '' : '^{' + (m - 1) + '}';
    return mk('der1', D(bs + '^{' + m + '}'), 2 * m + 'x' + bs + pw,
      [m + bs + pw, 2 * m + 'x' + bs + '^{' + m + '}', m + 'x' + bs + pw],
      'Cadena: ' + m + bs + pw + ' por la derivada de dentro (2x) = ' + 2 * m + 'x' + bs + pw + '.');
  });

  /* regla de la cadena: raíces */
  genr('der1', function () {
    if (Math.random() < 0.55) {
      var a = ri(2, 6) * pick([1, 1, -1]), b = nz(-8, 8), R0 = '√{' + P([a, b]) + '}';
      return mk('der1', D(R0), rf(a, 2, R0), [rf(1, 2, R0), rf(a, 1, R0), rf(1, 2 * Math.abs(a), R0)],
        '(√{u})\' = ⟨u\'|2√{u}⟩ con u\' = ' + mn(a) + ': ' + rf(a, 2, R0) + '.');
    }
    var k = ri(1, 9), R1 = '√{x^{2} + ' + k + '}';
    return mk('der1', D(R1), '⟨x|' + R1 + '⟩', ['⟨1|2' + R1 + '⟩', '⟨2x|' + R1 + '⟩', '⟨x|2' + R1 + '⟩'],
      '(√{u})\' = ⟨u\'|2√{u}⟩ = ⟨2x|2' + R1 + '⟩ = ⟨x|' + R1 + '⟩.');
  });

  /* exponenciales */
  genr('der1', function () {
    var v = ri(0, 2);
    if (v < 2) {
      var k = ri(2, 6) * pick([1, -1]), ex = v === 0 ? mn(k) + 'x' : P([k, nz(-5, 5)]);
      return mk('der1', D('e^{' + ex + '}'), mn(k) + 'e^{' + ex + '}',
        ['e^{' + ex + '}', '(' + ex + ')·e^{' + ex + '}', mn(-k) + 'e^{' + ex + '}', 'e^{' + mn(k) + '}'],
        '(e^{u})\' = u\'·e^{u}, y la derivada del exponente es ' + mn(k) + '.');
    }
    var a = pick([2, 3, 5, 10]), bad = 'x·' + a + '^{x − 1}';
    var r = mk('der1', D(a + '^{x}'), a + '^{x}·ln ' + a, [bad, a + '^{x}', '⟨' + a + '^{x}|ln ' + a + '⟩'],
      '(a^{x})\' = a^{x}·ln a. No es una potencia de x: la x está en el exponente.');
    return B(r, bad);
  });

  /* logaritmos */
  genr('der1', function () {
    var v = ri(0, 2);
    if (v === 0) {
      var a = ri(2, 7) * pick([1, -1]), b = nz(-8, 8), u = P([a, b]);
      return mk('der1', D('ln(' + u + ')'), (a < 0 ? '−' : '') + '⟨' + Math.abs(a) + '|' + u + '⟩',
        ['⟨1|' + u + '⟩', (a < 0 ? '−' : '') + '⟨' + Math.abs(a) + '|x⟩', mn(a) + '·ln(' + u + ')'],
        '(ln u)\' = ⟨u\'|u⟩ con u\' = ' + mn(a) + '.');
    }
    if (v === 1) {
      var k = nz(-9, 9), u1 = P([1, 0, k]);
      return mk('der1', D('ln(' + u1 + ')'), '⟨2x|' + u1 + '⟩', ['⟨1|' + u1 + '⟩', '⟨1|2x⟩', '2x·ln(' + u1 + ')'],
        '(ln u)\' = ⟨u\'|u⟩ con u\' = 2x.');
    }
    var n = ri(2, 6);
    return mk('der1', D('ln(' + xp(n) + ')'), '⟨' + n + '|x⟩', ['⟨1|' + xp(n) + '⟩', '⟨' + n + '|' + xp(n) + '⟩', '⟨1|' + n + xp(n - 1) + '⟩'],
      'ln(' + xp(n) + ') = ' + n + '·ln x, cuya derivada es ⟨' + n + '|x⟩.');
  });

  /* trigonométricas */
  genr('der1', function () {
    var v = ri(0, 3), k = ri(2, 6), kx = k + 'x';
    if (v === 0) return mk('der1', D('sen(' + kx + ')'), k + 'cos(' + kx + ')',
      ['cos(' + kx + ')', '−' + k + 'cos(' + kx + ')', '−' + k + 'sen(' + kx + ')'],
      '(sen u)\' = u\'·cos u, con u\' = ' + k + '.');
    if (v === 1) return mk('der1', D('cos(' + kx + ')'), '−' + k + 'sen(' + kx + ')',
      [k + 'sen(' + kx + ')', '−sen(' + kx + ')', '−' + k + 'cos(' + kx + ')'],
      '(cos u)\' = −u\'·sen u, con u\' = ' + k + '.');
    if (v === 2) return mk('der1', D('sen(x^{2})'), '2x·cos(x^{2})', ['cos(x^{2})', 'cos(2x)', '−2x·cos(x^{2})'],
      '(sen u)\' = u\'·cos u con u = x^{2}, u\' = 2x.');
    return mk('der1', D('tan(' + kx + ')'), '⟨' + k + '|cos^{2}(' + kx + ')⟩',
      ['⟨1|cos^{2}(' + kx + ')⟩', '−⟨' + k + '|cos^{2}(' + kx + ')⟩', '⟨' + k + '|sen^{2}(' + kx + ')⟩'],
      '(tan u)\' = ⟨u\'|cos^{2} u⟩, con u\' = ' + k + '.');
  });

  /* derivada en un punto */
  genr('der1', function () {
    var p = nz(-3, 3), pp = p < 0 ? '(' + mn(p) + ')' : String(p);
    if (Math.random() < 0.6) {
      var a = nz(-4, 4), b = ri(-6, 6), c = ri(-6, 6), v = 2 * a * p + b;
      return mk('der1', 'Si f(x) = ' + P([a, b, c]) + ', f\'(' + mn(p) + ') =', mn(v),
        [mn(a * p * p + b * p + c), mn(2 * a * p), mn(a * p + b), mn(2 * a * p - b)],
        'f\'(x) = ' + P([2 * a, b]) + ' y en x = ' + mn(p) + ': ' + mn(2 * a) + '·' + pp + sg(b) + ' = ' + mn(v) + '.');
    }
    var a2 = nz(-3, 3), b2 = nz(-6, 6), v2 = 3 * a2 * p * p + b2;
    return mk('der1', 'Si f(x) = ' + P([a2, 0, b2, 0]) + ', f\'(' + mn(p) + ') =', mn(v2),
      [mn(a2 * p * p * p + b2 * p), mn(3 * a2 * p + b2), mn(3 * a2 * p * p), mn(-v2)],
      'f\'(x) = ' + P([3 * a2, 0, b2]) + ' y en x = ' + mn(p) + ': ' + mn(3 * a2) + '·' + pp + '^{2}' + sg(b2) + ' = ' + mn(v2) + '.');
  });

  /* recta tangente */
  genr('der1', function () {
    var b = ri(-6, 6), c = ri(-6, 6), p = nz(-3, 3);
    var y0 = p * p + b * p + c, m = 2 * p + b, n = y0 - m * p;
    var r = mk('der1', 'Recta tangente a f(x) = ' + P([1, b, c]) + ' en x = ' + mn(p) + ':', 'y = ' + P([m, n]),
      ['y = ' + P([m, y0]), 'y = ' + P([m, y0 + m * p]), 'y = ' + P([y0, y0 - y0 * p]), 'y = ' + P([-m, y0 + m * p])],
      'f(' + mn(p) + ') = ' + mn(y0) + ' y f\'(' + mn(p) + ') = ' + mn(m) + '. y − ' + pr(y0) + ' = ' + mn(m) + '(x − ' + pr(p) + ') → y = ' + P([m, n]) + '.');
    r.p = 1;
    return r;
  });

  /* definición de derivada */
  genr('der1', function () {
    var a = nz(-4, 4), r;
    if (Math.random() < 0.5) {
      r = mk('der1', 'lim_{h→0} ⟨(' + mn(a) + ' + h)^{2} − ' + a * a + '|h⟩ =', mn(2 * a),
        ['0', String(a * a), mn(a), PI],
        'Desarrollando: ⟨' + mn(2 * a) + 'h + h^{2}|h⟩ = ' + mn(2 * a) + ' + h → ' + mn(2 * a) + '. Es la derivada de x^{2} en x = ' + mn(a) + '.');
    } else {
      var k = nz(-3, 3);
      r = mk('der1', 'Si f(x) = ' + mono(k, 2) + ', lim_{h→0} ⟨f(' + mn(a) + ' + h) − f(' + mn(a) + ')|h⟩ =', mn(2 * k * a),
        ['0', mn(k * a * a), mn(2 * a), PI],
        'Ese límite es f\'(' + mn(a) + '). Como f\'(x) = ' + mono(2 * k, 1) + ', vale ' + mn(2 * k * a) + '.');
    }
    return B(r, '0');
  });

  add('der1', 'Si f(x) = 7, entonces f\'(x) =', '0', ['7', '1', '7x'], 'La derivada de una constante es 0.');
  barb('Si f(x) = 7, entonces f\'(x) =', '7');
  add('der1', 'Si f(x) = e^{x}, entonces f\'(x) =', 'e^{x}', ['x·e^{x − 1}', 'e', 'e^{x − 1}'], 'La exponencial e^{x} es su propia derivada.');
  barb('Si f(x) = e^{x}, entonces f\'(x) =', 'x·e^{x − 1}');
  add('der1', 'Si f(x) = ln x, entonces f\'(x) =', '⟨1|x⟩', ['ln x', '⟨1|ln x⟩', 'e^{x}'], '(ln x)\' = ⟨1|x⟩ (para x > 0).');
  add('der1', 'Si f(x) = cos x, entonces f\'(x) =', '−sen x', ['sen x', '−cos x', 'cos x'], 'La derivada del coseno es menos el seno.');
  add('der1', 'Si f(x) = tan x, entonces f\'(x) =', '1 + tan^{2} x', ['⟨1|sen^{2} x⟩', '−⟨1|cos^{2} x⟩', '⟨1|tan x⟩'],
    '(tan x)\' = 1 + tan^{2} x = ⟨1|cos^{2} x⟩.');
  add('der1', 'lim_{h→0} ⟨f(a + h) − f(a)|h⟩ es', "f'(a)", ['f(a)', 'La recta tangente en a', '0'],
    'Es la definición de derivada en x = a: límite del cociente incremental.');
  add('der1', 'f(x) = |x| en x = 0 es', 'Continua pero no derivable', ['Derivable y continua', 'Ni continua ni derivable', 'Derivable pero no continua'],
    'No hay salto, pero hay un pico: la pendiente es −1 a la izquierda y 1 a la derecha.');
  add('der1', 'Si f es derivable en x = a, entonces', 'f es continua en x = a', ["f'(a) = 0", 'f tiene un extremo en a', 'f(a) = 0'],
    'Derivable implica continua (el recíproco no es cierto: |x| en 0).');
  add('der1', "(f · g)' =", "f'g + fg'", ["f'·g'", "f'g − fg'", "⟨f'|g'⟩"],
    'Regla del producto: derivada del primero por el segundo más el primero por la derivada del segundo.');
  barb("(f · g)' =", "f'·g'");

  /* =====================================================================
     der2 — Aplicaciones de la derivada
     ===================================================================== */

  /* crecimiento y decrecimiento de una cúbica */
  genr('der2', function () {
    var r0 = ri(-4, 2), s = r0 + 2 * ri(1, 3), sg0 = pick([1, -1]), d = ri(-5, 5);
    var co = [sg0, -sg0 * 3 * (r0 + s) / 2, sg0 * 3 * r0 * s, d];
    var ask = pick(['crece', 'decrece']);
    var inner = iv(r0, s), outer = iv(null, r0) + ' ∪ ' + iv(s, null);
    var ans = (ask === 'decrece') === (sg0 > 0) ? inner : outer;
    var r = mk('der2', '¿Dónde ' + ask + ' f(x) = ' + P(co) + '?', ans,
      [ans === inner ? outer : inner, iv(null, r0), iv(s, null), iv(-s, -r0)],
      'f\'(x) = ' + P([3 * sg0, -3 * sg0 * (r0 + s), 3 * sg0 * r0 * s]) + ' se anula en x = ' + mn(r0) + ' y x = ' + mn(s) + '. f\' es ' + (sg0 > 0 ? 'negativa' : 'positiva') + ' entre ellas y ' + (sg0 > 0 ? 'positiva' : 'negativa') + ' fuera.');
    r.p = 1;
    return r;
  });

  /* máximos y mínimos de x³ − 3k²x */
  genr('der2', function () {
    var k = ri(1, 3), s = pick([1, -1]), c = ri(-5, 5), ask = pick(['máximo', 'mínimo']);
    var xmax = s > 0 ? -k : k, x0 = ask === 'máximo' ? xmax : -xmax;
    return mk('der2', 'f(x) = ' + P([s, 0, -3 * s * k * k, c]) + ' tiene un ' + ask + ' relativo en', 'x = ' + mn(x0),
      ['x = ' + mn(-x0), 'x = 0', 'No tiene'],
      'f\'(x) = ' + P([3 * s, 0, -3 * s * k * k]) + ' = 0 en x = ±' + k + '. f\' pasa de + a − en x = ' + mn(xmax) + ' (máximo) y de − a + en x = ' + mn(-xmax) + ' (mínimo).');
  });

  /* extremo de una parábola */
  genr('der2', function () {
    var a = nz(-3, 3), v = nz(-4, 4), b = -2 * a * v, c = ri(-5, 5);
    var T = a > 0 ? 'Mínimo' : 'Máximo', O = a > 0 ? 'Máximo' : 'Mínimo';
    return mk('der2', 'f(x) = ' + P([a, b, c]) + ' tiene', T + ' en x = ' + mn(v),
      [O + ' en x = ' + mn(v), T + ' en x = ' + mn(-v), O + ' en x = ' + mn(-v)],
      'f\'(x) = ' + P([2 * a, b]) + ' = 0 → x = ' + mn(v) + '. f\'\'(x) = ' + mn(2 * a) + (a > 0 ? ' > 0: mínimo.' : ' < 0: máximo.'));
  });

  /* punto de inflexión */
  genr('der2', function () {
    var j = nz(-2, 2), b = 6 * j, c = ri(-6, 6), d = ri(-5, 5);
    return mk('der2', 'Punto de inflexión de f(x) = ' + P([1, b, c, d]) + ':', 'x = ' + mn(-2 * j),
      ['x = ' + mn(2 * j), 'x = ' + mn(-j), 'x = ' + mn(-6 * j), 'x = 0'],
      'f\'\'(x) = ' + P([6, 2 * b]) + ' = 0 → x = ' + mn(-2 * j) + ', y f\'\' cambia de signo ahí.');
  });

  /* concavidad */
  genr('der2', function () {
    var m = nz(-4, 4), c = ri(-6, 6), up = Math.random() < 0.5;
    var ans = up ? iv(m, null) : iv(null, m);
    return mk('der2', '¿Dónde es f(x) = ' + P([1, -3 * m, c, 0]) + ' cóncava hacia ' + (up ? 'arriba (∪)' : 'abajo (∩)') + '?', ans,
      [up ? iv(null, m) : iv(m, null), up ? iv(-m, null) : iv(null, -m), up ? iv(null, -m) : iv(-m, null)],
      'f\'\'(x) = ' + P([6, -6 * m]) + ', que es ' + (up ? 'positiva' : 'negativa') + ' para x ' + (up ? '>' : '<') + ' ' + mn(m) + '.');
  });

  /* optimización: números */
  genr('der2', function () {
    if (Math.random() < 0.6) {
      var S = 2 * ri(5, 30), h = S / 2;
      return mk('der2', 'Dos números positivos suman ' + S + '. ¿Cuál es el máximo valor de su producto?', String(h * h),
        [String(h * h - 1), String(S * S / 2), String(S), String(S * S)],
        'P(x) = x(' + S + ' − x); P\'(x) = ' + S + ' − 2x = 0 → x = ' + h + '. Los dos valen ' + h + ' y el producto es ' + h * h + '.');
    }
    var n = ri(2, 12), Pq = n * n;
    return mk('der2', 'Dos números positivos tienen producto ' + Pq + '. ¿Cuál es la mínima suma posible?', String(2 * n),
      [String(n), String(Pq + 1), String(Pq / 2 + 2), String(2 * n + 1)],
      'S(x) = x + ⟨' + Pq + '|x⟩; S\'(x) = 1 − ⟨' + Pq + '|x^{2}⟩ = 0 → x = ' + n + '. Los dos valen ' + n + ' y la suma es ' + 2 * n + '.');
  });

  /* optimización: rectángulos */
  genr('der2', function () {
    var v = ri(0, 2), r;
    if (v === 0) {
      var P0 = 4 * ri(3, 20), l = P0 / 4;
      r = mk('der2', 'De todos los rectángulos de perímetro ' + P0 + ' m, ¿qué área tiene el de área máxima?', l * l + ' m²',
        [(l * l - 1) + ' m²', (P0 / 2) * (P0 / 2) + ' m²', P0 * P0 / 8 + ' m²', 2 * l * l + ' m²'],
        'A(x) = x(' + P0 / 2 + ' − x); A\'(x) = 0 → x = ' + l + '. Es un cuadrado de lado ' + l + ' m: área ' + l * l + ' m².');
    } else if (v === 1) {
      var P1 = 4 * ri(3, 20);
      r = mk('der2', 'Un rectángulo tiene perímetro ' + P1 + ' cm. Para que su área sea máxima, la base debe medir', P1 / 4 + ' cm',
        [P1 / 2 + ' cm', P1 / 4 + 1 + ' cm', P1 / 4 - 1 + ' cm', P1 + ' cm'],
        'Base x, altura ' + P1 / 2 + ' − x. A\'(x) = ' + P1 / 2 + ' − 2x = 0 → x = ' + P1 / 4 + ': el cuadrado.');
    } else {
      var L0 = 4 * ri(3, 15), y = L0 / 4, x = L0 / 2;
      r = mk('der2', 'Con ' + L0 + ' m de valla se cerca un terreno rectangular junto a un muro (ese lado no se valla). Área máxima:', x * y + ' m²',
        [y * y + ' m²', 3 * y * y + ' m²', 4 * y * y + ' m²', x * x + ' m²'],
        'Lados x (paralelo al muro) e y: x + 2y = ' + L0 + '. A(y) = (' + L0 + ' − 2y)y; A\'(y) = 0 → y = ' + y + ', x = ' + x + '. Área ' + x * y + ' m².');
      r.p = 1;
    }
    return r;
  });

  /* teorema de Rolle */
  genr('der2', function () {
    var a = ri(-4, 2), b = a + 2 * ri(1, 3), k = ri(-5, 5), c = (a + b) / 2;
    return mk('der2', 'f(x) = ' + P([1, -(a + b), a * b + k]) + ' cumple Rolle en [' + mn(a) + ', ' + mn(b) + ']. El punto c con f\'(c) = 0 es', 'c = ' + mn(c),
      ['c = ' + mn(-c), 'c = ' + mn(a + b), 'c = ' + mn((b - a) / 2), 'c = ' + mn(c + 1)],
      'f(' + mn(a) + ') = f(' + mn(b) + ') = ' + mn(k) + '. f\'(x) = ' + P([2, -(a + b)]) + ' = 0 → c = ' + mn(c) + '.');
  });

  /* teorema del valor medio */
  genr('der2', function () {
    var a = ri(-3, 2), b = a + 2 * ri(1, 3), k = ri(-4, 4);
    var f = function (x) { return x * x + k * x; };
    var m = (f(b) - f(a)) / (b - a);
    if (Math.random() < 0.5) {
      return mk('der2', 'Para f(x) = ' + P([1, k, 0]) + ' en [' + mn(a) + ', ' + mn(b) + '], ⟨f(b) − f(a)|b − a⟩ =', mn(m),
        [mn(f(b) - f(a)), mn(f(b) + f(a)), mn(m + 2)],
        '⟨' + mn(f(b)) + ' − ' + pr(f(a)) + '|' + mn(b) + ' − ' + pr(a) + '⟩ = ⟨' + mn(f(b) - f(a)) + '|' + (b - a) + '⟩ = ' + mn(m) + '.');
    }
    var c = (a + b) / 2;
    return mk('der2', 'Valor medio para f(x) = ' + P([1, k, 0]) + ' en [' + mn(a) + ', ' + mn(b) + ']: el punto c es', 'c = ' + mn(c),
      ['c = ' + mn(-c), 'c = ' + mn(a + b), 'c = ' + mn(m), 'c = ' + mn(c + 1)],
      'Pendiente media ' + mn(m) + '. f\'(c) = 2c' + sg(k).replace(' + 0', '') + ' = ' + mn(m) + ' → c = ' + mn(c) + '.');
  });

  /* velocidad y aceleración */
  genr('der2', function () {
    var a = ri(1, 5), b = ri(0, 9), c = ri(0, 10), t0 = ri(1, 5);
    var s = P([a, b, c]).replace(/x/g, 't'), v = 2 * a * t0 + b, st = a * t0 * t0 + b * t0 + c;
    if (Math.random() < 0.7) {
      return mk('der2', 'La posición de un móvil es s(t) = ' + s + ' (m, s). Su velocidad en t = ' + t0 + ' s es', v + ' m/s',
        [st + ' m/s', 2 * a * t0 + ' m/s', a * t0 + b + ' m/s', v + 2 * a + ' m/s'],
        'v(t) = s\'(t) = ' + P([2 * a, b]).replace(/x/g, 't') + '; v(' + t0 + ') = ' + v + ' m/s.');
    }
    return mk('der2', 'La posición de un móvil es s(t) = ' + s + ' (m, s). Su aceleración es', 2 * a + ' m/s²',
      [a + ' m/s²', v + ' m/s²', '0 m/s²', 4 * a + ' m/s²'],
      'v(t) = ' + P([2 * a, b]).replace(/x/g, 't') + ' y a(t) = v\'(t) = ' + 2 * a + ' m/s².');
  });

  /* interpretación de f'(a) */
  genr('der2', function () {
    var p = nz(-5, 5), k = nz(-9, 9);
    if (Math.random() < 0.5) {
      var ans = k > 0 ? 'Es creciente' : 'Es decreciente';
      return mk('der2', 'Si f\'(' + mn(p) + ') = ' + mn(k) + ', cerca de x = ' + mn(p) + ' la función', ans,
        [k > 0 ? 'Es decreciente' : 'Es creciente', 'Tiene un máximo', 'Tiene un mínimo'],
        'f\'(' + mn(p) + ') ' + (k > 0 ? '> 0' : '< 0') + ': la tangente sube' + (k > 0 ? '' : ' al revés (baja)') + ', así que f es ' + (k > 0 ? 'creciente' : 'decreciente') + ' ahí.');
    }
    return mk('der2', 'Si f\'(' + mn(p) + ') = ' + mn(k) + ', la pendiente de la recta tangente en x = ' + mn(p) + ' es', mn(k),
      [mn(-k), F(-1, k), F(1, k), mn(p)],
      'La derivada en un punto ES la pendiente de la tangente en ese punto.');
  });

  /* criterio de la segunda derivada */
  genr('der2', function () {
    var p = nz(-5, 5), k = nz(-9, 9);
    var T = k < 0 ? 'Un máximo relativo' : 'Un mínimo relativo', O = k < 0 ? 'Un mínimo relativo' : 'Un máximo relativo';
    var r = mk('der2', 'f\'(' + mn(p) + ') = 0 y f\'\'(' + mn(p) + ') = ' + mn(k) + '. En x = ' + mn(p) + ' f tiene', T,
      [O, 'Un punto de inflexión', 'No se puede saber'],
      'f\'\' ' + (k < 0 ? '< 0: la curva es ∩, máximo.' : '> 0: la curva es ∪, mínimo.'));
    return B(r, O);
  });

  /* valor máximo / mínimo */
  genr('der2', function () {
    var p = nz(-5, 5), c = ri(-6, 6);
    if (Math.random() < 0.5) {
      return mk('der2', '¿Cuál es el valor máximo de f(x) = ' + P([-1, 2 * p, c]) + '?', mn(p * p + c),
        [mn(c), mn(c - p * p), mn(p), mn(2 * p * p + c)],
        'f\'(x) = ' + P([-2, 2 * p]) + ' = 0 → x = ' + mn(p) + '; f(' + mn(p) + ') = ' + mn(p * p + c) + '.');
    }
    return mk('der2', '¿Cuál es el valor mínimo de f(x) = ' + P([1, -2 * p, c]) + '?', mn(c - p * p),
      [mn(c), mn(c + p * p), mn(p), mn(c - 2 * p * p)],
      'f\'(x) = ' + P([2, -2 * p]) + ' = 0 → x = ' + mn(p) + '; f(' + mn(p) + ') = ' + mn(c - p * p) + '.');
  });

  /* tangente paralela a una recta */
  genr('der2', function () {
    var b = ri(-6, 6), c = ri(-5, 5), m, n = ri(-5, 5);
    do { m = ri(-8, 8); } while ((m - b) % 2 !== 0 || m === 0);
    var x0 = (m - b) / 2;
    return mk('der2', '¿En qué punto la tangente a f(x) = ' + P([1, b, c]) + ' es paralela a y = ' + P([m, n]) + '?', 'x = ' + mn(x0),
      ['x = ' + mn((m + b) / 2), 'x = ' + mn(m - b), 'x = ' + mn(-x0), 'x = ' + mn(x0 + 1)],
      'Paralela = misma pendiente: f\'(x) = ' + P([2, b]) + ' = ' + mn(m) + ' → x = ' + mn(x0) + '.');
  });

  add('der2', "Si f'(a) = 0, entonces en x = a", 'La tangente es horizontal', ['Hay seguro un máximo', 'Hay seguro un mínimo', 'f(a) = 0'],
    'f\'(a) = 0 solo dice que la pendiente es 0. Puede ser máximo, mínimo o ninguno (como x^{3} en 0).');
  add('der2', 'f(x) = x^{3} en x = 0 tiene', 'Un punto de inflexión', ['Un máximo relativo', 'Un mínimo relativo', 'Una discontinuidad'],
    'f\'(0) = 0, pero f\'(x) = 3x^{2} no cambia de signo: no es extremo. f\'\' sí cambia de signo: inflexión.');
  add('der2', 'Hipótesis del teorema de Rolle en [a, b]', 'Continua, derivable y f(a) = f(b)', ['Continua y f(a)·f(b) < 0', 'Derivable y f(a) = 0', "Continua y f'(a) = f'(b)"],
    'Continua en [a, b], derivable en (a, b) y f(a) = f(b). Entonces existe c ∈ (a, b) con f\'(c) = 0.');
  add('der2', 'El teorema del valor medio asegura un c ∈ (a, b) con', "f'(c) = ⟨f(b) − f(a)|b − a⟩", ['f(c) = 0', "f'(c) = 0", 'f(c) = ⟨f(a) + f(b)|2⟩'],
    'Hay un punto donde la tangente es paralela a la cuerda que une los extremos.');
  add('der2', "Si f''(x) > 0 en un intervalo, f es allí", 'Cóncava hacia arriba (∪)', ['Cóncava hacia abajo (∩)', 'Creciente', 'Positiva'],
    'f\'\' > 0 significa que f\' crece: la curva se abre hacia arriba, forma ∪.');
  add('der2', "Si s(t) es la posición de un móvil, s'(t) es", 'Su velocidad instantánea', ['Su aceleración', 'La distancia recorrida', 'Su velocidad media'],
    'La derivada de la posición es la velocidad; la derivada de la velocidad es la aceleración.');
  add('der2', "Si f'(x) > 0 en (a, b), entonces en (a, b) f", 'Es creciente', ['Es positiva', 'Es cóncava hacia arriba', 'Tiene un máximo'],
    'El signo de f\' indica crecimiento, no el signo de f.');
  barb("Si f'(x) > 0 en (a, b), entonces en (a, b) f", 'Es positiva');
  add('der2', 'De todos los rectángulos con el mismo perímetro, el de mayor área es', 'El cuadrado', ['El más alargado', 'El de base doble que la altura', 'Todos tienen igual área'],
    'Con perímetro 2p, A(x) = x(p − x) es máxima en x = ⟨p|2⟩: base y altura iguales.');
  add('der2', 'Un punto de inflexión es un punto donde', 'Cambia la concavidad', ['La función vale 0', "f'(x) = 0 siempre", 'Cambia el crecimiento'],
    'En la inflexión la curva pasa de ∪ a ∩ o al revés. Si cambia el crecimiento es un extremo.');

  /* =====================================================================
     fl12 — Flash: límites
     ===================================================================== */
  var FL = [
    function () { var a = nz(-5, 5), k = nz(-9, 9); return { q: 'lim_{x→' + mn(a) + '} (x' + sg(k) + ') = ?', a: mn(a + k), w: [mn(a - k), mn(k), PI], bar: [], e: 'Polinomio: basta sustituir x = ' + mn(a) + '.' }; },
    function () { var a = nz(-4, 4); return { q: 'lim_{x→' + mn(a) + '} x^{2} = ?', a: String(a * a), w: [mn(-a * a), mn(2 * a), PI], bar: a < 0 ? [mn(-a * a)] : [], e: 'Se sustituye: ' + sq(a) + ' = ' + a * a + '.' }; },
    function () { var a = ri(2, 9), b; do { b = ri(2, 9); } while (b === a); return { q: 'lim_{x→+∞} ⟨' + a + 'x^{2} + 1|' + b + 'x^{2} − 3⟩ = ?', a: F(a, b), w: ['1', PI, F(b, a), '0'], bar: ['1'], e: 'Mismo grado: cociente de coeficientes principales.' }; },
    function () { var k = ri(2, 9); return { q: 'lim_{x→+∞} ⟨' + k + 'x|x^{2} + 1⟩ = ?', a: '0', w: [String(k), PI, '1'], bar: [], e: 'El denominador tiene más grado: tiende a 0.' }; },
    function () { var k = ri(1, 9); return { q: 'lim_{x→+∞} ⟨x^{3}|x^{2} + ' + k + '⟩ = ?', a: PI, w: ['0', '1', MI], bar: [], e: 'El numerador tiene más grado: tiende a +∞.' }; },
    function () { var k = ri(2, 9); return { q: '⟨' + k + '|∞⟩ = ?', a: '0', w: ['∞', String(k), 'Indeterminación'], bar: ['∞'], e: 'Un número fijo entre algo enorme se hace 0.' }; },
    function () { var k = ri(2, 9), s = pick(['+', '−']); return { q: '⟨' + k + '|0^{' + s + '}⟩ = ?', a: s === '+' ? PI : MI, w: ['0', s === '+' ? MI : PI, String(k)], bar: ['0'], e: 'Un número entre algo muy pequeño ' + (s === '+' ? 'positivo' : 'negativo') + ' da ' + (s === '+' ? PI : MI) + '.' }; },
    function () { return pick([
      { q: 'lim_{x→+∞} e^{x} = ?', a: PI, w: ['0', '1', 'e'], bar: [], e: 'La exponencial de base e > 1 crece sin límite.' },
      { q: 'lim_{x→−∞} e^{x} = ?', a: '0', w: [MI, '1', PI], bar: [MI], e: 'e^{x} es siempre positiva y tiende a 0 por la izquierda (asíntota y = 0).' },
      { q: 'lim_{x→+∞} e^{−x} = ?', a: '0', w: [MI, PI, '1'], bar: [MI], e: 'e^{−x} = ⟨1|e^{x}⟩ → 0.' }]); },
    function () { return pick([
      { q: 'lim_{x→+∞} ln x = ?', a: PI, w: ['0', '1', 'e'], bar: [], e: 'ln x crece sin límite (despacio, pero sin tope).' },
      { q: 'lim_{x→0^{+}} ln x = ?', a: MI, w: ['0', PI, '1'], bar: ['0'], e: 'Cerca de 0 el logaritmo se hunde hacia −∞.' }]); },
    function () { var b = pick([2, 3, 5]); return pick([
      { q: 'lim_{x→+∞} (⟨1|' + b + '⟩)^{x} = ?', a: '0', w: [PI, '1', '⟨1|' + b + '⟩'], bar: [], e: 'Base entre 0 y 1: las potencias se hacen cada vez más pequeñas.' },
      { q: 'lim_{x→+∞} ' + b + '^{x} = ?', a: PI, w: ['0', String(b), '1'], bar: [], e: 'Base mayor que 1: crece sin límite.' },
      { q: 'lim_{x→−∞} ' + b + '^{x} = ?', a: '0', w: [MI, PI, '1'], bar: [MI], e: b + '^{x} es siempre positiva: tiende a 0.' }]); },
    function () { return pick([
      { q: '∞ + ∞ = ?', a: '∞', w: ['0', 'Indeterminación', '2'], bar: ['0'], e: 'Sumar dos cantidades enormes da algo enorme.' },
      { q: '∞ · ∞ = ?', a: '∞', w: ['Indeterminación', '1', '0'], bar: [], e: 'El producto de cantidades enormes es enorme.' },
      { q: '∞ − ∞ = ?', a: 'Indeterminación', w: ['0', '∞', '1'], bar: ['0'], e: 'Depende de cuál crezca más deprisa: puede dar cualquier cosa.' },
      { q: '⟨∞|∞⟩ = ?', a: 'Indeterminación', w: ['1', '0', '∞'], bar: ['1'], e: 'Depende de los grados: puede dar cualquier cosa.' },
      { q: '1^{∞} = ?', a: 'Indeterminación', w: ['1', '∞', '0'], bar: ['1'], e: 'Es una indeterminación; suele dar una potencia de e.' }]); },
    function () { var n = ri(2, 5); return { q: 'lim_{x→−∞} x^{' + n + '} = ?', a: n % 2 ? MI : PI, w: [n % 2 ? PI : MI, '0', '1'], bar: [], e: 'Exponente ' + (n % 2 ? 'impar: conserva el signo menos.' : 'par: el signo desaparece.') }; },
    function () { var k = nz(-4, 4); return { q: 'lim_{x→+∞} (1 ' + (k < 0 ? '−' : '+') + ' ⟨' + Math.abs(k) + '|x⟩)^{x} = ?', a: ep(k), w: ['1', PI, ep(-k)], bar: ['1'], e: 'lim (1 + ⟨k|x⟩)^{x} = e^{k}.' }; },
    function () { return pick([
      { q: 'lim_{x→0} ⟨sen x|x⟩ = ?', a: '1', w: ['0', PI, 'No existe'], bar: ['0'], e: 'Límite fundamental: sen x ≈ x cerca de 0.' },
      { q: 'lim_{x→0} ⟨e^{x} − 1|x⟩ = ?', a: '1', w: ['0', 'e', PI], bar: ['0'], e: 'Por L\'Hôpital: ⟨e^{x}|1⟩ → 1.' }]); },
    function () { var k = ri(2, 9); return { q: 'lim_{x→+∞} ⟨' + k + '|x⟩ = ?', a: '0', w: [String(k), PI, '1'], bar: [], e: 'Un número fijo entre algo que crece sin límite tiende a 0.' }; }
  ];
  FL.forEach(function (f) { fl('fl12', f); });
})();
