import { useState, useEffect } from 'react'
import { audioManager } from '../../game/systems/AudioManager'

interface SettingsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onReturnHome?: () => void
}

export default function SettingsModal({ isOpen, onClose, onReturnHome }: SettingsModalProps) {
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted())
  const [volume, setVolume] = useState(() => Math.round(audioManager.getVolume() * 100))
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    const unsubscribe = audioManager.subscribe((muted) => {
      setIsMuted(muted)
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

  const handleMuteToggle = () => {
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal)
    audioManager.setVolume(newVal / 100)
    if (isMuted && newVal > 0) {
      audioManager.setMuted(false)
      setIsMuted(false)
    }
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
      console.warn('[SettingsModal] Fullscreen toggle error:', err)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ⚙
            </div>
            <div>
              <h2 id="settings-title" className="text-xl font-black uppercase tracking-wider text-white">
                Game Settings
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                DD GAME SCRATCH &bull; SYSTEM CONFIG
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Audio Controls */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400">
            Audio & Sound
          </h3>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-200">Background Music (BGM)</div>
                <div className="text-xs text-slate-400">DD Game Original Theme (Continuous Looping)</div>
              </div>
              <button
                type="button"
                id="btn-settings-mute"
                onClick={handleMuteToggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isMuted ? '🔇 MUTED' : '🔊 ACTIVE'}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Music Volume</span>
                <span className="text-amber-400 font-bold">{isMuted ? '0%' : `${volume}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          </div>
        </div>

        {/* Display & Screen Controls */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400">
            Display Mode
          </h3>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-200">Full-Screen Gameplay</div>
              <div className="text-xs text-slate-400">Expand game viewport to fill entire display</div>
            </div>
            <button
              type="button"
              id="btn-settings-fullscreen"
              onClick={handleFullscreenToggle}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              {isFullscreen ? 'Exit Fullscreen' : '⛶ Enter Fullscreen'}
            </button>
          </div>
        </div>

        {/* Controls Guidance */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400">
            Controls Guide
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
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
              <span className="text-slate-400">Mobile:</span> <span className="text-emerald-400 font-bold">Touch D-Pad & Buttons</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono text-amber-400/90">
            Developed by its2much Mv
          </div>

          <div className="flex items-center gap-2">
            {onReturnHome && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onReturnHome()
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
              >
                Main Menu
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
