import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';

const HrHomePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR workbench</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          People administration and access control. Tenant-wide configuration (billing, module health,
          …) stays under <span className="font-mono text-xs">Admin</span> for platform admins.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="People admin">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Create and update employee records, assignments, and HR workflows.
          </p>
          <Link
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            to="/hr/people"
          >
            Open people admin →
          </Link>
        </Card>
        <Card title="Roles & access">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Assign roles to users, attach permissions to roles, and edit list scopes (team / all /
            self).
          </p>
          <Link
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            to="/hr/access"
          >
            Open access matrix →
          </Link>
        </Card>
        <Card title="Leave">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Self-service apply and balances on <span className="font-mono text-xs">/leave</span>; HR-focused
            approval queue with employee names.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
            <Link
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/leave"
            >
              Employee leave →
            </Link>
            <Link
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/hr/leaves"
            >
              Approval queue →
            </Link>
            <Link
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/hr/leave-settings"
            >
              Leave types, policies, balances & holidays →
            </Link>
          </div>
        </Card>
        <Card title="Workflows">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Configure approval graphs used by leave and expenses.
          </p>
          <Link
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            to="/workplace/workflows"
          >
            Open workflow designer →
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HrHomePage;
