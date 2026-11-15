import type { Analysis, Lang, Story, World } from './contracts'
import { messages } from './i18n'
import { site } from './site-copy'
import { sceneArt } from './scene-art'
import journeyArt from './art/journey.svg'

export const culturalUrl = 'https://archivodefolkloreboliviano.org/motivo/turubo/'
export const challengeUrl = 'https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/'
const repository = 'https://github.com/federicorv25/turubo'
const worlds = ['earth', 'moon', 'mars'] as const

export function renderHome(lang: Lang, journeyStarted: boolean) {
  const c = site[lang]
  return `
    <section class="hero">
      <div class="hero-art" aria-hidden="true"><img src="${journeyArt}" alt="" width="800" height="630" fetchpriority="high"></div>
      <div class="hero-copy">
        <p class="eyebrow"><span class="marker" aria-hidden="true"></span> ${c.homeTag}</p>
        <h1>TURUBO</h1>
        <p class="hero-subtitle">${c.subtitle}</p>
        <p class="hero-lead">${c.lead}</p>
        <div class="hero-actions">
          <a class="button primary" href="#/play">${journeyStarted ? c.resume : c.play} <span aria-hidden="true">→</span></a>
          <a class="button secondary" href="#/compare/moon">${c.compare}</a>
        </div>
      </div>
      <span class="art-label">${c.art}</span>
    </section>
    <ol class="route-list" aria-label="${c.route}">
      ${worlds.map((world, index) => `
        <li><a href="#/compare/${world}" data-world="${world}">
          <span class="orb" aria-hidden="true"></span>
          <span><small>0${index + 1}</small> <strong>${c.stops[world][0]}</strong><span class="route-site">${c.stops[world][1]}</span></span>
          <span class="route-arrow" aria-hidden="true">↗</span>
        </a></li>`).join('')}
    </ol>
    <section class="landing-note">
      <div><h2>${c.homeDetailTitle}</h2><p>${c.homeDetail}</p></div>
      <a class="text-link" href="#/about">${c.nav.about} <span aria-hidden="true">↗</span></a>
    </section>`
}

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
  return `
    <section class="about">
      <p class="eyebrow"><span class="marker" aria-hidden="true"></span> TURUBO · ${c.nav.about}</p>
      <h1>${c.aboutTitle}</h1><p class="about-lead">${c.aboutLead}</p>
      <div class="about-grid">
        <article><h2>${c.aboutStoryTitle}</h2><p>${c.aboutStory}</p><a href="${culturalUrl}">${c.cultural} ↗</a></article>
        <article><h2>${c.aboutScienceTitle}</h2><p>${c.aboutScience}</p><a href="${challengeUrl}">${c.challenge} ↗</a></article>
        <article><h2>${c.team}</h2><p>${c.teamText}</p></article>
        <article><h2>${c.credits}</h2><p>${c.creditsText}</p><a href="${repository}">${c.code} ↗</a></article>
      </div>
    </section>`
}
