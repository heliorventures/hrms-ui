import { payslipCompanyAddressText } from '../payslipCompanyAddress';

const PayslipCompanyAddress = ({ address }: { address?: string | null }) => {
  const text = payslipCompanyAddressText(address);
  return text ? (
    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed [overflow-wrap:anywhere]">
      {text}
    </p>
  ) : null;
};

export default PayslipCompanyAddress;
