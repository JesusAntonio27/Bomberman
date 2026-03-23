# 🎯 MVP y Alcance — Super Bomberman Clone (p5.js)
## Proyecto Final Graficación SCC-1010

---

## Objetivo del Proyecto

Diseñar e implementar un programa gráfico interactivo que replica la mecánica central de **Super Bomberman** (SNES, 1992), demostrando el uso de transformaciones bidimensionales (traslación, escalamiento y rotación), mapas de bits y primitivas 2D, así como interacción por teclado en tiempo real dentro del entorno p5.js versión 1.

---

## Alcance del MVP (Mínimo Viable)

El proyecto se considera completo cuando cumple estos puntos:

| # | Funcionalidad | Criterio de Aceptación |
|---|---|---|
| 1 | Mapa procedural | Se genera un nivel diferente en cada inicio de partida |
| 2 | Movimiento del jugador | Se desplaza en 4 direcciones sin atravesar muros |
| 3 | Sistema de bombas | Se coloca con SPACE y explota en 3 segundos |
| 4 | Explosión con escala | La onda de explosión crece visualmente usando `scale()` |
| 5 | Destrucción de bloques | Los bloques blandos desaparecen al contacto con explosión |
| 6 | Enemigos con 3 personalidades | Balloon (aleatorio), Onil (persigue), Minvo (impredecible) — todos cell-based sin atascos |
| 7 | Condición de victoria | Todos los enemigos mueren → mensaje de victoria |
| 8 | Game Over | Jugador muere → pantalla de Game Over con opción de reinicio |

---

## Sistema de Enemigos (3 Personalidades Cell-Based)

Todos se mueven celda por celda — solo eligen dirección al terminar de cruzar una celda, y solo entre celdas libres. Cero atascos garantizados.

| Enemigo | Color | Velocidad | Lógica |
|---|---|---|---|
| **Balloon** | Rojo 🔴 | Lenta (1.5px) | Aleatoria entre celdas libres. El más fácil, da falsa seguridad |
| **Onil** | Azul 🔵 | Media (2px) | 70% elige la dirección que acerca al jugador, 30% aleatorio |
| **Minvo** | Verde 🟢 | Media (2px) / Rápida (3.5px) | Prefiere seguir recto, pero cada 3–5s entra en "modo pánico" con velocidad alta y dirección completamente aleatoria |

 (no incluir)

- ❌ Power-ups (aumentar radio de bomba, más bombas)
- ❌ Modo multijugador
- ❌ Sonido / música
- ❌ Múltiples niveles o pantallas de menú elaboradas
- ❌ IA de pathfinding avanzado (A*)

---

## Transformaciones 2D Implementadas

| Transformación | Dónde se aplica | Función p5.js |
|---|---|---|
| **Traslación** | Movimiento del jugador y enemigos | `translate(x, y)` |
| **Escalamiento** | Animación de crecimiento de explosión | `scale(factor)` |
| **Rotación** *(bonus)* | Bloques girando al ser destruidos | `rotate(angle)` |

---

## Plan de Incrementos

```
Incremento 1 → Canvas + Generación Procedural del Mapa
Incremento 2 → Jugador Dibujado + Movimiento con Teclado (Traslación)
Incremento 3 → Sistema de Bombas + Explosión Animada (Escalamiento)
Incremento 4 → Enemigos con Movimiento Aleatorio
Incremento 5 → HUD + Game Over + Condición de Victoria
Incremento 6 → Animación de Destrucción de Bloques (Rotación) [BONUS]
```

---

## Assets Necesarios

| Asset | Fuente | URL |
|---|---|---|
| Sprite sheet Bomberman | The Spriters Resource | https://www.spriters-resource.com/snes/sbomber/ |
| Colección completa | Internet Archive | https://archive.org/details/bombermansprites |
| Animación de explosión | OpenGameArt (CC-BY 3.0) | https://opengameart.org/content/bomb-explosion |

---

## Versión de p5.js

**Versión 1** — Sintaxis global (funciones sin prefijo `p5.`, acceso directo a `setup()`, `draw()`, `keyIsDown()`, `loadImage()`, etc.)