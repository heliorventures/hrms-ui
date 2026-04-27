import { FormEvent, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { CreateTimesheetEntryDocument } from '../../../api/graphql/graphql';

interface TimesheetEntryFormProps {
  onClose: () => void;
  initialDate?: string;
  onCreated: () => void;
}

const TimesheetEntryForm = ({ onClose, initialDate, onCreated }: TimesheetEntryFormProps) => {
  const client = useGraphClient('client');
  const today = new Date().toISOString().slice(0, 10);
  const [workDate, setWorkDate] = useState(
    initialDate ? new Date(initialDate).toISOString().slice(0, 10) : today
  );
  const [hoursWorked, setHoursWorked] = useState('8');
  const [projectCode, setProjectCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await client.request(CreateTimesheetEntryDocument, {
        input: {
          workDate,
          hoursWorked,
          projectCode: projectCode.trim() || null,
          description: description.trim() || null,
        },
      });
      onCreated();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Add timesheet entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <Input
          type="date"
          label="Work date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
          fullWidth
          required
        />
        <Input
          label="Hours"
          value={hoursWorked}
          onChange={(e) => setHoursWorked(e.target.value)}
          fullWidth
          required
          inputMode="decimal"
        />
        <Input
          label="Project code"
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
          fullWidth
          placeholder="Optional"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Optional"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Submit entry'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TimesheetEntryForm;
