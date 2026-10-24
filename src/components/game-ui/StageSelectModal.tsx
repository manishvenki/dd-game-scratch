import { useState, useEffect } from 'react'
import { audioManager } from '../../game/systems/AudioManager'

interface StageItem {
  readonly id: string
  readonly levelNumber: number
  readonly stageTag: string
  readonly title: string
  readonly location: string
  readonly objective: string
  readonly encounter: string
  readonly badgeColor: string
}

const STAGES: readonly StageItem[] = [
  {
    id: 'level-1',
    levelNumber: 1,
    stageTag: 'STAGE 01',
    title: 'College Street Encounter',
    location: 'Campus perimeter & bustling avenue',
    objective: 'Break through the 3 blocking boys outside the college gate and sprint clear before the trio catches you!',
    encounter: 'Blockers: College Boys • Pursuit: Manish, Sathish, Rahul',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'level-2',
    levelNumber: 2,
    stageTag: 'STAGE 02',
    title: 'Thatha Tea, Kalyan Nagar',
    location: 'Opposite Dr. Rajkumar Park, Kalyan Nagar',
    objective: 'Dennis encounters Vikram & Kiran blocking the tea shop frontage! Knock past them and sprint to the Kammanahalli crossroad.',
    encounter: 'Blockers: Vikram & Kiran • Pursuit: Continuous Trio Pursuit',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  {
    id: 'level-3',
    levelNumber: 3,
    stageTag: 'STAGE 03',
    title: 'MG Road / Brigade Road',
    location: 'Central city avenue & Namma Metro viaduct',
    objective: 'High-energy dash past neon storefronts. Dennis encounters a drama rehearsal group and flees to the Metro Station before the trio arrives!',
    encounter: 'Story Event: Drama Rehearsal Reveal • Pursuit: Active Trio Pursuit',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'level-4',
    levelNumber: 4,
    stageTag: 'STAGE 04',
    title: 'Dr. Rajkumar Park',
    location: 'Parkland walking trails & jogging tracks',
    objective: 'Sprint through lush green park trails, break past park blockers along the jogging path, and reach the Park Main Gate.',
    encounter: 'Blockers: Park Blockers • Pursuit: Relentless Trio Pursuit',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'level-5',
    levelNumber: 5,
    stageTag: 'STAGE 05',
    title: 'Cubbon Park Grand Finale',
    location: 'Historic green park trails & Victorian Bandstand',
    objective: 'The epic 5-stage finale! Dash along the red-dirt paths past bamboo groves and Victorian lamps to reach the Bandstand and claim grand victory!',
    encounter: 'Finale: Historic Bandstand Victory Screen & Celebration',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
]

interface StageSelectModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onLaunchStage: (stageNum: number) => void
  readonly onOpenSettings?: () => void
}

export default function StageSelectModal({
  isOpen,
  onClose,
  onLaunchStage,
  onOpenSettings,
}: StageSelectModalProps) {
  const [selectedStage, setSelectedStage] = useState<number>(1)

  useEffect(() => {
    if (!isOpen) return

    // Switch music to dedicated level-selection track
    void audioManager.setMusicTrack('level-select')

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

  const currentStage = STAGES.find((s) => s.levelNumber === selectedStage) ?? STAGES[0]

  const handleSelect = (stageNum: number) => {
    audioManager.playSfx('click')
    setSelectedStage(stageNum)
  }

  const handleLaunch = (stageNum: number) => {
    audioManager.playSfx('confirm')
    onLaunchStage(stageNum)
  }

  const handleClose = () => {
    audioManager.playSfx('cancel')
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stages-title"
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-6xl bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl flex flex-col justify-between max-h-[min(94dvh,94%)] overflow-y-auto">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="gta-btn px-4.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-sm sm:text-base font-black flex items-center gap-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <span className="text-lg">&larr;</span>
              <span>MENU</span>
            </button>
            <div>
              <h2 id="stages-title" className="gta-title text-3xl sm:text-5xl font-black uppercase tracking-wider text-white">
                Stage Selection
              </h2>
              <p className="gta-subtitle text-sm sm:text-base text-amber-400 font-bold mt-0.5">
                5 PLAYABLE ENCOUNTERS &bull; BENGALURU ADVENTURE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioManager.playSfx('click')
                onOpenSettings?.()
              }}
              className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors flex items-center justify-center text-xl shadow-md min-h-[44px]"
              title="Settings"
              aria-label="Settings"
            >
              ⚙
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors text-xl font-bold shadow-md min-h-[44px]"
              aria-label="Close stage selection"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Content: Carousel / List on Left, Briefing Card on Right */}
        <div className="py-5 flex flex-col lg:flex-row gap-6 items-stretch w-full flex-1 min-h-0">
          {/* Left: Stage Cards List */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
            <div className="text-sm sm:text-base font-gta-heading uppercase tracking-widest text-slate-300 flex items-center justify-between font-bold">
              <span>SELECT MISSION</span>
              <span className="text-amber-400">STAGE {selectedStage} OF 5</span>
            </div>

            <div className="space-y-3">
              {STAGES.map((stage) => {
                const isSelected = selectedStage === stage.levelNumber
                return (
                  <div
                    key={stage.id}
                    onClick={() => handleSelect(stage.levelNumber)}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/15 scale-[1.01]'
                        : 'bg-slate-900/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-gta-heading font-black text-2xl sm:text-3xl border-2 shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        0{stage.levelNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-lg sm:text-2xl font-gta-heading font-black text-white tracking-wide">
                            {stage.title}
                          </span>
                          <span className={`text-xs sm:text-sm font-gta-heading font-bold px-2.5 py-0.5 rounded-lg border ${stage.badgeColor}`}>
                            {stage.stageTag}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-300 font-gta-body mt-1 font-medium">
                          {stage.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block text-sm font-gta-heading font-black text-emerald-400">
                        ✓ READY
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLaunch(stage.levelNumber)
                        }}
                        className="gta-btn px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm sm:text-base font-gta-heading font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg min-h-[44px]"
                      >
                        PLAY &rarr;
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Selected Stage Mission Briefing Card */}
          <div className="w-full lg:w-[440px] xl:w-[480px] bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-gta-heading font-black border ${currentStage.badgeColor}`}>
                  {currentStage.stageTag}
                </span>
                <span className="text-sm font-gta-heading text-emerald-400 font-bold">
                  ● STATUS: PLAYABLE
                </span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-black font-gta-display text-white uppercase tracking-wide leading-tight">
                  {currentStage.title}
                </h3>
                <div className="text-sm sm:text-base text-amber-400 font-gta-body font-semibold mt-1">
                  📍 {currentStage.location}
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
                <div className="text-xs sm:text-sm font-gta-heading font-bold uppercase tracking-wider text-slate-300">
                  MISSION OBJECTIVE
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-gta-body leading-relaxed">
                  {currentStage.objective}
                </p>
              </div>

              <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5">
                <div className="text-xs sm:text-sm font-gta-heading font-bold uppercase tracking-wider text-slate-400">
                  ENCOUNTER SPECIFICS
                </div>
                <p className="text-sm text-slate-300 font-gta-body">
                  {currentStage.encounter}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
              <button
                type="button"
                id="btn-stage-launch"
                onClick={() => handleLaunch(currentStage.levelNumber)}
                className="gta-btn w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-xl sm:text-2xl uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-3 min-h-[64px]"
              >
                <span>START {currentStage.stageTag}</span>
                <span className="text-2xl">&rarr;</span>
              </button>
              <div className="text-xs sm:text-sm text-center font-gta-heading text-slate-400 font-semibold">
                Developed by its2much Mv
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs sm:text-sm font-gta-heading text-slate-400">
          <div className="font-bold text-slate-300">Developed by its2much Mv</div>
          <div className="text-xs text-slate-400">
            Epilogue: Kristu Jayanti University (KJU) reserved for post-Level 5
          </div>
        </footer>
      </div>
    </div>
  )
}
