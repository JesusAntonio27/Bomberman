# 📝 Registro de Incrementos - Super Bomberman

Este documento almacena la documentación técnica generada tras la finalización de cada incremento del proyecto.

---

## 🛠️ Incremento 1: Canvas + Mapa Procedural (2026-03-22)

**Descripción**: Configuración inicial del entorno p5.js y generación automática del mapa con estética de SNES.

### 📝 Cambios Realizados
- **Infraestructura**: Estructura de carpetas y reglas de desarrollo.
- **Assets**: Carga de sprites originales de SNES y SFX de 8-bit.
- **Algoritmo**: Generación de mapa 14x14 con bloques (40%) y pilares fijos.
- **Transformación 2D**: Uso de `translate()` en `drawTile()` para posicionar los sprites.

### 🧪 Pruebas Realizada
- Verificación visual en puerto 8082.
- Comprobación de carga de assets en consola.
- Garantía de spawn despejado (3x3).

### ✅ Resultados
![Canvas de Bomberman - Incremento 1](screenshot_inc1.png)
*(Nivel generado con pilares y ladrillos originales)*

---

## 🏃 Incremento 2: Jugador + Movimiento (2026-03-22)

**Descripción**: Integración de Bomberman con movimiento estricto estilo Arcade (celda por celda). Adicionalmente, se importó visualmente su *sprite sheet* original de SNES mediante recortes absolutos pixel-perfect y corrección de color.

### 📝 Cambios Realizados
- **Estado del Jugador**: Inicia en `(40, 40)` con `speed = 2px` en bloque central lógico, con estados `dir`, `frame` y `animCycle`.
- **Controles Arcade**: Se rediseñó el movimiento continuo a comportamiento "Casilla por Casilla" como indicaban las restricciones, garantizando alineamiento perfecto en intersecciones para girar.
- **Rendering Pixel-Perfect**: Se integró la función `noSmooth()` y la regla de estilo CSS `image-rendering: pixelated` para mantener la estética pura de 16 bits sin filtros antialias de navegador.
- **Chroma Key Integrado**: El método `setup()` recorre los píxeles de la imagen (`loadPixels()`) y hace transparente el fondo verde empaquetado típicamente en los manual sprite-rips.
- **Transformación 2D**: Aplicada la *Traslación* usando de manera asilada `push()`, `translate()` y `pop()` escalando la imagen original pre-calculada 16x24 px a doble tamaño con un ligero desplazamiento en Y para un correcto anclaje de suelo `(-8px)`.

### 🧪 Pruebas Realizadas
- Confirmación visual absoluta de no difuminación (0% anti-aliasing) en la texturización general.
- Prevención de desgarros de sprites (Frame bleeding): la matemática exacta `col * 16` y `row * 24` remueve los píxeles de sombreado cortados en los 4 ciclos cardinales.

---

╔══════════════════════════════════════════════════════════╗
║         DOCUMENTACIÓN — INCREMENTO 3: SISTEMA DE BOMBAS  ║
╠══════════════════════════════════════════════════════════╣
║ PROMPT ENVIADO:                                          ║
║ "codifica el Incremento 3: sistema de bombas en p5.js    ║
║ versión 1. El jugador coloca una bomba con SPACE en su   ║
║ celda actual. La bomba explota a los 180 frames con      ║
║ radio de 2 celdas en cruz. La explosión usa scale()      ║
║ creciendo de 0 a 1 en 30 frames. Destruye bloques tipo 2,║
║ se detiene en muros tipo 1."                             ║
╠══════════════════════════════════════════════════════════╣
║ RESULTADO OBTENIDO:                                      ║
║ Se generó el comportamiento completo de colocación y     ║
║ explosión de bombas. Se actualizan celdas a tipo 3 y 4.  ║
║ Funciones clave: keyPressed(), updateBombs(),            ║
║ explodeBomb(), updateExplosions(), drawBombs() y         ║
║ drawExplosions().                                        ║
╠══════════════════════════════════════════════════════════╣
║ DESCRIPCIÓN TÉCNICA:                                     ║
║ Se implementó un algoritmo de escaneo direccional de     ║
║ rango 2 para calcular las celdas afectadas al detonar.   ║
║ Transformación 2D aplicada: ESCALAMIENTO                 ║
║ mediante scale() dentro de push()/pop() para la bomba y  ║
║ para la ráfaga (pulse effect y crecimiento de explosión).║
╠══════════════════════════════════════════════════════════╣
║ ANÁLISIS:                                                ║
║ Esta adición enriquece el programa porque añade la core  ║
║ mechanic principal del juego, y la destrucción de bloques║
║ dinámicamente.                                           ║
║ Se conecta con el incremento anterior mediante el uso    ║
║ del mismo grid de coordenadas del mapa global.           ║
╚══════════════════════════════════════════════════════════╝

---
