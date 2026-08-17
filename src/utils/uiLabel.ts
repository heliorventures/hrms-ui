const WORD_SEPARATOR = /[\s_-]+/;

/** Converts user-facing labels to the product's sentence/title-case convention. */
export function titleCaseLabel(value: string): string {
  return value
    .trim()
    .split(WORD_SEPARATOR)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase();
      return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`;
    })
    .join(' ');
}
