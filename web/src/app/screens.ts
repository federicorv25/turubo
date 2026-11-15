import type { Lang, Story } from './contracts'
import { messages } from './i18n'
import { site } from './site-copy'

export const culturalUrl = 'https://archivodefolkloreboliviano.org/motivo/turubo/'
export const challengeUrl = 'https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/'
const repository = 'https://github.com/federicorv25/turubo'

export function renderStage(lang: Lang, story: Story, sceneId: string) {
  const c = site[lang]
  const m = messages[lang]
  const world = story.scenes[sceneId].world
  const index = story.order.indexOf(sceneId)
  const t=(es:string,en:string)=>lang==='es'?es:en
  const art={prologue:'tallador',earth:'serpiente',moon:'sombras',mars:'umbral',epilogue:'nocturno'}[sceneId]??'legend'
  const playable=['earth','moon','mars'].includes(sceneId)
  const objective=world==='earth'?t('La plataforma del cerro','The hilltop platform'):world==='moon'?t('Las figuras entre sombras','The figures among shadows'):t('El umbral de Uaituparr','Uaituparr’s threshold')
  return `<section class="expedition ${playable?'':'expedition-bookend'}" data-scene="${sceneId}" data-graphics="loading" data-arrived="false">
    <div class="play-top">
      <div class="play-links"><a href="#/home" class="play-home">← ${t('Volver al viaje','Back to the journey')}</a>${sceneId!=='prologue'?`<button type="button" data-restart aria-label="${t('Empezar la aventura de nuevo','Restart the adventure')}">↺ <span>${t('Reiniciar','Restart')}</span></button>`:''}${playable?`<button type="button" data-theatre-toggle aria-pressed="false" aria-label="${t('Ampliar escenario','Expand scene')}">⛶ <span>${t('Ampliar escenario','Expand scene')}</span></button>`:''}</div>
      <ol class="chapter-trail" aria-label="${m.chapter}">
        ${story.order.map((id, i) => `<li${i === index ? ' aria-current="step"' : ''} class="${i < index ? 'visited' : ''}">
          <span>${String(i + 1).padStart(2, '0')}</span><span class="trail-name">${[t('Origen','Origin'),t('Tierra','Earth'),t('Luna','Moon'),t('Marte','Mars'),t('Legado','Legacy')][i]}</span>
        </li>`).join('')}
      </ol>
    </div>
    <div class="play-grid">
      <figure class="scene-figure" data-world="${world}">
        <div class="scene-art cinematic-art" aria-hidden="true"><img src="${import.meta.env.BASE_URL}media/${art}-1280.webp" srcset="${import.meta.env.BASE_URL}media/${art}-640.webp 640w, ${import.meta.env.BASE_URL}media/${art}-1280.webp 1280w, ${import.meta.env.BASE_URL}media/${art}-1920.webp 1920w" sizes="100vw" width="1920" height="1080" alt=""></div>
        ${playable?`<div class="stage-objective"><span class="objective-label">${t('TU DESTINO','YOUR DESTINATION')}</span><strong>${objective}</strong><span class="walk-objective" role="status">${t('Preparando el paisaje…','Preparing the landscape…')}</span><progress class="approach-progress" value="0" max="100" aria-label="${t('Camino al encuentro','Journey to the encounter')}"></progress><button type="button" data-show-choices>${t('Mi siguiente paso','My next step')} ↓</button></div>
        <div class="walking-tools"><div class="key-guide"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / ↑ ↓ ← →</span><span>${t('Caminar · Espacio: saltar · clic en el suelo: avanzar','Walk · Space: jump · click the ground: move')}</span></div><button type="button" data-autowalk>${t('Guíame al encuentro','Guide me to the encounter')} <span aria-hidden="true">→</span></button></div>
        <div class="touch-walk" aria-label="${t('Controles para caminar','Walking controls')}">${(['up','left','down','right'] as const).map((dir,i)=>`<button type="button" data-walk="${dir}" aria-label="${t(['Caminar adelante','Caminar a la izquierda','Caminar atrás','Caminar a la derecha'][i],['Walk forward','Walk left','Walk backward','Walk right'][i])}">${['↑','←','↓','→'][i]}</button>`).join('')}</div>`:''}
        <figcaption><span>${c.fiction} · ${m[world]}</span><span class="scene-credit-illustration">${c.art} · Kie.ai</span><span class="scene-credit-3d">${lang==='es'?'Arte 3D asistido por IA':'AI-assisted 3D art'} · ${world==='earth'?'Asael + Codex':'TURUBO / Codex'}</span></figcaption>
      </figure>
      <div class="chapter-host"></div>
    </div></section>`
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
        <article><h2>${c.credits}</h2><p>${t('Asael creó la escena de Tierra y los personajes 3D con apoyo de Google AI Studio y Claude Code. Federico y Codex ampliaron el recorrido, los controles y las escenas de Luna y Marte. El arte narrativo se generó con Seedream 5.0 Pro en Kie.ai. Las comparaciones usan mediciones de elevación.','Asael created the Earth scene and 3D characters with help from Google AI Studio and Claude Code. Federico and Codex extended the journey, controls, Moon and Mars scenes. Narrative artwork was generated with Seedream 5.0 Pro via Kie.ai. The comparisons use elevation measurements.')}</p><a href="${repository}">${c.code} ↗</a></article>
      </div>
      <details class="science-detail"><summary>${t('Fuentes de imágenes, datos y licencias','Image, data and license sources')} <span aria-hidden="true">+</span></summary><div>
        <ul><li><a href="${repository}/blob/main/design/FUENTES_VISUALES.md">${t('Créditos de fotografías, mosaicos y texturas','Photograph, mosaic and texture credits')}</a></li>
        <li><a href="${repository}/tree/main/science/pipeline">${t('DATOS · NASADEM, LRO/LOLA y CTX','DATA · NASADEM, LRO/LOLA and CTX')}</a></li>
        <li><a href="${repository}/blob/main/design/ai-art-manifest.json">${t('Registro de ilustraciones generadas','Record of generated illustrations')}</a></li>
        <li><a href="${repository}/blob/main/LICENSE">${t('Licencia MIT del código original','MIT license for original code')}</a></li></ul>
      </div></details>
    </section>`
}
