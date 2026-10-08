import { authorizationStateKey } from '../../auth/permissionService';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import LeaveTeamCalendar from '../hr/components/LeaveTeamCalendar';

const LeaveTeamCalendarPage = () => {
  const { clientSession } = useAuth();
  return (
    <div className="space-y-4">
      <PageHeader
        tourAnchor="leave.team-calendar-navigation"
        title="Leave — Calendar & holidays"
        description="View team leave and company holidays together. The calendar view shows approved leave by day; the list includes request statuses."
        selector={null}
      />
      <LeaveTeamCalendar key={authorizationStateKey(clientSession)} />
    </div>
  );
};
export default LeaveTeamCalendarPage;
