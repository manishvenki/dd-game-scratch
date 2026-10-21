/**
 * Typed virtual input bridge connecting touch/pointer controls
 * directly to the Phaser PlayerController without triggering React re-renders.
 */
class VirtualInputBridge {
  private leftDown = false
  private rightDown = false
  private jumpRequested = false
  private attackRequested = false

  public setLeft(isDown: boolean): void {
    this.leftDown = isDown
  }

  public setRight(isDown: boolean): void {
    this.rightDown = isDown
  }

  public triggerJump(): void {
    this.jumpRequested = true
  }

  public triggerAttack(): void {
    this.attackRequested = true
  }

  public isLeft(): boolean {
    return this.leftDown
  }

  public isRight(): boolean {
    return this.rightDown
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

  public reset(): void {
    this.leftDown = false
    this.rightDown = false
    this.jumpRequested = false
    this.attackRequested = false
  }
}

export const virtualInputBridge = new VirtualInputBridge()
