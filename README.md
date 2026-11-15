# TURUBO · From Earth to New Worlds

TURUBO is a bilingual journey from Bolivia’s Chiquitania to the Moon and Mars. Scroll through interactive globes, explore terrain measurements, or play a short adventure inspired by the Chiquitano story of Turubó. Developed at NASA Space Apps 2026 in Santa Cruz, Bolivia, for [Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/).

**[Play TURUBO](https://turubo.tech/)** in English or Spanish. See real photographs from San José de Chiquitos, make a choice in the 3D serpent encounter, or open the [Moon](https://turubo.tech/#/compare/moon) and [Mars](https://turubo.tech/#/compare/mars) comparisons directly.

The Valle de la Luna in San José de Chiquitos supplies the 25 terrestrial windows. The closest windows within that sample are R03 C01 for Nobile Rim 1 and R02 C02 for Jezero. Cerro Turubó is a separate guided example. Similarity here refers to slope and relief in the selected tiles; it does not establish conditions for landing or habitability.

See the [lunar and Martian reviews](science/review/), the [reproducible elevation pipeline](science/pipeline/) and the [submission checklist](submission/README.md). Codex assisted with the interface and vector illustrations, which are identified in the experience. The measurements come from the elevation products cited in the pipeline.

The original project code is available under the [MIT License](LICENSE). Third-party data, photography, fonts and libraries keep their own terms and attribution. See [visual sources and licenses](design/FUENTES_VISUALES.md) and [the implementation guide](docs/FRONTEND_3D.md).

## Arranque

1. Lee [INICIO.md](INICIO.md), [AGENTS.md](AGENTS.md) y tu issue en GitHub. [CLAUDE.md](CLAUDE.md) importa las mismas reglas para Claude Code.
2. Prepara solo las herramientas de tu tarea con la [guía de entorno](docs/ENTORNO.md).
3. Crea tu rama y un PR **Draft** vinculado al issue. [Flujo de GitHub](docs/FLUJO_GITHUB.md).

~~~powershell
npm --prefix web ci
npm --prefix web run dev
~~~

Vite muestra la dirección local. La historia está disponible en inglés y español. Cada capítulo permite abrir su comparación y volver al mismo punto. `npm --prefix web run check` verifica tipos y `npm --prefix web run build` prepara los archivos estáticos.

| Ruta | Responsabilidad |
|---|---|
| `content/` | Guion ES/EN y procedencia del arte. |
| `web/src/experience/` | Decisiones, encuentro 3D de Tierra e ilustraciones de respaldo. |
| `web/src/journey/` | Recorrido por scroll, galería de Bolivia y globos con versión estática. |
| `web/src/analysis/` | Tabla, mapas, fuentes y estados sin datos. |
| `web/src/terrain-viewer/` | Extensión para relieve 3D. |
| `web/src/app/`, `schema/`, `fixtures/` | Integración, contrato y ejemplos de desarrollo. |
| `science/pipeline/`, `science/review/` | Procesamiento, ranking medido y revisión. |
| `submission/` | Entrega, demo y créditos. |

La web es estática y no requiere APIs de modelos. El [guion](content/GUION.md) distingue leyenda, adaptación y ciencia. Integra mapas y conclusiones después de revisarlos. Confirma quién edita cada módulo en su issue.
