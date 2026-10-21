import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'

export class BootScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text
  private subtitleText?: Phaser.GameObjects.Text
  private statusBadge?: Phaser.GameObjects.Container
  private statusText?: Phaser.GameObjects.Text
  private statusBg?: Phaser.GameObjects.Graphics
  private gridGraphics?: Phaser.GameObjects.Graphics
  private crosshairGraphics?: Phaser.GameObjects.Graphics

  // Phase 2 Character Integration
  private dennis?: Dennis
  private stagePlatform?: Phaser.GameObjects.Graphics
  private characterNoticeText?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    // 1. Grid & corner targeting graphics (restrained dark theme accents)
    this.gridGraphics = this.add.graphics()
    this.crosshairGraphics = this.add.graphics()
    this.stagePlatform = this.add.graphics()

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
        fontSize: '16px',
        fontStyle: 'normal',
        color: '#fbbf24', // amber-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    // 4. Status Badge: "PHASER 3.90 • ENGINE ACTIVE"
    this.statusBg = this.add.graphics()
    this.statusText = this.add
      .text(0, 0, 'PHASER 3.90 • PHASE 2 CHARACTER ARCHITECTURE', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#34d399', // emerald-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.statusBadge = this.add.container(0, 0, [this.statusBg, this.statusText])

    // 5. Instantiate Dennis Character Entity (stationary integration test)
    this.dennis = new Dennis(this, {
      x: this.scale.width / 2,
      y: this.scale.height - 80,
    })

    // 6. Character development status notice label
    this.characterNoticeText = this.add
      .text(0, 0, 'DENNIS (PROTAGONIST) • VECTOR PLACEHOLDER [CURLY HAIR / DENIM SHIRT / JEANS]', {
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
    const isShort = height < 420

    // Responsive font scaling
    const titleSize = isNarrow ? Math.max(18, Math.floor(width * 0.05)) : 30
    const subtitleSize = isNarrow ? Math.max(12, Math.floor(width * 0.03)) : 15
    const noticeSize = isNarrow ? 8 : 9

    // Position Header elements (in top region)
    const headerBaseY = isShort ? 24 : Math.max(34, height * 0.12)

    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`)
      this.titleText.setPosition(centerX, headerBaseY)
    }

    if (this.subtitleText) {
      this.subtitleText.setFontSize(`${subtitleSize}px`)
      this.subtitleText.setPosition(centerX, headerBaseY + (isShort ? 22 : 28))
    }

    if (this.statusBadge && this.statusText && this.statusBg) {
      const badgeY = headerBaseY + (isShort ? 46 : 58)
      this.statusBadge.setPosition(centerX, badgeY)

      const textBounds = this.statusText.getBounds()
      const padX = 12
      const padY = 4
      const bgW = textBounds.width + padX * 2
      const bgH = textBounds.height + padY * 2

      this.statusBg.clear()
      this.statusBg.fillStyle(0x064e3b, 0.45) // emerald-950 / 45%
      this.statusBg.lineStyle(1, 0x10b981, 0.4) // emerald-500
      this.statusBg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
      this.statusBg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 4)
    }

    // Position Dennis & Ground Stage Platform (in lower region)
    const dennisY = isShort ? height - 42 : Math.max(height * 0.68, height - 75)

    if (this.stagePlatform) {
      this.stagePlatform.clear()
      // Stage spotlight / pedestal ellipse
      this.stagePlatform.fillStyle(0x1e293b, 0.45)
      this.stagePlatform.fillEllipse(centerX, dennisY + 2, 120, 24)
      this.stagePlatform.lineStyle(1, 0x3b82f6, 0.3)
      this.stagePlatform.strokeEllipse(centerX, dennisY + 2, 120, 24)
    }

    if (this.dennis) {
      this.dennis.setPosition(centerX, dennisY)
    }

    if (this.characterNoticeText) {
      this.characterNoticeText.setFontSize(`${noticeSize}px`)
      this.characterNoticeText.setPosition(centerX, dennisY + (isShort ? 24 : 32))
    }

    // Background grid
    if (this.gridGraphics) {
      this.gridGraphics.clear()
      this.gridGraphics.lineStyle(1, 0x1e293b, 0.3) // slate-800
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
      this.crosshairGraphics.lineStyle(1.5, 0xf59e0b, 0.5) // amber-500
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
  }
}
