# Credits and provenance

This inventory reflects the repository contents reviewed on 2026-11-14. It is a working record, not a claim that every referenced resource is used in the final submission. Items that still need confirmation are marked **Pending**.

## Data and scientific references

| Product or resource | Provider and source | Use, attribution, and transformation | Where it appears | Status |
|---|---|---|---|---|
| Public terrain analysis data | Project file [`web/public/data/analysis.json`](../web/public/data/analysis.json) | The published file currently contains no terrain records. Both Moon and Mars comparisons are `not_assessed`; no measurements, raster crops, or maps are included. | The web analysis panel displays its empty state. | Confirmed from repository; no measured terrain product is currently used. |
| NASA Space Apps 2026 challenge | NASA Space Apps, [challenge page](https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/) | The project identifies the challenge it was made for. No challenge imagery or data is included in the repository. | Project README and web footer. | Confirmed as attribution/context. |
| Cydonia D&M Pyramid reference | NASA, [Photojournal page](https://science.nasa.gov/photojournal/the-cydonia-dandm-pyramid-landform/) | Mentioned as context in the script notes; the repository states that Cydonia is outside the project comparison and that the story's temple is fictional. No NASA image is included. | `content/GUION.md` reference list; not shown in the web interface. | Confirmed as a textual reference, not a data product used in the analysis. |
| Nobile Rim 1 / LRO-LOLA Site 06 | NASA Goddard, [LOLA product page](https://pgda.gsfc.nasa.gov/products/78) | The repository names this as a planned lunar comparison, but contains no raster, measurement, or derived map from this product. Do not describe it as used until the data work is confirmed. | Planned analysis described in project documentation; no current terrain entry in the web data. | **Pending** confirmation with Federico from issue #12 and identification of the exact product/source used. |
| Jezero CTX DEM | USGS, [CTX DEM file](https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif) | Named in the processing plan; no raster, measurement, or derived map is present in the public data file. | Planned analysis; no current terrain entry in the web data. | **Pending** confirmation from the Mars data owner. |
| NASADEM HGT | NASA, [NASADEM HGT product](https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001) | Named as the planned Earth elevation product. No downloaded tile, crop, or derived measurement is present in the repository. | Planned Earth comparison; no current terrain entry in the web data. | **Pending** confirmation from the Earth data owner, including which area and tiles were actually used. |

## Cultural source and story

| Work | Source and credit | Use and transformation | Where it appears |
|---|---|---|---|
| Turubó legend | Archivo de Folklore Boliviano, [“Motivo Turubó”](https://archivodefolkloreboliviano.org/motivo/turubo/); Antonio Paredes Candia, *Leyendas de Bolivia* (1986), pp. 189–191; [page 190](https://archivodefolkloreboliviano.org/texto/leyendas-de-bolivia-1986/227/). | The project script describes an adaptation: it retains the mountain, figures, cup, and snakebite, and adds imagined travel to other worlds and a fictional final encounter. This is narrative source material, not measured terrain data. | `content/GUION.md` and the bilingual story in `content/story.json`. |

## Artwork, media, fonts, and software

- No distributed illustration, texture, audio, video, or model asset is present in the current web application. The story interface is rendered with HTML and CSS; its typefaces use browser/system fonts (`system-ui` and `Georgia`), with no font files bundled.
- The web application is static and makes no model API calls. Vite, TypeScript, and Ajv are listed as development dependencies; confirm whether any additional software credit is required for the final submission. No runtime third-party library is currently listed in `web/package.json`.
- **Pending:** each contributor must confirm any artwork, media, external asset, or tool that they add to the final demo, with its creator, source, license/terms, changes, and display location. If generated AI art or video is used, confirm visible labeling in the web experience and demo, and check the issue requirements on NASA identifiers and minors before inclusion.

## AI use record

| Tool | File or aspect | Purpose | Review |
|---|---|---|---|
| OpenAI Codex | This working inventory, `submission/credits-en.md` | Drafted a repository-based inventory and marked unverified sources as pending instead of claiming they were used. | Human review by Luciana and confirmation by the relevant data/art owners are pending. |

## Open confirmations

- Confirm with Federico which NASA challenge-listed data product was actually used, with the direct product link and provenance, as required by issue #15.
- Confirm exact data products, source versions, spatial crops or transformations, and where each appears after the science reviews are complete. Until then, keep the analysis status `not_assessed` and do not claim these planned products as used.
- Ask each contributor for actual AI-tool use and review, and for credits/terms for any art, media, font, model, or library distributed in the final demo. Coordinate the submission-form summary with Belinda (#11).
