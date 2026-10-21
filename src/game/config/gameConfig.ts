import Phaser from 'phaser'

export interface GameDimensions {
  readonly width: number
  readonly height: number
}

export const DEFAULT_GAME_DIMENSIONS: GameDimensions = {
  width: 800,
  height: 600,
}

/**
 * Factory for base Phaser 3 configuration for DD Game Scratch.
 * Keeps game engine configuration decoupled from React components.
 * 
 * @param parentId The HTML element or ID string where the canvas will be rendered.
 * @returns Phaser.Types.Core.GameConfig
 */
export function createGameConfig(parentId: string | HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: parentId,
    width: DEFAULT_GAME_DIMENSIONS.width,
    height: DEFAULT_GAME_DIMENSIONS.height,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    backgroundColor: '#0f172a',
    scene: [],
  }
}
