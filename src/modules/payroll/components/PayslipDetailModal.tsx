import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import { Payslip } from '../../../types';

interface PayslipDetailModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

const PayslipDetailModal = ({ payslip, onClose }: PayslipDetailModalProps) => {
  if (!payslip) return null;

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const earnings = payslip.components.filter((c) => c.type === 'earning');
  const deductions = payslip.components.filter((c) => c.type === 'deduction');

  return (
    <Modal
      isOpen={!!payslip}
      onClose={onClose}
      title={`Payslip - ${formatMonth(payslip.month)}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated On
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(payslip.generatedOn).toLocaleDateString('en-IN')}
            </p>
          </div>
          <Badge variant="info">{payslip.taxRegime.toUpperCase()} Regime</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
              Earnings
            </h4>
            <div className="space-y-2">
              {earnings.map((component, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {component.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(component.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Gross Salary
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(payslip.grossSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
              Deductions
            </h4>
            <div className="space-y-2">
              {deductions.map((component, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {component.name}
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    - {formatCurrency(component.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Total Deductions
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    - {formatCurrency(payslip.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Net Salary
              </span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(payslip.netSalary)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h5 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
            Tax Regime Information
          </h5>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            This payslip is calculated using the{' '}
            <span className="font-semibold uppercase">{payslip.taxRegime}</span>{' '}
            tax regime. You can switch your tax regime preference from the settings.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipDetailModal;
