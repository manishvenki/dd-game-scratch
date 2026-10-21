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
      'High-energy dashes past neon shop fronts, busy footpaths, and tight alleyways with fast-moving pursuers.',
    environmentType: 'Downtown District',
    status: 'Planned',
  },
  {
    id: 'koramangala-cafe',
    stageNumber: 'STAGE 04',
    title: 'Koramangala Café',
    setting: 'Lively café indoor & patio area',
    description:
      'Agile indoor obstacle navigation dodging outdoor seating, coffee tables, and energetic patrons in a bustling hangout.',
    environmentType: 'Café & Patio',
    status: 'Coming Soon',
  },
  {
    id: 'cubbon-park',
    stageNumber: 'STAGE 05',
    title: 'Cubbon Park',
    setting: 'Historic green park pathways',
    description:
      'Scenic sprint along winding red-dirt trails, bamboo groves, park benches, and open lawns under the morning canopy.',
    environmentType: 'Parkland Trails',
    status: 'Planned',
  },
] as const

export default function LevelsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
          STAGES ROSTER &bull; 2 PLAYABLE ENCOUNTERS + 3 PLANNED
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Game Stages
        </h1>
        <p className="text-sm text-slate-400">
          Playable street encounters and planned stages inspired by prominent Bengaluru landmarks.
        </p>
      </div>

      {/* Notice Banner */}
      <section aria-label="Levels status notice" className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold">
          ✓
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold text-slate-200">
            Phase 3 Encounters: Stages 01 and 02 Are Now Playable!
          </p>
          <p className="text-slate-400 leading-normal">
            Take on the 3-boy college gate confrontation and chaser pursuit in Stage 01, or test combat against two independent blockers in Stage 02. Subsequent stages (MG Road, Koramangala, Cubbon Park) remain planned creative concepts.
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
