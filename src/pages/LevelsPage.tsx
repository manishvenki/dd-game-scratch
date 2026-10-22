import { useState, useEffect } from 'react'
import { audioManager } from '../game/systems/AudioManager'
import SettingsModal from '../components/game-ui/SettingsModal'

interface StageItem {
  readonly id: string
  readonly levelNumber: number
  readonly stageTag: string
  readonly title: string
  readonly location: string
  readonly objective: string
  readonly encounter: string
  readonly badgeColor: string
  readonly borderColor: string
  readonly bgGradient: string
  readonly status: 'AVAILABLE' | 'PLAYABLE'
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
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgGradient: 'from-amber-950/30 to-slate-900/80',
    status: 'PLAYABLE',
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
    borderColor: 'border-orange-500/40 hover:border-orange-400',
    bgGradient: 'from-orange-950/30 to-slate-900/80',
    status: 'PLAYABLE',
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
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    bgGradient: 'from-cyan-950/30 to-slate-900/80',
    status: 'PLAYABLE',
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
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/30 to-slate-900/80',
    status: 'PLAYABLE',
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
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    bgGradient: 'from-purple-950/30 to-slate-900/80',
    status: 'PLAYABLE',
  },
]

export default function LevelsPage() {
  const [selectedStage, setSelectedStage] = useState<number>(1)
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted())
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((muted) => {
      setIsMuted(muted)
    })
    return () => unsubscribe()
  }, [])

  const handleLaunchStage = (stageNum: number) => {
    void audioManager.play().catch(() => {})
    window.location.assign(`#/play?level=${stageNum}`)
  }

  const handleAudioToggle = () => {
    const newState = audioManager.toggleMute()
    setIsMuted(newState)
  }

  const currentStage = STAGES.find((s) => s.levelNumber === selectedStage) ?? STAGES[0]

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
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
              Stage Selection
            </h1>
            <p className="text-[11px] font-mono text-amber-400">
              5 PLAYABLE ENCOUNTERS &bull; BENGALURU ADVENTURE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-levels-audio"
            onClick={handleAudioToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
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

      {/* Main Stage Select Content */}
      <div className="my-auto py-4 flex flex-col lg:flex-row gap-6 items-stretch max-w-6xl mx-auto w-full">
        {/* Left: Stage Carousel / List */}
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>SELECT MISSION</span>
            <span className="text-amber-400">STAGE {selectedStage} OF 5</span>
          </div>

          <div className="space-y-2.5">
            {STAGES.map((stage) => {
              const isSelected = selectedStage === stage.levelNumber
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.levelNumber)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? `bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.01]`
                      : `bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-sm border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      0{stage.levelNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-wide">
                          {stage.title}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${stage.badgeColor}`}>
                          {stage.stageTag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {stage.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-[10px] font-mono font-semibold text-emerald-400">
                      ✓ READY
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLaunchStage(stage.levelNumber)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow"
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
        <div className="w-full lg:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${currentStage.badgeColor}`}>
                {currentStage.stageTag}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                ● STATUS: PLAYABLE
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {currentStage.title}
              </h2>
              <div className="text-xs text-amber-400 font-medium mt-1">
                📍 {currentStage.location}
              </div>
            </div>

            <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                MISSION OBJECTIVE
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {currentStage.objective}
              </p>
            </div>

            <div className="space-y-1.5 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                ENCOUNTER SPECIFICS
              </div>
              <p className="text-xs text-slate-400">
                {currentStage.encounter}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              id="btn-levels-launch"
              onClick={() => handleLaunchStage(currentStage.levelNumber)}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border-2 border-amber-300 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>START {currentStage.stageTag}</span>
              <span>&rarr;</span>
            </button>
            <div className="text-[10px] text-center font-mono text-slate-500">
              Developed by its2much Mv
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs font-mono text-slate-400">
        <div>Developed by its2much Mv</div>
        <div className="text-[11px] text-slate-500">
          Epilogue: Kristu Jayanti University (KJU) reserved for post-Level 5
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
