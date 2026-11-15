import { mountOriginGallery, type OriginPhoto } from './origin-gallery'

/** Motion is decorative. All content is rendered before creating a graphics context. */
export function mountJourney(page: HTMLElement, scrollTo: (id: string) => void, onPhoto: (id: OriginPhoto) => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection
  const abort = new AbortController()
  const root = page.querySelector<HTMLElement>('.orbital-journey')!
  const rail = page.querySelector<HTMLElement>('.reading-line i')!
  const gallery = page.querySelector<HTMLElement>('.origin-gallery')
  const stopGallery = gallery && mountOriginGallery(gallery, reduced, connection, onPhoto)
  let stopOrbit: (()=>void) | undefined
  let loading = false
  let loaded = false
  let near = false
  let dead = false
  let frame = 0
  const ready = () => !dead && !reduced.matches && !connection?.saveData && !document.hidden
  const fallback = () => { stopOrbit?.(); stopOrbit=undefined; root.dataset.orbitState='fallback' }

  async function ensureOrbit() {
    if (!ready()) { fallback(); return }
    if (!near || loading || loaded) return
    if (!('WebGL2RenderingContext' in window)) { fallback(); return }
    loading=true
    try {
      const { mountOrbit } = await import('./orbit')
      if(!ready()) return
      stopOrbit=mountOrbit(root,ready)
      loaded=true
    } catch {
      loaded=true
      root.dataset.orbitState='fallback'
    } finally { loading=false }
  }
  const lazy = new IntersectionObserver(([entry])=>{ near=entry.isIntersecting; if(near) void ensureOrbit() },{ rootMargin:'180px 0px' })
  lazy.observe(root)
  const reveal = new IntersectionObserver(entries => {
    for(const entry of entries) if(entry.isIntersecting) { entry.target.classList.add('arrived'); reveal.unobserve(entry.target) }
  }, { threshold:.12 })
  page.querySelectorAll('.reveal').forEach(el=>reveal.observe(el))
  const onMotion = () => {
    if(reduced.matches || connection?.saveData) { fallback();loaded=false }
    else void ensureOrbit()
  }
  reduced.addEventListener('change',onMotion,{ signal:abort.signal })
  connection?.addEventListener('change',onMotion,{ signal:abort.signal })
  document.addEventListener('visibilitychange',()=>{if(!document.hidden && !loaded) void ensureOrbit()},{ signal:abort.signal })
  page.querySelectorAll<HTMLButtonElement>('[data-scroll]').forEach(button=>button.onclick=()=>scrollTo(button.dataset.scroll!))
  const drawScroll = () => {
    frame=0
    const scrollable=document.documentElement.scrollHeight-innerHeight
    const p=scrollable>0?Math.min(1,scrollY/scrollable):0
    rail.style.transform=`scaleX(${p})`
    const hero=page.querySelector<HTMLElement>('.hero-landscape')
    if(hero && !reduced.matches && !connection?.saveData && scrollY<innerHeight*1.3) hero.style.transform=`translateY(${scrollY*.14}px) scale(${1+Math.min(.12,p*.4)})`
  }
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(drawScroll)},{ passive:true,signal:abort.signal })
  drawScroll()
  return () => {
    dead=true
    abort.abort()
    if(frame) cancelAnimationFrame(frame)
    reveal.disconnect()
    lazy.disconnect()
    stopGallery?.()
    stopOrbit?.()
  }
}
