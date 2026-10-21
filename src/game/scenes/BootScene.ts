import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { Manish } from '../entities/Manish'
import { Sathish } from '../entities/Sathish'
import { Rahul } from '../entities/Rahul'
import { BlockingEnemy } from '../entities/BlockingEnemy'
import { PlayerController } from '../systems/PlayerController'
import { BengaluruCollegeStreet } from '../environments/BengaluruCollegeStreet'
import { CombatSystem } from '../systems/CombatSystem'
import { type LevelId, type LevelConfig } from '../levels/levelTypes'
import { getLevelConfig } from '../levels/levelConfigs'

export class BootScene extends Phaser.Scene {
  // Level State
  private currentLevelId: LevelId = 'level-1'
  private levelConfig!: LevelConfig
  private encounterState: 'intro' | 'blocking' | 'chase' | 'caught' | 'cleared' = 'intro'

  // Screen-anchored HUD elements (ScrollFactor 0)
  private titleText?: Phaser.GameObjects.Text
  private subtitleText?: Phaser.GameObjects.Text
  private statusBadge?: Phaser.GameObjects.Container
  private statusText?: Phaser.GameObjects.Text
  private statusBg?: Phaser.GameObjects.Graphics
  private controlGuideText?: Phaser.GameObjects.Text
  private playerStatusText?: Phaser.GameObjects.Text
  private playerStatusBg?: Phaser.GameObjects.Graphics
  private objectiveText?: Phaser.GameObjects.Text
  private objectiveBg?: Phaser.GameObjects.Graphics

  // Active Overlays
  private overlayContainer?: Phaser.GameObjects.Container

  // Environment & Parallax
  private bengaluruStreet?: BengaluruCollegeStreet

  // Characters
  private dennis?: Dennis
  private manish?: Manish
  private sathish?: Sathish
  private rahul?: Rahul

  // Blocking Enemies
  private blockingEnemies: BlockingEnemy[] = []
  private blockerColliders: Phaser.Physics.Arcade.Collider[] = []

  // Movement & Physics
  private playerController?: PlayerController
  private groundGroup?: Phaser.Physics.Arcade.StaticGroup
  private groundCollider?: Phaser.Physics.Arcade.Collider

  // Exit goal graphic
  private exitGoalVisual?: Phaser.GameObjects.Graphics
  private exitGoalLabel?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    // Read initial level from URL hash query if present (e.g. #/play?level=2)
    this.currentLevelId = this.detectInitialLevel()
    this.levelConfig = getLevelConfig(this.currentLevelId)

    const width = this.scale.width
    const height = this.scale.height
    const stageWidth = this.levelConfig.stageWidth
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

    // 4. Setup Level Entities (Dennis, Blockers, Chasers, Exit Goal)
    this.setupLevelEntities(groundY)

    // 5. Setup Screen-Anchored HUD
    this.setupScreenHud()

    // 6. Initial Layout update based on dimensions
    this.updateLayout(width, height)

    // 7. Show Level Intro Modal / Overlay
    this.showLevelIntroOverlay()

    // 8. Bind scale resize event
    this.scale.on('resize', this.handleResize, this)

    // 9. Clean up event listeners on shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)

