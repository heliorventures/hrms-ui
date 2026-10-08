import type { HelpTaskContent } from '../../../guidance/help/helpTypes';

export const leaveHelpTasks: Readonly<Record<string, HelpTaskContent>> = {
  'leave-apply-dialog': {
    prerequisites: [
      'Your account is linked to an employee profile with leave submission access.',
      'Check your balance and the policy for the selected leave type.',
    ],
    steps: [
      { id: 'open', text: 'Open Leave and choose Apply Leave.', screenshotId: 'leave-design' },
      {
        id: 'type',
        text: 'Choose the leave type. Review the displayed balance, notice period, consecutive-day and document requirements.',
      },
      {
        id: 'dates',
        text: 'Select the start and end dates. For an eligible single-day request, choose half day and its session. Wait for Chargeable days: this uses your dated location, weekly offs and holidays.',
      },
      {
        id: 'reason',
        text: 'Enter the reason and attach a supporting document when the selected leave type requires one.',
      },
      {
        id: 'submit',
        text: 'Review the dates, chargeable days and balance, then Submit. Keep the form open while it is saving.',
      },
    ],
    requiredFields: [
      'Leave type',
      'Start and end dates',
      'Reason',
      'Half-day session when applicable',
      'Document when required by the leave type',
    ],
    afterSave:
      'The saved request appears in your request history with its approval status. Its chargeable dates are preserved if calendar settings change later.',
    checkStatus:
      'Review the request list, date range, days and status. Notifications show subsequent decisions.',
    recovery: [
      'If the date preview fails, choose Retry before submitting.',
      'Correct the highlighted field or ask HR about missing policy or balance.',
      'Close uses the discard confirmation when the form contains input.',
    ],
  },
  'leave-comp-off-request': {
    prerequisites: ['Comp-off requests are enabled for your employee profile.'],
    steps: [
      { id: 'open', text: 'Open Leave and choose Request Comp-off.' },
      {
        id: 'details',
        text: 'Enter the worked date, requested units and reason. Supply the fields required by the displayed policy.',
      },
      { id: 'review', text: 'Review your request and submit it for the permitted HR decision.' },
    ],
    requiredFields: ['Worked date', 'Requested units', 'Reason'],
    afterSave:
      'The request waits for the earning decision; submitting does not immediately credit leave.',
    checkStatus: 'Check the comp-off request status and available credits in Leave.',
    recovery: ['Ask HR about the earning window or policy if the request is refused.'],
  },
};
