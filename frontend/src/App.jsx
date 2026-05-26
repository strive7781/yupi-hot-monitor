import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, connectSSE } from './api/client';
import Header from './components/Header';
import KeywordPanel from './components/KeywordPanel';
import HotspotFeed from './components/HotspotFeed';
import NotificationBell from './components/NotificationBell';
import SettingsPanel from './components/SettingsPanel';
import { BackgroundBeams } from './components/ui/background-beams';
import { GridBackground } from './components/ui/grid-background';

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
      setToast({ title: '🔥 新热点捕获', summary: data.title, hot: true });
      setTimeout(() => setToast(null), 6000);
      refresh();
      if (Notification.permission === 'granted') {
        new Notification('新热点', { body: data.title, icon: '/favicon.ico' });
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
        hot: result.newHotspots.length > 0,
      });
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setToast({ title: '扫描失败', summary: err.message, hot: false });
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

  const tabs = [
    { id: 'feed', label: '热点', icon: '◉' },
    { id: 'keywords', label: '监控', icon: '◎' },
    { id: 'settings', label: '设置', icon: '⚙' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" onClick={requestNotifyPermission}>
      <GridBackground />
      <BackgroundBeams className="opacity-40 [mask-image:radial-gradient(ellipse_at_top,transparent_10%,black_70%)]" />

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
      <div className="md:hidden flex border-b border-radar-border/50 glass-panel relative z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'text-radar-accent border-b-2 border-radar-accent bg-radar-accent/5'
                : 'text-radar-muted hover:text-radar-text'
            }`}
          >
            <span className="text-xs opacity-60">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 flex max-w-7xl mx-auto w-full gap-5 p-4 md:p-6 relative z-10">
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

        <section
          className={`flex-1 min-w-0 ${
            activeTab === 'feed' ? 'block' : 'hidden md:block'
          }`}
        >
          <HotspotFeed hotspots={hotspots} onRefresh={refresh} scanning={scanning} />
        </section>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: 24 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 12, x: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-4 md:right-6 z-50 max-w-sm"
          >
            <div
              className={`glass-panel rounded-xl p-4 shadow-2xl border-l-2 ${
                toast.hot ? 'border-l-radar-glow shadow-glow-hot' : 'border-l-radar-accent'
              }`}
            >
              <p className={`font-display text-sm font-semibold ${toast.hot ? 'text-radar-glow' : 'text-radar-accent'}`}>
                {toast.title}
              </p>
              <p className="text-radar-muted text-xs mt-1 leading-relaxed">{toast.summary}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
