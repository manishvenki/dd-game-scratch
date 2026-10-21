import GameCanvas from '../components/GameCanvas'
import { virtualInputBridge } from '../game/systems/virtualInputBridge'

export default function PlayPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Level Select */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PHASE 3 &bull; LEVEL 1 &amp; LEVEL 2 ENCOUNTERS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Playable Encounters
          </h1>
          <p className="text-sm text-slate-400">
            Interactive combat and chase encounters. Take control of Dennis using keyboard or touch buttons.
          </p>
        </div>

        {/* Level Switcher Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            id="btn-select-level-1"
            onClick={() => {
              window.location.hash = '#/play?level=1'
              ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: string) => void }).__DD_LOAD_LEVEL__?.('level-1')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
          >
            Level 1: College Gate
          </button>
          <button
            type="button"
            id="btn-select-level-2"
            onClick={() => {
              window.location.hash = '#/play?level=2'
              ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: string) => void }).__DD_LOAD_LEVEL__?.('level-2')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            Level 2: Street Bottleneck
          </button>
        </div>
      </div>

      {/* Main Game Viewport Container with Live Phaser Canvas & Touch Controls Overlay */}
      <section
        aria-label="Phaser 3 Game Canvas and Controls"
        className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl select-none"
      >
        {/* Aspect Ratio Container (16:9, responsive max height) */}
        <div className="relative w-full aspect-[16/9] max-h-[560px] min-h-[300px]">
          <GameCanvas className="w-full h-full" />

          {/* Touch Controls Overlay (visible inside the game viewport) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-3 sm:p-5 z-20">
            <div className="flex items-end justify-between w-full">
              {/* Left / Right Movement Buttons */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  id="btn-touch-left"
                  aria-label="Move Dennis Left"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setLeft(true)
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setLeft(false)
                  }}
                  onPointerLeave={() => virtualInputBridge.setLeft(false)}
                  onPointerCancel={() => virtualInputBridge.setLeft(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900/85 backdrop-blur-md border-2 border-slate-700/80 active:bg-amber-500/25 active:border-amber-400 active:scale-95 text-slate-200 active:text-amber-300 flex items-center justify-center font-bold text-xl shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  id="btn-touch-right"
                  aria-label="Move Dennis Right"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setRight(true)
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    virtualInputBridge.setRight(false)
                  }}
                  onPointerLeave={() => virtualInputBridge.setRight(false)}
                  onPointerCancel={() => virtualInputBridge.setRight(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900/85 backdrop-blur-md border-2 border-slate-700/80 active:bg-amber-500/25 active:border-amber-400 active:scale-95 text-slate-200 active:text-amber-300 flex items-center justify-center font-bold text-xl shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Action Buttons: Jump & Attack */}
              <div className="pointer-events-auto flex items-center gap-2">
                {/* Attack Button */}
                <button
                  type="button"
                  id="btn-touch-attack"
                  aria-label="Attack"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.triggerAttack()
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-rose-500/20 backdrop-blur-md border-2 border-rose-500/70 active:bg-rose-500/40 active:border-rose-300 active:scale-95 text-rose-300 flex flex-col items-center justify-center shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">ATTACK</span>
                </button>

                {/* Jump Button */}
                <button
                  type="button"
                  id="btn-touch-jump"
                  aria-label="Jump"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.triggerJump()
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-amber-500/20 backdrop-blur-md border-2 border-amber-500/70 active:bg-amber-500/40 active:border-amber-300 active:scale-95 text-amber-300 flex flex-col items-center justify-center shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">JUMP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Legend & Engine Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-200">Controls:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">A / D or ← / →</span>
          <span>Move</span>
          <span className="text-slate-600">&bull;</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">SPACE or ↑</span>
          <span>Jump</span>
          <span className="text-slate-600">&bull;</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80">J or X</span>
          <span>Attack</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-cyan-400">Touch Controls</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Level 1: 3 Blockers + Chase</span>
          <span className="text-slate-600">&bull;</span>
          <span>Level 2: 2 Blockers</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-emerald-400">Combat: Active</span>
        </div>
      </div>

      {/* Development Status Callouts */}
      <section aria-label="Development status details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Level 1 &amp; Level 2 Encounter Architecture
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data-driven level configs (<code className="text-amber-400">levelConfigs.ts</code>) define world bounds, blocker spawn coordinates, independent health/defeat states, and exit goals. Level 1 features a 3-boy confrontation followed by a chaser pursuit to the BMTC Bus Stop. Level 2 features a distinct 2-boy corridor confrontation.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Arcade Comedy Combat &amp; Collision Rules
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Attacks (<code className="text-rose-400">J / X</code> or Touch Attack) check facing direction and close range. Hit enemies recoil with floating arcade sparks and collapse when depleted. Defeated enemies disable their physics body so Dennis can sprint past them freely.
          </p>
        </div>
      </section>
    </div>
  )
}
