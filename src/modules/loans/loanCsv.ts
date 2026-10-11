/** Quote every field and prevent formulas, including whitespace-prefixed external references. */
export function loanCsvCell(value: string) {
  const first = Array.from(value).find(
    (character) => character.charCodeAt(0) > 31 && character.trim() !== ''
  );
  const safe = first && '=+@-'.includes(first) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
