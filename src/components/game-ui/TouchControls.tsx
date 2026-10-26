import { useState, useEffect } from 'react'
import { virtualInputBridge, type InputAction } from '../../game/systems/virtualInputBridge'

/**
 * TouchControls - Standalone, isolated on-screen game controls for mobile and tablet devices.
 *
 * Encapsulates multi-touch input handling and button press feedback so that touch button state
 * updates never cause PlayPage or GameCanvas to re-render.
 *
 * Implements strict browser gesture cancellation (preventing pull-to-refresh and bezel history-back swipes)
 * and pointer capture guarantees.
 */
export default function TouchControls() {
  const [heldActions, setHeldActions] = useState<Record<InputAction, boolean>>({
    left: false,
    right: false,
    jump: false,
    attack: false,
  })

  useEffect(() => {
    return virtualInputBridge.subscribe((action, active) => {
      setHeldActions((prev) => (prev[action] === active ? prev : { ...prev, [action]: active }))
    })
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none flex flex-col justify-end p-2.5 sm:p-5 pb-[max(8px,env(safe-area-inset-bottom))] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] z-20 select-none touch-none"
      style={{ overscrollBehavior: 'none' }}
    >
      <div className="flex items-end justify-between w-full pointer-events-none">
        {/* Movement Buttons (Left / Right) */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 touch-none select-none">
          <button
            type="button"
            id="btn-touch-left"
            aria-label="Move Dennis Left"
            data-pressed={heldActions.left ? 'true' : 'false'}
            onPointerDown={(e) => {
              e.preventDefault()
              e.currentTarget.setPointerCapture?.(e.pointerId)
              virtualInputBridge.pressAction('left', e.pointerId)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              virtualInputBridge.releaseAction('left', e.pointerId)
            }}
            onPointerCancel={(e) => {
              virtualInputBridge.releaseAction('left', e.pointerId)
            }}
            onLostPointerCapture={(e) => {
              virtualInputBridge.releaseAction('left', e.pointerId)
            }}
            onTouchStart={(e) => {
              // Crucial mobile browser safety: prevent Chrome/Edge bezel history-back gesture
              e.preventDefault()
            }}
            onTouchMove={(e) => {
              e.preventDefault()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl backdrop-blur-sm border-2 flex items-center justify-center font-bold shadow-xl touch-none select-none cursor-pointer transition-all ${
              heldActions.left
                ? 'bg-amber-500/40 border-amber-300 scale-95 text-amber-200 shadow-amber-500/20 shadow-lg'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-100 hover:border-slate-500'
            }`}
          >
            <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            id="btn-touch-right"
            aria-label="Move Dennis Right"
            data-pressed={heldActions.right ? 'true' : 'false'}
            onPointerDown={(e) => {
              e.preventDefault()
              e.currentTarget.setPointerCapture?.(e.pointerId)
              virtualInputBridge.pressAction('right', e.pointerId)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              virtualInputBridge.releaseAction('right', e.pointerId)
            }}
            onPointerCancel={(e) => {
              virtualInputBridge.releaseAction('right', e.pointerId)
            }}
            onLostPointerCapture={(e) => {
              virtualInputBridge.releaseAction('right', e.pointerId)
            }}
            onTouchStart={(e) => {
              e.preventDefault()
            }}
            onTouchMove={(e) => {
              e.preventDefault()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl backdrop-blur-sm border-2 flex items-center justify-center font-bold shadow-xl touch-none select-none cursor-pointer transition-all ${
              heldActions.right
                ? 'bg-amber-500/40 border-amber-300 scale-95 text-amber-200 shadow-amber-500/20 shadow-lg'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-100 hover:border-slate-500'
            }`}
          >
            <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Action Buttons: Attack & Jump */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 touch-none select-none">
          <button
            type="button"
            id="btn-touch-attack"
            aria-label="Attack"
            data-pressed={heldActions.attack ? 'true' : 'false'}
            onPointerDown={(e) => {
              e.preventDefault()
              e.currentTarget.setPointerCapture?.(e.pointerId)
              virtualInputBridge.pressAction('attack', e.pointerId)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              virtualInputBridge.releaseAction('attack', e.pointerId)
            }}
            onPointerCancel={(e) => {
              virtualInputBridge.releaseAction('attack', e.pointerId)
            }}
            onLostPointerCapture={(e) => {
              virtualInputBridge.releaseAction('attack', e.pointerId)
            }}
            onTouchStart={(e) => {
              e.preventDefault()
            }}
            onTouchMove={(e) => {
              e.preventDefault()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-15 h-15 sm:w-20 sm:h-20 rounded-2xl backdrop-blur-sm border-2 flex flex-col items-center justify-center shadow-xl touch-none select-none cursor-pointer transition-all gap-0.5 ${
              heldActions.attack
                ? 'bg-rose-500/50 border-rose-300 scale-95 text-rose-100 shadow-rose-500/30 shadow-lg'
                : 'bg-rose-500/20 border-rose-500/70 text-rose-200 hover:border-rose-400'
            }`}
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-gta-heading font-black uppercase tracking-wider">ATTACK</span>
          </button>

          <button
            type="button"
            id="btn-touch-jump"
            aria-label="Jump"
            data-pressed={heldActions.jump ? 'true' : 'false'}
            onPointerDown={(e) => {
              e.preventDefault()
              e.currentTarget.setPointerCapture?.(e.pointerId)
              virtualInputBridge.pressAction('jump', e.pointerId)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              virtualInputBridge.releaseAction('jump', e.pointerId)
            }}
            onPointerCancel={(e) => {
              virtualInputBridge.releaseAction('jump', e.pointerId)
            }}
            onLostPointerCapture={(e) => {
              virtualInputBridge.releaseAction('jump', e.pointerId)
            }}
            onTouchStart={(e) => {
              e.preventDefault()
            }}
            onTouchMove={(e) => {
              e.preventDefault()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-15 h-15 sm:w-20 sm:h-20 rounded-2xl backdrop-blur-sm border-2 flex flex-col items-center justify-center shadow-xl touch-none select-none cursor-pointer transition-all gap-0.5 ${
              heldActions.jump
                ? 'bg-amber-500/50 border-amber-300 scale-95 text-amber-100 shadow-amber-500/30 shadow-lg'
                : 'bg-amber-500/20 border-amber-500/70 text-amber-200 hover:border-amber-400'
            }`}
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-[10px] sm:text-xs font-gta-heading font-black uppercase tracking-wider">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  )
}
