// Select only actual Employee-owned coordination fields for the finance UI contract.
import { buildSchema, Kind, parse, print, visit } from 'graphql';

export function withEmployeeFinanceContract(payrollText, employeeText) {
  const payroll = buildSchema(payrollText);
  const employee = buildSchema(employeeText);
  const ast = parse(employeeText);
  const existing = new Set(parse(payrollText).definitions.map((definition) => definition.name?.value));
  const selected = ['approveSeparation', 'cancelExitApproval'].map((name) => {
    if (payroll.getMutationType().getFields()[name]) throw new Error(`${name} must be owned solely by Employee`);
    const field = employee.getMutationType().getFields()[name];
    if (!field?.astNode) throw new Error(`Employee contract is missing ${name}`);
    return field.astNode;
  });
  const recovery = employee.getQueryType().getFields().exitApprovalOperation;
  if (!recovery?.astNode || payroll.getQueryType().getFields().exitApprovalOperation)
    throw new Error('Exit approval recovery must be owned solely by Employee');
  const definitions = [
    { kind: Kind.OBJECT_TYPE_EXTENSION, name: { kind: Kind.NAME, value: payroll.getMutationType().name }, fields: selected },
    { kind: Kind.OBJECT_TYPE_EXTENSION, name: { kind: Kind.NAME, value: payroll.getQueryType().name }, fields: [recovery.astNode] },
  ];
  const pending = [];
  visit({ kind: Kind.DOCUMENT, definitions }, { NamedType(node) { pending.push(node.name.value); } });
  while (pending.length) {
    const name = pending.pop();
    if (existing.has(name)) continue;
    existing.add(name);
    const definition = ast.definitions.find((value) => value.name?.value === name);
    if (!definition) continue;
    definitions.push(definition);
    visit(definition, { NamedType(node) { pending.push(node.name.value); } });
  }
  const result = payrollText + '\n' + print({ kind: Kind.DOCUMENT, definitions });
  buildSchema(result);
  return result;
}
