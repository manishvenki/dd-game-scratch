import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { Manish } from '../entities/Manish'
import { Sathish } from '../entities/Sathish'
import { Rahul } from '../entities/Rahul'
import { BlockingEnemy } from '../entities/BlockingEnemy'
import { PlayerController } from '../systems/PlayerController'
import { BengaluruCollegeStreet } from '../environments/BengaluruCollegeStreet'
import { CombatSystem } from '../systems/CombatSystem'
import { type LevelId, type LevelConfig, type LevelInteractionConfig } from '../levels/levelTypes'
import { getLevelConfig } from '../levels/levelConfigs'
import { DialogueSystem } from '../systems/DialogueSystem'
import {
  CATCH_DIALOGUE_MANISH,
  CATCH_DIALOGUE_SATHISH,
  CATCH_DIALOGUE_RAHUL,
  LEVEL_3_REVEAL_DIALOGUE,
  LEVEL_4_CAFE_DIALOGUE,
} from '../dialogue/dialogueData'

export class BootScene extends Phaser.Scene {
  // Level State
  private currentLevelId: LevelId = 'level-1'
  private levelConfig!: LevelConfig
  private encounterState: 'intro' | 'active' | 'dialogue' | 'caught' | 'cleared' = 'intro'
  private interactionTriggered = false

  // Dialogue System
  private dialogueSystem?: DialogueSystem

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
    // Read initial level from URL hash query if present (e.g. #/play?level=3)
    this.currentLevelId = this.detectInitialLevel()
    this.levelConfig = getLevelConfig(this.currentLevelId)
    this.encounterState = 'intro'
    this.interactionTriggered = false

    const width = this.scale.width
    const height = this.scale.height
    const stageWidth = this.levelConfig.stageWidth
    const groundY = this.getGroundY(height)

    // 1. Configure World Physics & Camera Bounds
    this.physics.world.setBounds(0, 0, stageWidth, height)
    this.cameras.main.setBounds(0, 0, stageWidth, height)

    // 2. Build Bengaluru Parallax Environment with level-specific theme
    this.bengaluruStreet = new BengaluruCollegeStreet({
      scene: this,
      stageWidth,
      viewportWidth: width,
      viewportHeight: height,
      groundY,
      theme: this.levelConfig.theme,
    })

    // 3. Ground Platform Static Body (aligned with visible sidewalk/road)
    this.groundGroup = this.physics.add.staticGroup()
    this.buildGroundPlatform(stageWidth, height)

    // 4. Setup Level Entities (Dennis, Blockers, Chasers, Exit Goal)
    this.setupLevelEntities(groundY)

    // 5. Setup Dialogue System
    this.dialogueSystem = new DialogueSystem({ scene: this })

    // 6. Setup Screen-Anchored HUD
    this.setupScreenHud()

    // 7. Initial Layout update based on dimensions
    this.updateLayout(width, height)

    // 8. Show Level Intro Modal / Overlay
    this.showLevelIntroOverlay()

    // 9. Bind scale resize event
    this.scale.on('resize', this.handleResize, this)

