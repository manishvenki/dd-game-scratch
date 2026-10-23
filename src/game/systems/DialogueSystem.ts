import Phaser from 'phaser'
import { type DialogueSequence, type DialogueLine } from '../dialogue/dialogueTypes'
import { GAME_FONTS } from '../config/typography'
import { audioManager } from './AudioManager'

export type SpeakerPositionResolver = (
  speakerId: string
) => { x: number; y: number; height?: number } | undefined

export interface DialogueSystemConfig {
  readonly scene: Phaser.Scene
  readonly getSpeakerPosition?: SpeakerPositionResolver
  readonly onSequenceComplete?: (sequenceId: string) => void
}

/**
 * DialogueSystem handles presentation and user interaction for comic speech bubbles.
 * Features:
 * - Character-anchored world-to-screen tracking above the active speaker's head
 * - Dynamic speech tail pointing toward the speaking character
 * - Screen viewport boundary clamping to prevent off-screen clipping
 * - Smooth camera scrolling tracking in update loop
 * - Automatic word wrapping and multi-line Tanglish dialogue support
 * - Desktop (Space / Enter / Click) & Mobile (Touch) advance support
 * - Clean event listener management and disposal
 */
export class DialogueSystem {
  private scene: Phaser.Scene
  private getSpeakerPosition?: SpeakerPositionResolver
  private onSequenceComplete?: (sequenceId: string) => void

  private container?: Phaser.GameObjects.Container
  private currentSequence?: DialogueSequence
  private currentLineIndex = 0
  private isAdvancing = false
  private activeSequenceCallback?: () => void

  // Visual sub-elements
  private bubbleBg?: Phaser.GameObjects.Graphics
  private speakerBadgeBg?: Phaser.GameObjects.Graphics
  private speakerNameText?: Phaser.GameObjects.Text
  private lineText?: Phaser.GameObjects.Text
  private hintText?: Phaser.GameObjects.Text
  private progressText?: Phaser.GameObjects.Text

  // Cached layout state to minimize redraws
  private cardWidth = 340
  private cardHeight = 88
  private lastTailX = 0
  private lastIsAbove = true
  private lastClampedX = -999
  private lastClampedY = -999

  // Input listeners
  private spaceKey?: Phaser.Input.Keyboard.Key
  private enterKey?: Phaser.Input.Keyboard.Key
  private pointerDownHandler?: (pointer: Phaser.Input.Pointer) => void

