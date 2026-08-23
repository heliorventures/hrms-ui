import { useState, useEffect } from 'react';
import { useTenant } from '../../../contexts/TenantContext';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { Employee } from '../../../types';

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave?: (employee: Employee | Omit<Employee, 'id'>) => void;
}

const AddEditEmployeeModal = ({ isOpen, onClose, employee, onSave }: AddEditEmployeeModalProps) => {
  const { currentTenant } = useTenant();
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: '',
    dateOfBirth: '',
    address: '',
    qualification: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        dateOfBirth: employee.dateOfBirth,
        address: employee.address,
        qualification: employee.qualification,
        status: employee.status,
      });
    } else {
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        joiningDate: '',
        dateOfBirth: '',
        address: '',
        qualification: '',
        status: 'active',
      });
    }
  }, [employee]);

  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Finance', label: 'Finance' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp: Omit<Employee, 'id'> = {
      tenantId: currentTenant.id,
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      designation: formData.designation,
      joiningDate: formData.joiningDate,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      qualification: formData.qualification,
      status: formData.status,
    };
    if (employee) {
      onSave?.({ ...emp, id: employee.id } as Employee);
    } else {
      onSave?.(emp);
    }
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add Employee'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            fullWidth
            disabled={!!employee}
          />

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            fullWidth
          />

          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={departmentOptions}
            required
            fullWidth
          />

          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Joining Date"
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Date Of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            required
            fullWidth
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            required
            fullWidth
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary">
            {employee ? 'Update Employee' : 'Add Employee'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditEmployeeModal;
