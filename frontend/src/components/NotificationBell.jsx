import { useState } from 'react';

export default function NotificationBell({ notifications, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md border border-radar-border hover:border-radar-accent transition-colors"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-radar-accent text-white text-xs rounded-full flex items-center justify-center font-mono">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 card z-50 shadow-2xl max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-radar-border">
              <span className="font-display text-sm">通知中心</span>
              {unread > 0 && (
                <button onClick={onMarkAllRead} className="text-xs text-radar-accent hover:underline">
                  全部已读
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <p className="text-radar-muted text-sm text-center py-8">暂无通知</p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && onMarkRead(n.id)}
                    className={`p-3 border-b border-radar-border/50 cursor-pointer hover:bg-radar-bg transition-colors ${
                      !n.read ? 'bg-radar-accent/5' : ''
                    }`}
                  >
                    <p className="text-xs leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-radar-muted text-xs font-mono mt-1">
                      {new Date(n.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
