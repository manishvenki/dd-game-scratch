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
    // 1. Dark Slate Pants (y: -48 to -8)
    g.fillStyle(0x1e293b, 1) // Slate-800
    g.fillRoundedRect(-18, -48, 15, 41, 3)
    g.fillRoundedRect(3, -48, 15, 41, 3)
    // Belt
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-19, -51, 38, 4)

    // 2. Dark Teal Base Shirt (y: -82 to -51)
    g.fillStyle(0x0f766e, 1) // Deep teal-700
    g.fillRoundedRect(-19, -82, 38, 31, 4)

    // 3. Multiple Visible Horizontal Stripes (Distinguishes clearly from Manish & Sathish)
    g.fillStyle(0x5eead4, 1) // Bright teal-300 horizontal stripes
    // Stripe 1 (Chest top)
    g.fillRect(-19, -77, 38, 3.5)
    // Stripe 2 (Mid chest)
    g.fillRect(-19, -69, 38, 3.5)
    // Stripe 3 (Lower chest)
    g.fillRect(-19, -61, 38, 3.5)
    // Stripe 4 (Waist)
    g.fillRect(-19, -53, 38, 3)

    // 4. Sleeves & Hands (y: -80 to -53)
    g.fillStyle(0x0f766e, 1) // Dark teal sleeves
    g.fillRoundedRect(-25, -80, 7, 24, 3)
    g.fillRoundedRect(18, -80, 7, 24, 3)

    // Sleeve Stripes
    g.fillStyle(0x5eead4, 1)
    g.fillRect(-25, -75, 7, 3)
    g.fillRect(18, -75, 7, 3)
    g.fillRect(-25, -67, 7, 3)
    g.fillRect(18, -67, 7, 3)

    // Hands
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-21.5, -53, 3.5)
    g.fillCircle(21.5, -53, 3.5)

    // 5. Neck & Face (y: -103 to -82)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-5, -85, 10, 6)
    g.fillRoundedRect(-15, -103, 30, 21, 5)

    // Expressive Eyes
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-9, -95, 4, 3)
    g.fillRect(5, -95, 4, 3)

    // 6. Dark Tousled Hair (y: -111 to -95)
    g.fillStyle(0x18181b, 1)
    g.fillRoundedRect(-17, -111, 34, 15, 5)
    // Tousled hair tufts
    g.fillCircle(-10, -111, 6)
    g.fillCircle(-2, -112, 6.5)
    g.fillCircle(6, -111, 6)
    g.fillCircle(12, -109, 5.5)
    // Fringe strands
    g.fillRect(-17, -100, 4, 7)
    g.fillRect(13, -100, 4, 7)
  }
}
