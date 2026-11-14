import type { Choice, Lang, Story, World } from '../app/contracts'
import { messages } from '../app/i18n'

export type JourneyState = { sceneId: string; answer: Choice | null }

export function renderExperience(
  container: HTMLElement,
  story: Story,
  state: JourneyState,
  lang: Lang,
  actions: { update: (next: JourneyState) => void; openAnalysis: (world: World) => void }
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
  section.append(tag, heading, disclosure, copy)
  if (scene.poison) {
    const poison = document.createElement('p')
    poison.className = 'poison'
    poison.textContent = scene.poison[lang]
    section.append(poison)
  }
  const choices = document.createElement('div')
  choices.className = 'choices'
  if (state.answer) {
    const next = state.answer.next
    choices.append(actionButton(m.next, () => actions.update({ sceneId: next, answer: null })))
  } else {
    for (const choice of scene.choices) {
      choices.append(actionButton(choice.label[lang], () => actions.update(
        choice.feedback ? { sceneId: state.sceneId, answer: choice } : { sceneId: choice.next, answer: null }
      )))
    }
  }
  choices.append(actionButton(m.analysis, () => actions.openAnalysis(scene.world), 'secondary'))
  section.append(choices)
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
