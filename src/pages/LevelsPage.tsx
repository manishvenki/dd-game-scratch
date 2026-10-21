interface PlannedLevel {
  readonly id: string
  readonly stageNumber: string
  readonly title: string
  readonly setting: string
  readonly description: string
  readonly environmentType: string
  readonly status: 'Planned' | 'Coming Soon'
}

const PLANNED_LEVELS: readonly PlannedLevel[] = [
  {
    id: 'college-street',
    stageNumber: 'STAGE 01',
    title: 'Bengaluru College Street',
    setting: 'Campus perimeter & bustling avenue',
    description:
      'Challenging street-side navigation through roadside chaat stalls, morning vehicle traffic, and crowded college gate gates.',
    environmentType: 'Urban Sidewalk',
    status: 'Planned',
  },
  {
    id: 'indiranagar',
    stageNumber: 'STAGE 02',
    title: 'Indiranagar',
    setting: 'Trendy residential & commercial lanes',
    description:
      'Weaving past parked scooters, pedestrian shoppers, and complex intersections along the iconic 100 Feet Road corridor.',
    environmentType: 'Commercial Avenue',
    status: 'Coming Soon',
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
          CREATIVE BLUEPRINTS &bull; 5 PLANNED STAGES
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Planned Levels
        </h1>
        <p className="text-sm text-slate-400">
          Proposed creative settings inspired by prominent Bengaluru landmarks.
        </p>
      </div>

      {/* Notice Banner */}
      <section aria-label="Levels status notice" className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
          i
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold text-slate-200">
            Creative Concepts &mdash; Not Playable In-Game Environments
          </p>
          <p className="text-slate-400 leading-normal">
            These five stages represent proposed creative level themes for DD Game Scratch. Stage assets, tilemaps, and obstacles will be created in future milestone prompts. None of the levels are currently playable.
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
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
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
              <span className="text-slate-600">Unbuilt Stage</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
