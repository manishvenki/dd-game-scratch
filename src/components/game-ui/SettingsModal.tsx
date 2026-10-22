import { useState, useEffect } from 'react'
import { audioManager, type AudioState } from '../../game/systems/AudioManager'

interface SettingsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onReturnHome?: () => void
}

export default function SettingsModal({ isOpen, onClose, onReturnHome }: SettingsModalProps) {
  const [audioState, setAudioState] = useState<AudioState>(() => audioManager.getState())
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        audioManager.playSfx('cancel')
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    const unsubscribe = audioManager.subscribeState((state) => {
      setAudioState(state)
    })

    const checkFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', checkFs)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      unsubscribe()
      document.removeEventListener('fullscreenchange', checkFs)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleMusicMuteToggle = () => {
    audioManager.toggleMusicMute()
  }

  const handleMusicVolumeChange = (newVal: number) => {
    audioManager.setMusicVolume(newVal / 100)
    if (audioState.musicMuted && newVal > 0) {
      audioManager.setMusicMuted(false)
    }
  }

  const handleSfxMuteToggle = () => {
    audioManager.toggleSfxMute()
  }

  const handleSfxVolumeChange = (newVal: number) => {
    audioManager.setSfxVolume(newVal / 100)
    if (audioState.sfxMuted && newVal > 0) {
      audioManager.setSfxMuted(false)
    }
    audioManager.playSfx('click')
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
      console.warn('[SettingsModal] Fullscreen toggle error:', err)
    }
  }

  const handleRestoreDefaults = () => {
    audioManager.restoreDefaults()
  }

  const handleClose = () => {
    audioManager.playSfx('confirm')
    onClose()
  }

  const musicVolPercent = Math.round(audioState.musicVolume * 100)
  const sfxVolPercent = Math.round(audioState.sfxVolume * 100)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ⚙
            </div>
            <div>
              <h2 id="settings-title" className="gta-title text-2xl font-black uppercase tracking-wide text-white">
                Game Settings
              </h2>
              <p className="gta-subtitle text-xs text-slate-400 font-bold">
                DD GAME SCRATCH &bull; SYSTEM CONFIG
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Dual Channel Audio Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-gta-heading uppercase tracking-wider text-amber-400 font-bold">
              Audio & Sound Channels
            </h3>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="text-[11px] font-gta-heading text-slate-400 hover:text-amber-400 underline cursor-pointer transition-colors"
            >
              Restore Defaults
            </button>
          </div>

          {/* Channel 1: Background Music */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-gta-heading font-bold text-slate-200">Music Channel (BGM)</div>
                <div className="text-xs font-gta-body text-slate-400">Thatha Tea theme, Level Select, and Gameplay soundtrack</div>
              </div>
              <button
                type="button"
                id="btn-settings-music-mute"
                onClick={handleMusicMuteToggle}
                className={`px-3 py-1 rounded-lg text-xs font-gta-heading font-bold transition-colors cursor-pointer border ${
                  audioState.musicMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {audioState.musicMuted ? '🔇 MUTED' : '🔊 ACTIVE'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-gta-heading text-slate-400">
                <span>Music Volume</span>
                <span className="text-amber-400 font-bold">{audioState.musicMuted ? '0%' : `${musicVolPercent}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioState.musicMuted ? 0 : musicVolPercent}
                onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                aria-label="Music volume slider"
              />
            </div>
          </div>

          {/* Channel 2: Sound Effects (SFX) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-gta-heading font-bold text-slate-200">Sound Effects Channel (SFX)</div>
                <div className="text-xs font-gta-body text-slate-400">Jump, combat impacts, dialogue chirps, and menu clicks</div>
              </div>
              <button
                type="button"
                id="btn-settings-sfx-mute"
                onClick={handleSfxMuteToggle}
                className={`px-3 py-1 rounded-lg text-xs font-gta-heading font-bold transition-colors cursor-pointer border ${
                  audioState.sfxMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {audioState.sfxMuted ? '🔇 MUTED' : '🔊 ACTIVE'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-gta-heading text-slate-400">
                <span>SFX Volume</span>
                <span className="text-amber-400 font-bold">{audioState.sfxMuted ? '0%' : `${sfxVolPercent}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioState.sfxMuted ? 0 : sfxVolPercent}
                onChange={(e) => handleSfxVolumeChange(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                aria-label="SFX volume slider"
              />
            </div>
          </div>
        </div>

        {/* Display Mode */}
        <div className="space-y-2">
          <h3 className="text-xs font-gta-heading uppercase tracking-wider text-amber-400 font-bold">
            Display Mode
          </h3>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-gta-heading font-bold text-slate-200">Full-Screen Gameplay</div>
              <div className="text-xs font-gta-body text-slate-400">Expand game viewport to fill entire display</div>
            </div>
            <button
              type="button"
              id="btn-settings-fullscreen"
              onClick={handleFullscreenToggle}
              className="px-3 py-1.5 rounded-lg text-xs font-gta-heading font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              {isFullscreen ? 'Exit Fullscreen' : '⛶ Enter Fullscreen'}
            </button>
          </div>
        </div>

        {/* Controls Guidance */}
        <div className="space-y-2">
          <h3 className="text-xs font-gta-heading uppercase tracking-wider text-amber-400 font-bold">
            Controls Guide
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-gta-heading">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400">Move:</span> <span className="text-white font-bold">[A] / [D] or [Arrows]</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400">Jump:</span> <span className="text-white font-bold">[W] / [Up] / [Space]</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400">Attack:</span> <span className="text-amber-400 font-bold">[J] / [K] / [X]</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400">Pause:</span> <span className="text-white font-bold">[ESC] / [P]</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs font-gta-heading text-amber-400/90 font-bold">
            Developed by its2much Mv
          </div>

          <div className="flex items-center gap-2">
            {onReturnHome && (
              <button
                type="button"
                onClick={() => {
                  audioManager.playSfx('click')
                  onClose()
                  onReturnHome()
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-gta-heading font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
              >
                Main Menu
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="gta-btn px-4 py-1.5 rounded-lg text-xs font-gta-heading font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
