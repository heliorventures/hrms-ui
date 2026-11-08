import { createPermissionService } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import type { PayslipLoans } from '../payslipLoans';

const PayslipLoanLinks = ({ snapshot }: { snapshot: PayslipLoans }) => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const path = ['/loans/admin', '/loans/my'].find((path) => permissions.canRoute(path));
  if (!path) return null;
  return (
    <nav aria-label="Payslip loan accounts" className="no-print my-3 flex flex-wrap gap-3 text-sm">
      {snapshot.lines.map((line, index) => (
        <a
          key={line.loanId}
          href={`${path}?loan=${encodeURIComponent(line.loanId)}`}
          className="underline underline-offset-2"
        >
          View loan {index + 1} account
        </a>
      ))}
    </nav>
  );
};
export default PayslipLoanLinks;
