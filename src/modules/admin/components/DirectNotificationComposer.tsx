import { FormEvent } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import type { AdminNotificationsConsoleQuery } from '../../../api/graphql/graphql';

type EmployeeOption = AdminNotificationsConsoleQuery['employees'][number];

interface DirectNotificationComposerProps {
  busy: boolean;
  employees: EmployeeOption[];
  kind: string;
  message: string;
  selectedUserIds: string[];
  title: string;
  url: string;
  onKindChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSelectedUserIdsChange: (value: string[]) => void;
  onSubmit: (event: FormEvent) => void;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
}

const DirectNotificationComposer = ({
  busy,
  employees,
  kind,
  message,
  selectedUserIds,
  title,
  url,
  onKindChange,
  onMessageChange,
  onSelectedUserIdsChange,
  onSubmit,
  onTitleChange,
  onUrlChange,
}: DirectNotificationComposerProps) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <div>
      <label className="mb-1 block text-sm font-medium">Recipients</label>
      <select
        multiple
        size={6}
        value={selectedUserIds}
        onChange={(event) => {
          const options = [...event.target.selectedOptions].map((option) => option.value);
          onSelectedUserIdsChange(options);
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.userId!}>
            {employee.fullName} {employee.linkedUserEmail ? `(${employee.linkedUserEmail})` : ''}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
    </div>
    <Input label="Kind" value={kind} onChange={(event) => onKindChange(event.target.value)} fullWidth />
    <Input label="Title" value={title} onChange={(event) => onTitleChange(event.target.value)} fullWidth />
    <Input label="Message" value={message} onChange={(event) => onMessageChange(event.target.value)} fullWidth />
    <div>
      <Input
        label="Action URL"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="/expenses?tab=claims"
        fullWidth
      />
      <p className="mt-1 text-xs text-gray-500">
        Optional internal application path. External and protocol-relative URLs are rejected.
      </p>
    </div>
    <Button type="submit" variant="primary" disabled={busy}>
      Send
    </Button>
  </form>
);

export default DirectNotificationComposer;
