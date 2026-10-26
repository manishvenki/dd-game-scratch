import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VirtualInputBridge } from '../virtualInputBridge'

describe('VirtualInputBridge - Multi-Touch Input Logic', () => {
  let bridge: VirtualInputBridge

  beforeEach(() => {
    bridge = new VirtualInputBridge()
  })

  it('1. Press RIGHT -> RIGHT becomes active', () => {
    bridge.pressAction('right', 1)
    expect(bridge.isRight()).toBe(true)
    expect(bridge.isLeft()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(false)
    expect(bridge.isAttackHeld()).toBe(false)
    expect(bridge.getActivePointers('right')).toEqual([1])
  })

  it('2. Press JUMP while RIGHT remains active -> both remain active', () => {
    bridge.pressAction('right', 1)
    bridge.pressAction('jump', 2)

    expect(bridge.isRight()).toBe(true)
    expect(bridge.isJumpHeld()).toBe(true)
    expect(bridge.consumeJump()).toBe(true)
    // JUMP held state remains true while pointer 2 is held, but consumeJump fires once
    expect(bridge.isJumpHeld()).toBe(true)
    expect(bridge.consumeJump()).toBe(false)
    expect(bridge.getActivePointers('right')).toEqual([1])
    expect(bridge.getActivePointers('jump')).toEqual([2])
  })

  it('3. Press ATTACK while RIGHT and JUMP remain active -> all three remain active', () => {
    bridge.pressAction('right', 1)
    bridge.pressAction('jump', 2)
    bridge.pressAction('attack', 3)

    expect(bridge.isRight()).toBe(true)
    expect(bridge.isJumpHeld()).toBe(true)
    expect(bridge.isAttackHeld()).toBe(true)
    expect(bridge.consumeAttack()).toBe(true)
    expect(bridge.consumeAttack()).toBe(false)
  })

  it('4. Release RIGHT -> JUMP and ATTACK remain active', () => {
    bridge.pressAction('right', 1)
    bridge.pressAction('jump', 2)
    bridge.pressAction('attack', 3)

    bridge.releaseAction('right', 1)

    expect(bridge.isRight()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(true)
    expect(bridge.isAttackHeld()).toBe(true)
  })

  it('5. Release JUMP -> ATTACK remains active', () => {
    bridge.pressAction('right', 1)
    bridge.pressAction('jump', 2)
    bridge.pressAction('attack', 3)

    bridge.releaseAction('right', 1)
    bridge.releaseAction('jump', 2)

    expect(bridge.isRight()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(false)
    expect(bridge.isAttackHeld()).toBe(true)
  })

  it('6. Release ATTACK -> all actions become inactive', () => {
    bridge.pressAction('right', 1)
    bridge.pressAction('jump', 2)
    bridge.pressAction('attack', 3)

    bridge.releaseAction('right', 1)
    bridge.releaseAction('jump', 2)
    bridge.releaseAction('attack', 3)

    expect(bridge.isRight()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(false)
    expect(bridge.isAttackHeld()).toBe(false)
    expect(bridge.isLeft()).toBe(false)
  })

  it('7. Cancel one pointer via releasePointer -> unrelated pointers remain active', () => {
    // Finger 1 on LEFT, Finger 2 on JUMP
    bridge.pressAction('left', 101)
    bridge.pressAction('jump', 102)

    expect(bridge.isLeft()).toBe(true)
    expect(bridge.isJumpHeld()).toBe(true)

    // OS cancels pointer 102 (e.g. notification shade or palm detection)
    bridge.releasePointer(102)

    expect(bridge.isLeft()).toBe(true) // Left must remain intact!
    expect(bridge.isJumpHeld()).toBe(false)
    expect(bridge.getActivePointers('left')).toEqual([101])
  })

  it('8. Lose focus / Tab blur -> all stale held inputs clear safely', () => {
    bridge.pressAction('right', 1)
    bridge.pressAction('jump', 2)
    bridge.pressAction('attack', 3)

    expect(bridge.isRight()).toBe(true)

    // Window blur event triggers bridge.reset()
    bridge.reset()

    expect(bridge.isRight()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(false)
    expect(bridge.isAttackHeld()).toBe(false)
    expect(bridge.isLeft()).toBe(false)
    expect(bridge.getActivePointers('right')).toHaveLength(0)
    expect(bridge.consumeJump()).toBe(false)
    expect(bridge.consumeAttack()).toBe(false)
  })

  it('9. Pause the game -> gameplay inputs cannot remain stuck', () => {
    bridge.pressAction('left', 5)
    bridge.pressAction('jump', 6)

    // Game pauses -> input bridge reset
    bridge.reset()

    expect(bridge.isLeft()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(false)
  })

  it('10. Resume -> fresh inputs work normally', () => {
    bridge.reset()
    bridge.pressAction('right', 7)

    expect(bridge.isRight()).toBe(true)
    expect(bridge.getActivePointers('right')).toEqual([7])
  })

  it('11. Enter Game Over -> no held input remains active', () => {
    bridge.pressAction('right', 8)
    bridge.pressAction('jump', 9)

    // Caught / Game over triggers reset
    bridge.reset()

    expect(bridge.isRight()).toBe(false)
    expect(bridge.isJumpHeld()).toBe(false)
    expect(bridge.getActivePointers('right')).toHaveLength(0)
    expect(bridge.getActivePointers('jump')).toHaveLength(0)
  })

  it('12. Restart a level -> input state is clean', () => {
    bridge.pressAction('left', 10)
    bridge.pressAction('attack', 11)

    // loadLevel() cleans input bridge
    bridge.reset()

    expect(bridge.isLeft()).toBe(false)
    expect(bridge.isAttackHeld()).toBe(false)
  })

  it('13. Keyboard and touch input coexist without cancelling each other', () => {
    // Touch holds RIGHT (pointer 1)
    bridge.pressAction('right', 1)
    expect(bridge.isRight()).toBe(true)

    // Direct / fallback / keyboard also triggers jump
    bridge.pressAction('jump')
    expect(bridge.isRight()).toBe(true)
    expect(bridge.isJumpHeld()).toBe(true)
    expect(bridge.consumeJump()).toBe(true)

    // Release direct jump
    bridge.releaseAction('jump')
    expect(bridge.isJumpHeld()).toBe(false)
    // Touch RIGHT is still holding!
    expect(bridge.isRight()).toBe(true)
  })

  it('14. Repeated rapid touches do not cause stuck movement or repeated unintended attacks', () => {
    // Rapid taps on ATTACK
    for (let i = 0; i < 5; i++) {
      bridge.pressAction('attack', 20 + i)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.consumeAttack()).toBe(false) // Never fires twice per tap
      bridge.releaseAction('attack', 20 + i)
    }

    expect(bridge.isAttackHeld()).toBe(false)
    expect(bridge.consumeAttack()).toBe(false)

    // Rapid taps on RIGHT
    for (let i = 0; i < 5; i++) {
      bridge.pressAction('right', 30 + i)
      expect(bridge.isRight()).toBe(true)
      bridge.releaseAction('right', 30 + i)
      expect(bridge.isRight()).toBe(false)
    }

    expect(bridge.isRight()).toBe(false)
  })

  it('15. Subscribers receive notifications on action state transitions', () => {
    const subscriber = vi.fn()
    const unsubscribe = bridge.subscribe(subscriber)

    bridge.pressAction('right', 1)
    expect(subscriber).toHaveBeenCalledWith('right', true)

    bridge.releaseAction('right', 1)
    expect(subscriber).toHaveBeenCalledWith('right', false)

    unsubscribe()
    bridge.pressAction('left', 2)
    // Should not call after unsubscribe
    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  describe('All 11 Required Gameplay Input Combinations', () => {
    it('Combination 1: LEFT alone', () => {
      bridge.pressAction('left', 1)
      expect(bridge.isLeft()).toBe(true)
      expect(bridge.isRight()).toBe(false)
      expect(bridge.isJumpHeld()).toBe(false)
      expect(bridge.isAttackHeld()).toBe(false)
      bridge.releaseAction('left', 1)
      expect(bridge.isLeft()).toBe(false)
    })

    it('Combination 2: RIGHT alone', () => {
      bridge.pressAction('right', 1)
      expect(bridge.isRight()).toBe(true)
      expect(bridge.isLeft()).toBe(false)
      expect(bridge.isJumpHeld()).toBe(false)
      expect(bridge.isAttackHeld()).toBe(false)
      bridge.releaseAction('right', 1)
      expect(bridge.isRight()).toBe(false)
    })

    it('Combination 3: JUMP alone', () => {
      bridge.pressAction('jump', 1)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.consumeJump()).toBe(true)
      expect(bridge.isLeft()).toBe(false)
      expect(bridge.isRight()).toBe(false)
      expect(bridge.isAttackHeld()).toBe(false)
      bridge.releaseAction('jump', 1)
      expect(bridge.isJumpHeld()).toBe(false)
    })

    it('Combination 4: ATTACK alone', () => {
      bridge.pressAction('attack', 1)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.isLeft()).toBe(false)
      expect(bridge.isRight()).toBe(false)
      expect(bridge.isJumpHeld()).toBe(false)
      bridge.releaseAction('attack', 1)
      expect(bridge.isAttackHeld()).toBe(false)
    })

    it('Combination 5: LEFT + JUMP simultaneously', () => {
      bridge.pressAction('left', 1)
      bridge.pressAction('jump', 2)
      expect(bridge.isLeft()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.consumeJump()).toBe(true)
      expect(bridge.isRight()).toBe(false)
      expect(bridge.isAttackHeld()).toBe(false)

      bridge.releaseAction('jump', 2)
      expect(bridge.isLeft()).toBe(true) // LEFT still held
      expect(bridge.isJumpHeld()).toBe(false)

      bridge.releaseAction('left', 1)
      expect(bridge.isLeft()).toBe(false)
    })

    it('Combination 6: RIGHT + JUMP simultaneously', () => {
      bridge.pressAction('right', 1)
      bridge.pressAction('jump', 2)
      expect(bridge.isRight()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.consumeJump()).toBe(true)
      expect(bridge.isLeft()).toBe(false)
      expect(bridge.isAttackHeld()).toBe(false)

      bridge.releaseAction('right', 1)
      expect(bridge.isJumpHeld()).toBe(true) // JUMP still held
      expect(bridge.isRight()).toBe(false)

      bridge.releaseAction('jump', 2)
      expect(bridge.isJumpHeld()).toBe(false)
    })

    it('Combination 7: LEFT + ATTACK simultaneously', () => {
      bridge.pressAction('left', 1)
      bridge.pressAction('attack', 2)
      expect(bridge.isLeft()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.isRight()).toBe(false)
      expect(bridge.isJumpHeld()).toBe(false)

      bridge.releaseAction('attack', 2)
      expect(bridge.isLeft()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(false)

      bridge.releaseAction('left', 1)
      expect(bridge.isLeft()).toBe(false)
    })

    it('Combination 8: RIGHT + ATTACK simultaneously', () => {
      bridge.pressAction('right', 1)
      bridge.pressAction('attack', 2)
      expect(bridge.isRight()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.isLeft()).toBe(false)
      expect(bridge.isJumpHeld()).toBe(false)

      bridge.releaseAction('attack', 2)
      expect(bridge.isRight()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(false)

      bridge.releaseAction('right', 1)
      expect(bridge.isRight()).toBe(false)
    })

    it('Combination 9: JUMP + ATTACK simultaneously', () => {
      bridge.pressAction('jump', 1)
      bridge.pressAction('attack', 2)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.consumeJump()).toBe(true)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.isLeft()).toBe(false)
      expect(bridge.isRight()).toBe(false)

      bridge.releaseAction('jump', 1)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(false)

      bridge.releaseAction('attack', 2)
      expect(bridge.isAttackHeld()).toBe(false)
    })

    it('Combination 10: LEFT + JUMP + ATTACK simultaneously', () => {
      bridge.pressAction('left', 1)
      bridge.pressAction('jump', 2)
      bridge.pressAction('attack', 3)

      expect(bridge.isLeft()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.consumeJump()).toBe(true)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.isRight()).toBe(false)

      // Release jump, left and attack must stay active
      bridge.releaseAction('jump', 2)
      expect(bridge.isLeft()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(false)

      // Release left, attack stays active
      bridge.releaseAction('left', 1)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.isLeft()).toBe(false)

      // Release attack
      bridge.releaseAction('attack', 3)
      expect(bridge.isAttackHeld()).toBe(false)
    })

    it('Combination 11: RIGHT + JUMP + ATTACK simultaneously', () => {
      bridge.pressAction('right', 1)
      bridge.pressAction('jump', 2)
      bridge.pressAction('attack', 3)

      expect(bridge.isRight()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(true)
      expect(bridge.consumeJump()).toBe(true)
      expect(bridge.consumeAttack()).toBe(true)
      expect(bridge.isLeft()).toBe(false)

      // Release attack, right and jump must stay active
      bridge.releaseAction('attack', 3)
      expect(bridge.isRight()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(true)
      expect(bridge.isAttackHeld()).toBe(false)

      // Release jump, right stays active
      bridge.releaseAction('jump', 2)
      expect(bridge.isRight()).toBe(true)
      expect(bridge.isJumpHeld()).toBe(false)

      // Release right
      bridge.releaseAction('right', 1)
      expect(bridge.isRight()).toBe(false)
    })
  })
})
