import { useState, useEffect } from 'react';

export default function SettingsPanel({ settings, onSave }) {
  const [form, setForm] = useState({
    scope: 'AI 编程',
    cron_interval: '30',
    email_enabled: 'false',
  });
  const [saving, setSaving] = useState(false);

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
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4">
      <h2 className="font-display text-lg mb-4">设置</h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-radar-muted font-mono block mb-1">监控范围</label>
          <input
            className="input-field text-sm"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            placeholder="如：AI 编程"
          />
        </div>

        <div>
          <label className="text-xs text-radar-muted font-mono block mb-1">
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

        <div className="flex items-center justify-between">
          <label className="text-xs text-radar-muted font-mono">邮件通知</label>
          <button
            onClick={() =>
              setForm({
                ...form,
                email_enabled: form.email_enabled === 'true' ? 'false' : 'true',
              })
            }
            className={`w-10 h-5 rounded-full transition-colors relative ${
              form.email_enabled === 'true' ? 'bg-radar-accent' : 'bg-radar-border'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                form.email_enabled === 'true' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-radar-muted leading-relaxed">
          邮件需在 backend/.env 中配置 SMTP_HOST、SMTP_USER、NOTIFY_EMAIL 等环境变量。
        </p>

        <button onClick={handleSave} disabled={saving} className="btn-accent w-full text-sm">
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
