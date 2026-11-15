import {
  BackSide, BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, DirectionalLight, DodecahedronGeometry,
  FogExp2, Group, HemisphereLight, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, PointLight, Scene,
  ShaderMaterial, SphereGeometry,
} from 'three'
import type { Shading, Tracker } from './shading'
import { BOULDERS, CAIRNS, CERRO_CENTER, CERRO_PARTS, SERPENT_POSITION, STELAE, TREES, groundHeightAt, type CerroMaterialKey } from './terrain'

/** Light position minus target: the single source of truth for the sun direction (see Shading.uSunDir). */
const SUN_OFFSET = { x: 32, y: 24.5, z: 28 }

/** Watertight strata sculpting for cylinders, cones and boulders (prototype EnvironmentManager). */
function sculptStrataRockGeometry(geo: BufferGeometry, ampXZ: number, ampY: number, strataSteps: number, seed: number) {
  const pos = geo.attributes.position
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const heightSpan = Math.max(0.01, maxY - minY)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const yNorm = (y - minY) / heightSpan
    const qx = Math.round(x * 100)
    const qy = Math.round(y * 100)
    const qz = Math.round(z * 100)
    const ang = Math.atan2(z, x)
    const cleft = Math.sin(ang * 3 + seed * 1.3) * 0.55 + Math.cos(ang * 5 - seed * 0.7) * 0.45
    const h1 = Math.sin(qx * 0.11 + qy * 0.23 + seed) * Math.cos(qz * 0.17 - qy * 0.13)
    const h2 = Math.cos(qz * 0.21 + qx * 0.19 + seed * 1.7)
    const shelf = strataSteps > 0 ? Math.sin(yNorm * strataSteps * Math.PI * 2) * 0.08 * (1 - yNorm * 0.3) : 0
    const radialScale = 1 + h1 * ampXZ + cleft * ampXZ * 0.65 + shelf
    const leanX = yNorm * Math.sin(seed) * ampXZ * 0.75
    pos.setXYZ(i, x * radialScale + leanX, y + h2 * ampY, z * radialScale)
  }
  geo.computeVertexNormals()
  return geo
}

/** Golden-hour sky dome centred on the camera and drawn at the far plane. */
function createSky(shading: Shading, track: Tracker) {
  const material = track.add(new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTime: shading.uTime,
      uSunDir: shading.uSunDir,
      topColor: { value: new Color(0x214c78) },
      midColor: { value: new Color(0x82b2d1) },
      horizonColor: { value: new Color(0xe6be90) },
      sunGlowColor: { value: new Color(0xffdf9e) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vSkyDir;
      void main() {
        vSkyDir = position;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vSkyDir;
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      uniform vec3 sunGlowColor;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec3 dir = normalize(vSkyDir);
        vec3 sunDir = normalize(uSunDir);
        float h = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(horizonColor, midColor, smoothstep(0.0, 0.24, h));
        col = mix(col, topColor, smoothstep(0.20, 0.80, h));
        float sunDot = max(dot(dir, sunDir), 0.0);
        col += sunGlowColor * pow(sunDot, 7.0) * 0.30;
        col += vec3(1.0, 0.96, 0.86) * smoothstep(0.9962, 0.9992, sunDot) * 1.15;
        float rayAngle = atan(dir.y - sunDir.y, dir.x - sunDir.x);
        float shafts = 0.5 + 0.5 * sin(rayAngle * 7.0 + uTime * 0.12);
        col += sunGlowColor * (pow(sunDot, 3.2) * shafts * 0.09 * (1.0 - smoothstep(0.0, 0.45, h)));
        float drift = uTime * 0.011;
        vec2 cloudUv = dir.xz / (dir.y + 0.22) * 1.35 + vec2(drift, drift * 0.28);
        float cloudMask = smoothstep(0.55, 0.83, noise(cloudUv * 2.0) * 0.65 + noise(cloudUv * 4.4 + vec2(3.1, 1.7)) * 0.35);
        float cloudBand = smoothstep(0.05, 0.20, h) * (1.0 - smoothstep(0.45, 0.82, h));
        vec3 cloudCol = mix(vec3(0.96, 0.83, 0.70), vec3(1.0, 0.95, 0.88), sunDot * 0.65 + 0.35);
        col = mix(col, cloudCol, cloudMask * cloudBand * 0.48);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }))
  const mesh = new Mesh(track.add(new SphereGeometry(150, 30, 20)), material)
  mesh.frustumCulled = false
  mesh.renderOrder = 1000
  return mesh
}

/**
 * First Earth scene: Cerro Turubó, the platform sanctuary, trail, rocks and dry forest.
 * Trimmed from the prototype EnvironmentManager: no free-roaming terrace, grass field, colliders or shadow maps.
 */
