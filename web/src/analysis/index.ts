import type {Analysis,Destination,Lang,Terrain,World} from '../app/contracts'
import {messages} from '../app/i18n'
import './analysis.css'

type Extras={method?:()=>HTMLElement;backLabel?:string}
type Metric=keyof Terrain['metrics']
const selectedRank:Partial<Record<Destination,string>>={}
const selectedMetric:Record<Destination,Metric>={moon:'reliefM',mars:'slopeMedianDeg'}
const el=<K extends keyof HTMLElementTagNameMap>(tag:K,text='',cls='')=>{
 const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n
}
const number=(value:number,lang:Lang)=>new Intl.NumberFormat(lang,{maximumFractionDigits:2}).format(value)
const url=(path:string)=>`${import.meta.env.BASE_URL}${path}`
function mapPath(image?:string){return image&&/^maps\/[\w-]+\.(png|webp)$/.test(image)?url(image):undefined}
function button(text:string,action:()=>void,cls=''){const b=el('button',text,cls);b.type='button';b.onclick=action;return b}
function link(text:string,href:string){const a=el('a',text);a.href=href;return a}

export function renderAnalysis(container:HTMLElement,data:Analysis,world:World,lang:Lang,onSelect:(w:World)=>void,onBack:()=>void,extras:Extras={}){
 const t=(es:string,en:string)=>lang==='es'?es:en
 const root=el('section','','discovery')
 root.dataset.world=world
 const header=el('div','','discovery-intro')
 const heading=el('div','','discovery-heading')
 heading.append(el('p',t('DE LA HISTORIA A LA EVIDENCIA','FROM STORY TO EVIDENCE'),'eyebrow'))
 const h1=el('h1',world==='earth'?t('Aquí empieza la búsqueda.','The search begins here.'):world==='moon'?t('Bolivia y\nla Luna.','Bolivia and\nthe Moon.'):t('Bolivia y\nMarte.','Bolivia and\nMars.'))
 h1.id='analysis-title';h1.tabIndex=-1
 heading.append(h1)
 const intro=el('div','','discovery-lead')
 intro.append(el('p',world==='earth'
  ?t('La Chiquitania nos da dos lugares distintos. Uno inspira la historia; el otro nos permite buscar parecidos con otros mundos.','The Chiquitania gives us two distinct places. One inspires the story; the other lets us search for resemblances to other worlds.')
  :t('¿Se parece un rincón de Bolivia a la '+(world==='moon'?'Luna':'superficie de Marte')+'? Mira las mismas medidas y descubre dónde la comparación funciona y dónde se queda corta.','Can a corner of Bolivia resemble '+(world==='moon'?'the Moon':'Mars')+'? Explore the same measurements and see where the comparison works and where it falls short.')))
 intro.append(el('span',t('25 zonas estudiadas · 4 × 4 km por recorte · malla de 40 m','25 areas studied · 4 × 4 km per tile · 40 m grid'),'analysis-facts'))
 header.append(heading,intro)
 const navigation=el('div','','discovery-worlds');navigation.setAttribute('role','group');navigation.setAttribute('aria-label',t('Elige qué descubrir','Choose a discovery'))
 for(const w of ['earth','moon','mars'] as const){
  const b=button(w==='earth'?t('Los lugares de Bolivia','The Bolivian sites'):w==='moon'?t('Bolivia y la Luna','Bolivia and the Moon'):t('Bolivia y Marte','Bolivia and Mars'),()=>onSelect(w))
  b.setAttribute('aria-pressed',String(world===w));navigation.append(b)
 }
 root.append(header,navigation)
 if(data.simulated)root.append(el('p',messages[lang].pendingDetail,'data-status'))
 else if(world==='earth')renderEarth(root,data,lang)
 else{
  const comparison=data.comparisons[world]
  const reference=data.terrains.find(item=>item.id===comparison.referenceId)
  const ranked=comparison.ranked.map(entry=>({entry,terrain:data.terrains.find(x=>x.id===entry.id)})).filter(x=>!!x.terrain)
  const candidate=ranked.find(x=>x.entry.id===selectedRank[world])??ranked[0]
  if(comparison.status!=='reviewed'||!reference||!candidate?.terrain)root.append(el('p',messages[lang].pendingDetail,'data-status'))
  else{
   const earth=candidate.terrain
   const result=el('section','','discovery-result')
   result.setAttribute('aria-labelledby','finding-title')
   const title=el('h2',world==='moon'?t('El parecido tiene un límite.','Resemblance has its limits.'):t('Pendientes cercanas. Alturas distintas.','Similar slopes. Different heights.'))
   title.id='finding-title'
   result.append(el('span',t('LO QUE ENCONTRAMOS','WHAT WE FOUND'),'chapter-number'),title)
   result.append(el('p',world==='moon'
    ?t(`Nobile Rim 1 tiene ${number(reference.metrics.reliefM/earth.metrics.reliefM,lang)} veces el desnivel de ${earth.name}. Incluso el candidato más cercano de nuestra muestra es mucho más suave.`,`Nobile Rim 1 has ${number(reference.metrics.reliefM/earth.metrics.reliefM,lang)} times the relief of ${earth.name}. Even the closest candidate in our sample is much gentler.`)
    :t(`${earth.name} y Jezero tienen una inclinación típica cercana. Pero Jezero tiene ${number(reference.metrics.reliefM-earth.metrics.reliefM,lang)} m más de desnivel entre sus partes bajas y altas.`,`${earth.name} and Jezero have similar typical slopes. But Jezero has ${number(reference.metrics.reliefM-earth.metrics.reliefM,lang)} m more relief between its lower and higher elevations.`)))
   root.append(result)
   const columns=el('div','','discovery-maps')
   columns.append(mapCard(earth,lang,t('BOLIVIA · CANDIDATO DE LA MUESTRA','BOLIVIA · CANDIDATE IN OUR SAMPLE')),mapCard(reference,lang,world==='moon'?t('LUNA · NOBILE RIM 1','MOON · NOBILE RIM 1'):t('MARTE · JEZERO','MARS · JEZERO')))
   root.append(columns)
   const key=el('div','','map-legend')
   key.append(el('span',t('Más bajo','Lower')),el('i'),el('span',t('Más alto','Higher')),el('p',t('Grises: de −100 a +100 m respecto a la altura mediana de cada zona. El blanco y el negro pueden saturarse.','Grayscale: −100 to +100 m relative to each area’s median elevation. White and black may saturate.')))
   root.append(key,metricExplorer(earth,reference,world,lang))
   const notes=el('div','','discovery-notes')
   notes.append(el('p',t('Comparamos la forma del terreno. No comprobamos condiciones para aterrizar, construir una base o caminar con seguridad.','We compare terrain shape. We do not establish conditions for landing, building a base or walking safely.')))
   if(world==='moon')notes.append(el('p',t('En el mapa lunar, muchas alturas se estiman entre observaciones. Cobertura completa no significa una medición directa en cada punto.','Many heights in the lunar map are estimated between observations. Full coverage does not mean every point was directly measured.')))
   root.append(notes)
   if(ranked.length>1){
    const picker=el('div','','candidate-picker')
    ranked.forEach(({terrain,entry},index)=>{if(!terrain)return;const b=button(`#${index+1} · ${terrain.name}`,()=>{selectedRank[world]=entry.id;renderAnalysis(container,data,world,lang,onSelect,onBack,extras);container.querySelectorAll<HTMLButtonElement>('.candidate-picker button')[index]?.focus()});b.setAttribute('aria-pressed',String(terrain.id===earth.id));picker.append(b)})
    root.append(picker)
   }
   const transparency=el('details','','discovery-details')
   transparency.append(el('summary',t('Abrir las cifras completas y sus fuentes','Open all measurements and their sources')))
   const grid=el('div','','metadata-grid')
   grid.append(metadata(earth,lang),metadata(reference,lang))
   transparency.append(grid,el('p',t(`Distancia estandarizada del candidato: ${number(candidate.entry.distance,lang)}. Se calcula con tres medidas del relieve; es una distancia, no una probabilidad ni un porcentaje de semejanza.`,`Candidate standardized distance: ${number(candidate.entry.distance,lang)}. Computed from three terrain measures; a distance, not a probability or a similarity percentage.`)))
   root.append(transparency)
   const guided=data.terrains.find(x=>x.id===comparison.guidedId)
   if(guided){
    const extra=el('details','','discovery-details')
    extra.append(el('summary',t('¿Y el Cerro Turubó? Un caso aparte.','And Cerro Turubó? A separate case.')))
    const content=el('div','','guided-site')
    content.append(mapCard(guided,lang,t('FUERA DE LA CLASIFICACIÓN','OUTSIDE THE RANKING')),metadata(guided,lang))
    extra.append(el('p',t('La montaña que inspira la aventura se mide por separado. No es una de las 25 ventanas de búsqueda del Valle.','The mountain that inspires the adventure is measured separately. It is not one of the 25 search tiles in the valley.')),content)
    root.append(extra)
   }
  }
 }
 const method=extras.method?.();if(method)root.append(method)
 const finish=el('div','','discovery-back')
 finish.append(button('← '+(extras.backLabel??messages[lang].story),onBack))
 root.append(finish)
 container.replaceChildren(root)
}
function mapCard(terrain:Terrain,lang:Lang,role:string){
 const article=el('article','','discovery-map')
 const heading=el('div','','map-heading')
 heading.append(el('span',role,'map-role'),el('h3',terrain.name))
 const frame=el('figure')
 const src=mapPath(terrain.image)
 if(src){
  const img=el('img');img.src=src;img.alt=(lang==='es'?'Mapa medido de relieve relativo: ':'Measured relative-elevation map: ')+terrain.name;img.width=320;img.height=384;img.decoding='async';img.loading='lazy'
  img.onerror=()=>frame.replaceChildren(el('p',lang==='es'?'El mapa no cargó. Las cifras siguen disponibles.':'The map did not load. Measurements remain available.'))
  frame.append(img)
 }else frame.append(el('p',lang==='es'?'Sin mapa disponible':'Map unavailable'))
 const caption=el('figcaption','4 × 4 km · '+(terrain.body==='earth'?'NASADEM':terrain.body==='moon'?'LRO / LOLA':'MRO / CTX'))
 frame.append(caption)
 article.append(heading,frame)
 return article
}
function metricExplorer(earth:Terrain,reference:Terrain,world:Destination,lang:Lang){
 const t=(es:string,en:string)=>lang==='es'?es:en
 const labels:Record<Metric,string>={slopeMedianDeg:t('Inclinación típica','Typical slope'),slopeP90Deg:t('Pendientes más fuertes','Steeper slopes'),reliefM:t('Desnivel','Relief')}
 const description:Record<Metric,string>={
  slopeMedianDeg:t('La mitad de las pendientes queda por debajo de este valor. Una cifra mayor indica una superficie más inclinada.','Half the slopes fall below this value. A higher number indicates a steeper surface.'),
  slopeP90Deg:t('El 90 % de las pendientes queda por debajo de este valor. Ayuda a observar las zonas más inclinadas.','90% of slopes fall below this value. It helps describe the steeper parts of the area.'),
  reliefM:t('Diferencia entre las alturas P95 y P5. Describe cuánto cambia la elevación sin depender de los extremos aislados.','Difference between the P95 and P5 elevations. It describes the height range without depending on isolated extremes.'),
 }
 const section=el('section','','metric-explorer')
 const top=el('div','','metric-explorer-top');top.append(el('h2',t('Elige qué observar.','Choose what to observe.')))
 const tabs=el('div','','metric-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label',t('Medida del terreno','Terrain measurement'))
 const chart=el('div','','metric-chart');chart.setAttribute('aria-live','polite')
 const desc=el('p','','metric-description')
 function draw(){
  const metric=selectedMetric[world],unit=metric==='reliefM'?'m':'°'
  desc.textContent=description[metric]
  const max=Math.max(earth.metrics[metric],reference.metrics[metric],.001)
  chart.replaceChildren()
  for(const [index,terrain] of [earth,reference].entries()){
   const row=el('div','','metric-row')
   const info=el('div','','metric-row-label')
   info.append(el('span',terrain.name),el('strong',number(terrain.metrics[metric],lang)+' '+unit))
   const track=el('div','','metric-track'),fill=el('i')
   fill.style.setProperty('--amount',String(terrain.metrics[metric]/max));fill.dataset.planet=String(index===1);track.setAttribute('aria-hidden','true');track.append(fill)
   row.append(info,track);chart.append(row)
  }
  tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.metric===metric)))
 }
 for(const metric of ['slopeMedianDeg','slopeP90Deg','reliefM'] as const){
  const b=button(labels[metric],()=>{selectedMetric[world]=metric;draw()});b.dataset.metric=metric;tabs.append(b)
 }
 top.append(tabs);section.append(top,chart,desc);draw();return section
}
function metadata(terrain:Terrain,lang:Lang){
 const m=messages[lang],section=el('div','','terrain-metadata');section.append(el('h3',terrain.name))
 const dl=el('dl')
 for(const [label,value] of [[m.slope,number(terrain.metrics.slopeMedianDeg,lang)+'°'],[m.p90,number(terrain.metrics.slopeP90Deg,lang)+'°'],[m.relief,number(terrain.metrics.reliefM,lang)+' m'],[m.resolution,terrain.resolutionM+' m'],[m.coverage,number(terrain.coverage*100,lang)+' %']]){
  dl.append(el('dt',label),el('dd',value))
 }
 section.append(dl)
 if(terrain.source.startsWith('https://'))section.append(link(lang==='es'?'Abrir el producto original ↗':'Open the original product ↗',terrain.source))
 return section
}
function renderEarth(root:HTMLElement,data:Analysis,lang:Lang){
 const t=(es:string,en:string)=>lang==='es'?es:en
 const places=el('div','','earth-places')
 for(const [id,name,description] of [
  ['valle-lookout','Valle de la Luna',t('Aquí se fijó una cuadrícula de 25 ventanas. R03 C01 y R02 C02 son las más cercanas a nuestros destinos lunar y marciano, según tres medidas de elevación.','A fixed grid of 25 tiles starts here. R03 C01 and R02 C02 are closest to our lunar and Martian references across three elevation measures.')],
  ['cerro-detail','Cerro Turubó',t('La montaña da nombre a la aventura. Su relieve se muestra como un ejemplo independiente, fuera de la clasificación del Valle.','The mountain gives the adventure its name. Its terrain is shown as an independent example, outside the valley ranking.')],
 ]){
  const card=el('article'),image=el('img')
  image.src=url('media/'+id+'-1280.webp');image.alt=name;image.width=1280;image.height=id==='cerro-detail'?896:1174;image.loading='lazy'
  card.append(image,el('h2',name),el('p',description),link(t('Fotografía: ','Photo: ')+(id==='cerro-detail'?'Ruditaly':'Aldrihe')+' · CC BY-SA 4.0',id==='cerro-detail'?'https://commons.wikimedia.org/wiki/File:Cerro_Turub%C3%B3_y_San_Jos%C3%A9_de_Chiquitos_-_Chiquitos,_Bolivia.jpg':'https://commons.wikimedia.org/wiki/File:Valle_de_la_Luna_de_San_Jos%C3%A9_de_Chiquitos.jpg'))
  places.append(card)
 }
 root.append(places)
 const maps=el('details','','discovery-details')
 maps.append(el('summary',t('Explorar los tres recortes publicados de Bolivia','Explore the three published Bolivian tiles')))
 const grid=el('div','','earth-map-grid')
 for(const terrain of data.terrains.filter(x=>x.body==='earth')){const card=el('div');card.append(mapCard(terrain,lang,'BOLIVIA'),metadata(terrain,lang));grid.append(card)}
 maps.append(grid);root.append(maps)
}
