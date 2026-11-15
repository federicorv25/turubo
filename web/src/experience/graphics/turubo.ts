import {
  BoxGeometry, CanvasTexture, CircleGeometry, ConeGeometry, CylinderGeometry, DodecahedronGeometry, Group, MathUtils, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, SphereGeometry, type BufferGeometry, type Material, type Object3D,
} from 'three'
import type { Shading, Tracker } from './shading'

function createContactShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    const grad = context.createRadialGradient(64, 64, 8, 64, 64, 60)
    grad.addColorStop(0, 'rgba(18, 12, 8, 0.58)')
    grad.addColorStop(0.6, 'rgba(18, 12, 8, 0.24)')
    grad.addColorStop(1, 'rgba(18, 12, 8, 0)')
    context.fillStyle = grad
    context.fillRect(0, 0, 128, 128)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Turubó, ported from the prototype (turubo-atlas/src/experience/characters/Turubo.ts) with its animation fixes:
 * joint conventions, mid-stance bob, damped lean, squash and a contact shadow that stays on the ground.
 * The model faces -Z. Held poses (reach, guard, crouch, throw) are set by the stage each frame.
 */
export class Turubo {
  readonly group = new Group()
  /** Small carved figure he protects; the stage can detach it (distraction). */
  readonly figure = new Group()
  private readonly bodyPivot = new Group()
  private readonly torsoPivot = new Group()
  private readonly headGroup = new Group()
  private readonly hairTailPivot = new Group()
  private readonly hairTipPivot = new Group()
  private readonly leftArmPivot = new Group()
  private readonly rightArmPivot = new Group()
  private readonly leftForearmPivot = new Group()
  private readonly rightForearmPivot = new Group()
  private readonly leftLegPivot = new Group()
  private readonly rightLegPivot = new Group()
  private readonly leftKneePivot = new Group()
  private readonly rightKneePivot = new Group()
  private readonly ponchoFlap = new Group()
  private readonly shadowMesh: Mesh
  private readonly shadowMaterial: MeshBasicMaterial

  /** 0..1 arms hold the figure close to the chest. */
  guard = 0
  /** 0..1 knees bend before a jump. */
  crouch = 0
  /** -1..1 throwing arm: negative draws it back, positive swings it forward. */
  throwArm = 0
  /** 0..1 venom weariness. */
  weary = 0

  private squashY = 1
  private squashXZ = 1

