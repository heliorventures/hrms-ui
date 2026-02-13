import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import type { TimesheetEntry } from '../../../types';

interface TimesheetEntryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimesheetEntry | null;
  onSave: (id: string, updates: Partial<TimesheetEntry>) => void;
}

const projects = [
  { value: 'proj-1', label: 'Project Alpha' },
  { value: 'proj-2', label: 'Project Beta' },
  { value: 'proj-3', label: 'Project Gamma' },
];

const TimesheetEntryEditModal = ({
  isOpen,
  onClose,
  entry,
  onSave,
}: TimesheetEntryEditModalProps) => {
  const [formData, setFormData] = useState({
    date: '',
    projectId: 'proj-1',
    projectName: 'Project Alpha',
    taskDescription: '',
    hours: '',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date,
        projectId: entry.projectId,
        projectName: entry.projectName,
        taskDescription: entry.taskDescription,
        hours: String(entry.hours),
      });
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    const selectedProject = projects.find((p) => p.value === formData.projectId);
    onSave(entry.id, {
      date: formData.date,
      projectId: formData.projectId,
      projectName: selectedProject?.label ?? formData.projectName,
      taskDescription: formData.taskDescription,
      hours: parseFloat(formData.hours) || 0,
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'projectId') {
      const proj = projects.find((p) => p.value === value);
      setFormData((prev) => ({
        ...prev,
        projectId: value,
        projectName: proj?.label ?? prev.projectName,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!entry) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Timesheet Entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            fullWidth
          />
          <Select
            label="Project"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            options={projects}
            required
            fullWidth
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Description
          </label>
          <textarea
            name="taskDescription"
            value={formData.taskDescription}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>
        <Input
          label="Hours"
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          min="0"
          max="24"
          step="0.5"
          required
          fullWidth
        />
        <div className="flex gap-3">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TimesheetEntryEditModal;
