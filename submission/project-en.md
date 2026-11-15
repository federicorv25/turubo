# TURUBO: From Earth to New Worlds

Copy-ready text for [My Team → Project → Edit](https://www.spaceappschallenge.org/2026/find-a-team/turubo/?tab=project). This prepares the submission; nothing has been saved or submitted to Space Apps.

## Project Name

TURUBO: From Earth to New Worlds

## Summary

TURUBO is a bilingual interactive journey and web adventure inspired by the Chiquitano story of Turubó. Visitors explore Bolivia, the Moon and Mars through interactive globes and can compare real terrain from San José de Chiquitos with Nobile Rim 1 and Jezero. We use open elevation data to find the closest Bolivian tiles within a fixed sample and show how they differ in slope and relief. Local storytelling makes planetary data accessible and gives visitors a reason to explore the evidence.

## Project Demonstration

https://github.com/federicorv25/turubo/releases/download/turubo-demo-3d-2026/TURUBO_Demo_3D_EN.pdf

Seven English slides, including cover and closing. This link works without an account.

## Final Project

https://turubo.tech/

## Project Information

TURUBO connects a story from the Chiquitania in Bolivia with NASA Space Apps' challenge to identify and characterize terrestrial terrain analogs. Visitors scroll from the Chiquitanian forest to interactive views of the Moon and Mars, play a short fantasy adventure or open the measured terrain directly. A visitor can return from a comparison to the same choice in the story. Cerro Turubó is a separate guided example outside the ranking.

We fixed 25 tiles of 4 × 4 km around the Valle de la Luna of San José de Chiquitos. We averaged all elevation crops onto a 40 m grid and kept tiles with at least 95% valid coverage. We ranked the Bolivian sample by standardized distance over median slope, P90 slope and P95 minus P5 relief. The same-scale maps display elevations relative to each tile's median.

R03 C01 ranks first for the Moon within our sample. Nobile Rim 1 has 624.61 m of relief and a 14.70° median slope, compared with 229.61 m and 7.16° in R03 C01. The lunar DEM interpolates numerous heights, so full valid grid coverage does not mean direct measurements at every point. R02 C02 is closest to Jezero. Their median slopes are close (1.64° and 2.11°), while Jezero has more relief (77.56 m versus 63.38 m). These results describe the terrain shape in the selected windows. They do not establish landing safety, access, geology, climate, resources or habitability.

Python, Rasterio, PyProj, NumPy and Pillow prepare the evidence. The site uses TypeScript, Vite, Three.js and GSAP ScrollTrigger. An illustrated fallback keeps the journey usable with reduced motion, data saver or without WebGL. The [source-to-result workflow](https://github.com/federicorv25/turubo/tree/main/science/pipeline) and [credits](https://github.com/federicorv25/turubo/blob/main/submission/credits-en.md) are public.

## Use of Super Intelligence (SI)

OpenAI Codex assisted with software, tests, vector art, scientific communication and the demo. ChatGPT supported bilingual story editing. Cursor Composer supported the terrain comparison interface. Kie.ai Seedream 5.0 Pro generated the cover and adventure illustrations, which are labeled visibly. Documentary photos are sourced separately. The maps, measurements and sample rankings come from the cited elevation products and reproducible calculations. The site makes no model API calls. Choose only form options corresponding to these uses.

## NASA Data

Enter each resource name as Link Text and its URL in Link.

| Link Text | Link |
| --- | --- |
| NASA LRO mission and LOLA instrument (challenge resource) | https://pds-geosciences.wustl.edu/missions/lro/ |
| NASA GSFC LRO/LOLA Site06, Nobile Rim 1 elevation | https://pgda.gsfc.nasa.gov/products/78 |
| NASA EOSDIS LP DAAC NASADEM HGT V001 | https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001 |
| NASA SVS CGI Moon Kit, LROC global texture | https://svs.gsfc.nasa.gov/4720/ |
| NASA VIPER Nobile-area composite | https://science.nasa.gov/mission/viper/lunar-operations/ |
| NASA/JPL/ASU/MSSS Perseverance panorama PIA24921 | https://science.nasa.gov/photojournal/detailed-panorama-of-mars-jezero-crater-delta/ |
| NASA/JPL-Caltech global Mars texture | https://science.nasa.gov/3d-resources/mars/ |

## Space Agency Partner & Other Data

| Link Text | Link |
| --- | --- |
| USGS Astrogeology Jezero CTX DEM | https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic |
| OpenTopography NASADEM distribution | https://portal.opentopography.org/datasetMetadata?otCollectionID=OT.032021.4326.2 |
| Archivo de Folklore Boliviano: Motivo Turubó | https://archivodefolkloreboliviano.org/motivo/turubo/ |
| Ruditaly: Cerro Turubó (CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:Cerro_Turub%C3%B3_-_San_Jos%C3%A9_de_Chiquitos,_Bolivia.jpg |
| Aldrihe: Valle de la Luna de San José de Chiquitos (CC BY-SA 4.0) | https://commons.wikimedia.org/wiki/File:Imagen_del_Ni%C3%B1o_Jes%C3%BAs_en_la_monta%C3%B1a_del_Valle_de_la_luna_de_San_Jos%C3%A9_de_Chiquitos.jpg |
| Three.js | https://threejs.org/ |
| GSAP / ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ |
| Kie.ai Seedream 5.0 Pro | https://kie.ai/seedream-5-0-pro |
| Complete credits, font and software licenses and AI usage | https://github.com/federicorv25/turubo/blob/main/submission/credits-en.md |

## Handoff for Federico

1. Review the [submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/) and the current form. The Summary field allows 1,500 characters; this draft is below the limit. The project and demo links were checked separately without account credentials.
2. Confirm each member's local registration, any separate Santa Cruz process and the presentation schedule. The team's target is 11:15 Bolivia; the supplied schedule lists a 12:00 local upload. The portal's November 15 23:59 local deadline does not replace the local process.
3. Review the terms, originality and rights statements before choosing whether to accept them and click **Submit for Judging**. **Save Progress** makes edits visible without sending them to judging.
4. When you submit, save the confirmation banner, timestamp and public project URL. If the game changes before submission, update the demo and credits to match.

Status: no fields saved in the portal, neither submission checkbox checked, no judging submission. The unreceived game in #7 is not part of this version.
