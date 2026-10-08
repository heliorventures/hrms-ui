/** Preserve duplicate comments/events without making their keys depend on list position. */
export const surveyDisplayKeys = <T>(items: T[], identify: (item: T) => string) => {
  const occurrences = new Map<string, number>();
  return items.map((item) => {
    const identity = identify(item);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return { item, key: JSON.stringify([identity, occurrence]) };
  });
};
