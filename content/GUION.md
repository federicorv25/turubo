# Turubó: de la Tierra a nuevos mundos

Guion inicial para revisar en [la issue de historia](https://github.com/federicorv25/turubo-atlas/issues/4). Los textos jugables están en `story.json` en español e inglés; las cifras y mapas se cargan por separado.

## Lo que contamos

En la versión de Antonio Paredes Candia, Turubó talla figuras de madera y barro, intenta darles vida, levanta una montaña para alcanzar la morada de Uaituparr y muere tras la mordedura de una serpiente enviada por esa deidad. Queda su nombre en la montaña de San José de Chiquitos. Nuestra adaptación conserva la montaña, las figuras, el vaso y la mordedura. Inventa la visión de otros mundos, la máquina de viaje, la parada lunar y el duelo final en Marte.

| Escena | Acción breve | Evidencia que puede abrirse |
|---|---|---|
| Prólogo | Turubó quiere dar vida a sus figuras; bebe del vaso y decide continuar su obra. | Contexto de la leyenda y entrada a «Ver análisis». |
| Tierra | Termina la plataforma. La serpiente lo muerde mientras duerme; el jugador elige cómo responder. Parte con el veneno. | Valle de la Luna de San José de Chiquitos y Cerro Turubó, dos sitios distintos. |
| Luna | Las figuras que llevaba son animadas por sombras. Puede observar el terreno o apartarlas para continuar. El veneno avanza. | Nobile Rim 1 frente a las ventanas terrestres y el caso guiado del Cerro. |
| Marte | Se enfrenta a Uaituparr en una escena fantástica. Parece a punto de vencer, pero el veneno lo alcanza. | Jezero frente a las ventanas terrestres y el Cerro. |
| Epílogo | Turubó deja su nombre y un camino de preguntas. | Acceso libre a los dos destinos. |

La Luna es una parada de la historia, no un paso obligatorio de un viaje real a Marte. El veneno avanza por escenas, sin reloj. Las acciones del jugador cambian una línea y, si hay tiempo, un efecto visual; todas llegan al mismo final. No hay cifras que dependan del éxito del jugador.

## Arte mínimo

- **Turubó:** titán artesano, reconocible por una silueta y una figura tallada. Tres poses bastan: tallar, avanzar, descansar.
- **Serpiente:** silueta reconocible y un breve cambio de postura; sin sangre.
- **Sombras o lémures:** sombras que animan las figuras; no son animales lémures. Una capa oscura sobre la figura basta.
- **Uaituparr:** presencia celestial en el último encuentro. Diseño propio y rotulado como adaptación; el templo, si lo dibujan, es ficticio y no aparece sobre el mapa de Jezero.
- **Fondos:** uno por mundo. Primero texto y escenas estáticas. Añade poses o movimiento después de probar el recorrido. Si usan arte generado, registrar origen, créditos y declaración antes de publicar.

## Cómo entregarlo a web

Mantén los identificadores de escenas y las claves `es`/`en` en `story.json`. Erick trabaja en `web/src/experience/`. El panel de Ana Raquel recibe solo el destino `earth`, `moon` o `mars`, nunca las elecciones narrativas. Federico coordina cambios al contrato. Al modificar escenas, ejecuta el chequeo y revisa los dos idiomas.

## Referencias

- [Motivo Turubó, Archivo de Folklore Boliviano](https://archivodefolkloreboliviano.org/motivo/turubo/); Antonio Paredes Candia, *Leyendas de Bolivia* (1986), pp. 189–191. [Página impresa 190](https://archivodefolkloreboliviano.org/texto/leyendas-de-bolivia-1986/227/).
- [NASA: el relieve natural de Cydonia conocido como D&M Pyramid](https://science.nasa.gov/photojournal/the-cydonia-dandm-pyramid-landform/). Cydonia queda fuera de la comparación del proyecto; el templo de la historia es un recurso narrativo.
