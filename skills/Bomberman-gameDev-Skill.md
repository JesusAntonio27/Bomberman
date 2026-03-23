# 🎮 SKILL: Super Bomberman Clone en p5.js
## Para agente de código — Proyecto Graficación SCC-1010

---

## 🧠 Contexto del Proyecto

Eres un agente de código experto en **p5.js versión 1** (sintaxis global). Vas a construir un clon de **Super Bomberman** para un proyecto universitario de Graficación (SCC-1010, Ingeniería en Sistemas Computacionales). El juego debe cumplir requisitos académicos específicos de transformaciones 2D, elementos visuales y control por teclado.

### Reglas Absolutas de Desarrollo
- ❌ NUNCA generar todo el juego en un solo bloque de código
- ✅ SIEMPRE construir por incrementos numerados (mínimo 5 pasos)
- ✅ Cada incremento debe ser funcional y ejecutable de forma independiente
- ✅ Cada respuesta debe documentar qué transformación 2D se implementó y por qué
- ✅ Usar **p5.js versión 1** exclusivamente (funciones: `setup()`, `draw()`, `keyIsDown()`, `loadImage()`, etc.)

---

## 📐 Especificación Técnica del Juego

### Canvas y Cuadrícula
- Canvas: **560 x 560 px**
- Tamaño de celda: **40 x 40 px**
- Mapa: **14 x 14 celdas**
- Tipos de celda:
  - `0` = pasillo libre
  - `1` = muro sólido (indestructible, esquinas y bordes)
  - `2` = bloque destructible (generado proceduralmente)
  - `3` = bomba activa
  - `4` = explosión

### Generación Procedural del Mapa
```javascript
// Algoritmo de generación: bordes siempre son muros, 
// interiores alternados con bloques destructibles al azar
function generateMap() {
  let map = [];
  for (let row = 0; row < ROWS; row++) {
    map[row] = [];
    for (let col = 0; col < COLS; col++) {
      if (row === 0 || row === ROWS-1 || col === 0 || col === COLS-1) {
        map[row][col] = 1; // Muro sólido en bordes
      } else if (row % 2 === 0 && col % 2 === 0) {
        map[row][col] = 1; // Pilares internos fijos
      } else if ((row <= 2 && col <= 2) || (row <= 2 && col >= COLS-3)) {
        map[row][col] = 0; // Zona de spawn despejada
      } else {
        map[row][col] = random() < 0.4 ? 2 : 0; // 40% bloques destructibles
      }
    }
  }
  return map;
}
```

### Jugador
- Posición inicial: celda (1,1) → píxeles (40, 40)
- Velocidad: 2 px/frame
- Animación: 4 frames de caminata por dirección (arriba, abajo, izquierda, derecha)
- Control: flechas del teclado (`LEFT_ARROW`, `RIGHT_ARROW`, `UP_ARROW`, `DOWN_ARROW`)
- Colocar bomba: tecla `SPACE`

### Sistema de Bombas
- Delay de explosión: 3 segundos (180 frames a 60fps)
- Radio de explosión: 2 celdas en cruz (arriba, abajo, izquierda, derecha)
- La explosión destruye bloques tipo `2`, detiene en muros tipo `1`
- Duración visual de la explosión: 0.5 segundos (30 frames)

### Enemigos (3 Personalidades — Cell-Based)

Todos los enemigos se mueven **celda por celda completa** (no en píxeles libres). Solo eligen nueva dirección al terminar de cruzar una celda, y únicamente entre celdas libres. Esto elimina el problema de atascarse en muros.

**Base compartida de movimiento cell-based:**
```javascript
function moveEnemy(e) {
  // Si el enemigo ya llegó al centro de la celda destino, elige nueva dirección
  let targetX = e.targetCol * CELL;
  let targetY = e.targetRow * CELL;
  
  if (abs(e.x - targetX) < e.speed && abs(e.y - targetY) < e.speed) {
    e.x = targetX;
    e.y = targetY;
    e.col = e.targetCol;
    e.row = e.targetRow;
    chooseNextCell(e); // Cada tipo implementa esto diferente
  } else {
    // Seguir moviéndose hacia la celda destino
    e.x += (targetX - e.x > 0 ? 1 : -1) * e.speed;
    e.y += (targetY - e.y > 0 ? 1 : -1) * e.speed;
  }
}

function isFree(col, row) {
  return gameMap[row] && gameMap[row][col] === 0;
}

function getFreeNeighbors(col, row) {
  let dirs = [
    {dc: 0, dr: -1}, {dc: 0, dr: 1},
    {dc: -1, dr: 0}, {dc: 1, dr: 0}
  ];
  return dirs.filter(d => isFree(col + d.dc, row + d.dr));
}
```

---

