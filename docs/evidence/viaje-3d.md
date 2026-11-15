# Verificación del recorrido TURUBO

15 de noviembre de 2026, Bolivia. Codex ejecutó estas pruebas por encargo de Federico. Los hallazgos conservan las conclusiones revisadas en #3 y #8 y el pipeline de #12.

## Compilación y publicación

- [Frontend #34](https://github.com/federicorv25/turubo/pull/34). Head revisado 13435febb7e927aa44eae711fc7f7c573c9fd02d; squash 6709ea77f5b29183578ac61cdb8034b3fa1ea607. [CI](https://github.com/federicorv25/turubo/actions/runs/43687615952) y [Pages](https://github.com/federicorv25/turubo/actions/runs/43687615980) correctos en el squash.
- [Créditos #18](https://github.com/federicorv25/turubo/pull/18), squash 78a18637face2755b0b8e2df4382d93aa1b0628a. [CI](https://github.com/federicorv25/turubo/actions/runs/43688294141) y [Pages](https://github.com/federicorv25/turubo/actions/runs/43688294088) correctos. [Avisos de licencia](https://turubo.tech/third-party/NOTICE.txt) accesibles.
- Tipos, guion EN/ES y transiciones, esquema, archivos de terreno y huellas de medios en CI. Three.js se descarga en un módulo separado cuando el usuario se acerca al tramo orbital.
- [Sitio público](https://turubo.tech/) responde 200 sin cuenta. Pages público con HTTPS forzado. JSON y cinco mapas PNG descargados sin credenciales y comparados por SHA-256 con el repositorio. Ambos destinos revisados, sin datos simulados.

## Uso y rendimiento

| Área | Evidencia |
| --- | --- |
| Tamaños | Chrome 157: 320 × 720, 390 × 844, 768 × 1024, 1366 × 768, 1920 × 1080 y 844 × 390. Sin scroll lateral; controles principales de 44 px. Se revisaron portada, origen, Luna, Marte, evidencia, aventura y cierre. Edge de escritorio abrió portada, origen y comparación de Marte con sus cifras. |
| Historia e idioma | Cinco capítulos ES y decisión de Tierra conservada al volver. Recorrido EN y retorno a la escena lunar en producción. Idioma manual conservado al recargar; primera coincidencia ES con fr-CA, es-BO, en-US. |
| Accesibilidad | El menú enfoca el primer enlace; Escape devuelve el foco. Las decisiones y la rotación responden a Enter. Imagen y datos siguen operativos sin arrastre. Se comprobaron estados de movimiento reducido, foco y rótulos de arte. |
| Respaldo 3D | Rotación de los globos con flechas y scroll; un solo canvas y ninguno fuera del tramo visible. Tras perder contexto o al no disponer de WebGL se mantuvieron imagen estática y acciones. Ahorro de datos simulado no descargó el motor. |
| Descarga | Primera visita candidata a 1920 × 1080: 328.973 bytes de cuerpos de respuesta, sin motor orbital. Chunk diferido: 651,74 kB minificado, 178,30 kB gzip. |
| Fluidez | Prueba local de rotación lunar de 30 s en primer plano: 1.800 cuadros, 60,0 fps, P95 17,1 ms y cero cuadros por encima de 34 ms, a 1920 × 1080. Chrome 157, Intel i5-12450H, Intel UHD, pantalla 60 Hz. Esta muestra no describe todas las máquinas ni el juego de Asael. |
| Alcance | Móvil en emulación. No hubo dispositivo con Safari/iPhone ni navegador Brave disponible para verificar. |

## Demo y preparación de entrega

- [PDF público final](https://github.com/federicorv25/turubo/releases/download/turubo-demo-final-2026/TURUBO_Demo_3D_EN.pdf), distinto de la web: siete diapositivas EN renderizadas y revisadas, once enlaces HTTPS. SHA-256: dd893112035134e0c867380a5f80b3c9e980285c808b61f8168fc9be216d04b4. PDF y PPTX descargados sin cuenta y verificados por hash. La demo explica el encuentro 3D de Tierra y muestra una captura del capítulo ilustrado de la Luna.
- Kie.ai: dos ilustraciones, 28 créditos verificados (US$0,14 a tarifa publicada). Presupuesto acumulado de US$5. Las fotos y mapas no se generaron con IA. La web no realiza llamadas pagadas.
- Se leyeron los campos del formulario de Space Apps. El [texto preparado](../../submission/project-en.md) no se guardó allí y no se envió al jurado. Los términos y confirmaciones de #16 quedan para Federico.
- El [encuentro 3D de Asael](encuentro-tierra-3d.md) se integró en #35. La portada con tres fotos de la Chiquitania se integró en #37. [Pages](https://github.com/federicorv25/turubo/actions/runs/43720556353) publicó la versión combinada; se comprobaron sin cuenta las fotos, los mapas, el JSON, los archivos de juego y la firma tipográfica.

Las capturas de escritorio y móvil se guardan junto a los entregables locales. Las capturas para jurado están en el PDF.
