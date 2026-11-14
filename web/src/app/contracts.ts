export type Lang = 'en' | 'es'
export type LocalText = Record<Lang, string>
export type World = 'earth' | 'moon' | 'mars'
export type Destination = Exclude<World, 'earth'>

export interface Choice {
  label: LocalText
  next: string
  feedback?: LocalText
}

export interface Scene {
  title: LocalText
  text: LocalText
  world: World
  poison?: LocalText
  choices: Choice[]
}

export interface Story {
  version: number
  title: LocalText
  disclosure: LocalText
  order: string[]
  scenes: Record<string, Scene>
}

export interface Terrain {
  id: string
  name: string
  body: World
  source: string
  resolutionM: number
  coverage: number
  metrics: { slopeMedianDeg: number; slopeP90Deg: number; reliefM: number }
  image?: string
}

export interface Comparison {
  status: 'not_assessed' | 'reviewed'
  referenceId?: string
  ranked: { id: string; distance: number }[]
  guidedId?: string
}

export interface Analysis {
  version: 1
  simulated: boolean
  terrains: Terrain[]
  comparisons: Record<Destination, Comparison>
}
