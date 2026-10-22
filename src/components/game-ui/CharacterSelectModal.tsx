import { useState, useEffect } from 'react'
import { getAllCharacters } from '../../game/data/characterRegistry'
import { audioManager } from '../../game/systems/AudioManager'

interface CharacterSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onPlayDennis?: () => void
}

export default function CharacterSelectModal({
  isOpen,
  onClose,
  onPlayDennis,
}: CharacterSelectModalProps) {
  const characters = getAllCharacters()
  const [selectedId, setSelectedId] = useState<string>('dennis')

  useEffect(() => {
    if (isOpen) {
      audioManager.setMusicTrack('character-select')
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedChar = characters.find((c) => c.id === selectedId) ?? characters[0]

  const handleClose = () => {
    audioManager.playSfx('cancel')
    audioManager.setMusicTrack('main-menu')
    onClose()
  }

  const handleSelectChar = (id: string) => {
    audioManager.playSfx('click')
    setSelectedId(id)
  }

  const handlePlay = () => {
    audioManager.playSfx('confirm')
    if (onPlayDennis) {
      onPlayDennis()
    } else {
      window.location.hash = '#/play?level=1'
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 select-none animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-xl">👥</span>
            <div>
              <h2 className="gta-title text-2xl font-black uppercase tracking-wider text-white">
                Character Roster
              </h2>
              <p className="gta-subtitle text-xs text-amber-400 font-bold">
                CAST PROFILES &bull; PROTAGONIST & PURSUERS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Content - Landscape 2-column Layout */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col md:flex-row gap-5 items-stretch">
          {/* Character Cards List */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characters.map((char) => {
              const isSelected = selectedId === char.id
              const isDennis = char.id === 'dennis'
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectChar(char.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-gta-display font-black text-amber-400 text-xl shadow-inner">
                        {char.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-base font-gta-heading text-white leading-tight">
                          {char.displayName}
                        </h3>
                        <span className={`text-[10px] font-gta-heading px-1.5 py-0.5 rounded border inline-block mt-0.5 ${char.badgeColorClasses}`}>
                          {char.uiRoleLabel}
                        </span>
                      </div>
                    </div>

                    {isDennis && (
                      <span className="text-[10px] font-gta-heading font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ACTIVE HERO
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 font-gta-body line-clamp-2">
                    {char.visualProfileSummary}
                  </p>

                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-gta-heading text-slate-400">
                    <span className="truncate max-w-[140px]">{char.mechanicsRole}</span>
                    <span className="text-amber-400 font-bold shrink-0">
                      {isSelected ? '● INSPECTED' : 'SELECT'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Character Details Profile */}
          <div className="w-full md:w-80 lg:w-96 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-gta-heading font-bold border ${selectedChar.badgeColorClasses}`}>
                  {selectedChar.uiRoleLabel}
                </span>
                <span className="text-[11px] font-gta-heading text-slate-500">
                  ROSTER #{selectedChar.id.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center font-gta-display font-black text-2xl text-amber-400 shadow-inner">
                  {selectedChar.initials}
                </div>
                <div>
                  <h3 className="text-2xl font-black font-gta-display text-white uppercase tracking-wide">
                    {selectedChar.displayName}
                  </h3>
                  <div className="text-xs text-amber-400 font-gta-heading font-bold">
                    {selectedChar.role === 'protagonist' ? '★ Playable Lead Hero' : '⚡ Pursuer (The Trio)'}
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-xs">
                <div className="text-[10px] font-gta-heading uppercase tracking-wider text-slate-400">
                  VISUAL PROFILE
                </div>
                <p className="text-slate-200 font-gta-body text-[11px] leading-relaxed">
                  {selectedChar.visualProfileSummary}
                </p>
              </div>

              <div className="space-y-1 bg-slate-900/40 border border-slate-800 rounded-lg p-2.5 text-xs">
                <div className="text-[10px] font-gta-heading uppercase tracking-wider text-slate-400">
                  GAMEPLAY ROLE
                </div>
                <p className="text-slate-400 font-gta-body text-[11px] leading-relaxed">
                  {selectedChar.mechanicsRole}
                </p>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] font-gta-body text-amber-300/90 leading-tight">
                <strong>Lead Role:</strong> Dennis is the active protagonist across all 5 Bengaluru stages. Chaser switching reserved for future expansions.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 mt-3">
              <button
                type="button"
                onClick={handlePlay}
                className="gta-btn w-full py-3 px-4 rounded-xl font-bold text-base uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>PLAY WITH DENNIS</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div>Developed by its2much Mv</div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white uppercase font-bold text-[11px] cursor-pointer"
          >
            ← BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  )
}