    // Expose global hook for level switching from React UI
    ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: LevelId) => void }).__DD_LOAD_LEVEL__ = (id: LevelId) => {
      this.loadLevel(id)
    }
  }

  private detectInitialLevel(): LevelId {
    const hash = window.location.hash
    if (hash.includes('level=2')) return 'level-2'
    return 'level-1'
  }

  /**
   * Switches to and initializes a specific level cleanly.
   */
  public loadLevel(levelId: LevelId): void {
    this.currentLevelId = levelId
    this.levelConfig = getLevelConfig(levelId)
    this.encounterState = 'intro'

    const width = this.scale.width
    const height = this.scale.height
    const stageWidth = this.levelConfig.stageWidth
    const groundY = this.getGroundY(height)

    // Clear old blockers and colliders
    this.clearEncounterEntities()

    // Clear overlays
    if (this.overlayContainer) {
      this.overlayContainer.destroy()
      this.overlayContainer = undefined
    }

    // Update Physics & Camera Bounds
    this.physics.world.setBounds(0, 0, stageWidth, height)
    this.cameras.main.setBounds(0, 0, stageWidth, height)

    // Rebuild Ground Platform
    this.buildGroundPlatform(stageWidth, height)

    // Resize Environment
    if (this.bengaluruStreet) {
      this.bengaluruStreet.resize(width, height, stageWidth, groundY)
    }

    // Setup new Level Entities
    this.setupLevelEntities(groundY)

    // Update Layout and Intro
    this.updateLayout(width, height)
    this.showLevelIntroOverlay()
  }

  private clearEncounterEntities(): void {
    for (const collider of this.blockerColliders) {
      collider.destroy()
    }
    this.blockerColliders = []

    for (const enemy of this.blockingEnemies) {
      enemy.destroy()
    }
    this.blockingEnemies = []

    if (this.exitGoalVisual) {
      this.exitGoalVisual.destroy()
      this.exitGoalVisual = undefined
    }

    if (this.exitGoalLabel) {
      this.exitGoalLabel.destroy()
      this.exitGoalLabel = undefined
    }
  }

  /**
   * Sets up player, blockers, chasers, and goal for the active level.
   */
  private setupLevelEntities(groundY: number): void {
    const cfg = this.levelConfig

    // 1. Controllable Dennis Protagonist & Player Controller
    if (!this.dennis) {
      this.dennis = new Dennis(this, { x: cfg.playerSpawnX, y: groundY })
      this.playerController = new PlayerController({
        scene: this,
        dennis: this.dennis,
        initialX: cfg.playerSpawnX,
        initialY: groundY,
        moveSpeed: 260,
        jumpSpeed: 520,
        onAttack: (attackData) => this.handlePlayerAttack(attackData),
      })

      // Camera Follows Dennis smoothly
      this.cameras.main.startFollow(
        this.playerController.getPhysicsBody(),
        true,
        0.08,
        0.08,
        0,
        30
      )

      // Player Ground Collision
      if (this.groundGroup) {
        this.groundCollider = this.physics.add.collider(
          this.playerController.getPhysicsBody(),
          this.groundGroup
        )
      }
    } else {
      this.playerController?.setPosition(cfg.playerSpawnX, groundY)
      this.playerController?.setFrozen(false)
    }

    // 2. Spawn Blocking Enemies for this level
    for (const bCfg of cfg.blockers) {
      const enemy = new BlockingEnemy(this, bCfg, groundY)
      this.blockingEnemies.push(enemy)

      // Add collision between player physics proxy and enemy physics proxy
      if (this.playerController) {
        const collider = this.physics.add.collider(
          this.playerController.getPhysicsBody(),
          enemy.getPhysicsBody()
        )
        this.blockerColliders.push(collider)
      }
    }

    // 3. Setup Chasers
    if (cfg.hasChaseSequence && cfg.chasers && cfg.chasers.length > 0) {
      // In Level 1: Position chasers initially behind Dennis (e.g., at spawn positions)
      if (!this.sathish) {
        this.sathish = new Sathish(this, { x: 200, y: groundY, idlePhaseOffsetMs: 400 })
      } else {
        this.sathish.setPosition(200, groundY)
      }

      if (!this.manish) {
        this.manish = new Manish(this, { x: 130, y: groundY, idlePhaseOffsetMs: 200 })
      } else {
        this.manish.setPosition(130, groundY)
      }

      if (!this.rahul) {
        this.rahul = new Rahul(this, { x: 60, y: groundY, idlePhaseOffsetMs: 600 })
      } else {
        this.rahul.setPosition(60, groundY)
      }
    } else {
      // In Level 2: Chasers remain stationary background observers near beginning of stage
      if (this.sathish) this.sathish.setPosition(160, groundY)
      if (this.manish) this.manish.setPosition(100, groundY)
      if (this.rahul) this.rahul.setPosition(40, groundY)
    }

    // 4. Create Exit Goal Marker at exitGoalX
    this.createExitGoalVisual(cfg.exitGoalX, groundY, cfg.exitGoalLabel)
  }

  private createExitGoalVisual(x: number, groundY: number, label: string): void {
    this.exitGoalVisual = this.add.graphics()
    const g = this.exitGoalVisual

    // Animated checkpoint banner / bus stop shelter
    const topY = groundY - 110
    g.fillStyle(0x0284c7, 0.9)
    g.fillRect(x - 25, topY, 50, 14)
    g.lineStyle(2, 0x38bdf8, 1)
    g.strokeRect(x - 25, topY, 50, 14)

    // Poles
    g.fillStyle(0x334155, 1)
    g.fillRect(x - 22, topY + 14, 4, 96)
    g.fillRect(x + 18, topY + 14, 4, 96)

    // Pulsing goal arrow
    g.fillStyle(0xfbbf24, 0.9)
    g.fillTriangle(x - 12, topY - 16, x + 12, topY - 16, x, topY - 4)

    this.exitGoalLabel = this.add
      .text(x, topY + 7, label, {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
  }

  /**
   * Screen-anchored HUD setup.
   */
  private setupScreenHud(): void {
    // Title
    this.titleText = this.add
      .text(0, 0, this.levelConfig.title.toUpperCase(), {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100)

    // Subtitle
    this.subtitleText = this.add
      .text(0, 0, `${this.levelConfig.stageNumber} • ${this.levelConfig.subtitle}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
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
      .text(0, 0, 'PHASER 3.90 • COMBAT & ENCOUNTERS ACTIVE', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#34d399', // emerald-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.statusBadge = this.add
      .container(0, 0, [this.statusBg, this.statusText])
      .setScrollFactor(0)
      .setDepth(100)

    // Objective Badge
    this.objectiveBg = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.objectiveText = this.add
      .text(0, 0, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#fef08a',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(101)

    // Control Guide
    this.controlGuideText = this.add
      .text(0, 0, '[A/D or ←/→] MOVE  •  [SPACE or ↑] JUMP  •  [J or X] ATTACK', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '8.5px',
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
        fontFamily: 'ui-monospace, Menlo, monospace',
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
   * Handles player attack execution against blocking enemies.
   */
  private handlePlayerAttack(attackData: { x: number; y: number; facing: 1 | -1 }): void {
    if (this.encounterState === 'caught' || this.encounterState === 'cleared') return

    const result = CombatSystem.resolvePlayerAttack(
      attackData.x,
      attackData.y,
      attackData.facing,
      this.blockingEnemies
    )

    if (result.hit) {
      // Check if all blocking enemies have been defeated
      const allDefeated = CombatSystem.areAllEnemiesDefeated(this.blockingEnemies)

      if (allDefeated) {
        if (this.levelConfig.hasChaseSequence) {
          this.triggerChaseSequence()
        } else {
          this.triggerObjectiveUpdated('ENCOUNTER RESOLVED! SPRINT TO THE EXIT!')
        }
      } else {
        const remaining = this.blockingEnemies.filter((e) => !e.isDefeated()).length
        this.triggerObjectiveUpdated(`BLOCKERS REMAINING: ${remaining}`)
      }
    }
  }

  /**
   * Starts the chaser pursuit in Level 1 after the opening confrontation.
   */
  private triggerChaseSequence(): void {
    this.encounterState = 'chase'

    // Show temporary announcement banner
    const width = this.scale.width
    const banner = this.add.container(width / 2, 120).setScrollFactor(0).setDepth(120)
    const bg = this.add.graphics()
    bg.fillStyle(0x7f1d1d, 0.95)
    bg.lineStyle(2, 0xef4444, 1)
    bg.fillRoundedRect(-170, -20, 340, 40, 6)
    bg.strokeRoundedRect(-170, -20, 340, 40, 6)

    const txt = this.add.text(0, 0, 'TRIO SPOTTED DENNIS!\nCHASE IS ON! SPRINT TO THE BUS STOP!', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fef08a',
      align: 'center',
    }).setOrigin(0.5, 0.5)

    banner.add([bg, txt])

    this.tweens.add({
      targets: banner,
      alpha: 0,
      delay: 2200,
      duration: 500,
      onComplete: () => banner.destroy(),
    })
  }

  private triggerObjectiveUpdated(text: string): void {
    if (this.objectiveText) {
      this.objectiveText.setText(text)
      this.updateObjectiveBadge()
    }
  }

  /**
   * Per-frame update loop.
   */
  override update(): void {
    if (this.bengaluruStreet) {
      this.bengaluruStreet.update()
    }

    if (this.playerController) {
      this.playerController.update()
      this.updatePlayerStatusFeedback()
    }

    // 1. Chaser movement during Level 1 Chase
    if (this.encounterState === 'chase' && this.levelConfig.hasChaseSequence) {
      this.updateChaserPursuit()
    }

    // 2. Level Exit Goal Reached Check
    if (this.playerController && this.encounterState !== 'cleared' && this.encounterState !== 'caught') {
      const playerPos = this.playerController.getPosition()
      if (playerPos.x >= this.levelConfig.exitGoalX) {
        this.triggerLevelComplete()
      }
    }
  }

  /**
   * Updates horizontal chase movement for Manish, Sathish, and Rahul.
   */
  private updateChaserPursuit(): void {
    if (!this.playerController) return
    const playerPos = this.playerController.getPosition()

    // Chaser speed configurations
    const chasers = [
      { chaser: this.sathish, speed: 185, targetOffset: 70 },
      { chaser: this.manish, speed: 175, targetOffset: 120 },
      { chaser: this.rahul, speed: 165, targetOffset: 170 },
    ]

    for (const item of chasers) {
      if (!item.chaser) continue
      const chaser = item.chaser
      const dx = playerPos.x - chaser.x

      // Move horizontally towards Dennis
      if (dx > 10) {
        chaser.x += (item.speed * this.game.loop.delta) / 1000
      } else if (dx < -10) {
        chaser.x -= (item.speed * this.game.loop.delta) / 1000
      }

      // Catch check: if chaser reaches Dennis
      const dist = Phaser.Math.Distance.Between(chaser.x, chaser.y, playerPos.x, playerPos.y)
      if (dist < 34) {
        this.triggerDennisCaught(chaser)
        break
      }
    }
  }

  /**
   * Triggered when a chaser catches Dennis.
   */
  private triggerDennisCaught(chaser: Sathish | Manish | Rahul): void {
    this.encounterState = 'caught'
    this.playerController?.setFrozen(true)

    // Character name
    const chaserName = chaser instanceof Sathish ? 'Sathish' : chaser instanceof Manish ? 'Manish' : 'Rahul'

    this.showModalOverlay({
      title: 'DENNIS WAS CAUGHT!',
      subtitle: `${chaserName} caught up with Dennis!`,
      accentColor: 0xef4444,
      buttons: [
        {
          label: 'RETRY LEVEL',
          onClick: () => this.loadLevel(this.currentLevelId),
        },
      ],
    })
  }

  /**
   * Triggered when Dennis reaches the exit goal.
   */
  private triggerLevelComplete(): void {
    this.encounterState = 'cleared'
    this.playerController?.setFrozen(true)

    if (this.currentLevelId === 'level-1') {
      this.showModalOverlay({
        title: 'LEVEL 1 COMPLETE!',
        subtitle: 'Dennis successfully cleared the college gate encounter and outran the trio!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY LEVEL 2 →',
            onClick: () => this.loadLevel('level-2'),
          },
          {
            label: 'REPLAY LEVEL 1',
            onClick: () => this.loadLevel('level-1'),
          },
        ],
      })
    } else {
      this.showModalOverlay({
        title: 'LEVEL 2 COMPLETE!',
        subtitle: 'Dennis defeated both street blockers and escaped to the avenue crossroad!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY AGAIN (LEVEL 2)',
            onClick: () => this.loadLevel('level-2'),
          },
          {
            label: 'BACK TO LEVEL 1',
            onClick: () => this.loadLevel('level-1'),
          },
        ],
      })
    }
  }

  /**
   * Shows the opening level introduction overlay.
   */
  private showLevelIntroOverlay(): void {
    const cfg = this.levelConfig
    const width = this.scale.width
    const height = this.scale.height

    const overlay = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200)
    const cardW = Math.min(width - 32, 420)
    const cardH = 175

    const bg = this.add.graphics()
    bg.fillStyle(0x090d16, 0.95)
    bg.lineStyle(2, 0xf59e0b, 0.9) // amber-500
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8)
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8)

    const stageNum = this.add.text(0, -cardH / 2 + 22, cfg.stageNumber, {
      fontFamily: 'ui-monospace, Menlo, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f59e0b',
    }).setOrigin(0.5, 0.5)

    const title = this.add.text(0, -cardH / 2 + 45, cfg.title.toUpperCase(), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5)

    const obj = this.add.text(0, -cardH / 2 + 82, cfg.objectiveText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: cardW - 36 },
    }).setOrigin(0.5, 0.5)

    const startBtnBg = this.add.graphics()
    startBtnBg.fillStyle(0xd97706, 1)
    startBtnBg.fillRoundedRect(-cardW / 2 + 20, 38, cardW - 40, 34, 6)

    const startBtnTxt = this.add.text(0, 55, 'START ENCOUNTER (TAP OR MOVE)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5)

    overlay.add([bg, stageNum, title, obj, startBtnBg, startBtnTxt])
    this.overlayContainer = overlay

    let dismissed = false
    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      if (this.overlayContainer === overlay) {
        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 180,
          onComplete: () => {
            overlay.destroy()
            if (this.overlayContainer === overlay) {
              this.overlayContainer = undefined
            }
          },
        })
        this.encounterState = 'blocking'
        const remaining = this.blockingEnemies.filter((e) => !e.isDefeated()).length
        this.triggerObjectiveUpdated(`OBJECTIVE: DEFEAT BLOCKERS (${remaining} REMAINING)`)
      }
    }

    // Dismiss on pointerdown anywhere on canvas
    this.input.once('pointerdown', dismiss)

    // Auto-dismiss after 2.5s so gameplay proceeds seamlessly
    this.time.delayedCall(2500, dismiss)
  }

  /**
   * Reusable modal overlay for Victory / Defeat.
   */
  private showModalOverlay(config: {
    title: string
    subtitle: string
    accentColor: number
    buttons: Array<{ label: string; onClick: () => void }>
  }): void {
    if (this.overlayContainer) {
      this.overlayContainer.destroy()
    }

    const width = this.scale.width
    const height = this.scale.height

    const overlay = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200)
    const cardW = Math.min(width - 32, 400)
    const cardH = 175

    const bg = this.add.graphics()
    bg.fillStyle(0x090d16, 0.95)
    bg.lineStyle(2, config.accentColor, 1)
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8)
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8)

    const title = this.add.text(0, -cardH / 2 + 32, config.title, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5)

    const sub = this.add.text(0, -cardH / 2 + 65, config.subtitle, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11.5px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: cardW - 36 },
    }).setOrigin(0.5, 0.5)

    overlay.add([bg, title, sub])

    // Render Buttons
    const btnCount = config.buttons.length
    const btnW = btnCount === 1 ? 160 : 130
    const totalW = btnCount * btnW + (btnCount - 1) * 12
    const startX = -totalW / 2 + btnW / 2

    config.buttons.forEach((btnCfg, index) => {
      const bx = startX + index * (btnW + 12)
      const bBg = this.add.graphics()
      bBg.fillStyle(config.accentColor, 1)
      bBg.fillRoundedRect(bx - btnW / 2, 40, btnW, 30, 6)

      const bTxt = this.add.text(bx, 55, btnCfg.label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5, 0.5)

      overlay.add([bBg, bTxt])
    })

    this.overlayContainer = overlay

    // Direct pointer down on screen executes button action
    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.overlayContainer !== overlay) return
      overlay.destroy()
      this.overlayContainer = undefined

      if (config.buttons.length > 1) {
        if (pointer.x < width / 2) {
          config.buttons[0].onClick()
        } else {
          config.buttons[1].onClick()
        }
      } else {
        config.buttons[0].onClick()
      }
    })
  }

  private updateObjectiveBadge(): void {
    if (!this.objectiveText || !this.objectiveBg) return

    const textBounds = this.objectiveText.getBounds()
    const padX = 10
    const padY = 3.5
    const bgW = textBounds.width + padX * 2
    const bgH = textBounds.height + padY * 2

    this.objectiveBg.clear()
    this.objectiveBg.fillStyle(0x0f172a, 0.85)
    this.objectiveBg.lineStyle(1, 0xf59e0b, 0.7)
    this.objectiveBg.fillRoundedRect(
      this.objectiveText.x - bgW / 2,
      this.objectiveText.y - bgH / 2,
      bgW,
      bgH,
      4
    )
    this.objectiveBg.strokeRoundedRect(
      this.objectiveText.x - bgW / 2,
      this.objectiveText.y - bgH / 2,
      bgW,
      bgH,
      4
    )
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

  private getGroundY(height: number): number {
    return height - 54
  }

  private buildGroundPlatform(stageWidth: number, height: number): void {
    const groundY = this.getGroundY(height)
    const platformHeight = height - groundY + 40

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

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.updateLayout(gameSize.width, gameSize.height)
  }

  private updateLayout(width: number, height: number): void {
    const centerX = width / 2
    const stageWidth = this.levelConfig.stageWidth
    const groundY = this.getGroundY(height)
    const isNarrow = width < 560
    const isShort = height < 440

    // Update Bounds
    this.physics.world.setBounds(0, 0, stageWidth, height)
    this.cameras.main.setBounds(0, 0, stageWidth, height)

    // Rebuild Ground
    this.buildGroundPlatform(stageWidth, height)

    // Resize Environment
    if (this.bengaluruStreet) {
      this.bengaluruStreet.resize(width, height, stageWidth, groundY)
    }

    // Responsive Header Positioning
    const titleSize = isNarrow ? Math.max(15, Math.floor(width * 0.044)) : 22
    const subtitleSize = isNarrow ? Math.max(10, Math.floor(width * 0.023)) : 12

    const headerBaseY = isShort ? 14 : Math.max(20, height * 0.075)

    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`)
      this.titleText.setText(this.levelConfig.title.toUpperCase())
      this.titleText.setPosition(centerX, headerBaseY)
    }

    if (this.subtitleText) {
      this.subtitleText.setFontSize(`${subtitleSize}px`)
      this.subtitleText.setText(`${this.levelConfig.stageNumber} • ${this.levelConfig.subtitle}`)
      this.subtitleText.setPosition(centerX, headerBaseY + (isShort ? 16 : 20))
    }

    if (this.statusBadge && this.statusText && this.statusBg) {
      const badgeY = headerBaseY + (isShort ? 34 : 41)
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

    if (this.objectiveText) {
      const objY = headerBaseY + (isShort ? 52 : 62)
      this.objectiveText.setPosition(centerX, objY)
      this.updateObjectiveBadge()
    }

    // Controls Guide
    if (this.controlGuideText) {
      const guideY = isShort ? groundY - 14 : groundY - 18
      this.controlGuideText.setFontSize(isNarrow ? '7.5px' : '8.5px')
      this.controlGuideText.setPosition(centerX, guideY)
    }

    if (this.playerStatusText) {
      this.playerStatusText.setPosition(centerX, height - 20)
    }

    // Keep Dennis on ground within boundaries
    if (this.playerController) {
      const currentPos = this.playerController.getPosition()
      const clampedX = Phaser.Math.Clamp(currentPos.x, 30, stageWidth - 30)
      if (currentPos.y > groundY || currentPos.x !== clampedX) {
        this.playerController.setPosition(clampedX, groundY)
      }
    }
  }

  private cleanup(): void {
    this.scale.off('resize', this.handleResize, this)

    if (this.groundCollider) {
      this.groundCollider.destroy()
      this.groundCollider = undefined
    }

    this.clearEncounterEntities()

    if (this.overlayContainer) {
      this.overlayContainer.destroy()
      this.overlayContainer = undefined
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

    ;(window as unknown as { __DD_LOAD_LEVEL__?: unknown }).__DD_LOAD_LEVEL__ = undefined
  }
}
