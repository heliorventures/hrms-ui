import PageInformation from '../../components/common/PageInformation';
import type { FeatureDefinition } from '../featureTypes';
import { useAccessibleFeatures } from '../useAccessibleFeatures';

import { HELP_TASKS } from './helpRegistry';
import HelpTask from './HelpTask';

export const AuthorizedPageHelp = ({
  features,
  routePath,
}: {
  features: readonly FeatureDefinition[];
  routePath: string | null;
}) => {
  const permittedIds = new Set(
    features.filter((feature) => feature.routePath === routePath).map((feature) => feature.id)
  );
  const tasks = HELP_TASKS.filter((task) => permittedIds.has(task.featureId));
  if (!tasks.length) return null;
  return (
    <div className="space-y-3" data-testid="page-help-content">
      <p>
        Step-by-step instructions for the features available to your account. Search pages and tools
        to find a feature elsewhere.
      </p>
      {tasks.map((task) => (
        <HelpTask key={task.id} task={task} />
      ))}
    </div>
  );
};
const PageHelpContent = () => {
  const { features, context } = useAccessibleFeatures();
  if (!features.some((feature) => feature.routePath === context.routePath)) return null;
  return (
    <PageInformation title="How to use this page">
      <AuthorizedPageHelp features={features} routePath={context.routePath} />
    </PageInformation>
  );
};
export default PageHelpContent;
