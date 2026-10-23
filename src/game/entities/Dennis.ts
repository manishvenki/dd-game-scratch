import Phaser from 'phaser'
import {
  type CharacterAnimationState,
  DENNIS_ANIM_KEYS,
  canPlayAnimation,
} from '../systems/characterAnimations'
import { GAME_FONTS } from '../config/typography'

export interface DennisConfig {
  readonly x: number
  readonly y: number
  readonly textureKey?: string
}

/**
 * Dennis - The lead protagonist entity for DD Game Scratch.
 *
 * Implements a decoupled Phaser container with modular visual presentation:
 * - If production sprite textures are loaded, displays animated sprite.
 * - Otherwise, renders a clean, anime-styled vector silhouette with confirmed clothing-color blocks:
 *   (Curly dark hair, blue denim shirt, blue jeans).
 * - Prepares typed interfaces for physics synchronization, facing direction, and animation states.
 */
export class Dennis extends Phaser.GameObjects.Container {
  public static readonly ENTITY_NAME = 'Dennis'

  private currentAnimState: CharacterAnimationState = 'idle'
  private facingDirection: 1 | -1 = 1
  private productionSprite?: Phaser.GameObjects.Sprite
  private placeholderGraphics?: Phaser.GameObjects.Graphics
  private shadowGraphics?: Phaser.GameObjects.Graphics
  private badgeContainer?: Phaser.GameObjects.Container
  private idleTween?: Phaser.Tweens.Tween

  // Entity dimensions - Scaled up for prominent protagonist visibility (~1.38x)
  public readonly characterWidth = 60
  public readonly characterHeight = 116

