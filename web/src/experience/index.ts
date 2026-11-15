import type { Choice, Lang, Story, World } from '../app/contracts'
import { messages } from '../app/i18n'

export type JourneyState = { sceneId: string; answer: Choice | null }

export function renderExperience(
  container: HTMLElement,
  story: Story,
  state: JourneyState,
  lang: Lang,
  actions: { update: (next: JourneyState) => void; openAnalysis: (world: World) => void; analysisLabel?: string }
) {
  const m = messages[lang]
  const scene = story.scenes[state.sceneId]
  const chapter = story.order.indexOf(state.sceneId) + 1
  const section = document.createElement('section')
  section.className = 'chapter'
  section.dataset.world = scene.world
  const heading = document.createElement('h1')
  heading.tabIndex = -1
  heading.textContent = scene.title[lang]
  const tag = document.createElement('p')
  tag.className = 'eyebrow'
  tag.textContent = `${m.fiction} · ${m[scene.world]} · ${chapter}/${story.order.length}`
  const disclosure = document.createElement('p')
  disclosure.className = 'notice'
  disclosure.textContent = story.disclosure[lang]
  const copy = document.createElement('p')
  copy.className = 'story-copy'
  copy.textContent = state.answer?.feedback?.[lang] ?? scene.text[lang]
  const narrative=document.createElement('div')
  narrative.className='chapter-narrative'
  const actionsPane=document.createElement('div')
  actionsPane.className='chapter-actions'
  narrative.append(tag,heading,copy)
  section.append(narrative,actionsPane)
  if (scene.poison) {
    const poison = document.createElement('p')
    poison.className = 'poison'
    poison.textContent = scene.poison[lang]
    narrative.append(poison)
  }
  const choices = document.createElement('div')
  choices.className = 'choices decision-choices'
  if (state.answer) {
    const next = state.answer.next
    const nextLabel=next==='moon'?(lang==='es'?'Partir hacia la Luna':'Travel to the Moon'):next==='mars'?(lang==='es'?'Partir hacia Marte':'Travel to Mars'):next==='epilogue'?(lang==='es'?'Descubrir el final':'Discover the ending'):m.next
    choices.append(actionButton(nextLabel, () => actions.update({ sceneId: next, answer: null })))
    if (['earth','moon','mars'].includes(state.sceneId)) {
      choices.append(actionButton(lang === 'es' ? 'Volver a elegir' : 'Choose again',
        () => actions.update({ sceneId: state.sceneId, answer: null }), 'secondary'))
    }
  } else {
    for (const choice of scene.choices) {
      choices.append(actionButton(choice.label[lang], () => actions.update(
        choice.feedback ? { sceneId: state.sceneId, answer: choice } : { sceneId: choice.next, answer: null }
      )))
    }
  }
  const prompt=document.createElement('p')
  prompt.className='decision-prompt'
  prompt.textContent=lang==='es'?(state.answer?'TU DECISIÓN CAMBIA LA ESCENA':'¿CÓMO VAS A SEGUIR?'):(state.answer?'YOUR CHOICE CHANGES THE SCENE':'HOW WILL YOU CONTINUE?')
  if(state.sceneId==='prologue')prompt.textContent=lang==='es'?'CAMINA · DECIDE · DESCUBRE':'WALK · CHOOSE · DISCOVER'
  const note=document.createElement('p')
  note.className='approach-note'
  note.textContent=lang==='es'?'Acércate a la luz para tomar tu decisión. También puedes usar «Guíame al encuentro».':'Reach the light to make your choice. You can also use “Guide me to the encounter”.'
  if(['earth','moon','mars'].includes(state.sceneId)&&!state.answer)actionsPane.append(note)
  actionsPane.append(prompt,choices)
  const dataLink=actionButton(actions.analysisLabel??m.analysis,()=>actions.openAnalysis(scene.world),'story-data-link')
  actionsPane.append(dataLink,disclosure)
  container.replaceChildren(section)
}

function actionButton(title: string, handler: () => void, className = 'primary') {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.textContent = title
  button.addEventListener('click', handler)
  return button
}
