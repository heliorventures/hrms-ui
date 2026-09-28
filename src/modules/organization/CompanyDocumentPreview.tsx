import CompanyDocumentReader from './CompanyDocumentReader';

interface Props {
  documentId: string;
  title: string;
  onClose: () => void;
}

const CompanyDocumentPreview = (props: Props) => (
  <CompanyDocumentReader key={props.documentId} {...props} presentation="dialog" />
);

export default CompanyDocumentPreview;