  constructor(scene: Phaser.Scene, config: DennisConfig) {
    super(scene, config.x, config.y)

    // Add container to scene display list and update list
    scene.add.existing(this)

    // Setup visual components
    this.setupVisuals(config.textureKey)

    // Setup procedural idle breathing presentation
    this.setupIdlePresentation()

    // Ensure cleanup hook on scene shutdown
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this)
  }

  /**
   * Initializes either the production sprite or the color-blocked anime placeholder.
   */
  private setupVisuals(textureKey?: string): void {
    const hasProductionTexture = textureKey ? this.scene.textures.exists(textureKey) : false

    if (hasProductionTexture && textureKey) {
      // Production Sprite Implementation
      this.productionSprite = this.scene.add.sprite(0, 0, textureKey)
      this.productionSprite.setOrigin(0.5, 1)
      this.productionSprite.setScale(1.38)
      this.add(this.productionSprite)
    } else {
      // Anime-inspired vector silhouette with confirmed clothing attributes
      this.createPlaceholderGraphics()
    }
  }

  /**
   * Constructs the clean anime-inspired placeholder silhouette.
   * Visual attributes:
   * - Curly dark hair
   * - Blue denim shirt (#2563eb)
   * - Blue jeans (#1e3a8a)
   * - Restrained skin tone (#fed7aa) and ground shadow
   */
  private createPlaceholderGraphics(): void {
    // 1. Soft Ground Contact Shadow (enlarged to match 60px base width)
    this.shadowGraphics = this.scene.add.graphics()
    this.shadowGraphics.fillStyle(0x000000, 0.35)
    this.shadowGraphics.fillEllipse(0, 3, 60, 16)
    this.add(this.shadowGraphics)

    // 2. Character Body Graphics (Origin at bottom center, feet at y: 0)
    this.placeholderGraphics = this.scene.add.graphics()
    const g = this.placeholderGraphics

    // A. Shoes / Sneakers (y: -8 to 0)
    g.fillStyle(0x0f172a, 1)
    g.fillRoundedRect(-22, -8, 19, 8, 3)
    g.fillRoundedRect(3, -8, 19, 8, 3)

    // B. Blue Jeans (y: -50 to -8)
    g.fillStyle(0x1e3a8a, 1) // Deep blue denim
    g.fillRoundedRect(-19, -50, 16, 43, 3) // Left leg
    g.fillRoundedRect(3, -50, 16, 43, 3) // Right leg
    // Belt / Waistband line
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-20, -53, 40, 4)

    // C. Blue Denim Shirt / Torso (y: -86 to -53)
    g.fillStyle(0x2563eb, 1) // Vivid blue denim
    g.fillRoundedRect(-20, -86, 40, 34, 4)
    // Shirt Collar & Placket Accent
    g.lineStyle(2, 0x1d4ed8, 1)
    g.lineBetween(0, -86, 0, -58)
    // Denim pocket accents
    g.fillStyle(0x1d4ed8, 0.85)
    g.fillRect(-15, -78, 10, 8)
    g.fillRect(5, -78, 10, 8)

    // D. Arms & Sleeves (y: -83 to -58)
    g.fillStyle(0x2563eb, 1) // Denim sleeves
    g.fillRoundedRect(-26, -83, 7, 25, 3)
    g.fillRoundedRect(19, -83, 7, 25, 3)
    // Hands (skin tone)
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-22.5, -55, 3.5)
    g.fillCircle(22.5, -55, 3.5)

    // E. Neck & Head (y: -108 to -86)
    g.fillStyle(0xfed7aa, 1) // Anime skin tone
    g.fillRect(-6, -89, 12, 6) // Neck
    g.fillRoundedRect(-16, -108, 32, 22, 5) // Face / Head

    // Anime Eye Accents
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-10, -100, 4, 3.5)
    g.fillRect(6, -100, 4, 3.5)

    // F. Curly Dark Hair (y: -123 to -100)
    g.fillStyle(0x1c1917, 1) // Dark hair tone
    // Top curl cluster
    g.fillCircle(-11, -111, 7.5)
    g.fillCircle(-3, -115, 8.5)
    g.fillCircle(6, -113, 7.5)
    g.fillCircle(12, -109, 7)
    // Side curls framing face
    g.fillCircle(-18, -104, 6.5)
    g.fillCircle(18, -104, 6.5)
    // Forehead curl tuft
    g.fillCircle(0, -108, 5.5)

    this.add(this.placeholderGraphics)

    // 3. Identification Badge underneath (remains un-flipped, enlarged for visibility)
    const badgeBg = this.scene.add.graphics()
    badgeBg.fillStyle(0x0f172a, 0.9)
    badgeBg.lineStyle(1.5, 0x3b82f6, 0.75)
    const badgeW = 92
    const badgeH = 20
    badgeBg.fillRoundedRect(-badgeW / 2, 10, badgeW, badgeH, 4)
    badgeBg.strokeRoundedRect(-badgeW / 2, 10, badgeW, badgeH, 4)

    const badgeText = this.scene.add.text(0, 20, 'DENNIS [PROTAG]', {
      fontFamily: GAME_FONTS.heading,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#60a5fa',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.badgeContainer = this.scene.add.container(0, 0, [badgeBg, badgeText])
    this.add(this.badgeContainer)
  }

  /**
   * Sets up a gentle procedural breathing/idle bob so the character feels alive.
   */
  private setupIdlePresentation(): void {
    if (this.placeholderGraphics) {
      this.idleTween = this.scene.tweens.add({
        targets: this.placeholderGraphics,
        scaleY: 1.025,
        scaleX: 0.985,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  /**
   * Updates Dennis's facing direction.
   * Flips character visuals horizontally while keeping badge text readable.
   */
  public setFacingDirection(direction: 1 | -1): void {
    if (this.facingDirection === direction) return
    this.facingDirection = direction

    if (this.placeholderGraphics) {
      this.placeholderGraphics.setScale(direction, 1)
    }

    if (this.productionSprite) {
      this.productionSprite.setFlipX(direction === -1)
    }
  }

  public getFacingDirection(): 1 | -1 {
    return this.facingDirection
  }

  /**
   * Controls the active character animation state.
   */
  public playAnimation(state: CharacterAnimationState): void {
    if (this.currentAnimState === state) return
    this.currentAnimState = state

    // Pause idle breathing tween when running or in mid-air
    if (state === 'idle') {
      if (this.idleTween && this.idleTween.isPaused()) {
        this.idleTween.resume()
      }
    } else {
      if (this.idleTween && this.idleTween.isPlaying()) {
        this.idleTween.pause()
        if (this.placeholderGraphics) {
          this.placeholderGraphics.setScale(this.facingDirection, 1)
        }
      }
    }

    if (this.productionSprite) {
      const animKey = DENNIS_ANIM_KEYS[state]
      if (canPlayAnimation(this.scene.anims, animKey)) {
        this.productionSprite.play(animKey, true)
      }
    }
  }

  /**
   * Triggers an arcade-comedy punch animation with visual punch swoosh.
   */
  public triggerAttackAnimation(): void {
    this.playAnimation('attack')

    // Create dynamic punch swoosh arc in facing direction (scaled to match Dennis's reach)
    const swoosh = this.scene.add.graphics()
    const dir = this.facingDirection
    swoosh.lineStyle(4, 0xfbbf24, 0.9)
    swoosh.beginPath()
    swoosh.arc(dir * 32, -66, 22, -Math.PI / 3, Math.PI / 3, dir === -1)
    swoosh.strokePath()

    // Impact star spark
    swoosh.fillStyle(0xffffff, 0.95)
    swoosh.fillCircle(dir * 48, -66, 5.5)
    this.add(swoosh)

    // Forward body lunge
    if (this.placeholderGraphics) {
      this.placeholderGraphics.x = dir * 8
    }

    // Auto-revert attack visual after 160ms
    this.scene.time.delayedCall(160, () => {
      swoosh.destroy()
      if (this.placeholderGraphics) {
        this.placeholderGraphics.x = 0
      }
      if (this.currentAnimState === 'attack') {
        this.playAnimation('idle')
      }
    })
  }

  /**
   * Returns the current animation state.
   */
  public getCurrentAnimation(): CharacterAnimationState {
    return this.currentAnimState
  }

  /**
   * Prepares hook for future Arcade Physics integration when movement is introduced.
   */
  public isPhysicsEnabled(): boolean {
    return Boolean(this.body)
  }

  private handleSceneShutdown(): void {
    this.destroy()
  }

  /**
   * Cleanup all tweens and graphics.
   */
  public override destroy(fromScene?: boolean): void {
    if (this.idleTween) {
      this.idleTween.stop()
      this.idleTween.remove()
      this.idleTween = undefined
    }

    super.destroy(fromScene)
  }
}
