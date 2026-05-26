import { CardSpotlight } from './ui/card-spotlight';

const SOURCE_STYLE = {
  twitter: 'border-sky-400/30 text-sky-300 bg-sky-500/10',
  web: 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10',
  hackernews: 'border-orange-400/30 text-orange-300 bg-orange-500/10',
  googlenews: 'border-blue-400/30 text-blue-300 bg-blue-500/10',
};

const SOURCE_LABEL = {
  twitter: 'X',
  web: 'Web',
  hackernews: 'HN',
  googlenews: 'News',
};

function ScoreBar({ score }) {
  const isHot = score >= 80;
  const color = isHot
    ? 'bg-gradient-to-r from-radar-glow to-radar-hot'
    : score >= 60
      ? 'bg-radar-accent'
      : 'bg-radar-muted/60';

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1 bg-radar-border/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span
        className={`text-xs font-mono w-7 text-right tabular-nums ${isHot ? 'text-radar-glow font-semibold' : 'text-radar-muted'}`}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

export default function HotspotFeed({ hotspots, onRefresh, scanning }) {
  const hotCount = hotspots.filter((h) => h.score >= 80).length;

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-lg md:text-xl font-bold tracking-tight">
              热点信息流
            </h2>
            {hotCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-radar-glow/15 text-radar-glow border border-radar-glow/30 animate-pulse-glow">
                {hotCount} 条高热
              </span>
            )}
          </div>
          <p className="text-radar-muted text-xs mt-1 font-mono">
            {scanning ? '正在全源采集…' : '按热度排序 · 点击标题直达原文'}
          </p>
        </div>
        <button onClick={onRefresh} className="btn-ghost text-xs shrink-0" aria-label="刷新热点">
          ↻ 刷新
        </button>
      </div>

      <div className="relative mb-4 h-px overflow-hidden bg-radar-border/40 rounded-full">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-radar-accent/60 to-transparent animate-scan-line" />
      </div>

      {hotspots.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-radar-accent/20 bg-radar-accent/5 mb-4">
            <svg className="w-6 h-6 text-radar-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </div>
          <p className="text-radar-text font-medium mb-1">雷达待机中</p>
          <p className="text-radar-muted text-sm">添加关键词，点击「立即扫描」捕获第一手热点</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {hotspots.map((item, i) => {
            const isHot = item.score >= 80;
            return (
              <article
                key={item.id}
                className="animate-slide-in"
                style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
              >
                <CardSpotlightWrapper isHot={isHot}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-1.5 font-medium text-sm leading-snug hover:text-radar-accent transition-colors line-clamp-2"
                      >
                        {item.title}
                        <ExternalLinkIcon />
                      </a>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isHot && (
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-radar-hot/20 text-radar-hot border border-radar-hot/40">
                            HOT
                          </span>
                        )}
                        <span className={`source-badge ${SOURCE_STYLE[item.source] || SOURCE_STYLE.web}`}>
                          {SOURCE_LABEL[item.source] || item.source}
                        </span>
                      </div>
                    </div>

                    {item.summary && (
                      <p className="text-radar-muted text-xs leading-relaxed mb-3 line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <ScoreBar score={item.score} />
                      <div className="flex items-center gap-2 text-[10px] font-mono text-radar-muted shrink-0">
                        {item.keyword && (
                          <span className="text-radar-accent/70">#{item.keyword}</span>
                        )}
                        <span>
                          {new Date(item.created_at).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardSpotlightWrapper>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CardSpotlightWrapper({ children, isHot }) {
  return (
    <CardSpotlight
      spotlightColor={isHot ? 'rgba(255, 107, 43, 0.14)' : 'rgba(0, 212, 255, 0.1)'}
      className={isHot ? 'border-radar-glow/30 shadow-glow-hot' : 'hover:border-radar-accent/30'}
    >
      {children}
    </CardSpotlight>
  );
}
