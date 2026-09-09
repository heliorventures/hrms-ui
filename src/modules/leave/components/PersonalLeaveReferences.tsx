import PageInformation from '../../../components/common/PageInformation';
import type { PersonalLeaveModel } from '../hooks/usePersonalLeaveModel';

import HolidaySummaryCard from './HolidaySummaryCard';
import LeaveTypesCard from './LeaveTypesCard';

const PersonalLeaveReferences = ({ model }: { model: PersonalLeaveModel }) => {
  const { canManageLeave, data, loading, allHolidays } = model;
  return (
    <>
      <PageInformation title="Holidays">
        <HolidaySummaryCard
          canManageLeave={canManageLeave}
          holidays={data?.upcomingHolidays ?? []}
          loading={loading}
          onViewAll={() => void allHolidays.open()}
        />
      </PageInformation>
      <PageInformation title="Leave types">
        <LeaveTypesCard leaveTypes={data?.leaveTypes ?? []} loading={loading} />
      </PageInformation>
    </>
  );
};
export default PersonalLeaveReferences;
