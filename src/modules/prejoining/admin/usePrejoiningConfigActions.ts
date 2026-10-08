import type { PrejoiningActionContext } from './prejoiningActionContext';
import {
  PrejoiningInviteAdminDocument,
  SavePrejoiningConfigAdminDocument,
} from './prejoiningAdminDocuments';
import { normalizeConfig } from './prejoiningAdminHelpers';
import type { PrejoiningInvitation } from './prejoiningAdminTypes';
import { validateConfig, validateInvitationEmail } from './prejoiningAdminValidation';

export function usePrejoiningConfigActions(context: PrejoiningActionContext) {
  const { client, ownerRef, ownerToken, runAction } = context;
  const { config, setConfig, setNotice, inviteEmail, setInvitation } = context.state;
  const saveConfig = () =>
    void runAction('save-config', async () => {
      const validation = validateConfig(config);
      if (validation) throw new Error(validation);
      const result = await client.request<{ savePrejoiningConfig: unknown }>(
        SavePrejoiningConfigAdminDocument,
        { config }
      );
      if (ownerRef.current !== ownerToken) return;
      setConfig(normalizeConfig(result.savePrejoiningConfig));
      setNotice('Pre-joining configuration saved. New invitations will use this setup.');
    });

  const createInvitation = (sendEmail: boolean) =>
    void runAction('invite', async () => {
      const validation = validateInvitationEmail(inviteEmail);
      if (validation) throw new Error(validation);
      const result = await client.request<{ invitePrejoining: PrejoiningInvitation }>(
        PrejoiningInviteAdminDocument,
        { email: inviteEmail.trim(), sendEmail }
      );
      if (ownerRef.current !== ownerToken) return;
      setInvitation(result.invitePrejoining);
      setNotice(
        result.invitePrejoining.emailStatus === 'SENT'
          ? 'Invitation email sent.'
          : 'Private invitation link created.'
      );
    });

  return { saveConfig, createInvitation };
}
