import {
  BoxGeometry, BufferAttribute, BufferGeometry, ConeGeometry, CylinderGeometry, DodecahedronGeometry, DoubleSide, Group,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, OctahedronGeometry, Points, PointsMaterial, RingGeometry, Vector3,
  type Material,
} from 'three'
import type { Shading, Tracker } from './shading'
import { SERPENT_POSITION, groundHeightAt } from './terrain'

/**
 * The Serpent and the stone platform it guards, ported from the prototype
 * (turubo-atlas/src/experience/characters/Serpent.ts) with its animation fixes:
 * accumulated wave/spin phases (no jumps when speed changes), the head leads the coil,
 * the tail continues its direction and the head pitches about its own axis (YXZ).
 * The stage drives alert, rise (head lifts before a lateral move), strike and subdued each frame.
 */
export class Serpent {
  readonly group = new Group()
  /** World point the head looks at and strikes towards. */
  readonly lookTarget = new Vector3()
  alert = 1
  rise = 0
  strike = 0
  subdued = 0

  private readonly body = new Group()
  private readonly segments: Group[] = []
  private readonly headGroup = new Group()
  private readonly jawPivot = new Group()
  private readonly auraRing: Mesh
  private readonly auraMaterial: MeshBasicMaterial
  private readonly motes: Points
  private readonly moteMaterial: PointsMaterial
  private readonly eyeMaterial: MeshStandardMaterial
  private readonly lunge = new Vector3()
  private readonly tmp = new Vector3()
  private baseAngle = 0
  private headLookAngle = 0
  private hoverLift = 0
  private wavePhase = 0
  private waveSpeed = 1.48
  private spinAngle = 0
  private moteAngle = 0

