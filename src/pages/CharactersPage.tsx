interface CharacterProfile {
  readonly id: string
  readonly name: string
  readonly initials: string
  readonly role: 'Main Playable Character' | 'Chaser NPC'
  readonly visualProfile: string
  readonly mechanicsRole: string
  readonly badgeColor: string
}

const CHARACTERS: readonly CharacterProfile[] = [
  {
    id: 'dennis',
    name: 'Dennis',
    initials: 'DD',
    role: 'Main Playable Character',
    visualProfile: 'Curly dark hair, blue denim shirt, and jeans.',
    mechanicsRole:
      'The lead protagonist controlled by the player. Dashes, jumps, and navigates city obstacles to evade pursuers.',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    id: 'manish',
    name: 'Manish',
    initials: 'M',
    role: 'Chaser NPC',
    visualProfile: 'Black shirt and glasses.',
    mechanicsRole:
      'Determined pursuer tracking Dennis closely across level pathways with steady chasing speed.',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    id: 'sathish',
    name: 'Sathish',
    initials: 'S',
    role: 'Chaser NPC',
    visualProfile: 'Black Lenovo T-shirt.',
    mechanicsRole:
      'Aggressive pursuer closing gaps and adding pressure during tricky sidewalk bottlenecks.',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    id: 'rahul',
    name: 'Rahul',
    initials: 'R',
    role: 'Chaser NPC',
    visualProfile: 'Dark teal striped shirt.',
    mechanicsRole:
      'Strategic pursuer attempting to anticipate Dennis’s movements and cutoff escape routes.',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
] as const

export default function CharactersPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
          CAST ROSTER &bull; CONFIRMED CHARACTER PROFILES
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Characters
        </h1>
        <p className="text-sm text-slate-400">
          The central protagonist and pursuers of DD Game Scratch.
        </p>
      </div>

      {/* Notice Banner */}
      <section aria-label="Character visual integration notice" className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
          !
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold text-slate-200">
            Awaiting Reference Artwork &mdash; No Fabricated Images
          </p>
          <p className="text-slate-400 leading-normal">
            Final character spritesheets and portraits will be created and integrated when original reference photos are supplied in later stages. The cards below preserve the confirmed character mapping and visual descriptions.
          </p>
        </div>
      </section>

      {/* Character Grid */}
      <section aria-label="Character roster cards" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHARACTERS.map((char) => (
          <article
            key={char.id}
            className="flex flex-col sm:flex-row gap-5 rounded-xl bg-slate-900/70 border border-slate-800 p-6 transition-colors motion-reduce:transition-none hover:border-slate-700 shadow-sm"
          >
            {/* Typographic Avatar Placeholder (No fake portraits) */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex flex-col items-center justify-center text-center p-2 shadow-inner">
              <span className="text-2xl font-black text-amber-400/80 font-mono tracking-wider">
                {char.initials}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Ref Pending
              </span>
            </div>

            {/* Character Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {char.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${char.badgeColor}`}>
                  {char.role}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-slate-400">
                  <span className="font-semibold text-slate-300">Visual Profile:</span>{' '}
                  {char.visualProfile}
                </div>
                <div className="text-slate-400">
                  <span className="font-semibold text-slate-300">Gameplay Role:</span>{' '}
                  {char.mechanicsRole}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                Asset: Original Photo Reference Required
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Footer Scope Note */}
      <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-4 text-center text-xs text-slate-500">
        Character upload, customization interfaces, and sprite generation are reserved for future prompts.
      </div>
    </div>
  )
}
