import { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';

import type { WorkplaceLearningQuery } from '../../api/graphql/graphql';
import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  skillFields,
  courseFields,
  SaveSkillDocument,
  SaveCourseDocument,
  learningInput,
} from './learningSetup';
import { SetupEditor } from './performanceSetupEditor';

const LearningCatalogDocument = gql`
  query LearningCatalog($offset: Int!) {
    skills(limit: 20, offset: $offset) {
      id
      name
      category
      level
    }
    courses(limit: 20, offset: $offset) {
      id
      title
      category
      deliveryMode
      durationMinutes
      isMandatory
    }
  }
`;

const LearningPage = () => {
  const { clientSession } = useAuth();
  const canManage = createPermissionService(clientSession).canScopedPermission('learning:manage', [
    'ALL',
  ]);
  const [editor, setEditor] = useState<{
    kind: 'skill' | 'course';
    id?: string;
    values: Record<string, string | boolean>;
  } | null>(null);
  const client = useGraphClient('client');
  const [data, setData] = useState<WorkplaceLearningQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request<WorkplaceLearningQuery>(LearningCatalogDocument, { offset });
  }, [client, offset]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setData(null);
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning</h1>
      {notice && (
        <p role="status" className="text-sm text-content-secondary">
          {notice}
        </p>
      )}
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Skills">
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            className="mb-3 text-sm font-medium text-primary-600"
            onClick={() =>
              setEditor({ kind: 'skill', values: { name: '', category: '', level: '' } })
            }
          >
            Create skill
          </Button>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.skills.length ? (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              >
                {s.name}
                {s.level ? ` (${s.level})` : ''}
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 text-primary-600"
                    aria-label={`Edit skill ${s.name}`}
                    onClick={() =>
                      setEditor({
                        kind: 'skill',
                        id: s.id,
                        values: { name: s.name, category: s.category ?? '', level: s.level ?? '' },
                      })
                    }
                  >
                    Edit
                  </Button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No Skills Catalog.</p>
        )}
      </Card>
      <Card title="Courses">
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            className="mb-3 text-sm font-medium text-primary-600"
            onClick={() =>
              setEditor({
                kind: 'course',
                values: {
                  title: '',
                  category: '',
                  deliveryMode: '',
                  durationMinutes: '',
                  isMandatory: false,
                },
              })
            }
          >
            Create course
          </Button>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : data?.courses.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.courses.map((c) => (
              <li key={c.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm text-primary-600"
                    onClick={() =>
                      setEditor({
                        kind: 'course',
                        id: c.id,
                        values: {
                          title: c.title,
                          category: c.category ?? '',
                          deliveryMode: c.deliveryMode ?? '',
                          durationMinutes: c.durationMinutes?.toString() ?? '',
                          isMandatory: c.isMandatory,
                        },
                      })
                    }
                  >
                    Edit course
                  </Button>
                )}
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
      <nav aria-label="Learning pagination" className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={loading || offset === 0}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          Previous
        </Button>
        <span className="text-sm text-content-secondary">Page {offset / 20 + 1}</span>
        <Button
          variant="outline"
          disabled={loading || !(data && (data.skills.length === 20 || data.courses.length === 20))}
          onClick={() => setOffset((value) => value + 20)}
        >
          Next
        </Button>
      </nav>
      {editor && canManage && (
        <SetupEditor
          title={`${editor.id ? 'Edit' : 'Create'} ${editor.kind}`}
          fields={editor.kind === 'skill' ? skillFields : courseFields}
          initial={editor.values}
          onClose={() => setEditor(null)}
          onSave={async (values) => {
            const input = learningInput(editor.kind, editor.id, values);
            await client.request(editor.kind === 'skill' ? SaveSkillDocument : SaveCourseDocument, {
              input,
            });
            setNotice('Saved. Use Previous and Next to browse the catalog.');
            try {
              setData(await load());
              setError(null);
            } catch (e) {
              setError('Saved, but the list could not refresh. ' + graphQlUserMessage(e));
            }
          }}
        />
      )}
    </div>
  );
};

export default LearningPage;