  constructor(config: DialogueSystemConfig) {
    this.scene = config.scene
    this.getSpeakerPosition = config.getSpeakerPosition
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
   * Sets or updates the speaker position resolver callback.
   */
  public setSpeakerResolver(resolver: SpeakerPositionResolver): void {
    this.getSpeakerPosition = resolver
  }

  /**
   * Starts displaying a dialogue sequence.
   */
  public startSequence(
    sequence: DialogueSequence,
    onComplete?: () => void,
    resolver?: SpeakerPositionResolver
  ): void {
    this.destroyContainer()

    if (resolver) {
      this.getSpeakerPosition = resolver
    }

    this.currentSequence = sequence
    this.currentLineIndex = 0
    this.activeSequenceCallback = onComplete

    this.buildDialogueContainer()
    this.displayCurrentLine()
    this.updatePosition()
  }

  private buildDialogueContainer(): void {
    const width = this.scene.scale.width
    const isNarrow = width < 560

    this.cardWidth = Math.min(width - 32, isNarrow ? 380 : 540)
    this.cardHeight = isNarrow ? 130 : 120

    // Screen-space container for sharp font rendering with camera tracking
    this.container = this.scene.add.container(width / 2, 120)
    this.container.setScrollFactor(0)
    this.container.setDepth(300)

    // Bubble Background Graphics
    this.bubbleBg = this.scene.add.graphics()
    this.container.add(this.bubbleBg)

    // Speaker Badge Background & Text
    this.speakerBadgeBg = this.scene.add.graphics()
    this.speakerNameText = this.scene.add
      .text(-this.cardWidth / 2 + 18, -this.cardHeight / 2 + 18, '', {
        fontFamily: GAME_FONTS.heading,
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)

    this.container.add([this.speakerBadgeBg, this.speakerNameText])

    // Progress counter (e.g. 1 / 4)
    this.progressText = this.scene.add
      .text(this.cardWidth / 2 - 18, -this.cardHeight / 2 + 18, '', {
        fontFamily: GAME_FONTS.heading,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#94a3b8',
      })
      .setOrigin(1, 0.5)
    this.container.add(this.progressText)

    // Dialogue Body Text (Multi-line Tanglish with comfortable line height)
    this.lineText = this.scene.add
      .text(-this.cardWidth / 2 + 18, -this.cardHeight / 2 + 38, '', {
        fontFamily: GAME_FONTS.body,
        fontSize: isNarrow ? '16px' : '18px',
        fontStyle: 'bold',
        color: '#ffffff',
        lineSpacing: 5,
        wordWrap: { width: this.cardWidth - 36 },
      })
      .setOrigin(0, 0)
    this.container.add(this.lineText)

    // Continue action hint
    this.hintText = this.scene.add
      .text(this.cardWidth / 2 - 18, this.cardHeight / 2 - 14, 'TAP / SPACE →', {
        fontFamily: GAME_FONTS.heading,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fbbf24', // amber-400
      })
      .setOrigin(1, 0.5)
    this.container.add(this.hintText)

    // Initial background draw
    this.redrawBubbleBackground(this.cardWidth, this.cardHeight, 0, true)
  }

  /**
   * Redraws the dialogue card with dynamic pointer tail directed toward the speaker.
   */
  private redrawBubbleBackground(
    cardW: number,
    cardH: number,
    tailX: number,
    isAboveSpeaker: boolean
  ): void {
    if (!this.bubbleBg) return
    this.bubbleBg.clear()

    this.lastTailX = tailX
    this.lastIsAbove = isAboveSpeaker

    // Outer drop shadow
    this.bubbleBg.fillStyle(0x000000, 0.65)
    this.bubbleBg.fillRoundedRect(-cardW / 2 + 3, -cardH / 2 + 4, cardW, cardH, 12)

    // Main Bubble Body
    this.bubbleBg.fillStyle(0x0b1120, 0.98)
    this.bubbleBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)

    // Vibrant comic border
    this.bubbleBg.lineStyle(2, 0x38bdf8, 0.9) // sky-400
    this.bubbleBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)

    // Tail pointer directed toward speaker
    const clampedTailX = Phaser.Math.Clamp(tailX, -cardW / 2 + 24, cardW / 2 - 24)
    const tailW = 14
    const tailH = 15

    this.bubbleBg.fillStyle(0x0b1120, 1)

    if (isAboveSpeaker) {
      // Bubble is above speaker: tail points DOWN toward speaker head
      const baseY = cardH / 2
      const tipY = baseY + tailH
      this.bubbleBg.fillTriangle(
        clampedTailX - tailW,
        baseY,
        clampedTailX + tailW,
        baseY,
        clampedTailX,
        tipY
      )
      this.bubbleBg.lineStyle(2, 0x38bdf8, 0.9)
      this.bubbleBg.lineBetween(clampedTailX - tailW, baseY, clampedTailX, tipY)
      this.bubbleBg.lineBetween(clampedTailX, tipY, clampedTailX + tailW, baseY)
    } else {
      // Bubble is below speaker: tail points UP toward speaker
      const baseY = -cardH / 2
      const tipY = baseY - tailH
      this.bubbleBg.fillTriangle(
        clampedTailX - tailW,
        baseY,
        clampedTailX + tailW,
        baseY,
        clampedTailX,
        tipY
      )
      this.bubbleBg.lineStyle(2, 0x38bdf8, 0.9)
      this.bubbleBg.lineBetween(clampedTailX - tailW, baseY, clampedTailX, tipY)
      this.bubbleBg.lineBetween(clampedTailX, tipY, clampedTailX + tailW, baseY)
    }
  }

