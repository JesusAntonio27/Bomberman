# 📁 Reglas del directorio `/src`

**Propósito**: Carpeta dedicada a almacenar todo el código fuente del juego.

## Normas:
1. **Sintaxis Exclusiva**: Usar **p5.js versión 1** (sintaxis global con `setup()` y `draw()` en un nivel superior, sin formato de instancia `new p5()`).
2. **Modularidad y Variables**: Evitar la dispersión. Si el juego es sencillo, todo se mantendrá en `sketch.js`, o agrupado por entidades claras como `Player.js`, `Enemy.js`, si el volumen crece.
3. **Transformaciones 2D aisaldas**: Toda función que renderice algo usando `translate()`, `rotate()` o `scale()` *debe obligatoriamente* encapsular el código entre `push()` y `pop()`.
4. **Desarrollo Iterativo**: No generar saltos de features. El código debe crecer gradualmente cumpliendo los incrementos listados en `docs/MVP-Bomberman.md`.
