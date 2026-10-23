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
  LEVEL_4_PARK_DIALOGUE,
  LEVEL_5_VICTORY_DIALOGUE,
} from '../dialogue/dialogueData'
import { GAME_FONTS, ensureGameFontsLoaded } from '../config/typography'
import { audioManager } from '../systems/AudioManager'

export class BootScene extends Phaser.Scene {
  // Level State
  private currentLevelId: LevelId = 'level-1'
  private levelConfig!: LevelConfig
  private encounterState: 'intro' | 'active' | 'dialogue' | 'caught' | 'cleared' = 'intro'
  private interactionTriggered = false
  private isGamePaused = false

  // Level 3 Special Encounter State Machine
  private level3EncounterState:
    | 'CHASE_ACTIVE'
    | 'ENCOUNTER_TRIGGERED'
    | 'DIALOGUE_ACTIVE'
    | 'REVEAL_COMPLETE'
    | 'ATTACK_INTERACTION'
    | 'CHASE_RESUMED' = 'CHASE_ACTIVE'
  private chasersPaused = false

  // Encounter Progression & Exit State
  private isLevelCompleting = false
  private isExitUnlocked = false

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
    void ensureGameFontsLoaded()
    // Read initial level from URL hash query if present (e.g. #/play?level=3)
    this.currentLevelId = this.detectInitialLevel()
    this.levelConfig = getLevelConfig(this.currentLevelId)
    this.encounterState = 'intro'
    this.interactionTriggered = false
    this.level3EncounterState = 'CHASE_ACTIVE'
    this.chasersPaused = false
    this.isLevelCompleting = false
    this.isExitUnlocked = this.levelConfig.blockers.length === 0

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

    // 5. Setup Dialogue System with character position resolver
    this.dialogueSystem = new DialogueSystem({
      scene: this,
      getSpeakerPosition: (speakerId) => this.resolveSpeakerPosition(speakerId),
    })

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

