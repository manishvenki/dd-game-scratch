import { useState, useEffect, useRef } from 'react'
import GameCanvas from '../components/GameCanvas'
import { virtualInputBridge, type InputAction } from '../game/systems/virtualInputBridge'
import { audioManager } from '../game/systems/AudioManager'
import SettingsModal from '../components/game-ui/SettingsModal'
import PauseMenuModal from '../components/game-ui/PauseMenuModal'
import RotateOverlay from '../components/game-ui/RotateOverlay'

const STAGE_TITLES: Record<string, string> = {
  'level-1': 'STAGE 01 • COLLEGE GATE',
  'level-2': 'STAGE 02 • THATHA TEA',
  'level-3': 'STAGE 03 • MG ROAD REVEAL',
  'level-4': 'STAGE 04 • RAJKUMAR PARK',
  'level-5': 'STAGE 05 • CUBBON PARK FINALE',
}

export default function PlayPage() {
  const [activeLevel, setActiveLevel] = useState<string>(() => {
    const hash = window.location.hash
    if (hash.includes('level=5')) return 'level-5'
    if (hash.includes('level=4')) return 'level-4'
    if (hash.includes('level=3')) return 'level-3'
    if (hash.includes('level=2')) return 'level-2'
    return 'level-1'
  })

  const [isMuted, setIsMuted] = useState(() => audioManager.isMusicMuted() && audioManager.isSfxMuted())
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth && window.innerWidth < 850
  })
  const [dismissPortraitWarning, setDismissPortraitWarning] = useState(false)

  // Independent multi-touch held button states for instantaneous visual feedback
  const [heldActions, setHeldActions] = useState<Record<InputAction, boolean>>({
    left: false,
    right: false,
    jump: false,
    attack: false,
  })

  const gameSectionRef = useRef<HTMLElement | null>(null)

  // Subscribe to virtualInputBridge to ensure UI buttons always mirror input state
  useEffect(() => {
    return virtualInputBridge.subscribe((action, active) => {
      setHeldActions((prev) => (prev[action] === active ? prev : { ...prev, [action]: active }))
    })
  }, [])

  // Clear all held inputs on unmount
  useEffect(() => {
    return () => {
      virtualInputBridge.reset()
    }
  }, [])

  // 1. Synchronize Level changes with URL Hash
  useEffect(() => {
    const syncLevel = () => {
      const hash = window.location.hash
      let lvl = 'level-1'
      if (hash.includes('level=5')) lvl = 'level-5'
      else if (hash.includes('level=4')) lvl = 'level-4'
      else if (hash.includes('level=3')) lvl = 'level-3'
      else if (hash.includes('level=2')) lvl = 'level-2'
      setActiveLevel(lvl)
      ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: string, force?: boolean) => void }).__DD_LOAD_LEVEL__?.(lvl, false)
    }
    window.addEventListener('hashchange', syncLevel)
    return () => window.removeEventListener('hashchange', syncLevel)
  }, [])

  // 2. Audio Manager Subscription and Gameplay Track Start
  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      setIsMuted(audioManager.isMusicMuted() && audioManager.isSfxMuted())
    })

    // Ensure dedicated gameplay BGM is active
    audioManager.setMusicTrack('gameplay')

    // Start on first pointer or keydown gesture if browser blocked autoplay
    const handleGesture = () => {
      void audioManager.play().catch(() => {})
    }
    window.addEventListener('pointerdown', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })

    return () => {
      unsubscribe()
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }
  }, [])

  // 3. Listen for Phaser scene pause / resume events
  useEffect(() => {
    const onPauseChange = (e: Event) => {
      const custom = e as CustomEvent<{ paused: boolean }>
      setIsPaused(Boolean(custom.detail?.paused))
    }
    window.addEventListener('dd_game_pause_change', onPauseChange)
    return () => window.removeEventListener('dd_game_pause_change', onPauseChange)
  }, [])

  // 4. Screen Orientation, Fullscreen, and Pointer Safety Listeners
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth
      setIsPortrait(portrait)
      if (!portrait) {
        setDismissPortraitWarning(false)
      }
    }

    const checkFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    // Safety: release specific pointer when that pointer is lifted or cancelled
    const handleGlobalPointerRelease = (e: PointerEvent) => {
      virtualInputBridge.releasePointer(e.pointerId)
    }

    // Reset all inputs on window blur, document hide, or orientation change
    const handleFullInputReset = () => {
      virtualInputBridge.reset()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        virtualInputBridge.reset()
      }
    }

    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', () => {
      checkOrientation()
      handleFullInputReset()
    })
    window.visualViewport?.addEventListener('resize', checkOrientation)
    document.addEventListener('fullscreenchange', checkFullscreen)
    window.addEventListener('pointerup', handleGlobalPointerRelease)
    window.addEventListener('pointercancel', handleGlobalPointerRelease)
    window.addEventListener('blur', handleFullInputReset)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
      window.visualViewport?.removeEventListener('resize', checkOrientation)
      document.removeEventListener('fullscreenchange', checkFullscreen)
      window.removeEventListener('pointerup', handleGlobalPointerRelease)
      window.removeEventListener('pointercancel', handleGlobalPointerRelease)
      window.removeEventListener('blur', handleFullInputReset)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const toggleMute = () => {
    audioManager.playSfx('click')
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const handlePauseToggle = () => {
    if (window.__DD_TOGGLE_PAUSE__) {
      const next = window.__DD_TOGGLE_PAUSE__()
      setIsPaused(next)
    } else {
      setIsPaused((prev) => !prev)
    }
  }

  const handleResume = () => {
    if (window.__DD_SET_PAUSED__) {
      window.__DD_SET_PAUSED__(false)
    }
    setIsPaused(false)
  }

  const handleRestartLevel = () => {
    if (window.__DD_RESTART_LEVEL__) {
      window.__DD_RESTART_LEVEL__()
    }
    setIsPaused(false)
  }

  const toggleFullscreen = async () => {
    audioManager.playSfx('click')
    try {
      if (!document.fullscreenElement) {
        const target = gameSectionRef.current ?? document.documentElement
        if (target.requestFullscreen) {
          await target.requestFullscreen()
        }

        try {
          const screenOrientation = window.screen?.orientation as unknown as {
            lock?: (orientation: string) => Promise<void>
          }
          if (screenOrientation?.lock) {
            await screenOrientation.lock('landscape')
          }
        } catch {
          // Gracefully ignore rejected orientation lock
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.warn('[PlayPage] Fullscreen toggle error:', err)
    }
  }

  const stageLabel = STAGE_TITLES[activeLevel] ?? 'DARLING DENNIS'

  return (
    <section
      ref={gameSectionRef}
      aria-label="Darling Dennis Game - Pure Landscape Game Experience"
      className="fixed inset-0 w-full h-full min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 select-none flex flex-col"
    >
      {/* Fullscreen Live Phaser Canvas */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <GameCanvas className="w-full h-full" />
      </div>

      {/* Game-Native Landscape HUD Overlay (ScrollFactor 0, absolute overlay) */}
      <header className="relative z-20 w-full px-2.5 py-1.5 sm:px-6 sm:py-3 pt-[max(6px,env(safe-area-inset-top))] pl-[max(10px,env(safe-area-inset-left))] pr-[max(10px,env(safe-area-inset-right))] flex items-center justify-between pointer-events-none">
        {/* Left: Pause Button & Stage Badge */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* PAUSE BUTTON */}
          <button
            type="button"
            id="btn-hud-pause"
            onClick={handlePauseToggle}
            className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-900/95 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/50 text-xs sm:text-base font-gta-heading tracking-wider font-black transition-all shadow-xl flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 min-h-[38px] sm:min-h-[46px]"
            title="Pause Game (ESC or P)"
          >
            <span className="text-sm sm:text-base">⏸</span>
            <span>PAUSE</span>
          </button>

          {/* STAGE BADGE */}
          <div className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs sm:text-base font-gta-heading tracking-wide text-white shadow-xl min-h-[38px] sm:min-h-[46px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-amber-300">{stageLabel}</span>
          </div>

          <div className="hidden lg:inline-block px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-gta-heading font-semibold text-slate-300">
            Developed by its2much Mv
          </div>
        </div>

        {/* Right: Audio, Settings, Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-xl">
          {/* Audio Mute/Unmute */}
          <button
            type="button"
            id="btn-play-audio"
            onClick={toggleMute}
            className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-base font-gta-heading tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer border min-h-[36px] sm:min-h-[44px] ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span className="text-sm sm:text-base">{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'BGM ON'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className="px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors text-xs sm:text-sm font-gta-heading tracking-wide flex items-center gap-1 min-h-[36px] sm:min-h-[44px]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <span className="text-sm sm:text-base">⛶</span>
            <span className="hidden md:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            id="btn-play-settings"
            onClick={() => {
              audioManager.playSfx('click')
              setShowSettings(true)
            }}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors flex items-center justify-center text-base sm:text-lg min-h-[36px] sm:min-h-[44px]"
            title="Game Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* On-screen Touch Controls (D-pad & Action Buttons for Mobile/Tablet) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-2.5 sm:p-5 pb-[max(8px,env(safe-area-inset-bottom))] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] z-20">
        <div className="flex items-end justify-between w-full">
          {/* Movement Buttons (Left / Right) */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
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
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
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

      {/* Game-Native Pause Menu Modal */}
      <PauseMenuModal
        isOpen={isPaused}
        onResume={handleResume}
        onRestartLevel={handleRestartLevel}
        onOpenSettings={() => setShowSettings(true)}
        onMainMenu={() => {
          handleResume()
          window.location.hash = '#/'
        }}
      />

      {/* Game Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onReturnHome={() => {
          handleResume()
          window.location.hash = '#/'
        }}
      />

      {/* Rotate Device To Landscape Advisory Overlay */}
      <RotateOverlay
        isPortrait={isPortrait && !dismissPortraitWarning}
        onDismiss={() => setDismissPortraitWarning(true)}
      />
    </section>
  )
}
