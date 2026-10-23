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
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-amber-500/20">
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="gta-title text-3xl sm:text-5xl font-black uppercase tracking-wider text-white">
                Character Roster
              </h2>
              <p className="gta-subtitle text-sm sm:text-base text-amber-400 font-bold mt-0.5">
                CAST PROFILES &bull; PROTAGONIST & PURSUERS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer shadow-md min-h-[44px]"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Content - Landscape 2-column Layout */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col md:flex-row gap-6 items-stretch">
          {/* Character Cards List */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {characters.map((char) => {
              const isSelected = selectedId === char.id
              const isDennis = char.id === 'dennis'
              const charAccent = isDennis
                ? 'border-blue-500/60 text-blue-400 bg-blue-950/30'
                : char.id === 'manish'
                  ? 'border-red-500/60 text-red-400 bg-red-950/20'
                  : char.id === 'sathish'
                    ? 'border-orange-500/60 text-orange-400 bg-orange-950/20'
                    : 'border-teal-500/60 text-teal-400 bg-teal-950/20'
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectChar(char.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/95 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50 scale-[1.01]'
                      : 'bg-slate-950/75 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {/* Substantially Enlarged Portrait Box (~1.4x) */}
                      <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-gta-display font-black text-3xl sm:text-4xl shadow-inner shrink-0 ${charAccent}`}>
                        <span>{char.initials}</span>
                        <span className="text-[10px] tracking-wider font-sans font-bold opacity-80 uppercase -mt-1">
                          {isDennis ? 'HERO' : 'CHASER'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-xl sm:text-2xl font-gta-heading text-white leading-tight">
                          {char.displayName}
                        </h3>
                        <span className={`text-xs sm:text-sm font-gta-heading font-bold px-2.5 py-0.5 rounded-lg border inline-block mt-1 ${char.badgeColorClasses}`}>
                          {char.uiRoleLabel}
                        </span>
                      </div>
                    </div>

                    {isDennis && (
                      <span className="text-xs sm:text-sm font-gta-heading font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        ACTIVE HERO
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 font-gta-body line-clamp-2 leading-relaxed">
                    {char.visualProfileSummary}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm font-gta-heading text-slate-400">
                    <span className="truncate max-w-[170px] font-semibold">{char.mechanicsRole}</span>
                    <span className="text-amber-400 font-black shrink-0">
                      {isSelected ? '● INSPECTED' : 'SELECT'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Character Details Profile */}
          <div className="w-full md:w-[420px] lg:w-[460px] bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className={`px-2.5 py-0.5 rounded-lg text-xs sm:text-sm font-gta-heading font-bold border ${selectedChar.badgeColorClasses}`}>
                  {selectedChar.uiRoleLabel}
                </span>
                <span className="text-xs sm:text-sm font-gta-heading text-slate-400 font-bold">
                  ROSTER #{selectedChar.id.toUpperCase()}
                </span>
              </div>

              {/* Substantially Enlarged Inspected Character Header (~1.4x) */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 border-2 border-amber-500/60 flex flex-col items-center justify-center font-gta-display font-black text-4xl sm:text-5xl text-amber-400 shadow-xl shadow-amber-500/10 shrink-0">
                  <span>{selectedChar.initials}</span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black font-gta-display text-white uppercase tracking-wide leading-tight">
                    {selectedChar.displayName}
                  </h3>
                  <div className="text-xs sm:text-sm text-amber-400 font-gta-heading font-bold mt-1">
                    {selectedChar.role === 'protagonist' ? '★ Playable Lead Protagonist' : '⚡ Pursuer (The Trio)'}
                  </div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-900/70 border border-slate-800 rounded-xl p-3">
                <div className="text-xs font-gta-heading font-bold uppercase tracking-wider text-slate-300">
                  VISUAL PROFILE
                </div>
                <p className="text-slate-200 font-gta-body text-xs sm:text-sm leading-relaxed">
                  {selectedChar.visualProfileSummary}
                </p>
              </div>

              <div className="space-y-1 bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                <div className="text-xs font-gta-heading font-bold uppercase tracking-wider text-slate-400">
                  GAMEPLAY ROLE
                </div>
                <p className="text-slate-300 font-gta-body text-xs sm:text-sm leading-relaxed">
                  {selectedChar.mechanicsRole}
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs font-gta-body text-amber-300/95 leading-relaxed font-medium">
                <strong>Lead Role:</strong> Dennis is the active protagonist across all 5 Bengaluru stages. Chaser switching reserved for future expansions.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 mt-3">
              <button
                type="button"
                onClick={handlePlay}
                className="gta-btn w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-2.5 min-h-[54px]"
              >
                <span>PLAY WITH DENNIS</span>
                <span className="text-2xl">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm font-gta-heading text-slate-400">
          <div className="font-bold text-slate-300">Developed by its2much Mv</div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white uppercase font-bold text-xs sm:text-sm cursor-pointer"
          >
            ← BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  )
}
