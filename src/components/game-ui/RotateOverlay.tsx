interface RotateOverlayProps {
  readonly isPortrait: boolean
  readonly onDismiss?: () => void
}

export default function RotateOverlay({ isPortrait, onDismiss }: RotateOverlayProps) {
  if (!isPortrait) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg text-center select-none"
    >
      {/* Animated Rotating Phone Device Icon */}
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping" />
        <div className="w-20 h-34 border-4 border-amber-400 rounded-3xl flex flex-col items-center justify-between p-2.5 animate-[spin_3s_ease-in-out_infinite] shadow-2xl shadow-amber-500/25 bg-slate-900">
          <div className="w-6 h-1.5 bg-amber-400/70 rounded-full" />
          <div className="text-2xl">🔄</div>
          <div className="w-4 h-4 border-2 border-amber-400 rounded-full" />
        </div>
      </div>

      <div className="max-w-md space-y-3">
        <div className="inline-block px-4 py-1.5 rounded-lg text-sm sm:text-base font-gta-heading tracking-wider font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
          LANDSCAPE REQUIRED
        </div>
        <h2 className="gta-title text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
          PLEASE ROTATE YOUR DEVICE
        </h2>
        <p className="text-base sm:text-lg font-gta-body text-slate-200 leading-relaxed">
          DD Game Scratch is an action-adventure chase game optimized for widescreen landscape gameplay.
        </p>
        <p className="text-sm font-gta-heading text-amber-400 font-semibold pt-1">
          Turn your phone sideways to continue Dennis&apos;s adventure &bull; Progress is preserved!
        </p>

        {onDismiss && (
          <div className="pt-4">
            <button
              type="button"
              onClick={onDismiss}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm sm:text-base font-gta-heading font-bold border border-slate-700 cursor-pointer min-h-[44px] transition-colors"
            >
              Continue anyway in portrait
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
