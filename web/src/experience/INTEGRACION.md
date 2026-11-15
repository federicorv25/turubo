# La aventura de TURUBO

La historia mantiene cinco capítulos y un final lineal. Tierra, Luna y Marte tienen escenas 3D que se pueden recorrer con WASD, flechas, clic en el suelo o controles táctiles. «Guíame al encuentro» permite completar el trayecto sin mantener teclas. Al llegar al marcador aparecen las decisiones. Los mapas se abren por separado y al volver se conservan escena, elección y posición.

## Responsabilidades

- `index.ts` crea el texto y las decisiones accesibles.
- `save.ts` conserva la aventura en sessionStorage con versión y validación. Si el almacenamiento está bloqueado o corrupto, se empieza en el prólogo.
- `graphics/host.ts` importa Three.js solo cuando una escena lo necesita. Conserva el lienzo al cambiar decisión/idioma, lo libera al salir y recrea el escenario al cambiar de mundo.
- `graphics/navigation.ts` limita el recorrido y mantiene la misma velocidad en diagonales.
- `graphics/index.ts` conecta controles, cámara, personajes y reacción a las decisiones.
- `graphics/planetary.ts` contiene escenarios ficticios de Luna y Marte; no usa ni modifica DEMs científicos.

El contrato recibe escena, estado, idioma y posición persistente. `onStatus` comunica carga, disponibilidad y llegada al objetivo. El texto y las decisiones mantienen una alternativa ilustrada con movimiento reducido, ahorro de datos, falta de WebGL 2 o pérdida de contexto.

## Recursos y rendimiento

Un lienzo activo, resolución interna acotada, sin sombras de alta carga, pausa al ocultar o salir de la escena, render detenido tras cinco segundos sin actividad. La portada no necesita el motor del juego. Todo el 3D se construye con geometría y texturas locales, sin APIs en el navegador.

Asael creó el entorno de Tierra, Turubó y la serpiente con Google AI Studio y Claude Code. Federico y Codex ampliaron controles, composición y escenarios planetarios. Las ilustraciones narrativas llevan rótulo y están inventariadas en `design/ai-art-manifest.json`.

La prueba de la primera integración permanece en [encuentro-tierra-3d.md](../../../docs/evidence/encuentro-tierra-3d.md). La nueva versión se verifica por separado en la issue #39.
