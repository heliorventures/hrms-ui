import Input from '../../components/common/Input';

const ReportPeriodFields = ({
  fromDate,
  toDate,
  change,
}: {
  fromDate: string;
  toDate: string;
  change: (values: { fromDate?: string; toDate?: string }) => void;
}) => (
  <div className="flex flex-wrap gap-3">
    <Input
      type="date"
      label="From date"
      value={fromDate}
      required
      onChange={(event) => change({ fromDate: event.target.value })}
    />
    <Input
      type="date"
      label="To date"
      value={toDate}
      required
      onChange={(event) => change({ toDate: event.target.value })}
    />
  </div>
);
export default ReportPeriodFields;
