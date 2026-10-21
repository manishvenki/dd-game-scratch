import { useState, useEffect } from 'react'
import GameCanvas from '../components/GameCanvas'
import { virtualInputBridge } from '../game/systems/virtualInputBridge'

export default function PlayPage() {
  const [activeLevel, setActiveLevel] = useState<string>(() => {
    const hash = window.location.hash
    if (hash.includes('level=4')) return 'level-4'
    if (hash.includes('level=3')) return 'level-3'
    if (hash.includes('level=2')) return 'level-2'
    return 'level-1'
  })

  useEffect(() => {
    const syncLevel = () => {
      const hash = window.location.hash
      if (hash.includes('level=4')) setActiveLevel('level-4')
      else if (hash.includes('level=3')) setActiveLevel('level-3')
      else if (hash.includes('level=2')) setActiveLevel('level-2')
      else setActiveLevel('level-1')
    }
    window.addEventListener('hashchange', syncLevel)
    return () => window.removeEventListener('hashchange', syncLevel)
  }, [])

  const switchLevel = (levelId: string, levelNum: number) => {
    setActiveLevel(levelId)
    window.location.hash = `#/play?level=${levelNum}`
    ;(window as unknown as { __DD_LOAD_LEVEL__?: (id: string) => void }).__DD_LOAD_LEVEL__?.(levelId)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header & Level Select */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PHASE 3 &bull; LEVELS 1–4 PLAYABLE &bull; CONTINUOUS CHASE &amp; DIALOGUE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Playable Encounters
          </h1>
          <p className="text-sm text-slate-400">
            Interactive combat, continuous trio pursuit, and comic Tanglish story encounters across Bengaluru.
          </p>
        </div>

        {/* Level Switcher Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            id="btn-select-level-1"
            onClick={() => switchLevel('level-1', 1)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-1'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L1: College Gate
          </button>
          <button
            type="button"
            id="btn-select-level-2"
            onClick={() => switchLevel('level-2', 2)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-2'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L2: Market Corridor
          </button>
          <button
            type="button"
            id="btn-select-level-3"
            onClick={() => switchLevel('level-3', 3)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-3'
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L3: MG Road Reveal
          </button>
          <button
            type="button"
            id="btn-select-level-4"
            onClick={() => switchLevel('level-4', 4)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              activeLevel === 'level-4'
                ? 'bg-pink-500/25 text-pink-300 border-pink-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            L4: Koramangala Café
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
          <span>Stages 1–4 Active</span>
          <span className="text-slate-600">&bull;</span>
          <span>Continuous Pursuit: Enabled</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-emerald-400">Comic Dialogue: Active</span>
        </div>
      </div>

      {/* Development Status Callouts */}
      <section aria-label="Development status details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Continuous Chase &amp; Independent Blocker Rules
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In Stage 01, Manish, Sathish, and Rahul begin pursuing Dennis from the opening moments. The trio never waits for blockers; every second spent attacking or hesitating allows them to close the distance. Getting caught triggers a comedic Tanglish catch exchange and retry.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Stages 03 &amp; 04: Story Beats &amp; Dialogue
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stage 03 introduces the MG Road neon commercial avenue and a comical drama club mix-up before fleeing to the Metro. Stage 04 takes Dennis to a Koramangala café date with Ananya before the chasers crash the date and force a frantic sprint to 80ft Road.
          </p>
        </div>
      </section>
    </div>
  )
}
