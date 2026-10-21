import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { Manish } from '../entities/Manish'
import { Sathish } from '../entities/Sathish'
import { Rahul } from '../entities/Rahul'
import { PlayerController } from '../systems/PlayerController'
import { BengaluruCollegeStreet } from '../environments/BengaluruCollegeStreet'

export class BootScene extends Phaser.Scene {
  // Screen-anchored HUD elements (ScrollFactor 0)
  private titleText?: Phaser.GameObjects.Text
  private subtitleText?: Phaser.GameObjects.Text
  private statusBadge?: Phaser.GameObjects.Container
  private statusText?: Phaser.GameObjects.Text
  private statusBg?: Phaser.GameObjects.Graphics
  private controlGuideText?: Phaser.GameObjects.Text
  private playerStatusText?: Phaser.GameObjects.Text
  private playerStatusBg?: Phaser.GameObjects.Graphics

  // Environment & Parallax
  private bengaluruStreet?: BengaluruCollegeStreet

  // Characters
  private dennis?: Dennis
  private manish?: Manish
  private sathish?: Sathish
  private rahul?: Rahul

  // Movement & Physics
  private playerController?: PlayerController
  private groundGroup?: Phaser.Physics.Arcade.StaticGroup
  private groundCollider?: Phaser.Physics.Arcade.Collider

  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    const width = this.scale.width
    const height = this.scale.height
    const stageWidth = this.getStageWidth(width)
    const groundY = this.getGroundY(height)

    // 1. Configure World Physics & Camera Bounds
    this.physics.world.setBounds(0, 0, stageWidth, height)
    this.cameras.main.setBounds(0, 0, stageWidth, height)

    // 2. Build Bengaluru College Street Parallax Environment
    this.bengaluruStreet = new BengaluruCollegeStreet({
      scene: this,
      stageWidth,
      viewportWidth: width,
      viewportHeight: height,
      groundY,
    })

    // 3. Ground Platform Static Body (aligned with visible sidewalk/road)
    this.groundGroup = this.physics.add.staticGroup()
    this.buildGroundPlatform(stageWidth, height)

    // 4. Stationary Chaser Characters placed at street landmarks along sidewalk
    // Sathish near SLV Kaapi stall (x: 360)
    this.sathish = new Sathish(this, { x: 360, y: groundY, idlePhaseOffsetMs: 400 })
    // Manish waiting outside College Main Gate (x: 980)
    this.manish = new Manish(this, { x: 980, y: groundY, idlePhaseOffsetMs: 200 })
    // Rahul waiting near Campus Xerox & Gulmohar tree (x: 1420)
    this.rahul = new Rahul(this, { x: 1420, y: groundY, idlePhaseOffsetMs: 600 })

    // 5. Controllable Dennis Protagonist & Player Controller
    // Spawns in front of the college entrance
    const initialDennisX = 750
    this.dennis = new Dennis(this, { x: initialDennisX, y: groundY })
    this.playerController = new PlayerController({
      scene: this,
      dennis: this.dennis,
      initialX: initialDennisX,
      initialY: groundY,
      moveSpeed: 260,
      jumpSpeed: 520,
    })

    // 6. Camera Follows Dennis smoothly with gentle lead
    this.cameras.main.startFollow(
      this.playerController.getPhysicsBody(),
      true,
      0.08,
      0.08,
      0,
      30
    )

    // 7. Setup collision between Dennis physics body and ground platform
    if (this.groundGroup) {
      this.groundCollider = this.physics.add.collider(
        this.playerController.getPhysicsBody(),
        this.groundGroup
      )
    }

    // 8. Screen-Anchored HUD UI (ScrollFactor 0, High Depth)
    this.setupScreenHud()

    // 9. Initial Layout update based on current dimensions
    this.updateLayout(width, height)

    // 10. Bind scale resize event
    this.scale.on('resize', this.handleResize, this)

