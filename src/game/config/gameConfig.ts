import Phaser from 'phaser'

export interface GameDimensions {
  readonly width: number
  readonly height: number
}

export const DEFAULT_GAME_DIMENSIONS: GameDimensions = {
  width: 960,
  height: 540,
}

/**
 * Creates the base Phaser 3 configuration for DD Game Scratch.
 * Keeps game engine configuration decoupled from React UI components.
 *
 * @param parent The DOM element or ID string where the canvas will be rendered.
 * @param scenes The array of Scene classes or instances to load into the game.
 * @returns Phaser.Types.Core.GameConfig
 */
export function createGameConfig(
  parent: string | HTMLElement,
  scenes: Phaser.Types.Scenes.SceneType[] = []
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: DEFAULT_GAME_DIMENSIONS.width,
    height: DEFAULT_GAME_DIMENSIONS.height,
    backgroundColor: '#090d16',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: DEFAULT_GAME_DIMENSIONS.width,
      height: DEFAULT_GAME_DIMENSIONS.height,
    },
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: true,
    },
    scene: scenes,
  }
}
