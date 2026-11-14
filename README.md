# TURUBO Atlas

TURUBO is a short bilingual web game inspired by the Chiquitano legend of Turubó. Its separate terrain viewer lets players compare Bolivian landscapes with lunar and Martian references using measured elevation data. Developed at NASA Space Apps 2026 in Santa Cruz, Bolivia, for [Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/).

This starter contains a playable story and a terrain panel with an explicit empty state. Measurements and a public deployment are pending. See the [terrain task](https://github.com/federicorv25/turubo-atlas/issues/3) and the [submission checklist](submission/README.md).

## Arranque

1. Lee [INICIO.md](INICIO.md), [AGENTS.md](AGENTS.md) y tu issue en GitHub. [CLAUDE.md](CLAUDE.md) importa las mismas reglas para Claude Code.
2. Prepara solo las herramientas de tu tarea con la [guía de entorno](docs/ENTORNO.md).
3. Crea tu rama y un PR **Draft** vinculado al issue. [Flujo de GitHub](docs/FLUJO_GITHUB.md).

~~~powershell
npm --prefix web ci
npm --prefix web run dev
~~~

Vite muestra la dirección local. La historia está disponible en inglés y español. «Ver análisis» funciona desde cualquier escena. `npm --prefix web run check` verifica tipos y `npm --prefix web run build` prepara los archivos estáticos.

| Ruta | Responsabilidad |
|---|---|
| `content/` | Guion ES/EN y procedencia del arte. |
| `web/src/experience/` | Escenas 2D, decisiones y estado narrativo. |
| `web/src/analysis/` | Tabla, mapas, fuentes y estados sin datos. |
| `web/src/terrain-viewer/` | Extensión para relieve 3D. |
| `web/src/app/`, `schema/`, `fixtures/` | Integración, contrato y ejemplos de desarrollo. |
| `science/pipeline/`, `science/review/` | Procesamiento, ranking medido y revisión. |
| `submission/` | Entrega, demo y créditos. |

La web es estática y no requiere APIs de modelos. El [guion](content/GUION.md) distingue leyenda, adaptación y ciencia. Integra mapas y conclusiones después de revisarlos. Confirma quién edita cada módulo en su issue.
