import type { PageId } from '../types/navigation'

interface HomePageProps {
  onNavigate: (page: PageId) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative rounded-2xl bg-slate-900/60 border border-slate-800 p-6 sm:p-10 lg:p-12 overflow-hidden">
        {/* Subtle Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative z-10 max-w-3xl flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            PHASE 1 &bull; PROJECT SHELL ACTIVE
          </div>

          <div className="space-y-2">
            <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
              DD Game Scratch
            </h1>
            <p className="text-lg sm:text-xl font-medium text-amber-400/90 tracking-wide">
              Darling Dennis Game &mdash; A 2D Comedy Chase Adventure
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Step into the energetic streets of Bengaluru in an upcoming 2D side-scrolling browser game.
            Play as Dennis as he dashes through bustling college corridors, crowded avenues, and lively hangouts,
            staying one step ahead of his relentless chasers.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('play')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-bold tracking-wide uppercase bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-600 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 shadow-md cursor-pointer"
            >
              Play Game
            </button>

            <button
              type="button"
              onClick={() => onNavigate('levels')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold tracking-wide text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 active:bg-slate-900 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
            >
              Explore Planned Levels
            </button>
          </div>
        </div>
      </section>

      {/* Notice Banner: Development in Progress */}
      <section aria-label="Development status" className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-amber-400 font-mono text-sm font-bold">
          !
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold text-slate-200">
            Development Notice &mdash; Game Under Active Construction
          </p>
          <p className="text-slate-400 leading-normal">
            DD Game Scratch is currently in technical foundation phase. The game loop, physics engine, and playable canvas will be integrated in subsequent development stages. No levels are playable at this time.
          </p>
        </div>
      </section>

      {/* Highlights / Overview Cards */}
      <section aria-labelledby="features-heading" className="space-y-4">
        <h2 id="features-heading" className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Core Pillars of DD Game Scratch
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
            <div className="text-xs font-mono text-amber-400">01 / SETTING</div>
            <h3 className="text-base font-bold text-white">Inspired by Bengaluru</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Levels draw inspiration from iconic local landmarks: from the chaotic energy of college street corners to the bustling sidewalks of Indiranagar and lush paths of Cubbon Park.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
            <div className="text-xs font-mono text-amber-400">02 / GENRE</div>
            <h3 className="text-base font-bold text-white">2D Comedy Adventure</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Designed as a lighthearted, fast-paced arcade runner combining obstacle evasion, quirky pursuit dynamics, and comic timing.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
            <div className="text-xs font-mono text-amber-400">03 / CHARACTERS</div>
            <h3 className="text-base font-bold text-white">The Roster</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Starring Dennis (curly dark hair, denim shirt) pursued by three determined friends: Manish, Sathish, and Rahul, each with distinct visual profiles.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
