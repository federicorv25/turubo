import type {Story} from '../app/contracts'
import type {JourneyState} from './index'
export type Exploration={x:number;z:number;arrived:boolean}
type Save={version:1;scene:string;answer:number;positions:Record<string,Exploration>}
const key='turubo.adventure.v1'
export function restoreAdventure(story:Story){
 const fallback={journey:{sceneId:story.order[0],answer:null} as JourneyState,positions:new Map<string,Exploration>(),started:false}
 try{
  const raw=JSON.parse(sessionStorage.getItem(key)??'null') as Save|null
  if(!raw||raw.version!==1||!story.order.includes(raw.scene)||!Number.isInteger(raw.answer))return fallback
  const scene=story.scenes[raw.scene],answer=raw.answer===-1?null:scene.choices[raw.answer]
  if(raw.answer!==-1&&(!answer||!answer.feedback))return fallback
  const positions=new Map<string,Exploration>()
  for(const [id,position] of Object.entries(raw.positions??{})){
   if(!['earth','moon','mars'].includes(id)||!position||!Number.isFinite(position.x)||!Number.isFinite(position.z)||typeof position.arrived!=='boolean')continue
   positions.set(id,{x:Math.max(-4.2,Math.min(6.2,position.x)),z:Math.max(-6.5,Math.min(9,position.z)),arrived:position.arrived})
  }
  return {journey:{sceneId:raw.scene,answer},positions,started:raw.scene!=='prologue'}
 }catch{return fallback}
}
export function saveAdventure(story:Story,journey:JourneyState,positions:Map<string,Exploration>){
 try{
  const value:Save={version:1,scene:journey.sceneId,answer:journey.answer?story.scenes[journey.sceneId].choices.indexOf(journey.answer):-1,positions:Object.fromEntries(positions)}
  sessionStorage.setItem(key,JSON.stringify(value))
 }catch{/* Storage availability does not block play. */}
}
