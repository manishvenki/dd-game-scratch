import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { Manish } from '../entities/Manish'
import { Sathish } from '../entities/Sathish'
import { Rahul } from '../entities/Rahul'
import { BengaluruCollegeStreet } from '../environments/BengaluruCollegeStreet'

export interface MainMenuDialogue {
  readonly speaker: string
  readonly text: string
  readonly charKey: 'dennis' | 'manish' | 'sathish' | 'rahul'
}

export const MAIN_MENU_DIALOGUES: readonly MainMenuDialogue[] = [
  { speaker: 'Dennis', text: 'Macha, if I ask her out in Cubbon Park, will she say yes da?', charKey: 'dennis' },
  { speaker: 'Manish', text: 'First finish your degree Dennis, then think about love-u!', charKey: 'manish' },
  { speaker: 'Sathish', text: 'Thatha, two more cutting chai! Extra ginger macha!', charKey: 'sathish' },
  { speaker: 'Rahul', text: 'Dennis, don\'t dream da! Run fast before we catch you!', charKey: 'rahul' },
  { speaker: 'Dennis', text: 'Wait da, let me sip this hot cutting tea first!', charKey: 'dennis' },
  { speaker: 'Manish', text: 'Single tea, double trouble da Dennis-u!', charKey: 'manish' },
  { speaker: 'Sathish', text: 'Bengaluru traffic is slow, but Dennis runs fast da!', charKey: 'sathish' },
  { speaker: 'Rahul', text: 'No escape today macha, tea bill is on you!', charKey: 'rahul' },
  { speaker: 'Dennis', text: 'Bro, today\'s masala chai hits different! So refreshing!', charKey: 'dennis' },
  { speaker: 'Manish', text: 'Drink fast, the chase starts at College Gate Stage 01!', charKey: 'manish' },
]

/**
 * MainMenuScene - Immersive 2D Anime Main Menu set at Thatha Tea, Kalyan Nagar.
 *
 * Features:
 * - Dennis relaxing with cutting chai at the tea stall bench.
 * - Manish, Sathish, and Rahul chilling nearby.
 * - Iconic Thatha Tea counter, brass samovar, bun maska jar, and benches.
 * - Animated steam rising from the tea boiler.
 * - Idle breathing, tea-sipping gestures, and head movements.
 * - Rotating Tanglish comedy dialogue bubbles.
 * - Full responsive camera viewport centered on the tea shop.
 */
export class MainMenuScene extends Phaser.Scene {
  private bengaluruStreet?: BengaluruCollegeStreet
  private dennis?: Dennis
  private manish?: Manish
  private sathish?: Sathish
  private rahul?: Rahul

  // Tea props & accessories
  private dennisTeaGlass?: Phaser.GameObjects.Graphics
  private teaSipTween?: Phaser.Tweens.Tween
  private steamTimer?: Phaser.Time.TimerEvent

  // Dialogue bubble system
  private dialogueBubble?: Phaser.GameObjects.Container
  private dialogueBubbleBg?: Phaser.GameObjects.Graphics
  private dialogueSpeakerText?: Phaser.GameObjects.Text
  private dialogueContentText?: Phaser.GameObjects.Text
  private dialogueTimer?: Phaser.Time.TimerEvent
  private currentDialogueIndex = 0

  // Ground level
  private groundY = 440

  constructor() {
    super({ key: 'MainMenuScene' })
  }

  create(): void {
    const width = this.scale.width
    const height = this.scale.height
    this.groundY = Math.max(380, Math.floor(height * 0.78))
    const stageWidth = 2200

    // 1. Configure World & Camera Bounds
    this.physics.world.setBounds(0, 0, stageWidth, height)
    this.cameras.main.setBounds(0, 0, stageWidth, height)

    // 2. Parallax Environment with Thatha Tea theme
    this.bengaluruStreet = new BengaluruCollegeStreet({
      scene: this,
      stageWidth,
      viewportWidth: width,
      viewportHeight: height,
      groundY: this.groundY,
      theme: 'thatha-tea',
    })

    // 3. Center Camera on the Thatha Tea stall frontage (around x: 840)
    const targetCenterX = 840
    const cameraScrollX = Math.max(0, targetCenterX - width / 2)
    this.cameras.main.scrollX = cameraScrollX

    // 4. Spawn Characters in relaxing stances at the tea shop
    this.spawnCharacters(this.groundY)

    // 5. Add Dennis Cutting Chai Glass & Sipping Animation
    this.setupDennisTeaGesture(this.groundY)

    // 6. Setup Animated Steam from Brass Samovar
    this.setupSamovarSteam(this.groundY)

    // 7. Setup Rotating Tanglish Comic Dialogue Bubbles
    this.setupDialogueBubbles()

    // 8. Handle Window Resize dynamically
    this.scale.on('resize', this.handleResize, this)

    // 9. Teardown on Shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupScene, this)
  }

