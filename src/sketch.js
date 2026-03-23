/**
 * Super Bomberman Clone 
 * Proyecto: Graficación SCC-1010
 * Incrementos 1-4: Mapa + Jugador + Bombas + Enemigos + Vidas
 */

// Constantes Globales (basado en el MVP)
const CELL = 40;
const COLS = 14;
const ROWS = 14;
const HUD_HEIGHT = 30; // Altura de la barra HUD

// Variables principales
let gameMap = [];
let sprites = {};
let sounds = {};
let bombs = [];
let explosions = [];
let enemies = [];
let gameState = 'PLAYING'; // 'PLAYING', 'GAME_OVER', 'WIN'

// Jugador - Movimiento Casilla por Casilla y Animaciones
let player = {
  x: CELL, 
  y: CELL,
  targetX: CELL,
  targetY: CELL,
  col: 1,
  row: 1,
  targetCol: 1,
  targetRow: 1,
  speed: 2,
  isMoving: false,
  dir: 'DOWN',
  frame: 0,
  animCycle: 0,
  lives: 3,
  invincible: false,
  invincibleUntil: 0,
  // Death animation
  dying: false,
  deathFrame: 0,
  deathStartAt: 0
};

// Assets específicos
let imgPlayer, imgEnemies, imgTiles, imgItems, imgBombs;
// Sprites limpios por tipo y direccion (fondo transparente, generados con flood-fill)
let imgSprites = {};  // imgSprites['balloon_down'], ['balloon_right'], etc.

function preload() {
  imgPlayer = loadImage('../assets/SNES - Super Bomberman - Playable Characters - Bomberman.png');
  imgEnemies = loadImage('../assets/enemies_items_sheet.gif');
  imgTiles   = loadImage('../assets/tileset_sheet.png');
  imgItems   = loadImage('../assets/items_sheet.png');
  imgBombs   = loadImage('../assets/Saturn - Saturn Bomberman - Bombs and Explosions.png');

  // Balloon: tiras de 3 frames 16×24 por direccion
  imgSprites['balloon_down']  = loadImage('../assets/balloon_down.png');
  imgSprites['balloon_right'] = loadImage('../assets/balloon_right.png');
  imgSprites['balloon_up']    = loadImage('../assets/balloon_up.png');

  // Minvo (robot): tiras de 2 frames 16×28 por direccion
  imgSprites['minvo_down']    = loadImage('../assets/minvo_down.png');
  imgSprites['minvo_right']   = loadImage('../assets/minvo_right.png');
  imgSprites['minvo_up']      = loadImage('../assets/minvo_up.png');

  // Onil (bola azul): tiras con distinto numero de frames 16×16
  //   down → 10 frames (ping-pong),  up → 4 frames,  lr → 6 frames
  imgSprites['onil_down']     = loadImage('../assets/onil_down.png');
  imgSprites['onil_up']       = loadImage('../assets/onil_up.png');
  imgSprites['onil_lr']       = loadImage('../assets/onil_lr.png');

  sounds.bombPlace = loadSound('../assets/bomb_place.wav');
  sounds.explosion = loadSound('../assets/explosion.wav');
  sounds.death     = loadSound('../assets/death.wav');
}

function setup() {
  createCanvas(CELL * COLS, CELL * ROWS);
  noSmooth();
  initGame();
}

