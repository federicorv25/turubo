import type { Lang } from '../app/contracts'

export const panelCopy: Record<
  Lang,
  {
    compareHeading: string
    planetaryReference: string
    closestCandidate: string
    pickCandidate: string
    guidedApart: string
    guidedNote: string
    rankingNote: string
    limitations: string
    distance: string
    sameScale: string
    analysisResolution: string
    noImage: string
    earthSites: string
  }
> = {
  en: {
    compareHeading: 'Side-by-side comparison',
    planetaryReference: 'Planetary reference',
    closestCandidate: 'Closest ranked candidate',
    pickCandidate: 'Other ranked candidates',
    guidedApart: 'Guided case (outside the ranking)',
    guidedNote: 'Cerro Turubó is shown for context only and is not part of the relief-distance ranking.',
    rankingNote:
      'The ranking orders Bolivian windows by terrain distance in the dataset and measures relief shape only.',
    limitations:
      'Slope and relief come from published elevation models; resolution and coverage apply to each tile.',
    distance: 'Terrain distance (dataset)',
    sameScale: 'Relative elevation maps on a common 4 × 4 km, 40 m analysis grid, with the same grayscale range (−100 to +100 m around each tile median). These are not hillshades; colors may saturate.',
    analysisResolution: 'Analysis grid spacing',
    noImage: 'No map tile in the dataset; metrics and source remain listed.',
    earthSites: 'Measured Bolivian sites'
  },
  es: {
    compareHeading: 'Comparación en paralelo',
    planetaryReference: 'Referencia planetaria',
    closestCandidate: 'Candidato terrestre más cercano en el ranking',
    pickCandidate: 'Otros candidatos del ranking',
    guidedApart: 'Caso guiado (fuera del ranking)',
    guidedNote: 'El Cerro Turubó se muestra solo como contexto y no entra en el ranking por distancia de relieve.',
    rankingNote:
      'El ranking ordena las ventanas bolivianas por distancia de terreno en el conjunto de datos y mide solo la forma del relieve.',
    limitations:
      'Pendiente y desnivel provienen de modelos de elevación publicados; resolución y cobertura aplican a cada mosaico.',
    distance: 'Distancia de terreno (datos)',
    sameScale: 'Mapas de elevación relativa sobre una cuadrícula común de 4 × 4 km y paso de análisis de 40 m, con el mismo rango de grises (−100 a +100 m respecto a la mediana de cada recorte). No son mapas de sombreado; puede haber saturación.',
    analysisResolution: 'Paso de la cuadrícula de análisis',
    noImage: 'Sin mosaico en el conjunto de datos; se conservan medidas y fuente.',
    earthSites: 'Sitios bolivianos medidos'
  }
}