import type { Analysis, Comparison, Destination, Lang, Terrain, World } from '../app/contracts'
import { messages } from '../app/i18n'
import { panelCopy } from './copy'
import './analysis.css'

type RenderOpts = {
  container: HTMLElement
  data: Analysis
  world: World
  lang: Lang
  onWorld: (world: World) => void
  onBack: () => void
}

const selectedRankId: Partial<Record<Destination, string>> = {}

export function renderAnalysis(
  container: HTMLElement,
  data: Analysis,
  world: World,
  lang: Lang,
  onSelect: (world: World) => void,
  onBack: () => void
) {
  renderPanel({ container, data, world, lang, onWorld: onSelect, onBack })
}

function renderPanel(opts: RenderOpts) {
  const { container, data, world, lang, onWorld, onBack } = opts
  const m = messages[lang]
  const p = panelCopy[lang]
  const section = document.createElement('section')
  section.className = 'analysis'

  const heading = document.createElement('h1')
  heading.id = 'analysis-title'
  heading.tabIndex = -1
  heading.textContent = m.evidence
  section.append(heading)

  const header = document.createElement('div')
  header.className = 'analysis-header'
  const intro = document.createElement('p')
  intro.className = 'analysis-intro'
  intro.textContent = m[`${world}Intro`]
  header.append(intro)
  section.append(header)

  const worlds = document.createElement('div')
  worlds.className = 'choices analysis-worlds'
  worlds.setAttribute('role', 'group')
  worlds.setAttribute('aria-labelledby', 'analysis-title')
  for (const option of ['earth', 'moon', 'mars'] as const) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'secondary'
    button.textContent = m[option]
    button.setAttribute('aria-pressed', String(option === world))
    button.onclick = () => onWorld(option)
    worlds.append(button)
  }
  section.append(worlds)

  const live = document.createElement('div')
  live.className = 'analysis-live'
  live.setAttribute('aria-live', 'polite')
  live.setAttribute('aria-atomic', 'true')
  if (world === 'earth') {
    live.append(renderEarthSites(data, lang))
  } else {
    const comparison = data.comparisons[world]
    live.append(renderDestinationComparison(world, data, comparison, lang, opts))
  }
  section.append(live)

  const method = document.createElement('p')
  method.className = 'notice limitations'
  method.textContent = `${m.method} ${p.limitations}`

  const actions = document.createElement('div')
  actions.className = 'analysis-actions'
  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'secondary'
  back.textContent = m.story
  back.onclick = onBack
  actions.append(back)

  section.append(method, actions)
  container.replaceChildren(section)
}

function renderEarthSites(data: Analysis, lang: Lang) {
  const p = panelCopy[lang]
  const block = document.createElement('div')
  block.className = 'compare-panel'
  const title = document.createElement('h2')
  title.textContent = p.earthSites
  block.append(title)

  const earthTerrains = data.terrains.filter(t => t.body === 'earth')
  if (!earthTerrains.length || data.simulated) {
    block.append(pendingNotice(lang))
    return block
  }

  const grid = document.createElement('div')
  grid.className = 'earth-grid'
  for (const terrain of earthTerrains) {
    grid.append(terrainCard(terrain, lang, { role: messages[lang].terrain }))
  }
  block.append(grid)
  return block
}