  constructor(shading: Shading, track: Tracker) {
    const geo = <T extends BufferGeometry>(g: T) => track.add(g)
    const mat = <T extends Material>(m: T) => track.add(m)
    const actor = (color: number, roughness: number, metalness: number, rim: number, strength: number) =>
      mat(shading.actor(new MeshStandardMaterial({ color, roughness, metalness, flatShading: true }), rim, strength))

    this.group.position.set(SERPENT_POSITION.x, groundHeightAt(SERPENT_POSITION.x, SERPENT_POSITION.z), SERPENT_POSITION.z)
    this.group.add(this.body)

    const plinthMat = actor(0x886b54, 0.88, 0.04, 0xffd699, 0.2)
    const scaleMat = actor(0x226d5a, 0.3, 0.18, 0x9bf5dc, 0.44)
    const darkScaleMat = actor(0x174b3e, 0.36, 0.14, 0x79e8c8, 0.38)
    const bellyMat = actor(0xd8a34f, 0.38, 0.26, 0xffe7a8, 0.36)
    const runeMat = mat(new MeshStandardMaterial({ color: 0x62ebc2, emissive: 0x3ec29d, emissiveIntensity: 1.35, roughness: 0.25, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }))
    this.eyeMaterial = mat(new MeshStandardMaterial({ color: 0xffd066, emissive: 0xffa629, emissiveIntensity: 1.75, roughness: 0.16 }))
    this.auraMaterial = mat(new MeshBasicMaterial({ color: 0x7be0be, transparent: true, opacity: 0.22, depthWrite: false, side: DoubleSide }))

    // Carved two-tier platform with a glowing rune inlay.
    const plinth = new Mesh(geo(new CylinderGeometry(1.9, 2.22, 0.42, 10)), plinthMat)
    plinth.position.y = 0.18
    const step = new Mesh(geo(new CylinderGeometry(1.5, 1.66, 0.2, 10)), plinthMat)
    step.position.y = 0.46
    const rune = new Mesh(geo(new RingGeometry(1.22, 1.39, 24)), runeMat)
    rune.rotation.x = -Math.PI / 2
    rune.position.y = 0.565
    this.auraRing = new Mesh(geo(new RingGeometry(2.28, 2.58, 32)), this.auraMaterial)
    this.auraRing.rotation.x = -Math.PI / 2
    this.auraRing.position.y = 0.04
    this.group.add(plinth, step, rune, this.auraRing)

    // 26 tapering segments with belly plates, dorsal crests and a glowing tail fin.
    const segCount = 26
    const segBodyGeo = geo(new DodecahedronGeometry(1, 0))
    const bellyPlateGeo = geo(new CylinderGeometry(0.85, 0.92, 0.72, 6))
    const crestGeo = geo(new ConeGeometry(0.32, 0.74, 5))
    const finGeo = geo(new BoxGeometry(0.92, 0.08, 0.45))
    for (let i = 0; i < segCount; i++) {
      const segment = new Group()
      const radius = MathUtils.lerp(0.35, 0.075, i / (segCount - 1))
      const body = new Mesh(segBodyGeo, i % 3 === 0 ? darkScaleMat : scaleMat)
      body.scale.set(radius * 1.12, radius * 0.92, radius * 1.32)
      const ventral = new Mesh(bellyPlateGeo, bellyMat)
      ventral.rotation.x = Math.PI / 2
      ventral.position.y = -radius * 0.34
      ventral.scale.set(radius * 0.85, radius * 1.1, radius * 0.52)
      segment.add(body, ventral)
      if (i % 2 === 0 && i < segCount - 2) {
        const crest = new Mesh(crestGeo, bellyMat)
        crest.scale.setScalar(radius * 1.25)
        crest.position.set(0, radius * 0.92, 0)
        crest.rotation.x = -0.34
        segment.add(crest)
      }
      if (i >= segCount - 3) {
        const fin = new Mesh(finGeo, runeMat)
        fin.scale.setScalar(radius * 2.2)
        segment.add(fin)
      }
      this.segments.push(segment)
      this.body.add(segment)
    }

    // Head: skull, snout, hood, brow, horns, eyes and a jaw (fangs kept small and out of close-up).
    const head = (geometry: BufferGeometry, material: Material, x: number, y: number, z: number) => {
      const mesh = new Mesh(geometry, material)
      mesh.position.set(x, y, z)
      this.headGroup.add(mesh)
      return mesh
    }
    const skull = head(geo(new ConeGeometry(0.4, 0.94, 6)), scaleMat, 0, 0, 0.26)
    skull.rotation.x = Math.PI / 2
    skull.scale.set(1.08, 1, 0.7)
    head(geo(new BoxGeometry(0.36, 0.16, 0.56)), darkScaleMat, 0, 0.04, 0.34)
    const hood = head(geo(new CylinderGeometry(0.22, 0.64, 0.48, 6)), darkScaleMat, 0, 0.05, -0.1)
    hood.rotation.x = Math.PI / 2 - 0.32
    hood.scale.set(1.38, 0.85, 0.58)
    const hoodWingGeo = geo(new ConeGeometry(0.28, 0.72, 5))
    head(hoodWingGeo, bellyMat, -0.42, 0.06, -0.12).rotation.set(0.2, 0.2, 0.95)
    head(hoodWingGeo, bellyMat, 0.42, 0.06, -0.12).rotation.set(0.2, -0.2, -0.95)
    head(geo(new BoxGeometry(0.56, 0.13, 0.28)), bellyMat, 0, 0.145, 0.17)
    const hornGeo = geo(new ConeGeometry(0.088, 0.46, 5))
    head(hornGeo, bellyMat, -0.21, 0.28, 0.02).rotation.set(-0.52, 0, 0.36)
    head(hornGeo, bellyMat, 0.21, 0.28, 0.02).rotation.set(-0.52, 0, -0.36)
    const eyeGeo = geo(new OctahedronGeometry(0.08, 0))
    head(eyeGeo, this.eyeMaterial, -0.2, 0.09, 0.3)
    head(eyeGeo, this.eyeMaterial, 0.2, 0.09, 0.3)
    const jaw = new Mesh(geo(new ConeGeometry(0.28, 0.66, 5)), bellyMat)
    jaw.rotation.x = Math.PI / 2
    jaw.scale.set(0.95, 1, 0.44)
    jaw.position.set(0, -0.05, 0.24)
    this.jawPivot.position.set(0, -0.06, 0.04)
    this.jawPivot.add(jaw)
    this.headGroup.add(this.jawPivot)
    this.body.add(this.headGroup)

    // Soft motes rising around the platform.
    const moteCount = 42
    const motePos = new Float32Array(moteCount * 3)
    for (let i = 0; i < moteCount; i++) {
      const ang = (i / moteCount) * Math.PI * 2
      const rad = 1.68 + (i % 3) * 0.44
      motePos[i * 3] = Math.cos(ang) * rad
      motePos[i * 3 + 1] = 0.42 + (i % 6) * 0.46
      motePos[i * 3 + 2] = Math.sin(ang) * rad
    }
    const moteGeo = geo(new BufferGeometry())
    moteGeo.setAttribute('position', new BufferAttribute(motePos, 3))
    this.moteMaterial = mat(shading.softParticles(new PointsMaterial({ color: 0x8ef5d4, size: 0.12, transparent: true, opacity: 0.36, depthWrite: false }), 10))
    this.motes = new Points(moteGeo, this.moteMaterial)
    this.group.add(this.motes)
  }

