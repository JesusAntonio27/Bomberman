# 💣 Super Bomberman Clone - MVP

Este documento define el Producto Mínimo Viable (MVP) para el proyecto de Graficación (SCC-1010) basado en los lineamientos establecidos.

## 🎯 Objetivo General
Desarrollar un clon interactivo y funcional de Super Bomberman utilizando **p5.js versión 1** (sintaxis global). El proyecto debe construirse iterativamente y demostrar obligatoriamente el uso correcto de **transformaciones 2D** (traslación, escalamiento y rotación).

## 📐 Especificación Técnica del Juego
- **Canvas y Cuadrícula**: Resolución de 560x560 px. Cuadrícula de 14x14 celdas, cada celda de 40x40 px.
- **Tipos de Celda**:
  - `0`: Pasillo libre.
  - `1`: Muro sólido (indestructible).
  - `2`: Bloque destructible.
  - `3`: Bomba activa.
  - `4`: Explosión.
- **Generación del Mapa**: Procedural con paredes fijas en los bordes y pilares alternados. 40% de los espacios libres iniciales se rellenan con bloques destructibles.
- **Control del Jugador**: Uso de teclas direccionales (flechas). Velocidad de 2px/frame. Botón `SPACE` para colocar bombas.

## 🕹️ Funcionalidades Core (Características)
- **Sistema de Explosivos**: Las bombas tardan 3 segundos en explotar (180 frames). Su explosión dura 30 frames y tiene alcance en cruz (2 celdas), eliminando bloques destructibles y enemigos, o deteniéndose con muros sólidos.
- **Inteligencia de Enemigos**: Implementación cell-based (casilla a casilla) para asegurar buena navegación.
  1. **Balloon (Rojo)**: Movimiento lento, dirección aleatoria.
  2. **Onil (Azul)**: Persigue activamente acercarse al jugador el 70% del tiempo.
  3. **Minvo (Verde)**: Prefiere ir en línea recta. Ocasionalmente entra en "modo pánico" acelerando y moviéndose al azar.

## 📈 Plan de Desarrollo por Incrementos (Obligatorio)
El desarrollo debe seguir *estrictamente* este orden:
1. **Canvas + Mapa Procedural**: Terreno base interactivo (Sin movimiento ni transformaciones).
2. **Jugador + Movimiento**: Movimiento manejado por teclado y colisiones implementadas (Uso de **Traslación**).
3. **Bombas + Explosión**: Renderizado de bombas y explosiones temporizadas (Uso de **Escalamiento**).
4. **Enemigos 3 Personalidades**: Añadiendo a los enemigos y su lógica en el mapa.
5. **HUD + Integración de Estados**: UI visual, condición de Game Over por colisión, reinicio con `R`, y condición de victoria.
6. **(Bonus) Efectos Visuales**: Rotación progresiva de los bloques destructibles al ser explotados (Uso de **Rotación** y Escala).
