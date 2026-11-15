import {
  BackSide, BufferAttribute, BufferGeometry, Color, CylinderGeometry, DirectionalLight, DodecahedronGeometry,
  DoubleSide, FogExp2, Group, HemisphereLight, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, PlaneGeometry, Points, PointsMaterial, RingGeometry, SphereGeometry,
} from 'three'
import type { Scene } from 'three'
import type { Destination } from '../../app/contracts'
import type { Tracker } from './shading'

/** Fictional sets. These surfaces are not DEMs and do not enter the scientific analysis. */
export const planetHeight = (x: number, z: number) =>
  .12 * Math.sin(x * .34) * Math.cos(z * .28) + .04 * Math.sin(z * .8)

export function createPlanetary(world: Destination, scene: Scene, track: Tracker) {
  const lunar = world === 'moon'
  const group = new Group()
  const mist = lunar ? 0x090f21 : 0x34212b
  scene.background = new Color(mist)
  scene.fog = new FogExp2(mist, .012)
  const hemi = new HemisphereLight(lunar ? 0x829fd0 : 0xc894ad, lunar ? 0x252c48 : 0x603321, 1.4)
  const sun = new DirectionalLight(lunar ? 0xd4e8ff : 0xffc395, 2.5)
  sun.position.set(-22, 20, 14)
  const rim = new DirectionalLight(lunar ? 0x6688dc : 0xbc838f, 1.6)
  rim.position.set(9, 7, -15)
  scene.add(hemi, sun, rim)

  const surface = track.add(new PlaneGeometry(140, 140, 75, 75))
  surface.rotateX(-Math.PI / 2)
  const pos = surface.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const distance = Math.hypot(x, z)
    const mound = Math.max(0, distance - 19) * .13 * (1.3 + Math.sin(Math.atan2(z, x) * 6))
    pos.setY(i, planetHeight(x, z) + mound)
    c.set(lunar ? 0x8991a5 : 0xab654b).multiplyScalar(.82 + .13 * Math.sin(x * .25 + z * .4))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  surface.setAttribute('color', new BufferAttribute(colors, 3))
  surface.computeVertexNormals()
  group.add(new Mesh(surface, track.add(new MeshStandardMaterial({vertexColors:true,roughness:.94,flatShading:true}))))

  const rockGeometry = track.add(new DodecahedronGeometry(1, 0))
  const rockMaterial = track.add(new MeshStandardMaterial({color:lunar?0x727d94:0x854830,roughness:.96,flatShading:true}))
  const rocks = track.add(new InstancedMesh(rockGeometry, rockMaterial, 68))
  const dummy = new Object3D()
  for (let i = 0; i < 68; i++) {
    const angle = i * 2.39996, radius = 9 + (i % 13) * 2.8
    let x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius - 8
    if(Math.abs(x)<7&&z>-16&&z<14)x=(x<0?-1:1)*(10+Math.abs(x))
    const s = .45 + (i % 9) * .32
    dummy.position.set(x, planetHeight(x, z) + s * .35, z)
    dummy.rotation.set(i * .3, angle, .2)
    dummy.scale.set(s * 1.1, s * .8, s)
    dummy.updateMatrix()
    rocks.setMatrixAt(i, dummy.matrix)
  }
  rocks.computeBoundingSphere()
  group.add(rocks)
  const stars = new Float32Array(260 * 3)
  for (let i=0; i<260; i++) {
    const angle = i * 2.39996, h = .1 + (i % 37) / 39
    const d = Math.sqrt(1 - h * h) * 85
    stars.set([Math.cos(angle)*d, h*85, Math.sin(angle)*d], i*3)
  }
  const starGeometry = track.add(new BufferGeometry())
  starGeometry.setAttribute('position', new BufferAttribute(stars,3))
  group.add(new Points(starGeometry,track.add(new PointsMaterial({color:0xdbe6ff,size:.13,sizeAttenuation:true,transparent:true,opacity:lunar?.85:.35}))))

  const actors = new Group()
  actors.position.set(0,0,-11.5)
  group.add(actors)
  const shadowParts: Mesh[]=[]
  if(lunar) {
    const earth = new Mesh(track.add(new SphereGeometry(2.2,24,16)),track.add(new MeshStandardMaterial({color:0x5286a4,emissive:0x132d54,emissiveIntensity:.45,roughness:.9})))
    earth.position.set(18,26,-47)
    group.add(earth)
    const wood = track.add(new MeshStandardMaterial({color:0xae8255,roughness:.9}))
    const figureGeo = track.add(new CylinderGeometry(.22,.38,1.3,6))
    const headGeo = track.add(new DodecahedronGeometry(.25,1))
    for(let i=0; i<3; i++) {
      const x=(i-1)*2.1
      const body=new Mesh(figureGeo,wood)
      body.position.set(x,.7,i%2*.5)
      const head=new Mesh(headGeo,wood)
      head.position.set(x,1.6,i%2*.5)
      actors.add(body,head)
      const shade=new Mesh(track.add(new SphereGeometry(1,12,16)),track.add(new MeshBasicMaterial({color:0x485ec2,transparent:true,opacity:.33,depthWrite:false})))
      shade.position.set(x+.3,2,-.55)
      shade.scale.set(.55,2.1,.24)
      shadowParts.push(shade)
      actors.add(shade)
    }
  } else {
    const stone = track.add(new MeshStandardMaterial({color:0x7c4b45,roughness:.86,flatShading:true}))
    for(const x of [-2.8,2.8]) {
      const pillar=new Mesh(track.add(new CylinderGeometry(.65,.9,7,6)),stone)
      pillar.position.set(x,3.5,0)
      actors.add(pillar)
    }
    const arch=new Mesh(track.add(new CylinderGeometry(.65,.72,6.7,6)),stone)
    arch.rotation.z=Math.PI/2
    arch.position.set(0,7,0)
    actors.add(arch)
    const opening=new Mesh(track.add(new PlaneGeometry(4.5,6.5)),track.add(new MeshBasicMaterial({color:0xa2b7d8,transparent:true,opacity:.13,side:DoubleSide,depthWrite:false})))
    opening.position.set(0,3.2,-.08)
    actors.add(opening)
    const cloth=track.add(new MeshStandardMaterial({color:0xd5d8ef,emissive:0x52638a,emissiveIntensity:.6,roughness:.4}))
    const robe=new Mesh(track.add(new CylinderGeometry(.4,1.1,3.4,8)),cloth)
    robe.position.set(0,1.9,.3)
    const face=new Mesh(track.add(new SphereGeometry(.36,16,12)),cloth)
    face.position.set(0,3.8,.3)
    const crown=new Mesh(track.add(new RingGeometry(.7,.75,48)),track.add(new MeshBasicMaterial({color:0xf8d69f,side:DoubleSide})))
    crown.position.set(0,3.8,.1)
    actors.add(robe,face,crown)
    shadowParts.push(robe)
  }

  return {
    group,
    update(time: number, outcome: 'waiting'|'dodge'|'distract') {
      shadowParts.forEach((mesh,i) => {
        if(lunar) {
          mesh.position.x=(i-1)*2.1+.3+Math.sin(time*.65+i)*.3+(outcome==='distract'?(i-1)*2.5:0)
          mesh.rotation.z=Math.sin(time*.5+i)*.1
          mesh.scale.y=outcome==='dodge'?.8:2.1+Math.sin(time*.8+i)*.15
        } else {mesh.rotation.y=Math.sin(time*.35)*.12;mesh.position.y=outcome==='distract'?2.2:1.9}
      })
    },
    dispose(){hemi.dispose();sun.dispose();rim.dispose()},
  }
}

export function createTrailMarker(track: Tracker, ground: (x:number,z:number)=>number) {
  const marker=new Group()
  const ink=track.add(new MeshBasicMaterial({color:0xf5d28d,side:DoubleSide,transparent:true,opacity:.65,depthWrite:false}))
  const ring=new Mesh(track.add(new RingGeometry(.5,.57,40)),ink)
  ring.rotation.x=-Math.PI/2
  marker.add(ring)
  marker.position.set(2.1,ground(2.1,-5.9)+.05,-5.9)
  const beacon=new Mesh(track.add(new CylinderGeometry(.015,.06,2,8)),track.add(new MeshBasicMaterial({color:0xfad895,transparent:true,opacity:.55,depthWrite:false})))
  beacon.position.y=1
  marker.add(beacon)
  return {group:marker,update(time:number,arrived:boolean){marker.visible=!arrived;ring.scale.setScalar(1+Math.sin(time*2)*.09);ink.opacity=.48+Math.sin(time*2)*.12}}
}
