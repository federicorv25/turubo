# Integrar gráficos del juego (#7)

La historia, sus decisiones y el acceso al análisis funcionan con HTML en `index.ts`. `main.ts` conserva `JourneyState` al entrar y salir de una comparación. `screens.ts` muestra la ilustración de respaldo desde el primer render. El recorrido orbital pertenece a `web/src/journey/`, no al juego: al salir de Inicio se libera su renderizador.

1. Una implementación de `MountSceneGraphics` recibe el contenedor visual, escena, estado e idioma mediante `graphics-contract.ts`. Impórtala de forma diferida desde la ruta Jugar. Si no monta o el contexto falla, deja la ilustración; el texto y los botones siguen activos.
2. `update` aplica `scene`, `state.answer` e idioma. El juego no cambia el JSON de terreno ni sustituye las decisiones accesibles. Si la escena aporta otras interacciones, se pasan por callbacks explícitos y se prueban con teclado y tacto.
3. `dispose` cancela cuadros, observadores y listeners y libera geometrías, materiales y texturas. Pausa si la página se oculta. Mantén un canvas activo, DPR acotado y carga adicional dentro de 1,5 MB. El comparador no importa el motor del juego.
4. Three.js 0.187.0 y sus tipos ya están fijados. Chrome de escritorio es la referencia de fluidez; mide 30 s a 1080p y declara el equipo. Prueba Edge, Brave, Safari real cuando esté disponible, y los controles móviles. Comprueba pérdida de contexto, ambas lenguas y regreso al capítulo y a la decisión.

La entrega vive en un PR con `Closes #7`, crédito por recurso, rótulos de IA visibles y evidencia de ejecución. Federico revisa y hace squash si cumple. La portada y los mapas se pueden publicar antes.

El encuentro 3D de Tierra está en `graphics/`. El anfitrión conserva el lienzo al cambiar la decisión o el idioma y lo libera al abrir los mapas o avanzar a otro capítulo. Si se vuelve desde la comparación, monta directamente la pose ya elegida. Las sombras de la Luna y Uaituparr se muestran en las ilustraciones de los otros capítulos. Consulta las [pruebas, tamaño y procedimiento de medición](../../../docs/evidence/encuentro-tierra-3d.md).
