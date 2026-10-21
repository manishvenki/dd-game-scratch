import Phaser from 'phaser'
import { type DialogueSequence, type DialogueLine } from '../dialogue/dialogueTypes'

export interface DialogueSystemConfig {
  readonly scene: Phaser.Scene
  readonly onSequenceComplete?: (sequenceId: string) => void
}

/**
 * DialogueSystem handles presentation and user interaction for comic speech bubbles.
 * Features:
 * - Stylish comic card with speaker badge and speech-tail indicator
 * - Automatic word wrapping and viewport safety
 * - Subtle pop-in scale tween on line advance
 * - Desktop (Space / Enter / Click) & Mobile (Touch) advance support
 * - Clean event listener management and disposal
 */
export class DialogueSystem {
  private scene: Phaser.Scene
  private container?: Phaser.GameObjects.Container
  private currentSequence?: DialogueSequence
  private currentLineIndex = 0
  private onSequenceComplete?: (sequenceId: string) => void
  private isAdvancing = false

  // Visual sub-elements
  private bubbleBg?: Phaser.GameObjects.Graphics
  private speakerBadgeBg?: Phaser.GameObjects.Graphics
  private speakerNameText?: Phaser.GameObjects.Text
  private lineText?: Phaser.GameObjects.Text
  private hintText?: Phaser.GameObjects.Text
  private progressText?: Phaser.GameObjects.Text

  // Input listeners
  private spaceKey?: Phaser.Input.Keyboard.Key
  private enterKey?: Phaser.Input.Keyboard.Key
  private pointerDownHandler?: (pointer: Phaser.Input.Pointer) => void

  constructor(config: DialogueSystemConfig) {
    this.scene = config.scene
    this.onSequenceComplete = config.onSequenceComplete

    this.setupInput()
  }

  private setupInput(): void {
    const kb = this.scene.input?.keyboard
    if (kb) {
      this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      this.enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

      this.spaceKey.on('down', this.handleKeyAdvance, this)
      this.enterKey.on('down', this.handleKeyAdvance, this)
    }

    this.pointerDownHandler = (_pointer: Phaser.Input.Pointer) => {
      if (this.isActive()) {
        this.advance()
      }
    }
    this.scene.input.on('pointerdown', this.pointerDownHandler)
  }

  private handleKeyAdvance(): void {
    if (this.isActive()) {
      this.advance()
    }
  }

  /**
   * Starts displaying a dialogue sequence.
   */
  public startSequence(sequence: DialogueSequence, onComplete?: () => void): void {
    this.destroyContainer()

    this.currentSequence = sequence
    this.currentLineIndex = 0

    if (onComplete) {
      const origOnComplete = this.onSequenceComplete
      this.onSequenceComplete = (seqId) => {
        origOnComplete?.(seqId)
        onComplete()
      }
    }

    this.buildDialogueContainer()
    this.displayCurrentLine()
  }

  private buildDialogueContainer(): void {
    const width = this.scene.scale.width
    const height = this.scene.scale.height

    // Container positioned at bottom-center above HUD
    const containerX = width / 2
    const isNarrow = width < 560
    const cardW = Math.min(width - 32, 460)
    const cardH = isNarrow ? 120 : 108
    const containerY = Math.max(cardH / 2 + 10, height - cardH / 2 - 24)

    this.container = this.scene.add.container(containerX, containerY)
    this.container.setScrollFactor(0)
    this.container.setDepth(300)

    // Bubble Background Graphics
    this.bubbleBg = this.scene.add.graphics()
    this.container.add(this.bubbleBg)

    // Speaker Badge Background & Text
    this.speakerBadgeBg = this.scene.add.graphics()
    this.speakerNameText = this.scene.add
      .text(-cardW / 2 + 16, -cardH / 2 + 14, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)

    this.container.add([this.speakerBadgeBg, this.speakerNameText])

    // Progress counter (e.g. 1 / 4)
    this.progressText = this.scene.add
      .text(cardW / 2 - 16, -cardH / 2 + 14, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setOrigin(1, 0.5)
    this.container.add(this.progressText)

    // Dialogue Body Text
    this.lineText = this.scene.add
      .text(-cardW / 2 + 16, -cardH / 2 + 32, '', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: isNarrow ? '12px' : '13px',
        fontStyle: 'normal',
        color: '#f8fafc',
        lineSpacing: 4,
        wordWrap: { width: cardW - 32 },
      })
      .setOrigin(0, 0)
    this.container.add(this.lineText)

    // Continue action hint
    this.hintText = this.scene.add
      .text(cardW / 2 - 16, cardH / 2 - 12, 'TAP / SPACE TO CONTINUE →', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '8.5px',
        fontStyle: 'bold',
        color: '#fbbf24', // amber-400
      })
      .setOrigin(1, 0.5)
    this.container.add(this.hintText)