    // Expose global hook for level switching and pause from React UI
    ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: LevelId, force?: boolean) => void }).__DD_LOAD_LEVEL__ = (
      id: LevelId,
      force = false
    ) => {
      if (!force && this.currentLevelId === id && (this.encounterState === 'intro' || this.encounterState === 'active')) {
        return
      }
      this.loadLevel(id)
    }

    window.__DD_IS_PAUSED__ = false
    window.__DD_TOGGLE_PAUSE__ = () => this.togglePause()
    window.__DD_SET_PAUSED__ = (p: boolean) => {
      this.setGamePaused(p)
    }
    window.__DD_RESTART_LEVEL__ = () => this.loadLevel(this.currentLevelId)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause()
    })
    this.input.keyboard?.on('keydown-P', () => {
      this.togglePause()
    })

    // Set BGM track to gameplay
    audioManager.setMusicTrack('gameplay')
  }

  private detectInitialLevel(): LevelId {
    const hash = window.location.hash
    if (hash.includes('level=5')) return 'level-5'
    if (hash.includes('level=4')) return 'level-4'
    if (hash.includes('level=3')) return 'level-3'
    if (hash.includes('level=2')) return 'level-2'
    return 'level-1'
  }

  /**
   * Switches to and initializes a specific level cleanly.
   * Completely resets all player, blocker, chaser, and dialogue states.
   */
  public loadLevel(levelId: LevelId): void {
    this.currentLevelId = levelId
    this.levelConfig = getLevelConfig(levelId)
    this.encounterState = 'intro'
    this.interactionTriggered = false
    this.level3EncounterState = 'CHASE_ACTIVE'
    this.chasersPaused = false
    this.isLevelCompleting = false
    this.isExitUnlocked = this.levelConfig.blockers.length === 0
    this.isGamePaused = false
    window.__DD_IS_PAUSED__ = false
    this.physics.resume()
    audioManager.setMusicTrack('gameplay')
    window.dispatchEvent(new CustomEvent('dd_game_pause_change', { detail: { paused: false } }))

    // Synchronize URL hash with active level so React tabs and navigation stay in sync
    const levelNumMap: Record<LevelId, number> = {
      'level-1': 1,
      'level-2': 2,
      'level-3': 3,
      'level-4': 4,
      'level-5': 5,
    }
    const targetHash = `#/play?level=${levelNumMap[levelId]}`
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash
    }

    const width = this.scale.width
    const height = this.scale.height
    const stageWidth = this.levelConfig.stageWidth
    const groundY = this.getGroundY(height)

    // Clear old blockers, colliders, and exit markers
    this.clearEncounterEntities()

    // Clear active dialogue with character position resolver
    if (this.dialogueSystem) {
      this.dialogueSystem.destroy()
      this.dialogueSystem = new DialogueSystem({
        scene: this,
        getSpeakerPosition: (speakerId) => this.resolveSpeakerPosition(speakerId),
      })
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

      // Camera Follows Dennis smoothly (calibrated vertical framing for enlarged character)
      this.cameras.main.startFollow(
        this.playerController.getPhysicsBody(),
        true,
        0.08,
        0.08,
        0,
        22
      )

      // Player Ground Collision
      if (this.groundGroup) {
        this.groundCollider = this.physics.add.collider(
          this.playerController.getPhysicsBody(),
          this.groundGroup
        )
      }
    } else {
      this.playerController?.reset(cfg.playerSpawnX, groundY)
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
        this.sathish.setFacingDirection(1)
        this.sathish.setVisible(true)
      }

      if (!this.manish) {
        this.manish = new Manish(this, { x: mSpawn, y: groundY, idlePhaseOffsetMs: 200 })
      } else {
        this.manish.setPosition(mSpawn, groundY)
        this.manish.setFacingDirection(1)
        this.manish.setVisible(true)
      }

      if (!this.rahul) {
        this.rahul = new Rahul(this, { x: rSpawn, y: groundY, idlePhaseOffsetMs: 600 })
      } else {
        this.rahul.setPosition(rSpawn, groundY)
        this.rahul.setFacingDirection(1)
        this.rahul.setVisible(true)
      }
    } else {
      // Hide chasers for levels without pursuit
      if (this.sathish) this.sathish.setVisible(false)
      if (this.manish) this.manish.setVisible(false)
      if (this.rahul) this.rahul.setVisible(false)
    }

    // 4. Create Exit Goal Marker at exitGoalX with initial lock state
    this.createExitGoalVisual(cfg.exitGoalX, groundY, cfg.exitGoalLabel, this.isExitUnlocked)
  }

  private createExitGoalVisual(x: number, groundY: number, label: string, isUnlocked = false): void {
    this.isExitUnlocked = isUnlocked
    this.exitGoalVisual = this.add.graphics()
    this.exitGoalLabel = this.add
      .text(x, groundY - 103, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '7.5px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.renderExitGoalVisual(x, groundY, label, isUnlocked)
  }

  public updateExitVisual(isUnlocked: boolean): void {
    this.isExitUnlocked = isUnlocked
    const groundY = this.getGroundY(this.scale.height)
    this.renderExitGoalVisual(
      this.levelConfig.exitGoalX,
      groundY,
      this.levelConfig.exitGoalLabel,
      isUnlocked
    )
  }

  private renderExitGoalVisual(x: number, groundY: number, label: string, isUnlocked: boolean): void {
    if (!this.exitGoalVisual) return
    const g = this.exitGoalVisual
    g.clear()

    const topY = groundY - 110

    if (isUnlocked) {
      // Radiant Emerald open portal
      g.fillStyle(0x064e3b, 0.95)
      g.fillRect(x - 32, topY, 64, 15)
      g.lineStyle(2, 0x10b981, 1)
      g.strokeRect(x - 32, topY, 64, 15)

      // Poles with emerald brackets
      g.fillStyle(0x1e293b, 1)
      g.fillRect(x - 28, topY + 15, 5, 95)
      g.fillRect(x + 23, topY + 15, 5, 95)
      g.fillStyle(0x34d399, 1)
      g.fillRect(x - 29, topY + 20, 7, 3)
      g.fillRect(x + 22, topY + 20, 7, 3)

      // Pulsing green open arrow
      g.fillStyle(0x34d399, 1)
      g.fillTriangle(x - 12, topY - 16, x + 12, topY - 16, x, topY - 3)

      if (this.exitGoalLabel) {
        this.exitGoalLabel.setText(`★ ${label} [OPEN] ★`)
        this.exitGoalLabel.setColor('#ffffff')
      }
    } else {
      // Amber/Zinc locked gate
      g.fillStyle(0x18181b, 0.95)
      g.fillRect(x - 32, topY, 64, 15)
      g.lineStyle(2, 0xf59e0b, 0.9)
      g.strokeRect(x - 32, topY, 64, 15)

      // Poles
      g.fillStyle(0x27272a, 1)
      g.fillRect(x - 28, topY + 15, 5, 95)
      g.fillRect(x + 23, topY + 15, 5, 95)

      // Amber downward arrow
      g.fillStyle(0xf59e0b, 0.95)
      g.fillTriangle(x - 10, topY - 14, x + 10, topY - 14, x, topY - 3)

      if (this.exitGoalLabel) {
        this.exitGoalLabel.setText(`⛔ ${label} [LOCKED]`)
        this.exitGoalLabel.setColor('#fef08a')
      }
    }
  }

  /**
   * Screen-anchored HUD setup.
   */
  private setupScreenHud(): void {
    // Title
    this.titleText = this.add
      .text(0, 0, this.levelConfig.title.toUpperCase(), {
        fontFamily: GAME_FONTS.display,
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#090d16',
        strokeThickness: 5,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100)

    // Subtitle
    this.subtitleText = this.add
      .text(0, 0, `${this.levelConfig.stageNumber} • ${this.levelConfig.subtitle}`.toUpperCase(), {
        fontFamily: GAME_FONTS.heading,
        fontSize: '18px',
        fontStyle: 'bold',
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
        fontFamily: GAME_FONTS.heading,
        fontSize: '15px',
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
        fontFamily: GAME_FONTS.heading,
        fontSize: '16px',
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
        fontFamily: GAME_FONTS.heading,
        fontSize: '15px',
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
        fontFamily: GAME_FONTS.heading,
        fontSize: '11px',
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
   * Chasers do NOT pause or freeze while Dennis attacks, except during the scripted Level 3 encounter.
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
      audioManager.playSfx(result.defeated ? 'defeat' : 'hit')
      // Level 3 Special Encounter State Machine:
      // When Dennis defeats the drama lead blocker Raghu, resume chasers!
      if (this.currentLevelId === 'level-3') {
        if (result.enemy && result.enemy.enemyId === 'drama-raghu' && result.defeated) {
          this.level3EncounterState = 'CHASE_RESUMED'
          this.chasersPaused = false
          this.triggerObjectiveUpdated('RAGHU DEFEATED! TRIO RESUMED PURSUIT — SPRINT TO METRO!')
        }
      }

      const allDefeated = CombatSystem.areAllEnemiesDefeated(this.blockingEnemies)

      if (allDefeated) {
        audioManager.playSfx('unlock')
        this.isExitUnlocked = true
        this.updateExitVisual(true)
        if (this.levelConfig.hasChaseSequence) {
          this.triggerObjectiveUpdated(`ALL BLOCKERS DEFEATED! SPRINT TO ${this.levelConfig.exitGoalLabel}!`)
        } else {
          this.triggerObjectiveUpdated(`ENCOUNTER RESOLVED! SPRINT TO ${this.levelConfig.exitGoalLabel}!`)
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
    if (this.isGamePaused) return

    if (this.bengaluruStreet) {
      this.bengaluruStreet.update()
    }

    if (this.playerController) {
      this.playerController.update()
      this.updatePlayerStatusFeedback()
    }

    // Keep character-anchored speech bubbles locked above the active speaker
    if (this.dialogueSystem) {
      this.dialogueSystem.update()
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

    // 3. Level Exit Goal Reached Check (Enforces Blocker Defeat Before Exit)
    if (this.playerController && this.encounterState === 'active' && !this.isLevelCompleting) {
      const playerPos = this.playerController.getPosition()
      if (playerPos.x >= this.levelConfig.exitGoalX) {
        const allDefeated = CombatSystem.areAllEnemiesDefeated(this.blockingEnemies)
        if (allDefeated) {
          this.triggerLevelComplete()
        } else {
          this.playerController.setPosition(this.levelConfig.exitGoalX - 12, playerPos.y)
          const remaining = this.blockingEnemies.filter((e) => !e.isDefeated()).length
          this.triggerObjectiveUpdated(`EXIT LOCKED! DEFEAT ALL BLOCKERS (${remaining} REMAINING) FIRST!`)
        }
      }
    }
  }

  /**
   * Updates horizontal chase movement for Manish, Sathish, and Rahul.
   * Frame-rate independent with delta time.
   */
  private updateChaserPursuit(isDuringDialogue = false): void {
    if (!this.playerController || this.chasersPaused) return
    const playerPos = this.playerController.getPosition()

    const chaserConfigs = new Map(this.levelConfig.chasers?.map((c) => [c.chaserId, c]) ?? [])

    const sathishSpeed = chaserConfigs.get('sathish')?.speed ?? 180
    const manishSpeed = chaserConfigs.get('manish')?.speed ?? 170
    const rahulSpeed = chaserConfigs.get('rahul')?.speed ?? 160

    const chasers = [
      { chaser: this.sathish, speed: sathishSpeed, spacingOffset: 0 },
      { chaser: this.manish, speed: manishSpeed, spacingOffset: 55 },
      { chaser: this.rahul, speed: rahulSpeed, spacingOffset: 110 },
    ]

    const deltaSeconds = this.game.loop.delta / 1000

    for (const item of chasers) {
      if (!item.chaser || !item.chaser.visible) continue
      const chaser = item.chaser
      const targetX = playerPos.x - item.spacingOffset
      const dx = targetX - chaser.x

      if (Math.abs(dx) > 10) {
        // In dialogue, hold chasers at a dramatic distance so dialogue can be read
        if (isDuringDialogue && Math.abs(chaser.x - playerPos.x) < 95) {
          continue
        }
        const step = item.speed * deltaSeconds
        const dir = dx > 0 ? 1 : -1
        chaser.x += dir * Math.min(step, Math.abs(dx))
        chaser.setFacingDirection(dir)
      }

      // Clamp to world bounds
      chaser.x = Phaser.Math.Clamp(chaser.x, 20, this.levelConfig.stageWidth - 20)

      // Catch check against Dennis's actual position (recalibrated for enlarged silhouettes)
      if (!isDuringDialogue && this.encounterState === 'active') {
        const dist = Phaser.Math.Distance.Between(chaser.x, chaser.y, playerPos.x, playerPos.y)
        if (dist < 95 && dist >= 46) {
          audioManager.playSfx('tension')
        }
        if (dist < 46) {
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
    audioManager.playSfx('game-over')

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
            color: 0xef4444,
            onClick: () => this.loadLevel(this.currentLevelId),
          },
          {
            label: 'LEVEL SELECT',
            color: 0x64748b,
            onClick: () => {
              window.location.hash = '#/levels'
            },
          },
          {
            label: 'MAIN MENU',
            color: 0xd97706,
            onClick: () => {
              window.location.hash = '#/'
            },
          },
        ],
      })
    })
  }

  public togglePause(): boolean {
    return this.setGamePaused(!this.isGamePaused)
  }

  public setGamePaused(paused: boolean): boolean {
    if (this.encounterState === 'caught' || this.encounterState === 'cleared') {
      return false
    }
    if (this.isGamePaused === paused) return this.isGamePaused
    this.isGamePaused = paused
    window.__DD_IS_PAUSED__ = paused

    if (paused) {
      this.physics.pause()
      this.playerController?.setFrozen(true)
      audioManager.playSfx('pause')
      window.dispatchEvent(new CustomEvent('dd_game_pause_change', { detail: { paused: true } }))
    } else {
      this.physics.resume()
      if (this.encounterState === 'active') {
        this.playerController?.setFrozen(false)
      }
      audioManager.playSfx('resume')
      window.dispatchEvent(new CustomEvent('dd_game_pause_change', { detail: { paused: false } }))
    }
    return this.isGamePaused
  }

  public isPaused(): boolean {
    return this.isGamePaused
  }

  public getLevel3EncounterState(): string {
    return this.level3EncounterState
  }

  public areChasersPaused(): boolean {
    return this.chasersPaused
  }

  /**
   * Triggers story interaction dialogue (Level 3 Reveal or Level 4 Dr. Rajkumar Park).
   */
  private triggerStoryInteraction(_interaction: LevelInteractionConfig): void {
    if (this.interactionTriggered) return
    this.interactionTriggered = true
    this.encounterState = 'dialogue'
    this.playerController?.setFrozen(true)

    // Cleanly pause chasers so their exact positions and states are preserved
    this.chasersPaused = true

    let sequence = LEVEL_3_REVEAL_DIALOGUE
    if (this.currentLevelId === 'level-3') {
      this.level3EncounterState = 'DIALOGUE_ACTIVE'
      sequence = LEVEL_3_REVEAL_DIALOGUE
    } else if (this.currentLevelId === 'level-4') {
      sequence = LEVEL_4_PARK_DIALOGUE
    }

    this.dialogueSystem?.startSequence(sequence, () => {
      this.encounterState = 'active'
      this.playerController?.setFrozen(false)

      if (this.currentLevelId === 'level-3') {
        this.level3EncounterState = 'ATTACK_INTERACTION'
        // Keep chasers paused during the required attack interaction against Raghu
        this.chasersPaused = true
        this.triggerObjectiveUpdated('REVEAL OVER! KNOCK PAST RAGHU & SPRINT TO THE METRO!')
      } else if (this.currentLevelId === 'level-4') {
        this.chasersPaused = false
        this.triggerObjectiveUpdated('WALKING TRACK INTERRUPTED! SPRINT TO PARK MAIN GATE!')
      } else {
        this.chasersPaused = false
      }
    })
  }

  /**
   * Resolves the world position of characters for character-anchored speech bubbles.
   */
  private resolveSpeakerPosition(speakerId: string): { x: number; y: number; height?: number } | undefined {
    const groundY = this.getGroundY(this.scale.height)

    if (speakerId === 'dennis') {
      if (this.dennis) {
        return { x: this.dennis.x, y: this.dennis.y, height: 116 }
      }
      return this.playerController?.getPosition() ? { ...this.playerController.getPosition(), height: 116 } : undefined
    }

    if (speakerId === 'manish') {
      if (this.manish && this.manish.visible) {
        return { x: this.manish.x, y: this.manish.y, height: 110 }
      }
    }

    if (speakerId === 'sathish') {
      if (this.sathish && this.sathish.visible) {
        return { x: this.sathish.x, y: this.sathish.y, height: 110 }
      }
    }

    if (speakerId === 'rahul') {
      if (this.rahul && this.rahul.visible) {
        return { x: this.rahul.x, y: this.rahul.y, height: 110 }
      }
    }

    if (speakerId === 'drama_raghu' || speakerId === 'drama-raghu') {
      const raghu = this.blockingEnemies.find((e) => e.enemyId === 'drama-raghu')
      if (raghu) {
        return { x: raghu.x, y: raghu.y, height: 102 }
      }
      return { x: 980, y: groundY, height: 102 }
    }

    if (speakerId === 'blocker_chethan') {
      const chethan = this.blockingEnemies.find((e) => e.enemyId === 'blocker-4-1')
      if (chethan) {
        return { x: chethan.x, y: chethan.y, height: 102 }
      }
      return { x: 960, y: groundY, height: 102 }
    }

    const enemy = this.blockingEnemies.find(
      (e) => e.enemyId === speakerId || e.config.name.toLowerCase() === speakerId.toLowerCase()
    )
    if (enemy) {
      return { x: enemy.x, y: enemy.y, height: 102 }
    }

    if (this.levelConfig.interaction) {
      return { x: this.levelConfig.interaction.triggerX, y: groundY, height: 102 }
    }

    return undefined
  }

  /**
   * Triggered when Dennis reaches the exit goal with all blockers defeated.
   */
  private triggerLevelComplete(): void {
    if (this.isLevelCompleting) return
    this.isLevelCompleting = true
    this.encounterState = 'cleared'
    this.playerController?.setFrozen(true)
    audioManager.playSfx('stage-complete')

    if (this.currentLevelId === 'level-1') {
      this.showModalOverlay({
        title: 'STAGE 01 COMPLETE!',
        subtitle: 'Dennis knocked past Ajay, Vijay & Sanjay at the college gate and reached the BMTC Bus Stop before the trio!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY STAGE 02 →',
            color: 0x10b981,
            onClick: () => this.loadLevel('level-2'),
          },
          {
            label: 'REPLAY STAGE 01',
            color: 0x0284c7,
            onClick: () => this.loadLevel('level-1'),
          },
          {
            label: 'LEVEL SELECT',
            color: 0xd97706,
            onClick: () => {
              window.location.hash = '#/levels'
            },
          },
        ],
      })
    } else if (this.currentLevelId === 'level-2') {
      this.showModalOverlay({
        title: 'STAGE 02 COMPLETE!',
        subtitle: 'Dennis knocked past Vikram & Kiran at Thatha Tea and sprinted clear to the Kammanahalli crossroad!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY STAGE 03 →',
            color: 0x10b981,
            onClick: () => this.loadLevel('level-3'),
          },
          {
            label: 'REPLAY STAGE 02',
            color: 0x0284c7,
            onClick: () => this.loadLevel('level-2'),
          },
          {
            label: 'LEVEL SELECT',
            color: 0xd97706,
            onClick: () => {
              window.location.hash = '#/levels'
            },
          },
        ],
      })
    } else if (this.currentLevelId === 'level-3') {
      this.showModalOverlay({
        title: 'STAGE 03 COMPLETE!',
        subtitle: 'Dennis uncovered the Brigade Road drama rehearsal, cleared lead Raghu, and caught the Namma Metro train!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY STAGE 04 →',
            color: 0x10b981,
            onClick: () => this.loadLevel('level-4'),
          },
          {
            label: 'REPLAY STAGE 03',
            color: 0x0284c7,
            onClick: () => this.loadLevel('level-3'),
          },
          {
            label: 'LEVEL SELECT',
            color: 0xd97706,
            onClick: () => {
              window.location.hash = '#/levels'
            },
          },
        ],
      })
    } else if (this.currentLevelId === 'level-4') {
      this.showModalOverlay({
        title: 'STAGE 04 COMPLETE!',
        subtitle: 'Dennis outran the trio through Dr. Rajkumar Park, knocked through Chethan & Suresh, and exited the Main Gate!',
        accentColor: 0x10b981,
        buttons: [
          {
            label: 'PLAY STAGE 05 →',
            color: 0x10b981,
            onClick: () => this.loadLevel('level-5'),
          },
          {
            label: 'REPLAY STAGE 04',
            color: 0x0284c7,
            onClick: () => this.loadLevel('level-4'),
          },
          {
            label: 'LEVEL SELECT',
            color: 0xd97706,
            onClick: () => {
              window.location.hash = '#/levels'
            },
          },
        ],
      })
    } else {
      // LEVEL 5 - CUBBON PARK GRAND FINALE
      if (this.sathish) this.sathish.setFacingDirection(-1)
      if (this.manish) this.manish.setFacingDirection(-1)
      if (this.rahul) this.rahul.setFacingDirection(-1)

      this.triggerObjectiveUpdated('CUBBON PARK REACHED! CELEBRATING GRAND VICTORY!')

      this.dialogueSystem?.startSequence(LEVEL_5_VICTORY_DIALOGUE, () => {
        this.showGrandVictoryModal()
      })
    }
  }

  /**
   * Shows the opening level introduction overlay with Tanglish objective lines.
   */
  private showLevelIntroOverlay(): void {
    const cfg = this.levelConfig
    const width = this.scale.width
    const height = this.scale.height

    const overlay = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200)
    const cardW = Math.min(width - 32, 620)
    const cardH = 230

    const bg = this.add.graphics()
    bg.fillStyle(0x090d16, 0.98)
    bg.lineStyle(2.5, 0xf59e0b, 0.95) // amber-500
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)

    const stageNum = this.add
      .text(0, -cardH / 2 + 25, cfg.stageNumber.toUpperCase(), {
        fontFamily: GAME_FONTS.heading,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f59e0b',
      })
      .setOrigin(0.5, 0.5)

    const title = this.add
      .text(0, -cardH / 2 + 58, cfg.title.toUpperCase(), {
        fontFamily: GAME_FONTS.display,
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#090d16',
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0.5)

    const introText = cfg.tanglishIntro ?? cfg.objectiveText
    const obj = this.add
      .text(0, -cardH / 2 + 108, introText, {
        fontFamily: GAME_FONTS.body,
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: cardW - 48 },
      })
      .setOrigin(0.5, 0.5)

    const startBtnBg = this.add.graphics()
    startBtnBg.fillStyle(0xd97706, 1)
    startBtnBg.fillRoundedRect(-cardW / 2 + 24, cardH / 2 - 58, cardW - 48, 44, 8)

    const startBtnTxt = this.add
      .text(0, cardH / 2 - 36, 'START ENCOUNTER [TAP OR ANY KEY TO SPRINT]', {
        fontFamily: GAME_FONTS.heading,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5)

    overlay.add([bg, stageNum, title, obj, startBtnBg, startBtnTxt])
    this.overlayContainer = overlay

    let dismissed = false
    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      this.input.off('pointerdown', dismiss)
      this.input.keyboard?.off('keydown', onKeyDown)

      if (this.overlayContainer === overlay) {
        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 160,
          onComplete: () => {
            overlay.destroy()
            if (this.overlayContainer === overlay) {
              this.overlayContainer = undefined
            }
          },
        })
        this.encounterState = 'active'
        this.playerController?.setFrozen(false)
        if (this.levelConfig.blockers.length > 0) {
          const remaining = this.blockingEnemies.filter((e) => !e.isDefeated()).length
          this.triggerObjectiveUpdated(`OBJECTIVE: DEFEAT BLOCKERS (${remaining} REMAINING) & OUTRUN TRIO!`)
        } else {
          this.triggerObjectiveUpdated(`OBJECTIVE: ${this.levelConfig.objectiveText}`)
        }
      }
    }

    const onKeyDown = () => dismiss()
    this.input.once('pointerdown', dismiss)
    this.input.keyboard?.once('keydown', onKeyDown)
    this.time.delayedCall(2500, dismiss)
  }

  /**
   * Reusable modal overlay for Victory / Defeat with precise button hit testing and debounce.
   */
  private showModalOverlay(config: {
    title: string
    subtitle: string
    accentColor: number
    buttons: Array<{ label: string; color?: number; onClick: () => void }>
  }): void {
    if (this.overlayContainer) {
      this.overlayContainer.destroy()
    }

    const width = this.scale.width
    const height = this.scale.height

    const overlay = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200)
    const cardW = Math.min(width - 24, 640)
    const cardH = 260

    // Full-screen semi-transparent backdrop
    const backdrop = this.add.graphics()
    backdrop.fillStyle(0x000000, 0.75)
    backdrop.fillRect(-width / 2, -height / 2, width, height)

    // Modal Card Box
    const bg = this.add.graphics()
    bg.fillStyle(0x090d16, 0.98)
    bg.lineStyle(2.5, config.accentColor, 1)
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)

    const title = this.add
      .text(0, -cardH / 2 + 36, config.title.toUpperCase(), {
        fontFamily: GAME_FONTS.display,
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#090d16',
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0.5)

    const sub = this.add
      .text(0, -cardH / 2 + 88, config.subtitle, {
        fontFamily: GAME_FONTS.body,
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: cardW - 48 },
      })
      .setOrigin(0.5, 0.5)

    overlay.add([backdrop, bg, title, sub])

    // Render Buttons
    const btnCount = config.buttons.length
    const gap = 12
    const btnW = Math.min(185, (cardW - 48 - (btnCount - 1) * gap) / btnCount)
    const btnH = 46
    const totalW = btnCount * btnW + (btnCount - 1) * gap
    const startX = -totalW / 2 + btnW / 2
    const btnY = cardH / 2 - 36

    const buttonBounds: Array<{
      minX: number
      maxX: number
      minY: number
      maxY: number
      onClick: () => void
    }> = []

    config.buttons.forEach((btnCfg, index) => {
      const bx = startX + index * (btnW + gap)
      const bColor = btnCfg.color ?? config.accentColor

      const bBg = this.add.graphics()
      bBg.fillStyle(bColor, 1)
      bBg.fillRoundedRect(bx - btnW / 2, btnY - btnH / 2, btnW, btnH, 8)

      const bTxt = this.add
        .text(bx, btnY, btnCfg.label.toUpperCase(), {
          fontFamily: GAME_FONTS.heading,
          fontSize: btnCount > 2 ? '15px' : '18px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5, 0.5)

      overlay.add([bBg, bTxt])

      buttonBounds.push({
        minX: bx - btnW / 2,
        maxX: bx + btnW / 2,
        minY: btnY - btnH / 2,
        maxY: btnY + btnH / 2,
        onClick: btnCfg.onClick,
      })
    })

    this.overlayContainer = overlay

    // Debounced pointerdown with exact button bounding-box hit testing
    const createdTime = this.time.now
    const pointerHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.overlayContainer !== overlay) return
      // Ignore clicks within 180ms of overlay creation to prevent accidental pass-through
      if (this.time.now - createdTime < 180) return

      const relX = pointer.x - width / 2
      const relY = pointer.y - height / 2

      for (const btn of buttonBounds) {
        if (relX >= btn.minX && relX <= btn.maxX && relY >= btn.minY && relY <= btn.maxY) {
          overlay.destroy()
          this.overlayContainer = undefined
          this.input.off('pointerdown', pointerHandler)
          btn.onClick()
          break
        }
      }
    }

    this.input.on('pointerdown', pointerHandler)
  }

  /**
   * Grand Finale Victory Screen celebrating the completion of all 5 stages.
   * Features the five-level completion state and official developer branding:
   * "Developed by its2much Mv"
   */
  private showGrandVictoryModal(): void {
    audioManager.setMusicTrack('victory')
    audioManager.playSfx('stage-complete')
    if (this.overlayContainer) {
      this.overlayContainer.destroy()
    }

    const width = this.scale.width
    const height = this.scale.height

    const overlay = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(250)
    const cardW = Math.min(width - 24, 740)
    const cardH = Math.min(height - 24, 380)

    const bg = this.add.graphics()
    bg.fillStyle(0x090d16, 0.98)
    bg.lineStyle(3, 0xf59e0b, 1) // Amber-500
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14)
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14)

    // Inner subtle glow border
    bg.lineStyle(1.5, 0x10b981, 0.6)
    bg.strokeRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10, 10)

    // Celebration Ribbon Banner
    const ribbonY = -cardH / 2 + 30
    const trophyText = this.add.text(0, ribbonY, '★ GRAND VICTORY — ADVENTURE COMPLETED! ★', {
      fontFamily: GAME_FONTS.display,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#f59e0b',
    }).setOrigin(0.5, 0.5)

    const subtitleText = this.add.text(0, ribbonY + 28, 'Dennis survived all 5 Bengaluru chases from College Gate to Cubbon Park!', {
      fontFamily: GAME_FONTS.body,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: cardW - 40 },
    }).setOrigin(0.5, 0.5)

    // 5-Level Completion Card Grid / Summary
    const stageSummaryY = ribbonY + 76
    const summaryBg = this.add.graphics()
    summaryBg.fillStyle(0x0f172a, 0.9)
    summaryBg.lineStyle(1.5, 0x334155, 0.8)
    const sumW = cardW - 40
    const sumH = 76
    summaryBg.fillRoundedRect(-sumW / 2, stageSummaryY - 10, sumW, sumH, 8)
    summaryBg.strokeRoundedRect(-sumW / 2, stageSummaryY - 10, sumW, sumH, 8)

    const stage123 = this.add.text(0, stageSummaryY + 8, '✓ STAGE 01: College Gate   ✓ STAGE 02: Thatha Tea   ✓ STAGE 03: MG Road', {
      fontFamily: GAME_FONTS.heading,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#34d399', // Emerald
      align: 'center',
    }).setOrigin(0.5, 0.5)

    const stage45 = this.add.text(0, stageSummaryY + 38, '✓ STAGE 04: Dr. Rajkumar Park   ★ STAGE 05: Cubbon Park Bandstand [CLEARED]', {
      fontFamily: GAME_FONTS.heading,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fef08a', // Yellow
      align: 'center',
    }).setOrigin(0.5, 0.5)

    // Developer Credit - Prominent & Tasteful
    const creditY = stageSummaryY + 92
    const devCreditText = this.add.text(0, creditY, 'Developed by its2much Mv', {
      fontFamily: GAME_FONTS.heading,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#fbbf24', // Amber-400
    }).setOrigin(0.5, 0.5)

    // Optional subtle teaser
    const teaserText = this.add.text(0, creditY + 24, 'More of Dennis\'s story coming soon...', {
      fontFamily: GAME_FONTS.body,
      fontSize: '14px',
      fontStyle: 'italic',
      color: '#94a3b8',
    }).setOrigin(0.5, 0.5)

    overlay.add([bg, trophyText, subtitleText, summaryBg, stage123, stage45, devCreditText, teaserText])

    // Buttons: [REPLAY LEVEL 5], [REPLAY FROM L1], [MAIN MENU]
    const btnConfigs = [
      {
        label: 'REPLAY LEVEL 5',
        color: 0x10b981, // Emerald
        onClick: () => this.loadLevel('level-5'),
      },
      {
        label: 'REPLAY FROM L1',
        color: 0x3b82f6, // Blue
        onClick: () => this.loadLevel('level-1'),
      },
      {
        label: 'MAIN MENU',
        color: 0xd97706, // Amber
        onClick: () => {
          window.location.hash = '#/'
        },
      },
    ]

    const btnCount = btnConfigs.length
    const gap = 12
    const btnW = Math.min(195, (cardW - 60 - (btnCount - 1) * gap) / btnCount)
    const btnH = 46
    const totalButtonsW = btnCount * btnW + (btnCount - 1) * gap
    const startX = -totalButtonsW / 2 + btnW / 2
    const btnY = cardH / 2 - 32

    btnConfigs.forEach((cfg, idx) => {
      const bx = startX + idx * (btnW + gap)
      const btnBg = this.add.graphics()
      btnBg.fillStyle(cfg.color, 1)
      btnBg.fillRoundedRect(bx - btnW / 2, btnY - btnH / 2, btnW, btnH, 8)

      const btnTxt = this.add.text(bx, btnY, cfg.label, {
        fontFamily: GAME_FONTS.heading,
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5, 0.5)

      overlay.add([btnBg, btnTxt])
    })

    this.overlayContainer = overlay

    // Direct pointer down to click the exact button zone with input debounce
    const createdTime = this.time.now
    const pointerHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.overlayContainer !== overlay) return
      if (this.time.now - createdTime < 180) return
      const relX = pointer.x - width / 2
      const relY = pointer.y - height / 2

      // Check if clicked in button row
      if (relY >= btnY - 20 && relY <= btnY + 20) {
        btnConfigs.forEach((cfg, idx) => {
          const bx = startX + idx * (btnW + gap)
          if (Math.abs(relX - bx) <= btnW / 2 + 4) {
            overlay.destroy()
            this.overlayContainer = undefined
            this.input.off('pointerdown', pointerHandler)
            cfg.onClick()
          }
        })
      }
    }

    this.input.on('pointerdown', pointerHandler)
  }

  private updateObjectiveBadge(): void {
    if (!this.objectiveText || !this.objectiveBg) return

    const textBounds = this.objectiveText.getBounds()
    const padX = 16
    const padY = 6
    const bgW = textBounds.width + padX * 2
    const bgH = textBounds.height + padY * 2

    this.objectiveBg.clear()
    this.objectiveBg.fillStyle(0x0f172a, 0.9)
    this.objectiveBg.lineStyle(1.5, 0xf59e0b, 0.8)
    this.objectiveBg.fillRoundedRect(
      this.objectiveText.x - bgW / 2,
      this.objectiveText.y - bgH / 2,
      bgW,
      bgH,
      6
    )
    this.objectiveBg.strokeRoundedRect(
      this.objectiveText.x - bgW / 2,
      this.objectiveText.y - bgH / 2,
      bgW,
      bgH,
      6
    )
  }

  private updatePlayerStatusFeedback(): void {
    if (!this.playerController || !this.playerStatusText || !this.playerStatusBg) return

    const label = `DENNIS: ${this.playerController.getStateLabel()}`
    this.playerStatusText.setText(label)

    const bounds = this.playerStatusText.getBounds()
    const padX = 14
    const padY = 6
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
    const titleSize = isNarrow ? Math.max(22, Math.floor(width * 0.05)) : 34
    const subtitleSize = isNarrow ? Math.max(14, Math.floor(width * 0.028)) : 18

    const headerBaseY = isShort ? 18 : Math.max(24, height * 0.08)

    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`)
      this.titleText.setText(this.levelConfig.title.toUpperCase())
      this.titleText.setPosition(centerX, headerBaseY)
    }

    if (this.subtitleText) {
      this.subtitleText.setFontSize(`${subtitleSize}px`)
      this.subtitleText.setText(`${this.levelConfig.stageNumber} • ${this.levelConfig.subtitle}`)
      this.subtitleText.setPosition(centerX, headerBaseY + (isShort ? 22 : 28))
    }

    if (this.statusBadge && this.statusText && this.statusBg) {
      const badgeY = headerBaseY + (isShort ? 46 : 56)
      this.statusBadge.setPosition(centerX, badgeY)

      const textBounds = this.statusText.getBounds()
      const padX = 14
      const padY = 6
      const bgW = textBounds.width + padX * 2
      const bgH = textBounds.height + padY * 2

      this.statusBg.clear()
      this.statusBg.fillStyle(0x064e3b, 0.7)
      this.statusBg.lineStyle(1.5, 0x10b981, 0.6)
      this.statusBg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 6)
      this.statusBg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 6)
    }

    if (this.objectiveText) {
      const objY = headerBaseY + (isShort ? 72 : 88)
      this.objectiveText.setPosition(centerX, objY)
      this.updateObjectiveBadge()
    }

    // Controls Guide
    if (this.controlGuideText) {
      const guideY = isShort ? groundY - 18 : groundY - 24
      this.controlGuideText.setFontSize(isNarrow ? '12px' : '15px')
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
