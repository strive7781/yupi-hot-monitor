const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getKeywords: () => request('/keywords'),
  addKeyword: (keyword, scope) =>
    request('/keywords', { method: 'POST', body: JSON.stringify({ keyword, scope }) }),
  deleteKeyword: (id) => request(`/keywords/${id}`, { method: 'DELETE' }),
  toggleKeyword: (id) => request(`/keywords/${id}/toggle`, { method: 'PATCH' }),

  getHotspots: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/hotspots${qs ? `?${qs}` : ''}`);
  },
  getStats: () => request('/hotspots/stats'),

  getNotifications: () => request('/notifications'),
  getUnreadCount: () => request('/notifications/unread-count'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  triggerScan: () => request('/scan', { method: 'POST' }),
  health: () => request('/health'),
};

export function connectSSE(onMessage) {
  const es = new EventSource('/api/notifications/stream');
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type !== 'connected') onMessage(data);
    } catch {}
  };
  return es;
}
