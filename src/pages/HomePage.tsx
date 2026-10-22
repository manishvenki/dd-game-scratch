import { useState, useEffect } from 'react'
import GameCanvas from '../components/GameCanvas'
import { MainMenuScene } from '../game/scenes/MainMenuScene'
import { audioManager } from '../game/systems/AudioManager'
import type { PageId } from '../types/navigation'
import SettingsModal from '../components/game-ui/SettingsModal'
import CreditsModal from '../components/game-ui/CreditsModal'

interface HomePageProps {
  onNavigate: (page: PageId) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted())
  const [showSettings, setShowSettings] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((muted) => {
      setIsMuted(muted)
    })

    const checkFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', checkFs)

    return () => {
      unsubscribe()
      document.removeEventListener('fullscreenchange', checkFs)
    }
  }, [])

  const handlePlayGame = () => {
    // Deliberate user gesture starts background music
    void audioManager.play().catch(() => {})
    // Navigate directly into Level 1 launch flow
    window.location.hash = '#/play?level=1'
    onNavigate('play')
  }

  const handleAudioToggle = () => {
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const handleFullscreenToggle = async () => {
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

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 flex flex-col justify-between overflow-hidden select-none">
      {/* Live Phaser Scene Background: Thatha Tea, Kalyan Nagar */}
      <div className="absolute inset-0 z-0">
        <GameCanvas scenes={[MainMenuScene]} className="w-full h-full" />
      </div>

      {/* Top HUD: Title branding and quick audio/fullscreen toggles */}
      <header className="relative z-20 w-full p-4 sm:p-6 flex items-start justify-between pointer-events-none">
        {/* Game Title & Branding */}
        <div className="pointer-events-auto flex items-center gap-3.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3 sm:px-4 shadow-xl">
          <img
            src="/assets/branding/dd-game-icon.png"
            alt="DD Game Icon"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-amber-500/40 shadow-md"
            onError={(e) => {
              // Hide image cleanly if unavailable
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="gta-title text-2xl sm:text-3xl text-white uppercase drop-shadow-md">
                DD Game Scratch
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs gta-badge bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ARCADE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold gta-subtitle text-amber-400 tracking-wide drop-shadow-sm">
              Darling Dennis Game &bull; A 2D Comedy Chase Adventure
            </p>
          </div>
        </div>

        {/* Top-Right Quick HUD Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 shadow-xl">
          {/* Audio Mute/Unmute Control */}
          <button
            type="button"
            id="btn-main-audio"
            onClick={handleAudioToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-gta-heading tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'BGM ON'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="btn-main-fullscreen"
            onClick={handleFullscreenToggle}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            id="btn-main-settings"
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
            title="Game Settings"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Center / Right Floating Arcade Menu Panel */}
      <div className="relative z-20 w-full px-4 sm:px-8 py-4 flex flex-col md:flex-row items-end md:items-center justify-end pointer-events-none mt-auto mb-auto">
        <div className="pointer-events-auto w-full sm:w-80 md:w-88 flex flex-col gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
          <div className="text-xs font-gta-heading uppercase tracking-widest text-slate-400 text-center pb-1 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-amber-400 font-bold">&bull; THATHA TEA &bull;</span>
            <span>MAIN MENU</span>
          </div>

          {/* Large Primary PLAY GAME Button */}
          <button
            type="button"
            id="btn-home-play"
            onClick={handlePlayGame}
            className="gta-btn group relative w-full py-4 px-6 rounded-xl font-bold text-xl sm:text-2xl tracking-wider uppercase bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 shadow-lg shadow-amber-500/20 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">▶</span>
            <span>Play Game</span>
          </button>

          {/* Secondary Game Menu Options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              id="btn-home-levels"
              onClick={() => onNavigate('levels')}
              className="py-2.5 px-3 rounded-xl text-sm font-gta-heading tracking-wide uppercase bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-200 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>🗺</span>
              <span>Stages</span>
            </button>

            <button
              type="button"
              id="btn-home-characters"
              onClick={() => onNavigate('characters')}
              className="py-2.5 px-3 rounded-xl text-sm font-gta-heading tracking-wide uppercase bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-200 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>👥</span>
              <span>Cast</span>
            </button>

            <button
              type="button"
              id="btn-menu-settings"
              onClick={() => setShowSettings(true)}
              className="py-2.5 px-3 rounded-xl text-sm font-gta-heading tracking-wide uppercase bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-200 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>⚙</span>
              <span>Settings</span>
            </button>

            <button
              type="button"
              id="btn-menu-credits"
              onClick={() => setShowCredits(true)}
              className="py-2.5 px-3 rounded-xl text-sm font-gta-heading tracking-wide uppercase bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-200 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>★</span>
              <span>Credits</span>
            </button>
          </div>

          <div className="text-xs text-center text-slate-400 font-gta-body pt-1">
            Opposite Dr. Rajkumar Park &bull; Kalyan Nagar
          </div>
        </div>
      </div>

      {/* Bottom Status & Developer Credit Bar */}
      <footer className="relative z-20 w-full p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-1.5 text-sm font-gta-heading tracking-wider font-semibold text-amber-400 shadow-lg">
          Developed by its2much Mv
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-1.5 text-xs font-gta-heading tracking-wider text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>STAGES 01–05 PLAYABLE &bull; CUBBON PARK FINALE READY</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Credits Modal */}
      <CreditsModal
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
      />
    </div>
  )
}
