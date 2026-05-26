import RadarAnimation from './RadarAnimation';
import { MovingBorderButton } from './ui/moving-border';

function ScanIcon({ spinning }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {spinning ? (
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      ) : (
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function Header({ stats, scanning, onScan, notificationBell }) {
  return (
    <header className="sticky top-0 z-40 border-b border-radar-border/50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <RadarAnimation size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg md:text-xl font-bold tracking-tight text-radar-text truncate">
                吃瓜雷达
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 stat-pill text-radar-accent border-radar-accent/30">
                <span className="w-1.5 h-1.5 rounded-full bg-radar-accent animate-live-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-radar-muted text-[11px] font-mono tracking-widest mt-0.5 truncate">
              AI HOTSPOT · REAL-TIME INTEL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {stats && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="stat-pill">
                总计
                <span className="text-radar-accent font-semibold">{stats.total}</span>
              </span>
              <span className="stat-pill">
                今日
                <span className="text-radar-glow font-semibold">{stats.today}</span>
              </span>
            </div>
          )}

          <MovingBorderButton
            onClick={onScan}
            disabled={scanning}
            containerClassName="h-9 md:h-10 shrink-0"
            className="px-3 md:px-4 text-xs md:text-sm font-semibold text-radar-accent hover:text-white disabled:opacity-60"
            duration={scanning ? 1200 : 2800}
          >
            <ScanIcon spinning={scanning} />
            {scanning ? '扫描中…' : '立即扫描'}
          </MovingBorderButton>

          {notificationBell}
        </div>
      </div>
    </header>
  );
}
