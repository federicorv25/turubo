import {ACESFilmicToneMapping,MathUtils,PerspectiveCamera,Plane,Raycaster,Scene,SRGBColorSpace,Vector2,Vector3,WebGLRenderer} from 'three'
import type {GraphicsScene,MountSceneGraphics,SceneGraphics} from '../graphics-contract'
import {createEnvironment,createLighting} from './environment'
import {createPlanetary,createTrailMarker,planetHeight} from './planetary'
import {movePosition,reached,destination} from './navigation'
import {Serpent} from './serpent'
import {Shading,Tracker} from './shading'
import {groundHeightAt,SERPENT_POSITION} from './terrain'
import {Turubo} from './turubo'

const smooth=(t:number,a:number,b:number)=>{const x=MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)}
const pulse=(t:number,a:number,b:number,c:number,d:number)=>smooth(t,a,b)*(1-smooth(t,c,d))
type Outcome='waiting'|'dodge'|'distract'
const outcomeOf=({state,scene}:GraphicsScene):Outcome=>!state.answer?'waiting':scene.choices.findIndex(c=>c.label.en===state.answer?.label.en)===1?'distract':'dodge'
type Parts={
 renderer:WebGLRenderer;scene:Scene;camera:PerspectiveCamera;shading:Shading;turubo:Turubo;serpent?:Serpent
 marker:ReturnType<typeof createTrailMarker>;forest?:ReturnType<typeof createEnvironment>;light?:ReturnType<typeof createLighting>
 planet?:ReturnType<typeof createPlanetary>;ground:(x:number,z:number)=>number;track:Tracker
}
export const mountSceneGraphics:MountSceneGraphics=async(host,initial)=>{
 const canvas=document.createElement('canvas')
 const context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'low-power',failIfMajorPerformanceCaveat:true})
 if(!context)return null
 const track=new Tracker()
 let renderer:WebGLRenderer|undefined
 try{
  renderer=new WebGLRenderer({canvas,context,antialias:true,powerPreference:'low-power'})
  renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.08
  canvas.className='scene-graphics-canvas';canvas.setAttribute('aria-hidden','true')
  const scene=new Scene(),camera=new PerspectiveCamera(47,1,.15,220),shading=new Shading(track)
  const earth=initial.scene.world==='earth',ground=earth?groundHeightAt:planetHeight
  const forest=earth?createEnvironment(shading,track):undefined,light=earth?createLighting(scene):undefined
  const planet=!earth?createPlanetary(initial.scene.world==='moon'?'moon':'mars',scene,track):undefined
  const serpent=earth?new Serpent(shading,track):undefined,turubo=new Turubo(shading,track),marker=createTrailMarker(track,ground)
  turubo.group.scale.setScalar(1.25)
  scene.add(turubo.group,marker.group)
  if(forest)scene.add(forest.group)
  if(planet)scene.add(planet.group)
  if(serpent)scene.add(serpent.group)
  camera.position.set(3,7,14);camera.lookAt(2,1,0)
  renderer.compile(scene,camera)
  return start(host,initial,{renderer,scene,camera,shading,turubo,serpent,marker,forest,light,planet,ground,track})
 }catch{
  track.dispose();renderer?.dispose()
  if(!context.isContextLost())context.getExtension('WEBGL_lose_context')?.loseContext()
  return null
 }
}
function start(host:HTMLElement,initial:GraphicsScene,p:Parts):SceneGraphics{
 const {renderer,scene,camera,shading,turubo,serpent,marker,forest,light,planet,ground,track}=p
 const canvas=renderer.domElement,abort=new AbortController(),opts={signal:abort.signal}
 const motion=matchMedia('(prefers-reduced-motion: reduce)')
 const connection=(navigator as Navigator & {connection?:EventTarget&{saveData?:boolean}}).connection
 const qa=(import.meta.env.DEV||import.meta.env.MODE==='graphics-qa')&&['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('graphics-qa')
 let current=initial,outcome=outcomeOf(initial),reaction=Infinity,time=0,previous=0,frame=0,lastAction=performance.now()
 let visible=false,dead=false,ready=false,dirty=true,auto=false,jump=Infinity,walking=0,facing=0
 let target:Vector3|undefined,pointer:number|undefined,frames:number[]=[],sampleStart=0,measuring=qa
 let pixels=650_000,qualityFrames=0,qualityTime=0
 const keys=new Set<string>(),touch=new Set<string>()
 const pressFrom=new Map<string,{x:number;z:number}>()
 let touchStart:{x:number;z:number;dir:string}|undefined
 const ray=new Raycaster(),plane=new Plane(new Vector3(0,1,0),-.65),hit=new Vector3()
 const position=new Vector3(),focus=new Vector3(),cameraGoal=new Vector3(),figureFrom=new Vector3()
 let thrown=outcome==='distract'
 const active=()=>!dead&&visible&&!document.hidden
 const shell=()=>host.closest<HTMLElement>('.expedition')
 host.append(canvas)
 function notify(){
  host.dataset.reaction=outcome;host.dataset.pose=reaction===Infinity?'settled':'reacting'
  current.onStatus(ready?'ready':'loading',current.exploration.arrived)
 }
 function settle(){
  reaction=Infinity;turubo.holdFigure();thrown=!!serpent&&outcome==='distract'
  if(thrown){scene.attach(turubo.figure);turubo.figure.position.set(-2.3,ground(-2.3,-7.4)+.06,-7.4);turubo.figure.rotation.set(0,.6,Math.PI/2);turubo.figure.scale.setScalar(1.25)}
 }
 settle()
 function wake(){dirty=true;lastAction=performance.now();if(!frame&&active()){previous=0;frame=requestAnimationFrame(loop)}}
 function clearInput(){keys.clear();touch.clear();pressFrom.clear();touchStart=undefined;target=undefined;auto=false;pointer=undefined}
 const movable=()=>!current.exploration.arrived&&outcome==='waiting'
 function nudge(code:string){
  const x=['KeyA','ArrowLeft','left'].includes(code)?-1:['KeyD','ArrowRight','right'].includes(code)?1:0
  const z=['KeyW','ArrowUp','up'].includes(code)?-1:['KeyS','ArrowDown','down'].includes(code)?1:0
  if(x||z){movePosition(current.exploration,x,z,.05,5.5);facing=Math.atan2(-x,-z);wake()}
 }
 function arrive(){
  current.exploration.arrived=true;current.exploration.x=destination.x;current.exploration.z=destination.z
  clearInput();notify();lastAction=performance.now()
 }
 document.addEventListener('keydown',event=>{
  if(!shell()?.contains(document.activeElement)||event.ctrlKey||event.altKey||event.metaKey)return
  if(!['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight'].includes(event.code))return
  if((event.target as HTMLElement).closest('button,a,input,select,textarea'))return
  event.preventDefault()
  if(movable()){
   if(!keys.has(event.code))pressFrom.set(event.code,{x:current.exploration.x,z:current.exploration.z})
   keys.add(event.code);auto=false;target=undefined
   if(event.code==='Space'&&jump===Infinity){jump=0;turubo.triggerJumpSquash()}
  }
  wake()
 },opts)
 document.addEventListener('keyup',e=>{
  const from=pressFrom.get(e.code)
  if(from&&movable()&&Math.hypot(current.exploration.x-from.x,current.exploration.z-from.z)<.025)nudge(e.code)
  keys.delete(e.code);pressFrom.delete(e.code)
 },opts)
 function interruptSample(){if(measuring){frames=[];sampleStart=0}}
 window.addEventListener('blur',()=>{clearInput();interruptSample()},opts)
 window.addEventListener('focus',()=>{if(measuring)wake()},opts)
 document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden){interruptSample();if(frame)cancelAnimationFrame(frame);frame=0}else wake()},opts)
 let tap:{x:number; y:number; id:number}|undefined
 host.addEventListener('pointerdown',event=>{
  if(!movable())return
  tap={x:event.clientX,y:event.clientY,id:event.pointerId}
  if(event.pointerType==='mouse')host.focus({preventScroll:true})
 },opts)
 host.addEventListener('pointercancel',()=>{tap=undefined},opts)
 host.addEventListener('pointerup',event=>{
  const start=tap;tap=undefined
  if(!movable()||!start||start.id!==event.pointerId||Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)return
  host.focus({preventScroll:true})
  const rect=canvas.getBoundingClientRect()
  ray.setFromCamera(new Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera)
  if(ray.ray.intersectPlane(plane,hit)){target=hit.clone();target.x=MathUtils.clamp(target.x,-4.2,6.2);target.z=MathUtils.clamp(target.z,-6.5,9);auto=false;wake()}
 },opts)
 document.addEventListener('pointerdown',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-walk]')
  if(!button||!shell()?.contains(button)||!movable())return
  event.preventDefault();button.setPointerCapture(event.pointerId);pointer=event.pointerId
  touchStart={x:current.exploration.x,z:current.exploration.z,dir:button.dataset.walk!}
  touch.add(button.dataset.walk!);auto=false;target=undefined;wake()
 },opts)
 const releaseTouch=(e:PointerEvent)=>{if(e.pointerId===pointer){
  if(e.type==='pointerup'&&touchStart&&movable()&&Math.hypot(current.exploration.x-touchStart.x,current.exploration.z-touchStart.z)<.025)nudge(touchStart.dir)
  touch.clear();pointer=undefined;touchStart=undefined
 }}
 document.addEventListener('pointerup',releaseTouch,opts);document.addEventListener('pointercancel',releaseTouch,opts);document.addEventListener('lostpointercapture',releaseTouch,opts)
 document.addEventListener('click',event=>{
  const step=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-walk]')
  if(step&&shell()?.contains(step)&&movable()&&event.detail===0){
   const dir=step.dataset.walk,dx=dir==='left'?-1:dir==='right'?1:0,dz=dir==='up'?-1:dir==='down'?1:0
   movePosition(current.exploration,dx,dz,.05,12);wake()
  }
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-autowalk]')
  if(!button||!shell()?.contains(button)||!movable())return
  auto=true;target=undefined;keys.clear();touch.clear();host.focus({preventScroll:true});wake()
 },opts)
 function move(dt:number){
  walking=0
  if(!movable())return
  let x=(keys.has('KeyD')||keys.has('ArrowRight')||touch.has('right')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')||touch.has('left')?1:0)
  let z=(keys.has('KeyS')||keys.has('ArrowDown')||touch.has('down')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')||touch.has('up')?1:0)
  const goal=auto?destination:target
  if(goal){x=goal.x-current.exploration.x;z=goal.z-current.exploration.z;if(Math.hypot(x,z)<.2){target=undefined;x=0;z=0}}
  const moved=movePosition(current.exploration,x,z,dt,keys.has('ShiftLeft')?4.6:3.4)
  if(moved>.0001){walking=1;facing=Math.atan2(-x,-z);lastAction=performance.now()}
  if(reached(current.exploration))arrive()
 }
 let previousProgress=-1,meter=shell()?.querySelector<HTMLProgressElement>('.approach-progress')
 function step(dt:number){
  time+=dt;move(dt)
  if(jump!==Infinity){jump+=dt;if(jump>.65){jump=Infinity;turubo.triggerLandSquash()}}
  if(reaction!==Infinity){reaction+=dt;if(reaction>3){reaction=Infinity;notify()}}
  const responding=reaction!==Infinity,t=reaction,answered=outcome!=='waiting'
  let x=current.exploration.x,z=current.exploration.z,hop=jump===Infinity?0:Math.sin(jump/.65*Math.PI)*.8
  turubo.guard=answered?.25:current.exploration.arrived?1:.05
  turubo.crouch=0;turubo.throwArm=0;turubo.weary=serpent?.3:.5
  if(serpent){
   serpent.rise=0;serpent.strike=0;serpent.alert=current.exploration.arrived?1:.45;serpent.subdued=answered&&!responding?1:0
   serpent.lookTarget.set(x,ground(x,z)+1.6,z)
   if(outcome==='dodge'){
    const shift=responding?smooth(t,.5,.82):1
    x-=1.25*shift;z-=.25*shift
    if(responding){
     serpent.rise=pulse(t,0,.25,.45,.6);serpent.strike=pulse(t,.42,.66,.8,1.2);serpent.subdued=smooth(t,1.1,1.9)
     turubo.crouch=pulse(t,.15,.42,.48,.56);hop=Math.sin(Math.PI*smooth(t,.5,.82))*.42
    }
   }
   if(outcome==='distract'){
    if(responding){
     turubo.throwArm=-pulse(t,0,.32,.4,.5)+pulse(t,.42,.55,.68,1)
     serpent.rise=pulse(t,.95,1.08,1.15,1.25);serpent.strike=pulse(t,1.15,1.38,1.48,1.8);serpent.subdued=smooth(t,1.65,2.5)
     if(!thrown&&t>=.52){thrown=true;turubo.figure.getWorldPosition(figureFrom);scene.attach(turubo.figure)}
     if(thrown){
      const flight=smooth(t,.52,1.2)
      turubo.figure.position.lerpVectors(figureFrom,position.set(-2.3,ground(-2.3,-7.4)+.06,-7.4),flight)
      turubo.figure.position.y+=Math.sin(Math.PI*flight)*1.1;turubo.figure.rotation.set(0,.6,Math.PI/2*flight);turubo.figure.scale.setScalar(1.25)
     }
    }
    if(thrown)serpent.lookTarget.copy(turubo.figure.position)
   }
   serpent.update(time,dt)
  }
  if(!serpent&&answered){
   if(outcome==='distract')z-=responding?smooth(t,0,2)*1.7:1.7
   else turubo.throwArm=.65*(responding?smooth(t,0,1):1)
   if(current.scene.world==='mars'){turubo.weary=1;turubo.crouch=responding?smooth(t,1,3)*.7:.7}
  }
  if(current.exploration.arrived)facing=Math.atan2(-(SERPENT_POSITION.x-x),-(SERPENT_POSITION.z-z))
  turubo.update(x,ground(x,z)+hop,z,facing,hop<.02,time,dt,ground(x,z),walking)
  shading.update(time);light?.update(time,serpent?.alert??0);planet?.update(time,outcome);marker.update(time,current.exploration.arrived)
  if(current.exploration.arrived){
   if(current.scene.world==='mars'){cameraGoal.set(9.8,ground(x,z)+4.5,.7);focus.set(-.2,3,-9.6)}
   else{cameraGoal.set(7.6,ground(x,z)+3.5,-1.9);focus.set(-.2,2,-9.1)}
  }
  else{cameraGoal.set(x+1.5,ground(x,z)+4.1,z+7.8);focus.set(x,ground(x,z)+1.7,z-2)}
  camera.position.lerp(cameraGoal,1-Math.exp(-3*dt));camera.lookAt(focus)
  forest?.update(camera.position.x,camera.position.y,camera.position.z)
  const progress=current.exploration.arrived?100:Math.round(MathUtils.clamp(1-Math.hypot(x-destination.x,z-destination.z)/11.9,0,1)*100)
  if(meter&&progress!==previousProgress){meter.value=progress;previousProgress=progress}
  if(qa)host.dataset.position=JSON.stringify({x:current.exploration.x,z:current.exploration.z,arrived:current.exploration.arrived})
 }
 function sample(now:number){
  if(!document.hasFocus()||document.hidden){interruptSample();return}
  if(!sampleStart)sampleStart=now
  frames.push(now)
  if(now-sampleStart<30000)return
  const gaps=frames.slice(1).map((n,i)=>n-frames[i]).sort((a,b)=>a-b)
  host.dataset.graphicsPerformance=JSON.stringify({durationMs:Math.round(now-sampleStart),frames:gaps.length,fps:Math.round(gaps.length*10000/(now-sampleStart))/10,p95ms:Math.round(gaps[Math.floor(gaps.length*.95)]*10)/10,longFrames:gaps.filter(n=>n>34).length,drawCalls:renderer.info.render.calls,size:[canvas.width,canvas.height],viewport:[innerWidth,innerHeight],pixelBudget:pixels})
  measuring=false;frames=[];sampleStart=0
 }
 function loop(now:number){
  frame=0
  if(!active())return
  if(!measuring&&!dirty&&!keys.size&&!touch.size&&!auto&&!target&&reaction===Infinity&&jump===Infinity&&now-lastAction>5000)return
  const gap=previous?now-previous:0
  const dt=previous?Math.min(.05,gap/1000):1/60
  // Two modest reductions on integrated/mobile GPUs; do not count tab suspensions or
  // resize repeatedly. Text, controls and scientific maps always retain native resolution.
  if(gap>0&&gap<120&&document.hasFocus()){
   qualityFrames++;qualityTime+=gap
   if(qualityFrames>=90){
    if(qualityTime/qualityFrames>22&&pixels>400_000){pixels=pixels===650_000?500_000:400_000;resize(false)}
    qualityFrames=0;qualityTime=0
   }
  }
  previous=now;step(dt);renderer.render(scene,camera);dirty=false
  if(!ready){ready=true;host.dataset.state='ready';notify()}
  if(measuring)sample(now)
  frame=requestAnimationFrame(loop)
 }
 function resize(schedule=true){
  const {width,height}=host.getBoundingClientRect()
  if(width<2||height<2)return
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1:1.25,Math.max(.55,Math.sqrt(pixels/(width*height)))))
  renderer.setSize(width,height,false)
  camera.aspect=width/height;camera.fov=camera.aspect<1?57:47;camera.updateProjectionMatrix();if(schedule)wake()
 }
 const resizeObserver=new ResizeObserver(()=>resize())
 const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){clearInput();interruptSample();if(frame)cancelAnimationFrame(frame);frame=0}else wake()})
 if(qa)host.addEventListener('turubo-game-benchmark',()=>{measuring=true;interruptSample();delete host.dataset.graphicsPerformance;wake()},opts)
 resizeObserver.observe(host);visibility.observe(host)
 function teardown(){
  if(dead)return
  dead=true;abort.abort();clearInput();if(frame)cancelAnimationFrame(frame)
  resizeObserver.disconnect();visibility.disconnect();track.dispose();light?.dispose();planet?.dispose();renderer.dispose()
  if(!renderer.getContext().isContextLost())renderer.forceContextLoss()
  canvas.remove()
 }
 function fallback(){teardown();host.dataset.state='fallback';current.onStatus('fallback',true)}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()},opts)
 const preferences=()=>{if(motion.matches||connection?.saveData)fallback()}
 motion.addEventListener('change',preferences,opts);connection?.addEventListener('change',preferences,opts)
 if(current.state.answer)current.exploration.arrived=true
 notify();resize()
 return {
  update(next){
   if(dead){next.onStatus('fallback',true);return}
   const nextOutcome=outcomeOf(next),wasWaiting=outcome==='waiting'
   current=next;meter=shell()?.querySelector<HTMLProgressElement>('.approach-progress');previousProgress=-1
   if(next.state.answer&&!current.exploration.arrived){
    current.exploration.arrived=true;current.exploration.x=destination.x;current.exploration.z=destination.z
   }
   if(nextOutcome!==outcome){outcome=nextOutcome;if(wasWaiting&&outcome!=='waiting'){reaction=0;thrown=false;turubo.holdFigure()}else settle()}
   notify();wake()
  },
  dispose:teardown,
 }
}
