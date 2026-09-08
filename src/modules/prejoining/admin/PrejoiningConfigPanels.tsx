import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';

import { InvitationResult } from './PrejoiningAdminDialogs';
import type { PrejoiningDocumentRequirement } from './prejoiningAdminTypes';
import { PersonalFieldOption, DocumentRequirementOption } from './PrejoiningConfigOptions';
import type { PrejoiningAdminModel } from './usePrejoiningAdminModel';

export const PersonalFieldsPanel = ({ model }: { model: PrejoiningAdminModel }) => {
  const { config, setConfig, catalog } = model;

  return (
    <Card title="Candidate form">
      <fieldset disabled={model.busyAction !== null || model.configLoading}>
        <div className="grid gap-4 lg:grid-cols-[12rem_1fr]">
          <Input
            label="Invitation expiry (hours)"
            type="number"
            min={1}
            max={8760}
            value={config.expiryHours}
            onChange={(event) =>
              setConfig((current) => ({ ...current, expiryHours: Number(event.target.value) }))
            }
            description="Defaults to 48 hours. Expiry only blocks candidate access."
          />
          <fieldset>
            <legend className="text-sm font-semibold text-content-primary">Personal fields</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((field) => (
                <PersonalFieldOption key={field.key} model={model} field={field} />
              ))}
            </div>
          </fieldset>
        </div>
      </fieldset>
    </Card>
  );
};
export const DocumentsConfigPanel = ({ model }: { model: PrejoiningAdminModel }) => {
  const { config, setConfig, busyAction, setInviteOpen, setInvitation, saveConfig } = model;

  return (
    <Card title="Documents">
      <fieldset disabled={model.busyAction !== null || model.configLoading}>
        <p className="mb-3 text-sm text-content-secondary">
          Candidates can upload PDF, JPEG, or PNG files up to 10 MiB each.
        </p>
        <div className="space-y-2">
          {config.documents.map((requirement, index) => (
            <DocumentRequirementOption
              key={requirement.id}
              model={model}
              requirement={requirement}
              index={index}
            />
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={config.documents.length >= 20}
              onClick={() =>
                setConfig((current) => ({
                  ...current,
                  documents: [
                    ...current.documents,
                    {
                      id: crypto.randomUUID(),
                      documentTypeId: '',
                      label: '',
                      required: true,
                    } satisfies PrejoiningDocumentRequirement,
                  ],
                }))
              }
            >
              Add document
            </Button>
            <Button busy={busyAction === 'save-config'} onClick={saveConfig}>
              Save configuration
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setInviteOpen(true);
                setInvitation(null);
              }}
            >
              Create invitation
            </Button>
          </div>
        </div>
      </fieldset>
    </Card>
  );
};
export const NewInvitationPanel = ({ model }: { model: PrejoiningAdminModel }) => {
  const {
    busyAction,
    setError,
    setNotice,
    inviteEmail,
    setInviteEmail,
    invitation,
    createInvitation,
  } = model;

  return (
    <Card title="New invitation">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <Input
          label="Candidate email"
          type="email"
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.target.value)}
        />
        <Button
          variant="outline"
          busy={busyAction === 'invite'}
          onClick={() => createInvitation(false)}
        >
          Create link only
        </Button>
        <Button busy={busyAction === 'invite'} onClick={() => createInvitation(true)}>
          Send email and create link
        </Button>
      </div>
      {invitation ? (
        <InvitationResult
          invitation={invitation}
          onCopy={() =>
            void navigator.clipboard
              .writeText(invitation.privateUrl)
              .then(() => setNotice('Private invitation link copied.'))
              .catch(() => setError('The link could not be copied. Select and copy it manually.'))
          }
        />
      ) : null}
    </Card>
  );
};