#### 👾 Tipo 1 — Balloon (Rojo) "El Tonto"
- Velocidad: **1.5 px/frame** (lento)
- Al llegar a una celda, elige aleatoriamente entre todas las celdas libres adyacentes
- Completamente impredecible pero fácil de esquivar
- Da falsa seguridad al jugador

```javascript
function chooseNextCellBalloon(e) {
  let options = getFreeNeighbors(e.col, e.row);
  if (options.length === 0) return;
  let chosen = random(options);
  e.targetCol = e.col + chosen.dc;
  e.targetRow = e.row + chosen.dr;
}
```

---

#### 👾 Tipo 2 — Onil (Azul) "El Stalker"
- Velocidad: **2 px/frame** (medio)
- 70% del tiempo elige la dirección que más acerca al jugador
- 30% del tiempo elige aleatoriamente (para no ser perfecto ni quedar atrapado en loops)
- Se siente amenazante — el jugador lo ve venir

```javascript
function chooseNextCellOnil(e) {
  let options = getFreeNeighbors(e.col, e.row);
  if (options.length === 0) return;
  
  let chosen;
  if (random() < 0.7) {
    // Elige la dirección que minimiza distancia al jugador
    let playerCol = round(player.x / CELL);
    let playerRow = round(player.y / CELL);
    chosen = options.reduce((best, d) => {
      let nc = e.col + d.dc, nr = e.row + d.dr;
      let bc = e.col + best.dc, br = e.row + best.dr;
      let distNew = abs(nc - playerCol) + abs(nr - playerRow);
      let distBest = abs(bc - playerCol) + abs(br - playerRow);
      return distNew < distBest ? d : best;
    });
  } else {
    chosen = random(options); // 30% aleatorio
  }
  e.targetCol = e.col + chosen.dc;
  e.targetRow = e.row + chosen.dr;
}
```

---

#### 👾 Tipo 3 — Minvo (Verde) "El Impredecible"
- Velocidad normal: **2 px/frame** — Velocidad en pánico: **3.5 px/frame**
- Prefiere seguir recto en pasillos (misma dirección anterior si está libre)
- Cada 3–5 segundos entra en **"modo pánico"** por 1 segundo: velocidad alta + dirección completamente aleatoria en cada celda
- Te sorprende cuando crees que predijiste su ruta

```javascript
function chooseNextCellMinvo(e) {
  let options = getFreeNeighbors(e.col, e.row);
  if (options.length === 0) return;

  // Verificar si está en modo pánico
  if (frameCount > e.panicEnd) {
    // Activar pánico cada 180–300 frames (3–5 seg a 60fps)
    if (frameCount > e.nextPanic) {
      e.panicEnd = frameCount + 60; // pánico dura 1 segundo
      e.nextPanic = frameCount + floor(random(180, 300));
    }
  }

  let chosen;
  if (frameCount < e.panicEnd) {
    // MODO PÁNICO: aleatorio total
    chosen = random(options);
    e.speed = 3.5;
  } else {
    // MODO NORMAL: prefiere seguir recto
    e.speed = 2;
    let straight = options.find(d => d.dc === e.lastDc && d.dr === e.lastDr);
    chosen = straight || random(options);
  }

  e.lastDc = chosen.dc;
  e.lastDr = chosen.dr;
  e.targetCol = e.col + chosen.dc;
  e.targetRow = e.row + chosen.dr;
}
```

---