    // Render base bubble card
    this.redrawBubbleBackground(cardW, cardH)
  }

  private redrawBubbleBackground(cardW: number, cardH: number): void {
    if (!this.bubbleBg) return
    this.bubbleBg.clear()

    // Shadow
    this.bubbleBg.fillStyle(0x000000, 0.5)
    this.bubbleBg.fillRoundedRect(-cardW / 2 + 2, -cardH / 2 + 3, cardW, cardH, 10)

    // Main Card
    this.bubbleBg.fillStyle(0x0b1120, 0.96)
    this.bubbleBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10)

    // Border
    this.bubbleBg.lineStyle(1.5, 0x38bdf8, 0.8)
    this.bubbleBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10)

    // Comic pointer triangle at top
    this.bubbleBg.fillStyle(0x0b1120, 1)
    this.bubbleBg.fillTriangle(-12, -cardH / 2, 12, -cardH / 2, 0, -cardH / 2 - 10)
    this.bubbleBg.lineStyle(1.5, 0x38bdf8, 0.8)
    this.bubbleBg.lineBetween(-12, -cardH / 2, 0, -cardH / 2 - 10)
    this.bubbleBg.lineBetween(0, -cardH / 2 - 10, 12, -cardH / 2)
  }

  private displayCurrentLine(): void {
    if (!this.currentSequence || !this.container) return
    const line: DialogueLine = this.currentSequence.lines[this.currentLineIndex]
    if (!line) return

    // Update Speaker Name
    if (this.speakerNameText) {
      this.speakerNameText.setText(line.speakerName)
      const bounds = this.speakerNameText.getBounds()

      if (this.speakerBadgeBg) {
        this.speakerBadgeBg.clear()
        this.speakerBadgeBg.fillStyle(line.badgeColorHex, 0.95)
        this.speakerBadgeBg.fillRoundedRect(
          this.speakerNameText.x - 6,
          this.speakerNameText.y - 7,
          bounds.width + 12,
          15,
          4
        )
      }
    }

    // Update Progress
    if (this.progressText) {
      const current = this.currentLineIndex + 1
      const total = this.currentSequence.lines.length
      this.progressText.setText(`${current} / ${total}`)
    }

    // Update Line Text
    if (this.lineText) {
      this.lineText.setText(line.text)
    }

    // Pop-in micro animation
    this.container.setScale(0.97)
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: 'Back.easeOut',
    })
  }

  /**
   * Advances to the next line or concludes sequence.
   */
  public advance(): void {
    if (!this.currentSequence || this.isAdvancing) return
    this.isAdvancing = true

    this.currentLineIndex++
    if (this.currentLineIndex >= this.currentSequence.lines.length) {
      const completedId = this.currentSequence.id
      this.destroyContainer()
      this.currentSequence = undefined
      this.isAdvancing = false
      this.onSequenceComplete?.(completedId)
      return
    }

    this.displayCurrentLine()
    this.scene.time.delayedCall(80, () => {
      this.isAdvancing = false
    })
  }

  public isActive(): boolean {
    return Boolean(this.container && this.currentSequence)
  }

  private destroyContainer(): void {
    if (this.container) {
      this.container.destroy()
      this.container = undefined
    }
  }

  public destroy(): void {
    this.destroyContainer()

    if (this.spaceKey) {
      this.spaceKey.off('down', this.handleKeyAdvance, this)
      this.spaceKey = undefined
    }

    if (this.enterKey) {
      this.enterKey.off('down', this.handleKeyAdvance, this)
      this.enterKey = undefined
    }

    if (this.pointerDownHandler) {
      this.scene.input.off('pointerdown', this.pointerDownHandler)
      this.pointerDownHandler = undefined
    }
  }
}
