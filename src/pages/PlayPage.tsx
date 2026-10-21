import GameCanvas from '../components/GameCanvas'
import { virtualInputBridge } from '../game/systems/virtualInputBridge'

export default function PlayPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PHASE 2 &bull; PLAYER MOVEMENT &amp; GAMEPLAY CONTROLS
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Game Viewport &mdash; Side-View Stage
        </h1>
        <p className="text-sm text-slate-400">
          Interactive test stage. Take control of Dennis using keyboard or mobile touch buttons.
        </p>
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

              {/* Jump Button */}
              <div className="pointer-events-auto">
                <button
                  type="button"
                  id="btn-touch-jump"
                  aria-label="Jump"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    virtualInputBridge.triggerJump()
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-amber-500/20 backdrop-blur-md border-2 border-amber-500/70 active:bg-amber-500/40 active:border-amber-300 active:scale-95 text-amber-300 flex flex-col items-center justify-center shadow-lg touch-none select-none cursor-pointer transition-transform motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <span className="text-cyan-400">Touch Buttons</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Dennis: Controllable</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-400">Chasers: Stationary</span>
          <span className="text-slate-600">&bull;</span>
          <span>Gravity: 1100</span>
        </div>
      </div>

      {/* Development Status Callouts */}
      <section aria-label="Development status details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Arcade Physics Player Controller
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dennis is controlled via <code className="text-amber-400">PlayerController.ts</code> using an Arcade Physics proxy body paired with static ground collision. It handles continuous horizontal movement, directional facing flips, and single jump verification while preventing mid-air double jumping.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Cross-Platform Touch &amp; Keyboard Input
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Keyboard navigation keys are captured by Phaser to prevent page scrolling. Mobile touch buttons feed directly into a decoupled <code className="text-cyan-400">virtualInputBridge.ts</code>, keeping React re-renders zeroed out of the game loop.
          </p>
        </div>
      </section>
    </div>
  )
}