  update(elapsed: number, dt: number) {
    const calm = 1 - this.subdued * 0.7
    this.waveSpeed = MathUtils.damp(this.waveSpeed, MathUtils.lerp(1.48, 2.45, this.alert) * calm, 2.5, dt)
    this.wavePhase += this.waveSpeed * dt
    // Coil rotates so the head leads the motion.
    this.spinAngle -= 0.34 * calm * dt

    const desiredHover = 0.46 * this.alert + 0.65 * this.rise - 0.55 * this.subdued
    this.hoverLift = MathUtils.damp(this.hoverLift, desiredHover, 6, dt)
    const swayAmp = 0.145 * calm

    // Lunge: front segments and head travel towards the target, fading along the body.
    const origin = this.group.position
    this.tmp.copy(this.lookTarget).sub(origin)
    const neckY = 1.98 + this.hoverLift
    const toTarget = Math.hypot(this.tmp.x, this.tmp.z)
    const reach = Math.max(0, Math.min(toTarget - 1.1, 2.9))
    if (toTarget > 0.001) this.lunge.set(this.tmp.x / toTarget * reach, (this.tmp.y - neckY) * 0.65, this.tmp.z / toTarget * reach)
    else this.lunge.set(0, 0, 0)
    this.lunge.multiplyScalar(this.strike)

    const n = this.segments.length
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const angle = t * Math.PI * 2.65 + this.spinAngle
      const radius = MathUtils.lerp(0.6, 1.38, t)
      const undulate = Math.sin(this.wavePhase - i * 0.42) * swayAmp
      const lift = (1 - t) * (1.42 + this.hoverLift) + 0.56 + undulate * (1 - t * 0.72)
      const pull = i < 9 ? (1 - i / 9) ** 2 : 0
      this.segments[i].position.set(
        Math.sin(angle) * (radius + undulate * 0.34) + this.lunge.x * pull,
        lift + this.lunge.y * pull,
        Math.cos(angle) * (radius + undulate * 0.34) + this.lunge.z * pull,
      )
      if (i === 0) this.baseAngle = angle
    }
    for (let i = 0; i < n - 1; i++) {
      const next = this.segments[i + 1].position
      this.segments[i].lookAt(origin.x + next.x, origin.y + next.y, origin.z + next.z)
    }
    const tail = this.segments[n - 1].position
    const beforeTail = this.segments[n - 2].position
    this.segments[n - 1].lookAt(origin.x + tail.x * 2 - beforeTail.x, origin.y + tail.y * 2 - beforeTail.y, origin.z + tail.z * 2 - beforeTail.z)

    const neck = this.segments[0].position
    this.headGroup.position.set(neck.x, neck.y + 0.18 + Math.sin(elapsed * 2.15) * 0.045 * calm, neck.z)
    const dx = this.lookTarget.x - (origin.x + this.headGroup.position.x)
    const dz = this.lookTarget.z - (origin.z + this.headGroup.position.z)
    const idleYaw = this.baseAngle - Math.PI * 0.5
    let targetLookYaw = this.alert > 0.5 || this.strike > 0.05 ? Math.atan2(dx, dz) : idleYaw
    if (this.subdued > 0.6) targetLookYaw = Math.atan2(dx, dz) + 0.5
    let diff = targetLookYaw - this.headLookAngle
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    this.headLookAngle += diff * (1 - Math.exp(-5.5 * dt))

    this.headGroup.rotation.order = 'YXZ'
    this.headGroup.rotation.y = this.headLookAngle
    const targetPitch = -0.1 * this.alert - 0.16 * this.rise + 0.3 * this.strike + 0.55 * this.subdued
    this.headGroup.rotation.x = MathUtils.damp(this.headGroup.rotation.x, targetPitch, 8, dt)
    this.jawPivot.rotation.x = MathUtils.damp(this.jawPivot.rotation.x, 0.3 * Math.max(this.rise, this.strike) * (1 - this.subdued), 10, dt)

    const glow = this.alert * (1 - this.subdued * 0.85)
    this.auraMaterial.opacity = MathUtils.damp(this.auraMaterial.opacity, 0.1 + 0.54 * glow, 8, dt)
    this.auraRing.scale.setScalar(MathUtils.damp(this.auraRing.scale.x, 1 + 0.08 * glow, 6, dt))
    this.moteMaterial.opacity = MathUtils.damp(this.moteMaterial.opacity, 0.2 + 0.62 * glow, 6, dt)
    this.eyeMaterial.emissiveIntensity = MathUtils.damp(this.eyeMaterial.emissiveIntensity, 0.35 + 1.4 * (1 - this.subdued), 6, dt)
    this.moteAngle += (0.18 + 0.27 * glow) * dt
    this.motes.rotation.y = this.moteAngle
  }
}
