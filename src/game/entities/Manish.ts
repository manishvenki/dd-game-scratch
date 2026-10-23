import Phaser from 'phaser'
import { Chaser } from './Chaser'

export interface ManishConfig {
  readonly x: number
  readonly y: number
  readonly textureKey?: string
  readonly idlePhaseOffsetMs?: number
}

/**
 * Manish - Recurring Chaser character.
 * Visual attributes:
 * - Black shirt
 * - Dark hair (neatly styled)
 * - Prominent, clearly visible rectangular glasses
 * - Dark slate trousers
 */
export class Manish extends Chaser {
  public static readonly ENTITY_NAME = 'Manish'

  constructor(scene: Phaser.Scene, config: ManishConfig) {
    super(scene, {
      x: config.x,
      y: config.y,
      chaserId: 'manish',
      textureKey: config.textureKey,
      idlePhaseOffsetMs: config.idlePhaseOffsetMs ?? 200,
    })
  }

  protected renderCharacterFeatures(g: Phaser.GameObjects.Graphics): void {
    // 1. Dark Slate Trousers (y: -48 to -8)
    g.fillStyle(0x334155, 1) // Slate-700
    g.fillRoundedRect(-18, -48, 15, 41, 3) // Left leg
    g.fillRoundedRect(3, -48, 15, 41, 3) // Right leg
    // Belt
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-19, -51, 38, 4)

    // 2. Black Shirt (y: -82 to -51)
    g.fillStyle(0x18181b, 1) // Zinc-900 black shirt
    g.fillRoundedRect(-19, -82, 38, 31, 4)
    // Placket & button line
    g.lineStyle(2, 0x27272a, 1)
    g.lineBetween(0, -82, 0, -56)

    // 3. Sleeves & Hands (y: -80 to -53)
    g.fillStyle(0x18181b, 1) // Black sleeves
    g.fillRoundedRect(-25, -80, 7, 24, 3)
    g.fillRoundedRect(18, -80, 7, 24, 3)
    // Hands
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-21.5, -53, 3.5)
    g.fillCircle(21.5, -53, 3.5)

    // 4. Neck & Face (y: -103 to -82)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-5, -85, 10, 6) // Neck
    g.fillRoundedRect(-15, -103, 30, 21, 5) // Head

    // 5. Dark Neat Parted Hair (y: -111 to -95)
    g.fillStyle(0x18181b, 1)
    // Top head hair volume
    g.fillRoundedRect(-17, -111, 34, 15, 5)
    // Parting slope
    g.fillCircle(-8, -110, 8)
    g.fillCircle(6, -109, 7)
    // Sideburns
    g.fillRect(-17, -99, 4, 8)
    g.fillRect(13, -99, 4, 8)

    // 6. Prominently Visible Glasses (Distinguishable and clear at scale)
    // Lens background (light cyan reflective tint)
    g.fillStyle(0x0284c7, 0.45) // Cyan lens tint
    g.fillRect(-12, -98, 9, 6.5) // Left lens
    g.fillRect(3, -98, 9, 6.5) // Right lens

    // Crisp Glasses Frames & Bridge
    g.lineStyle(1.8, 0x38bdf8, 1) // Sky-blue / metallic frame
    g.strokeRect(-12, -98, 9, 6.5) // Left rim
    g.strokeRect(3, -98, 9, 6.5) // Right rim
    // Nose bridge
    g.lineBetween(-3, -95, 3, -95)
    // Temple arms to ears
    g.lineBetween(-12, -95, -16, -96)
    g.lineBetween(12, -95, 16, -96)

    // Eyes inside glasses
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-8, -95, 2.5, 2.5)
    g.fillRect(7, -95, 2.5, 2.5)
  }
}
