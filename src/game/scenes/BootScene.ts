import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { Manish } from '../entities/Manish'
import { Sathish } from '../entities/Sathish'
import { Rahul } from '../entities/Rahul'
import { PlayerController } from '../systems/PlayerController'

export class BootScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text
  private subtitleText?: Phaser.GameObjects.Text
  private statusBadge?: Phaser.GameObjects.Container
  private statusText?: Phaser.GameObjects.Text
  private statusBg?: Phaser.GameObjects.Graphics
  private gridGraphics?: Phaser.GameObjects.Graphics
  private crosshairGraphics?: Phaser.GameObjects.Graphics

  // Characters
  private dennis?: Dennis
  private manish?: Manish
  private sathish?: Sathish
  private rahul?: Rahul

  // Movement & Physics
  private playerController?: PlayerController
  private groundGroup?: Phaser.Physics.Arcade.StaticGroup
  private groundVisual?: Phaser.GameObjects.Graphics
  private groundCollider?: Phaser.Physics.Arcade.Collider

  // Gameplay Feedback UI
  private controlGuideText?: Phaser.GameObjects.Text
  private playerStatusText?: Phaser.GameObjects.Text
  private playerStatusBg?: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    const width = this.scale.width
    const height = this.scale.height

    // 1. Configure World Physics Bounds
    this.physics.world.setBounds(0, 0, width, height)

    // 2. Background Grid & Corner Targeting Graphics
    this.gridGraphics = this.add.graphics()
    this.crosshairGraphics = this.add.graphics()

    // 3. Ground Platform Visual & Static Body
    this.groundGroup = this.physics.add.staticGroup()
    this.groundVisual = this.add.graphics()
    this.buildGroundPlatform(width, height)

    // 4. Header UI
    this.titleText = this.add
      .text(0, 0, 'DD GAME SCRATCH', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.subtitleText = this.add
      .text(0, 0, 'Game engine connected', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontStyle: 'normal',
        color: '#fbbf24', // amber-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.statusBg = this.add.graphics()
    this.statusText = this.add
      .text(0, 0, 'PHASER 3.90 • ARCADE PHYSICS & CONTROLS ACTIVE', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#34d399', // emerald-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.statusBadge = this.add.container(0, 0, [this.statusBg, this.statusText])

    // 5. Stationary Chaser Characters (Manish, Sathish, Rahul)
    const groundY = this.getGroundY(height)
    this.sathish = new Sathish(this, { x: 0, y: groundY, idlePhaseOffsetMs: 400 })
    this.manish = new Manish(this, { x: 0, y: groundY, idlePhaseOffsetMs: 200 })
    this.rahul = new Rahul(this, { x: 0, y: groundY, idlePhaseOffsetMs: 600 })

    // 6. Controllable Dennis Protagonist & Player Controller
    this.dennis = new Dennis(this, { x: width / 2, y: groundY })
    this.playerController = new PlayerController({
      scene: this,
      dennis: this.dennis,
      initialX: width / 2,
      initialY: groundY,
      moveSpeed: 260,
      jumpSpeed: 520,
    })

    // Setup collision between Dennis physics body and ground platform
    if (this.groundGroup) {
      this.groundCollider = this.physics.add.collider(
        this.playerController.getPhysicsBody(),
        this.groundGroup
      )
    }

    // 7. On-Screen Control Guide & Live Status Indicators
    this.controlGuideText = this.add
      .text(0, 0, '[A/D or ←/→] MOVE  •  [SPACE or ↑] JUMP  •  TOUCH BUTTONS ACTIVE', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#94a3b8',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.playerStatusBg = this.add.graphics()
    this.playerStatusText = this.add
      .text(0, 0, 'STATE: GROUNDED [IDLE]', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#38bdf8',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    // Initial Layout update based on current scale dimensions
    this.updateLayout(width, height)

    // Bind scale resize event
    this.scale.on('resize', this.handleResize, this)

    // Clean up event listener when scene is shut down or destroyed
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)
  }

  /**
   * Main game loop running every animation frame.
   */
  override update(): void {
    if (this.playerController) {
      this.playerController.update()
      this.updatePlayerStatusFeedback()
    }
  }

  private getGroundY(height: number): number {
    return height - 54
  }

  private buildGroundPlatform(width: number, height: number): void {
    const groundY = this.getGroundY(height)
    const platformHeight = height - groundY + 20

    // Clear and redraw static body
    if (this.groundGroup) {
      this.groundGroup.clear(true, true)
      // Create ground body with top surface at groundY
      const groundRect = this.add.rectangle(
        width / 2,
        groundY + platformHeight / 2,
        width,
        platformHeight,
        0x000000,
        0
      )
      this.groundGroup.add(groundRect)
    }

    // Draw visual ground platform
    if (this.groundVisual) {
      this.groundVisual.clear()
      // Base pavement fill
      this.groundVisual.fillStyle(0x0f172a, 1)
      this.groundVisual.fillRect(0, groundY, width, platformHeight)

      // Sidewalk top kerb line
      this.groundVisual.fillStyle(0x38bdf8, 0.7) // Sky blue kerb edge
      this.groundVisual.fillRect(0, groundY, width, 2)

      // Lower texture line
      this.groundVisual.fillStyle(0x1e293b, 1)
      this.groundVisual.fillRect(0, groundY + 3, width, platformHeight)
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
    this.playerStatusBg.fillStyle(0x0f172a, 0.85)
    this.playerStatusBg.lineStyle(1, 0x0284c7, 0.6)
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
    const groundY = this.getGroundY(height)
    const isNarrow = width < 560
    const isShort = height < 440

    // Update Physics World Bounds
    this.physics.world.setBounds(0, 0, width, height)

    // Rebuild Ground Platform to match new viewport
    this.buildGroundPlatform(width, height)

    // Responsive font scaling
    const titleSize = isNarrow ? Math.max(16, Math.floor(width * 0.048)) : 26
    const subtitleSize = isNarrow ? Math.max(11, Math.floor(width * 0.026)) : 13

    // Position Header elements
    const headerBaseY = isShort ? 18 : Math.max(26, height * 0.09)

    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`)
      this.titleText.setPosition(centerX, headerBaseY)
    }

    if (this.subtitleText) {
      this.subtitleText.setFontSize(`${subtitleSize}px`)
      this.subtitleText.setPosition(centerX, headerBaseY + (isShort ? 18 : 23))
    }

    if (this.statusBadge && this.statusText && this.statusBg) {
      const badgeY = headerBaseY + (isShort ? 38 : 47)
      this.statusBadge.setPosition(centerX, badgeY)

      const textBounds = this.statusText.getBounds()
      const padX = 10
      const padY = 3.5
      const bgW = textBounds.width + padX * 2
      const bgH = textBounds.height + padY * 2

      this.statusBg.clear()
      this.statusBg.fillStyle(0x064e3b, 0.45)
      this.statusBg.lineStyle(1, 0x10b981, 0.4)
      this.statusBg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
      this.statusBg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
    }

    // Position Stationary Chasers along the Ground Platform
    // Spread them across the stage so Dennis has space to run and jump around them
    const chaserSpread = isNarrow
      ? Math.min(85, (width - 40) / 4)
      : Math.min(180, (width - 120) / 3.5)

    if (this.sathish) {
      this.sathish.setPosition(centerX - chaserSpread * 1.5, groundY)
    }

    if (this.manish) {
      this.manish.setPosition(centerX - chaserSpread * 0.6, groundY)
    }

    if (this.rahul) {
      this.rahul.setPosition(centerX + chaserSpread * 1.3, groundY)
    }

    // Ensure Dennis is on the ground platform within world bounds
    if (this.playerController) {
      const currentPos = this.playerController.getPosition()
      const clampedX = Phaser.Math.Clamp(currentPos.x, 30, width - 30)
      if (currentPos.y > groundY || currentPos.x !== clampedX) {
        this.playerController.setPosition(clampedX, groundY)
      }
    }

    // Position Control Guide & Status text
    if (this.controlGuideText) {
      const guideY = isShort ? groundY - 14 : groundY - 20
      this.controlGuideText.setFontSize(isNarrow ? '8px' : '9.5px')
      this.controlGuideText.setPosition(centerX, guideY)
    }

    if (this.playerStatusText) {
      this.playerStatusText.setPosition(centerX, height - 24)
    }

    // Background Grid
    if (this.gridGraphics) {
      this.gridGraphics.clear()
      this.gridGraphics.lineStyle(1, 0x1e293b, 0.3)
      const step = 48
      for (let x = step; x < width; x += step) {
        this.gridGraphics.lineBetween(x, 0, x, height)
      }
      for (let y = step; y < height; y += step) {
        this.gridGraphics.lineBetween(0, y, width, y)
      }
    }

    // Corner targeting crosshairs
    if (this.crosshairGraphics) {
      this.crosshairGraphics.clear()
      this.crosshairGraphics.lineStyle(1.5, 0xf59e0b, 0.5)
      const len = 14
      const pad = 14

      // Top-Left
      this.crosshairGraphics.lineBetween(pad, pad, pad + len, pad)
      this.crosshairGraphics.lineBetween(pad, pad, pad, pad + len)

      // Top-Right
      this.crosshairGraphics.lineBetween(width - pad, pad, width - pad - len, pad)
      this.crosshairGraphics.lineBetween(width - pad, pad, width - pad, pad + len)

      // Bottom-Left
      this.crosshairGraphics.lineBetween(pad, height - pad, pad + len, height - pad)
      this.crosshairGraphics.lineBetween(pad, height - pad, pad, height - pad - len)

      // Bottom-Right
      this.crosshairGraphics.lineBetween(width - pad, height - pad, width - pad - len, height - pad)
      this.crosshairGraphics.lineBetween(width - pad, height - pad, width - pad, height - pad - len)
    }
  }

  private cleanup(): void {
    this.scale.off('resize', this.handleResize, this)

    if (this.groundCollider) {
      this.groundCollider.destroy()
      this.groundCollider = undefined
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
