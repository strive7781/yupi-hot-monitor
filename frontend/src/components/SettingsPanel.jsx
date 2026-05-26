import { useState, useEffect } from 'react';
import { CardSpotlight } from './ui/card-spotlight';

export default function SettingsPanel({ settings, onSave }) {
  const [form, setForm] = useState({
    scope: 'AI 编程',
    cron_interval: '30',
    email_enabled: 'false',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        scope: settings.scope || 'AI 编程',
        cron_interval: settings.cron_interval || '30',
        email_enabled: settings.email_enabled || 'false',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CardSpotlight className="hover:border-radar-accent/25">
      <div className="p-4">
        <h2 className="font-display text-base font-semibold mb-1">设置</h2>
        <p className="text-[11px] font-mono text-radar-muted mb-4">扫描策略 & 通知</p>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-radar-muted font-mono block mb-1.5 uppercase tracking-wider">
              监控范围
            </label>
            <input
              className="input-field text-sm"
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              placeholder="如：AI 编程"
            />
          </div>

          <div>
            <label className="text-[11px] text-radar-muted font-mono block mb-1.5 uppercase tracking-wider">
              自动扫描间隔（分钟）
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              className="input-field text-sm"
              value={form.cron_interval}
              onChange={(e) => setForm({ ...form, cron_interval: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="text-[11px] text-radar-muted font-mono uppercase tracking-wider">
              邮件通知
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={form.email_enabled === 'true'}
              onClick={() =>
                setForm({
                  ...form,
                  email_enabled: form.email_enabled === 'true' ? 'false' : 'true',
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative border ${
                form.email_enabled === 'true'
                  ? 'bg-radar-accent/20 border-radar-accent/50'
                  : 'bg-radar-bg border-radar-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${
                  form.email_enabled === 'true'
                    ? 'translate-x-[22px] bg-radar-accent shadow-glow'
                    : 'translate-x-0.5 bg-radar-muted/60'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-radar-muted/80 leading-relaxed">
            邮件需在 backend/.env 配置 SMTP 相关变量
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-accent w-full text-sm"
          >
            {saving ? '保存中…' : saved ? '✓ 已保存' : '保存设置'}
          </button>
        </div>
      </div>
    </CardSpotlight>
  );
}
