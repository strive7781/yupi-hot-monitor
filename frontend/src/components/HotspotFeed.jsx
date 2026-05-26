const SOURCE_STYLE = {
  twitter: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
  web: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  hackernews: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  googlenews: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
};

const SOURCE_LABEL = {
  twitter: 'X/Twitter',
  web: 'Web',
  hackernews: 'HN',
  googlenews: 'News',
};

function ScoreBar({ score }) {
  const color =
    score >= 80 ? 'bg-radar-accent' : score >= 60 ? 'bg-radar-glow' : 'bg-radar-muted';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-radar-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-radar-muted w-6 text-right">{Math.round(score)}</span>
    </div>
  );
}

export default function HotspotFeed({ hotspots, onRefresh }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl italic">热点信息流</h2>
        <button onClick={onRefresh} className="btn-ghost text-xs">
          ↻ 刷新
        </button>
      </div>

      {hotspots.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4 opacity-30">📡</div>
          <p className="text-radar-muted">暂无热点，添加关键词后点击「立即扫描」</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hotspots.map((item, i) => (
            <article
              key={item.id}
              className="card p-4 hover:border-radar-accent/40 transition-all duration-300 group animate-slide-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sm leading-snug group-hover:text-radar-accent transition-colors line-clamp-2"
                >
                  {item.title}
                </a>
                <span
                  className={`source-badge shrink-0 ${SOURCE_STYLE[item.source] || SOURCE_STYLE.web}`}
                >
                  {SOURCE_LABEL[item.source] || item.source}
                </span>
              </div>

              {item.summary && (
                <p className="text-radar-muted text-xs leading-relaxed mb-3 line-clamp-2">
                  {item.summary}
                </p>
              )}

              <div className="flex items-center justify-between gap-4">
                <ScoreBar score={item.score} />
                <div className="flex items-center gap-3 text-xs font-mono text-radar-muted shrink-0">
                  {item.keyword && <span>#{item.keyword}</span>}
                  <span>{new Date(item.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