    // 11. Clean up event listeners on shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)
  }

  /**
   * Initializes the screen-anchored HUD that stays fixed in view during camera scrolling.
   */
  private setupScreenHud(): void {
    // Title
    this.titleText = this.add
      .text(0, 0, 'DD GAME SCRATCH', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100)

    // Subtitle
    this.subtitleText = this.add
      .text(0, 0, 'Bengaluru College Street • Parallax Active', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        fontStyle: 'normal',
        color: '#fbbf24', // amber-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100)

    // Engine Badge
    this.statusBg = this.add.graphics()
    this.statusText = this.add
      .text(0, 0, 'PHASER 3.90 • BENGALURU STREET & PARALLAX ACTIVE', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#34d399', // emerald-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.statusBadge = this.add
      .container(0, 0, [this.statusBg, this.statusText])
      .setScrollFactor(0)
      .setDepth(100)

    // Control Guide
    this.controlGuideText = this.add
      .text(0, 0, '[A/D or ←/→] EXPLORE STREET  •  [SPACE or ↑] JUMP  •  TOUCH CONTROLS', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#cbd5e1',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100)

    // Live Dennis Status
    this.playerStatusBg = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.playerStatusText = this.add
      .text(0, 0, 'STATE: GROUNDED [IDLE]', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#38bdf8',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(101)
  }

  /**
   * Main game loop running every animation frame.
   */
  override update(): void {
    if (this.bengaluruStreet) {
      this.bengaluruStreet.update()
    }

    if (this.playerController) {
      this.playerController.update()
      this.updatePlayerStatusFeedback()
    }
  }

  private getStageWidth(viewportWidth: number): number {
    return Math.max(viewportWidth * 2.5, 2400)
  }

  private getGroundY(height: number): number {
    return height - 54
  }

  private buildGroundPlatform(stageWidth: number, height: number): void {
    const groundY = this.getGroundY(height)
    const platformHeight = height - groundY + 40

    // Clear and create ground static collision rectangle spanning entire street
    if (this.groundGroup) {
      this.groundGroup.clear(true, true)
      const groundRect = this.add.rectangle(
        stageWidth / 2,
        groundY + platformHeight / 2,
        stageWidth,
        platformHeight,
        0x000000,
        0
      )
      this.groundGroup.add(groundRect)
    }
  }

  private updatePlayerStatusFeedback(): void {
    if (!this.playerController || !this.playerStatusText || !this.playerStatusBg) return

    const label = `DENNIS: ${this.playerController.getStateLabel()}`
    this.playerStatusText.setText(label)

    const bounds = this.playerStatusText.getBounds()
    const padX = 8
    const padY = 4
    const bgW = bounds.width + padX * 2
    const bgH = bounds.height + padY * 2

    this.playerStatusBg.clear()
    this.playerStatusBg.fillStyle(0x0f172a, 0.88)
    this.playerStatusBg.lineStyle(1, 0x0284c7, 0.7)
    this.playerStatusBg.fillRoundedRect(
      this.playerStatusText.x - bgW / 2,
      this.playerStatusText.y - bgH / 2,
      bgW,
      bgH,
      3
    )
    this.playerStatusBg.strokeRoundedRect(
      this.playerStatusText.x - bgW / 2,
      this.playerStatusText.y - bgH / 2,
      bgW,
      bgH,
      3
    )
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.updateLayout(gameSize.width, gameSize.height)
  }

  private updateLayout(width: number, height: number): void {
    const centerX = width / 2
    const stageWidth = this.getStageWidth(width)
    const groundY = this.getGroundY(height)
    const isNarrow = width < 560
    const isShort = height < 440

    // 1. Update Physics World Bounds and Camera Bounds
    this.physics.world.setBounds(0, 0, stageWidth, height)
    this.cameras.main.setBounds(0, 0, stageWidth, height)

    // 2. Rebuild Ground Platform to match stage width
    this.buildGroundPlatform(stageWidth, height)

    // 3. Resize Parallax Environment
    if (this.bengaluruStreet) {
      this.bengaluruStreet.resize(width, height, stageWidth, groundY)
    }

    // 4. Responsive Screen-anchored HUD scaling
    const titleSize = isNarrow ? Math.max(16, Math.floor(width * 0.046)) : 24
    const subtitleSize = isNarrow ? Math.max(10.5, Math.floor(width * 0.024)) : 12.5

    const headerBaseY = isShort ? 16 : Math.max(22, height * 0.08)

    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`)
      this.titleText.setPosition(centerX, headerBaseY)
    }

    if (this.subtitleText) {
      this.subtitleText.setFontSize(`${subtitleSize}px`)
      this.subtitleText.setPosition(centerX, headerBaseY + (isShort ? 17 : 22))
    }

    if (this.statusBadge && this.statusText && this.statusBg) {
      const badgeY = headerBaseY + (isShort ? 36 : 44)
      this.statusBadge.setPosition(centerX, badgeY)

      const textBounds = this.statusText.getBounds()
      const padX = 10
      const padY = 3.5
      const bgW = textBounds.width + padX * 2
      const bgH = textBounds.height + padY * 2

      this.statusBg.clear()
      this.statusBg.fillStyle(0x064e3b, 0.6)
      this.statusBg.lineStyle(1, 0x10b981, 0.5)
      this.statusBg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
      this.statusBg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
    }

    // 5. Stationary Chasers maintain their landmark street positions
    if (this.sathish) {
      this.sathish.setPosition(360, groundY)
    }

    if (this.manish) {
      this.manish.setPosition(980, groundY)
    }

    if (this.rahul) {
      this.rahul.setPosition(1420, groundY)
    }

    // 6. Ensure Dennis is on the ground platform within world bounds
    if (this.playerController) {
      const currentPos = this.playerController.getPosition()
      const clampedX = Phaser.Math.Clamp(currentPos.x, 30, stageWidth - 30)
      if (currentPos.y > groundY || currentPos.x !== clampedX) {
        this.playerController.setPosition(clampedX, groundY)
      }
    }

    // 7. Position Control Guide & Status text (Screen space)
    if (this.controlGuideText) {
      const guideY = isShort ? groundY - 14 : groundY - 18
      this.controlGuideText.setFontSize(isNarrow ? '8px' : '9px')
      this.controlGuideText.setPosition(centerX, guideY)
    }

    if (this.playerStatusText) {
      this.playerStatusText.setPosition(centerX, height - 20)
    }
  }

  private cleanup(): void {
    this.scale.off('resize', this.handleResize, this)

    if (this.groundCollider) {
      this.groundCollider.destroy()
      this.groundCollider = undefined
    }

    if (this.bengaluruStreet) {
      this.bengaluruStreet.destroy()
      this.bengaluruStreet = undefined
    }

    if (this.playerController) {
      this.playerController.destroy()
      this.playerController = undefined
    }

    if (this.dennis) {
      this.dennis.destroy()
      this.dennis = undefined
    }

    if (this.manish) {
      this.manish.destroy()
      this.manish = undefined
    }

    if (this.sathish) {
      this.sathish.destroy()
      this.sathish = undefined
    }

    if (this.rahul) {
      this.rahul.destroy()
      this.rahul = undefined
    }

    if (this.groundGroup) {
      this.groundGroup.destroy(true)
      this.groundGroup = undefined
    }
  }
}
