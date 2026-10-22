import Phaser from 'phaser'
import { Chaser } from './Chaser'
import { GAME_FONTS } from '../config/typography'

export interface SathishConfig {
  readonly x: number
  readonly y: number
  readonly textureKey?: string
  readonly idlePhaseOffsetMs?: number
}

/**
 * Sathish - Recurring Chaser character.
 * Visual attributes:
 * - Black Lenovo T-shirt with readable chest lettering
 * - Dark textured hair
 * - Charcoal casual pants
 */
export class Sathish extends Chaser {
  public static readonly ENTITY_NAME = 'Sathish'

  private lenovoText?: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, config: SathishConfig) {
    super(scene, {
      x: config.x,
      y: config.y,
      chaserId: 'sathish',
      textureKey: config.textureKey,
      idlePhaseOffsetMs: config.idlePhaseOffsetMs ?? 400,
    })

    // Attach readable Lenovo text marking on the chest
    this.createLenovoMarking()
  }

  protected renderCharacterFeatures(g: Phaser.GameObjects.Graphics): void {
    // 1. Charcoal Casual Pants (y: -36 to -6)
    g.fillStyle(0x475569, 1) // Slate-600
    g.fillRoundedRect(-14, -36, 12, 31, 2)
    g.fillRoundedRect(2, -36, 12, 31, 2)
    // Belt
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-15, -38, 30, 3)

    // 2. Black Crew-neck T-shirt (y: -62 to -38)
    g.fillStyle(0x09090b, 1) // Deep pitch black
    g.fillRoundedRect(-15, -62, 30, 24, 3)

    // Crew-neck collar curve
    g.lineStyle(1.5, 0x27272a, 1)
    g.strokeCircle(0, -62, 5)

    // Red Lenovo badge backing block on chest (y: -54 to -47)
    g.fillStyle(0xdc2626, 1) // Lenovo iconic red
    g.fillRoundedRect(-11, -55, 22, 8, 1)

    // 3. Short T-shirt Sleeves & Bare Forearms (y: -60 to -40)
    // Black short sleeves
    g.fillStyle(0x09090b, 1)
    g.fillRoundedRect(-19, -60, 5, 10, 2)
    g.fillRoundedRect(14, -60, 5, 10, 2)
    // Bare forearms (skin tone)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-18.5, -50, 4, 8)
    g.fillRect(14.5, -50, 4, 8)
    // Hands
    g.fillCircle(-16.5, -40, 2.5)
    g.fillCircle(16.5, -40, 2.5)

    // 4. Neck & Face (y: -78 to -62)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-4, -64, 8, 4)
    g.fillRoundedRect(-12, -78, 24, 16, 4)

    // Expressive Eyes
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-7, -72, 3, 2.5)
    g.fillRect(4, -72, 3, 2.5)

    // 5. Short Textured Dark Hair (y: -84 to -72)
    g.fillStyle(0x171717, 1)
    g.fillRoundedRect(-13, -84, 26, 11, 4)
    g.fillCircle(-7, -84, 4)
    g.fillCircle(0, -85, 4.5)
    g.fillCircle(7, -84, 4)
    // Side crops
    g.fillRect(-13, -76, 2.5, 6)
    g.fillRect(10.5, -76, 2.5, 6)
  }

  /**
   * Adds simple, crisp, readable "Lenovo" text marking across the chest.
   */
  private createLenovoMarking(): void {
    this.lenovoText = this.scene.add.text(0, -51, 'Lenovo', {
      fontFamily: GAME_FONTS.heading,
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.add(this.lenovoText)
  }
}
