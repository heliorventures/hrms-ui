import { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import { Employee } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import AddEditEmployeeModal from './components/AddEditEmployeeModal';

const AdminEmployeesPage = () => {
  const { currentTenant } = useTenant();
  const { getEmployees, addEmployee, updateEmployee } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const employees = getEmployees(currentTenant.id);

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
        {employees.length > 0 ? (
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
        onSave={(emp) => {
          if ('id' in emp) {
            const { id, ...updates } = emp;
            updateEmployee(id, updates);
          } else {
            addEmployee(emp);
          }
        }}
      />
    </div>
  );
};

export default AdminEmployeesPage;
