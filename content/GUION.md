# Turubó: de la Tierra a nuevos mundos

Guion de una aventura breve en cinco escenas. Los textos jugables están en `story.json`, con las mismas claves `es` y `en` y los identificadores `prologue`, `earth`, `moon`, `mars` y `epilogue`. Las tres escenas de encuentro ofrecen dos respuestas cada una; todas conducen al mismo final y no cambian datos, comparaciones ni conclusiones científicas.

## Relato y límites entre fuente y adaptación

| Escena | Relato | Procedencia y función |
|---|---|---|
| Prólogo · La montaña | Turubó talla figuras de madera y barro, bebe de un vaso misterioso, ve otros mundos y sueña con una advertencia de Uaituparr. Vuelve a terminar la plataforma. | Las figuras, el vaso, el desafío y la plataforma proceden de la versión chiquitana de Antonio Paredes Candia (1986). La visión espacial y la advertencia en sueños se presentan como recursos narrativos de esta adaptación. |
| Tierra · La serpiente | Al descansar sobre la plataforma, Turubó recibe la mordedura de la serpiente enviada por Uaituparr. Supera el encuentro y parte con sus figuras, pero el veneno continúa. | El descanso, la serpiente venenosa, la intervención de Uaituparr y la montaña que conserva el nombre pertenecen al relato citado. La nave, el combate, el viaje y el veneno que acompaña al personaje entre mundos son adaptaciones. «Ver análisis» permite consultar el Cerro Turubó y el Valle de la Luna de San José de Chiquitos como sitios distintos; el Cerro es un caso guiado, fuera del ranking. |
| Luna · Las sombras | En esta historia, Turubó hace una escala ficticia en la Luna para revisar la nave y preparar el siguiente trayecto. Durante la parada, formas como sombras llamadas lémures animan sus figuras. Observa el paisaje y sigue a Marte; el veneno empeora. | Paredes Candia describe como lémures las figuras fallidas que parecían sombras: no son animales. La escala lunar, revisar la nave, preparar el viaje, las sombras que mueven las figuras y el paisaje inspirado en Nobile Rim 1 son adaptación. La Luna no es un requisito para llegar a Marte. |
| Marte · Uaituparr | En un templo imaginario, Turubó se enfrenta a Uaituparr. Parece estar cerca de vencer, pero el veneno lo alcanza. | Uaituparr y la muerte de Turubó tras la mordedura tienen base en el relato. El viaje a Marte, el combate y el templo son ficción; el templo no forma parte del Jezero real. El paisaje narrativo se inspira en Jezero. |
| Epílogo · Lo que queda | Turubó muere y su nombre permanece en la montaña. El jugador puede salir de la historia y volver a las comparaciones. | El nombre de la montaña procede del cierre de la versión de 1986. La navegación de regreso es parte de la experiencia interactiva. |

Las decisiones solo cambian la respuesta inmediata del encuentro. No hay ruta alternativa, variable narrativa que cambie el desenlace ni resultado científico asociado a una elección. El veneno avanza por escenas, sin reloj. El recorrido está pensado para durar pocos minutos.

## Guía breve de arte

La ficha para el primer traspaso a Asael está en [`personajes.md`](personajes.md). Es una guía de silueta, color, pose y gesto, no arte final ni descripción documental. El diseño de Uaituparr es una propuesta visual propia, no una representación tradicional. No añadas símbolos, vestimenta ceremonial ni motivos culturales sin una fuente y revisión apropiadas. Los fondos lunares y marcianos son paisajes de ficción inspirados en referencias, no mapas medidos.

## Experiencia y traspaso

- `story.json` conserva los cinco identificadores existentes y las claves bilingües `es`/`en`.
- «Ver análisis» está disponible en cada escena. El panel recibe únicamente el destino `earth`, `moon` o `mars`, nunca la respuesta del jugador. Volver a la historia conserva la escena y la respuesta actual.
- En `earth`, el análisis debe mantener separados el Cerro Turubó y el Valle de la Luna de San José de Chiquitos. Cerro Turubó es el caso guiado y queda fuera del ranking. Las comparaciones de Luna y Marte usan Nobile Rim 1 y Jezero, respectivamente.
- Asael (#7) puede usar primero la ficha de `personajes.md` para avanzar con las siluetas; el arte final y los controles siguen en esa issue. Las fichas de terrenos lunares y marcianos corresponden a #3 y #8. Federico coordina cualquier cambio de contrato de datos o integración para #9.
- Para cambios a estas escenas, ejecutar `npm --prefix web run check` y `npm --prefix web run build`, y comprobar «Ver análisis» y «Volver a la historia» en los cinco capítulos.

## Créditos, uso de IA y revisión

- Relato de referencia: Antonio Paredes Candia, *Leyendas de Bolivia*, Librería Editorial Popular, 1986, pp. 189–191; ficha y páginas digitalizadas por el [Archivo de Folklore Boliviano](https://archivodefolkloreboliviano.org/motivo/turubo/). La fuente se identifica como versión chiquitana; no se presenta como una única versión de toda tradición chiquitana.
- Herramienta de IA: ChatGPT se usó para apoyar la edición bilingüe y la preparación de esta guía. El contenido se contrastó con la ficha y el texto digitalizado de la fuente citada.
- Revisión humana del guion bilingüe: Federico revisó el texto en ambos idiomas y confirmó el recorrido; esta actualización incorpora su pedido de explicar el propósito ficticio de la escala lunar.
- Revisión cultural del arte final: corresponde a la issue #7 y queda pendiente allí; no es una revisión lingüística pendiente de este guion.
- No se usó arte generado por IA en estos archivos.

## Referencias de contexto

- [Motivo Turubó, Archivo de Folklore Boliviano](https://archivodefolkloreboliviano.org/motivo/turubo/) y [página impresa 190](https://archivodefolkloreboliviano.org/texto/leyendas-de-bolivia-1986/227/).
- [NASA: el relieve natural de Cydonia conocido como D&M Pyramid](https://science.nasa.gov/photojournal/the-cydonia-dandm-pyramid-landform/). Cydonia queda fuera de las comparaciones del proyecto; cualquier templo de la historia es imaginario.
