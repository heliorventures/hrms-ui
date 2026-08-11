import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { WorkplaceLearningDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

const LearningPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<{
    skills: { id: string; name: string; category?: string | null; level?: string | null }[];
    courses: {
      id: string;
      title: string;
      category?: string | null;
      deliveryMode?: string | null;
      durationMinutes?: number | null;
      isMandatory: boolean;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceLearningDocument, { slim: 80, clim: 80 });
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) setData(r as typeof data);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Skills">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              >
                {s.name}
                {s.level ? ` (${s.level})` : ''}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No Skills Catalog.</p>
        )}
      </Card>
      <Card title="Courses">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.courses?.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.courses.map((c) => (
              <li key={c.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                <p className="text-xs text-gray-500">
                  {c.deliveryMode ?? '—'}
                  {c.durationMinutes != null ? ` · ${c.durationMinutes} min` : ''}
                  {c.isMandatory ? ' · mandatory' : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Active Courses.</p>
        )}
      </Card>
    </div>
  );
};

export default LearningPage;