  private spawnCharacters(groundY: number): void {
    // Manish: Leaning near the tea counter (x: 690)
    this.manish = new Manish(this, {
      x: 695,
      y: groundY - 2,
      idlePhaseOffsetMs: 150,
    })
    this.manish.setDepth(15)

    // Dennis: Standing relaxed near tea bench with chai glass (x: 820)
    this.dennis = new Dennis(this, {
      x: 820,
      y: groundY - 2,
    })
    this.dennis.setDepth(20)

    // Sathish: Relaxing by the tea stools (x: 935)
    this.sathish = new Sathish(this, {
      x: 935,
      y: groundY - 2,
      idlePhaseOffsetMs: 400,
    })
    this.sathish.setDepth(15)

    // Rahul: Lounging near the wooden tea bench (x: 1040)
    this.rahul = new Rahul(this, {
      x: 1040,
      y: groundY - 2,
      idlePhaseOffsetMs: 650,
    })
    this.rahul.setDepth(15)

    // Subtle breathing / head bobble tweens for lively anime feel
    this.tweens.add({
      targets: [this.manish, this.sathish, this.rahul],
      y: groundY - 5,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /**
   * Gives Dennis a cutting chai glass with subtle tea sipping gestures.
   */
  private setupDennisTeaGesture(groundY: number): void {
    if (!this.dennis) return

    // Create small cutting chai glass
    this.dennisTeaGlass = this.add.graphics()
    this.dennisTeaGlass.setDepth(25)

    const drawChaiGlass = (g: Phaser.GameObjects.Graphics) => {
      g.clear()
      // Glass outline
      g.fillStyle(0x38bdf8, 0.4)
      g.fillRoundedRect(-5, -14, 10, 14, 2)
      g.lineStyle(1, 0xe2e8f0, 0.8)
      g.strokeRoundedRect(-5, -14, 10, 14, 2)
      // Hot Cutting Chai (amber/brown)
      g.fillStyle(0xd97706, 0.95)
      g.fillRect(-4, -10, 8, 9)
      // Tea foam line
      g.fillStyle(0xfef08a, 0.85)
      g.fillRect(-4, -11, 8, 2)
    }

    drawChaiGlass(this.dennisTeaGlass)
    this.dennisTeaGlass.setPosition(832, groundY - 42)

    // Dennis raising tea glass to sip every 4.5 seconds
    this.teaSipTween = this.tweens.add({
      targets: this.dennisTeaGlass,
      y: groundY - 60,
      duration: 800,
      hold: 1200,
      yoyo: true,
      repeat: -1,
      repeatDelay: 3500,
      ease: 'Quad.easeInOut',
    })
  }

  /**
   * Animated steaming vapor puffs rising from the brass tea samovar at x: 671.
   */
  private setupSamovarSteam(groundY: number): void {
    const samovarX = 671
    const samovarTopY = groundY - 80

    this.steamTimer = this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => {
        if (!this.scene.isActive()) return
        const puff = this.add.graphics()
        puff.setDepth(12)
        puff.fillStyle(0xffffff, 0.55)
        const radius = Phaser.Math.Between(4, 7)
        puff.fillCircle(0, 0, radius)
        puff.setPosition(samovarX + Phaser.Math.Between(-3, 3), samovarTopY)

        this.tweens.add({
          targets: puff,
          y: samovarTopY - Phaser.Math.Between(28, 48),
          x: puff.x + Phaser.Math.Between(-8, 8),
          alpha: 0,
          scale: 1.6,
          duration: Phaser.Math.Between(1200, 1800),
          ease: 'Sine.easeOut',
          onComplete: () => {
            puff.destroy()
          },
        })
      },
    })
  }

  /**
   * Sets up rotating Tanglish comedy dialogue bubbles anchored above characters.
   */
  private setupDialogueBubbles(): void {
    this.dialogueBubble = this.add.container(0, 0)
    this.dialogueBubble.setDepth(40)
    this.dialogueBubble.setAlpha(0)

    this.dialogueBubbleBg = this.add.graphics()
    this.dialogueBubble.add(this.dialogueBubbleBg)

    this.dialogueSpeakerText = this.add.text(0, 0, '', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f59e0b',
    })
    this.dialogueSpeakerText.setOrigin(0.5, 0.5)
    this.dialogueBubble.add(this.dialogueSpeakerText)

    this.dialogueContentText = this.add.text(0, 0, '', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px',
      color: '#0f172a',
      fontStyle: '600',
      align: 'center',
      wordWrap: { width: 220 },
    })
    this.dialogueContentText.setOrigin(0.5, 0.5)
    this.dialogueBubble.add(this.dialogueContentText)

