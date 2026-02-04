import { useState } from 'react';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';

interface TimesheetEntryFormProps {
  onClose: () => void;
}

const TimesheetEntryForm = ({ onClose }: TimesheetEntryFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: 'proj-1',
    taskDescription: '',
    hours: '',
  });

  const projects = [
    { value: 'proj-1', label: 'Project Alpha' },
    { value: 'proj-2', label: 'Project Beta' },
    { value: 'proj-3', label: 'Project Gamma' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Timesheet entry submitted successfully!');
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card title="Add Timesheet Entry">
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
            Submit Entry
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TimesheetEntryForm;