    // 10. Clean up event listeners on shutdown
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this)

    // Expose global hook for level switching from React UI
    ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: LevelId) => void }).__DD_LOAD_LEVEL__ = (id: LevelId) => {
      this.loadLevel(id)
    }
  }

  private detectInitialLevel(): LevelId {
    const hash = window.location.hash
    if (hash.includes('level=4')) return 'level-4'
    if (hash.includes('level=3')) return 'level-3'
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
    this.interactionTriggered = false

    const width = this.scale.width
    const height = this.scale.height
    const stageWidth = this.levelConfig.stageWidth
    const groundY = this.getGroundY(height)

    // Clear old blockers and colliders
    this.clearEncounterEntities()

    // Clear active dialogue
    if (this.dialogueSystem) {
      this.dialogueSystem.destroy()
      this.dialogueSystem = new DialogueSystem({ scene: this })
    }

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

    // Resize Environment with new theme
    if (this.bengaluruStreet) {
      this.bengaluruStreet.resize(width, height, stageWidth, groundY, this.levelConfig.theme)
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
      const chaserConfigs = new Map(cfg.chasers.map((c) => [c.chaserId, c]))
      const sSpawn = chaserConfigs.get('sathish')?.spawnX ?? 140
      const mSpawn = chaserConfigs.get('manish')?.spawnX ?? 80
      const rSpawn = chaserConfigs.get('rahul')?.spawnX ?? 20

      if (!this.sathish) {
        this.sathish = new Sathish(this, { x: sSpawn, y: groundY, idlePhaseOffsetMs: 400 })
      } else {
        this.sathish.setPosition(sSpawn, groundY)
        this.sathish.setVisible(true)
      }

      if (!this.manish) {
        this.manish = new Manish(this, { x: mSpawn, y: groundY, idlePhaseOffsetMs: 200 })
      } else {
        this.manish.setPosition(mSpawn, groundY)
        this.manish.setVisible(true)
      }

      if (!this.rahul) {
        this.rahul = new Rahul(this, { x: rSpawn, y: groundY, idlePhaseOffsetMs: 600 })
      } else {
        this.rahul.setPosition(rSpawn, groundY)
        this.rahul.setVisible(true)
      }
    } else {
      // Hide chasers for levels without pursuit (Level 2)
      if (this.sathish) this.sathish.setVisible(false)
      if (this.manish) this.manish.setVisible(false)
      if (this.rahul) this.rahul.setVisible(false)
    }

    // 4. Create Exit Goal Marker at exitGoalX
    this.createExitGoalVisual(cfg.exitGoalX, groundY, cfg.exitGoalLabel)
  }

  private createExitGoalVisual(x: number, groundY: number, label: string): void {
    this.exitGoalVisual = this.add.graphics()
    const g = this.exitGoalVisual

    // Animated checkpoint banner / exit portal
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
      .text(0, 0, 'PHASER 3.90 • PURSUIT & COMIC DIALOGUE ACTIVE', {
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
   * Chasers do NOT pause or freeze while Dennis attacks.
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
      const allDefeated = CombatSystem.areAllEnemiesDefeated(this.blockingEnemies)

      if (allDefeated) {
        if (this.levelConfig.hasChaseSequence) {
          this.triggerObjectiveUpdated('ALL BLOCKERS DEFEATED! SPRINT TO THE EXIT!')
        } else {
          this.triggerObjectiveUpdated('ENCOUNTER RESOLVED! SPRINT TO THE EXIT!')
        }
      } else {
        const remaining = this.blockingEnemies.filter((e) => !e.isDefeated()).length
        this.triggerObjectiveUpdated(`BLOCKERS REMAINING: ${remaining} • TRIO IS CLOSING IN!`)
      }
    }
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

    // 1. Chaser continuous pursuit during active gameplay or controlled approach in dialogue
    if (this.levelConfig.hasChaseSequence) {
      if (this.encounterState === 'active') {
        this.updateChaserPursuit(false)
      } else if (this.encounterState === 'dialogue') {
        this.updateChaserPursuit(true)
      }
    }

    // 2. Story interaction proximity trigger (Levels 3 & 4)
    if (
      this.encounterState === 'active' &&
      this.levelConfig.interaction &&
      !this.interactionTriggered &&
      this.playerController
    ) {
      const playerPos = this.playerController.getPosition()
      if (Math.abs(playerPos.x - this.levelConfig.interaction.triggerX) <= this.levelConfig.interaction.triggerRadius) {
        this.triggerStoryInteraction(this.levelConfig.interaction)
      }
    }

    // 3. Level Exit Goal Reached Check
    if (this.playerController && this.encounterState === 'active') {
      const playerPos = this.playerController.getPosition()
      if (playerPos.x >= this.levelConfig.exitGoalX) {
        this.triggerLevelComplete()
      }
    }
  }

  /**
   * Updates horizontal chase movement for Manish, Sathish, and Rahul.
   * Frame-rate independent with delta time.
   */
  private updateChaserPursuit(isDuringDialogue = false): void {
    if (!this.playerController) return
    const playerPos = this.playerController.getPosition()

    const chaserConfigs = new Map(this.levelConfig.chasers?.map((c) => [c.chaserId, c]) ?? [])

    const sathishSpeed = chaserConfigs.get('sathish')?.speed ?? 180
    const manishSpeed = chaserConfigs.get('manish')?.speed ?? 170
    const rahulSpeed = chaserConfigs.get('rahul')?.speed ?? 160

    const chasers = [
      { chaser: this.sathish, speed: sathishSpeed, spacingOffset: 0 },
      { chaser: this.manish, speed: manishSpeed, spacingOffset: 45 },
      { chaser: this.rahul, speed: rahulSpeed, spacingOffset: 90 },
    ]

    const deltaSeconds = this.game.loop.delta / 1000

    for (const item of chasers) {
      if (!item.chaser || !item.chaser.visible) continue
      const chaser = item.chaser
      const targetX = playerPos.x - item.spacingOffset
      const dx = targetX - chaser.x

      if (Math.abs(dx) > 10) {
        // In dialogue, hold chasers at a dramatic distance so dialogue can be read
        if (isDuringDialogue && Math.abs(chaser.x - playerPos.x) < 75) {
          continue
        }
        const step = item.speed * deltaSeconds
        const dir = dx > 0 ? 1 : -1
        chaser.x += dir * Math.min(step, Math.abs(dx))
        chaser.setFacingDirection(dir)
      }

      // Clamp to world bounds
      chaser.x = Phaser.Math.Clamp(chaser.x, 20, this.levelConfig.stageWidth - 20)

      // Catch check against Dennis's actual position
      if (!isDuringDialogue && this.encounterState === 'active') {
        const dist = Phaser.Math.Distance.Between(chaser.x, chaser.y, playerPos.x, playerPos.y)
        if (dist < 34) {
          this.triggerDennisCaught(chaser)
          break
        }
      }
    }
  }

  /**
   * Triggered when a chaser catches Dennis.
   * Freezes gameplay and opens comic speech bubble sequence.
   */
  private triggerDennisCaught(chaser: Sathish | Manish | Rahul): void {
    if (this.encounterState === 'caught') return
    this.encounterState = 'caught'
    this.playerController?.setFrozen(true)

    let chaserName = 'Rahul'
    let dialogue = CATCH_DIALOGUE_RAHUL

    if (chaser instanceof Manish) {
      chaserName = 'Manish'
      dialogue = CATCH_DIALOGUE_MANISH
    } else if (chaser instanceof Sathish) {
      chaserName = 'Sathish'
      dialogue = CATCH_DIALOGUE_SATHISH
    }

    // Launch comic speech bubble sequence
    this.dialogueSystem?.startSequence(dialogue, () => {
      this.showModalOverlay({
        title: 'DENNIS WAS CAUGHT!',
        subtitle: `${chaserName} and the gang caught Dennis! "Va da, first college-ku ponom!"`,
        accentColor: 0xef4444,
        buttons: [
          {
            label: 'RETRY LEVEL',
            onClick: () => this.loadLevel(this.currentLevelId),
          },
        ],
      })
    })
  }

  /**
   * Triggers story interaction dialogue (Level 3 Reveal or Level 4 Café Date).
   */
  private triggerStoryInteraction(interaction: LevelInteractionConfig): void {
    if (this.interactionTriggered) return
    this.interactionTriggered = true
    this.encounterState = 'dialogue'
    this.playerController?.setFrozen(true)

    let sequence = LEVEL_3_REVEAL_DIALOGUE
    if (interaction.dialogueSequenceId === 'level-4-cafe') {
      sequence = LEVEL_4_CAFE_DIALOGUE
    }

    this.dialogueSystem?.startSequence(sequence, () => {
      this.encounterState = 'active'
      this.playerController?.setFrozen(false)

      if (this.currentLevelId === 'level-3') {
        this.triggerObjectiveUpdated('REVEAL OVER! OUTRUN THE TRIO TO NAMMA METRO ENTRANCE!')
      } else if (this.currentLevelId === 'level-4') {
        this.triggerObjectiveUpdated('DATE INTERRUPTED! SPRINT TO 80FT ROAD JUNCTION!')
      }
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
        subtitle: 'Dennis successfully cleared the college gate encounter and outran the trio to the Bus Stop!',
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
    } else if (this.currentLevelId === 'level-2') {
      this.showModalOverlay({
        title: 'LEVEL 2 COMPLETE!',
        subtitle: 'Dennis neutralized both street blockers and reached the avenue crossroad!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY LEVEL 3 →',
            onClick: () => this.loadLevel('level-3'),
          },
          {
            label: 'REPLAY LEVEL 2',
            onClick: () => this.loadLevel('level-2'),
          },
        ],
      })
    } else if (this.currentLevelId === 'level-3') {
      this.showModalOverlay({
        title: 'LEVEL 3 COMPLETE!',
        subtitle: 'Dennis survived the dramatic Brigade Road mix-up and caught the Namma Metro train!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY LEVEL 4 →',
            onClick: () => this.loadLevel('level-4'),
          },
          {
            label: 'REPLAY LEVEL 3',
            onClick: () => this.loadLevel('level-3'),
          },
        ],
      })
    } else {
      this.showModalOverlay({
        title: 'LEVEL 4 COMPLETE!',
        subtitle: 'Dennis escaped the Koramangala café date scramble and reached the 80ft Road junction!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY AGAIN (LEVEL 4)',
            onClick: () => this.loadLevel('level-4'),
          },
          {
            label: 'START OVER (LEVEL 1)',
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
        this.encounterState = 'active'
        if (this.levelConfig.blockers.length > 0) {
          const remaining = this.blockingEnemies.filter((e) => !e.isDefeated()).length
          this.triggerObjectiveUpdated(`OBJECTIVE: DEFEAT BLOCKERS (${remaining} REMAINING) & OUTRUN TRIO!`)
        } else {
          this.triggerObjectiveUpdated(`OBJECTIVE: ${this.levelConfig.objectiveText}`)
        }
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
      this.bengaluruStreet.resize(width, height, stageWidth, groundY, this.levelConfig.theme)
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

    if (this.dialogueSystem) {
      this.dialogueSystem.destroy()
      this.dialogueSystem = undefined
    }

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
