import { useState, useEffect, useRef } from 'react'
import GameCanvas from '../components/GameCanvas'
import { virtualInputBridge } from '../game/systems/virtualInputBridge'
import { audioManager } from '../game/systems/AudioManager'
import SettingsModal from '../components/game-ui/SettingsModal'

export default function PlayPage() {
  const [activeLevel, setActiveLevel] = useState<string>(() => {
    const hash = window.location.hash
    if (hash.includes('level=5')) return 'level-5'
    if (hash.includes('level=4')) return 'level-4'
    if (hash.includes('level=3')) return 'level-3'
    if (hash.includes('level=2')) return 'level-2'
    return 'level-1'
  })

  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted())
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth && window.innerWidth < 850
  })
  const [dismissPortraitWarning, setDismissPortraitWarning] = useState(false)

  const gameSectionRef = useRef<HTMLElement | null>(null)

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

  // 2. Audio Manager Subscription and First-Gesture Activation
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((muted) => {
      setIsMuted(muted)
    })

    // Attempt direct playback (if coming from user gesture on Home)
    void audioManager.play().catch(() => {})

    // Fallback: start on first pointer or keydown gesture on the page
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

  // 3. Screen Orientation and Fullscreen Listeners
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 850
      setIsPortrait(portrait)
      if (!portrait) {
        setDismissPortraitWarning(false)
      }
    }

    const checkFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    document.addEventListener('fullscreenchange', checkFullscreen)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
      document.removeEventListener('fullscreenchange', checkFullscreen)
    }
  }, [])

  const switchLevel = (levelId: string, levelNum: number) => {
    setActiveLevel(levelId)
    window.location.hash = `#/play?level=${levelNum}`
    ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: string) => void }).__DD_LOAD_LEVEL__?.(levelId)
  }

  const toggleMute = () => {
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const target = gameSectionRef.current ?? document.documentElement
        if (target.requestFullscreen) {
          await target.requestFullscreen()
        }

        // Request landscape orientation lock if available in the browser
        try {
          const screenOrientation = window.screen?.orientation as unknown as {
            lock?: (orientation: string) => Promise<void>
          }
          if (screenOrientation?.lock) {
            await screenOrientation.lock('landscape')
          }
        } catch {
          // Gracefully ignore rejected or unsupported orientation locks
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

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Level Select */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STAGES 1–5 ACTIVE &bull; CUBBON FINALE READY
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Developed by its2much Mv
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Playable Encounters
          </h1>
          <p className="text-sm text-slate-400">
            Interactive combat, continuous trio pursuit, comic Tanglish story encounters, and background music across Bengaluru.
          </p>
        </div>

        {/* Level Switcher Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            id="btn-select-level-1"
            onClick={() => switchLevel('level-1', 1)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-1'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L1: College Gate
          </button>
          <button
            type="button"
            id="btn-select-level-2"
            onClick={() => switchLevel('level-2', 2)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-2'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L2: Thatha Tea
          </button>
          <button
            type="button"
            id="btn-select-level-3"
            onClick={() => switchLevel('level-3', 3)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-3'
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L3: MG Road Reveal
          </button>
          <button
            type="button"
            id="btn-select-level-4"
            onClick={() => switchLevel('level-4', 4)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-4'
                ? 'bg-pink-500/25 text-pink-300 border-pink-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L4: Rajkumar Park
          </button>
          <button
            type="button"
            id="btn-select-level-5"
            onClick={() => switchLevel('level-5', 5)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-5'
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L5: Cubbon Finale
          </button>
        </div>
      </div>

      {/* Main Game Viewport Container with Live Phaser Canvas & HUD Controls */}
      <section
        ref={gameSectionRef}
        aria-label="Phaser 3 Game Canvas and Controls"
        className={`relative w-full bg-slate-950 overflow-hidden select-none ${
          isFullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-0'
            : 'rounded-2xl border border-slate-800 shadow-2xl'
        }`}
      >
        {/* Aspect Ratio Container (adapts dynamically in fullscreen) */}
        <div className={`relative w-full ${isFullscreen ? 'h-full' : 'aspect-[16/9] max-h-[580px] min-h-[300px]'}`}>
          <GameCanvas className="w-full h-full" />

          {/* Top HUD Controls Overlay (Mute Button, Fullscreen Toggle, Branding) */}
          <div className="absolute top-0 inset-x-0 p-3 sm:p-4 z-30 pointer-events-none flex items-center justify-between">
            <div className="pointer-events-auto flex items-center gap-2">
              <a
                href="#/"
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-xs font-mono font-bold text-slate-200 hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-1.5"
                title="Return to Main Menu"
              >
                <span>&larr;</span>
                <span>MENU</span>
              </a>
              {isFullscreen && (
                <button
                  type="button"
                  id="btn-exit-fullscreen"
                  onClick={toggleFullscreen}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700 text-xs font-mono text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors shadow-lg"
                >
                  &larr; Exit Fullscreen
                </button>
              )}
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              {/* Settings Button */}
              <button
                type="button"
                id="btn-play-settings"
                onClick={() => setShowSettings(true)}
                title="Settings"
                aria-label="Settings"
                className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-all shadow-lg"
              >
                ⚙
              </button>

              {/* Audio BGM Mute/Unmute Toggle Button */}
              <button
                type="button"
                id="btn-audio-mute"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
                title={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md border text-xs font-mono font-semibold transition-all shadow-lg cursor-pointer ${
                  isMuted
                    ? 'bg-rose-950/80 border-rose-700/80 text-rose-300 hover:bg-rose-900/90'
                    : 'bg-slate-900/85 border-slate-700/80 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                {isMuted ? (
                  <>
                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <span className="hidden sm:inline">MUTED</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span className="hidden sm:inline">BGM: ON</span>
                  </>
                )}
              </button>

              {/* Fullscreen Landscape Toggle Button */}
              <button
                type="button"
                id="btn-toggle-fullscreen"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Leave Fullscreen' : 'Enter Fullscreen Landscape'}
                title={isFullscreen ? 'Leave Fullscreen' : 'Enter Fullscreen Landscape'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-all shadow-lg"
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5m6 6l5 5m0 0l-5 0m5 0l0-5M9 15l-5 5m0 0l5 0m-5 0l0-5m16-6l-5-5m0 0l5 0m-5 0l0 5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
                <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
              </button>
            </div>
          </div>

          {/* Portrait Device Rotation Advisory Overlay */}
          {isPortrait && !dismissPortraitWarning && (
            <div
              role="alert"
              aria-live="polite"
              className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mb-4 text-amber-400">
                <svg className="w-9 h-9 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                Rotate Device to Landscape
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed mb-6">
                DD Game Scratch is designed for a full-screen landscape view. Please turn your phone sideways for the best Bangalore sprint experience.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  id="btn-dismiss-portrait-warning"
                  onClick={() => setDismissPortraitWarning(true)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Continue in Portrait
                </button>
                <button
                  type="button"
                  id="btn-rotate-fullscreen"
                  onClick={toggleFullscreen}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Go Fullscreen
                </button>
              </div>
            </div>
          )}

          {/* Touch Controls Overlay (visible inside the game viewport) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-3 sm:p-5 z-20">
            <div className="flex items-end justify-between w-full">
              {/* Left / Right Movement Buttons */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  id="btn-touch-left"
                  aria-label="Move Dennis Left"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setLeft(true)
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setLeft(false)
                  }}
                  onPointerLeave={() => virtualInputBridge.setLeft(false)}
                  onPointerCancel={() => virtualInputBridge.setLeft(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900/85 backdrop-blur-md border-2 border-slate-700/80 active:bg-amber-500/25 active:border-amber-400 active:scale-95 text-slate-200 active:text-amber-300 flex items-center justify-center font-bold text-xl shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  id="btn-touch-right"
                  aria-label="Move Dennis Right"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setRight(true)
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setRight(false)
                  }}
                  onPointerLeave={() => virtualInputBridge.setRight(false)}
                  onPointerCancel={() => virtualInputBridge.setRight(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900/85 backdrop-blur-md border-2 border-slate-700/80 active:bg-amber-500/25 active:border-amber-400 active:scale-95 text-slate-200 active:text-amber-300 flex items-center justify-center font-bold text-xl shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Action Buttons: Jump & Attack */}
              <div className="pointer-events-auto flex items-center gap-2">
                {/* Attack Button */}
                <button
                  type="button"
                  id="btn-touch-attack"
                  aria-label="Attack"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.triggerAttack()
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-rose-500/20 backdrop-blur-md border-2 border-rose-500/70 active:bg-rose-500/40 active:border-rose-300 active:scale-95 text-rose-300 flex flex-col items-center justify-center shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">ATTACK</span>
                </button>

                {/* Jump Button */}
                <button
                  type="button"
                  id="btn-touch-jump"
                  aria-label="Jump"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.triggerJump()
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-amber-500/20 backdrop-blur-md border-2 border-amber-500/70 active:bg-amber-500/40 active:border-amber-300 active:scale-95 text-amber-300 flex flex-col items-center justify-center shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">JUMP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Legend & Engine Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-200">Controls:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">A / D or ← / →</span>
          <span>Move</span>
          <span className="text-slate-600">&bull;</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">SPACE or ↑</span>
          <span>Jump</span>
          <span className="text-slate-600">&bull;</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80">J or X</span>
          <span>Attack</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-cyan-400">Touch Controls</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Stages 1–5 Active</span>
          <span className="text-slate-600">&bull;</span>
          <span>BGM: {isMuted ? 'Muted' : 'Playing'}</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-400 font-semibold">Developed by its2much Mv</span>
        </div>
      </div>

      {/* Development Status Callouts */}
      <section aria-label="Development status details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Stage 05: Cubbon Park Grand Finale
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The climax of Dennis&apos;s Bengaluru escape adventure! Dash past lush red-dirt jogging trails, bamboo groves, flowering Gulmohar canopies, and park benches under warm evening sunset lighting to reach the historic 1868 Bandstand for the comedic conclusion.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Continuous Chase, Dialogue &amp; BGM
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manish, Sathish, and Rahul maintain pursuit across every stage with frame-rate independent physics. Catch events trigger authentic comic Tanglish speech bubbles, with seamless BGM looping and accessible mute controls.
          </p>
        </div>
      </section>

      {/* In-Game Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onReturnHome={() => {
          window.location.hash = '#/'
        }}
      />
    </div>
  )
}
