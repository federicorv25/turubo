# Encuentro 3D de Tierra · #7

Asael Rojas Mansilla creó la escena de la serpiente. Los botones de HTML conservan el recorrido; al esquivar, se ve el salto lateral de Turubó. Al distraer a la serpiente, la figura tallada atraviesa la escena. «Volver a elegir» permite probar ambas respuestas. El prólogo, los lémures en la Luna, Uaituparr en Marte y el epílogo usan ilustraciones. Los escenarios del juego son ficticios.

## Comprobaciones

| Entorno | Resultado |
| --- | --- |
| Chrome 157, Windows, Core i5-12450H, Intel UHD Graphics (32.0.101.7076), pantalla a 60 Hz | Ventana de prueba de 1920 × 1080, sin limitar CPU. Ambas decisiones cambian la pose. Volver desde los mapas recupera la opción elegida. El cambio ES/EN mantiene el estado y al salir del encuentro se retira el lienzo. |
| Misma compilación, modo de medición, 30 s | **59,9 fps**, p95 **17,0 ms**, **1** intervalo superior a 34 ms; 178 llamadas de dibujo en el último cuadro, lienzo de 542 × 358. |
| Chrome en anchos de 390 y 320 px | Encuentro y controles legibles, botones de al menos 44 px de alto, sin desplazamiento horizontal. Es una prueba de tamaños móviles en escritorio. |
| Chrome: teclado y condiciones de respaldo | Enter permite jugar. La ilustración mantiene el flujo con movimiento reducido, ahorro de datos simulado, ausencia simulada de WebGL 2 y pérdida de un contexto ya abierto. |
| Edge, Brave, Safari y Firefox | Pendiente comprobar este encuentro en esos navegadores. Las alternativas se probaron en Chrome. |

La carga diferida del encuentro suma **590.470 B** sin comprimir contando Three.js (compartido con la portada) y el módulo de la escena. Son aproximadamente **151 kB gzip** según Vite. No se descargan modelos ni texturas externas. La cifra corresponde al tamaño de los archivos generados; no es una medición de la red de un visitante.

## Reproducir la medición

```powershell
npm --prefix web run check
npm --prefix web run build -- --mode graphics-qa --outDir ../tmp/graphics-qa
npm --prefix web run preview -- --host 127.0.0.1 --outDir ../tmp/graphics-qa
```

En Chrome abre la URL indicada por Vite con `/?graphics-qa#/play`, activa «Terminar la plataforma», elige una respuesta y deja la pestaña en primer plano 30 segundos. El dato aparece como atributo `data-graphics-performance` de `.scene-graphics`. Es una compilación de Vite optimizada con el muestreo activado. La publicación normal detiene el render cuando no hay movimiento y no activa este muestreo.
