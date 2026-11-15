import { ACESFilmicToneMapping, MathUtils, PerspectiveCamera, SRGBColorSpace, Scene, Vector3, WebGLRenderer } from 'three'
import type { GraphicsScene, MountSceneGraphics, SceneGraphics } from '../graphics-contract'
import { createEnvironment, createLighting } from './environment'
import { Serpent } from './serpent'
import { Shading, Tracker } from './shading'
import { SERPENT_POSITION, groundHeightAt } from './terrain'
import { Turubo } from './turubo'

/** Reaction to the Earth decision. The order follows `story.json` (earth.choices): dodge, then distract. */
type Outcome = 'waiting' | 'dodge' | 'distract'

const TURUBO_SPOT = new Vector3(2.1, 0, -5.9)
const TURUBO_SCALE = 1.25
/** He hops to his left, out of the strike line. */
const DODGE_OFFSET = new Vector3(-1.25, 0, -0.25)
/** Where the carved figure lands when he uses it as a distraction. */
const FIGURE_LANDING = new Vector3(-2.3, 0, -7.4)
const SHOT = { position: new Vector3(7.2, 2.6, -3.4), target: new Vector3(-0.2, 2.0, -9.4), fov: 45 }
const INTRO_OFFSET = new Vector3(1.6, 0.9, 3.4)
const INTRO_SECONDS = 2.4
const REACTION_SECONDS = { dodge: 2.4, distract: 2.7 }
/** Full display rate while something reacts; idle ambience drops to 30 fps after a quiet spell. */
const IDLE_AFTER_MS = 8000
const IDLE_FPS = 30

const smooth = (t: number, a: number, b: number) => {
  const x = MathUtils.clamp((t - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}
/** Rises over [a, b], holds, falls over [c, d]. */
const pulse = (t: number, a: number, b: number, c: number, d: number) => smooth(t, a, b) * (1 - smooth(t, c, d))

/** The Earth encounter (the scene with the serpent and the venom) is the 3D scene of this first cut. */
const isEncounter = ({ scene, state }: GraphicsScene) => scene.world === 'earth' && state.sceneId === 'earth'

function outcomeOf({ scene, state }: GraphicsScene): Outcome {
  const answer = state.answer
  if (!answer) return 'waiting'
  const index = scene.choices.findIndex(choice => choice === answer || (choice.next === answer.next && choice.label.en === answer.label.en))
  return index === 1 ? 'distract' : 'dodge'
}

function canAnimate() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return 'WebGL2RenderingContext' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches && !connection?.saveData
}

/**
 * Three.js scene for the Earth encounter of issue #7: Cerro Turubó platform, Turubó and the Serpent.
 * The HTML story keeps every text and button; this canvas only mirrors the story state.
 * Returns null (the SVG illustration stays) without WebGL 2, with reduced motion or data saving, or if setup fails.
 */
export const mountSceneGraphics: MountSceneGraphics = async (host, initial) => {
  if (!canAnimate()) return null
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: false, antialias: true, depth: true, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true })
  if (!context) return null

  const track = new Tracker()
  let renderer: WebGLRenderer | undefined
  try {
    renderer = new WebGLRenderer({ canvas, context, antialias: true, powerPreference: 'low-power' })
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    canvas.setAttribute('aria-hidden', 'true')
    canvas.className = 'scene-graphics-canvas'

    const scene = new Scene()
    const camera = new PerspectiveCamera(SHOT.fov, 1, 0.15, 220)
    const shading = new Shading(track)
    const environment = createEnvironment(shading, track)
    const lighting = createLighting(scene)
    const serpent = new Serpent(shading, track)
    const turubo = new Turubo(shading, track)
    turubo.group.scale.setScalar(TURUBO_SCALE)
    scene.add(environment.group, serpent.group, turubo.group)
    await renderer.compileAsync(scene, camera)
    return start(host, initial, { renderer, scene, camera, shading, environment, lighting, serpent, turubo, track })
  } catch {
    track.dispose()
    renderer?.dispose()
    if (!context.isContextLost()) context.getExtension('WEBGL_lose_context')?.loseContext()
    return null
  }
}

interface Parts {
  renderer: WebGLRenderer
  scene: Scene
  camera: PerspectiveCamera
  shading: Shading
  environment: ReturnType<typeof createEnvironment>
  lighting: ReturnType<typeof createLighting>
  serpent: Serpent
  turubo: Turubo
  track: Tracker
}

