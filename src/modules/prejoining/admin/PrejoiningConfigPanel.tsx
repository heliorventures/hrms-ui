import {
  PersonalFieldsPanel,
  DocumentsConfigPanel,
  NewInvitationPanel,
} from './PrejoiningConfigPanels';
import type { PrejoiningAdminModel } from './usePrejoiningAdminModel';

export const PrejoiningConfigPanel = ({ model }: { model: PrejoiningAdminModel }) => {
  return (
    <section
      id="prejoining-config-panel"
      role="tabpanel"
      aria-labelledby="prejoining-config-panel-tab"
      className="space-y-4"
    >
      <PersonalFieldsPanel model={model} />
      <DocumentsConfigPanel model={model} />
      {model.inviteOpen ? <NewInvitationPanel model={model} /> : null}
    </section>
  );
};
