(function () {
  'use strict';
  /* Problemas con enunciado (usa papel). Todas las respuestas se calculan en el código. */
  function dc(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
  function eur(x) { return dc(x) + ' €'; }
  /* limpia incorrectas absurdas (negativas, con muchos decimales, repetidas); si no quedan 3, devuelve w vacío y se repite el sorteo */
  function M(t, q, a, wr, e) {
    var seen = {}, w = []; seen[a] = 1;
    wr.forEach(function (x) {
      x = String(x);
      if (seen[x] || /-|NaN|Infinity|\./.test(x) || /,\d{3,}/.test(x) || /^0( |$)/.test(x)) return;
      seen[x] = 1; w.push(x);
    });
    return { t: t, q: q, a: String(a), w: w.length >= 3 ? w.slice(0, 3) : [], e: e, p: 1 };
  }
  function skip(t) { return { t: t, q: '', a: '', w: [], e: '' }; }

  /* ---------- Ecuaciones de primer grado (eq1) ---------- */
  genr('eq1', function () {
    var x = ri(8, 40), k = ri(2, 6), d = ri(3, 30), t = k * x + d;
    return M('eq1', 'Si multiplico un número por ' + k + ' y le sumo ' + d + ', obtengo ' + t + '. ¿Qué número es?', x,
      [t - d, x + k, x + d, t / k], 'Ecuación: ' + k + 'x + ' + d + ' = ' + t + ' → ' + k + 'x = ' + (t - d) + ' → x = ' + x + '.');
  });
  genr('eq1', function () {
    var h = ri(4, 14), dif = ri(20, 32), tot = dif + 2 * h;
    return M('eq1', 'Un padre tiene ' + dif + ' años más que su hijo. Entre los dos suman ' + tot + ' años. ¿Cuántos años tiene el hijo?', h,
      [h + dif, tot / 2, tot - dif, h + 2], 'Hijo = x, padre = x + ' + dif + '. x + x + ' + dif + ' = ' + tot + ' → 2x = ' + 2 * h + ' → x = ' + h + '.');
  });
  genr('eq1', function () {
    var x = ri(10, 40), base = ri(2, 5), total = x * base + x;
    return M('eq1', 'Marta ha ahorrado ' + x + ' €. Su hermano tiene ' + base + ' veces lo que ella. ¿Cuánto tienen entre los dos?', eur(total),
      [eur(x * base), eur(x + base), eur(x * base * 2), eur(total + x)],
      'El hermano tiene ' + base + '·' + x + ' = ' + base * x + ' €. Juntos: ' + x + ' + ' + base * x + ' = ' + total + ' €.');
  });
  genr('eq1', function () {
    var v1 = ri(40, 90), t = ri(2, 5), d = v1 * t;
    return M('eq1', 'Un coche circula a ' + v1 + ' km/h durante ' + t + ' horas. ¿Cuántos km recorre?', d + ' km',
      [(v1 + t) + ' km', (d / 2) + ' km', (d + v1) + ' km', (v1 * (t + 1)) + ' km'],
      'distancia = velocidad · tiempo = ' + v1 + ' · ' + t + ' = ' + d + ' km.');
  });

  /* ---------- Sistemas lineales (sis1) ---------- */
  genr('sis1', function () {
    var a = ri(2, 6), b = ri(2, 6), p1 = ri(2, 5), p2 = ri(6, 12), tot = a * p1 + b * p2, n = a + b;
    return M('sis1', 'En una cafetería compro refrescos de ' + p1 + ' € y bocadillos de ' + p2 + ' €. Compro ' + n + ' productos en total y pago ' + tot + ' €. ¿Cuántos bocadillos compro?', b,
      [a, b + 1, b - 1, n - 1],
      'x refrescos + y bocadillos: x + y = ' + n + ' y ' + p1 + 'x + ' + p2 + 'y = ' + tot + '. Resolviendo: x = ' + a + ', y = ' + b + '.');
  });
  genr('sis1', function () {
    var s = ri(14, 40), df = ri(2, 10);
    if ((s + df) % 2) df++;
    var big = (s + df) / 2, small = (s - df) / 2;
    return M('sis1', 'Dos números suman ' + s + ' y su diferencia es ' + df + '. ¿Cuál es el mayor?', big,
      [small, s - df, big + df, s / 2], 'x + y = ' + s + ' y x − y = ' + df + '. Sumando: 2x = ' + (s + df) + ' → x = ' + big + '.');
  });
  genr('sis1', function () {
    var a = ri(3, 8), b = ri(3, 8), pa = ri(2, 4), pb = ri(5, 9), tot = a + b, imp = a * pa + b * pb;
    return M('sis1', 'Una entrada de niño cuesta ' + pa + ' € y una de adulto ' + pb + ' €. Se han vendido ' + tot + ' entradas por ' + imp + ' €. ¿Cuántas son de adulto?', b,
      [a, b + 1, b - 1, tot - 1], 'x niños + y adultos: x + y = ' + tot + ' y ' + pa + 'x + ' + pb + 'y = ' + imp + ' → y = ' + b + '.');
  });

  /* ---------- Proporcionalidad y porcentajes (num4) ---------- */
  genr('num4', function () {
    var pr = pick([40, 60, 80, 120, 150, 200]), d = pick([10, 20, 25, 30]), fin = pr * (100 - d) / 100;
    return M('num4', 'Unas zapatillas cuestan ' + pr + ' € y tienen un ' + d + ' % de descuento. ¿Cuánto se paga?', eur(fin),
      [eur(pr * d / 100), eur(pr - d), eur(pr * (100 + d) / 100), eur(pr + d)],
      'Descuento: ' + pr + ' · ' + d + '/100 = ' + dc(pr * d / 100) + ' €. Se paga ' + pr + ' − ' + dc(pr * d / 100) + ' = ' + dc(fin) + ' €.');
  });
  genr('num4', function () {
    var pr = pick([50, 80, 100, 200, 250, 400]), fin = pr * 1.21;
    return M('num4', 'Un producto vale ' + pr + ' € sin IVA. Con un IVA del 21 %, ¿cuál es el precio final?', eur(fin),
      [eur(pr * 0.21), eur(pr + 21), eur(pr * 0.79), eur(pr * 1.021)], 'Se multiplica por 1,21: ' + pr + ' · 1,21 = ' + dc(fin) + ' €.');
  });
  genr('num4', function () {
    var c = pick([1000, 2000, 5000]), r = pick([2, 3, 4, 5]), fin = c * Math.pow(1 + r / 100, 2);
    return M('num4', 'Deposito ' + c + ' € al ' + r + ' % anual con interés compuesto. ¿Cuánto tendré al cabo de 2 años?', eur(fin),
      [eur(c * (1 + 2 * r / 100)), eur(c * (1 + r / 100)), eur(c + 2 * r), eur(c * Math.pow(1 + r / 100, 3))],
      'Capital final = ' + c + ' · ' + dc(1 + r / 100) + '² = ' + dc(fin) + ' €.');
  });
  genr('num4', function () {
    var kg = ri(2, 6), p = ri(3, 9), kg2 = ri(8, 15), cost = p * kg2;
    return M('num4', kg + ' kg de naranjas cuestan ' + p * kg + ' €. ¿Cuánto cuestan ' + kg2 + ' kg?', eur(cost),
      [eur(p * kg + kg2), eur(p * kg * kg2), eur(cost - p), eur(cost + p)], 'Regla de tres: 1 kg cuesta ' + p + ' € → ' + kg2 + ' kg cuestan ' + cost + ' €.');
  });
  genr('num4', function () {
    var n = pick([200, 300, 400, 500, 800]), p = pick([10, 15, 20, 25, 40]), n2 = n * p / 100;
    return M('num4', 'En un colegio de ' + n + ' alumnos, el ' + p + ' % va en autobús. ¿Cuántos alumnos van en autobús?', n2,
      [n - n2, n * p, n2 + p, n / p], p + ' % de ' + n + ' = ' + n + ' · ' + p + '/100 = ' + n2 + '.');
  });

  /* ---------- Áreas y volúmenes (geo2, geo4) ---------- */
  genr('geo2', function () {
    var l = ri(6, 14), a = ri(3, 9), per = 2 * (l + a), area = l * a;
    return M('geo2', 'Una parcela rectangular mide ' + l + ' m de largo y ' + a + ' m de ancho. ¿Cuántos metros de valla necesito para rodearla?', per + ' m',
      [area + ' m', (l + a) + ' m', (2 * l + a) + ' m', (per * 2) + ' m'], 'Perímetro = 2·(' + l + ' + ' + a + ') = ' + per + ' m. (' + area + ' sería el área, en m².)');
  });
  genr('geo2', function () {
    var r = ri(2, 9), area = r * r;
    return M('geo2', 'Una plaza circular tiene ' + r + ' m de radio. ¿Cuál es su área?', area + 'π m²',
      [(2 * r) + 'π m²', (2 * area) + 'π m²', (r * area) + 'π m²', r + 'π m²'], 'Área = π r² = π · ' + r + '² = ' + area + 'π m².');
  });
  genr('geo4', function () {
    var a = ri(6, 15), b = ri(4, 10), c = ri(2, 4), v = a * b * c;
    return M('geo4', 'Una piscina mide ' + a + ' m de largo, ' + b + ' m de ancho y ' + c + ' m de profundidad. ¿Cuántos m³ de agua caben?', v + ' m³',
      [(a * b) + ' m³', (a + b + c) + ' m³', (2 * (a * b + a * c + b * c)) + ' m³', (v * 2) + ' m³'],
      'Volumen = largo · ancho · alto = ' + a + ' · ' + b + ' · ' + c + ' = ' + v + ' m³.');
  });
  genr('geo4', function () {
    var r = ri(2, 6), h = ri(3, 10), v = r * r * h;
    return M('geo4', 'Un depósito cilíndrico tiene ' + r + ' m de radio y ' + h + ' m de altura. ¿Cuál es su volumen?', v + 'π m³',
      [(2 * r * h) + 'π m³', (r * h * h) + 'π m³', (2 * v) + 'π m³', (r * h) + 'π m³'], 'Volumen = π r² h = π · ' + r + '² · ' + h + ' = ' + v + 'π m³.');
  });

  /* ---------- Pitágoras y semejanza (geo3) ---------- */
  genr('geo3', function () {
    var t = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]]);
    return M('geo3', 'Una escalera de ' + t[2] + ' m se apoya en una pared y su base queda a ' + t[0] + ' m de ella. ¿A qué altura llega?', t[1] + ' m',
      [(t[2] - t[0]) + ' m', (t[0] + t[2]) + ' m', (t[1] + 2) + ' m', (t[1] - 1) + ' m'],
      'Pitágoras: h² = ' + t[2] + '² − ' + t[0] + '² = ' + (t[2] * t[2] - t[0] * t[0]) + ' → h = ' + t[1] + ' m.');
  });
  genr('geo3', function () {
    var c = pick([[1.5, 2], [1.8, 3], [1.2, 2], [1.6, 2], [1.5, 3]]), k = ri(3, 8), S = c[1] * k, H = c[0] * k;
    return M('geo3', 'Una persona de ' + dc(c[0]) + ' m proyecta una sombra de ' + c[1] + ' m. A la misma hora, un árbol proyecta una sombra de ' + S + ' m. ¿Cuánto mide el árbol?', dc(H) + ' m',
      [dc(c[0] + S - c[1]) + ' m', dc(S / c[0]) + ' m', dc(c[0] * S) + ' m', dc(H + c[0]) + ' m'],
      'Triángulos semejantes: ' + dc(c[0]) + '/' + c[1] + ' = x/' + S + ' → x = ' + dc(H) + ' m.');
  });

  /* ---------- Sucesiones (num5) ---------- */
  genr('num5', function () {
    var a1 = ri(2, 15), d = ri(2, 7), n = ri(10, 25), an = a1 + (n - 1) * d;
    return M('num5', 'Una progresión aritmética empieza en ' + a1 + ' y va aumentando de ' + d + ' en ' + d + '. ¿Cuánto vale el término ' + n + '?', an,
      [a1 + n * d, a1 + (n - 2) * d, an + d + 1, n * d], 'a_{n} = a_{1} + (n − 1)·d = ' + a1 + ' + ' + (n - 1) + '·' + d + ' = ' + an + '.');
  });
  genr('num5', function () {
    var a1 = ri(1, 5), r = pick([2, 3]), n = ri(4, 7), an = a1 * Math.pow(r, n - 1);
    return M('num5', 'Un cultivo de bacterias empieza con ' + a1 + ' y se multiplica por ' + r + ' cada hora. ¿Cuántas hay en la medición número ' + n + ' (la 1.ª es la del comienzo)?', an,
      [a1 * Math.pow(r, n), a1 * r * n, a1 + r * (n - 1), a1 * Math.pow(r, n - 2)], 'a_{n} = a_{1}·r^{n−1} = ' + a1 + '·' + r + '^{' + (n - 1) + '} = ' + an + '.');
  });

  /* ---------- Estadística y probabilidad (est1, pro) ---------- */
  genr('est1', function () {
    var n = ri(4, 6), a = [], s = 0, i, need;
    for (i = 0; i < n; i++) { var v = ri(4, 10); a.push(v); s += v; }
    need = 7 * (n + 1) - s;
    if (need < 3 || need > 10) return skip('est1');
    return M('est1', 'Tus notas son ' + a.join(', ') + '. ¿Qué nota necesitas en el siguiente examen para tener un 7 de media?', need,
      [7, need + 1, need - 1, Math.round(s / n)], 'La suma total debe ser 7 · ' + (n + 1) + ' = ' + 7 * (n + 1) + '. Ya tienes ' + s + ', así que necesitas ' + need + '.');
  });
  genr('pro', function () {
    var b = ri(3, 8), r = ri(2, 8), tot = b + r;
    if (b === r) return skip('pro');
    return M('pro', 'En una bolsa hay ' + b + ' bolas blancas y ' + r + ' rojas. Si saco una al azar, ¿cuál es la probabilidad de que sea roja?', f_fr(r, tot),
      [f_fr(b, tot), f_fr(r, b), '⟨1|' + r + '⟩', f_fr(tot, r)], 'Casos favorables / casos posibles = ' + r + '/' + tot + (gcd(r, tot) > 1 ? ', que simplificada es ' + f_fr(r, tot) : '') + '.');
  });

  /* ---------- Segundo grado y funciones (seg2, fun2) ---------- */
  genr('seg2', function () {
    var n = ri(4, 12), p = n * (n + 1);
    return M('seg2', 'El producto de dos números naturales consecutivos es ' + p + '. ¿Cuál es el menor?', n,
      [n + 1, n - 1, 2 * n, p / 2], 'x(x + 1) = ' + p + ' → x² + x − ' + p + ' = 0 → x = ' + n + ' (la otra solución es negativa).');
  });
  genr('seg2', function () {
    var a = ri(3, 9), b = ri(2, 7), area = a * (a + b);
    return M('seg2', 'Un rectángulo tiene un lado ' + b + ' m más largo que el otro y su área es ' + area + ' m². ¿Cuánto mide el lado corto?', a + ' m',
      [(a + b) + ' m', (a - 1) + ' m', (a + 1) + ' m', (2 * a + b) + ' m'], 'x(x + ' + b + ') = ' + area + ' → x² + ' + b + 'x − ' + area + ' = 0 → x = ' + a + ' m.');
  });
  genr('fun2', function () {
    var c = ri(5, 25), p = ri(2, 9), n = ri(3, 12), cost = c + p * n;
    return M('fun2', 'Un taxi cobra ' + c + ' € por bajada de bandera más ' + p + ' € por km. ¿Cuánto cuesta un viaje de ' + n + ' km?', eur(cost),
      [eur((c + p) * n), eur(c * n + p), eur(c * p * n), eur(cost + p)], 'f(x) = ' + c + ' + ' + p + 'x → f(' + n + ') = ' + c + ' + ' + p * n + ' = ' + cost + ' €.');
  });
  genr('fun2', function () {
    var v0 = ri(2, 6) * 10, h = v0 * 2 - 20;
    return M('fun2', 'La altura (en m) de una pelota lanzada hacia arriba es h(t) = ' + v0 + 't − 5t². ¿Qué altura tiene a los 2 segundos?', h + ' m',
      [(v0 * 2) + ' m', (v0 * 2 + 20) + ' m', (v0 - 10) + ' m', (v0 * 2 - 10) + ' m'], 'h(2) = ' + v0 + '·2 − 5·2² = ' + (v0 * 2) + ' − 20 = ' + h + ' m.');
  });

  /* ---------- Unidades (med1) ---------- */
  genr('med1', function () {
    var km = ri(2, 9), min = pick([10, 12, 15, 20, 24, 30]), v = km * 60 / min;
    return M('med1', 'Un ciclista recorre ' + km + ' km en ' + min + ' minutos. ¿Cuál es su velocidad media en km/h?', dc(v) + ' km/h',
      [dc(km / min) + ' km/h', dc(km * min) + ' km/h', dc(km * 1000 / min) + ' km/h', dc(v + 5) + ' km/h', dc(v * 2) + ' km/h'],
      'v = ' + km + ' km / (' + min + '/60 h) = ' + dc(v) + ' km/h.');
  });
})();