function initGame() {
  randomSeed(42);
  gameMap = generateMap();
  bombs = [];
  explosions = [];
  enemies = [];
  gameState = 'PLAYING';
  
  // Reset player
  player.x = CELL;
  player.y = CELL;
  player.targetX = CELL;
  player.targetY = CELL;
  player.col = 1;
  player.row = 1;
  player.targetCol = 1;
  player.targetRow = 1;
  player.isMoving = false;
  player.dir = 'DOWN';
  player.frame = 0;
  player.animCycle = 0;
  player.lives = 3;
  player.invincible = false;
  player.invincibleUntil = 0;
  player.dying = false;
  player.deathFrame = 0;
  player.deathStartAt = 0;
  
  // Limpiar fondos de sprites que lo necesitan
  removeBackground(imgBombs);
  removeBackground(imgTiles);
  
  // Chroma key específico y agresivo del sprite del jugador
  imgPlayer.loadPixels();
  for (let i = 0; i < imgPlayer.pixels.length; i += 4) {
    let r = imgPlayer.pixels[i];
    let g = imgPlayer.pixels[i+1];
    let b = imgPlayer.pixels[i+2];
    let isGreen = (g > r + 10) && (g > b - 20) && (r < 120);
    let isCyan  = (g > 80) && (b > 80) && (r < 80);
    if (isGreen || isCyan) {
      imgPlayer.pixels[i+3] = 0;
    }
  }
  imgPlayer.updatePixels();
  
  // Spawn de enemigos
  spawnEnemies();
}

/**
 * Elimina el fondo de un sprite sheet usando el pixel (0,0) como clave.
 * Para imgEnemies el fondo exacto es cian puro (0, 255, 255).
 * Usa tolerancia amplia (30) para cubrir variaciones de compresion GIF.
 */
function removeBackground(img) {
  img.loadPixels();
  if (!img.pixels || img.pixels.length === 0) return;

  let bgR = img.pixels[0];
  let bgG = img.pixels[1];
  let bgB = img.pixels[2];

  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i+1];
    let b = img.pixels[i+2];

    // Tolerancia amplia para GIFs con dithering/compresion
    if (abs(r - bgR) < 30 && abs(g - bgG) < 30 && abs(b - bgB) < 30) {
      img.pixels[i+3] = 0;
    }
  }
  img.updatePixels();
}

function draw() {
  background(34, 139, 34); 
  
  if (gameState === 'PLAYING') {
    drawMap();
    updateBombs();
    updateExplosions();
    drawBombs();
    drawExplosions();
    
    if (!player.dying) {
      updatePlayer();
      checkPlayerExplosionCollision();
    } else {
      updateDeathAnimation();
    }
    drawPlayer();
    
    updateEnemies();
    drawEnemies();
    checkEnemyExplosionCollision();
    
    if (!player.dying) {
      checkEnemyPlayerCollision();
    }
    
    // Verificar victoria
    if (enemies.length === 0) {
      gameState = 'WIN';
    }
    
    drawHUD();
    
  } else if (gameState === 'GAME_OVER') {
    drawMap();
    drawBombs();
    drawExplosions();
    drawEnemies();
    drawHUD();
    drawGameOver();
    
  } else if (gameState === 'WIN') {
    drawMap();
    drawHUD();
    drawVictory();
  }
}

// ========================================
// INCREMENTO 1: GENERACIÓN PROCEDURAL
// ========================================
function generateMap() {
  let map = [];
  for (let row = 0; row < ROWS; row++) {
    map[row] = [];
    for (let col = 0; col < COLS; col++) {
      if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
        map[row][col] = 1;
      } else if (row % 2 === 0 && col % 2 === 0) {
        map[row][col] = 1;
      } else if (row <= 2 && col <= 2) {
        map[row][col] = 0;
      } else {
        map[row][col] = random() < 0.4 ? 2 : 0;
      }
    }
  }
  return map;
}

function drawMap() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = c * CELL;
      let y = r * CELL;
      if (gameMap[r][c] === 1) {
        drawTile(x, y, 1);
      } else if (gameMap[r][c] === 2) {
        drawTile(x, y, 2);
      } else {
        drawTile(x, y, 0);
      }
    }
  }
}

function drawTile(x, y, type) {
  push();
  translate(x, y);
  let sx = 0, sy = 0;
  if (type === 1) {
    sx = 32; sy = 0; 
    image(imgTiles, 0, 0, CELL, CELL, sx, sy, 16, 16);
  } else if (type === 2) {
    sx = 0; sy = 48; 
    image(imgTiles, 0, 0, CELL, CELL, sx, sy, 16, 16);
  } else {
    sx = 64; sy = 0; 
    image(imgTiles, 0, 0, CELL, CELL, sx, sy, 16, 16);
  }
  pop();
}

