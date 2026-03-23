╔══════════════════════════════════════════════════════════╗
║         DOCUMENTACIÓN — INCREMENTO 1: CANVAS + MAPA      ║
╠══════════════════════════════════════════════════════════╣
║ PROMPT ENVIADO:                                           ║
║ "Sincroniza los assets originales de SNES y genera el      ║
║ mapa procedural de 14x14 para el primer incremento."      ║
╠══════════════════════════════════════════════════════════╣
║ RESULTADO OBTENIDO:                                       ║
║ Se generó un mapa de 560x560px con una cuadrícula de      ║
║ 40px por celda. Se cargaron sprites de SNES y SFX 8-bit.  ║
║ Funciones clave: preload(), setup(), generateMap(),       ║
║ drawMap(), drawTile().                                    ║
╠══════════════════════════════════════════════════════════╣
║ DESCRIPCIÓN TÉCNICA:                                      ║
║ Se implementó un algoritmo de generación de mapa con      ║
║ muros fijos y bloques aleatorios (40%).                   ║
║ Transformación 2D aplicada: TRASLACIÓN mediante           ║
║ translate() dentro de push()/pop() en drawTile() para     ║
║ posicionar cada sprite en su celda correspondiente.       ║
╠══════════════════════════════════════════════════════════╣
║ ANÁLISIS:                                                 ║
║ Esta adición enriquece el programa al establecer la       ║
║ identidad visual del clon de Bomberman.                   ║
║ Se conecta con el incremento 2 preparando la colisión      ║
║ estática necesaria para el movimiento del jugador.        ║
╚══════════════════════════════════════════════════════════╝
