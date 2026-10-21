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
    // 1. Dark Slate Trousers (y: -36 to -6)
    g.fillStyle(0x334155, 1) // Slate-700
    g.fillRoundedRect(-14, -36, 12, 31, 2) // Left leg
    g.fillRoundedRect(2, -36, 12, 31, 2) // Right leg
    // Belt
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-15, -38, 30, 3)

    // 2. Black Shirt (y: -62 to -38)
    g.fillStyle(0x18181b, 1) // Zinc-900 black shirt
    g.fillRoundedRect(-15, -62, 30, 24, 3)
    // Placket & button line
    g.lineStyle(1.5, 0x27272a, 1)
    g.lineBetween(0, -62, 0, -42)

    // 3. Sleeves & Hands (y: -60 to -40)
    g.fillStyle(0x18181b, 1) // Black sleeves
    g.fillRoundedRect(-19, -60, 5, 18, 2)
    g.fillRoundedRect(14, -60, 5, 18, 2)
    // Hands
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-16.5, -40, 2.5)
    g.fillCircle(16.5, -40, 2.5)

    // 4. Neck & Face (y: -78 to -62)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-4, -64, 8, 4) // Neck
    g.fillRoundedRect(-12, -78, 24, 16, 4) // Head

    // 5. Dark Neat Parted Hair (y: -84 to -72)
    g.fillStyle(0x18181b, 1)
    // Top head hair volume
    g.fillRoundedRect(-13, -84, 26, 11, 4)
    // Parting slope
    g.fillCircle(-6, -83, 6)
    g.fillCircle(5, -82, 5)
    // Sideburns
    g.fillRect(-13, -75, 3, 6)
    g.fillRect(10, -75, 3, 6)

    // 6. Clearly Visible Glasses (Must be distinguishable at scale)
    // Lens background (light blue/cyan reflective tint)
    g.fillStyle(0x0284c7, 0.4) // Cyan lens tint
    g.fillRect(-9, -74, 7, 5) // Left lens
    g.fillRect(2, -74, 7, 5) // Right lens

    // Crisp Glasses Frames & Bridge
    g.lineStyle(1.5, 0x38bdf8, 1) // Sky-blue / metallic frame
    g.strokeRect(-9, -74, 7, 5) // Left rim
    g.strokeRect(2, -74, 7, 5) // Right rim
    // Nose bridge
    g.lineBetween(-2, -72, 2, -72)
    // Temple arms to ears
    g.lineBetween(-9, -72, -12, -73)
    g.lineBetween(9, -72, 12, -73)

    // Eyes inside glasses
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-6, -72, 2, 2)
    g.fillRect(5, -72, 2, 2)
  }
}