// ========================================
// INCREMENTO 2: JUGADOR + MOVIMIENTO
// ========================================
function updatePlayer() {
  // Verificar invincibilidad
  if (player.invincible && frameCount > player.invincibleUntil) {
    player.invincible = false;
  }
  
  if (abs(player.x - player.targetX) < player.speed && abs(player.y - player.targetY) < player.speed) {
    player.x = player.targetX;
    player.y = player.targetY;
    player.col = player.targetCol;
    player.row = player.targetRow;
    player.isMoving = false;
    
    let nextCol = player.col;
    let nextRow = player.row;
    let intent = false;
    
    if (keyIsDown(LEFT_ARROW)) {
      nextCol--;
      player.dir = 'LEFT';
      intent = true;
    } else if (keyIsDown(RIGHT_ARROW)) {
      nextCol++;
      player.dir = 'RIGHT';
      intent = true;
    } else if (keyIsDown(UP_ARROW)) {
      nextRow--;
      player.dir = 'UP';
      intent = true;
    } else if (keyIsDown(DOWN_ARROW)) {
      nextRow++;
      player.dir = 'DOWN';
      intent = true;
    }
    
    if (intent) {
      if (!isSolid(nextCol, nextRow)) {
        player.targetCol = nextCol;
        player.targetRow = nextRow;
        player.targetX = nextCol * CELL;
        player.targetY = nextRow * CELL;
        player.isMoving = true;
      } else {
        player.frame = 0;
        player.animCycle = 0;
      }
    } else {
      player.frame = 0;
      player.animCycle = 0;
    }
  }
  
  if (player.isMoving) {
    if (player.x < player.targetX) player.x += player.speed;
    else if (player.x > player.targetX) player.x -= player.speed;
    if (player.y < player.targetY) player.y += player.speed;
    else if (player.y > player.targetY) player.y -= player.speed;
    
    if (frameCount % 6 === 0) {
      player.animCycle = (player.animCycle + 1) % 4;
    }
  }
}

function isSolid(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
  return gameMap[row][col] === 1 || gameMap[row][col] === 2 || gameMap[row][col] === 3;
}

// ========================================
// INCREMENTO 3: SISTEMA DE BOMBAS
// ========================================
function keyPressed() {
  if (gameState === 'GAME_OVER' || gameState === 'WIN') {
    if (key === 'r' || key === 'R') {
      initGame();
    }
    return;
  }
  
  if (key === ' ' || key === 'Spacebar') {
    // LÍMITE DE 1 BOMBA A LA VEZ
    if (bombs.length >= 1) return;
    if (player.dying) return;
    
    let col = round(player.x / CELL);
    let row = round(player.y / CELL);
    
    if (gameMap[row][col] === 0 || gameMap[row][col] === 4) {
      bombs.push({ col: col, row: row, placedAt: frameCount });
      gameMap[row][col] = 3;
      if (sounds.bombPlace && sounds.bombPlace.isLoaded && sounds.bombPlace.isLoaded()) {
        sounds.bombPlace.play();
      }
    }
  }
}

function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    let b = bombs[i];
    if (frameCount - b.placedAt >= 180) {
      explodeBomb(b);
      bombs.splice(i, 1);
    }
  }
}