  private displayCurrentLine(): void {
    if (!this.currentSequence || !this.container) return
    const line: DialogueLine = this.currentSequence.lines[this.currentLineIndex]
    if (!line) return

    // Update Speaker Name and Badge Color
    if (this.speakerNameText) {
      this.speakerNameText.setText(line.speakerName)
      const bounds = this.speakerNameText.getBounds()

      if (this.speakerBadgeBg) {
        this.speakerBadgeBg.clear()
        this.speakerBadgeBg.fillStyle(line.badgeColorHex, 0.95)
        this.speakerBadgeBg.fillRoundedRect(
          this.speakerNameText.x - 7,
          this.speakerNameText.y - bounds.height / 2 - 3,
          bounds.width + 14,
          bounds.height + 6,
          4
        )
      }
    }

    // Update Progress (e.g. 1 / 4)
    if (this.progressText) {
      const current = this.currentLineIndex + 1
      const total = this.currentSequence.lines.length
      this.progressText.setText(`${current} / ${total}`)
    }

    // Update Line Text
    if (this.lineText) {
      this.lineText.setText(line.text)
    }

    // Play subtle dialogue blip SFX
    audioManager.playSfx('dialogue')

    // Pop-in scale bounce animation on new line
    this.container.setScale(0.96)
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 110,
      ease: 'Back.easeOut',
    })

    this.updatePosition(true)
  }

  /**
   * Per-frame camera tracking update to lock speech bubbles above the active speaker.
   */
  public update(): void {
    if (this.isActive()) {
      this.updatePosition(false)
    }
  }

  /**
   * Recalculates and smoothly positions the speech bubble above the active speaker.
   */
  private updatePosition(forceRedraw = false): void {
    if (!this.container || !this.currentSequence) return
    const line = this.currentSequence.lines[this.currentLineIndex]
    if (!line) return

    const speakerPos = this.getSpeakerPosition?.(line.speakerId)
    const cam = this.scene.cameras.main
    const viewportW = this.scene.scale.width
    const viewportH = this.scene.scale.height

    const cardW = this.cardWidth
    const cardH = this.cardHeight

    let speakerScreenX = viewportW / 2
    let speakerHeadScreenY = 180

    if (speakerPos) {
      speakerScreenX = speakerPos.x - cam.scrollX
      const characterHeight = speakerPos.height ?? 80
      speakerHeadScreenY = (speakerPos.y - characterHeight) - cam.scrollY
    }

    // Determine vertical placement: preferred above speaker's head
    const verticalGap = 16
    let targetY = speakerHeadScreenY - cardH / 2 - verticalGap
    let isAbove = true

    // Flip below speaker if character is near the top edge of screen
    const topSafeMargin = cardH / 2 + 10
    if (targetY < topSafeMargin) {
      if (speakerPos) {
        targetY = (speakerPos.y - cam.scrollY) + cardH / 2 + verticalGap
        isAbove = false
      }
    }

    // Viewport boundary clamping so bubble never leaves screen
    const minX = cardW / 2 + 8
    const maxX = viewportW - cardW / 2 - 8
    const clampedX = Phaser.Math.Clamp(speakerScreenX, minX, maxX)

    const minY = cardH / 2 + 8
    const maxY = viewportH - cardH / 2 - 8
    const clampedY = Phaser.Math.Clamp(targetY, minY, maxY)

    // Tail pointer points toward the speaker's true horizontal screen position
    const tailLocalX = speakerScreenX - clampedX

    // Redraw tail if position shifted significantly
    const tailShift = Math.abs(tailLocalX - this.lastTailX)
    const isAboveChanged = isAbove !== this.lastIsAbove

    if (forceRedraw || isAboveChanged || tailShift > 3) {
      this.redrawBubbleBackground(cardW, cardH, tailLocalX, isAbove)
    }

    if (
      forceRedraw ||
      Math.abs(clampedX - this.lastClampedX) > 0.5 ||
      Math.abs(clampedY - this.lastClampedY) > 0.5
    ) {
      this.container.setPosition(clampedX, clampedY)
      this.lastClampedX = clampedX
      this.lastClampedY = clampedY
    }
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
      const cb = this.activeSequenceCallback
      this.activeSequenceCallback = undefined
      this.destroyContainer()
      this.currentSequence = undefined
      this.isAdvancing = false
      this.onSequenceComplete?.(completedId)
      cb?.()
      return
    }

    this.displayCurrentLine()
    this.scene.time.delayedCall(70, () => {
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
    this.lastClampedX = -999
    this.lastClampedY = -999
  }

  public destroy(): void {
    this.activeSequenceCallback = undefined
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
