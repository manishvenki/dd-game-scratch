import type { LevelId } from '../game/levels/levelTypes'

declare global {
  interface Window {
    __DD_SWITCH_LEVEL__?: (id: LevelId, force?: boolean) => void
    __DD_TOGGLE_PAUSE__?: () => boolean
    __DD_SET_PAUSED__?: (paused: boolean) => void
    __DD_IS_PAUSED__?: boolean
    __DD_RESTART_LEVEL__?: () => void
  }
}

export {}