function explodeBomb(b) {
  if (sounds.explosion && sounds.explosion.isLoaded && sounds.explosion.isLoaded()) {
    sounds.explosion.play();
  }
  
  let cellsAffected = [{col: b.col, row: b.row}];
  gameMap[b.row][b.col] = 0;
  
  let dirs = [{dc: 0, dr: -1}, {dc: 0, dr: 1}, {dc: -1, dr: 0}, {dc: 1, dr: 0}];
  
  for (let d of dirs) {
    for (let rad = 1; rad <= 2; rad++) {
      let nc = b.col + d.dc * rad;
      let nr = b.row + d.dr * rad;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) break;
      let type = gameMap[nr][nc];
      if (type === 1) {
        break;
      } else if (type === 2) {
        cellsAffected.push({col: nc, row: nr});
        break;
      } else if (type === 0 || type === 4 || type === 3) {
        cellsAffected.push({col: nc, row: nr});
      }
    }
  }
  
  explosions.push({
    cells: cellsAffected,
    explodedAt: frameCount
  });
  
  for (let c of cellsAffected) {
    gameMap[c.row][c.col] = 4;
  }
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    let exp = explosions[i];
    if (frameCount - exp.explodedAt >= 30) {
      for (let c of exp.cells) {
        if (gameMap[c.row][c.col] === 4) {
          gameMap[c.row][c.col] = 0;
        }
      }
      explosions.splice(i, 1);
    }
  }
}

function drawBombs() {
  for (let b of bombs) {
    push();
    translate(b.col * CELL + CELL/2, b.row * CELL + CELL/2);
    let pulse = map(sin(frameCount * 0.1), -1, 1, 0.9, 1.1);
    scale(pulse);
    let f = floor(frameCount / 8) % 3;
    let bombSX = [32, 16, 0][f];
    let sy = 1, sw = 16, sh = 14;
    imageMode(CENTER);
    image(imgBombs, 0, 0, CELL, CELL, bombSX, sy, sw, sh);
    pop();
  }
}

function drawExplosions() {
  const FRAME_BASES = [85, 172, 256];
  const EXPLO_DURATION = 45;

  for (let exp of explosions) {
    let elapsed = frameCount - exp.explodedAt;
    let animFrame = floor(map(elapsed, 0, EXPLO_DURATION, 0, 3));
    animFrame = constrain(animFrame, 0, 2);
    let xb = FRAME_BASES[animFrame];
    let center = exp.cells[0];
    
    let minCol = center.col, maxCol = center.col;
    let minRow = center.row, maxRow = center.row;
    for (let c of exp.cells) {
      if (c.col < minCol) minCol = c.col;
      if (c.col > maxCol) maxCol = c.col;
      if (c.row < minRow) minRow = c.row;
      if (c.row > maxRow) maxRow = c.row;
    }
    
    for (let c of exp.cells) {
      push();
      translate(c.col * CELL + CELL/2, c.row * CELL + CELL/2);
      let sx = xb + 34, sy = 49;
      
      if (c.col === center.col && c.row === center.row) {
        sx = xb + 34; sy = 49;
      } else if (c.col < center.col) {
        if (c.col === minCol) { sx = xb + 0; sy = 49; }
        else { sx = xb + 17; sy = 49; }
      } else if (c.col > center.col) {
        if (c.col === maxCol) { sx = xb + 68; sy = 49; }
        else { sx = xb + 51; sy = 49; }
      } else if (c.row < center.row) {
        if (c.row === minRow) { sx = xb + 68; sy = 49; rotate(-HALF_PI); }
        else { sx = xb + 34; sy = 32; }
      } else if (c.row > center.row) {
        if (c.row === maxRow) { sx = xb + 68; sy = 49; rotate(HALF_PI); }
        else { sx = xb + 34; sy = 66; }
      }
      
      imageMode(CENTER);
      image(imgBombs, 0, 0, CELL + 2, CELL + 2, sx, sy, 16, 16);
      pop();
    }
  }
}

// ========================================
// INCREMENTO 4: SISTEMA DE ENEMIGOS
// ========================================

/**
 * Spawn de los 3 tipos de enemigos en celdas libres lejos del jugador
 */
