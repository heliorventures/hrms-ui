import { useState } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useTenant } from '../../contexts/TenantContext';
import { mockEmployees } from '../../mocks/employees';
import { Employee } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddEditEmployeeModal from './components/AddEditEmployeeModal';

const AdminEmployeesPage = () => {
  const { currentTenant } = useTenant();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: employees, loading } = useMockApi(
    () =>
      mockEmployees
        .filter((e) => e.tenantId === currentTenant.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    { delay: 400 }
  );

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'department',
      label: 'Department',
    },
    {
      key: 'designation',
      label: 'Designation',
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      render: (employee: Employee) =>
        new Date(employee.joiningDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (employee: Employee) => (
        <Badge variant={employee.status === 'active' ? 'success' : 'neutral'}>
          {employee.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (employee: Employee) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEditEmployee(employee)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Employee Management
        </h1>
        <Button onClick={handleAddEmployee}>Add Employee</Button>
      </div>

      <Card title="Employee List">
        {loading ? (
          <LoadingSpinner />
        ) : employees && employees.length > 0 ? (
          <Table
            data={employees}
            columns={columns}
            keyExtractor={(employee) => employee.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No employees found
          </p>
        )}
      </Card>

      <AddEditEmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default AdminEmployeesPage;
