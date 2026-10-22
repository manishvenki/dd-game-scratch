import Phaser from 'phaser'
import {
  type CharacterAnimationState,
  canPlayAnimation,
} from '../systems/characterAnimations'
import {
  getCharacterMetadata,
  type CharacterMetadata,
} from '../data/characterRegistry'
import { GAME_FONTS } from '../config/typography'

export interface ChaserConfig {
  readonly x: number
  readonly y: number
  readonly chaserId: 'manish' | 'sathish' | 'rahul'
  readonly textureKey?: string
  readonly idlePhaseOffsetMs?: number
}

/**
 * Base Chaser Entity for DD Game Scratch.
 *
 * Implements shared lifecycle, rendering pipeline, and animation interface for pursuer characters.
 * Subclasses implement specific clothing colors, hairstyles, and defining physical characteristics.
 */
export abstract class Chaser extends Phaser.GameObjects.Container {
  public readonly chaserId: 'manish' | 'sathish' | 'rahul'
  public readonly metadata: CharacterMetadata

  protected currentAnimState: CharacterAnimationState = 'idle'
  protected productionSprite?: Phaser.GameObjects.Sprite
  protected placeholderGraphics?: Phaser.GameObjects.Graphics
  protected shadowGraphics?: Phaser.GameObjects.Graphics
  protected badgeContainer?: Phaser.GameObjects.Container
  protected idleTween?: Phaser.Tweens.Tween

  // Standard entity proportions matching Dennis
  public readonly characterWidth = 44
  public readonly characterHeight = 84

  constructor(scene: Phaser.Scene, config: ChaserConfig) {
    super(scene, config.x, config.y)
    this.chaserId = config.chaserId
    this.metadata = getCharacterMetadata(config.chaserId)

    // Add to scene display list
    scene.add.existing(this)

    // Setup visual components
    this.setupVisuals(config.textureKey)

    // Setup procedural idle breathing with phase offset
    this.setupIdlePresentation(config.idlePhaseOffsetMs ?? 0)

    // Ensure cleanup hook on scene shutdown
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this)
  }

  /**
   * Initializes either the production sprite or the color-blocked anime placeholder.
   */
  private setupVisuals(textureKey?: string): void {
    const hasProductionTexture = textureKey ? this.scene.textures.exists(textureKey) : false

    if (hasProductionTexture && textureKey) {
      this.productionSprite = this.scene.add.sprite(0, 0, textureKey)
      this.productionSprite.setOrigin(0.5, 1)
      this.add(this.productionSprite)
    } else {
      this.createPlaceholderGraphics()
    }
  }

  /**
   * Common structure for placeholder rendering.
   */
  private createPlaceholderGraphics(): void {
    // 1. Soft Ground Contact Shadow
    this.shadowGraphics = this.scene.add.graphics()
    this.shadowGraphics.fillStyle(0x000000, 0.35)
    this.shadowGraphics.fillEllipse(0, 2, 44, 12)
    this.add(this.shadowGraphics)

    // 2. Character Body Graphics (Feet at y: 0)
    this.placeholderGraphics = this.scene.add.graphics()
    const g = this.placeholderGraphics

    // A. Common Shoes (y: -6 to 0)
    g.fillStyle(0x0f172a, 1)
    g.fillRoundedRect(-16, -6, 14, 6, 2)
    g.fillRoundedRect(2, -6, 14, 6, 2)

    // B. Call subclass to render character-specific clothing, features, and hair
    this.renderCharacterFeatures(g)

    this.add(this.placeholderGraphics)

    // 3. Small Identification Badge underneath
    this.createBadge()
  }

  /**
   * Subclasses override this method to render their unique clothing, hair, and distinct accessories.
   */
  protected abstract renderCharacterFeatures(g: Phaser.GameObjects.Graphics): void

  /**
   * Creates a compact identification badge underneath the character.
   */
  private createBadge(): void {
    const badgeBg = this.scene.add.graphics()
    badgeBg.fillStyle(0x0f172a, 0.85)
    badgeBg.lineStyle(1, this.metadata.accentColorHex, 0.6)
    const badgeW = 76
    const badgeH = 16
    badgeBg.fillRoundedRect(-badgeW / 2, 8, badgeW, badgeH, 3)
    badgeBg.strokeRoundedRect(-badgeW / 2, 8, badgeW, badgeH, 3)

    const badgeText = this.scene.add.text(0, 16, this.metadata.badgeLabel, {
      fontFamily: GAME_FONTS.heading,
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#e2e8f0',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.badgeContainer = this.scene.add.container(0, 0, [badgeBg, badgeText])
    this.add(this.badgeContainer)
  }

  /**
   * Sets up a gentle breathing/idle bob with phase offset.
   */
  private setupIdlePresentation(delayMs: number): void {
    if (this.placeholderGraphics) {
      this.idleTween = this.scene.tweens.add({
        targets: this.placeholderGraphics,
        scaleY: 1.025,
        scaleX: 0.985,
        duration: 1200,
        delay: delayMs,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  /**
   * Controls the active character animation state.
   */
  public playAnimation(state: CharacterAnimationState): void {
    this.currentAnimState = state

    if (this.productionSprite) {
      const animKey = `${this.chaserId}_anim_${state}`
      if (canPlayAnimation(this.scene.anims, animKey)) {
        this.productionSprite.play(animKey, true)
      }
    }
  }

  public getCurrentAnimation(): CharacterAnimationState {
    return this.currentAnimState
  }

  public isPhysicsEnabled(): boolean {
    return Boolean(this.body)
  }

  public setFacingDirection(direction: 1 | -1): void {
    if (this.placeholderGraphics) {
      this.placeholderGraphics.setScale(direction, 1)
    }
    if (this.productionSprite) {
      this.productionSprite.setFlipX(direction === -1)
    }
  }

  private handleSceneShutdown(): void {
    this.destroy()
  }

  public override destroy(fromScene?: boolean): void {
    if (this.idleTween) {
      this.idleTween.stop()
      this.idleTween.remove()
      this.idleTween = undefined
    }

    super.destroy(fromScene)
  }
}