function spawnEnemies() {
  let types = [
    { type: 'balloon', speed: 1.5 },
    { type: 'onil',    speed: 2   },
    { type: 'minvo',   speed: 2, nextPanic: 180, panicEnd: 0, lastDc: 1, lastDr: 0 }
  ];
  
  for (let t of types) {
    let pos = findFreeCell();
    if (pos) {
      enemies.push({
        ...t,
        col: pos.col, row: pos.row,
        x: pos.col * CELL, y: pos.row * CELL,
        targetCol: pos.col, targetRow: pos.row,
        animTick: 0,   // avanza solo al moverse; drive el calculo ping-pong
        isMoving: false,
        alive: true,
        dir: 'DOWN'
      });
    }
  }
}

/**
 * Busca celda libre aleatoria lejos del spawn del jugador
 */
function findFreeCell() {
  let candidates = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (gameMap[r][c] === 0) {
        let dist = abs(c - 1) + abs(r - 1); // Distancia Manhattan al spawn
        if (dist > 5) {
          candidates.push({col: c, row: r});
        }
      }
    }
  }
  if (candidates.length === 0) return null;
  return random(candidates);
}

/**
 * Verifica si la celda está libre para enemigos
 */
function isFreeForEnemy(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  return gameMap[row][col] === 0;
}

/**
 * Obtiene las celdas vecinas libres para un enemigo
 */
function getFreeNeighbors(col, row) {
  let dirs = [
    {dc: 0, dr: -1}, {dc: 0, dr: 1},
    {dc: -1, dr: 0}, {dc: 1, dr: 0}
  ];
  return dirs.filter(d => isFreeForEnemy(col + d.dc, row + d.dr));
}

/**
 * Aplica la dirección al sprite (UP, DOWN, LEFT, RIGHT)
 */
function applyEnemyDirection(e, dc, dr) {
  if (dc === 1) e.dir = 'RIGHT';
  else if (dc === -1) e.dir = 'LEFT';
  else if (dr === 1) e.dir = 'DOWN';
  else if (dr === -1) e.dir = 'UP';
}

/**
 * Movimiento base cell-based para todos los enemigos.
 * Espejo exacto del jugador: snap a la celda destino, luego elige siguiente.
 * isMoving se activa mientras viaja entre celdas (permite interpolacion suave).
 */
function moveEnemy(e) {
  let targetX = e.targetCol * CELL;
  let targetY = e.targetRow * CELL;

  if (abs(e.x - targetX) < e.speed && abs(e.y - targetY) < e.speed) {
    // Snap exacto al centro de la celda
    e.x = targetX;
    e.y = targetY;
    e.col = e.targetCol;
    e.row = e.targetRow;
    e.isMoving = false;

    // Elegir siguiente celda segun personalidad
    if (e.type === 'balloon') chooseNextCellBalloon(e);
    if (e.type === 'onil')    chooseNextCellOnil(e);
    if (e.type === 'minvo')   chooseNextCellMinvo(e);

    // Si el destino cambio, activar movimiento
    if (e.targetCol !== e.col || e.targetRow !== e.row) {
      e.isMoving = true;
    }
  } else {
    // Interpolar suavemente hacia la celda destino (igual que el jugador)
    e.isMoving = true;
    if (e.x < targetX) e.x = min(e.x + e.speed, targetX);
    else if (e.x > targetX) e.x = max(e.x - e.speed, targetX);
    if (e.y < targetY) e.y = min(e.y + e.speed, targetY);
    else if (e.y > targetY) e.y = max(e.y - e.speed, targetY);
  }
}

// --- Balloon (Rojo) — "El Tonto": dirección aleatoria, velocidad 1.5 ---
function chooseNextCellBalloon(e) {
  let options = getFreeNeighbors(e.col, e.row);
  if (options.length === 0) return;
  let chosen = random(options);
  e.targetCol = e.col + chosen.dc;
  e.targetRow = e.row + chosen.dr;
  applyEnemyDirection(e, chosen.dc, chosen.dr);
}

// --- Onil (Azul) — "El Stalker": 70% hacia jugador, 30% aleatorio, velocidad 2 ---
function chooseNextCellOnil(e) {
  let options = getFreeNeighbors(e.col, e.row);
  if (options.length === 0) return;
  
  let chosen;
  if (random() < 0.7) {
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
    chosen = random(options);
  }
  e.targetCol = e.col + chosen.dc;
  e.targetRow = e.row + chosen.dr;
  applyEnemyDirection(e, chosen.dc, chosen.dr);
}

