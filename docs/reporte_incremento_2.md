╔══════════════════════════════════════════════════════════╗
║         DOCUMENTACIÓN — INCREMENTO 2: JUGADOR + MVMT     ║
╠══════════════════════════════════════════════════════════╣
║ PROMPT ENVIADO:                                           ║
║ "Implementa a Bomberman con movimiento estilo arcade      ║
║ estricto (casilla a casilla). Integra el sprite sheet     ║
║ original completo, limpiando su fondo verde y animando    ║
║ el ciclo de caminata clásico sin anti-aliasing."          ║
╠══════════════════════════════════════════════════════════╣
║ RESULTADO OBTENIDO:                                       ║
║ Se implementó un control direccional fiel a SNES. El      ║
║ sprite renderiza perfectamente nítido (pixelated) y el    ║
║ fondo verde se remueve dinámicamente con Chroma Key.      ║
║ Funciones clave: updatePlayer(), drawPlayer()             ║
╠══════════════════════════════════════════════════════════╣
║ DESCRIPCIÓN TÉCNICA:                                      ║
║ Se usó un indexador matricial estructurado sobre una      ║
║ imagen agrupada en frames compactos de 16x24px para un    ║
║ muestreo óptimo sin traslapes.                            ║
║ Transformación 2D aplicada: TRASLACIÓN obligatoria al     ║
║ invocar translate() dentro de push()/pop() para aislar    ║
║ visualmente a Bomberman de las coordenadas del mapa.      ║
╠══════════════════════════════════════════════════════════╣
║ ANÁLISIS:                                                 ║
║ La calibración de `noSmooth()` y el escaneo Chroma Key    ║
║ enriquecen profesionalmente el motor 2D del juego. Lo     ║
║ prepara técnica y visualmente para la colisión rústica y  ║
║ la disposición de bombas atadas a celdas (Incremento 3).  ║
╚══════════════════════════════════════════════════════════╝
