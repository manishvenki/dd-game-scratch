import Phaser from 'phaser'
import { Chaser } from './Chaser'

export interface RahulConfig {
  readonly x: number
  readonly y: number
  readonly textureKey?: string
  readonly idlePhaseOffsetMs?: number
}

/**
 * Rahul - Recurring Chaser character.
 * Visual attributes:
 * - Dark teal striped shirt with multiple prominent horizontal stripes
 * - Dark tousled hair
 * - Dark slate trousers
 */
export class Rahul extends Chaser {
  public static readonly ENTITY_NAME = 'Rahul'

  constructor(scene: Phaser.Scene, config: RahulConfig) {
    super(scene, {
      x: config.x,
      y: config.y,
      chaserId: 'rahul',
      textureKey: config.textureKey,
      idlePhaseOffsetMs: config.idlePhaseOffsetMs ?? 600,
    })
  }

  protected renderCharacterFeatures(g: Phaser.GameObjects.Graphics): void {
    // 1. Dark Slate Pants (y: -36 to -6)
    g.fillStyle(0x1e293b, 1) // Slate-800
    g.fillRoundedRect(-14, -36, 12, 31, 2)
    g.fillRoundedRect(2, -36, 12, 31, 2)
    // Belt
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-15, -38, 30, 3)

    // 2. Dark Teal Base Shirt (y: -62 to -38)
    g.fillStyle(0x0f766e, 1) // Deep teal-700
    g.fillRoundedRect(-15, -62, 30, 24, 3)

    // 3. Multiple Visible Horizontal Stripes (Distinguishes clearly from Manish & Sathish)
    g.fillStyle(0x5eead4, 1) // Bright teal-300 horizontal stripes
    // Stripe 1 (Chest top)
    g.fillRect(-15, -58, 30, 2.5)
    // Stripe 2 (Mid chest)
    g.fillRect(-15, -52, 30, 2.5)
    // Stripe 3 (Lower chest)
    g.fillRect(-15, -46, 30, 2.5)
    // Stripe 4 (Waist)
    g.fillRect(-15, -40, 30, 2)

    // 4. Sleeves & Hands (y: -60 to -40)
    g.fillStyle(0x0f766e, 1) // Dark teal sleeves
    g.fillRoundedRect(-19, -60, 5, 18, 2)
    g.fillRoundedRect(14, -60, 5, 18, 2)

    // Sleeve Stripes
    g.fillStyle(0x5eead4, 1)
    g.fillRect(-19, -56, 5, 2)
    g.fillRect(14, -56, 5, 2)
    g.fillRect(-19, -50, 5, 2)
    g.fillRect(14, -50, 5, 2)

    // Hands
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-16.5, -40, 2.5)
    g.fillCircle(16.5, -40, 2.5)

    // 5. Neck & Face (y: -78 to -62)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-4, -64, 8, 4)
    g.fillRoundedRect(-12, -78, 24, 16, 4)

    // Expressive Eyes
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-7, -72, 3, 2.5)
    g.fillRect(4, -72, 3, 2.5)

    // 6. Dark Tousled Hair (y: -85 to -72)
    g.fillStyle(0x18181b, 1)
    g.fillRoundedRect(-13, -84, 26, 11, 4)
    // Tousled hair tufts
    g.fillCircle(-8, -84, 4.5)
    g.fillCircle(-2, -85, 5)
    g.fillCircle(4, -84, 4.5)
    g.fillCircle(9, -83, 4)
    // Fringe strands
    g.fillRect(-13, -76, 3, 5)
    g.fillRect(10, -76, 3, 5)
  }
}
