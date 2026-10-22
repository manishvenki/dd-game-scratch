import type { ReactNode } from 'react'
import type { PageId } from '../types/navigation'

interface LayoutProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  children: ReactNode
}

/**
 * Game-Native Full-Viewport Shell Layout.
 * Removes conventional website headers, footers, and marketing cards.
 * Operates as a seamless full-screen game canvas container with zero scrolling.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 antialiased">
      {/* Skip to Content Accessibility Link */}
      <a
        href="#game-root"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-amber-500 focus:text-slate-950 focus:font-bold focus:rounded-md"
      >
        Skip to Game
      </a>

      {/* Main Full-Viewport Game Screen Container */}
      <main id="game-root" className="relative w-full h-full flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
