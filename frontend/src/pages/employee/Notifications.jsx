import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { Bell, Check } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await procurementService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await procurementService.markAllNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--card)] p-6 rounded-3xl shadow-sm border border-[var(--input)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Notifications</h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Stay updated on your request statuses and orders</p>
        </div>
        <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2">
          <Check className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      <div className="bg-[var(--card)] rounded-3xl shadow-sm border border-[var(--input)] divide-y divide-[var(--input)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center text-[var(--muted)]">
            <Bell className="w-10 h-10 mb-4 opacity-50" />
            <p className="text-lg">You have no new notifications.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`p-6 flex gap-4 transition-colors hover:bg-[var(--secondary)]/50 ${notif.isRead ? 'bg-[var(--card)]' : 'bg-[var(--primary)]/5'}`}>
              <div className={`w-2.5 h-2.5 mt-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]'}`} />
              <div>
                <h4 className="font-semibold text-[var(--foreground)] text-lg">{notif.title}</h4>
                <p className="text-[var(--secondary-foreground)] mt-1">{notif.message}</p>
                <p className="text-xs text-[var(--muted)] mt-2 font-mono">{new Date(notif.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
