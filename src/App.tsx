export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              DD Game Scratch
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Darling Dennis Game
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Foundation Active
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">React 19</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">Vite</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">TypeScript</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">Phaser 3</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">Tailwind v4</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Game Canvas Container / Placeholder Panel */}
        <section aria-label="Game Canvas Stage" className="w-full">
          <div className="relative w-full aspect-[4/3] max-h-[580px] bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-xl overflow-hidden">
            {/* Subtle Grid Accent */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10 max-w-md flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md text-xs font-semibold uppercase tracking-wider">
                Phaser 3 Canvas Placeholder
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Game Canvas Integration Reserved for Later Stage
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                The technical foundation and typed Phaser 3 configuration are initialized.
                The interactive game canvas, game loop, scenes, and character controllers will be connected in future master prompts.
              </p>

              <div className="mt-2 text-xs text-slate-500 font-mono bg-slate-950/70 px-3 py-1.5 rounded border border-slate-800">
                Status: No playable gameplay in Phase 1
              </div>
            </div>
          </div>
        </section>

        {/* Technical Foundation Overview Cards */}
        <section aria-label="System Architecture Overview" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">01 / FRONTEND SHELL</div>
              <h3 className="text-base font-semibold text-white mb-1">React + Tailwind v4</h3>
              <p className="text-xs text-slate-400 leading-normal">
                React handles surrounding UI, responsive layout containers, and application navigation without interfering with the game loop.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Vite + @tailwindcss/vite
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">02 / ENGINE CORE</div>
              <h3 className="text-base font-semibold text-white mb-1">Phaser 3 Engine</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Phaser 3.90 is installed with modular configuration factories and documented component lifecycle destruction patterns.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Decoupled gameConfig.ts
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">03 / NEXT MILESTONE</div>
              <h3 className="text-base font-semibold text-white mb-1">Canvas Mounting</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Master Prompt 2 will mount Phaser inside the React container and establish scene lifecycle management.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Ready for Master Prompt 2
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
        <p>DD Game Scratch (Darling Dennis Game) &bull; Phase 1 Technical Foundation</p>
      </footer>
    </div>
  )
}