// --- Minvo (Verde) — "El Impredecible": sigue recto, pánico cada 3-5s ---
function chooseNextCellMinvo(e) {
  let options = getFreeNeighbors(e.col, e.row);
  if (options.length === 0) return;

  // Verificar modo pánico
  if (frameCount > e.panicEnd) {
    if (frameCount > e.nextPanic) {
      e.panicEnd = frameCount + 60; // Pánico dura 1 segundo
      e.nextPanic = frameCount + floor(random(180, 300));
    }
  }

  let chosen;
  if (frameCount < e.panicEnd) {
    // MODO PÁNICO: aleatorio total, velocidad alta
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
  applyEnemyDirection(e, chosen.dc, chosen.dr);
}

/**
 * Calcula el frame actual de una animacion ping-pong dado un tick y el total de frames.
 * Ej: 6 frames → secuencia 0,1,2,3,4,5,4,3,2,1,0,1,2...
 * Periodo = (n-1)*2 ; dentro del periodo: tick<n → tick ; sino → 2*(n-1) - tick
 */
function pingPong(tick, n) {
  if (n <= 1) return 0;
  let period = (n - 1) * 2;
  let t = tick % period;
  return t < n ? t : period - t;
}

/**
 * Actualiza todos los enemigos.
 * animTick avanza un paso por cada intervalo de 6 frames SOLO cuando se mueve,
 * igual que animCycle del jugador (que avanza con frameCount%6).
 */
function updateEnemies() {
  for (let e of enemies) {
    moveEnemy(e);

    if (e.isMoving) {
      if (frameCount % 6 === 0) {
        e.animTick = (e.animTick + 1);
      }
    } else {
      e.animTick = 0;  // reset al detenerse, igual que animCycle del jugador
    }
  }
}

/**
 * Dibuja todos los enemigos con animacion ping-pong y sprites direccionales.
 *
 * ONIL (imgOnil — 320x16 px, stride 16px):
 *   Frames [0-9]  = DOWN  (10 frames, y=176 en sheet original)
 *   Frames [10-13]= UP    ( 4 frames, y=194)
 *   Frames [14-19]= LR    ( 6 frames, y=194) — flip si LEFT
 *
 * MINVO (imgMinvo — 192x32 px, stride 32px):
 *   Frames [0-1] = LR    (izq/der — flip si LEFT)
 *   Frames [2-3] = DOWN
 *   Frames [4-5] = UP
 *   Fuente: coordenadas exactas medidas en Paint (32x32 px cada frame)
 *
 * BALLOON (imgBalloon — 192x24 px, stride 16px):
 *   12 frames, unica vista, flip si LEFT
 *
 * Transformaciones 2D: TRASLACION + ESCALAMIENTO (flip horizontal)
 */
function drawEnemies() {
  for (let e of enemies) {
    push();
    // TRASLACION: coloca al enemigo en su posicion del mapa
    translate(e.x, e.y);

    if (e.type === 'balloon') {
      // 12 frames ping-pong, misma vista, flip para LEFT
      let f = pingPong(e.animTick, 12);
      if (e.dir === 'LEFT') { translate(CELL, 0); scale(-1, 1); }
      image(imgBalloon, 4, -8, 32, 48,  f * 16, 0, 16, 24);

    } else if (e.type === 'onil') {
      // Frames direccionales: DOWN=[0-9], UP=[10-13], LR=[14-19]
      let startF, countF, doFlip = false;
      if      (e.dir === 'DOWN') { startF = 0;  countF = 10; }
      else if (e.dir === 'UP')   { startF = 10; countF = 4;  }
      else                       { startF = 14; countF = 6;  doFlip = (e.dir === 'LEFT'); }

      let f = startF + pingPong(e.animTick, countF);
      if (doFlip) { translate(CELL, 0); scale(-1, 1); }
      image(imgOnil, 0, 0, CELL, CELL,  f * 16, 0, 16, 16);

    } else if (e.type === 'minvo') {
      // Frames direccionales reales (32x32 px): LR=[0-1], DOWN=[2-3], UP=[4-5]
      // Stride = 32px en la tira horizontal
      let startF, doFlip = false;
      if      (e.dir === 'DOWN')  { startF = 2; }
      else if (e.dir === 'UP')    { startF = 4; }
      else                        { startF = 0; doFlip = (e.dir === 'LEFT'); }

      let f = startF + pingPong(e.animTick, 2);  // 2 frames por direccion
      if (doFlip) { translate(CELL, 0); scale(-1, 1); }
      // 32x32 fuente → dibujado a CELL x CELL (40x40) en pantalla
      image(imgMinvo, 0, 0, CELL, CELL,  f * 32, 0, 32, 32);

      // Efecto panico: parpadeo rojo rapido
      if (frameCount < e.panicEnd && frameCount % 4 < 2) {
        fill(255, 0, 0, 80);
        noStroke();
        rect(0, 0, CELL, CELL);
      }
    }

    pop();
  }
}

// ========================================
// COLISIONES
// ========================================

/**
 * Colisión Enemigo ↔ Jugador: si distancia < CELL*0.6 y no invincible → pierde vida
 */
function checkEnemyPlayerCollision() {
  if (player.invincible || player.dying) return;
  
  for (let e of enemies) {
    let dx = (e.x + CELL/2) - (player.x + CELL/2);
    let dy = (e.y + CELL/2) - (player.y + CELL/2);
    let dist = sqrt(dx * dx + dy * dy);
    
    if (dist < CELL * 0.6) {
      playerHit();
      break;
    }
  }
}

/**
 * Colisión Jugador ↔ Explosión
 */
function checkPlayerExplosionCollision() {
  if (player.invincible || player.dying) return;
  
  let pCol = round(player.x / CELL);
  let pRow = round(player.y / CELL);
  
  if (gameMap[pRow] && gameMap[pRow][pCol] === 4) {
    playerHit();
  }
}

/**
 * Colisión Enemigo ↔ Explosión: enemigo en celda tipo 4 → muere
 */
function checkEnemyExplosionCollision() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    let eCol = round(e.x / CELL);
    let eRow = round(e.y / CELL);
    
    if (gameMap[eRow] && gameMap[eRow][eCol] === 4) {
      enemies.splice(i, 1);
    }
  }
}

