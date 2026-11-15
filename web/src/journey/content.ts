import type { Analysis, Lang } from '../app/contracts'
import { renderOriginGallery, type OriginPhoto } from './origin-gallery'

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`
const tr = (lang: Lang, es: string, en: string) => lang === 'es' ? es : en
const arrow = '<span aria-hidden="true">↗</span>'
const picture = (id: 'jezero', alt: string, sizes = '(max-width: 700px) 100vw, 55vw') => `<img src="${media(`${id}-1280.webp`)}" srcset="${media(`${id}-640.webp`)} 640w, ${media(`${id}-1280.webp`)} 1280w, ${media(`${id}-1920.webp`)} 1920w" sizes="${sizes}" width="1920" height="539" alt="${alt}" loading="lazy" decoding="async">`

export function refreshJourneyData(root: HTMLElement, lang: Lang, data?: Analysis) {
  for (const world of ['moon','mars'] as const) {
    const findingNode=root.querySelector(`[data-orbit="${world}"] .world-finding`)
    if(findingNode) findingNode.innerHTML=data?finding(world,lang,data):`<span>${tr(lang,'Mediciones no disponibles en este momento.','Measurements unavailable at the moment.')}</span>`
    const pair=root.querySelector(`.evidence-pair[data-world="${world}"] .pair-stat`)
    if(pair) pair.innerHTML=stat(world,lang,data)
  }
}

export function renderJourney(lang: Lang, started: boolean, data?: Analysis, photo: OriginPhoto = 'cerro') {
  const t = (es: string, en: string) => tr(lang, es, en)
  return `
  <div class="journey-page">
    <div class="reading-line" aria-hidden="true"><i></i></div>
    <section class="cinema-hero" aria-labelledby="journey-title" data-chapter="origin">
      <picture class="hero-landscape"><source media="(max-width:700px)" srcset="${media('nocturno-mobile.webp')}"><img src="${media('nocturno-1920.webp')}" srcset="${media('nocturno-1280.webp')} 1280w, ${media('nocturno-1920.webp')} 1920w" sizes="100vw" width="1920" height="1080" alt="${t('Ilustración de un cielo nocturno sobre un bosque inspirado en la Chiquitania.','An illustration of a night sky over a forest inspired by the Chiquitania.')}" fetchpriority="high"></picture>
      <div class="hero-veil" aria-hidden="true"></div>
      <div class="hero-sky" aria-hidden="true"><span class="sky-orbit"></span><span class="sky-dot"></span></div>
      <div class="hero-topline"><span>NASA SPACE APPS 2026</span><span>SANTA CRUZ, BOLIVIA <i></i> 17° S</span></div>
      <div class="cinema-title"><p class="eyebrow">${t('Una leyenda nos lleva más lejos','A legend takes us further')}</p><h1 id="journey-title">TURUBO<span class="title-star" aria-hidden="true">✧</span></h1><p class="cinema-subtitle">${t('De la Tierra a','From Earth to')}<br><em>${t('nuevos mundos.','new worlds.')}</em></p></div>
      <div class="hero-bottom"><p>${t('Turubó miró al cielo buscando compañía. Sigue su historia y descubre qué conecta los paisajes de Bolivia con la Luna y Marte.','Turubó looked to the sky in search of company. Follow his story and discover what connects Bolivia’s landscapes to the Moon and Mars.')}</p><div class="hero-links"><button type="button" class="button primary" data-scroll="legend-origin">${t('Entrar en el viaje','Enter the journey')} <span aria-hidden="true">↓</span></button><a class="button quiet" href="#/play">${started ? t('Continuar la aventura','Continue the adventure') : t('Jugar la aventura','Play the adventure')} ${arrow}</a></div></div>
      <div class="hero-baseline"><a class="hero-data-link" href="#/compare/moon">${t('Nuestros descubrimientos','Our discoveries')} <span aria-hidden="true">↗</span></a><span>${t('Ilustración generada con IA','AI-generated illustration')} · Kie.ai</span></div>
    </section>

    <section class="story-interlude" id="legend-origin" aria-labelledby="legend-title">
      <div class="story-scenes" aria-hidden="true">
        <img class="story-backdrop story-carver" src="${media('tallador-1280.webp')}" srcset="${media('tallador-640.webp')} 640w, ${media('tallador-1280.webp')} 1280w, ${media('tallador-1920.webp')} 1920w" sizes="100vw" width="1920" height="1080" loading="lazy">
        <img class="story-backdrop story-sky" src="${media('nocturno-1280.webp')}" width="1280" height="720" loading="lazy">
        <img class="story-backdrop story-traveller" src="${media('legend-1280.webp')}" width="1280" height="720" loading="lazy">
        <div class="story-vignette"></div>
        <span class="story-orbit"></span>
        <span class="story-spark spark-one"></span><span class="story-spark spark-two"></span>
      </div>
      <div class="story-beats">
        <article class="story-beat" data-beat="0"><span class="chapter-number">${t('EL RELATO QUE NOS MUEVE','THE STORY THAT MOVES US')} · 01</span><h2 id="legend-title">${t('Antes del viaje,','Before the journey,')}<br><em>${t('la soledad.','there was solitude.')}</em></h2><p>${t('Turubó modela figuras de barro y talla la madera. Busca compañía en sus creaciones, pero ninguna cobra vida. Solo le responden el silencio y la montaña.','Turubó shapes clay and carves wood. He seeks company in his creations, but none comes to life. Only silence and the mountain answer him.')}</p></article>
        <article class="story-beat" data-beat="1"><span class="chapter-number">02 · ${t('LA VISIÓN','THE VISION')}</span><h2>${t('Un vaso.','A cup.')}<br><em>${t('Un cielo distinto.','A different sky.')}</em></h2><p>${t('El vaso de la vida y la muerte abre una nueva mirada. En nuestra adaptación, Turubó ve otros mundos. Uaituparr le advierte en sueños, pero su deseo de llegar más lejos ya ha despertado.','The cup of life and death opens a new way of seeing. In our adaptation, Turubó glimpses other worlds. Uaituparr warns him in a dream, but the desire to go further has already awakened.')}</p></article>
        <article class="story-beat" data-beat="2"><span class="chapter-number">03 · ${t('EL PRIMER PASO','THE FIRST STEP')}</span><h2>${t('Para ir más lejos,','To go further,')}<br><em>${t('mira cerca.','look closer.')}</em></h2><p>${t('Turubó partirá con sus figuras. Nosotros empezamos por dos paisajes de su tierra. La leyenda inspira el viaje; los datos de NASA nos ayudan a descubrir sus parecidos con otros mundos.','Turubó will leave with his figures. We begin with two landscapes from his homeland. The legend inspires the journey; NASA data helps us explore their resemblances to other worlds.')}</p><button class="story-next" data-scroll="origin">${t('Conocer los lugares reales','Discover the real places')} <span aria-hidden="true">↓</span></button></article>
      </div>
      <p class="story-attribution">${t('Adaptación fantástica de un relato chiquitano · Arte generado con IA','A fantasy adaptation of a Chiquitano story · AI-generated artwork')} · Kie.ai</p>
    </section>

    <section id="origin" class="origin-section section-pad" data-chapter="origin" aria-labelledby="origin-title">
      <div class="section-heading"><span class="chapter-number">01 / ${t('EL ORIGEN','THE ORIGIN')}</span><span class="coordinates">SAN JOSÉ DE CHIQUITOS · BOLIVIA</span></div>
      <div class="origin-layout">
        <div class="origin-copy reveal">
          <h2 id="origin-title">${t('El viaje','The journey')}<br><em>${t('empieza aquí.','starts here.')}</em></h2>
          <p class="large-copy">${t('La historia tiene un origen real: San José de Chiquitos, en el corazón de la Chiquitania.','The story has a real home: San José de Chiquitos, in the heart of the Chiquitania.')}</p>
          <p>${t('Mira el Cerro Turubó: una cumbre que sobresale del bosque. A pocos kilómetros, el Valle de la Luna dibuja otro paisaje de rocas y vegetación. Sus nombres despiertan la imaginación; sus formas plantean preguntas.','Look at Cerro Turubó: a summit rising above the forest. A few kilometres away, Valle de la Luna offers a different landscape of rock and vegetation. Their names stir the imagination; their shapes raise questions.')}</p>
          <p>${t('Elegimos 25 ventanas de terreno alrededor del Valle y las medimos a la misma escala que dos destinos planetarios. El Cerro conserva su lugar propio: da identidad al relato y se estudia por separado.','We chose 25 terrain windows around the valley and measured them at the same scale as two planetary destinations. The hill keeps its own role: it gives the story its identity and is studied separately.')}</p>
          <a class="underlined-link" href="#/about">${t('Conocer el relato y el proyecto','Meet the story and the project')} ${arrow}</a>
        </div>
        ${renderOriginGallery(lang, photo)}
      </div>
      <div class="places-row reveal">
        <div class="place-index"><span>02 ${t('LUGARES DISTINTOS','DISTINCT PLACES')}</span><p>${t('Una misma región.<br>Dos papeles en el viaje.','One region.<br>Two roles in the journey.')}</p></div>
        <article class="place-text">
          <h3>Valle de la Luna</h3>
          <p>${t('El de San José de Chiquitos. Aquí fijamos 25 ventanas de 4 × 4 km para buscar parecidos topográficos.','The one in San José de Chiquitos. Here we fixed 25 tiles of 4 × 4 km to search for topographic similarities.')}</p>
          <a href="#/compare/earth" class="underlined-link">${t('Qué encontramos en Bolivia','What we found in Bolivia')} ${arrow}</a>
        </article>
        <article class="place-text">
          <h3>Cerro Turubó</h3>
          <p>${t('Da identidad a la aventura. Lo medimos como un caso aparte: no participa en la clasificación del Valle de la Luna.','It gives the adventure its identity. We measured it as a separate example, outside the Valle de la Luna ranking.')}</p>
        </article>
      </div>
    </section>

    <section class="question-section section-pad" aria-labelledby="question-title"><span class="eyebrow">${t('EL RETO DE NASA SPACE APPS','THE NASA SPACE APPS CHALLENGE')}</span><h2 id="question-title" class="reveal">${t('Explorar otros mundos<br>empieza por entender','Exploring other worlds<br>starts with understanding')}<br><em>${t('el nuestro.','our own.')}</em></h2><p>${t('Buscamos candidatos terrestres para practicar cómo leer el terreno y planificar recorridos. Un parecido abre una pregunta. Las mediciones la ponen a prueba.','We look for Earth candidates to practise reading terrain and planning routes. A resemblance opens a question. Measurements put it to the test.')}</p><div class="method-strip reveal"><span><b>25</b>${t('zonas terrestres','Earth tiles')}</span><span><b>4 × 4 <small>km</small></b>${t('por recorte','per tile')}</span><span><b>40 <small>m</small></b>${t('malla compartida','shared grid')}</span></div></section>

    <div class="orbital-journey" id="worlds">
      ${worldChapter('moon',lang,data)}
      ${worldChapter('mars',lang,data)}
    </div>

    <section class="evidence-section section-pad" id="evidence" data-chapter="evidence" aria-labelledby="evidence-title"><div class="section-heading"><span class="chapter-number">04 / ${t('LA EVIDENCIA','THE EVIDENCE')}</span><span>NASADEM · LRO/LOLA · CTX</span></div><div class="evidence-intro reveal"><h2 id="evidence-title">${t('El parecido se ve.','See the resemblance.')}<br><em>${t('La diferencia se mide.','Measure the difference.')}</em></h2><p>${t('No hay un «porcentaje de parecido» mágico. Puedes abrir los mismos mapas, ver sus unidades y seguir cada resultado hasta su fuente.','There is no magic “similarity percentage”. Open the same maps, check their units, and trace every result back to its source.')}</p></div>
      <div class="evidence-grid">${evidenceTile('moon',lang,data)}${evidenceTile('mars',lang,data)}</div>
      <details class="science-detail"><summary>${t('Cómo medimos y qué no podemos concluir','How we measured it, and what we cannot conclude')} <span aria-hidden="true">+</span></summary><div><p>${t('Usamos datos de elevación: NASADEM en Bolivia, LRO/LOLA Site06 para Nobile Rim 1 y un DEM CTX de Jezero. Ventanas de 4 × 4 km, malla de 40 m y al menos 95 % de cobertura válida. Comparamos pendiente mediana, pendiente P90 y relieve P95−P5. El orden es un cálculo reproducible de distancia estandarizada, no un juicio de IA.','We use elevation data: NASADEM in Bolivia, LRO/LOLA Site06 for Nobile Rim 1, and a CTX DEM of Jezero. Tiles are 4 × 4 km on a 40 m grid, with at least 95% valid coverage. We compare median slope, P90 slope and P95−P5 relief. Ranking uses a reproducible standardized distance, not an AI judgment.')}</p><p>${t('Muchos valores lunares se interpolaron entre observaciones. Una cuadrícula llena no significa medición directa en cada punto. Tampoco medimos radiación, gravedad, atmósfera, recursos, biodiversidad o accesibilidad: no certificamos aterrizajes, hábitats ni recorridos seguros.','Many lunar values were interpolated between observations. A full grid does not mean every point was measured directly. We did not measure radiation, gravity, atmosphere, resources, biodiversity or accessibility: we do not certify landing sites, habitats or safe routes.')}</p><a href="https://github.com/federicorv25/turubo/tree/main/science/pipeline">${t('Abrir el método reproducible y las fuentes','Open the reproducible workflow and sources')} ${arrow}</a></div></details></section>

    <section class="adventure-section" id="adventure" data-chapter="adventure" aria-labelledby="adventure-title"><div class="adventure-image"><img src="${media('legend-1920.webp')}" srcset="${media('legend-640.webp')} 640w, ${media('legend-1280.webp')} 1280w, ${media('legend-1920.webp')} 1920w" sizes="100vw" width="1920" height="1080" loading="lazy" alt="${t('Ilustración fantástica con IA: un viajero solitario ante una montaña y dos mundos en el cielo.','AI fantasy illustration: a solitary traveller before a mountain and two worlds in the sky.')}"></div><div class="adventure-shade" aria-hidden="true"></div><div class="adventure-content section-pad reveal"><span class="chapter-number">05 / ${t('LA AVENTURA','THE ADVENTURE')}</span><h2 id="adventure-title">${t('Un viajero.','One traveller.')}<br><em>${t('Tres desafíos.','Three challenges.')}</em></h2><p>${t('Ahora te toca dar el primer paso. Camina con Turubó, sigue la luz y elige cómo enfrentar a la serpiente, las sombras y Uaituparr. Puedes salir a descubrir los mapas y volver al mismo lugar.','Now it is your turn to take the first step. Walk with Turubó, follow the light, and choose how to face the serpent, the shadows and Uaituparr. You can explore the maps and return to the same place.')}</p><a href="#/play" class="button primary">${started ? t('Continuar la aventura','Continue the adventure') : t('Entrar en la historia','Enter the story')} ${arrow}</a><small>${t('WASD / flechas / tacto · ES / EN · Ficción inspirada en un relato chiquitano','WASD / arrows / touch · ES / EN · Fiction inspired by a Chiquitano story')}</small></div><span class="generated-label">${t('Ilustración fantástica generada con IA','Fantasy illustration generated with AI')} · Kie.ai</span></section>

    <section class="closing-section section-pad" data-chapter="closing"><span class="eyebrow">${t('DE LA CHIQUITANIA AL CIELO','FROM THE CHIQUITANIA TO THE SKY')}</span><h2>${t('La curiosidad<br>no tiene','Curiosity<br>has no')} <em>${t('fronteras.','borders.')}</em></h2><div class="closing-bottom reveal"><p>${t('Un proyecto de seis personas de Santa Cruz de la Sierra. Cultura local, datos abiertos y el deseo de aprender explorando.','A project by six people from Santa Cruz de la Sierra. Local culture, open data, and the desire to learn through exploration.')}</p><a class="circle-link" href="#/about" aria-label="${t('Conocer el equipo, las fuentes y el proyecto','Meet the team and explore the project’s sources')}">${arrow}</a></div></section>
  </div>`
}

function worldChapter(world: 'moon'|'mars', lang: Lang, data?: Analysis) {
  const t=(es:string,en:string)=>tr(lang,es,en)
  const lunar=world==='moon'
  return `<section class="world-chapter" id="world-${world}" data-orbit="${world}" data-chapter="${world}" aria-labelledby="${world}-title"><div class="planet-stage" aria-hidden="true"><img src="${media(`${world}-globe.webp`)}" alt="" width="800" height="800" loading="lazy" decoding="async"></div><div class="world-copy reveal"><span class="chapter-number">${lunar?'02':'03'} / ${lunar?t('LA LUNA','THE MOON'):t('MARTE','MARS')}</span><h2 id="${world}-title">${lunar?t('Donde las sombras<br>dibujan el','Where shadows<br>shape the'):t('Un nuevo mundo.<br>Una antigua','A new world.<br>An ancient')}<br><em>${lunar?t('camino.','path.'):t('pregunta.','question.')}</em></h2><p class="world-place">${lunar?'NOBILE RIM 1 · '+t('POLO SUR LUNAR','LUNAR SOUTH POLE'):'JEZERO · '+t('CRÁTER MARCIANO','MARTIAN CRATER')}</p><p>${lunar?t('Nobile Rim 1 es una referencia de relieve cerca del polo sur lunar. No es una ubicación aprobada para una base. ¿Se parece a alguna de nuestras zonas bolivianas?','Nobile Rim 1 is a terrain reference near the lunar south pole. It is not an approved base location. Does it resemble any of our Bolivian tiles?'):t('Jezero es el cráter que explora Perseverance. Comparamos un recorte de su relieve con nuestras zonas terrestres: pendientes suaves pueden esconder diferencias.','Jezero is the crater explored by Perseverance. We compare a tile of its terrain with our Earth sample: gentle slopes can hide differences.')}</p><div class="world-finding">${finding(world,lang,data)}</div><a class="underlined-link" href="#/compare/${world}">${t('Descubrir el parecido','Discover the resemblance')} ${arrow}</a><span class="globe-caption">${t('Vista global ilustrativa · textura NASA · sin escala de análisis','Illustrative globe · NASA texture · not an analysis scale')}</span></div><div class="world-toolbar"><span class="orbit-status"><span class="scroll-instruction">${t('EXPLORA CON EL SCROLL','EXPLORE BY SCROLLING')}</span><span class="drag-instruction">${t('ARRASTRA O USA LAS FLECHAS','DRAG OR USE THE ARROWS')}</span></span><div class="orbit-buttons" role="group" aria-label="${t('Rotar el globo','Rotate the globe')}"><button type="button" data-rotate="-1" data-planet="${world}" aria-label="${t('Rotar a la izquierda','Rotate left')}">←</button><button type="button" data-rotate="1" data-planet="${world}" aria-label="${t('Rotar a la derecha','Rotate right')}">→</button></div></div></section>`
}

function finding(world:'moon'|'mars',lang:Lang,data?:Analysis) {
  const t=(es:string,en:string)=>tr(lang,es,en)
  if(!data)return `<span>${t('Cargando las mediciones…','Loading measurements…')}</span>`
  const pair=data.comparisons[world]
  const ref=data.terrains.find(t=>t.id===pair.referenceId)
  const earth=data.terrains.find(t=>t.id===pair.ranked[0]?.id)
  if(pair.status!=='reviewed'||!ref||!earth)return `<span>${t('Este destino aún no fue evaluado.','This destination has not been assessed.')}</span>`
  const number=(n:number,d=2)=>new Intl.NumberFormat(lang,{maximumFractionDigits:d}).format(n)
  return world==='moon'?`<strong>${number(ref.metrics.reliefM/earth.metrics.reliefM,1)}×</strong><span>${t('el desnivel de R03 C01, el candidato boliviano más cercano a Nobile.','the relief of R03 C01, the closest Bolivian candidate to Nobile.')}</span>`:`<strong>${number(earth.metrics.slopeMedianDeg)}° <i>/</i> ${number(ref.metrics.slopeMedianDeg)}°</strong><span>${t('pendiente mediana: R02 C02 en Bolivia / Jezero en Marte. Cercanas, pero no iguales.','median slope: R02 C02 in Bolivia / Jezero on Mars. Close, but not identical.')}</span>`
}

function stat(world:'moon'|'mars',lang:Lang,data?:Analysis) {
  const pair=data?.comparisons[world]
  const ref=data?.terrains.find(terrain=>terrain.id===pair?.referenceId)
  const candidate=data?.terrains.find(terrain=>terrain.id===pair?.ranked[0]?.id)
  const numeric=(n:number|undefined)=>n===undefined?'—':new Intl.NumberFormat(lang,{maximumFractionDigits:2}).format(n)
  return `<span>${tr(lang,'Desnivel (P95−P5)','Relief (P95−P5)')}</span><strong>${numeric(candidate?.metrics.reliefM)} <small>m</small> <i>/</i> ${numeric(ref?.metrics.reliefM)} <small>m</small></strong>`
}

function evidenceTile(world:'moon'|'mars',lang:Lang,data?:Analysis) {
  const t=(es:string,en:string)=>tr(lang,es,en)
  const lunar=world==='moon'
  const ids=lunar?['bo-r03-c01','moon-nobile-rim-1']:['bo-r02-c02','mars-jezero']
  return `<article class="evidence-pair reveal" data-world="${world}"><div class="pair-heading"><span>${lunar?'BOLIVIA ↔ '+t('LUNA','MOON'):'BOLIVIA ↔ '+t('MARTE','MARS')}</span><span>4 × 4 KM</span></div><div class="paired-maps">${ids.map((id,i)=>`<figure><img src="${import.meta.env.BASE_URL}maps/${id}.png" width="320" height="384" loading="lazy" decoding="async" alt="${t('Mapa medido de relieve relativo de','Measured relative-relief map of')} ${lunar?(i===0?'R03 C01':'Nobile Rim 1'):(i===0?'R02 C02':'Jezero')}"><figcaption>${i===0?(lunar?'R03 C01':'R02 C02'):(lunar?'Nobile Rim 1':'Jezero')}</figcaption></figure>`).join('')}</div><p class="map-key">${t('Relieve relativo a la mediana · misma escala −100 a +100 m','Relief relative to median · same scale −100 to +100 m')}</p><div class="pair-stat">${stat(world,lang,data)}</div><a class="underlined-link" href="#/compare/${world}">${t('Comparar los dos paisajes','Compare the two landscapes')} ${arrow}</a><details class="context-detail"><summary>${t('Ver el contexto real de','See the real context of')} ${lunar?'Nobile':'Jezero'}</summary><figure>${lunar?`<img src="${media('nobile-320.webp')}" width="320" height="278" loading="lazy" alt="${t('Reconstrucción regional de una meseta sobre Nobile a partir de imágenes LRO.','Regional reconstruction of a plateau above Nobile from LRO images.')}">`:picture('jezero',t('Panorama de Jezero por Perseverance en color realzado.','Enhanced-color Perseverance panorama of Jezero.'))}<figcaption>${lunar?t('NASA/LRO · reconstrucción de 147 imágenes; contexto regional, no el recorte Site06.','NASA/LRO · reconstruction from 147 images; regional context, not the Site06 tile.'):t('NASA/JPL-Caltech/ASU/MSSS · PIA24921 · color realzado. Contexto, no el recorte del DEM.','NASA/JPL-Caltech/ASU/MSSS · PIA24921 · enhanced color. Context, not the DEM tile.')}</figcaption></figure></details></article>`
}
