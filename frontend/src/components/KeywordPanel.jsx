import { useState } from 'react';
import { CardSpotlight } from './ui/card-spotlight';

export default function KeywordPanel({ keywords, scope, onAdd, onDelete, onToggle }) {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      await onAdd(input.trim());
      setInput('');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const activeCount = keywords.filter((k) => k.enabled).length;

  return (
    <CardSpotlight className="hover:border-radar-accent/25">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-base font-semibold">监控关键词</h2>
            <p className="text-[11px] font-mono text-radar-muted mt-0.5">
              {activeCount}/{keywords.length} 活跃
            </p>
          </div>
          <span className="text-[10px] font-mono text-radar-accent bg-radar-accent/10 px-2 py-1 rounded-md border border-radar-accent/20">
            {scope}
          </span>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            className="input-field text-sm"
            placeholder="Claude 4、Cursor、DeepSeek…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="添加监控关键词"
          />
          <button
            type="submit"
            disabled={adding || !input.trim()}
            className="btn-accent text-sm shrink-0 px-3 min-w-[40px]"
            aria-label="添加关键词"
          >
            {adding ? '…' : '+'}
          </button>
        </form>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
          {keywords.length === 0 && (
            <p className="text-radar-muted text-sm text-center py-6">
              添加关键词，雷达即刻启动
            </p>
          )}
          {keywords.map((kw) => (
            <div
              key={kw.id}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg border transition-all duration-200 ${
                kw.enabled
                  ? 'border-radar-border/70 bg-radar-bg/40 hover:border-radar-accent/30'
                  : 'border-radar-border/30 bg-radar-bg/20 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {kw.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-radar-accent shrink-0 animate-live-pulse" />
                )}
                <span className="text-sm font-medium truncate">{kw.keyword}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onToggle(kw.id)}
                  className="btn-ghost text-xs py-1 px-2 min-w-[32px] min-h-[32px]"
                  title={kw.enabled ? '暂停监控' : '启用监控'}
                  aria-label={kw.enabled ? '暂停监控' : '启用监控'}
                >
                  {kw.enabled ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => onDelete(kw.id)}
                  className="btn-ghost text-xs py-1 px-2 min-w-[32px] min-h-[32px] hover:border-red-400/50 hover:text-red-400"
                  aria-label="删除关键词"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardSpotlight>
  );
}
