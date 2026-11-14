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
      'Slope and relief come from published elevation models; resolution and coverage apply to each tile. This does not rate landing safety, climate or resources.',
    distance: 'Terrain distance (dataset)',
    sameScale: 'Hillshade tiles shown at matching display size when both maps are available.',
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
      'Pendiente y desnivel provienen de modelos de elevación publicados; resolución y cobertura aplican a cada mosaico. No evalúa seguridad de aterrizaje, clima ni recursos.',
    distance: 'Distancia de terreno (datos)',
    sameScale: 'Mosaicos en escala de visualización coincidente cuando ambos mapas están disponibles.',
    noImage: 'Sin mosaico en el conjunto de datos; se conservan medidas y fuente.',
    earthSites: 'Sitios bolivianos medidos'
  }
}