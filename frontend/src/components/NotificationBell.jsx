import { useState } from 'react';
import { CardSpotlight } from './ui/card-spotlight';

function BellIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NotificationBell({ notifications, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg border border-radar-border/70 bg-radar-bg/40 hover:border-radar-accent/50 hover:bg-radar-accent/5 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label={`通知中心${unread > 0 ? `，${unread} 条未读` : ''}`}
      >
        <BellIcon className="w-5 h-5 text-radar-muted" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-radar-glow text-radar-bg text-[10px] rounded-full flex items-center justify-center font-mono font-bold animate-pulse-glow">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <CardSpotlight className="absolute right-0 top-full mt-2 w-80 z-50 shadow-2xl max-h-96 overflow-hidden border-radar-accent/20">
            <div className="flex items-center justify-between p-3 border-b border-radar-border/50">
              <span className="font-display text-sm font-semibold">通知中心</span>
              {unread > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-radar-accent hover:text-radar-glow transition-colors"
                >
                  全部已读
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <p className="text-radar-muted text-sm text-center py-10">暂无通知</p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && onMarkRead(n.id)}
                    className={`p-3 border-b border-radar-border/30 cursor-pointer hover:bg-radar-accent/5 transition-colors ${
                      !n.read ? 'bg-radar-glow/5 border-l-2 border-l-radar-glow' : ''
                    }`}
                  >
                    <p className="text-xs leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-radar-muted text-[10px] font-mono mt-1.5">
                      {new Date(n.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardSpotlight>
        </>
      )}
    </div>
  );
}
