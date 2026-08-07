import Button from '../../../components/common/Button';
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
  <div className="flex flex-wrap gap-2">
    {RBAC_TABS.map((tab) => (
      <Button
        key={tab}
        type="button"
        variant={activeTab === tab ? 'primary' : 'outline'}
        className="!py-1.5 !text-xs"
        onClick={() => onTabChange(tab)}
      >
        {TAB_LABELS[tab]}
      </Button>
    ))}
    <Button type="button" variant="outline" className="!py-1.5 !text-xs" onClick={onReload}>
      Reload catalog
    </Button>
  </div>
);

export default RbacAccessTabs;