  constructor(shading: Shading, track: Tracker) {
    const geo = <T extends BufferGeometry>(g: T) => track.add(g)
    const mat = <T extends Material>(m: T) => track.add(m)
    const actor = (color: number, roughness: number, metalness: number, rim: number, strength: number) =>
      mat(shading.actor(new MeshStandardMaterial({ color, roughness, metalness, flatShading: true }), rim, strength))

    this.shadowMaterial = mat(new MeshBasicMaterial({ map: track.add(createContactShadowTexture()), transparent: true, depthWrite: false, opacity: 0.85 }))
    this.shadowMesh = new Mesh(geo(new CircleGeometry(0.66, 24)), this.shadowMaterial)
    this.shadowMesh.rotation.x = -Math.PI / 2
    this.shadowMesh.position.y = 0.02
    this.group.add(this.shadowMesh)

    const tunicMat = actor(0xcf6338, 0.86, 0.02, 0xffd699, 0.34)
    const capeMat = actor(0x315c5e, 0.84, 0.04, 0x99e0cb, 0.32)
    const trimGoldMat = actor(0xe3a64b, 0.56, 0.18, 0xffe8b0, 0.3)
    const trouserMat = actor(0x41332a, 0.85, 0.03, 0xffcf94, 0.18)
    const leatherMat = actor(0x5c361e, 0.44, 0.09, 0xffc680, 0.28)
    const bedrollMat = actor(0xc4b192, 0.9, 0.02, 0xffebd1, 0.22)
    const skinMat = actor(0xcb8f64, 0.56, 0.02, 0xffd9b0, 0.26)
    const hairMat = actor(0x201915, 0.72, 0.06, 0xffcc88, 0.26)
    const brassMat = actor(0xe2ad4e, 0.32, 0.45, 0xfff0c2, 0.36)
    const woodMat = actor(0xd9b07a, 0.7, 0.02, 0xffe7bd, 0.4)
    const soleMat = mat(new MeshStandardMaterial({ color: 0x281b14, roughness: 0.92, flatShading: true }))
    const eyeScleraMat = mat(new MeshStandardMaterial({ color: 0xf4ece2, roughness: 0.25 }))
    const eyeIrisMat = mat(new MeshStandardMaterial({ color: 0x1a1410, roughness: 0.14, metalness: 0.12 }))

    this.group.add(this.bodyPivot)

    // Legs: hip -> thigh -> knee -> shin -> cuff -> boot -> sole (hip y = 0.78).
    const thighGeo = geo(new CylinderGeometry(0.11, 0.086, 0.36, 8))
    const kneeGeo = geo(new DodecahedronGeometry(0.085, 0))
    const shinGeo = geo(new CylinderGeometry(0.086, 0.068, 0.31, 8))
    const cuffGeo = geo(new CylinderGeometry(0.098, 0.11, 0.1, 8))
    const bootGeo = geo(new BoxGeometry(0.15, 0.135, 0.26))
    const soleGeo = geo(new BoxGeometry(0.162, 0.042, 0.285))
    const buildLeg = (hipPivot: Group, kneePivot: Group, xOffset: number) => {
      hipPivot.position.set(xOffset, 0.78, 0)
      const thigh = new Mesh(thighGeo, trouserMat)
      thigh.position.y = -0.18
      kneePivot.position.set(0, -0.37, 0)
      const knee = new Mesh(kneeGeo, trouserMat)
      const shin = new Mesh(shinGeo, trouserMat)
      shin.position.y = -0.16
      const cuff = new Mesh(cuffGeo, leatherMat)
      cuff.position.y = -0.27
      const boot = new Mesh(bootGeo, leatherMat)
      boot.position.set(0, -0.34, -0.032)
      const sole = new Mesh(soleGeo, soleMat)
      sole.position.set(0, -0.4, -0.032)
      kneePivot.add(knee, shin, cuff, boot, sole)
      hipPivot.add(thigh, kneePivot)
      this.bodyPivot.add(hipPivot)
    }
    buildLeg(this.leftLegPivot, this.leftKneePivot, -0.142)
    buildLeg(this.rightLegPivot, this.rightKneePivot, 0.142)

    // Upper body: pelvis, tapered chest, skirt, sash, pack, bedroll, canteen, collar.
    this.torsoPivot.position.set(0, 0.8, 0)
    this.bodyPivot.add(this.torsoPivot)
    const part = (geometry: BufferGeometry, material: Material, x: number, y: number, z: number, parent: Object3D = this.torsoPivot) => {
      const mesh = new Mesh(geometry, material)
      mesh.position.set(x, y, z)
      parent.add(mesh)
      return mesh
    }
    part(geo(new CylinderGeometry(0.185, 0.21, 0.14, 8)), trouserMat, 0, 0.03, 0)
    part(geo(new CylinderGeometry(0.245, 0.185, 0.44, 8)), tunicMat, 0, 0.29, 0).scale.set(1.06, 1, 0.84)
    part(geo(new CylinderGeometry(0.21, 0.31, 0.24, 8)), tunicMat, 0, -0.05, 0).scale.set(1.04, 1, 0.88)
    part(geo(new CylinderGeometry(0.215, 0.228, 0.1, 8)), trimGoldMat, 0, 0.06, 0).scale.set(1.04, 1, 0.88)
    part(geo(new CylinderGeometry(0.062, 0.062, 0.04, 6)), brassMat, 0, 0.06, -0.2).rotation.x = Math.PI / 2
    const strapGeo = geo(new BoxGeometry(0.055, 0.42, 0.28))
    part(strapGeo, leatherMat, -0.12, 0.29, 0.02)
    part(strapGeo, leatherMat, 0.12, 0.29, 0.02)
    part(geo(new BoxGeometry(0.32, 0.36, 0.18)), leatherMat, 0, 0.28, 0.235)
    part(geo(new BoxGeometry(0.34, 0.12, 0.195)), trimGoldMat, 0, 0.42, 0.235)
    part(geo(new CylinderGeometry(0.085, 0.085, 0.38, 8)), bedrollMat, 0, 0.53, 0.24).rotation.z = Math.PI / 2
    part(geo(new CylinderGeometry(0.062, 0.062, 0.14, 8)), brassMat, 0.21, 0.16, 0.2)
    part(geo(new CylinderGeometry(0.15, 0.2, 0.11, 8)), capeMat, 0, 0.52, 0)

    // Poncho capelet with a woven gold hem.
    part(geo(new CylinderGeometry(0.19, 0.39, 0.26, 10)), capeMat, 0, 0, 0, this.ponchoFlap).scale.set(1.06, 1, 0.9)
    part(geo(new CylinderGeometry(0.37, 0.405, 0.055, 10)), trimGoldMat, 0, -0.12, 0, this.ponchoFlap).scale.set(1.06, 1, 0.9)
    this.ponchoFlap.position.set(0, 0.45, 0)
    this.torsoPivot.add(this.ponchoFlap)

    // Arms: shoulder -> upper arm -> elbow -> forearm -> bracer -> hand.
    const shoulderGeo = geo(new DodecahedronGeometry(0.095, 0))
    const upperArmGeo = geo(new CylinderGeometry(0.082, 0.068, 0.24, 7))
    const elbowGeo = geo(new DodecahedronGeometry(0.068, 0))
    const forearmGeo = geo(new CylinderGeometry(0.068, 0.058, 0.22, 7))
    const bracerGeo = geo(new CylinderGeometry(0.068, 0.062, 0.11, 7))
    const handGeo = geo(new DodecahedronGeometry(0.072, 0))
    const buildArm = (shoulderPivot: Group, forearmPivot: Group, xOffset: number) => {
      shoulderPivot.position.set(xOffset, 0.48, 0)
      part(shoulderGeo, capeMat, 0, 0, 0, shoulderPivot)
      part(upperArmGeo, tunicMat, 0, -0.13, 0, shoulderPivot)
      forearmPivot.position.set(0, -0.25, 0)
      part(elbowGeo, tunicMat, 0, 0, 0, forearmPivot)
      part(forearmGeo, skinMat, 0, -0.11, 0, forearmPivot)
      part(bracerGeo, leatherMat, 0, -0.16, 0, forearmPivot)
      part(handGeo, skinMat, 0, -0.25, 0, forearmPivot)
      shoulderPivot.add(forearmPivot)
      this.torsoPivot.add(shoulderPivot)
    }
    buildArm(this.leftArmPivot, this.leftForearmPivot, -0.31)
    buildArm(this.rightArmPivot, this.rightForearmPivot, 0.31)

    // Head, hair crown, bangs and a two-stage ponytail that hangs and tapers backwards.
    this.headGroup.position.set(0, 0.59, 0)
    part(geo(new CylinderGeometry(0.082, 0.095, 0.12, 7)), skinMat, 0, 0.04, 0, this.headGroup)
    part(geo(new DodecahedronGeometry(0.205, 1)), skinMat, 0, 0.19, 0, this.headGroup).scale.set(0.92, 1.06, 0.94)
    part(geo(new BoxGeometry(0.24, 0.036, 0.06)), hairMat, 0, 0.23, -0.17, this.headGroup)
    part(geo(new ConeGeometry(0.036, 0.075, 4)), skinMat, 0, 0.175, -0.2, this.headGroup).rotation.x = -Math.PI * 0.42
    part(geo(new DodecahedronGeometry(0.228, 1)), hairMat, 0, 0.255, 0.025, this.headGroup).scale.set(1.03, 0.82, 1.08)
    const tuftGeo = geo(new ConeGeometry(0.085, 0.18, 5))
    part(tuftGeo, hairMat, -0.1, 0.26, -0.15, this.headGroup).rotation.set(-0.75, 0, 0.35)
    part(tuftGeo, hairMat, 0.1, 0.26, -0.15, this.headGroup).rotation.set(-0.75, 0, -0.35)
    part(geo(new CylinderGeometry(0.212, 0.216, 0.048, 8)), trimGoldMat, 0, 0.24, 0.01, this.headGroup).rotation.x = 0.08
    part(geo(new ConeGeometry(0.105, 0.24, 6)), hairMat, 0, -0.09, 0.06, this.hairTailPivot).rotation.x = Math.PI - 0.45
    this.hairTailPivot.position.set(0, 0.22, 0.19)
    part(geo(new ConeGeometry(0.072, 0.22, 5)), hairMat, 0, -0.11, 0.04, this.hairTipPivot).rotation.x = Math.PI - 0.35
    this.hairTipPivot.position.set(0, -0.18, 0.11)
    this.hairTailPivot.add(this.hairTipPivot)
    this.headGroup.add(this.hairTailPivot)
    const scleraGeo = geo(new BoxGeometry(0.056, 0.044, 0.025))
    const irisGeo = geo(new BoxGeometry(0.032, 0.036, 0.03))
    for (const side of [-1, 1]) {
      part(scleraGeo, eyeScleraMat, 0.072 * side, 0.19, -0.178, this.headGroup)
      part(irisGeo, eyeIrisMat, 0.072 * side, 0.19, -0.186, this.headGroup)
    }
    this.torsoPivot.add(this.headGroup)

    // Carved wood figure (personajes.md: visible in his hand to signal his craft).
    part(geo(new CylinderGeometry(0.045, 0.07, 0.17, 6)), woodMat, 0, 0.085, 0, this.figure)
    part(geo(new SphereGeometry(0.05, 8, 6)), woodMat, 0, 0.21, 0, this.figure)
    this.holdFigure()
  }

