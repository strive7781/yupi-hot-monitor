import { useState, useEffect, useCallback } from 'react';
import { api, connectSSE } from './api/client';
import Header from './components/Header';
import KeywordPanel from './components/KeywordPanel';
import HotspotFeed from './components/HotspotFeed';
import NotificationBell from './components/NotificationBell';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [keywords, setKeywords] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [toast, setToast] = useState(null);

  const refresh = useCallback(async () => {
    const [kw, hs, nt, st, statsData] = await Promise.all([
      api.getKeywords(),
      api.getHotspots({ limit: 50 }),
      api.getNotifications(),
      api.getSettings(),
      api.getStats(),
    ]);
    setKeywords(kw);
    setHotspots(hs);
    setNotifications(nt);
    setSettings(st);
    setStats(statsData);
  }, []);

  useEffect(() => {
    refresh().catch(console.error);
    const es = connectSSE((data) => {
      setToast({ title: data.title, summary: data.summary });
      setTimeout(() => setToast(null), 5000);
      refresh();
      if (Notification.permission === 'granted') {
        new Notification('🔥 新热点', { body: data.title, icon: '/favicon.ico' });
      }
    });
    return () => es.close();
  }, [refresh]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await api.triggerScan();
      await refresh();
      setToast({
        title: '扫描完成',
        summary: `扫描 ${result.scanned} 个关键词，发现 ${result.newHotspots.length} 条新热点`,
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ title: '扫描失败', summary: err.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setScanning(false);
    }
  };

  const requestNotifyPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" onClick={requestNotifyPermission}>
      <Header
        stats={stats}
        scanning={scanning}
        onScan={handleScan}
        notificationBell={
          <NotificationBell
            notifications={notifications}
            onMarkRead={async (id) => {
              await api.markRead(id);
              refresh();
            }}
            onMarkAllRead={async () => {
              await api.markAllRead();
              refresh();
            }}
          />
        }
      />

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-radar-border">
        {[
          { id: 'feed', label: '热点' },
          { id: 'keywords', label: '监控' },
          { id: 'settings', label: '设置' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-radar-accent border-b-2 border-radar-accent'
                : 'text-radar-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 flex max-w-7xl mx-auto w-full gap-6 p-4 md:p-6">
        {/* Sidebar — desktop always visible; mobile tab-controlled */}
        <aside
          className={`w-full md:w-72 shrink-0 space-y-4 ${
            activeTab === 'feed' ? 'hidden md:block' : 'block'
          }`}
        >
          {activeTab !== 'settings' && (
            <KeywordPanel
              keywords={keywords}
              scope={settings.scope || 'AI 编程'}
              onAdd={async (keyword) => {
                await api.addKeyword(keyword, settings.scope || 'AI 编程');
                refresh();
              }}
              onDelete={async (id) => {
                await api.deleteKeyword(id);
                refresh();
              }}
              onToggle={async (id) => {
                await api.toggleKeyword(id);
                refresh();
              }}
            />
          )}
          <div className={activeTab === 'keywords' ? 'hidden md:block' : ''}>
            <SettingsPanel
              settings={settings}
              onSave={async (data) => {
                await api.updateSettings(data);
                refresh();
              }}
            />
          </div>
        </aside>

        {/* Main feed */}
        <section
          className={`flex-1 min-w-0 ${
            activeTab === 'feed' ? 'block' : 'hidden md:block'
          }`}
        >
          <HotspotFeed hotspots={hotspots} onRefresh={refresh} />
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in max-w-sm">
          <div className="card p-4 shadow-2xl border-radar-accent/50 animate-pulse-glow">
            <p className="font-display text-radar-accent text-sm">{toast.title}</p>
            <p className="text-radar-muted text-xs mt-1">{toast.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
