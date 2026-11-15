/**
 * Earth scene layout, trimmed from the TURUBO prototype (turubo-atlas/src/experience/world/terrainMath.ts).
 * The same height function shapes the rendered terrain and places every prop, so feet and ground agree.
 */
export const SERPENT_POSITION = { x: 0, z: -10.5 }
export const CERRO_CENTER = { x: 0, z: -33 }
const TERRACE = { x: 0, z: 9.5 }

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Terrace, trail, flat sanctuary clearing, Cerro Turubó massif and the surrounding ridge ring. */
export function groundHeightAt(x: number, z: number) {
  let h = Math.sin(x * 0.085) * Math.cos(z * 0.075) * 0.5 + Math.sin((x + z) * 0.04) * 0.35

  const terraceBlend = 1 - smoothstep(5.0, 10.5, Math.hypot(x - TERRACE.x, z - TERRACE.z))
  h = h * (1 - terraceBlend) + 1.55 * terraceBlend

  const trailX = Math.sin((z + 10) * 0.14) * 1.6
  if (z <= 12.5 && z >= -13.5) {
    const trailMask = (1 - smoothstep(2.4, 6.2, Math.abs(x - trailX))) * smoothstep(-14, -9, z) * (1 - smoothstep(8, 13.5, z))
    const tNorm = Math.max(0, Math.min(1, (z + 10.5) / 22))
    const trailTargetH = 0.45 + smoothstep(0.15, 0.85, tNorm) * 1.1
    h = h * (1 - trailMask * 0.85) + trailTargetH * (trailMask * 0.85)
  }

  const sanctuaryBlend = 1 - smoothstep(5.0, 9.5, Math.hypot(x - SERPENT_POSITION.x, z - SERPENT_POSITION.z))
  h = h * (1 - sanctuaryBlend) + 0.45 * sanctuaryBlend

  const dxCerro = x - CERRO_CENTER.x
  const dzCerro = z - CERRO_CENTER.z
  const distCerro = Math.hypot(dxCerro * 0.82, dzCerro * 1.05)
  if (distCerro < 22) {
    const step1 = (1 - smoothstep(9.5, 21.5, distCerro)) * 6.2
    const step2 = (1 - smoothstep(5.0, 13.5, distCerro)) * 6.8
    const crest = (1 - smoothstep(1.8, 7.2, distCerro)) * 3.4
    const ridgeNoise = Math.sin(Math.atan2(dzCerro, dxCerro) * 5) * 0.55 * (1 - smoothstep(4, 18, distCerro))
    h += step1 + step2 + crest + ridgeNoise
  }

  const distOrigin = Math.hypot(x, z)
  if (distOrigin > 36) {
    const rim = smoothstep(36, 68, distOrigin)
    const angle = Math.atan2(z, x)
    h += rim * 12.5 * (0.78 + 0.22 * Math.sin(angle * 6 + 0.6) + 0.15 * Math.cos(angle * 3))
  }
  return h
}

const ROCK_OUTCROPS = [
  { x: -6.5, z: 7.5, radius: 1.7, height: 2.6 },
  { x: 7.8, z: 4.2, radius: 1.9, height: 3.1 },
  { x: -8.8, z: -2.5, radius: 2.2, height: 3.4 },
  { x: 8.6, z: -5.8, radius: 2.0, height: 2.9 },
]

export interface BoulderLayout { x: number; z: number; rx: number; ry: number; rz: number }

/** Outcrop clusters flanking the trail plus the outer boulder ring. */
export const BOULDERS: BoulderLayout[] = (() => {
  const list: BoulderLayout[] = []
  ROCK_OUTCROPS.forEach((c, idx) => {
    list.push({ x: c.x, z: c.z, rx: c.radius * 1.02, ry: c.height * 0.56, rz: c.radius * 0.92 })
    const offAng = idx * 1.9 + 0.6
    list.push({ x: c.x + Math.cos(offAng) * c.radius * 0.88, z: c.z + Math.sin(offAng) * c.radius * 0.88, rx: c.radius * 0.56, ry: c.height * 0.36, rz: c.radius * 0.52 })
  })
  for (let i = 0; i < 30; i++) {
    const ang = (i / 30) * Math.PI * 2 + 0.2
    const rad = 27 + (i % 5) * 4.5
    const rx = Math.cos(ang) * rad
    const rz = Math.sin(ang) * rad
    if (Math.hypot(rx - CERRO_CENTER.x, rz - CERRO_CENTER.z) > 19) {
      const s = 1.2 + (i % 3) * 0.55
      list.push({ x: rx, z: rz, rx: s, ry: s * 0.65, rz: s * 0.92 })
    }
  }
  return list
})()

/** Chiquitano dry-forest trees (trunk base radius = 0.42 * scale). */
export const TREES: { x: number; z: number; scale: number }[] = (() => {
  const grove: [number, number][] = [[-12.8, 1.5], [13.0, -1.8], [-11.0, -14.5], [11.4, -15.2]]
  const list = grove.map(([x, z], i) => ({ x, z, scale: 0.98 + (i % 3) * 0.16 }))
  for (let i = 0; i < 22; i++) {
    const ang = (i / 22) * Math.PI * 2 + 0.35
    const rad = 25 + (i % 4) * 5.2
    const tx = Math.cos(ang) * rad
    const tz = Math.sin(ang) * rad
    if (Math.hypot(tx - CERRO_CENTER.x, tz - CERRO_CENTER.z) > 18.5) list.push({ x: tx, z: tz, scale: 0.84 + (i % 4) * 0.18 })
  }
  return list
})()

