/* Temas nuevos (cursos de 1.º ESO a 2.º de Bachillerato) */
(function () {
  var T = {
    eq1: 'Ecuaciones de primer grado',
    fin: 'Matemáticas financieras',
    cpx: 'Números complejos',
    vec: 'Vectores y rectas en el plano',
    lim1: 'Límites',
    lim2: 'Continuidad y asíntotas',
    der1: 'Cálculo de derivadas',
    der2: 'Aplicaciones de la derivada',
    int1: 'Primitivas (integrales indefinidas)',
    int2: 'Integral definida y áreas',
    mat: 'Matrices',
    det: 'Determinantes',
    rou: 'Sistemas con matrices (Rouché, Cramer)',
    pl: 'Programación lineal',
    esp: 'Vectores en el espacio',
    rp: 'Rectas y planos en el espacio',
    bay: 'Probabilidad condicionada y Bayes',
    dis: 'Distribuciones binomial y normal',
    inf: 'Inferencia estadística',
    fl10: 'Flash: derivadas e integrales',
    fl11: 'Flash: matrices y determinantes',
    fl12: 'Flash: límites'
  };
  for (var k in T) TOPICS[k] = T[k];
  var flash = GROUPS.pop();
  GROUPS.push(
    { b: 'Álgebra', n: 'Ecuaciones de primer grado', t: ['eq1'] },
    { b: 'Números y proporcionalidad', n: 'Matemáticas financieras', t: ['fin'] },
    { b: 'Números y proporcionalidad', n: 'Números complejos', t: ['cpx'] },
    { b: 'Análisis', n: 'Límites y continuidad', t: ['lim1', 'lim2'] },
    { b: 'Análisis', n: 'Derivadas', t: ['der1', 'der2'] },
    { b: 'Análisis', n: 'Integrales', t: ['int1', 'int2'] },
    { b: 'Álgebra lineal', n: 'Matrices y determinantes', t: ['mat', 'det'] },
    { b: 'Álgebra lineal', n: 'Sistemas y programación lineal', t: ['rou', 'pl'] },
    { b: 'Geometría analítica', n: 'En el plano', t: ['vec'] },
    { b: 'Geometría analítica', n: 'En el espacio', t: ['esp', 'rp'] },
    { b: 'Estadística y probabilidad', n: 'Probabilidad avanzada e inferencia', t: ['bay', 'dis', 'inf'] }
  );
  flash.t = flash.t.concat(['fl10', 'fl11', 'fl12']);
  GROUPS.push(flash);
  FLASHIDS.push('fl10', 'fl11', 'fl12');
  /* agrupar por bloques en orden */
  var order = ['Números y proporcionalidad', 'Álgebra', 'Álgebra lineal', 'Geometría y medida', 'Geometría analítica', 'Funciones', 'Análisis', 'Estadística y probabilidad', 'Modo flash (de cabeza)'];
  var idx = GROUPS.map(function (g, i) { return [g, i]; });
  idx.sort(function (a, b) { return (order.indexOf(a[0].b) - order.indexOf(b[0].b)) || (a[1] - b[1]); });
  GROUPS.length = 0; idx.forEach(function (p) { GROUPS.push(p[0]); });
})();
