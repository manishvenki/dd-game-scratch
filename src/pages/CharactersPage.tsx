import { useState, useEffect } from 'react'
import { getAllCharacters } from '../game/data/characterRegistry'
import { audioManager } from '../game/systems/AudioManager'
import SettingsModal from '../components/game-ui/SettingsModal'

export default function CharactersPage() {
  const characters = getAllCharacters()
  const [selectedId, setSelectedId] = useState<string>('dennis')
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted())
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((muted) => {
      setIsMuted(muted)
    })
    return () => unsubscribe()
  }, [])

  const handleAudioToggle = () => {
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const selectedChar = characters.find((c) => c.id === selectedId) ?? characters[0]

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 flex flex-col justify-between p-4 sm:p-6 bg-slate-950 select-none overflow-y-auto">
      {/* Top Game Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>&larr;</span>
            <span>MENU</span>
          </a>
          <div>
            <h1 className="gta-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              Character Roster
            </h1>
            <p className="gta-subtitle text-xs text-amber-400 font-bold">
              CAST PROFILES &bull; PROTAGONIST & PURSUERS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-chars-audio"
            onClick={handleAudioToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-gta-heading tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'BGM ON'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Main Roster Grid */}
      <div className="my-auto py-4 flex flex-col lg:flex-row gap-6 items-stretch max-w-6xl mx-auto w-full">
        {/* Left: Character Cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {characters.map((char) => {
            const isSelected = selectedId === char.id
            const isDennis = char.id === 'dennis'
            return (
              <div
                key={char.id}
                onClick={() => setSelectedId(char.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-gta-display font-black text-amber-400 text-2xl shadow-inner">
                      {char.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg font-gta-heading text-white">
                        {char.displayName}
                      </h3>
                      <span className={`text-xs font-gta-heading px-2 py-0.5 rounded border ${char.badgeColorClasses}`}>
                        {char.uiRoleLabel}
                      </span>
                    </div>
                  </div>

                  {isDennis && (
                    <span className="text-xs font-gta-heading font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ACTIVE HERO
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-gta-body line-clamp-2">
                  {char.visualProfileSummary}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-gta-heading text-slate-500">
                  <span>{char.mechanicsRole}</span>
                  <span className="text-amber-400/80">{isSelected ? '● INSPECTED' : 'CLICK TO VIEW'}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Character Detailed Profile Card */}
        <div className="w-full lg:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className={`px-2.5 py-1 rounded text-xs font-gta-heading font-bold border ${selectedChar.badgeColorClasses}`}>
                {selectedChar.uiRoleLabel}
              </span>
              <span className="text-xs font-gta-heading text-slate-400">
                ROSTER #{selectedChar.id.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-gta-display font-black text-3xl text-amber-400 shadow-inner">
                {selectedChar.initials}
              </div>
              <div>
                <h2 className="text-3xl font-black font-gta-display text-white uppercase tracking-wide">
                  {selectedChar.displayName}
                </h2>
                <div className="text-xs text-amber-400 font-gta-heading font-bold mt-0.5">
                  {selectedChar.role === 'protagonist' ? '★ Playable Lead Hero' : '⚡ Pursuer (The Trio)'}
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs">
              <div className="text-xs font-gta-heading uppercase tracking-wider text-slate-400">
                VISUAL ATTRIBUTES
              </div>
              <p className="text-slate-200 font-gta-body leading-relaxed">
                {selectedChar.visualProfileSummary}
              </p>
            </div>

            <div className="space-y-2 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 text-xs">
              <div className="text-xs font-gta-heading uppercase tracking-wider text-slate-400">
                GAMEPLAY MECHANICS
              </div>
              <p className="text-slate-400 font-gta-body leading-relaxed">
                {selectedChar.mechanicsRole}
              </p>
            </div>

            {/* Notice regarding character switching */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-gta-body text-amber-300/90 leading-normal">
              <strong>Notice:</strong> Dennis is the active playable character for all 5 Bengaluru story encounters. Character-switching modes will be introduced in future updates.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <a
              href="#/play?level=1"
              className="gta-btn w-full py-3.5 px-4 rounded-xl font-bold text-lg uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>PLAY WITH DENNIS</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs font-mono text-slate-400">
        <div>Developed by its2much Mv</div>
        <div className="text-[11px] text-slate-500">
          Dennis &bull; Manish &bull; Sathish &bull; Rahul &mdash; The Bengaluru Quartet
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}
