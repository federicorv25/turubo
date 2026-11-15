export type Position={x:number;z:number}
export const destination={x:2.1,z:-5.9}
export const reached=(p:Position)=>Math.hypot(p.x-destination.x,p.z-destination.z)<1.15
/** Bound the stage and normalize diagonal movement; dt is capped after tab suspension. */
export function movePosition(p:Position,dx:number,dz:number,dt:number,speed=3.4){
 const length=Math.hypot(dx,dz)
 if(length<.001)return 0
 const amount=speed*Math.min(.05,Math.max(0,dt))/Math.max(1,length)
 const x=Math.min(6.2,Math.max(-4.2,p.x+dx*amount)),z=Math.min(9,Math.max(-6.5,p.z+dz*amount))
 const moved=Math.hypot(x-p.x,z-p.z)
 p.x=x;p.z=z
 return moved
}
