import { useState } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { mockPayslips } from '../../mocks/payroll';
import { Payslip } from '../../types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PayslipDetailModal from './components/PayslipDetailModal';

const PayrollPage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const { data: payslips, loading } = useMockApi(
    () =>
      mockPayslips
        .filter(
          (p) => p.tenantId === currentTenant.id && p.userId === user?.id
        )
        .sort((a, b) => b.month.localeCompare(a.month)),
    { delay: 400 }
  );

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

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Payroll & Payslips
      </h1>

      {loading ? (
        <Card>
          <LoadingSpinner />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {payslips?.map((payslip) => (
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
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payslip.grossSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Deductions
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      - {formatCurrency(payslip.totalDeductions)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Net Salary
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(payslip.netSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewPayslip(payslip)}
                  className="w-full rounded-lg border border-primary-600 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20"
                >
                  View Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && (!payslips || payslips.length === 0) && (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400">
            No payslips available
          </p>
        </Card>
      )}

      <PayslipDetailModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />
    </div>
  );
};

export default PayrollPage;
