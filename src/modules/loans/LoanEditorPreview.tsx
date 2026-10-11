import type { LoanEditorDefinition } from './loanForm';
import LoanProjectionSummary from './LoanProjectionSummary';

const LoanEditorPreview = ({
  definition,
  projection,
}: {
  definition: LoanEditorDefinition;
  projection: unknown;
}) => (
  <div className="space-y-3">
    {definition.renderPreview ? (
      definition.renderPreview(projection)
    ) : (
      <LoanProjectionSummary projection={projection} />
    )}
  </div>
);
export default LoanEditorPreview;
