import Phaser from 'phaser'

/**
 * Standard animation states supported across the DD Game Scratch character system.
 */
export type CharacterAnimationState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'hit'

/**
 * Animation key mapping for Dennis.
 */
export const DENNIS_ANIM_KEYS: Record<CharacterAnimationState, string> = {
  idle: 'dennis_anim_idle',
  run: 'dennis_anim_run',
  jump: 'dennis_anim_jump',
  fall: 'dennis_anim_fall',
  attack: 'dennis_anim_attack',
  hit: 'dennis_anim_hit',
} as const

/**
 * Expected spritesheet frame conventions for future production assets.
 */
export interface SpriteSheetAnimationConfig {
  readonly state: CharacterAnimationState
  readonly key: string
  readonly startFrame: number
  readonly endFrame: number
  readonly frameRate: number
  readonly repeat: number // -1 for loop, 0 for play-once
}

export const PLANNED_DENNIS_ANIMATIONS: readonly SpriteSheetAnimationConfig[] = [
  { state: 'idle', key: DENNIS_ANIM_KEYS.idle, startFrame: 0, endFrame: 3, frameRate: 6, repeat: -1 },
  { state: 'run', key: DENNIS_ANIM_KEYS.run, startFrame: 4, endFrame: 11, frameRate: 12, repeat: -1 },
  { state: 'jump', key: DENNIS_ANIM_KEYS.jump, startFrame: 12, endFrame: 14, frameRate: 8, repeat: 0 },
  { state: 'fall', key: DENNIS_ANIM_KEYS.fall, startFrame: 15, endFrame: 16, frameRate: 8, repeat: -1 },
  { state: 'attack', key: DENNIS_ANIM_KEYS.attack, startFrame: 17, endFrame: 20, frameRate: 12, repeat: 0 },
  { state: 'hit', key: DENNIS_ANIM_KEYS.hit, startFrame: 21, endFrame: 23, frameRate: 8, repeat: 0 },
] as const

/**
 * Registers character animations in Phaser's AnimationManager if valid texture frames exist.
 *
 * Prevents runtime exceptions by verifying texture existence and frame count before registration.
 *
 * @param scene The active Phaser Scene providing access to anims and textures
 * @param textureKey The texture key to check in the TextureManager
 * @returns Array of registered animation keys
 */
export function registerDennisAnimations(
  scene: Phaser.Scene,
  textureKey: string
): string[] {
  const registeredKeys: string[] = []

  // Check if texture exists in TextureManager
  if (!scene.textures.exists(textureKey)) {
    // Texture not yet loaded; gracefully exit without throwing
    return registeredKeys
  }

  const texture = scene.textures.get(textureKey)
  const totalFrames = texture.frameTotal

  for (const config of PLANNED_DENNIS_ANIMATIONS) {
    // Only register if the texture contains the required frame range
    if (totalFrames > config.endFrame) {
      if (!scene.anims.exists(config.key)) {
        scene.anims.create({
          key: config.key,
          frames: scene.anims.generateFrameNumbers(textureKey, {
            start: config.startFrame,
            end: config.endFrame,
          }),
          frameRate: config.frameRate,
          repeat: config.repeat,
        })
        registeredKeys.push(config.key)
      }
    }
  }

  return registeredKeys
}

/**
 * Checks whether an animation key can be safely played in the given scene.
 */
export function canPlayAnimation(anims: Phaser.Animations.AnimationManager, key: string): boolean {
  return anims.exists(key)
}
