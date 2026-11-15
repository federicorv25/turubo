# Credits and provenance

This inventory reflects the repository contents reviewed on 2026-11-14. It is a working record, not a claim that every referenced resource is used in the final submission. Items that still need confirmation are marked **Pending**.

## Data and scientific references

The [reproducible package from #12](https://github.com/federicorv25/turubo-atlas/tree/6d6111179c1580c3932b383ce8a1da3dc21c0781/science/pipeline/preview) processed the products below. Its [manifest](https://github.com/federicorv25/turubo-atlas/blob/6d6111179c1580c3932b383ce8a1da3dc21c0781/science/pipeline/preview/manifest.json) records source credits, coordinates, coverage, transformations, hashes, and outputs. These are **processed results, pending publication**, not proof of use in the final website or demo. On `main` at `dcb078b`, `web/public/data/analysis.json` contains no terrain records and both comparisons remain `not_assessed`. The proposed integration in #9 is still a draft.

| Product and attribution | Processing and coverage | Evidence and display status |
|---|---|---|
| NASA EOSDIS LP DAAC, [NASADEM HGT V001](https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001), tile `s18w061`, distributed by [OpenTopography](https://portal.opentopography.org/datasetMetadata?otCollectionID=OT.032021.4326.2). | Native 1 arc-second elevations in meters relative to EGM96; WGS 84 to UTM 20S. Twenty-five Valle de la Luna windows and a separate Cerro Turubó window, each 4 × 4 km; averaged onto a 40 m grid. Radar-derived surfaces may include vegetation or structures. | Processed maps and measurements in the #12 package; per-window coverage and attribution in its manifest. Publication in the game or demo remains pending #9/#11. |
| NASA Goddard PGDA, [LRO/LOLA Site06, Nobile Rim 1](https://pgda.gsfc.nasa.gov/products/78), [source GeoTIFF](https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site06/Site06_final_adj_5mpp_surf.tif). | Lunar DEM at native 5 m/pixel, heights in meters, south polar stereographic coordinates (MOON_ME / DE421). The 4 × 4 km crop centered at X = 84,000 m, Y = 110,000 m was averaged to 40 m; its valid grid coverage is 100%. Many polar DEM pixels are interpolated, so valid coverage is not direct observation coverage. | [Nobile map](https://github.com/federicorv25/turubo-atlas/blob/6d6111179c1580c3932b383ce8a1da3dc21c0781/science/pipeline/preview/maps/moon-nobile-rim-1.png) and metrics are processed in #12; lunar interpretation review and publication remain pending #3/#9. |
| USGS Astrogeology / NASA, [CTX Jezero Science Investigation DEM](https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic), `M20_JezeroCrater_CTXDEM_20m.tif`. | Native 20 m/pixel, elevation in meters; center 18.4447° N, 77.4508° E transformed to the product's Mars spherical CRS. A 4 × 4 km window was averaged to 40 m, with 100% valid grid coverage. | [Jezero map](https://github.com/federicorv25/turubo-atlas/blob/6d6111179c1580c3932b383ce8a1da3dc21c0781/science/pipeline/preview/maps/mars-jezero.png) and metrics are processed in #12; the proposed web integration #9 remains draft and demo use is pending #11. |

LOLA is an instrument on LRO, which Federico identifies as a challenge-listed NASA resource ([handoff](https://github.com/federicorv25/turubo-atlas/issues/15#issuecomment-6884614686)). The Nobile map and measurements provide a traceable source-to-result example in the technical package. Confirm that this result actually reaches the jury version before claiming its use there; do not assume that processing alone establishes Global Awards eligibility. Whether NASADEM independently satisfies the challenge-specific requirement remains unconfirmed. See [NASA Space Apps clarification #1947](https://github.com/nasa/spaceapps/discussions/1947).

NASA Space Apps' [challenge page](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/) is contextual attribution. The [Cydonia D&M Pyramid reference](https://science.nasa.gov/photojournal/the-cydonia-dandm-pyramid-landform/) is a textual story reference, outside the terrain comparison; it is not a data product used in the analysis.
## Cultural source and story

| Work | Source and credit | Use and transformation | Where it appears |
|---|---|---|---|
| Turubó legend | Archivo de Folklore Boliviano, [“Motivo Turubó”](https://archivodefolkloreboliviano.org/motivo/turubo/); Antonio Paredes Candia, *Leyendas de Bolivia* (1986), pp. 189–191; [page 190](https://archivodefolkloreboliviano.org/texto/leyendas-de-bolivia-1986/227/). | The project script describes an adaptation: it retains the mountain, figures, cup, and snakebite, and adds imagined travel to other worlds and a fictional final encounter. This is narrative source material, not measured terrain data. No source images or direct quotations are present in the current web files. Reuse/adaptation terms have not been independently verified. | `content/GUION.md` and the bilingual story in `content/story.json`. **Pending:** verify applicable reuse terms before final submission. |

## Artwork, media, fonts, and software

- The earlier inventory found no distributed illustration, texture, audio, video, or model asset in the base web application; recheck the final build and demo. The story interface is rendered with HTML and CSS; its typefaces use browser/system fonts (`system-ui` and `Georgia`), with no font files bundled.
- The web application is static and makes no model API calls. Vite, TypeScript, and Ajv are listed as development dependencies; confirm whether any additional software credit is required for the final submission. Recheck runtime dependencies and their license obligations against the final build.
- **Pending:** each contributor must confirm any artwork, media, external asset, or tool that they add to the final demo, with its creator, source, license/terms, changes, and display location. If generated AI art or video is used, confirm visible labeling in the web experience and demo, and check the issue requirements on NASA identifiers and minors before inclusion.

## AI use record

| Tool | File or aspect | Purpose | Review |
|---|---|---|---|
| OpenAI Codex | This working inventory, `submission/credits-en.md` | Drafted and updated this repository-based inventory, including its source-status descriptions and AI-use record; unverified resources remain marked pending. | Human review by Luciana and confirmation by the relevant data/art owners are pending. The organizers require AI use to be identified in project descriptions/metadata; see [clarification #1849](https://github.com/nasa/spaceapps/discussions/1849) and [clarification #1947](https://github.com/nasa/spaceapps/discussions/1947). |

| OpenAI Codex | #12 pipeline code, tests and documentation | Assistance reported by Federico; maps and metrics were calculated from DEMs. | Federico reports reproduction of the package; confirm final human review and scope. |
| OpenAI Codex | `submission/project-en.md`, `submission/demo-en.md`, Mars review | Structure and drafting, as reported by Belinda; metrics came from #12. | Final review by Belinda, Luciana, Erick and Federico is pending. |
| Cursor (Composer) | #14 analysis panel, copy, CSS and browser QA | Implementation and testing, as recorded in PR #17. | Federico review is referenced in PR #17; confirm final review and inclusion. |
## Open confirmations

- Confirm which processed results are actually included in the jury website and demo after #9 and #11; retain `not_assessed` wherever evidence is not approved. Do not claim LRO/LOLA use in the final submission unless its result is included.
- Confirm whether NASADEM independently satisfies the challenge-specific NASA resource requirement.
- Verify cultural-source reuse terms and collect credits and permissions for final art, media, fonts, models and software. Exclude unverified resources until resolved.
- Contributors must confirm their actual AI tools, affected files, purposes and human reviewers. Check visible labels for AI-generated images or video, NASA identifiers, and the exclusion of media or identifiable traits of minors.
- Belinda reports Codex assistance in `submission/project-en.md`, `submission/demo-en.md` and the Mars review, with final human review pending; no AI-generated image, audio or video was added in those PRs. Federico reports Codex assistance with #12 code, tests and documentation; its PNGs and metrics were calculated from DEMs. Confirm the final materials and reviewers before disclosure.
- Coordinate the final submission-form summary with Belinda (#11) and give Federico the inventory and remaining gaps.