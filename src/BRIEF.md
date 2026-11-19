# Encargo: preguntas nuevas para el juego "Gran Premio de Barbaridades"

Juego de preguntas tipo test (1 correcta + 3 incorrectas) de matemáticas para alumnos españoles (ESO y Bachillerato, currículo LOMLOE / Andalucía). Escribes UN archivo JavaScript con preguntas para los temas que se te asignan. Todo en español de España.

## Archivos
- Base (NO modificar, solo leer para ver estilo y ayudas): /home/claude/work/qlib.js  (≈ 4 MB de preguntas; busca ejemplos con `grep -n "genr('log2'" qlib.js` etc.)
- Temas nuevos ya declarados: /home/claude/work/q_00topics.js
- Tu archivo: el que se indica en tu encargo (p. ej. /home/claude/work/q_20b.js). Envuélvelo entero en `(function () { 'use strict'; ... })();` para no crear variables globales.
- Prueba: `cd /home/claude/work && node tq.js q_20b.js` (comprueba formato) y `node tq.js q_20b.js 2` (muestra 2 ejemplos de cada generador). Tiene que terminar con `MAL 0`. Usa timeout de 60 s.

## API (funciones globales disponibles)
- `add(t, q, a, [w1, w2, w3], e)` → pregunta fija. t = id del tema, q = enunciado, a = respuesta correcta, w = 3 incorrectas, e = explicación breve (1-2 frases) de por qué es así.
- `genr(t, function () { ...; return mk(t, q, a, [w1, w2, w3, ...], e); })` → plantilla con números aleatorios. mk descarta incorrectas repetidas o iguales a la correcta; da más de 3 candidatas si pueden coincidir. Si al final no hay 3 distintas, se repite el sorteo.
- Ayudas: `ri(a, b)` entero aleatorio [a,b]; `pick(arr)`; `shuffle(arr)`; `gcd(a,b)`; `mn(n)` número con signo menos tipográfico (−); `poly([1,-5,6])` → "x^{2} − 5x + 6"; `f_fr(a, b)` fracción simplificada con marcado; `nz(a,b)` entero no nulo.
- Barbaridades (errores garrafales típicos que activan una sirena): dentro de un generador, `barb(q, w)` marca la incorrecta `w` de la pregunta de enunciado exacto `q` como barbaridad. Úsalo con 1 de cada 3 o 4 generadores para el error más típico (p. ej. derivada de x^{3} = 3x^{3}, √(a+b) = √a + √b, (A·B)^{-1} = A^{-1}·B^{-1}...). Llama barb DESPUÉS de construir el enunciado definitivo y SOLO con una w que esté en la lista final (mk puede descartar duplicadas: compruébalo con `r = mk(...); if (r.w.indexOf(x) >= 0) barb(r.q, x); return r;`).

## Marcado matemático (se convierte a HTML)
- `x^{2}` superíndice, `a_{n}` subíndice, `√{x + 1}` raíz, `√[3]{8}` raíz cúbica, `⟨a|b⟩` fracción (NUNCA un `|` dentro de una fracción salvo el separador; las fracciones se pueden anidar).
- Matrices: `⟦1, 2; 3, 4⟧` (filas con `;`, elementos con `,`); determinantes: `⟦|1, 2; 3, 4|⟧`. Dentro de matrices NO uses decimales con coma (usa enteros o fracciones ⟨a|b⟩).
- Signo menos SIEMPRE `−` (U+2212), nunca el guion ASCII `-` delante de números (usa `mn()`). Decimales con coma: 2,5. Multiplicar: `·`. Infinito: ∞. Integrales: `∫ 3x^{2} dx`, definida `∫_{0}^{2} x dx`. Derivada: `f'(x)`. Límite: `lim_{x→2} (x^{2} − 4)`. Vectores: `u⃗ = (1, −2)` o simplemente `u = (1, −2)`. Probabilidad: `P(A|B)` ESTÁ PROHIBIDO dentro de fracción; fuera de fracciones sí se puede usar `|` normal… pero el comprobador marca `⟨…|…|…⟩`. Para condicionada usa `P(A / B)` o `P(A|B)` fuera de fracciones.
- Texto plano para el resto. Respuestas cortas (caben en un botón de móvil: ideal < 30 caracteres).

## Calidad (lo más importante)
1. Las respuestas TIENEN que ser correctas. Calcula la respuesta en el código a partir de los parámetros aleatorios (no a mano) y elige parámetros que den resultados limpios (enteros o fracciones sencillas). Revisa los ejemplos de `node tq.js archivo 3` uno a uno haciendo la cuenta.
2. Las incorrectas deben ser errores típicos de alumnos (signo, olvidar la regla de la cadena, sumar en vez de multiplicar...), nunca absurdas, y nunca otra respuesta también correcta (ojo con formas equivalentes: 1/2 y 0,5; 2x+2 y 2(x+1)).
3. Variedad: para cada tema, unas 10-14 plantillas `genr` de tipos de pregunta DISTINTOS + 6-10 preguntas fijas `add` conceptuales. Cálculo de "cabeza o papel corto": se juega contrarreloj (≈10 s por pregunta, hasta 60 s en problemas). Puedes marcar algún problema largo con `r.p = 1` antes de devolverlo (tipo "usa papel"), como mucho 1-2 por tema.
4. Nivel adecuado al curso indicado para cada tema. Notación española de los libros de texto.
5. Temas "flash" (fl10, fl11, fl12): preguntas de 1-3 segundos, de cabeza, muy cortas (estilo `x · x = ?` → `x^{2}`). Para los flash, en lugar de genr usa la función global `fl(t, function () { return { q: ..., a: ..., w: [...], bar: [...], e: '...' }; })` (bar = incorrectas que son barbaridad; e obligatoria). Unas 12-15 plantillas por tema flash.

Cuando acabes: `node tq.js tuarchivo` debe dar MAL 0. Responde con un resumen breve: nº de fijas y generadores por tema y cualquier duda. No toques otros archivos.
