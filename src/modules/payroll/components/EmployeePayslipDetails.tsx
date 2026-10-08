import { Fragment } from 'react';

import Button from '../../../components/common/Button';
import type { PayslipRow } from '../payrollTypes';

import type { PayrollPayslipTabProps } from './PayrollPayslipTab';
import PayslipDocument from './PayslipDocument';

const EmployeePayslipDetails = (props: PayrollPayslipTabProps & { activePayslip: PayslipRow }) => {
  const details = [
    {
      id: 'branding',
      loading: props.payslipBrandingLoading,
      error: props.payslipBrandingError,
      retry: props.onRetryPayslipBranding,
      loadingLabel: 'Loading company payslip branding...',
      errorLabel: 'Company payslip branding could not be loaded.',
      retryLabel: 'Retry company branding',
    },
    {
      id: 'presentation',
      loading: props.presentationLoading,
      error: props.presentationError,
      retry: props.onRetryPresentation,
      loadingLabel: 'Loading payslip display details...',
      errorLabel: 'Payslip display details could not be loaded.',
      retryLabel: 'Retry',
    },
    {
      id: 'leave',
      loading: props.unpaidLeaveLoading,
      error: props.unpaidLeaveError,
      retry: props.onRetryUnpaidLeave,
      loadingLabel: 'Loading unpaid leave details…',
      errorLabel: 'Unpaid leave details could not be loaded.',
      retryLabel: 'Retry',
    },
  ];
  return (
    <>
      {details.map((detail) => (
        <Fragment key={detail.id}>
          {detail.error && (
            <div role="alert" className="no-print flex items-center gap-3 text-sm text-red-600">
              {detail.errorLabel} {detail.error}
              <Button size="sm" variant="outline" onClick={detail.retry}>
                {detail.retryLabel}
              </Button>
            </div>
          )}
          {detail.loading && (
            <p role="status" className="no-print text-sm text-slate-500">
              {detail.loadingLabel}
            </p>
          )}
        </Fragment>
      ))}
      <PayslipDocument
        tenantName={props.tenantName}
        companyHeaderName={props.payslipBranding?.payslipHeaderTitle}
        companyAddress={props.payslipBranding?.payslipCompanyAddress}
        payslipLogoReadUrl={props.payslipLogoReadUrl}
        employeeName={props.employeeName}
        employeeCode={props.employeeCode}
        periodLabel={
          props.payslipPeriodOptions.find((option) => option.payslip?.id === props.activePayslip.id)
            ?.label ?? 'Payslip'
        }
        labelForLine={props.labelForLine}
        slip={{
          ...props.activePayslip,
          unpaidLeave: props.unpaidLeave,
          presentation: props.presentation,
        }}
        detailsPending={details.some((detail) => detail.loading || Boolean(detail.error))}
      />
    </>
  );
};

export default EmployeePayslipDetails;
