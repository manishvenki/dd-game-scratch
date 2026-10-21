import GameCanvas from '../components/GameCanvas'

export default function PlayPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PHASE 2 &bull; CHASER CHARACTER SYSTEM
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Game Viewport
        </h1>
        <p className="text-sm text-slate-400">
          Live Phaser 3 canvas with the complete 4-character core roster: Dennis and the three chasers.
        </p>
      </div>

      {/* Main Game Viewport Container with Live Phaser Canvas */}
      <section
        aria-label="Phaser 3 Game Canvas"
        className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl"
      >
        {/* Aspect Ratio Container (16:9, responsive max height) */}
        <div className="relative w-full aspect-[16/9] max-h-[560px] min-h-[280px]">
          <GameCanvas className="w-full h-full" />
        </div>
      </section>

      {/* Status Bar / Engine Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-200">Roster: Dennis &bull; Manish &bull; Sathish &bull; Rahul</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Scale: RESIZE</span>
          <span className="text-slate-600">&bull;</span>
          <span>Scene: BootScene</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-400">Status: Stationary Placeholders</span>
        </div>
      </div>

      {/* Development Status Callouts */}
      <section aria-label="Development status details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Chaser Entity Architecture
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The three recurring chasers extend a common <code className="text-amber-400">Chaser.ts</code> base entity. Each character renders distinct visual signatures: Manish (black shirt, glasses), Sathish (black Lenovo T-shirt), and Rahul (dark teal striped shirt).
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Upcoming AI &amp; Pursuit Systems
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All four characters remain stationary in this stage to verify rendering and responsive layout. Flocking behavior, pursuit AI, and collision evasion will be integrated in subsequent gameplay prompts.
          </p>
        </div>
      </section>
    </div>
  )
}
