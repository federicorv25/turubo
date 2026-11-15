import type { GraphicsScene, SceneGraphics } from '../graphics-contract'
import './graphics.css'

/**
 * Keeps one 3D instance alive across the play screen re-renders.
 * main.ts rebuilds the stage HTML on every decision and language change, so the canvas lives in a
 * persistent element that is moved into each new `.scene-figure`, next to its SVG fallback.
 * Three.js is only downloaded when a scene that uses it is shown (see ./index).
 */
let element: HTMLDivElement | undefined
let graphics: SceneGraphics | undefined
let loading = false
let unavailable = false
let latest: GraphicsScene | undefined
let session = 0

/** First cut of issue #7: only the Earth encounter is drawn in 3D; the other scenes keep their illustration. */
const usesGraphics = ({ scene, state }: GraphicsScene) => scene.world === 'earth' && state.sceneId === 'earth'

function supported() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return 'WebGL2RenderingContext' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches && !connection?.saveData
}

/** Call after drawing the play stage (SVG first). */
export function syncSceneGraphics(figure: HTMLElement | null, next: GraphicsScene) {
  latest = next
  if (!figure || unavailable || (!graphics && !loading && !usesGraphics(next))) return
  if (!supported()) { unavailable = true; return }
  if (!element) {
    element = document.createElement('div')
    element.className = 'scene-graphics'
    element.setAttribute('aria-hidden', 'true')
  }
  figure.insertBefore(element, figure.querySelector('figcaption'))
  if (graphics) graphics.update(next)
  else if (!loading) void load(element, session)
}

async function load(host: HTMLDivElement, id: number) {
  loading = true
  const initial = latest
  try {
    const { mountSceneGraphics } = await import('./index')
    if (id !== session || !initial) return
    const mounted = await mountSceneGraphics(host, initial)
    if (id !== session) { mounted?.dispose(); return }
    if (!mounted) { unavailable = true; host.remove(); return }
    graphics = mounted
    if (latest && latest !== initial) mounted.update(latest)
  } catch {
    if (id === session) { unavailable = true; host.remove() }
  } finally {
    if (id === session) loading = false
  }
}

/** Call when leaving the play screen: stops the renderer and frees its resources. */
export function releaseSceneGraphics() {
  session++
  loading = false
  unavailable = false
  latest = undefined
  graphics?.dispose()
  graphics = undefined
  element?.remove()
  element = undefined
}
