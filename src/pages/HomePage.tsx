import { useState, useEffect } from 'react'
import GameCanvas from '../components/GameCanvas'
import { MainMenuScene } from '../game/scenes/MainMenuScene'
import { audioManager } from '../game/systems/AudioManager'
import type { PageId } from '../types/navigation'
import SettingsModal from '../components/game-ui/SettingsModal'
import CreditsModal from '../components/game-ui/CreditsModal'
import StageSelectModal from '../components/game-ui/StageSelectModal'
import CharacterSelectModal from '../components/game-ui/CharacterSelectModal'
import RotateOverlay from '../components/game-ui/RotateOverlay'

interface HomePageProps {
  onNavigate: (page: PageId) => void
  initialModal?: 'stages' | 'characters' | 'settings' | 'credits'
}

export default function HomePage({ onNavigate, initialModal }: HomePageProps) {
  const [isMuted, setIsMuted] = useState(() => audioManager.isMusicMuted() && audioManager.isSfxMuted())
  const [showSettings, setShowSettings] = useState(initialModal === 'settings')
  const [showCredits, setShowCredits] = useState(initialModal === 'credits')
  const [showStages, setShowStages] = useState(initialModal === 'stages')
  const [showCharacters, setShowCharacters] = useState(initialModal === 'characters')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth && window.innerWidth < 850
  })
  const [dismissPortraitWarning, setDismissPortraitWarning] = useState(false)

  // 1. Activate Main Menu BGM track on load
  useEffect(() => {
    audioManager.setMusicTrack('main-menu')
    const unsubscribe = audioManager.subscribe(() => {
      setIsMuted(audioManager.isMusicMuted() && audioManager.isSfxMuted())
    })

    const checkFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', checkFs)

    // Gesture listener to trigger audio if blocked
    const handleGesture = () => {
      void audioManager.play().catch(() => {})
    }
    window.addEventListener('pointerdown', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })

    return () => {
      unsubscribe()
      document.removeEventListener('fullscreenchange', checkFs)
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }
  }, [])

  // 2. Synchronize modals with URL hash routing (external system)
  useEffect(() => {
    const syncWithHash = () => {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('levels')) {
        setShowStages(true)
      } else if (hash.includes('characters')) {
        setShowCharacters(true)
      }
    }
    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  // 3. Orientation change listener
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 850
      setIsPortrait(portrait)
      if (!portrait) setDismissPortraitWarning(false)
    }
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  const handlePlayGame = () => {
    audioManager.playSfx('confirm')
    void audioManager.play().catch(() => {})
    window.location.hash = '#/play?level=1'
    onNavigate('play')
  }

  const handleAudioToggle = () => {
    audioManager.playSfx('click')
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const handleFullscreenToggle = async () => {
    audioManager.playSfx('click')
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.warn('[HomePage] Fullscreen toggle error:', err)
    }
  }

  const handleCloseModal = (modalName: string) => {
    audioManager.playSfx('cancel')
    audioManager.setMusicTrack('main-menu')
    if (modalName === 'stages') setShowStages(false)
    if (modalName === 'characters') setShowCharacters(false)
    if (modalName === 'settings') setShowSettings(false)
    if (modalName === 'credits') setShowCredits(false)
    if (window.location.hash !== '#/' && window.location.hash !== '') {
      window.location.hash = '#/'
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none flex flex-col justify-between bg-slate-950">
      {/* Live Phaser Scene Background: Thatha Tea, Kalyan Nagar */}
      <div className="absolute inset-0 z-0">
        <GameCanvas scenes={[MainMenuScene]} className="w-full h-full" />
      </div>

      {/* Top HUD: Title branding and quick audio/fullscreen toggles */}
      <header className="relative z-20 w-full p-4 sm:p-6 flex items-start justify-between pointer-events-none">
        {/* Game Title & Branding */}
        <div className="pointer-events-auto flex items-center gap-4 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 sm:px-5 shadow-2xl">
          <img
            src="/assets/branding/dd-game-icon.png"
            alt="DD Game Icon"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="gta-title text-3xl sm:text-5xl md:text-6xl text-white uppercase drop-shadow-md tracking-wider">
                DD Game Scratch
              </h1>
              <span className="hidden sm:inline-block px-3 py-1 rounded-lg text-sm sm:text-base gta-badge bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                ARCADE
              </span>
            </div>
            <p className="text-sm sm:text-lg font-bold gta-subtitle text-amber-400 tracking-wide drop-shadow-sm mt-0.5">
              Darling Dennis Game &bull; A 2D Comedy Chase Adventure
            </p>
          </div>
        </div>

        {/* Top-Right Quick HUD Controls */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2 sm:p-2.5 shadow-2xl">
          {/* Audio Mute/Unmute Control */}
          <button
            type="button"
            id="btn-main-audio"
            onClick={handleAudioToggle}
            className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm sm:text-base font-gta-heading tracking-wider font-black flex items-center gap-2 transition-all cursor-pointer border min-h-[48px] ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'BGM ON'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="btn-main-fullscreen"
            onClick={handleFullscreenToggle}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors flex items-center justify-center text-xl sm:text-2xl shadow-md min-h-[48px]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            ⛶
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            id="btn-main-settings"
            onClick={() => {
              audioManager.playSfx('click')
              setShowSettings(true)
            }}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors flex items-center justify-center text-xl sm:text-2xl shadow-md min-h-[48px]"
            title="Game Settings"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Floating Arcade Menu Panel */}
      <div className="relative z-20 w-full px-4 sm:px-10 py-3 flex flex-col items-end justify-center pointer-events-none mt-auto mb-auto">
        <div className="pointer-events-auto w-full sm:w-[400px] md:w-[460px] flex flex-col gap-4 bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <div className="text-sm sm:text-base font-gta-heading uppercase tracking-widest text-slate-300 text-center pb-2 border-b border-slate-800/90 flex items-center justify-between">
            <span className="text-amber-400 font-bold">&bull; THATHA TEA &bull;</span>
            <span className="font-semibold text-slate-400">MAIN MENU</span>
          </div>

          {/* Primary PLAY GAME Button */}
          <button
            type="button"
            id="btn-home-play"
            onClick={handlePlayGame}
            className="gta-btn group relative w-full py-5 sm:py-6 px-8 rounded-2xl font-black text-2xl sm:text-4xl tracking-wider uppercase bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 shadow-xl shadow-amber-500/25 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-3 min-h-[72px] sm:min-h-[80px]"
          >
            <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform">▶</span>
            <span>Play Game</span>
          </button>

          {/* Secondary Game Menu Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              id="btn-home-levels"
              onClick={() => {
                audioManager.playSfx('click')
                setShowStages(true)
              }}
              className="py-3.5 sm:py-4 px-4 rounded-2xl text-base sm:text-xl font-gta-heading tracking-wide uppercase font-bold bg-slate-900/95 hover:bg-slate-800 active:bg-slate-950 text-slate-100 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[60px]"
            >
              <span className="text-lg">🗺</span>
              <span>Stages</span>
            </button>

            <button
              type="button"
              id="btn-home-characters"
              onClick={() => {
                audioManager.playSfx('click')
                setShowCharacters(true)
              }}
              className="py-3.5 sm:py-4 px-4 rounded-2xl text-base sm:text-xl font-gta-heading tracking-wide uppercase font-bold bg-slate-900/95 hover:bg-slate-800 active:bg-slate-950 text-slate-100 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[60px]"
            >
              <span className="text-lg">👥</span>
              <span>Cast</span>
            </button>

            <button
              type="button"
              id="btn-menu-settings"
              onClick={() => {
                audioManager.playSfx('click')
                setShowSettings(true)
              }}
              className="py-3.5 sm:py-4 px-4 rounded-2xl text-base sm:text-xl font-gta-heading tracking-wide uppercase font-bold bg-slate-900/95 hover:bg-slate-800 active:bg-slate-950 text-slate-100 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[60px]"
            >
              <span className="text-lg">⚙</span>
              <span>Settings</span>
            </button>

            <button
              type="button"
              id="btn-menu-credits"
              onClick={() => {
                audioManager.playSfx('click')
                setShowCredits(true)
              }}
              className="py-3.5 sm:py-4 px-4 rounded-2xl text-base sm:text-xl font-gta-heading tracking-wide uppercase font-bold bg-slate-900/95 hover:bg-slate-800 active:bg-slate-950 text-slate-100 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[60px]"
            >
              <span className="text-lg">★</span>
              <span>Credits</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-center text-slate-400 font-gta-body pt-1 font-medium">
            Opposite Dr. Rajkumar Park &bull; Kalyan Nagar
          </div>
        </div>
      </div>

      {/* Bottom Status & Developer Credit Bar */}
      <footer className="relative z-20 w-full p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl px-5 py-2.5 text-sm sm:text-base font-gta-heading tracking-wider font-bold text-amber-400 shadow-xl">
          Developed by its2much Mv
        </div>

        <div className="pointer-events-auto hidden sm:flex items-center gap-3 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl px-5 py-2.5 text-sm sm:text-base font-gta-heading tracking-wider text-slate-200 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">STAGES 01–05 PLAYABLE &bull; CUBBON PARK FINALE READY</span>
        </div>
      </footer>

      {/* Stage Selection Landscape Modal */}
      <StageSelectModal
        isOpen={showStages}
        onClose={() => handleCloseModal('stages')}
        onLaunchStage={(stageNum) => {
          setShowStages(false)
          window.location.hash = `#/play?level=${stageNum}`
          onNavigate('play')
        }}
      />

      {/* Character Selection Landscape Modal */}
      <CharacterSelectModal
        isOpen={showCharacters}
        onClose={() => handleCloseModal('characters')}
        onPlayDennis={() => {
          setShowCharacters(false)
          window.location.hash = '#/play?level=1'
          onNavigate('play')
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => handleCloseModal('settings')}
      />

      {/* Credits Modal */}
      <CreditsModal
        isOpen={showCredits}
        onClose={() => handleCloseModal('credits')}
      />

      {/* Rotate Device To Landscape Overlay */}
      <RotateOverlay
        isPortrait={isPortrait && !dismissPortraitWarning}
        onDismiss={() => setDismissPortraitWarning(true)}
      />
    </div>
  )
}
