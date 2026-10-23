import { useEffect } from 'react'
import { audioManager } from '../../game/systems/AudioManager'

interface CreditsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        audioManager.playSfx('cancel')
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleClose = () => {
    audioManager.playSfx('confirm')
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100 max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-2xl shadow-inner">
              ★
            </div>
            <div>
              <h2 id="credits-title" className="gta-title text-3xl sm:text-4xl font-black uppercase tracking-wide text-white">
                Game Credits
              </h2>
              <p className="gta-subtitle text-xs sm:text-sm text-slate-400 font-bold mt-0.5">
                DD GAME SCRATCH &bull; DARLING DENNIS GAME
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors text-xl font-bold shadow-md min-h-[44px]"
            aria-label="Close credits"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
          {/* Developer Section */}
          <div className="bg-slate-950/80 border-2 border-amber-500/40 rounded-2xl p-5 text-center space-y-1.5 shadow-xl">
            <div className="text-xs sm:text-sm font-gta-heading uppercase tracking-widest text-amber-400 font-black">
              ORIGINAL CREATOR & DEVELOPER
            </div>
            <div className="text-3xl sm:text-4xl font-black font-gta-display text-white tracking-wide">
              Developed by its2much Mv
            </div>
            <p className="text-sm font-gta-body text-slate-300 font-medium">
              Concept, Game Design, Direction & Sound Architecture
            </p>
          </div>

          {/* Setting & Story Inspiration */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="text-sm sm:text-base font-gta-heading uppercase text-emerald-400 font-black">
              Setting & Story Inspiration
            </div>
            <p className="text-sm sm:text-base font-gta-body text-slate-200 leading-relaxed">
              Inspired by the real streets and vibrant culture of <span className="text-white font-bold">Bengaluru, Karnataka</span>:
            </p>
            <ul className="text-sm sm:text-base font-gta-body text-slate-300 space-y-1 list-disc list-inside">
              <li>Stage 01 &mdash; College Street Gates & Avenue</li>
              <li>Stage 02 &mdash; Thatha Tea Stall, Kalyan Nagar / Kammanahalli</li>
              <li>Stage 03 &mdash; MG Road / Brigade Road & Namma Metro</li>
              <li>Stage 04 &mdash; Dr. Rajkumar Park Walking Trails</li>
              <li>Stage 05 &mdash; Cubbon Park Historic Bandstand</li>
            </ul>
          </div>

          {/* Engine & Soundtrack */}
          <div className="grid grid-cols-2 gap-3.5 text-sm">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <div className="font-gta-heading text-amber-400 font-black text-sm tracking-wider">SOUNDTRACK</div>
              <div className="text-slate-200 font-gta-body font-bold text-sm sm:text-base">DD Game Original BGM</div>
              <div className="text-slate-400 font-gta-body text-xs">Continuous Looping Audio</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1">
              <div className="font-gta-heading text-cyan-400 font-black text-sm tracking-wider">ENGINE & TECH</div>
              <div className="text-slate-200 font-gta-body font-bold text-sm sm:text-base">Phaser 3.90 & React 19</div>
              <div className="text-slate-400 font-gta-body text-xs">TypeScript & Vite</div>
            </div>
          </div>

          {/* Epilogue Notice */}
          <div className="bg-slate-950/50 border border-slate-800/90 rounded-2xl p-3.5 text-sm font-gta-body text-slate-300 leading-relaxed">
            <span className="font-bold text-white">Epilogue Chapter:</span> Kristu Jayanti University (KJU) is reserved as a post-Level 5 expansion for the future Manisha storyline.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-sm font-gta-heading text-amber-400/90 font-bold">
            Developed by its2much Mv
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="gta-btn px-6 py-2.5 rounded-xl text-sm sm:text-base font-gta-heading font-black bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
