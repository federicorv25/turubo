import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {movePosition,reached} from '../src/experience/graphics/navigation.ts'
import {saveAdventure,restoreAdventure} from '../src/experience/save.ts'

const position={x:2.1,z:6}
for(let i=0;i<240&&!reached(position);i++)movePosition(position,0,-1,1/60)
assert.ok(reached(position),'Walking forward for four seconds must reach the encounter')
const straight={x:0,z:0},diagonal={x:0,z:0}
movePosition(straight,1,0,1/60)
movePosition(diagonal,1,1,1/60)
assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-straight.x)<1e-8,'Diagonal movement must not be faster')
const suspended={x:0,z:0}
movePosition(suspended,1,0,60)
assert.ok(suspended.x<.2,'A suspended tab must not teleport the player')
const boundary={x:0,z:0}
for(let i=0;i<400;i++)movePosition(boundary,1,-1,.05)
assert.ok(boundary.x<=6.2&&boundary.z>=-6.5,'The player must stay within the stage')

const stored=new Map()
Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)}})
const story=JSON.parse(await readFile(new URL('../../content/story.json',import.meta.url),'utf8'))
const answer=story.scenes.earth.choices[1]
saveAdventure(story,{sceneId:'earth',answer},new Map([['earth',{x:2.1,z:-5.9,arrived:true}]]))
let restored=restoreAdventure(story)
assert.equal(restored.journey.answer,answer,'Restore the actual reviewed story choice')
assert.equal(restored.positions.get('earth').arrived,true)
assert.equal(restored.started,true)
stored.set('turubo.adventure.v1','{"version":1,"scene":"unknown","answer":0}')
assert.equal(restoreAdventure(story).journey.sceneId,'prologue','Unknown scene must not break boot')
stored.set('turubo.adventure.v1','{"version":1,"scene":"earth","answer":57}')
assert.equal(restoreAdventure(story).started,false,'An invalid answer must not skip a chapter')
stored.set('turubo.adventure.v1','{')
assert.equal(restoreAdventure(story).journey.sceneId,'prologue')
Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get(){throw new Error('Storage blocked')}})
assert.doesNotThrow(()=>saveAdventure(story,{sceneId:'prologue',answer:null},new Map()))
assert.equal(restoreAdventure(story).journey.sceneId,'prologue')
console.log('Exploration: reachability, movement bounds, tab suspension and saved-state recovery checked.')
