import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageActions from '../../components/common/PageActions';
import PageTabs, { PageTabPanel } from '../../components/common/PageTabs';
import { usePageTabs } from '../../hooks/usePageTabs';

import ExpenseCategoriesTable from './components/ExpenseCategoriesTable';
import ExpenseCategoryModal from './components/ExpenseCategoryModal';
import ExpensePoliciesPanel from './components/ExpensePoliciesPanel';
import ExpensePolicyModal from './components/ExpensePolicyModal';
import { useAdminExpenseCategories } from './hooks/useAdminExpenseCategories';

const AdminExpenseCategoriesPage = () => {
  const model = useAdminExpenseCategories();

  const tabs = [
    { id: 'categories', label: 'Expense Categories' },
    { id: 'policies', label: 'Expense Policies' },
  ];
  const { tab, setTab } = usePageTabs(tabs);

  return (
    <div className="space-y-4">
      <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      <PageActions>
        <div>
          <h1 className="sr-only">Expense Categories</h1>
        </div>
        {tab === 'categories' ? (
          <Button onClick={model.openNewCategory}>Add Category</Button>
        ) : null}
      </PageActions>

      {model.error ? (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{model.error}</p>
        </Card>
      ) : null}

      <PageTabPanel id="categories" activeTab={tab}>
        <Card title="Configured Categories">
          <ExpenseCategoriesTable
            rows={model.rows}
            loading={model.loading}
            onEdit={model.openEditCategory}
            onDelete={(row) => void model.deleteCategory(row)}
          />
        </Card>
      </PageTabPanel>

      <PageTabPanel id="policies" activeTab={tab}>
        <Card>
          <ExpensePoliciesPanel
            categories={model.rows}
            selectedCategoryId={model.policyCategoryId}
            rows={model.policyRows}
            loading={model.policyLoading}
            policyError={model.policyError}
            directoryLoading={model.policyPickerBusy}
            onCategoryChange={model.setPolicyCategoryId}
            onAddPolicy={model.openNewPolicy}
            onEditPolicy={model.openEditPolicy}
            onDeletePolicy={(policy) => void model.deletePolicy(policy)}
            summarizeScope={model.summarizePolicyScope}
          />
        </Card>
      </PageTabPanel>

      <ExpenseCategoryModal
        open={model.modalOpen}
        editId={model.editId}
        form={model.form}
        saving={model.saving}
        onClose={model.closeCategoryModal}
        onSubmit={(event) => void model.saveCategory(event)}
        onChange={model.setForm}
      />
      <ExpensePolicyModal
        open={model.policyModalOpen}
        form={model.policyForm}
        error={model.policyError}
        saving={model.policySaving}
        directoryLoading={model.policyPickerBusy}
        directoryError={model.policyPickerOrgError}
        departmentOptions={model.departmentOptions}
        designationOptions={model.designationOptions}
        roleOptions={model.roleOptions}
        hasDepartments={model.policyPickerDepartments.length > 0}
        hasDesignations={model.policyPickerDesignations.length > 0}
        hasRoles={model.policyPickerRoles.length > 0}
        onClose={model.closePolicyModal}
        onSubmit={(event) => void model.savePolicy(event)}
        onChange={model.setPolicyForm}
      />
    </div>
  );
};

export default AdminExpenseCategoriesPage;
