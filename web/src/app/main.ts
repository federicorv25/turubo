import rawStory from '../../../content/story.json'
import { renderExperience, type JourneyState } from '../experience'
import { renderAnalysis } from '../analysis'
import type { Analysis, Lang, Story, World } from './contracts'
import { messages } from './i18n'
import { site } from './site-copy'
import { renderHome, renderAbout, renderStage, renderFinding, renderMethod, culturalUrl, challengeUrl } from './screens'
import mark from './art/turubo.svg'
import './style.css'

type Screen = 'home' | 'play' | 'compare' | 'about'
type Route = { screen: Exclude<Screen, 'compare'> } | { screen: 'compare'; world: World }
type DataState = { status: 'idle' | 'loading' | 'failed' } | { status: 'ready'; value: Analysis }

const preferenceKey = 'turubo.lang'
const kinds = ['home', 'play', 'compare', 'about'] as const
const story = rawStory as Story
let lang = preferredLanguage()
let route = readRoute()
let journey: JourneyState = { sceneId: story.order[0], answer: null }
let journeyStarted = false
let compareBack: 'play' | 'home' = 'home'
let analysis: DataState = { status: 'idle' }

function preferredLanguage(): Lang {
  try {
    const saved = localStorage.getItem(preferenceKey)
    if (saved === 'es' || saved === 'en') return saved
  } catch { /* Private storage settings do not block the adventure. */ }
  for (const locale of [...(navigator.languages ?? []), navigator.language]) {
    const code = locale?.toLowerCase().split('-')[0]
    if (code === 'es' || code === 'en') return code
  }
  return 'en'
}

function readRoute(): Route {
  const match = /^#\/(home|play|about|compare)(?:\/(earth|moon|mars))?$/.exec(location.hash)
  const screen = match?.[1]
  if (screen === 'compare') return { screen, world: (match?.[2] as World | undefined) ?? 'moon' }
  if (screen === 'play' || screen === 'about') return { screen }
  return { screen: 'home' }
}

function routeHash(screen: Screen, world: World = 'moon') {
  return screen === 'compare' ? `#/compare/${world}` : `#/${screen}`
}

function go(screen: Screen, world?: World) {
  location.hash = routeHash(screen, world)
}

const app = document.querySelector<HTMLDivElement>('#app')!
const header = document.createElement('header')
header.className = 'site-header'
const home = document.createElement('a')
home.className = 'wordmark'
home.href = routeHash('home')
home.innerHTML = `<img src="${mark}" alt="" width="40" height="40"><span>TURUBO</span>`
const nav = document.createElement('nav')
nav.className = 'site-nav'
const navLinks = kinds.map(screen => {
  const link = document.createElement('a')
  link.href = routeHash(screen)
  nav.append(link)
  return [screen, link] as const
})
const languages = document.createElement('nav')
languages.className = 'languages'
languages.setAttribute('aria-label', 'Language / Idioma')
const buttons = (['es', 'en'] as const).map(code => {
  const button = document.createElement('button')
  button.type = 'button'
  button.lang = code
  button.textContent = code.toUpperCase()
  button.setAttribute('aria-label', code === 'en' ? 'English' : 'Español')
  button.onclick = () => {
    lang = code
    try { localStorage.setItem(preferenceKey, code) } catch { /* Keep the choice for this visit. */ }
    render()
  }
  languages.append(button)
  return [code, button] as const
})
header.append(home, nav, languages)
const skip = document.createElement('a')
skip.className = 'skip-link'
skip.href = '#main-content'
skip.onclick = event => { event.preventDefault(); focusMain() }
const main = document.createElement('main')
main.id = 'main-content'
main.tabIndex = -1
const footer = document.createElement('footer')
const credits = document.createElement('a')
credits.href = routeHash('about')
const cultural = document.createElement('a')
cultural.href = culturalUrl
const challenge = document.createElement('a')
challenge.href = challengeUrl
challenge.textContent = 'NASA Space Apps 2026'
const footerTag = document.createElement('span')
footerTag.textContent = 'TURUBO · Santa Cruz, Bolivia'
footer.append(footerTag, credits, cultural, challenge)
app.append(skip, header, main, footer)

function focusMain() {
  const destination = main.querySelector<HTMLElement>('h1') ?? main
  destination.tabIndex = -1
  destination.focus({ preventScroll: true })
  window.scrollTo(0, 0)
}

function render(moveFocus = false) {
  const c = site[lang]
  document.documentElement.lang = lang
  document.title = route.screen === 'home' ? `TURUBO · ${c.subtitle}` : `${c.nav[route.screen]} · TURUBO`
  document.querySelector('meta[name=description]')?.setAttribute('content', c.lead)
  skip.textContent = c.skip
  nav.setAttribute('aria-label', c.navLabel)
  for (const [screen, link] of navLinks) {
    link.textContent = c.nav[screen]
    if (screen === route.screen) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  }
  for (const [code, button] of buttons) button.setAttribute('aria-pressed', String(lang === code))
  credits.textContent = c.credits
  cultural.textContent = c.cultural
  main.dataset.screen = route.screen
  if (route.screen === 'home') main.innerHTML = renderHome(lang, journeyStarted)
  else if (route.screen === 'play') renderPlay()
  else if (route.screen === 'compare') renderCompare(route.world)
  else main.innerHTML = renderAbout(lang)
  if (moveFocus) focusMain()
}

function renderPlay() {
  const scene = story.scenes[journey.sceneId]
  main.innerHTML = renderStage(lang, story, journey.sceneId)
  renderExperience(main.querySelector<HTMLDivElement>('.chapter-host')!, story, journey, lang, {
    update: next => { journeyStarted = true; journey = next; render(true) },
    openAnalysis: world => go('compare', world),
    analysisLabel: site[lang].terrainLink[scene.world]
  })
}

function renderCompare(world: World) {
  const c = site[lang]
  if (analysis.status !== 'ready') {
    const failed = analysis.status === 'failed'
    main.innerHTML = `<section class="analysis"><h1>${c.compare}</h1><p role="status">${failed ? c.dataError : c.dataLoad}</p></section>`
    if (failed) {
      const retry = document.createElement('button')
      retry.type = 'button'
      retry.textContent = c.retry
      retry.onclick = () => { analysis = { status: 'idle' }; render(true) }
      main.querySelector('.analysis')?.append(retry)
    } else if (analysis.status === 'idle') {
      void loadAnalysis()
    }
    return
  }

  const data = analysis.value
  renderAnalysis(main, data, world, lang, target => go('compare', target), () => go(compareBack), {
    finding: () => renderFinding(world, data, lang),
    method: () => renderMethod(lang),
    backLabel: compareBack === 'play' ? messages[lang].story : c.nav.home
  })
}

async function loadAnalysis() {
  analysis = { status: 'loading' }
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/analysis.json`)
    if (!response.ok) throw new Error('Terrain data unavailable')
    const data: Analysis = await response.json()
    if (data?.version !== 1 || data.simulated !== false || !Array.isArray(data.terrains) ||
        !Array.isArray(data.comparisons?.moon?.ranked) || !Array.isArray(data.comparisons?.mars?.ranked)) {
      throw new Error('Invalid terrain data')
    }
    analysis = { status: 'ready', value: data }
  } catch {
    analysis = { status: 'failed' }
  }
  if (route.screen === 'compare') render(main.contains(document.activeElement))
}

window.addEventListener('hashchange', () => {
  const previous = route.screen
  route = readRoute()
  if (route.screen === 'compare' && previous !== 'compare') compareBack = previous === 'play' ? 'play' : 'home'
  render(true)
})
render()