function start(host: HTMLElement, initial: GraphicsScene, parts: Parts): SceneGraphics {
  const { renderer, scene, camera, shading, environment, lighting, serpent, turubo, track } = parts
  const canvas = renderer.domElement
  const abort = new AbortController()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection
  const qa = import.meta.env.DEV && new URLSearchParams(location.search).has('graphics-qa')
  const groundY = groundHeightAt(TURUBO_SPOT.x, TURUBO_SPOT.z)
  const figureWorld = new Vector3()
  const figureFrom = new Vector3()
  const cameraFrom = new Vector3().copy(SHOT.position).add(INTRO_OFFSET)

  let disposed = false
  let encounter = false
  let outcome: Outcome = 'waiting'
  /** Seconds since the current reaction started; Infinity when settled. */
  let reactionTime = Infinity
  let thrown = false
  let introTime = 0
  let elapsed = 0
  let frame = 0
  let last = 0
  let quietSince = performance.now()
  let onScreen = true
  let ready = false
  let qaFrames: number[] = []
  let qaStart = 0

  host.append(canvas)

  function resize() {
    const { width, height } = host.getBoundingClientRect()
    if (width < 2 || height < 2) return
    const compact = window.innerWidth < 760 || matchMedia('(pointer: coarse)').matches
    const budget = Math.sqrt(1_100_000 / (width * height))
    renderer.setPixelRatio(Math.max(0.65, Math.min(devicePixelRatio, compact ? 1 : 1.5, budget)))
    renderer.setSize(width, height, false)
    const aspect = width / height
    camera.aspect = aspect
    // Keep the encounter framed horizontally on tall layouts.
    camera.fov = aspect < 1.05 ? MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(SHOT.fov / 2)) * 1.05 / aspect)) : SHOT.fov
    camera.updateProjectionMatrix()
    wake()
  }

  /** Settles both characters for the outcome, without replaying it (used on mount and after a re-render). */
  function settle(next: Outcome) {
    reactionTime = Infinity
    thrown = next === 'distract'
    if (thrown) {
      scene.attach(turubo.figure)
      turubo.figure.position.set(FIGURE_LANDING.x, groundHeightAt(FIGURE_LANDING.x, FIGURE_LANDING.z) + 0.06, FIGURE_LANDING.z)
      turubo.figure.rotation.set(0, 0.6, Math.PI / 2)
      turubo.figure.scale.setScalar(TURUBO_SCALE)
    } else {
      turubo.holdFigure()
    }
  }

  function apply(next: GraphicsScene) {
    const nextEncounter = isEncounter(next)
    const nextOutcome = nextEncounter ? outcomeOf(next) : 'waiting'
    if (nextEncounter && encounter && outcome === 'waiting' && nextOutcome !== 'waiting') {
      // A decision was just taken: play its reaction once.
      reactionTime = 0
      thrown = false
      turubo.holdFigure()
    } else if (!encounter || nextOutcome !== outcome) {
      settle(nextOutcome)
      if (!encounter && nextEncounter) introTime = 0
    }
    encounter = nextEncounter
    outcome = nextOutcome
    host.dataset.state = encounter ? (ready ? 'ready' : 'loading') : 'idle'
    quietSince = performance.now()
    wake()
  }

  /** Stage direction for one frame. */
  function step(dt: number) {
    elapsed += dt
    introTime += dt
    if (reactionTime !== Infinity) reactionTime += dt
    const t = reactionTime
    const active = outcome !== 'waiting' && t !== Infinity
    if (outcome !== 'waiting' && t !== Infinity && t > REACTION_SECONDS[outcome]) reactionTime = Infinity
    const done = outcome !== 'waiting' && !active

    // Turubó: guarding the figure while the serpent threatens; relaxes once it is subdued.
    let x = TURUBO_SPOT.x
    let z = TURUBO_SPOT.z
    let hop = 0
    turubo.crouch = 0
    turubo.throwArm = 0
    turubo.weary = 0.35
    turubo.guard = outcome === 'waiting' ? 1 : 0.3
    serpent.alert = 1
    serpent.rise = 0
    serpent.strike = 0
    serpent.subdued = done ? 1 : 0
    if (outcome === 'dodge') {
      const shift = active ? smooth(t, 0.5, 0.82) : 1
      x += DODGE_OFFSET.x * shift
      z += DODGE_OFFSET.z * shift
      if (active) {
        serpent.rise = pulse(t, 0, 0.25, 0.45, 0.6)
        serpent.strike = pulse(t, 0.42, 0.66, 0.8, 1.2)
        serpent.subdued = smooth(t, 1.1, 1.9)
        turubo.crouch = pulse(t, 0.15, 0.42, 0.48, 0.56)
        turubo.guard = MathUtils.lerp(1, 0.3, smooth(t, 1.2, 2.0))
        hop = Math.sin(Math.PI * smooth(t, 0.5, 0.82)) * 0.42
        if (t > 0.5 && t - dt <= 0.5) turubo.triggerJumpSquash()
        if (t > 0.82 && t - dt <= 0.82) turubo.triggerLandSquash()
      }
      serpent.lookTarget.set(TURUBO_SPOT.x, groundY + 1.5, TURUBO_SPOT.z)
    } else {
      serpent.lookTarget.set(x, groundY + 1.7, z)
    }
    if (outcome === 'distract') {
      if (active) {
        turubo.guard = t < 0.4 ? MathUtils.lerp(1, 0, smooth(t, 0, 0.3)) : MathUtils.lerp(0, 0.3, smooth(t, 1.4, 2.2))
        turubo.throwArm = -pulse(t, 0, 0.32, 0.4, 0.5) + pulse(t, 0.42, 0.55, 0.68, 1.0)
        serpent.rise = pulse(t, 0.95, 1.08, 1.15, 1.25)
        serpent.strike = pulse(t, 1.15, 1.38, 1.48, 1.8)
        serpent.subdued = smooth(t, 1.65, 2.5)
        if (!thrown && t >= 0.52) {
          thrown = true
          turubo.figure.getWorldPosition(figureFrom)
          scene.attach(turubo.figure)
        }
        if (thrown) {
          const flight = smooth(t, 0.52, 1.2)
          const landY = groundHeightAt(FIGURE_LANDING.x, FIGURE_LANDING.z) + 0.06
          turubo.figure.position.lerpVectors(figureFrom, figureWorld.set(FIGURE_LANDING.x, landY, FIGURE_LANDING.z), flight)
          turubo.figure.position.y += Math.sin(Math.PI * flight) * 1.1
          turubo.figure.rotation.set(0, 0.6, Math.PI / 2 * flight)
          turubo.figure.scale.setScalar(TURUBO_SCALE)
        }
      }
      if (thrown) serpent.lookTarget.copy(turubo.figure.position)
    }

    const facing = Math.atan2(-(SERPENT_POSITION.x - x), -(SERPENT_POSITION.z - z))
    turubo.update(x, groundY + hop, z, facing, hop < 0.02, elapsed, dt, groundY)
    serpent.update(elapsed, dt)
    shading.update(elapsed)
    lighting.update(elapsed, serpent.alert * (1 - serpent.subdued * 0.7))

    // Short camera move on entry, then a slow breathing drift around a fixed framing.
    const intro = smooth(introTime, 0, INTRO_SECONDS)
    camera.position.lerpVectors(cameraFrom, SHOT.position, intro)
    camera.position.x += Math.sin(elapsed * 0.21) * 0.06
    camera.position.y += Math.sin(elapsed * 0.17) * 0.03
    camera.lookAt(SHOT.target)
    environment.update(camera.position.x, camera.position.y, camera.position.z)
  }

  function running() {
    return !disposed && encounter && onScreen && !document.hidden
  }

  function loop(now: number) {
    frame = 0
    if (!running()) { last = 0; return }
    const busy = reactionTime !== Infinity || introTime < INTRO_SECONDS || now - quietSince < IDLE_AFTER_MS
    if (!qa && !busy && last && now - last < 1000 / IDLE_FPS - 4) {
      frame = requestAnimationFrame(loop)
      return
    }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
    last = now
    step(dt)
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      host.dataset.state = 'ready'
    }
    if (qa) sample(now)
    frame = requestAnimationFrame(loop)
  }

  /** Dev-only probe (?graphics-qa): fps and p95 frame time over 30 s, written to the host dataset. */
  function sample(now: number) {
    if (!qaStart) qaStart = now
    qaFrames.push(now)
    if (now - qaStart < 30000) return
    const gaps = qaFrames.slice(1).map((time, i) => time - qaFrames[i]).sort((a, b) => a - b)
    host.dataset.graphicsPerformance = JSON.stringify({
      fps: Math.round(gaps.length * 10000 / (now - qaStart)) / 10,
      p95ms: Math.round((gaps[Math.floor(gaps.length * 0.95)] ?? 0) * 10) / 10,
      longFrames: gaps.filter(ms => ms > 34).length,
      drawCalls: renderer.info.render.calls,
      dpr: renderer.getPixelRatio(),
      size: [canvas.width, canvas.height],
    })
    qaFrames = []
    qaStart = 0
  }

  function wake() {
    if (frame || !running()) return
    last = 0
    frame = requestAnimationFrame(loop)
  }

  function teardown() {
    if (disposed) return
    disposed = true
    abort.abort()
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    resizeObserver.disconnect()
    visibility.disconnect()
    canvas.remove()
    track.dispose()
    lighting.dispose()
    renderer.dispose()
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
  }

  /** Back to the SVG illustration and its HTML controls. */
  function fallback() {
    teardown()
    host.dataset.state = 'fallback'
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true
    wake()
  })
  visibility.observe(host)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0 }
    else wake()
  }, { signal: abort.signal })
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback() }, { signal: abort.signal })
  const onPreference = () => { if (reduced.matches || connection?.saveData) fallback() }
  reduced.addEventListener('change', onPreference, { signal: abort.signal })
  connection?.addEventListener('change', onPreference, { signal: abort.signal })

  apply(initial)
  resize()
  return {
    update(next) {
      if (!disposed) apply(next)
    },
    dispose() {
      teardown()
      delete host.dataset.state
    },
  }
}
