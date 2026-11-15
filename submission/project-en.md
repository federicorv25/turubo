# TURUBO — From Earth to New Worlds

> **Submission draft for review.** This document does not replace the Space Apps form. Fields marked **Pending verification** require the stable release, final credits, or team account before submission.

## High-level summary

TURUBO Atlas is a short interactive story and terrain-comparison project. It uses the Turubó legend as a clearly labelled adaptation and invites visitors to open a separate evidence panel. The panel compares measured relief at sites in Bolivia with planetary reference areas at a common scale.

The Valle de la Luna near San José de Chiquitos provides terrestrial windows. Cerro Turubó is a guided case outside the ranking. Nobile Rim 1 and Jezero are planetary references. The comparison concerns relief only. It does not claim landing safety, climate, composition, water, ice, resources, or habitability.

## How to play

1. Open the bilingual web experience.
2. Follow the short story through Earth, the Moon, and Mars. Choices affect story feedback, not the scientific result.
3. Select **View analysis** from any scene to inspect sources, scale, coverage, and terrain metrics.
4. Return to the story without losing the current scene.

## Response to the challenge

The challenge asks teams to identify Earth locations that analog permanent Moon-base locations and Mars. TURUBO Atlas provides an auditable way to explore terrain analogs. It keeps the story separate from measurements, uses comparable elevation windows, and states what the data can and cannot support.

## Data, sources, and method

The Mars reference is the [USGS/NASA CTX Jezero Science Investigation DEM](https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic), with a native pixel scale of 20 m. The documented pipeline uses 4 × 4 km windows, a common 40 m resolution, and at least 95% valid coverage. It derives median slope and P90 slope in degrees, plus relief as P95 minus P5 in metres. Cerro Turubó remains a guided comparison outside the order.

The reproducible pipeline in issue #12 processed **NASA LRO/LOLA Site06** for
Nobile Rim 1. It is derived from the LOLA instrument on NASA's Lunar
Reconnaissance Orbiter, a mission linked in the challenge resources. The same
pipeline processed [NASADEM HGT v001](https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001) for Bolivia and the USGS/NASA CTX Jezero
DEM for Mars. The manifest records product URLs, input hashes, CRS, native
resolution, 4 × 4 km recrops, 40 m analysis grids, coverage, maps, and
metrics. [NASA LRO/LOLA Site06](https://pgda.gsfc.nasa.gov/products/78) is
the lunar data source. The [processing manifest](https://github.com/federicorv25/turubo-atlas/blob/6d6111179c1580c3932b383ce8a1da3dc21c0781/science/pipeline/preview/manifest.json)
provides the trace from source products to derived maps.

**Pending verification before submission:** confirm in the final credits
inventory which of these processed products appears in the published experience
and demo, with its license and public location. Do not describe a processed
product as visible to jurors until #9 publishes it.

## Results and limits

The reviewed technical package from issue #12 compares Jezero with the Valle de
la Luna window R02 C02. Both 4 × 4 km windows have 100% valid coverage at the
40 m analysis resolution. Jezero has a median slope of 2.11°, P90 slope of
4.41°, and relief of 77.56 m. R02 C02 has a median slope of 1.64°, P90 slope
of 3.41°, and relief of 63.38 m. The result shows similar low median slopes,
while Jezero has 14.18 m more P95−P5 relief. R02 C02 ranks first in this
terrestrial grid at a standardized distance of 0.3851, but R05 C02 is nearly
tied at 0.3905. The ranking does not validate an analogue for a mission.

**Publication status:** issue #9 must still publish the reviewed JSON, maps,
and stable screenshots before this wording enters the final NASA form or demo.
If evidence is insufficient for a destination, the public panel and this form
will say **Not assessed**.

The comparison describes relief. It cannot establish biological, geological, operational, or safety conclusions beyond the measured terrain metrics.

## Credits, licenses, and AI disclosure

The [working credits inventory](https://github.com/federicorv25/turubo-atlas/pull/18) records the processed sources and their provenance. Its final review remains pending in #15, including the terms for the cultural adaptation and the credits for materials in the final version. Incorporate that reviewed inventory before submission.

OpenAI Codex assisted Belinda Quispe with this first draft and the presentation outline. Belinda, Erick, Luciana, and Federico must review it before publication. The final disclosure must list the tools actually used. Every AI-generated visual in the public demo must retain a visible label. The demo will not include photos, voice, or identifying features of minors.

## Links and final checks

| Item | Status |
| --- | --- |
| Public demo URL | **Pending** — distinct and accessible without sign-in |
| Final project URL | **Pending** — stable public release from #9 |
| Credits inventory | **Pending review** — issue #15 |
| Stable screenshots and published commit | **Pending** — issue #9 |
| NASA portal submission | **Pending** — Federico, issue #16 |
