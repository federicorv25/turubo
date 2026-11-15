# TURUBO: plan de la experiencia 3D

Estado: el recorrido incluye la galería de la Chiquitania (#36), la escena original de Asael (#7) y el relato por scroll, el juego explorable y el comparador de #39. Consulta [las pruebas del frontend y de la demo](evidence/viaje-3d.md), [las del encuentro 3D](evidence/encuentro-tierra-3d.md) y [la entrega preparada](../submission/README.md). El resto de esta guía conserva el plan original.

## Resultado que se entregará

Una experiencia visual de scroll, en español e inglés, que conecte la Chiquitania, el relato de Turubó y los resultados medidos de Tierra–Luna–Marte. El visitante debe entender qué es TURUBO en la primera pantalla, explorar sin leer una página de instrucciones, abrir las comparaciones directamente y entrar al juego disponible. Funciona y se publica sin esperar al 3D de Asael.

- Marca: **TURUBO**; personaje: **Turubó**; lema: **De la Tierra a nuevos mundos**.
- Repo canónico: https://github.com/federicorv25/turubo
- Producción: https://turubo.tech/
- Se conserva el análisis aprobado y la versión funcional de los cinco capítulos. No rehacer los cálculos ni inventar un ranking de IA.

## Referencias revisadas

1. https://www.youtube.com/watch?v=00rQpwz3GhM — se leyó la transcripción automática completa. Parte de una referencia de video, reconstruye planetas en Three.js y refina la cámara, el cursor, el scroll y la tipografía. El resultado interactivo no depende de reproducir ese video.
2. https://www.youtube.com/watch?v=r68MhqAUvR8 — se leyó la transcripción y la descripción. El tutorial combina definición de dirección visual, generación de recursos con Higgsfield, construcción/refinamiento y publicación. Higgsfield es una fuente de imágenes/videos; no es el motor 3D ni un requisito para construir nuestra web.
3. https://astraeatravel.com/ — se inspeccionó el selector de destinos y su canvas. Tomar la escala de los planetas, el espacio negativo y la tipografía; no copiar código, fotos, marca ni afirmaciones comerciales.
4. https://www.sierravoltebikes.com/ — se inspeccionó el relato por scroll, los cambios de información y el visor 3D. Tomar la progresión y el ritmo visual; evitar convertir TURUBO en una colección de tarjetas.

## Recorrido y dirección visual

1. **El cielo de Turubó.** Portada de pantalla amplia con la montaña y transición orbital; logo propio, una frase y dos acciones: Explorar el viaje / Jugar. Indicación de scroll discreta. No esperar a la API ni bloquear la portada con un loader de película.
2. **De dónde partimos.** Foto real del Cerro Turubó y foto o imagen orbital identificada del Valle de la Luna de San José de Chiquitos. Dos lugares distintos. Breve origen de la leyenda; con cada avance del scroll aparece una idea, no una pared de texto.
3. **De Bolivia a la Luna.** Globo lunar real en Three.js, arrastre opcional y cámara guiada por scroll. Foto/mosaico o reconstrucción NASA de la región de Nobile con su etiqueta. La vista artística del globo nunca se presenta como DEM del recorte.
4. **Comparar y descubrir.** Integrar el resultado lunar dentro del relato: Nobile tiene 624,61 m de relieve y 14,70° de pendiente mediana; R03 C01 tiene 229,61 m y 7,16°. Después Jezero: 77,56 m y 2,11°, frente a R02 C02 con 63,38 m y 1,64°. Las cifras proceden del JSON. Mantener mapa, escala, unidades, fuente, resolución/cobertura e interpolación. Fotografías son contexto, no resultados medidos.
5. **La aventura.** Introducir a Turubó y los tres encuentros. Abrir la aventura actual por un botón claro; reemplazar su módulo gráfico con el juego de Asael solo cuando llegue y esté probado. Sin aviso engañoso de que el juego 3D está listo.
6. **Lo que aprendimos.** Cierre corto, explicación científica, equipo y acceso a proyecto/fuentes en un único detalle plegable o diálogo. No repetir tres enlaces sueltos dorados como pie principal. Mantener el origen accesible y el aviso de IA junto a los recursos generados.

Paleta: noche azul casi negra, dorado sobrio, vegetación de la Chiquitania, gris lunar y terracota marciana. Cormorant Garamond para titulares expresivos; Manrope para lectura, controles y cifras. Fuentes locales WOFF2 con `font-display: swap`; máximo dos pesos por familia. Texto legible sobre fotos y fondos.

Navegación de escritorio pequeña y persistente cuando no tape el contenido; enlaces de capítulo y un menú de proyecto/fuentes. En móvil, marca + ES/EN + menú accesible. Permitir salto directo a datos o juego. La selección manual del idioma prevalece; después el primer español/inglés del navegador; luego inglés. Conservar los enlaces públicos `#/compare/moon`, `#/compare/mars`, `#/play` y `#/about`.

## Implementación y estructura

Mantener Vite + TypeScript, sin migración de framework:
- Three.js **0.187.0** y @types/three **0.187.0**, WebGL 2.
- GSAP **3.15.1**, ScrollTrigger. Scroll nativo; no Lenis ni secuestro de rueda.
- @fontsource/cormorant-garamond y @fontsource/manrope **5.3.0**.
- Node **26.13.1**, npm **12.2.2** y los locks existentes.
- GitHub Pages y turubo.tech. Kie.ai se usa solo durante la producción de recursos.

Organizar el frontend gradualmente al implementar; no mover por estética carpetas que todavía son un punto de integración:
- `web/src/app/`: bootstrap, idioma, navegación y estilo compartido.
- `web/src/journey/`: capítulos de scroll, escenas Three.js y ciclo de vida del renderer.
- `web/src/analysis/`: comparador existente, gráficas/presentación de resultados.
- `web/src/experience/`: juego y adaptador para el trabajo de Asael.
- `web/public/media/`: recursos finales optimizados; fuentes/atribución por recurso.
- `content/`, `science/`, `schema/`: conservar guion, procesamiento y contrato medido.
- `docs/`: instrucciones vigentes; `design/`: fuentes visuales y manifiesto; `submission/`: entrega.
No introducir un backend, base de datos, cuentas de visitantes o claves de API en el bundle.

Un canvas activo como máximo. Cámara y luces compartidas, render a demanda cuando no hay animación, pausa al ocultar pestaña, liberación al salir, DPR hasta 1,5 en escritorio y 1 en móvil. Sin posprocesado pesado ni sombras en tiempo real en el primer corte. Texturas iniciales hasta 2K y lectura diferida de los destinos que no están próximos. Versión estática funcional cuando WebGL 2 falla, hay movimiento reducido o ahorro de datos.

El módulo futuro de Asael se monta dentro de la región de juego; su renderer se activa al entrar y se destruye/pausa al salir. Interfaz de traspaso: montar en un HTMLElement con idioma y escena actuales, devolver métodos para actualizar idioma/escena y liberar recursos. El sitio no importa su código hasta entrar al juego. Si no llega, permanece la aventura actual; no hacer otro juego paralelo ni modificar su rama.

Mientras se avanza en el Goal, comprobar los PR/issues de Asael al iniciar, antes de la integración y antes de cerrar. Si llega su entrega, inspeccionar código, dependencias, recursos, controles, traducciones y estado; compilar y ejecutar el recorrido con las comparaciones. Integrar mediante squash solo si cumple; si hay observaciones, dejar Draft con instrucciones concretas. No mantener una espera indefinida después de entregar el frontend si el juego todavía no se subió.

## Kie.ai y recursos

Instalación local fijada: `alfman99/kie-ai-mcp` **1.2.5**, SHA `24cc1059306a2eb45fe9a3e0ea1ebbdbbf5fcc9b`. Inicialización, listado de **11 herramientas** y consulta autenticada de créditos verificadas. Token cifrado por Windows fuera del repo. No replicarlo ni pedirlo por chat. La exposición en el listado de herramientas de un chat nuevo se verifica antes de usarlo; si aún no aparece, el cliente local de prueba permite consultar el mismo servidor.

En el PC de Federico, los clientes privados están en `$env:USERPROFILE/.codex/tools/kie-ai-mcp/`. `node <esa carpeta>/Check-Kie.mjs` comprueba configuración y saldo sin generar medios. `Call-Kie.mjs` permite llamar herramientas con un archivo JSON de argumentos; para las que crean medios exige reservar el costo en un registro local acumulado de hasta US$5. Usar ese cliente para las generaciones, incluso si el MCP aparece directamente en el chat; no saltarse su registro. Su ayuda y los precios se verifican antes del primer job. No copiar la clave ni estos archivos privados al repositorio.

- Priorizar fotos y datos reales gratuitos.
- Para arte narrativo, Seedream 5.0 Pro, 2K: tarifa publicada US$0,07 por imagen al preparar. Primera tanda máxima: 12 imágenes, estimación US$0,84. Leer el esquema del modelo antes de enviar.
- Video opcional: Wan 3.0, 720p y 5 s, sin video de entrada, tarifa publicada US$0,08/s: estimación US$0,40 por clip. Máximo dos clips; solo si mejoran una transición y no penalizan móvil. No hacer obligatorios videos de fondo.
- **Tope total autorizado: US$5**. El MCP no impone por sí solo un límite de facturación. Antes de cada envío, confirmar precio vigente y parámetros, reservar su máximo y anotarlo en el registro local. Si no se puede verificar el costo, no ejecutar. No recargar saldo ni habilitar autorrecarga. No hace falta gastar todo.
- No reenviar un job tras un timeout: consultar el ID existente. Descargar resultados duraderos; nunca publicar URLs temporales de Kie.
- Crear imágenes sin texto ni marcas NASA. Rotular las generadas. No modificar mapas científicos con IA ni transformar fotos documentales de modo que dejen de ser evidencia.
- Subida de archivos locales desactivada. Si se necesita una referencia local, usar solo el directorio dedicado y confirmar qué se compartirá; no abrir acceso al repo ni a Downloads.

Fuentes de tarifas: https://kie.ai/seedream-5-0-pro y https://kie.ai/wan3.0-video . Las tarifas cambian; verificar en la cuenta al ejecutar.

## Trabajo, PR y entrega

Todas las issues abiertas pasan a Federico excepto **#7** (Asael):
- #1: estructura y contrato de integración.
- #11 y PR #22: revisar el borrador, conservar lo útil y actualizar la demo real sin duplicar ni fingir autoría.
- #15 y PR #18: revisar créditos, licencias y textos; cerrar solo lo verificado.
- #26–#29: narrativa, marca, explicación científica y experiencia de navegación; implementación completa a cargo de Federico.
- #30: esta preparación.
- #31: fotografía real y procedencia.
- #32: móvil, accesibilidad y rendimiento.
- #16: dejar listo el formulario y los enlaces. No aceptar términos ni enviar a NASA durante el Goal sin la confirmación específica del usuario.

Lee cuerpo y comentarios actuales de cada issue y los PR antes de editar. PR Draft mientras se trabaja; Ready con check/build y evidencia. Un PR coherente puede resolver varias issues si enumera `Closes #N` y realmente cumple cada una. No cerrar #26–#29 con una simple guía. Revisar y hacer squash solo con pruebas verdes en el SHA final; comprobar el despliegue de ese main. Si hay observaciones, Draft y comentario concreto. No bloquear el frontend esperando a #7 ni reportar el juego como terminado.

## Criterios de calidad

- Escritorio 1366 y 1920; móvil 320 y 390; tablet 768; horizontal y vertical sin scroll lateral ni controles cortados.
- Móvil diseñado de forma específica: texto sobre áreas legibles, imágenes recortadas con intención, targets de 44 px, sin hover obligatorio, sin arrastrar para poder avanzar.
- Scroll nativo, teclado, foco visible, contraste mínimo 4,5:1, movimiento reducido y preferencias de idioma probados.
- Meta Chrome de PC a 1080p: 60 fps; medir 30 s en hardware identificado, registrar caídas y adaptar calidad. No prometer 60 fps universales.
- Presupuesto de carga inicial: hasta 1,5 MB comprimidos sin el juego; medios posteriores diferidos. No descargar una secuencia de cientos de cuadros.
- Safari real/iPhone si hay dispositivo; emulación no equivale a Safari. Probar Chrome y Edge disponibles; registrar límites.
- Conservar mediciones y trazabilidad, volver al capítulo/decisión, enlaces profundos y ambos idiomas.
- Render real de todas las secciones y estados, capturas de escritorio/móvil, corregir problemas visibles antes de publicar.
- Demo en inglés máximo siete diapositivas contando portada/cierre, enlace distinto al producto, ambos públicos. Rehacer capturas cuando cambie la versión. No prometer premios; el proyecto debe responder al reto con datos usados de verdad.

Comandos: `npm --prefix web ci`, `npm --prefix web run check`, `npm --prefix web run build`. CI no llama a Kie.ai. El código propio se licencia por separado de imágenes/datos/fuentes de terceros.
