import type { Lang } from '../app/contracts'

const photos = [
  {
    id: 'cerro', author: 'Ruditaly', width: 1920, height: 1080,
    label: { es: 'Cerro Turubó', en: 'Cerro Turubó' },
    camera: { es: 'Vista amplia', en: 'Wide view' },
    alt: { es: 'Cerro Turubó sobre el bosque de San José de Chiquitos.', en: 'Cerro Turubó above the forest of San José de Chiquitos.' },
    source: 'Cerro_Turub%C3%B3_-_San_Jos%C3%A9_de_Chiquitos,_Bolivia.jpg',
  },
  {
    id: 'cerro-detail', author: 'Ruditaly', width: 1280, height: 896,
    label: { es: 'Cerro de cerca', en: 'Closer view' },
    camera: { es: 'Detalle recortado', en: 'Cropped detail' },
    alt: { es: 'Encuadre de la cumbre y la ladera boscosa del Cerro Turubó.', en: 'A closer view of Cerro Turubó’s summit and forested slope.' },
    source: 'Cerro_Turub%C3%B3_y_San_Jos%C3%A9_de_Chiquitos_-_Chiquitos,_Bolivia.jpg',
  },
  {
    id: 'valle-lookout', author: 'Aldrihe', width: 1280, height: 1174,
    label: { es: 'Valle de la Luna', en: 'Valle de la Luna' },
    camera: { es: 'Desde el Valle', en: 'From the valley' },
    alt: { es: 'Formaciones rocosas y vegetación en el Valle de la Luna de San José de Chiquitos.', en: 'Rock outcrops and vegetation in Valle de la Luna, San José de Chiquitos.' },
    source: 'Valle_de_la_Luna_de_San_Jos%C3%A9_de_Chiquitos.jpg',
  },
] as const