export function createEnvironment(shading: Shading, track: Tracker) {
  const group = new Group()
  const sky = createSky(shading, track)
  group.add(sky)

  // Terrain with vertex colours: sandstone trail, olive savanna and terracotta Cerro flanks.
  const terrainGeo = track.add(new PlaneGeometry(162, 162, 84, 84))
  terrainGeo.rotateX(-Math.PI / 2)
  const pos = terrainGeo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const colTrail = new Color(0xd2aa79)
  const colTrailRut = new Color(0xb88656)
  const colTrailEdge = new Color(0x9a8955)
  const colGrass = new Color(0x5b703a)
  const colSandstone = new Color(0xb9623f)
  const colHighRock = new Color(0x6e4739)
  const tint = new Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const y = groundHeightAt(x, z)
    pos.setY(i, y)
    const distTrail = Math.abs(x - Math.sin((z + 10) * 0.14) * 1.6)
    const onTrail = z <= 13.5 && z >= -13.5 && distTrail < 3.8
    if (y > 4.2 || Math.hypot(x - CERRO_CENTER.x, z - CERRO_CENTER.z) < 17.5) {
      tint.copy(colSandstone).lerp(colHighRock, Math.min(1, Math.max(0, (y - 3.0) / 14)) * 0.7)
    } else if (onTrail) {
      tint.copy(colTrail).lerp(colTrailRut, (1 - Math.min(1, distTrail / 1.15)) * 0.35).lerp(colTrailEdge, Math.min(1, distTrail / 3.8) * 0.78)
    } else {
      tint.copy(colGrass).lerp(colTrailEdge, (0.5 + 0.5 * Math.sin(x * 0.16 + z * 0.13)) * 0.42)
    }
    colors[i * 3] = tint.r
    colors[i * 3 + 1] = tint.g
    colors[i * 3 + 2] = tint.b
  }
  terrainGeo.setAttribute('color', new BufferAttribute(colors, 3))
  terrainGeo.computeVertexNormals()
  const terrainMat = track.add(shading.terrain(new MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.9, metalness: 0.02, flatShading: true })))
  group.add(new Mesh(terrainGeo, terrainMat))

  const dummy = new Object3D()
  const instanced = (geometry: BufferGeometry, material: MeshStandardMaterial, count: number) => {
    const mesh = track.add(new InstancedMesh(geometry, material, count))
    group.add(mesh)
    return mesh
  }

  // Distant ridge rings.
  const ridgeGeo = track.add(sculptStrataRockGeometry(new CylinderGeometry(0.42, 1.05, 1, 7, 2), 0.16, 0.18, 2, 7.1))
  const ring = (count: number, radiusBase: number, heightBase: number, widthBase: number, color: number, seedOff: number) => {
    const material = track.add(new MeshStandardMaterial({ color, roughness: 0.96, metalness: 0, flatShading: true }))
    const mesh = instanced(ridgeGeo, material, count)
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + seedOff
      const rad = radiusBase + Math.sin(i * 2.3 + seedOff) * 5.2
      const h = heightBase + Math.cos(i * 1.7 + seedOff) * heightBase * 0.25
      const w = widthBase + (i % 4) * 4.2
      dummy.position.set(Math.cos(ang) * rad, h * 0.36 - 1.6, Math.sin(ang) * rad)
      dummy.rotation.set(0, ang + i * 0.45, 0)
      dummy.scale.set(w, h, w * 0.72)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.computeBoundingSphere()
  }
  ring(24, 86, 11.5, 24, 0x896459, 0.14)
  ring(28, 110, 16.5, 31, 0x7b6d7a, 0.41)

  // Cerro Turubó massif.
  const cerroMaterials: Record<CerroMaterialKey, MeshStandardMaterial> = {
    sandstone: track.add(shading.rock(new MeshStandardMaterial({ color: 0xc2653f, roughness: 0.86, metalness: 0.03, flatShading: true }), 0xffd089, 0.24)),
    ochre: track.add(shading.rock(new MeshStandardMaterial({ color: 0xd4854d, roughness: 0.82, metalness: 0.04, flatShading: true }), 0xffe0aa, 0.28)),
    darkSlate: track.add(shading.rock(new MeshStandardMaterial({ color: 0x6f4a3c, roughness: 0.92, metalness: 0.05, flatShading: true }), 0x99bddb, 0.18)),
  }
  for (const p of CERRO_PARTS) {
    const base = p.shape === 'cone'
      ? new ConeGeometry(p.radiusBottom, p.height, p.radialSegments, p.heightSegments)
      : new CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, p.radialSegments, p.heightSegments)
    const mesh = new Mesh(track.add(sculptStrataRockGeometry(base, ...p.sculpt)), cerroMaterials[p.material])
    mesh.position.set(p.x, groundHeightAt(p.x, p.z) + p.sinkOrLift, p.z)
    mesh.rotation.set(p.rx ?? 0, p.ry, p.rz ?? 0)
    if (p.scale) mesh.scale.set(...p.scale)
    group.add(mesh)
  }

  // Trail flagstones, cairns and the stelae crescent around the platform.
  const stoneMat = track.add(shading.rock(new MeshStandardMaterial({ color: 0xb1987f, roughness: 0.86, metalness: 0.04, flatShading: true }), 0xffdfb0, 0.16))
  const stelaMat = track.add(shading.rock(new MeshStandardMaterial({ color: 0x7b6352, roughness: 0.88, metalness: 0.05, flatShading: true }), 0x99d9c8, 0.26))
  const veinMat = track.add(new MeshStandardMaterial({ color: 0x62e2be, emissive: 0x3dc09b, emissiveIntensity: 0.78, roughness: 0.28 }))
  const slabGeo = track.add(new CylinderGeometry(0.76, 0.92, 0.14, 7))
  for (let z = 3.2; z >= -6.6; z -= 1.85) {
    const tx = Math.sin((z + 10) * 0.14) * 1.6
    const slab = new Mesh(slabGeo, stoneMat)
    slab.position.set(tx, groundHeightAt(tx, z) + 0.01, z)
    slab.rotation.y = z * 0.45
    slab.scale.set(1.0 + Math.abs(Math.sin(z)) * 0.25, 1, 0.86)
    group.add(slab)
  }
  const cairnGeo = track.add(sculptStrataRockGeometry(new DodecahedronGeometry(0.34, 0), 0.18, 0.14, 0, 4.1))
  for (const cairn of CAIRNS) {
    const cy = groundHeightAt(cairn.x, cairn.z)
    for (let s = 0; s < 3; s++) {
      const rock = new Mesh(cairnGeo, stoneMat)
      const sc = 1.24 - s * 0.28
      rock.scale.set(sc, sc * 0.72, sc)
      rock.position.set(cairn.x, cy + 0.14 + s * 0.28, cairn.z)
      rock.rotation.y = s * 0.95
      group.add(rock)
    }
  }
  const stelaBaseGeo = track.add(new CylinderGeometry(0.54, 0.64, 0.28, 6))
  const stelaGeo = track.add(new CylinderGeometry(0.28, 0.46, 2.7, 5))
  const stelaCapGeo = track.add(new ConeGeometry(0.3, 0.42, 5))
  const veinGeo = track.add(new CylinderGeometry(0.06, 0.06, 1.52, 4))
  STELAE.forEach(({ x, z }, idx) => {
    const y = groundHeightAt(x, z)
    const stela = new Group()
    stela.position.set(x, y - 0.14, z)
    stela.lookAt(SERPENT_POSITION.x, y, SERPENT_POSITION.z)
    stela.rotation.z = (idx % 2 === 0 ? 1 : -1) * 0.045
    const base = new Mesh(stelaBaseGeo, stoneMat)
    base.position.y = 0.12
    const body = new Mesh(stelaGeo, stelaMat)
    body.position.y = 1.38
    const cap = new Mesh(stelaCapGeo, stelaMat)
    cap.position.y = 2.92
    const vein = new Mesh(veinGeo, veinMat)
    vein.position.set(0, 1.45, 0.36)
    stela.add(base, body, cap, vein)
    group.add(stela)
  })

  // Boulders.
  const rockGeo = track.add(sculptStrataRockGeometry(new DodecahedronGeometry(1, 1), 0.22, 0.18, 2, 4.7))
  const rockMat = track.add(shading.rock(new MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0.04, flatShading: true }), 0xffd295, 0.2))
  const rocks = instanced(rockGeo, rockMat, BOULDERS.length)
  const rockPalette = [0xa87859, 0x8c644b, 0xba865c, 0x775746]
  BOULDERS.forEach((r, idx) => {
    dummy.position.set(r.x, groundHeightAt(r.x, r.z) + r.ry * 0.28, r.z)
    dummy.rotation.set((idx % 3) * 0.2, idx * 1.15, ((idx % 2) * 2 - 1) * 0.14)
    dummy.scale.set(r.rx, r.ry, r.rz)
    dummy.updateMatrix()
    rocks.setMatrixAt(idx, dummy.matrix)
    rocks.setColorAt(idx, tint.setHex(rockPalette[idx % rockPalette.length]))
  })
  rocks.computeBoundingSphere()

  // Chiquitano dry-forest trees: trunk, two branches, four swaying canopy lobes.
  const trunkMat = track.add(new MeshStandardMaterial({ color: 0x5c3e2b, roughness: 0.92, metalness: 0.02, flatShading: true }))
  const canopyMat = track.add(shading.foliage(new MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0.02, flatShading: true }), 0.055, 0.26))
  const trunks = instanced(track.add(new CylinderGeometry(0.16, 0.42, 3.1, 7)), trunkMat, TREES.length)
  const branches = instanced(track.add(new CylinderGeometry(0.08, 0.16, 1.5, 5)), trunkMat, TREES.length * 2)
  const canopies = instanced(track.add(sculptStrataRockGeometry(new DodecahedronGeometry(1.32, 1), 0.16, 0.12, 0, 2.2)), canopyMat, TREES.length * 4)
  const foliagePalette = [0x4c7436, 0x62833c, 0x3d6433, 0x8e893d, 0x72843c]
  const lobes = [
    { ox: 0, oy: 3.05, oz: 0, sx: 1.24, sy: 0.72, sz: 1.15 },
    { ox: 0.55, oy: 3.72, oz: -0.25, sx: 0.88, sy: 0.68, sz: 0.86 },
    { ox: -0.52, oy: 3.3, oz: 0.34, sx: 0.78, sy: 0.62, sz: 0.78 },
    { ox: 0.12, oy: 4.15, oz: 0.16, sx: 0.64, sy: 0.54, sz: 0.64 },
  ]
  TREES.forEach((tree, idx) => {
    const gy = groundHeightAt(tree.x, tree.z)
    const s = tree.scale
    dummy.position.set(tree.x, gy + 1.35 * s, tree.z)
    dummy.rotation.set(0.03, idx * 0.9, 0.05 * (idx % 2 === 0 ? 1 : -1))
    dummy.scale.setScalar(s)
    dummy.updateMatrix()
    trunks.setMatrixAt(idx, dummy.matrix)
    for (let b = 0; b < 2; b++) {
      const bAng = idx * 1.1 + b * Math.PI * 0.85
      dummy.position.set(tree.x + Math.cos(bAng) * 0.42 * s, gy + 2.65 * s, tree.z + Math.sin(bAng) * 0.42 * s)
      dummy.rotation.set(Math.sin(bAng) * 0.55, bAng, -Math.cos(bAng) * 0.55)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      branches.setMatrixAt(idx * 2 + b, dummy.matrix)
    }
    lobes.forEach((lobe, l) => {
      dummy.position.set(tree.x + lobe.ox * s, gy + lobe.oy * s, tree.z + lobe.oz * s)
      dummy.rotation.set(0.08 * l, idx * 1.3 + l, -0.06 * l)
      dummy.scale.set(lobe.sx * s, lobe.sy * s, lobe.sz * s)
      dummy.updateMatrix()
      canopies.setMatrixAt(idx * 4 + l, dummy.matrix)
      canopies.setColorAt(idx * 4 + l, tint.setHex(foliagePalette[(idx + l) % foliagePalette.length]))
    })
  })
  for (const mesh of [trunks, branches, canopies]) mesh.computeBoundingSphere()

  return {
    group,
    /** Keeps the sky dome centred on the camera. */
    update(cameraX: number, cameraY: number, cameraZ: number) {
      sky.position.set(cameraX, cameraY, cameraZ)
    },
  }
}

