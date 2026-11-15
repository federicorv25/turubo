import type { Lang, Scene } from '../app/contracts'
import type { JourneyState } from './index'

export interface GraphicsScene {
  scene: Scene
  state: JourneyState
  language: Lang
  exploration: { x: number; z: number; arrived: boolean }
  onStatus: (status: 'loading' | 'ready' | 'fallback', arrived: boolean) => void
}

/** The shell owns story state and actions. A graphic observes that state. */
export interface SceneGraphics {
  update(next: GraphicsScene): void
  dispose(): void
}

/** Only import a verified implementation from the play route, after drawing its 2D fallback. */
export type MountSceneGraphics = (host: HTMLElement, initial: GraphicsScene) => Promise<SceneGraphics | null>
