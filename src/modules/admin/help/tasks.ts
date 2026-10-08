import type { HelpTaskContent } from '../../../guidance/help/helpTypes';

export const adminHelpTasks: Readonly<Record<string, HelpTaskContent>> = {
  'company-locations-add': {
    prerequisites: ['Company-wide employee management or write access.'],
    steps: [
      { id: 'open', text: 'Open Company Locations under People and choose Add Location.' },
      {
        id: 'name',
        text: 'Enter a unique active location name and the relevant address details. Spacing and case are normalized for duplicate checking.',
      },
      { id: 'save', text: 'Save and check the location in the active list. Edit retains its ID.' },
      {
        id: 'assign',
        text: 'Open an employee profile, select Employment (HR), choose the company location and Assign Location Today.',
      },
    ],
    requiredFields: ['Location name'],
    afterSave:
      'The location is available in assignment, holiday and weekly-off pickers. Employee assignment is dated from the company business date.',
    checkStatus:
      'Check the active location list and the employee current location and effective date.',
    recovery: [
      'Reload if another administrator changed the record.',
      'Retirement requires no assigned employees, active or scheduled policy overrides, or holiday calendars. Remove those dependencies first.',
    ],
  },
  'attendance-policy-weekly-offs': {
    prerequisites: [
      'Company-wide attendance policy access.',
      'Create company locations and assign employees before using location-specific schedules.',
    ],
    steps: [
      { id: 'open', text: 'Open Attendance Policy and scroll to Location Working Calendars.' },
      {
        id: 'activate',
        text: 'For the first setup, review the company business date and Activate Working Calendar. Activation starts today with Saturday and Sunday off; it preserves earlier records.',
      },
      {
        id: 'scope',
        text: 'Choose Company default or a named active location. For a location, choose inheritance or enter its override.',
      },
      {
        id: 'rules',
        text: 'Select fixed off weekdays. For second and fourth Saturdays, clear every Saturday and select Second and Fourth. Sunday can remain a fixed off day.',
      },
      {
        id: 'preview',
        text: 'Choose a preview month and Preview Off Dates. Fifth Saturday applies only to months containing five Saturdays.',
      },
      {
        id: 'save',
        text: 'Choose an effective date of today or later and Save Weekly-Off Policy. Review current and scheduled versions.',
      },
    ],
    requiredFields: ['Policy scope', 'Effective date', 'Explicit activation for the first setup'],
    afterSave:
      'Employee calendars use the location assignment and policy effective on each date. Company holidays and location holidays apply; an explicit working roster takes precedence. Saved leave date units remain frozen.',
    checkStatus:
      'Review the current version, scheduled versions and monthly preview. Check an employee leave preview or attendance report after activation.',
    recovery: [
      'Reload after a concurrent configuration change, then review and resave.',
      'Selecting inheritance returns the location to the dated company default.',
      'An empty off-day selection means no recurring weekly off.',
    ],
  },
  'leave-settings-types': {
    prerequisites: ['Company-wide leave management access.'],
    steps: [
      {
        id: 'open',
        text: 'Open Leave Settings and select Leave types.',
        screenshotId: 'leave-settings-design',
      },
      { id: 'add', text: 'Choose Add Leave Type or Edit an existing type.' },
      {
        id: 'fields',
        text: 'Enter name and code; set paid status, carry-forward limit, sandwich, half-day and required-document flags.',
      },
      {
        id: 'save',
        text: 'Review the flags and Save. Configure a matching policy and employee balances next.',
      },
    ],
    requiredFields: ['Name', 'Code'],
    afterSave: 'The saved active type becomes available in the leave catalog.',
    checkStatus: 'Review its row and verify policy and balance configuration.',
    recovery: [
      'Resolve duplicate codes or invalid carry-forward limits.',
      'Delete soft-deletes a type; review the confirmation before proceeding.',
    ],
  },
  'leave-settings-policies': {
    prerequisites: ['An active leave type and company-wide leave management access.'],
    steps: [
      { id: 'open', text: 'Open Leave Settings and select Policies.' },
      { id: 'add', text: 'Choose Add Policy or Edit.' },
      { id: 'match', text: 'Choose the leave type and applicable employee group.' },
      {
        id: 'limits',
        text: 'Enter annual entitlement, accrual frequency and amount, maximum consecutive days and minimum notice.',
      },
      {
        id: 'save',
        text: 'Review applicability and Save. Provision employee balances for the required year when ready.',
      },
    ],
    requiredFields: ['Leave type', 'Applicable group', 'Entitlement and accrual values'],
    afterSave: 'The policy is saved for the selected type and employee applicability.',
    checkStatus: 'Review the policy list and an employee balance or leave request preview.',
    recovery: [
      'Correct invalid numeric limits.',
      'If an employee cannot request leave, check both policy applicability and the balance year.',
    ],
  },
  'leave-settings-balances': {
    prerequisites: ['Configured leave policies and company-wide leave management access.'],
    steps: [
      { id: 'open', text: 'Select Balances in Leave Settings.' },
      { id: 'choose', text: 'Choose the employee, leave type and balance year.' },
      {
        id: 'change',
        text: 'Enter the balance values or an entitlement adjustment. To provision a whole year from policies, choose the year and review the confirmation.',
      },
      {
        id: 'save',
        text: 'Save the selected operation and inspect the result before repeating it.',
      },
    ],
    requiredFields: ['Employee', 'Leave type', 'Year', 'Balance or adjustment values'],
    afterSave: 'The authorized balance operation updates employee balance records.',
    checkStatus: 'Review the resulting employee/type/year balance and the provisioning count.',
    recovery: [
      'Check the policy and year if no rows were provisioned.',
      'Reload before repeating a failed or interrupted operation.',
    ],
  },
  'leave-settings-holidays': {
    prerequisites: [
      'Company-wide leave management access.',
      'Create a location first if the calendar is location-specific.',
    ],
    steps: [
      { id: 'open', text: 'Select Holidays in Leave Settings.', screenshotId: 'holidays-design' },
      {
        id: 'calendar',
        text: 'Create or edit a calendar with its name, year and a named company location. Company default means all locations.',
      },
      {
        id: 'dates',
        text: 'Select the calendar, then add a holiday name, date and type. Review optional or public holiday choices.',
      },
      { id: 'save', text: 'Save and review the holiday list for the calendar.' },
    ],
    requiredFields: ['Calendar name', 'Year', 'Holiday name and date', 'Holiday type'],
    afterSave:
      'After working-calendar activation, global holidays and holidays for each employee dated location are applied.',
    checkStatus: 'Check the selected calendar and the employee Company holidays view.',
    recovery: [
      'Choose an active location from the named picker.',
      'Review deletion confirmations; holiday edits affect future previews, while saved leave requests preserve their units.',
    ],
  },
  'expense-policy-matching': {
    prerequisites: ['Company-wide expense management access and an active expense category.'],
    steps: [
      {
        id: 'open',
        text: 'Open Expense Categories & Policies and choose Policies.',
        screenshotId: 'expense-settings-design',
      },
      { id: 'add', text: 'Choose Add Policy or Edit.' },
      {
        id: 'fields',
        text: 'Choose the category row policy action. Set Applicable to All employees, Department, Designation or Role and select the matching group. Enter optional limits per day, month and claim, then choose whether approval is required.',
      },
      {
        id: 'save',
        text: 'Save and review the policy list. Receipt evidence remains required for every new claim.',
      },
    ],
    requiredFields: [
      'Category',
      'Applicability',
      'Group selection when a specific scope is chosen',
    ],
    afterSave: 'Submission hints use the matching expense policy.',
    checkStatus: 'Review the policy list and submission hints for the selected category.',
    recovery: [
      'Correct invalid decimal limits or a missing group selection.',
      'Check policy applicability when a claim has unexpected limits.',
    ],
  },
};
