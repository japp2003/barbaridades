/* Integrales, matrices, determinantes, sistemas (Rouché, Cramer) y flash fl10/fl11 — 2.º Bachillerato */
(function () {
  'use strict';

  /* ---------- ayudas locales ---------- */
  var SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
  function N(x) { return mn(x); }
  function P(x) { return x < 0 ? '(' + mn(x) + ')' : mn(x); }
  /* coeficiente n/d delante de un cuerpo (con espacio si es número) */
  function cf(n, d, body) {
    d = d || 1;
    var g = gcd(Math.abs(n), Math.abs(d)) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; }
    var s = n < 0 ? '−' : '', ab = Math.abs(n);
    if (d === 1 && ab === 1) return s + body;
    return s + (d === 1 ? String(ab) : '⟨' + ab + '|' + d + '⟩') + ' ' + body;
  }
  /* polinomio con coeficientes racionales: [[num, den, potencia], ...] */
  function PS(terms) {
    var out = '';
    terms.forEach(function (t) {
      var n = t[0], d = t[1], p = t[2];
      if (n === 0) return;
      var g = gcd(Math.abs(n), Math.abs(d)) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; }
      var ab = Math.abs(n), xs = p === 0 ? '' : p === 1 ? 'x' : 'x^{' + p + '}';
      var c = d === 1 ? (ab === 1 && p > 0 ? '' : String(ab)) : '⟨' + ab + '|' + d + '⟩';
      var body = c + xs;
      if (out === '') out = (n < 0 ? '−' : '') + body;
      else out += ' ' + (n < 0 ? '−' : '+') + ' ' + body;
    });
    return out || '0';
  }
  function pv(c, x) { var s = 0; c.forEach(function (k) { s = s * x + k; }); return s; }
  function el(x) { return typeof x === 'number' ? N(x) : String(x); }
  function MX(A) { return '⟦' + A.map(function (r) { return r.map(el).join(', '); }).join('; ') + '⟧'; }
  function DT(A) { return '⟦|' + A.map(function (r) { return r.map(el).join(', '); }).join('; ') + '|⟧'; }
  function mul(A, B) {
    return A.map(function (r) { return B[0].map(function (_, j) { var s = 0; r.forEach(function (x, k) { s += x * B[k][j]; }); return s; }); });
  }
  function tr(A) { return A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); }); }
  function d2(A) { return A[0][0] * A[1][1] - A[0][1] * A[1][0]; }
  function d3(A) {
    return A[0][0] * A[1][1] * A[2][2] + A[0][1] * A[1][2] * A[2][0] + A[0][2] * A[1][0] * A[2][1]
      - A[0][2] * A[1][1] * A[2][0] - A[0][0] * A[1][2] * A[2][1] - A[0][1] * A[1][0] * A[2][2];
  }
  function mat(m, n, a, b) { var A = []; for (var i = 0; i < m; i++) { A.push([]); for (var j = 0; j < n; j++) A[i].push(ri(a, b)); } return A; }
  function cp(A) { return A.map(function (r) { return r.slice(); }); }
  function sub(A, i, j) { return A.filter(function (_, r) { return r !== i; }).map(function (r) { return r.filter(function (_, c) { return c !== j; }); }); }
  /* ecuación lineal: coeficientes y variables */
  function lin(c, vars) {
    var out = '';
    c.forEach(function (k, i) {
      if (k === 0) return;
      var ab = Math.abs(k), body = (ab === 1 ? '' : ab) + vars[i];
      if (out === '') out = (k < 0 ? '−' : '') + body;
      else out += ' ' + (k < 0 ? '−' : '+') + ' ' + body;
    });
    return out || '0';
  }
  function sys(A, b, vars) { return A.map(function (r, i) { return lin(r, vars) + ' = ' + N(b[i]); }).join('; '); }
  function bar1(r, x) { if (r.w.indexOf(x) >= 0) barb(r.q, x); return r; }
  function xp(n) { return n === 1 ? 'x' : 'x^{' + n + '}'; }

  /* =====================================================================
     int1 — Primitivas
     ===================================================================== */
  var T = 'int1';

  genr(T, function () {           /* ∫ k x^n */
    var n = ri(2, 5), c = nz(-4, 4), k = c * (n + 1);
    var q = '∫ ' + PS([[k, 1, n]]) + ' dx =';
    var der = PS([[k * n, 1, n - 1]]) + ' + C';
    var r = mk(T, q, PS([[c, 1, n + 1]]) + ' + C',
      [PS([[k, 1, n + 1]]) + ' + C', der, PS([[c, 1, n]]) + ' + C', PS([[k, n, n + 1]]) + ' + C'],
      'Se sube un grado y se divide por el nuevo exponente: ' + N(k) + '/' + (n + 1) + ' = ' + N(c) + '.');
    return bar1(r, der);
  });

  genr(T, function () {           /* polinomio de grado 2 */
    var a = pick([1, 3, 6, -3, -6, 9]), b = pick([2, 4, -2, -4, 6, 1, -1]), c = nz(-6, 6);
    var q = '∫ (' + poly([a, b, c]) + ') dx =';
    return mk(T, q, PS([[a, 3, 3], [b, 2, 2], [c, 1, 1]]) + ' + C',
      [PS([[a, 1, 3], [b, 1, 2], [c, 1, 1]]) + ' + C', PS([[a, 3, 3], [b, 2, 2]]) + ' + C' , PS([[2 * a, 1, 1], [b, 1, 0]]) + ' + C', PS([[a, 2, 3], [b, 1, 2], [c, 1, 1]]) + ' + C'],
      'Término a término: x^{2} → ⟨x^{3}|3⟩, x → ⟨x^{2}|2⟩ y la constante ' + N(c) + ' → ' + N(c) + 'x.');
  });

  genr(T, function () {           /* k/(x + a) */
    var k = ri(2, 9), s = pick([0, 0, nz(-6, 6)]);
    var den = s === 0 ? 'x' : poly([1, s]);
    var q = '∫ ⟨' + k + '|' + den + '⟩ dx =';
    var der = '−⟨' + k + '|' + (s === 0 ? 'x^{2}' : '(' + den + ')^{2}') + '⟩ + C';
    var w = [der, 'ln|' + den + '| + C', 'ln|' + k + (s === 0 ? 'x' : '(' + den + ')') + '| + C', k + '(' + den + ') + C'];
    if (s !== 0) w.unshift(k + ' ln|x| + C');
    var r = mk(T, q, k + ' ln|' + den + '| + C', w,
      'La derivada de ln|' + den + '| es ⟨1|' + den + '⟩; el ' + k + ' sale fuera de la integral.');
    return bar1(r, der);
  });

  genr(T, function () {           /* m e^{kx} */
    var k = pick([2, 3, 4, 5, -2, -3]), c = nz(-3, 3), m = c * k * pick([1, 1, 0]) || 1;
    var ex = 'e^{' + (k === -1 ? '−' : N(k)) + 'x}';
    var q = '∫ ' + (m === 1 ? '' : N(m) + ' ') + ex + ' dx =';
    var pw = '⟨e^{' + N(k) + 'x + 1}|' + N(k) + 'x + 1⟩ + C';
    var r = mk(T, q, cf(m, k, ex) + ' + C',
      [cf(m * k, 1, ex) + ' + C', cf(m, 1, ex) + ' + C', cf(-m, k, ex) + ' + C', pw],
      'La derivada de ' + ex + ' es ' + N(k) + ex + ', así que hay que dividir entre ' + N(k) + '.');
    return bar1(r, pw);
  });

  genr(T, function () {           /* trigonométricas k·sen(mx), k·cos(mx) */
    var m = ri(1, 4), c = nz(-3, 3), k = c * m, isS = Math.random() < 0.5;
    function fn(name) { return m === 1 ? name + ' x' : name + '(' + m + 'x)'; }
    var f = fn(isS ? 'sen' : 'cos'), g = fn(isS ? 'cos' : 'sen'), sg = isS ? -1 : 1;
    var q = '∫ ' + cf(k, 1, f) + ' dx =';
    return mk(T, q, cf(sg * c, 1, g) + ' + C',
      [cf(-sg * c, 1, g) + ' + C', cf(sg * k * m, 1, g) + ' + C', cf(sg * k, 1, g) + ' + C', cf(c, 1, f) + ' + C', cf(-sg * k * m, 1, g) + ' + C'],
      isS ? 'Una primitiva de sen(mx) es −⟨1|m⟩cos(mx): ojo con el signo menos y con dividir entre ' + m + '.'
          : 'Una primitiva de cos(mx) es ⟨1|m⟩sen(mx): hay que dividir entre ' + m + '.');
  });

  genr(T, function () {           /* f'·f^n */
    var p = pick([2, 3]), c = nz(-5, 5), n = ri(2, 5);
    var inner = '(' + poly(p === 2 ? [1, 0, c] : [1, 0, 0, c]) + ')';
    var fp = p === 2 ? '2x' : '3x^{2}';
    var q = '∫ ' + fp + inner + '^{' + n + '} dx =';
    var wrongOuter = '⟨' + (p === 2 ? 'x^{2}' : 'x^{3}') + inner + '^{' + (n + 1) + '}|' + (n + 1) + '⟩ + C';
    var r = mk(T, q, '⟨' + inner + '^{' + (n + 1) + '}|' + (n + 1) + '⟩ + C',
      [inner + '^{' + (n + 1) + '} + C', wrongOuter, n + inner + '^{' + (n - 1) + '} + C', '⟨' + inner + '^{' + (n + 1) + '}|' + (p * (n + 1)) + '⟩ + C'],
      'Es del tipo f′·f^{n}: ' + fp + ' es justo la derivada de lo de dentro, así que da ⟨f^{n+1}|n+1⟩.');
    return bar1(r, wrongOuter);
  });

  genr(T, function () {           /* f'/f */
    var b = nz(-6, 6), c = nz(-6, 6), k = pick([1, 1, 2, 3]);
    var num = k === 1 ? poly([2, b]) : poly([2 * k, b * k]), den = poly([1, b, c]);
    var q = '∫ ⟨' + num + '|' + den + '⟩ dx =';
    var a = (k === 1 ? '' : k + ' ') + 'ln|' + den + '| + C';
    return mk(T, q, a,
      ['ln|' + num + '| + C', '−⟨1|(' + den + ')^{2}⟩ + C', '(' + num + ') ln|' + den + '| + C', (k === 1 ? '2 ' : (2 * k) + ' ') + 'ln|' + den + '| + C'],
      'El numerador es ' + (k === 1 ? '' : k + ' veces ') + 'la derivada del denominador: tipo ⟨f′|f⟩ → ln|f|.');
  });

  genr(T, function () {           /* f'·e^f */
    var v = pick([2, 3, 4, 0]);
    var q, a, w;
    if (v === 0) {
      q = '∫ cos x · e^{sen x} dx ='; a = 'e^{sen x} + C';
      w = ['e^{cos x} + C', 'sen x · e^{sen x} + C', '−e^{sen x} + C', 'e^{sen x} · cos x + C'];
    } else {
      var fp = v === 2 ? '2x' : v + 'x^{' + (v - 1) + '}', ex = 'e^{x' + SUP[v] + '}';
      q = '∫ ' + fp + ' · ' + ex + ' dx ='; a = ex + ' + C';
      w = ['x^{' + v + '} · ' + ex + ' + C', fp + ' · ' + ex + ' + C', '⟨' + ex + '|' + v + '⟩ + C', '⟨e^{x' + SUP[v] + ' + 1}|x^{' + v + '} + 1⟩ + C'];
    }
    var r = mk(T, q, a, w, 'Tipo f′·e^{f}: lo que multiplica a la exponencial es la derivada del exponente, así que la primitiva es e^{f} + C.');
    return bar1(r, w[3]);
  });

  genr(T, function () {           /* primitiva por un punto */
    var a = nz(-2, 3), b = ri(-5, 5), x0 = nz(-2, 3), y0 = ri(-5, 9);
    var F0 = a * x0 * x0 + b * x0, C = y0 - F0;
    var q = 'Primitiva de f(x) = ' + poly([2 * a, b]) + ' que pasa por (' + N(x0) + ', ' + N(y0) + '):';
    return mk(T, q, PS([[a, 1, 2], [b, 1, 1], [C, 1, 0]]),
      [PS([[a, 1, 2], [b, 1, 1], [y0, 1, 0]]), PS([[a, 1, 2], [b, 1, 1], [y0 + F0, 1, 0]]), PS([[a, 1, 2], [b, 1, 1], [-C, 1, 0]]), PS([[2 * a, 1, 2], [b, 1, 1], [y0 - 2 * a * x0 * x0 - b * x0, 1, 0]])],
      'F(x) = ' + PS([[a, 1, 2], [b, 1, 1]]) + ' + C; F(' + N(x0) + ') = ' + N(F0) + ' + C = ' + N(y0) + ' → C = ' + N(C) + '.');
  });

  genr(T, function () {           /* por partes: qué tomar como u */
    var k = pick([2, 3, 5]);
    var L = [
      ['x e^{x}', 'u = x', ['u = e^{x}', 'u = x e^{x}', 'u = 1']],
      ['x e^{' + k + 'x}', 'u = x', ['u = e^{' + k + 'x}', 'u = ' + k + 'x', 'u = x e^{' + k + 'x}']],
      ['x sen x', 'u = x', ['u = sen x', 'u = cos x', 'u = x sen x']],
      ['x cos x', 'u = x', ['u = cos x', 'u = sen x', 'u = x cos x']],
      ['x ln x', 'u = ln x', ['u = x', 'u = ⟨1|x⟩', 'u = x ln x']],
      ['x^{2} ln x', 'u = ln x', ['u = x^{2}', 'u = ⟨1|x⟩', 'u = 2x']],
      ['ln x', 'u = ln x, dv = dx', ['u = 1, dv = ln x dx', 'u = x, dv = ln x dx', 'u = ⟨1|x⟩, dv = dx']]
    ];
    var it = pick(L);
    return mk(T, 'Por partes ∫ ' + it[0] + ' dx: ¿qué tomas como u?', it[1], it[2],
      'Regla ALPES (arcos, logaritmos, polinomios, exponenciales, senos): u es lo que se simplifica al derivar; dv lo que se integra fácil.');
  });

  genr(T, function () {           /* cambio de variable adecuado */
    var L = [
      ['cos x · e^{sen x}', 't = sen x', ['t = cos x', 't = x', 't = e^{x}']],
      ['⟨ln x|x⟩', 't = ln x', ['t = x', 't = x^{2}', 't = ⟨1|x⟩']],
      ['x(x^{2} + 1)^{5}', 't = x^{2} + 1', ['t = x', 't = x^{5}', 't = 5x']],
      ['sen x · cos^{3} x', 't = cos x', ['t = sen x', 't = x', 't = tg x']],
      ['⟨2x|√{x^{2} + 1}⟩', 't = x^{2} + 1', ['t = 2x', 't = x', 't = ⟨1|x⟩']],
      ['⟨(ln x)^{2}|x⟩', 't = ln x', ['t = x^{2}', 't = x', 't = ⟨1|x⟩']]
    ];
    var it = pick(L);
    return mk(T, '¿Qué cambio de variable conviene en ∫ ' + it[0] + ' dx?', it[1], it[2],
      'Se llama t a la función cuya derivada aparece multiplicando: así dt sustituye al resto del integrando.');
  });

  genr(T, function () {           /* otra primitiva (constante) */
    var a = nz(-4, 5), b = ri(-6, 6), c = nz(-8, 8), c2;
    do { c2 = ri(-9, 9); } while (c2 === c);
    var q = 'F(x) = ' + poly([a, b, c]) + ' es primitiva de f. También lo es:';
    return mk(T, q, poly([a, b, c2]),
      [poly([2 * a, b]), poly([2 * a, 2 * b, 2 * c]), poly([a, -b, c]), poly([a, b + 1, c])],
      'Dos primitivas de la misma función solo se diferencian en una constante: basta cambiar el término independiente.');
  });

  genr(T, function () {           /* (ax+b)^n */
    var a = ri(2, 3), b = nz(-5, 5), n = ri(2, 4), in1 = '(' + poly([a, b]) + ')';
    var q = '∫ ' + in1 + '^{' + n + '} dx =';
    return mk(T, q, '⟨' + in1 + '^{' + (n + 1) + '}|' + (a * (n + 1)) + '⟩ + C',
      ['⟨' + in1 + '^{' + (n + 1) + '}|' + (n + 1) + '⟩ + C', in1 + '^{' + (n + 1) + '} + C', (a * n) + in1 + '^{' + (n - 1) + '} + C', '⟨' + a + in1 + '^{' + (n + 1) + '}|' + (n + 1) + '⟩ + C'],
      'Falta la derivada de dentro (' + a + '): se divide entre ' + a + ' · ' + (n + 1) + ' = ' + (a * (n + 1)) + '.');
  });

  genr(T, function () {           /* k / x^n */
    var n = ri(2, 4), c = ri(1, 4), k = c * (n - 1);
    var q = '∫ ⟨' + k + '|x^{' + n + '}⟩ dx =';
    var lnw = k + ' ln|x^{' + n + '}| + C';
    if (k === 1) lnw = 'ln|x^{' + n + '}| + C';
    var r = mk(T, q, '−⟨' + c + '|' + xp(n - 1) + '⟩ + C',
      ['⟨' + c + '|' + xp(n - 1) + '⟩ + C', lnw, '−⟨' + (k * n) + '|x^{' + (n + 1) + '}⟩ + C', '−⟨' + k + '|' + xp(n - 1) + '⟩ + C'],
      'Se escribe ' + (k === 1 ? '' : k) + 'x^{−' + n + '}: al integrar queda ' + k + '·⟨x^{−' + (n - 1) + '}|−' + (n - 1) + '⟩ = −⟨' + c + '|' + xp(n - 1) + '⟩.');
    return bar1(r, lnw);
  });

  add(T, '∫ x e^{x} dx =', '(x − 1)e^{x} + C', ['⟨x^{2}|2⟩ e^{x} + C', 'x e^{x} + C', '(x + 1)e^{x} + C'],
    'Por partes con u = x, dv = e^{x}dx: x e^{x} − ∫ e^{x} dx = (x − 1)e^{x} + C.');
  barb('∫ x e^{x} dx =', '⟨x^{2}|2⟩ e^{x} + C');
  add(T, '∫ ln x dx =', 'x ln x − x + C', ['⟨1|x⟩ + C', 'x ln x + C', '⟨(ln x)^{2}|2⟩ + C'],
    'Por partes con u = ln x, dv = dx: x ln x − ∫ x · ⟨1|x⟩ dx = x ln x − x + C.');
  barb('∫ ln x dx =', '⟨1|x⟩ + C');
  add(T, '∫ x cos x dx =', 'x sen x + cos x + C', ['x sen x − cos x + C', '⟨x^{2}|2⟩ sen x + C', '−x sen x + cos x + C'],
    'Por partes: u = x, dv = cos x dx → x sen x − ∫ sen x dx = x sen x + cos x + C.');
  add(T, 'Fórmula de integración por partes:', '∫ u dv = uv − ∫ v du', ['∫ u dv = uv + ∫ v du', '∫ u dv = uv − ∫ u dv', '∫ u dv = u′v′'],
    'Sale de la derivada de un producto: (uv)′ = u′v + uv′.');
  add(T, '¿Por qué se suma + C en una primitiva?', 'La derivada de una constante es 0', ['Porque C es el área', 'Para que la integral sea positiva', 'Es opcional y no significa nada'],
    'Si F es primitiva de f, F + C también lo es para cualquier C, porque (F + C)′ = F′ = f.');
  add(T, '∫ f(x) dx = F(x) + C significa que…', 'F′(x) = f(x)', ['f′(x) = F(x)', 'F(x) = f(x) · x', 'F′(x) = f′(x)'],
    'Integrar es la operación inversa de derivar: la derivada de la primitiva es la función.');
  add(T, '∫ ⟨cos x|sen x⟩ dx =', 'ln|sen x| + C', ['ln|cos x| + C', '−⟨1|sen^{2} x⟩ + C', '⟨sen x|cos x⟩ + C'],
    'cos x es la derivada de sen x: tipo ⟨f′|f⟩ → ln|f| + C.');
  add(T, '∫ ⟨1|1 + x^{2}⟩ dx =', 'arctg x + C', ['ln(1 + x^{2}) + C', 'arcsen x + C', 'x + ⟨1|x⟩ + C'],
    'Es inmediata: (arctg x)′ = ⟨1|1 + x^{2}⟩. No es un logaritmo porque el numerador no es 2x.');
  add(T, '∫ ⟨1|cos^{2} x⟩ dx =', 'tg x + C', ['−tg x + C', 'ln|cos^{2} x| + C', '⟨1|sen^{2} x⟩ + C'],
    'Inmediata: (tg x)′ = ⟨1|cos^{2} x⟩ = 1 + tg^{2} x.');
  add(T, '∫ 0 dx =', 'C (una constante)', ['0', 'x + C', 'No existe'],
    'Las funciones con derivada 0 son las constantes.');

  /* =====================================================================
     int2 — Integral definida y áreas
     ===================================================================== */
  T = 'int2';

  genr(T, function () {           /* ∫_0^b k x^n */
    var n = ri(1, 3), b = ri(1, n === 3 ? 2 : 3), c = nz(-3, 3), k = c * (n + 1);
    var q = '∫_{0}^{' + b + '} ' + PS([[k, 1, n]]) + ' dx =';
    var der = N(k * n * Math.pow(b, n - 1));
    var r = mk(T, q, N(c * Math.pow(b, n + 1)),
      [N(k * Math.pow(b, n + 1)), der, N(c * Math.pow(b, n)), N(-c * Math.pow(b, n + 1))],
      'Primitiva ' + PS([[c, 1, n + 1]]) + '; Barrow: F(' + b + ') − F(0) = ' + N(c * Math.pow(b, n + 1)) + '.');
    return bar1(r, der);
  });

  genr(T, function () {           /* ∫_a^b (mx + q) */
    var m = pick([2, 4, -2, 6, -4]), q0 = nz(-5, 5), a = ri(-2, 1), b = a + ri(1, 3);
    function F(x) { return m / 2 * x * x + q0 * x; }
    var v = F(b) - F(a);
    var q = '∫_{' + N(a) + '}^{' + N(b) + '} (' + poly([m, q0]) + ') dx =';
    return mk(T, q, N(v), [N(F(b)), N(F(a) - F(b)), N(F(b) + F(a)), N(pv([m, q0], b) - pv([m, q0], a))],
      'F(x) = ' + PS([[m, 2, 2], [q0, 1, 1]]) + '; F(' + N(b) + ') − F(' + N(a) + ') = ' + N(F(b)) + ' − (' + N(F(a)) + ') = ' + N(v) + '.');
  });

  genr(T, function () {           /* ∫_a^b x^2 */
    var a = ri(-2, 1), b = ri(a + 1, 3);
    var q = '∫_{' + N(a) + '}^{' + N(b) + '} x^{2} dx =';
    var A = b * b * b - a * a * a;
    return mk(T, q, f_fr(A, 3), [N(A), f_fr(b * b - a * a, 2), f_fr(b * b * b, 3), f_fr(Math.pow(b - a, 3), 3), f_fr(-A, 3)],
      '[⟨x^{3}|3⟩] de ' + N(a) + ' a ' + N(b) + ': ⟨' + N(b * b * b) + ' − (' + N(a * a * a) + ')|3⟩ = ' + f_fr(A, 3) + '.');
  });

  genr(T, function () {           /* ∫_a^a f = 0 */
    var c = [nz(-3, 3), ri(-5, 5), nz(-6, 6)], a = nz(-3, 4), fa = pv(c, a);
    var q = '∫_{' + N(a) + '}^{' + N(a) + '} (' + poly(c) + ') dx =';
    return mk(T, q, '0', [N(fa), N(2 * fa), 'No se puede calcular', N(a)],
      'Si los dos límites son iguales, la integral vale 0 (no hay intervalo).');
  });

  genr(T, function () {           /* cambiar límites */
    var a = ri(-2, 2), b = a + ri(1, 4), k = nz(-9, 12);
    var q = 'Si ∫_{' + N(a) + '}^{' + N(b) + '} f(x) dx = ' + N(k) + ', ∫_{' + N(b) + '}^{' + N(a) + '} f(x) dx =';
    var r = mk(T, q, N(-k), [N(k), f_fr(1, k), '0', N(2 * k)],
      'Al intercambiar los límites la integral cambia de signo.');
    return bar1(r, N(k));
  });

  genr(T, function () {           /* aditividad y linealidad */
    var p = nz(-6, 8), s = nz(-6, 8);
    if (Math.random() < 0.5) {
      var q = 'Si ∫_{0}^{2} f = ' + N(p) + ' y ∫_{2}^{5} f = ' + N(s) + ', ∫_{0}^{5} f =';
      return mk(T, q, N(p + s), [N(p - s), N(s - p), N(p * s)],
        'Los intervalos se encadenan: ∫_{0}^{5} = ∫_{0}^{2} + ∫_{2}^{5}.');
    }
    var m = ri(2, 4);
    var q2 = 'Si ∫_{1}^{3} f = ' + N(p) + ' y ∫_{1}^{3} g = ' + N(s) + ', ∫_{1}^{3} (' + m + 'f − g) =';
    return mk(T, q2, N(m * p - s), [N(m * p + s), N(m * (p - s)), N(p - s), N(m * p * s)],
      'La integral es lineal: ' + m + '·' + P(p) + ' − (' + N(s) + ') = ' + N(m * p - s) + '.');
  });

  genr(T, function () {           /* área parábola k^2 − x^2 con OX */
    var k = ri(1, 3), k3 = k * k * k;
    var q = 'Área del recinto limitado por y = ' + (k * k) + ' − x^{2} y el eje OX:';
    var r = mk(T, q, f_fr(4 * k3, 3), [f_fr(2 * k3, 3), f_fr(8 * k3, 3), N(2 * k3), f_fr(-4 * k3, 3)],
      'Corta en x = ±' + k + '. ∫_{−' + k + '}^{' + k + '} (' + (k * k) + ' − x^{2}) dx = ' + (2 * k3) + ' − ' + f_fr(2 * k3, 3) + ' = ' + f_fr(4 * k3, 3) + '.');
    return bar1(r, f_fr(-4 * k3, 3));
  });

  genr(T, function () {           /* área entre y = x^2 e y = mx */
    var m = ri(1, 6), m3 = m * m * m;
    var q = 'Área entre la parábola y = x^{2} y la recta y = ' + (m === 1 ? '' : m) + 'x:';
    var neg = f_fr(-m3, 6);
    var r = mk(T, q, f_fr(m3, 6), [f_fr(m3, 3), f_fr(m3, 2), neg],
      'Se cortan en x = 0 y x = ' + m + '. ∫_{0}^{' + m + '} (' + (m === 1 ? '' : m) + 'x − x^{2}) dx = ' + f_fr(m3, 2) + ' − ' + f_fr(m3, 3) + ' = ' + f_fr(m3, 6) + '.');
    r.p = 1;
    return bar1(r, neg);
  });

  genr(T, function () {           /* signo: integral vs área bajo el eje */
    var k = ri(1, 6), k2 = k * k, f = 'x − ' + k;
    if (Math.random() < 0.5) {
      var q = '∫_{0}^{' + k + '} (' + f + ') dx =';
      return mk(T, q, f_fr(-k2, 2), [f_fr(k2, 2), N(-k2), '0', N(k2)],
        'En [0, ' + k + '] la recta está por debajo del eje, así que la integral es negativa: ' + f_fr(k2, 2) + ' − ' + k2 + ' = ' + f_fr(-k2, 2) + '.');
    }
    var q2 = 'Área entre y = ' + f + ', el eje OX y x = 0:';
    var r = mk(T, q2, f_fr(k2, 2), [f_fr(-k2, 2), N(k2), '0'],
      'La integral sale ' + f_fr(-k2, 2) + ' porque la función es negativa; el área es su valor absoluto: ' + f_fr(k2, 2) + '.');
    return bar1(r, f_fr(-k2, 2));
  });

  genr(T, function () {           /* área bajo una recta (trapecio) */
    var m = ri(1, 3), q0 = ri(0, 4), a = ri(0, 2), b = a + ri(1, 3);
    function F(x) { return m * x * x / 2 + q0 * x; }
    var v2 = Math.round(2 * (F(b) - F(a)));
    var q = 'Área bajo y = ' + poly([m, q0]) + ' entre x = ' + a + ' y x = ' + b + ':';
    return mk(T, q, f_fr(v2, 2), [N(pv([m, q0], b) - pv([m, q0], a)), N((b - a) * pv([m, q0], b)), f_fr(Math.round(2 * F(b)), 2), N(m * (b - a))],
      'La recta es positiva en el intervalo: F(x) = ' + PS([[m, 2, 2], [q0, 1, 1]]) + ', F(' + b + ') − F(' + a + ') = ' + f_fr(v2, 2) + '.');
  });

  genr(T, function () {           /* función impar en intervalo simétrico */
    var a = ri(1, 3), a4 = Math.pow(a, 4);
    if (Math.random() < 0.5) {
      var q = '∫_{−' + a + '}^{' + a + '} x^{3} dx =';
      return mk(T, q, '0', [f_fr(a4, 2), f_fr(a4, 4), N(2 * a4)],
        '⟨x^{4}|4⟩ toma el mismo valor en ' + a + ' y en −' + a + ': la parte negativa compensa la positiva.');
    }
    var q2 = 'Área entre y = x^{3}, el eje OX y las rectas x = −' + a + ', x = ' + a + ':';
    var r = mk(T, q2, f_fr(a4, 2), ['0', f_fr(a4, 4), N(a4)],
      'Por simetría: 2 · ∫_{0}^{' + a + '} x^{3} dx = 2 · ' + f_fr(a4, 4) + ' = ' + f_fr(a4, 2) + '. La integral vale 0, pero el área no.');
    return bar1(r, '0');
  });

  genr(T, function () {           /* ∫_1^{e^k} 1/x */
    var k = ri(1, 4), ek = k === 1 ? 'e' : 'e' + SUP[k];
    var q = '∫_{1}^{' + ek + '} ⟨1|x⟩ dx =';
    return mk(T, q, String(k), [ek + ' − 1', ek, '⟨1|' + ek + '⟩', String(k + 1)],
      'Primitiva ln x: ln ' + ek + ' − ln 1 = ' + k + ' − 0 = ' + k + '.');
  });

  genr(T, function () {           /* Barrow con F dada */
    var p = ri(-6, 9), s = ri(-6, 9);
    if (p === s) s = p + 3;
    var q = 'F es primitiva de f, F(1) = ' + N(p) + ' y F(4) = ' + N(s) + '. ∫_{1}^{4} f(x) dx =';
    return mk(T, q, N(s - p), [N(p - s), N(p + s), N(s)],
      'Regla de Barrow: F(4) − F(1) = ' + N(s) + ' − (' + N(p) + ') = ' + N(s - p) + '.');
  });

  genr(T, function () {           /* límites de integración para área parábola–recta */
    var r1, r2;
    do { r1 = ri(-4, 3); r2 = ri(-3, 5); } while (r2 <= r1);
    var a = r1 + r2, b = -r1 * r2;
    var q = 'Para el área entre y = x^{2} e y = ' + (poly([a, b]) === '' ? '0' : poly([a, b])) + ', se integra entre…';
    function lab(u, v) { return 'x = ' + N(u) + ' y x = ' + N(v); }
    var cand = [[-r2, -r1], [0, r2], [r1, 0], [0, a], [-r1, r2], [r1, -r2]].filter(function (u) { return u[0] < u[1]; }).map(function (u) { return lab(u[0], u[1]); });
    return mk(T, q, lab(r1, r2), cand,
      'Se igualan: x^{2} = ' + poly([a, b]) + ' → ' + poly([1, -a, -b]) + ' = 0 → x = ' + N(r1) + ' y x = ' + N(r2) + '.');
  });

  add(T, '∫_{0}^{π} sen x dx =', '2', ['0', '−2', '1'], '[−cos x] de 0 a π: −cos π + cos 0 = 1 + 1 = 2.');
  add(T, '∫_{0}^{2π} sen x dx =', '0', ['4', '2', '2π'], 'El arco positivo y el negativo se compensan: −cos 2π + cos 0 = 0 (el área sí sería 4).');
  add(T, '∫_{0}^{1} e^{x} dx =', 'e − 1', ['e', '1', 'e + 1'], 'e^{1} − e^{0} = e − 1.');
  barb('∫_{0}^{1} e^{x} dx =', 'e');
  add(T, '∫_{0}^{π/2} cos x dx =', '1', ['0', '−1', '⟨π|2⟩'], 'sen(π/2) − sen 0 = 1.');
  add(T, 'Regla de Barrow: ∫_{a}^{b} f(x) dx =', 'F(b) − F(a)', ['F(a) − F(b)', 'f(b) − f(a)', 'F(b) + F(a)'],
    'Con F una primitiva de f, se evalúa en el límite superior y se resta el inferior.');
  add(T, 'Si f(x) < 0 en [a, b], ∫_{a}^{b} f(x) dx es…', 'Negativa', ['Positiva', 'Cero', 'El área del recinto'],
    'Cuando la curva está bajo el eje OX la integral es negativa; el área es su valor absoluto.');
  add(T, 'Área entre f y g en [a, b] si f(x) ≥ g(x):', '∫_{a}^{b} (f − g) dx', ['∫_{a}^{b} (f + g) dx', '∫_{a}^{b} f dx · ∫_{a}^{b} g dx', '∫_{a}^{b} (g − f) dx'],
    'Es la función de arriba menos la de abajo, integrada entre los puntos de corte.');
  add(T, '∫_{a}^{b} k dx =', 'k(b − a)', ['k', '0', 'kb'], 'Es el área de un rectángulo de base b − a y altura k.');
  add(T, 'En la regla de Barrow, ¿importa qué constante C se elija en F?', 'No, se cancela al restar', ['Sí, hay que tomar C = 1', 'Sí, cambia el resultado', 'Solo si f es negativa'],
    '(F(b) + C) − (F(a) + C) = F(b) − F(a).');

  /* =====================================================================
     mat — Matrices
     ===================================================================== */
  T = 'mat';

  genr(T, function () {           /* dimensión */
    var m = ri(1, 3), n = ri(1, 4);
    if (m === 1 && n === 1) n = 3;
    var A = mat(m, n, -5, 9);
    return mk(T, 'Dimensión de ' + MX(A) + ':', m + ' × ' + n, [n + ' × ' + m, m + ' × ' + (n + 1), (m + 1) + ' × ' + n, (m * n) + ' × 1'],
      'Se da primero el número de filas (' + m + ') y luego el de columnas (' + n + ').');
  });

  genr(T, function () {           /* suma */
    var A = mat(2, 2, -5, 6), B = mat(2, 2, -5, 6);
    var S = A.map(function (r, i) { return r.map(function (x, j) { return x + B[i][j]; }); });
    var D = A.map(function (r, i) { return r.map(function (x, j) { return x - B[i][j]; }); });
    var E = cp(S), i = ri(0, 1), j = ri(0, 1); E[i][j] = A[i][j] - B[i][j];
    var P = A.map(function (r, i2) { return r.map(function (x, j2) { return x * B[i2][j2]; }); });
    var E2 = cp(S); E2[1 - i][1 - j] = -S[1 - i][1 - j];
    return mk(T, MX(A) + ' + ' + MX(B) + ' =', MX(S), [MX(E), MX(D), MX(E2), MX(P)],
      'Se suman los elementos que ocupan la misma posición.');
  });

  genr(T, function () {           /* producto por escalar */
    var k = pick([2, 3, -2, -3, 4]), A = mat(2, 2, -4, 6);
    var K = A.map(function (r) { return r.map(function (x) { return k * x; }); });
    var W1 = cp(K); W1[1] = A[1].slice();
    var W2 = A.map(function (r) { return r.map(function (x) { return x + k; }); });
    var W3 = cp(K); W3[0][1] = A[0][1]; W3[1][1] = A[1][1];
    return mk(T, N(k) + ' · ' + MX(A) + ' =', MX(K), [MX(W1), MX(W2), MX(W3)],
      'El escalar multiplica a TODOS los elementos de la matriz.');
  });

  genr(T, function () {           /* elemento de AB 2×2 */
    var A = mat(2, 2, -3, 5), B = mat(2, 2, -3, 5), i = ri(0, 1), j = ri(0, 1);
    var v = A[i][0] * B[0][j] + A[i][1] * B[1][j];
    var ew = N(A[i][j] * B[i][j]);
    var q = 'A = ' + MX(A) + ', B = ' + MX(B) + '. Elemento c_{' + (i + 1) + (j + 1) + '} de A · B:';
    var r = mk(T, q, N(v), [ew, N(A[i][0] * B[j][0] + A[i][1] * B[j][1]), N(A[0][i] * B[0][j] + A[1][i] * B[1][j]), N(B[i][0] * A[0][j] + B[i][1] * A[1][j])],
      'Fila ' + (i + 1) + ' de A por columna ' + (j + 1) + ' de B: ' + N(A[i][0]) + '·' + P(B[0][j]) + ' + ' + N(A[i][1]) + '·' + P(B[1][j]) + ' = ' + N(v) + '.');
    return bar1(r, ew);
  });

  genr(T, function () {           /* producto completo 2×2 */
    var A = mat(2, 2, -2, 3), B = mat(2, 2, -2, 3);
    var P = mul(A, B), Q = mul(B, A);
    var E = A.map(function (r, i) { return r.map(function (x, j) { return x * B[i][j]; }); });
    var r = mk(T, MX(A) + ' · ' + MX(B) + ' =', MX(P), [MX(E), MX(Q), MX(tr(P))],
      'Cada elemento c_{ij} es la fila i de la primera por la columna j de la segunda.');
    return bar1(r, MX(E));
  });

  genr(T, function () {           /* ¿se puede multiplicar? dimensión */
    var m = ri(1, 4), n = ri(2, 4), p = ri(1, 4);
    if (Math.random() < 0.6) {
      var q = 'A es ' + m + ' × ' + n + ' y B es ' + n + ' × ' + p + '. Dimensión de A · B:';
      return mk(T, q, m + ' × ' + p, [n + ' × ' + n, p + ' × ' + m, 'No se puede', n + ' × ' + p, m + ' × ' + n, (m + 1) + ' × ' + p],
        'Se puede porque columnas de A = filas de B = ' + n + '; el producto tiene las filas de A y las columnas de B.');
    }
    var k; do { k = ri(1, 4); } while (k === n);
    var q2 = 'A es ' + m + ' × ' + n + ' y B es ' + k + ' × ' + p + '. Dimensión de A · B:';
    return mk(T, q2, 'No se puede', [m + ' × ' + p, n + ' × ' + k, m + ' × ' + k],
      'Para multiplicar, las columnas de A (' + n + ') deben coincidir con las filas de B (' + k + ').');
  });

  genr(T, function () {           /* traspuesta 2×3 */
    var A, s;
    do { A = mat(2, 3, -4, 9); s = {}; A.forEach(function (r) { r.forEach(function (x) { s[x] = 1; }); }); } while (Object.keys(s).length < 6);
    var flat = A[0].concat(A[1]);
    var W1 = [[flat[0], flat[1]], [flat[2], flat[3]], [flat[4], flat[5]]];
    var W2 = tr(A).map(function (r) { return r.slice().reverse(); });
    return mk(T, '(' + MX(A) + ')^{t} =', MX(tr(A)), [MX(W1), MX(W2), MX(A)],
      'Las filas pasan a ser columnas: la primera fila (' + A[0].map(N).join(', ') + ') es la primera columna.');
  });

  genr(T, function () {           /* inversa 2×2 con det ±1 */
    var A, d;
    do { A = mat(2, 2, -4, 5); d = d2(A); } while (d !== 1 && d !== -1);
    var a = A[0][0], b = A[0][1], c = A[1][0], e = A[1][1];
    var I = [[e * d, -b * d], [-c * d, a * d]];
    var W1 = [[e * d, b * d], [c * d, a * d]], W2 = [[a * d, -b * d], [-c * d, e * d]], W3 = [[-e * d, b * d], [c * d, -a * d]];
    var w = [MX(W1), MX(W2), MX(W3)], rec = null;
    if (a && b && c && e) { rec = '⟦' + [[a, b], [c, e]].map(function (r) { return r.map(function (x) { return f_fr(1, x); }).join(', '); }).join('; ') + '⟧'; w.push(rec); }
    var r = mk(T, '(' + MX(A) + ')^{−1} =', MX(I), w,
      '|A| = ' + N(d) + '. A^{−1} = ⟨1|' + N(d) + '⟩ · ⟦' + N(e) + ', ' + N(-b) + '; ' + N(-c) + ', ' + N(a) + '⟧: se cambia la diagonal y de signo los otros dos.');
    return rec ? bar1(r, rec) : r;
  });

  genr(T, function () {           /* potencias */
    var n = ri(2, 5);
    if (Math.random() < 0.5) {
      var k = nz(-3, 4);
      return mk(T, '⟦1, ' + N(k) + '; 0, 1⟧^{' + n + '} =', MX([[1, n * k], [0, 1]]),
        [MX([[1, Math.pow(k, n)], [0, 1]]), MX([[n, n * k], [0, n]]), MX([[1, k + n], [0, 1]]), MX([[1, k], [0, 1]])],
        'Al multiplicar, el elemento de arriba a la derecha se va sumando: A^{' + n + '} = ⟦1, ' + n + '·' + P(k) + '; 0, 1⟧.');
    }
    var a = pick([-1, 2, -2, 3]), b = pick([1, -1, 2]);
    if (n > 3 && Math.abs(a) === 3) n = 3;
    return mk(T, '⟦' + N(a) + ', 0; 0, ' + N(b) + '⟧^{' + n + '} =', MX([[Math.pow(a, n), 0], [0, Math.pow(b, n)]]),
      [MX([[n * a, 0], [0, n * b]]), MX([[Math.pow(a, n), n], [n, Math.pow(b, n)]]), MX([[-Math.pow(a, n), 0], [0, Math.pow(b, n)]]), MX([[a + n, 0], [0, b + n]])],
      'Una matriz diagonal se eleva elevando cada elemento de la diagonal.');
  });

  genr(T, function () {           /* elemento de (2×3)(3×2) */
    var A = mat(2, 3, -2, 4), B = mat(3, 2, -2, 4), i = ri(0, 1), j = ri(0, 1);
    var v = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    var q = 'A = ' + MX(A) + ', B = ' + MX(B) + '. Elemento c_{' + (i + 1) + (j + 1) + '} de A · B:';
    var o = 1 - j;
    return mk(T, q, N(v), [N(B[i][0] * A[0][j] + B[i][1] * A[1][j]), N(A[i][0] * B[0][o] + A[i][1] * B[1][o] + A[i][2] * B[2][o]), N(A[i][0] + B[0][j] + A[i][1] + B[1][j] + A[i][2] + B[2][j]), N(A[1 - i][0] * B[0][j] + A[1 - i][1] * B[1][j] + A[1 - i][2] * B[2][j])],
      'Fila ' + (i + 1) + ' de A por columna ' + (j + 1) + ' de B: ' + [0, 1, 2].map(function (k) { return P(A[i][k]) + '·' + P(B[k][j]); }).join(' + ') + ' = ' + N(v) + '.');
  });

  genr(T, function () {           /* ecuación AX = B */
    var A, d;
    do { A = mat(2, 2, -3, 4); d = d2(A); } while (d !== 1 && d !== -1);
    var Bc = [[nz(-5, 6)], [ri(-5, 6)]];
    var I = [[A[1][1] * d, -A[0][1] * d], [-A[1][0] * d, A[0][0] * d]];
    var X = mul(I, Bc), W = mul([[A[1][1] * d, A[0][1] * d], [A[1][0] * d, A[0][0] * d]], Bc), AB = mul(A, Bc);
    var q = 'A = ' + MX(A) + ', B = ' + MX(Bc) + '. Si A · X = B, X =';
    return mk(T, q, MX(X), [MX(AB), MX(W), MX([[-X[0][0]], [-X[1][0]]]), MX([[X[1][0]], [X[0][0]]])],
      'X = A^{−1} · B, con A^{−1} = ' + MX(I) + '.');
  });

  genr(T, function () {           /* rango 2×2 */
    var A;
    if (Math.random() < 0.5) {
      var a = nz(-4, 5), b = nz(-4, 5), k = pick([-3, -2, 2, 3]);
      A = [[a, b], [k * a, k * b]];
    } else {
      do { A = mat(2, 2, -4, 6); } while (d2(A) === 0);
    }
    var rg = d2(A) === 0 ? 1 : 2;
    return mk(T, 'Rango de ' + MX(A) + ':', String(rg), ['0', String(3 - rg), '3', '4'],
      rg === 1 ? 'Las filas son proporcionales (el determinante es 0) y no es nula: rango 1.' : 'Su determinante es ' + N(d2(A)) + ' ≠ 0: rango 2.');
  });

  genr(T, function () {           /* rango 2×3 */
    var A, rg;
    if (Math.random() < 0.5) {
      var r0 = [nz(-3, 4), ri(-3, 4), nz(-3, 4)], k = pick([-2, 2, 3, -1]);
      A = [r0, r0.map(function (x) { return k * x; })]; rg = 1;
    } else {
      do { A = mat(2, 3, -3, 5); } while (d2([[A[0][0], A[0][1]], [A[1][0], A[1][1]]]) === 0);
      rg = 2;
    }
    return mk(T, 'Rango de ' + MX(A) + ':', String(rg), ['3', String(3 - rg), '0'],
      rg === 1 ? 'La segunda fila es múltiplo de la primera: rango 1.' : 'Hay un menor de orden 2 no nulo (las dos primeras columnas): rango 2. Nunca puede pasar de 2 con 2 filas.');
  });

  genr(T, function () {           /* dimensiones de traspuestas y productos */
    var m = ri(2, 4), n; do { n = ri(1, 4); } while (n === m);
    var opt = ri(0, 2);
    if (opt === 0) return mk(T, 'Si A es ' + m + ' × ' + n + ', A^{t} es…', n + ' × ' + m, [m + ' × ' + n, m + ' × ' + m, n + ' × ' + n], 'La traspuesta intercambia filas y columnas.');
    if (opt === 1) return mk(T, 'Si A es ' + m + ' × ' + n + ', A · A^{t} es…', m + ' × ' + m, [n + ' × ' + n, m + ' × ' + n, 'No se puede'], '(' + m + ' × ' + n + ')(' + n + ' × ' + m + ') da ' + m + ' × ' + m + '.');
    return mk(T, 'Si A es ' + m + ' × ' + n + ', A^{t} · A es…', n + ' × ' + n, [m + ' × ' + m, n + ' × ' + m, 'No se puede'], '(' + n + ' × ' + m + ')(' + m + ' × ' + n + ') da ' + n + ' × ' + n + '.');
  });

  add(T, '(A · B)^{−1} =', 'B^{−1} · A^{−1}', ['A^{−1} · B^{−1}', '⟨1|A · B⟩', 'A^{−1} + B^{−1}'], 'Se invierte el orden: (AB)(B^{−1}A^{−1}) = A·I·A^{−1} = I.');
  barb('(A · B)^{−1} =', 'A^{−1} · B^{−1}');
  barb('(A · B)^{−1} =', '⟨1|A · B⟩');
  add(T, '(A · B)^{t} =', 'B^{t} · A^{t}', ['A^{t} · B^{t}', 'A · B', '(B · A)^{−1}'], 'Al trasponer un producto se invierte el orden de los factores.');
  add(T, 'En general, para matrices cuadradas A · B…', 'no es igual a B · A', ['es igual a B · A', 'es siempre la identidad', 'es igual a A + B'], 'El producto de matrices no es conmutativo.');
  add(T, '(A + B)^{2} =', 'A^{2} + AB + BA + B^{2}', ['A^{2} + 2AB + B^{2}', 'A^{2} + B^{2}', 'A^{2} + 2BA + B^{2}'], 'Como AB ≠ BA en general, no se pueden juntar en 2AB.');
  barb('(A + B)^{2} =', 'A^{2} + B^{2}');
  add(T, 'Si A · X = B con A invertible, X =', 'A^{−1} · B', ['B · A^{−1}', '⟨B|A⟩', 'B − A'], 'Se multiplica por A^{−1} por la IZQUIERDA en los dos miembros.');
  barb('Si A · X = B con A invertible, X =', '⟨B|A⟩');
  add(T, 'Si X · A = B con A invertible, X =', 'B · A^{−1}', ['A^{−1} · B', '⟨B|A⟩', 'B − A'], 'Se multiplica por A^{−1} por la DERECHA en los dos miembros.');
  add(T, 'I · A =', 'A', ['I', 'A^{t}', 'La matriz nula'], 'La identidad es el elemento neutro del producto.');
  add(T, 'Una matriz es simétrica si…', 'A^{t} = A', ['A^{t} = −A', 'A^{−1} = A', 'Todos sus elementos son iguales'], 'Simétrica: a_{ij} = a_{ji}, es decir, coincide con su traspuesta.');
  add(T, '¿Cuándo se pueden sumar dos matrices?', 'Si tienen la misma dimensión', ['Si son cuadradas', 'Si columnas de A = filas de B', 'Siempre'], 'La suma es elemento a elemento: tienen que tener las mismas filas y columnas.');

  /* =====================================================================
     det — Determinantes
     ===================================================================== */
  T = 'det';

  genr(T, function () {           /* 2×2 */
    var A = mat(2, 2, -6, 9), a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
    var plus = N(a * d + b * c);
    var r = mk(T, DT(A) + ' =', N(a * d - b * c), [plus, N(a * c - b * d), N(b * c - a * d)],
      'Diagonal principal menos secundaria: ' + P(a) + '·' + P(d) + ' − ' + P(b) + '·' + P(c) + ' = ' + N(a * d - b * c) + '.');
    return bar1(r, plus);
  });

  genr(T, function () {           /* Sarrus 3×3 */
    var A = mat(3, 3, -2, 3);
    var pos = A[0][0] * A[1][1] * A[2][2] + A[0][1] * A[1][2] * A[2][0] + A[0][2] * A[1][0] * A[2][1];
    var neg = A[0][2] * A[1][1] * A[2][0] + A[0][0] * A[1][2] * A[2][1] + A[0][1] * A[1][0] * A[2][2];
    var r = mk(T, DT(A) + ' =', N(pos - neg), [N(pos), N(pos + neg), N(neg - pos), N(A[0][0] * A[1][1] * A[2][2])],
      'Sarrus: términos positivos ' + N(pos) + ', negativos ' + N(neg) + '; ' + N(pos) + ' − (' + N(neg) + ') = ' + N(pos - neg) + '.');
    r.p = 1; return r;
  });

  genr(T, function () {           /* triangular */
    var a = nz(-3, 4), b = nz(-3, 4), c = nz(-3, 4);
    var A = [[a, ri(-5, 5), ri(-5, 5)], [0, b, ri(-5, 5)], [0, 0, c]];
    if (Math.random() < 0.5) A = tr(A);
    var r = mk(T, DT(A) + ' =', N(a * b * c), [N(a + b + c), '0', N(-a * b * c)],
      'Matriz triangular: el determinante es el producto de la diagonal, ' + P(a) + '·' + P(b) + '·' + P(c) + ' = ' + N(a * b * c) + '.');
    return bar1(r, N(a + b + c));
  });

  genr(T, function () {           /* det(kA) */
    var n = ri(2, 3), k = pick([2, 3, -2, -1]), d = nz(-5, 6);
    if (n === 3 && Math.abs(k) === 3) k = 2;
    var kd = N(k * d);
    var r = mk(T, 'A es de orden ' + n + ' y |A| = ' + N(d) + '. |' + N(k) + 'A| =', N(Math.pow(k, n) * d),
      [kd, N(n * k * d), N(Math.pow(k, 5 - n) * d), N(Math.pow(d, n) * k)],
      'Cada una de las ' + n + ' filas queda multiplicada por ' + N(k) + ': |kA| = k^{' + n + '}|A| = ' + N(Math.pow(k, n) * d) + '.');
    return bar1(r, kd);
  });

  genr(T, function () {           /* det(AB), det(A^t), det(A^{-1}) */
    var a = nz(-5, 6), b = nz(-5, 6), opt = ri(0, 2);
    if (opt === 0) {
      var s = N(a + b);
      var r = mk(T, '|A| = ' + N(a) + ' y |B| = ' + N(b) + '. |A · B| =', N(a * b), [s, N(a * b * 2), N(-a * b)],
        'El determinante de un producto es el producto de los determinantes.');
      return bar1(r, s);
    }
    if (opt === 1) return mk(T, 'Si |A| = ' + N(a) + ', |A^{t}| =', N(a), [N(-a), f_fr(1, a), '0', N(a * a)],
      'Trasponer no cambia el determinante.');
    if (a === 1) a = 4;
    return mk(T, 'Si |A| = ' + N(a) + ', |A^{−1}| =', f_fr(1, a), [N(-a), N(a), f_fr(-1, a)],
      'A · A^{−1} = I, así que |A| · |A^{−1}| = 1 y |A^{−1}| = ⟨1||A|⟩.'.replace('⟨1||A|⟩', '1/|A|'));
  });

  genr(T, function () {           /* operaciones con filas */
    var d = nz(-6, 8), opt = ri(0, 2), k = pick([2, 3, 5, -2]);
    if (opt === 0) {
      var r = mk(T, 'Si |A| = ' + N(d) + ' y se intercambian dos filas, el nuevo determinante es', N(-d), [N(d), '0', N(2 * d)],
        'Intercambiar dos filas cambia el signo del determinante.');
      return bar1(r, N(d));
    }
    if (opt === 1) return mk(T, 'Si |A| = ' + N(d) + ' y se multiplica una fila por ' + N(k) + ', el nuevo determinante es', N(k * d), [N(d), N(k * k * k * d), N(d + k)],
      'Multiplicar UNA fila por k multiplica el determinante por k.');
    return mk(T, 'Si |A| = ' + N(d) + ' y a la fila 2 se le suma ' + N(k) + ' veces la fila 1, el nuevo determinante es', N(d), [N(k * d), N(d + k), '0'],
      'Sumar a una fila un múltiplo de otra no cambia el determinante.');
  });

  genr(T, function () {           /* parámetro: no tiene inversa */
    var b, c, d;
    do { b = nz(-4, 6); c = nz(-4, 6); d = nz(-4, 4); } while ((b * c) % d !== 0 || b * c / d === 0);
    var m = b * c / d;
    var q = '¿Para qué m no tiene inversa ⟦m, ' + N(b) + '; ' + N(c) + ', ' + N(d) + '⟧?';
    return mk(T, q, 'm = ' + N(m), ['m = ' + N(-m), 'm = 0', 'm = ' + N(b * c), 'm = ' + N(d)],
      '|A| = ' + N(d) + 'm − (' + N(b * c) + ') = 0 → m = ' + N(m) + '.');
  });

  genr(T, function () {           /* menor complementario y adjunto */
    var A = mat(3, 3, -3, 5), i = ri(0, 2), j = ri(0, 2);
    var M = d2(sub(A, i, j)), s = (i + j) % 2 ? -1 : 1, adj = Math.random() < 0.55;
    var q = 'A = ' + MX(A) + '. ' + (adj ? 'Adjunto A_{' : 'Menor complementario α_{') + (i + 1) + (j + 1) + '}:';
    var a = adj ? s * M : M;
    return mk(T, q, N(a), [N(-a), N(A[i][j]), N(adj ? M * (s === 1 ? -1 : 1) : s * M), N(d2(sub(A, j, i))), N(A[i][j] * a)],
      'Se tachan la fila ' + (i + 1) + ' y la columna ' + (j + 1) + ': α = ' + N(M) + (adj ? '; adjunto = (−1)^{' + (i + j + 2) + '}·α = ' + N(s * M) : '') + '.');
  });

  genr(T, function () {           /* fila de ceros o filas proporcionales */
    var r0 = [nz(-3, 4), nz(-3, 4), nz(-3, 4)], r1 = mat(1, 3, -4, 5)[0], A;
    var k = pick([2, 3, -1, -2]), opt = Math.random() < 0.5;
    var rows = opt ? [r0, r1, r0.map(function (x) { return k * x; })] : [r0, [0, 0, 0], r1];
    A = shuffle(rows.slice());
    var diag = A[0][0] * A[1][1] * A[2][2];
    var r = mk(T, DT(A) + ' =', '0', [N(diag || 1), N(k), N(r0[0] * r1[1] * k || 2), '1'],
      opt ? 'Tiene dos filas proporcionales: el determinante es 0.' : 'Tiene una fila de ceros: el determinante es 0.');
    return r;
  });

  genr(T, function () {           /* ecuación con determinante */
    var k = ri(2, 6), b = pick([1, 2, k, k * k]), c = k * k / b;
    if (c !== Math.floor(c)) { b = 1; c = k * k; }
    var q = 'Resuelve ⟦|x, ' + b + '; ' + c + ', x|⟧ = 0:';
    return mk(T, q, 'x = ±' + k, ['x = ' + k, 'x = ' + (k * k), 'x = 0', 'x = ±' + (k * k)],
      'x^{2} − ' + (b * c) + ' = 0 → x = ±' + k + '.');
  });

  genr(T, function () {           /* ¿tiene inversa? */
    var A = mat(2, 2, -4, 6);
    if (Math.random() < 0.4) { var k = pick([2, 3, -2]); A[1] = A[0].map(function (x) { return k * x; }); if (!A[0][0] && !A[0][1]) A[0][0] = 1; A[1] = A[0].map(function (x) { return k * x; }); }
    var d = d2(A), p = A[0][0] * A[1][1] + A[0][1] * A[1][0];
    var a = d === 0 ? 'No, |A| = 0' : 'Sí, |A| = ' + N(d);
    return mk(T, '¿Tiene inversa A = ' + MX(A) + '?', a,
      [d === 0 ? 'Sí, |A| = ' + N(p) : 'No, |A| = 0', 'Sí, |A| = ' + N(p), 'No, tiene elementos negativos', 'Sí, toda matriz cuadrada', 'Sí, |A| = ' + N(-d)],
      'Una matriz cuadrada tiene inversa si y solo si su determinante no es 0.');
  });

  add(T, '|I| (identidad de orden 3) =', '1', ['3', '0', '9'], 'Producto de la diagonal: 1 · 1 · 1 = 1.');
  barb('|I| (identidad de orden 3) =', '3');
  add(T, 'Una matriz cuadrada A tiene inversa si y solo si…', '|A| ≠ 0', ['|A| = 0', '|A| > 0', 'A no tiene ceros'], 'A^{−1} = ⟨1|det A⟩ · (Adj A)^{t} solo existe si se puede dividir entre |A|.'.replace('⟨1|det A⟩', '1/|A|'));
  add(T, 'Si dos filas de A son iguales, |A| =', '0', ['1', '|A|^{2}', 'No se puede saber'], 'Filas iguales (o proporcionales) hacen el determinante nulo.');
  add(T, 'Adjunto de a_{ij}:', 'A_{ij} = (−1)^{i+j} α_{ij}', ['A_{ij} = α_{ij}', 'A_{ij} = −α_{ij}', 'A_{ij} = a_{ij} · α_{ij}'], 'El adjunto es el menor complementario con el signo del tablero (+ − + …).');
  add(T, '|A + B| =', 'En general no es |A| + |B|', ['|A| + |B|', '|A| · |B|', '|A| − |B|'], 'El determinante respeta el producto (|AB| = |A||B|), pero no la suma.');
  barb('|A + B| =', '|A| + |B|');
  add(T, 'Signo del adjunto A_{12}:', '−', ['+', 'Depende de a_{12}', 'Siempre positivo'], '(−1)^{1+2} = −1.');
  add(T, 'Desarrollo de un determinante por una fila:', 'Suma de cada elemento por su adjunto', ['Producto de los elementos de la fila', 'Suma de los menores', 'Producto de la diagonal'], '|A| = a_{i1}A_{i1} + a_{i2}A_{i2} + a_{i3}A_{i3} (Laplace).');
  add(T, 'Si |A| = 0, el rango de A (cuadrada de orden 3) es…', 'Menor que 3', ['3', '0 siempre', 'Mayor que 3'], 'Rango 3 exigiría el menor de orden 3 (el propio |A|) distinto de 0.');

  /* =====================================================================
     rou — Sistemas con matrices
     ===================================================================== */
  T = 'rou';
  var CL = { SCD: 'SCD (solución única)', SCI: 'SCI (infinitas soluciones)', SI: 'SI (sin solución)' };
  var CLW = 'Depende del término independiente';

  genr(T, function () {           /* clasificación por rangos */
    var n = ri(2, 4), r = ri(1, n), r2 = Math.min(r + ri(0, 1), n + 1);
    if (r2 > n && r === n) r2 = r;  /* rango de A* ≤ nº ecuaciones; simplificamos */
    var a = r !== r2 ? CL.SI : r === n ? CL.SCD : CL.SCI;
    var q = 'rg(A) = ' + r + ', rg(A*) = ' + r2 + ', ' + n + ' incógnitas. El sistema es…';
    var w = [CL.SCD, CL.SCI, CL.SI, CLW].filter(function (x) { return x !== a; });
    return mk(T, q, a, w,
      r !== r2 ? 'Rangos distintos: incompatible (Rouché-Frobenius).' : r === n ? 'Rangos iguales al nº de incógnitas: compatible determinado.' : 'Rangos iguales pero menores que ' + n + ': compatible indeterminado.');
  });

  genr(T, function () {           /* nº de parámetros */
    var n = ri(2, 4), r = ri(1, n - 1);
    return mk(T, 'SCI con ' + n + ' incógnitas y rg(A) = rg(A*) = ' + r + '. Nº de parámetros:', String(n - r), [String(r), String(n), String(n + r), '0'],
      'Parámetros = nº de incógnitas − rango = ' + n + ' − ' + r + ' = ' + (n - r) + '.');
  });

  genr(T, function () {           /* Cramer 2×2: x o y */
    var A, d;
    do { A = mat(2, 2, -3, 4); d = d2(A); } while (d === 0);
    var x0 = ri(-4, 5), y0 = ri(-4, 5), b = [A[0][0] * x0 + A[0][1] * y0, A[1][0] * x0 + A[1][1] * y0];
    var dx = d2([[b[0], A[0][1]], [b[1], A[1][1]]]), dy = d2([[A[0][0], b[0]], [A[1][0], b[1]]]);
    var askX = Math.random() < 0.5, v = askX ? x0 : y0, Dv = askX ? dx : dy;
    var q = 'Sistema: ' + sys(A, b, ['x', 'y']) + '. ' + (askX ? 'x' : 'y') + ' =';
    return mk(T, q, N(v), [N(askX ? y0 : x0), N(Dv), N(-v), N(d)],
      '|A| = ' + N(d) + ', Δ_{' + (askX ? 'x' : 'y') + '} = ' + N(Dv) + ' → ' + (askX ? 'x' : 'y') + ' = ' + N(Dv) + '/' + P(d) + ' = ' + N(v) + '.');
  });

  genr(T, function () {           /* Δx o Δy */
    var A, d;
    do { A = mat(2, 2, -3, 5); d = d2(A); } while (d === 0);
    var b = [ri(-5, 8), ri(-5, 8)];
    var dx = d2([[b[0], A[0][1]], [b[1], A[1][1]]]), dy = d2([[A[0][0], b[0]], [A[1][0], b[1]]]);
    var askX = Math.random() < 0.5, a = askX ? dx : dy;
    var q = 'Sistema: ' + sys(A, b, ['x', 'y']) + '. En Cramer, Δ_{' + (askX ? 'x' : 'y') + '} =';
    return mk(T, q, N(a), [N(askX ? dy : dx), N(d), N(-a), N(a + 2 * (askX ? A[0][1] * b[1] : b[0] * A[1][0]))],
      'Se sustituye la columna de ' + (askX ? 'x' : 'y') + ' por los términos independientes y se calcula el determinante.');
  });

  genr(T, function () {           /* x = Δx/Δ */
    var D = pick([1, 2, 3, 4, 5, -1, -2, -3, -4]), v = nz(-5, 5), Dz = v * D, vn = pick(['x', 'y', 'z']);
    if (Math.abs(v) === 1 && Math.abs(D) === 1) D = 3, Dz = v * 3;
    var inv = f_fr(D, Dz);
    var r = mk(T, 'Por Cramer, |A| = ' + N(D) + ' y Δ_{' + vn + '} = ' + N(Dz) + '. ' + vn + ' =', N(v), [inv, N(Dz * D), N(-v)],
      vn + ' = Δ_{' + vn + '} / |A| = ' + N(Dz) + ' / ' + P(D) + ' = ' + N(v) + '.');
    return bar1(r, inv);
  });

  genr(T, function () {           /* Cramer 3×3 */
    var A, d;
    do { A = mat(3, 3, -1, 2); d = d3(A); } while (d === 0 || Math.abs(d) > 6);
    var s = [ri(-2, 3), ri(-2, 3), ri(-2, 3)], b = A.map(function (r) { return r[0] * s[0] + r[1] * s[1] + r[2] * s[2]; });
    var k = ri(0, 2), vn = ['x', 'y', 'z'][k];
    var Ak = cp(A); Ak.forEach(function (r, i) { r[k] = b[i]; });
    var Dk = d3(Ak);
    var q = 'Sistema: ' + sys(A, b, ['x', 'y', 'z']) + '. ' + vn + ' =';
    var r = mk(T, q, N(s[k]), [N(s[(k + 1) % 3]), N(Dk), N(-s[k]), N(d)],
      '|A| = ' + N(d) + ', Δ_{' + vn + '} = ' + N(Dk) + ' → ' + vn + ' = ' + N(s[k]) + '.');
    r.p = 1; return r;
  });

  genr(T, function () {           /* parámetro que anula |A| */
    var b, c, d;
    do { b = nz(-4, 6); c = nz(-4, 6); d = nz(-4, 4); } while ((b * c) % d !== 0 || b * c / d === 0);
    var m = b * c / d, e = ri(-5, 8), f = ri(-5, 8);
    var q = 'kx ' + (b < 0 ? '− ' : '+ ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y = ' + N(e) + '; ' + lin([c, d], ['x', 'y']) + ' = ' + N(f) + '. Deja de ser SCD si…';
    return mk(T, q, 'k = ' + N(m), ['k = ' + N(-m), 'k = 0', 'k = ' + N(b * c), 'k = ' + N(d * e)],
      '|A| = ' + N(d) + 'k − (' + N(b * c) + ') = 0 → k = ' + N(m) + '. Para cualquier otro k es SCD.');
  });

  genr(T, function () {           /* homogéneo */
    var A = mat(2, 2, -4, 5);
    if (Math.random() < 0.5) { var k = pick([2, -2, 3]); if (!A[0][0] && !A[0][1]) A[0][0] = 1; A[1] = A[0].map(function (x) { return k * x; }); }
    var d = d2(A), q = 'Sistema homogéneo: ' + sys(A, [0, 0], ['x', 'y']) + '. Es…';
    var a = d !== 0 ? 'SCD: solo x = y = 0' : 'SCI: infinitas soluciones';
    var si = 'SI: no tiene solución';
    var r = mk(T, q, a, [d !== 0 ? 'SCI: infinitas soluciones' : 'SCD: solo x = y = 0', si, 'SCD: x = 1, y = 1'],
      'Un homogéneo siempre es compatible (x = y = 0 es solución). |A| = ' + N(d) + (d ? ' ≠ 0: solo la trivial.' : ': hay infinitas.'));
    return bar1(r, si);
  });

  genr(T, function () {           /* proporcionales: SCI o SI */
    var a = nz(-3, 4), b = nz(-3, 4), c = ri(-5, 6), m = pick([2, 3, -2, -1]);
    var same = Math.random() < 0.5, e = same ? m * c : m * c + nz(-3, 3);
    var q = 'Sistema: ' + lin([a, b], ['x', 'y']) + ' = ' + N(c) + '; ' + lin([m * a, m * b], ['x', 'y']) + ' = ' + N(e) + '. Es…';
    var ans = same ? CL.SCI : CL.SI;
    return mk(T, q, ans, [CL.SCD, same ? CL.SI : CL.SCI, CLW],
      'Los coeficientes son proporcionales (rg A = 1); ' + (same ? 'los términos independientes también: rg A* = 1, SCI.' : 'los términos independientes no: rg A* = 2, SI.'));
  });

  genr(T, function () {           /* expresión matricial: matriz de coeficientes */
    var three = Math.random() < 0.5, A, b = [ri(-5, 6), ri(-5, 6)];
    do { A = mat(2, three ? 3 : 2, -3, 4); } while (A.some(function (r) { return r.every(function (x) { return x === 0; }); }) || A[0].some(function (_, j) { return !A[0][j] && !A[1][j]; }));
    var vars = three ? ['x', 'y', 'z'] : ['x', 'y'];
    var Aug = A.map(function (r, i) { return r.concat([b[i]]); });
    var Ab = A.map(function (r) { return r.map(Math.abs); });
    return mk(T, 'En A · X = B del sistema ' + sys(A, b, vars) + ', A =', MX(A), [MX(tr(A)), MX(Aug), MX(Ab)],
      'A es la matriz de los coeficientes (con su signo); B es la columna de términos independientes.');
  });

  genr(T, function () {           /* valor de k para que sea compatible */
    var a = nz(-3, 4), b = nz(-3, 4), c = nz(-5, 6), m = pick([2, 3, -2, 4]);
    var q = lin([a, b], ['x', 'y']) + ' = ' + N(c) + '; ' + lin([m * a, m * b], ['x', 'y']) + ' = k. ¿Para qué k es compatible?';
    return mk(T, q, 'k = ' + N(m * c), ['k = ' + N(c), 'k = 0', 'Para ningún k', 'k ≠ ' + N(m * c)],
      'La 2.ª ecuación es la 1.ª por ' + N(m) + ': solo es compatible (SCI) si k = ' + N(m) + '·' + N(c) + ' = ' + N(m * c) + '.');
  });

  add(T, 'Teorema de Rouché-Frobenius: el sistema es compatible si…', 'rg(A) = rg(A*)', ['|A| ≠ 0', 'rg(A) < rg(A*)', 'Hay tantas ecuaciones como incógnitas'], 'Compatible ⇔ la matriz de coeficientes y la ampliada tienen el mismo rango.');
  add(T, 'La regla de Cramer se puede aplicar si…', 'A es cuadrada y |A| ≠ 0', ['|A| = 0', 'A tiene más filas que columnas', 'El sistema es homogéneo'], 'Cramer necesita dividir entre |A|.');
  add(T, 'Un sistema homogéneo puede ser…', 'SCD o SCI, nunca SI', ['SI', 'Solo SCD', 'Solo SCI'], 'Siempre tiene la solución trivial (todo ceros), luego es compatible.');
  barb('Un sistema homogéneo puede ser…', 'SI');
  add(T, 'Sistema 3×3 con |A| ≠ 0:', 'SCD', ['SCI', 'SI', 'Depende de B'], 'Si |A| ≠ 0, rg(A) = rg(A*) = 3 = nº de incógnitas.');
  add(T, 'Sistema 3×3 con |A| = 0:', 'SCI o SI', ['SCD', 'Siempre SI', 'Siempre SCI'], 'Con |A| = 0 el rango es menor que 3; hay que comparar con el rango de la ampliada.');
  add(T, '¿Qué matriz es A* (ampliada)?', 'A con la columna de términos independientes', ['La traspuesta de A', 'La inversa de A', 'A multiplicada por 2'], 'Se añade a A la columna B.');
  add(T, 'En Cramer, x =', 'Δ_{x} / |A|', ['|A| / Δ_{x}', 'Δ_{x} · |A|', 'Δ_{x} − |A|'], 'Determinante con la columna de x sustituida por B, dividido entre |A|.');
  add(T, 'Sistema con matriz ⟦1, 1, 1; 1, k, 1; 1, 1, k⟧: |A| = (k − 1)^{2}. Para k = 1 el sistema NO es…', 'SCD', ['SCI', 'SI', 'Homogéneo'], 'Si k = 1, |A| = 0 y el rango baja de 3: ya no puede ser compatible determinado.');
  add(T, 'Un sistema con más incógnitas que ecuaciones (y compatible) es…', 'SCI', ['SCD', 'SI', 'Imposible de clasificar'], 'El rango no puede superar el nº de ecuaciones, que es menor que el de incógnitas.');

  /* =====================================================================
     fl10 — Flash: derivadas e integrales
     ===================================================================== */
  T = 'fl10';
  var F10 = [
    function () { var n = ri(2, 9); return { q: '(x^{' + n + '})′ = ?', a: n + xp(n - 1), w: [n + 'x^{' + n + '}', xp(n - 1), 'x^{' + (n + 1) + '}'], bar: [n + 'x^{' + n + '}'], e: 'Baja el exponente y se resta 1.' }; },
    function () { return { q: '(e^{x})′ = ?', a: 'e^{x}', w: ['x e^{x − 1}', 'e', 'ln x'], bar: ['x e^{x − 1}'], e: 'La exponencial e^{x} es su propia derivada.' }; },
    function () { return { q: '(ln x)′ = ?', a: '⟨1|x⟩', w: ['e^{x}', '⟨1|x^{2}⟩', 'x ln x'], bar: [], e: 'La derivada del logaritmo neperiano es 1/x.' }; },
    function () { var s = Math.random() < 0.5; return s ? { q: '(sen x)′ = ?', a: 'cos x', w: ['−cos x', '−sen x', 'sen x'], bar: [], e: 'La derivada del seno es el coseno.' } : { q: '(cos x)′ = ?', a: '−sen x', w: ['sen x', '−cos x', 'cos x'], bar: [], e: 'La derivada del coseno es menos el seno.' }; },
    function () { var k = ri(2, 12); return { q: '(' + k + 'x)′ = ?', a: String(k), w: [k + 'x', 'x', '0'], bar: [], e: 'La derivada de kx es k.' }; },
    function () { var k = ri(2, 99); return { q: '(' + k + ')′ = ?', a: '0', w: [String(k), '1', 'x'], bar: [String(k)], e: 'La derivada de una constante es 0.' }; },
    function () { return { q: '∫ x dx = ?', a: '⟨x^{2}|2⟩ + C', w: ['x^{2} + C', '1 + C', '2x^{2} + C'], bar: ['1 + C'], e: 'Se sube un grado y se divide entre 2.' }; },
    function () { return { q: '∫ 2x dx = ?', a: 'x^{2} + C', w: ['2 + C', '2x^{2} + C', '⟨x^{2}|2⟩ + C'], bar: ['2 + C'], e: '(x^{2})′ = 2x.' }; },
    function () { var n = ri(2, 6); return { q: '∫ ' + (n + 1) + 'x^{' + n + '} dx = ?', a: 'x^{' + (n + 1) + '} + C', w: [(n + 1) + 'x^{' + (n + 1) + '} + C', (n * (n + 1)) + xp(n - 1) + ' + C', 'x^{' + n + '} + C'], bar: [(n * (n + 1)) + xp(n - 1) + ' + C'], e: '(x^{' + (n + 1) + '})′ = ' + (n + 1) + 'x^{' + n + '}.' }; },
    function () { return { q: '∫ e^{x} dx = ?', a: 'e^{x} + C', w: ['⟨e^{x + 1}|x + 1⟩ + C', 'x e^{x} + C', 'e + C'], bar: ['⟨e^{x + 1}|x + 1⟩ + C'], e: 'e^{x} es su propia primitiva.' }; },
    function () { return { q: '∫ ⟨1|x⟩ dx = ?', a: 'ln|x| + C', w: ['−⟨1|x^{2}⟩ + C', 'x + C', 'e^{x} + C'], bar: ['−⟨1|x^{2}⟩ + C'], e: '(ln|x|)′ = 1/x.' }; },
    function () { var s = Math.random() < 0.5; return s ? { q: '∫ cos x dx = ?', a: 'sen x + C', w: ['−sen x + C', 'cos x + C', '−cos x + C'], bar: [], e: '(sen x)′ = cos x.' } : { q: '∫ sen x dx = ?', a: '−cos x + C', w: ['cos x + C', '−sen x + C', 'sen x + C'], bar: [], e: '(−cos x)′ = sen x.' }; },
    function () { var k = ri(2, 9); return { q: '∫ ' + k + ' dx = ?', a: k + 'x + C', w: ['0 + C', k + ' + C', '⟨' + k + '|x⟩ + C'], bar: ['0 + C'], e: 'La primitiva de una constante k es kx.' }; },
    function () { var k = nz(-6, 9); return { q: '(x^{2} ' + (k < 0 ? '− ' : '+ ') + Math.abs(k) + 'x)′ = ?', a: poly([2, k]), w: [poly([2, 0]), poly([1, k]), poly([2, k, 0])], bar: [], e: 'Se deriva término a término.' }; },
    function () { var k = ri(2, 5); return { q: '(e^{' + k + 'x})′ = ?', a: k + 'e^{' + k + 'x}', w: ['e^{' + k + 'x}', k + 'x e^{' + k + 'x − 1}', 'e^{' + k + '}'], bar: [k + 'x e^{' + k + 'x − 1}'], e: 'Regla de la cadena: se multiplica por la derivada del exponente.' }; },
    function () { var a = ri(1, 5); return { q: '∫_{0}^{' + a + '} 2x dx = ?', a: String(a * a), w: [String(2 * a), String(2 * a * a), f_fr(a * a, 2)], bar: [], e: '[x^{2}] de 0 a ' + a + ' = ' + (a * a) + '.' }; }
  ];
  F10.forEach(function (f) { fl('fl10', f); });

  /* =====================================================================
     fl11 — Flash: matrices y determinantes
     ===================================================================== */
  var F11 = [
    function () { var A = mat(2, 2, -3, 4), p = A[0][0] * A[1][1] + A[0][1] * A[1][0]; return { q: DT(A) + ' = ?', a: N(d2(A)), w: [N(p), N(-d2(A)), N(A[0][0] * A[1][0] - A[0][1] * A[1][1])], bar: [N(p)], e: 'ad − bc.' }; },
    function () { var m = ri(1, 4), n = ri(2, 4), p = ri(1, 4); return { q: '(' + m + ' × ' + n + ') · (' + n + ' × ' + p + ') → ?', a: m + ' × ' + p, w: [n + ' × ' + n, p + ' × ' + m, 'No se puede', n + ' × ' + p, m + ' × ' + n], bar: [], e: 'Filas de la 1.ª y columnas de la 2.ª.' }; },
    function () { var m = ri(1, 4), n = ri(2, 4), p, k; do { p = ri(1, 4); } while (p === n); k = ri(1, 4); return { q: '(' + m + ' × ' + n + ') · (' + p + ' × ' + k + ') → ?', a: 'No se puede', w: [m + ' × ' + k, n + ' × ' + p, m + ' × ' + p], bar: [], e: 'Columnas de la 1.ª (' + n + ') ≠ filas de la 2.ª (' + p + ').' }; },
    function () { var a = ri(0, 5), b, c, d = ri(0, 5); do { b = ri(-3, 6); c = ri(-3, 6); } while (b === c); return { q: MX([[a, b], [c, d]]) + '^{t} = ?', a: MX([[a, c], [b, d]]), w: [MX([[d, b], [c, a]]), MX([[a, b], [c, d]]), MX([[d, c], [b, a]])], bar: [], e: 'Filas por columnas.' }; },
    function () { var m = ri(1, 4), n; do { n = ri(1, 4); } while (n === m); return { q: 'A es ' + m + ' × ' + n + ' → A^{t} es ?', a: n + ' × ' + m, w: [m + ' × ' + n, m + ' × ' + m, n + ' × ' + n], bar: [], e: 'Se intercambian filas y columnas.' }; },
    function () { var o = pick([['I · A', 'A'], ['A · I', 'A'], ['A · A^{−1}', 'I'], ['A^{−1} · A', 'I'], ['(A^{t})^{t}', 'A'], ['(A^{−1})^{−1}', 'A']]); var all = ['A', 'I', 'A^{t}', 'A^{2}', '0', 'A^{−1}']; return { q: o[0] + ' = ?', a: o[1], w: all.filter(function (x) { return x !== o[1]; }).slice(0, 4), bar: [], e: 'Propiedades básicas de la identidad, la inversa y la traspuesta.' }; },
    function () { var n = ri(2, 3), k = pick([2, 3]), d = nz(-3, 5); return { q: 'Orden ' + n + ', |A| = ' + N(d) + ' → |' + k + 'A| = ?', a: N(Math.pow(k, n) * d), w: [N(k * d), N(n * k * d), N(k + d)], bar: [N(k * d)], e: '|kA| = k^{n}|A|.' }; },
    function () { var d = nz(-6, 9); return { q: '|A| = ' + N(d) + ' → |A^{t}| = ?', a: N(d), w: [N(-d), f_fr(1, d), '0'], bar: [], e: 'Trasponer no cambia el determinante.' }; },
    function () { var d = pick([2, 3, 4, 5, -2, -3, 10]); return { q: '|A| = ' + N(d) + ' → |A^{−1}| = ?', a: f_fr(1, d), w: [N(-d), N(d), f_fr(-1, d)], bar: [N(-d)], e: '|A^{−1}| = 1/|A|.' }; },
    function () { var n = ri(2, 5); return { q: '|I_{' + n + '}| = ?', a: '1', w: [String(n), '0', String(n * n)], bar: [String(n)], e: 'Producto de la diagonal: todo unos.' }; },
    function () { var a = nz(-4, 5), b = nz(-4, 5); return { q: '|A| = ' + N(a) + ', |B| = ' + N(b) + ' → |AB| = ?', a: N(a * b), w: [N(a + b), N(a - b), N(-a * b)], bar: [N(a + b)], e: '|AB| = |A| · |B|.' }; },
    function () { var a = nz(-3, 4), b = ri(-5, 5), c = ri(-5, 5); return { q: DT([[a, b, c], [0, 0, 0], [b, c, a]]) + ' = ?', a: '0', w: [N(a), N(a + b + c), '1'], bar: [], e: 'Una fila de ceros anula el determinante.' }; },
    function () { var a = nz(-3, 5), b = nz(-3, 5), c = nz(-3, 4); return { q: DT([[a, 0, 0], [0, b, 0], [0, 0, c]]) + ' = ?', a: N(a * b * c), w: [N(a + b + c), '0', N(-a * b * c)], bar: [N(a + b + c)], e: 'Diagonal: producto de la diagonal.' }; },
    function () { var d = nz(-6, 9); return { q: '|A| = ' + N(d) + ', intercambio dos filas → ?', a: N(-d), w: [N(d), '0', N(2 * d)], bar: [N(d)], e: 'Intercambiar filas cambia el signo.' }; },
    function () { var k = pick([2, 3, -2]), A = mat(2, 2, -3, 5); return { q: N(k) + ' · ' + MX(A) + ' = ?', a: MX(A.map(function (r) { return r.map(function (x) { return k * x; }); })), w: [MX([A[0].map(function (x) { return k * x; }), A[1]]), MX(A.map(function (r) { return r.map(function (x) { return k + x; }); })), MX(A)], bar: [], e: 'Se multiplica cada elemento.' }; },
    function () { var a = nz(-3, 4), b = nz(-3, 4), k = pick([2, 3, -1, -2]); return { q: 'rg ' + MX([[a, b], [k * a, k * b]]) + ' = ?', a: '1', w: ['2', '0', '4'], bar: [], e: 'Filas proporcionales: rango 1.' }; }
  ];
  F11.forEach(function (f) { fl('fl11', f); });
})();