**Spawn de los 3 enemigos:**
```javascript
function spawnEnemies() {
  let types = [
    { type: 'balloon', color: [220, 50, 50],  speed: 1.5 },
    { type: 'onil',    color: [50, 100, 220], speed: 2   },
    { type: 'minvo',   color: [50, 180, 80],  speed: 2, nextPanic: 180, panicEnd: 0, lastDc: 1, lastDr: 0 }
  ];
  
  for (let t of types) {
    let pos = findFreeCell(); // celda libre lejos del spawn del jugador
    enemies.push({
      ...t,
      col: pos.col, row: pos.row,
      x: pos.col * CELL, y: pos.row * CELL,
      targetCol: pos.col, targetRow: pos.row
    });
  }
}

---

## 🎨 Assets y Sprites

### Fuentes de Sprites (usar loadImage en preload)
- **Sprite sheet principal**: descargado de The Spriters Resource - Super Bomberman SNES
  - URL referencia: https://www.spriters-resource.com/snes/sbomber/
  - Alternativa: https://archive.org/details/bombermansprites
- **Explosión**: OpenGameArt https://opengameart.org/content/bomb-explosion (CC-BY 3.0)

### Si no hay sprites disponibles → fallback con primitivas 2D
```javascript
// Dibujar Bomberman con primitivas si no hay imagen
function drawBombermanPrimitive(x, y) {
  push();
  translate(x, y);
  // Cuerpo blanco
  fill(255); noStroke();
  ellipse(0, 0, 30, 30); // cabeza
  rect(-10, 10, 20, 25); // cuerpo
  // Detalles
  fill(0);
  ellipse(-6, -3, 6, 6); // ojo izq
  ellipse(6, -3, 6, 6);  // ojo der
  fill(50, 100, 255);
  rect(-8, 10, 16, 15); // pantalón azul
  pop();
}
```

---

## 🔄 Transformaciones 2D Requeridas (Requisito Académico)

El proyecto DEBE demostrar las siguientes transformaciones. Implementar usando `push()` / `pop()` para aislar el contexto de transformación:

### 1. Traslación (OBLIGATORIA)
```javascript
// Toda entidad móvil usa translate() para posicionarse
push();
translate(player.x, player.y);
image(playerSprite, -20, -20, 40, 40);
pop();
```

### 2. Escalamiento (OBLIGATORIA)
```javascript
// Las explosiones escalan de 0 a 1 durante su animación (pulse effect)
let explosionScale = map(frameCount - bomb.explodedAt, 0, 30, 0.1, 1.0);
push();
translate(cell.x * CELL, cell.y * CELL + CELL/2);
scale(explosionScale);
fill(255, 100, 0, 200);
ellipse(0, 0, CELL, CELL);
pop();
```

### 3. Rotación (BONUS — sube calificación)
```javascript
// Los bloques destructibles rotan al ser destruidos (efecto visual)
push();
translate(block.x + CELL/2, block.y + CELL/2);
rotate(block.deathAngle); // incrementa cada frame durante la animación de muerte
scale(block.deathScale);  // decrece hasta 0
image(blockSprite, -CELL/2, -CELL/2, CELL, CELL);
pop();
```

---

## 📋 Plan de Incrementos (Seguir en Orden)

### Incremento 1: Canvas + Mapa Estático
**Objetivo**: Generar y renderizar el mapa con generación procedural.
**Entregable**: Se ve el mapa con muros, bloques y pasillos. Nada se mueve.
**Transformaciones**: Ninguna aún (base estructural).
**Código mínimo**:
```javascript
const CELL = 40, COLS = 14, ROWS = 14;
let gameMap = [];

function setup() {
  createCanvas(CELL * COLS, CELL * ROWS);
  gameMap = generateMap();
}

function draw() {
  background(34, 139, 34); // verde pasto
  drawMap();
}
```

---

### Incremento 2: Jugador + Movimiento (Traslación)
**Objetivo**: Dibujar al jugador y moverlo con flechas del teclado.
**Transformaciones**: **TRASLACIÓN** — usando `translate(player.x, player.y)`.
**Colisión**: El jugador no puede atravesar celdas tipo `1` ni `2`.
**Código del sistema de movimiento**:
```javascript
function movePlayer() {
  let nx = player.x, ny = player.y;
  if (keyIsDown(LEFT_ARROW))  nx -= player.speed;
  if (keyIsDown(RIGHT_ARROW)) nx += player.speed;
  if (keyIsDown(UP_ARROW))    ny -= player.speed;
  if (keyIsDown(DOWN_ARROW))  ny += player.speed;
  
  // Verificar colisión con mapa
  if (!collidesWithMap(nx, player.y)) player.x = nx;
  if (!collidesWithMap(player.x, ny)) player.y = ny;
}

function collidesWithMap(x, y) {
  // Verificar las 4 esquinas del jugador (bounding box de 36x36 px)
  let margin = 2;
  let corners = [
    {x: x + margin, y: y + margin},
    {x: x + CELL - margin, y: y + margin},
    {x: x + margin, y: y + CELL - margin},
    {x: x + CELL - margin, y: y + CELL - margin}
  ];
  for (let c of corners) {
    let col = floor(c.x / CELL), row = floor(c.y / CELL);
    if (gameMap[row] && (gameMap[row][col] === 1 || gameMap[row][col] === 2)) return true;
  }
  return false;
}
```

---

### Incremento 3: Sistema de Bombas + Explosión (Escalamiento)
**Objetivo**: Colocar bomba con SPACE, explotar en 3s, animar explosión.
**Transformaciones**: **ESCALAMIENTO** — la explosión crece con `scale()`.
**Estado de bomba**:
```javascript
let bombs = []; // { col, row, placedAt }
let explosions = []; // { col, row, explodedAt }

function keyPressed() {
  if (key === ' ') {
    let col = round(player.x / CELL);
    let row = round(player.y / CELL);
    bombs.push({ col, row, placedAt: frameCount });
    gameMap[row][col] = 3;
  }
}

