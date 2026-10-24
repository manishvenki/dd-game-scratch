interface RotateOverlayProps {
  readonly isPortrait: boolean
  readonly onDismiss?: () => void
}

export default function RotateOverlay({ isPortrait, onDismiss }: RotateOverlayProps) {
  if (!isPortrait) return null

  const handleRequestLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
      const orientation = window.screen?.orientation as unknown as {
        lock?: (orientation: string) => Promise<void>
      }
      if (orientation?.lock) {
        await orientation.lock('landscape')
      }
    } catch {
      // Gracefully handle browser that blocks programmatic orientation lock
    }
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/98 backdrop-blur-xl text-center select-none overflow-y-auto min-h-[100dvh]"
    >
      {/* Animated Rotating Phone Device Icon */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 sm:mb-6 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping" />
        <div className="w-16 h-28 sm:w-20 sm:h-34 border-4 border-amber-400 rounded-3xl flex flex-col items-center justify-between p-2.5 shadow-2xl shadow-amber-500/25 bg-slate-900 transition-transform">
          <div className="w-6 h-1.5 bg-amber-400/70 rounded-full" />
          <div className="text-2xl sm:text-3xl animate-bounce">🔄</div>
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-amber-400 rounded-full" />
        </div>
      </div>

      <div className="max-w-md space-y-2.5 sm:space-y-3 px-2">
        <div className="inline-block px-3.5 py-1 rounded-lg text-xs sm:text-sm font-gta-heading tracking-wider font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
          LANDSCAPE ORIENTATION REQUIRED
        </div>
        <h2 className="gta-title text-3xl sm:text-5xl font-black text-white uppercase tracking-wider leading-none">
          PLEASE ROTATE YOUR DEVICE
        </h2>
        <p className="text-sm sm:text-base font-gta-body text-slate-200 leading-snug">
          DD Game Scratch is an arcade chase adventure designed specifically for widescreen landscape gameplay.
        </p>
        <p className="text-xs sm:text-sm font-gta-heading text-amber-400 font-bold pt-0.5">
          Rotate your device sideways &bull; Level progress and dialogue are preserved!
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleRequestLandscape}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-gta-heading font-black tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer min-h-[44px] transition-all flex items-center justify-center gap-2"
          >
            <span>⛶</span>
            <span>Switch to Landscape</span>
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-gta-heading font-bold border border-slate-800 cursor-pointer min-h-[38px] transition-colors"
            >
              Preview in portrait
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
