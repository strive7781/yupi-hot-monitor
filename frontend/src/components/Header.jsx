function RadarIcon() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border border-radar-accent/30" />
      <div className="absolute inset-1 rounded-full border border-radar-accent/20" />
      <div className="absolute inset-2 rounded-full border border-radar-accent/10" />
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent to-radar-accent/40 animate-radar-sweep origin-center" />
      </div>
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radar-accent" />
    </div>
  );
}

export default function Header({ stats, scanning, onScan, notificationBell }) {
  return (
    <header className="border-b border-radar-border bg-radar-surface/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RadarIcon />
          <div>
            <h1 className="font-display text-xl md:text-2xl italic text-radar-text leading-none">
              吃瓜雷达
            </h1>
            <p className="text-radar-muted text-xs font-mono mt-0.5 tracking-wider">
              YUPI HOT MONITOR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {stats && (
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-radar-muted">
              <span>
                总计 <span className="text-radar-accent">{stats.total}</span>
              </span>
              <span>
                今日 <span className="text-radar-glow">{stats.today}</span>
              </span>
            </div>
          )}

          <button
            onClick={onScan}
            disabled={scanning}
            className="btn-accent text-sm flex items-center gap-2"
          >
            {scanning ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                扫描中
              </>
            ) : (
              <>⚡ 立即扫描</>
            )}
          </button>

          {notificationBell}
        </div>
      </div>
    </header>
  );
}