function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    let b = bombs[i];
    if (frameCount - b.placedAt > 180) { // 3 segundos a 60fps
      explodeBomb(b);
      bombs.splice(i, 1);
    }
  }
}
```

---

### Incremento 4: Enemigos con 3 Personalidades (Cell-Based)
**Objetivo**: Agregar 3 enemigos con comportamientos distintos usando movimiento cell-based.
**Transformaciones**: **TRASLACIÓN** en cada enemigo con `translate()`.
**Por qué cell-based**: Los enemigos solo eligen nueva dirección al completar el cruce de una celda, y solo entre celdas libres — eliminando atascos en muros.

Los 3 tipos y su lógica están completamente definidos en la sección "Enemigos (3 Personalidades)" de este documento. El incremento consiste en:
1. Implementar la función base `moveEnemy(e)` y `getFreeNeighbors()`
2. Implementar `chooseNextCell` para cada tipo: Balloon, Onil y Minvo
3. Llamar a `spawnEnemies()` al inicio y `updateEnemies()` en cada frame de `draw()`
4. Detectar colisión enemigo-jugador (distancia menor a CELL/2 → Game Over)
5. Detectar colisión enemigo-explosión (celda del enemigo en lista de explosiones → muere)

---

### Incremento 5: HUD, Game Over y Condición de Victoria
**Objetivo**: Pantalla de Game Over, contador de enemigos, mensaje de victoria.
**Transformaciones**: ESCALAMIENTO en animación de Game Over (texto crece).
**Elementos**:
- HUD superior: "Enemigos: X" y "Bombas: X"
- Game Over si enemigo toca al jugador
- Victoria si todos los enemigos mueren
- Botón R para reiniciar (llama a `setup()` de nuevo)

---

### Incremento 6 (BONUS): Animación de Destrucción con Rotación
**Objetivo**: Bloques giran y encogen al ser destruidos.
**Transformaciones**: **ROTACIÓN** — `rotate(angle)` durante la animación de muerte.
**Impacto académico**: Cubre las 3 transformaciones = 20/20 pts en ese criterio.

---

## 🛠️ Estructura de Archivos del Proyecto

```
bomberman-p5/
├── sketch.js        ← código principal (todo va aquí para .mp5)
├── assets/
│   ├── bomberman_spritesheet.png
│   ├── enemy_ballom.png
│   ├── block_soft.png
│   ├── block_hard.png
│   └── explosion.png
```

### Orden de carga en preload()
```javascript
function preload() {
  sprites.player = loadImage('assets/bomberman_spritesheet.png');
  sprites.enemy = loadImage('assets/enemy_ballom.png');
  sprites.blockSoft = loadImage('assets/block_soft.png');
  sprites.blockHard = loadImage('assets/block_hard.png');
  sprites.explosion = loadImage('assets/explosion.png');
}
```

---

## 📝 Plantilla de Documentación por Incremento

Para cada incremento, el agente debe proporcionar al usuario este bloque de documentación lista para copiar al documento técnico:

```
### Incremento N: [Nombre]

**Prompt enviado**: "[Prompt exacto dado a la IA]"

**Resultado obtenido**: 
[Descripción de la funcionalidad generada]

**Descripción técnica**:
Se implementó [función/técnica] para lograr [objetivo]. 
La transformación de [TRASLACIÓN/ROTACIÓN/ESCALAMIENTO] se aplica mediante 
translate()/rotate()/scale() dentro de un bloque push()/pop() para aislar 
el contexto de transformación de p5.js.

**Análisis**:
Esta adición enriquece visualmente el programa porque [razón].
```

---

## ⚠️ Errores Comunes a Evitar

1. **No usar `push()`/`pop()`**: Las transformaciones en p5.js son acumulativas. SIEMPRE aislar con push/pop.
2. **Colisión imprecisa**: Usar bounding box reducido (margin de 2-4px) para movimiento fluido.
3. **frameCount para timers**: Preferir `frameCount - startFrame > duration` en lugar de variables de contador manual.
4. **Sprites no cargados**: Verificar que `preload()` cargue todos los assets ANTES de que `setup()` los use.
5. **`random()` en `draw()`**: Para generación del mapa, llamar `randomSeed(42)` antes para resultados reproducibles.

---

## ✅ Checklist de Requisitos Académicos

- [ ] Al menos 2 transformaciones 2D implementadas (traslación + escalamiento mínimo)
- [ ] Uso de primitivas 2D vectoriales (rectángulos del mapa, HUD)
- [ ] Uso de mapas de bits/raster (sprites de personajes con `loadImage`)
- [ ] Control por teclado funcional (flechas + SPACE)
- [ ] Mínimo 5 incrementos documentados
- [ ] Archivo exportado como `.mp5` desde plataforma Marlen
- [ ] Generación procedural de niveles documentada como paso de planeación