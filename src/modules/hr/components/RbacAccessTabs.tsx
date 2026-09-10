import Button from '../../../components/common/Button';
import { TAB_LIST_CLASS, tabClassName } from '../../../components/common/tabStyles';
import { RBAC_TABS, type RbacAccessTab } from '../rbacTypes';

const TAB_LABELS: Record<RbacAccessTab, string> = {
  users: 'User roles',
  roles: 'Role permissions',
  scopes: 'Data scopes',
};

interface RbacAccessTabsProps {
  activeTab: RbacAccessTab;
  onReload: () => void;
  onTabChange: (tab: RbacAccessTab) => void;
}

const RbacAccessTabs = ({ activeTab, onReload, onTabChange }: RbacAccessTabsProps) => (
  <div className="space-y-3">
    <div className={TAB_LIST_CLASS}>
      {RBAC_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={activeTab === tab}
          className={tabClassName(activeTab === tab)}
          onClick={() => onTabChange(tab)}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
    <Button type="button" variant="outline" className="!py-1.5 !text-xs" onClick={onReload}>
      Reload catalog
    </Button>
  </div>
);

export default RbacAccessTabs;
