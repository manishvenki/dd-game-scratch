import { BlockingEnemy } from '../entities/BlockingEnemy'

export interface AttackResult {
  readonly hit: boolean
  readonly enemy?: BlockingEnemy
  readonly defeated: boolean
}

export class CombatSystem {
  public static readonly ATTACK_RANGE_X = 96
  public static readonly ATTACK_TOLERANCE_Y = 80

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

      // Vertical proximity check:
      // Characters are ~102-116px tall with feet at y.
      // Direct difference handles both grounded or slight airborne jumps.
      const directDy = Math.abs(enemyY - playerY)
      // Vertical span overlap check (bottom to head)
      const pTop = playerY - 116
      const pBottom = playerY
      const eTop = enemyY - 102
      const eBottom = enemyY
      const overlapY = Math.min(pBottom, eBottom) - Math.max(pTop, eTop)

      if (directDy > this.ATTACK_TOLERANCE_Y && overlapY < 24) {
        continue
      }

      // Directional check: enemy must be in facing direction
      const dx = (enemyX - playerX) * facing
      // Allow up to 24px contact overlap to prevent deadzones when characters touch
      if (dx >= -24 && dx <= this.ATTACK_RANGE_X) {
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
