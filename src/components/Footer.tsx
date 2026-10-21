import type { PageId } from '../types/navigation'

interface FooterProps {
  onNavigate: (page: PageId) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-slate-400">
            DD Game Scratch &bull; Darling Dennis Game
          </span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <span>A 2D comedy chase adventure inspired by Bengaluru</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-slate-300 focus-visible:outline-none focus-visible:text-amber-400 underline-offset-4 hover:underline cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('play')}
            className="hover:text-slate-300 focus-visible:outline-none focus-visible:text-amber-400 underline-offset-4 hover:underline cursor-pointer"
          >
            Play Viewport
          </button>
          <button
            type="button"
            onClick={() => onNavigate('levels')}
            className="hover:text-slate-300 focus-visible:outline-none focus-visible:text-amber-400 underline-offset-4 hover:underline cursor-pointer"
          >
            Planned Levels
          </button>
          <button
            type="button"
            onClick={() => onNavigate('characters')}
            className="hover:text-slate-300 focus-visible:outline-none focus-visible:text-amber-400 underline-offset-4 hover:underline cursor-pointer"
          >
            Characters
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-slate-900 text-center text-[11px] text-slate-600">
        Phase 1 Active &bull; Technical Foundation &amp; Responsive Shell &bull; Gameplay integration reserved for subsequent phases
      </div>
    </footer>
  )
}
