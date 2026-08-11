import { useCallback, useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  MyNotificationPreferencesDocument,
  UpdateNotificationPreferencesDocument,
} from '../../../api/graphql/graphql';

const TOPICS: { id: string; label: string; hint: string }[] = [
  { id: 'leave', label: 'Leave', hint: 'Leave requests and approvals' },
  { id: 'expense', label: 'Expense', hint: 'Expense claims' },
  { id: 'travel', label: 'Travel', hint: 'Travel requests' },
  { id: 'tax', label: 'Tax / Proofs', hint: 'Tax documents and proof reminders' },
  { id: 'hr_direct', label: 'HR & Broadcasts', hint: 'Direct HR messages and broadcasts' },
  { id: 'other', label: 'Other', hint: 'Any other in-app alerts' },
];

const NotificationsTab = () => {
  const client = useGraphClient('client');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(true);
  const [muted, setMuted] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const r = await client.request(MyNotificationPreferencesDocument, {});
    const p = r.myNotificationPreferences;
    setInAppEnabled(p.inAppEnabled);
    setAnnouncementsEnabled(p.announcementsEnabled);
    setMuted(new Set(p.mutedTopics ?? []));
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const toggleTopic = (id: string) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await client.request(UpdateNotificationPreferencesDocument, {
        input: {
          inAppEnabled,
          announcementsEnabled,
          mutedTopics: [...muted],
        },
      });
      await load();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Notification Preferences">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Control what appears in your bell and on the Notifications page. This applies to in-app
        alerts only; email or SMS is not configured here.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-6">
          <label className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={inAppEnabled}
              onChange={(e) => setInAppEnabled(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
            />
            <span>
              <span className="font-medium">In-app private notifications</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                (leave, expense, travel, etc.)
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={announcementsEnabled}
              onChange={(e) => setAnnouncementsEnabled(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
            />
            <span>
              <span className="font-medium">Public announcements</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                (company and team posts on the bulletin)
              </span>
            </span>
          </label>

          <div className={`space-y-3 ${!inAppEnabled ? 'pointer-events-none opacity-40' : ''}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Mute categories (in-app)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Checked categories stay out of your list and unread count. Existing rows are not
              deleted.
            </p>
            <ul className="space-y-2">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={muted.has(t.id)}
                      onChange={() => toggleTopic(t.id)}
                      className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
                    />
                    <span>
                      <span className="font-medium">Mute {t.label}</span>
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                        {t.hint}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NotificationsTab;