    // Show initial dialogue after short pause
    this.time.delayedCall(1200, () => {
      this.showNextDialogue()
    })

    // Cycle dialogue every 4.2 seconds
    this.dialogueTimer = this.time.addEvent({
      delay: 4200,
      loop: true,
      callback: () => {
        this.showNextDialogue()
      },
    })
  }

  private showNextDialogue(): void {
    if (!this.dialogueBubble || !this.dialogueBubbleBg || !this.dialogueSpeakerText || !this.dialogueContentText) return

    const dialogue = MAIN_MENU_DIALOGUES[this.currentDialogueIndex]
    this.currentDialogueIndex = (this.currentDialogueIndex + 1) % MAIN_MENU_DIALOGUES.length

    // Determine target character position
    let targetX = 820
    let targetY = this.groundY - 110
    let speakerColor = '#f59e0b'

    switch (dialogue.charKey) {
      case 'dennis':
        targetX = this.dennis ? this.dennis.x : 820
        targetY = this.groundY - 105
        speakerColor = '#38bdf8'
        break
      case 'manish':
        targetX = this.manish ? this.manish.x : 695
        targetY = this.groundY - 105
        speakerColor = '#ef4444'
        break
      case 'sathish':
        targetX = this.sathish ? this.sathish.x : 935
        targetY = this.groundY - 105
        speakerColor = '#22c55e'
        break
      case 'rahul':
        targetX = this.rahul ? this.rahul.x : 1040
        targetY = this.groundY - 105
        speakerColor = '#f97316'
        break
    }

    this.dialogueSpeakerText.setText(dialogue.speaker.toUpperCase())
    this.dialogueSpeakerText.setColor(speakerColor)
    this.dialogueContentText.setText(dialogue.text)

    // Measure bubble size
    const contentBounds = this.dialogueContentText.getBounds()
    const bubbleWidth = Math.max(160, Math.min(240, contentBounds.width + 24))
    const bubbleHeight = contentBounds.height + 34

    // Position text inside container
    this.dialogueSpeakerText.setPosition(0, -bubbleHeight / 2 + 12)
    this.dialogueContentText.setPosition(0, 4)

    // Draw speech bubble with pointer tail
    this.dialogueBubbleBg.clear()
    // Drop shadow
    this.dialogueBubbleBg.fillStyle(0x000000, 0.25)
    this.dialogueBubbleBg.fillRoundedRect(-bubbleWidth / 2 + 2, -bubbleHeight / 2 + 3, bubbleWidth, bubbleHeight, 8)
    // Bubble body
    this.dialogueBubbleBg.fillStyle(0xffffff, 0.98)
    this.dialogueBubbleBg.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 8)
    // Border
    this.dialogueBubbleBg.lineStyle(2, 0x0f172a, 0.85)
    this.dialogueBubbleBg.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 8)
    // Speech pointer tail pointing to character head
    this.dialogueBubbleBg.fillStyle(0xffffff, 0.98)
    this.dialogueBubbleBg.fillTriangle(-8, bubbleHeight / 2, 8, bubbleHeight / 2, 0, bubbleHeight / 2 + 8)
    this.dialogueBubbleBg.lineBetween(-8, bubbleHeight / 2, 0, bubbleHeight / 2 + 8)
    this.dialogueBubbleBg.lineBetween(0, bubbleHeight / 2 + 8, 8, bubbleHeight / 2)

    this.dialogueBubble.setPosition(targetX, targetY - bubbleHeight / 2)

    // Smooth pop-in animation
    this.dialogueBubble.setAlpha(0)
    this.dialogueBubble.setScale(0.85)
    this.tweens.add({
      targets: this.dialogueBubble,
      alpha: 1,
      scale: 1,
      duration: 250,
      ease: 'Back.easeOut',
    })
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width
    const height = gameSize.height
    this.groundY = Math.max(380, Math.floor(height * 0.78))

    const targetCenterX = 840
    const cameraScrollX = Math.max(0, targetCenterX - width / 2)
    this.cameras.main.scrollX = cameraScrollX
  }

  private cleanupScene(): void {
    if (this.dialogueTimer) {
      this.dialogueTimer.destroy()
      this.dialogueTimer = undefined
    }
    if (this.steamTimer) {
      this.steamTimer.destroy()
      this.steamTimer = undefined
    }
    if (this.teaSipTween) {
      this.teaSipTween.destroy()
      this.teaSipTween = undefined
    }
    if (this.bengaluruStreet) {
      this.bengaluruStreet.destroy()
      this.bengaluruStreet = undefined
    }
    this.scale.off('resize', this.handleResize, this)
  }
}
