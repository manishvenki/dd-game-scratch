import Phaser from 'phaser'
import { type BlockingEnemyConfig, type EnemyState } from '../levels/levelTypes'
import { GAME_FONTS } from '../config/typography'

export class BlockingEnemy extends Phaser.GameObjects.Container {
  public readonly enemyId: string
  public readonly config: BlockingEnemyConfig
  public currentHp: number
  public maxHp: number
  public currentState: EnemyState = 'blocking'

  // Physics proxy sprite for collision with player
  private physicsBody: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

  // Visuals
  private placeholderGraphics?: Phaser.GameObjects.Graphics
  private shadowGraphics?: Phaser.GameObjects.Graphics
  private badgeContainer?: Phaser.GameObjects.Container
  private badgeText?: Phaser.GameObjects.Text
  private hpText?: Phaser.GameObjects.Text
  private idleTween?: Phaser.Tweens.Tween

  public readonly characterWidth = 38
  public readonly characterHeight = 80

  constructor(scene: Phaser.Scene, config: BlockingEnemyConfig, groundY: number) {
    super(scene, config.initialX, groundY)
    this.enemyId = config.id
    this.config = config
    this.currentHp = config.maxHp
    this.maxHp = config.maxHp

    // 1. Add to scene display list
    scene.add.existing(this)

    // 2. Create invisible dynamic physics proxy body for collision
    this.physicsBody = scene.physics.add.sprite(config.initialX, groundY, '__DEFAULT')
    this.physicsBody.setVisible(false)
    this.physicsBody.setAlpha(0)
    this.physicsBody.setSize(34, 78)
    this.physicsBody.setOffset(
      (this.physicsBody.width - 34) / 2,
      this.physicsBody.height - 78
    )
    this.physicsBody.setImmovable(true)
    this.physicsBody.body.setAllowGravity(false)

    // 3. Setup visual components
    this.createVisuals()

    // 4. Idle stance animation
    this.setupIdleStance()

    // 5. Cleanup hook
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this)
  }

  public getPhysicsBody(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return this.physicsBody
  }

  private createVisuals(): void {
    // 1. Shadow
    this.shadowGraphics = this.scene.add.graphics()
    this.shadowGraphics.fillStyle(0x000000, 0.35)
    this.shadowGraphics.fillEllipse(0, 2, 42, 12)
    this.add(this.shadowGraphics)

    // 2. Body Graphics
    this.placeholderGraphics = this.scene.add.graphics()
    const g = this.placeholderGraphics
    const shirt = this.config.shirtColorHex
    const pants = this.config.pantsColorHex

    // Shoes (y: -6 to 0)
    g.fillStyle(0x0f172a, 1)
    g.fillRoundedRect(-15, -6, 13, 6, 2)
    g.fillRoundedRect(2, -6, 13, 6, 2)

    // Pants (y: -34 to -6)
    g.fillStyle(pants, 1)
    g.fillRoundedRect(-13, -34, 11, 29, 2)
    g.fillRoundedRect(2, -34, 11, 29, 2)
    // Belt
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-14, -36, 28, 3)

    // Shirt / Torso (y: -58 to -36)
    g.fillStyle(shirt, 1)
    g.fillRoundedRect(-14, -58, 28, 23, 3)

    // Arms in confrontational / hands-on-hips stance (y: -56 to -40)
    g.fillStyle(shirt, 1)
    g.fillRoundedRect(-18, -56, 5, 17, 2)
    g.fillRoundedRect(13, -56, 5, 17, 2)
    // Hands
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-15.5, -39, 2.5)
    g.fillCircle(15.5, -39, 2.5)

    // Neck & Head (y: -74 to -58)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-4, -60, 8, 4) // Neck
    g.fillRoundedRect(-11, -74, 22, 16, 4) // Face

    // Eyes
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-6, -68, 3, 2.5)
    g.fillRect(3, -68, 3, 2.5)

    // Hairstyle
    g.fillStyle(0x18181b, 1) // Black hair
    if (this.config.hairstyle === 'spiky') {
      g.fillTriangle(-12, -74, -4, -74, -8, -82)
      g.fillTriangle(-6, -74, 2, -74, -2, -84)
      g.fillTriangle(0, -74, 8, -74, 4, -83)
      g.fillTriangle(6, -74, 12, -74, 9, -80)
    } else if (this.config.hairstyle === 'crew') {
      g.fillRoundedRect(-12, -78, 24, 7, 2)
    } else {
      // Parted
      g.fillCircle(-6, -76, 6)
      g.fillCircle(4, -77, 7)
      g.fillCircle(9, -75, 5)
    }

    this.add(this.placeholderGraphics)

    // 3. Identification & Health Badge
    const badgeW = 76
    const badgeH = 15
    const badgeBg = this.scene.add.graphics()
    badgeBg.fillStyle(0x0f172a, 0.9)
    badgeBg.lineStyle(1, 0xef4444, 0.7) // Red border for blockers
    badgeBg.fillRoundedRect(-badgeW / 2, 8, badgeW, badgeH, 3)
    badgeBg.strokeRoundedRect(-badgeW / 2, 8, badgeW, badgeH, 3)

    this.badgeText = this.scene.add.text(0, 15.5, this.config.badgeLabel, {
      fontFamily: GAME_FONTS.heading,
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#f87171',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.hpText = this.scene.add.text(0, -82, this.getHpIndicator(), {
      fontFamily: GAME_FONTS.heading,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ef4444',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.badgeContainer = this.scene.add.container(0, 0, [badgeBg, this.badgeText])
    this.add(this.badgeContainer)
    this.add(this.hpText)
  }

  private getHpIndicator(): string {
    return '♥ '.repeat(this.currentHp).trim()
  }

  private setupIdleStance(): void {
    if (this.placeholderGraphics) {
      this.idleTween = this.scene.tweens.add({
        targets: this.placeholderGraphics,
        scaleY: 1.025,
        scaleX: 0.985,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  /**
   * Applies damage to this blocking enemy.
   * Returns true if this hit defeated the enemy.
   */
  public receiveDamage(amount: number, fromX: number): boolean {
    if (this.currentState === 'defeated') return false

    this.currentHp = Math.max(0, this.currentHp - amount)
    this.currentState = this.currentHp <= 0 ? 'defeated' : 'hit'

    // Update HP pips
    if (this.hpText) {
      this.hpText.setText(this.getHpIndicator())
    }

    // Visual hit reaction: brief flash and recoil knockback
    const recoilDir = this.x >= fromX ? 1 : -1
    const targetX = this.x + recoilDir * 14

    // Floating arcade hit text (e.g. "*POW!*")
    const sparkText = this.scene.add.text(this.x, this.y - 45, this.currentHp <= 0 ? '★ DOWN!' : '★ POW!', {
      fontFamily: GAME_FONTS.display,
      fontSize: '15px',
      fontStyle: 'bold',
      color: this.currentHp <= 0 ? '#fbbf24' : '#ef4444',
    }).setOrigin(0.5, 0.5)

    this.scene.tweens.add({
      targets: sparkText,
      y: sparkText.y - 25,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => sparkText.destroy(),
    })

    // Flash white effect on graphics
    if (this.placeholderGraphics) {
      this.scene.tweens.add({
        targets: this.placeholderGraphics,
        alpha: 0.3,
        yoyo: true,
        repeat: 1,
        duration: 80,
      })
    }

    // Knockback
    this.scene.tweens.add({
      targets: [this, this.physicsBody],
      x: targetX,
      duration: 140,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.currentState === 'hit') {
          this.currentState = 'blocking'
        }
      },
    })

    // If defeated: disable physics collider and show slumped state
    if (this.currentHp <= 0) {
      this.setDefeatedState()
      return true
    }

    return false
  }

  private setDefeatedState(): void {
    this.currentState = 'defeated'

    // Disable physics collision completely
    if (this.physicsBody && this.physicsBody.body) {
      this.physicsBody.body.enable = false
    }

    if (this.idleTween) {
      this.idleTween.stop()
    }

    // Visual slumped defeat: slump downwards, fade to 40% alpha
    if (this.placeholderGraphics) {
      this.scene.tweens.add({
        targets: this.placeholderGraphics,
        scaleY: 0.7,
        y: 12,
        alpha: 0.45,
        duration: 350,
        ease: 'Cubic.easeOut',
      })
    }

    if (this.badgeText) {
      this.badgeText.setText(`[${this.config.name.toUpperCase()} DEFEATED]`)
      this.badgeText.setColor('#94a3b8')
    }

    if (this.hpText) {
      this.hpText.setText('DEFEATED')
      this.hpText.setColor('#94a3b8')
    }
  }

  public isDefeated(): boolean {
    return this.currentState === 'defeated'
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

    if (this.physicsBody) {
      this.physicsBody.destroy()
    }

    super.destroy(fromScene)
  }
}