/** Warm golden-hour light, cool rim and the jade accent of the platform (prototype LightingManager, without shadow maps). */
export function createLighting(scene: Scene) {
  scene.background = new Color(0xdfb689)
  scene.fog = new FogExp2(0xdfb689, 0.0094)
  const hemi = new HemisphereLight(0x82bde9, 0x8e5236, 1.05)
  hemi.position.set(0, 50, 0)
  const sun = new DirectionalLight(0xffd699, 3.0)
  sun.target.position.set(0, 1.5, -12)
  sun.position.set(SUN_OFFSET.x, 1.5 + SUN_OFFSET.y, -12 + SUN_OFFSET.z)
  const rim = new DirectionalLight(0x74b3ea, 0.96)
  rim.position.set(-28, 17, -46)
  const altarY = groundHeightAt(SERPENT_POSITION.x, SERPENT_POSITION.z)
  const sanctuary = new PointLight(0x78ebc4, 2.8, 16, 1.75)
  sanctuary.position.set(SERPENT_POSITION.x, altarY + 2.35, SERPENT_POSITION.z)
  scene.add(hemi, sun, sun.target, rim, sanctuary)
  return {
    /** threat: 0 calm platform, 1 serpent alert. */
    update(elapsed: number, threat: number) {
      sanctuary.intensity = 1.6 + threat * 2.2 + Math.sin(elapsed * 2.5) * 0.38 * threat
    },
    dispose() {
      for (const light of [hemi, sun, rim, sanctuary]) light.dispose()
    },
  }
}
