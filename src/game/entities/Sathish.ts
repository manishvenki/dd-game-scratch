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
    // 1. Charcoal Casual Pants (y: -48 to -8)
    g.fillStyle(0x475569, 1) // Slate-600
    g.fillRoundedRect(-18, -48, 15, 41, 3)
    g.fillRoundedRect(3, -48, 15, 41, 3)
    // Belt
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-19, -51, 38, 4)

    // 2. Black Crew-neck T-shirt (y: -82 to -51)
    g.fillStyle(0x09090b, 1) // Deep pitch black
    g.fillRoundedRect(-19, -82, 38, 31, 4)

    // Crew-neck collar curve
    g.lineStyle(2, 0x27272a, 1)
    g.strokeCircle(0, -82, 6.5)

    // Red Lenovo badge backing block on chest (y: -73 to -62)
    g.fillStyle(0xdc2626, 1) // Lenovo iconic red
    g.fillRoundedRect(-15, -73, 30, 11, 2)

    // 3. Short T-shirt Sleeves & Bare Forearms (y: -80 to -53)
    // Black short sleeves
    g.fillStyle(0x09090b, 1)
    g.fillRoundedRect(-25, -80, 7, 13, 3)
    g.fillRoundedRect(18, -80, 7, 13, 3)
    // Bare forearms (skin tone)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-24.5, -67, 5, 11)
    g.fillRect(18.5, -67, 5, 11)
    // Hands
    g.fillCircle(-21.5, -53, 3.5)
    g.fillCircle(21.5, -53, 3.5)

    // 4. Neck & Face (y: -103 to -82)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-5, -85, 10, 6)
    g.fillRoundedRect(-15, -103, 30, 21, 5)

    // Expressive Eyes
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-9, -95, 4, 3)
    g.fillRect(5, -95, 4, 3)

    // 5. Short Textured Dark Hair (y: -111 to -95)
    g.fillStyle(0x171717, 1)
    g.fillRoundedRect(-17, -111, 34, 15, 5)
    g.fillCircle(-9, -111, 5.5)
    g.fillCircle(0, -112, 6)
    g.fillCircle(9, -111, 5.5)
    // Side crops
    g.fillRect(-17, -100, 3.5, 8)
    g.fillRect(13.5, -100, 3.5, 8)
  }

  /**
   * Adds simple, crisp, readable "Lenovo" text marking across the chest.
   */
  private createLenovoMarking(): void {
    this.lenovoText = this.scene.add.text(0, -67.5, 'Lenovo', {
      fontFamily: GAME_FONTS.heading,
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.add(this.lenovoText)
  }
}
