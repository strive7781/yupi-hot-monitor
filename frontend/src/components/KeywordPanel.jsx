import { useState } from 'react';

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

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg">监控关键词</h2>
        <span className="text-xs font-mono text-radar-muted bg-radar-bg px-2 py-0.5 rounded">
          {scope}
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          className="input-field text-sm"
          placeholder="如：Claude 4、Cursor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={adding} className="btn-accent text-sm shrink-0">
          +
        </button>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {keywords.length === 0 && (
          <p className="text-radar-muted text-sm text-center py-4">暂无关键词，添加后开始监控</p>
        )}
        {keywords.map((kw) => (
          <div
            key={kw.id}
            className={`flex items-center justify-between p-2 rounded-md border transition-colors ${
              kw.enabled
                ? 'border-radar-border bg-radar-bg'
                : 'border-radar-border/50 bg-radar-bg/50 opacity-60'
            }`}
          >
            <span className="text-sm font-medium truncate">{kw.keyword}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onToggle(kw.id)}
                className="btn-ghost text-xs py-1 px-2"
                title={kw.enabled ? '暂停' : '启用'}
              >
                {kw.enabled ? '⏸' : '▶'}
              </button>
              <button
                onClick={() => onDelete(kw.id)}
                className="btn-ghost text-xs py-1 px-2 hover:border-red-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
