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

  public readonly characterWidth = 48
  public readonly characterHeight = 102

  constructor(scene: Phaser.Scene, config: BlockingEnemyConfig, groundY: number) {
    super(scene, config.initialX, groundY)
    this.enemyId = config.id
    this.config = config
    this.currentHp = config.maxHp
    this.maxHp = config.maxHp

    // 1. Add to scene display list
    scene.add.existing(this)

    // 2. Create invisible dynamic physics proxy body for collision (scaled to 44x98)
    this.physicsBody = scene.physics.add.sprite(config.initialX, groundY, '__DEFAULT')
    this.physicsBody.setVisible(false)
    this.physicsBody.setAlpha(0)
    this.physicsBody.setSize(44, 98)
    this.physicsBody.setOffset(
      (this.physicsBody.width - 44) / 2,
      this.physicsBody.height - 98
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
    // 1. Shadow (enlarged for 48px width)
    this.shadowGraphics = this.scene.add.graphics()
    this.shadowGraphics.fillStyle(0x000000, 0.35)
    this.shadowGraphics.fillEllipse(0, 3, 54, 15)
    this.add(this.shadowGraphics)

    // 2. Body Graphics
    this.placeholderGraphics = this.scene.add.graphics()
    const g = this.placeholderGraphics
    const shirt = this.config.shirtColorHex
    const pants = this.config.pantsColorHex

    // Shoes (y: -8 to 0)
    g.fillStyle(0x0f172a, 1)
    g.fillRoundedRect(-19, -8, 16, 8, 3)
    g.fillRoundedRect(3, -8, 16, 8, 3)

    // Pants (y: -44 to -8)
    g.fillStyle(pants, 1)
    g.fillRoundedRect(-16, -44, 14, 37, 3)
    g.fillRoundedRect(2, -44, 14, 37, 3)
    // Belt
    g.fillStyle(0x0f172a, 1)
    g.fillRect(-17, -47, 34, 4)

    // Shirt / Torso (y: -75 to -47)
    g.fillStyle(shirt, 1)
    g.fillRoundedRect(-17, -75, 34, 29, 4)

    // Arms in confrontational / hands-on-hips stance (y: -73 to -51)
    g.fillStyle(shirt, 1)
    g.fillRoundedRect(-22, -73, 6, 21, 3)
    g.fillRoundedRect(16, -73, 6, 21, 3)
    // Hands
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(-19, -51, 3)
    g.fillCircle(19, -51, 3)

    // Neck & Head (y: -95 to -75)
    g.fillStyle(0xfed7aa, 1)
    g.fillRect(-5, -78, 10, 5) // Neck
    g.fillRoundedRect(-14, -95, 28, 20, 5) // Face

    // Eyes
    g.fillStyle(0x1e293b, 1)
    g.fillRect(-8, -87, 4, 3)
    g.fillRect(4, -87, 4, 3)

    // Hairstyle (scaled up to y: -106)
    g.fillStyle(0x18181b, 1) // Black hair
    if (this.config.hairstyle === 'spiky') {
      g.fillTriangle(-15, -95, -5, -95, -10, -105)
      g.fillTriangle(-8, -95, 2, -95, -3, -107)
      g.fillTriangle(0, -95, 10, -95, 5, -106)
      g.fillTriangle(7, -95, 15, -95, 11, -102)
    } else if (this.config.hairstyle === 'crew') {
      g.fillRoundedRect(-15, -101, 30, 9, 3)
    } else {
      // Parted
      g.fillCircle(-8, -97, 7.5)
      g.fillCircle(5, -98, 8.5)
      g.fillCircle(11, -96, 6.5)
    }

    this.add(this.placeholderGraphics)

    // 3. Identification & Health Badge
    const badgeW = 90
    const badgeH = 19
    const badgeBg = this.scene.add.graphics()
    badgeBg.fillStyle(0x0f172a, 0.9)
    badgeBg.lineStyle(1.5, 0xef4444, 0.75) // Red border for blockers
    badgeBg.fillRoundedRect(-badgeW / 2, 10, badgeW, badgeH, 4)
    badgeBg.strokeRoundedRect(-badgeW / 2, 10, badgeW, badgeH, 4)

    this.badgeText = this.scene.add.text(0, 19.5, this.config.badgeLabel, {
      fontFamily: GAME_FONTS.heading,
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#f87171',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    this.hpText = this.scene.add.text(0, -106, this.getHpIndicator(), {
      fontFamily: GAME_FONTS.heading,
      fontSize: '13px',
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
    const sparkText = this.scene.add.text(this.x, this.y - 60, this.currentHp <= 0 ? '★ DOWN!' : '★ POW!', {
      fontFamily: GAME_FONTS.display,
      fontSize: '16px',
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
