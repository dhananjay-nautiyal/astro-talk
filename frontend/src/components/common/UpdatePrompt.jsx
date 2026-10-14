const UpdatePrompt = ({ version, notes, onUpdate, onLater }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="App update available">
    <div className="absolute inset-0 bg-black/60" />
    <div className="glass relative w-full max-w-sm rounded-2xl p-6 text-center">
      <p className="text-5xl mb-3" aria-hidden="true">🚀</p>
      <h2 className="text-xl font-bold text-light">Update available</h2>
      <p className="text-sm text-muted mt-1">
        Version {version} is ready — you are on the previous release.
      </p>
      {notes ? (
        <p className="text-xs text-muted mt-3 max-h-24 overflow-y-auto text-left whitespace-pre-wrap">
          {notes.slice(0, 400)}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={onLater}
          className="py-2.5 rounded-xl border border-white/15 text-sm font-medium text-light hover:bg-white/10 transition-colors min-h-[44px]"
        >
          Later
        </button>
        <button
          type="button"
          onClick={onUpdate}
          className="py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-cosmic text-sm font-semibold hover:opacity-90 transition-opacity min-h-[44px]"
        >
          Update
        </button>
      </div>
    </div>
  </div>
)

export default UpdatePrompt
