import {
  AmbientLight, DirectionalLight, Group, Mesh, MeshStandardMaterial, PerspectiveCamera,
  Scene, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, WebGLRenderer,
} from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Planet = 'moon' | 'mars'
const homeYaw: Record<Planet, number> = { moon: -.17, mars: .58 }

/** One renderer, moved to the visible chapter. No input is required to follow the story. */
export function mountOrbit(root: HTMLElement, active: () => boolean) {
  gsap.registerPlugin(ScrollTrigger)
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-orbit]'))
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  const scene = new Scene()
  const camera = new PerspectiveCamera(33, 1, .1, 60)
  const shape = new SphereGeometry(1.48, 64, 40)
  const surface = new MeshStandardMaterial({ color: 0xf5efe8, roughness: 1, metalness: 0 })
  const planet = new Mesh(shape, surface)
  const body = new Group()
  body.add(planet)
  planet.rotation.x = -.26
  const sun = new DirectionalLight(0xfff2df, 2.45)
  sun.position.set(-4.1, 2, 3.8)
  const fill = new AmbientLight(0xc8d8ff, .27)
  scene.add(body, sun, fill)
  const canvas = renderer.domElement
  canvas.className = 'planet-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const textures = new Map<Planet, Texture>()
  const pending = new Set<Planet>()
  const visible = new Map<HTMLElement, number>()
  const progress = new Map<HTMLElement, number>()
  const offset: Record<Planet, number> = { moon: 0, mars: 0 }
  const abort = new AbortController()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let current: HTMLElement | undefined
  let disposed = false
  let frame = 0
  let pointer: { id: number; x: number } | undefined
  let yaw = 0
  let zoom = 1
  let samples: number[] = []
  let sampleTime = 0
  let sampleLast = 0
  const qa = import.meta.env.DEV && new URLSearchParams(location.search).has('orbit-qa')

  function size() {
    const stage = current?.querySelector<HTMLElement>('.planet-stage')
    if (!stage) return
    const { width, height } = stage.getBoundingClientRect()
    if (width <= 1 || height <= 1) return
    const compact = window.innerWidth < 760
    const maxDpr = compact ? 1 : 1.5
    const pixelBudget = Math.sqrt(950000 / (width * height))
    renderer.setPixelRatio(Math.max(.65, Math.min(devicePixelRatio, maxDpr, pixelBudget)))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.position.z = Math.max(5.7, 1.61 / Math.tan(camera.fov * Math.PI / 360) / Math.min(1, camera.aspect))
    camera.updateProjectionMatrix()
    invalidate()
  }

  function prepare(world: Planet) {
    if (textures.has(world) || pending.has(world)) return
    pending.add(world)
    new TextureLoader().load(`${import.meta.env.BASE_URL}media/${world}-texture.webp`, texture => {
      if (disposed) { texture.dispose(); return }
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
      textures.set(world, texture)
      invalidate()
    }, undefined, () => { pending.delete(world) })
  }

  function invalidate() {
    if (frame || !current || disposed || document.hidden || !active() || reduced.matches) return
    frame = requestAnimationFrame(draw)
  }

  function draw(now: number) {
    frame = 0
    if (!current || disposed || document.hidden || reduced.matches) return
    const key = current.dataset.orbit as Planet
    const texture = textures.get(key)
    if (!texture) { current.removeAttribute('data-rendered'); return }
    if (surface.map !== texture) {
      surface.map = texture
      surface.needsUpdate = true
    }
    if (current.dataset.rendered !== 'true') current.dataset.rendered = 'true'
    const p = progress.get(current) ?? .5
    const testing = qa && sampleTime > 0 && now - sampleTime < 30000
    const targetYaw = homeYaw[key] + p * .84 + offset[key] + (testing ? (now-sampleTime) * .00012 : 0)
    const targetZoom = .91 + Math.sin(p * Math.PI) * .12
    yaw += (targetYaw - yaw) * .18
    zoom += (targetZoom - zoom) * .18
    body.rotation.y = yaw
    body.rotation.z = key === 'moon' ? -.11 : .15
    body.scale.setScalar(zoom)
    sun.color.setHex(key === 'moon' ? 0xfff5e8 : 0xffe1c2)
    renderer.render(scene, camera)
    if (qa && sampleTime > 0) {
      if (sampleLast) samples.push(now-sampleLast)
      sampleLast=now
      if (!testing) {
        const sorted=[...samples].sort((x,y)=>x-y)
        root.dataset.orbitPerformance=JSON.stringify({ durationMs:Math.round(now-sampleTime), frames:samples.length, fps:Math.round(samples.length*10000/(now-sampleTime))/10, p95ms:Math.round((sorted[Math.floor(sorted.length*.95)]??0)*10)/10, longFrames:samples.filter(ms=>ms>34).length, drawCalls:renderer.info.render.calls, dpr:renderer.getPixelRatio(), viewport:[innerWidth,innerHeight] })
        sampleTime=0
      }
    }
    if (testing || Math.abs(targetYaw-yaw) > .002 || Math.abs(targetZoom-zoom) > .001) invalidate()
  }

  function select() {
    const best = sections.filter(el => (visible.get(el) ?? 0) > .03)
      .sort((a,b)=>(visible.get(b) ?? 0)-(visible.get(a) ?? 0))[0]
    if (best === current) return
    current?.removeAttribute('data-rendered')
    current = best
    pointer=undefined
    if (!current) { canvas.remove(); return }
    const world = current.dataset.orbit as Planet
    yaw = homeYaw[world] + offset[world] + (progress.get(current) ?? .5) * .84
    current.querySelector('.planet-stage')?.append(canvas)
    prepare(world)
    size()
    invalidate()
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const section = entry.target.closest<HTMLElement>('[data-orbit]')
      if(section) visible.set(section, entry.intersectionRatio)
    }
    select()
  }, { threshold: [0, .03, .12, .3, .5, .65, .8] })
  const resize = new ResizeObserver(size)
  const triggers = sections.map(section => {
    const world = section.dataset.orbit as Planet
    const stage = section.querySelector<HTMLElement>('.planet-stage')!
    observer.observe(stage)
    resize.observe(stage)
    const options = { signal: abort.signal }
    stage.addEventListener('pointerdown', event => {
      if (current !== section || section.dataset.rendered !== 'true' || (event.button !== 0 && event.pointerType === 'mouse')) return
      pointer = { id:event.pointerId, x:event.clientX }
      stage.setPointerCapture(event.pointerId)
    }, options)
    stage.addEventListener('pointermove', event => {
      if (!pointer || pointer.id!==event.pointerId) return
      offset[world] += (event.clientX-pointer.x)*.008
      pointer.x=event.clientX
      invalidate()
    }, options)
    for (const name of ['pointerup','pointercancel','lostpointercapture']) stage.addEventListener(name, () => { pointer=undefined }, options)
    section.querySelectorAll<HTMLButtonElement>('[data-rotate]').forEach(button => {
      button.onclick = () => { offset[world] += Number(button.dataset.rotate)*.32; invalidate() }
    })
    if(qa) section.addEventListener('turubo-orbit-probe', () => {
      if(current!==section || !textures.has(world)) return
      samples=[];sampleLast=0;sampleTime=performance.now()
      delete root.dataset.orbitPerformance
      invalidate()
    }, options)
    return ScrollTrigger.create({ trigger: section, start:'top bottom',end:'bottom top', onUpdate:self=>{ progress.set(section,self.progress); if(current===section) invalidate() } })
  })
  document.addEventListener('visibilitychange', () => {
    if(document.hidden && frame) { cancelAnimationFrame(frame);frame=0 }
    else invalidate()
  }, { signal: abort.signal })
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault()
    canvas.remove()
    current?.removeAttribute('data-rendered')
    root.dataset.orbitState='fallback'
    teardown()
  }, { signal: abort.signal })
  root.dataset.orbitState='ready'

  function teardown() {
    if(disposed) return
    disposed=true
    abort.abort()
    if(frame) cancelAnimationFrame(frame)
    observer.disconnect()
    resize.disconnect()
    triggers.forEach(trigger=>trigger.kill())
    sections.forEach(section=>section.removeAttribute('data-rendered'))
    canvas.remove()
    for(const texture of textures.values()) texture.dispose()
    shape.dispose()
    surface.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
  return teardown
}
