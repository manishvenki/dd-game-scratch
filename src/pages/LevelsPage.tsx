interface PlannedLevel {
  readonly id: string
  readonly stageNumber: string
  readonly title: string
  readonly setting: string
  readonly description: string
  readonly environmentType: string
  readonly status: 'Playable' | 'Planned' | 'Coming Soon'
  readonly playHref?: string
}

const PLANNED_LEVELS: readonly PlannedLevel[] = [
  {
    id: 'college-street',
    stageNumber: 'STAGE 01',
    title: 'Bengaluru College Street',
    setting: 'Campus perimeter & bustling avenue',
    description:
      'Dennis confronts 3 blocking boys outside the college gate. Once cleared, an intense street pursuit begins with Manish, Sathish, and Rahul!',
    environmentType: 'College Gate & Avenue',
    status: 'Playable',
    playHref: '#/play?level=1',
  },
  {
    id: 'street-confrontation',
    stageNumber: 'STAGE 02',
    title: 'Commercial Lane Encounter',
    setting: 'Avenue corridor near the market',
    description:
      'Dennis is cornered by two blocking boys along a narrow street bottleneck. Neutralize both blockers and sprint to the avenue crossroad.',
    environmentType: 'Market Corridor',
    status: 'Playable',
    playHref: '#/play?level=2',
  },
  {
    id: 'mg-brigade-road',
    stageNumber: 'STAGE 03',
    title: 'MG Road / Brigade Road',
    setting: 'Central city retail & nightlife hub',
    description:
      'High-energy sprint past neon storefronts and Namma Metro viaduct. Dennis encounters a drama rehearsal group and flees to the Metro Station before the trio catches him!',
    environmentType: 'Downtown District',
    status: 'Playable',
    playHref: '#/play?level=3',
  },
  {
    id: 'koramangala-cafe',
    stageNumber: 'STAGE 04',
    title: 'Koramangala Café',
    setting: 'Lively café indoor & patio area',
    description:
      'Dennis meets his date Ananya at a cozy Koramangala café patio until the chasers crash the date, triggering a frantic dash toward 80ft Road.',
    environmentType: 'Café & Patio',
    status: 'Playable',
    playHref: '#/play?level=4',
  },
  {
    id: 'cubbon-park',
    stageNumber: 'STAGE 05',
    title: 'Cubbon Park Grand Finale',
    setting: 'Historic green park trails & Bandstand',
    description:
      'The epic 5-level adventure conclusion! Sprint past lush red-dirt paths, bamboo groves, park benches, and Victorian lamps to reach the historic Cubbon Park Bandstand and claim final victory!',
    environmentType: 'Parkland Trails & Bandstand',
    status: 'Playable',
    playHref: '#/play?level=5',
  },
] as const

export default function LevelsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
          STAGES ROSTER &bull; ALL 5 STAGES PLAYABLE &bull; GRAND FINALE READY
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Game Stages
        </h1>
        <p className="text-sm text-slate-400">
          Playable Bengaluru street encounters spanning from the College Gate to the lush Bandstand of Cubbon Park.
        </p>
      </div>

      {/* Notice Banner */}
      <section aria-label="Levels status notice" className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold">
          ✓
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold text-slate-200">
            Adventure Complete: All 5 Stages Are Now Fully Playable!
          </p>
          <p className="text-slate-400 leading-normal">
            Play through all 5 levels: Stage 01 College Gate, Stage 02 Market Corridor, Stage 03 MG Road Reveal, Stage 04 Koramangala Café Date, and Stage 05 Cubbon Park Grand Finale with continuous trio pursuit, comic Tanglish catch dialogues, and victory celebration.
          </p>
        </div>
      </section>

      {/* Level Cards Grid */}
      <section aria-label="Level cards grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANNED_LEVELS.map((level) => (
          <article
            key={level.id}
            className="flex flex-col justify-between rounded-xl bg-slate-900/70 border border-slate-800 p-6 transition-colors motion-reduce:transition-none hover:border-slate-700 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold tracking-wider text-amber-400">
                  {level.stageNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${
                  level.status === 'Playable'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {level.status}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {level.title}
                </h2>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  {level.setting}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {level.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{level.environmentType}</span>
              {level.playHref ? (
                <a
                  href={level.playHref}
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-semibold transition-colors"
                >
                  Play Stage &rarr;
                </a>
              ) : (
                <span className="text-slate-600">Coming Soon</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
