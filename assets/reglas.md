# 📁 Reglas del directorio `/assets`

**Propósito**: Alojar los archivos multimedia y recursos utilizados para los gráficos y sonidos.

## Normas:
1. **Formatos soportados**: Imágenes png, jpg, gif, y sonido mp3, wav, ogg.
2. **Forma de carga**: Los archivos solo deben cargarse dentro de la función `preload()` de `p5.js` llamando a `loadImage()` o `loadSound()`.
3. **Fallback si no existen**: Si se intenta cargar un archivo gráfico de aquí y este no está, el código debería usar técnicas de dibujado nativo de p5.js con primitivas 2D (elipses o rectángulos) mediante condicionales.
