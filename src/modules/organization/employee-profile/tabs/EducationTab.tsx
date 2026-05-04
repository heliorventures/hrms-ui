import { useState, type ChangeEvent } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

import type { EducationEntry } from '../types';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Modal from '../../../../components/common/Modal';
import { EmptySection } from '../components/SectionStates';

interface EducationTabProps {
  initial: EducationEntry[];
  readOnly?: boolean;
}

export function EducationTab({ initial, readOnly }: EducationTabProps) {
  const [entries, setEntries] = useState<EducationEntry[]>(initial);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<EducationEntry | null>(null);
  const [form, setForm] = useState({ degree: '', institution: '', year: String(new Date().getFullYear()) });

  const openNew = () => {
    setEditing(null);
    setForm({ degree: '', institution: '', year: String(new Date().getFullYear()) });
    setModal(true);
  };

  const openEdit = (e: EducationEntry) => {
    setEditing(e);
    setForm({ degree: e.degree, institution: e.institution, year: String(e.year) });
    setModal(true);
  };

  const save = () => {
    const y = Number(form.year) || 0;
    if (editing) {
      setEntries((list) =>
        list.map((x) =>
          x.id === editing.id
            ? { ...x, degree: form.degree, institution: form.institution, year: y }
            : x
        )
      );
    } else {
      setEntries((list) => [
        ...list,
        {
          id: `edu-${Date.now()}`,
          degree: form.degree,
          institution: form.institution,
          year: y,
        },
      ]);
    }
    setModal(false);
  };

  const remove = (id: string) => setEntries((list) => list.filter((x) => x.id !== id));

  if (entries.length === 0 && readOnly) {
    return (
      <EmptySection
        title="No education on file"
        description="Add degrees and institutions when HR records are available."
      />
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="primary" className="gap-1" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden />
            Add education
          </Button>
        </div>
      ) : null}

      <ol className="relative space-y-2 border-l-2 border-indigo-100 pl-4 dark:border-indigo-900/50">
        {entries.map((e) => (
          <li
            key={e.id}
            className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50"
          >
            <span className="absolute -left-[25px] top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{e.degree}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{e.institution}</p>
                <p className="mt-1 text-xs text-slate-500">{e.year}</p>
              </div>
              {!readOnly ? (
                <div className="flex gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(e)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="!px-2 text-rose-600"
                    onClick={() => remove(e.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-label="Delete" />
                  </Button>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit education' : 'Add education'}
        size="md"
      >
        <div className="space-y-3">
          <Input
            label="Degree"
            value={form.degree}
            onChange={(ev: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, degree: ev.target.value }))}
            fullWidth
          />
          <Input
            label="Institution"
            value={form.institution}
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, institution: ev.target.value }))
            }
            fullWidth
          />
          <Input
            label="Year"
            type="number"
            value={form.year}
            onChange={(ev: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, year: ev.target.value }))}
            fullWidth
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