/** Stelae crescent around the platform. */
export const STELAE = [-2.25, -1.5, -0.78, 0.78, 1.5, 2.25].map(angle => ({
  x: SERPENT_POSITION.x + Math.sin(angle) * 6.0,
  z: SERPENT_POSITION.z - Math.cos(angle) * 6.0,
}))

/** Two cairns framing the platform entrance. */
export const CAIRNS = [-4.1, 4.1].map(x => ({ x, z: SERPENT_POSITION.z + 4.7 }))

export type CerroMaterialKey = 'darkSlate' | 'sandstone' | 'ochre'

export interface CerroPartLayout {
  shape: 'cylinder' | 'cone'
  radiusTop: number
  radiusBottom: number
  height: number
  radialSegments: number
  heightSegments: number
  /** sculptStrataRockGeometry(ampXZ, ampY, strataSteps, seed) */
  sculpt: [number, number, number, number]
  material: CerroMaterialKey
  x: number
  z: number
  sinkOrLift: number
  ry: number
  rx?: number
  rz?: number
  scale?: [number, number, number]
}

/** 12-part stratified Cerro Turubó massif. */
export const CERRO_PARTS: CerroPartLayout[] = [
  { shape: 'cylinder', radiusTop: 5.6, radiusBottom: 11.4, height: 9.2, radialSegments: 10, heightSegments: 4, sculpt: [0.22, 0.35, 3, 1.1], material: 'darkSlate', x: 0, z: -33.2, sinkOrLift: -2.2, ry: 0.3, scale: [1.22, 1.0, 0.92] },
  { shape: 'cylinder', radiusTop: 3.8, radiusBottom: 7.6, height: 9.8, radialSegments: 9, heightSegments: 4, sculpt: [0.24, 0.38, 3, 2.5], material: 'sandstone', x: -0.6, z: -33.0, sinkOrLift: 2.2, ry: 0.9, scale: [1.14, 1.0, 0.88] },
  { shape: 'cone', radiusTop: 0, radiusBottom: 4.2, height: 7.2, radialSegments: 8, heightSegments: 3, sculpt: [0.25, 0.28, 2, 3.8], material: 'ochre', x: -0.9, z: -33.1, sinkOrLift: 7.4, ry: 0.4, scale: [1.18, 1.08, 0.84] },
  { shape: 'cone', radiusTop: 0, radiusBottom: 3.1, height: 5.4, radialSegments: 7, heightSegments: 3, sculpt: [0.22, 0.24, 2, 4.9], material: 'sandstone', x: 3.4, z: -32.4, sinkOrLift: 5.5, ry: 1.4, rz: -0.14 },
  { shape: 'cylinder', radiusTop: 2.8, radiusBottom: 7.2, height: 9.6, radialSegments: 8, heightSegments: 3, sculpt: [0.22, 0.32, 3, 5.6], material: 'sandstone', x: 0.5, z: -27.4, sinkOrLift: -1.1, ry: 1.2, scale: [1.12, 1, 0.82] },
  { shape: 'cylinder', radiusTop: 2.9, radiusBottom: 8.2, height: 10.8, radialSegments: 8, heightSegments: 3, sculpt: [0.23, 0.34, 3, 6.7], material: 'darkSlate', x: -8.6, z: -28.5, sinkOrLift: -0.9, ry: 0.7, rx: 0.04, rz: 0.09 },
  { shape: 'cylinder', radiusTop: 3.0, radiusBottom: 8.4, height: 11.2, radialSegments: 8, heightSegments: 3, sculpt: [0.22, 0.34, 3, 7.8], material: 'ochre', x: 8.9, z: -29.0, sinkOrLift: -0.8, ry: 1.1, rx: -0.04, rz: -0.08 },
  { shape: 'cylinder', radiusTop: 2.2, radiusBottom: 6.4, height: 7.4, radialSegments: 7, heightSegments: 2, sculpt: [0.22, 0.28, 2, 8.9], material: 'sandstone', x: -14.0, z: -31.2, sinkOrLift: -1.2, ry: 1.8 },
  { shape: 'cylinder', radiusTop: 2.4, radiusBottom: 6.6, height: 7.8, radialSegments: 7, heightSegments: 2, sculpt: [0.22, 0.28, 2, 9.9], material: 'darkSlate', x: 14.2, z: -31.8, sinkOrLift: -1.2, ry: 2.3 },
  { shape: 'cylinder', radiusTop: 3.1, radiusBottom: 7.4, height: 10.6, radialSegments: 7, heightSegments: 3, sculpt: [0.2, 0.3, 2, 11.1], material: 'darkSlate', x: -6.2, z: -39.4, sinkOrLift: -1.0, ry: 0.3 },
  { shape: 'cylinder', radiusTop: 3.0, radiusBottom: 7.2, height: 10.2, radialSegments: 7, heightSegments: 3, sculpt: [0.2, 0.3, 2, 12.4], material: 'sandstone', x: 6.4, z: -39.6, sinkOrLift: -1.0, ry: 1.5 },
  { shape: 'cylinder', radiusTop: 4.2, radiusBottom: 8.6, height: 9.0, radialSegments: 8, heightSegments: 3, sculpt: [0.2, 0.24, 2, 13.7], material: 'ochre', x: -3.2, z: -24.2, sinkOrLift: -3.3, ry: 0.5, scale: [1.35, 0.82, 0.78] },
]