/**
 * Jugador recibe daño
 */
function playerHit() {
  player.lives--;
  
  if (sounds.death && sounds.death.isLoaded && sounds.death.isLoaded()) {
    sounds.death.play();
  }
  
  if (player.lives <= 0) {
    // Iniciar animación de muerte y luego Game Over
    player.dying = true;
    player.deathFrame = 0;
    player.deathStartAt = frameCount;
  } else {
    // Iniciar animación de muerte breve y respawn
    player.dying = true;
    player.deathFrame = 0;
    player.deathStartAt = frameCount;
  }
}

/**
 * Actualiza la animación de muerte (Knock-Out del sprite sheet)
 */
function updateDeathAnimation() {
  let elapsed = frameCount - player.deathStartAt;
  
  // 5 frames de knockout, cada uno dura 12 frames de juego = 60 frames total (1 segundo)
  player.deathFrame = floor(elapsed / 12);
  
  if (player.deathFrame >= 7) {
    // Animación terminó
    if (player.lives <= 0) {
      gameState = 'GAME_OVER';
    } else {
      // Respawn
      respawnPlayer();
    }
  }
}

/**
 * Respawnea al jugador en la posición inicial con inmunidad
 */
function respawnPlayer() {
  player.x = CELL;
  player.y = CELL;
  player.targetX = CELL;
  player.targetY = CELL;
  player.col = 1;
  player.row = 1;
  player.targetCol = 1;
  player.targetRow = 1;
  player.isMoving = false;
  player.dir = 'DOWN';
  player.frame = 0;
  player.animCycle = 0;
  player.dying = false;
  player.deathFrame = 0;
  player.invincible = true;
  player.invincibleUntil = frameCount + 120; // 2 segundos de invincibilidad
}

