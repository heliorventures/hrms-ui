import { useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Textarea from '../../../components/common/Textarea';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  SaveNotificationAutomationSettingsSafeDocument,
  type NotificationAutomationSettings,
} from '../../notifications/notificationAutomationQueries';

type TemplateField =
  | 'birthdayTitleTemplate'
  | 'birthdayMessageTemplate'
  | 'anniversaryTitleTemplate'
  | 'anniversaryMessageTemplate';
type NotificationAutomationValidationErrors = Partial<
  Record<TemplateField | 'deliveryLocalTime', string>
>;

const templateError = (value: string, allowedTokens: Set<string>, maxLength: number) => {
  const template = value.trim();
  if (!template || template.length > maxLength) {
    return `must contain 1 to ${maxLength} characters`;
  }
  let remaining = template;
  while (remaining.includes('{')) {
    const open = remaining.indexOf('{');
    if (remaining.slice(0, open).includes('}')) return 'contains an unmatched closing brace';
    const close = remaining.indexOf('}', open + 1);
    if (close < 0) return 'contains an unmatched opening brace';
    const token = remaining.slice(open + 1, close);
    if (!token || token.includes('{') || !allowedTokens.has(token)) {
      return `contains unsupported token {${token}}`;
    }
    remaining = remaining.slice(close + 1);
  }
  if (remaining.includes('}')) return 'contains an unmatched closing brace';
  return undefined;
};

const validateNotificationAutomationSettings = (
  settings: NotificationAutomationSettings
): NotificationAutomationValidationErrors => {
  const errors: NotificationAutomationValidationErrors = {};
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(settings.deliveryLocalTime)) {
    errors.deliveryLocalTime = 'must be a valid 24-hour time';
  }
  const birthdayTokens = new Set(['employee_name']);
  const anniversaryTokens = new Set(['employee_name', 'service_years']);
  const validations: [TemplateField, Set<string>, number][] = [
    ['birthdayTitleTemplate', birthdayTokens, 500],
    ['birthdayMessageTemplate', birthdayTokens, 4000],
    ['anniversaryTitleTemplate', anniversaryTokens, 500],
    ['anniversaryMessageTemplate', anniversaryTokens, 4000],
  ];
  for (const [field, allowedTokens, maxLength] of validations) {
    const error = templateError(settings[field], allowedTokens, maxLength);
    if (error) errors[field] = error;
  }
  return errors;
};

const normalizedInput = (settings: NotificationAutomationSettings) => ({
  ...settings,
  deliveryLocalTime:
    settings.deliveryLocalTime.length === 5
      ? `${settings.deliveryLocalTime}:00`
      : settings.deliveryLocalTime,
  birthdayTitleTemplate: settings.birthdayTitleTemplate.trim(),
  birthdayMessageTemplate: settings.birthdayMessageTemplate.trim(),
  anniversaryTitleTemplate: settings.anniversaryTitleTemplate.trim(),
  anniversaryMessageTemplate: settings.anniversaryMessageTemplate.trim(),
});

type UpdateSettingsField = <Key extends keyof NotificationAutomationSettings>(
  field: Key,
  value: NotificationAutomationSettings[Key]
) => void;

const AutomationSettingsFields = ({
  settings,
  errors,
  setField,
}: {
  settings: NotificationAutomationSettings;
  errors: NotificationAutomationValidationErrors;
  setField: UpdateSettingsField;
}) => (
  <>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={settings.birthdayEnabled}
          onChange={(event) => setField('birthdayEnabled', event.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Enable birthday notifications
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={settings.workAnniversaryEnabled}
          onChange={(event) => setField('workAnniversaryEnabled', event.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Enable work-anniversary notifications
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 md:col-span-2">
        <input
          type="checkbox"
          checked={settings.companySharingEnabled}
          onChange={(event) => setField('companySharingEnabled', event.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Allow company-wide sharing when the employee opts in
      </label>
      <Input
        label="Delivery time"
        type="time"
        step={1}
        value={settings.deliveryLocalTime.slice(0, 8)}
        onChange={(event) => setField('deliveryLocalTime', event.target.value)}
        error={errors.deliveryLocalTime}
        fullWidth
      />
      <div className="hidden md:block" aria-hidden="true" />
      <Input
        label="Birthday title template"
        value={settings.birthdayTitleTemplate}
        onChange={(event) => setField('birthdayTitleTemplate', event.target.value)}
        error={errors.birthdayTitleTemplate}
        fullWidth
      />
      <Input
        label="Anniversary title template"
        value={settings.anniversaryTitleTemplate}
        onChange={(event) => setField('anniversaryTitleTemplate', event.target.value)}
        error={errors.anniversaryTitleTemplate}
        fullWidth
      />
      <Textarea
        label="Birthday message template"
        rows={3}
        value={settings.birthdayMessageTemplate}
        onChange={(event) => setField('birthdayMessageTemplate', event.target.value)}
        error={errors.birthdayMessageTemplate}
        fullWidth
      />
      <Textarea
        label="Anniversary message template"
        rows={3}
        value={settings.anniversaryMessageTemplate}
        onChange={(event) => setField('anniversaryMessageTemplate', event.target.value)}
        error={errors.anniversaryMessageTemplate}
        fullWidth
      />
    </div>
    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
      Tokens: {'{employee_name}'} for both events and {'{service_years}'} for anniversaries.
    </p>
  </>
);

interface Props {
  initialSettings: NotificationAutomationSettings;
}

const NotificationAutomationSettingsCard = ({ initialSettings }: Props) => {
  const client = useGraphClient('client');
  const [settings, setSettings] = useState(initialSettings);
  const [errors, setErrors] = useState<NotificationAutomationValidationErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const setField = <Key extends keyof NotificationAutomationSettings>(
    field: Key,
    value: NotificationAutomationSettings[Key]
  ) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const save = async () => {
    const validation = validateNotificationAutomationSettings(settings);
    setErrors(validation);
    setSaved(false);
    setRequestError(null);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const response = await client.request<{
        saveNotificationAutomationSettings: NotificationAutomationSettings;
      }>(SaveNotificationAutomationSettingsSafeDocument, {
        input: normalizedInput(settings),
      });
      setSettings(response.saveNotificationAutomationSettings);
      setSaved(true);
    } catch (cause) {
      setRequestError(graphQlUserMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Automated Employee Events">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        The system sends birthday and work-anniversary alerts after the tenant-local delivery time.
        Company-wide delivery still requires each employee to opt in.
      </p>
      {requestError ? (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {requestError}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mb-4 text-sm text-green-700 dark:text-green-300">
          Automated employee events saved.
        </p>
      ) : null}

      <AutomationSettingsFields settings={settings} errors={errors} setField={setField} />
      <div className="mt-4">
        <Button type="button" variant="primary" busy={saving} onClick={() => void save()}>
          Save Automated Events
        </Button>
      </div>
    </Card>
  );
};

export default NotificationAutomationSettingsCard;
