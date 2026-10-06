import { parse, print, Kind, visit } from 'graphql';
import type { ASTNode, DefinitionNode } from 'graphql';

import locations from '../../api/documents/companyLocations.graphql?raw';
import calendar from '../../api/documents/weeklyOffPolicy.graphql?raw';

// Each request contains one operation plus its fragments; canonical sources remain codegen inputs.
const operation = (source: string, name: string) => {
  const parsed = parse(source);
  const selected = parsed.definitions.find(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION && definition.name?.value === name
  );
  if (!selected) throw new Error(`Missing GraphQL operation ${name}`);
  const definitions: DefinitionNode[] = [selected];
  const fragments = new Set<string>();
  const collect = (node: ASTNode) =>
    visit(node, {
      FragmentSpread(spread) {
        fragments.add(spread.name.value);
      },
    });
  collect(selected);
  for (const fragmentName of fragments) {
    const fragment = parsed.definitions.find(
      (definition) =>
        definition.kind === Kind.FRAGMENT_DEFINITION && definition.name.value === fragmentName
    );
    if (fragment?.kind === Kind.FRAGMENT_DEFINITION) {
      definitions.push(fragment);
      collect(fragment);
    }
  }
  return print({ kind: Kind.DOCUMENT, definitions });
};
export const CompanyLocationsDocument = operation(locations, 'CompanyLocations');
export const CompanyLocationOptionsDocument = operation(locations, 'CompanyLocationOptions');
export const SaveCompanyLocationDocument = operation(locations, 'SaveCompanyLocation');
export const RetireCompanyLocationDocument = operation(locations, 'RetireCompanyLocation');
export const EmployeeLocationAssignmentDocument = operation(
  locations,
  'EmployeeLocationAssignment'
);
export const AssignEmployeeLocationDocument = operation(locations, 'AssignEmployeeLocation');
export const WorkingCalendarPolicyDocument = operation(calendar, 'WorkingCalendarPolicy');
export const PreviewWeeklyOffMonthDocument = operation(calendar, 'PreviewWeeklyOffMonth');
export const ActivateWorkingCalendarDocument = operation(calendar, 'ActivateWorkingCalendar');
export const ScheduleWeeklyOffPolicyDocument = operation(calendar, 'ScheduleWeeklyOffPolicy');
