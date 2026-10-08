import Input from '../../../components/common/Input';
import type { TravelSubmissionForm } from '../hooks/useTravelSubmission';

const TravelRouteFields = ({ form }: { form: TravelSubmissionForm }) => {
  const { formData, handleChange, minTravelDate, submitting } = form;
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="From Location"
          type="text"
          name="fromLocation"
          value={formData.fromLocation}
          onChange={handleChange}
          disabled={submitting}
          required
          fullWidth
        />

        <Input
          label="To Location"
          type="text"
          name="toLocation"
          value={formData.toLocation}
          onChange={handleChange}
          disabled={submitting}
          required
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="From Date"
          type="date"
          name="fromDate"
          value={formData.fromDate}
          onChange={handleChange}
          min={minTravelDate}
          disabled={submitting}
          required
          fullWidth
        />

        <Input
          label="To Date"
          type="date"
          name="toDate"
          value={formData.toDate}
          onChange={handleChange}
          min={formData.fromDate || minTravelDate}
          disabled={submitting}
          required
          fullWidth
        />
      </div>
    </>
  );
};
export default TravelRouteFields;
