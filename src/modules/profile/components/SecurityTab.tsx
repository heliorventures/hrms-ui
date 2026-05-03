import { FormEvent, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { AuthError, changeClientPassword } from '../../../auth/authClient';
import { getClientAccessToken } from '../../../auth/tokenStore';

interface SecurityTabProps {
  onPasswordChanged: () => void | Promise<void>;
}

const MIN_PASSWORD_LEN = 8;

const SecurityTab = ({ onPasswordChanged }: SecurityTabProps) => {
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
      setError(err instanceof AuthError ? err.message : 'Could not change password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        After a successful change, all active sessions are revoked and you will need to sign in
        again.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Input
          type="password"
          label="Current password"
          value={currentPassword}
          onChange={(ev) => setCurrentPassword(ev.target.value)}
          fullWidth
          required
          autoComplete="current-password"
        />
        <Input
          type="password"
          label="New password"
          value={newPassword}
          onChange={(ev) => setNewPassword(ev.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LEN}
        />
        <Input
          type="password"
          label="Confirm new password"
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