function renderDestinationComparison(
  dest: Destination,
  data: Analysis,
  comparison: Comparison,
  lang: Lang,
  opts: RenderOpts
) {
  const p = panelCopy[lang]
  const block = document.createElement('div')
  block.className = 'compare-panel'

  if (data.simulated || comparison.status !== 'reviewed') {
    block.append(pendingNotice(lang))
    return block
  }

  const reference = findTerrain(data, comparison.referenceId)
  const ranked = comparison.ranked
    .map(entry => ({ entry, terrain: findTerrain(data, entry.id) }))
    .filter((item): item is { entry: (typeof comparison.ranked)[number]; terrain: Terrain } => Boolean(item.terrain))

  if (!reference || !ranked.length) {
    block.append(pendingNotice(lang))
    return block
  }

  const activeId = selectedRankId[dest] ?? ranked[0].entry.id
  if (!ranked.some(r => r.entry.id === activeId)) selectedRankId[dest] = ranked[0].entry.id
  const active = ranked.find(r => r.entry.id === (selectedRankId[dest] ?? ranked[0].entry.id)) ?? ranked[0]

  const rankingNote = document.createElement('p')
  rankingNote.className = 'ranking-note'
  rankingNote.textContent = p.rankingNote
  block.append(rankingNote)

  const compareTitle = document.createElement('h2')
  compareTitle.id = `compare-heading-${dest}`
  compareTitle.tabIndex = -1
  compareTitle.textContent = p.compareHeading
  block.append(compareTitle)

  const scaleHint = document.createElement('p')
  scaleHint.className = 'ranking-note'
  scaleHint.textContent = p.sameScale
  block.append(scaleHint)

  const columns = document.createElement('div')
  columns.className = 'compare-columns'
  const activeIndex = ranked.findIndex(r => r.entry.id === active.entry.id)
  const candidateRole =
    activeIndex === 0 ? p.closestCandidate : `#${activeIndex + 1} · ${messages[lang].ranked}`
  columns.append(
    terrainCard(reference, lang, { role: p.planetaryReference }),
    terrainCard(active.terrain, lang, {
      role: candidateRole,
      distance: active.entry.distance
    })
  )
  block.append(columns)

  if (ranked.length > 1) {
    const pickerLabel = document.createElement('p')
    pickerLabel.className = 'ranking-note'
    pickerLabel.id = `candidate-label-${dest}`
    pickerLabel.textContent = p.pickCandidate
    block.append(pickerLabel)

    const picker = document.createElement('div')
    picker.className = 'candidate-picker'
    picker.setAttribute('role', 'group')
    picker.setAttribute('aria-labelledby', pickerLabel.id)
    ranked.forEach(({ entry, terrain }, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'secondary'
      button.textContent = `#${index + 1} · ${terrain.name}`
      button.setAttribute('aria-pressed', String(entry.id === active.entry.id))
      button.onclick = () => {
        selectedRankId[dest] = entry.id
        renderPanel(opts)
        // Keep keyboard focus on the selected candidate after replacing the panel.
        queueMicrotask(() =>
          opts.container.querySelectorAll<HTMLButtonElement>('.candidate-picker button')[index]?.focus()
        )
      }
      picker.append(button)
    })
    block.append(picker)
  }

  if (comparison.guidedId) {
    const guidedTerrain = findTerrain(data, comparison.guidedId)
    if (guidedTerrain) {
      const guided = document.createElement('section')
      guided.className = 'guided-panel'
      guided.setAttribute('aria-labelledby', `guided-${dest}`)
      const guidedTitle = document.createElement('h2')
      guidedTitle.id = `guided-${dest}`
      guidedTitle.textContent = p.guidedApart
      const guidedText = document.createElement('p')
      guidedText.className = 'ranking-note'
      guidedText.textContent = p.guidedNote
      guided.append(guidedTitle, guidedText, terrainCard(guidedTerrain, lang, { role: messages[lang].guided }))
      block.append(guided)
    }
  }

  return block
}

function pendingNotice(lang: Lang) {
  const m = messages[lang]
  const notice = document.createElement('p')
  notice.className = 'data-status'
  notice.textContent = `${m.pending}. ${m.pendingDetail}`
  return notice
}

function findTerrain(data: Analysis, id?: string) {
  if (!id) return undefined
  return data.terrains.find(t => t.id === id)
}

function terrainCard(
  terrain: Terrain,
  lang: Lang,
  opts: { role: string; distance?: number }
) {
  const m = messages[lang]
  const p = panelCopy[lang]
  const format = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 })

  const card = document.createElement('article')
  card.className = 'terrain-card'
  const tag = document.createElement('p')
  tag.className = 'role-tag'
  tag.textContent = opts.role
  const name = document.createElement('h3')
  name.textContent = terrain.name
  card.append(tag, name)

  const frame = document.createElement('div')
  frame.className = 'map-frame'
  const imagePath = safeMapPath(terrain.image)
  if (imagePath) {
    const map = document.createElement('img')
    map.src = `${import.meta.env.BASE_URL}${imagePath}`
    map.alt = terrain.name
    map.loading = 'lazy'
    map.decoding = 'async'
    // Preserve measured values and attribution if an image URL fails to load.
    map.onerror = () => {
      frame.classList.add('map-frame--empty')
      frame.replaceChildren(document.createTextNode(p.noImage))
    }
    frame.append(map)
  } else {
    frame.classList.add('map-frame--empty')
    frame.textContent = p.noImage
  }
  card.append(frame)

  const metrics = document.createElement('dl')
  metrics.className = 'metrics'
  const rows: [string, string][] = [
    [m.slope, `${format.format(terrain.metrics.slopeMedianDeg)}°`],
    [m.p90, `${format.format(terrain.metrics.slopeP90Deg)}°`],
    [m.relief, `${format.format(terrain.metrics.reliefM)} m`],
    [p.analysisResolution, `${format.format(terrain.resolutionM)} m`],
    [m.coverage, `${format.format(100 * terrain.coverage)} %`]
  ]
  if (typeof opts.distance === 'number') {
    rows.push([p.distance, format.format(opts.distance)])
  }
  for (const [label, value] of rows) {
    const dt = document.createElement('dt')
    dt.textContent = label
    const dd = document.createElement('dd')
    dd.textContent = value
    metrics.append(dt, dd)
  }
  card.append(metrics)

  if (terrain.source.startsWith('https://')) {
    const source = document.createElement('a')
    source.className = 'card-source'
    source.href = terrain.source
    source.rel = 'noopener noreferrer'
    source.target = '_blank'
    source.textContent = m.source
    card.append(source)
  }

  return card
}

function safeMapPath(image?: string) {
  if (!image) return undefined
  if (!/^(?:maps\/)[\w./-]+\.(?:png|webp)$/i.test(image) || image.includes('..')) return undefined
  return image
}