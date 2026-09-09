import { Link } from 'react-router-dom';

import Card from '../../components/common/Card';
import { groupNavigationDestinations } from '../../navigation/navigationSelectors';
import { useAccessibleNavigation } from '../../navigation/useAccessibleNavigation';

const HrHomePage = () => {
  const accessible = useAccessibleNavigation();
  const groups = groupNavigationDestinations(accessible).filter(({ section }) =>
    ['people', 'leave', 'attendance', 'timesheets'].includes(section.key)
  );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Links</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(({ section, destinations }) => (
          <Card key={section.key} title={section.label}>
            <div className="flex flex-wrap gap-3">
              {destinations.map((destination) => (
                <Link
                  key={destination.path}
                  to={destination.path}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  {destination.label}
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default HrHomePage;
