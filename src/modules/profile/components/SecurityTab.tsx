import { FormEvent, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { changeClientPassword } from '../../../auth/authClient';
import { getClientAccessToken } from '../../../auth/tokenStore';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

interface SecurityTabProps {
  forced?: boolean;
  onPasswordChanged: () => void | Promise<void>;
}

const MIN_PASSWORD_LEN = 8;

const SecurityTab = ({ forced = false, onPasswordChanged }: SecurityTabProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < MIN_PASSWORD_LEN) {
      setError(`New password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current password.');
      return;
    }
    const access = getClientAccessToken();
    if (!access) {
      setError('Your session has expired. Sign in again.');
      return;
    }
    setBusy(true);
    try {
      await changeClientPassword(access, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await onPasswordChanged();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {forced
          ? 'Your temporary password must be changed before you can continue. After a successful change, sign in again with the new password.'
          : 'After a successful change, all active sessions are revoked and you will need to sign in again.'}
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Input
          type="password"
          label="Current Password"
          value={currentPassword}
          onChange={(ev) => setCurrentPassword(ev.target.value)}
          fullWidth
          required
          autoComplete="current-password"
        />
        <Input
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(ev) => setNewPassword(ev.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LEN}
        />
        <Input
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(ev) => setConfirmPassword(ev.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LEN}
        />
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Updating…' : 'Change password'}
        </Button>
      </form>
    </div>
  );
};

export default SecurityTab;
