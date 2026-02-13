import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import { Payslip } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import MaskedAmount from '../../components/common/MaskedAmount';
import PayslipDetailModal from './components/PayslipDetailModal';
import { downloadPayslipPdf } from '../../utils/generatePayslipPdf';

const PayrollPage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { getPayslips, getEmployees } = useDataStore();
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const payslips = user
    ? getPayslips(user.id, currentTenant.id)
    : [];
  const employees = getEmployees(currentTenant.id);
  const employeeName = user
    ? employees.find((e) => e.id === user.id)?.name ?? user.name
    : '';

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
  };

  const handleDownloadPayslip = (payslip: Payslip) => {
    downloadPayslipPdf(payslip, employeeName);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Payroll & Payslips
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {payslips.map((payslip) => (
          <Card key={payslip.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatMonth(payslip.month)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generated on{' '}
                    {new Date(payslip.generatedOn).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <Badge variant="info">{payslip.taxRegime.toUpperCase()}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Gross Salary
                  </span>
                  <MaskedAmount amount={payslip.grossSalary} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Deductions
                  </span>
                  <MaskedAmount amount={payslip.totalDeductions} />
                </div>
                <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Net Salary
                    </span>
                    <MaskedAmount
                      amount={payslip.netSalary}
                      className="text-lg font-bold text-green-600 dark:text-green-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewPayslip(payslip)}
                  className="flex-1 rounded-lg border border-primary-600 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownloadPayslip(payslip)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {payslips.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400">
            No payslips available
          </p>
        </Card>
      )}

      <PayslipDetailModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        onDownload={selectedPayslip ? () => handleDownloadPayslip(selectedPayslip) : undefined}
        employeeName={employeeName}
      />
    </div>
  );
};

export default PayrollPage;
