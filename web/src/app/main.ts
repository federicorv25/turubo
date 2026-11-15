import rawStory from '../../../content/story.json'
import { renderExperience, type JourneyState } from '../experience'
import { releaseSceneGraphics, syncSceneGraphics } from '../experience/graphics/host'
import {restoreAdventure,saveAdventure} from '../experience/save'
import { renderAnalysis } from '../analysis'
import type { Analysis, Lang, Story, World } from './contracts'
import { messages } from './i18n'
import { site } from './site-copy'
import { renderAbout, renderStage, renderFinding, renderMethod } from './screens'
import { renderJourney, refreshJourneyData } from '../journey/content'
import { mountJourney } from '../journey/mount'
import type { OriginPhoto } from '../journey/origin-gallery'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-700.css'
import './style.css'
import '../journey/journey.css'
import '../experience/experience.css'

type Screen = 'home' | 'play' | 'compare' | 'about'
type Route = { screen: Exclude<Screen, 'compare'> } | { screen: 'compare'; world: World }
type DataState = { status: 'idle' | 'loading' | 'failed' } | { status: 'ready'; value: Analysis }

const preferenceKey = 'turubo.lang'
const kinds = ['home', 'play', 'compare', 'about'] as const
const story = rawStory as Story
let lang = preferredLanguage()
let route = readRoute()
const restored=restoreAdventure(story)
let journey: JourneyState = restored.journey
let journeyStarted = restored.started
const explorations = restored.positions
let compareBack: 'play' | 'home' = 'home'
let analysis: DataState = { status: 'idle' }
let unmountJourney: (() => void) | undefined
let landingScroll=0
let originPhoto: OriginPhoto = 'cerro'

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
home.textContent = 'TURUBO'
home.onclick = event => { if(route.screen==='home'){event.preventDefault(); setMenu(false); focusMain()} }
const nav = document.createElement('nav')
nav.className = 'site-nav'
nav.id = 'primary-navigation'
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
    if (lang === code) return
    lang = code
    try { localStorage.setItem(preferenceKey, code) } catch { /* Keep the choice for this visit. */ }
    render()
  }
  languages.append(button)
  return [code, button] as const
})
const tools = document.createElement('div')
tools.className = 'header-tools'
const menu = document.createElement('button')
menu.type = 'button'
menu.className = 'menu-toggle'
menu.setAttribute('aria-controls',nav.id)
menu.setAttribute('aria-expanded','false')
menu.innerHTML='<span aria-hidden="true"></span><span aria-hidden="true"></span>'
const setMenu = (open: boolean) => {
  menu.setAttribute('aria-expanded',String(open))
  header.dataset.menu = String(open)
  menu.setAttribute('aria-label',lang==='es' ? (open?'Cerrar menú':'Abrir menú') : (open?'Close menu':'Open menu'))
}
menu.onclick = () => {
  const open=header.dataset.menu!=='true'
  setMenu(open)
  if(open)navLinks[0][1].focus()
}
header.onkeydown = event => {
  if (event.key==='Escape' && header.dataset.menu==='true') { setMenu(false); menu.focus() }
}
nav.addEventListener('click',event=>{if((event.target as HTMLElement).closest('a'))setMenu(false)})
navLinks[0][1].onclick = event => { if(route.screen==='home'){event.preventDefault(); focusMain()} }
tools.append(languages,menu)
header.append(home, nav, tools)
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
const footerTag = document.createElement('span')
footerTag.innerHTML = '<span>TURUBO <small>· Santa Cruz, Bolivia</small></span>'
footer.append(footerTag, credits)
app.append(skip, header, main, footer)

function focusMain(top=true) {
  const destination = main.querySelector<HTMLElement>('h1') ?? main
  destination.tabIndex = -1
  destination.focus({ preventScroll: true })
  if(top) window.scrollTo(0, 0)
}

function render(moveFocus = false) {
  unmountJourney?.()
  unmountJourney=undefined
  if (route.screen !== 'play') releaseSceneGraphics()
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
  credits.textContent = lang==='es' ? 'Proyecto y fuentes ↗' : 'Project and sources ↗'
  setMenu(false)
  main.dataset.screen = route.screen
  if (route.screen === 'home') {
    main.innerHTML = renderJourney(lang, journeyStarted, analysis.status==='ready'?analysis.value:undefined, originPhoto)
    unmountJourney = mountJourney(main, id => {
      const section = document.getElementById(id)
      const heading = section?.querySelector<HTMLElement>('h2')
      if(heading) { heading.tabIndex=-1; heading.focus({preventScroll:true}) }
      section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }, photo => { originPhoto = photo })
    if (analysis.status==='idle') void loadAnalysis()
    if (analysis.status==='failed') refreshJourneyData(main,lang)
  }
  else if (route.screen === 'play') renderPlay()
  else if (route.screen === 'compare') renderCompare(route.world)
  else main.innerHTML = renderAbout(lang)
  if (moveFocus) focusMain()
}

function renderPlay() {
  const scene = story.scenes[journey.sceneId]
  main.innerHTML = renderStage(lang, story, journey.sceneId)
  renderExperience(main.querySelector<HTMLDivElement>('.chapter-host')!, story, journey, lang, {
    update: next => {
      journeyStarted = true
      if (next.sceneId === 'prologue') explorations.clear()
      journey = next
      saveAdventure(story,journey,explorations)
      render(true)
    },
    openAnalysis: world => go('compare', world),
    analysisLabel: site[lang].terrainLink[scene.world]
  })
  if (!explorations.has(journey.sceneId)) explorations.set(journey.sceneId, { x: 2.1, z: 6, arrived: false })
  const expedition = main.querySelector<HTMLElement>('.expedition')
  syncSceneGraphics(main.querySelector<HTMLElement>('.scene-figure'), {
    scene, state: journey, language: lang, exploration: explorations.get(journey.sceneId)!,
    onStatus: (status, arrived) => {
      if (!expedition) return
      expedition.dataset.graphics = status
      expedition.dataset.arrived = String(arrived)
      const instruction = expedition.querySelector<HTMLElement>('.walk-objective')
      if (instruction) instruction.textContent = status === 'loading'
        ? (lang === 'es' ? 'Preparando el paisaje…' : 'Preparing the landscape…')
        : arrived ? (lang === 'es' ? 'Llegaste. Elige cómo seguir.' : 'You arrived. Choose how to continue.')
          : (lang === 'es' ? 'Sigue la luz hasta el encuentro.' : 'Follow the light to the encounter.')
    }
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
  else if (route.screen==='home') refreshJourneyData(main,lang,analysis.status==='ready'?analysis.value:undefined)
}

window.addEventListener('hashchange', () => {
  saveAdventure(story,journey,explorations)
  const previous = route.screen
  if(previous==='home') landingScroll = window.scrollY
  route = readRoute()
  if (route.screen === 'compare' && previous !== 'compare') compareBack = previous === 'play' ? 'play' : 'home'
  render(true)
  if(route.screen==='home' && previous==='compare' && landingScroll) window.scrollTo(0,landingScroll)
})
window.addEventListener('pagehide',()=>saveAdventure(story,journey,explorations))
render()
