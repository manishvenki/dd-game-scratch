import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { Manish } from '../entities/Manish'
import { Sathish } from '../entities/Sathish'
import { Rahul } from '../entities/Rahul'

export class BootScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text
  private subtitleText?: Phaser.GameObjects.Text
  private statusBadge?: Phaser.GameObjects.Container
  private statusText?: Phaser.GameObjects.Text
  private statusBg?: Phaser.GameObjects.Graphics
  private gridGraphics?: Phaser.GameObjects.Graphics
  private crosshairGraphics?: Phaser.GameObjects.Graphics

  // Core Character Entities
  private dennis?: Dennis
  private manish?: Manish
  private sathish?: Sathish
  private rahul?: Rahul

  // Staging Visuals
  private stagePlatforms?: Phaser.GameObjects.Graphics
  private characterNoticeText?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    // 1. Grid & corner targeting graphics
    this.gridGraphics = this.add.graphics()
    this.crosshairGraphics = this.add.graphics()
    this.stagePlatforms = this.add.graphics()

    // 2. Primary Title: "DD GAME SCRATCH"
    this.titleText = this.add
      .text(0, 0, 'DD GAME SCRATCH', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    // 3. Subtitle: "Game engine connected"
    this.subtitleText = this.add
      .text(0, 0, 'Game engine connected', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '15px',
        fontStyle: 'normal',
        color: '#fbbf24', // amber-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    // 4. Status Badge: "PHASER 3.90 • 4 CORE CHARACTERS ACTIVE"
    this.statusBg = this.add.graphics()
    this.statusText = this.add
      .text(0, 0, 'PHASER 3.90 • 4 CORE CHARACTERS ACTIVE', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#34d399', // emerald-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.statusBadge = this.add.container(0, 0, [this.statusBg, this.statusText])

    // 5. Instantiate Protagonist & Chaser Entities (stationary integration)
    this.dennis = new Dennis(this, { x: 0, y: 0 })
    this.manish = new Manish(this, { x: 0, y: 0, idlePhaseOffsetMs: 200 })
    this.sathish = new Sathish(this, { x: 0, y: 0, idlePhaseOffsetMs: 400 })
    this.rahul = new Rahul(this, { x: 0, y: 0, idlePhaseOffsetMs: 600 })

    // 6. Character development status notice label
    this.characterNoticeText = this.add
      .text(0, 0, 'CORE ROSTER: DENNIS (PROTAGONIST) & CHASERS (SATHISH, MANISH, RAHUL) • VECTOR PLACEHOLDERS', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '9px',
        color: '#94a3b8', // slate-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    // Initial Layout update based on current scale dimensions
    this.updateLayout(this.scale.width, this.scale.height)

    // Bind scale resize event
    this.scale.on('resize', this.handleResize, this)

    // Clean up event listener when scene is shut down or destroyed
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.updateLayout(gameSize.width, gameSize.height)
  }

  private updateLayout(width: number, height: number): void {
    const centerX = width / 2
    const isNarrow = width < 560
    const isShort = height < 440

    // Responsive font scaling
    const titleSize = isNarrow ? Math.max(16, Math.floor(width * 0.048)) : 28
    const subtitleSize = isNarrow ? Math.max(11, Math.floor(width * 0.028)) : 14
    const noticeSize = isNarrow ? 7.5 : 8.5

    // Position Header elements (in top region)
    const headerBaseY = isShort ? 20 : Math.max(28, height * 0.1)

    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`)
      this.titleText.setPosition(centerX, headerBaseY)
    }

    if (this.subtitleText) {
      this.subtitleText.setFontSize(`${subtitleSize}px`)
      this.subtitleText.setPosition(centerX, headerBaseY + (isShort ? 20 : 25))
    }

    if (this.statusBadge && this.statusText && this.statusBg) {
      const badgeY = headerBaseY + (isShort ? 42 : 52)
      this.statusBadge.setPosition(centerX, badgeY)

      const textBounds = this.statusText.getBounds()
      const padX = 12
      const padY = 4
      const bgW = textBounds.width + padX * 2
      const bgH = textBounds.height + padY * 2

      this.statusBg.clear()
      this.statusBg.fillStyle(0x064e3b, 0.45)
      this.statusBg.lineStyle(1, 0x10b981, 0.4)
      this.statusBg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
      this.statusBg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
    }

    // Clear and redraw staging platforms
    if (this.stagePlatforms) {
      this.stagePlatforms.clear()
    }

    if (isNarrow) {
      // -------------------------------------------------------------
      // TWO-TIER MOBILE LAYOUT (Prevents overlap on narrow viewports)
      // Tier 1: Dennis (Protagonist) centered
      // Tier 2: 3 Chasers (Sathish, Manish, Rahul) in a row below
      // -------------------------------------------------------------
      const tier1Y = isShort ? height * 0.48 : height * 0.52
      const tier2Y = isShort ? height - 38 : height - 52
      const chaserSpacing = Math.min(105, (width - 32) / 3)

      if (this.dennis) {
        this.dennis.setPosition(centerX, tier1Y)
      }

      if (this.sathish) {
        this.sathish.setPosition(centerX - chaserSpacing, tier2Y)
      }

      if (this.manish) {
        this.manish.setPosition(centerX, tier2Y)
      }

      if (this.rahul) {
        this.rahul.setPosition(centerX + chaserSpacing, tier2Y)
      }

      // Draw platforms for two-tier layout
      if (this.stagePlatforms) {
        // Dennis pedestal (Tier 1)
        this.stagePlatforms.fillStyle(0x1e3a8a, 0.3)
        this.stagePlatforms.fillEllipse(centerX, tier1Y + 2, 90, 20)
        this.stagePlatforms.lineStyle(1.5, 0x3b82f6, 0.5)
        this.stagePlatforms.strokeEllipse(centerX, tier1Y + 2, 90, 20)

        // Chaser floor strips (Tier 2)
        const chaserPositions = [centerX - chaserSpacing, centerX, centerX + chaserSpacing]
        for (const posX of chaserPositions) {
          this.stagePlatforms.fillStyle(0x1e293b, 0.4)
          this.stagePlatforms.fillEllipse(posX, tier2Y + 2, 70, 16)
        }
      }

      if (this.characterNoticeText) {
        this.characterNoticeText.setFontSize(`${noticeSize}px`)
        this.characterNoticeText.setPosition(centerX, height - 12)
      }
    } else {
      // -------------------------------------------------------------
      // SINGLE-ROW DESKTOP LINEUP (All 4 characters side-by-side)
      // Order: Sathish, Manish, Dennis (Lead), Rahul
      // -------------------------------------------------------------
      const characterY = isShort ? height - 42 : Math.max(height * 0.72, height - 76)
      const spacing = Math.min(125, (width - 60) / 4)

      const xSathish = centerX - spacing * 1.5
      const xManish = centerX - spacing * 0.5
      const xDennis = centerX + spacing * 0.5
      const xRahul = centerX + spacing * 1.5

      if (this.sathish) {
        this.sathish.setPosition(xSathish, characterY)
      }

      if (this.manish) {
        this.manish.setPosition(xManish, characterY)
      }

      if (this.dennis) {
        this.dennis.setPosition(xDennis, characterY)
      }

      if (this.rahul) {
        this.rahul.setPosition(xRahul, characterY)
      }

      // Draw platforms for lineup
      if (this.stagePlatforms) {
        // Chasers background pedestals
        for (const posX of [xSathish, xManish, xRahul]) {
          this.stagePlatforms.fillStyle(0x1e293b, 0.45)
          this.stagePlatforms.fillEllipse(posX, characterY + 2, 85, 20)
          this.stagePlatforms.lineStyle(1, 0x475569, 0.3)
          this.stagePlatforms.strokeEllipse(posX, characterY + 2, 85, 20)
        }

        // Dennis (Protagonist) prominent pedestal
        this.stagePlatforms.fillStyle(0x1e3a8a, 0.35)
        this.stagePlatforms.fillEllipse(xDennis, characterY + 2, 95, 22)
        this.stagePlatforms.lineStyle(1.5, 0x3b82f6, 0.7)
        this.stagePlatforms.strokeEllipse(xDennis, characterY + 2, 95, 22)
      }

      if (this.characterNoticeText) {
        this.characterNoticeText.setFontSize(`${noticeSize}px`)
        this.characterNoticeText.setPosition(centerX, characterY + (isShort ? 25 : 33))
      }
    }

    // Background grid
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
  }
}
