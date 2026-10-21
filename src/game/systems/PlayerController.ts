import Phaser from 'phaser'
import { Dennis } from '../entities/Dennis'
import { virtualInputBridge } from './virtualInputBridge'

export interface PlayerControllerConfig {
  readonly scene: Phaser.Scene
  readonly dennis: Dennis
  readonly moveSpeed?: number
  readonly jumpSpeed?: number
  readonly initialX: number
  readonly initialY: number
}

/**
 * PlayerController manages player input, physics simulation,
 * horizontal movement, jumping, and visual synchronization for Dennis.
 */
export class PlayerController {
  private scene: Phaser.Scene
  private dennis: Dennis
  private physicsBody: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

  // Movement tuning parameters
  public moveSpeed: number
  public jumpSpeed: number

  // State flags
  private grounded = true
  private moving = false
  private facing: 1 | -1 = 1

  // Input keys
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private keyA?: Phaser.Input.Keyboard.Key
  private keyD?: Phaser.Input.Keyboard.Key
  private keyW?: Phaser.Input.Keyboard.Key
  private keySpace?: Phaser.Input.Keyboard.Key

  constructor(config: PlayerControllerConfig) {
    this.scene = config.scene
    this.dennis = config.dennis
    this.moveSpeed = config.moveSpeed ?? 260
    this.jumpSpeed = config.jumpSpeed ?? 520

    // 1. Create invisible physics proxy body for collision & gravity
    // Using a 38x80 physics proxy with origin at bottom-center (0.5, 1)
    this.physicsBody = this.scene.physics.add.sprite(config.initialX, config.initialY, '__DEFAULT')
    this.physicsBody.setVisible(false)
    this.physicsBody.setAlpha(0)
    this.physicsBody.setSize(38, 80)
    this.physicsBody.setOffset(
      (this.physicsBody.width - 38) / 2,
      this.physicsBody.height - 80
    )
    this.physicsBody.setCollideWorldBounds(true)
    this.physicsBody.setBounce(0)

    // 2. Setup keyboard controls with browser scroll suppression
    this.setupKeyboard()

    // 3. Sync initial Dennis position
    this.dennis.setPosition(this.physicsBody.x, this.physicsBody.y)
  }

  /**
   * Returns the dynamic physics proxy sprite for stage collision pairing.
   */
  public getPhysicsBody(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return this.physicsBody
  }

  /**
   * Sets up keyboard controls and captures navigation keys to prevent page scrolling.
   */
  private setupKeyboard(): void {
    const kb = this.scene.input.keyboard
    if (!kb) return

    // Prevent Space and Arrow keys from scrolling the webpage while playing
    kb.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ])

    this.cursors = kb.createCursorKeys()
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }

  /**
   * Per-frame update loop called from the Scene update method.
   */
  public update(): void {
    if (!this.physicsBody || !this.physicsBody.body) return

    const body = this.physicsBody.body

    // 1. Ground detection
    this.grounded = body.blocked.down || body.touching.down

    // 2. Poll inputs (Keyboard + Touch Virtual Input Bridge)
    const isLeft = Boolean(
      (this.cursors?.left.isDown ?? false) ||
      (this.keyA?.isDown ?? false) ||
      virtualInputBridge.isLeft()
    )

    const isRight = Boolean(
      (this.cursors?.right.isDown ?? false) ||
      (this.keyD?.isDown ?? false) ||
      virtualInputBridge.isRight()
    )

    const jumpRequested = Boolean(
      (this.keySpace && Phaser.Input.Keyboard.JustDown(this.keySpace)) ||
      (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (this.keyW && Phaser.Input.Keyboard.JustDown(this.keyW)) ||
      virtualInputBridge.consumeJump()
    )

    // 3. Horizontal movement
    if (isLeft && !isRight) {
      body.setVelocityX(-this.moveSpeed)
      this.facing = -1
      this.moving = true
    } else if (isRight && !isLeft) {
      body.setVelocityX(this.moveSpeed)
      this.facing = 1
      this.moving = true
    } else {
      body.setVelocityX(0)
      this.moving = false
    }

    // 4. Jump execution (single jump, fresh press only, grounded only)
    if (jumpRequested && this.grounded) {
      body.setVelocityY(-this.jumpSpeed)
      this.grounded = false
    }

    // 5. Synchronize visual Dennis entity
    this.dennis.setPosition(this.physicsBody.x, this.physicsBody.y)
    this.dennis.setFacingDirection(this.facing)

    // 6. Update animation states
    if (!this.grounded) {
      if (body.velocity.y < 0) {
        this.dennis.playAnimation('jump')
      } else {
        this.dennis.playAnimation('fall')
      }
    } else if (this.moving) {
      this.dennis.playAnimation('run')
    } else {
      this.dennis.playAnimation('idle')
    }
  }

  /**
   * Repositions the physics body and Dennis (e.g. during canvas resize).
   */
  public setPosition(x: number, y: number): void {
    this.physicsBody.setPosition(x, y)
    this.physicsBody.body.reset(x, y)
    this.dennis.setPosition(x, y)
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.physicsBody.x, y: this.physicsBody.y }
  }

  public isPlayerGrounded(): boolean {
    return this.grounded
  }

  public isPlayerMoving(): boolean {
    return this.moving
  }

  public getStateLabel(): string {
    if (!this.grounded) {
      return this.physicsBody.body.velocity.y < 0 ? 'AIRBORNE [JUMP]' : 'AIRBORNE [FALL]'
    }
    return this.moving ? `RUNNING [${this.facing === 1 ? 'RIGHT' : 'LEFT'}]` : 'GROUNDED [IDLE]'
  }

  /**
   * Cleans up keyboard captures, listeners, and the physics body.
   */
  public destroy(): void {
    try {
      const kb = this.scene.input?.keyboard
      // Only clear captures if the keyboard manager is still initialized
      if (kb && 'manager' in kb && kb.manager) {
        kb.clearCaptures()
      }
    } catch {
      // Phaser input manager may have already been dismantled
    }

    if (this.physicsBody) {
      this.physicsBody.destroy()
    }

    virtualInputBridge.reset()
  }
}
