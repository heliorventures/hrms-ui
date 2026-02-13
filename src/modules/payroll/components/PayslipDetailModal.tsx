import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import MaskedAmount from '../../../components/common/MaskedAmount';
import { Payslip } from '../../../types';

interface PayslipDetailModalProps {
  payslip: Payslip | null;
  onClose: () => void;
  onDownload?: () => void;
  employeeName?: string;
}

const PayslipDetailModal = ({
  payslip,
  onClose,
  onDownload,
}: PayslipDetailModalProps) => {
  if (!payslip) return null;

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated On
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(payslip.generatedOn).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">{payslip.taxRegime.toUpperCase()} Regime</Badge>
            {onDownload && (
              <Button size="sm" variant="outline" onClick={onDownload}>
                Download PDF
              </Button>
            )}
          </div>
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
                  <MaskedAmount amount={component.amount} />
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Gross Salary
                  </span>
                  <MaskedAmount amount={payslip.grossSalary} />
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
                  <span className="flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400">-</span>
                    <MaskedAmount amount={component.amount} />
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Total Deductions
                  </span>
                  <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    -
                    <MaskedAmount amount={payslip.totalDeductions} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Net Salary
              </span>
              <MaskedAmount
                amount={payslip.netSalary}
                className="text-xl font-bold text-green-600 dark:text-green-400"
              />
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
