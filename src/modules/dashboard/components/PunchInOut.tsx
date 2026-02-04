import { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';

interface PunchInOutProps {
  isPunchedIn: boolean;
  onToggle: () => void;
}

const PunchInOut = ({ isPunchedIn, onToggle }: PunchInOutProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card title="Attendance">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatTime(currentTime)}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Badge variant={isPunchedIn ? 'success' : 'neutral'}>
            {isPunchedIn ? 'Punched In' : 'Not Punched In'}
          </Badge>
        </div>

        {isPunchedIn && (
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <div className="flex justify-between">
                <span>Location:</span>
                <span>Office Premises</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Punch In Time:</span>
                <span>09:15 AM</span>
              </div>
            </div>
          </div>
        )}

        <Button
          variant={isPunchedIn ? 'danger' : 'primary'}
          fullWidth
          onClick={onToggle}
        >
          {isPunchedIn ? 'Punch Out' : 'Punch In'}
        </Button>

        {!isPunchedIn && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            If outside office premises, selfie will be required
          </p>
        )}
      </div>
    </Card>
  );
};

export default PunchInOut;
