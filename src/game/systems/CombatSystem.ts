import { BlockingEnemy } from '../entities/BlockingEnemy'

export interface AttackResult {
  readonly hit: boolean
  readonly enemy?: BlockingEnemy
  readonly defeated: boolean
}

export class CombatSystem {
  public static readonly ATTACK_RANGE_X = 65
  public static readonly ATTACK_TOLERANCE_Y = 45

  /**
   * Attempts an attack against the nearest valid blocking enemy in facing direction.
   */
  public static resolvePlayerAttack(
    playerX: number,
    playerY: number,
    facing: 1 | -1,
    enemies: readonly BlockingEnemy[]
  ): AttackResult {
    let closestEnemy: BlockingEnemy | undefined
    let minDistance = Infinity

    for (const enemy of enemies) {
      if (enemy.isDefeated()) continue

      const enemyX = enemy.x
      const enemyY = enemy.y

      // Vertical proximity check
      if (Math.abs(enemyY - playerY) > this.ATTACK_TOLERANCE_Y) continue

      // Directional check: enemy must be in facing direction
      const dx = (enemyX - playerX) * facing
      // We allow a small 12px overlap behind player origin to prevent deadzones at point-blank range
      if (dx >= -12 && dx <= this.ATTACK_RANGE_X) {
        const dist = Math.abs(dx)
        if (dist < minDistance) {
          minDistance = dist
          closestEnemy = enemy
        }
      }
    }

    if (closestEnemy) {
      const defeated = closestEnemy.receiveDamage(1, playerX)
      return { hit: true, enemy: closestEnemy, defeated }
    }

    return { hit: false, defeated: false }
  }

  /**
   * Returns true if all blocking enemies in the array have been defeated.
   */
  public static areAllEnemiesDefeated(enemies: readonly BlockingEnemy[]): boolean {
    if (enemies.length === 0) return true
    return enemies.every((enemy) => enemy.isDefeated())
  }
}