// ========================================
// RENDERIZADO DEL JUGADOR
// ========================================
function drawPlayer() {
  push();
  translate(player.x, player.y);
  
  if (player.dying) {
    // Animación de Knock-Out del sprite sheet del jugador
    // Knock-Out row empieza en y≈145, cada frame 16x24, padX≈18
    let koFrame = constrain(player.deathFrame, 0, 6);
    let sx = 3 + (koFrame * 18);
    let sy = 145;
    
    image(imgPlayer, 4, -8, 32, 48, sx, sy, 16, 24);
  } else {
    // Parpadeo de invencibilidad
    if (player.invincible && frameCount % 6 < 3) {
      pop();
      return; // No se dibuja → efecto parpadeo
    }
    
    // Animación normal de caminata
    const startX = 3;
    const startY = 49;
    const padX = 18;
    const padY = 24;
    
    const anims = {
      'DOWN':  { row: 0, cols: [1, 0, 1, 2] },
      'RIGHT': { row: 1, cols: [1, 0, 1, 2] },
      'UP':    { row: 2, cols: [1, 0, 1, 2] },
      'LEFT':  { row: 3, cols: [1, 0, 1, 2] }
    };
    
    let currentAnim = anims[player.dir];
    let colIndex = currentAnim.cols[player.animCycle];
    let sx = startX + (colIndex * padX);
    let sy = startY + (currentAnim.row * padY);
    
    image(imgPlayer, 4, -8, 32, 48, sx, sy, 16, 24);
  }
  pop();
}

// ========================================
// HUD + GAME OVER + VICTORIA
// ========================================

/**
 * Dibuja el HUD semi-transparente sobre la primera fila de muros
 */
function drawHUD() {
  push();
  // Fondo semitransparente sobre la primera fila
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, CELL * COLS, HUD_HEIGHT);
  
  // Texto de vidas
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text('❤ x ' + player.lives, 10, HUD_HEIGHT / 2);
  
  // Texto de enemigos restantes
  textAlign(RIGHT, CENTER);
  text('Enemigos: ' + enemies.length, CELL * COLS - 10, HUD_HEIGHT / 2);
  
  // Indicador de bomba disponible
  textAlign(CENTER, CENTER);
  let bombText = bombs.length === 0 ? '💣 Disponible' : '💣 Activa...';
  text(bombText, CELL * COLS / 2, HUD_HEIGHT / 2);
  
  pop();
}

/**
 * Pantalla de Game Over con escalamiento animado
 */
function drawGameOver() {
  push();
  // Overlay oscuro
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  // Texto animado con escalamiento (Transformación 2D)
  translate(width / 2, height / 2);
  let s = map(sin(frameCount * 0.05), -1, 1, 0.9, 1.1);
  scale(s);
  
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255, 50, 50);
  stroke(0);
  strokeWeight(3);
  text('GAME OVER', 0, -20);
  
  textSize(18);
  fill(255);
  noStroke();
  text('Presiona R para reiniciar', 0, 30);
  pop();
}

/**
 * Pantalla de Victoria
 */
function drawVictory() {
  push();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  translate(width / 2, height / 2);
  let s = map(sin(frameCount * 0.05), -1, 1, 0.95, 1.05);
  scale(s);
  
  textAlign(CENTER, CENTER);
  textSize(42);
  fill(50, 255, 50);
  stroke(0);
  strokeWeight(3);
  text('¡VICTORIA!', 0, -20);
  
  textSize(18);
  fill(255);
  noStroke();
  text('Presiona R para reiniciar', 0, 30);
  pop();
}
