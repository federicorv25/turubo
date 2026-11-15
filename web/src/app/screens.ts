import type { Analysis, Lang, Story, World } from './contracts'
import { messages } from './i18n'
import { site } from './site-copy'
import { sceneArt } from './scene-art'

export const culturalUrl = 'https://archivodefolkloreboliviano.org/motivo/turubo/'
export const challengeUrl = 'https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/'
const repository = 'https://github.com/federicorv25/turubo'

export function renderStage(lang: Lang, story: Story, sceneId: string) {
  const c = site[lang]
  const m = messages[lang]
  const world = story.scenes[sceneId].world
  const index = story.order.indexOf(sceneId)
  return `
    <div class="play-top">
      <p class="play-controls">${c.controls}</p>
      <ol class="chapter-trail" aria-label="${m.chapter}">
        ${story.order.map((id, i) => `<li${i === index ? ' aria-current="step"' : ''} class="${i < index ? 'visited' : ''}">
          <span class="visually-hidden">${story.scenes[id].title[lang]}: </span>${String(i + 1).padStart(2, '0')}
        </li>`).join('')}
      </ol>
    </div>
    <div class="play-grid">
      <div class="chapter-host"></div>
      <figure class="scene-figure" data-world="${world}">
        ${sceneArt(world)}
        <figcaption><span>${c.fiction} · ${m[world]}</span><span>${c.art}</span></figcaption>
      </figure>
    </div>`
}

export function renderFinding(world: World, data: Analysis, lang: Lang) {
  const c = site[lang]
  const finding = document.createElement('section')
  finding.className = 'finding'
  const tag = document.createElement('p')
  tag.className = 'eyebrow'
  tag.textContent = c.terrainData
  const heading = document.createElement('h2')
  heading.textContent = c.result
  const description = document.createElement('p')
  if (world === 'earth') {
    description.textContent = data.terrains.some(terrain => terrain.body === 'earth')
      ? c.earthResult : messages[lang].pendingDetail
  } else {
    const comparison = data.comparisons[world]
    const reference = data.terrains.find(terrain => terrain.id === comparison.referenceId)
    const candidate = data.terrains.find(terrain => terrain.id === comparison.ranked[0]?.id)
    const format = (value: number, digits = 2) => new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(value)
    if (comparison.status !== 'reviewed' || !reference || !candidate) {
      description.textContent = messages[lang].pendingDetail
    } else if (world === 'moon') {
      const ratio = candidate.metrics.reliefM > 0
        ? format(reference.metrics.reliefM / candidate.metrics.reliefM, 1)
        : null
      description.textContent = lang === 'es'
        ? `${candidate.name} fue la zona boliviana más cercana entre las que estudiamos. Aun así, Nobile Rim 1 tiene ${ratio ? `alrededor de ${ratio} veces su desnivel` : 'un desnivel diferente'} y una pendiente mediana mayor.`
        : `${candidate.name} was the closest Bolivian tile in our sample. Even so, Nobile Rim 1 has ${ratio ? `about ${ratio} times its relief` : 'different relief'} and a higher median slope.`
    } else {
      const earth = candidate.metrics
      const mars = reference.metrics
      description.textContent = lang === 'es'
        ? `Las pendientes medianas de ${candidate.name} (${format(earth.slopeMedianDeg)}°) y Jezero (${format(mars.slopeMedianDeg)}°) son cercanas. Jezero tiene más desnivel: ${format(mars.reliefM)} m frente a ${format(earth.reliefM)} m en Bolivia.`
        : `${candidate.name} (${format(earth.slopeMedianDeg)}°) and Jezero (${format(mars.slopeMedianDeg)}°) have similar median slopes. Jezero has more relief: ${format(mars.reliefM)} m versus ${format(earth.reliefM)} m in Bolivia.`
    }
  }
  finding.append(tag, heading, description)
  return finding
}

export function renderMethod(lang: Lang) {
  const c = site[lang]
  const details = document.createElement('details')
  details.className = 'method-box'
  details.innerHTML = `
    <summary>${c.method}</summary>
    <div>
      <p>${c.methodLead}</p><p>${c.methodUnits}</p><p>${c.moonLimit}</p>
      <p><strong>${c.sources}</strong></p>
      <ul>
        <li><a href="https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001">NASA JPL · NASADEM</a></li>
        <li><a href="https://pgda.gsfc.nasa.gov/products/78">NASA GSFC · LRO / LOLA Site06</a></li>
        <li><a href="https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic">USGS Astrogeology · Jezero CTX DEM</a></li>
      </ul>
      <p><a href="${repository}/tree/main/science/pipeline">${c.pipeline}</a></p>
    </div>`
  return details
}

export function renderAbout(lang: Lang) {
  const c = site[lang]
  const t = (es: string, en: string) => lang === 'es' ? es : en
  return `
    <section class="about">
      <p class="eyebrow"><span class="marker" aria-hidden="true"></span> TURUBO · ${c.nav.about}</p>
      <h1>${c.aboutTitle}</h1><p class="about-lead">${c.aboutLead}</p>
      <div class="about-grid">
        <article><h2>${c.aboutStoryTitle}</h2><p>${c.aboutStory}</p><a href="${culturalUrl}">${c.cultural} ↗</a></article>
        <article><h2>${c.aboutScienceTitle}</h2><p>${c.aboutScience}</p><a href="${challengeUrl}">${c.challenge} ↗</a></article>
        <article><h2>${c.team}</h2><p>${c.teamText}</p></article>
        <article><h2>${c.credits}</h2><p>${t('Codex asistió con la web, el guion y el procesamiento reproducible. Las ilustraciones de portada y aventura se generaron con Seedream 5.0 Pro en Kie.ai. Las mediciones vienen de modelos de elevación, sin IA en la clasificación.','Codex assisted with the website, story and reproducible processing. The cover and adventure illustrations were generated with Seedream 5.0 Pro via Kie.ai. Elevation models provide the measurements; AI did not rank the terrain.')}</p><a href="${repository}">${c.code} ↗</a></article>
      </div>
      <details class="science-detail"><summary>${t('Fuentes de imágenes, datos y licencias','Image, data and license sources')} <span aria-hidden="true">+</span></summary><div>
        <ul><li><a href="${repository}/blob/main/design/FUENTES_VISUALES.md">${t('Créditos de fotografías, mosaicos y texturas','Photograph, mosaic and texture credits')}</a></li>
        <li><a href="${repository}/tree/main/science/pipeline">${t('DATOS · NASADEM, LRO/LOLA y CTX','DATA · NASADEM, LRO/LOLA and CTX')}</a></li>
        <li><a href="${repository}/blob/main/design/ai-art-manifest.json">${t('Registro de ilustraciones generadas','Record of generated illustrations')}</a></li>
        <li><a href="${repository}/blob/main/LICENSE">${t('Licencia MIT del código original','MIT license for original code')}</a></li></ul>
      </div></details>
    </section>`
}
