import GameCanvas from '../components/GameCanvas'

export default function PlayPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PHASER 3 ENGINE CONNECTED
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Game Viewport
        </h1>
        <p className="text-sm text-slate-400">
          Active Phaser 3 canvas viewport container running the initial integration test scene.
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
          <span className="text-slate-200">Renderer: Phaser AUTO (WebGL / Canvas)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Scale: RESIZE</span>
          <span className="text-slate-600">&bull;</span>
          <span>Scene: BootScene</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-400">Status: Test Scene (Not Playable)</span>
        </div>
      </div>

      {/* Development Status Callouts */}
      <section aria-label="Development status details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Lifecycle Management Active
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Phaser 3 game instance is managed through a React ref in <code className="text-amber-400">GameCanvas.tsx</code>. It cleans up automatically via <code className="text-slate-300">game.destroy(true)</code> on component unmount to prevent duplicate canvases or memory leaks during navigation.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Upcoming Gameplay Milestones
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            This active scene verifies engine connectivity, coordinate scaling, and canvas resizing. Dennis sprite animations, collision physics, and chaser AI mechanics will be introduced in subsequent master prompts.
          </p>
        </div>
      </section>
    </div>
  )
}
