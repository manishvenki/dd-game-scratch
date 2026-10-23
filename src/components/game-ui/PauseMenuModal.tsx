import { useState } from 'react'
import { audioManager } from '../../game/systems/AudioManager'
import SettingsModal from './SettingsModal'

interface PauseMenuModalProps {
  readonly isOpen: boolean
  readonly stageTag?: string
  readonly stageTitle?: string
  readonly onResume: () => void
  readonly onRestart?: () => void
  readonly onRestartLevel?: () => void
  readonly onReturnHome?: () => void
  readonly onMainMenu?: () => void
  readonly onOpenSettings?: () => void
}

export default function PauseMenuModal({
  isOpen,
  stageTag = 'BENGALURU CHASE',
  stageTitle = 'DARLING DENNIS',
  onResume,
  onRestart,
  onRestartLevel,
  onReturnHome,
  onMainMenu,
  onOpenSettings,
}: PauseMenuModalProps) {
  const [showSettings, setShowSettings] = useState(false)

  if (!isOpen) return null

  const handleResume = () => {
    audioManager.playSfx('resume')
    onResume()
  }

  const handleRestart = () => {
    audioManager.playSfx('confirm')
    if (onRestartLevel) {
      onRestartLevel()
    } else if (onRestart) {
      onRestart()
    }
  }

  const handleHome = () => {
    audioManager.playSfx('click')
    if (onMainMenu) {
      onMainMenu()
    } else if (onReturnHome) {
      onReturnHome()
    }
  }

  const handleOpenSettings = () => {
    audioManager.playSfx('click')
    if (onOpenSettings) {
      onOpenSettings()
    } else {
      setShowSettings(true)
    }
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
      >
        <div className="relative w-full max-w-md sm:max-w-xl bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl p-8 sm:p-9 shadow-2xl flex flex-col gap-6 text-center">
          {/* Pause Header */}
          <div className="space-y-2">
            <div className="inline-block px-4 py-1 rounded-lg text-sm sm:text-base font-gta-heading tracking-wider font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {stageTag.toUpperCase()} &bull; {stageTitle.toUpperCase()}
            </div>
            <h2 id="pause-title" className="gta-title text-5xl sm:text-7xl font-black text-white uppercase tracking-wider">
              GAME PAUSED
            </h2>
            <p className="text-sm sm:text-base font-gta-body text-slate-300 font-medium">
              Dennis is taking a quick breather &bull; Bengaluru Adventure
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-1">
            {/* Primary RESUME */}
            <button
              type="button"
              id="btn-pause-resume"
              onClick={handleResume}
              className="gta-btn w-full py-5 sm:py-6 px-8 rounded-2xl font-black text-2xl sm:text-3xl uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/25 border-2 border-emerald-300 cursor-pointer transition-all flex items-center justify-center gap-3 min-h-[70px]"
            >
              <span className="text-2xl sm:text-3xl">▶</span>
              <span>RESUME GAME</span>
            </button>

            {/* RESTART LEVEL */}
            <button
              type="button"
              id="btn-pause-restart"
              onClick={handleRestart}
              className="gta-btn w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border-2 border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-2.5 min-h-[56px]"
            >
              <span className="text-xl">↺</span>
              <span>RESTART LEVEL</span>
            </button>

            {/* SETTINGS */}
            <button
              type="button"
              id="btn-pause-settings"
              onClick={handleOpenSettings}
              className="gta-btn w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border-2 border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-2.5 min-h-[56px]"
            >
              <span className="text-xl">⚙</span>
              <span>AUDIO & SETTINGS</span>
            </button>

            {/* MAIN MENU */}
            <button
              type="button"
              id="btn-pause-main-menu"
              onClick={handleHome}
              className="gta-btn w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border-2 border-amber-500/40 cursor-pointer transition-all flex items-center justify-center gap-2.5 min-h-[56px]"
            >
              <span className="text-xl">⌂</span>
              <span>MAIN MENU (THATHA TEA)</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs sm:text-sm font-gta-heading text-slate-400 font-semibold">
            Developed by its2much Mv
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  )
}
