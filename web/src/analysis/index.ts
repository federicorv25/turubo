import type { Analysis, Lang, Terrain, World } from '../app/contracts'
import { messages } from '../app/i18n'

export function renderAnalysis(
  container: HTMLElement, data: Analysis, world: World, lang: Lang,
  onSelect: (world: World) => void, onBack: () => void
) {
  const m = messages[lang]
  const section = document.createElement('section')
  section.className = 'analysis'
  const heading = document.createElement('h1')
  heading.tabIndex = -1
  heading.textContent = m.evidence
  section.append(heading)
  const worlds = document.createElement('div')
  worlds.className = 'choices'
  for (const option of ['earth', 'moon', 'mars'] as const) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'secondary'
    button.textContent = m[option]
    button.setAttribute('aria-pressed', String(option === world))
    button.onclick = () => onSelect(option)
    worlds.append(button)
  }
  section.append(worlds)
  const context = document.createElement('p')
  context.textContent = m[`${world}Intro`]
  section.append(context)
  const comparison = world === 'earth' ? undefined : data.comparisons[world]
  const results: { label: string; terrain: Terrain }[] = []
  if (!data.simulated && world === 'earth') {
    for (const terrain of data.terrains.filter(item => item.body === 'earth')) {
      results.push({ label: m.earth, terrain })
    }
  } else if (!data.simulated && comparison?.status === 'reviewed') {
    const ids = [
      { id: comparison.referenceId, label: m.reference },
      ...comparison.ranked.map(({ id }, i) => ({ id, label: `#${i + 1}` })),
      { id: comparison.guidedId, label: m.guided }
    ]
    for (const { id, label } of ids) {
      const terrain = data.terrains.find(item => item.id === id)
      if (terrain) results.push({ label, terrain })
    }
  }
  if (results.length) {
    const list = document.createElement('div')
    list.className = 'terrain-list'
    for (const { label, terrain } of results) list.append(row(label, terrain, lang))
    section.append(list)
  } else {
    const notice = document.createElement('p')
    notice.className = 'data-status'
    notice.textContent = `${m.pending}. ${m.pendingDetail}`
    section.append(notice)
  }
  const method = document.createElement('p')
  method.className = 'notice'
  method.textContent = m.method
  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'secondary'
  back.textContent = m.story
  back.onclick = onBack
  section.append(method, back)
  container.replaceChildren(section)
}

function row(label: string, terrain: Terrain, lang: Lang) {
  const m = messages[lang]
  const box = document.createElement('article')
  box.className = 'terrain'
  const heading = document.createElement('h2')
  heading.textContent = `${label} · ${terrain.name}`
  box.append(heading)
  if (terrain.image && /^(?:maps\/)[\w./-]+\.(?:png|webp)$/i.test(terrain.image) && !terrain.image.includes('..')) {
    const map = document.createElement('img')
    map.src = `${import.meta.env.BASE_URL}${terrain.image}`
    map.alt = terrain.name
    map.loading = 'lazy'
    box.append(map)
  }
  const metrics = document.createElement('dl')
  const format = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 })
  for (const [key, value] of [
    [m.slope, terrain.metrics.slopeMedianDeg], [m.p90, terrain.metrics.slopeP90Deg],
    [m.relief, terrain.metrics.reliefM], [m.resolution, `${format.format(terrain.resolutionM)} m`],
    [m.coverage, `${format.format(100 * terrain.coverage)} %`]
  ] as const) {
    const dt = document.createElement('dt')
    dt.textContent = key
    const dd = document.createElement('dd')
    dd.textContent = typeof value === 'number' ? format.format(value) : value
    metrics.append(dt, dd)
  }
  box.append(metrics)
  if (terrain.source.startsWith('https://')) {
    const source = document.createElement('a')
    source.href = terrain.source
    source.textContent = m.source
    box.append(source)
  }
  return box
}
