import rawStory from '../../../content/story.json'
import { renderExperience, type JourneyState } from '../experience'
import { renderAnalysis } from '../analysis'
import type { Analysis, Lang, Story, World } from './contracts'
import { messages } from './i18n'
import './style.css'

const story = rawStory as Story
let lang: Lang = 'en'
let journey: JourneyState = { sceneId: story.order[0], answer: null }
let reference: World | null = null
let analysis: Analysis = {
  version: 1, simulated: false, terrains: [],
  comparisons: { moon: { status: 'not_assessed', ranked: [] }, mars: { status: 'not_assessed', ranked: [] } }
}

const app = document.querySelector<HTMLDivElement>('#app')!
const header = document.createElement('header')
const title = document.createElement('span')
title.className = 'brand'
title.textContent = 'TURUBO'
const languages = document.createElement('nav')
languages.setAttribute('aria-label', 'Language / Idioma')
const buttons = (['en', 'es'] as const).map(code => {
  const button = document.createElement('button')
  button.type = 'button'
  button.lang = code
  button.textContent = code === 'en' ? 'English' : 'Español'
  button.onclick = () => { lang = code; render(false) }
  languages.append(button)
  return [code, button] as const
})
header.append(title, languages)
const main = document.createElement('main')
const footer = document.createElement('footer')
const cultural = document.createElement('a')
cultural.href = 'https://archivodefolkloreboliviano.org/motivo/turubo/'
const challenge = document.createElement('a')
challenge.href = 'https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/'
challenge.textContent = 'NASA Space Apps 2026'
footer.append(cultural, challenge)
app.append(header, main, footer)

function render(moveFocus: boolean) {
  document.documentElement.lang = lang
  document.title = story.title[lang]
  cultural.textContent = lang === 'es' ? 'Fuente cultural' : 'Cultural source'
  for (const [code, button] of buttons) button.setAttribute('aria-pressed', String(lang === code))
  const openAnalysis = (world: World) => { reference = world; render(true) }
  if (reference) {
    renderAnalysis(main, analysis, reference, lang, openAnalysis, () => { reference = null; render(true) })
  } else {
    renderExperience(main, story, journey, lang, {
      update: next => { journey = next; render(true) }, openAnalysis
    })
  }
  main.setAttribute('aria-label', reference ? messages[lang].evidence : messages[lang].fiction)
  if (moveFocus) main.querySelector('h1')?.focus()
}

render(false)

fetch(`${import.meta.env.BASE_URL}data/analysis.json`)
  .then(response => response.ok ? response.json() : null)
  .then(data => {
    if (data?.version !== 1 || data.simulated !== false || !Array.isArray(data.terrains) || !data.comparisons?.moon || !data.comparisons?.mars) return
    analysis = data as Analysis
    if (reference) render(false)
  })
  .catch(() => { /* Keep the explicit not-assessed state if data cannot be loaded. */ })