export type OriginPhoto = typeof photos[number]['id']
const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`
const count = (position: number) => `0${position + 1} / 0${photos.length}`

export function renderOriginGallery(lang: Lang, current: OriginPhoto) {
  const t = (es: string, en: string) => lang === 'es' ? es : en
  const active = Math.max(0, photos.findIndex(photo => photo.id === current))
  return `<div class="origin-gallery reveal" role="region" aria-label="${t('Fotografías reales de San José de Chiquitos','Real photographs of San José de Chiquitos')}">
    <figure class="gallery-body">
    <div class="gallery-scene" id="chiquitania-photos">
      ${photos.map((photo, index) => {
        const variants: number[] = [640, 1280]
        if (photo.width === 1920) variants.push(photo.width)
        const srcset = variants.map(width => `${media(`${photo.id}-${width}.webp`)} ${width}w`).join(', ')
        const large = media(`${photo.id}-640.webp`)
        const attributes = index === active
          ? `src="${large}" srcset="${srcset}" data-large`
          : `src="${media(`${photo.id}-224.webp`)}" data-src="${large}" data-srcset="${srcset}" aria-hidden="true"`
        return `<img class="gallery-frame" data-photo="${photo.id}" ${index === active ? 'data-current' : ''} ${attributes}
          sizes="(max-width: 700px) 92vw, 48vw" width="${photo.width}" height="${photo.height}" alt="${photo.alt[lang]}" loading="lazy" decoding="async">`
      }).join('')}
      <span class="gallery-tag" aria-hidden="true">${t('FOTOGRAFÍA · BOLIVIA','PHOTOGRAPHY · BOLIVIA')}</span>
      <span class="gallery-counter" aria-hidden="true">${count(active)}</span>
    </div>
    <figcaption class="gallery-caption" aria-live="polite" aria-atomic="true">
      ${photos.map((photo, index) => `<div class="gallery-credit" ${index === active ? '' : 'hidden'}>
        <span>${photo.camera[lang]} · ${photo.label[lang]}</span>
        <small><a href="https://commons.wikimedia.org/wiki/File:${photo.source}">${photo.author}</a>
        · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></small>
      </div>`).join('')}
    </figcaption>
    </figure>
    <div class="gallery-picker" role="group" aria-label="${t('Cambiar fotografía','Change photograph')}">
      ${photos.map((photo, index) => `<button type="button" class="gallery-thumb" aria-pressed="${index === active}" aria-controls="chiquitania-photos" data-view="${index}">
        <img src="${media(`${photo.id}-224.webp`)}" alt="" width="224" height="${Math.round(photo.height * 224 / photo.width)}" loading="lazy" decoding="async">
        <span>${photo.label[lang]}</span>
      </button>`).join('')}
    </div>
    <button type="button" class="gallery-play" data-start="${t('Ver recorrido automático','Play photo tour')}" data-pause="${t('Pausar recorrido','Pause photo tour')}" aria-controls="chiquitania-photos">
      <span aria-hidden="true">▷</span> <span>${t('Ver recorrido automático','Play photo tour')}</span>
    </button>
    <span class="gallery-status" role="status" data-error="${t('La foto no cargó. Puedes volver a intentarlo.','The photo did not load. You can try again.')}"></span>
  </div>`
}

/** Keeps the current photo visible while the next responsive image loads. */
export function mountOriginGallery(
  gallery: HTMLElement, motion: MediaQueryList, connection: (EventTarget & { saveData?: boolean }) | undefined,
  onSelect: (id: OriginPhoto) => void,
) {
  const frames = [...gallery.querySelectorAll<HTMLImageElement>('.gallery-frame')]
  const captions = [...gallery.querySelectorAll<HTMLElement>('.gallery-credit')]
  const controls = [...gallery.querySelectorAll<HTMLButtonElement>('.gallery-thumb')]
  const play = gallery.querySelector<HTMLButtonElement>('.gallery-play')!
  const counter = gallery.querySelector('.gallery-counter')!
  const caption = gallery.querySelector('.gallery-caption')!
  const status = gallery.querySelector<HTMLElement>('.gallery-status')!
  const abort = new AbortController()
  const options = { signal: abort.signal }
  const interval = 5200
  let current = Math.max(0, frames.findIndex(frame => frame.hasAttribute('data-current')))
  let request = 0
  let timer: number | undefined
  let visible = false
  let rotating = false

  const allowsMotion = () => !motion.matches && !connection?.saveData
  const canRotate = () => rotating && visible && !document.hidden && allowsMotion()
  function schedule() {
    window.clearTimeout(timer)
    if (canRotate()) {
      timer = window.setTimeout(() => { void select((current + 1) % frames.length, true) }, interval)
    }
  }

  function rotate(on: boolean) {
    if (rotating && !on) {
      request++
      gallery.removeAttribute('data-loading')
    }
    rotating = on && allowsMotion()
    play.dataset.playing = String(rotating)
    play.children[0].textContent = rotating ? 'Ⅱ' : '▷'
    play.children[1].textContent = rotating ? play.dataset.pause! : play.dataset.start!
    caption.setAttribute('aria-live', rotating ? 'off' : 'polite')
    schedule()
  }

  async function select(index: number, automatic = false) {
    if (!automatic) rotate(false)
    const id = ++request
    status.textContent = ''
    const image = frames[index]
    gallery.removeAttribute('data-loading')
    if (index === current) return
    if (!image.hasAttribute('data-large')) {
      gallery.dataset.loading = String(index)
      image.loading = 'eager'
      image.srcset = image.dataset.srcset!
      image.src = image.dataset.src!
      try {
        await image.decode()
        image.setAttribute('data-large', '')
      } catch {
        if (id === request && !abort.signal.aborted) {
          gallery.removeAttribute('data-loading')
          status.textContent = status.dataset.error!
          rotate(false)
        }
        return
      }
    }
    if (id !== request || abort.signal.aborted) return
    gallery.removeAttribute('data-loading')
    if (automatic && !canRotate()) { schedule(); return }
    frames[current].removeAttribute('data-current')
    frames[current].setAttribute('aria-hidden', 'true')
    captions[current].hidden = true
    controls[current].setAttribute('aria-pressed', 'false')
    current = index
    image.setAttribute('data-current', '')
    image.removeAttribute('aria-hidden')
    captions[current].hidden = false
    controls[current].setAttribute('aria-pressed', 'true')
    counter.textContent = count(current)
    onSelect(photos[current].id)
    schedule()
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .35
    schedule()
  }, { threshold: .35 })
  observer.observe(gallery)
  const onPreference = () => {
    play.hidden = !allowsMotion()
    if (!allowsMotion()) rotate(false)
  }
  onPreference()
  motion.addEventListener('change', onPreference, options)
  connection?.addEventListener('change', onPreference, options)
  document.addEventListener('visibilitychange', schedule, options)
  play.addEventListener('click', () => rotate(!rotating), options)
  controls.forEach((button, index) => {
    button.addEventListener('click', () => { void select(index) }, options)
    button.addEventListener('keydown', event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 :
        event.key === 'ArrowLeft' ? (index + controls.length - 1) % controls.length :
          event.key === 'ArrowRight' ? (index + 1) % controls.length : -1
      if (next < 0) return
      event.preventDefault()
      controls[next].focus()
      void select(next)
    }, options)
  })
  gallery.addEventListener('focusin', event => { if (event.target !== play && rotating) rotate(false) }, options)
  gallery.addEventListener('keydown', event => { if (event.key === 'Escape' && rotating) rotate(false) }, options)
  return () => {
    abort.abort()
    observer.disconnect()
    window.clearTimeout(timer)
  }
}
