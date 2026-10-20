interface Props {
  name: string;
  tenantId?: string;
}

const SourceCompanyLabel = ({ name, tenantId }: Props) => (
  <span
    className="inline-flex rounded bg-surface-selected px-2 py-1 text-xs font-medium text-content-secondary"
    title={tenantId}
  >
    Source company: {name}
  </span>
);

export default SourceCompanyLabel;
