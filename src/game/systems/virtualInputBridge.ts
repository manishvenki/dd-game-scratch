/**
 * Typed virtual input bridge connecting mobile touch and pointer controls
 * directly to the Phaser PlayerController with full multi-touch support.
 *
 * Supports independent simultaneous held inputs (e.g., Hold RIGHT + JUMP + ATTACK)
 * with robust pointer lifecycle tracking and safe-release guarantees.
 */

export type InputAction = 'left' | 'right' | 'jump' | 'attack'

export class VirtualInputBridge {
  // Track active pointer IDs per action for multi-touch support
  private activePointers: Record<InputAction, Set<number>> = {
    left: new Set<number>(),
    right: new Set<number>(),
    jump: new Set<number>(),
    attack: new Set<number>(),
  }

  // Fallback / direct boolean flags (e.g. for keyboard or programmatic control)
  private directHeld: Record<InputAction, boolean> = {
    left: false,
    right: false,
    jump: false,
    attack: false,
  }

  // One-shot triggers for actions that fire once per distinct press
  private jumpRequested = false
  private attackRequested = false

  // Listener callbacks for state changes (keeps UI buttons in sync with zero latency)
  private listeners: Set<(action: InputAction, active: boolean) => void> = new Set()

  /**
   * Registers a press event for a specific action, associating it with a pointerId if available.
   */
  public pressAction(action: InputAction, pointerId?: number): void {
    if (pointerId !== undefined && pointerId !== null) {
      this.activePointers[action].add(pointerId)
    } else {
      this.directHeld[action] = true
    }

    if (action === 'jump') {
      this.jumpRequested = true
    } else if (action === 'attack') {
      this.attackRequested = true
    }

    this.notify(action, true)
  }

  /**
   * Releases a specific action. If pointerId is provided, removes only that pointer.
   * If no more pointers hold the action, it becomes inactive.
   */
  public releaseAction(action: InputAction, pointerId?: number): void {
    if (pointerId !== undefined && pointerId !== null) {
      this.activePointers[action].delete(pointerId)
    } else {
      this.directHeld[action] = false
      this.activePointers[action].clear()
    }

    const stillActive = this.isActionActive(action)
    this.notify(action, stillActive)
  }

  /**
   * Releases any actions held by a specific pointerId across all inputs.
   * Called on global pointerup/pointercancel to ensure stale pointers never persist,
   * without affecting other fingers holding other buttons!
   */
  public releasePointer(pointerId: number): void {
    const actions: InputAction[] = ['left', 'right', 'jump', 'attack']
    for (const action of actions) {
      if (this.activePointers[action].has(pointerId)) {
        this.activePointers[action].delete(pointerId)
        this.notify(action, this.isActionActive(action))
      }
    }
  }

  /**
   * Checks whether an action is currently held down by any pointer or direct state.
   */
  public isActionActive(action: InputAction): boolean {
    return this.directHeld[action] || this.activePointers[action].size > 0
  }

  // Directional accessors
  public isLeft(): boolean {
    return this.isActionActive('left')
  }

  public isRight(): boolean {
    return this.isActionActive('right')
  }

  public isJumpHeld(): boolean {
    return this.isActionActive('jump')
  }

  public isAttackHeld(): boolean {
    return this.isActionActive('attack')
  }

  // Backward-compatible directional setters
  public setLeft(isDown: boolean, pointerId?: number): void {
    if (isDown) this.pressAction('left', pointerId)
    else this.releaseAction('left', pointerId)
  }

  public setRight(isDown: boolean, pointerId?: number): void {
    if (isDown) this.pressAction('right', pointerId)
    else this.releaseAction('right', pointerId)
  }

  // One-shot triggers
  public triggerJump(pointerId?: number): void {
    this.pressAction('jump', pointerId)
  }

  public releaseJump(pointerId?: number): void {
    this.releaseAction('jump', pointerId)
  }

  public triggerAttack(pointerId?: number): void {
    this.pressAction('attack', pointerId)
  }

  public releaseAttack(pointerId?: number): void {
    this.releaseAction('attack', pointerId)
  }

  /**
   * Consumes the jump action so it only fires once per distinct press.
   */
  public consumeJump(): boolean {
    const requested = this.jumpRequested
    this.jumpRequested = false
    return requested
  }

  /**
   * Consumes the attack action so it only fires once per distinct press.
   */
  public consumeAttack(): boolean {
    const requested = this.attackRequested
    this.attackRequested = false
    return requested
  }

  /**
   * Returns active pointer IDs for an action (useful for tests and verification).
   */
  public getActivePointers(action: InputAction): number[] {
    return Array.from(this.activePointers[action])
  }

  /**
   * Subscribes to action state changes.
   */
  public subscribe(listener: (action: InputAction, active: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(action: InputAction, active: boolean): void {
    for (const listener of this.listeners) {
      try {
        listener(action, active)
      } catch (err) {
        console.error('Error in virtualInputBridge listener:', err)
      }
    }
  }

  /**
   * Completely clears all active pointers and held states.
   * Called on blur, hidden, pause, restart, caught, scene destroy.
   */
  public reset(): void {
    this.directHeld = { left: false, right: false, jump: false, attack: false }
    this.activePointers.left.clear()
    this.activePointers.right.clear()
    this.activePointers.jump.clear()
    this.activePointers.attack.clear()
    this.jumpRequested = false
    this.attackRequested = false
    this.notify('left', false)
    this.notify('right', false)
    this.notify('jump', false)
    this.notify('attack', false)
  }
}

export const virtualInputBridge = new VirtualInputBridge()