  /** Puts the carved figure back into his right hand. */
  holdFigure() {
    this.figure.position.set(0, -0.3, -0.07)
    this.figure.rotation.set(0, 0, 0)
    this.figure.scale.setScalar(1)
    this.rightForearmPivot.add(this.figure)
  }

  triggerJumpSquash() {
    this.squashY = 1.18
    this.squashXZ = 0.86
  }

  triggerLandSquash() {
    this.squashY = 0.8
    this.squashXZ = 1.16
  }

  /** @param groundY ground under the character (the contact shadow stays on it while airborne). */
  update(x: number, y: number, z: number, facingYaw: number, grounded: boolean, elapsed: number, dt: number, groundY = y, walking = 0) {
    this.group.position.set(x, y, z)
    let diff = facingYaw - this.group.rotation.y
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    this.group.rotation.y += diff * (1 - Math.exp(-14 * dt))

    // Idle stance from the prototype walk cycle at zero speed; airborne pose while jumping.
    const stride = Math.sin(elapsed * 10) * .46 * walking
    this.leftLegPivot.rotation.x = stride
    this.rightLegPivot.rotation.x = -stride
    this.leftKneePivot.rotation.x = grounded ? 0 : -0.38
    this.rightKneePivot.rotation.x = grounded ? 0 : -0.25
    this.leftArmPivot.rotation.set(0, 0, 0.08)
    this.rightArmPivot.rotation.set(0, 0, -0.08)
    this.leftForearmPivot.rotation.x = 0.18
    this.rightForearmPivot.rotation.x = 0.18

    const breath = Math.sin(elapsed * (2.15 + this.weary * 0.9)) * (0.015 + this.weary * 0.01)
    this.ponchoFlap.rotation.x = Math.sin(elapsed * 3.1) * 0.032
    this.hairTailPivot.rotation.x = Math.sin(elapsed * 4.2) * 0.06
    this.hairTipPivot.rotation.x = Math.cos(elapsed * 4.8) * 0.09

    this.squashY = MathUtils.damp(this.squashY, 1, 14, dt)
    this.squashXZ = MathUtils.damp(this.squashXZ, 1, 14, dt)
    this.bodyPivot.position.y = breath - this.crouch * 0.1
    this.bodyPivot.scale.set(this.squashXZ, this.squashY, this.squashXZ)

    // Held poses. Positive x swings a hanging limb forward (-Z); negative x bows the torso/head forward.
    const guard = this.guard
    const crouch = this.crouch
    for (const [hip, knee] of [[this.leftLegPivot, this.leftKneePivot], [this.rightLegPivot, this.rightKneePivot]] as const) {
      hip.rotation.x += crouch * 0.42
      knee.rotation.x -= crouch * 0.8
    }
    this.leftArmPivot.rotation.x = guard * 0.5 - stride * .6
    this.leftForearmPivot.rotation.x = 0.18 + guard * 1.25
    const back = Math.max(0, -this.throwArm)
    const forward = Math.max(0, this.throwArm)
    this.rightArmPivot.rotation.x = guard * 0.6 * (1 - back - forward) - back * 0.95 + forward * 1.35
    this.rightArmPivot.rotation.z = -0.08 - back * 0.25
    this.rightForearmPivot.rotation.x = 0.18 + guard * 1.2 * (1 - back - forward) + back * 0.9 + forward * 0.2
    const lean = -0.06 * guard - 0.16 * crouch - 0.1 * this.weary + 0.08 * back - 0.14 * forward
    this.torsoPivot.rotation.x = MathUtils.damp(this.torsoPivot.rotation.x, lean, 12, dt)
    this.torsoPivot.rotation.y = MathUtils.damp(this.torsoPivot.rotation.y, back * 0.35 - forward * 0.2, 12, dt)
    this.headGroup.rotation.x = MathUtils.damp(this.headGroup.rotation.x, 0.12 * guard + 0.1 * crouch, 10, dt)

    // Contact shadow stays on the ground and fades with height.
    const heightAboveGround = Math.max(0, y - groundY)
    this.shadowMesh.position.y = groundY - y + 0.02
    const shadowFade = 1 / (1 + heightAboveGround * 1.4)
    this.shadowMesh.scale.setScalar(0.6 + 0.4 * shadowFade)
    this.shadowMaterial.opacity = 0.85 * shadowFade
  }
}
