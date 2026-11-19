# Gran Premio de Barbaridades

Carrera de preguntas de matemáticas de ESO para repasar jugando. Modo individual y carrera online de 2 a 8 jugadores.

## Código fuente

El juego se publica como un único `index.html`, generado desde `src/`:

```
cd src && python3 build.py    # escribe ../index.html (GitHub) y src/artifact.html (versión sin servidor propio)
node tq.js q_20a.js           # comprueba las preguntas de un archivo
```

- `q_*.js`: preguntas por temas (se cargan en orden alfabético; añadir archivos nuevos al final para no cambiar los índices de los fallos guardados).
- `q_99cursos.js`: qué temas entran en cada curso (1.º ESO a 2.º Bachillerato).
- `game.js`: juego, modos, sala online e informe del profe.
